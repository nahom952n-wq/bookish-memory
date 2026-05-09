'use client';

import { useEffect, useState } from 'react';
import { Coins, TrendingUp, History } from 'lucide-react';

interface UserCredits {
  balance: number;
  lastUpdated: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'referral' | 'promo' | 'payment' | 'refund' | 'purchase';
  description: string;
  created_at: string;
}

export default function CreditsDisplay() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('[Credits] Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCreditType = (type: string) => {
    switch (type) {
      case 'referral':
        return { label: 'Referral Bonus', icon: '🎁', color: 'text-emerald-600' };
      case 'promo':
        return { label: 'Promo Code', icon: '🎟️', color: 'text-blue-600' };
      case 'refund':
        return { label: 'Refund', icon: '↩️', color: 'text-amber-600' };
      case 'purchase':
        return { label: 'Subscription', icon: '💳', color: 'text-red-600' };
      case 'payment':
        return { label: 'Payment', icon: '💰', color: 'text-green-600' };
      default:
        return { label: type, icon: '•', color: 'text-gray-600' };
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Credits Balance Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold mb-2">Account Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-emerald-600">
                ${credits?.balance?.toFixed(2) || '0.00'}
              </span>
              <span className="text-gray-600">in credits</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {credits?.lastUpdated ? `Updated ${new Date(credits.lastUpdated).toLocaleDateString()}` : 'No transactions'}
            </p>
          </div>
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <Coins className="w-10 h-10 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          How to Earn Credits
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-xl">🎁</span>
            <div>
              <p className="font-semibold text-gray-800">Refer Friends</p>
              <p className="text-sm text-gray-600">Get 30 days free when a friend signs up with your link</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">🎟️</span>
            <div>
              <p className="font-semibold text-gray-800">Promo Codes</p>
              <p className="text-sm text-gray-600">Use promotional codes for instant credit bonuses</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">📨</span>
            <div>
              <p className="font-semibold text-gray-800">Welcome Bonus</p>
              <p className="text-sm text-gray-600">New users get 7 days free when they sign up</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Transaction History
        </h3>

        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const creditType = getCreditType(tx.type);
              const isCredit = tx.amount > 0;

              return (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl">{creditType.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{creditType.label}</p>
                      <p className="text-sm text-gray-600">{tx.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isCredit ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Credit Usage Info */}
      {credits && credits.balance > 0 && (
        <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
          <h3 className="font-bold text-gray-800 mb-2">Use Your Credits</h3>
          <p className="text-gray-700 mb-4">
            You have <span className="font-bold text-emerald-600">${credits.balance.toFixed(2)}</span> available. Use them towards any Premium or Pro subscription.
          </p>
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition">
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}
