/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';

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

      {/* Mobile Profile Display */}
      <div className="flex h-[calc(100dvh-62px)] sm:h-[calc(100dvh-74px)] flex-col px-0 pb-[88px] pt-0">
        <div className="relative mx-auto h-full w-full flex-1">
          {children}
        </div>
      </div>

      <MobileBottomNav userImage={userImage} userName={userName} />
    </div>
  );
};
