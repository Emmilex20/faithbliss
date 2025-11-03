/* eslint-disable no-irregular-whitespace */
// src/contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useAuth, type AuthHookReturn } from '../hooks/useAuth'; 

type AuthContextType = AuthHookReturn;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useAuth(); 

    if (auth.isLoading) {
        // --- LOG (C) ---
        console.log("C. AUTH_CONTEXT: App is loading user session...");
        return <div className="p-8 text-center text-gray-500">Initializing session...</div>;
    }
    
    // --- LOG (D) ---
    console.log("D. AUTH_CONTEXT: Session loaded and ready.");
    if (auth.user) {
        console.log("   -> IsAuthenticated:", auth.isAuthenticated, "Onboarding:", auth.user.onboardingCompleted);
    } else {
        console.log("   -> IsAuthenticated: false (user null).");
    }

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};