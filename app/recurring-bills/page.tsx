'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RecurringTransactionForm from '@/components/RecurringTransactionForm';
import RecurringTransactionsList from '@/components/RecurringTransactionsList';
import BillRemindersWidget from '@/components/BillRemindersWidget';
import { useLanguage } from '@/lib/i18n';
import { RecurringTransaction, BillReminder, calculateNextOccurrence, generateBillReminders } from '@/lib/recurringUtils';

interface Category {
  id: string;
  name: string;
}

export default function RecurringBillsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [billReminders, setBillReminders] = useState<BillReminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check auth and load data
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      setUser(session.user);

      // Check premium status
      const { data: features } = await supabase
        .from('user_features')
        .select('recurring_transactions')
        .eq('user_id', session.user.id)
        .single();

      if (!features?.recurring_transactions) {
        router.push('/pricing');
        return;
      }

      setIsPremium(true);

      // Load categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('name');

      setCategories(catData || []);

      // Load recurring transactions
      const { data: recurringData } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setRecurringTransactions(recurringData || []);

      // Load bill reminders for next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: remindersData } = await supabase
        .from('bill_reminders')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      setBillReminders(remindersData || []);

      setLoading(false);
    };

    checkAuth();
  }, [supabase, router]);

  const handleCreateRecurring = async (data: any) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Create recurring transaction
      const { data: newTx, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate initial bill reminders
      const reminders = generateBillReminders(newTx);
      for (const reminder of reminders) {
        await supabase.from('bill_reminders').insert({
          user_id: user.id,
          recurring_transaction_id: newTx.id,
          ...reminder,
        });
      }

      // Refresh data
      const { data: updatedRecurring } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setRecurringTransactions(updatedRecurring || []);

      // Reload reminders
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: remindersData } = await supabase
        .from('bill_reminders')
        .select('*')
        .eq('user_id', user.id)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      setBillReminders(remindersData || []);

      setShowForm(false);
    } catch (err) {
      console.error('[v0] Error creating recurring transaction:', err);
      alert('Failed to create recurring transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      await supabase.from('recurring_transactions').delete().eq('id', id);

      setRecurringTransactions(recurringTransactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error('[v0] Error deleting recurring transaction:', err);
      alert('Failed to delete recurring transaction');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    if (!user) return;

    try {
      await supabase
        .from('recurring_transactions')
        .update({ is_active: isActive })
        .eq('id', id);

      setRecurringTransactions(
        recurringTransactions.map((t) =>
          t.id === id ? { ...t, is_active: isActive } : t
        )
      );
    } catch (err) {
      console.error('[v0] Error updating recurring transaction:', err);
    }
  };

  const handleMarkBillPaid = async (billId: string) => {
    try {
      await supabase.from('bill_reminders').update({ status: 'paid' }).eq('id', billId);

      setBillReminders(
        billReminders.map((b) =>
          b.id === billId ? { ...b, status: 'paid' } : b
        )
      );
    } catch (err) {
      console.error('[v0] Error marking bill as paid:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Premium Feature</h1>
          <p className="text-gray-600 mb-6">
            Upgrade to Premium to access recurring bills and bill reminders.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Recurring Bills</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upcoming Bills Widget */}
        <div className="mb-8">
          <BillRemindersWidget
            bills={billReminders}
            recurringTransactions={recurringTransactions}
            onMarkPaid={handleMarkBillPaid}
            isPremium={isPremium}
          />
        </div>

        {/* Create Form */}
        {showForm ? (
          <RecurringTransactionForm
            categories={categories}
            onSubmit={handleCreateRecurring}
            isLoading={isSubmitting}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Recurring Bill
          </button>
        )}

        {/* Recurring Transactions List */}
        <RecurringTransactionsList
          transactions={recurringTransactions}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
