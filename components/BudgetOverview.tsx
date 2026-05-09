'use client';

import { AlertCircle, TrendingUp } from 'lucide-react';

interface BudgetItem {
  id: string;
  category_name: string;
  icon: string;
  color: string;
  monthly_limit: number;
  spent: number;
}

interface BudgetOverviewProps {
  budgets: BudgetItem[];
  onEditBudget: (budgetId: string) => void;
  isPremium: boolean;
}

export default function BudgetOverview({ budgets, onEditBudget, isPremium }: BudgetOverviewProps) {
  if (!isPremium) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-700 mb-3">
            Unlock budget goals and spending alerts with Premium
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
        <p className="text-gray-600">No budgets set yet. Create one to start tracking spending limits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentSpent = (budget.spent / budget.monthly_limit) * 100;
        const isWarning = percentSpent >= 75;
        const isExceeded = percentSpent >= 100;

        return (
          <div
            key={budget.id}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{budget.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{budget.category_name}</p>
                  <p className="text-sm text-gray-600">
                    ${budget.spent.toFixed(2)} of ${budget.monthly_limit.toFixed(2)}
                  </p>
                </div>
              </div>
              {isExceeded && <AlertCircle className="w-5 h-5 text-red-600" />}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isExceeded ? 'bg-red-600' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentSpent, 100)}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  isExceeded ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'
                }`}
              >
                {percentSpent.toFixed(0)}%
              </span>
            </div>

            {isExceeded && (
              <p className="text-xs text-red-600 mt-2 font-semibold">Budget exceeded!</p>
            )}
            {isWarning && !isExceeded && (
              <p className="text-xs text-yellow-600 mt-2 font-semibold">Approaching limit</p>
            )}

            <button
              onClick={() => onEditBudget(budget.id)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3"
            >
              Edit Budget
            </button>
          </div>
        );
      })}
    </div>
  );
}
