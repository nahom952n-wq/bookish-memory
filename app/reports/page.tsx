'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Download, FileText, TrendingUp, Calendar } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n';
import { generateCSVReport, generatePDFReport, generateTaxReport } from '@/lib/reportGenerator';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Map<string, string>>(new Map());
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPremium, setIsPremium] = useState(false);
  const [generating, setGenerating] = useState(false);

  function getMonthStart(): string {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      setUser(session.user);

      // Check premium status
      const { data: features } = await supabase
        .from('user_features')
        .select('data_export')
        .eq('user_id', session.user.id)
        .single();

      setIsPremium(features?.data_export || false);

      if (!features?.data_export) {
        router.push('/dashboard');
        return;
      }

      // Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', session.user.id);

      const categoryMap = new Map();
      catData?.forEach(cat => categoryMap.set(cat.id, cat.name));

      setTransactions(txData || []);
      setCategories(categoryMap);
      setLoading(false);
    };

    checkAuth();
  }, [supabase, router, startDate, endDate]);

  const enrichTransactions = () => {
    return transactions.map(t => ({
      ...t,
      category_name: t.category_id ? categories.get(t.category_id) : undefined
    }));
  };

  const calculateSummary = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses };
  };

  const handleExportCSV = async () => {
    setGenerating(true);
    try {
      generateCSVReport(
        enrichTransactions(),
        `financial-report-${startDate}-to-${endDate}.csv`
      );
    } catch (err) {
      console.error('[v0] CSV export error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    setGenerating(true);
    try {
      generatePDFReport(
        enrichTransactions(),
        calculateSummary(),
        { startDate, endDate },
        `financial-report-${startDate}-to-${endDate}.pdf`
      );
    } catch (err) {
      console.error('[v0] PDF export error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportTax = async () => {
    setGenerating(true);
    try {
      const year = parseInt(startDate.split('-')[0]);
      generateTaxReport(enrichTransactions(), year);
    } catch (err) {
      console.error('[v0] Tax export error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const summary = calculateSummary();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Financial Reports</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Report Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate(getMonthStart());
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Income</p>
            <p className="text-3xl font-bold text-green-600">${summary.income.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">${summary.expenses.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Net Balance</p>
            <p className={`text-3xl font-bold ${(summary.income - summary.expenses) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ${(summary.income - summary.expenses).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Download className="w-6 h-6 text-blue-600" />
            Export Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleExportCSV}
              disabled={generating}
              className="px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FileText className="w-5 h-5" />
              Export as CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={generating}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FileText className="w-5 h-5" />
              Export as PDF
            </button>
            <button
              onClick={handleExportTax}
              disabled={generating}
              className="px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <TrendingUp className="w-5 h-5" />
              Tax Report
            </button>
          </div>
        </div>

        {/* Transactions Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Transactions ({transactions.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((t, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{t.transaction_date}</td>
                    <td className="py-3 px-4 text-gray-700">{t.description}</td>
                    <td className="py-3 px-4 text-gray-700">{categories.get(t.category_id || '') || 'Uncategorized'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
