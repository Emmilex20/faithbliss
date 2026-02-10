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
  topContent?: ReactNode;
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
  topContent,
  children
}: MobileLayoutProps) => {
  return (
    <div className="dashboard-main min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(236,72,153,0.15),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.14),transparent_35%)] no-horizontal-scroll lg:hidden">
      {/* Mobile Top Bar */}
      <TopBar
        userName={userName}
        userImage={userImage}
        user={user}
        showFilterButton={true}
        showFilters={showFilters}
        showSidePanel={showSidePanel}
        onToggleFilters={onToggleFilters}
        onToggleSidePanel={onToggleSidePanel}
      />

      {topContent && <div className="px-2 pt-1">{topContent}</div>}
      
      {/* Mobile Profile Display */}
      <div className="flex h-[calc(100vh-210px)] flex-col px-2 pb-3 pt-2">
        <div className="relative mx-auto h-full w-full max-w-[560px] flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
