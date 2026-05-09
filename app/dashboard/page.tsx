'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Wallet, Plus } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [balance] = useState(2450.75);
  const [transactions] = useState([
    { id: '1', description: 'Grocery Shopping', amount: 125.50, type: 'expense', date: '2025-05-08' },
    { id: '2', description: 'Salary Deposit', amount: 3500.00, type: 'income', date: '2025-05-07' },
    { id: '3', description: 'Electricity Bill', amount: 85.00, type: 'expense', date: '2025-05-06' },
    { id: '4', description: 'Restaurant', amount: 45.00, type: 'expense', date: '2025-05-05' },
  ]);

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">FiscalFlow Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <p className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Current Balance</p>
            <p className="text-4xl font-bold text-green-600">${balance.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Last updated: Today</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <p className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">This Month Spending</p>
            <p className="text-4xl font-bold text-red-600">$255.50</p>
            <p className="text-xs text-gray-500 mt-2">4 transactions</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <p className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Income</p>
            <p className="text-4xl font-bold text-blue-600">$3,500.00</p>
            <p className="text-xs text-gray-500 mt-2">Monthly salary</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left group">
            <Plus className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Add Transaction</h3>
            <p className="text-sm text-gray-600">Track income or expenses</p>
          </button>
          <button className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left group">
            <Wallet className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">View Budgets</h3>
            <p className="text-sm text-gray-600">Manage your spending limits</p>
          </button>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{t.description}</p>
                  <p className="text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">Welcome to FiscalFlow</h3>
          <p className="text-blue-800 text-sm">
            Your personal finance dashboard is ready. Start by adding your first transaction or setting up a budget to track your spending habits.
          </p>
        </div>
      </main>
    </div>
  );
}
