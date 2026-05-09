'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreateBudget: (categoryId: string, limit: number) => void;
  isLoading?: boolean;
}

export default function BudgetModal({
  isOpen,
  onClose,
  categories,
  onCreateBudget,
  isLoading,
}: BudgetModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && monthlyLimit) {
      onCreateBudget(selectedCategory, parseFloat(monthlyLimit));
      setSelectedCategory('');
      setMonthlyLimit('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Set Budget Goal</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Monthly Budget Limit
            </label>
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-700 mr-2">$</span>
              <input
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              You&apos;ll receive alerts at 75%, 90%, and when you exceed this limit.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedCategory || !monthlyLimit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {isLoading ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
