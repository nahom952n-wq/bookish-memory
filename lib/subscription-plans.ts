export interface Plan {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  interval: 'month' | 'year';
  features: {
    documentOcrLimit: number;
    advancedCharts: boolean;
    dataExport: boolean;
    recurringTransactions: boolean;
    budgetGoals: boolean;
    savingsGoals: boolean;
    billReminders: boolean;
    aiInsights: boolean;
    multiCurrency: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    priceInCents: 0,
    interval: 'month',
    features: {
      documentOcrLimit: 10,
      advancedCharts: false,
      dataExport: false,
      recurringTransactions: false,
      budgetGoals: false,
      savingsGoals: false,
      billReminders: false,
      aiInsights: false,
      multiCurrency: false,
    },
  },
  {
    id: 'price_premium_monthly',
    name: 'Premium',
    description: 'For serious budgeters',
    priceInCents: 499,
    interval: 'month',
    features: {
      documentOcrLimit: 100,
      advancedCharts: true,
      dataExport: true,
      recurringTransactions: true,
      budgetGoals: true,
      savingsGoals: true,
      billReminders: true,
      aiInsights: true,
      multiCurrency: false,
    },
  },
  {
    id: 'price_premium_yearly',
    name: 'Premium Yearly',
    description: 'Best value - Save 20%',
    priceInCents: 47900,
    interval: 'year',
    features: {
      documentOcrLimit: 100,
      advancedCharts: true,
      dataExport: true,
      recurringTransactions: true,
      budgetGoals: true,
      savingsGoals: true,
      billReminders: true,
      aiInsights: true,
      multiCurrency: false,
    },
  },
  {
    id: 'price_pro_monthly',
    name: 'Pro',
    description: 'Professional money management',
    priceInCents: 999,
    interval: 'month',
    features: {
      documentOcrLimit: 500,
      advancedCharts: true,
      dataExport: true,
      recurringTransactions: true,
      budgetGoals: true,
      savingsGoals: true,
      billReminders: true,
      aiInsights: true,
      multiCurrency: true,
    },
  },
  {
    id: 'price_pro_yearly',
    name: 'Pro Yearly',
    description: 'Best value - Save 20%',
    priceInCents: 95900,
    interval: 'year',
    features: {
      documentOcrLimit: 500,
      advancedCharts: true,
      dataExport: true,
      recurringTransactions: true,
      budgetGoals: true,
      savingsGoals: true,
      billReminders: true,
      aiInsights: true,
      multiCurrency: true,
    },
  },
];

export function getPlanById(id: string): Plan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
}

export function formatPrice(priceInCents: number, interval: 'month' | 'year'): string {
  const dollars = (priceInCents / 100).toFixed(2);
  if (priceInCents === 0) return 'Free';
  if (interval === 'month') return `$${dollars}/month`;
  return `$${dollars}/year`;
}
