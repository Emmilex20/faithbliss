// src/pages/Help.tsx

import { useEffect, useState } from 'react';
import { ArrowLeft, HelpCircle, Send, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { API } from '@/services/api';

const HelpContent = () => {
  const { user } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState<Awaited<ReturnType<typeof API.Support.getMyTickets>>['tickets']>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;

  useEffect(() => {
    let isMounted = true;

    const loadTickets = async () => {
      try {
        const response = await API.Support.getMyTickets('HELP');
        if (isMounted) {
          setTickets(Array.isArray(response.tickets) ? response.tickets : []);
        }
      } catch (error: any) {
        if (isMounted) {
          showError(error?.message || 'Unable to load your support messages.');
        }
      } finally {
        if (isMounted) {
          setLoadingTickets(false);
        }
      }
    };

    void loadTickets();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const formatReportedAt = (value: string | null) => {
    if (!value) return 'Unknown time';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Unknown time';
    return parsed.toLocaleString();
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      showError('Please enter your message.');
      return;
    }
    try {
      setSending(true);
      await API.Support.submitTicket({ type: 'HELP', subject, message });
      showSuccess('Your request has been sent.');
      const response = await API.Support.getMyTickets('HELP');
      setTickets(Array.isArray(response.tickets) ? response.tickets : []);
      setSubject('');
      setMessage('');
    } catch (error: any) {
      showError(error?.message || 'Unable to send your message.');
    } finally {
      setSending(false);
    }
  };

  const mainContent = (
    <div className="px-6 py-10 lg:px-12">
      <div className="max-w-3xl space-y-6">
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

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <Link
            to="/safety-note"
            className="group flex items-start justify-between gap-4 rounded-[1.7rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(14,165,233,0.05),rgba(15,23,42,0.28))] p-5 transition hover:border-cyan-200/30 hover:bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(14,165,233,0.08),rgba(15,23,42,0.34))]"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Safety note</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Safe dating guidance built for real conversations</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                  Read practical advice for spotting scams, protecting your privacy, planning first dates safely, and reporting concerning behavior quickly.
                </p>
              </div>
            </div>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 sm:inline-flex">
              Open
            </span>
          </Link>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-pink-500/20 p-3 text-pink-200">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Help & Support</h2>
              <p className="text-sm text-gray-300">Tell us how we can help you.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (optional)"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-pink-500/50 focus:outline-none"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              rows={6}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-pink-500/50 focus:outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-pink-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Your support messages</h3>
              <p className="mt-1 text-sm text-gray-300">Admin responses will appear here on the same thread.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loadingTickets ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-gray-300">
                Loading your support history...
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-gray-300">
                You have not sent any help requests yet.
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Help request</p>
                      <h4 className="mt-2 text-base font-semibold text-white">{ticket.subject || 'No subject provided'}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{ticket.status}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{formatReportedAt(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm leading-6 text-gray-200">
                    {ticket.message}
                  </div>
                  {Array.isArray(ticket.replies) && ticket.replies.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {ticket.replies.map((reply, index) => (
                        <div key={`${ticket.id}-reply-${index}`} className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                              Support reply{reply.adminName ? ` • ${reply.adminName}` : ''}
                            </p>
                            <span className="text-xs text-gray-400">{formatReportedAt(reply.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-gray-200">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-400">
                      No admin response yet.
                    </div>
                  )}
                </div>
              ))
            )}
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
            title="Help & Support"
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
          title="Help & Support"
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

export default function ProtectedHelp() {
  return (
    <ProtectedRoute>
      <HelpContent />
    </ProtectedRoute>
  );
}
