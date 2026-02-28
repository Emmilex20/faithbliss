/* eslint-disable no-irregular-whitespace */
// src/components/TopBar.tsx (Vite/React Conversion)

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { Bell, Filter, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotificationUnreadCount } from '@/hooks/useAPI';
import { useRequireAuth } from '@/hooks/useAuth';

interface TopBarProps {
  userName: string;
  userImage?: string;
  user?: any;
  showFilterButton?: boolean;
  showFilters?: boolean;
  showSidePanel?: boolean;
  onToggleFilters?: () => void;
  onToggleSidePanel?: () => void;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const TopBar = ({
  userName,
  userImage,
  user,
  showFilterButton = false,
  showFilters = false,
  onToggleFilters,
  onToggleSidePanel,
  title,
  showBackButton = false,
  onBack,
}: TopBarProps) => {
  const displayImage = user?.profilePhotos?.photo1 || userImage || '/default-avatar.png';
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.count || 0;
  const { logout } = useRequireAuth();

  const [notificationsAvailable, setNotificationsAvailable] = useState(false);
  const [notificationsPermission, setNotificationsPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [showMobileProfileMenu, setShowMobileProfileMenu] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallPrompting, setIsInstallPrompting] = useState(false);
  const mobileProfileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    setNotificationsAvailable(true);
    setNotificationsPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (mobileProfileMenuRef.current && !mobileProfileMenuRef.current.contains(target)) {
        setShowMobileProfileMenu(false);
      }
    };

    if (showMobileProfileMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showMobileProfileMenu]);

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

  const handleInstallApp = async () => {
    if (!installPromptEvent || isInstallPrompting) return;
    try {
      setIsInstallPrompting(true);
      await installPromptEvent.prompt();
      await installPromptEvent.userChoice;
    } catch {
      // noop
    } finally {
      setIsInstallPrompting(false);
      setInstallPromptEvent(null);
    }
  };

  const subtitleText = title
    ? title === 'My Profile'
      ? `Edit your profile, ${userName}`
      : `${title} page`
    : userName;
  const showTitleBlock = Boolean(title);

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-3 py-2.5 sm:px-4 sm:py-4 sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-0">
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
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-2xl transition-all hover:scale-105 lg:hidden"
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
              className="flex items-center -ml-5 sm:-ml-6 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src="/FaithBliss-Logo%20Source.svg"
                alt="FaithBliss"
                className="-mt-1 h-12 w-36 shrink-0 object-cover object-left sm:-mt-1.5 sm:h-14 sm:w-44"
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          {showTitleBlock ? (
            <div className="min-w-0">
              <h1 className="truncate text-center text-[15px] font-bold text-white sm:text-left sm:text-xl">
                {title}
              </h1>
              <p className="text-xs text-gray-400 hidden md:block truncate">
                {subtitleText}
              </p>
            </div>
          ) : <div />}

          <div className="relative flex items-center gap-2 justify-end">
            {installPromptEvent && (
              <button
                onClick={handleInstallApp}
                disabled={isInstallPrompting}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold tracking-wide bg-pink-500/20 text-pink-100 hover:bg-pink-500/30 border border-pink-300/30 transition-all disabled:opacity-70"
              >
                <Download className="w-3.5 h-3.5" />
                {isInstallPrompting ? 'Installing...' : 'Install app'}
              </button>
            )}

            {notificationsAvailable && notificationsPermission !== 'granted' && (
              <button
                onClick={handleEnableNotifications}
                className="hidden md:inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold tracking-wide bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
              >
                Enable alerts
              </button>
            )}

            <Link to="/notifications">
              <button className="relative p-2 sm:p-3 hover:bg-white/10 rounded-2xl transition-all hover:scale-105 group">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadCount}</span>
                  </span>
                )}
              </button>
            </Link>

            {showFilterButton && onToggleFilters && (
              <button
                onClick={onToggleFilters}
                className={`hidden sm:inline-flex p-2 sm:p-3 rounded-2xl transition-all hover:scale-105 ${
                  showFilters
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Filter className="w-5 h-5 sm:w-6 sm:h-6 transition-colors" />
              </button>
            )}

            <button
              onClick={() => setShowMobileProfileMenu((prev) => !prev)}
              className="p-2 sm:p-3 hover:bg-white/10 rounded-2xl transition-all hover:scale-105 group lg:hidden"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
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

            {showMobileProfileMenu && (
              <div
                ref={mobileProfileMenuRef}
                className="absolute top-full right-0 mt-2 w-44 rounded-xl border border-white/15 bg-gray-900/95 backdrop-blur-xl shadow-xl p-1 lg:hidden"
              >
                <Link
                  to="/profile"
                  onClick={() => setShowMobileProfileMenu(false)}
                  className="block w-full px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg"
                >
                  Profile
                </Link>
                <button
                  onClick={async () => {
                    setShowMobileProfileMenu(false);
                    await logout();
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
