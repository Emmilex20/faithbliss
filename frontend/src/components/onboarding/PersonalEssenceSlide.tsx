import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircleHeart, HeartHandshake, GraduationCap } from 'lucide-react';
import type { OnboardingData } from './types';

interface PersonalEssenceSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
  showValidationErrors?: boolean;
}

const communicationOptions = ['Big time texter', 'Phone caller', 'Video chatter', 'Bad texter', 'Better in person'];
const loveStyleOptions = ['Thoughtful gestures', 'Presents', 'Touch', 'Compliments', 'Time together'];
const educationLevelOptions = ['Bachelors', 'In College', 'High School', 'PhD', 'In Grad School', 'Masters', 'Trade School'];

const MultiSelectChips = ({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected?: string[];
  onSelect: (value: string) => void;
}) => (
  <div className="flex flex-wrap gap-2.5">
    {options.map((option) => {
      const isSelected = selected?.includes(option);
      return (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
            isSelected
              ? 'border-pink-400 bg-pink-500/15 text-white'
              : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-400 hover:text-white'
          }`}
        >
          {option}
        </button>
      );
    })}
  </div>
);

const PersonalEssenceSlide: React.FC<PersonalEssenceSlideProps> = ({
  onboardingData,
  setOnboardingData,
  isVisible,
  showValidationErrors = false,
}) => {
  if (!isVisible) return null;
  const hasCommunicationStyle = Array.isArray(onboardingData.communicationStyle) && onboardingData.communicationStyle.length > 0;
  const hasLoveStyle = Array.isArray(onboardingData.loveStyle) && onboardingData.loveStyle.length > 0;
  const hasEducationLevel = Boolean(onboardingData.educationLevel?.trim());

  const toggleMulti = (field: 'communicationStyle' | 'loveStyle', value: string) => {
    setOnboardingData((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter((item) => item !== value) : [...current, value],
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
      <div className="space-y-3">
        <h2 className="text-4xl font-bold leading-tight text-white">What else makes you, you?</h2>
        <p className="text-lg text-slate-300">Don&apos;t hold back. Authenticity attracts authenticity.</p>
      </div>

      <div className="space-y-4 border-b border-white/10 pb-7">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <MessageCircleHeart className="h-5 w-5 text-pink-300" />
          What is your communication style? <span className="text-red-400">*</span>
        </h3>
        <div className={showValidationErrors && !hasCommunicationStyle ? 'rounded-2xl border border-red-400/40 bg-red-500/5 p-3' : ''}>
          <MultiSelectChips
            options={communicationOptions}
            selected={onboardingData.communicationStyle}
            onSelect={(value) => toggleMulti('communicationStyle', value)}
          />
        </div>
        {showValidationErrors && !hasCommunicationStyle ? (
          <p className="text-sm text-red-400">Select at least one communication style.</p>
        ) : null}
      </div>

      <div className="space-y-4 border-b border-white/10 pb-7">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <HeartHandshake className="h-5 w-5 text-pink-300" />
          How do you receive love? <span className="text-red-400">*</span>
        </h3>
        <div className={showValidationErrors && !hasLoveStyle ? 'rounded-2xl border border-red-400/40 bg-red-500/5 p-3' : ''}>
          <MultiSelectChips
            options={loveStyleOptions}
            selected={onboardingData.loveStyle}
            onSelect={(value) => toggleMulti('loveStyle', value)}
          />
        </div>
        {showValidationErrors && !hasLoveStyle ? (
          <p className="text-sm text-red-400">Select at least one love style.</p>
        ) : null}
      </div>

      <div className="space-y-4 pb-10">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <GraduationCap className="h-5 w-5 text-pink-300" />
          What is your education level? <span className="text-red-400">*</span>
        </h3>
        <div className={showValidationErrors && !hasEducationLevel ? 'rounded-2xl border border-red-400/40 bg-red-500/5 p-3' : ''}>
          <MultiSelectChips
            options={educationLevelOptions}
            selected={onboardingData.educationLevel ? [onboardingData.educationLevel] : []}
            onSelect={(value) => setOnboardingData((prev) => ({ ...prev, educationLevel: value }))}
          />
        </div>
        {showValidationErrors && !hasEducationLevel ? (
          <p className="text-sm text-red-400">Select your education level.</p>
        ) : null}
      </div>
    </motion.div>
  );
};

export default PersonalEssenceSlide;
