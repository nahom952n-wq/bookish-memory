export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
  condition: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_transaction',
    name: 'Getting Started',
    description: 'Add your first transaction',
    icon: '🚀',
    badge: 'starter',
    condition: 'transactions >= 1'
  },
  {
    id: 'budget_setter',
    name: 'Budget Master',
    description: 'Create your first budget goal',
    icon: '🎯',
    badge: 'planner',
    condition: 'budgets >= 1'
  },
  {
    id: 'saving_500',
    name: 'Saver $500',
    description: 'Save $500 in a month',
    icon: '💰',
    badge: 'saver',
    condition: 'monthly_savings >= 500'
  },
  {
    id: 'saving_2000',
    name: 'Saving $2000',
    description: 'Save $2000 in a month',
    icon: '💎',
    badge: 'financial_pro',
    condition: 'monthly_savings >= 2000'
  },
  {
    id: 'budget_perfectionist',
    name: 'Budget Perfectionist',
    description: 'Stay under budget for 3 months straight',
    icon: '🏆',
    badge: 'perfectionist',
    condition: 'streak >= 3'
  },
  {
    id: 'category_master',
    name: 'Category Master',
    description: 'Categorize all your transactions',
    icon: '🎨',
    badge: 'organizer',
    condition: 'categorized_percent >= 90'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Log in for 7 days straight',
    icon: '⚔️',
    badge: 'warrior',
    condition: 'login_streak >= 7'
  },
  {
    id: 'goal_achiever',
    name: 'Goal Achiever',
    description: 'Complete a savings goal',
    icon: '⭐',
    badge: 'achiever',
    condition: 'completed_goals >= 1'
  }
];

export const checkAchievements = (stats: any): Achievement[] => {
  const earned: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    const conditionMet = evalCondition(achievement.condition, stats);
    if (conditionMet) {
      earned.push(achievement);
    }
  });

  return earned;
};

const evalCondition = (condition: string, stats: any): boolean => {
  // Simple condition parser for >= and >= operators
  if (condition.includes('>=')) {
    const [key, value] = condition.split('>=').map(s => s.trim());
    const numValue = parseInt(value);
    return (stats[key] || 0) >= numValue;
  }
  return false;
};

export const calculateStreak = (transactions: any[]): UserStreak => {
  // Sort transactions by date
  const sorted = [...transactions].sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let lastDate: Date | null = null;

  sorted.forEach(transaction => {
    const txDate = new Date(transaction.transaction_date);
    txDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      currentStreak = 1;
      lastDate = txDate;
    } else {
      const diffMs = txDate.getTime() - lastDate.getTime();
      const diffDays = diffMs / (1000 * 3600 * 24);

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
      lastDate = txDate;
    }
  });

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastUpdated: new Date().toISOString()
  };
};
