// src/hooks/useSession.ts

import { useState, useEffect } from 'react';
// You might need a utility to decode JWTs. If you don't have one, 
// you can install 'jwt-decode' (npm install jwt-decode)
// For this example, we'll assume a local helper function.

// --- Helper Functions (Replace with a proper JWT library) ---

/**
 * A simple utility to decode the JWT payload.
 * This is a simplification and should ideally use a library like 'jwt-decode'.
 */
const decodeJwt = (token: string): UserData | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    // Assuming the payload has 'id' and 'name'
    const payload = JSON.parse(jsonPayload);
    
    // Basic validation and mapping to UserData structure
    if (payload.userId && payload.userName) {
        return {
            id: payload.userId, // Map your actual token field (e.g., 'sub' or 'userId')
            name: payload.userName, // Map your actual token field
        };
    }
    return null;

  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
// -----------------------------------------------------------

interface UserData {
  id: string;
  name: string;
  // Add other user properties that exist in your JWT payload
}

interface SessionData {
  user: UserData;
  token: string;
}

interface SessionHookReturn {
  data: SessionData | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  // Add other functions like refreshSession, logout, etc.
}

const STORAGE_KEY = 'authToken'; // Key used to store the token

/**
 * A hook to manage and retrieve the current user session by reading a JWT.
 */
export const useSession = (): SessionHookReturn => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<SessionHookReturn['status']>('loading');

  useEffect(() => {
    // 1. Read token from local storage
    const token = localStorage.getItem(STORAGE_KEY);

    if (!token) {
      // 2. No token found
      setSession(null);
      setStatus('unauthenticated');
      return;
    }
    
    // 3. Decode the token to get user data
    const user = decodeJwt(token);

    if (user) {
      // 4. Token decoded successfully and user data extracted
      setSession({ user, token });
      setStatus('authenticated');
    } else {
      // 5. Token found but invalid or expired
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      setStatus('unauthenticated');
    }

  }, []); // Run only once on mount

  return { data: session, status };
};

// You should also export functions for handling login/logout from your auth context
// For example:
export const setAuthToken = (token: string) => {
    localStorage.setItem(STORAGE_KEY, token);
    // You might need a state update mechanism here (e.g., using a global context)
};

export const clearAuthToken = () => {
    localStorage.removeItem(STORAGE_KEY);
    // You might need a state update mechanism here
};