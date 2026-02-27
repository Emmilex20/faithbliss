import React from 'react';
import { motion } from 'framer-motion';
import type { OnboardingData } from './types';
import SelectableCard from './SelectableCard';
import { CountryCodeSelect, countries, defaultCountry } from '@/components/CountryCodeSelect';
import type { Country } from '@/components/CountryCodeSelect';
import AppDropdown from '@/components/AppDropdown';
import SelectWithOtherInput from './SelectWithOtherInput';

interface ProfileBuilderSlideProps {
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
  { value: 'MONTHLY', label: 'Monthly', emoji: '📅' },
  { value: 'OCCASIONALLY', label: 'Occasionally', emoji: '⛪' },
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
];

const occupationOptions = [
  'Software Developer',
  'Data Analyst',
  'Product Manager',
  'UI/UX Designer',
  'Civil Engineer',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Architect',
  'Medical Doctor',
  'Pharmacist',
  'Dentist',
  'Nurse',
  'Physiotherapist',
  'Teacher',
  'Lecturer',
  'Lawyer',
  'Judge',
  'Accountant',
  'Financial Analyst',
  'Banker',
  'Auditor',
  'Entrepreneur',
  'Business Owner',
  'Sales Manager',
  'Marketing Manager',
  'Customer Success Manager',
  'HR Manager',
  'Project Manager',
  'Operations Manager',
  'Consultant',
  'Content Creator',
  'Social Media Manager',
  'Journalist',
  'Photographer',
  'Videographer',
  'Musician',
  'Fashion Designer',
  'Chef',
  'Caterer',
  'Real Estate Agent',
  'Pilot',
  'Cabin Crew',
  'Student',
  'Graduate Trainee',
  'Researcher',
  'Clergy',
  'Missionary',
  'Public Servant',
  'Not currently working',
];

const fieldOfStudyOptions = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Cybersecurity',
  'Data Science',
  'Artificial Intelligence',
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Public Health',
  'Law',
  'Business Administration',
  'Accounting',
  'Finance',
  'Economics',
  'Marketing',
  'Mass Communication',
  'Psychology',
  'Sociology',
  'Political Science',
  'International Relations',
  'Theology',
  'Religious Studies',
  'Education',
  'English',
  'History',
  'Linguistics',
  'Biology',
  'Biochemistry',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Statistics',
  'Architecture',
  'Civil Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Agriculture',
  'Food Science',
  'Graphic Design',
  'Fine Arts',
  'Music',
  'N/A',
];
const languageOptions = [
  'English',
  'French',
  'Spanish',
  'Portuguese',
  'German',
  'Italian',
  'Dutch',
  'Arabic',
  'Mandarin Chinese',
  'Hindi',
  'Bengali',
  'Urdu',
  'Swahili',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Amharic',
  'Zulu',
  'Shona',
  'Tamil',
  'Tagalog',
  'Japanese',
  'Korean',
  'Turkish',
  'Russian',
];

const personalityOptions = ['Adventurous', 'Outgoing', 'Creative', 'Reserved', 'Analytical', 'Charismatic'];
const hobbiesOptions = ['Reading', 'Hiking', 'Photography', 'Cooking', 'Gaming', 'Traveling', 'Sports', 'Music'];
const valuesOptions = ['Love', 'Faith', 'Hope', 'Honesty', 'Kindness', 'Compassion', 'Family', 'Friendship'];
const spiritualGiftsOptions = ['Serving', 'Teaching', 'Encouragement', 'Giving', 'Leadership', 'Mercy', 'Wisdom', 'Faith'];
const baptismStatusOptions = [
  { value: 'BAPTIZED', label: 'Baptized' },
  { value: 'NOT_BAPTIZED', label: 'Not Baptized' },
  { value: 'PLANNING_TO', label: 'Planning To' },
];

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-white">
    {children} <span className="text-red-400">*</span>
  </h3>
);

const SingleSelectDropdown = ({
  id,
  value,
  options,
  onChange,
  placeholder,
}: {
  id: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
  placeholder: string;
}) => (
  <AppDropdown
    id={id}
    value={value || ''}
    options={options}
    onChange={onChange}
    placeholder={placeholder}
    searchable
    searchPlaceholder="Search status..."
    emptyText="No matching status."
    triggerClassName="input-style flex w-full items-center justify-between gap-3 text-left"
  />
);

const ProfileBuilderSlide = ({ onboardingData, setOnboardingData, isVisible }: ProfileBuilderSlideProps) => {
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(defaultCountry);

  React.useEffect(() => {
    if (!onboardingData.countryCode) return;
    const match = countries.find((country) => country.dialCode === onboardingData.countryCode);
    if (match) setSelectedCountry(match);
  }, [onboardingData.countryCode]);

  const calculateAgeFromBirthday = (birthday: string): number | undefined => {
    if (!birthday) return undefined;
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) return undefined;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age >= 0 ? age : undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'birthday') {
      const age = calculateAgeFromBirthday(value);
      setOnboardingData((prev) => ({ ...prev, birthday: value, age }));
      return;
    }
    setOnboardingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectWithOtherChange = (name: string, value: string) => {
    setOnboardingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardSelect = (name: keyof OnboardingData, value: string) => {
    setOnboardingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name: 'personality' | 'hobbies' | 'values' | 'spiritualGifts', value: string) => {
    setOnboardingData((prev) => {
      const list = prev[name] || [];
      const nextList = list.includes(value) ? list.filter((item: string) => item !== value) : [...list, value];
      return { ...prev, [name]: nextList };
    });
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setOnboardingData((prev) => ({ ...prev, countryCode: country.dialCode }));
  };

  const handlePhoneChange = (phone: string) => {
    setOnboardingData((prev) => ({ ...prev, phoneNumber: phone }));
  };

  const parsedHeight = React.useMemo(() => {
    if (!onboardingData.height) return 170;
    const rawHeight = String(onboardingData.height).trim();
    const cmMatch = rawHeight.match(/(\d+)\s*cm/i);
    const numeric = cmMatch ? parseInt(cmMatch[1], 10) : parseInt(rawHeight, 10);
    if (Number.isNaN(numeric)) return 170;
    return Math.min(220, Math.max(120, numeric));
  }, [onboardingData.height]);
  const heightProgress = ((parsedHeight - 120) / (220 - 120)) * 100;

  const handleHeightChange = (value: number) => {
    const inches = Math.round(value / 2.54);
    const feet = Math.floor(inches / 12);
    const remInches = inches % 12;
    setOnboardingData((prev) => ({
      ...prev,
      height: `${value} cm (${feet}'${remInches}")`,
    }));
  };

  const toggleLanguage = (language: string) => {
    setOnboardingData((prev) => {
      const current = Array.isArray(prev.languageSpoken) ? prev.languageSpoken : [];
      const next = current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language];
      return {
        ...prev,
        languageSpoken: next,
        language: next[0] || '',
      };
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Let&apos;s build your profile! ✨</h2>
        <p className="text-gray-400">Help others get to know the real you.</p>
      </div>

      <div className="space-y-4">
        <RequiredLabel>How would you describe your faith journey?</RequiredLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {faithJourneyOptions.map((option) => (
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

      <div className="space-y-4">
        <RequiredLabel>How often do you attend church?</RequiredLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {churchAttendanceOptions.map((option) => (
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

      <div className="space-y-6">
        <h3 className="text-center text-xl font-semibold text-white">A little more about you...</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Denomination <span className="text-red-400">*</span>
            </label>
            <SelectWithOtherInput
              label=""
              name="denomination"
              options={denominationOptions}
              selectedValue={onboardingData.denomination}
              onChange={handleSelectWithOtherChange}
              placeholder="Select your denomination"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Baptism Status <span className="text-red-400">*</span>
            </label>
            <SingleSelectDropdown
              id="baptismStatus"
              value={onboardingData.baptismStatus}
              options={baptismStatusOptions}
              onChange={(next) => setOnboardingData((prev) => ({ ...prev, baptismStatus: next }))}
              placeholder="Baptism Status"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Profession <span className="text-red-400">*</span>
            </label>
            <SelectWithOtherInput
              label=""
              name="occupation"
              options={occupationOptions}
              selectedValue={onboardingData.occupation}
              onChange={handleSelectWithOtherChange}
              placeholder="Select your profession"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Birthday <span className="text-red-400">*</span>
            </label>
            <input type="date" name="birthday" value={onboardingData.birthday} onChange={handleChange} className="input-style" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Age (auto-calculated)</label>
            <input
              type="number"
              value={onboardingData.age ?? ''}
              readOnly
              className="input-style opacity-80 cursor-not-allowed"
              placeholder="Will be calculated from birthday"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Field of Study <span className="text-red-400">*</span>
            </label>
            <SelectWithOtherInput
              label=""
              name="education"
              options={fieldOfStudyOptions}
              selectedValue={onboardingData.education}
              onChange={handleSelectWithOtherChange}
              placeholder="Select your field of study"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Favorite Bible Verse <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="favoriteVerse"
              value={onboardingData.favoriteVerse}
              onChange={handleChange}
              placeholder="Favorite Bible verse"
              className="input-style"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-300">Height</label>
            <div className="rounded-xl border border-white/15 bg-slate-900/40 px-4 py-4">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                <span>120 cm</span>
                <span className="font-semibold text-white">{onboardingData.height || `${parsedHeight} cm`}</span>
                <span>220 cm</span>
              </div>
              <input
                type="range"
                min={120}
                max={220}
                step={1}
                value={parsedHeight}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="height-slider"
                style={
                  {
                    '--progress': `${heightProgress}%`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-300">Languages spoken</label>
            <p className="mb-3 text-xs text-slate-400">Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((option) => {
                const isSelected = onboardingData.languageSpoken?.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleLanguage(option)}
                    className={`chip ${isSelected ? 'chip-selected' : ''}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <CountryCodeSelect
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
            phoneNumber={onboardingData.phoneNumber}
            onPhoneChange={handlePhoneChange}
          />
        </div>

        <div className="space-y-4">
          <RequiredLabel>Describe your personality</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {personalityOptions.map((option) => (
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

        <div className="space-y-4">
          <RequiredLabel>What are your hobbies?</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {hobbiesOptions.map((option) => (
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

        <div className="space-y-4">
          <RequiredLabel>What are your values?</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {valuesOptions.map((option) => (
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

        <div className="space-y-4">
          <RequiredLabel>What are your spiritual gifts?</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {spiritualGiftsOptions.map((option) => (
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

      </div>
    </motion.div>
  );
};

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
  .height-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 10px;
    border-radius: 9999px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background:
      linear-gradient(90deg, rgba(236, 72, 153, 0.95) var(--progress), rgba(51, 65, 85, 0.95) var(--progress));
    outline: none;
    cursor: pointer;
    touch-action: pan-y;
    transition: box-shadow 0.2s ease, filter 0.2s ease;
  }
  .height-slider:hover {
    filter: brightness(1.05);
  }
  .height-slider:focus-visible {
    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.35);
  }
  .height-slider::-webkit-slider-runnable-track {
    height: 10px;
    border-radius: 9999px;
    background: transparent;
  }
  .height-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    margin-top: -8px;
    border-radius: 9999px;
    border: 3px solid rgba(255, 255, 255, 0.95);
    background: radial-gradient(circle at 30% 30%, #f9a8d4 0%, #ec4899 55%, #be185d 100%);
    box-shadow: 0 8px 24px rgba(236, 72, 153, 0.45);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .height-slider:active::-webkit-slider-thumb {
    transform: scale(1.08);
    box-shadow: 0 10px 28px rgba(236, 72, 153, 0.55);
  }
  .height-slider::-moz-range-track {
    height: 10px;
    border-radius: 9999px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(51, 65, 85, 0.95);
  }
  .height-slider::-moz-range-progress {
    height: 10px;
    border-radius: 9999px;
    background: rgba(236, 72, 153, 0.95);
  }
  .height-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 3px solid rgba(255, 255, 255, 0.95);
    background: radial-gradient(circle at 30% 30%, #f9a8d4 0%, #ec4899 55%, #be185d 100%);
    box-shadow: 0 8px 24px rgba(236, 72, 153, 0.45);
  }
`;

if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ProfileBuilderSlide;
