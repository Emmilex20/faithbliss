import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Crown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { API, type LocalizedPricingQuoteResponse } from '@/services/api';
import {
  PREMIUM_PLAN_CONTENT,
  getSubscriptionTierLabel,
} from '@/constants/subscriptionPlans';
import { useSubscriptionDisplay } from '@/hooks/useSubscriptionDisplay';

type BillingCycle = 'monthly' | 'quarterly';

type DisplayPlan = {
  tier: 'free' | 'premium';
  billingCycle?: BillingCycle;
  name: string;
  description: string;
  displayPrice: string;
  pricingNote?: string;
  originalPrice?: string;
  savingsLabel?: string;
  highlight?: boolean;
  tag?: string;
  features: string[];
  cta: string;
};

const FREE_PLAN: DisplayPlan = {
  tier: 'free',
  name: 'FaithBliss Free',
  description: 'A limited starter plan for browsing and basic matching.',
  displayPrice: 'Free',
  features: [
    'Sign in and create your account',
    '10 likes or swipes per day',
    'Chat after matching',
    'Gender filtering',
    'View user profiles',
  ],
  cta: 'Current Plan',
};

const badges = [
  'Verified community',
  'Faith-first matching',
  'Zero ads',
  'Cancel anytime',
];

const fallbackQuote: LocalizedPricingQuoteResponse = {
  countryCode: null,
  region: 'global',
  quotes: {
    monthly: {
      tier: 'premium',
      billingCycle: 'monthly',
      region: 'global',
      countryCode: null,
      displayCurrency: 'USD',
      displayAmountMajor: 11.99,
      chargeCurrency: 'NGN',
      chargeAmountMajor: 0,
      chargeAmountSubunits: 0,
      exchangeRate: 1,
      displayLabel: '$11.99',
    },
    quarterly: {
      tier: 'premium',
      billingCycle: 'quarterly',
      region: 'global',
      countryCode: null,
      displayCurrency: 'USD',
      displayAmountMajor: 23.97,
      chargeCurrency: 'NGN',
      chargeAmountMajor: 0,
      chargeAmountSubunits: 0,
      exchangeRate: 1,
      displayLabel: '$23.97',
    },
  },
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string' &&
    (error as { message: string }).message.trim()
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
};

const getPricingNote = (region: 'nigeria' | 'africa' | 'global', displayCurrency: string) => {
  if (region === 'nigeria') {
    return 'Charged in NGN at checkout.';
  }

  if (region === 'africa') {
    return `Shown in ${displayCurrency}. Paystack still charges in NGN.`;
  }

  return 'Shown in USD. Paystack charges in NGN at checkout.';
};

const PremiumContent = () => {
  const { user, refetchUser } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const planSectionRef = useRef<HTMLDivElement | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [loadingPlanKey, setLoadingPlanKey] = useState<'premium:monthly' | 'premium:quarterly' | null>(null);
  const [pricingQuote, setPricingQuote] = useState<LocalizedPricingQuoteResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;
  const isPremium =
    user?.subscriptionStatus === 'active' &&
    user?.subscriptionTier === 'premium';
  const activeTier = user?.subscriptionTier || 'free';
  const activeBillingCycle = user?.subscription?.billingCycle === 'quarterly' ? 'quarterly' : 'monthly';
  const normalizedActiveTier: DisplayPlan['tier'] = isPremium ? 'premium' : 'free';
  const subscriptionDisplay = useSubscriptionDisplay(user);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    refetchUser();

    const handleFocusRefresh = () => {
      refetchUser();
    };

    window.addEventListener('focus', handleFocusRefresh);
    document.addEventListener('visibilitychange', handleFocusRefresh);

    return () => {
      window.removeEventListener('focus', handleFocusRefresh);
      document.removeEventListener('visibilitychange', handleFocusRefresh);
    };
  }, [refetchUser, user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadPricingQuote = async () => {
      try {
        setPricingLoading(true);
        const quote = await API.Payment.getQuote();
        if (isMounted) {
          setPricingQuote(quote);
        }
      } catch (error: unknown) {
        if (isMounted) {
          setPricingQuote(null);
        }
        showError(getErrorMessage(error, 'Unable to load localized pricing.'));
      } finally {
        if (isMounted) {
          setPricingLoading(false);
        }
      }
    };

    loadPricingQuote();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const effectiveQuote = pricingQuote ?? fallbackQuote;

  const paidPlans = useMemo<DisplayPlan[]>(() => {
    const monthlyQuote = effectiveQuote.quotes.monthly;
    const quarterlyQuote = effectiveQuote.quotes.quarterly;

    return [
      {
        tier: 'premium',
        billingCycle: 'monthly',
        name: 'Premium Monthly',
        ...PREMIUM_PLAN_CONTENT.premium,
        description: 'Best for steady monthly access to all premium features.',
        displayPrice: monthlyQuote.displayLabel,
        pricingNote: getPricingNote(monthlyQuote.region, monthlyQuote.displayCurrency),
        highlight: true,
        cta: 'Start Monthly Plan',
      },
      {
        tier: 'premium',
        billingCycle: 'quarterly',
        name: 'Premium 3-Month',
        ...PREMIUM_PLAN_CONTENT.premium,
        description: 'Commit to three months of uninterrupted premium access.',
        displayPrice: quarterlyQuote.displayLabel,
        pricingNote: getPricingNote(quarterlyQuote.region, quarterlyQuote.displayCurrency),
        highlight: true,
        tag: '3 Months',
        cta: 'Start 3-Month Plan',
      },
    ];
  }, [effectiveQuote]);

  const primaryPaidPlan = paidPlans[0];

  const displayPlans = useMemo<DisplayPlan[]>(
    () => [FREE_PLAN, ...paidPlans],
    [paidPlans],
  );

  const handleComparePlans = () => {
    planSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStartPlan = async (plan: DisplayPlan) => {
    if (!user?.email) {
      showError('Please sign in to continue.');
      return;
    }

    if (plan.tier === 'free' || !plan.billingCycle) {
      showError('This plan is not payable.');
      return;
    }

    if (isPremium && activeTier === plan.tier && activeBillingCycle === plan.billingCycle) {
      showSuccess('Your subscription is already active.');
      return;
    }

    try {
      setLoadingPlanKey(`premium:${plan.billingCycle}`);
      const initResponse = await API.Payment.pay({
        tier: 'premium',
        billingCycle: plan.billingCycle,
      });

      if (!initResponse.authorizationUrl) {
        throw new Error('Payment initialization failed. Missing authorization URL.');
      }

      window.location.assign(initResponse.authorizationUrl);
    } catch (error: unknown) {
      setLoadingPlanKey(null);
      showError(getErrorMessage(error, 'Unable to start payment.'));
    }
  };

  const mainContent = (
    <div className="flex-1">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.25),_transparent_55%)]" />
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative px-6 py-12 lg:px-12 lg:py-16">
          <div className="mb-6 flex items-center justify-start">
            <Link
              to="/dashboard"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Back to dashboard"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">
                <Crown className="h-4 w-4 text-pink-300" />
                Premium for intentional believers
              </div>
              <h1 className="text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
                Elevate your love journey with premium connections.
              </h1>
              <p className="text-base text-gray-300 md:text-lg">
                Designed for believers seeking marriage-minded relationships, FaithBliss Premium
                gives you clarity, priority visibility, and a beautifully guided path to the right match.
              </p>
              <p className="text-sm text-gray-400">
                Your displayed price is localized by country. Paystack checkout is processed in NGN.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleStartPlan(primaryPaidPlan)}
                  disabled={
                    pricingLoading ||
                    loadingPlanKey === `premium:${primaryPaidPlan.billingCycle}` ||
                    (isPremium && activeBillingCycle === primaryPaidPlan.billingCycle)
                  }
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:from-pink-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pricingLoading
                    ? 'Loading price...'
                    : isPremium && activeBillingCycle === primaryPaidPlan.billingCycle
                    ? `${getSubscriptionTierLabel(primaryPaidPlan.tier)} Active`
                    : `Start ${getSubscriptionTierLabel(primaryPaidPlan.tier)}`}
                </button>
                <button
                  onClick={handleComparePlans}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10"
                >
                  Compare plans
                </button>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-gray-400">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full max-w-[520px] lg:justify-self-end">
              <div className={`mb-4 rounded-3xl border p-5 shadow-[0_18px_40px_rgba(2,6,23,0.18)] ${
                subscriptionDisplay.isActivePaid
                  ? 'border-yellow-400/30 bg-gradient-to-br from-yellow-500/15 via-pink-500/10 to-transparent'
                  : 'border-white/10 bg-white/5'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">Current plan</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{subscriptionDisplay.tierLabel}</h3>
                    <p className="mt-2 text-sm text-gray-300">
                      {subscriptionDisplay.isActivePaid
                        ? `Your ${activeBillingCycle === 'quarterly' ? '3-month' : 'monthly'} premium benefits are active right now.`
                        : 'You are currently on the free plan.'}
                    </p>
                  </div>
                  <span className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                    subscriptionDisplay.isActivePaid
                      ? 'bg-emerald-500/15 text-emerald-200'
                      : 'bg-white/10 text-gray-300'
                  }`}>
                    {subscriptionDisplay.statusLabel}
                  </span>
                </div>

                {subscriptionDisplay.isActivePaid ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Countdown</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {subscriptionDisplay.countdownLabel || 'Renewal active'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        Next renewal
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {subscriptionDisplay.renewalLabel || 'Auto-renewing'}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section ref={planSectionRef} className="px-6 pb-16 pt-4 lg:px-12">
        <div className="mb-8 flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-200">
            <Zap className="h-4 w-4 text-purple-300" />
            Choose your plan
          </div>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Premium that fits your journey</h2>
          <p className="text-sm text-gray-300">
            Unlock the tools that help you connect intentionally with people who share your faith and values.
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Region: {effectiveQuote.region}{effectiveQuote.countryCode ? ` • ${effectiveQuote.countryCode}` : ''}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {displayPlans.map((plan) => {
            const isCurrentPlan =
              normalizedActiveTier === plan.tier &&
              (plan.tier === 'free' || activeBillingCycle === plan.billingCycle);
            const planKey = plan.billingCycle ? (`premium:${plan.billingCycle}` as const) : null;
            const isPlanLoading = planKey !== null && loadingPlanKey === planKey;

            return (
              <div
                key={`${plan.name}-${plan.billingCycle ?? 'free'}`}
                className={`relative flex h-full flex-col rounded-3xl border p-6 transition ${
                  plan.highlight
                    ? 'border-pink-500/50 bg-gradient-to-br from-pink-500/20 to-purple-600/20 shadow-lg shadow-pink-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {(plan.tag || plan.savingsLabel) && (
                  <div className="mb-5 flex min-h-[2rem] flex-wrap items-start gap-2 pr-16">
                    {plan.savingsLabel && (
                      <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                        {plan.savingsLabel}
                      </div>
                    )}
                    {plan.tag && (
                      <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                        {plan.tag}
                      </div>
                    )}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-300">{plan.description}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-3xl font-semibold text-white">{plan.displayPrice}</span>
                  {plan.tier !== 'free' && (
                    <span className="text-xs text-gray-400">
                      /{plan.billingCycle === 'quarterly' ? '3 months' : 'month'}
                    </span>
                  )}
                </div>
                {plan.originalPrice && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 line-through">{plan.originalPrice}</span>
                    <span className="rounded-full border border-pink-400/30 bg-pink-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-200">
                      Limited pricing
                    </span>
                  </div>
                )}

                <ul className="mt-6 space-y-3 text-sm text-gray-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-pink-300" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.pricingNote ? (
                  <p className="mt-5 text-xs text-gray-400">{plan.pricingNote}</p>
                ) : null}

                <button
                  onClick={() => {
                    handleStartPlan(plan);
                  }}
                  disabled={
                    plan.tier === 'free' ||
                    pricingLoading ||
                    isPlanLoading ||
                    isCurrentPlan
                  }
                  className={`mt-8 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:from-pink-400 hover:to-purple-500'
                      : 'border border-white/15 bg-white/5 text-white/90 hover:border-white/30 hover:bg-white/10'
                  } ${plan.tier === 'free' ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {pricingLoading && plan.tier !== 'free'
                    ? 'Loading price...'
                    : isPlanLoading
                    ? 'Processing...'
                    : isCurrentPlan
                    ? 'Current Plan'
                    : plan.tier === 'free'
                    ? 'Free Plan'
                    : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-16 lg:px-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-white/3 to-white/5 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 text-sm text-pink-200">
                <Sparkles className="h-4 w-4 text-pink-300" />
                Premium experience
              </div>
              <h3 className="text-2xl font-semibold text-white">
                Ready to unlock the full FaithBliss experience?
              </h3>
              <p className="text-sm text-gray-300">
                Join believers discovering meaningful, marriage-minded connections with localized pricing.
              </p>
            </div>
            <button
              onClick={() => handleStartPlan(primaryPaidPlan)}
              disabled={
                pricingLoading ||
                loadingPlanKey === `premium:${primaryPaidPlan.billingCycle}` ||
                (isPremium && activeBillingCycle === primaryPaidPlan.billingCycle)
              }
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pricingLoading
                ? 'Loading price...'
                : isPremium && activeBillingCycle === primaryPaidPlan.billingCycle
                ? `${getSubscriptionTierLabel(primaryPaidPlan.tier)} Active`
                : `Upgrade to ${getSubscriptionTierLabel(primaryPaidPlan.tier)}`}
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 pb-20 text-white no-horizontal-scroll dashboard-main">
      <div className="hidden min-h-screen lg:flex">
        <div className="w-80 flex-shrink-0">
          <SidePanel
            userName={layoutName}
            userImage={layoutImage}
            user={layoutUser}
            onClose={() => setShowSidePanel(false)}
          />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar
            userName={layoutName}
            userImage={layoutImage}
            user={layoutUser}
            showFilters={false}
            showSidePanel={showSidePanel}
            onToggleFilters={() => {}}
            onToggleSidePanel={() => setShowSidePanel(false)}
            title="Premium"
          />
          <div className="flex-1 overflow-y-auto">{mainContent}</div>
        </div>
      </div>

      <div className="min-h-screen lg:hidden">
        <TopBar
          userName={layoutName}
          userImage={layoutImage}
          user={layoutUser}
          showFilters={false}
          showSidePanel={showSidePanel}
          onToggleFilters={() => {}}
          onToggleSidePanel={() => setShowSidePanel(true)}
          title="Premium"
        />
        <div className="flex-1">{mainContent}</div>
      </div>

      {showSidePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowSidePanel(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw]">
            <SidePanel
              userName={layoutName}
              userImage={layoutImage}
              user={layoutUser}
              onClose={() => setShowSidePanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PremiumPage = () => {
  return <PremiumContent />;
};

export default function ProtectedPremium() {
  return (
    <ProtectedRoute>
      <PremiumPage />
    </ProtectedRoute>
  );
}
