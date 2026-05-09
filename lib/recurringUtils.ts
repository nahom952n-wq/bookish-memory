// Utility functions for recurring transactions and bill reminders

export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category_id?: string;
  frequency: Frequency;
  start_date: string;
  end_date?: string;
  next_occurrence: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillReminder {
  id: string;
  user_id: string;
  recurring_transaction_id: string;
  due_date: string;
  reminder_days_before: number;
  status: 'pending' | 'reminded' | 'paid' | 'overdue';
  created_at: string;
}

// Calculate next occurrence date based on frequency
function calculateNextOccurrence(currentDate: Date, frequency: Frequency): Date {
  const date = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

// Format frequency for display
export function formatFrequency(frequency: Frequency): string {
  const frequencyMap = {
    daily: 'Every day',
    weekly: 'Every week',
    biweekly: 'Every 2 weeks',
    monthly: 'Every month',
    quarterly: 'Every 3 months',
    yearly: 'Every year',
  };
  return frequencyMap[frequency];
}

// Get upcoming bills (due in next N days)
export function getUpcomingBills(bills: BillReminder[], daysAhead: number = 7): BillReminder[] {
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + daysAhead);

  return bills.filter((bill) => {
    const dueDate = new Date(bill.due_date);
    return dueDate >= today && dueDate <= future && bill.status !== 'paid';
  });
}

// Check if bill is overdue
export function isBillOverdue(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}

// Calculate days until due
export function daysTilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Generate bill reminders for a recurring transaction
export function generateBillReminders(
  recurringTx: RecurringTransaction,
  monthsAhead: number = 3
): Array<{ due_date: string; reminder_days_before: number }> {
  const reminders = [];
  let currentDate = new Date(recurringTx.next_occurrence);
  const endDate = recurringTx.end_date ? new Date(recurringTx.end_date) : null;
  const futureLimit = new Date();
  futureLimit.setMonth(futureLimit.getMonth() + monthsAhead);

  while (currentDate <= futureLimit) {
    if (endDate && currentDate > endDate) break;

    reminders.push({
      due_date: currentDate.toISOString().split('T')[0],
      reminder_days_before: 3,
    });

    currentDate = calculateNextOccurrence(currentDate, recurringTx.frequency);
  }

  return reminders;
}
