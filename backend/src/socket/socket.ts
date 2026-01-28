// src/socket/socket.ts

import { Server, Socket } from 'socket.io';
import { protectSocket } from '../middleware/authMiddleware';
import { admin, db } from '../config/firebase-admin';
import { createNotification } from '../services/notificationService';

// Helper interface extending Socket to include the authenticated user ID
interface AuthenticatedSocket extends Socket {
    user?: { id: string }; 
}

// Map to store connected users and their socket IDs (for direct messaging/notifications)
// In a production environment, this should be a distributed cache like Redis
const usersSocketMap = new Map<string, string>(); 

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
        usersSocketMap.set(userId, socket.id);

        // Join a private room for the user to receive notifications/updates
        socket.join(userId);

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
        socket.on('sendMessage', async (data: { receiverId: string; content: string; matchId?: string }) => {
            const { receiverId, content, matchId } = data;

            if (!receiverId || !content || !matchId) {
                return socket.emit('error', 'Message must have a receiver ID, content, and matchId.');
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

                const messageRef = await db.collection('messages').add({
                    matchId,
                    senderId: userId,
                    receiverId,
                    content,
                    isRead: false,
                    unreadBy: [receiverId],
                    createdAt: admin.firestore.Timestamp.now(),
                });

                const messageToSend = {
                    id: messageRef.id,
                    matchId,
                    senderId: userId,
                    receiverId,
                    content,
                    isRead: false,
                    unreadBy: [receiverId],
                    createdAt: new Date().toISOString(),
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

        // --------------------------------------------------------
        // 6. Handle Disconnect
        // --------------------------------------------------------
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId} (Socket ID: ${socket.id})`);
            usersSocketMap.delete(userId);
        });
    });
};

let ioInstance: Server | null = null;

export const emitToUser = (userId: string, payload: any) => {
    if (!ioInstance) return;
    ioInstance.to(userId).emit('notification', payload);
};
