/* eslint-disable @typescript-eslint/no-explicit-any */
// src/firebase/storageHelpers.ts (FINAL CORRECTED)

// 🛑 OLD: import storage from "./config"; 
// 🛑 OLD: import { auth } from "./config"; 

// ✅ FIX: Import 'auth' (named export) and the 'storage' service (which must be 
// exported as a named export from ./config, but was previously missing).

// Assuming you've now added 'export const storage = getStorage(firebaseApp);' 
// to your config.ts file (see note below):
import { storage, auth } from "./config"; 

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


/**
 * Uploads an array of File objects to Firebase Storage.
 * @param files Array of image File objects (from the component state).
 * @returns A promise that resolves to an object of field names and their public URLs.
 * Example: { profilePhoto1: 'https://...', profilePhoto2: 'https://...' }
 */
export const uploadPhotosToStorage = async (files: File[]): Promise<Record<string, string>> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User must be authenticated to upload photos.");
    }

    const uploadPromises: Promise<any>[] = [];
    const photoUrls: Record<string, string> = {};

    files.forEach((file, index) => {
        // 'storage' is now correctly the FirebaseStorage service instance.
        const storageRef = ref(storage, `users/${user.uid}/profilePhoto${index + 1}`);

        // 1. Upload the file
        const uploadPromise = uploadBytes(storageRef, file).then(snapshot => {
            // 2. Get the public download URL
            return getDownloadURL(snapshot.ref);
        }).then(url => {
            // 3. Store the URL with the correct Firestore field name
            const fieldName = `profilePhoto${index + 1}`;
            photoUrls[fieldName] = url;
        });

        uploadPromises.push(uploadPromise);
    });

    // Wait for all uploads and URL retrievals to complete
    await Promise.all(uploadPromises);
    
    return photoUrls;
};