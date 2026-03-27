export const NOTIFICATIONS_UPDATED_EVENT = 'faithbliss:notifications-updated';

type NotificationData = Record<string, unknown>;

export type NotificationLike = {
  id?: string;
  type?: string;
  message?: string;
  data?: NotificationData;
};

const getTicketRoute = (data?: NotificationData) => {
  const ticketType = typeof data?.ticketType === 'string' ? data.ticketType.trim().toUpperCase() : '';
  return ticketType === 'REPORT' ? '/report' : '/help';
};

export const dispatchNotificationsUpdated = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
};

export const getNotificationTitle = (type?: string) => {
  switch (type) {
    case 'NEW_MATCH':
      return "It's a match!";
    case 'PROFILE_LIKED':
      return 'New Like';
    case 'NEW_MESSAGE':
      return 'New Message';
    case 'STORY_POSTED':
      return 'New Story';
    case 'SUPPORT_REPLY':
      return 'Support Reply';
    case 'REPORT_SUBMITTED':
      return 'Reported Issue';
    default:
      return 'Notification';
  }
};

export const getNotificationDestination = (notification: NotificationLike) => {
  const data = notification.data;
  const matchId = typeof data?.matchId === 'string' ? data.matchId.trim() : '';
  const senderId = typeof data?.senderId === 'string' ? data.senderId.trim() : '';
  const otherUserId = typeof data?.otherUserId === 'string' ? data.otherUserId.trim() : '';

  switch (notification.type) {
    case 'NEW_MESSAGE':
      if (senderId) {
        return `/messages?profileId=${encodeURIComponent(senderId)}`;
      }
      if (matchId) {
        return `/messages?matchId=${encodeURIComponent(matchId)}`;
      }
      return '/messages';
    case 'NEW_MATCH':
      if (otherUserId) {
        return `/messages?profileId=${encodeURIComponent(otherUserId)}`;
      }
      return '/matches';
    case 'PROFILE_LIKED':
      if (senderId) {
        return `/profile/${encodeURIComponent(senderId)}`;
      }
      return '/matches';
    case 'STORY_POSTED':
      return '/dashboard';
    case 'REPORT_SUBMITTED':
      return '/admin';
    case 'SUPPORT_REPLY':
      return getTicketRoute(data);
    default:
      return '/notifications';
  }
};

const buildNotificationTag = (notification: NotificationLike) => {
  const rawId = typeof notification.id === 'string' && notification.id.trim()
    ? notification.id.trim()
    : `${notification.type || 'notification'}:${notification.message || ''}`;
  return `faithbliss:${rawId}`;
};

export const showSystemNotification = async (notification: NotificationLike) => {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const title = getNotificationTitle(notification.type);
  const destination = getNotificationDestination(notification);
  const options = {
    body: notification.message || 'You have a new notification.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: buildNotificationTag(notification),
    data: { url: destination },
  };

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, options);
        return;
      }
    } catch {
      // Fall through to the browser Notification constructor.
    }
  }

  const browserNotification = new Notification(title, options);
  browserNotification.onclick = () => {
    window.focus();
    window.location.assign(destination);
  };
};
