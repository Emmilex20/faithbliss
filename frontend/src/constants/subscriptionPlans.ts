export const SUBSCRIPTION_TIER_LABELS = {
  free: 'FaithBliss Free',
  premium: 'Premium Plan',
  elite: 'Pro Plan',
} as const;

export const getSubscriptionTierLabel = (tier?: string | null) => {
  if (!tier) {
    return SUBSCRIPTION_TIER_LABELS.free;
  }

  return SUBSCRIPTION_TIER_LABELS[tier as keyof typeof SUBSCRIPTION_TIER_LABELS] ?? tier;
};

export const PREMIUM_PLAN_CONTENT: Record<
  'premium' | 'elite',
  {
    description: string;
    tag?: string;
    highlight?: boolean;
    cta: string;
    features: string[];
  }
> = {
  premium: {
    description: 'Unlock the full FaithBliss experience beyond the free plan limits.',
    cta: 'Start Premium Plan',
    features: [
      'Unlimited likes and swipes',
      'Advanced filters',
      'Voice and video calling',
      'Access to explore page',
      'Unlimited Rewinds',
      'Travel Mode',
      '1 Monthly Profile Booster',
    ],
  },
  elite: {
    description: 'The complete experience for intentional matching.',
    tag: 'Best Value',
    highlight: true,
    cta: 'Start Pro Plan',
    features: [
      'Everything in Premium Plan',
      'Exclusive priority visibility',
      'Priority support and coaching',
      'Invisible browsing mode',
      'Unlimited profile rewinds',
    ],
  },
};
