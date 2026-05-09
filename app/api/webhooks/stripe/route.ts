'use server';

import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature') || '';

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('[v0] Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        // Get user by Stripe customer ID
        const { data: userData, error: userError } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userError || !userData) {
          console.error('[v0] User not found for customer:', customerId);
          break;
        }

        const userId = userData.user_id;
        const planId = subscription.items.data[0]?.price.id;
        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

        if (!plan) {
          console.error('[v0] Plan not found:', planId);
          break;
        }

        // Update subscription
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            plan_id: planId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('user_id', userId);

        // Update user features based on plan
        const features = {
          plan_id: planId,
          document_ocr_limit: plan.features.documentOcrLimit,
          advanced_charts: plan.features.advancedCharts,
          data_export: plan.features.dataExport,
          recurring_transactions: plan.features.recurringTransactions,
          budget_goals: plan.features.budgetGoals,
          savings_goals: plan.features.savingsGoals,
          bill_reminders: plan.features.billReminders,
          ai_insights: plan.features.aiInsights,
          multi_currency: plan.features.multiCurrency,
        };

        await supabase
          .from('user_features')
          .upsert({ user_id: userId, ...features })
          .eq('user_id', userId);

        console.log(`[v0] Subscription updated for user: ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;

        // Find user by Stripe subscription ID
        const { data: userData, error: userError } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (userError || !userData) {
          console.error('[v0] User not found for subscription:', subscription.id);
          break;
        }

        const userId = userData.user_id;

        // Update subscription status
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date(),
          })
          .eq('user_id', userId);

        // Reset features to free tier
        await supabase
          .from('user_features')
          .update({
            plan_id: 'free',
            document_ocr_limit: 10,
            document_ocr_used: 0,
            advanced_charts: false,
            data_export: false,
            recurring_transactions: false,
            budget_goals: false,
            savings_goals: false,
            bill_reminders: false,
            ai_insights: false,
            multi_currency: false,
          })
          .eq('user_id', userId);

        console.log(`[v0] Subscription canceled for user: ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('[v0] Invoice payment succeeded');
        break;
      }

      case 'invoice.payment_failed': {
        console.log('[v0] Invoice payment failed');
        break;
      }
    }
  } catch (error) {
    console.error('[v0] Webhook processing error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
