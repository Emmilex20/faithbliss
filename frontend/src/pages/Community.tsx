import { useState } from 'react';
import { CalendarDays, HeartHandshake, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';

const communityCards = [
  {
    title: 'Prayer Wall',
    description: 'Share prayer requests and stand in faith with other believers.',
    icon: HeartHandshake,
    accent: 'from-pink-500/20 to-rose-500/20 border-pink-400/30',
    status: 'Coming soon',
  },
  {
    title: 'Faith Events',
    description: 'Discover online and local Christian meetups from the community.',
    icon: CalendarDays,
    accent: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
    status: 'Coming soon',
  },
  {
    title: 'Testimonies',
    description: 'Celebrate wins, growth stories, and encouragement from members.',
    icon: Sparkles,
    accent: 'from-purple-500/20 to-indigo-500/20 border-purple-400/30',
    status: 'Coming soon',
  },
];

const CommunityContent = () => {
  const { user } = useAuthContext();
  const [showSidePanel, setShowSidePanel] = useState(false);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;

  const mainContent = (
    <div className="px-6 py-10 lg:px-12">
      <div className="max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-blue-500/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">FaithBliss Community</h2>
              <p className="mt-2 text-sm text-gray-200 max-w-2xl">
                A dedicated space for fellowship, encouragement, and shared growth in faith.
                We are opening features in phases.
              </p>
            </div>
            <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {communityCards.map(({ title, description, icon: Icon, accent, status }) => (
            <div
              key={title}
              className={`rounded-2xl border bg-gradient-to-br ${accent} p-5`}
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white/10 p-2">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-gray-100">
                  {status}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-gray-200">{description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">Want a feature first?</h3>
          <p className="mt-2 text-sm text-gray-300">
            Tell us which community feature you want prioritized and we will ship based on demand.
          </p>
          <Link
            to="/help"
            className="mt-4 inline-flex rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-pink-400 hover:to-purple-500"
          >
            Send feedback
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white overflow-x-hidden pb-20 no-horizontal-scroll dashboard-main">
      <div className="hidden lg:flex min-h-screen">
        <div className="w-80 flex-shrink-0">
          <SidePanel userName={layoutName} userImage={layoutImage} user={layoutUser} onClose={() => setShowSidePanel(false)} />
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
          <TopBar
            userName={layoutName}
            userImage={layoutImage}
            user={layoutUser}
            showFilters={false}
            showSidePanel={showSidePanel}
            onToggleFilters={() => {}}
            onToggleSidePanel={() => setShowSidePanel(false)}
            title="Community"
          />
          <div className="flex-1 overflow-y-auto">{mainContent}</div>
        </div>
      </div>

      <div className="lg:hidden min-h-screen">
        <TopBar
          userName={layoutName}
          userImage={layoutImage}
          user={layoutUser}
          showFilters={false}
          showSidePanel={showSidePanel}
          onToggleFilters={() => {}}
          onToggleSidePanel={() => setShowSidePanel(true)}
          title="Community"
        />
        <div className="flex-1">{mainContent}</div>
      </div>

      {showSidePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSidePanel(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw]">
            <SidePanel userName={layoutName} userImage={layoutImage} user={layoutUser} onClose={() => setShowSidePanel(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProtectedCommunity() {
  return (
    <ProtectedRoute>
      <CommunityContent />
    </ProtectedRoute>
  );
}
