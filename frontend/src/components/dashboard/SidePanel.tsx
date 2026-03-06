/* eslint-disable no-irregular-whitespace */
// src/components/dashboard/SidePanel.tsx (Vite/React Conversion)

// ðŸŒŸ VITE FIX 1: Remove Next.js 'use client' directive
// Remove: /* eslint-disable @typescript-eslint/no-unused-vars */
// Remove: /* eslint-disable @typescript-eslint/no-explicit-any */

import { Link } from 'react-router-dom'; // ðŸŒŸ VITE FIX 2: Use Link from react-router-dom
// Remove: import Image from 'next/image'; // ðŸŒŸ VITE FIX 3: Replaced with standard <img>
import { 
  X, User, Heart, MessageCircle, Star, Settings, 
  HelpCircle, LogOut, Home, UserX, AlertTriangle, Bell, Users, Compass, Crown, Clock3
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotificationUnreadCount } from '@/hooks/useAPI';
import { useSubscriptionDisplay } from '@/hooks/useSubscriptionDisplay';

interface SidePanelProps {
  userName: string;
  userImage?: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any; // Assuming 'any' for now, should be replaced with a proper IUser type
  onClose: () => void;
}

export const SidePanel = ({ userName, userImage, user, onClose }: SidePanelProps) => {
  // Assuming useAuth returns { logout: function, isLoggingOut: boolean }
  const { logout, isLoggingOut } = useAuthContext();
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.count || 0;

  const handleLogout = async () => {
    // Ensure onClose is called after logging out starts or finishes
    await logout();
    onClose(); 
  };
  
  const displayImage = user?.profilePhotos?.photo1 || userImage || '/default-avatar.png';
  const faithJourney = user?.faithJourney || 'Passionate Believer';
  const subscriptionDisplay = useSubscriptionDisplay(user);

  return (
    <div className="h-screen flex flex-col bg-gray-900 lg:bg-gray-800/50 lg:backdrop-blur-sm lg:border-r lg:border-gray-700/30">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              {displayImage ? (
                // ðŸŒŸ VITE FIX 4: Replace Next.js <Image> with standard <img>
                <img
                  src={displayImage}
                  alt={userName}
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{userName}</h3>
              <p className="text-gray-400 text-sm capitalize">{faithJourney.toLowerCase()}</p>
            </div>
          </div>
          {/* Close button only on mobile */}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className={`mt-5 rounded-3xl border p-4 shadow-[0_16px_30px_rgba(2,6,23,0.2)] ${
          subscriptionDisplay.isActivePaid
            ? 'border-yellow-400/30 bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-transparent'
            : 'border-white/10 bg-white/5'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">Current plan</p>
              <h4 className="mt-2 flex items-center gap-2 text-white font-semibold">
                {subscriptionDisplay.isActivePaid ? (
                  <Crown className="h-4 w-4 text-yellow-300" />
                ) : (
                  <Star className="h-4 w-4 text-slate-300" />
                )}
                {subscriptionDisplay.tierLabel}
              </h4>
            </div>
            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
              subscriptionDisplay.isActivePaid
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-white/10 text-gray-300'
            }`}>
              {subscriptionDisplay.statusLabel}
            </span>
          </div>

          {subscriptionDisplay.isActivePaid ? (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400">Renewal countdown</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {subscriptionDisplay.countdownLabel || 'Monthly renewal active'}
                </p>
              </div>
              {subscriptionDisplay.renewalLabel ? (
                <div className="flex items-center gap-1.5 text-xs text-yellow-100">
                  <Clock3 className="h-3.5 w-3.5 text-yellow-300" />
                  <span>{subscriptionDisplay.renewalLabel}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-gray-400">
              Upgrade to unlock premium visibility, deeper filters, and faster matching.
            </p>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 min-h-0 p-6 space-y-2 overflow-y-auto side-panel-scroll">
        {/* Primary Navigation */}
        <div className="mb-6">
          <h5 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3 px-4">Navigation</h5>
          
          <Link to="/dashboard" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-pink-500/20 rounded-xl group-hover:bg-pink-500/30 transition-colors">
                <Home className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Home</h4>
                <p className="text-gray-400 text-sm">Discover new connections</p>
              </div>
            </div>
          </Link>

          <Link to="/explore" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition-colors">
                <Compass className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Explore</h4>
                <p className="text-gray-400 text-sm">Find by shared interests</p>
              </div>
            </div>
          </Link>

          <Link to="/matches" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-pink-500/20 rounded-xl group-hover:bg-pink-500/30 transition-colors">
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">My Matches</h4>
                <p className="text-gray-400 text-sm">See who liked you</p>
              </div>
            </div>
          </Link>

          <Link to="/messages" onClick={onClose}>
          <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
            <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Messages</h4>
              <p className="text-gray-400 text-sm">Chat with connections</p>
            </div>
            </div>
          </Link>

          <Link to="/community" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-violet-500/20 rounded-xl group-hover:bg-violet-500/30 transition-colors">
                <Users className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Community</h4>
                <p className="text-gray-400 text-sm">Fellowship and events</p>
              </div>
            </div>
          </Link>

          <div className="mt-4 border-t border-gray-700/50 pt-4 lg:mt-0 lg:border-t-0 lg:pt-0">
            <h5 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 lg:hidden">Account</h5>

            <Link to="/profile" onClick={onClose}>
              <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
                <div className="p-2 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                  <User className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">My Profile</h4>
                  <p className="text-gray-400 text-sm">Edit profile & photos</p>
                </div>
              </div>
            </Link>

            <Link to="/notifications" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-amber-500/20 rounded-xl group-hover:bg-amber-500/30 transition-colors relative">
                <Bell className="w-5 h-5 text-amber-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-white font-semibold">Notifications</h4>
                <p className="text-gray-400 text-sm">Likes, matches & messages</p>
              </div>
            </div>
            </Link>

            <Link to="/premium" onClick={onClose}>
              <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
                <div className="p-2 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Premium Features</h4>
                  <p className="text-gray-400 text-sm">
                    {subscriptionDisplay.isActivePaid
                      ? `${subscriptionDisplay.tierLabel}${subscriptionDisplay.countdownLabel ? ` • ${subscriptionDisplay.countdownLabel}` : ''}`
                      : 'Explore exclusive benefits'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="border-t border-gray-700/50 pt-4">
          <h5 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3 px-4">More</h5>

        <div className="border-t border-gray-700/50 pt-4 mt-4">
          <Link to="/settings" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-gray-500/20 rounded-xl group-hover:bg-gray-500/30 transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Settings</h4>
                <p className="text-gray-400 text-sm">Privacy & preferences</p>
              </div>
            </div>
          </Link>

          <Link to="/help" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-gray-500/20 rounded-xl group-hover:bg-gray-500/30 transition-colors">
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Help & Support</h4>
                <p className="text-gray-400 text-sm">Find answers and contact us</p>
              </div>
            </div>
          </Link>

          <Link to="/report" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Report an Issue</h4>
                <p className="text-gray-400 text-sm">Report users or content</p>
              </div>
            </div>
          </Link>

          <Link to="/deactivate" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Deactivate Account</h4>
                <p className="text-gray-400 text-sm">Temporarily disable account</p>
              </div>
            </div>
          </Link>
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 border-t border-gray-700/50">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-colors group ${
            isLoggingOut 
              ? 'bg-red-500/5 cursor-not-allowed opacity-50' 
              : 'hover:bg-red-500/10 cursor-pointer'
          }`}
        >
          <div className="p-2 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
            <LogOut className={`w-5 h-5 text-red-400 ${isLoggingOut ? 'animate-spin' : ''}`} />
          </div>
          <div className="text-left">
            <h4 className="text-red-400 font-semibold">
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </h4>
            <p className="text-gray-500 text-sm">
              {isLoggingOut ? 'Please wait...' : 'See you later!'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};




