// src/components/auth/LoginForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, Suspense } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; 
import { FcGoogle } from 'react-icons/fc';
import { Heart, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { HeartBeatLoader } from '@/components/HeartBeatLoader'; 
import { useAuthContext } from '../contexts/AuthContext'; 

function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 

  // Assuming useAuthContext is imported from the corrected context file
  const { directLogin, googleSignIn, isLoggingIn, isLoading, isAuthenticated } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get callbackUrl from search params, default to dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'; // Changed to '/dashboard' for consistency

  // If already authenticated, redirect away from login page (handled by PublicOnlyRoute now)
  // We keep this check here as a fallback, but the AuthGate/PublicOnlyRoute is primary.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        // The PublicOnlyRoute should handle this, but for robustness:
        console.log("LOGIN_FORM: User is authenticated. Navigating to callbackUrl:", callbackUrl);
        navigate(callbackUrl, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, callbackUrl]);


  // Display errors passed from the URL
  useEffect(() => {
    const urlError = searchParams.get('error');

    if (urlError) {
      setError(`Authentication Error: ${urlError}. Please try again.`);

      // Clean the error from the URL without reloading the page
      navigate(window.location.pathname, { replace: true });
    }
  }, [searchParams, navigate]);

  // Google sign-in: Redirects user to the backend OAuth initiation endpoint
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await googleSignIn("login");
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  // Email (credentials) sign-in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("0. LOGIN FORM: Submit handler called.");
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');

    try {
      // directLogin now updates state and handles the final navigation 
      // based on the user's onboarding status inside useAuth.tsx.
      await directLogin({ email, password });
      
      // -----------------------------------------------------------------------
      // 🛑 REMOVED THE REDUNDANT NAVIGATION LINE HERE 🛑
      // navigate(callbackUrl, { replace: true }); // <--- THIS WAS THE ISSUE
      // -----------------------------------------------------------------------

    } catch (error: any) {
      setError(error.message || 'An error occurred during sign-in');
    }
  };


  // UI loading state while fetching auth status
  if (isLoading) {
    return <HeartBeatLoader />;
  }

  return (
    <div className="max-w-md w-full">
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-gray-700/50">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-2xl font-bold text-white">FaithBliss</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">Sign in to continue your faith journey</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading || isLoggingIn} // Check both loading states
          className="w-full mb-6 flex items-center justify-center gap-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 text-white py-3 px-4 sm:px-6 rounded-xl font-medium hover:bg-gray-600/50 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle size={20} />
          <span className="text-sm sm:text-base">{loading ? 'Redirecting...' : 'Continue with Google'}</span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-800/50 text-gray-400">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 placeholder-gray-400 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 placeholder-gray-400 transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="flex items-center justify-center gap-2">
              {isLoggingIn ? 'Signing In...' : <><LogIn className="w-5 h-5" /> Sign In</>}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main login page component with Suspense boundary
export default function Login() {
  return (
    <Suspense fallback={<HeartBeatLoader />}>
      <LoginForm />
    </Suspense>
  );
}
