import {
  Camera,
  User,
  Heart,
  Church,
} from 'lucide-react';
import React from 'react';

// 🔧 Strongly type the allowed tab ids
type TabSection = 'photos' | 'basics' | 'passions' | 'faith';

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
  ] as const; // 👈 ensures TypeScript keeps literal types

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl border-b border-gray-700/30 sticky top-20 z-50 shadow-2xl">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-4 py-3 sm:py-4 rounded-2xl font-medium transition-all duration-300 group ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md text-pink-400 border border-pink-500/30 shadow-lg scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 hover:scale-105'
              }`}
            >
              <tab.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm text-center">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileTabs;
