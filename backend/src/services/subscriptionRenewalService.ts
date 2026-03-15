import * as admin from 'firebase-admin';
import { usersCollection } from '../config/firebase-admin';
import { chargeAuthorization } from './paystackService';

type BillingCycle = 'monthly' | 'quarterly';

type StoredSubscription = {
  status?: string;
  tier?: string;
  currency?: string;
  billingCycle?: BillingCycle;
  pricingRegion?: string;
  displayCurrency?: string;
  displayAmountMajor?: number;
  chargeAmountMajor?: number;
  chargeAmountSubunits?: number;
  exchangeRate?: number;
  reference?: string;
  authorizationCode?: string;
  customerEmail?: string;
  renewalProvider?: 'plan' | 'authorization';
  autoRenewEnabled?: boolean;
  lastChargeAttemptAt?: string;
  nextPaymentDate?: string;
};

const DEFAULT_RENEWAL_INTERVAL_MS = 15 * 60 * 1000;
const DEFAULT_RENEWAL_ATTEMPT_COOLDOWN_MS = 30 * 60 * 1000;

let renewalIntervalRef: NodeJS.Timeout | null = null;
let isRenewalRunInProgress = false;

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : new Date(timestamp);
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
};

const addSubscriptionDuration = (date: Date, billingCycle: BillingCycle | undefined): Date => {
  const nextDate = new Date(date);
  if (billingCycle === 'quarterly') {
    nextDate.setMonth(nextDate.getMonth() + 3);
    return nextDate;
  }
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
};

const shouldAttemptRenewal = (subscription: StoredSubscription, now: number) => {
  if (subscription.status !== 'active') return false;
  if (subscription.renewalProvider !== 'authorization') return false;
  if (subscription.autoRenewEnabled === false) return false;
  if (subscription.pricingRegion !== 'global') return false;
  if (!subscription.authorizationCode || !subscription.customerEmail) return false;
  if (typeof subscription.chargeAmountSubunits !== 'number' || subscription.chargeAmountSubunits <= 0) return false;

  const nextPaymentDate = parseDate(subscription.nextPaymentDate);
  if (!nextPaymentDate || nextPaymentDate.getTime() > now) return false;

  const lastAttemptAt = parseDate(subscription.lastChargeAttemptAt);
  if (lastAttemptAt && now - lastAttemptAt.getTime() < DEFAULT_RENEWAL_ATTEMPT_COOLDOWN_MS) {
    return false;
  }

  return true;
};

const buildRenewalReference = (userId: string) => `renew.${userId}.${Date.now()}`;

const processDueGlobalSubscriptionRenewals = async () => {
  if (isRenewalRunInProgress) {
    return;
  }

  isRenewalRunInProgress = true;
  try {
    const snapshot = await usersCollection.where('subscriptionStatus', '==', 'active').get();
    const now = Date.now();

    for (const doc of snapshot.docs) {
      const user = doc.data() as Record<string, any>;
      const subscription = (user.subscription || {}) as StoredSubscription;

      if (!shouldAttemptRenewal(subscription, now)) {
        continue;
      }

      const reference = buildRenewalReference(doc.id);
      const lastChargeAttemptAt = new Date(now).toISOString();

      await doc.ref.set(
        {
          subscription: {
            ...subscription,
            reference,
            lastChargeAttemptAt,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      try {
        const response = await chargeAuthorization({
          authorization_code: subscription.authorizationCode!,
          email: subscription.customerEmail!,
          amount: subscription.chargeAmountSubunits!,
          currency: subscription.currency || 'NGN',
          reference,
          queue: true,
          metadata: {
            userId: doc.id,
            productType: 'subscription',
            isRenewal: true,
            tier: subscription.tier || 'premium',
            billingCycle: subscription.billingCycle || 'monthly',
            pricingRegion: subscription.pricingRegion || 'global',
            displayCurrency: subscription.displayCurrency || 'USD',
            displayAmountMajor: subscription.displayAmountMajor || 0,
            chargeAmountMajor: subscription.chargeAmountMajor || 0,
            chargeAmountSubunits: subscription.chargeAmountSubunits || 0,
            exchangeRate: subscription.exchangeRate,
            renewalProvider: 'authorization',
          },
        });

        if (response.status && response.data?.status === 'success') {
          await doc.ref.set(
            {
              subscription: {
                ...subscription,
                status: 'active',
                reference,
                lastChargeAttemptAt: admin.firestore.FieldValue.delete(),
                nextPaymentDate: addSubscriptionDuration(
                  new Date(),
                  subscription.billingCycle === 'quarterly' ? 'quarterly' : 'monthly'
                ).toISOString(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch {
        // Best effort. We'll retry after the cooldown window.
      }
    }
  } finally {
    isRenewalRunInProgress = false;
  }
};

const startSubscriptionRenewalService = () => {
  if (renewalIntervalRef) {
    return;
  }

  processDueGlobalSubscriptionRenewals().catch(() => {
    // Silence startup renewal errors; next interval will retry.
  });

  renewalIntervalRef = setInterval(() => {
    processDueGlobalSubscriptionRenewals().catch(() => {
      // Silence scheduled renewal errors; next interval will retry.
    });
  }, DEFAULT_RENEWAL_INTERVAL_MS);
};

export { processDueGlobalSubscriptionRenewals, startSubscriptionRenewalService };
