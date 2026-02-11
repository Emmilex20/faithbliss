import React from 'react';
import { motion } from 'framer-motion';
import type { OnboardingData } from './types';
import { BIO_MAX_LENGTH, PROFILE_PROMPT_OPTIONS, PROMPT_ANSWER_MAX_LENGTH } from '@/constants/profilePrompts';

interface ShareMoreAboutYouSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

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
        <select
          value={onboardingData.personalPromptQuestion || ''}
          onChange={(e) =>
            setOnboardingData((prev) => ({
              ...prev,
              personalPromptQuestion: e.target.value,
            }))
          }
          className="w-full rounded-xl border border-white/15 bg-slate-950/60 p-4 text-white focus:border-pink-400 focus:outline-none"
        >
          <option value="">Choose one prompt</option>
          {PROFILE_PROMPT_OPTIONS.map((prompt) => (
            <option key={prompt} value={prompt}>
              {prompt}
            </option>
          ))}
        </select>

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
