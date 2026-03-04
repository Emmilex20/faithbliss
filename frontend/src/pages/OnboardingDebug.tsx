import { useEffect, useState } from 'react';

import { SidePanel } from '@/components/dashboard/SidePanel';
import { TopBar } from '@/components/dashboard/TopBar';
import { useAuthContext } from '@/contexts/AuthContext';
import { API } from '@/services/api';

type DebugPayload = {
  id: string;
  fetchedAt: string;
  onboardingDocument: Record<string, unknown>;
  profilePhotoCount: number;
};

const prettyJson = (value: unknown) =>
  JSON.stringify(
    value,
    (_key, currentValue) => {
      if (currentValue && typeof currentValue === 'object' && 'seconds' in (currentValue as Record<string, unknown>)) {
        return currentValue;
      }
      return currentValue;
    },
    2
  );

export default function OnboardingDebug() {
  const { user } = useAuthContext();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<DebugPayload | null>(null);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;

  const loadDebugData = async (userId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.User.getOnboardingDebug(userId);
      setPayload(response);
      if (!userId) {
        setTargetUserId(response.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load onboarding debug data.';
      setError(message);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebugData().catch(() => null);
  }, []);

  return (
    <div className="dashboard-main min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="hidden min-h-screen lg:flex">
        <div className="w-80 flex-shrink-0">
          <SidePanel userName={layoutName} userImage={layoutImage} user={user} onClose={() => setShowSidePanel(false)} />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar
            userName={layoutName}
            userImage={layoutImage}
            user={user}
            showFilters={false}
            showSidePanel={showSidePanel}
            onToggleFilters={() => {}}
            onToggleSidePanel={() => setShowSidePanel(false)}
            title="Onboarding Debug"
          />
          <div className="flex-1 overflow-y-auto px-6 py-6">{renderDebugContent()}</div>
        </div>
      </div>

      <div className="min-h-screen lg:hidden">
        <TopBar
          userName={layoutName}
          userImage={layoutImage}
          user={user}
          showFilters={false}
          showSidePanel={showSidePanel}
          onToggleFilters={() => {}}
          onToggleSidePanel={() => setShowSidePanel(true)}
          title="Onboarding Debug"
        />
        <div className="px-4 py-4">{renderDebugContent()}</div>
      </div>

      {showSidePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSidePanel(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw]">
            <SidePanel userName={layoutName} userImage={layoutImage} user={user} onClose={() => setShowSidePanel(false)} />
          </div>
        </div>
      )}
    </div>
  );

  function renderDebugContent() {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Onboarding Document Debug</h1>
          <p className="mt-2 text-sm text-slate-300">
            This view returns the exact saved Firestore onboarding document for the selected user.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={targetUserId}
              onChange={(event) => setTargetUserId(event.target.value)}
              placeholder="Firebase UID (leave as current user or paste another)"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-400/70 focus:ring-2 focus:ring-pink-500/20"
            />
            <button
              type="button"
              onClick={() => loadDebugData(targetUserId.trim() || undefined)}
              disabled={loading}
              className="rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Loading...' : 'Load Document'}
            </button>
          </div>
        </section>

        {error ? (
          <section className="rounded-[1.5rem] border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-100">
            {error}
          </section>
        ) : null}

        {payload ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Document ID</p>
                <p className="mt-2 break-all text-sm text-white">{payload.id}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Photo Count</p>
                <p className="mt-2 text-sm text-white">{payload.profilePhotoCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Fetched At</p>
                <p className="mt-2 text-sm text-white">{payload.fetchedAt}</p>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 sm:p-5">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-100 sm:text-sm">
                {prettyJson(payload.onboardingDocument)}
              </pre>
            </section>
          </>
        ) : null}
      </div>
    );
  }
}
