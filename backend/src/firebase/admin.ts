// server/firebase/admin.ts (Final Corrected Version)

import * as admin from 'firebase-admin'; 
import { ServiceAccount } from 'firebase-admin';
import * as path from 'path'; // 💡 CRITICAL FIX: Import path module

// 1. Get the path from the environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set.');
}

// 2. Resolve the path absolutely from the process's working directory (project root)
// This ensures that "./config/firebase-admin-key.json" is correctly found 
// relative to where you run your server command (i.e., the backend folder).
const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

try {
    // 3. Use the absolute path for require
    const serviceAccount = require(absolutePath) as ServiceAccount; 

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} catch (error) {
    console.error(`❌ FATAL ERROR: Could not initialize Firebase Admin SDK. Check path: ${serviceAccountPath}`);
    console.error(`❌ Attempted absolute path: ${absolutePath}`);
    // Re-throw the error to crash the server, as authentication cannot proceed
    throw error;
}


export default admin;