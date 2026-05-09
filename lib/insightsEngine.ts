export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category_id?: string;
}

export interface SpendingInsight {
  type: 'positive' | 'negative' | 'warning' | 'insight';
  title: string;
  message: string;
  metric?: string;
  change?: number;
}

export const generateInsights = (transactions: Transaction[], categories: Map<string, string>): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthTransactions = transactions.filter(t => t.transaction_date.startsWith(currentMonth));
  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    date.setMonth(date.getMonth() - 1);
    const lastMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return t.transaction_date.startsWith(lastMonth);
  });

  // Calculate totals
  const currentIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const currentExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const lastIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const lastExpenses = lastMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Savings Rate Insight
  if (currentIncome > 0) {
    const savingsRate = ((currentIncome - currentExpenses) / currentIncome) * 100;
    insights.push({
      type: savingsRate > 20 ? 'positive' : savingsRate > 10 ? 'insight' : 'warning',
      title: 'Savings Rate',
      message: `You're saving ${savingsRate.toFixed(1)}% of your income this month.`,
      metric: `${savingsRate.toFixed(1)}%`,
      change: lastIncome ? (((currentIncome - currentExpenses) - (lastIncome - lastExpenses)) / (lastIncome - lastExpenses)) * 100 : 0
    });
  }

  // Expense Trend
  if (lastExpenses > 0) {
    const expenseChange = ((currentExpenses - lastExpenses) / lastExpenses) * 100;
    insights.push({
      type: expenseChange < 0 ? 'positive' : expenseChange > 15 ? 'warning' : 'insight',
      title: 'Spending Trend',
      message: expenseChange < 0 ? 'Your expenses are down compared to last month!' : 'Your spending is trending up.',
      metric: `$${currentExpenses.toFixed(0)}`,
      change: expenseChange
    });
  }

  // Category Spending Alert
  const categorySpending = new Map<string, number>();
  currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = categories.get(t.category_id || '') || 'Other';
    categorySpending.set(cat, (categorySpending.get(cat) || 0) + t.amount);
  });

  const topCategory = Array.from(categorySpending.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && topCategory[1] > currentExpenses * 0.3) {
    insights.push({
      type: 'warning',
      title: 'High Category Spend',
      message: `${topCategory[0]} is your top expense at ${((topCategory[1] / currentExpenses) * 100).toFixed(0)}% of spending.`,
      metric: `$${topCategory[1].toFixed(0)}`
    });
  }

  // Income Consistency
  if (currentIncome > 0 && lastIncome > 0) {
    const incomeChange = ((currentIncome - lastIncome) / lastIncome) * 100;
    if (Math.abs(incomeChange) > 20) {
      insights.push({
        type: incomeChange > 0 ? 'positive' : 'warning',
        title: 'Income Change',
        message: incomeChange > 0 ? 'Your income is up!' : 'Your income is down compared to last month.',
        metric: `$${currentIncome.toFixed(0)}`,
        change: incomeChange
      });
    }
  }

  // Smart Recommendation
  if (currentExpenses > currentIncome) {
    insights.push({
      type: 'warning',
      title: 'Overspending Alert',
      message: 'You\'re spending more than you earn this month. Consider adjusting your budget.',
      metric: `-$${(currentExpenses - currentIncome).toFixed(0)}`
    });
  } else if (currentExpenses < currentIncome * 0.5) {
    insights.push({
      type: 'positive',
      title: 'Excellent Budget Control',
      message: 'You\'re maintaining great spending discipline. Keep it up!',
      metric: '✓'
    });
  }

  return insights.slice(0, 4);
};

export const getSpendingByCategory = (transactions: Transaction[], categories: Map<string, string>) => {
  const spending = new Map<string, number>();
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = categories.get(t.category_id || '') || 'Other';
    spending.set(cat, (spending.get(cat) || 0) + t.amount);
  });
  return Array.from(spending.entries()).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
};

export const getSpendingTrend = (transactions: Transaction[]) => {
  const byDay = new Map<string, number>();
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const date = t.transaction_date;
    byDay.set(date, (byDay.get(date) || 0) + t.amount);
  });
  
  const sorted = Array.from(byDay.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  return sorted.slice(-30).map(([date, amount]) => ({ date, amount }));
};
