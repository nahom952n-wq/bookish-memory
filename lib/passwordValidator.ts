export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'good' | 'strong' | 'veryStrong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  isValid: boolean;
}

export function validatePassword(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;

  let score = 0;
  let level: 'weak' | 'fair' | 'good' | 'strong' | 'veryStrong' = 'weak';

  if (metRequirements === 1) {
    score = 0;
    level = 'weak';
  } else if (metRequirements === 2) {
    score = 1;
    level = 'fair';
  } else if (metRequirements === 3) {
    score = 2;
    level = 'good';
  } else if (metRequirements === 4) {
    score = 3;
    level = 'strong';
  } else if (metRequirements === 5) {
    score = 4;
    level = 'veryStrong';
  }

  const isValid = Object.values(requirements).every(Boolean);

  return {
    score,
    level,
    requirements,
    isValid,
  };
}

export function getPasswordStrengthColor(level: string): string {
  switch (level) {
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-orange-500';
    case 'good':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-blue-500';
    case 'veryStrong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
}
