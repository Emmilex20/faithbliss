/* eslint-disable no-irregular-whitespace */
// src/components/dashboard/SidePanel.tsx (Vite/React Conversion)

// 🌟 VITE FIX 1: Remove Next.js 'use client' directive
// Remove: /* eslint-disable @typescript-eslint/no-unused-vars */
// Remove: /* eslint-disable @typescript-eslint/no-explicit-any */

import { Link } from 'react-router-dom'; // 🌟 VITE FIX 2: Use Link from react-router-dom
// Remove: import Image from 'next/image'; // 🌟 VITE FIX 3: Replaced with standard <img>
import { 
  X, User, Heart, MessageCircle, Star, Settings, 
  HelpCircle, LogOut, Home, UserX, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidePanelProps {
  userName: string;
  userImage?: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any; // Assuming 'any' for now, should be replaced with a proper IUser type
  onClose: () => void;
}

export const SidePanel = ({ userName, userImage, user, onClose }: SidePanelProps) => {
  console.log('SidePanel user:', user);
  console.log('SidePanel userImage:', userImage);
  
  // Assuming useAuth returns { logout: function, isLoggingOut: boolean }
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    // Ensure onClose is called after logging out starts or finishes
    await logout();
    onClose(); 
  };
  
  const displayImage = user?.profilePhotos?.photo1 || userImage || '/default-avatar.png';
  const faithJourney = user?.faithJourney || 'Passionate Believer';

  return (
    <div className="h-screen flex flex-col bg-gray-900 lg:bg-gray-800/50 lg:backdrop-blur-sm lg:border-r lg:border-gray-700/30">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              {displayImage ? (
                // 🌟 VITE FIX 4: Replace Next.js <Image> with standard <img>
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
        </div>

        {/* Secondary Navigation */}
        <div className="border-t border-gray-700/50 pt-4">
          <h5 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3 px-4">Profile</h5>
          
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
        </div>

          <Link to="/premium" onClick={onClose}>
            <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
              <div className="p-2 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Premium Features</h4>
                <p className="text-gray-400 text-sm">Explore exclusive benefits</p>
              </div>
            </div>
          </Link>

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