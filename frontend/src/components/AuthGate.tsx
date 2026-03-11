import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const ONBOARDING_PAUSE_STORAGE_KEY = 'faithbliss_onboarding_pause_state';

export const AuthGate: React.FC = () => {
  const { isLoading, isAuthenticated, user } = useAuthContext();
  const location = useLocation();
  const path = location.pathname;

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
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
      return <Outlet />;
    }

    if (!path.startsWith('/onboarding')) {
      return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
  }

  if (user && user.onboardingCompleted) {
    if (path.startsWith('/onboarding')) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (isAuthenticated) {
    const targetPath = user && !user.onboardingCompleted ? '/onboarding' : '/dashboard';
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (String(user?.role || 'user').toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
