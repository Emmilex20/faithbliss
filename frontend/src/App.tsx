/* eslint-disable no-irregular-whitespace */
// src/App.tsx

import { Outlet, useLocation } from 'react-router-dom';
import { NotificationListener } from './components/NotificationListener';

// Define the paths that should use the special "Auth Layout"
const authPaths = ['/login', '/signup'];
// Include the Onboarding path in a list that needs a specific full-screen treatment
// This often needs the same dark, full-page treatment as auth, but is not centered.
const fullScreenPaths = ['/onboarding', '/about', '/privacy']; 

function App() {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const isAuthRoute = authPaths.includes(pathname);
  const isFullScreenRoute = isAuthRoute || fullScreenPaths.includes(pathname);

  // 🌟 GLOBAL LAYOUT BASE: Apply the dark background to the root container 🌟
  return (
    <div className="min-h-screen bg-gray-900 text-white">
    <NotificationListener />
      {isAuthRoute ? (
        // 🔐 AUTH LAYOUT: Centered content (Login, Signup)
        <div className="min-h-screen flex items-center justify-center p-4">
          <Outlet /> 
        </div>
      ) : isFullScreenRoute ? (
        // 📝 ONBOARDING LAYOUT: Full-screen, but usually left-aligned/scrolling
        // The OnboardingPage component itself will manage its padding and centering.
        <Outlet />
      ) : (
        // 🌍 DEFAULT LAYOUT (For pages like Home, Dashboard, etc.)
        <div className="flex flex-col">
          {/* If you add Header, it goes here */}
          
          {/* Apply a maximum width to the main content area for standard pages */}
          <main className="flex-grow container mx-auto p-4 max-w-7xl">
            <Outlet />
          </main>
          
          {/* If you add Footer, it goes here */}
        </div>
      )}
    </div>
  );
}

export default App;
