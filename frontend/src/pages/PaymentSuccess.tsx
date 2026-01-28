// src/pages/PaymentSuccess.tsx

import { useEffect, useState } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { API } from '@/services/api';

const PaymentSuccessContent = () => {
  const [searchParams] = useSearchParams();
  const { user, refetchUser } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [loading, setLoading] = useState(true);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;

  useEffect(() => {
    const verify = async () => {
      const reference = searchParams.get('reference');
      if (!reference) {
        setLoading(false);
        showError('Missing payment reference.');
        return;
      }
      try {
        await API.Payment.verify(reference);
        await refetchUser();
        showSuccess('Subscription activated successfully.');
      } catch (error: any) {
        showError(error?.message || 'Payment verification failed.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [refetchUser, searchParams, showError, showSuccess]);

  const mainContent = (
    <div className="px-6 py-12 lg:px-12">
      <div className="max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-200">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Payment success</h2>
            <p className="text-sm text-gray-300">
              {loading ? 'Confirming your subscription...' : 'Your subscription is ready.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/premium')}
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-pink-400 hover:to-purple-500"
          >
            Back to Premium
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10"
          >
            Go to Dashboard
          </button>
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
            title="Payment Success"
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
          title="Payment Success"
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

export default function ProtectedPaymentSuccess() {
  return (
    <ProtectedRoute>
      <PaymentSuccessContent />
    </ProtectedRoute>
  );
}
