'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/subscription-plans';
import { createCheckoutSession } from '@/app/actions/stripe';
import { useLanguage } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Check, Wallet } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    return user;
  };

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      const loggedInUser = await checkUser();
      if (!loggedInUser) {
        router.push('/auth/login?redirect=/pricing');
        return;
      }

      if (planId === 'free') {
        router.push('/dashboard');
        return;
      }

      const result = await createCheckoutSession(planId);
      if (result?.sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${result.sessionId}`;
      }
    } catch (err) {
      console.error('[v0] Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const premiumMonthly = SUBSCRIPTION_PLANS.find((p) => p.id === 'price_premium_monthly');
  const premiumYearly = SUBSCRIPTION_PLANS.find((p) => p.id === 'price_premium_yearly');
  const proMonthly = SUBSCRIPTION_PLANS.find((p) => p.id === 'price_pro_monthly');
  const proYearly = SUBSCRIPTION_PLANS.find((p) => p.id === 'price_pro_yearly');
  const freePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'free');

  const plans = [
    freePlan,
    premiumMonthly,
    premiumYearly,
    proMonthly,
    proYearly,
  ].filter(Boolean);

  const featuresList = [
    { key: 'documentOcrLimit', label: 'Receipt OCR Scans' },
    { key: 'advancedCharts', label: 'Advanced Charts' },
    { key: 'dataExport', label: 'Data Export (CSV/PDF)' },
    { key: 'recurringTransactions', label: 'Recurring Transactions' },
    { key: 'budgetGoals', label: 'Budget Goals & Alerts' },
    { key: 'savingsGoals', label: 'Savings Goals' },
    { key: 'billReminders', label: 'Bill Reminders' },
    { key: 'aiInsights', label: 'AI Financial Insights' },
    { key: 'multiCurrency', label: 'Multi-Currency Support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-blue-600" />
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-800">FiscalFlow</span>
        </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-semibold"
          >
            Dashboard
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your financial goals
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan!.id}
              className={`relative rounded-xl transition-all ${
                plan!.id.includes('pro') && plan!.interval === 'month'
                  ? 'ring-2 ring-blue-500 shadow-2xl scale-105'
                  : 'shadow-lg hover:shadow-xl'
              } ${plan!.priceInCents === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              {plan!.id.includes('pro') && plan!.interval === 'month' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan!.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan!.description}</p>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan!.priceInCents === 0 ? 'Free' : `$${(plan!.priceInCents / 100).toFixed(0)}`}
                  </div>
                  {plan!.priceInCents > 0 && (
                    <div className="text-gray-600 text-sm">
                      per {plan!.interval === 'month' ? 'month' : 'year'}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleCheckout(plan!.id)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-lg font-semibold transition mb-6 ${
                    plan!.id.includes('pro') && plan!.interval === 'month'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : plan!.priceInCents === 0
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  } ${loading === plan!.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === plan!.id ? 'Loading...' : plan!.priceInCents === 0 ? 'Get Started' : 'Subscribe'}
                </button>

                <div className="space-y-3 border-t border-gray-200 pt-6">
                  {featuresList.map((feature) => {
                    const hasFeature = (plan!.features as any)[feature.key];
                    const displayValue =
                      feature.key === 'documentOcrLimit'
                        ? `${hasFeature === true ? '∞' : hasFeature || 0} scans`
                        : hasFeature
                        ? '✓'
                        : '✗';

                    return (
                      <div
                        key={feature.key}
                        className={`text-sm flex items-center gap-2 ${
                          hasFeature ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {hasFeature ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 text-gray-300 flex-shrink-0">−</div>
                        )}
                        <span>{feature.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and digital payment methods through Stripe.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! All paid plans include a 7-day free trial. Cancel anytime if it's not for you.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600">
                Absolutely. You can cancel anytime from your account settings. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
