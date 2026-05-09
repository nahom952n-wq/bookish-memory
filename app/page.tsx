'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, CheckCircle, TrendingUp, Zap, Shield, BarChart3, ArrowRight, Star } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check auth status with timeout
    const checkAuth = async () => {
      try {
        // Only try to check auth if we can import supabase
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('[v0] Error checking session:', error);
        // Continue showing landing page even if auth check fails
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 backdrop-blur-xl bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FiscalFlow</span>
          </div>
          <div className="flex gap-2 md:gap-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-slate-300 hover:text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/auth/sign-up')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-lg hover:shadow-emerald-500/50"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
                <Star className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">Join 10,000+ users already in control</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance leading-tight">
                Your finances,{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                  simplified
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 text-pretty leading-relaxed max-w-xl">
                Take control of your money with intelligent budgeting, automated bill tracking, and AI-powered insights that help you build wealth faster.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/auth/sign-up')}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition shadow-2xl hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
                >
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-slate-600 hover:border-slate-400 text-white font-bold py-4 px-8 rounded-xl transition"
                >
                  See Features
                </button>
              </div>

              <div className="flex gap-8 mt-12">
                <div>
                  <p className="text-3xl font-bold text-emerald-400">$0</p>
                  <p className="text-slate-400">Forever free to start</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400">5 min</p>
                  <p className="text-slate-400">Setup in minutes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400">100%</p>
                  <p className="text-slate-400">Your data is secure</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl">
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Total Balance</p>
                      <p className="text-4xl font-bold text-white mt-2">$12,450</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-3 mt-8 pt-6 border-t border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Income</span>
                      <span className="text-emerald-400 font-bold">+$4,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Expenses</span>
                      <span className="text-red-400 font-bold">-$1,850</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-700">
                      <span className="text-slate-300 font-semibold">Savings</span>
                      <span className="text-emerald-400 font-bold text-lg">+$2,350</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-800/50 border-y border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-5xl font-bold text-white mb-4">Powerful Features Built For You</h2>
            <p className="text-xl text-slate-400">Everything you need to master your finances</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Smart Categorization',
                description: 'Automatically categorize spending and get AI insights on your habits'
              },
              {
                icon: BarChart3,
                title: 'Financial Insights',
                description: 'Track trends, identify patterns, and get personalized recommendations'
              },
              {
                icon: Shield,
                title: 'Bank-Level Security',
                description: 'Your data is encrypted and protected with enterprise-grade security'
              },
              {
                icon: CheckCircle,
                title: 'Budget Goals',
                description: 'Set monthly limits and get alerts before you overspend'
              },
              {
                icon: TrendingUp,
                title: 'Recurring Bills',
                description: 'Never miss a bill payment with automated reminders and tracking'
              },
              {
                icon: Wallet,
                title: 'Savings Goals',
                description: 'Build wealth with visual progress tracking and milestone celebrations'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-slate-700/40 hover:bg-slate-700/80 border border-slate-600 hover:border-emerald-500/50 rounded-2xl p-8 transition">
                <feature.icon className="w-12 h-12 text-emerald-400 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-400">Choose the plan that works for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: ['Basic transactions', 'Categories', 'Monthly reports', 'Email support'],
                cta: 'Get Started',
                highlight: false
              },
              {
                name: 'Premium',
                price: '$4.99',
                period: '/month',
                features: ['Everything in Free', 'Budget goals', 'Recurring bills', 'AI insights', 'Priority support', 'Savings goals'],
                cta: 'Start Free Trial',
                highlight: true
              },
              {
                name: 'Pro',
                price: '$9.99',
                period: '/month',
                features: ['Everything in Premium', 'Advanced analytics', 'Tax reports', 'Custom exports', 'API access', 'Phone support'],
                cta: 'Start Free Trial',
                highlight: false
              }
            ].map((plan, idx) => (
              <div 
                key={idx}
                className={`rounded-2xl border transition ${
                  plan.highlight 
                    ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 shadow-2xl shadow-emerald-500/20 md:scale-105'
                    : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-2">{plan.period}</span>
                  </div>
                  <button
                    onClick={() => router.push('/auth/sign-up')}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition mb-8 ${
                      plan.highlight
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {plan.cta}
                  </button>
                  <ul className="space-y-4">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-emerald-900/20 to-emerald-900/10 border-y border-emerald-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to take control?</h2>
          <p className="text-xl text-slate-300 mb-8">Join thousands of people who are already managing their money smarter</p>
          <button
            onClick={() => router.push('/auth/sign-up')}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition shadow-2xl hover:shadow-emerald-500/50"
          >
            Start Your Free Trial Today
          </button>
          <p className="text-slate-400 text-sm mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 FiscalFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
