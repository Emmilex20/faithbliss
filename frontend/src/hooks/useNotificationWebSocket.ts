/* eslint-disable no-irregular-whitespace */
import { useEffect, useRef } from 'react';
import NotificationWebSocketService from '@/services/notification-websocket';
import { useRequireAuth } from './useAuth';
import type NotificationWebSocketServiceClass from '@/services/notification-websocket';

type NotificationWebSocketServiceInstance = InstanceType<typeof NotificationWebSocketServiceClass>;

/**
 * Manages the lifecycle of the Notification WebSocket connection.
 * It connects when the user is authenticated and disconnects on unmount or logout.
 */
export function useNotificationWebSocket() {
  const { accessToken, isAuthenticated } = useRequireAuth();
  const serviceRef = useRef<NotificationWebSocketServiceInstance | null>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
      serviceRef.current = null;
      tokenRef.current = null;
      return;
    }

    if (!serviceRef.current || tokenRef.current !== accessToken) {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
      serviceRef.current = new NotificationWebSocketService(accessToken);
      tokenRef.current = accessToken;
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
      serviceRef.current = null;
      tokenRef.current = null;
    };
  }, []);

  return serviceRef.current;
}
