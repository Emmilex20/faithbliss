/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import type { Message } from '@/types/chat';

export interface UnreadCountPayload {
  count: number;
}

export interface NotificationPayload {
  type: string;
  message: string;
  matchId?: string;
  otherUser?: { id: string; name: string };
  senderId?: string;
  senderName?: string;
  // Add other notification properties as needed
}

export interface UserTypingPayload {
  userId: string;
  isTyping: boolean;
}

class WebSocketService {
  private socket: Socket | null = null;
  private readonly WEBSOCKET_URL: string;

  constructor(token?: string) {
    this.WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5000';
    
    if (token) {
      this.connect(token).catch(err => console.error('WebSocket connect error:', err));
    }
  }

  public connect(token?: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected) {
        return resolve();
      }

      this.socket = io(this.WEBSOCKET_URL, {
        auth: token ? { token } : undefined,
        transports: ['websocket'],
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error?.message || error);
        resolve();
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public onNewMessage(callback: (message: Message) => void): void {
    this.socket?.on('newMessage', callback);
  }

  public onMessage(callback: (message: Message) => void): void {
    this.onNewMessage(callback);
  }

  public onUnreadCount(callback: (payload: UnreadCountPayload) => void): void {
    this.socket?.on('unreadCount', callback);
  }

  public onNotification(callback: (payload: NotificationPayload) => void): void {
    this.socket?.on('notification', callback);
  }

  public onUserTyping(callback: (payload: UserTypingPayload) => void): void {
    this.socket?.on('userTyping', callback);
  }

  public onTyping(callback: (payload: UserTypingPayload) => void): void {
    this.onUserTyping(callback);
  }

  public joinMatch(matchId: string): void {
    this.socket?.emit('joinRoom', { matchId });
  }

  public leaveMatch(matchId: string): void {
    this.socket?.emit('leaveRoom', { matchId });
  }

  /**
   * Emits the message to the server. The server should process the message,
   * save it, and then broadcast the full Message object back via 'newMessage'.
   */
  public sendMessage(receiverId: string, content: string, matchId?: string): void {
    this.socket?.emit('sendMessage', { receiverId, content, matchId });
  }

  public emitTyping(receiverId: string, isTyping: boolean): void {
    this.socket?.emit('userTyping', { receiverId, isTyping });
  }

  public sendTyping(receiverId: string, isTyping: boolean): void {
    this.emitTyping(receiverId, isTyping);
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public get connected(): boolean {
    return this.isConnected();
  }

  public onError(callback: (err: any) => void): void {
    this.socket?.on('connect_error', callback);
    this.socket?.on('error', callback);
  }

  public off(event?: string, callback?: any): void {
    if (!this.socket) return;
    if (!event) {
      this.socket.removeAllListeners();
      return;
    }
    if (callback) this.socket.off(event, callback);
    else this.socket.off(event);
  }
}

export default WebSocketService;
