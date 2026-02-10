import { HingeStyleProfileCard } from './HingeStyleProfileCard';
import { NoProfilesState } from './NoProfilesState';
import type { User } from '@/services/api';
import { useEffect, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';

interface ProfileDisplayProps {
  currentProfile: User | null | undefined;
  onStartOver: () => void;
  onGoBack: () => void;
  onLike: () => void;
  onPass: () => void;
  swipeDirection?: 'left' | 'right';
  noProfilesTitle?: string;
  noProfilesDescription?: string;
  noProfilesActionLabel?: string;
  onNoProfilesAction?: () => void;
}

export const ProfileDisplay = ({
  currentProfile,
  onStartOver,
  onGoBack,
  onLike,
  onPass,
  noProfilesTitle,
  noProfilesDescription,
  noProfilesActionLabel,
  onNoProfilesAction,
}: ProfileDisplayProps) => {
  const swipeLockRef = useRef(false);
  const swiperRef = useRef<SwiperInstance | null>(null);

  if (!currentProfile || (!currentProfile.id && !(currentProfile as any)._id)) {
    if (currentProfile) {
      console.error("ProfileDisplay: Profile object exists but is missing 'id' or '_id'. Skipping card render.");
    }

    return (
      <NoProfilesState
        title={noProfilesTitle}
        description={noProfilesDescription}
        actionLabel={noProfilesActionLabel}
        onAction={onNoProfilesAction}
        onStartOver={onStartOver}
      />
    );
  }

  const profileKey = String(currentProfile.id || (currentProfile as any)._id);

  const resetToCenter = () => {
    requestAnimationFrame(() => {
      swiperRef.current?.slideTo(1, 0, false);
    });
  };

  const runSwipeAction = async (action: () => void | Promise<void>) => {
    if (swipeLockRef.current) return;
    swipeLockRef.current = true;
    try {
      await Promise.resolve(action());
    } finally {
      swipeLockRef.current = false;
      resetToCenter();
    }
  };

  const handleSlideChange = (swiper: SwiperInstance) => {
    if (swiper.activeIndex === 2) {
      runSwipeAction(onPass);
      return;
    }
    if (swiper.activeIndex === 0) {
      runSwipeAction(onLike);
    }
  };

  useEffect(() => {
    resetToCenter();
  }, [profileKey]);

  const edgeSlide = useMemo(
    () => (
      <div className="h-full w-full bg-transparent" />
    ),
    []
  );

  return (
    <div className="h-full w-full">
      <Swiper
        key={profileKey}
        onSwiper={(instance) => {
          swiperRef.current = instance;
          resetToCenter();
        }}
        onSlideChangeTransitionEnd={handleSlideChange}
        slidesPerView={1}
        centeredSlides={false}
        initialSlide={1}
        resistanceRatio={0.85}
        speed={250}
        className="h-full w-full"
      >
        <SwiperSlide className="h-full">{edgeSlide}</SwiperSlide>
        <SwiperSlide className="h-full">
          <div className="mx-auto h-full w-full max-w-[560px]">
            <HingeStyleProfileCard profile={currentProfile} onGoBack={onGoBack} onLike={onLike} onPass={onPass} />
          </div>
        </SwiperSlide>
        <SwiperSlide className="h-full">{edgeSlide}</SwiperSlide>
      </Swiper>
    </div>
  );
};
