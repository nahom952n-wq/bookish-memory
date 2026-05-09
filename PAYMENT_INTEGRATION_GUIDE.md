# PayPal & Store Credits Integration Documentation

## Overview

BudgetMind now supports multiple payment methods and a flexible store credits system. Users can pay via:
- **Stripe** (credit/debit cards) - Existing
- **PayPal** - New
- **Store Credits** - New (earned through referrals, promos, or purchased)

---

## Architecture

### Database Schema

#### Tables Created

1. **user_credits** - Track user account balance
   - `id`, `user_id`, `balance`, `last_updated`
   - Unique per user, fast balance lookups

2. **credit_transactions** - Audit trail
   - `id`, `user_id`, `amount`, `type`, `description`, `reference_id`, `status`, `created_at`
   - Types: 'referral', 'promo', 'payment', 'refund', 'purchase'

3. **promo_codes** - Promotion management
   - `code`, `discount_type`, `discount_value`, `max_uses`, `current_uses`
   - `valid_from`, `valid_until`, `is_active`
   - Supports percentage and fixed discounts

4. **promo_usage** - Per-user promo tracking
   - Prevents promo code reuse per user
   - Links to users and promo_codes

5. **referral_credits** - Referral system integration
   - `referrer_id`, `referred_user_id`, `credit_amount`
   - `status`, `referred_user_converted`, `converted_at`
   - Auto-awarded when referred user subscribes

6. **paypal_transactions** - PayPal payment tracking
   - `user_id`, `paypal_transaction_id`, `paypal_order_id`
   - `amount`, `currency`, `status`, `subscription_plan`
   - `payment_source`, `created_at`, `updated_at`

7. **payment_methods** - User payment preferences
   - Store user's preferred payment method
   - Support for stripe, paypal, and credits

### RPC Functions

1. **add_credits()** - Atomic credit addition
   - Thread-safe balance updates
   - Auto-records transactions
   - Returns new balance

2. **deduct_credits()** - Atomic credit deduction
   - Validates sufficient balance
   - Fails if insufficient funds
   - Records transaction

3. **increment_promo_usage()** - Safe usage counter
   - Prevents race conditions
   - Thread-safe increments

4. **get_pending_referrals()** - Referral lookup
   - Get all referrals for a user
   - Shows conversion status

### Triggers

**on_subscription_activation** - Auto-awards referral credits
- When referred user's subscription activates
- Automatically credits referrer with 30 days worth
- Updates referral status to 'awarded'

---

## PayPal Integration

### Setup Requirements

1. **PayPal Developer Account**
   - Create at https://developer.paypal.com
   - Create "Merchant" app
   - Get Client ID and Secret

2. **Environment Variables**
   ```bash
   PAYPAL_CLIENT_ID=Aa...your-id
   PAYPAL_CLIENT_SECRET=Ea...your-secret
   PAYPAL_MODE=sandbox  # or "live"
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Webhook Configuration**
   - URL: `https://yourdomain.com/api/webhooks/paypal`
   - Subscribe to events:
     - CHECKOUT.ORDER.COMPLETED
     - CHECKOUT.ORDER.APPROVED
     - BILLING.SUBSCRIPTION.CREATED
     - BILLING.SUBSCRIPTION.UPDATED
     - BILLING.SUBSCRIPTION.CANCELLED
     - PAYMENT.CAPTURE.REFUNDED

### PayPal Client API

**File**: `lib/paypal/client.ts`

```typescript
const paypal = initPayPalClient();

// Create order for one-time payment
const orderId = await paypal.createOrder('4.99', 'USD', 'premium-user-123');

// Capture completed order
const order = await paypal.captureOrder(orderId);

// Get order details
const order = await paypal.getOrder(orderId);

// Create subscription
const subscriptionId = await paypal.createSubscription(
  planId,
  'user@example.com',
  'https://yourdomain.com/checkout/success'
);

// Get subscription details
const subscription = await paypal.getSubscription(subscriptionId);

// Suspend/cancel subscription
await paypal.suspendSubscription(subscriptionId);
await paypal.cancelSubscription(subscriptionId);
```

### Webhook Handler

**File**: `app/api/webhooks/paypal/route.ts`

Handles all PayPal events:
- **ORDER_COMPLETED** - Process one-time payment, create subscription
- **SUBSCRIPTION_CREATED** - Track subscription creation
- **SUBSCRIPTION_CANCELLED** - Handle subscription cancellation
- **PAYMENT_REFUNDED** - Process refunds, restore credits

---

## Store Credits System

### Credits Manager

**File**: `lib/credits/creditsManager.ts`

```typescript
const creditsManager = getCreditsManager();

// Get user balance
const credits = await creditsManager.getUserCredits(userId);

// Add credits
await creditsManager.addCredits(
  userId,
  30,
  'referral',
  'Friend conversion bonus',
  referralId
);

// Deduct credits
await creditsManager.deductCredits(
  userId,
  4.99,
  'Subscription payment'
);

// Get transaction history
const transactions = await creditsManager.getTransactionHistory(userId, 50);

// Apply credits to subscription
const { creditsUsed, remainingCost } = 
  await creditsManager.applyCreditsToSubscription(userId, 4.99);
```

### Credit Types

- **referral** - Earned when referred friend subscribes
- **promo** - Earned from promo code
- **payment** - Spent on subscriptions
- **refund** - Restored when payment is refunded
- **purchase** - Spent on any purchase

---

## Promo Code System

### Promo Validator

**File**: `lib/promo/promoValidator.ts`

```typescript
const promoValidator = getPromoCodeValidator();

// Validate promo code
const validation = await promoValidator.validatePromoCode(
  'WELCOME50',
  4.99,  // purchase amount
  userId // optional
);

if (validation.valid) {
  console.log('Discount:', validation.discount); // e.g., 2.495
}

// Create promo code (admin)
await promoValidator.createPromoCode(
  'SAVE10',
  'fixed', // or 'percentage'
  10,
  {
    description: '$10 off any plan',
    maxUses: 1000,
    minPurchase: 0,
    validUntil: '2025-12-31T23:59:59Z'
  }
);

// List active promo codes
const activeCodes = await promoValidator.listActivePromoCodes();

// Deactivate promo
await promoValidator.deactivatePromoCode(promoCodeId);
```

### Promo Validation Rules

- **Active status** - Must be is_active = true
- **Time window** - Must be within valid_from and valid_until
- **Usage limit** - current_uses < max_uses
- **Per-user limit** - User cannot use same code twice
- **Minimum purchase** - Purchase amount >= min_purchase

### Promo Types

**Percentage Discount**
```
Code: WELCOME50
Type: percentage
Value: 50
Example: $4.99 subscription → $2.495 (50% off)
```

**Fixed Discount**
```
Code: SAVE10
Type: fixed
Value: 10
Example: $4.99 subscription → -$4.99 (capped at purchase amount)
```

---

## Referral Integration

### Auto-Credit Flow

1. User A receives referral link with code
2. User A shares link with User B
3. User B signs up with referral code
4. Referral record created: `referrer_id=A, referred_user_id=B, status='pending'`
5. User B subscribes (Premium/Pro)
6. Trigger fires: `trigger_referral_credit_on_subscription()`
7. Referral status updated to 'awarded'
8. 30 days worth of credits added to User A's balance
9. Transaction recorded with type='referral'

### Database Records

**user_subscriptions**
```typescript
{
  user_id,
  plan: 'premium' | 'pro',
  status: 'active',
  renewal_date,
  payment_method: 'paypal' | 'stripe',
  created_at,
  updated_at
}
```

**referral_credits**
```typescript
{
  referrer_id,           // User A
  referred_user_id,      // User B
  credit_amount: 30,     // 30 days
  status: 'awarded',
  referred_user_converted: true,
  converted_at
}
```

---

## Payment Flow

### PayPal Checkout Flow

```
1. User clicks "Pay with PayPal"
2. Call createPayPalCheckoutSession(plan, options)
   - Validate plan
   - Apply credits if available
   - Apply promo code if provided
   - Create PayPal order
   - Record pending transaction
3. Redirect to PayPal
4. User approves payment
5. Redirect back to /checkout/success?orderID=...
6. Call capturePayPalOrder(orderId)
   - Capture payment
   - Update subscription
   - Record transaction
   - Update user_subscriptions
7. Show confirmation
```

### Multi-Payment at Checkout

Example: $4.99 Premium subscription

**Scenario: User has $2 credits + WELCOME50 promo**

1. Original price: $4.99
2. Apply credits: -$2.00 → $2.99
3. Apply WELCOME50 (50% off): -$1.495 → $1.495
4. Deduct from credits: -$2.00
5. PayPal charge: $1.495
6. User pays: $3.495 total (across methods)

---

## API Endpoints

### GET /api/credits
Get user's credit balance and transaction history

**Response**:
```json
{
  "success": true,
  "credits": {
    "id": "...",
    "user_id": "...",
    "balance": 30.50,
    "last_updated": "2025-05-06T..."
  },
  "transactions": [
    {
      "id": "...",
      "amount": 30,
      "type": "referral",
      "description": "Friend conversion bonus",
      "created_at": "2025-05-06T..."
    }
  ]
}
```

### POST /api/promo/validate
Validate promo code

**Request**:
```json
{
  "code": "WELCOME50",
  "purchaseAmount": 4.99
}
```

**Response**:
```json
{
  "valid": true,
  "code": "WELCOME50",
  "discountType": "percentage",
  "discountValue": 50,
  "discount": 2.495
}
```

### POST /api/webhooks/paypal
PayPal webhook endpoint (no auth required, PayPal verifies signature)

**Handles**:
- Order completion
- Subscription updates
- Payment refunds

---

## Components

### CreditsDisplay
Displays user balance and transaction history

```typescript
<CreditsDisplay />
```

### PromoCodeInput
Input field for promo code entry at checkout

```typescript
<PromoCodeInput 
  onPromoApplied={(code, discount) => {}}
  onPromoRemoved={() => {}}
/>
```

---

## Admin Functions

### Create Promo Code

```typescript
// In admin panel
await promoValidator.createPromoCode(
  'SUMMER25',
  'percentage',
  25,
  {
    description: '25% off summer sale',
    maxUses: 500,
    minPurchase: 0,
    validFrom: '2025-06-01T00:00:00Z',
    validUntil: '2025-08-31T23:59:59Z'
  }
);
```

### Award Manual Credits

```typescript
await creditsManager.addCredits(
  userId,
  10,
  'promo',
  'Manual credit award for support',
  'support-ticket-123'
);
```

### View User Credits

```typescript
const userCredits = await creditsManager.getUserCredits(userId);
const transactions = await creditsManager.getTransactionHistory(userId);
```

### Track Referrals

```typescript
// SQL query to view all referrals
SELECT * FROM referral_credits WHERE referrer_id = 'user-id'
ORDER BY created_at DESC;
```

---

## Testing

### Test Promo Code

1. Create test promo: `TESTCODE`
2. Go to checkout
3. Enter promo code
4. Verify discount applied

### Test Store Credits

1. Add credits manually in Supabase
2. Go to checkout
3. Verify credits option appears
4. Apply credits - should reduce payment

### Test PayPal

1. Use PayPal Sandbox credentials
2. Integrate PayPal button in UI
3. Click to pay
4. Verify transaction in `paypal_transactions` table
5. Verify subscription created
6. Verify webhook received

### Test Referrals

1. Create referral code for User A
2. Share with User B
3. User B signs up with code
4. User B upgrades to Premium
5. Verify referral_credits record created
6. Verify User A receives 30 credits
7. Verify transaction recorded

---

## Migration Path for Existing Users

### Existing Stripe Users
- Can continue using Stripe
- Can add PayPal as secondary method
- Can earn credits through referrals

### Existing Free Users
- No action required
- Can subscribe with any method
- Earn welcome bonus (7 days)

---

## Security Considerations

1. **Environment Variables**
   - PAYPAL_CLIENT_SECRET never exposed to frontend
   - Only NEXT_PUBLIC_APP_URL public
   - Credentials stored securely in Vercel

2. **RLS Policies**
   - Users can only view their own credits
   - Users can only view referrals they made/received
   - Admin-only creation of promo codes

3. **Atomic Operations**
   - Database triggers ensure consistency
   - No double-charging possible
   - Failed transactions properly logged

4. **Webhook Verification**
   - PayPal signature verification
   - HMAC validation
   - Replay attack prevention

---

## Troubleshooting

### "PayPal credentials not configured"
- Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Vercel
- Restart dev server after updating env vars

### "Payment failed"
- Check PayPal Sandbox/Live mode matches PAYPAL_MODE
- Verify order amount > 0
- Check Supabase connection

### "Promo code not working"
- Verify code exists in promo_codes table
- Check is_active = true
- Check expiration date
- Verify user hasn't used code before
- Check max_uses not exceeded

### "Credits not deducting"
- Verify user_credits table has sufficient balance
- Check RLS policies
- Review error logs

### "Webhook not received"
- Verify webhook URL is publicly accessible
- Check ngrok tunnel running (local dev)
- Verify event subscriptions in PayPal
- Check firewall isn't blocking webhooks

---

## Next Steps

1. **Integrate PayPal Button** in checkout UI
2. **Create Payment Method Selector** for user preference
3. **Build Admin Dashboard** for promo code management
4. **Add Email Receipts** for payments
5. **Implement Subscription Management** (upgrade/downgrade)
6. **Create Analytics** for payment tracking
7. **Set Up Dunning** for failed payments
8. **Add Invoice History** to dashboard

---

## Files Reference

- `supabase/migrations/001_create_payment_tables.sql` - Schema
- `supabase/migrations/002_create_payment_functions.sql` - Functions
- `lib/paypal/client.ts` - PayPal API client
- `lib/credits/creditsManager.ts` - Credits management
- `lib/promo/promoValidator.ts` - Promo validation
- `app/actions/paypal-checkout.ts` - Checkout actions
- `app/api/webhooks/paypal/route.ts` - Webhook handler
- `app/api/credits/route.ts` - Credits API
- `app/api/promo/validate/route.ts` - Promo validation API
- `components/CreditsDisplay.tsx` - Credits UI
- `components/PromoCodeInput.tsx` - Promo input UI
- `PAYPAL_SETUP_GUIDE.sh` - Setup instructions

---

**Status**: Production-ready
**Version**: 1.0
**Last Updated**: May 6, 2025
