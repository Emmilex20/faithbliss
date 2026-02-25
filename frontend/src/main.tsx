// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Home from './pages/Home.tsx';
import './index.css';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import Dashboard from './pages/Dashboard.tsx';
// 💡 CORRECTION: Import the ProfilePage component directly, as ProtectedRoute wrapper is removed inside.
import ProfilePage from './pages/UserProfileView.tsx';
import Profile from './pages/Profile.tsx'
// 💡 ADDITION: Import the Messages component
import Messages from './pages/Messages.tsx';
import Notifications from './pages/Notifications.tsx';
import Premium from './pages/Premium.tsx';
import PaymentSuccess from './pages/PaymentSuccess.tsx';
import OnboardingRouteWrapper from './pages/OnboardingPage.tsx';
import MatchPage from './pages/MatchesPage.tsx';
import Community from './pages/Community.tsx';
import About from './pages/About.tsx';
import Privacy from './pages/Privacy.tsx';
import Settings from './pages/Settings.tsx';
import Help from './pages/Help.tsx';
import Report from './pages/Report.tsx';
import Deactivate from './pages/Deactivate.tsx';

// Import the Contexts and Gates
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { AuthGate, PublicOnlyRoute } from './components/AuthGate.tsx';

const isFirebaseNetworkFailure = (reason: unknown): boolean => {
  const code = (reason as { code?: unknown })?.code;
  const message = (reason as { message?: unknown })?.message;
  return (
    (typeof code === 'string' && code === 'auth/network-request-failed')
    || (typeof message === 'string' && message.includes('auth/network-request-failed'))
  );
};

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (!isFirebaseNetworkFailure(event.reason)) return;
    event.preventDefault();
    console.warn('Suppressed unhandled Firebase network-request-failed rejection at bootstrap.');
  });

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
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
              <Route path="privacy" element={<Privacy />} />
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
                <Route path="onboarding" element={<OnboardingRouteWrapper />} />

                {/* Dashboard and other private routes */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="community" element={<Community />} />

                {/* 💡 ADDED: Messages Route (Now protected by AuthGate) */}
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="premium" element={<Premium />} />
                <Route path="payment-success" element={<PaymentSuccess />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
                <Route path="report" element={<Report />} />
                <Route path="deactivate" element={<Deactivate />} />

                {/* 💡 CORRECTION: Use dynamic route path and the direct component */}
                <Route path="profile/:id" element={<ProfilePage />} />
                <Route path="profile" element={<Profile />} />

                <Route path="matches" element={<MatchPage />} />


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
