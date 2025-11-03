// src/config/firebase-admin.ts (FIXED)

import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as path from 'path';

// Assumed environment variable path is set
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set.');
}

const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

if (!admin.apps.length) {
    try {
        const serviceAccount = require(absolutePath) as ServiceAccount; 
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error(`❌ FATAL ERROR: Could not initialize Firebase Admin SDK. Check path: ${serviceAccountPath}`);
        throw error;
    }
}

// FIX: Export 'db' here.
export const db = admin.firestore();

// Firestore user profile collection reference
export const usersCollection = db.collection('users');

// Re-export admin for field values, etc.
export { admin };