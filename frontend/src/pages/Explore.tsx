/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Compass,
  Dumbbell,
  GraduationCap,
  MicVocal,
  Plane,
  Sparkles,
  Users,
  Video,
  Waypoints,
} from 'lucide-react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ProfileDisplay } from '@/components/dashboard/ProfileDisplay';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { TopBar } from '@/components/dashboard/TopBar';
import { PROFILE_FIT_OPTIONS } from '@/constants/profileFitOptions';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useMatching } from '@/hooks/useAPI';
import { API, type User } from '@/services/api';

const CARD_ICONS: LucideIcon[] = [
  BriefcaseBusiness,
  Waypoints,
  GraduationCap,
  Video,
  BookOpen,
  Plane,
  Dumbbell,
  MicVocal,
];

const TINDER_TINTS = [
  'rgba(190, 24, 93, 0.35)', // pink
  'rgba(8, 145, 178, 0.35)', // cyan
  'rgba(22, 163, 74, 0.35)', // green
  'rgba(234, 88, 12, 0.35)', // orange
  'rgba(234, 179, 8, 0.32)', // amber
  'rgba(37, 99, 235, 0.35)', // blue
  'rgba(220, 38, 38, 0.33)', // red
  'rgba(147, 51, 234, 0.33)', // purple
];

const CARD_IMAGE_URLS = [
  'https://media.istockphoto.com/id/1924464527/photo/small-flower-business-front-view-of-caucasian-man-and-african-american-woman-in-aprons.jpg?s=612x612&w=0&k=20&c=7m21vR2kEXnr0LNGNJwZkfwH4GzAWw7YD49PsAYgx9Q=',
  'https://media.istockphoto.com/id/2181729210/photo/young-priest-smiling-and-holding-bible-in-church.jpg?s=612x612&w=0&k=20&c=sow_ompuEYSHyyvUiYj9mchIswqQU9O6vxb4FcKBWAA=',
  'https://media.istockphoto.com/id/1413112483/photo/students-analyzing-data-on-laptop-during-lesson.jpg?s=612x612&w=0&k=20&c=Ueo3tWMdOsiFmR_INqaKVzL6qnhPGTv5VO6RgL1SJVg=',
  'https://media.istockphoto.com/id/1908855248/photo/woman-recording-a-video-tutorial-from-home.jpg?s=612x612&w=0&k=20&c=KbecOCNH9OxO6QAQoBYkFu_rNZmteTt0aiZsGkdXez4=',
  'https://media.istockphoto.com/id/1402835350/photo/pensive-relaxed-african-american-woman-reading-a-book-at-home-drinking-coffee-sitting-on-the.jpg?s=612x612&w=0&k=20&c=aw9R68ENkPNqEQqQKcPqIlwAefRSQnymCifEjKd-4aE=',
  'https://media.istockphoto.com/id/1352753120/photo/excited-family-going-on-vacation-together.jpg?s=612x612&w=0&k=20&c=yZ6AXbyA_kROCYV6SnUlwofysXXTtY9znxni52OMSwc=',
  'https://images.unsplash.com/photo-1613685044678-0a9ae422cf5a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZpdG5lc3N8ZW58MHx8MHx8fDA%3D',
  'https://media.istockphoto.com/id/1138528725/photo/young-millennial-dancing-to-the-music-in-her-downtown-los-angeles-apartment.jpg?s=612x612&w=0&k=20&c=sP73bskU6IbsNkWzZixxZePUYpYnQ4129DZjgmOpTpU=',
] as const;

const CardArtwork = ({ index }: { index: number }) => {
  const cardIndex = index % 8;
  const gradientId = `explore-card-gradient-${cardIndex}`;
  const svgClassName = 'block h-full w-full';

  switch (cardIndex) {
    case 0:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className={svgClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#64113f" />
              <stop offset="55%" stopColor="#9d174d" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>
          <rect width="400" height="560" fill={`url(#${gradientId})`} />
          <rect x="28" y="72" width="132" height="188" rx="20" fill="#ffffff16" />
          <rect x="178" y="54" width="194" height="222" rx="24" fill="#ffffff12" />
          <circle cx="220" cy="176" r="42" fill="#f6d1bf" />
          <path d="M176 230h88v170h-88z" fill="#d1d5db" />
          <path d="M158 246h34v144h-34z" fill="#9ca3af" />
          <path d="M248 246h34v144h-34z" fill="#9ca3af" />
          <path d="M220 224l28 112h-56z" fill="#111827" />
          <rect x="188" y="400" width="28" height="112" rx="14" fill="#111827" />
          <rect x="224" y="400" width="28" height="112" rx="14" fill="#111827" />
          <rect x="0" y="470" width="400" height="90" fill="#00000026" />
        </svg>
      );
    case 1:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className={svgClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f3b57" />
              <stop offset="55%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
          </defs>
          <rect width="400" height="560" fill={`url(#${gradientId})`} />
          <circle cx="132" cy="198" r="38" fill="#f3cfbe" />
          <rect x="95" y="235" width="74" height="140" rx="26" fill="#f8fafc" />
          <circle cx="272" cy="190" r="36" fill="#f1c7b3" />
          <rect x="236" y="225" width="72" height="146" rx="24" fill="#e2e8f0" />
          <rect x="183" y="204" width="34" height="170" rx="10" fill="#f8fafc" />
          <rect x="168" y="272" width="64" height="20" rx="8" fill="#f8fafc" />
          <circle cx="200" cy="160" r="24" fill="#fde68a" />
          <rect x="0" y="470" width="400" height="90" fill="#00000024" />
        </svg>
      );
    case 2:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className={svgClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0b3d1f" />
              <stop offset="55%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>
          <rect width="400" height="560" fill={`url(#${gradientId})`} />
          <rect x="44" y="110" width="228" height="170" rx="22" fill="#ffffff16" />
          <rect x="68" y="138" width="180" height="18" rx="9" fill="#ffffff24" />
          <rect x="68" y="172" width="160" height="18" rx="9" fill="#ffffff1f" />
          <rect x="68" y="206" width="138" height="18" rx="9" fill="#ffffff1b" />
          <circle cx="308" cy="214" r="42" fill="#f3cfbe" />
          <path d="M266 258h86v148h-86z" fill="#d1d5db" />
          <path d="M110 326l70-38 70 38-70 38z" fill="#111827" />
          <path d="M180 364v42" stroke="#111827" strokeWidth="10" strokeLinecap="round" />
          <rect x="0" y="470" width="400" height="90" fill="#00000022" />
        </svg>
      );
    case 3:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className={svgClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c2d12" />
              <stop offset="55%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>
          <rect width="400" height="560" fill={`url(#${gradientId})`} />
          <rect x="56" y="92" width="292" height="198" rx="26" fill="#00000020" />
          <rect x="82" y="118" width="236" height="146" rx="20" fill="#ffffff14" />
          <circle cx="148" cy="208" r="32" fill="#f1c8b6" />
          <path d="M116 242h64v116h-64z" fill="#fca5a5" />
          <circle cx="258" cy="160" r="18" fill="#ffffffc8" />
          <rect x="240" y="182" width="36" height="84" rx="12" fill="#ffffffb2" />
          <path d="M258 222l54-40" stroke="#ffffffb2" strokeWidth="14" strokeLinecap="round" />
          <rect x="206" y="316" width="108" height="72" rx="14" fill="#111827" />
          <polygon points="246,334 246,370 278,352" fill="#f8fafc" />
          <rect x="0" y="470" width="400" height="90" fill="#00000024" />
        </svg>
      );
    case 4:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className={svgClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#713f12" />
              <stop offset="55%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>
          <rect width="400" height="560" fill={`url(#${gradientId})`} />
          <circle cx="138" cy="182" r="38" fill="#efcab6" />
          <path d="M98 220h80v138h-80z" fill="#f8fafc" />
          <path d="M186 286l114-32v146l-114 34z" fill="#fef3c7" />
          <path d="M186 286l-86-30v144l86 34z" fill="#fff7ed" />
          <path d="M186 286v150" stroke="#b45309" strokeWidth="4" />
          <path d="M118 278v118" stroke="#b45309" strokeWidth="3" />
          <path d="M254 268v120" stroke="#b45309" strokeWidth="3" />
          <rect x="0" y="470" width="400" height="90" fill="#00000020" />
        </svg>
      );
    case 5:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className={svgClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="55%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="400" height="560" fill={`url(#${gradientId})`} />
          <circle cx="116" cy="194" r="40" fill="#f2c8b4" />
          <path d="M74 236h84v150H74z" fill="#f8fafc" />
          <rect x="206" y="174" width="118" height="184" rx="24" fill="#ffffff14" />
          <path d="M214 286c34-40 74-64 126-78" stroke="#f8fafc" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M208 306c52 10 94 8 136-6" stroke="#f8fafc" strokeWidth="12" fill="none" strokeLinecap="round" />
          <rect x="86" y="392" width="62" height="34" rx="10" fill="#94a3b8" />
          <circle cx="302" cy="124" r="22" fill="#dbeafe" />
          <rect x="0" y="470" width="400" height="90" fill="#00000022" />
        </svg>
      );
    case 6:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className={svgClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7f1d1d" />
              <stop offset="55%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>
          <rect width="400" height="560" fill={`url(#${gradientId})`} />
          <circle cx="244" cy="154" r="34" fill="#efc8b5" />
          <path d="M226 190l-34 84 58 18 34-62z" fill="#fdba74" />
          <path d="M190 272l-46 98" stroke="#fdba74" strokeWidth="24" strokeLinecap="round" />
          <path d="M248 290l76 60" stroke="#fdba74" strokeWidth="24" strokeLinecap="round" />
          <path d="M216 236l-96-10" stroke="#fdba74" strokeWidth="20" strokeLinecap="round" />
          <path d="M270 216l58-50" stroke="#fdba74" strokeWidth="20" strokeLinecap="round" />
          <rect x="86" y="364" width="38" height="20" rx="8" fill="#111827" />
          <rect x="322" y="344" width="38" height="20" rx="8" fill="#111827" />
          <rect x="0" y="470" width="400" height="90" fill="#00000024" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className={svgClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#581c87" />
              <stop offset="55%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>
          <rect width="400" height="560" fill={`url(#${gradientId})`} />
          <circle cx="150" cy="194" r="40" fill="#f3c9b5" />
          <path d="M110 238h80v150h-80z" fill="#f9a8d4" />
          <rect x="264" y="150" width="22" height="176" rx="11" fill="#f8fafc" />
          <circle cx="275" cy="136" r="28" fill="#f8fafc" />
          <path d="M74 172c18-34 44-36 54-6" stroke="#ffffff96" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M298 208c30-24 48 10 24 28" stroke="#ffffff96" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M318 178c26-18 44 6 24 20" stroke="#ffffff72" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="0" y="470" width="400" height="90" fill="#00000024" />
        </svg>
      );
  }
};

const normalizeKey = (value: string) => value.trim().toLowerCase();

const ExploreContent = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { likeUser, passUser } = useMatching();
  const { showError, showInfo } = useToast();

  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [fitCounts, setFitCounts] = useState<Record<string, number>>({});
  const [failedCardImages, setFailedCardImages] = useState<Record<number, true>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isExhausted, setIsExhausted] = useState(false);
  const pendingActionIdsRef = useRef<Set<string>>(new Set());

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      setLoadingCounts(true);
      try {
        const response = await API.Discovery.getProfileFitCounts();
        if (!cancelled) {
          setFitCounts(response || {});
        }
      } catch {
        if (!cancelled) {
          setFitCounts({});
        }
      } finally {
        if (!cancelled) {
          setLoadingCounts(false);
        }
      }
    };

    loadCounts().catch(() => null);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfiles = async () => {
      if (!selectedFit) {
        setProfiles([]);
        setCurrentProfileIndex(0);
        setIsExhausted(false);
        setError(null);
        setLoadingProfiles(false);
        return;
      }

      setLoadingProfiles(true);
      setError(null);
      setCurrentProfileIndex(0);
      setIsExhausted(false);

      try {
        const response = await API.Discovery.getUsersByProfileFit(selectedFit);
        if (!cancelled) {
          setProfiles(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load profiles.';
          setError(message);
          setProfiles([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProfiles(false);
        }
      }
    };

    loadProfiles().catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [selectedFit]);

  const activeProfiles = useMemo(() => {
    const currentUserId = user?.id ? String(user.id) : null;
    return (Array.isArray(profiles) ? profiles : [])
      .filter((profile) => profile && (profile.id || (profile as any)._id))
      .filter((profile) => !currentUserId || String(profile.id || (profile as any)._id) !== currentUserId);
  }, [profiles, user?.id]);

  useEffect(() => {
    if (activeProfiles.length === 0) {
      setCurrentProfileIndex(0);
      return;
    }

    setCurrentProfileIndex((prev) => (prev >= activeProfiles.length ? 0 : prev));
  }, [activeProfiles]);

  const currentProfile = !isExhausted ? activeProfiles[currentProfileIndex] ?? activeProfiles[0] ?? null : null;

  const goToNextProfile = () => {
    if (activeProfiles.length === 0) return;

    if (currentProfileIndex < activeProfiles.length - 1) {
      setCurrentProfileIndex((prev) => prev + 1);
      return;
    }

    setIsExhausted(true);
    showInfo('You have reached the end of this category. Tap reload to fetch again.', 'Explore Complete');
  };

  const handleNoProfilesAction = async () => {
    if (!selectedFit) return;

    setIsExhausted(false);
    setCurrentProfileIndex(0);
    setLoadingProfiles(true);
    setError(null);

    try {
      const response = await API.Discovery.getUsersByProfileFit(selectedFit);
      setProfiles(Array.isArray(response) ? response : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reload profiles.';
      setError(message);
      showError(message, 'Reload Failed');
    } finally {
      setLoadingProfiles(false);
    }
  };

  const runProfileAction = async (action: () => Promise<unknown>) => {
    const profileId = currentProfile?.id ? String(currentProfile.id) : '';
    if (!profileId || pendingActionIdsRef.current.has(profileId)) return;

    pendingActionIdsRef.current.add(profileId);
    goToNextProfile();

    try {
      await action();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed. Please retry.';
      showError(message, 'Action Failed');
    } finally {
      pendingActionIdsRef.current.delete(profileId);
    }
  };

  const handleLike = async () => {
    if (!currentProfile?.id) return;
    await runProfileAction(() => likeUser(String(currentProfile.id)));
  };

  const handlePass = async () => {
    if (!currentProfile?.id) return;
    await runProfileAction(() => passUser(String(currentProfile.id)));
  };

  const handleGoBack = () => {
    setIsExhausted(false);
    setCurrentProfileIndex((prev) => Math.max(0, prev - 1));
  };

  const resetToGrid = () => {
    setSelectedFit(null);
    setProfiles([]);
    setCurrentProfileIndex(0);
    setIsExhausted(false);
    setError(null);
  };

  const selectedFitCount = selectedFit ? fitCounts[normalizeKey(selectedFit)] || activeProfiles.length : 0;

  const gridView = (
    <div className="px-1 pb-8 pt-4 sm:px-6 sm:pt-6 md:px-8">
      <div className="mx-auto w-full max-w-none space-y-5 sm:max-w-7xl sm:space-y-6">
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Header - keep, but slightly closer to Tinder */}
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-100">
                <Compass className="h-3.5 w-3.5" />
                Explore Profiles
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Find people who match your profile
              </h1>
              <p className="mt-2 hidden max-w-2xl text-sm text-slate-200 sm:block sm:text-base">
                Tap any card to see FaithBliss members who picked that category during onboarding.
              </p>
            </div>
            <div className="hidden rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100 sm:block">
              8 live categories
            </div>
          </div>
        </section>

        {/* Tinder-style Explore grid */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-5">
          {PROFILE_FIT_OPTIONS.map((option, index) => {
            const tint = TINDER_TINTS[index % TINDER_TINTS.length];
            const cardImageUrl = CARD_IMAGE_URLS[index % CARD_IMAGE_URLS.length];
            const count = fitCounts[normalizeKey(option.title)] || 0;
            const Icon = CARD_ICONS[index % CARD_ICONS.length];
            const shouldUseRemoteImage = Boolean(cardImageUrl) && !failedCardImages[index];

            return (
              <button
                key={option.title}
                type="button"
                onClick={() => setSelectedFit(option.title)}
                className="group relative aspect-[0.52] w-full overflow-hidden rounded-[1.5rem] border border-white/10 text-left shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-[transform,box-shadow,border-color] duration-300 ease-out active:-translate-y-1 active:scale-[0.985] active:border-white/20 active:shadow-[0_24px_52px_rgba(0,0,0,0.45)] sm:aspect-[3/4] sm:rounded-[1.75rem] sm:hover:-translate-y-1 sm:hover:border-white/20 sm:hover:shadow-[0_24px_52px_rgba(0,0,0,0.45)]"
              >
                {/* Full-bleed image */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 scale-[1.01] overflow-hidden transition duration-500 ease-out group-active:scale-[1.05] sm:group-hover:scale-[1.05]"
                >
                  {shouldUseRemoteImage ? (
                    <img
                      src={cardImageUrl ?? undefined}
                      alt=""
                      className="block h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={() =>
                        setFailedCardImages((current) => ({
                          ...current,
                          [index]: true,
                        }))
                      }
                    />
                  ) : (
                    <CardArtwork index={index} />
                  )}
                </div>

                {/* Color tint like Tinder */}
                <div
                  className="absolute inset-0 transition-opacity duration-300 ease-out group-active:opacity-85 sm:group-hover:opacity-85"
                  style={{ backgroundColor: tint }}
                />

                {/* Bottom dark gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                {/* Optional top soft shade (like Tinder) */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent" />

                {/* Count badge (top-right) */}
                <div className="absolute right-3 top-3 hidden items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-md transition duration-300 ease-out group-active:-translate-y-0.5 sm:inline-flex sm:group-hover:-translate-y-0.5">
                  <Users className="h-3.5 w-3.5" />
                  {loadingCounts ? '...' : count}
                </div>

                {/* Optional small icon pill (top-left) - Tinder doesn't do this, but it looks premium */}
                <div className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white/90 backdrop-blur-md transition duration-300 ease-out group-active:-translate-y-0.5 sm:group-hover:-translate-y-0.5">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>

                {/* Title (bottom-left) */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-3 sm:left-3 sm:right-3">
                  <h2 className="text-[1.22rem] font-semibold leading-[1.08] tracking-tight text-white drop-shadow sm:text-[1.35rem]">
                    {option.title}
                  </h2>
                </div>
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );

  const selectedView = (
    <div className="relative flex h-[calc(100dvh-62px)] flex-col pt-16 sm:h-[calc(100dvh-74px)] sm:pt-20 lg:min-h-[calc(100vh-84px)] lg:h-auto lg:pt-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-3 pt-4 sm:px-4 sm:pt-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={resetToGrid}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Back to explore categories"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="pointer-events-auto inline-flex max-w-[calc(100vw-3.5rem)] items-center gap-2 rounded-[1.35rem] border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-cyan-100 sm:max-w-none sm:rounded-full sm:py-1 sm:text-[11px] sm:tracking-[0.22em]">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="break-words">{selectedFit}</span>
          </div>
        </div>
        <div className="pointer-events-auto hidden rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white lg:block">
          {selectedFitCount} matches
        </div>
      </div>

      {loadingProfiles ? (
        <div className="flex flex-1 items-center justify-center px-4 py-6 lg:px-8">
          <div className="flex h-full min-h-[60vh] w-full max-w-[620px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 px-6 text-sm text-slate-200">
            Loading profiles for {selectedFit}...
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center px-4 py-6 lg:px-8">
          <div className="flex h-full min-h-[60vh] w-full max-w-[620px] items-center justify-center rounded-[1.5rem] border border-rose-400/30 bg-rose-500/10 px-6 text-sm text-rose-100">
            {error}
          </div>
        </div>
      ) : (
        <>
          <div className="flex h-full flex-1 flex-col px-0 pt-0 lg:hidden">
            <div className="relative mx-auto h-full w-full flex-1">
              <ProfileDisplay
                currentProfile={currentProfile}
                viewerLatitude={typeof user?.latitude === 'number' ? user.latitude : undefined}
                viewerLongitude={typeof user?.longitude === 'number' ? user.longitude : undefined}
                onStartOver={() => setCurrentProfileIndex(0)}
                onGoBack={handleGoBack}
                onLike={handleLike}
                onPass={handlePass}
                noProfilesTitle="No new matches yet"
                noProfilesDescription="You have liked or passed everyone available for now. Tap reload and we will fetch fresh profiles instantly."
                noProfilesActionLabel="Reload Profiles"
                onNoProfilesAction={handleNoProfilesAction}
              />
            </div>
          </div>

          <div className="hidden flex-1 items-center justify-center overflow-hidden px-4 pb-5 pt-4 lg:flex">
            <div className="relative h-full max-h-[calc(100vh-220px)] w-full max-w-[620px]">
              <ProfileDisplay
                currentProfile={currentProfile}
                viewerLatitude={typeof user?.latitude === 'number' ? user.latitude : undefined}
                viewerLongitude={typeof user?.longitude === 'number' ? user.longitude : undefined}
                onStartOver={() => setCurrentProfileIndex(0)}
                onGoBack={handleGoBack}
                onLike={handleLike}
                onPass={handlePass}
                noProfilesTitle="No new matches yet"
                noProfilesDescription="You have liked or passed everyone available for now. Tap reload and we will fetch fresh profiles instantly."
                noProfilesActionLabel="Reload Profiles"
                onNoProfilesAction={handleNoProfilesAction}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  const content = selectedFit ? selectedView : gridView;

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
            title="Explore"
          />
          <div className="flex-1 overflow-y-auto">{content}</div>
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
          title="Explore"
        />
        <div>{content}</div>
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
};

export default function ProtectedExplore() {
  return (
    <ProtectedRoute>
      <ExploreContent />
    </ProtectedRoute>
  );
}
