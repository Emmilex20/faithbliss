/* eslint-disable no-irregular-whitespace */
// src/components/TopBar.tsx (Vite/React Conversion)

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Bell, Filter, Sparkles, ArrowLeft } from 'lucide-react';
// 🌟 VITE FIX 1: Use Link from react-router-dom
import { Link } from 'react-router-dom'; 
// import Image from 'next/image'; // 🌟 VITE FIX 2: Replaced with standard <img>
import { useNotificationUnreadCount } from '@/hooks/useAPI'; // Assuming this hook is non-Next.js compatible

interface TopBarProps {
  userName: string;
  userImage?: string;
  user?: any;
  showFilters?: boolean;
  showSidePanel?: boolean;
  onToggleFilters?: () => void;
  onToggleSidePanel?: () => void;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const TopBar = ({ 
  userName, 
  userImage,
  user,
  showFilters = false, 
  onToggleFilters, 
  onToggleSidePanel,
  title,
  showBackButton = false,
  onBack
}: TopBarProps) => {
  const displayImage = user?.profilePhotos?.photo1 || userImage || '/default-avatar.png';
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.count || 0;
  const [notificationsAvailable, setNotificationsAvailable] = useState(false);
  const [notificationsPermission, setNotificationsPermission] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    setNotificationsAvailable(true);
    setNotificationsPermission(Notification.permission);
  }, []);

  const handleEnableNotifications = async () => {
    if (!notificationsAvailable) return;
    if (Notification.permission === 'granted') {
      setNotificationsPermission('granted');
      return;
    }
    if (Notification.permission === 'denied') {
      setNotificationsPermission('denied');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationsPermission(permission);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-4 py-4 sticky top-0 z-50">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 3-column grid keeps icons from overlapping text on mobile */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          {/* Left */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-2xl transition-all hover:scale-105"
              >
                <ArrowLeft className="w-6 h-6 text-gray-300" />
              </button>
            ) : (
              <button
                onClick={onToggleSidePanel}
                className="p-2 hover:bg-white/10 rounded-2xl transition-all hover:scale-105 lg:hidden"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-gray-300 rounded"></div>
                  <div className="w-full h-0.5 bg-gray-300 rounded"></div>
                  <div className="w-full h-0.5 bg-gray-300 rounded"></div>
                </div>
              </button>
            )}

            <Link
              to="/dashboard"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-2xl shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </Link>
          </div>

          {/* Center */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate text-center sm:text-left">
              {title || 'FaithBliss'}
            </h1>
            <p className="text-xs text-gray-400 hidden md:block truncate">
              {title ? `Edit your profile, ${userName}` : `${userName} ?`}
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 justify-end">
            {notificationsAvailable && notificationsPermission !== 'granted' && (
              <button
                onClick={handleEnableNotifications}
                className="hidden md:inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold tracking-wide bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
              >
                Enable alerts
              </button>
            )}

            <Link to="/notifications">
              <button className="relative p-2.5 sm:p-3 hover:bg-white/10 rounded-2xl transition-all hover:scale-105 group">
                <Bell className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadCount}</span>
                  </span>
                )}
              </button>
            </Link>

            <button
              onClick={onToggleSidePanel}
              className="p-2.5 sm:p-3 hover:bg-white/10 rounded-2xl transition-all hover:scale-105 group lg:hidden"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={userName}
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>

            {onToggleFilters && (
              <button
                onClick={onToggleFilters}
                className={`p-2.5 sm:p-3 rounded-2xl transition-all hover:scale-105 ${
                  showFilters
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Filter className="w-6 h-6 transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
