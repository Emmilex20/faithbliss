import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { OnboardingData } from './types';

interface InterestsSelectionSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

const MAX_INTERESTS = 10;
const INITIAL_VISIBLE_PER_CATEGORY = 8;

const INTEREST_CATEGORIES: Array<{ title: string; emoji: string; options: string[] }> = [
  {
    title: 'Creativity',
    emoji: '🎨',
    options: [
      'Freelancing',
      'Photography',
      'Choir',
      'Cosplay',
      'Content Creation',
      'Vintage Fashion',
      'Singing',
      'Poetry',
      'Writing',
      'Literature',
      'Painting',
      'Entrepreneurship',
      'Musical Instrument',
      'Musical Writing',
      'Dancing',
      'Art',
      'Drawing',
      'Blogging',
      'Fashion',
      'DIY',
    ],
  },
  {
    title: 'Fan Favorites',
    emoji: '🌟',
    options: ['Comic-con', 'Harry Potter', 'NBA', 'MLB', 'Dungeons & Dragons', 'Manga', 'Marvel', 'Disney', 'Anime'],
  },
  {
    title: 'Food and Drink',
    emoji: '🍽️',
    options: [
      'Foodie',
      'Food Tours',
      'Mocktails',
      'Sweet Treats',
      'Brunch',
      'Street Food',
      'Plant-based',
      'Coffee',
      'Sushi',
      'BBQ',
      'Tea',
      'Ice Cream',
    ],
  },
  {
    title: 'Going Out',
    emoji: '🌐',
    options: [
      'Museums',
      'Cafe Hopping',
      'Shopping',
      'Festivals',
      'Live Music',
      'Theater',
      'Exhibition',
      'Thrifting',
      'Stand Up Comedy',
    ],
  },
  {
    title: 'Music',
    emoji: '🎶',
    options: [
      'Gospel Music',
      'Music Bands',
      'Soul Music',
      'Pop Music',
      'K-Pop',
      'Rap Music',
      'Folk Music',
      'Jazz',
      'R&B',
      'Hip Hop',
      'Electronic Music',
    ],
  },
  {
    title: 'Outdoors and Adventure',
    emoji: '🏕️',
    options: [
      'Nature',
      'Travel',
      'Road Trips',
      'Hiking',
      'Camping',
      'Picnicking',
      'Mountains',
      'Fishing',
      'Beach',
      'Walking Tours',
    ],
  },
  {
    title: 'Social and Content',
    emoji: '📱',
    options: ['Instagram', 'YouTube', 'TikTok', 'Podcasts', 'Spotify', 'Netflix', 'Vlogging', 'Social Media'],
  },
  {
    title: 'Sports and Fitness',
    emoji: '⚾',
    options: [
      'Walking',
      'Fitness Classes',
      'Boxing',
      'Pilates',
      'Jogging',
      'Football',
      'Tennis',
      'Basketball',
      'Gym',
      'Running',
      'Volleyball',
      'Yoga',
    ],
  },
  {
    title: 'Staying In',
    emoji: '🏠',
    options: ['Reading', 'Binge Watching', 'Cooking', 'Home Workout', 'Board Games', 'Trivia', 'Gardening', 'Baking'],
  },
  {
    title: 'TV and Movies',
    emoji: '🎬',
    options: [
      'Action Movies',
      'Animated Movies',
      'Crime Shows',
      'Drama Shows',
      'Reality TV',
      'Rom Coms',
      'Documentaries',
      'Comedy',
      'K-Drama',
      'Sci-Fi',
    ],
  },
  {
    title: 'Values and Causes',
    emoji: '🌍',
    options: [
      'Mental Health Awareness',
      'Social Development',
      'Human Rights',
      'Inclusivity',
      'World Peace',
      'Youth Empowerment',
      'Equality',
      'Volunteering',
      'Climate Change',
      'Community Service',
    ],
  },
  {
    title: 'Wellness and Lifestyle',
    emoji: '🌿',
    options: ['Self Care', 'Meditation', 'Mindfulness', 'Skincare', 'Active Lifestyle', 'Trying New Things', 'Self Development'],
  },
];

const normalizeInterests = (values: string[] | undefined): string[] => {
  if (!Array.isArray(values)) return [];
  return values
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, MAX_INTERESTS);
};

const InterestsSelectionSlide = ({ onboardingData, setOnboardingData, isVisible }: InterestsSelectionSlideProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const selectedInterests = useMemo(() => normalizeInterests(onboardingData.interests), [onboardingData.interests]);

  if (!isVisible) return null;

  const toggleCategoryExpansion = (categoryTitle: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryTitle]: !prev[categoryTitle] }));
  };

  const toggleInterest = (interest: string) => {
    setOnboardingData((prev) => {
      const current = normalizeInterests(prev.interests);
      const exists = current.includes(interest);

      if (exists) {
        return { ...prev, interests: current.filter((item) => item !== interest) };
      }

      if (current.length >= MAX_INTERESTS) {
        return prev;
      }

      return { ...prev, interests: [...current, interest] };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.45 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-bold leading-tight text-white">What are you into?</h2>
        <p className="mt-3 text-lg text-slate-300">
          Add up to {MAX_INTERESTS} interests to help us find people who share what you love.
        </p>
        <div className="mt-4 inline-flex items-center rounded-full border border-pink-400/40 bg-pink-500/10 px-4 py-1.5 text-sm font-semibold text-pink-100">
          Selected {selectedInterests.length}/{MAX_INTERESTS}
        </div>
      </div>

      <div className="space-y-8">
        {INTEREST_CATEGORIES.map((category) => {
          const expanded = Boolean(expandedCategories[category.title]);
          const visibleOptions = expanded ? category.options : category.options.slice(0, INITIAL_VISIBLE_PER_CATEGORY);

          return (
            <section key={category.title} className="space-y-3 border-b border-white/10 pb-6 last:border-b-0">
              <h3 className="text-2xl font-semibold text-white">
                <span className="mr-2">{category.emoji}</span>
                {category.title}
              </h3>

              <div className="flex flex-wrap gap-2">
                {visibleOptions.map((option) => {
                  const active = selectedInterests.includes(option);
                  const blocked = !active && selectedInterests.length >= MAX_INTERESTS;
                  return (
                    <button
                      key={`${category.title}-${option}`}
                      type="button"
                      onClick={() => toggleInterest(option)}
                      disabled={blocked}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? 'border-pink-400 bg-pink-500/20 text-pink-100'
                          : 'border-white/20 bg-slate-800/30 text-slate-200 hover:border-pink-300/60 hover:text-white'
                      } ${blocked ? 'cursor-not-allowed opacity-45' : ''}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {category.options.length > INITIAL_VISIBLE_PER_CATEGORY && (
                <button
                  type="button"
                  onClick={() => toggleCategoryExpansion(category.title)}
                  className="text-sm font-semibold text-slate-300 transition hover:text-white"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </section>
          );
        })}
      </div>
    </motion.div>
  );
};

export default InterestsSelectionSlide;
