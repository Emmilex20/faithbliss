/* eslint-disable no-irregular-whitespace */
// src/components/onboarding/ProfileBuilderSlide.tsx

import React from 'react';
import { motion } from 'framer-motion';
// 1. Assuming these relative imports are correct for your Vite structure
import type { OnboardingData } from './types'; 
import SelectableCard from './SelectableCard';
import { CountryCodeSelect, defaultCountry } from '@/components/CountryCodeSelect';
import type { Country } from '@/components/CountryCodeSelect';
import SelectWithOtherInput from './SelectWithOtherInput';

interface ProfileBuilderSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

// NOTE: Using string values directly from the types defined previously
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
];

const denominationOptions = [
  "BAPTIST", "METHODIST", "PRESBYTERIAN", "PENTECOSTAL", "CATHOLIC",
  "ORTHODOX", "ANGLICAN", "LUTHERAN", "ASSEMBLIES_OF_GOD",
  "SEVENTH_DAY_ADVENTIST", "OTHER"
];

const occupationOptions = [
  "Software Engineer", "Doctor", "Teacher", "Nurse", "Accountant",
  "Marketing Specialist", "Graphic Designer", "Project Manager",
  "Sales Representative", "Customer Service", "Student", "Unemployed", "Other"
];

const fieldOfStudyOptions = [
  "Computer Science", "Medicine", "Education", "Nursing",
  "Business Administration", "Marketing", "Graphic Design", "Engineering",
  "Psychology", "Biology", "Chemistry", "Physics", "Mathematics",
  "History", "English", "Art", "Other"
];

const personalityOptions = ["Adventurous", "Outgoing", "Creative", "Reserved", "Analytical", "Charismatic"];
const hobbiesOptions = ["Reading", "Hiking", "Photography", "Cooking", "Gaming", "Traveling", "Sports", "Music"];
const valuesOptions = ["Love", "Faith", "Hope", "Honesty", "Kindness", "Compassion", "Family", "Friendship"];
const spiritualGiftsOptions = ["Serving", "Teaching", "Encouragement", "Giving", "Leadership", "Mercy", "Wisdom", "Faith"];
const interestsOptions = ["Volunteering", "Travel", "Brunch", "Coffee", "Movies", "Concerts", "Art", "Tech"];

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-white">
    {children} <span className="text-red-400">*</span>
  </h3>
);

const ProfileBuilderSlide = ({ onboardingData, setOnboardingData, isVisible }: ProfileBuilderSlideProps) => {
  if (!isVisible) return null;

// eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(defaultCountry);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // NOTE: Type cast updated to reflect the union types in the 'types.ts' file
    if (name === 'denomination') {
      setOnboardingData(prev => ({ ...prev, [name]: value as string }));
    } else {
      setOnboardingData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectWithOtherChange = (name: string, value: string) => {
    setOnboardingData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardSelect = (name: keyof OnboardingData, value: string) => {
    setOnboardingData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name: 'personality' | 'hobbies' | 'values' | 'spiritualGifts' | 'interests', value: string) => {
    setOnboardingData(prev => {
      const list = prev[name] || [];
      const newList: string[] = list.includes(value)
        ? list.filter((item: string) => item !== value)
        : [...list, value];
      return { ...prev, [name]: newList };
    });
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setOnboardingData(prev => ({ ...prev, countryCode: country.dialCode }));
  };

  const handlePhoneChange = (phone: string) => {
    setOnboardingData(prev => ({ ...prev, phoneNumber: phone }));
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
        <h2 className="text-3xl font-bold text-white">Let's build your profile! ✨</h2>
        <p className="text-gray-400">Help others get to know the real you.</p>
      </div>

      {/* Faith Journey */}
      <div className="space-y-4">
        <RequiredLabel>How would you describe your faith journey?</RequiredLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {faithJourneyOptions.map(option => (
            <SelectableCard
              key={option.value}
              label={option.label}
              emoji={option.emoji}
              isSelected={onboardingData.faithJourney === option.value}
              onClick={() => handleCardSelect('faithJourney', option.value)}
            />
          ))}
        </div>
        </div>

      {/* Church Attendance */}
      <div className="space-y-4">
        <RequiredLabel>How often do you attend church?</RequiredLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {churchAttendanceOptions.map(option => (
            <SelectableCard
              key={option.value}
              label={option.label}
              emoji={option.emoji}
              isSelected={onboardingData.churchAttendance === option.value}
              onClick={() => handleCardSelect('churchAttendance', option.value)}
            />
          ))}
        </div>
      </div>

      {/* Other Details */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white text-center">A little more about you...</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Denomination Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Denomination <span className="text-red-400">*</span>
            </label>
            <select name="denomination" value={onboardingData.denomination} onChange={handleChange} className="input-style">
              <option value="" disabled>Select your denomination</option>
              {denominationOptions.map(option => (
                <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Baptism Status <span className="text-red-400">*</span>
            </label>
            <select 
              name="baptismStatus" 
              value={onboardingData.baptismStatus} 
              onChange={handleChange} 
              className="input-style"
            >
              <option value="" disabled>Baptism Status</option>
              <option value="BAPTIZED">Baptized</option>
              <option value="NOT_BAPTIZED">Not Baptized</option>
              <option value="PLANNING_TO">Planning To</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Occupation <span className="text-red-400">*</span>
            </label>
            <SelectWithOtherInput
              label=""
              name="occupation"
              options={occupationOptions}
              selectedValue={onboardingData.occupation}
              onChange={handleSelectWithOtherChange}
              placeholder="Select your Occupation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birthday <span className="text-red-400">*</span>
            </label>
            <input type="date" name="birthday" value={onboardingData.birthday} onChange={handleChange} className="input-style" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location <span className="text-red-400">*</span>
            </label>
            <input type="text" name="location" value={onboardingData.location} onChange={handleChange} placeholder="Your Location (e.g., City, State)" className="input-style" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Field of Study <span className="text-red-400">*</span>
            </label>
            <SelectWithOtherInput
              label=""
              name="education"
              options={fieldOfStudyOptions}
              selectedValue={onboardingData.education}
              onChange={handleSelectWithOtherChange}
              placeholder="Select your Field of Study"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Favorite Bible Verse <span className="text-red-400">*</span>
            </label>
            <input type="text" name="favoriteVerse" value={onboardingData.favoriteVerse} onChange={handleChange} placeholder="Favorite Bible Verse" className="input-style" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <CountryCodeSelect
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
            phoneNumber={onboardingData.phoneNumber}
            onPhoneChange={handlePhoneChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio <span className="text-red-400">*</span>
          </label>
          <textarea name="bio" value={onboardingData.bio} onChange={handleChange} placeholder="Write a short bio..." rows={4} className="input-style w-full"></textarea>
          </div>
        
        {/* Personality */}
        <div className="space-y-4">
          <RequiredLabel>Describe your personality</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {personalityOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleMultiSelect('personality', option)}
                className={`chip ${onboardingData.personality?.includes(option) ? 'chip-selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Hobbies */}
        <div className="space-y-4">
          <RequiredLabel>What are your hobbies?</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {hobbiesOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleMultiSelect('hobbies', option)}
                className={`chip ${onboardingData.hobbies?.includes(option) ? 'chip-selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="space-y-4">
          <RequiredLabel>What are your values?</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {valuesOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleMultiSelect('values', option)}
                className={`chip ${onboardingData.values?.includes(option) ? 'chip-selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Spiritual Gifts */}
        <div className="space-y-4">
          <RequiredLabel>What are your spiritual gifts?</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {spiritualGiftsOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleMultiSelect('spiritualGifts', option)}
                className={`chip ${onboardingData.spiritualGifts?.includes(option) ? 'chip-selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">What are your interests?</h3>
          <div className="flex flex-wrap gap-2">
            {interestsOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleMultiSelect('interests', option)}
                className={`chip ${onboardingData.interests?.includes(option) ? 'chip-selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 2. STYLES: This block has been modified to fix the dropdown text visibility.
const styles = `
  .input-style {
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(148, 163, 184, 0.25);
    color: #e5e7eb !important;
    border-radius: 0.85rem;
    padding: 0.85rem 1rem;
    font-size: 0.98rem;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    width: 100%;
  }
  .input-style:focus {
    outline: none;
    border-color: rgba(236, 72, 153, 0.7);
    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.25);
    background: rgba(15, 23, 42, 0.9);
  }
  .input-style::placeholder {
    color: rgba(148, 163, 184, 0.8);
  }

  /* FIX: Ensure dropdown text is visible on all platforms */
  select.input-style {
    color: #e5e7eb !important;
  }
  select.input-style option {
    background-color: #0f172a !important;
    color: #e5e7eb !important;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1.1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(15, 23, 42, 0.6);
    color: #d1d5db;
    transition: transform 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .chip:hover {
    border-color: rgba(236, 72, 153, 0.5);
    background: rgba(30, 41, 59, 0.7);
    transform: translateY(-1px);
  }
  .chip-selected {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(147, 51, 234, 0.85));
    color: white;
    border-color: rgba(236, 72, 153, 0.8);
    box-shadow: 0 10px 30px rgba(236, 72, 153, 0.25);
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
  input[type="date"] {
    color-scheme: dark;
  }
`;

if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ProfileBuilderSlide;