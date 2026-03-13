import { Heart, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HeartBeatLoader } from '@/components/HeartBeatLoader';
import { useAuthContext } from '@/contexts/AuthContext';

function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { validatePasswordResetCode, resetPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');

  const oobCode = useMemo(() => searchParams.get('oobCode') || '', [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const validateCode = async () => {
      try {
        setIsCheckingCode(true);
        setError('');
        const resolvedEmail = await validatePasswordResetCode(oobCode);
        if (!isMounted) return;
        setEmail(resolvedEmail);
      } catch (error: any) {
        if (!isMounted) return;
        setError(error.message || 'This password reset link is invalid.');
      } finally {
        if (isMounted) {
          setIsCheckingCode(false);
        }
      }
    };

    validateCode();

    return () => {
      isMounted = false;
    };
  }, [oobCode, validatePasswordResetCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Enter and confirm your new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(oobCode, password);
      setIsComplete(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
    } catch (error: any) {
      setError(error.message || 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingCode) {
    return <HeartBeatLoader />;
  }

  return (
    <div className="max-w-md w-full">
      <div className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-6 backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-2xl font-bold text-white">FaithBliss</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
            Reset your password
          </h1>
          <p className="text-sm text-gray-300 sm:text-base">
            {email ? `Create a new password for ${email}.` : 'Open the reset link we emailed to continue.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/20 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {isComplete ? (
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-white">Password updated</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-100">
              Your password has been reset successfully. Redirecting you back to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-600/50 bg-gray-700/50 py-3 pl-10 pr-12 text-white placeholder-gray-400 transition-all focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-300">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-600/50 bg-gray-700/50 py-3 pl-10 pr-12 text-white placeholder-gray-400 transition-all focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500"
                  placeholder="Re-enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-pink-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Updating password...' : 'Save new password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-semibold text-pink-400 transition-colors hover:text-pink-300">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<HeartBeatLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
