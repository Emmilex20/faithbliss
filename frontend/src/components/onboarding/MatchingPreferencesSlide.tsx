/* eslint-disable no-irregular-whitespace */
// src/components/onboarding/MatchingPreferencesSlide.tsx (Vite/React)

import React from 'react';
import { motion } from 'framer-motion';
import type { OnboardingData } from './types';
import SelectableCard from './SelectableCard';

interface MatchingPreferencesSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

const genderOptions = [
  { value: 'MALE', label: 'Men', emoji: '👨' },
  { value: 'FEMALE', label: 'Women', emoji: '👩' },
];

const MatchingPreferencesSlide: React.FC<MatchingPreferencesSlideProps> = ({ onboardingData, setOnboardingData, isVisible }) => {
  if (!isVisible) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // For number inputs, parse the value before updating state
    const newValue = type === 'number' || type === 'range' ? (value ? parseInt(value) : null) : value;

    // Use a type assertion for the name to keep TypeScript happy
    setOnboardingData(prev => ({ ...prev, [name as keyof OnboardingData]: newValue }));
  };

  const handleCardSelect = (name: keyof OnboardingData, value: string) => {
    setOnboardingData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Who are you looking for? 🤔</h2>
        <p className="text-gray-400">Set your preferences to find the right match.</p>
      </div>

      {/* Preferred Gender */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">I&apos;m interested in...</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {genderOptions.map(option => (
            <SelectableCard
              key={option.value}
              label={option.label}
              emoji={option.emoji}
              isSelected={onboardingData.preferredGender === option.value}
              onClick={() => handleCardSelect('preferredGender', option.value)}
            />
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Age Range</h3>
        <div className="flex items-center justify-center space-x-4">
          <input
            type="number"
            name="minAge"
            // Use an empty string if the value is null or undefined for controlled input
            value={onboardingData.minAge === null || onboardingData.minAge === undefined ? '' : onboardingData.minAge} 
            onChange={handleChange}
            className="input-style w-24 text-center"
            min="18"
            max="99"
          />
          <span className="text-gray-400 text-lg">to</span>
          <input
            type="number"
            name="maxAge"
            value={onboardingData.maxAge === null || onboardingData.maxAge === undefined ? '' : onboardingData.maxAge} 
            onChange={handleChange}
            className="input-style w-24 text-center"
            min="18"
            max="99"
          />
        </div>
      </div>

      {/* Max Distance */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Maximum Distance</h3>
        <div className="relative">
          <input
            type="range"
            id="maxDistance"
            name="maxDistance"
            min="1"
            max="100"
            value={onboardingData.maxDistance || 0} // Range input requires a number
            onChange={handleChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center text-lg font-semibold text-pink-400 mt-2">
            {onboardingData.maxDistance || 0} miles
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// NOTE: The inline style injection block has been removed.
// Ensure the 'input-style' class is defined in your global CSS/Tailwind configuration.

export default MatchingPreferencesSlide;