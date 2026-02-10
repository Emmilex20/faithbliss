/* eslint-disable no-irregular-whitespace */
// src/App.tsx

import { Outlet, useLocation } from 'react-router-dom';
import { NotificationListener } from './components/NotificationListener';
import { SeoMetaManager } from './components/SeoMetaManager';

// Define the paths that should use the special "Auth Layout"
const authPaths = ['/login', '/signup'];
// Include the Onboarding path in a list that needs a specific full-screen treatment.
const fullScreenPaths = ['/onboarding', '/about', '/privacy'];
const appShellPaths = [
  '/dashboard',
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

function App() {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const isAuthRoute = authPaths.includes(pathname);
  const isAppShellRoute = appShellPaths.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isFullScreenRoute = isAuthRoute || fullScreenPaths.includes(pathname) || isAppShellRoute;

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
