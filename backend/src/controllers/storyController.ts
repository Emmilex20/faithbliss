import { Request, Response } from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import { admin, db, usersCollection } from '../config/firebase-admin';
import { cloudinaryUploader } from '../config/cloudinaryConfig';
import { createNotification } from '../services/notificationService';

interface StoryItem {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  mediaPublicId?: string;
  caption?: string;
  seenBy?: string[];
  likedBy?: string[];
  createdAt: FirebaseFirestore.Timestamp;
  expiresAt: FirebaseFirestore.Timestamp;
}

const storiesCollection = db.collection('stories');
const matchesCollection = db.collection('matches');
const messagesCollection = db.collection('messages');

const storyUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      cb(new Error('Only image and video files are allowed.') as any);
      return;
    }
    cb(null, true);
  },
});

const uploadStoryMedia = (
  fileBuffer: Buffer,
  mimetype: string
): Promise<{ mediaUrl: string; mediaPublicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryUploader.uploader.upload_stream(
      {
        folder: 'faithbliss_stories',
        resource_type: mimetype.startsWith('video/') ? 'video' : 'image',
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error || new Error('Story media upload failed'));
          return;
        }
        resolve({ mediaUrl: result.secure_url, mediaPublicId: result.public_id });
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

const getMutualFriendIds = async (currentUserId: string): Promise<Set<string>> => {
  const currentUserDoc = await usersCollection.doc(currentUserId).get();
  const currentUserData = currentUserDoc.data() as { matches?: string[] } | undefined;
  const matchIds = Array.isArray(currentUserData?.matches) ? currentUserData.matches : [];

  const mutualIds = new Set<string>([currentUserId]);
  if (matchIds.length === 0) return mutualIds;

  const matchDocs = await Promise.all(matchIds.map((matchId) => matchesCollection.doc(matchId).get()));
  matchDocs.forEach((matchDoc) => {
    const data = matchDoc.data() as { users?: string[] } | undefined;
    (data?.users || []).forEach((uid) => {
      if (uid) mutualIds.add(uid);
    });
  });

  return mutualIds;
};

const findMatchIdBetweenUsers = async (userAId: string, userBId: string): Promise<string | null> => {
  const userDoc = await usersCollection.doc(userAId).get();
  const userData = userDoc.data() as { matches?: string[] } | undefined;
  const matchIds = Array.isArray(userData?.matches) ? userData.matches : [];

  if (matchIds.length === 0) return null;

  const matchDocs = await Promise.all(matchIds.map((matchId) => matchesCollection.doc(matchId).get()));
  for (const matchDoc of matchDocs) {
    if (!matchDoc.exists) continue;
    const data = matchDoc.data() as { users?: string[] } | undefined;
    const users = Array.isArray(data?.users) ? data!.users : [];
    if (users.includes(userAId) && users.includes(userBId)) {
      return matchDoc.id;
    }
  }

  return null;
};

const createStory = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Story media is required.' });
    }

    const { mediaUrl, mediaPublicId } = await uploadStoryMedia(req.file.buffer, req.file.mimetype);
    const mediaType: 'image' | 'video' = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    const caption = typeof req.body?.caption === 'string' ? req.body.caption.trim().slice(0, 220) : '';

    const createdAt = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

    const storyRef = storiesCollection.doc();
    await storyRef.set({
      authorId: currentUserId,
      mediaUrl,
      mediaType,
      mediaPublicId,
      caption,
      seenBy: [currentUserId],
      likedBy: [],
      createdAt,
      expiresAt,
    });

    return res.status(201).json({
      story: {
        id: storyRef.id,
        authorId: currentUserId,
        mediaUrl,
        mediaType,
        caption,
        hasSeen: true,
        seenByCount: 1,
        likesCount: 0,
        likedByCurrentUser: false,
        createdAt: createdAt.toDate().toISOString(),
        expiresAt: expiresAt.toDate().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `Failed to create story: ${message}` });
  }
};

const getStoryFeed = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const mutualIds = await getMutualFriendIds(currentUserId);
    const now = admin.firestore.Timestamp.now();

    const storiesSnapshot = await storiesCollection.where('expiresAt', '>', now).get();
    const activeStories = storiesSnapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<StoryItem, 'id'>) }))
      .filter((story) => mutualIds.has(story.authorId));

    const authorIds = Array.from(new Set(activeStories.map((story) => story.authorId)));
    const authorDocs = await Promise.all(authorIds.map((uid) => usersCollection.doc(uid).get()));
    const authorMap = new Map<string, { name: string; profilePhoto1?: string }>();

    authorDocs.forEach((doc) => {
      if (!doc.exists) return;
      const data = doc.data() as { name?: string; profilePhoto1?: string };
      authorMap.set(doc.id, {
        name: data.name || 'Unknown User',
        profilePhoto1: data.profilePhoto1,
      });
    });

    const grouped = new Map<string, any>();
    activeStories.forEach((story) => {
      const storySeenBy = Array.isArray(story.seenBy) ? story.seenBy : [];
      const hasSeen = storySeenBy.includes(currentUserId);
      const storyLikedBy = Array.isArray(story.likedBy) ? story.likedBy : [];
      const likedByCurrentUser = storyLikedBy.includes(currentUserId);

      const existing = grouped.get(story.authorId) || {
        authorId: story.authorId,
        authorName: authorMap.get(story.authorId)?.name || 'Unknown User',
        authorPhoto: authorMap.get(story.authorId)?.profilePhoto1 || '',
        isCurrentUser: story.authorId === currentUserId,
        latestCreatedAt: story.createdAt.toDate().toISOString(),
        unseenCount: 0,
        items: [],
      };

      existing.items.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption || '',
        hasSeen,
        seenByCount: storySeenBy.length,
        likesCount: storyLikedBy.length,
        likedByCurrentUser,
        createdAt: story.createdAt.toDate().toISOString(),
        expiresAt: story.expiresAt.toDate().toISOString(),
      });

      if (!hasSeen && story.authorId !== currentUserId) {
        existing.unseenCount += 1;
      }

      if (new Date(existing.latestCreatedAt).getTime() < story.createdAt.toDate().getTime()) {
        existing.latestCreatedAt = story.createdAt.toDate().toISOString();
      }

      grouped.set(story.authorId, existing);
    });

    const stories = Array.from(grouped.values())
      .map((storyGroup) => ({
        ...storyGroup,
        items: storyGroup.items.sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      }))
      .sort((a, b) => {
        if (a.isCurrentUser && !b.isCurrentUser) return -1;
        if (!a.isCurrentUser && b.isCurrentUser) return 1;
        if (a.unseenCount > 0 && b.unseenCount === 0) return -1;
        if (a.unseenCount === 0 && b.unseenCount > 0) return 1;
        return new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime();
      });

    return res.status(200).json({ stories });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `Failed to load stories: ${message}` });
  }
};

const markStorySeen = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { storyId } = req.params;
    const storyRef = storiesCollection.doc(storyId);
    const storyDoc = await storyRef.get();

    if (!storyDoc.exists) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = storyDoc.data() as StoryItem;
    if (story.expiresAt.toMillis() <= Date.now()) {
      return res.status(410).json({ message: 'Story has expired.' });
    }

    await storyRef.update({
      seenBy: admin.firestore.FieldValue.arrayUnion(currentUserId),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `Failed to mark story as seen: ${message}` });
  }
};

const toggleStoryLike = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { storyId } = req.params;
    const storyRef = storiesCollection.doc(storyId);
    const storyDoc = await storyRef.get();

    if (!storyDoc.exists) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = storyDoc.data() as StoryItem;
    if (story.expiresAt.toMillis() <= Date.now()) {
      return res.status(410).json({ message: 'Story has expired.' });
    }

    const likedBy = Array.isArray(story.likedBy) ? story.likedBy : [];
    const hasLiked = likedBy.includes(currentUserId);

    if (hasLiked) {
      await storyRef.update({
        likedBy: admin.firestore.FieldValue.arrayRemove(currentUserId),
      });
      return res.status(200).json({ liked: false, likesCount: Math.max(0, likedBy.length - 1) });
    }

    await storyRef.update({
      likedBy: admin.firestore.FieldValue.arrayUnion(currentUserId),
    });

    if (story.authorId !== currentUserId) {
      const likerDoc = await usersCollection.doc(currentUserId).get();
      const likerName = (likerDoc.data() as { name?: string } | undefined)?.name || 'Someone';
      await createNotification({
        userId: story.authorId,
        type: 'PROFILE_LIKED',
        message: `${likerName} liked your story`,
        data: { storyId },
      });
    }

    return res.status(200).json({ liked: true, likesCount: likedBy.length + 1 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `Failed to like story: ${message}` });
  }
};

const getStoryLikes = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { storyId } = req.params;
    const storyDoc = await storiesCollection.doc(storyId).get();
    if (!storyDoc.exists) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = storyDoc.data() as StoryItem;
    if (story.authorId !== currentUserId) {
      return res.status(403).json({ message: 'Only the story owner can view likes list.' });
    }

    const likedBy = Array.isArray(story.likedBy) ? story.likedBy : [];
    if (likedBy.length === 0) {
      return res.status(200).json({ users: [], count: 0 });
    }

    const mutualIds = await getMutualFriendIds(story.authorId);
    const likerIds = likedBy.filter((uid) => uid !== story.authorId && mutualIds.has(uid));

    if (likerIds.length === 0) {
      return res.status(200).json({ users: [], count: 0 });
    }

    const likerDocs = await Promise.all(likerIds.map((uid) => usersCollection.doc(uid).get()));
    const users = likerDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data() as { name?: string; profilePhoto1?: string } | undefined;
        return {
          id: doc.id,
          name: data?.name || 'Unknown User',
          profilePhoto1: data?.profilePhoto1 || '',
        };
      });

    return res.status(200).json({ users, count: users.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `Failed to load story likes: ${message}` });
  }
};

const replyToStory = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { storyId } = req.params;
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required.' });
    }

    const storyDoc = await storiesCollection.doc(storyId).get();
    if (!storyDoc.exists) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = storyDoc.data() as StoryItem;
    if (story.expiresAt.toMillis() <= Date.now()) {
      return res.status(410).json({ message: 'Story has expired.' });
    }

    if (story.authorId === currentUserId) {
      return res.status(400).json({ message: 'Cannot reply to your own story.' });
    }

    const matchId = await findMatchIdBetweenUsers(currentUserId, story.authorId);
    if (!matchId) {
      return res.status(403).json({ message: 'You can reply only to stories from mutual matches.' });
    }

    const messageRef = await messagesCollection.add({
      matchId,
      senderId: currentUserId,
      receiverId: story.authorId,
      content: `Replied to your story: ${content}`,
      isRead: false,
      unreadBy: [story.authorId],
      createdAt: admin.firestore.Timestamp.now(),
    });

    await createNotification({
      userId: story.authorId,
      type: 'NEW_MESSAGE',
      message: 'You have a new story reply',
      data: { matchId, senderId: currentUserId, storyId },
    });

    return res.status(201).json({
      success: true,
      matchId,
      message: {
        id: messageRef.id,
        matchId,
        senderId: currentUserId,
        receiverId: story.authorId,
        content: `Replied to your story: ${content}`,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `Failed to reply to story: ${message}` });
  }
};

const deleteStory = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { storyId } = req.params;
    const storyRef = storiesCollection.doc(storyId);
    const storyDoc = await storyRef.get();

    if (!storyDoc.exists) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = storyDoc.data() as StoryItem;
    if (story.authorId !== currentUserId) {
      return res.status(403).json({ message: 'You can only delete your own story.' });
    }

    if (story.mediaPublicId) {
      try {
        await cloudinaryUploader.uploader.destroy(story.mediaPublicId, {
          resource_type: story.mediaType === 'video' ? 'video' : 'image',
        });
      } catch {
        // Continue deleting DB doc even if media cleanup fails.
      }
    }

    await storyRef.delete();
    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `Failed to delete story: ${message}` });
  }
};

export { storyUpload, createStory, getStoryFeed, markStorySeen, toggleStoryLike, getStoryLikes, replyToStory, deleteStory };
