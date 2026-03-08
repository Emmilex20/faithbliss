import type { User } from '@/types/User';
import { getSubscriptionTierLabel } from '@/constants/subscriptionPlans';

const PAID_TIERS = new Set(['premium', 'elite']);
const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
const QUARTER_IN_MS = 90 * 24 * 60 * 60 * 1000;

const parseDateLike = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    const parsed = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

export const getSubscriptionRenewalDate = (user?: User | null): Date | null => {
  if (!user) return null;

  const nextPaymentDate = parseDateLike(user.subscription?.nextPaymentDate);
  if (nextPaymentDate) {
    return nextPaymentDate;
  }

  const updatedAt = parseDateLike(user.subscription?.updatedAt);
  if (updatedAt && user.subscriptionStatus === 'active' && PAID_TIERS.has(user.subscriptionTier || '')) {
    const billingCycle = user.subscription?.billingCycle;
    const duration = billingCycle === 'quarterly' ? QUARTER_IN_MS : MONTH_IN_MS;
    return new Date(updatedAt.getTime() + duration);
  }

  return null;
};

export const getSubscriptionCountdownLabel = (renewalDate: Date | null): string | null => {
  if (!renewalDate) return null;

  const diff = renewalDate.getTime() - Date.now();
  if (diff <= 0) {
    return null;
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${Math.max(minutes, 1)}m left`;
};

export const formatSubscriptionDate = (date: Date | null): string | null => {
  if (!date) return null;

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const getSubscriptionDisplay = (user?: User | null) => {
  const tier = user?.subscriptionTier || 'free';
  const isActivePaid = Boolean(
    user?.subscriptionStatus === 'active' && PAID_TIERS.has(tier)
  );
  const tierLabel = isActivePaid ? getSubscriptionTierLabel(tier) : 'FaithBliss Free';
  const renewalDate = isActivePaid ? getSubscriptionRenewalDate(user) : null;
  const countdownLabel = isActivePaid ? getSubscriptionCountdownLabel(renewalDate) : null;
  const renewalLabel = isActivePaid ? formatSubscriptionDate(renewalDate) : null;

  return {
    isActivePaid,
    tier,
    tierLabel,
    countdownLabel,
    renewalLabel,
    statusLabel: isActivePaid ? 'Active Plan' : 'Free Plan',
  };
};
