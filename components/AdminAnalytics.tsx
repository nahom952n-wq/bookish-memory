'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface AdminAnalyticsProps {
  userData?: any[];
  conversionData?: any[];
}

// Sample data for demonstration
const sampleUserGrowth = [
  { date: 'Week 1', users: 100, premium: 20 },
  { date: 'Week 2', users: 150, premium: 35 },
  { date: 'Week 3', users: 220, premium: 55 },
  { date: 'Week 4', users: 310, premium: 85 },
  { date: 'Week 5', users: 420, premium: 130 },
  { date: 'Week 6', users: 560, premium: 185 }
];

const sampleFunnel = [
  { stage: 'Landing Page', count: 1000 },
  { stage: 'Sign Up', count: 350 },
  { stage: 'First Transaction', count: 280 },
  { stage: 'Premium', count: 85 }
];

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AdminAnalytics({ userData, conversionData }: AdminAnalyticsProps) {
  const metrics = [
    {
      label: 'Total Users',
      value: '2,840',
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Premium Users',
      value: '485',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      label: 'MRR',
      value: '$2,415',
      change: '+15.3%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Active Today',
      value: '312',
      change: '+5.1%',
      icon: Activity,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{metric.value}</p>
                  <p className="text-emerald-600 text-sm font-semibold mt-1">{metric.change}</p>
                </div>
                <Icon className={`w-12 h-12 ${metric.color} opacity-20`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">User Growth & Premium Adoption</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampleUserGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            <Line type="monotone" dataKey="premium" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleFunnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="stage" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Conversion Rates</h3>
          <div className="space-y-4">
            {[
              { stage: 'Landing → Sign Up', rate: '35%' },
              { stage: 'Sign Up → First Tx', rate: '80%' },
              { stage: 'First Tx → Premium', rate: '30%' },
              { stage: 'Overall Conversion', rate: '8.5%' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-semibold">{item.stage}</span>
                  <span className="text-gray-900 font-bold">{item.rate}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: item.rate }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">User Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Daily Active Users', value: '312', trend: '+2.1%' },
            { label: 'Avg Session Length', value: '12m 34s', trend: '+0.8m' },
            { label: 'Retention (Day 7)', value: '68%', trend: '+4.2%' }
          ].map((item, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">{item.label}</p>
              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
              <p className="text-emerald-600 text-sm font-semibold mt-1">{item.trend}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">Key Metrics to Monitor</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Focus on landing page conversion rate - currently at 35%</li>
          <li>• Premium conversion from free users is strong at 30%</li>
          <li>• Day 7 retention of 68% exceeds industry average</li>
          <li>• Prioritize feature adoption among free tier users</li>
          <li>• Continue optimizing onboarding flow for better Day 1 engagement</li>
        </ul>
      </div>
    </div>
  );
}
