// src/services/notificationService.ts
import { admin, usersCollection, db } from '../config/firebase-admin';
import { emitToUser } from '../socket/socket';

type NotificationType = 'PROFILE_LIKED' | 'NEW_MATCH' | 'NEW_MESSAGE' | 'STORY_POSTED';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  data?: Record<string, any>;
}

const sendEmail = async (to: string, subject: string, text: string) => {
  const webhook = process.env.EMAIL_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text }),
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
};

export const createNotification = async ({
  userId,
  type,
  message,
  data = {},
}: CreateNotificationInput) => {
  const notificationRef = await db.collection('notifications').add({
    userId,
    type,
    message,
    data,
    isRead: false,
    createdAt: admin.firestore.Timestamp.now(),
  });

  emitToUser(userId, {
    id: notificationRef.id,
    type,
    message,
    data,
    createdAt: new Date().toISOString(),
  });

  const userDoc = await usersCollection.doc(userId).get();
  const email = userDoc.exists ? (userDoc.data() as any)?.email : null;
  if (email) {
    const subject =
      type === 'PROFILE_LIKED'
        ? 'You have a new like'
        : type === 'NEW_MATCH'
        ? "It's a match!"
        : type === 'STORY_POSTED'
        ? 'A new story was posted'
        : 'New message on FaithBliss';
    await sendEmail(email, subject, message);
  }
};
