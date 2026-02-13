import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Ruler, UserRoundSearch } from 'lucide-react';
import type { OnboardingData } from './types';
import SelectableCard from './SelectableCard';

interface PartnerPreferencesSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

const faithJourneyOptions = [
  { value: 'ROOTED', label: 'Rooted', emoji: '🌳' },
  { value: 'GROWING', label: 'Growing', emoji: '🌱' },
  { value: 'EXPLORING', label: 'Exploring', emoji: '🧭' },
  { value: 'PASSIONATE', label: 'Passionate', emoji: '🔥' },
];

const churchAttendanceOptions = [
  { value: 'WEEKLY', label: 'Weekly', emoji: '🙌' },
  { value: 'BIWEEKLY', label: 'Bi-weekly', emoji: '🙏' },
  { value: 'MONTHLY', label: 'Monthly', emoji: '🗓️' },
  { value: 'OCCASIONALLY', label: 'Occasionally', emoji: '⛪' },
  { value: 'RARELY', label: 'Rarely', emoji: '🤔' },
];

const relationshipGoalsOptions = [
  { value: 'MARRIAGE_MINDED', label: 'Marriage Minded', emoji: '💍' },
  { value: 'RELATIONSHIP', label: 'Relationship', emoji: '❤️' },
  { value: 'FRIENDSHIP', label: 'Friendship', emoji: '🤝' },
];

const denominationOptions = [
  'BAPTIST',
  'METHODIST',
  'PRESBYTERIAN',
  'PENTECOSTAL',
  'CATHOLIC',
  'ORTHODOX',
  'ANGLICAN',
  'LUTHERAN',
  'ASSEMBLIES_OF_GOD',
  'SEVENTH_DAY_ADVENTIST',
  'OTHER',
];

const genderOptions = [
  { value: 'MALE', label: 'Men', emoji: '👨' },
  { value: 'FEMALE', label: 'Women', emoji: '👩' },
];

const chipClass = (selected: boolean) =>
  `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
    selected ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
  }`;

const PartnerPreferencesSlide: React.FC<PartnerPreferencesSlideProps> = ({ onboardingData, setOnboardingData, isVisible }) => {
  if (!isVisible) return null;

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed = value ? parseInt(value, 10) : null;
    setOnboardingData((prev) => ({ ...prev, [name as keyof OnboardingData]: parsed }));
  };

  const handleMultiSelect = (
    name: 'preferredFaithJourney' | 'preferredChurchAttendance' | 'preferredRelationshipGoals' | 'preferredDenomination',
    value: string
  ) => {
    setOnboardingData((prev) => {
      if (name === 'preferredDenomination') {
        return {
          ...prev,
          preferredDenomination: prev.preferredDenomination === value ? '' : value,
        };
      }

      const currentList = (prev[name] || []) as string[];
      const newList = currentList.includes(value) ? currentList.filter((item) => item !== value) : [...currentList, value];
      return { ...prev, [name]: newList };
    });
  };

  const preferredMinHeight = onboardingData.preferredMinHeight ?? 160;
  const preferredHeightInches = Math.round(preferredMinHeight / 2.54);
  const preferredHeightFeet = Math.floor(preferredHeightInches / 12);
  const preferredHeightRemainder = preferredHeightInches % 12;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 p-5">
        <div className="mb-2 flex items-center gap-2 text-pink-200">
          <UserRoundSearch className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Partner Preferences</span>
        </div>
        <h2 className="text-3xl font-bold text-white">What are you looking for?</h2>
        <p className="mt-1 text-gray-300">Set values, distance, age, and height preferences for better matches.</p>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Heart className="h-5 w-5 text-pink-400" />
          I&apos;m interested in...
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {genderOptions.map((option) => (
            <SelectableCard
              key={option.value}
              label={option.label}
              emoji={option.emoji}
              isSelected={onboardingData.preferredGender === option.value}
              onClick={() => setOnboardingData((prev) => ({ ...prev, preferredGender: option.value as any }))}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Age Range</h3>
        <div className="flex items-center justify-center space-x-4">
          <input
            type="number"
            name="minAge"
            value={onboardingData.minAge === null || onboardingData.minAge === undefined ? '' : onboardingData.minAge}
            onChange={handleRangeChange}
            className="input-style w-24 text-center"
            min="18"
            max="99"
          />
          <span className="text-gray-400 text-lg">to</span>
          <input
            type="number"
            name="maxAge"
            value={onboardingData.maxAge === null || onboardingData.maxAge === undefined ? '' : onboardingData.maxAge}
            onChange={handleRangeChange}
            className="input-style w-24 text-center"
            min="18"
            max="99"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <MapPin className="h-5 w-5 text-pink-400" />
          Maximum Distance
        </h3>
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <input
            type="range"
            id="maxDistance"
            name="maxDistance"
            min="1"
            max="100"
            value={onboardingData.maxDistance || 0}
            onChange={handleRangeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="mt-2 text-center text-lg font-semibold text-pink-400">{onboardingData.maxDistance || 0} miles</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Ruler className="h-5 w-5 text-pink-400" />
          Preferred minimum height
        </h3>
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>120 cm</span>
            <span className="font-semibold text-white">
              {preferredMinHeight} cm ({preferredHeightFeet}'{preferredHeightRemainder}")
            </span>
            <span>220 cm</span>
          </div>
          <input
            type="range"
            name="preferredMinHeight"
            min="120"
            max="220"
            value={preferredMinHeight}
            onChange={handleRangeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Their ideal faith journey?</h3>
        <div className="flex flex-wrap gap-2">
          {faithJourneyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleMultiSelect('preferredFaithJourney', option.value)}
              className={chipClass(!!onboardingData.preferredFaithJourney?.includes(option.value as any))}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">How often should they attend church?</h3>
        <div className="flex flex-wrap gap-2">
          {churchAttendanceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleMultiSelect('preferredChurchAttendance', option.value)}
              className={chipClass(!!onboardingData.preferredChurchAttendance?.includes(option.value as any))}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">What kind of relationship are they seeking?</h3>
        <div className="flex flex-wrap gap-2">
          {relationshipGoalsOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleMultiSelect('preferredRelationshipGoals', option.value)}
              className={chipClass(!!onboardingData.preferredRelationshipGoals?.includes(option.value as any))}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Any denomination preferences?</h3>
        <div className="flex flex-wrap gap-2">
          {denominationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleMultiSelect('preferredDenomination', option)}
              className={chipClass(onboardingData.preferredDenomination === option)}
            >
              {option.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PartnerPreferencesSlide;
