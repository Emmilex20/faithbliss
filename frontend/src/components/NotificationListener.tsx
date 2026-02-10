import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuthContext } from '@/contexts/AuthContext';

type NotificationPayload = {
  type: 'NEW_MESSAGE' | 'PROFILE_LIKED' | 'NEW_MATCH' | 'STORY_POSTED' | string;
  message: string;
  data?: Record<string, any>;
};

export const NotificationListener = () => {
  const { isAuthenticated } = useAuthContext();
  const webSocketService = useWebSocket();
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !webSocketService) return;
    const handleNotification = (payload: NotificationPayload) => {
      if (payload.type === 'NEW_MATCH') {
        showSuccess(payload.message || "It's a match!", 'Match');
      } else if (payload.type === 'PROFILE_LIKED') {
        showInfo(payload.message || 'You received a new like', 'New Like');
      } else if (payload.type === 'NEW_MESSAGE') {
        showInfo(payload.message || 'You received a new message', 'Message');
      } else if (payload.type === 'STORY_POSTED') {
        showInfo(payload.message || 'A mutual user posted a new story', 'New Story');
      } else {
        showInfo(payload.message || 'You have a new notification', 'Notification');
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        const title =
          payload.type === 'NEW_MATCH'
            ? "It's a match!"
            : payload.type === 'PROFILE_LIKED'
            ? 'New Like'
            : payload.type === 'NEW_MESSAGE'
            ? 'New Message'
            : payload.type === 'STORY_POSTED'
            ? 'New Story'
            : 'Notification';
        const notification = new Notification(title, {
          body: payload.message || 'You have a new notification.',
          icon: '/favicon.ico',
        });
        notification.onclick = () => {
          window.focus();
        };
      }
    };
    webSocketService.onNotification(handleNotification);
    return () => {
      webSocketService.off('notification', handleNotification);
    };
  }, [isAuthenticated, webSocketService, showSuccess, showInfo]);

  return null;
};
