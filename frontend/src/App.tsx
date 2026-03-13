/* eslint-disable no-irregular-whitespace */
// src/App.tsx

import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationListener } from './components/NotificationListener';
import { SeoMetaManager } from './components/SeoMetaManager';
import { API } from './services/api';

// Define the paths that should use the special "Auth Layout"
const authPaths = ['/login', '/signup'];
// Include the Onboarding path in a list that needs a specific full-screen treatment.
const fullScreenPaths = ['/onboarding', '/about', '/privacy'];
const appShellPaths = [
  '/dashboard',
  '/community',
  '/messages',
  '/notifications',
  '/matches',
  '/premium',
  '/payment-success',
  '/settings',
  '/help',
  '/report',
  '/deactivate',
  '/profile',
];
const FEATURE_SETTINGS_SYNC_KEY = 'faithbliss:feature-settings-updated-at';
const FEATURE_SETTINGS_SYNC_EVENT = 'faithbliss:feature-settings-updated';

function App() {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false);
  const [maintenanceLoaded, setMaintenanceLoaded] = useState(false);
  const isAuthRoute = authPaths.includes(pathname);
  const isAppShellRoute = appShellPaths.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isFullScreenRoute = isAuthRoute || fullScreenPaths.includes(pathname) || isAppShellRoute;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const shouldShowMaintenanceGate = maintenanceLoaded && maintenanceModeEnabled && !isAdminRoute;

  useEffect(() => {
    let isMounted = true;

    const loadFeatureSettings = async () => {
      try {
        const response = await API.User.getPublicFeatureSettings();
        if (!isMounted) return;
        setMaintenanceModeEnabled(Boolean(response.maintenanceModeEnabled));
      } catch {
        if (!isMounted) return;
        setMaintenanceModeEnabled(false);
      } finally {
        if (isMounted) {
          setMaintenanceLoaded(true);
        }
      }
    };

    const handleFocus = () => {
      void loadFeatureSettings();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      void loadFeatureSettings();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== FEATURE_SETTINGS_SYNC_KEY) return;
      void loadFeatureSettings();
    };

    const handleFeatureSettingsEvent = () => {
      void loadFeatureSettings();
    };

    void loadFeatureSettings();

    const refreshInterval = window.setInterval(() => {
      void loadFeatureSettings();
    }, 15000);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);
    window.addEventListener(FEATURE_SETTINGS_SYNC_EVENT, handleFeatureSettingsEvent);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(FEATURE_SETTINGS_SYNC_EVENT, handleFeatureSettingsEvent);
    };
  }, [pathname]);

  if (!maintenanceLoaded && !isAdminRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-sm text-slate-400">
        <SeoMetaManager />
        Checking site status...
      </div>
    );
  }

  if (shouldShowMaintenanceGate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-white">
        <SeoMetaManager />
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.16),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-8 text-center shadow-[0_30px_90px_rgba(2,6,23,0.55)] sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-3xl text-rose-200 shadow-[0_0_35px_rgba(244,114,182,0.22)]">
            !
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-rose-200/90">
            Temporary Downtime
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Broken page, please check back later
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            We are making a few fixes behind the scenes right now. The app will be available again shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SeoMetaManager />
      <NotificationListener />
      {isAuthRoute ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Outlet />
        </div>
      ) : isFullScreenRoute ? (
        <Outlet />
      ) : (
        <div className="flex flex-col">
          <main className="flex-grow container mx-auto p-4 max-w-7xl">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
