'use client';

import { validatePassword, PasswordStrength, getPasswordStrengthColor } from '@/lib/passwordValidator';
import { useLanguage } from '@/lib/i18n';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const { t } = useLanguage();
  const strength = validatePassword(password);

  if (!password) return null;

  const strengthLabels = {
    weak: t('weak'),
    fair: t('fair'),
    good: t('good'),
    strong: t('strong'),
    veryStrong: t('veryStrong'),
  };

  const requirementLabels = {
    minLength: t('minChars'),
    hasUppercase: t('uppercase'),
    hasLowercase: t('lowercase'),
    hasNumber: t('number'),
    hasSpecialChar: t('specialChar'),
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">{t('passwordStrength')}</span>
          <span className={`font-semibold ${strength.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {strengthLabels[strength.level]}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(strength.level)}`}
            style={{ width: `${(strength.score + 1) * 20}%` }}
          ></div>
        </div>
      </div>

      {showRequirements && (
        <div className="space-y-1 mt-3">
          <p className="text-xs font-semibold text-gray-600">{t('passwordRequirements')}</p>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(strength.requirements).map(([key, met]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                {met ? (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={met ? 'text-green-700' : 'text-gray-600'}>
                  {requirementLabels[key as keyof typeof requirementLabels]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
