// src/controllers/matchController.ts (FIRESTORE REWRITE + FIXED)

import { Request, Response } from 'express';
import { admin, usersCollection } from '../config/firebase-admin';
import { DocumentData, CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { createNotification } from '../services/notificationService';

// --- FIRESTORE DATA STRUCTURES ---

interface IUserProfile extends DocumentData {
  id: string;
  name: string;
  email: string;
  gender: string;
  age: number;
  denomination: string;
  location?: string;
  profilePhoto1?: string;
  onboardingCompleted: boolean;
  likes?: string[];
  passes?: string[];
  matches?: string[];
}

interface IMatch extends DocumentData {
  id: string;
  users: string[];
  createdAt: Timestamp;
}

interface IMessage extends DocumentData {
  id: string;
  matchId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  unreadBy?: string[];
  createdAt: Timestamp;
}

// Firestore references
const db = admin.firestore();
const matchesCollection: CollectionReference = db.collection('matches');
const messagesCollection: CollectionReference = db.collection('messages');

// Helper: safely extract message from unknown error
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

// Helper to fetch current user profile
const fetchCurrentUser = async (req: Request, res: Response): Promise<IUserProfile | null> => {
  const uid = req.userId;

  if (!uid) {
    console.warn('?? fetchCurrentUser: Missing UID from request context.');
    res.status(401).json({ message: 'Unauthorized: Firebase UID missing from request context.' });
    return null;
  }

  try {
    console.log(`?? Fetching current user profile for UID: ${uid}`);
    const userDoc = await usersCollection.doc(uid).get();

    if (!userDoc.exists) {
      console.warn(`?? No Firestore user profile found for UID: ${uid}`);
      res.status(404).json({ message: 'User profile not found in database.' });
      return null;
    }

    const user = { ...userDoc.data(), id: userDoc.id } as IUserProfile;
    console.log(`? Fetched current user: ${user.name} (${user.id})`);
    return user;
  } catch (error) {
    const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('?? Database fetch error:', errorMessage);
    res.status(500).json({ message: `Server Error fetching user profile: ${errorMessage}` });
    return null;
  }
};


// =======================================================
// 1?? GET /api/matches/potential
// =======================================================
const getPotentialMatches = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  try {
    console.log(`?? [getPotentialMatches] Fetching potential matches for ${currentUser.id}`);

    const excludedUids = new Set<string>([
      currentUser.id,
      ...(currentUser.likes || []),
      ...(currentUser.passes || []),
    ].map(String));

    const matchIds = Array.isArray(currentUser.matches) ? currentUser.matches : [];
    if (matchIds.length > 0) {
      const matchDocs = await Promise.all(
        matchIds.map((matchId) => matchesCollection.doc(String(matchId)).get())
      );
      matchDocs.forEach((doc) => {
        const data = doc.data() as IMatch | undefined;
        const users = data?.users || [];
        users.forEach((uid) => {
          if (uid && uid !== currentUser.id) {
            excludedUids.add(String(uid));
          }
        });
      });
    }

    // Serve a Tinder/Hinge-style feed:
    // - include all registered users
    // - scan in pages so exclusions do not empty the initial result accidentally
    const FEED_SIZE = 40;
    const QUERY_PAGE_SIZE = 120;
    const MAX_SCAN_PAGES = 10;

    const potentialMatches: IUserProfile[] = [];
    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
    let scannedPages = 0;

    while (potentialMatches.length < FEED_SIZE && scannedPages < MAX_SCAN_PAGES) {
      let query = usersCollection
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(QUERY_PAGE_SIZE);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        break;
      }

      snapshot.forEach((doc) => {
        const candidate = { id: doc.id, ...doc.data() } as IUserProfile;
        if (!excludedUids.has(candidate.id)) {
          potentialMatches.push(candidate);
        }
      });

      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      scannedPages += 1;
    }

    console.log(`? Potential matches returned: ${potentialMatches.length}`);
    res.status(200).json(
      potentialMatches.map((u) => ({
        id: u.id,
        name: u.name,
        age: u.age,
        gender: u.gender,
        denomination: u.denomination,
        location: u.location,
        profilePhoto1: u.profilePhoto1,
      }))
    );
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('?? Error fetching potential matches:', msg);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};


// =======================================================
// 2?? POST /api/matches/like/:userId
// =======================================================
const likeUser = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  const { userId: targetUid } = req.params;
  const currentUid = currentUser.id;
  console.log(`?? Like request from ${currentUid} ? ${targetUid}`);

  if (currentUid === targetUid) {
    console.warn('?? User tried to like themselves.');
    return res.status(400).json({ message: 'Cannot like yourself.' });
  }

  try {
    const currentLikes = Array.isArray(currentUser.likes) ? currentUser.likes.map(String) : [];
    if (currentLikes.includes(String(targetUid))) {
      return res.status(200).json({
        message: 'Like already recorded',
        isMatch: false,
        alreadyLiked: true,
      });
    }

    const batch = db.batch();
    const currentUserRef = usersCollection.doc(currentUid);
    batch.update(currentUserRef, {
      likes: admin.firestore.FieldValue.arrayUnion(targetUid),
    });

    const targetUserDoc = await usersCollection.doc(targetUid).get();
    if (!targetUserDoc.exists) {
      console.warn(`?? Target user not found: ${targetUid}`);
      return res.status(404).json({ message: 'Target user not found.' });
    }

    const targetUser = { id: targetUserDoc.id, ...targetUserDoc.data() } as IUserProfile;
    const targetLikes = Array.isArray(targetUser.likes) ? targetUser.likes : [];
    const isMatch = targetLikes.includes(currentUid);

    if (isMatch) {
      const newMatchRef = matchesCollection.doc();
      const matchId = newMatchRef.id;

      console.log(`?? Mutual match detected! Creating match ${matchId}`);

      batch.set(newMatchRef, {
        users: [currentUid, targetUid],
        createdAt: admin.firestore.Timestamp.now(),
      });

      const targetUserRef = usersCollection.doc(targetUid);
      batch.update(currentUserRef, {
        matches: admin.firestore.FieldValue.arrayUnion(matchId),
      });
      batch.update(targetUserRef, {
        matches: admin.firestore.FieldValue.arrayUnion(matchId),
      });
    }

    await batch.commit();
    console.log(`? Like processed successfully. Match: ${isMatch}`);

    if (isMatch) {
      await Promise.all([
        createNotification({
          userId: currentUid,
          type: 'NEW_MATCH',
          message: `You matched with ${targetUser.name || 'a user'}`,
          data: { otherUserId: targetUid },
        }),
        createNotification({
          userId: targetUid,
          type: 'NEW_MATCH',
          message: `You matched with ${currentUser.name || 'a user'}`,
          data: { otherUserId: currentUid },
        }),
      ]);
    } else {
      await createNotification({
        userId: targetUid,
        type: 'PROFILE_LIKED',
        message: `${currentUser.name || 'Someone'} liked your profile`,
        data: { senderId: currentUid },
      });
    }

    res.status(200).json({
      message: isMatch ? "It's a Match!" : 'Like recorded',
      isMatch,
    });
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('?? Error liking user:', msg);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};

// =======================================================
// 3?? POST /api/matches/pass/:userId
// =======================================================
const passUser = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  const { userId: targetUid } = req.params;
  const currentUid = currentUser.id;

  if (currentUid === targetUid) {
    return res.status(400).json({ message: 'Cannot pass yourself.' });
  }

  try {
    await usersCollection.doc(currentUid).update({
      passes: admin.firestore.FieldValue.arrayUnion(targetUid),
    });
    console.log(`?? User ${currentUid} passed on ${targetUid}`);
    res.status(204).send();
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('Error passing user:', error);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};

// =======================================================
// 4?? GET /api/messages/conversations
// =======================================================
const getMatchConversations = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  const currentUid = currentUser.id;
  const requestedLimit = Number(req.query.limit);
  const safeLimit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.floor(requestedLimit), 1), 50)
    : 25;
  const requestedCursor = Number(req.query.cursor);
  const safeCursor = Number.isFinite(requestedCursor)
    ? Math.max(Math.floor(requestedCursor), 0)
    : 0;

  try {
    const matchIds = currentUser.matches || [];
    if (matchIds.length === 0) return res.status(200).json([]);

    const matchDocs = await Promise.all(
      matchIds.map((id) => matchesCollection.doc(id).get())
    );

    const allMatches: IMatch[] = matchDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() } as IMatch));

    // Keep first payload small to improve page load time.
    const sortedMatches = allMatches
      .sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );

    const matches = sortedMatches.slice(safeCursor, safeCursor + safeLimit);

    const otherUids = matches
      .map((m) => m.users.find((u) => u !== currentUid))
      .filter(Boolean) as string[];

    const userDocs = await Promise.all(
      otherUids.map((uid) => usersCollection.doc(uid).get())
    );

    const userMap = new Map<string, Pick<IUserProfile, 'id' | 'name' | 'profilePhoto1'>>();
    userDocs.forEach((doc) => {
      if (doc.exists) {
        const d = doc.data() as IUserProfile;
        userMap.set(doc.id, { id: doc.id, name: d.name, profilePhoto1: d.profilePhoto1 });
      }
    });

    // Query unread messages once, then group per match to avoid N+1 unread queries.
    const unreadSnap = await messagesCollection
      .where('unreadBy', 'array-contains', currentUid)
      .get();

    const unreadCountByMatch = new Map<string, number>();
    unreadSnap.forEach((doc) => {
      const data = doc.data() as IMessage;
      const mid = data.matchId;
      if (!mid) return;
      unreadCountByMatch.set(mid, (unreadCountByMatch.get(mid) || 0) + 1);
    });

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const lastMessageSnap = await messagesCollection
          .where('matchId', '==', match.id)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        const lastMsgDoc = lastMessageSnap.docs[0];
        const lastMsg = lastMsgDoc
          ? ({ id: lastMsgDoc.id, ...lastMsgDoc.data() } as IMessage)
          : null;

        const otherUid = match.users.find((u) => u !== currentUid);
        const otherUser = userMap.get(otherUid || '');

        const updatedAt =
          lastMsg?.createdAt.toDate().toISOString() ||
          match.createdAt.toDate().toISOString();

        return {
          id: match.id,
          otherUser: otherUser || null,
          lastMessage: lastMsg
            ? { content: lastMsg.content, createdAt: lastMsg.createdAt.toDate().toISOString() }
            : null,
          unreadCount: unreadCountByMatch.get(match.id) || 0,
          updatedAt,
        };
      })
    );

    conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const nextCursor =
      safeCursor + matches.length < sortedMatches.length
        ? String(safeCursor + matches.length)
        : null;

    res.status(200).json({
      items: conversations,
      nextCursor,
      hasMore: nextCursor !== null,
    });
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};

// =======================================================
// 5?? GET /api/messages/:matchId
// =======================================================
const getMatchMessages = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  const { matchId } = req.params;
  const currentUid = currentUser.id;

  try {
    const matchDoc = await matchesCollection.doc(matchId).get();
    if (!matchDoc.exists) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    const match = { id: matchDoc.id, ...matchDoc.data() } as IMatch;
    if (!match.users.includes(currentUid)) {
      return res.status(403).json({ message: 'You are not part of this match.' });
    }

    const otherUid = match.users.find((u) => u !== currentUid)!;

    const msgSnap = await messagesCollection
      .where('matchId', '==', matchId)
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();

    const messages = msgSnap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as IMessage)
    );

    const otherDoc = await usersCollection.doc(otherUid).get();
    if (!otherDoc.exists) {
      return res.status(404).json({ message: 'Matched user profile not found.' });
    }

    const otherUser = { id: otherDoc.id, ...otherDoc.data() } as IUserProfile;

    const batch = db.batch();
    let hasBatchUpdates = false;
    const responseMessages = messages.map((m) => {
      const unreadBy = Array.isArray(m.unreadBy) ? m.unreadBy : [];
      const isRead = !unreadBy.includes(currentUid);
      if (!isRead && m.senderId !== currentUid) {
        const msgRef = messagesCollection.doc(m.id);
        batch.update(msgRef, {
          unreadBy: admin.firestore.FieldValue.arrayRemove(currentUid),
        });
        hasBatchUpdates = true;
      }
      return {
        id: m.id,
        matchId: m.matchId,
        senderId: m.senderId,
        receiverId: m.receiverId || (m.senderId === currentUid ? otherUser.id : currentUser.id),
        content: m.content,
        createdAt: m.createdAt.toDate().toISOString(),
        isRead,
      };
    });

    if (hasBatchUpdates) {
      await batch.commit();
    }

    res.status(200).json({
      match: {
        id: matchId,
        users: [
          { id: currentUser.id, name: currentUser.name, profilePhoto1: currentUser.profilePhoto1 },
          { id: otherUser.id, name: otherUser.name, profilePhoto1: otherUser.profilePhoto1 },
        ],
      },
      messages: responseMessages,
    });
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};

// =======================================================
// 6?? GET /api/messages/unread-count
// =======================================================
const getUnreadCount = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  try {
    const currentUid = currentUser.id;
    const unreadSnap = await messagesCollection
      .where('unreadBy', 'array-contains', currentUid)
      .get();
    res.status(200).json({ count: unreadSnap.size });
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('Error calculating unread count:', error);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};

// =======================================================
// 7?? PATCH /api/messages/:messageId/read
// =======================================================
const markMessageAsRead = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  try {
    const currentUid = currentUser.id;
    const { messageId } = req.params;

    const msgRef = messagesCollection.doc(messageId);
    const msgDoc = await msgRef.get();
    if (!msgDoc.exists) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    const msgData = msgDoc.data() as IMessage;
    const unreadBy = Array.isArray(msgData.unreadBy) ? msgData.unreadBy : [];
    if (!unreadBy.includes(currentUid)) {
      return res.status(200).json({ success: true });
    }

    await msgRef.update({
      unreadBy: admin.firestore.FieldValue.arrayRemove(currentUid),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('Error marking message as read:', msg);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};

// =======================================================
// 7?? GET /api/matches/mutual
// =======================================================
const getMutualMatches = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  try {
    console.log(`?? [getMutualMatches] UID: ${currentUser.id}`);
    const allUsersSnap = await usersCollection.get();
    const mutualMatches: IUserProfile[] = [];

    allUsersSnap.forEach((doc) => {
      const user = { id: doc.id, ...doc.data() } as IUserProfile;

      if (
        user.id !== currentUser.id &&
        user.likes?.includes(currentUser.id) &&
        currentUser.likes?.includes(user.id)
      ) {
        mutualMatches.push(user);
      }
    });

    console.log(`? Mutual matches found: ${mutualMatches.length}`);
    res.status(200).json({ matches: mutualMatches });
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('?? Error fetching mutual matches:', msg);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};

// =======================================================
// 8?? GET /api/matches/sent
// =======================================================
const getSentMatches = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  try {
    console.log(`?? [getSentMatches] UID: ${currentUser.id}`);
    const sentIds = currentUser.likes || [];
    console.log(`?? Sent IDs:`, sentIds);

    if (sentIds.length === 0) {
      console.log('?? No sent matches found.');
      return res.status(200).json({ matches: [] });
    }

    const sentDocs = await Promise.all(sentIds.map((id) => usersCollection.doc(id).get()));
    const sentMatches = sentDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() } as IUserProfile));

    console.log(`? Sent matches found: ${sentMatches.length}`);
    res.status(200).json({ matches: sentMatches });
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('?? Error fetching sent matches:', msg);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};

// =======================================================
// 9?? GET /api/matches/received
// =======================================================
const getReceivedMatches = async (req: Request, res: Response) => {
  const currentUser = await fetchCurrentUser(req, res);
  if (!currentUser) return;

  try {
    console.log(`?? [getReceivedMatches] UID: ${currentUser.id}`);
    const allUsersSnap = await usersCollection.get();
    const receivedMatches: IUserProfile[] = [];

    allUsersSnap.forEach((doc) => {
      const user = { id: doc.id, ...doc.data() } as IUserProfile;
      if (
        user.id !== currentUser.id &&
        user.likes?.includes(currentUser.id) &&
        !currentUser.likes?.includes(user.id)
      ) {
        receivedMatches.push(user);
      }
    });

    console.log(`? Received matches found: ${receivedMatches.length}`);
    res.status(200).json({ matches: receivedMatches });
  } catch (error) {
    const msg = isErrorWithMessage(error) ? error.message : 'Unknown error';
    console.error('?? Error fetching received matches:', msg);
    res.status(500).json({ message: `Server Error: ${msg}` });
  }
};


// =======================================================
// EXPORTS
// =======================================================
export {
  getPotentialMatches,
  likeUser,
  passUser,
  getMatchConversations,
  getMatchMessages,
  getUnreadCount,
  markMessageAsRead,
  getMutualMatches,
  getSentMatches,
  getReceivedMatches,
};
