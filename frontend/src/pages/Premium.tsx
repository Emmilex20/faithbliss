// src/pages/Premium.tsx

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { API } from '@/services/api';
import type { SubscriptionPlan } from '@/services/api';
import {
  PREMIUM_PLAN_CONTENT,
  getSubscriptionTierLabel,
} from '@/constants/subscriptionPlans';
import { useSubscriptionDisplay } from '@/hooks/useSubscriptionDisplay';
import { Clock3 } from 'lucide-react';

type DisplayPlan = {
  tier: 'free' | 'premium' | 'elite';
  name: string;
  description: string;
  displayPrice: string;
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

const PREMIUM_MARKETING_PRICE = {
  original: 'NGN 15,000',
  discounted: 'NGN 10,000',
  savingsLabel: 'Save NGN 5,000',
};

const badges = [
  'Verified community',
  'Faith-first matching',
  'Zero ads',
  'Cancel anytime',
];

const formatPlanAmount = (amount: number, currency: 'NGN' | 'USD') => {
  const majorAmount = amount / 100;

  if (currency === 'NGN') {
    return `NGN ${new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(majorAmount)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(majorAmount);
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

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

const PremiumContent = () => {
  const { user, refetchUser } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const planSectionRef = useRef<HTMLDivElement | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [loadingTier, setLoadingTier] = useState<'premium' | 'elite' | null>(null);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;
  const paystackKey = String(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/[\u200B-\u200D\uFEFF\s]+/g, '');
  const isPremium =
    user?.subscriptionStatus === 'active' &&
    ['premium', 'elite'].includes(user?.subscriptionTier || '');
  const activeTier = user?.subscriptionTier || 'free';
  const normalizedActiveTier: DisplayPlan['tier'] = isPremium && ['premium', 'elite'].includes(activeTier)
    ? (activeTier as 'premium' | 'elite')
    : 'free';
  const subscriptionDisplay = useSubscriptionDisplay(user);

  useEffect(() => {
    let active = true;

    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError(null);
        const response = await API.Payment.getPlans();
        if (!active) {
          return;
        }
        setAvailablePlans(Array.isArray(response?.plans) ? response.plans : []);
      } catch (error: unknown) {
        if (!active) {
          return;
        }
        setPlansError(getErrorMessage(error, 'Unable to load plans right now.'));
      } finally {
        if (active) {
          setPlansLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      active = false;
    };
  }, []);

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

  const availableCurrencies = useMemo(
    () => [...new Set(availablePlans.map((plan) => plan.currency))] as Array<'NGN' | 'USD'>,
    [availablePlans],
  );

  useEffect(() => {
    if (availableCurrencies.length === 0) {
      return;
    }

    if (!availableCurrencies.includes(currency)) {
      setCurrency(availableCurrencies[0]);
    }
  }, [availableCurrencies, currency]);

  const paidPlans = useMemo(
    () =>
      availablePlans
        .filter((plan) => plan.currency === currency)
        .filter((plan) => plan.tier === 'premium')
        .sort((left, right) => left.amount - right.amount),
    [availablePlans, currency],
  );

  const primaryPaidPlan = useMemo(
    () => paidPlans.find((plan) => plan.tier === 'premium') ?? paidPlans[0] ?? null,
    [paidPlans],
  );

  const displayPlans = useMemo<DisplayPlan[]>(
    () => [
      FREE_PLAN,
      ...paidPlans.map((plan) => ({
        tier: plan.tier,
        name: plan.name,
        displayPrice:
          plan.currency === 'NGN'
            ? PREMIUM_MARKETING_PRICE.discounted
            : formatPlanAmount(plan.amount, plan.currency),
        originalPrice:
          plan.tier === 'premium' && plan.currency === 'NGN'
            ? PREMIUM_MARKETING_PRICE.original
            : undefined,
        savingsLabel:
          plan.tier === 'premium' && plan.currency === 'NGN'
            ? PREMIUM_MARKETING_PRICE.savingsLabel
            : undefined,
        ...PREMIUM_PLAN_CONTENT[plan.tier],
      })),
    ],
    [paidPlans],
  );

  const loadPaystackScript = () =>
    new Promise<void>((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const existing = document.querySelector('script[data-paystack]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Paystack')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.dataset.paystack = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack'));
      document.body.appendChild(script);
    });

  const handleComparePlans = () => {
    planSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStartPlan = async (plan: SubscriptionPlan) => {
    if (!user?.email) {
      showError('Please sign in to continue.');
      return;
    }

    if (isPremium && activeTier === plan.tier) {
      showSuccess('Your subscription is already active.');
      return;
    }

    if (!/^(pk_test|pk_live)_/i.test(paystackKey)) {
      showError('Paystack public key is missing or invalid.');
      return;
    }

    try {
      setLoadingTier(plan.tier);
      await loadPaystackScript();
      const initResponse = await API.Payment.initialize({
        tier: plan.tier,
        currency: plan.currency,
      });
      const accessCode = initResponse.accessCode;
      const reference = initResponse.reference;

      if (!accessCode || !reference) {
        throw new Error('Payment initialization failed. Missing access code or reference.');
      }

      const handler = window.PaystackPop?.setup({
        key: paystackKey,
        email: user.email,
        amount: initResponse.amount,
        currency: plan.currency,
        access_code: accessCode,
        reference,
        callback: (response: { reference: string }) => {
          setLoadingTier(null);
          navigate(`/payment-success?reference=${encodeURIComponent(response.reference)}`);
        },
        onClose: () => {
          setLoadingTier(null);
          showError('Payment was cancelled.');
        },
      });

      handler?.openIframe();
    } catch (error: unknown) {
      setLoadingTier(null);
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
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => primaryPaidPlan && handleStartPlan(primaryPaidPlan)}
                  disabled={
                    !primaryPaidPlan ||
                    loadingTier === primaryPaidPlan.tier ||
                    (isPremium && activeTier === primaryPaidPlan.tier)
                  }
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:from-pink-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {!primaryPaidPlan
                    ? 'Plans unavailable'
                    : isPremium && activeTier === primaryPaidPlan.tier
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
              {availableCurrencies.length > 1 && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="uppercase tracking-[0.2em] text-gray-500">Currency</span>
                  <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                    {availableCurrencies.map((code) => (
                      <button
                        key={code}
                        onClick={() => setCurrency(code)}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                          currency === code ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                        ? 'Your premium benefits are active and available right now.'
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
                        {subscriptionDisplay.countdownLabel || 'Monthly renewal active'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        Next renewal
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {subscriptionDisplay.renewalLabel || 'Auto-renewing monthly'}
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
        </div>

        {plansError ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
            <p>{plansError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full border border-red-300/30 bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/15"
            >
              Reload plans
            </button>
          </div>
        ) : plansLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-3xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {displayPlans.map((plan) => {
              const isCurrentPlan = normalizedActiveTier === plan.tier;

              return (
              <div
                key={plan.name}
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
                  {plan.tier !== 'free' && <span className="text-xs text-gray-400">/month</span>}
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

                <button
                  onClick={() => {
                    const paidPlan = paidPlans.find((item) => item.tier === plan.tier);
                    if (paidPlan) {
                      handleStartPlan(paidPlan);
                    }
                  }}
                  disabled={
                    plan.tier === 'free' ||
                    loadingTier === plan.tier ||
                    isCurrentPlan
                  }
                  className={`mt-8 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:from-pink-400 hover:to-purple-500'
                      : 'border border-white/15 bg-white/5 text-white/90 hover:border-white/30 hover:bg-white/10'
                  } ${plan.tier === 'free' ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {loadingTier === plan.tier
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
        )}
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
                Join thousands of believers discovering meaningful, marriage-minded connections.
              </p>
            </div>
            <button
              onClick={() => primaryPaidPlan && handleStartPlan(primaryPaidPlan)}
              disabled={
                !primaryPaidPlan ||
                loadingTier === primaryPaidPlan.tier ||
                (isPremium && activeTier === primaryPaidPlan.tier)
              }
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!primaryPaidPlan
                ? 'Plans unavailable'
                : isPremium && activeTier === primaryPaidPlan.tier
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
