import { createClient } from '@/lib/supabase/client';

export interface UserFeatures {
  documentOcrLimit: number;
  documentOcrUsed: number;
  advancedCharts: boolean;
  dataExport: boolean;
  recurringTransactions: boolean;
  budgetGoals: boolean;
  savingsGoals: boolean;
  billReminders: boolean;
  aiInsights: boolean;
  multiCurrency: boolean;
}

export async function getUserFeatures(userId: string): Promise<UserFeatures | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('user_features')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return free tier features
      return getFreeTierFeatures();
    }

    return {
      documentOcrLimit: data.document_ocr_limit,
      documentOcrUsed: data.document_ocr_used,
      advancedCharts: data.advanced_charts,
      dataExport: data.data_export,
      recurringTransactions: data.recurring_transactions,
      budgetGoals: data.budget_goals,
      savingsGoals: data.savings_goals,
      billReminders: data.bill_reminders,
      aiInsights: data.ai_insights,
      multiCurrency: data.multi_currency,
    };
  } catch (error) {
    console.error('[v0] Error fetching user features:', error);
    return getFreeTierFeatures();
  }
}

export function getFreeTierFeatures(): UserFeatures {
  return {
    documentOcrLimit: 10,
    documentOcrUsed: 0,
    advancedCharts: false,
    dataExport: false,
    recurringTransactions: false,
    budgetGoals: false,
    savingsGoals: false,
    billReminders: false,
    aiInsights: false,
    multiCurrency: false,
  };
}

export async function hasFeature(userId: string, feature: keyof UserFeatures): Promise<boolean> {
  const features = await getUserFeatures(userId);
  if (!features) return false;

  const value = features[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}

export async function canUseOcr(userId: string): Promise<boolean> {
  const features = await getUserFeatures(userId);
  if (!features) return false;

  return features.documentOcrUsed < features.documentOcrLimit;
}

export async function incrementOcrUsage(userId: string): Promise<void> {
  const supabase = createClient();

  try {
    await supabase
      .from('user_features')
      .update({ document_ocr_used: supabase.sql`document_ocr_used + 1` })
      .eq('user_id', userId);
  } catch (error) {
    console.error('[v0] Error incrementing OCR usage:', error);
  }
}

export async function checkFeatureAccess(userId: string, feature: keyof UserFeatures): Promise<{ hasAccess: boolean; message?: string }> {
  const features = await getUserFeatures(userId);
  
  if (!features) {
    return {
      hasAccess: feature === 'documentOcrLimit' || feature === 'documentOcrUsed',
      message: 'Upgrade to Premium to unlock this feature',
    };
  }

  const featureValue = features[feature];

  if (typeof featureValue === 'boolean') {
    return {
      hasAccess: featureValue,
      message: featureValue ? undefined : 'Upgrade to Premium to unlock this feature',
    };
  }

  if (feature === 'documentOcrLimit') {
    const hasAccess = features.documentOcrUsed < features.documentOcrLimit;
    return {
      hasAccess,
      message: !hasAccess ? 'OCR limit reached. Upgrade to Premium for more scans.' : undefined,
    };
  }

  return { hasAccess: true };
}
