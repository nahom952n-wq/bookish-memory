'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Frequency, formatFrequency } from '@/lib/recurringUtils';
import CategorySelector from './CategorySelector';

interface RecurringTransactionFormProps {
  categories: any[];
  onSubmit: (data: {
    description: string;
    amount: number;
    category_id?: string;
    frequency: Frequency;
    start_date: string;
    end_date?: string;
  }) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function RecurringTransactionForm({
  categories,
  onSubmit,
  isLoading = false,
  onCancel,
}: RecurringTransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !startDate) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      description,
      amount: parseFloat(amount),
      category_id: categoryId || undefined,
      frequency,
      start_date: startDate,
      end_date: hasEndDate && endDate ? endDate : undefined,
    });

    setDescription('');
    setAmount('');
    setCategoryId('');
    setFrequency('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setHasEndDate(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Create Recurring Bill</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Rent, Netflix, Insurance"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <CategorySelector
            categories={categories}
            selectedId={categoryId}
            onSelect={setCategoryId}
            onCreateNew={async () => {}}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Frequency *
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!hasEndDate}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => setHasEndDate(!hasEndDate)}
              className={`px-3 py-2 rounded-lg font-semibold transition ${
                hasEndDate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {hasEndDate ? 'Set' : 'No End'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {isLoading ? 'Creating...' : 'Create Recurring Bill'}
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        Preview: {description || 'Bill'} - ${amount || '0.00'} {formatFrequency(frequency)}
      </div>
    </form>
  );
}
