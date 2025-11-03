/* eslint-disable no-irregular-whitespace */
import { useEffect, useState, useRef } from 'react';
// NOTE: Ensure your Vite config (e.g., tsconfig.json) resolves this path correctly.
import NotificationWebSocketService from '@/services/notification-websocket';
import { useAuth } from './useAuth';
import type NotificationWebSocketServiceClass from '@/services/notification-websocket';

// NOTE: We use InstanceType<typeof Class> for a clean type definition.
// We must redeclare the class type to avoid circular dependency issues if it's not a default export.
// For simplicity, we assume the imported type is correct.
type NotificationWebSocketServiceInstance = InstanceType<typeof NotificationWebSocketServiceClass>;

/**
 * Manages the lifecycle of the Notification WebSocket connection.
 * It connects when the user is authenticated and disconnects on unmount or logout.
 */
export function useNotificationWebSocket() {
  // Assumes useAuth is a custom hook providing authentication state
  const { accessToken, isAuthenticated } = useAuth();
  
  const [notificationWebSocketService, setNotificationWebSocketService] = useState<NotificationWebSocketServiceInstance | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Condition 1: User is authenticated, has a token, AND service is not already initialized
    if (isAuthenticated && accessToken && !initialized.current) {
      console.log('Initializing Notification WebSocketService...');
      
      // Initialize the service with the access token
      const service = new NotificationWebSocketService(accessToken);
      
      setNotificationWebSocketService(service);
      initialized.current = true;

      // Cleanup function for unmount or dependency change
      return () => {
        console.log('Disconnecting Notification WebSocketService...');
        service.disconnect();
        initialized.current = false;
      };
    } 
    // Condition 2: User logs out (isAuthenticated is false) AND a service instance exists
    else if (!isAuthenticated && notificationWebSocketService) {
      console.log('User logged out, disconnecting Notification WebSocketService...');
      notificationWebSocketService.disconnect();
      setNotificationWebSocketService(null);
      initialized.current = false;
    }
    
    // NOTE: The dependencies include `notificationWebSocketService` to handle the logout case (Condition 2).
  }, [accessToken, isAuthenticated, notificationWebSocketService]);

  return notificationWebSocketService;
}