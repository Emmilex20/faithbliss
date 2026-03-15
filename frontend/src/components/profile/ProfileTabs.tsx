import {
  Camera,
  Church,
  CreditCard,
  Heart,
  User,
} from 'lucide-react';
import React from 'react';

export type TabSection = 'photos' | 'basics' | 'passions' | 'faith' | 'subscription';

interface ProfileTabsProps {
  activeSection: TabSection;
  setActiveSection: React.Dispatch<React.SetStateAction<TabSection>>;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeSection, setActiveSection }) => {
  const tabs = [
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'basics', label: 'Basic Info', icon: User },
    { id: 'passions', label: 'Passions', icon: Heart },
    { id: 'faith', label: 'Faith Journey', icon: Church },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ] as const;

  return (
    <div className="sticky top-20 z-50 border-b border-gray-700/30 bg-gray-900/60 shadow-2xl backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <div className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 sm:gap-2 lg:grid-cols-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`group flex flex-col items-center justify-center space-y-1 rounded-2xl px-2 py-3 font-medium transition-all duration-300 sm:flex-row sm:justify-start sm:space-x-2 sm:space-y-0 sm:px-4 sm:py-4 ${
                activeSection === tab.id
                  ? 'scale-105 border border-pink-500/30 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 shadow-lg backdrop-blur-md'
                  : 'border border-transparent text-gray-400 backdrop-blur-sm hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="text-center text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileTabs;
