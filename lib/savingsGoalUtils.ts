export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  category: 'vacation' | 'emergency' | 'house' | 'car' | 'education' | 'investment' | 'wedding' | 'general';
  icon: string;
  color: string;
  target_date: string;
  is_active: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  milestone_percent: number;
  milestone_amount: number;
  reached_at?: string;
  created_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  note?: string;
  created_at: string;
}

export const GOAL_CATEGORIES = {
  vacation: { label: 'Vacation', icon: '✈️', color: '#EC4899' },
  emergency: { label: 'Emergency Fund', icon: '🆘', color: '#EF4444' },
  house: { label: 'House', icon: '🏠', color: '#F59E0B' },
  car: { label: 'Car', icon: '🚗', color: '#06B6D4' },
  education: { label: 'Education', icon: '📚', color: '#8B5CF6' },
  investment: { label: 'Investment', icon: '📈', color: '#10B981' },
  wedding: { label: 'Wedding', icon: '💍', color: '#EC4899' },
  general: { label: 'General Savings', icon: '🎯', color: '#3B82F6' },
};

export const calculateGoalProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const calculateDaysRemaining = (targetDate: string): number => {
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateAmountPerDay = (remaining: number, daysLeft: number): number => {
  if (daysLeft <= 0) return 0;
  return remaining / daysLeft;
};

export const generateDefaultMilestones = (targetAmount: number): { percent: number; amount: number }[] => {
  return [
    { percent: 25, amount: Math.round(targetAmount * 0.25 * 100) / 100 },
    { percent: 50, amount: Math.round(targetAmount * 0.5 * 100) / 100 },
    { percent: 75, amount: Math.round(targetAmount * 0.75 * 100) / 100 },
    { percent: 100, amount: Math.round(targetAmount * 100) / 100 },
  ];
};

export const getMilestoneMessages = (percent: number): string => {
  switch (percent) {
    case 25:
      return 'Great start! You&apos;re 25% of the way there!';
    case 50:
      return 'Halfway there! Keep up the momentum!';
    case 75:
      return 'Almost there! Just a bit more to go!';
    case 100:
      return 'Congratulations! Goal achieved!';
    default:
      return `You&apos;ve reached ${percent}% of your goal!`;
  }
};

export const formatTimeRemaining = (daysLeft: number): string => {
  if (daysLeft < 0) return 'Goal date passed';
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return '1 day remaining';
  if (daysLeft < 7) return `${daysLeft} days remaining`;
  if (daysLeft < 30) return `${Math.floor(daysLeft / 7)} weeks remaining`;
  if (daysLeft < 365) return `${Math.floor(daysLeft / 30)} months remaining`;
  return `${Math.floor(daysLeft / 365)} years remaining`;
};
