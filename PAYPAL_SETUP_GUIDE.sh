#!/bin/bash

# PayPal & Credits Integration - Environment Variables Setup Guide

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║              PayPal & Store Credits Integration Setup Guide               ║
║                                                                            ║
║               Complete this checklist before deploying                    ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: RUN DATABASE MIGRATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execute these SQL files in Supabase in order:

1. supabase/migrations/001_create_payment_tables.sql
   - Creates all payment tables
   - Sets up RLS policies
   - Adds indexes

2. supabase/migrations/002_create_payment_functions.sql
   - Creates RPC functions for atomic operations
   - Sets up triggers for referral automation
   - Indexes for performance

Steps:
  1. Go to https://supabase.com → Your Project → SQL Editor
  2. Click "New Query"
  3. Copy entire content of 001_create_payment_tables.sql
  4. Run the query
  5. Repeat steps 2-4 for 002_create_payment_functions.sql

✓ Confirm: Both migrations executed successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: SET UP PAYPAL DEVELOPER ACCOUNT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to https://developer.paypal.com
2. Sign in or create account
3. Go to Dashboard → Apps & Credentials
4. Select "Sandbox" environment (for testing)
5. Create an "Merchant" app
6. Copy these credentials:
   - CLIENT_ID (starts with "Aa...")
   - SECRET (starts with "Ea...")

Note: Keep BOTH credentials safe. NEVER share them publicly.

✓ Confirm: Sandbox credentials obtained

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: CONFIGURE ENVIRONMENT VARIABLES IN VERCEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Go to your Vercel Project → Settings → Environment Variables

Add these variables:

  PAYPAL_CLIENT_ID=Aa...your-client-id...
  PAYPAL_CLIENT_SECRET=Ea...your-secret...
  PAYPAL_MODE=sandbox  # Change to "live" for production

  # App URL (for PayPal redirect)
  NEXT_PUBLIC_APP_URL=http://localhost:3000  # For local dev
  # or
  NEXT_PUBLIC_APP_URL=https://yourdomain.com  # For production

Optional:
  # Email for payment receipts
  PAYMENTS_NOTIFICATION_EMAIL=your-email@gmail.com

✓ Confirm: All environment variables set in Vercel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: CONFIGURE PAYPAL WEBHOOKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to PayPal Dashboard → Sandbox settings
2. Click "Webhook Setup"
3. Enter Webhook URL: https://yourdomain.com/api/webhooks/paypal
   (For local dev: Use ngrok to tunnel: ngrok http 3000)
4. Subscribe to these events:
   ✓ CHECKOUT.ORDER.COMPLETED
   ✓ CHECKOUT.ORDER.APPROVED
   ✓ BILLING.SUBSCRIPTION.CREATED
   ✓ BILLING.SUBSCRIPTION.UPDATED
   ✓ BILLING.SUBSCRIPTION.CANCELLED
   ✓ PAYMENT.CAPTURE.REFUNDED

5. Save and test webhook

✓ Confirm: Webhooks configured and tested

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: CREATE TEST DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In Supabase SQL Editor, create test data:

-- Create a test promo code
INSERT INTO promo_codes (code, discount_type, discount_value, description, is_active)
VALUES 
  ('WELCOME50', 'percentage', 50, '50% off first month', true),
  ('SAVE10', 'fixed', 10, '$10 off any plan', true);

-- Verify
SELECT * FROM promo_codes WHERE is_active = true;

✓ Confirm: Test promo codes created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 6: TEST INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Start your app: npm run dev
2. Go to pricing page
3. Click "Start Free Trial" on Premium tier
4. Test with PayPal:
   - Click PayPal payment option
   - Enter PayPal Sandbox test account
   - Complete payment
   - Check if subscription activates

Test Email & Password (from PayPal Sandbox):
  Email: sb-xxxxx+buyer@personal.example.com
  Password: (set in PayPal dashboard)

✓ Confirm: Payment flow works end-to-end

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 7: TEST PROMO CODES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. At checkout, enter promo code: WELCOME50
2. Verify discount is applied correctly
3. Try invalid code - should show error
4. Test per-user limit - enter same code twice - should fail

✓ Confirm: Promo codes work correctly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 8: TEST STORE CREDITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Manually add credits to test user:

   INSERT INTO user_credits (user_id, balance)
   VALUES ('test-user-id', 5.00)
   ON CONFLICT (user_id) DO UPDATE
   SET balance = 5.00;

2. Go to dashboard and verify credits display
3. Use credits at checkout to reduce payment amount
4. Verify transaction history shows credit usage

✓ Confirm: Store credits system works

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 9: BEFORE PRODUCTION DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Production Checklist:

  [ ] Switch PAYPAL_MODE from "sandbox" to "live"
  [ ] Update PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to live credentials
  [ ] Update NEXT_PUBLIC_APP_URL to production domain
  [ ] Update PayPal webhook URL to production domain
  [ ] Verify HTTPS is enabled on production domain
  [ ] Test full payment flow on production
  [ ] Set up payment monitoring/alerts
  [ ] Enable payment receipt emails
  [ ] Create production promo codes
  [ ] Set up customer support documentation

✓ Confirm: All production checks passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: "PayPal credentials not configured"
→ Check environment variables are set in Vercel
→ Restart dev server after adding variables

Issue: "Order creation failed"
→ Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are correct
→ Check Sandbox mode is enabled if testing
→ Verify API endpoints are accessible

Issue: "Webhook not being received"
→ Verify webhook URL is publicly accessible
→ Check ngrok tunnel is running (for local dev)
→ Verify event subscriptions in PayPal dashboard
→ Check server logs for webhook errors

Issue: "Promo code not validating"
→ Verify promo_codes table has data
→ Check code is uppercase in database
→ Verify valid_until date hasn't passed
→ Check max_uses hasn't been exceeded

Issue: "Credits not being deducted"
→ Verify user_credits table has sufficient balance
→ Check RLS policies aren't blocking updates
→ Review credit_transactions for errors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Update checkout page to include PayPal button
2. Add payment method selection UI
3. Create admin dashboard for managing promo codes
4. Set up email receipts for payments
5. Implement subscription management (upgrade/downgrade/cancel)
6. Add payment analytics and revenue tracking
7. Create customer invoice history
8. Set up refund handling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help? Check:
• PayPal Developer Docs: https://developer.paypal.com/docs
• Supabase Docs: https://supabase.com/docs
• Next.js Docs: https://nextjs.org/docs

EOF
