'use client';

import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react';

interface InsightProps {
  type: 'positive' | 'negative' | 'warning' | 'insight';
  title: string;
  message: string;
  metric?: string;
  change?: number;
}

export default function InsightsCard({ type, title, message, metric, change }: InsightProps) {
  const getIcon = () => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'negative':
        return <TrendingDown className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-400" />;
      case 'insight':
        return <Lightbulb className="w-6 h-6 text-blue-400" />;
    }
  };

  const getBg = () => {
    switch (type) {
      case 'positive':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'negative':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'insight':
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className={`${getBg()} border rounded-xl p-4`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <p className="text-slate-300 text-sm mt-1">{message}</p>
          {metric && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-white font-bold text-lg">{metric}</span>
              {change && (
                <span className={`text-sm font-semibold ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
