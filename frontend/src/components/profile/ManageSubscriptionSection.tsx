import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CreditCard,
  Globe2,
  Headphones,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { User } from '@/types/User';
import { getSubscriptionTierLabel } from '@/constants/subscriptionPlans';
import { useSubscriptionDisplay } from '@/hooks/useSubscriptionDisplay';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { API } from '@/services/api';

interface ManageSubscriptionSectionProps {
  user?: User | null;
}

const formatCurrencyAmount = (currency: string, amount?: number) => {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  try {
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  }
};

const getStatusLabel = (status?: string) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'active') return 'Active';
  if (normalized === 'pending') return 'Pending';
  return 'Inactive';
};

const getRegionLabel = (region?: string) => {
  switch (String(region || '').toLowerCase()) {
    case 'nigeria':
      return 'Nigeria';
    case 'africa':
      return 'Africa';
    case 'global':
      return 'Global';
    default:
      return 'Localized';
  }
};

const getBillingCycleLabel = (billingCycle?: string) => {
  return billingCycle === 'quarterly' ? 'Every 3 months' : 'Monthly';
};

const ManageSubscriptionSection: React.FC<ManageSubscriptionSectionProps> = ({ user }) => {
  const { refetchUser } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const subscriptionDisplay = useSubscriptionDisplay(user);
  const subscription = user?.subscription;
  const isActivePaid = subscriptionDisplay.isActivePaid;
  const tierLabel = isActivePaid
    ? getSubscriptionTierLabel(user?.subscriptionTier || 'premium')
    : 'FaithBliss Free';
  const displayPrice = formatCurrencyAmount(
    subscription?.displayCurrency || subscription?.currency || 'NGN',
    subscription?.displayAmountMajor || subscription?.chargeAmountMajor,
  );
  const chargePrice = formatCurrencyAmount(
    subscription?.currency || 'NGN',
    subscription?.chargeAmountMajor,
  );
  const pricingRegion = String(subscription?.pricingRegion || '').toLowerCase();
  const renewsWithSavedCard = pricingRegion === 'global';
  const canToggleAutoRenew = isActivePaid;
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(subscription?.autoRenewEnabled !== false);
  const [isUpdatingAutoRenew, setIsUpdatingAutoRenew] = useState(false);

  useEffect(() => {
    setAutoRenewEnabled(subscription?.autoRenewEnabled !== false);
  }, [subscription?.autoRenewEnabled]);

  const renewalModeLabel = !isActivePaid
    ? 'Not active'
    : autoRenewEnabled
    ? renewsWithSavedCard
      ? 'Saved card auto-debit'
      : 'Paystack plan renewal'
    : 'Auto-debit paused';

  const handleToggleAutoRenew = async () => {
    if (!canToggleAutoRenew || isUpdatingAutoRenew) {
      return;
    }

    const nextEnabled = !autoRenewEnabled;
    setIsUpdatingAutoRenew(true);

    try {
      const response = await API.Payment.updateSubscriptionAutoRenew({ enabled: nextEnabled });
      setAutoRenewEnabled(response.autoRenewEnabled);
      await refetchUser();
      showSuccess(response.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update auto-debit.';
      showError(message);
    } finally {
      setIsUpdatingAutoRenew(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.18)] sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">
            Manage subscription
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Billing and renewal overview</h2>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            Review your plan, renewal timing, localized pricing, and control whether your card should keep renewing automatically.
          </p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
          isActivePaid ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/10 text-gray-300'
        }`}>
          <BadgeCheck className="h-3.5 w-3.5" />
          {getStatusLabel(user?.subscriptionStatus)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Current plan</p>
          <p className="mt-3 text-lg font-semibold text-white">{tierLabel}</p>
          <p className="mt-1 text-sm text-gray-400">
            {isActivePaid ? 'Premium access is live on your account.' : 'No active paid subscription right now.'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Billing cycle</p>
          <p className="mt-3 text-lg font-semibold text-white">
            {isActivePaid ? getBillingCycleLabel(subscription?.billingCycle) : 'Not active'}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {isActivePaid ? 'Your plan keeps the same cycle until you switch it.' : 'Choose monthly or quarterly on the premium page.'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {autoRenewEnabled ? 'Next renewal' : 'Access ends'}
          </p>
          <p className="mt-3 text-lg font-semibold text-white">
            {subscriptionDisplay.renewalLabel || 'Not scheduled'}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {autoRenewEnabled
              ? subscriptionDisplay.countdownLabel || 'We will show your next renewal here once billing is active.'
              : 'Auto-debit is paused. Your plan stays active until the current billing window ends.'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Localized price</p>
          <p className="mt-3 text-lg font-semibold text-white">{displayPrice || 'Unavailable'}</p>
          <p className="mt-1 text-sm text-gray-400">
            {getRegionLabel(subscription?.pricingRegion)} pricing
            {chargePrice ? ` - charged as ${chargePrice}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Automatic billing</h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                {isActivePaid
                  ? renewsWithSavedCard
                    ? 'Your global subscription renews with the saved card authorization from your last successful checkout unless you pause auto-debit below.'
                    : 'Your Nigeria or Africa subscription renews through your Paystack recurring plan unless you pause auto-debit below.'
                  : 'Once you subscribe, your renewal details and auto-debit controls will appear here.'}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Auto-debit switch</p>
                <p className="mt-1 text-sm text-gray-400">
                  {isActivePaid
                    ? autoRenewEnabled
                      ? 'Recurring billing is active on this subscription.'
                      : 'Recurring billing is paused. You will not be charged again until you turn it back on.'
                    : 'Subscribe first to manage recurring billing.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoRenewEnabled}
                onClick={() => void handleToggleAutoRenew()}
                disabled={!canToggleAutoRenew || isUpdatingAutoRenew}
                className={`inline-flex h-12 w-24 items-center rounded-full border px-1 transition ${
                  autoRenewEnabled
                    ? 'border-emerald-400/30 bg-emerald-500/20'
                    : 'border-white/10 bg-black/20'
                } ${
                  !canToggleAutoRenew || isUpdatingAutoRenew ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                    autoRenewEnabled
                      ? 'translate-x-12 bg-emerald-300 text-slate-900'
                      : 'translate-x-0 bg-white text-slate-900'
                  }`}
                >
                  {isUpdatingAutoRenew ? '...' : autoRenewEnabled ? 'On' : 'Off'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                <Globe2 className="h-3.5 w-3.5" />
                Pricing region
              </p>
              <p className="mt-2 text-base font-semibold text-white">{getRegionLabel(subscription?.pricingRegion)}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                <RefreshCw className="h-3.5 w-3.5" />
                Renewal mode
              </p>
              <p className="mt-2 text-base font-semibold text-white">{renewalModeLabel}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            You can now pause or resume auto-debit yourself here. Full subscription cancellation and refund handling still goes through support.
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Next steps</h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                {isActivePaid
                  ? 'Switch plans, review pricing, pause renewals, or get help before your upcoming billing date.'
                  : 'Start a premium plan to unlock auto-renewing subscription access.'}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              to="/premium"
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-pink-400 hover:to-purple-500"
            >
              {isActivePaid ? 'Change or review plan' : 'Upgrade to premium'}
            </Link>

            <Link
              to="/help"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10"
            >
              <Headphones className="h-4 w-4" />
              Contact billing support
            </Link>

            {isActivePaid ? (
              <Link
                to="/premium"
                className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-black/30"
              >
                Manage boosters
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManageSubscriptionSection;
