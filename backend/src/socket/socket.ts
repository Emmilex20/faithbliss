// src/socket/socket.ts

import { Server, Socket } from 'socket.io';
import { protectSocket } from '../middleware/authMiddleware'; 
import MessageModel from '../models/Message'; // Assuming Message model is defined
import MatchModel from '../models/Match'; // Assuming Match model is defined

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
        socket.on('sendMessage', async (data: { receiverId: string; content: string }) => {
            const { receiverId, content } = data;

            if (!receiverId || !content) {
                return socket.emit('error', 'Message must have a receiver ID and content.');
            }

            try {
                // A. Find the match document involving the sender and receiver
                const match = await MatchModel.findOne({
                    $and: [
                        { users: { $in: [userId] } },
                        { users: { $in: [receiverId] } }
                    ]
                });

                if (!match) {
                    return socket.emit('error', 'Cannot send message: Match not found.');
                }
                
                const matchId = match.id;
                
                // B. Create and save the new message
                const newMessage = await MessageModel.create({
                    sender: userId,
                    receiver: receiverId,
                    matchId: matchId,
                    content: content,
                    readBy: [userId] // Sender has read it by default
                });

                // C. Format the message for the client (optional: populate sender/receiver info)
                const messageToSend = {
                    ...newMessage.toObject(),
                    matchId: matchId,
                    // If your frontend expects populated sender/receiver, populate here 
                    // or rely on the frontend fetching the user list.
                };

                // D. Broadcast the message: 
                //    - To everyone in the match room (sender and receiver, if they're in the room)
                io.to(matchId).emit('newMessage', messageToSend);

                // E. Emit a notification to the receiver's private room 
                //    (in case they are not currently viewing the chat)
                if (userId !== receiverId) {
                    // You might send an unread count update here or a general notification
                    io.to(receiverId).emit('notification', { 
                        type: 'message', 
                        matchId: matchId,
                        message: `New message from user ${userId}`
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