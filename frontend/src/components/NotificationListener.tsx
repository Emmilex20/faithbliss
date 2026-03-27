import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuthContext } from '@/contexts/AuthContext';
import { MatchCelebrationOverlay } from '@/components/dashboard/MatchCelebrationOverlay';
import {
  dispatchNotificationsUpdated,
  showSystemNotification,
} from '@/lib/notificationCenter';
import { API } from '@/services/api';

type NotificationPayload = {
  id?: string;
  type: 'NEW_MESSAGE' | 'PROFILE_LIKED' | 'NEW_MATCH' | 'STORY_POSTED' | 'REPORT_SUBMITTED' | 'SUPPORT_REPLY' | string;
  message: string;
  data?: Record<string, unknown>;
  createdAt?: string;
};

type MatchCelebration = {
  notificationId: string;
  matchedUserId: string;
  matchedUserName: string;
  matchedUserPhoto?: string;
};

const MAX_STORED_NOTIFICATION_IDS = 250;

export const NotificationListener = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const webSocketService = useWebSocket();
  const { showSuccess, showInfo } = useToast();
  const [celebrationQueue, setCelebrationQueue] = useState<MatchCelebration[]>([]);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());

  const storageKey = useMemo(() => {
    const userId = user?.id ? String(user.id) : '';
    return userId ? `faithbliss_seen_notifications:${userId}` : '';
  }, [user?.id]);

  const persistSeenIds = useCallback(() => {
    if (!storageKey) return;
    try {
      const entries = Array.from(seenNotificationIdsRef.current).slice(-MAX_STORED_NOTIFICATION_IDS);
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      // Ignore localStorage failures.
    }
  }, [storageKey]);

  const buildNotificationId = useCallback((payload: NotificationPayload) => {
    const fallbackId = `${payload.type}:${payload.data?.otherUserId || payload.data?.senderId || 'unknown'}:${payload.createdAt || payload.message}`;
    return String(payload.id || fallbackId);
  }, []);

  const hasSeenNotification = useCallback((notificationId: string) => {
    return seenNotificationIdsRef.current.has(notificationId);
  }, []);

  const markNotificationSeen = useCallback((notificationId: string) => {
    if (!notificationId || seenNotificationIdsRef.current.has(notificationId)) return;
    seenNotificationIdsRef.current.add(notificationId);
    persistSeenIds();
  }, [persistSeenIds]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    if (!notificationId) return;
    try {
      await API.Notification.markAsRead(notificationId);
    } catch {
      // Ignore notification read failures. Local seen-state still prevents duplicates.
    }
  }, []);

  const enqueueMatchCelebration = useCallback(async (payload: NotificationPayload) => {
    const notificationId = buildNotificationId(payload);
    if (payload.id) {
      void markNotificationRead(notificationId);
    }

    const matchedUserId =
      typeof payload.data?.otherUserId === 'string' && payload.data.otherUserId.trim()
        ? payload.data.otherUserId.trim()
        : '';

    let matchedUserName = 'New Match';
    let matchedUserPhoto: string | undefined;

    if (matchedUserId) {
      try {
        const matchedUser = await API.User.getUserById(matchedUserId);
        matchedUserName = matchedUser?.name || matchedUserName;
        matchedUserPhoto =
          matchedUser?.profilePhoto1 || matchedUser?.profilePhoto2 || matchedUser?.profilePhoto3 || undefined;
      } catch {
        // Fall back to the notification message.
      }
    }

    if (matchedUserName === 'New Match' && payload.message) {
      const extractedName = payload.message.replace(/^You matched with\s+/i, '').trim();
      if (extractedName) {
        matchedUserName = extractedName;
      }
    }

    setCelebrationQueue((current) => {
      if (current.some((item) => item.notificationId === notificationId)) {
        return current;
      }

      return [
        ...current,
        {
          notificationId,
          matchedUserId,
          matchedUserName,
          matchedUserPhoto,
        },
      ];
    });
  }, [buildNotificationId, markNotificationRead]);

  const processNotification = useCallback(async (payload: NotificationPayload) => {
    const notificationId = buildNotificationId(payload);
    if (hasSeenNotification(notificationId)) return;

    markNotificationSeen(notificationId);
    dispatchNotificationsUpdated();

    if (payload.type === 'NEW_MATCH') {
      showSuccess(payload.message || "It's a match!", 'Match');
      void enqueueMatchCelebration(payload);
    } else if (payload.type === 'PROFILE_LIKED') {
      showInfo(payload.message || 'You received a new like', 'New Like');
    } else if (payload.type === 'NEW_MESSAGE') {
      showInfo(payload.message || 'You received a new message', 'Message');
    } else if (payload.type === 'SUPPORT_REPLY') {
      showInfo(payload.message || 'FaithBliss support replied to you', 'Support Reply');
    } else if (payload.type === 'REPORT_SUBMITTED') {
      showInfo(payload.message || 'A new issue report was submitted', 'Reported Issue');
    } else if (payload.type === 'STORY_POSTED') {
      showInfo(payload.message || 'A mutual user posted a new story', 'New Story');
    } else {
      showInfo(payload.message || 'You have a new notification', 'Notification');
    }

    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      await showSystemNotification(payload);
    }
  }, [buildNotificationId, enqueueMatchCelebration, hasSeenNotification, markNotificationSeen, showInfo, showSuccess]);

  useEffect(() => {
    if (!storageKey) {
      seenNotificationIdsRef.current = new Set();
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      const items = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
      seenNotificationIdsRef.current = new Set(items);
    } catch {
      seenNotificationIdsRef.current = new Set();
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isAuthenticated || !webSocketService) return;

    const handleNotification = (payload: NotificationPayload) => {
      void processNotification(payload);
    };

    webSocketService.onNotification(handleNotification);
    return () => {
      webSocketService.off('notification', handleNotification);
    };
  }, [isAuthenticated, processNotification, webSocketService]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCelebrationQueue([]);
      return;
    }

    let cancelled = false;

    const syncUnreadNotifications = async () => {
      try {
        const notifications = await API.Notification.getNotifications();
        if (cancelled || !Array.isArray(notifications)) return;

        const unseenNotifications = notifications.filter((item) => {
          const notification = item as NotificationPayload;
          const notificationId = buildNotificationId(notification);
          const isUnread = (item as { isRead?: unknown }).isRead !== true;
          return notificationId && isUnread && !hasSeenNotification(notificationId);
        });

        for (const notification of unseenNotifications.reverse()) {
          if (cancelled) break;
          await processNotification(notification as NotificationPayload);
        }
      } catch {
        // Ignore transient notification sync errors.
      }
    };

    void syncUnreadNotifications();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        void syncUnreadNotifications();
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void syncUnreadNotifications();
      }
    }, 30000);

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [buildNotificationId, hasSeenNotification, isAuthenticated, processNotification]);

  const activeCelebration = celebrationQueue[0] || null;

  const closeCelebration = () => {
    setCelebrationQueue((current) => current.slice(1));
  };

  const handleChat = () => {
    const current = activeCelebration;
    closeCelebration();

    if (!current?.matchedUserId) {
      navigate('/matches');
      return;
    }

    navigate(
      `/messages?profileId=${encodeURIComponent(current.matchedUserId)}&profileName=${encodeURIComponent(current.matchedUserName || '')}`
    );
  };

  return (
    <>
      <MatchCelebrationOverlay
        open={Boolean(activeCelebration)}
        currentUserName={user?.name || 'You'}
        currentUserPhoto={user?.profilePhoto1 || undefined}
        matchedUserName={activeCelebration?.matchedUserName || 'New Match'}
        matchedUserPhoto={activeCelebration?.matchedUserPhoto}
        onContinue={closeCelebration}
        onChat={handleChat}
      />
    </>
  );
};
