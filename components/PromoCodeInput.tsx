'use client';

import { useState } from 'react';
import { Check, X, Loader } from 'lucide-react';

interface PromoInputProps {
  onPromoApplied?: (code: string, discount: number) => void;
  onPromoRemoved?: () => void;
  maxDiscount?: number;
}

export default function PromoCodeInput({ onPromoApplied, onPromoRemoved, maxDiscount }: PromoInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
    discount?: number;
  } | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setResult({ valid: false, message: 'Please enter a promo code' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await response.json();

      if (data.valid) {
        setResult({
          valid: true,
          message: `Promo applied! Discount: $${(data.discount || 0).toFixed(2)}`,
          discount: data.discount,
        });
        setAppliedCode(code.toUpperCase());
        onPromoApplied?.(code.toUpperCase(), data.discount || 0);
      } else {
        setResult({
          valid: false,
          message: data.error || 'Invalid promo code',
        });
      }
    } catch (error) {
      console.error('[Promo] Validation error:', error);
      setResult({
        valid: false,
        message: 'Error validating promo code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setResult(null);
    setAppliedCode(null);
    onPromoRemoved?.();
  };

  if (appliedCode) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">{appliedCode}</p>
              <p className="text-sm text-emerald-700">{result?.message}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleValidate} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center gap-2"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Apply'}
        </button>
      </form>

      {result && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            result.valid
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {result.valid ? (
            <Check className="w-5 h-5 text-emerald-600" />
          ) : (
            <X className="w-5 h-5 text-red-600" />
          )}
          <p
            className={`text-sm font-semibold ${
              result.valid ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {result.message}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-600">
        Have a promo code? Enter it above to get a discount on your subscription.
      </p>
    </div>
  );
}
