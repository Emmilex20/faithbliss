import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// Extend the Request object to hold the decoded Firebase user
export interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

// ⚠️ Initialize the Firebase Admin SDK
// This is the CRITICAL STEP where the correct project credentials are loaded.
// It is best practice to use a service account key file in production, 
// but for local development, it often uses FIREBASE_CONFIG or default credentials.
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            // Use the environment variable to point to your service account key file
            // Make sure the path is correct (e.g., /path/to/serviceAccountKey.json)
            // If you're running this on a Google Cloud platform (like Cloud Functions or App Engine), 
            // you might not need credential configuration as it uses default credentials.
            // For local, ensure your environment is set up or use a file path.
            // Example using environment variable for service account:
            // credential: admin.credential.applicationDefault(), 
            // OR if using a file:
            // credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH!),
        });
        console.log('✅ Firebase Admin SDK initialized successfully.');
    } catch (error) {
        console.error('❌ Firebase Admin SDK initialization failed:', error);
        // Do not exit process if running locally; just log the error.
    }
}

/**
 * Middleware to validate the Firebase ID token from the Authorization header.
 */
export const requireAuth = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
) => {
    // 1. Check for Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('🛑 AUTH: Missing or incorrectly formatted Authorization header.');
        // Use 403 Forbidden if a token is expected but missing, or 401 if it is the only auth method.
        return res.status(401).json({ message: 'Unauthorized: Missing Firebase ID Token.' });
    }

    const idToken = authHeader.split(' ')[1];

    try {
        // 2. Verify the ID token using the Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // 3. Attach the decoded user object to the request
        req.user = decodedToken;
        
        // The token is valid and the user is authenticated. Proceed.
        next();
    } catch (error) {
        console.error('❌ Firebase ID Token Verification Failed:', error);
        // This catches token expiration, incorrect signing, and other validation errors
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired Firebase ID Token.' });
    }
};