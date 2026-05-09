'use client';

import { Share2, Users, Gift, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ReferralCardProps {
  referralCode: string;
  referralCount: number;
  referralRewards: number;
}

export default function ReferralCard({ referralCode, referralCount, referralRewards }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/sign-up?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-8 border-2 border-purple-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Refer and Earn
          </h3>
          <p className="text-gray-600 mt-1">Share BudgetMind with friends and get rewarded</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">People Referred</p>
          <p className="text-3xl font-bold text-purple-600">{referralCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Rewards Earned</p>
          <p className="text-3xl font-bold text-green-600">${referralRewards}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6">
        <label className="text-sm font-semibold text-gray-700 block mb-2">Your Referral Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 truncate"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h4 className="font-bold text-gray-800">How it works:</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <Share2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Share your referral link with friends</span>
          </li>
          <li className="flex items-start gap-3">
            <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">They sign up with your link</span>
          </li>
          <li className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">You both get 30 days free Premium</span>
          </li>
        </ul>
      </div>

      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
        <Share2 className="w-5 h-5" />
        Share with Friends
      </button>
    </div>
  );
}
