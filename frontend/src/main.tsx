// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Home from './pages/Home.tsx';
import './index.css';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import VerifyEmail from './pages/VerifyEmail.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import Dashboard from './pages/Dashboard.tsx';
// 💡 CORRECTION: Import the ProfilePage component directly, as ProtectedRoute wrapper is removed inside.
import ProfilePage from './pages/UserProfileView.tsx';
import Profile from './pages/Profile.tsx'
// 💡 ADDITION: Import the Messages component
import Messages from './pages/Messages.tsx';
import Notifications from './pages/Notifications.tsx';
import Premium from './pages/Premium.tsx';
import InAppPurchases from './pages/InAppPurchases.tsx';
import PaymentSuccess from './pages/PaymentSuccess.tsx';
import OnboardingRouteWrapper from './pages/OnboardingPage.tsx';
import MatchPage from './pages/MatchesPage.tsx';
import Community from './pages/Community.tsx';
import Explore from './pages/Explore.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';
import Privacy from './pages/Privacy.tsx';
import Settings from './pages/Settings.tsx';
import Help from './pages/Help.tsx';
import Report from './pages/Report.tsx';
import SafetyNote from './pages/SafetyNote.tsx';
import Deactivate from './pages/Deactivate.tsx';
import OnboardingDebug from './pages/OnboardingDebug.tsx';
import Admin from './pages/Admin.tsx';
import DeveloperHub from './pages/DeveloperHub.tsx';

// Import the Contexts and Gates
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { AdminRoute, AuthGate, DeveloperRoute, PublicOnlyRoute } from './components/AuthGate.tsx';

const isFirebaseNetworkFailure = (reason: unknown): boolean => {
  const candidates = [
    reason,
    (reason as { reason?: unknown })?.reason,
    (reason as { error?: unknown })?.error,
  ];

  return candidates.some((candidate) => {
    const code = (candidate as { code?: unknown })?.code;
    const message = (candidate as { message?: unknown })?.message;
    return (
      (typeof code === 'string' && code === 'auth/network-request-failed')
      || (typeof message === 'string' && (
        message.includes('auth/network-request-failed')
        || message.toLowerCase().includes('network request failed')
      ))
    );
  });
};

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (!isFirebaseNetworkFailure(event.reason)) return;
    event.preventDefault();
    console.warn('Suppressed unhandled Firebase network-request-failed rejection at bootstrap.');
  });

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      void (async () => {
        try {
          const response = await fetch('/sw.js', {
            cache: 'no-store',
            headers: {
              Accept: 'application/javascript,text/javascript,*/*',
            },
          });

          const contentType = response.headers.get('content-type') || '';
          const looksLikeScript =
            response.ok
            && !contentType.toLowerCase().includes('text/html');

          if (!looksLikeScript) {
            console.warn('Skipping service worker registration because /sw.js did not resolve to a JavaScript file.');
            return;
          }

          await navigator.serviceWorker.register('/sw.js');
        } catch (error) {
          console.warn('Service worker registration failed:', error);
        }
      })();
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>

            {/* Route 1: The Landing Page (No Auth required) */}
            <Route path="/" element={<Home />} />

            {/* Public Marketing Routes */}
            <Route element={<App />}>
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>

            {/* Route 2: Public Routes (Login/Signup) */}
            <Route element={<PublicOnlyRoute />}>
              <Route element={<App />}>
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<SignUp />} />
              </Route>
            </Route>

            {/* 3. Protected Routes */}
            <Route element={<AuthGate />}>
              <Route element={<App />}>

                {/* Onboarding Route (requires auth, enforces onboarding completion) */}
                <Route path="verify-email" element={<VerifyEmail />} />
                <Route path="onboarding" element={<OnboardingRouteWrapper />} />

                {/* Dashboard and other private routes */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="community" element={<Community />} />
                <Route path="explore" element={<Explore />} />

                {/* 💡 ADDED: Messages Route (Now protected by AuthGate) */}
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="premium" element={<Premium />} />
                <Route path="purchases" element={<InAppPurchases />} />
                <Route path="payment-success" element={<PaymentSuccess />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
                <Route path="report" element={<Report />} />
                <Route path="safety-note" element={<SafetyNote />} />
                <Route path="deactivate" element={<Deactivate />} />
                <Route path="debug/onboarding" element={<OnboardingDebug />} />

                {/* 💡 CORRECTION: Use dynamic route path and the direct component */}
                <Route path="profile/:id" element={<ProfilePage />} />
                <Route path="profile" element={<Profile />} />

                <Route path="matches" element={<MatchPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="admin" element={<Admin />} />
                </Route>
                <Route element={<DeveloperRoute />}>
                  <Route path="developer" element={<DeveloperHub />} />
                </Route>

              </Route>
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<div>404 Not Found</div>} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>,
);
