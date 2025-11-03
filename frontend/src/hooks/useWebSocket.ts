/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import WebSocketService from '@/services/WebSocketService';
import { useAuth } from './useAuth';

export function useWebSocket(): WebSocketService | null {
  const { accessToken, isAuthenticated } = useAuth();
  const [webSocketService, setWebSocketService] = useState<WebSocketService | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (isAuthenticated && accessToken && !initialized.current) {
      const service = new WebSocketService(accessToken);
      setWebSocketService(service);
      initialized.current = true;

      return () => {
        service.disconnect();
        initialized.current = false;
      };
    } else if (!isAuthenticated && webSocketService) {
      webSocketService.disconnect();
      setWebSocketService(null);
      initialized.current = false;
    }
  }, [accessToken, isAuthenticated]);

  return webSocketService;
}
