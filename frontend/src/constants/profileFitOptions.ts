export interface ProfileFitOption {
  title: string;
  description: string;
}

export const PROFILE_FIT_OPTIONS: ProfileFitOption[] = [
  {
    title: 'Professionals & Entrepreneurs',
    description: 'Careers, business, founders, leadership and ambition.',
  },
  {
    title: 'Ministry & Pastoral',
    description: 'Pastors, ministers, church workers, missionaries.',
  },
  {
    title: 'Students & Scholars',
    description: 'Undergrad, grad school, PhD, med school, lifelong learners.',
  },
  {
    title: 'Content Creators',
    description: 'Writers, YouTubers, podcasters, designers, media creatives.',
  },
  {
    title: 'Book Readers',
    description: 'Faith, leadership, growth, fiction, theology lovers.',
  },
  {
    title: 'Travel Lovers',
    description: 'Explorers, relocation-friendly, global Christians.',
  },
  {
    title: 'Fitness & Sports',
    description: 'Gym, running, football, wellness, active lifestyle.',
  },
  {
    title: 'Music & Creative Arts',
    description: 'Worship leaders, musicians, singers, artists.',
  },
];

export const MIN_PROFILE_FITS = 3;
