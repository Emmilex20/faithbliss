import React from 'react';
import { motion } from 'framer-motion';
import type { OnboardingData } from './types';
import SelectableCard from './SelectableCard';

interface RelationshipGoalsSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
  showValidationErrors?: boolean;
}

const goalsOptions = [
  { value: 'MARRIAGE_MINDED', label: 'Marriage Minded', emoji: '💍' },
  { value: 'RELATIONSHIP', label: 'Relationship', emoji: '❤️' },
  { value: 'FRIENDSHIP', label: 'Friendship', emoji: '🤝' },
];

const RelationshipGoalsSlide: React.FC<RelationshipGoalsSlideProps> = ({
  onboardingData,
  setOnboardingData,
  isVisible,
  showValidationErrors = false,
}) => {
  if (!isVisible) return null;

  const currentGoals = Array.isArray(onboardingData.relationshipGoals) ? onboardingData.relationshipGoals : [];
  const hasGoal = currentGoals.length > 0;

  const handleSelect = (value: string) => {
    setOnboardingData((prev) => {
      const existing = Array.isArray(prev.relationshipGoals) ? prev.relationshipGoals : [];
      const nextGoals = existing.includes(value)
        ? existing.filter((goal) => goal !== value)
        : [...existing, value];

      return {
        ...prev,
        relationshipGoals: nextGoals as OnboardingData['relationshipGoals'],
      };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">What are your intentions? 💖</h2>
        <p className="text-gray-400">It&apos;s great to be on the same page.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">
          What are you looking for? <span className="text-red-400">*</span>
        </h3>
        <div
          className={`grid grid-cols-1 gap-4 rounded-2xl p-2 sm:grid-cols-3 ${
            showValidationErrors && !hasGoal ? 'border border-red-400/40 bg-red-500/5' : ''
          }`}
        >
          {goalsOptions.map((option) => (
            <SelectableCard
              key={option.value}
              label={option.label}
              emoji={option.emoji}
              isSelected={currentGoals.includes(option.value as OnboardingData['relationshipGoals'][number])}
              onClick={() => handleSelect(option.value)}
            />
          ))}
        </div>
        {showValidationErrors && !hasGoal ? (
          <p className="text-sm text-red-400">Select at least one relationship goal before continuing.</p>
        ) : null}
      </div>
    </motion.div>
  );
};

export default RelationshipGoalsSlide;
