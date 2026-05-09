'use client';

import { useState } from 'react';
import { ChevronRight, CheckCircle2, Wallet, Target, Clock } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BudgetMind',
    description: 'Take control of your finances with AI-powered insights and smart budgeting tools.',
    icon: Wallet,
    action: 'Get Started'
  },
  {
    id: 'import',
    title: 'Import Your Transactions',
    description: 'Connect your bank account or upload your transaction history to get started.',
    icon: ChevronRight,
    action: 'Skip for Now'
  },
  {
    id: 'budget',
    title: 'Set Your First Budget',
    description: 'Create budget goals for different spending categories to stay on track.',
    icon: Target,
    action: 'Create Budget'
  },
  {
    id: 'goals',
    title: 'Define Your Savings Goals',
    description: 'Set financial goals and watch your progress with visual milestones.',
    icon: Clock,
    action: 'Start Saving'
  }
];

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <step.icon className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">{step.title}</h2>
          <p className="text-gray-600 mb-8">{step.description}</p>

          {/* Steps Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx <= currentStep ? 'bg-blue-600 w-2' : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {step.action}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
