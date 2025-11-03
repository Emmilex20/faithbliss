// src/middleware/authMiddleware.ts (FINAL, FIXED, AND ROBUST VERSION)

import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase-admin'; // ✅ Correct: This matches the named export 
import { Socket } from 'socket.io';
import { DecodedIdToken } from 'firebase-admin/auth'; 


// ----------------------------------------------------------------
// 💡 GLOBAL TYPE AUGMENTATION: FIXES TS ERROR 2769
// This tells TypeScript the final, combined shape of the Express Request object.
// ----------------------------------------------------------------
declare global {
    namespace Express {
        interface Request {
            // Full decoded token for advanced checks
            user?: DecodedIdToken; 
            // Simple UID string for database lookups
            userId?: string; 
        }
    }
}

// Interface for the Socket.IO middleware (Separate, non-conflicting type)
interface AuthenticatedSocket extends Socket {
    user?: { id: string }; 
}

// ----------------------------------------------------------------
// 1. EXPRESS MIDDLEWARE (protect) - Validates Firebase ID Token (HTTP)
// ----------------------------------------------------------------
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    
    console.log("🔥 SERVER RECEIVES Authorization Header:", authHeader ? authHeader.substring(0, 30) + "..." : "MISSING");

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } 

    if (!token) {
        console.log("❌ SERVER FAIL: Token not extracted from header.");
        return res.status(401).json({ message: 'Not authorized, Firebase ID token missing' });
    }

    try {
        const decodedToken: DecodedIdToken = await admin.auth().verifyIdToken(token);

        // Assign to the globally augmented properties (TS error fixed here)
        req.user = decodedToken; 
        req.userId = decodedToken.uid; 
        
        console.log(`✅ SERVER SUCCESS: Token verified for UID: ${req.userId}`);
        
        next();
    } catch (error) {
        console.error('❌ Firebase Auth Middleware Error:', (error as Error).message);
        return res.status(401).json({ message: 'Not authorized, Firebase ID token invalid or expired' });
    }
};

// ----------------------------------------------------------------
// 2. SOCKET.IO MIDDLEWARE (protectSocket)
// ----------------------------------------------------------------
export const protectSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        console.log('❌ Socket Auth Failed: No token provided.');
        return next(new Error('Authentication error: No token provided.'));
    }

    try {
        admin.auth().verifyIdToken(token)
            .then((decodedToken: DecodedIdToken) => {
                socket.user = { id: decodedToken.uid };
                console.log(`✅ Socket Auth Success: User ${decodedToken.uid}`);
                next();
            })
            .catch((error: Error) => {
                console.error('❌ Socket Auth Error:', error.message);
                next(new Error('Authentication error: Invalid or expired token.'));
            });
    } catch (error) {
        console.error('❌ Socket Auth Error (Setup):', (error as Error).message);
        next(new Error('Authentication error: Server setup issue.'));
    }
};