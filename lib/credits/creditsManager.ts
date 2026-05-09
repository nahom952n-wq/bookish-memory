import { createClient } from '@/lib/supabase/server';

export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  last_updated: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'referral' | 'promo' | 'payment' | 'refund' | 'purchase';
  description: string;
  reference_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export class CreditsManager {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  async getUserCredits(userId: string): Promise<UserCredits | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No credits record exists, create one
          return await this.initializeCredits(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[Credits] Failed to get user credits:', error);
      return null;
    }
  }

  async initializeCredits(userId: string, initialBalance: number = 0): Promise<UserCredits | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_credits')
        .insert([
          {
            user_id: userId,
            balance: initialBalance,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Credits] Failed to initialize credits:', error);
      return null;
    }
  }

  async addCredits(
    userId: string,
    amount: number,
    type: CreditTransaction['type'],
    description: string,
    referenceId?: string
  ): Promise<boolean> {
    try {
      // Start transaction
      const { error: txError } = await this.supabase.rpc('add_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_description: description,
        p_reference_id: referenceId,
      });

      if (txError) throw txError;

      // Log the transaction
      await this.recordTransaction(userId, amount, type, description, referenceId, 'completed');

      return true;
    } catch (error) {
      console.error('[Credits] Failed to add credits:', error);
      return false;
    }
  }

  async deductCredits(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<boolean> {
    try {
      const credits = await this.getUserCredits(userId);
      
      if (!credits || credits.balance < amount) {
        console.error('[Credits] Insufficient balance');
        return false;
      }

      const { error } = await this.supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description,
        p_reference_id: referenceId,
      });

      if (error) throw error;

      // Log the transaction
      await this.recordTransaction(userId, -amount, 'purchase', description, referenceId, 'completed');

      return true;
    } catch (error) {
      console.error('[Credits] Failed to deduct credits:', error);
      return false;
    }
  }

  async recordTransaction(
    userId: string,
    amount: number,
    type: CreditTransaction['type'],
    description: string,
    referenceId?: string,
    status: CreditTransaction['status'] = 'completed'
  ): Promise<CreditTransaction | null> {
    try {
      const { data, error } = await this.supabase
        .from('credit_transactions')
        .insert([
          {
            user_id: userId,
            amount,
            type,
            description,
            reference_id: referenceId,
            status,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Credits] Failed to record transaction:', error);
      return null;
    }
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Credits] Failed to get transaction history:', error);
      return [];
    }
  }

  async applyCreditsToSubscription(
    userId: string,
    subscriptionCost: number
  ): Promise<{ creditsUsed: number; remainingCost: number }> {
    try {
      const credits = await this.getUserCredits(userId);
      
      if (!credits) {
        return { creditsUsed: 0, remainingCost: subscriptionCost };
      }

      const creditsUsed = Math.min(credits.balance, subscriptionCost);
      const remainingCost = subscriptionCost - creditsUsed;

      if (creditsUsed > 0) {
        await this.deductCredits(userId, creditsUsed, 'Applied to subscription');
      }

      return { creditsUsed, remainingCost };
    } catch (error) {
      console.error('[Credits] Failed to apply credits:', error);
      return { creditsUsed: 0, remainingCost: subscriptionCost };
    }
  }

  async validateCreditsAmount(userId: string, amount: number): Promise<boolean> {
    try {
      const credits = await this.getUserCredits(userId);
      return credits ? credits.balance >= amount : false;
    } catch (error) {
      console.error('[Credits] Failed to validate credits:', error);
      return false;
    }
  }
}

// Create singleton instance
let creditsManager: CreditsManager | null = null;

export const getCreditsManager = (): CreditsManager => {
  if (!creditsManager) {
    creditsManager = new CreditsManager();
  }
  return creditsManager;
};
