// src/hooks/useAuth.tsx (FINAL FIX - Using Firestore)

/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useAuthContext } from "../contexts/AuthContext";
import type { User } from "@/types/User";

//  FIREBASE IMPORTS
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence, 
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
} from "firebase/auth";
import type { User as FirebaseAuthUser } from "firebase/auth";
//  NEW FIREBASE IMPORTS FOR FIRESTORE
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; //  ADDED updateDoc
import { auth, db, serverTimestamp } from "@/firebase/config"; // Assuming db and serverTimestamp are exported

// --------------------
// INTERFACES (retained for context)
interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
    gender: "MALE" | "FEMALE";
}

//  CORRECTED Interface for Onboarding Data (accepts all fields, including the resulting photo URLs)
// The OnboardingPage must ensure photos are uploaded to Storage *before* calling this function 
// and pass the resulting URLs here.
interface OnboardingData {
    age?: number;
    bio?: string;
    location?: string;
    denomination?: string;
    latitude?: number; // Added
    longitude?: number; // Added
    phoneNumber?: string; // Added
    countryCode?: string; // Added
    birthday?: Date | string; // Added
    fieldOfStudy?: string; // Added
    profession?: string; // Added
    faithJourney?: string; // Added
    sundayActivity?: string; // Added
    lookingFor?: string[]; // Added
    hobbies?: string[]; // Added
    interests?: string[]; // Added
    values?: string[]; // Added
    favoriteVerse?: string; // Added
    drinkingHabit?: string; // Added
    smokingHabit?: string; // Added
    workoutHabit?: string; // Added
    petPreference?: string; // Added
    height?: string; // Added
    language?: string; // Added
    languageSpoken?: string[]; // Added
    personalPromptQuestion?: string; // Added
    personalPromptAnswer?: string; // Added
    communicationStyle?: string[]; // Added
    loveStyle?: string[]; // Added
    educationLevel?: string; // Added
    zodiacSign?: string; // Added
    preferredMinHeight?: number; // Added
    profilePhoto1?: string; // Expecting the final Cloud Storage URL
    profilePhoto2?: string;
    profilePhoto3?: string;
    profilePhoto4?: string; 
    profilePhoto5?: string;
    profilePhoto6?: string;
    [key: string]: any; // Allow for dynamic fields to be passed
}

const isFirebaseNetworkError = (error: unknown): boolean => {
    const code = (error as { code?: unknown })?.code;
    return typeof code === "string" && code === "auth/network-request-failed";
};

const getAuthErrorMessage = (error: unknown, fallback: string): string => {
    const message = (error as { message?: unknown })?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
};

const sanitizeText = (value: unknown, maxLen: number): string | undefined => {
    if (typeof value !== "string") return undefined;
    const cleaned = value.trim();
    if (!cleaned) return undefined;
    return cleaned.slice(0, maxLen);
};

const sanitizeArray = (value: unknown, maxItems = 20, maxLen = 60): string[] | undefined => {
    if (!Array.isArray(value)) return undefined;
    const cleaned = value
        .filter((item) => typeof item === "string")
        .map((item) => (item as string).trim())
        .filter(Boolean)
        .slice(0, maxItems)
        .map((item) => item.slice(0, maxLen));
    return cleaned;
};

const sanitizeOnboardingPayload = (payload: OnboardingData): Record<string, any> => {
    const result: Record<string, any> = {};

    const textFields: Array<[keyof OnboardingData, number]> = [
        ["name", 120],
        ["bio", 500],
        ["location", 160],
        ["denomination", 80],
        ["phoneNumber", 30],
        ["countryCode", 8],
        ["fieldOfStudy", 120],
        ["profession", 120],
        ["favoriteVerse", 120],
        ["drinkingHabit", 80],
        ["smokingHabit", 80],
        ["workoutHabit", 80],
        ["petPreference", 80],
        ["height", 20],
        ["language", 60],
        ["personalPromptQuestion", 120],
        ["personalPromptAnswer", 280],
        ["educationLevel", 80],
        ["zodiacSign", 40],
        ["faithJourney", 40],
        ["churchAttendance", 40],
        ["sundayActivity", 40],
        ["baptismStatus", 40],
        ["preferredGender", 20],
    ];

    textFields.forEach(([field, maxLen]) => {
        const value = sanitizeText(payload[field], maxLen);
        if (value !== undefined) result[field] = value;
    });

    const arrayFields: Array<keyof OnboardingData> = [
        "relationshipGoals",
        "lookingFor",
        "hobbies",
        "values",
        "interests",
        "languageSpoken",
        "communicationStyle",
        "loveStyle",
        "spiritualGifts",
        "preferredFaithJourney",
        "preferredChurchAttendance",
        "preferredRelationshipGoals",
        "preferredDenomination",
        "personality",
    ];

    arrayFields.forEach((field) => {
        const value = sanitizeArray(payload[field]);
        if (value !== undefined) result[field] = value;
    });

    if (payload.birthday instanceof Date) {
        result.birthday = payload.birthday;
    } else if (typeof payload.birthday === "string" && payload.birthday.trim()) {
        const parsed = new Date(payload.birthday);
        if (!Number.isNaN(parsed.getTime())) result.birthday = parsed;
    }

    const numericBounds: Array<[keyof OnboardingData, number, number, boolean]> = [
        ["age", 18, 99, true],
        ["latitude", -90, 90, false],
        ["longitude", -180, 180, false],
        ["minAge", 18, 99, true],
        ["maxAge", 18, 99, true],
        ["maxDistance", 1, 500, true],
        ["preferredMinHeight", 120, 220, true],
    ];

    numericBounds.forEach(([field, min, max, integer]) => {
        const value = payload[field];
        if (typeof value !== "number" || Number.isNaN(value)) return;
        const bounded = Math.min(max, Math.max(min, value));
        result[field] = integer ? Math.round(bounded) : bounded;
    });

    for (let i = 1; i <= 6; i++) {
        const key = `profilePhoto${i}`;
        const url = sanitizeText(payload[key], 500);
        if (url !== undefined) result[key] = url;
    }

    return result;
};

//  FIX 1: Update User interface to include all fields from the Mongoose model

export type AuthHookReturn = ReturnType<typeof useAuth>;

// ---------------------------------------------------------------------
//  REPLACEMENT: Helper to fetch custom user data directly from Firestore
// ---------------------------------------------------------------------
const fetchUserDataFromFirestore = async (fbUser: FirebaseAuthUser): Promise<User | null> => {
    //  DEBUG LOG 1: Check if the user is present
    if (!fbUser || !fbUser.uid) {
        throw new Error("Cannot fetch Firestore data: Firebase user is null or missing UID.");
    }
    
    const docRef = doc(db, "users", fbUser.uid); 
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        console.log(` Firestore: Profile document for ${fbUser.uid} not found. Returning minimal data.`);
        return null;
    }

    const backendData = docSnap.data();
    
    //  DEBUG LOG 2: Successful retrieval
    console.log(` Firestore: Profile retrieved for ${fbUser.uid}.`);

    //  FIX 2: Map ALL fields from backendData to the complete User interface
    return {
        id: fbUser.uid, 
        email: fbUser.email!,
        name: backendData.name || 'User',
        onboardingCompleted: backendData.onboardingCompleted || false,
        
        // Core fields (must exist if registration completed)
        age: backendData.age || 0,
        gender: backendData.gender || 'MALE',
        denomination: backendData.denomination || '',
        bio: backendData.bio || '',
        location: backendData.location || '',
        
        // Optional/Onboarding fields
        latitude: backendData.latitude,
        longitude: backendData.longitude,
        phoneNumber: backendData.phoneNumber,
        countryCode: backendData.countryCode,
        birthday: backendData.birthday ? new Date(backendData.birthday.seconds * 1000) : undefined, // Handle Firestore Timestamp
        fieldOfStudy: backendData.fieldOfStudy,
        profession: backendData.profession,
        faithJourney: backendData.faithJourney,
        sundayActivity: backendData.sundayActivity,
        lookingFor: backendData.lookingFor,
        hobbies: backendData.hobbies,
        interests: backendData.interests,
        values: backendData.values,
        favoriteVerse: backendData.favoriteVerse,
        drinkingHabit: backendData.drinkingHabit,
        smokingHabit: backendData.smokingHabit,
        workoutHabit: backendData.workoutHabit,
        petPreference: backendData.petPreference,
        height: backendData.height,
        language: backendData.language,
        languageSpoken: backendData.languageSpoken,
        personalPromptQuestion: backendData.personalPromptQuestion,
        personalPromptAnswer: backendData.personalPromptAnswer,
        communicationStyle: backendData.communicationStyle,
        loveStyle: backendData.loveStyle,
        educationLevel: backendData.educationLevel,
        zodiacSign: backendData.zodiacSign,
        preferredMinHeight: backendData.preferredMinHeight,
        
        // Photo URLs
        profilePhoto1: backendData.profilePhoto1,
        profilePhoto2: backendData.profilePhoto2, 
        profilePhoto3: backendData.profilePhoto3,
        profilePhoto4: backendData.profilePhoto4,
        profilePhoto5: backendData.profilePhoto5,
        profilePhoto6: backendData.profilePhoto6,
    };
};

// Ensure a Firestore profile exists for OAuth users
const ensureUserProfile = async (fbUser: FirebaseAuthUser) => {
    const userDocRef = doc(db, "users", fbUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
        await setDoc(userDocRef, {
            email: fbUser.email || "",
            name: fbUser.displayName || "New User",
            age: 0,
            gender: "MALE",
            denomination: "",
            location: "",
            bio: "",
            onboardingCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
};


export function useAuth() {
    const navigate = useNavigate();
    const location = useLocation(); 
    const { showSuccess, showError } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false); 
    //  FIX: Use User interface
    const [user, setUser] = useState<User | null>(null);
    const [isInitialSignUp, setIsInitialSignUp] = useState(false); 
    
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const clearAppStorage = useCallback(() => {
        // Avoid nuking Firebase auth storage used for redirect/persistence.
        localStorage.removeItem("user");
        localStorage.removeItem("faithbliss-auth");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("authToken");
    }, []);

    const isAuthenticated = !!(accessToken && user);

    const syncUserFromFirebase = useCallback(async (fbUser: FirebaseAuthUser) => {
        // 1. Get the current, secure ID Token (still needed for any future custom backend calls)
        const token = await fbUser.getIdToken(); 
        setAccessToken(token);
        localStorage.setItem("accessToken", token);
        
        console.log(` Firebase Token Retrieved: ${token.substring(0, 20)}...`);

        const persistUser = (userToPersist: User) => {
            setUser(userToPersist);
            localStorage.setItem("user", JSON.stringify(userToPersist));
        };

        const minimalUser: User = { 
            id: fbUser.uid, 
            email: fbUser.email!, 
            name: fbUser.displayName || 'New User', 
            onboardingCompleted: false, 
            age: 0,
            // Default values for required fields
            gender: 'MALE', 
            denomination: '',
            bio: '',
            location: '',
        };

        try {
            // 2. Fetch/Sync custom user data from FIRESTORE
            let userToStore = await fetchUserDataFromFirestore(fbUser);

            if (!userToStore) {
                console.log(" Firestore profile missing. Creating a profile for OAuth user...");
                try {
                    await ensureUserProfile(fbUser);
                    userToStore = await fetchUserDataFromFirestore(fbUser);
                } catch (profileError) {
                    console.error(" Failed to create Firestore profile:", profileError);
                }
            }

            if (userToStore) {
                persistUser(userToStore);
                return;
            }

            // Fallback to minimal user if Firestore is unavailable
            persistUser(minimalUser);
        } catch (error) {
            console.error(" Firestore sync failed, using minimal user:", error);
            persistUser(minimalUser);
        }
    }, []);

// -----------------------------------------------------------
//  Firebase Auth State Listener (Now using Firestore Sync)
// -----------------------------------------------------------

    useEffect(() => {
        setIsLoading(true);

        const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseAuthUser | null) => {
            console.log(" onAuthStateChanged fired. User:", fbUser ? { uid: fbUser.uid, email: fbUser.email, providerData: fbUser.providerData } : null);
            if (fbUser) {
                try {
                    if (isInitialSignUp) {
                        console.log(" Auth State Listener: Detected initial sign-up, skipping profile sync (POST already ran).");
                        setIsInitialSignUp(false);
                        setIsLoading(false);
                        return;
                    }

                    await syncUserFromFirebase(fbUser);
                } catch (e: any) {
                    if (isFirebaseNetworkError(e)) {
                        console.warn("Firebase sync skipped due to temporary network issue.");
                    } else {
                        // If token fetch or Firestore sync fails for non-network reasons, force logout
                        console.error("Firebase/Firestore sync failed:", e);
                        await signOut(auth);
                        setUser(null);
                        setAccessToken(null);
                    }
                }
            } else {
                // Logged out state
                setAccessToken(null);
                setUser(null);
                clearAppStorage();
            }
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup the listener on unmount
    }, [isInitialSignUp, clearAppStorage, syncUserFromFirebase]); 
// -----------------------------------------------------------
//  Direct Login
// -----------------------------------------------------------

    //  2. Login (Uses Firebase SDK)
    const directLogin = useCallback(
        async (credentials: LoginCredentials) => {
            setIsLoggingIn(true);
            console.log("A. Attempting login for:", credentials.email);
            try {
                await setPersistence(auth, browserLocalPersistence); 
                console.log("B. Persistence set, calling sign-in...");
                
                await signInWithEmailAndPassword(
                    auth,
                    credentials.email,
                    credentials.password
                );
                
                console.log("C. Login successful (will trigger toast & useEffect)");
                showSuccess("Welcome back!", "Login Successful");
                
            } catch (error: any) {
                console.error("D. Login failed with error:", error);
                showError(getAuthErrorMessage(error, "Login failed"), "Authentication Error");
                throw error;
            } finally {
                setIsLoggingIn(false);
                console.log("E. directLogin: Login attempt finished.");
            }
        },
        [showSuccess, showError]
    );

// -----------------------------------------------------------
//  Direct Register (Now using Firestore Profile Creation)
// -----------------------------------------------------------

    //  3. Register (Uses Firebase SDK & Firestore)
    const directRegister = useCallback(
        async (credentials: RegisterCredentials) => {
            setIsRegistering(true);
            setIsInitialSignUp(true);
            try {
                // 1. Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    credentials.email,
                    credentials.password
                );
                const fbUser = userCredential.user;
                const token = await fbUser.getIdToken();

                // 2.  NEW: Create user profile document directly in Firestore
                const userDocRef = doc(db, "users", fbUser.uid);
                await setDoc(userDocRef, {
                    email: credentials.email,
                    name: credentials.name,
                    age: 0,
                    gender: credentials.gender,
                    denomination: "",
                    location: "",
                    bio: "",
                    onboardingCompleted: false, // Default value
                    createdAt: serverTimestamp(), 
                    updatedAt: serverTimestamp(),
                });

                // 3. Manually update state now that Firestore sync is COMPLETE
                //  FIX: Ensure local state has all required fields
                const userToStore: User = {
                    id: fbUser.uid,
                    email: fbUser.email!,
                    name: credentials.name,
                    onboardingCompleted: false,
                    age: 0,
                    gender: credentials.gender,
                    denomination: "",
                    bio: "",
                    location: "",
                };

                setUser(userToStore);
                setAccessToken(token);
                localStorage.setItem("accessToken", token);
                localStorage.setItem("user", JSON.stringify(userToStore));
                
                showSuccess("Account created successfully!", "Registration Successful");
                
                return {
                    accessToken: token,
                    id: fbUser.uid,
                    email: fbUser.email,
                    name: credentials.name,
                    onboardingCompleted: false,
                    accessTokenExpiresIn: 3600
                } as any;
            } catch (error: any) {
                console.error("Registration failed:", error);
                // If Firestore profile creation fails, ensure Firebase auth is rolled back
                if (auth.currentUser) {
                    await signOut(auth); 
                }
                showError(getAuthErrorMessage(error, "Registration failed"), "Registration Error");
                throw error;
            } finally {
                setIsRegistering(false);
                if (user === null) {
                    setIsInitialSignUp(false);
                }
            }
        },
        [showSuccess, showError, user]
    );


// -----------------------------------------------------------
//  NEW: Complete Onboarding (Uses Firestore Profile Update)
// -----------------------------------------------------------

    //  6. Complete Onboarding (Uses Firestore SDK)
    const completeOnboarding = useCallback(
        // This parameter type is correct, as it contains all optional fields passed from the form
        async (onboardingData: OnboardingData) => {
            setIsCompletingOnboarding(true);
            const fbUser = auth.currentUser;
            if (!fbUser) {
                throw new Error("Authentication required to complete onboarding.");
            }

            try {
                console.log("G. Firestore: Attempting to complete onboarding for user:", fbUser.uid);
                const userDocRef = doc(db, "users", fbUser.uid);
                
                //  FIX 3: Spread all fields in onboardingData, which ensures all profile fields 
                // are updated, even if they were undefined before.
                await updateDoc(userDocRef, {
                    ...sanitizeOnboardingPayload(onboardingData), // sanitize before writing to Firestore
                    onboardingCompleted: true, // Set the flag to true
                    updatedAt: serverTimestamp(),
                });

                console.log("H. Firestore: Onboarding completed successfully.");

                // After successful update, manually update the local user state
                setUser(prevUser => {
                    if (!prevUser) return null;
                    //  FIX: Ensure the merged object is explicitly cast to User to satisfy the type-checker 
                    // since OnboardingData contains a subset of User fields.
                    const updatedUser: User = { 
                        ...prevUser, 
                        ...sanitizeOnboardingPayload(onboardingData), // Merge sanitized data
                        onboardingCompleted: true,
                    };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    return updatedUser;
                });

                showSuccess("Profile complete!", "Welcome to the App!");
                return true;
            } catch (error: any) {
                console.error("Firestore Onboarding failed:", error);
                showError(getAuthErrorMessage(error, "Failed to complete onboarding."), "Onboarding Error");
                throw error;
            } finally {
                setIsCompletingOnboarding(false);
            }
        },
        [showSuccess, showError, setUser]
    );


// -----------------------------------------------------------
//  Logout and Refetch 
// -----------------------------------------------------------

    //  4. Logout (Uses Firebase SDK)
    const logout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await signOut(auth);

            clearAppStorage();
            // Clear cookies in the browser
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
            });

            showSuccess("You have been logged out", "Logout Successful");
            navigate("/login", { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
    }, [showSuccess, navigate, clearAppStorage]);

    //  5. Refetch User (Now uses Firestore)
    const refetchUser = useCallback(async () => {
        try {
            const fbUser = auth.currentUser;
            if (!fbUser) throw new Error("No current Firebase user to refresh token.");
            
            // Use the new Firestore helper for refetching
            const userToStore = await fetchUserDataFromFirestore(fbUser);
            if (!userToStore) throw new Error("User profile not found in Firestore during refetch.");

            const freshToken = await fbUser.getIdToken();

            setUser(userToStore);
            setAccessToken(freshToken);
            localStorage.setItem("accessToken", freshToken);
            localStorage.setItem("user", JSON.stringify(userToStore));
        } catch (err) {
            console.error("Refetch user failed:", err);
        }
    }, []);


// -----------------------------------------------------------
//  Handle Google redirect result (avoids popup COOP issues)
// -----------------------------------------------------------
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                console.log(" Checking getRedirectResult... currentUser:", auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null);
                const result = await getRedirectResult(auth);
                console.log(" getRedirectResult result:", result ? { uid: result.user.uid, email: result.user.email, providerData: result.user.providerData } : null);
                if (result?.user) {
                    // In some cases onAuthStateChanged can be late or skipped after redirect.
                    // Sync user here to ensure auth state is hydrated.
                    setIsLoading(true);
                    await ensureUserProfile(result.user);
                    await syncUserFromFirebase(result.user);
                    setIsLoading(false);
                }
            } catch (error: any) {
                if (isFirebaseNetworkError(error)) {
                    console.warn("Google redirect check deferred due to network issue.");
                } else {
                    console.error("Google redirect handling failed:", error);
                }
                setIsLoading(false);
            }
        };

        handleRedirectResult();
    }, [syncUserFromFirebase]);



// -----------------------------------------------------------
//  Google Sign-In (Firebase Auth + Firestore profile creation)
// -----------------------------------------------------------

    const googleSignIn = useCallback(
        async (mode: "login" | "signup") => {
            if (mode === "signup") {
                setIsRegistering(true);
            } else {
                setIsLoggingIn(true);
            }

            try {
                await setPersistence(auth, browserLocalPersistence);
                const provider = new GoogleAuthProvider();
                try {
                    const result = await signInWithPopup(auth, provider);
                    if (result?.user) {
                        await ensureUserProfile(result.user);
                        await syncUserFromFirebase(result.user);
                    }
                } catch (popupError: any) {
                    // Fallback to redirect if popup is blocked or unavailable
                    if (
                        popupError?.code === "auth/popup-blocked" ||
                        popupError?.code === "auth/operation-not-supported-in-this-environment" ||
                        popupError?.code === "auth/popup-closed-by-user"
                    ) {
                        await signInWithRedirect(auth, provider);
                    } else {
                        throw popupError;
                    }
                }
            } catch (error: any) {
                console.error("Google sign-in failed:", error);
                if (isFirebaseNetworkError(error)) {
                    showError(
                        "Network error while contacting Google/Firebase. Check your connection and try again.",
                        "Authentication Error"
                    );
                    return;
                }
                showError(getAuthErrorMessage(error, "Google sign-in failed"), "Authentication Error");
                throw error;
            } finally {
                if (mode === "signup") {
                    setIsRegistering(false);
                } else {
                    setIsLoggingIn(false);
                }
            }
        },
        [showSuccess, showError, refetchUser]
    );


// -----------------------------------------------------------
//  Navigation and Return (FIXED NAVIGATION LOGIC)
// -----------------------------------------------------------

    //  NAVIGATION: Use a separate effect to handle navigation once auth is stable
    useEffect(() => {
        if (!isLoading && user) {
            const target = user.onboardingCompleted ? "/dashboard" : "/onboarding";
            
            //  FIX: Only force redirect if the user is on a transient route
            // (like '/', '/login', or the opposite of their required route)
            const isTransientRoute = ['/', '/login', '/register'].includes(location.pathname);
            
            // This checks if the user is on the WRONG core page (e.g., done onboarding but still on /onboarding)
            const isOnWrongCoreRoute = (location.pathname === "/onboarding" && user.onboardingCompleted) ||
                                       (location.pathname === "/dashboard" && !user.onboardingCompleted);
            
            // We only redirect if we are on a known transient or incorrect core route.
            if (isTransientRoute || isOnWrongCoreRoute) {
                if (location.pathname !== target) {
                    console.log(` Redirecting: ${location.pathname} -> ${target}`);
                    navigate(target, { replace: true });
                    return;
                }
            }
            
            console.log(` Navigation Stable: Allowed access to ${location.pathname}.`);
        }
    }, [isLoading, user, navigate, location.pathname]);

    // -----------------------------------------------------------
//  NEW: View Another Users Profile (by UID)
// -----------------------------------------------------------
const getUserProfileById = useCallback(async (userId: string): Promise<User | null> => {
    if (!userId) {
        console.warn(" getUserProfileById called with empty userId");
        return null;
    }

    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.warn(` No user profile found for UID: ${userId}`);
            return null;
        }

        const data = docSnap.data();

        const profile: User = {
            id: userId,
            email: data.email || "",
            name: data.name || "Unknown User",
            onboardingCompleted: data.onboardingCompleted || false,
            age: data.age || 0,
            gender: data.gender || "MALE",
            denomination: data.denomination || "",
            bio: data.bio || "",
            location: data.location || "",

            // Optional fields
            latitude: data.latitude,
            longitude: data.longitude,
            phoneNumber: data.phoneNumber,
            countryCode: data.countryCode,
            birthday: data.birthday ? new Date(data.birthday.seconds * 1000) : undefined,
            fieldOfStudy: data.fieldOfStudy,
            profession: data.profession,
            faithJourney: data.faithJourney,
            sundayActivity: data.sundayActivity,
            churchAttendance: data.churchAttendance,
            baptismStatus: data.baptismStatus,
            spiritualGifts: data.spiritualGifts,
            relationshipGoals: data.relationshipGoals,
            lifestyle: data.lifestyle,
            lookingFor: data.lookingFor,
            hobbies: data.hobbies,
            interests: data.interests,
            values: data.values,
            favoriteVerse: data.favoriteVerse,
            drinkingHabit: data.drinkingHabit,
            smokingHabit: data.smokingHabit,
            workoutHabit: data.workoutHabit,
            petPreference: data.petPreference,
            height: data.height,
            language: data.language,
            languageSpoken: data.languageSpoken,
            personalPromptQuestion: data.personalPromptQuestion,
            personalPromptAnswer: data.personalPromptAnswer,
            communicationStyle: data.communicationStyle,
            loveStyle: data.loveStyle,
            educationLevel: data.educationLevel,
            zodiacSign: data.zodiacSign,
            preferredMinHeight: data.preferredMinHeight,

            // Photos
            profilePhoto1: data.profilePhoto1,
            profilePhoto2: data.profilePhoto2,
            profilePhoto3: data.profilePhoto3,
            profilePhoto4: data.profilePhoto4,
            profilePhoto5: data.profilePhoto5,
            profilePhoto6: data.profilePhoto6,
        };

        console.log(` Firestore: Successfully fetched user profile for UID: ${userId}`);
        return profile;
    } catch (error: any) {
        console.error(` Failed to fetch user profile for UID: ${userId}`, error);
        return null;
    }
}, []);


    return {
        isLoading,
        isAuthenticated,
        user,
        accessToken,
        isLoggingIn,
        isRegistering,
        isLoggingOut,
        isCompletingOnboarding, 
        directLogin,
        directRegister,
        logout,
        refetchUser,
        completeOnboarding,
        getUserProfileById,
        googleSignIn
    };
}

export function useRequireAuth() {
    return useAuthContext();
}

export function useOptionalAuth() {
    return useAuthContext();
}
