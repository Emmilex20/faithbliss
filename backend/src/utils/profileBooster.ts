import { admin, usersCollection } from '../config/firebase-admin';

export const PROFILE_BOOST_DURATION_MS = 60 * 60 * 1000;
export const PROFILE_BOOST_SUBSCRIPTION_GRANT_CREDITS = 1;
export const PROFILE_BOOST_PURCHASE_CREDITS = 5;

export class ProfileBoosterError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ProfileBoosterError';
    this.statusCode = statusCode;
  }
}

const normalizeCredits = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const normalizeIsoDate = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
};

const isActivePaidTier = (userData: Record<string, unknown> | undefined): boolean => {
  const status = typeof userData?.subscriptionStatus === 'string'
    ? userData.subscriptionStatus.trim().toLowerCase()
    : '';
  const tier = typeof userData?.subscriptionTier === 'string'
    ? userData.subscriptionTier.trim().toLowerCase()
    : '';

  return status === 'active' && (tier === 'premium' || tier === 'elite');
};

export const getActiveProfileBoosterUntil = (userData: Record<string, unknown> | undefined): string | null => {
  const normalized = normalizeIsoDate(userData?.profileBoosterActiveUntil);
  if (!normalized) return null;

  return Date.parse(normalized) > Date.now() ? normalized : null;
};

export const isProfileBoosterActive = (userData: Record<string, unknown> | undefined): boolean =>
  Boolean(getActiveProfileBoosterUntil(userData));

export const grantProfileBoosterForPayment = async (
  userId: string,
  reference: string | undefined | null,
  creditsToGrant = PROFILE_BOOST_SUBSCRIPTION_GRANT_CREDITS
): Promise<{ granted: boolean; credits: number }> => {
  if (!userId || !reference || !reference.trim()) {
    return { granted: false, credits: 0 };
  }

  const normalizedGrantCredits = Math.max(1, Math.floor(creditsToGrant));

  const userRef = usersCollection.doc(userId);
  const normalizedReference = reference.trim();

  return userRef.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists) {
      throw new ProfileBoosterError('User not found for booster grant.', 404);
    }

    const userData = (snapshot.data() || {}) as Record<string, unknown>;
    const lastGrantedReference =
      typeof userData.profileBoosterLastGrantedReference === 'string'
        ? userData.profileBoosterLastGrantedReference.trim()
        : '';

    const existingCredits = normalizeCredits(userData.profileBoosterCredits);

    if (lastGrantedReference === normalizedReference) {
      return { granted: false, credits: existingCredits };
    }

    const nextCredits = existingCredits + normalizedGrantCredits;
    transaction.set(
      userRef,
      {
        profileBoosterCredits: nextCredits,
        profileBoosterLastGrantedReference: normalizedReference,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { granted: true, credits: nextCredits };
  });
};

export const activateProfileBoosterForUser = async (
  userId: string
): Promise<{ activeUntil: string; remainingCredits: number }> => {
  if (!userId) {
    throw new ProfileBoosterError('Unauthorized: missing user context.', 401);
  }

  const userRef = usersCollection.doc(userId);

  return userRef.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists) {
      throw new ProfileBoosterError('User profile not found.', 404);
    }

    const userData = (snapshot.data() || {}) as Record<string, unknown>;
    if (!isActivePaidTier(userData)) {
      throw new ProfileBoosterError('An active premium subscription is required to use a booster.', 403);
    }

    const currentActiveUntil = getActiveProfileBoosterUntil(userData);
    if (currentActiveUntil) {
      throw new ProfileBoosterError(`A profile boost is already active until ${currentActiveUntil}.`, 409);
    }

    const existingCredits = normalizeCredits(userData.profileBoosterCredits);
    if (existingCredits < 1) {
      throw new ProfileBoosterError('No profile boosters available. Your next premium payment will add one.', 409);
    }

    const now = new Date();
    const nextActiveUntil = new Date(now.getTime() + PROFILE_BOOST_DURATION_MS).toISOString();
    const remainingCredits = existingCredits - 1;

    transaction.set(
      userRef,
      {
        profileBoosterCredits: remainingCredits,
        profileBoosterActiveUntil: nextActiveUntil,
        profileBoosterLastUsedAt: now.toISOString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      activeUntil: nextActiveUntil,
      remainingCredits,
    };
  });
};
