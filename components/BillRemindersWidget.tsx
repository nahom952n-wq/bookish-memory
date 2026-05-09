'use client';

import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { BillReminder } from '@/lib/recurringUtils';
import { daysTilDue, isBillOverdue } from '@/lib/recurringUtils';

interface BillRemindersWidgetProps {
  bills: BillReminder[];
  recurringTransactions: any[];
  onMarkPaid?: (billId: string) => void;
  isPremium?: boolean;
}

export default function BillRemindersWidget({
  bills,
  recurringTransactions,
  onMarkPaid,
  isPremium = false,
}: BillRemindersWidgetProps) {
  const upcomingBills = bills
    .filter((b) => b.status !== 'paid')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" />
            Bill Reminders
          </h3>
          <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            Premium Feature
          </span>
        </div>
        <p className="text-gray-600 mb-4">
          Upgrade to Premium to get automatic bill reminders and never miss a payment again.
        </p>
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  if (upcomingBills.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-bold text-gray-800">Bill Reminders</h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">All caught up! No upcoming bills.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          Upcoming Bills ({upcomingBills.length})
        </h3>
      </div>

      <div className="space-y-3">
        {upcomingBills.map((bill) => {
          const recurring = recurringTransactions.find((r) => r.id === bill.recurring_transaction_id);
          const daysLeft = daysTilDue(bill.due_date);
          const isOverdue = isBillOverdue(bill.due_date);

          return (
            <div
              key={bill.id}
              className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition ${
                isOverdue
                  ? 'bg-red-50 border-red-500'
                  : daysLeft <= 3
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{recurring?.description}</p>
                <p className="text-sm text-gray-600">
                  Due: {new Date(bill.due_date).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right mr-4">
                <p className="font-bold text-gray-800">${recurring?.amount.toFixed(2)}</p>
                <p className={`text-sm font-semibold ${
                  isOverdue
                    ? 'text-red-600'
                    : daysLeft <= 3
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                }`}>
                  {isOverdue ? 'OVERDUE' : `${daysLeft} days`}
                </p>
              </div>

              {onMarkPaid && (
                <button
                  onClick={() => onMarkPaid(bill.id)}
                  className="ml-2 p-2 hover:bg-white rounded-lg transition"
                  title="Mark as paid"
                >
                  <CheckCircle className={`w-6 h-6 ${
                    bill.status === 'paid' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
