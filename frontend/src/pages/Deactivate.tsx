// src/pages/Deactivate.tsx

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { API } from '@/services/api';

const DeactivateContent = () => {
  const { user } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;

  const handleDeactivate = async () => {
    if (confirmText.trim().toLowerCase() !== 'deactivate') {
      showError('Type "deactivate" to confirm.');
      return;
    }
    try {
      setProcessing(true);
      await API.User.deactivateAccount();
      showSuccess('Account deactivated. You can reactivate anytime.');
    } catch (error: any) {
      showError(error?.message || 'Failed to deactivate account.');
    } finally {
      setProcessing(false);
    }
  };

  const mainContent = (
    <div className="px-6 py-10 lg:px-12">
      <div className="max-w-3xl space-y-6">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-500/20 p-3 text-red-200">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Deactivate Account</h2>
              <p className="text-sm text-gray-300">
                Your profile will be hidden until you reactivate.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-300">
              To confirm, type <span className="font-semibold text-white">deactivate</span> below.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type deactivate"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-red-400/60 focus:outline-none"
            />
            <button
              onClick={handleDeactivate}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-red-400 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? 'Deactivating...' : 'Deactivate account'}
            </button>
          </div>
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
            title="Deactivate Account"
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
          title="Deactivate Account"
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

export default function ProtectedDeactivate() {
  return (
    <ProtectedRoute>
      <DeactivateContent />
    </ProtectedRoute>
  );
}
