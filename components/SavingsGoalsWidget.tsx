'use client';

import { SavingsGoal, calculateGoalProgress, calculateDaysRemaining, formatTimeRemaining, GOAL_CATEGORIES } from '@/lib/savingsGoalUtils';
import { Trash2, Target } from 'lucide-react';

interface SavingsGoalsWidgetProps {
  goals: SavingsGoal[];
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export default function SavingsGoalsWidget({ goals, onDeleteGoal }: SavingsGoalsWidgetProps) {
  if (goals.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-semibold">No savings goals yet</p>
        <p className="text-gray-400 text-sm">Create your first goal to start saving!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((goal) => {
        const progress = calculateGoalProgress(goal.current_amount, goal.target_amount);
        const daysRemaining = calculateDaysRemaining(goal.target_date);
        const timeRemaining = formatTimeRemaining(daysRemaining);
        const amountRemaining = goal.target_amount - goal.current_amount;
        const category = GOAL_CATEGORIES[goal.category as keyof typeof GOAL_CATEGORIES];

        const progressColor = progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500';
        const isMilestone = [25, 50, 75, 100].includes(Math.floor(progress));

        return (
          <div
            key={goal.id}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4"
            style={{ borderColor: goal.color }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{goal.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{goal.name}</h3>
                  <p className="text-xs text-gray-500">{category.label}</p>
                </div>
              </div>
              <button
                onClick={() => onDeleteGoal(goal.id)}
                className="text-red-500 hover:text-red-700 opacity-0 hover:opacity-100 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {goal.description && <p className="text-sm text-gray-600 mb-3">{goal.description}</p>}

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progress</span>
                  <span className="text-sm font-bold" style={{ color: goal.color }}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${progressColor}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-gray-600 text-xs">Saved</p>
                  <p className="font-bold text-blue-600">${goal.current_amount.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-gray-600 text-xs">Remaining</p>
                  <p className="font-bold text-red-600">${Math.max(0, amountRemaining).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-2 text-xs">
                <p className="text-gray-600">Target: ${goal.target_amount.toFixed(2)}</p>
                <p className="text-gray-600">{timeRemaining}</p>
              </div>

              {isMilestone && progress > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                  <p className="text-xs font-semibold text-yellow-700">Milestone Reached!</p>
                  <p className="text-xs text-yellow-600">{Math.floor(progress)}% Complete</p>
                </div>
              )}

              {progress >= 100 && goal.completed_at && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                  <p className="text-xs font-semibold text-green-700">Goal Achieved!</p>
                  <p className="text-xs text-green-600">Completed on {new Date(goal.completed_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
