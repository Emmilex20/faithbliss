import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Minus, MoreHorizontal, Plus, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
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

type TouchPoint = {
  clientX: number;
  clientY: number;
};

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
  const [viewerPhotoIndex, setViewerPhotoIndex] = useState<number | null>(null);
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
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchPinchDistanceRef = useRef<number | null>(null);
  const touchPinchScaleRef = useRef(1);
  const touchPanStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const touchSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
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
  const allPhotoIndexes = useMemo(() => rawPhotos.map((_, index) => index), [rawPhotos]);
  const mobilePrimaryPhotoIndexes = useMemo(
    () => (allPhotoIndexes.length > 1 ? allPhotoIndexes.filter((index) => index !== 1) : allPhotoIndexes),
    [allPhotoIndexes]
  );

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % cardPhotos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + cardPhotos.length) % cardPhotos.length);
  const currentViewerPhotoIndex = viewerPhotoIndex ?? currentPhotoIndex;
  const currentViewerPhoto = viewerPhotos[currentViewerPhotoIndex] || viewerPhotos[0];
  const viewerCanNavigate = viewerPhotoIndex === null && viewerPhotos.length > 1;

  const clampViewerOffset = useCallback((offset: { x: number; y: number }, scale: number) => {
    const stage = viewerStageRef.current;
    if (!stage || scale <= 1) return { x: 0, y: 0 };

    const maxX = (stage.clientWidth * (scale - 1)) / 2;
    const maxY = (stage.clientHeight * (scale - 1)) / 2;
    return {
      x: clamp(offset.x, -maxX, maxX),
      y: clamp(offset.y, -maxY, maxY),
    };
  }, []);

  const applyViewerScale = useCallback((nextScale: number) => {
    const clampedScale = clamp(nextScale, 1, 4);
    setViewerScale(clampedScale);
    setViewerOffset((prev) => clampViewerOffset(prev, clampedScale));
  }, [clampViewerOffset]);

  const resetViewerTransform = useCallback(() => {
    setViewerScale(1);
    setViewerOffset({ x: 0, y: 0 });
  }, []);

  const handleViewerPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointersRef.current.size === 1) {
      swipeStartRef.current = { x: event.clientX, y: event.clientY };
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
      swipeStartRef.current = null;
    }
  };

  const handleViewerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
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
    if (event.pointerType === 'touch') return;
    const pointerStart = swipeStartRef.current;
    const pointerEnd = activePointersRef.current.get(event.pointerId);
    activePointersRef.current.delete(event.pointerId);

    if (
      pointerStart &&
      pointerEnd &&
      activePointersRef.current.size === 0 &&
      viewerScale <= 1.02 &&
      viewerCanNavigate
    ) {
      const dx = pointerEnd.x - pointerStart.x;
      const dy = pointerEnd.y - pointerStart.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Natural gallery behavior: swipe left => next, swipe right => previous.
      if (absDx > 42 && absDx > absDy * 1.35) {
        if (dx < 0) {
          nextPhoto();
        } else {
          prevPhoto();
        }
      }
    }

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

    if (activePointersRef.current.size === 0) {
      swipeStartRef.current = null;
    }
  };

  const handleViewerWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.cancelable) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.18 : 0.18;
    applyViewerScale(viewerScale + delta);
  };

  const touchDistance = (a: TouchPoint, b: TouchPoint) => {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.hypot(dx, dy);
  };

  const handleViewerTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      touchSwipeStartRef.current = { x: touch.clientX, y: touch.clientY };

      const now = Date.now();
      if (now - lastTapAtRef.current < 300) {
        resetViewerTransform();
      }
      lastTapAtRef.current = now;

      if (viewerScale > 1) {
        touchPanStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          offsetX: viewerOffset.x,
          offsetY: viewerOffset.y,
        };
      } else {
        touchPanStartRef.current = null;
      }
    }

    if (event.touches.length === 2) {
      touchPinchDistanceRef.current = touchDistance(event.touches[0], event.touches[1]);
      touchPinchScaleRef.current = viewerScale;
      touchPanStartRef.current = null;
      touchSwipeStartRef.current = null;
    }
  };

  const handleViewerTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2 && touchPinchDistanceRef.current) {
      const nextDistance = touchDistance(event.touches[0], event.touches[1]);
      const nextScale = touchPinchScaleRef.current * (nextDistance / touchPinchDistanceRef.current);
      applyViewerScale(nextScale);
      return;
    }

    if (event.touches.length === 1 && touchPanStartRef.current && viewerScale > 1) {
      const touch = event.touches[0];
      const dx = touch.clientX - touchPanStartRef.current.x;
      const dy = touch.clientY - touchPanStartRef.current.y;
      const nextOffset = clampViewerOffset(
        {
          x: touchPanStartRef.current.offsetX + dx,
          y: touchPanStartRef.current.offsetY + dy,
        },
        viewerScale,
      );
      setViewerOffset(nextOffset);
    }
  };

  const handleViewerTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (
      event.touches.length === 0 &&
      touchSwipeStartRef.current &&
      event.changedTouches.length > 0 &&
      viewerScale <= 1.02 &&
      viewerCanNavigate
    ) {
      const endTouch = event.changedTouches[0];
      const dx = endTouch.clientX - touchSwipeStartRef.current.x;
      const dy = endTouch.clientY - touchSwipeStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > 42 && absDx > absDy * 1.35) {
        if (dx < 0) {
          nextPhoto();
        } else {
          prevPhoto();
        }
      }
    }

    if (event.touches.length < 2) {
      touchPinchDistanceRef.current = null;
    }

    if (event.touches.length === 1 && viewerScale > 1) {
      const touch = event.touches[0];
      touchPanStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        offsetX: viewerOffset.x,
        offsetY: viewerOffset.y,
      };
    } else if (event.touches.length === 0) {
      touchPanStartRef.current = null;
      touchSwipeStartRef.current = null;
    }
  };

  const openImageViewer = (photoIndex: number, event?: React.SyntheticEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setViewerPhotoIndex(photoIndex);
    resetViewerTransform();
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = useCallback(() => {
    setIsImageViewerOpen(false);
    setViewerPhotoIndex(null);
    resetViewerTransform();
  }, [resetViewerTransform]);

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
  }, [applyViewerScale, closeImageViewer, isImageViewerOpen, resetViewerTransform, viewerScale]);

  useEffect(() => {
    if (isImageViewerOpen) {
      resetViewerTransform();
    }
  }, [currentViewerPhotoIndex, isImageViewerOpen, resetViewerTransform]);
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

  useEffect(() => {
    if (!isMobileView) return;
    if (currentPhotoIndex !== 1) return;
    if (mobilePrimaryPhotoIndexes.length === 0) return;
    setCurrentPhotoIndex(mobilePrimaryPhotoIndexes[0]);
  }, [currentPhotoIndex, isMobileView, mobilePrimaryPhotoIndexes]);

  if (isMobileView) {
    const mobileCoverPosition = currentPhotoAspectRatio < 0.95 ? '50% 24%' : '50% 35%';
    const aboutMeBody = profile.bio?.trim() || 'Still filling this out.';
    const promptQuestion = profile.personalPromptQuestion?.trim() || '';
    const promptAnswer = profile.personalPromptAnswer?.trim() || '';
    const secondaryMobilePhoto = cardPhotos[1] ?? null;
    const mobileCurrentCarouselIndex = Math.max(0, mobilePrimaryPhotoIndexes.indexOf(currentPhotoIndex));
    const currentMobilePhotoIndex = mobilePrimaryPhotoIndexes[mobileCurrentCarouselIndex] ?? 0;
    const currentMobilePhoto = cardPhotos[currentMobilePhotoIndex] ?? cardPhotos[0];
    const showMobileCarouselControls = mobilePrimaryPhotoIndexes.length > 1;
    const mobileSectionLabelClass = 'pr-4 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-slate-500';
    const mobileBodyTextClass = isCompactHeight
      ? 'mt-2 text-[1.4rem] font-semibold leading-[1.12] tracking-[-0.03em] text-slate-950'
      : 'mt-3 text-[1.7rem] font-semibold leading-[1.1] tracking-[-0.035em] text-slate-950';
    const mobilePromptTextClass = isCompactHeight
      ? 'mt-2 text-[1.28rem] font-serif font-semibold leading-[1.16] tracking-[-0.02em] text-slate-950'
      : 'mt-3 text-[1.52rem] font-serif font-semibold leading-[1.14] tracking-[-0.025em] text-slate-950';
    const goToNextMobilePhoto = () => {
      if (mobilePrimaryPhotoIndexes.length <= 1) return;
      const nextIndex = (mobileCurrentCarouselIndex + 1) % mobilePrimaryPhotoIndexes.length;
      setCurrentPhotoIndex(mobilePrimaryPhotoIndexes[nextIndex]);
    };
    const goToPreviousMobilePhoto = () => {
      if (mobilePrimaryPhotoIndexes.length <= 1) return;
      const nextIndex = (mobileCurrentCarouselIndex - 1 + mobilePrimaryPhotoIndexes.length) % mobilePrimaryPhotoIndexes.length;
      setCurrentPhotoIndex(mobilePrimaryPhotoIndexes[nextIndex]);
    };

    return (
      <>
        <div className="flex h-full w-full flex-col bg-white px-3 pb-3 pt-3 text-slate-900">
          <div className={`flex items-center gap-2 overflow-x-auto ${isCompactHeight ? 'mb-2 pb-0.5' : 'mb-3 pb-1'}`}>
            <button
              type="button"
              onClick={() => onOpenFilterSection?.('distance')}
              className={`inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-100 text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:text-slate-950 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)] ${
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
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-900'
                } ${isCompactHeight ? 'px-3.5 py-1.5' : 'px-4 py-2'}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <article className="flex min-h-0 flex-1 flex-col bg-transparent">
            <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4 pt-2">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className={`${isCompactHeight ? 'text-[2.08rem]' : 'text-[2.3rem]'} min-w-0 flex-1 truncate font-black leading-[0.94] tracking-[-0.05em] text-slate-950`}>
                  {mobileDisplayName}
                  {profile.age ? `, ${profile.age}` : ''}
                </h2>
                <div className="flex shrink-0 items-center gap-2 pt-1 text-slate-400">
                  <button
                    type="button"
                    onClick={onGoBack}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:text-slate-900 hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)]"
                    aria-label="Go back"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${profileId}`)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:text-slate-900 hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)]"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1.5">
                {mobilePrimaryPhotoIndexes.map((photoIndex, index) => (
                  <button
                    key={photoIndex}
                    type="button"
                    onPointerDown={stopEvent}
                    onMouseDown={stopEvent}
                    onTouchStart={stopEvent}
                    onClick={(event) => {
                      stopEvent(event);
                      setCurrentPhotoIndex(photoIndex);
                    }}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${index === mobileCurrentCarouselIndex ? 'bg-slate-900' : 'bg-slate-300'}`}
                    aria-label={`Photo ${index + 1}`}
                  />
                ))}
              </div>

              <div
                className={`relative w-full cursor-zoom-in overflow-hidden rounded-[26px] bg-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.08)] ${isCompactHeight ? 'aspect-[4/5] min-h-[352px]' : 'aspect-[4/5] min-h-[420px]'}`}
                onClick={() => openImageViewer(currentMobilePhotoIndex)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    openImageViewer(currentMobilePhotoIndex);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Open full image"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={`${profileId}-${currentMobilePhotoIndex}-mobile`}
                    src={currentMobilePhoto}
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

                {showMobileCarouselControls && (
                  <>
                    <button
                      type="button"
                      onPointerDown={stopEvent}
                      onMouseDown={stopEvent}
                      onTouchStart={stopEvent}
                      onClick={(event) => {
                        stopEvent(event);
                        goToPreviousMobilePhoto();
                      }}
                      className="absolute inset-y-0 left-0 z-20 flex w-[18%] items-center justify-start pl-2"
                      aria-label="Previous photo"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-black/22 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] backdrop-blur-md">
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
                        goToNextMobilePhoto();
                      }}
                      className="absolute inset-y-0 right-0 z-20 flex w-[18%] items-center justify-end pr-2"
                      aria-label="Next photo"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-black/22 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] backdrop-blur-md">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onPointerDown={stopEvent}
                  onMouseDown={stopEvent}
                  onTouchStart={stopEvent}
                  onClick={(event) => {
                    stopEvent(event);
                    onLike();
                  }}
                  className="absolute bottom-4 right-4 z-20 inline-flex h-[3.9rem] w-[3.9rem] items-center justify-center rounded-full border border-black/5 bg-white text-slate-950 shadow-[0_16px_30px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(15,23,42,0.18)]"
                  aria-label="Like"
                >
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 shadow-[0_10px_18px_rgba(236,72,153,0.35)]">
                    <span className="absolute inset-[1px] rounded-[1rem] bg-gradient-to-br from-white/18 to-transparent" />
                    <Heart className="relative h-5 w-5 fill-white text-white stroke-[2.4]" />
                  </span>
                </button>
              </div>

              <div className="relative mt-4 rounded-[26px] bg-slate-100 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <p className={mobileSectionLabelClass}>About me</p>
                <p className={`${mobileBodyTextClass} pr-3`}>
                  {aboutMeBody}
                </p>
              </div>

              {promptQuestion || promptAnswer ? (
                <div className="relative mt-4 rounded-[26px] bg-slate-100 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <p className={mobileSectionLabelClass}>
                    {promptQuestion || 'Personal prompt'}
                  </p>
                  <p className={`${mobilePromptTextClass} pr-3`}>
                    {promptAnswer || 'No response added yet.'}
                  </p>
                </div>
              ) : null}

              {secondaryMobilePhoto ? (
                <button
                  type="button"
                  onClick={() => {
                    openImageViewer(1);
                  }}
                  className="mt-4 block w-full overflow-hidden rounded-[26px] bg-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                  aria-label={`Open ${mobileDisplayName}'s second photo`}
                >
                  <img
                    src={secondaryMobilePhoto}
                    alt={`${mobileDisplayName} photo 2`}
                    className={`${isCompactHeight ? 'h-[16.5rem]' : 'h-[19rem]'} w-full object-cover`}
                    style={{ objectPosition: mobileCoverPosition }}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </button>
              ) : null}

              <Link
                to={`/profile/${profileId}`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)]"
              >
                View Full Profile
              </Link>

              <div className="pointer-events-none sticky bottom-3 z-30 mt-3 flex justify-start">
                <button
                  type="button"
                  onPointerDown={stopEvent}
                  onMouseDown={stopEvent}
                  onTouchStart={stopEvent}
                  onClick={(event) => {
                    stopEvent(event);
                    onPass();
                  }}
                  className="pointer-events-auto inline-flex h-[3.9rem] w-[3.9rem] items-center justify-center rounded-full border border-black/5 bg-white text-slate-950 shadow-[0_16px_30px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(15,23,42,0.18)]"
                  aria-label="Pass"
                >
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 shadow-[0_10px_18px_rgba(15,23,42,0.26)]">
                    <span className="absolute inset-[1px] rounded-[1rem] border border-white/10" />
                    <X className="relative h-5 w-5 text-white stroke-[2.8]" />
                  </span>
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
              <div className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center" onClick={(event) => event.stopPropagation()}>
                <div className="absolute left-2 right-2 top-2 z-20 flex items-center gap-2 rounded-2xl border border-white/20 bg-black/35 px-2.5 py-2 text-white backdrop-blur-md sm:left-3 sm:right-3 sm:top-3 sm:px-3">
                  <button
                    type="button"
                    onClick={closeImageViewer}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white"
                    aria-label="Close full image viewer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1 truncate text-center text-xs font-semibold sm:text-sm">
                    {mobileDisplayName}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
                  onTouchStart={handleViewerTouchStart}
                  onTouchMove={handleViewerTouchMove}
                  onTouchEnd={handleViewerTouchEnd}
                  onTouchCancel={handleViewerTouchEnd}
                >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={`${profileId}-${currentViewerPhotoIndex}-viewer`}
                    src={currentViewerPhoto}
                    alt={profile.name}
                    className="h-full w-full select-none object-contain"
                    style={{
                      transform: `translate3d(${viewerOffset.x}px, ${viewerOffset.y}px, 0) scale(${viewerScale})`,
                      transformOrigin: 'center center',
                      willChange: 'transform',
                    }}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.4 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                  />
                </AnimatePresence>

                {viewerCanNavigate && (
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
                    Pinch to zoom - Drag to pan - Double tap to reset
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
              className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-2xl border border-white/30 bg-black/28 p-2.5 text-white shadow-[0_12px_24px_rgba(2,6,23,0.22)] backdrop-blur-md transition-all duration-200 hover:bg-black/45 swiper-no-swiping"
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
              className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-2xl border border-white/30 bg-black/28 p-2.5 text-white shadow-[0_12px_24px_rgba(2,6,23,0.22)] backdrop-blur-md transition-all duration-200 hover:bg-black/45 swiper-no-swiping"
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
