-- RPC Functions for transaction management

-- Function to add credits atomically
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type VARCHAR,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
  v_new_balance DECIMAL;
BEGIN
  -- Update or insert user credits
  INSERT INTO user_credits (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_credits.balance + p_amount,
      last_updated = NOW()
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id, status)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, 'completed');

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
  v_new_balance DECIMAL;
BEGIN
  -- Check and update user credits
  UPDATE user_credits
  SET balance = balance - p_amount,
      last_updated = NOW()
  WHERE user_id = p_user_id AND balance >= p_amount
  RETURNING balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id, status)
  VALUES (p_user_id, -p_amount, 'purchase', p_description, p_reference_id, 'completed');

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_usage(p_id UUID)
RETURNS INT AS $$
DECLARE
  v_current_uses INT;
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE id = p_id
  RETURNING current_uses INTO v_current_uses;

  RETURN v_current_uses;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's pending referrals
CREATE OR REPLACE FUNCTION get_pending_referrals(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  referred_email VARCHAR,
  status VARCHAR,
  credit_amount DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    u.email::VARCHAR,
    rc.status,
    rc.credit_amount,
    rc.created_at
  FROM referral_credits rc
  LEFT JOIN auth.users u ON rc.referred_user_id = u.id
  WHERE rc.referrer_id = p_user_id
  ORDER BY rc.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically award referral credits when a referred user subscribes
CREATE OR REPLACE FUNCTION trigger_referral_credit_on_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    -- Find referral record
    UPDATE referral_credits
    SET
      status = 'awarded',
      referred_user_converted = TRUE,
      converted_at = NOW()
    WHERE referred_user_id = NEW.user_id AND status = 'pending';

    -- Award credits to referrer
    UPDATE referral_credits rc
    SET status = 'awarded'
    WHERE referred_user_id = NEW.user_id
      AND referrer_id IN (
        SELECT user_id FROM referral_credits
        WHERE referred_user_id = NEW.user_id
          AND status = 'pending'
      );

    -- Add credits to referrer
    INSERT INTO credit_transactions (user_id, amount, type, description, status)
    SELECT
      referrer_id,
      30,
      'referral',
      'Referral bonus - friend converted to paid',
      'completed'
    FROM referral_credits
    WHERE referred_user_id = NEW.user_id AND status = 'awarded'
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription activation
CREATE TRIGGER on_subscription_activation
AFTER INSERT OR UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_referral_credit_on_subscription();

-- Create index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_referral_credits_status ON referral_credits(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_until ON promo_codes(valid_until);
