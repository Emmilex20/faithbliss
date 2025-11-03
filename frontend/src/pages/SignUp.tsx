/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff, Mail, Lock, User, Heart, Sparkles } from 'lucide-react';
import { PopupInstruction } from '@/components/auth/PopupInstruction'; 
import { SuccessModal } from '@/components/SuccessModal';
import { HeartBeatIcon } from '@/components/HeartBeatIcon';
import { useAuthContext } from '../contexts/AuthContext'; 

// --- Configuration ---
// 🌟 FIX APPLIED: Reading VITE_API_URL for consistency with useAuth.tsx 🌟
// Get API URL from environment variables or use a default for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// ---------------------

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'MALE',
    denomination: 'OTHER',
    location: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopupInstruction, setShowPopupInstruction] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { directRegister, isRegistering, isAuthenticated, isLoading } = useAuthContext();

  const navigate = useNavigate(); 

  // Redirect authenticated users away from signup page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // If the user is authenticated and lands here, redirect to the default authenticated route.
      // AuthGate should handle this, but this is a fail-safe.
      navigate('/onboarding', { replace: true }); 
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Only show success modal if redirected from an actual signup action
  useEffect(() => {
    // Check for the flag that was set before redirecting for Google sign-up
    const fromSignup = typeof window !== 'undefined' ? sessionStorage.getItem('fromSignup') : null;

    if (isAuthenticated && fromSignup) {
      setShowSuccessModal(true);
      // remove the flag so it doesn't trigger again on page reload
      sessionStorage.removeItem('fromSignup');
    }

    if (!isLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading]);

  // Google sign-in: Redirects user to the backend OAuth initiation endpoint
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      // 🌟 ADDED CHECK: Ensure API_URL is defined before redirecting 🌟
      if (!API_URL) {
        throw new Error("Backend URL (VITE_API_URL) is not configured.");
      }

      if (typeof window !== 'undefined') {
        // Set a flag in session storage to trigger the success modal/onboarding logic later
        sessionStorage.setItem('fromSignup', 'true');
      }

      // When signing up via Google, we always want to land on /onboarding
      const callbackUrl = '/onboarding'; 
        // ✅ FIX: Ensure the full API path is used to match server.ts: /api/auth
        const googleAuthUrl = `${API_URL}/api/auth/google?callbackUrl=${callbackUrl}`; 
 
        window.location.href = googleAuthUrl;
      
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      setError(err?.message || 'Failed to sign up with Google. Please try again.');
      if (typeof window !== 'undefined') sessionStorage.removeItem('fromSignup');
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return setError('Please enter your full name');
    if (!formData.email.trim()) return setError('Please enter your email address');
    if (!formData.password.trim()) return setError('Please enter a password');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters long');
    if (parseInt(formData.age) < 18) return setError('You must be at least 18 years old to join FaithBliss');
    if (!formData.location.trim()) return setError('Please enter your location');
    
    setError('');

    try {
      await directRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender as 'MALE' | 'FEMALE',
        denomination: formData.denomination,
        location: formData.location, 
        bio: formData.bio || '',
      });

      // Navigation is now correctly handled inside useAuth.tsx -> directRegister
      // No need for redundant navigation here.

    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred during signup.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { // Changed type to include HTMLSelectElement
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center">
      <HeartBeatIcon />
    </div>;
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
            Join FaithBliss
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">Your love journey starts here!</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Google Sign Up Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || isRegistering}
          className="w-full mb-6 flex items-center justify-center gap-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 text-white py-3 px-4 sm:px-6 rounded-xl font-medium hover:bg-gray-600/50 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle size={20} />
          <span className="text-sm sm:text-base">
            {loading ? 'Connecting...' : 'Continue with Google'}
          </span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-800/50 text-gray-400">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 placeholder-gray-400 transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
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
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 placeholder-gray-400 transition-all"
                placeholder="Create a secure password"
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

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="18"
              max="100"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 placeholder-gray-400 transition-all"
              placeholder="Your age"
              required
            />
            </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange} // Uses the unified handler now
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 transition-all"
              required
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label htmlFor="denomination" className="block text-sm font-medium text-gray-300 mb-2">
              Denomination
            </label>
            <select
              id="denomination"
              name="denomination"
              value={formData.denomination}
              onChange={handleInputChange} // Uses the unified handler now
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 transition-all"
              required
            >
              <option value="BAPTIST">Baptist</option>
              <option value="METHODIST">Methodist</option>
              <option value="PRESBYTERIAN">Presbyterian</option>
              <option value="PENTECOSTAL">Pentecostal</option>
              <option value="CATHOLIC">Catholic</option>
              <option value="ORTHODOX">Orthodox</option>
              <option value="ANGLICAN">Anglican</option>
              <option value="LUTHERAN">Lutheran</option>
              <option value="ASSEMBLIES_OF_GOD">Assemblies of God</option>
              <option value="SEVENTH_DAY_ADVENTIST">Seventh Day Adventist</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 placeholder-gray-400 transition-all"
              placeholder="e.g., Lagos, Nigeria"
              required
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
              Bio <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 placeholder-gray-400 transition-all resize-none"
              placeholder="Tell us a bit about yourself..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={isRegistering || loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="flex items-center justify-center gap-2">
              {isRegistering ? (
                <>
                  <HeartBeatIcon size="md" className="text-white" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Join the Family
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Popup Instruction Modal */}
      <PopupInstruction
        show={showPopupInstruction}
        onDismiss={() => setShowPopupInstruction(false)}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/onboarding');
        }}
        title="Welcome to FaithBliss!"
        message="Your account has been created successfully! Let's complete your profile to find your perfect match."
        autoCloseMs={3000}
      />
    </div>
  );
}