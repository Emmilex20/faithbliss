// src/controllers/paymentController.ts

import { Request, Response } from 'express';
import crypto from 'crypto';
import * as admin from 'firebase-admin';
import { usersCollection } from '../config/firebase-admin';
import { getPlanDetails, initializeTransaction, verifyTransaction } from '../services/paystackService';
import { extractClientIp } from '../services/geoLocationService';
import {
  initializeLocalizedPayment as createLocalizedPayment,
  type LocalizedCurrency,
} from '../services/localizedPaymentService';

type PlanTier = 'premium' | 'elite';
type Currency = 'NGN' | 'USD';
type PaymentCurrency = Currency | LocalizedCurrency;
type PublicPlan = {
  tier: PlanTier;
  name: string;
  amount: number;
  currency: PaymentCurrency;
  interval: 'monthly';
};
type StoredSubscription = {
  status?: string;
  tier?: string;
  currency?: string;
  planCode?: string | null;
  reference?: string;
  customerCode?: string;
  subscriptionCode?: string;
  authorizationCode?: string;
  nextPaymentDate?: string;
};

const PLAN_METADATA: Record<PlanTier, { name: string }> = {
  premium: { name: 'Premium Plan' },
  elite: { name: 'Pro Plan' },
};

const USD_PRICE_CATALOG: Record<PlanTier, number> = {
  premium: 6.99,
  elite: 12.99,
};

const removeUndefinedValues = <T extends Record<string, any>>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
};

const resolvePlanConfig = (tier: PlanTier, currency: Currency) => {
  const envSuffix = `${tier}_${currency}`.toUpperCase();
  const planCode = process.env[`PAYSTACK_PLAN_CODE_${envSuffix}`]?.trim();
  const amountRaw = process.env[`PAYSTACK_AMOUNT_${envSuffix}`];
  const fallbackAmount = amountRaw ? Number(amountRaw) : 0;

  if (!planCode) {
    throw new Error(`Missing PAYSTACK_PLAN_CODE_${envSuffix}. Create the plan in Paystack and set this env var.`);
  }
  if (!fallbackAmount || Number.isNaN(fallbackAmount)) {
    throw new Error(`Missing PAYSTACK_AMOUNT_${envSuffix}`);
  }

  return { planCode, fallbackAmount };
};

const resolveLivePlanConfig = async (tier: PlanTier, currency: Currency) => {
  const { planCode, fallbackAmount } = resolvePlanConfig(tier, currency);

  try {
    const response = await getPlanDetails(planCode);
    const liveAmount = typeof response?.data?.amount === 'number' ? response.data.amount : fallbackAmount;
    const liveCurrency = typeof response?.data?.currency === 'string'
      ? response.data.currency.trim().toUpperCase()
      : currency;

    return {
      planCode,
      amount: liveAmount,
      currency: (liveCurrency === 'USD' ? 'USD' : 'NGN') as Currency,
    };
  } catch {
    return {
      planCode,
      amount: fallbackAmount,
      currency,
    };
  }
};

const listConfiguredPlans = async (): Promise<PublicPlan[]> => {
  const plans: PublicPlan[] = [];
  const tiers: PlanTier[] = ['premium', 'elite'];
  const currencies: Currency[] = ['NGN', 'USD'];

  for (const tier of tiers) {
    for (const currency of currencies) {
      try {
        const { amount, currency: resolvedCurrency } = await resolveLivePlanConfig(tier, currency);
        plans.push({
          tier,
          name: PLAN_METADATA[tier].name,
          amount,
          currency: resolvedCurrency,
          interval: 'monthly',
        });
      } catch {
        continue;
      }
    }
  }

  return plans.sort((left, right) => left.amount - right.amount);
};

const getStoredSubscription = async (userId: string): Promise<StoredSubscription | null> => {
  const snapshot = await usersCollection.doc(userId).get();
  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as Record<string, any> | undefined;
  const subscription = data?.subscription;
  if (!subscription || typeof subscription !== 'object') {
    return null;
  }

  return subscription as StoredSubscription;
};

const resolveTierFromPlanCode = (planCode?: string | null): PlanTier | undefined => {
  const normalizedPlanCode = typeof planCode === 'string' ? planCode.trim() : '';
  if (!normalizedPlanCode) {
    return undefined;
  }

  const tiers: PlanTier[] = ['premium', 'elite'];
  const currencies: Currency[] = ['NGN', 'USD'];

  for (const tier of tiers) {
    for (const currency of currencies) {
      const configuredPlanCode = process.env[`PAYSTACK_PLAN_CODE_${tier.toUpperCase()}_${currency}`]?.trim();
      if (configuredPlanCode && configuredPlanCode === normalizedPlanCode) {
        return tier;
      }
    }
  }

  return undefined;
};

const updateSubscription = async (
  userId: string,
  data: Record<string, any>
) => {
  const sanitizedSubscription = removeUndefinedValues(data);

  await usersCollection.doc(userId).set(
    removeUndefinedValues({
      subscription: {
        ...sanitizedSubscription,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      subscriptionStatus: sanitizedSubscription.status ?? sanitizedSubscription.subscriptionStatus ?? 'active',
      subscriptionTier: sanitizedSubscription.tier ?? sanitizedSubscription.subscriptionTier,
      subscriptionCurrency: sanitizedSubscription.currency ?? sanitizedSubscription.subscriptionCurrency,
    }),
    { merge: true }
  );
};

export const initializeSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const email = (req as any).user?.email || req.body?.email;
    const { tier, currency } = req.body as { tier: PlanTier; currency: Currency };

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Firebase UID missing.' });
    }
    if (!email) {
      return res.status(400).json({ message: 'Email is required for payment.' });
    }
    if (!tier || !['premium', 'elite'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier provided.' });
    }
    if (!currency || !['NGN', 'USD'].includes(currency)) {
      return res.status(400).json({ message: 'Invalid currency provided.' });
    }

    const { planCode, amount, currency: resolvedCurrency } = await resolveLivePlanConfig(tier, currency);

    const payload = {
      email,
      amount,
      currency: resolvedCurrency,
      plan: planCode,
      metadata: {
        userId,
        tier,
        currency: resolvedCurrency,
      },
    };

    const response = await initializeTransaction(payload);

    await updateSubscription(userId, {
      status: 'pending',
      tier,
      currency: resolvedCurrency,
      planCode,
      reference: response.data.reference,
    });

    return res.status(200).json({
      authorizationUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      reference: response.data.reference,
      amount,
      currency: resolvedCurrency,
    });
  } catch (error: any) {
    console.error('Paystack init error:', error);
    const message = error?.message || 'Payment initialization failed.';
    return res.status(400).json({ message });
  }
};

export const initializeLocalizedSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const email = req.user?.email || req.body?.email;
    const { tier, baseUsdPrice } = req.body as { tier?: PlanTier; baseUsdPrice?: number };

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Firebase UID missing.' });
    }
    if (!email) {
      return res.status(400).json({ message: 'Email is required for payment.' });
    }
    if (!tier || !['premium', 'elite'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier provided.' });
    }

    const expectedUsdPrice = USD_PRICE_CATALOG[tier];
    const requestedUsdPrice = Number(baseUsdPrice);
    const resolvedUsdPrice =
      Number.isFinite(requestedUsdPrice) && Math.abs(requestedUsdPrice - expectedUsdPrice) < 0.0001
        ? requestedUsdPrice
        : expectedUsdPrice;

    const callbackBaseUrl = process.env.CLIENT_URL?.trim();
    const callbackUrl = callbackBaseUrl ? `${callbackBaseUrl.replace(/\/+$/, '')}/payment-success` : undefined;

    const payment = await createLocalizedPayment({
      email,
      userId,
      tier,
      baseUsdPrice: resolvedUsdPrice,
      ipAddress: extractClientIp(req.headers as Record<string, unknown>),
      callbackUrl,
    });

    await updateSubscription(userId, {
      status: 'pending',
      tier,
      currency: payment.currency,
      planCode: null,
      reference: payment.reference,
      baseUsdPrice: resolvedUsdPrice,
      exchangeRate: payment.exchangeRate,
      countryCode: payment.countryCode,
      amount: payment.amount,
    });

    return res.status(200).json(payment);
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Localized payment initialization failed.';
    return res.status(400).json({ message });
  }
};

export const listSubscriptionPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await listConfiguredPlans();
    return res.status(200).json({ plans });
  } catch (error: any) {
    return res.status(500).json({ message: error?.message || 'Failed to load plans.' });
  }
};

export const verifySubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { reference } = req.body as { reference: string };

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Firebase UID missing.' });
    }
    if (!reference) {
      return res.status(400).json({ message: 'Reference is required.' });
    }

    const response = await verifyTransaction(reference);
    const data = response.data;
    const existingSubscription = await getStoredSubscription(userId);

    if (data.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful yet.' });
    }

    const metadata = data.metadata || {};
    const rawPlanCode = data.plan?.plan_code || data.plan;
    const tier =
      (typeof metadata.tier === 'string' && metadata.tier.trim().toLowerCase()) ||
      (typeof existingSubscription?.tier === 'string' && existingSubscription.tier.trim().toLowerCase()) ||
      resolveTierFromPlanCode(rawPlanCode) ||
      resolveTierFromPlanCode(existingSubscription?.planCode) ||
      undefined;
    const currency =
      data.currency ||
      metadata.currency ||
      existingSubscription?.currency;
    const planCode =
      (typeof rawPlanCode === 'string' && rawPlanCode.trim()) ||
      (typeof existingSubscription?.planCode === 'string' && existingSubscription.planCode.trim()) ||
      undefined;

    await updateSubscription(userId, {
      status: 'active',
      tier,
      currency,
      reference: data.reference,
      planCode,
      customerCode: data.customer?.customer_code,
      authorizationCode: data.authorization?.authorization_code,
      nextPaymentDate: data.next_payment_date,
    });

    return res.status(200).json({ message: 'Subscription verified', data });
  } catch (error: any) {
    console.error('Paystack verify error:', error);
    return res.status(500).json({ message: error.message || 'Payment verification failed.' });
  }
};

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string | undefined;
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const rawBody = (req as any).rawBody as Buffer | undefined;

    if (!secret || !signature || !rawBody) {
      return res.status(400).json({ message: 'Missing webhook signature or body.' });
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ message: 'Invalid webhook signature.' });
    }

    const event = req.body;
    const data = event?.data || {};
    const metadata = data?.metadata || {};

    let userId = metadata.userId as string | undefined;

    if (!userId && data.customer?.email) {
      const snapshot = await usersCollection
        .where('email', '==', data.customer.email)
        .limit(1)
        .get();
      if (!snapshot.empty) {
        userId = snapshot.docs[0].id;
      }
    }

    if (!userId) {
      return res.status(200).json({ received: true });
    }

    if (['charge.success', 'subscription.create', 'invoice.payment_succeeded'].includes(event.event)) {
      const existingSubscription = await getStoredSubscription(userId);
      const rawPlanCode = data.plan?.plan_code || data.plan;
      const tier =
        (typeof metadata.tier === 'string' && metadata.tier.trim().toLowerCase()) ||
        (typeof existingSubscription?.tier === 'string' && existingSubscription.tier.trim().toLowerCase()) ||
        resolveTierFromPlanCode(rawPlanCode) ||
        resolveTierFromPlanCode(existingSubscription?.planCode) ||
        undefined;
      const currency =
        data.currency ||
        metadata.currency ||
        existingSubscription?.currency;
      const planCode =
        (typeof rawPlanCode === 'string' && rawPlanCode.trim()) ||
        (typeof existingSubscription?.planCode === 'string' && existingSubscription.planCode.trim()) ||
        undefined;

      await updateSubscription(userId, {
        status: 'active',
        tier,
        currency,
        reference: data.reference,
        planCode,
        customerCode: data.customer?.customer_code,
        subscriptionCode: data.subscription?.subscription_code || data.subscription_code,
        authorizationCode: data.authorization?.authorization_code,
        nextPaymentDate: data.next_payment_date,
      });
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return res.status(500).json({ message: error.message || 'Webhook handling failed.' });
  }
};
