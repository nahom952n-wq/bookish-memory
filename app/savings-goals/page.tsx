'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, LogOut, Wallet } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SavingsGoalForm from '@/components/SavingsGoalForm';
import SavingsGoalsWidget from '@/components/SavingsGoalsWidget';
import { useLanguage } from '@/lib/i18n';
import { SavingsGoal, generateDefaultMilestones } from '@/lib/savingsGoalUtils';

export default function SavingsGoalsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

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

      // Check if premium
      const { data: features } = await supabase
        .from('user_features')
        .select('savings_goals')
        .eq('user_id', session.user.id)
        .single();

      if (!features?.savings_goals) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      setIsPremium(true);

      // Load savings goals
      const { data: goalsData, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('target_date');

      if (error) {
        console.error('[v0] Error fetching goals:', error);
      } else {
        setGoals(goalsData || []);
      }

      setLoading(false);
    };

    checkAuth();
  }, [supabase, router]);

  const handleCreateGoal = async (goal: any) => {
    if (!user) return;

    try {
      // Create the goal
      const { data: newGoal, error: goalError } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          ...goal,
          current_amount: 0,
        })
        .select()
        .single();

      if (goalError) throw goalError;

      // Create default milestones
      const milestones = generateDefaultMilestones(goal.target_amount);
      const milestonesToInsert = milestones.map((m) => ({
        goal_id: newGoal.id,
        user_id: user.id,
        milestone_percent: m.percent,
        milestone_amount: m.amount,
      }));

      const { error: milestonError } = await supabase.from('goal_milestones').insert(milestonesToInsert);

      if (milestonError) throw milestonError;

      // Refresh goals
      const { data: updatedGoals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('target_date');

      setGoals(updatedGoals || []);
    } catch (err) {
      console.error('[v0] Error creating goal:', err);
      throw err;
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;

    try {
      await supabase.from('savings_goals').update({ is_active: false }).eq('id', goalId);

      setGoals(goals.filter((g) => g.id !== goalId));
    } catch (err) {
      console.error('[v0] Error deleting goal:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">FiscalFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Unlock Savings Goals</h2>
            <p className="text-gray-600 mb-6">
              Upgrade to Premium to set and track unlimited savings goals with milestone celebrations and progress tracking.
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-semibold"
            >
              Upgrade to Premium
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-3 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const averageProgress = goals.length > 0 ? (totalSaved / Math.max(totalTarget, 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Wallet className="w-10 h-10" />
              Savings Goals
            </h1>
            <p className="text-blue-100 mt-1">Track your financial dreams</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Active Goals</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{goals.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Total Saved</p>
            <p className="text-4xl font-bold text-green-600 mt-2">${totalSaved.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Total Target</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">${totalTarget.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Overall Progress</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{averageProgress.toFixed(1)}%</p>
          </div>
        </div>

        {/* Create Goal Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Create New Goal
          </button>
        </div>

        {/* Goals Widget */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Savings Goals</h2>
          <SavingsGoalsWidget goals={goals} onDeleteGoal={handleDeleteGoal} />
        </div>
      </div>

      {/* Form Modal */}
      <SavingsGoalForm isOpen={showForm} onClose={() => setShowForm(false)} onCreateGoal={handleCreateGoal} />
    </div>
  );
}
