import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import type { User } from '@/services/api';
import { FloatingActionButtons } from './FloatingActionButtons';

interface HingeStyleProfileCardProps {
  profile: User;
  onGoBack: () => void;
  onPass: () => void;
  onLike: () => void;
}

export const HingeStyleProfileCard = ({ profile, onGoBack, onPass, onLike }: HingeStyleProfileCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const stopEvent = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const photos = useMemo(() => {
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

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  const profileId = profile.id || (profile as any)._id || 'missing';
  const distance = typeof (profile as any).distance === 'number' ? Math.round((profile as any).distance) : null;
  const locationText = profile.location?.trim() || 'Location not set';

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [profileId]);

  useEffect(() => {
    if (currentPhotoIndex > photos.length - 1) {
      setCurrentPhotoIndex(0);
    }
  }, [currentPhotoIndex, photos.length]);

  return (
    <div className="h-full w-full overflow-hidden rounded-none border-0 bg-slate-900/78 shadow-none sm:rounded-3xl sm:border sm:border-white/12 sm:shadow-[0_20px_65px_rgba(3,12,28,0.62)] sm:backdrop-blur-sm">
      <div className="relative h-full bg-slate-700">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={`${profileId}-${currentPhotoIndex}-blur`}
            src={photos[currentPhotoIndex]}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover blur-xl brightness-50"
            initial={{ opacity: 0.45, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.45, scale: 0.985 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          />
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={`${profileId}-${currentPhotoIndex}`}
            src={photos[currentPhotoIndex]}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover lg:object-contain"
            initial={{ opacity: 0.45, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.45, scale: 0.985 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          />
        </AnimatePresence>

        <div className="absolute inset-x-0 top-0 z-30 p-3 sm:p-3 swiper-no-swiping">
          <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
            {photos.map((_, index) => (
              <button
                key={index}
                type="button"
                onPointerDown={stopEvent}
                onMouseDown={stopEvent}
                onTouchStart={stopEvent}
                onClick={(e) => {
                  stopEvent(e);
                  setCurrentPhotoIndex(index);
                }}
                className={`h-1.5 flex-1 rounded-full ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/35'}`}
                aria-label={`Photo ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onPointerDown={stopEvent}
              onMouseDown={stopEvent}
              onTouchStart={stopEvent}
              onClick={(e) => {
                stopEvent(e);
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
              onClick={(e) => {
                stopEvent(e);
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
            Nearby
          </div>
          <h2 className="text-[2.2rem] font-bold leading-tight text-white sm:text-4xl">
            {profile.name}
            {profile.age ? `, ${profile.age}` : ''}
          </h2>
          <p className="mt-1 text-base font-medium text-slate-100">{locationText}</p>
          {distance !== null && <p className="mt-1 text-base text-slate-200">{distance} km away</p>}

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
