'use client';

import { Trash2, Edit, Pause, Play } from 'lucide-react';
import { RecurringTransaction, formatFrequency } from '@/lib/recurringUtils';

interface RecurringTransactionsListProps {
  transactions: RecurringTransaction[];
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export default function RecurringTransactionsList({
  transactions,
  onDelete,
  onToggleActive,
  isLoading = false,
}: RecurringTransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-600 mb-4">No recurring transactions yet.</p>
        <p className="text-sm text-gray-500">Create one to automate your bill payments.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Frequency</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Next Due</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr
                key={tx.id}
                className={`border-b transition hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800">{tx.description}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-800">${tx.amount.toFixed(2)}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700">{formatFrequency(tx.frequency)}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700">
                    {new Date(tx.next_occurrence).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      tx.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {tx.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {onToggleActive && (
                      <button
                        onClick={() => onToggleActive(tx.id, !tx.is_active)}
                        disabled={isLoading}
                        className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                        title={tx.is_active ? 'Pause' : 'Resume'}
                      >
                        {tx.is_active ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${tx.description}"? This cannot be undone.`
                            )
                          ) {
                            onDelete(tx.id);
                          }
                        }}
                        disabled={isLoading}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
