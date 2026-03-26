import { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const SUPPORT_EMAIL = 'faithbliss@futuregrin.com';

const DeactivateContent = () => {
  const { user } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const [showSidePanel, setShowSidePanel] = useState(false);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('FaithBliss Account Deactivation Request');
    const body = encodeURIComponent(
      [
        'Hello FaithBliss Support,',
        '',
        'I would like to request the deactivation of my account.',
        '',
        `Name: ${user?.name || ''}`,
        `Email: ${user?.email || ''}`,
        '',
        'Please let me know if you need any further information to process this request.',
        '',
        'Thank you.',
      ].join('\n')
    );

    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }, [user?.email, user?.name]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      showSuccess('Support email copied.');
    } catch {
      showError('Unable to copy the email address.');
    }
  };

  const mainContent = (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-start">
          <Link
            to="/dashboard"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.14),transparent_36%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(17,24,39,0.94),rgba(30,41,59,0.96))] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-100">
                <ShieldAlert className="h-3.5 w-3.5" />
                Account Help
              </div>

              <div className="space-y-3">
                <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Need to deactivate your account?
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Please send a deactivation request to our support team, and we will assist you from there.
                  This helps us handle account requests carefully and provide support if anything needs to be confirmed.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  'Send your request by email',
                  'Include your account name and email',
                  'Our team will guide the next step',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100 backdrop-blur-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl sm:p-5">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-pink-500/15 p-3 text-pink-200">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200/90">
                      Support Email
                    </p>
                    <p className="mt-2 break-all text-base font-semibold text-white sm:text-lg">
                      {SUPPORT_EMAIL}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Use the button below to open your email app with a ready-made request.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={mailtoHref}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 px-5 py-3 text-sm font-semibold text-white transition hover:from-pink-400 hover:via-rose-400 hover:to-orange-300"
                  >
                    <Mail className="h-4 w-4" />
                    Send Deactivation Request
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Email
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-amber-300/15 bg-amber-500/10 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-amber-200" />
                  <div>
                    <p className="text-sm font-semibold text-white">Suggested wording</p>
                    <p className="mt-2 text-sm leading-7 text-amber-50/90">
                      “Hello FaithBliss Support, I would like to request the deactivation of my account.
                      Please let me know if you need any additional details.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
