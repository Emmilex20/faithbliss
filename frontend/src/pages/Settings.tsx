// src/pages/Settings.tsx

import { useState } from 'react';
import { Bell, Mail, Shield, Sliders, Smartphone, Save } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { API } from '@/services/api';

const SettingsContent = () => {
  const { user } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    pushNotifications: user?.settings?.pushNotifications ?? true,
    matchAlerts: user?.settings?.matchAlerts ?? true,
    messageAlerts: user?.settings?.messageAlerts ?? true,
  });
  const [reactivating, setReactivating] = useState(false);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;
  const isPremium = user?.subscriptionStatus === 'active' && ['premium', 'elite'].includes(user?.subscriptionTier || '');
  const activeTier = user?.subscriptionTier || 'free';

  const handleToggle = (key: keyof typeof form) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.User.updateSettings(form);
      showSuccess('Settings saved successfully.');
    } catch (error: any) {
      showError(error?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setReactivating(true);
      await API.User.reactivateAccount();
      showSuccess('Account reactivated successfully.');
    } catch (error: any) {
      showError(error?.message || 'Failed to reactivate account.');
    } finally {
      setReactivating(false);
    }
  };

  const mainContent = (
    <div className="px-6 py-10 lg:px-12">
      <div className="max-w-4xl space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-pink-500/20 p-3 text-pink-200">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Preferences</h2>
              <p className="text-sm text-gray-300">Choose how you want to hear from FaithBliss.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { key: 'emailNotifications', label: 'Email notifications', icon: Mail },
              { key: 'pushNotifications', label: 'Browser notifications', icon: Smartphone },
              { key: 'matchAlerts', label: 'New match alerts', icon: Bell },
              { key: 'messageAlerts', label: 'New message alerts', icon: Shield },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleToggle(key as keyof typeof form)}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-pink-500/40 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
                <span
                  className={`h-5 w-10 rounded-full p-1 transition ${
                    form[key as keyof typeof form] ? 'bg-pink-500/80' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`block h-3 w-3 rounded-full bg-white transition ${
                      form[key as keyof typeof form] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-pink-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Subscription</h3>
              <p className="text-sm text-gray-300">
                {isPremium ? `Active ${activeTier} plan` : 'Free plan'}
              </p>
            </div>
            <span className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              isPremium
                ? 'border-pink-500/40 bg-pink-500/10 text-pink-200'
                : 'border-white/10 bg-white/5 text-gray-300'
            }`}>
              {isPremium ? 'Premium' : 'Free'}
            </span>
          </div>

          {user?.isActive === false && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
              <div>
                <p className="text-sm font-semibold text-white">Account is deactivated</p>
                <p className="text-xs text-gray-300">Reactivate to return to matching.</p>
              </div>
              <button
                onClick={handleReactivate}
                disabled={reactivating}
                className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white transition hover:from-orange-400 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reactivating ? 'Reactivating...' : 'Reactivate'}
              </button>
            </div>
          )}
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
            title="Settings"
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
          title="Settings"
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

export default function ProtectedSettings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
