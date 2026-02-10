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
    <div className="hidden lg:flex min-h-screen">
      <div className="w-80 flex-shrink-0">
        <SidePanel userName={userName} userImage={userImage} user={user} onClose={() => {}} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
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

        {topContent && (
          <div className="px-2">
            {topContent}
          </div>
        )}
        
        {/* Main Profile Display */}
        <div className="flex-1 flex justify-center items-center px-2 py-3 overflow-hidden">
          <div className="w-full max-w-lg h-full max-h-[calc(100vh-220px)] relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
