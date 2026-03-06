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
    description: 'Unlock deeper filters and priority visibility.',
    cta: 'Start Premium Plan',
    features: [
      'See who liked you instantly',
      'Advanced faith and values filters',
      'Boosted profile discovery',
      'Message read receipts',
      'Weekly profile insights',
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
