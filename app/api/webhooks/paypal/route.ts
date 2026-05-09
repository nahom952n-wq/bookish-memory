import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initPayPalClient } from '@/lib/paypal/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify webhook signature
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    const certUrl = req.headers.get('paypal-cert-url');
    const authAlgo = req.headers.get('paypal-auth-algo');
    const transmissionSig = req.headers.get('paypal-transmission-sig');

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      console.error('[PayPal Webhook] Missing webhook headers');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Initialize PayPal client for verification
    const paypal = initPayPalClient();
    const bodyString = JSON.stringify(body);

    const isValid = paypal.verifyWebhookSignature(
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      bodyString
    );

    if (!isValid) {
      console.error('[PayPal Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = createClient();
    const eventType = body.event_type;

    console.log(`[PayPal Webhook] Processing event: ${eventType}`);

    // Handle different webhook events
    switch (eventType) {
      case 'CHECKOUT.ORDER.COMPLETED':
        await handleOrderCompleted(body, supabase);
        break;

      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(body, supabase);
        break;

      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(body, supabase);
        break;

      case 'BILLING.SUBSCRIPTION.UPDATED':
        await handleSubscriptionUpdated(body, supabase);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(body, supabase);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(body, supabase);
        break;

      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[PayPal Webhook] Error:', error);
    // Always return 200 to prevent PayPal from retrying
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

async function handleOrderCompleted(body: any, supabase: any) {
  try {
    const orderId = body.resource.id;
    const payerEmail = body.resource.payer?.email_address;
    const amount = body.resource.purchase_units[0]?.amount?.value;

    console.log(`[PayPal Webhook] Order completed: ${orderId}`);

    // Update transaction status
    const { data: transaction } = await supabase
      .from('paypal_transactions')
      .select('user_id, subscription_plan')
      .eq('paypal_order_id', orderId)
      .single();

    if (transaction) {
      // Mark as completed
      await supabase
        .from('paypal_transactions')
        .update({
          paypal_transaction_id: orderId,
          status: 'completed',
        })
        .eq('paypal_order_id', orderId);

      // Create or update subscription
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', transaction.user_id)
        .eq('status', 'active')
        .single();

      if (existingSub) {
        await supabase
          .from('user_subscriptions')
          .update({
            plan: transaction.subscription_plan,
            renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', existingSub.id);
      } else {
        await supabase.from('user_subscriptions').insert([
          {
            user_id: transaction.user_id,
            plan: transaction.subscription_plan,
            status: 'active',
            renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            payment_method: 'paypal',
          },
        ]);
      }
    }
  } catch (error) {
    console.error('[PayPal Webhook] Error handling order completed:', error);
  }
}

async function handleOrderApproved(body: any, supabase: any) {
  try {
    const orderId = body.resource.id;
    console.log(`[PayPal Webhook] Order approved: ${orderId}`);
    
    // Update transaction to approved status
    await supabase
      .from('paypal_transactions')
      .update({
        status: 'completed',
      })
      .eq('paypal_order_id', orderId);
  } catch (error) {
    console.error('[PayPal Webhook] Error handling order approved:', error);
  }
}

async function handleSubscriptionCreated(body: any, supabase: any) {
  try {
    const subscriptionId = body.resource.id;
    const status = body.resource.status;

    console.log(`[PayPal Webhook] Subscription created: ${subscriptionId}`);

    // Find user from transaction
    const { data: transaction } = await supabase
      .from('paypal_transactions')
      .select('user_id')
      .eq('paypal_transaction_id', subscriptionId)
      .single();

    if (transaction) {
      // Create subscription record
      await supabase.from('paypal_subscriptions').insert([
        {
          user_id: transaction.user_id,
          paypal_subscription_id: subscriptionId,
          status: status,
          created_at: new Date().toISOString(),
        },
      ]).catch(() => {
        // Table might not exist yet
      });
    }
  } catch (error) {
    console.error('[PayPal Webhook] Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(body: any, supabase: any) {
  try {
    const subscriptionId = body.resource.id;
    const status = body.resource.status;

    console.log(`[PayPal Webhook] Subscription updated: ${subscriptionId}, status: ${status}`);

    // Update subscription status
    await supabase
      .from('paypal_subscriptions')
      .update({ status })
      .eq('paypal_subscription_id', subscriptionId)
      .catch(() => {
        // Table might not exist yet
      });
  } catch (error) {
    console.error('[PayPal Webhook] Error handling subscription updated:', error);
  }
}

async function handleSubscriptionCancelled(body: any, supabase: any) {
  try {
    const subscriptionId = body.resource.id;

    console.log(`[PayPal Webhook] Subscription cancelled: ${subscriptionId}`);

    // Find and cancel user subscription
    const { data: subscription } = await supabase
      .from('paypal_subscriptions')
      .select('user_id')
      .eq('paypal_subscription_id', subscriptionId)
      .single()
      .catch(() => null);

    if (subscription) {
      // Mark subscription as cancelled
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', subscription.user_id);
    }
  } catch (error) {
    console.error('[PayPal Webhook] Error handling subscription cancelled:', error);
  }
}

async function handlePaymentRefunded(body: any, supabase: any) {
  try {
    const captureId = body.resource.supplementary_data?.related_ids?.capture_id;
    const refundAmount = body.resource.amount?.value;

    console.log(`[PayPal Webhook] Payment refunded: ${captureId}, amount: ${refundAmount}`);

    // Find transaction
    const { data: transaction } = await supabase
      .from('paypal_transactions')
      .select('user_id')
      .eq('paypal_transaction_id', captureId)
      .single()
      .catch(() => null);

    if (transaction) {
      // Update transaction as refunded
      await supabase
        .from('paypal_transactions')
        .update({ status: 'refunded' })
        .eq('paypal_transaction_id', captureId);

      // Optionally create credit transaction for refund
      await supabase.from('credit_transactions').insert([
        {
          user_id: transaction.user_id,
          amount: parseFloat(refundAmount || '0'),
          type: 'refund',
          description: 'Payment refunded',
          status: 'completed',
        },
      ]);
    }
  } catch (error) {
    console.error('[PayPal Webhook] Error handling payment refunded:', error);
  }
}
