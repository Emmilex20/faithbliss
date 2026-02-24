// src/types/chat.ts (or src/types.ts, based on your project structure)

/**
 * Interface for a single message object.
 */
export interface MessageReplyPreview {
  id: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'SYSTEM';
  attachment?: {
    url: string;
    publicId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    resourceType?: string;
  } | null;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string; // <-- Must be present, we know who we're sending to
  content: string;
  isRead: boolean;
  createdAt: string; // ISO date string
  clientTempId?: string;
  attachment?: {
    url: string;
    publicId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    resourceType?: string;
  } | null;
  replyTo?: MessageReplyPreview | null;
  reactions?: MessageReaction[];
  
  // FIX: Make server-generated/redundant properties optional (?)
  updatedAt?: string; // <-- Server-generated/Updated
  sender?: {           // <-- Often fetched on demand or not needed for optimistic UI
    id: string;
    name: string;
  };
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'SYSTEM';
}
/**
 * Interface for the response structure returned by useConversationMessages.
 */
export interface ConversationMessagesResponse {
  messages: Message[];
  match: { id: string } // Minimal match info needed for refetch logic
  // Add other properties from your API response if needed
}

/**
 * Interface for a summary of a conversation (used in the sidebar list).
 */
export interface ConversationSummary {
  id: string; // match ID
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string;
    profilePhoto1?: string; // Used in the component logic
  };
  lastMessage: {
    content: string;
    createdAt: string;
    type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'SYSTEM';
    attachment?: Message['attachment'];
  } | null;
  unreadCount: number;
  updatedAt: string;
}

/**
 * Interface for a generic Notification object.
 */
export interface Notification {
  type: 'profile_liked' | 'new_match' | 'other_types_as_they_are_added';
  message: string;
  senderId?: string;
  senderName?: string;
  matchId?: string;
  otherUser?: {
    id: string;
    name: string;
  };
}

/**
 * Interface for sending a typing event over WebSocket.
 */
export interface TypingEventSent {
  matchId: string;
  isTyping: boolean;
}

/**
 * Interface for receiving a typing event over WebSocket.
 */
export interface TypingEventReceived {
  userId: string;
  isTyping: boolean;
}

export interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  matchId?: string; // optional for WebSocket messages
}
