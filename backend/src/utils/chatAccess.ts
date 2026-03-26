import { usersCollection, admin } from '../config/firebase-admin';

type LimitedChatUser = {
  matches?: unknown;
  subscriptionStatus?: string;
  subscriptionTier?: string;
};

type ChatAccessMatch = {
  id: string;
  createdAt?: unknown;
};

export const FREE_CHAT_LIMIT_MESSAGE =
  'Free plan allows 1 active chat at a time. Upgrade to premium or unmatch your current active chat to unlock another conversation.';

const matchesCollection = admin.firestore().collection('matches');

const normalizeIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String).filter(Boolean) : [];

const toMillis = (value: unknown): number => {
  if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
    try {
      return (value as { toDate: () => Date }).toDate().getTime();
    } catch {
      return 0;
    }
  }

  if (value instanceof Date) return value.getTime();

  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const hasUnlimitedChatAccess = (
  user: Pick<LimitedChatUser, 'subscriptionStatus' | 'subscriptionTier'>
): boolean =>
  user.subscriptionStatus === 'active'
  && ['premium', 'elite'].includes(String(user.subscriptionTier || '').toLowerCase());

export const resolveActiveChatMatchIdFromMatches = (
  matches: ChatAccessMatch[]
): string | null => {
  if (!Array.isArray(matches) || matches.length === 0) return null;

  const sortedMatches = [...matches].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
  return sortedMatches[0]?.id || null;
};

export const getChatAccessStateForUser = async (user: LimitedChatUser): Promise<{
  hasUnlimitedAccess: boolean;
  activeMatchId: string | null;
}> => {
  if (hasUnlimitedChatAccess(user)) {
    return {
      hasUnlimitedAccess: true,
      activeMatchId: null,
    };
  }

  const matchIds = normalizeIdList(user.matches);
  if (matchIds.length === 0) {
    return {
      hasUnlimitedAccess: false,
      activeMatchId: null,
    };
  }

  const matchDocs = await Promise.all(matchIds.map((matchId) => matchesCollection.doc(matchId).get()));
  const matches = matchDocs
    .filter((doc) => doc.exists)
    .map((doc) => ({ id: doc.id, createdAt: doc.data()?.createdAt }));

  return {
    hasUnlimitedAccess: false,
    activeMatchId: resolveActiveChatMatchIdFromMatches(matches),
  };
};

export const getChatAccessStateForUserId = async (userId: string): Promise<{
  hasUnlimitedAccess: boolean;
  activeMatchId: string | null;
}> => {
  const userDoc = await usersCollection.doc(userId).get();
  if (!userDoc.exists) {
    return {
      hasUnlimitedAccess: false,
      activeMatchId: null,
    };
  }

  return getChatAccessStateForUser(userDoc.data() as LimitedChatUser);
};

export const isChatLockedForMatch = (
  accessState: { hasUnlimitedAccess: boolean; activeMatchId: string | null },
  matchId: string
): boolean => {
  if (accessState.hasUnlimitedAccess) return false;
  if (!accessState.activeMatchId) return false;
  return accessState.activeMatchId !== matchId;
};
