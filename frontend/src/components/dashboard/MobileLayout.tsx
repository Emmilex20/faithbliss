/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react';
import { TopBar } from './TopBar';

interface MobileLayoutProps {
  userName: string;
  userImage?: string;
  user?: any;
  showFilters: boolean;
  showSidePanel: boolean;
  onToggleFilters: () => void;
  onToggleSidePanel: () => void;
  children: ReactNode;
}

export const MobileLayout = ({
  userName,
  userImage,
  user,
  showFilters,
  showSidePanel,
  onToggleFilters,
  onToggleSidePanel,
  children
}: MobileLayoutProps) => {
  return (
    <div className="lg:hidden min-h-screen no-horizontal-scroll dashboard-main">
      {/* Mobile Top Bar */}
      <TopBar
        userName={userName}
        userImage={userImage}
        user={user}
        showFilters={showFilters}
        showSidePanel={showSidePanel}
        onToggleFilters={onToggleFilters}
        onToggleSidePanel={onToggleSidePanel}
      />
      
      {/* Mobile Profile Display */}
      <div className="px-2 py-3 h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 relative">
          {children}
        </div>
      </div>
    </div>
  );
};