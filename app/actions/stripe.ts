'use server';

import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

export async function createCheckoutSession(planId: string) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Find the plan
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) {
    throw new Error(`Plan "${planId}" not found`);
  }

  // Free tier doesn't need checkout
  if (planId === 'free') {
    return null;
  }

  // Get or create Stripe customer
  let { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  let stripeCustomerId = subscription?.stripe_customer_id;

  if (!stripeCustomerId) {
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        user_id: user.id,
      },
    });
    stripeCustomerId = customer.id;
  }

  // Create checkout session for subscription
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
  });

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
  };
}

export async function getPortalSession() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Get user's Stripe customer ID
  const { data: subscription, error: fetchError } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (fetchError || !subscription?.stripe_customer_id) {
    throw new Error('No Stripe customer found');
  }

  // Create portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account`,
  });

  return session.url;
}
