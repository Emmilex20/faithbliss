// src/controllers/paymentController.ts

import { Request, Response } from 'express';
import crypto from 'crypto';
import * as admin from 'firebase-admin';
import { usersCollection } from '../config/firebase-admin';
import { initializeTransaction, verifyTransaction } from '../services/paystackService';

type PlanTier = 'premium' | 'elite';
type Currency = 'NGN' | 'USD';

const resolvePlanConfig = (tier: PlanTier, currency: Currency) => {
  const envSuffix = `${tier}_${currency}`.toUpperCase();
  const planCode = process.env[`PAYSTACK_PLAN_CODE_${envSuffix}`];
  const amountRaw = process.env[`PAYSTACK_AMOUNT_${envSuffix}`];
  const amount = amountRaw ? Number(amountRaw) : 0;

  if (!planCode) {
    throw new Error(`Missing PAYSTACK_PLAN_CODE_${envSuffix}. Create the plan in Paystack and set this env var.`);
  }
  if (!amount || Number.isNaN(amount)) {
    throw new Error(`Missing PAYSTACK_AMOUNT_${envSuffix}`);
  }

  return { planCode, amount };
};

const updateSubscription = async (
  userId: string,
  data: Record<string, any>
) => {
  await usersCollection.doc(userId).set(
    {
      subscription: {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      subscriptionStatus: data.status ?? data.subscriptionStatus ?? 'active',
      subscriptionTier: data.tier ?? data.subscriptionTier,
      subscriptionCurrency: data.currency ?? data.subscriptionCurrency,
    },
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

    const { planCode, amount } = resolvePlanConfig(tier, currency);

    const payload = {
      email,
      amount,
      currency,
      plan: planCode,
      metadata: {
        userId,
        tier,
        currency,
      },
    };

    const response = await initializeTransaction(payload);

    await updateSubscription(userId, {
      status: 'pending',
      tier,
      currency,
      planCode,
      reference: response.data.reference,
    });

    return res.status(200).json({
      authorizationUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      reference: response.data.reference,
      amount,
      currency,
    });
  } catch (error: any) {
    console.error('Paystack init error:', error);
    const message = error?.message || 'Payment initialization failed.';
    return res.status(400).json({ message });
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

    if (data.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful yet.' });
    }

    const metadata = data.metadata || {};
    const tier = (metadata.tier || '').toLowerCase();
    const currency = data.currency || metadata.currency;

    await updateSubscription(userId, {
      status: 'active',
      tier,
      currency,
      reference: data.reference,
      planCode: data.plan,
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
    const tier = metadata.tier;
    const currency = data.currency || metadata.currency;

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
      await updateSubscription(userId, {
        status: 'active',
        tier,
        currency,
        reference: data.reference,
        planCode: data.plan?.plan_code || data.plan,
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
