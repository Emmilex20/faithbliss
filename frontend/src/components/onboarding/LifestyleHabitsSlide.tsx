import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, GlassWater, PawPrint, Cigarette } from 'lucide-react';
import type { OnboardingData } from './types';

interface LifestyleHabitsSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

const drinkingOptions = ['Not for me', 'Sober', 'On special occasions', 'Socially on weekends', 'Most Nights'];
const smokingOptions = ['Non-smoker', 'Social smoker', 'Smoker', 'Trying to quit'];
const workoutOptions = ['Everyday', 'Often', 'Sometimes', 'Never'];
const petOptions = ['Dog', 'Cat', 'Bird', 'Fish', "Don't have but love", 'Pet-free', 'Want a pet', 'Allergic to pets'];

const Section = ({
  icon,
  title,
  options,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
}) => (
  <div className="space-y-4 border-b border-white/10 pb-7">
    <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
      {icon}
      {title}
    </h3>
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
  </div>
);

const LifestyleHabitsSlide: React.FC<LifestyleHabitsSlideProps> = ({ onboardingData, setOnboardingData, isVisible }) => {
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
        <h2 className="text-4xl font-bold leading-tight text-white">Let&apos;s talk lifestyle habits</h2>
        <p className="text-lg text-slate-300">Do their habits match yours? You go first.</p>
      </div>

      <Section
        icon={<GlassWater className="h-5 w-5 text-pink-300" />}
        title="How often do you drink?"
        options={drinkingOptions}
        selected={onboardingData.drinkingHabit}
        onSelect={(value) => setOnboardingData((prev) => ({ ...prev, drinkingHabit: value }))}
      />

      <Section
        icon={<Cigarette className="h-5 w-5 text-pink-300" />}
        title="How often do you smoke?"
        options={smokingOptions}
        selected={onboardingData.smokingHabit}
        onSelect={(value) => setOnboardingData((prev) => ({ ...prev, smokingHabit: value }))}
      />

      <Section
        icon={<Dumbbell className="h-5 w-5 text-pink-300" />}
        title="Do you workout?"
        options={workoutOptions}
        selected={onboardingData.workoutHabit}
        onSelect={(value) => setOnboardingData((prev) => ({ ...prev, workoutHabit: value }))}
      />

      <div className="space-y-4 pb-10">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <PawPrint className="h-5 w-5 text-pink-300" />
          Do you have any pets?
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {petOptions.map((option) => {
            const isSelected = onboardingData.petPreference === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setOnboardingData((prev) => ({ ...prev, petPreference: option }))}
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
      </div>
    </motion.div>
  );
};

export default LifestyleHabitsSlide;

