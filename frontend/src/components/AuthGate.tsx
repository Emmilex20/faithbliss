import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const ONBOARDING_PAUSE_STORAGE_KEY = 'faithbliss_onboarding_pause_state';

export const AuthGate: React.FC = () => {
  const { isLoading, isAuthenticated, user } = useAuthContext();
  const location = useLocation();
  const path = location.pathname;

  const obStatus = user?.onboardingCompleted ? 'Complete' : user ? 'Pending' : 'N/A';
  console.log(`E. AUTH_GATE CHECK: Path=${path}, Loading=${isLoading}, Auth=${isAuthenticated}, Onboarding=${obStatus}`);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    console.log('F. AUTH_GATE REDIRECT: User is NOT authenticated. Redirecting to /login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !user.onboardingCompleted) {
    let allowPausedDashboardAccess = false;
    try {
      const rawPauseState = localStorage.getItem(ONBOARDING_PAUSE_STORAGE_KEY);
      if (rawPauseState) {
        const parsed = JSON.parse(rawPauseState) as { uid?: string };
        allowPausedDashboardAccess = parsed.uid === user.id && path.startsWith('/dashboard');
      }
    } catch {
      allowPausedDashboardAccess = false;
    }

    if (allowPausedDashboardAccess) {
      console.log('H1. AUTH_GATE ACCESS: Onboarding paused, allowing temporary dashboard access.');
      return <Outlet />;
    }

    if (!path.startsWith('/onboarding')) {
      console.log('G. AUTH_GATE REDIRECT: Onboarding is PENDING. Redirecting to /onboarding.');
      return <Navigate to="/onboarding" replace />;
    }

    console.log('H. AUTH_GATE ACCESS: Onboarding is PENDING, allowing access to /onboarding.');
    return <Outlet />;
  }

  if (user && user.onboardingCompleted) {
    if (path.startsWith('/onboarding')) {
      console.log('I. AUTH_GATE REDIRECT: Onboarding is COMPLETE. Redirecting AWAY from /onboarding to /dashboard.');
      return <Navigate to="/dashboard" replace />;
    }

    console.log('J. AUTH_GATE ACCESS: Onboarding is COMPLETE, allowing access.');
    return <Outlet />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (isAuthenticated) {
    const targetPath = user && !user.onboardingCompleted ? '/onboarding' : '/dashboard';
    console.log(`K. PUBLIC_GATE REDIRECT: Logged in. Redirecting from public route to ${targetPath}.`);
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};
