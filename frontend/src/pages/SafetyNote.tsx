import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeAlert,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  HeartHandshake,
  LifeBuoy,
  MapPin,
  MessageSquareWarning,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  UserRoundCheck,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';

const quickActions = [
  {
    title: 'Emergency first',
    description: 'If there is immediate danger, leave, get to a safer location, and contact local emergency services before doing anything in-app.',
    icon: Siren,
    badge: 'Urgent',
    accentClass: 'border-rose-400/20',
    iconClass: 'bg-rose-500/14 text-rose-300 ring-1 ring-rose-400/20',
    badgeClass: 'border-rose-300/20 bg-rose-400/10 text-rose-100',
  },
  {
    title: 'Report early',
    description: 'Threats, coercion, scams, impersonation, and manipulation are worth reporting before they escalate.',
    icon: MessageSquareWarning,
    badge: 'Protective',
    accentClass: 'border-amber-400/20',
    iconClass: 'bg-amber-500/14 text-amber-200 ring-1 ring-amber-400/20',
    badgeClass: 'border-amber-300/20 bg-amber-400/10 text-amber-100',
  },
  {
    title: 'Keep support close',
    description: 'You do not need perfect proof to ask for help or to pause a conversation that feels wrong.',
    icon: LifeBuoy,
    badge: 'Support',
    accentClass: 'border-sky-400/20',
    iconClass: 'bg-sky-500/14 text-sky-200 ring-1 ring-sky-400/20',
    badgeClass: 'border-sky-300/20 bg-sky-400/10 text-sky-100',
  },
];

const trustFramework = [
  {
    step: '01',
    title: 'Pace reveals character',
    body: 'Healthy interest can handle boundaries. Slow down when someone pushes urgency, exclusivity, secrecy, or emotional intensity too early.',
    icon: Clock3,
  },
  {
    step: '02',
    title: 'Verify before you invest',
    body: 'Use voice or video, compare details across conversations, and look for consistency before meeting or sharing more of your life.',
    icon: Video,
  },
  {
    step: '03',
    title: 'Protect private details',
    body: 'Keep your address, work patterns, official documents, bank details, and passwords completely off-limits.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Own the first meetup',
    body: 'Choose a public venue, keep your transport under your control, and make sure someone trusted knows the plan.',
    icon: MapPin,
  },
];

const warningSignals = [
  'They rush you off the app and resist voice or video verification.',
  'Money, gifts, travel help, account access, or crypto enter the conversation quickly.',
  'Their story changes when you ask ordinary follow-up questions.',
  'They use pity, guilt, romance, or spiritual pressure to bypass your boundaries.',
  'They push secrecy, isolation, or sudden urgency around a meeting.',
];

const trustMarkers = [
  'Their story stays consistent across text, voice, and video.',
  'They respect boundaries without trying to negotiate them away.',
  'They are comfortable with a natural pace and a public first meeting.',
  'They do not bring money, secrecy, or pressure into the relationship.',
  'They respond clearly when you ask direct questions.',
];

const meetingMoments = [
  {
    title: 'Before you go',
    icon: UserRoundCheck,
    items: [
      'Share the location, timing, and who you are meeting with someone you trust.',
      'Keep your phone charged and your return plan in your own hands.',
      'Decide in advance what would make you leave early.',
    ],
  },
  {
    title: 'During the date',
    icon: Eye,
    items: [
      'Stay in public for the first meeting and avoid being redirected somewhere private.',
      'Notice how they react to simple boundaries, delays, or disagreement.',
      'Avoid anything that reduces your ability to read the situation clearly.',
    ],
  },
  {
    title: 'If something shifts',
    icon: AlertTriangle,
    items: [
      'Leave immediately if the person becomes deceptive, aggressive, or dismissive.',
      'Do not worry about seeming rude when your safety is involved.',
      'Report the interaction and preserve screenshots if they may help review later.',
    ],
  },
];

const reportingSteps = [
  'Pause the conversation and stop sharing personal details.',
  'Preserve the most important screenshots or identifying details.',
  'Use the report flow or contact support with the core facts.',
  'Escalate offline threats to emergency services immediately.',
];

const SafetyNoteContent = () => {
  const { user } = useAuthContext();
  const [showSidePanel, setShowSidePanel] = useState(false);

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const layoutUser = user || null;

  const mainContent = (
    <div className="relative overflow-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 xl:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.08),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0.18),rgba(2,6,23,0.02))]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative mx-auto max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex items-center justify-start">
          <Link
            to="/help"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10"
            aria-label="Back to help"
            title="Back to help"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_30px_90px_rgba(2,6,23,0.32)] backdrop-blur sm:rounded-[2.2rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(125,211,252,0.18),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(134,239,172,0.16),transparent_22%),radial-gradient(circle_at_70%_82%,rgba(250,204,21,0.12),transparent_18%)]" />

          <div className="relative grid gap-0 xl:grid-cols-[minmax(0,1.25fr)_380px]">
            <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Safety note
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Trust-led dating
                  </span>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                      Stay grounded, move wisely
                    </p>
                    <h1 className="mt-4 max-w-[12ch] text-balance font-semibold leading-[0.9] tracking-[-0.08em] text-white text-[2.55rem] sm:text-[3.3rem] lg:text-[4.55rem]">
                      The premium safety guide for real-world connection.
                    </h1>
                    <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-200 sm:text-base sm:leading-8">
                      Dating should feel exciting without feeling reckless. This page helps you read the situation early, protect your privacy, plan first meetings well, and act fast when something feels wrong.
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Link
                        to="/report"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Report a safety issue
                      </Link>
                      <a
                        href="#meeting-guide"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                      >
                        View meeting guide
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-3 self-start">
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">For you</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">{layoutName}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Strong boundaries are not overreactions. They are how calm, high-quality dating stays safe.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-emerald-300/15 bg-emerald-400/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">Core principle</p>
                      <p className="mt-3 text-base font-semibold text-white">Trust consistency over chemistry spikes.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  {quickActions.map((card) => {
                    const Icon = card.icon;

                    return (
                      <article
                        key={card.title}
                        className={`rounded-[1.5rem] border bg-[linear-gradient(180deg,rgba(15,23,42,0.74),rgba(15,23,42,0.92))] p-4 shadow-[0_18px_36px_rgba(2,6,23,0.18)] ${card.accentClass}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${card.badgeClass}`}>
                            {card.badge}
                          </span>
                        </div>
                        <h2 className="mt-4 text-[1.15rem] font-semibold leading-7 tracking-[-0.03em] text-white">{card.title}</h2>
                        <p className="mt-2 text-[15px] leading-7 text-slate-300">{card.description}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.78),rgba(2,6,23,0.94))] px-4 py-6 text-white sm:px-7 sm:py-8 xl:border-l xl:border-t-0">
              <div className="rounded-[1.65rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_44px_rgba(2,6,23,0.28)] sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Immediate response</p>
                <h2 className="mt-3 max-w-[14ch] text-[1.8rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-[2.05rem]">
                  If something feels off, treat that feeling like useful data.
                </h2>
                <p className="mt-4 max-w-[32ch] text-[15px] leading-7 text-slate-300">
                  You do not owe more access, more explanation, or more time to behavior that feels manipulative, unsafe, dishonest, or disorienting.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    'Create distance from the person immediately.',
                    'Keep the strongest screenshots or key details.',
                    'Report early instead of waiting for certainty.',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      <p className="text-sm leading-6 text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.35rem] border border-amber-300/15 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Emergency always comes first</p>
                      <p className="mt-1 text-sm leading-6 text-amber-100/90">
                        If the situation becomes an offline threat or immediate danger, leave first and contact local emergency services before using app support.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.35rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.08))] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">Boundary reminder</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    You are allowed to stop replying, cancel a date, leave early, or report someone without over-explaining yourself.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.18fr)_320px] lg:gap-6">
          <div className="rounded-[1.7rem] border border-slate-200/70 bg-white p-5 text-slate-950 shadow-[0_20px_50px_rgba(15,23,42,0.14)] sm:rounded-[2rem] sm:p-6 lg:p-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">Trust framework</p>
              <h2 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-slate-950 sm:text-[2.6rem]">
                A calmer system for reading people well
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Good safety habits should feel elegant, not fearful. Use this framework to keep momentum while protecting your judgment.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {trustFramework.map((item, index) => {
                const Icon = item.icon;
                const cardTone =
                  index % 2 === 0
                    ? 'border-slate-200 bg-[linear-gradient(145deg,#ffffff,#f8fafc)]'
                    : 'border-cyan-100 bg-[linear-gradient(145deg,#f8fdff,#eef7ff)]';

                return (
                  <article
                    key={item.title}
                    className={`rounded-[1.5rem] border p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${cardTone}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{item.body}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="rounded-[1.7rem] border border-slate-200/70 bg-[linear-gradient(180deg,#0f172a,#111827)] p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] sm:rounded-[2rem] sm:p-6 lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Fast response</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">How to respond without second-guessing</h2>

            <div className="mt-5 space-y-3">
              {reportingSteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-200">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/report"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                <ShieldCheck className="h-4 w-4" />
                Open reporting
              </Link>
              <Link
                to="/help"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <LifeBuoy className="h-4 w-4" />
                Contact support
              </Link>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <article className="rounded-[1.7rem] border border-rose-200/70 bg-white p-5 text-slate-950 shadow-[0_18px_44px_rgba(15,23,42,0.12)] sm:rounded-[2rem] sm:p-6 lg:p-8">
            <div className="rounded-[1.35rem] border border-rose-200/90 bg-[linear-gradient(145deg,#fff1f2,#ffffff)] p-4 shadow-[0_10px_24px_rgba(244,63,94,0.08)] sm:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 ring-1 ring-rose-200">
                  <BadgeAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-700">Red flags</p>
                  <h2 className="mt-1 text-[1.75rem] font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950">
                    Signals worth taking seriously
                  </h2>
                  <p className="mt-2 max-w-[34ch] text-[15px] leading-7 text-slate-700">
                    Pressure, inconsistency, and secrecy usually get louder with time, not better.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {warningSignals.map((signal) => (
                <div
                  key={signal}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
                >
                  <BadgeAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <p className="text-[15px] leading-8 text-slate-800">{signal}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.7rem] border border-emerald-200/70 bg-white p-5 text-slate-950 shadow-[0_18px_44px_rgba(15,23,42,0.12)] sm:rounded-[2rem] sm:p-6 lg:p-8">
            <div className="rounded-[1.35rem] border border-emerald-200/90 bg-[linear-gradient(145deg,#ecfdf5,#ffffff)] p-4 shadow-[0_10px_24px_rgba(16,185,129,0.08)] sm:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-200 shadow-sm">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">Green flags</p>
                  <h2 className="mt-1 text-[1.75rem] font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950">
                    Consistency that supports trust
                  </h2>
                  <p className="mt-2 max-w-[34ch] text-[15px] leading-7 text-slate-700">
                    Calm, respectful behavior is usually a stronger signal than intensity or charm.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {trustMarkers.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-[15px] leading-8 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section
          id="meeting-guide"
          className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5 text-slate-950 shadow-[0_20px_54px_rgba(15,23,42,0.14)] sm:rounded-[2rem] sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">Meeting guide</p>
              <h2 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-slate-950 sm:text-[2.5rem]">
                Design the first date around your comfort, not their pressure
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A safer first meeting is usually less about a perfect checklist and more about keeping control over pace, location, movement, and exit options.
              </p>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              Public place. Own transport. Clear exit plan.
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {meetingMoments.map((moment, index) => {
              const Icon = moment.icon;

              return (
                <article
                  key={moment.title}
                  className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(145deg,#ffffff,#f8fafc)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">{moment.title}</h3>

                  <div className="mt-4 space-y-3">
                    {moment.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                        <p className="text-sm leading-6 text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_360px] lg:gap-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.92),rgba(17,24,39,0.96))] p-5 text-white shadow-[0_20px_54px_rgba(15,23,42,0.22)] sm:rounded-[2rem] sm:p-6 lg:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Final reminder</p>
            <h2 className="mt-2 max-w-[18ch] text-[2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-[2.35rem]">
              Safety is not paranoia. It is self-respect with structure.
            </h2>
            <p className="mt-4 max-w-[38rem] text-base leading-8 text-slate-300">
              You are allowed to change your mind, slow things down, ask better questions, leave a date, or report someone. Clear boundaries are not rude. They are part of wise, grounded dating.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                'Move at a pace that keeps your judgment intact.',
                'Treat consistency as more valuable than intensity.',
                'Leave early when respect, clarity, or safety disappears.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur"
                >
                  <p className="text-[15px] leading-7 text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5 text-slate-950 shadow-[0_18px_44px_rgba(15,23,42,0.12)] sm:rounded-[2rem] sm:p-6 lg:self-stretch">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">Support options</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">Need help right now?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Use the fastest path that matches the situation. Offline danger should always bypass the app and go straight to emergency help.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                to="/report"
                className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Open reporting</p>
                    <p className="text-sm text-slate-600">Send a safety report for review.</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </Link>

              <Link
                to="/help"
                className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <LifeBuoy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Message support</p>
                    <p className="text-sm text-slate-600">Ask for guidance before or after reporting.</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#07111f,#0b1324,#111827)] pb-20 text-white no-horizontal-scroll dashboard-main">
      <div className="hidden min-h-screen lg:flex">
        <div className="w-80 flex-shrink-0">
          <SidePanel
            userName={layoutName}
            userImage={layoutImage}
            user={layoutUser}
            onClose={() => setShowSidePanel(false)}
          />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar
            userName={layoutName}
            userImage={layoutImage}
            user={layoutUser}
            showFilters={false}
            showSidePanel={showSidePanel}
            onToggleFilters={() => {}}
            onToggleSidePanel={() => setShowSidePanel(false)}
            title="Safety Note"
          />
          <div className="flex-1 overflow-y-auto">{mainContent}</div>
        </div>
      </div>

      <div className="min-h-screen lg:hidden">
        <TopBar
          userName={layoutName}
          userImage={layoutImage}
          user={layoutUser}
          showFilters={false}
          showSidePanel={showSidePanel}
          onToggleFilters={() => {}}
          onToggleSidePanel={() => setShowSidePanel(true)}
          title="Safety Note"
        />
        <div className="flex-1">{mainContent}</div>
      </div>

      {showSidePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowSidePanel(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw]">
            <SidePanel
              userName={layoutName}
              userImage={layoutImage}
              user={layoutUser}
              onClose={() => setShowSidePanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProtectedSafetyNote() {
  return (
    <ProtectedRoute>
      <SafetyNoteContent />
    </ProtectedRoute>
  );
}
