// src/pages/Premium.tsx

import { useMemo, useRef, useState } from 'react';
import {
  Crown,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Star,
  Zap,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { API } from '@/services/api';
import { useNavigate } from 'react-router-dom';

type Plan = {
  tier: 'free' | 'premium' | 'elite';
  name: string;
  price: {
    USD: string;
    NGN: string;
  };
  description: string;
  highlight?: boolean;
  tag?: string;
  features: string[];
  cta: string;
};

const plans: Plan[] = [
  {
    tier: 'free',
    name: 'FaithBliss Free',
    price: { USD: '$0', NGN: '₦0' },
    description: 'All the essentials to start meaningful connections.',
    features: [
      'Unlimited likes',
      'Daily curated matches',
      '1:1 messaging after matching',
      'Basic profile customization',
    ],
    cta: 'Current Plan',
  },
  {
    tier: 'premium',
    name: 'FaithBliss Premium',
    price: { USD: '$14', NGN: 'NGN 15,000' },
    description: 'Unlock deeper filters and priority visibility.',
    highlight: true,
    tag: 'Most Loved',
    features: [
      'See who liked you instantly',
      'Advanced faith & values filters',
      'Boosted profile discovery',
      'Message read receipts',
      'Weekly profile insights',
    ],
    cta: 'Upgrade to Premium',
  },
  {
    tier: 'elite',
    name: 'FaithBliss Elite',
    price: { USD: '$24', NGN: 'NGN 25,000' },
    description: 'The complete experience for intentional matching.',
    tag: 'Best Value',
    features: [
      'Everything in Premium',
      'Exclusive Elite profiles',
      'Priority support & coaching',
      'Invisible browsing mode',
      'Unlimited profile rewinds',
    ],
    cta: 'Go Elite',
  },
];

const highlights = [
  {
    icon: Sparkles,
    title: 'Spirit-led matching',
    description: 'Get curated matches based on faith alignment, calling, and values.',
  },
  {
    icon: HeartHandshake,
    title: 'Mutual intent',
    description: 'See serious, relationship-minded believers who share your goals.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & verified',
    description: 'Premium verification and moderation keep the community trusted.',
  },
  {
    icon: MessageCircle,
    title: 'Meaningful chats',
    description: 'Send prompts, audio blessings, and keep conversations flowing.',
  },
];

const badges = [
  'Verified community',
  'Faith-first matching',
  'Zero ads',
  'Cancel anytime',
];

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, any>) => { openIframe: () => void };
    };
  }
}

const PremiumContent = () => {
  const { user } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const planSectionRef = useRef<HTMLDivElement | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const [loadingTier, setLoadingTier] = useState<'premium' | 'elite' | null>(null);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;
  const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const isPremium = user?.subscriptionStatus === 'active' && ['premium', 'elite'].includes(user?.subscriptionTier || '');
  const activeTier = user?.subscriptionTier || 'free';

  const heroStats = useMemo(
    () => [
      { label: 'Faith-forward matches', value: '3x' },
      { label: 'Response rate', value: '72%' },
      { label: 'Verified profiles', value: '15k+' },
    ],
    [],
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

  const handleStartPlan = async (tier: 'premium' | 'elite') => {
    if (!user?.email) {
      showError('Please sign in to continue.');
      return;
    }
    if (isPremium && activeTier === tier) {
      showSuccess('Your subscription is already active.');
      return;
    }
    if (!paystackKey) {
      showError('Paystack public key is missing.');
      return;
    }

    try {
      setLoadingTier(tier);
      await loadPaystackScript();
      const initResponse = await API.Payment.initialize({ tier, currency });
      const accessCode = initResponse.accessCode;
      const reference = initResponse.reference;

      if (!accessCode || !reference) {
        throw new Error('Payment initialization failed. Missing access code or reference.');
      }

      const handler = window.PaystackPop?.setup({
        key: paystackKey,
        email: user.email,
        currency,
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
    } catch (error: any) {
      setLoadingTier(null);
      showError(error?.message || 'Unable to start payment.');
    }
  };

  const mainContent = (
    <div className="flex-1">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.25),_transparent_55%)]" />
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">
                <Crown className="h-4 w-4 text-pink-300" />
                Premium for intentional believers
              </div>
              <h1 className="text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
                Elevate your faith journey with premium connections.
              </h1>
              <p className="text-base text-gray-300 md:text-lg">
                Designed for believers seeking marriage-minded relationships, FaithBliss Premium
                gives you clarity, priority visibility, and a beautifully guided path to the right match.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleStartPlan('premium')}
                  disabled={loadingTier === 'premium' || (isPremium && activeTier === 'premium')}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:from-pink-400 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPremium && activeTier === 'premium' ? 'Premium Active' : 'Start Premium'}
                </button>
                <button
                  onClick={handleComparePlans}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10"
                >
                  Compare plans
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="uppercase tracking-[0.2em] text-gray-500">Currency</span>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                  {(['USD', 'NGN'] as const).map((code) => (
                    <button
                      key={code}
                      onClick={() => setCurrency(code)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                        currency === code
                          ? 'bg-white text-gray-900'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-gray-400">
                {badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full max-w-[520px] lg:justify-self-end">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6">
                <div className="grid grid-cols-3 gap-4">
                  {heroStats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`text-center ${index !== 0 ? 'border-l border-white/10 pl-4' : ''}`}
                    >
                      <div className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
                        {stat.value}
                      </div>
                      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-400 sm:text-[11px] lg:text-xs">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-4 text-left">
                <div className="flex items-center gap-2 text-sm text-pink-100">
                  <Star className="h-4 w-4 text-pink-300" />
                  Premium members meet faster
                </div>
                <p className="mt-2 text-xs text-gray-200">
                  Premium profiles appear first to your highest potential matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="px-6 pb-12 pt-4 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-pink-500/40 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-200">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={planSectionRef} className="px-6 pb-16 lg:px-12">
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

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-3xl border p-6 transition ${
                plan.highlight
                  ? 'border-pink-500/50 bg-gradient-to-br from-pink-500/20 to-purple-600/20 shadow-lg shadow-pink-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {plan.tag && (
                <div className="absolute right-6 top-6 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {plan.tag}
                </div>
              )}
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-300">{plan.description}</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-semibold text-white">{plan.price[currency]}</span>
                <span className="text-xs text-gray-400">/month</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-300" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.tier !== 'free' && handleStartPlan(plan.tier)}
                disabled={
                  plan.tier === 'free' ||
                  loadingTier === plan.tier ||
                  (isPremium && activeTier === plan.tier)
                }
                className={`mt-8 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:from-pink-400 hover:to-purple-500'
                    : 'border border-white/15 bg-white/5 text-white/90 hover:border-white/30 hover:bg-white/10'
                } ${plan.tier === 'free' ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {loadingTier === plan.tier
                  ? 'Processing...'
                  : isPremium && activeTier === plan.tier
                  ? 'Current Plan'
                  : plan.cta}
              </button>
            </div>
          ))}
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
              <h3 className="text-2xl font-semibold text-white">Ready to unlock the full FaithBliss experience?</h3>
              <p className="text-sm text-gray-300">
                Join thousands of believers discovering meaningful, marriage-minded connections.
              </p>
            </div>
            <button
              onClick={() => handleStartPlan('premium')}
              disabled={loadingTier === 'premium' || (isPremium && activeTier === 'premium')}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPremium && activeTier === 'premium' ? 'Premium Active' : 'Upgrade now'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white overflow-x-hidden pb-20 no-horizontal-scroll dashboard-main">
      <div className="hidden lg:flex min-h-screen">
        <div className="w-80 flex-shrink-0">
          <SidePanel
            userName={layoutName}
            userImage={layoutImage}
            user={layoutUser}
            onClose={() => setShowSidePanel(false)}
          />
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
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

      <div className="lg:hidden min-h-screen">
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
