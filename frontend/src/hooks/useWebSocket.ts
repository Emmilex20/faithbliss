import { useEffect, useState } from 'react';
import WebSocketService from '@/services/WebSocketService';
import { useRequireAuth } from './useAuth';

let sharedWebSocketService: WebSocketService | null = null;
let activeHookConsumers = 0;
let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

const cancelPendingDisconnect = () => {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }
};

const disconnectSharedWebSocket = () => {
  cancelPendingDisconnect();
  if (sharedWebSocketService) {
    sharedWebSocketService.disconnect();
    sharedWebSocketService = null;
  }
};

const scheduleDisconnectIfUnused = () => {
  cancelPendingDisconnect();
  disconnectTimer = setTimeout(() => {
    if (activeHookConsumers === 0) {
      disconnectSharedWebSocket();
    }
  }, 750);
};

const getOrCreateSharedWebSocket = (token: string): WebSocketService => {
  cancelPendingDisconnect();
  if (!sharedWebSocketService) {
    sharedWebSocketService = new WebSocketService(token);
  }
  return sharedWebSocketService;
};

export function useWebSocket(): WebSocketService | null {
  const { accessToken, isAuthenticated } = useRequireAuth();
  const [webSocketService, setWebSocketService] = useState<WebSocketService | null>(null);

  useEffect(() => {
    activeHookConsumers += 1;
    cancelPendingDisconnect();
    return () => {
      activeHookConsumers = Math.max(0, activeHookConsumers - 1);
      if (activeHookConsumers === 0) {
        scheduleDisconnectIfUnused();
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const service = getOrCreateSharedWebSocket(accessToken);
      setWebSocketService((prev) => (prev === service ? prev : service));
      return;
    }

    setWebSocketService(null);
    disconnectSharedWebSocket();
  }, [accessToken, isAuthenticated]);

  return webSocketService;
}
