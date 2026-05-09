import { createClient } from '@/lib/supabase/server';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  min_purchase: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PromoValidationResult {
  valid: boolean;
  code?: PromoCode;
  error?: string;
  discount?: number;
}

export class PromoCodeValidator {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  async getPromoCode(code: string): Promise<PromoCode | null> {
    try {
      const { data, error } = await this.supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[PromoCode] Failed to get promo code:', error);
      return null;
    }
  }

  async validatePromoCode(
    code: string,
    purchaseAmount: number,
    userId?: string
  ): Promise<PromoValidationResult> {
    try {
      const promoCode = await this.getPromoCode(code);

      if (!promoCode) {
        return {
          valid: false,
          error: 'Promo code not found',
        };
      }

      // Check if active
      if (!promoCode.is_active) {
        return {
          valid: false,
          error: 'Promo code is no longer active',
        };
      }

      // Check expiration
      const now = new Date();
      if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
        return {
          valid: false,
          error: 'Promo code is not yet valid',
        };
      }

      if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
        return {
          valid: false,
          error: 'Promo code has expired',
        };
      }

      // Check usage limit
      if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
        return {
          valid: false,
          error: 'Promo code has reached maximum uses',
        };
      }

      // Check minimum purchase
      if (purchaseAmount < promoCode.min_purchase) {
        return {
          valid: false,
          error: `Minimum purchase amount of $${promoCode.min_purchase.toFixed(2)} required`,
        };
      }

      // Check per-user usage limit
      if (userId) {
        const hasUsed = await this.hasUserUsedPromo(promoCode.id, userId);
        if (hasUsed) {
          return {
            valid: false,
            error: 'You have already used this promo code',
          };
        }
      }

      // Calculate discount
      const discount = this.calculateDiscount(purchaseAmount, promoCode);

      return {
        valid: true,
        code: promoCode,
        discount,
      };
    } catch (error) {
      console.error('[PromoCode] Validation error:', error);
      return {
        valid: false,
        error: 'Error validating promo code',
      };
    }
  }

  private calculateDiscount(amount: number, promoCode: PromoCode): number {
    if (promoCode.discount_type === 'percentage') {
      return (amount * promoCode.discount_value) / 100;
    } else {
      return Math.min(promoCode.discount_value, amount);
    }
  }

  async hasUserUsedPromo(promoCodeId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('promo_usage')
        .select('id')
        .eq('promo_code_id', promoCodeId)
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        return false; // No usage found
      }

      return !!data;
    } catch (error) {
      console.error('[PromoCode] Error checking usage:', error);
      return true; // Assume used on error to be safe
    }
  }

  async recordPromoUsage(promoCodeId: string, userId: string): Promise<boolean> {
    try {
      // Record usage
      const { error: usageError } = await this.supabase
        .from('promo_usage')
        .insert([
          {
            promo_code_id: promoCodeId,
            user_id: userId,
          },
        ]);

      if (usageError) throw usageError;

      // Increment usage count
      const { error: updateError } = await this.supabase
        .from('promo_codes')
        .update({ current_uses: this.supabase.rpc('increment_promo_usage', { id: promoCodeId }) })
        .eq('id', promoCodeId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('[PromoCode] Failed to record usage:', error);
      return false;
    }
  }

  async createPromoCode(
    code: string,
    discountType: 'percentage' | 'fixed',
    discountValue: number,
    options?: {
      description?: string;
      maxUses?: number;
      minPurchase?: number;
      validFrom?: string;
      validUntil?: string;
    }
  ): Promise<PromoCode | null> {
    try {
      const { data, error } = await this.supabase
        .from('promo_codes')
        .insert([
          {
            code: code.toUpperCase(),
            description: options?.description || '',
            discount_type: discountType,
            discount_value: discountValue,
            max_uses: options?.maxUses || null,
            min_purchase: options?.minPurchase || 0,
            valid_from: options?.validFrom || null,
            valid_until: options?.validUntil || null,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[PromoCode] Failed to create promo code:', error);
      return null;
    }
  }

  async deactivatePromoCode(promoCodeId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('promo_codes')
        .update({ is_active: false })
        .eq('id', promoCodeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[PromoCode] Failed to deactivate:', error);
      return false;
    }
  }

  async listActivePromoCodes(): Promise<PromoCode[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('promo_codes')
        .select('*')
        .eq('is_active', true)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[PromoCode] Failed to list promo codes:', error);
      return [];
    }
  }
}

let promoValidator: PromoCodeValidator | null = null;

export const getPromoCodeValidator = (): PromoCodeValidator => {
  if (!promoValidator) {
    promoValidator = new PromoCodeValidator();
  }
  return promoValidator;
};
