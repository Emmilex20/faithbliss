/* eslint-disable no-irregular-whitespace */
// src/components/auth/AuthGate.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext'; 

/**
 * AuthGate component handles routing based on user authentication and onboarding status.
 * Use this to wrap routes that require authentication.
 */
export const AuthGate: React.FC = () => {
    const { isLoading, isAuthenticated, user } = useAuthContext();
    const location = useLocation();

    // --- LOG (E) ---
    const path = location.pathname;
    const obStatus = user?.onboardingCompleted ? 'Complete' : (user ? 'Pending' : 'N/A');
    console.log(`E. AUTH_GATE CHECK: Path=${path}, Loading=${isLoading}, Auth=${isAuthenticated}, Onboarding=${obStatus}`);
    
   // 1. Wait for session loading
   if (isLoading) {
        return null;
   }

    // 2. Unauthenticated: Redirect to login
    if (!isAuthenticated) {
        // --- LOG (F) ---
        console.log("F. AUTH_GATE REDIRECT: User is NOT authenticated. Redirecting to /login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // User is Authenticated from this point onward.

    // 3. Onboarding Required (user is authenticated but not complete)
    if (user && !user.onboardingCompleted) {
        // If the current path IS NOT the onboarding path, redirect them to it.
        if (!path.startsWith('/onboarding')) {
            // --- LOG (G) ---
            console.log("G. AUTH_GATE REDIRECT: Onboarding is PENDING. Redirecting to /onboarding.");
            return <Navigate to="/onboarding" replace />;
        }
        // --- LOG (H) ---
        console.log("H. AUTH_GATE ACCESS: Onboarding is PENDING, allowing access to /onboarding.");
        return <Outlet />;
    }

    // 4. Onboarding Complete (user is authenticated AND complete)
    if (user && user.onboardingCompleted) {
        // If the current path IS the onboarding path, redirect them AWAY from it.
        if (path.startsWith('/onboarding')) {
            // --- LOG (I) ---
            console.log("I. AUTH_GATE REDIRECT: Onboarding is COMPLETE. Redirecting AWAY from /onboarding to /dashboard.");
            return <Navigate to="/dashboard" replace />; // Redirect to the main app page
        }
        
        // --- LOG (J) ---
        console.log("J. AUTH_GATE ACCESS: Onboarding is COMPLETE, allowing access.");
        return <Outlet />;
    }
    
    // Default fallback (should be rare)
    return <Outlet />;
};

// Also create a separate PublicRoute to redirect authenticated users AWAY from login/signup
export const PublicOnlyRoute: React.FC = () => {
    const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) return null;

    if (isAuthenticated) {
        // If logged in, redirect them based on onboarding status
        const targetPath = (user && !user.onboardingCompleted) ? '/onboarding' : '/dashboard';
        // --- LOG (K) ---
        console.log(`K. PUBLIC_GATE REDIRECT: Logged in. Redirecting from public route to ${targetPath}.`);
        return <Navigate to={targetPath} replace />;
    }
    
    // If not authenticated, allow access to the public route (Login/Signup)
    return <Outlet />;
}
