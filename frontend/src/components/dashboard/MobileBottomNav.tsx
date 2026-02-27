import { Compass, Heart, Home, MessageCircle, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface MobileBottomNavProps {
  userImage?: string;
  userName?: string;
}

const navItems = [
  { to: '/dashboard', label: 'Home', Icon: Home },
  { to: '/explore', label: 'Explore', Icon: Compass },
  { to: '/matches', label: 'Matches', Icon: Heart },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
];

export const MobileBottomNav = ({ userImage, userName }: MobileBottomNavProps) => {
  const initials = (userName || 'U').trim().charAt(0).toUpperCase();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/92 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-1 rounded-2xl border border-white/10 bg-slate-900/80 px-2 py-1.5 shadow-[0_12px_36px_rgba(2,6,23,0.6)]">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/25 to-blue-500/20 text-pink-200'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`
            }
            aria-label={label}
            title={label}
          >
            <Icon className="h-6 w-6" />
          </NavLink>
        ))}

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `group inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl transition-all ${
              isActive
                ? 'bg-gradient-to-r from-pink-500/25 to-blue-500/20 text-pink-200'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`
          }
          aria-label="My Profile"
          title="My Profile"
        >
          {userImage ? (
            <img
              src={userImage}
              alt={userName || 'Profile'}
              className="h-7 w-7 rounded-full border border-white/40 object-cover"
            />
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-slate-700 text-xs font-semibold text-white">
              {initials || <User className="h-4 w-4" />}
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

