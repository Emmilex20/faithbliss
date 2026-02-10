/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react';
import { SidePanel } from './SidePanel';
import { TopBar } from './TopBar';

interface DesktopLayoutProps {
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

export const DesktopLayout = ({
  userName,
  userImage,
  user,
  showFilters,
  showSidePanel,
  onToggleFilters,
  onToggleSidePanel,
  topContent,
  children
}: DesktopLayoutProps) => {
  return (
    <div className="hidden min-h-screen lg:flex">
      <div className="w-80 flex-shrink-0">
        <SidePanel userName={userName} userImage={userImage} user={user} onClose={() => {}} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col bg-[radial-gradient(circle_at_15%_20%,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_90%_5%,rgba(59,130,246,0.14),transparent_30%)]">
        {/* Top Bar */}
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

        {topContent && <div className="mx-auto w-full max-w-[1080px] px-4 pt-2">{topContent}</div>}
        
        {/* Main Profile Display */}
        <div className="flex flex-1 items-center justify-center overflow-hidden px-4 pb-5 pt-4">
          <div className="relative h-full max-h-[calc(100vh-220px)] w-full max-w-[620px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
