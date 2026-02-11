import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircleHeart, HeartHandshake, GraduationCap, MoonStar } from 'lucide-react';
import type { OnboardingData } from './types';

interface PersonalEssenceSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

const communicationOptions = ['Big time texter', 'Phone caller', 'Video chatter', 'Bad texter', 'Better in person'];
const loveStyleOptions = ['Thoughtful gestures', 'Presents', 'Touch', 'Compliments', 'Time together'];
const educationLevelOptions = ['Bachelors', 'In College', 'High School', 'PhD', 'In Grad School', 'Masters', 'Trade School'];
const zodiacOptions = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];

const SingleSelectChips = ({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
}) => (
  <div className="flex flex-wrap gap-2.5">
    {options.map((option) => {
      const isSelected = selected === option;
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

const PersonalEssenceSlide: React.FC<PersonalEssenceSlideProps> = ({ onboardingData, setOnboardingData, isVisible }) => {
  if (!isVisible) return null;

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
          What is your communication style?
        </h3>
        <SingleSelectChips
          options={communicationOptions}
          selected={onboardingData.communicationStyle}
          onSelect={(value) => setOnboardingData((prev) => ({ ...prev, communicationStyle: value }))}
        />
      </div>

      <div className="space-y-4 border-b border-white/10 pb-7">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <HeartHandshake className="h-5 w-5 text-pink-300" />
          How do you receive love?
        </h3>
        <SingleSelectChips
          options={loveStyleOptions}
          selected={onboardingData.loveStyle}
          onSelect={(value) => setOnboardingData((prev) => ({ ...prev, loveStyle: value }))}
        />
      </div>

      <div className="space-y-4 border-b border-white/10 pb-7">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <GraduationCap className="h-5 w-5 text-pink-300" />
          What is your education level?
        </h3>
        <SingleSelectChips
          options={educationLevelOptions}
          selected={onboardingData.educationLevel}
          onSelect={(value) => setOnboardingData((prev) => ({ ...prev, educationLevel: value }))}
        />
      </div>

      <div className="space-y-4 pb-10">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <MoonStar className="h-5 w-5 text-pink-300" />
          What is your zodiac sign?
        </h3>
        <SingleSelectChips
          options={zodiacOptions}
          selected={onboardingData.zodiacSign}
          onSelect={(value) => setOnboardingData((prev) => ({ ...prev, zodiacSign: value }))}
        />
      </div>
    </motion.div>
  );
};

export default PersonalEssenceSlide;

