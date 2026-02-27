import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Maximize2, Minus, MoreHorizontal, Plus, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import type { User } from '@/services/api';
import { FloatingActionButtons } from './FloatingActionButtons';
import type { DashboardFilterFocusSection } from './FilterPanel';

interface HingeStyleProfileCardProps {
  profile: User;
  viewerLatitude?: number;
  viewerLongitude?: number;
  onGoBack: () => void;
  onPass: () => void;
  onLike: () => void;
  onOpenFilterSection?: (section: DashboardFilterFocusSection) => void;
}

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const pointerDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
};

export const HingeStyleProfileCard = ({
  profile,
  viewerLatitude,
  viewerLongitude,
  onGoBack,
  onPass,
  onLike,
  onOpenFilterSection,
}: HingeStyleProfileCardProps) => {
  const navigate = useNavigate();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentPhotoAspectRatio, setCurrentPhotoAspectRatio] = useState(1);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerOffset, setViewerOffset] = useState({ x: 0, y: 0 });
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });
  const [isCompactHeight, setIsCompactHeight] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-height: 760px)').matches;
  });
  const viewerStageRef = useRef<HTMLDivElement | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(1);
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const lastTapAtRef = useRef(0);

  const toCardCloudinary = (url: string) => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
      return url;
    }

    const [prefix, suffix] = url.split('/upload/');
    if (!prefix || !suffix) return url;

    // Card render: face-aware crop to keep faces safe in cover mode.
    const deliveryTransform = 'c_fill,g_auto:face,ar_7:5,w_2000,f_auto,q_auto:best,dpr_auto,e_sharpen:70';
    return `${prefix}/upload/${deliveryTransform}/${suffix}`;
  };

  const toViewerCloudinary = (url: string) => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
      return url;
    }

    const [prefix, suffix] = url.split('/upload/');
    if (!prefix || !suffix) return url;

    // Fullscreen viewer: no forced crop, keep original framing.
    const deliveryTransform = 'f_auto,q_auto:best,dpr_auto,c_limit,w_2400,e_sharpen:60';
    return `${prefix}/upload/${deliveryTransform}/${suffix}`;
  };

  const stopEvent = (event: React.SyntheticEvent) => {
    const nativeEvent = event.nativeEvent as Event;
    if (nativeEvent.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
  };

  const rawPhotos = useMemo(() => {
    const list = [
      profile.profilePhoto1,
      profile.profilePhoto2,
      profile.profilePhoto3,
      profile.profilePhoto4,
      profile.profilePhoto5,
      profile.profilePhoto6,
    ].filter(Boolean) as string[];
    return list.length > 0 ? list : ['/default-avatar.png'];
  }, [
    profile.profilePhoto1,
    profile.profilePhoto2,
    profile.profilePhoto3,
    profile.profilePhoto4,
    profile.profilePhoto5,
    profile.profilePhoto6,
  ]);

  const cardPhotos = useMemo(() => rawPhotos.map(toCardCloudinary), [rawPhotos]);
  const viewerPhotos = useMemo(() => rawPhotos.map(toViewerCloudinary), [rawPhotos]);

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % cardPhotos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + cardPhotos.length) % cardPhotos.length);
  const currentViewerPhoto = viewerPhotos[currentPhotoIndex] || viewerPhotos[0];

  const clampViewerOffset = (offset: { x: number; y: number }, scale: number) => {
    const stage = viewerStageRef.current;
    if (!stage || scale <= 1) return { x: 0, y: 0 };

    const maxX = (stage.clientWidth * (scale - 1)) / 2;
    const maxY = (stage.clientHeight * (scale - 1)) / 2;
    return {
      x: clamp(offset.x, -maxX, maxX),
      y: clamp(offset.y, -maxY, maxY),
    };
  };

  const applyViewerScale = (nextScale: number) => {
    const clampedScale = clamp(nextScale, 1, 4);
    setViewerScale(clampedScale);
    setViewerOffset((prev) => clampViewerOffset(prev, clampedScale));
  };

  const resetViewerTransform = () => {
    setViewerScale(1);
    setViewerOffset({ x: 0, y: 0 });
  };

  const handleViewerPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointersRef.current.size === 1) {
      const now = Date.now();
      if (now - lastTapAtRef.current < 300) {
        resetViewerTransform();
      }
      lastTapAtRef.current = now;

      if (viewerScale > 1) {
        panStartRef.current = {
          x: event.clientX,
          y: event.clientY,
          offsetX: viewerOffset.x,
          offsetY: viewerOffset.y,
        };
      }
    }

    if (activePointersRef.current.size === 2) {
      const points = Array.from(activePointersRef.current.values());
      pinchStartDistanceRef.current = pointerDistance(points[0], points[1]);
      pinchStartScaleRef.current = viewerScale;
      panStartRef.current = null;
    }
  };

  const handleViewerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return;
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointersRef.current.size === 2 && pinchStartDistanceRef.current) {
      const points = Array.from(activePointersRef.current.values());
      const nextDistance = pointerDistance(points[0], points[1]);
      const nextScale = pinchStartScaleRef.current * (nextDistance / pinchStartDistanceRef.current);
      applyViewerScale(nextScale);
      return;
    }

    if (activePointersRef.current.size === 1 && panStartRef.current && viewerScale > 1) {
      const dx = event.clientX - panStartRef.current.x;
      const dy = event.clientY - panStartRef.current.y;
      const nextOffset = clampViewerOffset(
        {
          x: panStartRef.current.offsetX + dx,
          y: panStartRef.current.offsetY + dy,
        },
        viewerScale,
      );
      setViewerOffset(nextOffset);
    }
  };

  const handleViewerPointerUpOrCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchStartDistanceRef.current = null;
    }

    if (activePointersRef.current.size === 1 && viewerScale > 1) {
      const remaining = Array.from(activePointersRef.current.values())[0];
      panStartRef.current = {
        x: remaining.x,
        y: remaining.y,
        offsetX: viewerOffset.x,
        offsetY: viewerOffset.y,
      };
    } else {
      panStartRef.current = null;
    }
  };

  const handleViewerWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.cancelable) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.18 : 0.18;
    applyViewerScale(viewerScale + delta);
  };

  const openImageViewer = (event?: React.SyntheticEvent) => {
    if (event) {
      event.stopPropagation();
    }
    resetViewerTransform();
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
    resetViewerTransform();
  };

  useEffect(() => {
    if (!isImageViewerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeImageViewer();
      } else if (event.key === '+' || event.key === '=') {
        applyViewerScale(viewerScale + 0.2);
      } else if (event.key === '-') {
        applyViewerScale(viewerScale - 0.2);
      } else if (event.key === '0') {
        resetViewerTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageViewerOpen, viewerScale]);

  useEffect(() => {
    if (isImageViewerOpen) {
      resetViewerTransform();
    }
  }, [currentPhotoIndex, isImageViewerOpen]);
  const profileWithExtras = profile as User & { _id?: string; distance?: number };
  const profileId = profileWithExtras.id || profileWithExtras._id || 'missing';
  const profileLatitude = typeof profileWithExtras.latitude === 'number' ? profileWithExtras.latitude : null;
  const profileLongitude = typeof profileWithExtras.longitude === 'number' ? profileWithExtras.longitude : null;
  const apiDistance = typeof profileWithExtras.distance === 'number' ? Math.round(profileWithExtras.distance) : null;
  const calculatedDistance =
    viewerLatitude != null && viewerLongitude != null && profileLatitude != null && profileLongitude != null
      ? Math.round(haversineDistanceKm(viewerLatitude, viewerLongitude, profileLatitude, profileLongitude))
      : null;
  const distance = apiDistance ?? calculatedDistance;
  const distanceBadge = distance !== null ? `${distance} km away` : 'Nearby';
  const locationText = profile.location?.trim() || 'Location not set';
  const formatLabel = (value: string) =>
    value
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const mobileDisplayName = profile.name?.trim().split(/\s+/)[0] || profile.name || 'User';
  const primaryGoal = profile.relationshipGoals?.[0] || profile.lookingFor?.[0] || '';
  const ageFilterLabel = profile.age ? `Age ${profile.age}` : 'Age';
  const heightFilterLabel = profile.height ? profile.height.split('(')[0].trim() : 'Height';
  const goalFilterLabel = primaryGoal ? formatLabel(primaryGoal) : 'Dating Intentions';
  const mobileChips: Array<{ label: string; section: DashboardFilterFocusSection }> = [
    { label: ageFilterLabel, section: 'age' },
    { label: heightFilterLabel, section: 'height' },
    { label: goalFilterLabel, section: 'relationship-goal' },
  ];

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [profileId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobileView(event.matches);
    };

    setIsMobileView(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const compactHeightQuery = window.matchMedia('(max-height: 760px)');
    const handleCompactHeightChange = (event: MediaQueryListEvent) => {
      setIsCompactHeight(event.matches);
    };

    setIsCompactHeight(compactHeightQuery.matches);
    compactHeightQuery.addEventListener('change', handleCompactHeightChange);
    return () => compactHeightQuery.removeEventListener('change', handleCompactHeightChange);
  }, []);

  useEffect(() => {
    if (currentPhotoIndex > cardPhotos.length - 1) {
      setCurrentPhotoIndex(0);
    }
  }, [currentPhotoIndex, cardPhotos.length]);

  useEffect(() => {
    const currentPhotoUrl = rawPhotos[currentPhotoIndex];
    if (!currentPhotoUrl) return;

    let isCancelled = false;
    const image = new Image();
    image.onload = () => {
      if (isCancelled) return;
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setCurrentPhotoAspectRatio(image.naturalWidth / image.naturalHeight);
      }
    };
    image.onerror = () => {
      if (!isCancelled) {
        setCurrentPhotoAspectRatio(1);
      }
    };
    image.src = currentPhotoUrl;

    return () => {
      isCancelled = true;
    };
  }, [rawPhotos, currentPhotoIndex]);

  if (isMobileView) {
    const mobileCoverPosition = currentPhotoAspectRatio < 0.95 ? '50% 24%' : '50% 35%';
    const isPortraitImage = currentPhotoAspectRatio < 0.95;
    const mobileStageHeightClass = isCompactHeight
      ? isPortraitImage
        ? 'min-h-[220px] max-h-[42vh]'
        : 'min-h-[200px] max-h-[36vh]'
      : isPortraitImage
        ? 'min-h-[285px] max-h-[57vh]'
        : 'min-h-[255px] max-h-[49vh]';

    return (
      <>
        <div className="flex h-full w-full flex-col bg-[radial-gradient(circle_at_10%_10%,rgba(236,72,153,0.17),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.16),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 text-white">
          <div className={`flex items-center gap-2 overflow-x-auto ${isCompactHeight ? 'mb-2 pb-0.5' : 'mb-3 pb-1'}`}>
          <button
            type="button"
            onClick={() => onOpenFilterSection?.('distance')}
            className={`inline-flex shrink-0 items-center justify-center rounded-full border border-pink-300/45 bg-pink-500/25 text-pink-100 shadow-[0_8px_20px_rgba(236,72,153,0.28)] ${
              isCompactHeight ? 'h-9 w-9' : 'h-10 w-10'
            }`}
            aria-label="Filter options"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          {mobileChips.map((chip, index) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onOpenFilterSection?.(chip.section)}
              className={`inline-flex shrink-0 items-center rounded-full border text-xs font-semibold shadow-sm ${
                index === 0
                  ? 'border-white/60 bg-white/95 text-slate-900'
                  : 'border-white/25 bg-slate-900/60 text-slate-100 backdrop-blur-sm'
              } ${isCompactHeight ? 'px-3.5 py-1.5' : 'px-4 py-2'}`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <article className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900/72 shadow-[0_18px_46px_rgba(2,6,23,0.6)] backdrop-blur-sm ${isCompactHeight ? 'p-2.5' : 'p-3'}`}>
          <div className={`flex items-start justify-between gap-3 px-1 ${isCompactHeight ? 'mb-1.5' : 'mb-2'}`}>
            <div>
              <h2 className={`${isCompactHeight ? 'text-[2rem]' : 'text-3xl'} font-bold leading-tight text-white`}>
                {mobileDisplayName}
                {profile.age ? `, ${profile.age}` : ''}
              </h2>
              <p className={`inline-flex items-center gap-2 font-semibold text-emerald-600 ${isCompactHeight ? 'mt-0.5 text-xs' : 'mt-1 text-sm'}`}>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Active today
              </p>
              <p className={`${isCompactHeight ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} text-slate-300`}>{locationText}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/profile/${profileId}`)}
                className={`inline-flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-slate-100 backdrop-blur-sm ${isCompactHeight ? 'h-8 w-8' : 'h-9 w-9'}`}
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 rounded-full border border-white/12 bg-black/35 backdrop-blur-sm ${isCompactHeight ? 'mb-1.5 px-2.5 py-1.5' : 'mb-2 px-3 py-2'}`}>
            {cardPhotos.map((_, index) => (
              <button
                key={index}
                type="button"
                onPointerDown={stopEvent}
                onMouseDown={stopEvent}
                onTouchStart={stopEvent}
                onClick={(event) => {
                  stopEvent(event);
                  setCurrentPhotoIndex(index);
                }}
                className={`h-1.5 flex-1 rounded-full transition-colors ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/35'}`}
                aria-label={`Photo ${index + 1}`}
              />
            ))}
          </div>

          <div
            className={`relative mt-1.5 w-full flex-1 cursor-zoom-in overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/80 ${mobileStageHeightClass}`}
            onClick={openImageViewer}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                openImageViewer();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open full image"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={`${profileId}-${currentPhotoIndex}-bg-mobile`}
                src={cardPhotos[currentPhotoIndex]}
                alt={profile.name}
                className="absolute inset-0 h-full w-full object-cover blur-xl brightness-75"
                initial={{ opacity: 0.45, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.45, scale: 0.985 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                draggable={false}
                loading="eager"
                decoding="async"
              />
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={`${profileId}-${currentPhotoIndex}-mobile`}
                src={cardPhotos[currentPhotoIndex]}
                alt={profile.name}
                className="absolute inset-0 h-full w-full object-cover object-center [image-rendering:auto] [backface-visibility:hidden] [transform:translateZ(0)]"
                style={{ objectPosition: mobileCoverPosition }}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                draggable={false}
                loading="eager"
                decoding="async"
              />
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_62%,rgba(2,6,23,0.55)_100%)]" />
            <div className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/35 px-2 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
              <Maximize2 className="h-3.5 w-3.5" />
              Full
            </div>

            {cardPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onPointerDown={stopEvent}
                  onMouseDown={stopEvent}
                  onTouchStart={stopEvent}
                  onClick={(event) => {
                    stopEvent(event);
                    prevPhoto();
                  }}
                  className="absolute inset-y-0 left-0 z-20 flex w-[18%] items-center justify-start pl-2"
                  aria-label="Previous photo"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white/90 backdrop-blur-sm">
                    <ChevronLeft className="h-5 w-5" />
                  </span>
                </button>
                <button
                  type="button"
                  onPointerDown={stopEvent}
                  onMouseDown={stopEvent}
                  onTouchStart={stopEvent}
                  onClick={(event) => {
                    stopEvent(event);
                    nextPhoto();
                  }}
                  className="absolute inset-y-0 right-0 z-20 flex w-[18%] items-center justify-end pr-2"
                  aria-label="Next photo"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white/90 backdrop-blur-sm">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="mt-auto">
            <div className={`${isCompactHeight ? 'mt-1.5' : 'mt-2'} flex items-center gap-2`}>
              <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
                {distanceBadge}
              </span>
            </div>
            <p className={`${isCompactHeight ? 'mt-1 line-clamp-1 text-xs' : 'mt-1 line-clamp-2 text-sm'} text-slate-100`}>
              {profile.bio?.trim() || 'No bio available yet.'}
            </p>

            <div className={`${isCompactHeight ? 'mt-2 gap-2 pb-0' : 'mt-3 gap-3 pb-1'} flex items-center`}>
              <button
                type="button"
                onClick={onPass}
                className={`inline-flex shrink-0 items-center justify-center rounded-full border border-rose-300/45 bg-rose-500/22 text-rose-100 shadow-[0_10px_24px_rgba(244,63,94,0.32)] ${
                  isCompactHeight ? 'h-11 w-11' : 'h-12 w-12'
                }`}
                aria-label="Pass"
              >
                <X className="h-5 w-5" />
              </button>
              <Link
                to={`/profile/${profileId}`}
                className={`inline-flex flex-1 items-center justify-center rounded-full border border-cyan-300/55 bg-cyan-500/20 px-4 font-semibold text-cyan-100 transition hover:bg-cyan-500/30 hover:text-white ${
                  isCompactHeight ? 'h-11 text-[13px]' : 'h-12 text-sm'
                }`}
              >
                View Full Profile
              </Link>
              <button
                type="button"
                onClick={onLike}
                className={`inline-flex shrink-0 items-center justify-center rounded-full border border-fuchsia-300/50 bg-fuchsia-500/24 text-fuchsia-100 shadow-[0_10px_24px_rgba(217,70,239,0.34)] ${
                  isCompactHeight ? 'h-11 w-11' : 'h-12 w-12'
                }`}
                aria-label="Like"
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>
            </div>
          </div>
          </article>
        </div>

        <AnimatePresence>
          {isImageViewerOpen && (
            <motion.div
              className="fixed inset-0 z-[140] flex items-center justify-center bg-black/92 p-2 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeImageViewer}
            >
              <button
                type="button"
                onClick={closeImageViewer}
                className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/40 text-white"
                aria-label="Close full image viewer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center" onClick={(event) => event.stopPropagation()}>
                <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between rounded-2xl border border-white/20 bg-black/35 px-3 py-2 text-white backdrop-blur-md">
                  <div className="text-sm font-semibold">
                    {mobileDisplayName} • {currentPhotoIndex + 1}/{viewerPhotos.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyViewerScale(viewerScale - 0.2)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white"
                      aria-label="Zoom out"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={resetViewerTransform}
                      className="rounded-full border border-white/35 bg-black/35 px-2.5 py-1 text-xs font-semibold text-white"
                    >
                      {Math.round(viewerScale * 100)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyViewerScale(viewerScale + 0.2)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white"
                      aria-label="Zoom in"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={viewerStageRef}
                  className="relative h-[84vh] w-full touch-none overflow-hidden rounded-2xl border border-white/20 bg-black/30 shadow-[0_20px_60px_rgba(2,6,23,0.75)]"
                  onPointerDown={handleViewerPointerDown}
                  onPointerMove={handleViewerPointerMove}
                  onPointerUp={handleViewerPointerUpOrCancel}
                  onPointerCancel={handleViewerPointerUpOrCancel}
                  onWheel={handleViewerWheel}
                >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={`${profileId}-${currentPhotoIndex}-viewer`}
                    src={currentViewerPhoto}
                    alt={profile.name}
                    className="h-full w-full select-none object-contain"
                    style={{
                      transform: `translate3d(${viewerOffset.x}px, ${viewerOffset.y}px, 0) scale(${viewerScale})`,
                      transformOrigin: 'center center',
                    }}
                    initial={{ opacity: 0.4, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.4, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                  />
                </AnimatePresence>

                {viewerPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        prevPhoto();
                      }}
                      className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/35 bg-black/45 p-2 text-white backdrop-blur-sm"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        nextPhoto();
                      }}
                      className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/35 bg-black/45 p-2 text-white backdrop-blur-sm"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                  <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] text-white/85 backdrop-blur-md">
                    Pinch to zoom • Drag to pan • Double tap to reset
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-none border-0 bg-slate-900/78 shadow-none sm:rounded-3xl sm:border sm:border-white/12 sm:shadow-[0_20px_65px_rgba(3,12,28,0.62)] sm:backdrop-blur-sm">
      <div className="relative h-full bg-slate-700">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={`${profileId}-${currentPhotoIndex}-blur`}
            src={cardPhotos[currentPhotoIndex]}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover blur-xl brightness-50"
            initial={{ opacity: 0.45, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.45, scale: 0.985 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            draggable={false}
            loading="eager"
            decoding="async"
          />
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={`${profileId}-${currentPhotoIndex}`}
            src={cardPhotos[currentPhotoIndex]}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover object-center [image-rendering:auto] [backface-visibility:hidden] [transform:translateZ(0)]"
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.45 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            draggable={false}
            loading="eager"
            decoding="async"
          />
        </AnimatePresence>

        <div className="absolute inset-x-0 top-0 z-30 p-3 sm:p-3 swiper-no-swiping">
          <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
            {cardPhotos.map((_, index) => (
              <button
                key={index}
                type="button"
                onPointerDown={stopEvent}
                onMouseDown={stopEvent}
                onTouchStart={stopEvent}
                onClick={(event) => {
                  stopEvent(event);
                  setCurrentPhotoIndex(index);
                }}
                className={`h-1.5 flex-1 rounded-full ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/35'}`}
                aria-label={`Photo ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {cardPhotos.length > 1 && (
          <>
            <button
              type="button"
              onPointerDown={stopEvent}
              onMouseDown={stopEvent}
              onTouchStart={stopEvent}
              onClick={(event) => {
                stopEvent(event);
                prevPhoto();
              }}
              className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2 text-white transition hover:bg-black/60 swiper-no-swiping"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onPointerDown={stopEvent}
              onMouseDown={stopEvent}
              onTouchStart={stopEvent}
              onClick={(event) => {
                stopEvent(event);
                nextPhoto();
              }}
              className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2 text-white transition hover:bg-black/60 swiper-no-swiping"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-24 sm:px-4 sm:pb-5 sm:pt-20">
          <div className="mb-2 inline-flex items-center rounded-full bg-emerald-500/85 px-3 py-1 text-sm font-semibold text-white">
            {distanceBadge}
          </div>
          <h2 className="text-[2.2rem] font-bold leading-tight text-white sm:text-4xl">
            {profile.name}
            {profile.age ? `, ${profile.age}` : ''}
          </h2>
          <p className="mt-1 text-base font-medium text-slate-100">{locationText}</p>

          <p className="mt-2 line-clamp-3 max-w-xl text-sm text-slate-200 sm:text-base">
            {profile.bio?.trim() || 'No bio available yet.'}
          </p>

          <Link
            to={`/profile/${profileId}`}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-cyan-300/50 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30 hover:text-white"
          >
            View Full Profile
          </Link>

          <div className="mt-4 border-t border-white/15 pt-4">
            <FloatingActionButtons onGoBack={onGoBack} onPass={onPass} onLike={onLike} />
          </div>
        </div>
      </div>
    </div>
  );
};
