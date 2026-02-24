// src/socket/socket.ts

import { Server, Socket } from 'socket.io';
import { protectSocket } from '../middleware/authMiddleware';
import { admin, db } from '../config/firebase-admin';
import { createNotification } from '../services/notificationService';

type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'SYSTEM';
type CallType = 'audio' | 'video';

interface MessageAttachmentPayload {
    url: string;
    publicId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    resourceType?: string;
}

interface MessageReplyPayload {
    id: string;
    senderId: string;
    content: string;
    type: MessageType;
    attachment: MessageAttachmentPayload | null;
}

// Helper interface extending Socket to include the authenticated user ID
interface AuthenticatedSocket extends Socket {
    user?: { id: string }; 
}

const getMessageTypeFromMimeType = (mimeType: string): MessageType => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    return 'FILE';
};

const sanitizeAttachment = (attachment: unknown): MessageAttachmentPayload | null => {
    if (!attachment || typeof attachment !== 'object') return null;
    const candidate = attachment as Record<string, unknown>;

    const url = typeof candidate.url === 'string' ? candidate.url.trim() : '';
    const publicId = typeof candidate.publicId === 'string' ? candidate.publicId.trim() : '';
    const fileName = typeof candidate.fileName === 'string' ? candidate.fileName.trim() : '';
    const mimeType = typeof candidate.mimeType === 'string' ? candidate.mimeType.trim() : '';
    const fileSize = typeof candidate.fileSize === 'number' ? candidate.fileSize : NaN;
    const resourceType =
        typeof candidate.resourceType === 'string' ? candidate.resourceType.trim() : undefined;

    if (!url || !publicId || !fileName || !mimeType || !Number.isFinite(fileSize) || fileSize < 0) {
        return null;
    }

    return {
        url,
        publicId,
        fileName,
        mimeType,
        fileSize,
        resourceType,
    };
};

const sanitizeReplyToMessageId = (replyToMessageId: unknown): string | null => {
    if (typeof replyToMessageId !== 'string') return null;
    const normalized = replyToMessageId.trim();
    return normalized ? normalized : null;
};

const sanitizeCallType = (callType: unknown): CallType | null => {
    if (callType === 'audio' || callType === 'video') return callType;
    return null;
};

const sanitizeRecord = (value: unknown): Record<string, unknown> | null => {
    if (!value || typeof value !== 'object') return null;
    return value as Record<string, unknown>;
};

const sanitizeTargetUserId = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized : null;
};

const sanitizeOptionalString = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim();
    return normalized || undefined;
};

const normalizeTimestampToIso = (value: unknown): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    }
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
    }
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
        const candidate = value as { toDate?: () => Date };
        if (typeof candidate.toDate === 'function') {
            const converted = candidate.toDate();
            return Number.isNaN(converted.getTime()) ? undefined : converted.toISOString();
        }
    }
    return undefined;
};

const buildReplyPreviewFromDoc = async (
    replyToMessageId: string,
    matchId: string
): Promise<MessageReplyPayload | null> => {
    const replyDoc = await db.collection('messages').doc(replyToMessageId).get();
    if (!replyDoc.exists) return null;

    const replyData = replyDoc.data() as {
        matchId?: string;
        senderId?: string;
        content?: string;
        type?: MessageType;
        attachment?: MessageAttachmentPayload | null;
    } | undefined;

    if (!replyData || replyData.matchId !== matchId || typeof replyData.senderId !== 'string') {
        return null;
    }

    const attachment = sanitizeAttachment(replyData.attachment);
    const content = typeof replyData.content === 'string' ? replyData.content.trim() : '';
    const type = replyData.type || (attachment ? getMessageTypeFromMimeType(attachment.mimeType) : 'TEXT');

    return {
        id: replyDoc.id,
        senderId: replyData.senderId,
        content,
        type,
        attachment: attachment || null,
    };
};

interface UserPresencePayload {
    userId: string;
    isOnline: boolean;
    lastSeenAt?: string;
}

// Map to store connected users and their socket IDs (for direct messaging/notifications)
// In a production environment, this should be a distributed cache like Redis
const usersSocketMap = new Map<string, Set<string>>();

const addSocketForUser = (userId: string, socketId: string) => {
    const existing = usersSocketMap.get(userId) || new Set<string>();
    existing.add(socketId);
    usersSocketMap.set(userId, existing);
};

const removeSocketForUser = (userId: string, socketId: string): boolean => {
    const existing = usersSocketMap.get(userId);
    if (!existing) return false;
    existing.delete(socketId);
    if (existing.size === 0) {
        usersSocketMap.delete(userId);
        return false;
    }
    usersSocketMap.set(userId, existing);
    return true;
};

const isUserOnlineInMemory = (userId: string): boolean => {
    const sockets = usersSocketMap.get(userId);
    return Boolean(sockets && sockets.size > 0);
};

const updateUserPresenceInFirestore = async (userId: string, isOnline: boolean) => {
    try {
        await db.collection('users').doc(userId).set(
            {
                isOnline,
                lastSeenAt: admin.firestore.Timestamp.now(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error(`Failed to update presence for user ${userId}:`, error);
    }
};

const buildPresenceForUsers = async (userIds: string[]): Promise<UserPresencePayload[]> => {
    const normalizedIds = Array.from(
        new Set(
            userIds
                .map((value) => (typeof value === 'string' ? value.trim() : ''))
                .filter((value) => Boolean(value))
        )
    );

    if (!normalizedIds.length) return [];

    const docs = await Promise.all(
        normalizedIds.map((userId) => db.collection('users').doc(userId).get())
    );

    return docs.map((doc, index) => {
        const userId = normalizedIds[index];
        const data = doc.exists ? doc.data() as { lastSeenAt?: unknown } : undefined;
        const persistedLastSeen = normalizeTimestampToIso(data?.lastSeenAt);
        const online = isUserOnlineInMemory(userId);

        return {
            userId,
            isOnline: online,
            lastSeenAt: online ? new Date().toISOString() : persistedLastSeen,
        };
    });
};

// This function is called from server.ts to start listening for connections
export const initializeSocketIO = (io: Server) => {
    console.log('Socket.io server initialized and listening.');
    ioInstance = io;

    // 1. Apply Authentication Middleware
    io.use(protectSocket as any); // Type assertion needed because of the custom interface

    io.on('connection', (socket: AuthenticatedSocket) => {
        const userId = socket.user!.id; 
        console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);
        
        // Add user to the map
        addSocketForUser(userId, socket.id);

        // Join a private room for the user to receive notifications/updates
        socket.join(userId);
        io.emit('user:presence', {
            userId,
            isOnline: true,
            lastSeenAt: new Date().toISOString(),
        } satisfies UserPresencePayload);
        void updateUserPresenceInFirestore(userId, true);

        // --------------------------------------------------------
        // 2. Handle 'joinRoom' event (Client enters a specific chat)
        // --------------------------------------------------------
        socket.on('joinRoom', (data: { matchId: string }) => {
            if (data.matchId) {
                socket.join(data.matchId);
                console.log(`User ${userId} joined match room: ${data.matchId}`);
            }
        });

        // --------------------------------------------------------
        // 3. Handle 'leaveRoom' event (Client exits a specific chat)
        // --------------------------------------------------------
        socket.on('leaveRoom', (data: { matchId: string }) => {
            if (data.matchId) {
                socket.leave(data.matchId);
                console.log(`User ${userId} left match room: ${data.matchId}`);
            }
        });

        // --------------------------------------------------------
        // 4. Handle 'sendMessage' event (Core Messaging Logic)
        // --------------------------------------------------------
        socket.on('sendMessage', async (data: {
            receiverId: string;
            content?: string;
            matchId?: string;
            attachment?: MessageAttachmentPayload | null;
            clientTempId?: string;
            replyToMessageId?: string | null;
        }) => {
            const { receiverId, matchId, clientTempId } = data;
            const normalizedContent = typeof data.content === 'string' ? data.content.trim() : '';
            const attachment = sanitizeAttachment(data.attachment);
            const replyToMessageId = sanitizeReplyToMessageId(data.replyToMessageId);

            if (!receiverId || !matchId || (!normalizedContent && !attachment)) {
                return socket.emit('error', 'Message must include receiverId, matchId, and text or attachment.');
            }

            try {
                const matchDoc = await db.collection('matches').doc(matchId).get();
                if (!matchDoc.exists) {
                    return socket.emit('error', 'Cannot send message: Match not found.');
                }

                const matchData = matchDoc.data() as { users?: string[] } | undefined;
                if (!matchData?.users?.includes(userId)) {
                    return socket.emit('error', 'Cannot send message: You are not part of this match.');
                }

                if (!matchData.users.includes(receiverId)) {
                    return socket.emit('error', 'Cannot send message: Receiver is not part of this match.');
                }

                const messageType: MessageType = attachment
                    ? getMessageTypeFromMimeType(attachment.mimeType)
                    : 'TEXT';
                const replyTo = replyToMessageId
                    ? await buildReplyPreviewFromDoc(replyToMessageId, matchId)
                    : null;

                const messageRef = await db.collection('messages').add({
                    matchId,
                    senderId: userId,
                    receiverId,
                    content: normalizedContent,
                    type: messageType,
                    attachment: attachment || null,
                    replyTo: replyTo || null,
                    isRead: false,
                    unreadBy: [receiverId],
                    createdAt: admin.firestore.Timestamp.now(),
                    updatedAt: admin.firestore.Timestamp.now(),
                });

                const messageToSend = {
                    id: messageRef.id,
                    matchId,
                    senderId: userId,
                    receiverId,
                    content: normalizedContent,
                    type: messageType,
                    attachment: attachment || null,
                    replyTo: replyTo || null,
                    isRead: false,
                    unreadBy: [receiverId],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    clientTempId,
                };

                io.to(matchId).emit('newMessage', messageToSend);
                io.to(receiverId).emit('newMessage', messageToSend);

                if (userId !== receiverId) {
                    await createNotification({
                        userId: receiverId,
                        type: 'NEW_MESSAGE',
                        message: 'You have a new message',
                        data: { matchId, senderId: userId }
                    });
                }
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'Failed to process message on server.');
            }
        });
        
        // --------------------------------------------------------
        // 5. Handle 'userTyping' event
        // --------------------------------------------------------
        socket.on('userTyping', (data: { receiverId: string; isTyping: boolean }) => {
            // Emit the typing status back to the receiver's private room
            // The receiver can then show the status only if they are in the correct chat.
            io.to(data.receiverId).emit('userTyping', { 
                userId: userId, 
                isTyping: data.isTyping 
            });
        });

        socket.on(
            'presence:batch',
            async (
                data: { userIds?: unknown[] } | undefined,
                acknowledge?: (payload: { presence: UserPresencePayload[] }) => void
            ) => {
                const rawIds = Array.isArray(data?.userIds) ? data!.userIds : [];
                const userIds = rawIds
                    .filter((value): value is string => typeof value === 'string')
                    .slice(0, 200);

                try {
                    const presence = await buildPresenceForUsers(userIds);
                    if (typeof acknowledge === 'function') {
                        acknowledge({ presence });
                    }
                } catch (error) {
                    console.error('Failed to resolve presence batch:', error);
                    if (typeof acknowledge === 'function') {
                        acknowledge({ presence: [] });
                    }
                }
            }
        );

        socket.on('call:offer', (payload: unknown) => {
            const data = sanitizeRecord(payload);
            if (!data) {
                return socket.emit('error', 'Invalid call offer payload.');
            }

            const targetUserId = sanitizeTargetUserId(data.targetUserId);
            const callType = sanitizeCallType(data.callType);
            const sdp = sanitizeRecord(data.sdp);
            if (!targetUserId || !callType || !sdp) {
                return socket.emit('error', 'Invalid call offer payload.');
            }

            io.to(targetUserId).emit('call:offer', {
                fromUserId: userId,
                matchId: sanitizeOptionalString(data.matchId),
                callType,
                sdp,
            });
        });

        socket.on('call:answer', (payload: unknown) => {
            const data = sanitizeRecord(payload);
            if (!data) {
                return socket.emit('error', 'Invalid call answer payload.');
            }

            const targetUserId = sanitizeTargetUserId(data.targetUserId);
            const callType = sanitizeCallType(data.callType);
            const sdp = sanitizeRecord(data.sdp);
            if (!targetUserId || !callType || !sdp) {
                return socket.emit('error', 'Invalid call answer payload.');
            }

            io.to(targetUserId).emit('call:answer', {
                fromUserId: userId,
                matchId: sanitizeOptionalString(data.matchId),
                callType,
                sdp,
            });
        });

        socket.on('call:ice-candidate', (payload: unknown) => {
            const data = sanitizeRecord(payload);
            if (!data) {
                return socket.emit('error', 'Invalid ICE payload.');
            }

            const targetUserId = sanitizeTargetUserId(data.targetUserId);
            const candidate = sanitizeRecord(data.candidate);
            if (!targetUserId || !candidate) {
                return socket.emit('error', 'Invalid ICE payload.');
            }

            io.to(targetUserId).emit('call:ice-candidate', {
                fromUserId: userId,
                matchId: sanitizeOptionalString(data.matchId),
                candidate,
            });
        });

        socket.on('call:reject', (payload: unknown) => {
            const data = sanitizeRecord(payload);
            if (!data) {
                return socket.emit('error', 'Invalid call reject payload.');
            }

            const targetUserId = sanitizeTargetUserId(data.targetUserId);
            if (!targetUserId) {
                return socket.emit('error', 'Invalid call reject payload.');
            }

            io.to(targetUserId).emit('call:reject', {
                fromUserId: userId,
                matchId: sanitizeOptionalString(data.matchId),
                reason: sanitizeOptionalString(data.reason),
            });
        });

        socket.on('call:end', (payload: unknown) => {
            const data = sanitizeRecord(payload);
            if (!data) {
                return socket.emit('error', 'Invalid call end payload.');
            }

            const targetUserId = sanitizeTargetUserId(data.targetUserId);
            if (!targetUserId) {
                return socket.emit('error', 'Invalid call end payload.');
            }

            io.to(targetUserId).emit('call:end', {
                fromUserId: userId,
                matchId: sanitizeOptionalString(data.matchId),
                reason: sanitizeOptionalString(data.reason),
            });
        });

        // --------------------------------------------------------
        // 6. Handle Disconnect
        // --------------------------------------------------------
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId} (Socket ID: ${socket.id})`);
            const stillOnline = removeSocketForUser(userId, socket.id);
            if (!stillOnline) {
                const lastSeenAt = new Date().toISOString();
                io.emit('user:presence', {
                    userId,
                    isOnline: false,
                    lastSeenAt,
                } satisfies UserPresencePayload);
                void updateUserPresenceInFirestore(userId, false);
            }
        });
    });
};

let ioInstance: Server | null = null;

export const emitToUser = (userId: string, payload: any) => {
    if (!ioInstance) return;
    ioInstance.to(userId).emit('notification', payload);
};
