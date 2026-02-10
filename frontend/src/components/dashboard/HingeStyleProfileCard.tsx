import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
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

  const photos = useMemo(() => {
    const list = [profile.profilePhoto1, profile.profilePhoto2, profile.profilePhoto3].filter(Boolean) as string[];
    return list.length > 0 ? list : ['/default-avatar.png'];
  }, [profile.profilePhoto1, profile.profilePhoto2, profile.profilePhoto3]);

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  const profileId = profile.id || (profile as any)._id || 'missing';

  return (
    <div className="h-full w-full overflow-hidden rounded-3xl border border-white/12 bg-slate-900/78 shadow-[0_20px_65px_rgba(3,12,28,0.62)] backdrop-blur-sm">
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/80 scrollbar-track-slate-800/80">
        <div className="relative h-[56vh] min-h-[430px] bg-slate-700">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={`${profileId}-${currentPhotoIndex}`}
              src={photos[currentPhotoIndex]}
              alt={profile.name}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0.45, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.45, scale: 0.985 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            />
          </AnimatePresence>

          <div className="absolute inset-x-0 top-0 p-3">
            <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`h-1.5 flex-1 rounded-full ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/35'}`}
                  aria-label={`Photo ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2 text-white transition hover:bg-black/60"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2 text-white transition hover:bg-black/60"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/88 via-black/48 to-transparent px-5 pb-6 pt-14">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {profile.name}
              {profile.age ? `, ${profile.age}` : ''}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-200 sm:text-base">
              <MapPin className="h-4 w-4" />
              {profile.location || 'Location not specified'}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 bg-slate-950/75 px-4 py-4">
          <FloatingActionButtons onGoBack={onGoBack} onPass={onPass} onLike={onLike} />
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-pink-300">Quick Intro</h3>
            <p className="text-slate-200">{profile.bio?.trim() || 'No bio available yet.'}</p>
            <Link to={`/profile/${profileId}`} className="mt-3 inline-block text-sm font-semibold text-cyan-300 hover:text-cyan-200">
              View full profile
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-slate-400">Denomination</p>
              <p className="mt-1 text-sm font-medium text-white">{profile.denomination || 'Not specified'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-slate-400">Faith Journey</p>
              <p className="mt-1 text-sm font-medium text-white">{profile.faithJourney || 'Not specified'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-slate-400">Profession</p>
              <p className="mt-1 text-sm font-medium text-white">{profile.profession || 'Not specified'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-slate-400">Field of Study</p>
              <p className="mt-1 text-sm font-medium text-white">{profile.fieldOfStudy || 'Not specified'}</p>
            </div>
          </div>

          {Array.isArray(profile.hobbies) && profile.hobbies.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-pink-300">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby, index) => (
                  <span key={`${hobby}-${index}`} className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100">
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
