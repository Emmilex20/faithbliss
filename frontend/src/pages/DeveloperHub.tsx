import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowLeft, Bug, Crown, ShieldCheck, Sparkles, Users, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API, type DeveloperOverviewResponse } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';

const FEATURE_SETTINGS_SYNC_KEY = 'faithbliss:feature-settings-updated-at';
const FEATURE_SETTINGS_SYNC_EVENT = 'faithbliss:feature-settings-updated';
const FEATURE_SETTINGS_CACHE_KEY = 'faithbliss:feature-settings-cache';

const DeveloperHub = () => {
  const { showError, showSuccess } = useToast();
  const [overview, setOverview] = useState<DeveloperOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [passportModeEnabled, setPassportModeEnabled] = useState(false);
  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false);
  const [shutdownModeEnabled, setShutdownModeEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        setLoading(true);
        const data = await API.User.getDeveloperOverview();
        if (isMounted) {
          setOverview(data);
          setPassportModeEnabled(Boolean(data.featureSettings.passportModeEnabled));
          setMaintenanceModeEnabled(Boolean(data.featureSettings.maintenanceModeEnabled));
          setShutdownModeEnabled(Boolean(data.featureSettings.shutdownModeEnabled));
        }
      } catch (error) {
        const message = error instanceof Error && error.message ? error.message : 'Failed to load developer overview.';
        showError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOverview();
    return () => {
      isMounted = false;
    };
  }, [showError]);

  const broadcastFeatureSettingsUpdate = (settings: {
    passportModeEnabled: boolean;
    maintenanceModeEnabled: boolean;
    shutdownModeEnabled: boolean;
  }) => {
    const marker = String(Date.now());
    window.localStorage.setItem(FEATURE_SETTINGS_CACHE_KEY, JSON.stringify(settings));
    window.localStorage.setItem(FEATURE_SETTINGS_SYNC_KEY, marker);
    window.dispatchEvent(new Event(FEATURE_SETTINGS_SYNC_EVENT));
  };

  const applyFeatureSettings = async (payload: {
    passportModeEnabled?: boolean;
    maintenanceModeEnabled?: boolean;
    shutdownModeEnabled?: boolean;
  }) => {
    try {
      setFeatureSaving(true);
      const response = await API.User.updateDeveloperFeatureSettings(payload);
      const nextSettings = {
        passportModeEnabled: Boolean(response.passportModeEnabled),
        maintenanceModeEnabled: Boolean(response.maintenanceModeEnabled),
        shutdownModeEnabled: Boolean(response.shutdownModeEnabled),
      };

      setPassportModeEnabled(nextSettings.passportModeEnabled);
      setMaintenanceModeEnabled(nextSettings.maintenanceModeEnabled);
      setShutdownModeEnabled(nextSettings.shutdownModeEnabled);
      setOverview((current) =>
        current
          ? {
              ...current,
              featureSettings: {
                ...current.featureSettings,
                ...nextSettings,
              },
            }
          : current
      );
      broadcastFeatureSettingsUpdate(nextSettings);
      showSuccess(response.message || 'Developer controls updated.');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Failed to update developer controls.';
      showError(message);
    } finally {
      setFeatureSaving(false);
    }
  };

  const summary = overview?.summary;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_45%),linear-gradient(180deg,#0b1020,#131b2f)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">
              <Wrench className="h-4 w-4" />
              Developer Hub
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">FaithBliss engineering overview</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">
              A read-only workspace for developers to track platform health, feature state, support load, and current product activity.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-gray-300">
            Loading developer overview...
          </div>
        ) : overview && summary ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-cyan-200">
                  <Users className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em]">User base</span>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{summary.totalUsers}</p>
                <p className="mt-2 text-sm text-gray-400">{summary.completedOnboarding} completed onboarding</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-emerald-200">
                  <Activity className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em]">Live activity</span>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{summary.activeToday}</p>
                <p className="mt-2 text-sm text-gray-400">{summary.activeBoosts} boosts currently live</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-yellow-200">
                  <Crown className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em]">Premium reach</span>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{summary.activePremium}</p>
                <p className="mt-2 text-sm text-gray-400">{summary.totalMatches} mutual matches recorded</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-amber-200">
                  <Bug className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em]">Support load</span>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{summary.openTickets}</p>
                <p className="mt-2 text-sm text-gray-400">{summary.totalTickets} total tickets tracked</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-violet-200">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-xl font-semibold text-white">System snapshot</h2>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Admins</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{summary.admins}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Developers</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{summary.developers}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Responded tickets</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{summary.respondedTickets}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Feature flags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overview.featureSettings.passportModeEnabled ? 'bg-cyan-500/15 text-cyan-200' : 'bg-white/10 text-gray-300'}`}>
                        Passport {overview.featureSettings.passportModeEnabled ? 'On' : 'Off'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overview.featureSettings.maintenanceModeEnabled ? 'bg-rose-500/15 text-rose-200' : 'bg-white/10 text-gray-300'}`}>
                        Maintenance {overview.featureSettings.maintenanceModeEnabled ? 'On' : 'Off'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overview.featureSettings.shutdownModeEnabled ? 'bg-amber-500/15 text-amber-200' : 'bg-white/10 text-gray-300'}`}>
                        Shutdown {overview.featureSettings.shutdownModeEnabled ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-pink-200">
                  <AlertTriangle className="h-5 w-5" />
                  <h2 className="text-xl font-semibold text-white">Recent support</h2>
                </div>
                <div className="mt-5 space-y-3">
                  {overview.recentTickets.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-400">
                      No recent support tickets found.
                    </div>
                  ) : (
                    overview.recentTickets.map((ticket) => (
                      <div key={ticket.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">{ticket.type}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            ticket.status.toLowerCase() === 'responded'
                              ? 'bg-emerald-500/15 text-emerald-200'
                              : 'bg-amber-500/15 text-amber-200'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-300">{ticket.reporterEmail || 'Unknown reporter'}</p>
                        <p className="mt-1 text-xs text-gray-500">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'Unknown time'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-amber-200">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-xl font-semibold text-white">Developer controls</h2>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
                This is the high-trust control layer for the platform. Developers can manage global access states, including a full shutdown that takes the entire app offline for everyone except the developer hub.
              </p>
              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                <div className="rounded-3xl border border-cyan-400/15 bg-cyan-500/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Passport mode</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{passportModeEnabled ? 'Enabled' : 'Disabled'}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    Controls whether premium users can target a country and be discoverable only within that selected country.
                  </p>
                  <button
                    type="button"
                    onClick={() => void applyFeatureSettings({ passportModeEnabled: !passportModeEnabled })}
                    disabled={featureSaving}
                    className={`mt-5 rounded-full px-5 py-3 text-sm font-semibold transition ${
                      passportModeEnabled
                        ? 'border border-cyan-300/20 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/20'
                        : 'bg-cyan-500 text-white hover:bg-cyan-400'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {passportModeEnabled ? 'Disable Passport Mode' : 'Enable Passport Mode'}
                  </button>
                </div>

                <div className="rounded-3xl border border-rose-400/15 bg-rose-500/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">Maintenance mode</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{maintenanceModeEnabled ? 'Enabled' : 'Disabled'}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    Shows the broken-page notice across the product while still allowing access to the admin and developer control surfaces.
                  </p>
                  <button
                    type="button"
                    onClick={() => void applyFeatureSettings({ maintenanceModeEnabled: !maintenanceModeEnabled })}
                    disabled={featureSaving}
                    className={`mt-5 rounded-full px-5 py-3 text-sm font-semibold transition ${
                      maintenanceModeEnabled
                        ? 'border border-rose-300/20 bg-rose-500/15 text-rose-100 hover:bg-rose-500/20'
                        : 'bg-rose-500 text-white hover:bg-rose-400'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {maintenanceModeEnabled ? 'Disable Maintenance' : 'Enable Maintenance'}
                  </button>
                </div>

                <div className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-5 shadow-[0_18px_50px_rgba(245,158,11,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Full shutdown</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{shutdownModeEnabled ? 'Enabled' : 'Disabled'}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    Takes the app offline for everyone except the developer hub. Use this only when the product needs to be fully stopped.
                  </p>
                  <button
                    type="button"
                    onClick={() => void applyFeatureSettings({ shutdownModeEnabled: !shutdownModeEnabled })}
                    disabled={featureSaving}
                    className={`mt-5 rounded-full px-5 py-3 text-sm font-semibold transition ${
                      shutdownModeEnabled
                        ? 'border border-amber-300/20 bg-amber-500/15 text-amber-100 hover:bg-amber-500/20'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {shutdownModeEnabled ? 'Disable Shutdown' : 'Shut Down App'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.12))] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3 text-cyan-200">
                    <ShieldCheck className="h-5 w-5" />
                    <h2 className="text-xl font-semibold text-white">Quick access</h2>
                  </div>
                  <p className="mt-2 text-sm text-gray-200">
                    Use the developer hub for platform visibility, then jump to the operational console when you need admin controls.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/dashboard" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                    Back to dashboard
                  </Link>
                  <Link to="/admin" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-white/90">
                    Open admin console
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-gray-300">
            Developer overview is unavailable right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperHub;
