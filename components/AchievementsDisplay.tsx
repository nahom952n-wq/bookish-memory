'use client';

import { Trophy, Lock } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
  earned?: boolean;
}

interface AchievementsDisplayProps {
  achievements: Achievement[];
  allAchievements: Achievement[];
}

export default function AchievementsDisplay({ achievements, allAchievements }: AchievementsDisplayProps) {
  const earned = new Set(achievements.map(a => a.id));
  const progress = Math.round((achievements.length / allAchievements.length) * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-amber-500" />
        <h3 className="text-2xl font-bold text-gray-800">Achievements</h3>
        <span className="ml-auto text-lg font-bold text-blue-600">{achievements.length}/{allAchievements.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allAchievements.map((achievement) => {
          const isEarned = earned.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg text-center transition transform hover:scale-105 ${
                isEarned
                  ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300'
                  : 'bg-gray-100 border-2 border-gray-300 opacity-60'
              }`}
            >
              <div className="text-4xl mb-2 flex justify-center">
                {isEarned ? achievement.icon : <Lock className="w-8 h-8 text-gray-400" />}
              </div>
              <h4 className="font-bold text-sm text-gray-800 line-clamp-2">{achievement.name}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{achievement.description}</p>
            </div>
          );
        })}
      </div>

      {/* Streak Display */}
      <div className="mt-8 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
        <p className="text-sm font-semibold text-gray-700">Keep your streak going! Log in daily to earn rewards.</p>
      </div>
    </div>
  );
}
