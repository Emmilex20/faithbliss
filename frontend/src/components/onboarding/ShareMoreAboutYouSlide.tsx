import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import type { OnboardingData } from './types';
import { BIO_MAX_LENGTH, PROFILE_PROMPT_OPTIONS, PROMPT_ANSWER_MAX_LENGTH } from '@/constants/profilePrompts';

interface ShareMoreAboutYouSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

const PromptDropdown = ({
  value,
  options,
  onSelect,
}: {
  value?: string;
  options: string[];
  onSelect: (next: string) => void;
}) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      return;
    }
    searchInputRef.current?.focus();
  }, [isOpen]);

  const filteredOptions = React.useMemo(
    () => options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm]
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full rounded-xl border border-white/15 bg-slate-950/60 p-4 text-left text-white transition focus:border-pink-400 focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? 'text-white' : 'text-slate-400'}>{value || 'Choose one prompt'}</span>
        <ChevronDown className={`float-right h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-slate-600/60 bg-slate-900/98 shadow-2xl backdrop-blur-md">
          <div className="border-b border-slate-700/70 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompts..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-400 outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    onSelect(prompt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition sm:text-base ${
                    prompt === value ? 'bg-pink-500/20 text-pink-100' : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {prompt}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-slate-400">No matching prompts.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ShareMoreAboutYouSlide: React.FC<ShareMoreAboutYouSlideProps> = ({
  onboardingData,
  setOnboardingData,
  isVisible,
}) => {
  if (!isVisible) return null;

  const bioLength = onboardingData.bio?.length || 0;
  const promptLength = onboardingData.personalPromptAnswer?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.45 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-4xl font-bold leading-tight text-white">Share more about yourself</h2>
        <p className="text-lg text-slate-300">
          Write a bio and answer one prompt to help your profile stand out and spark conversations.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <label className="mb-2 block text-lg font-semibold text-white">About me</label>
        <textarea
          value={onboardingData.bio || ''}
          onChange={(e) =>
            setOnboardingData((prev) => ({
              ...prev,
              bio: e.target.value.slice(0, BIO_MAX_LENGTH),
            }))
          }
          rows={5}
          placeholder="Introduce yourself to make a strong impression."
          className="w-full rounded-xl border border-white/15 bg-slate-950/60 p-4 text-white placeholder-slate-400 focus:border-pink-400 focus:outline-none"
        />
        <p className="mt-2 text-right text-sm text-slate-400">
          <span className={bioLength > BIO_MAX_LENGTH * 0.9 ? 'text-pink-300' : ''}>{bioLength}</span>/{BIO_MAX_LENGTH}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <label className="mb-2 block text-lg font-semibold text-white">Select a prompt</label>
        <PromptDropdown
          value={onboardingData.personalPromptQuestion}
          options={PROFILE_PROMPT_OPTIONS}
          onSelect={(prompt) =>
            setOnboardingData((prev) => ({
              ...prev,
              personalPromptQuestion: prompt,
            }))
          }
        />

        <label className="mb-2 mt-4 block text-base font-semibold text-white">Your answer</label>
        <textarea
          value={onboardingData.personalPromptAnswer || ''}
          onChange={(e) =>
            setOnboardingData((prev) => ({
              ...prev,
              personalPromptAnswer: e.target.value.slice(0, PROMPT_ANSWER_MAX_LENGTH),
            }))
          }
          rows={3}
          placeholder="Write something fun..."
          className="w-full rounded-xl border border-white/15 bg-slate-950/60 p-4 text-white placeholder-slate-400 focus:border-pink-400 focus:outline-none"
        />
        <p className="mt-2 text-right text-sm text-slate-400">
          <span className={promptLength > PROMPT_ANSWER_MAX_LENGTH * 0.9 ? 'text-pink-300' : ''}>{promptLength}</span>/{PROMPT_ANSWER_MAX_LENGTH}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-slate-300">
        <p className="text-sm">
          Adding a short intro and prompt can increase profile engagement and make better matches faster.
        </p>
      </div>
    </motion.div>
  );
};

export default ShareMoreAboutYouSlide;
