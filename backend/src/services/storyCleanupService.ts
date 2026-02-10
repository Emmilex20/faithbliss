import { admin, db } from '../config/firebase-admin';
import { cloudinaryUploader } from '../config/cloudinaryConfig';

type StoryCleanupItem = {
  mediaPublicId?: string;
  mediaType?: 'image' | 'video';
};

const storiesCollection = db.collection('stories');
const DEFAULT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const BATCH_SIZE = 100;

let cleanupIntervalRef: NodeJS.Timeout | null = null;
let isCleanupRunning = false;

const removeStoryMedia = async (story: StoryCleanupItem) => {
  if (!story.mediaPublicId) {
    return;
  }

  try {
    await cloudinaryUploader.uploader.destroy(story.mediaPublicId, {
      resource_type: story.mediaType === 'video' ? 'video' : 'image',
    });
  } catch {
    // Best effort. We still delete the story doc so expired stories disappear.
  }
};

const cleanupExpiredStories = async () => {
  if (isCleanupRunning) {
    return;
  }

  isCleanupRunning = true;
  try {
    const now = admin.firestore.Timestamp.now();

    while (true) {
      const snapshot = await storiesCollection
        .where('expiresAt', '<=', now)
        .limit(BATCH_SIZE)
        .get();

      if (snapshot.empty) {
        break;
      }

      await Promise.all(
        snapshot.docs.map(async (doc) => {
          const story = doc.data() as StoryCleanupItem;
          await removeStoryMedia(story);
          await doc.ref.delete();
        })
      );

      if (snapshot.size < BATCH_SIZE) {
        break;
      }
    }
  } finally {
    isCleanupRunning = false;
  }
};

const startStoryCleanupService = () => {
  if (cleanupIntervalRef) {
    return;
  }

  cleanupExpiredStories().catch(() => {
    // Silence startup cleanup errors; next interval will retry.
  });

  cleanupIntervalRef = setInterval(() => {
    cleanupExpiredStories().catch(() => {
      // Silence scheduled cleanup errors; next interval will retry.
    });
  }, DEFAULT_CLEANUP_INTERVAL_MS);
};

export { startStoryCleanupService, cleanupExpiredStories };
