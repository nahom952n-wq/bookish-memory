'use server';

import { initPayPalClient } from '@/lib/paypal/client';
import { createClient } from '@/lib/supabase/server';
import { getCreditsManager } from '@/lib/credits/creditsManager';
import { getPromoCodeValidator } from '@/lib/promo/promoValidator';

const SUBSCRIPTION_PLANS = {
  premium: {
    price: 4.99,
    name: 'Premium',
    billingCycle: 'monthly',
  },
  pro: {
    price: 9.99,
    name: 'Pro',
    billingCycle: 'monthly',
  },
};

export async function createPayPalCheckoutSession(
  plan: 'premium' | 'pro',
  options?: {
    creditsApplied?: number;
    promoCode?: string;
    referralCode?: string;
  }
) {
  try {
    const supabase = createClient();
    const paypal = initPayPalClient();
    const creditsManager = getCreditsManager();
    const promoValidator = getPromoCodeValidator();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get plan details
    const planDetails = SUBSCRIPTION_PLANS[plan];
    if (!planDetails) {
      return {
        success: false,
        error: 'Invalid plan selected',
      };
    }

    let totalAmount = planDetails.price;
    const discounts = {
      credits: 0,
      promo: 0,
    };

    // Apply credits if provided
    if (options?.creditsApplied && options.creditsApplied > 0) {
      const credits = await creditsManager.getUserCredits(user.id);
      const availableCredits = credits?.balance || 0;

      if (availableCredits >= options.creditsApplied) {
        discounts.credits = options.creditsApplied;
        totalAmount -= discounts.credits;
      }
    }

    // Apply promo code if provided
    if (options?.promoCode) {
      const validation = await promoValidator.validatePromoCode(
        options.promoCode,
        totalAmount,
        user.id
      );

      if (validation.valid && validation.discount) {
        discounts.promo = validation.discount;
        totalAmount -= discounts.promo;
      } else {
        return {
          success: false,
          error: validation.error || 'Invalid promo code',
        };
      }
    }

    // Ensure minimum amount
    totalAmount = Math.max(0.01, totalAmount);

    // Create PayPal order
    const orderId = await paypal.createOrder(
      totalAmount.toFixed(2),
      'USD',
      `${plan}-${user.id}`
    );

    // Record the transaction as pending
    await supabase.from('paypal_transactions').insert([
      {
        user_id: user.id,
        paypal_order_id: orderId,
        amount: totalAmount,
        currency: 'USD',
        status: 'pending',
        subscription_plan: plan,
        payment_source: 'paypal',
      },
    ]);

    return {
      success: true,
      orderId,
      amount: totalAmount,
      plan,
      discounts,
    };
  } catch (error) {
    console.error('[PayPal Checkout] Error:', error);
    return {
      success: false,
      error: 'Failed to create checkout session',
    };
  }
}

export async function capturePayPalOrder(orderId: string, plan: 'premium' | 'pro') {
  try {
    const supabase = createClient();
    const paypal = initPayPalClient();
    const creditsManager = getCreditsManager();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Capture the order
    const order = await paypal.captureOrder(orderId);

    if (order.status !== 'COMPLETED') {
      return {
        success: false,
        error: 'Payment was not completed',
      };
    }

    const amount = parseFloat(order.purchase_units[0].amount.value);

    // Update transaction status
    await supabase
      .from('paypal_transactions')
      .update({
        status: 'completed',
        paypal_transaction_id: order.id,
      })
      .eq('paypal_order_id', orderId);

    // Update subscription in user_subscriptions table
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      // Update existing subscription
      await supabase
        .from('user_subscriptions')
        .update({
          plan,
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_method: 'paypal',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSub.id);
    } else {
      // Create new subscription
      await supabase.from('user_subscriptions').insert([
        {
          user_id: user.id,
          plan,
          status: 'active',
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_method: 'paypal',
        },
      ]);
    }

    // Record transaction in credits (deduct if credits were used)
    await creditsManager.recordTransaction(
      user.id,
      -amount,
      'payment',
      `Subscription payment for ${plan} plan via PayPal`,
      orderId,
      'completed'
    );

    return {
      success: true,
      message: 'Payment successful',
      orderId,
      amount,
      plan,
    };
  } catch (error) {
    console.error('[PayPal Capture] Error:', error);
    return {
      success: false,
      error: 'Failed to capture payment',
    };
  }
}

export async function cancelPayPalOrder(orderId: string) {
  try {
    const supabase = createClient();

    // Update transaction status
    await supabase
      .from('paypal_transactions')
      .update({
        status: 'failed',
      })
      .eq('paypal_order_id', orderId);

    return {
      success: true,
      message: 'Payment cancelled',
    };
  } catch (error) {
    console.error('[PayPal Cancel] Error:', error);
    return {
      success: false,
      error: 'Failed to cancel payment',
    };
  }
}
