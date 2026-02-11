import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronDown } from 'lucide-react';
import type { OnboardingData } from './types';

interface LocationPermissionSlideProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  isVisible: boolean;
}

const LocationPermissionSlide: React.FC<LocationPermissionSlideProps> = ({
  onboardingData,
  setOnboardingData,
  isVisible,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHowUsed, setShowHowUsed] = useState(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);

  if (!isVisible) return null;

  const requestLocation = async () => {
    setError(null);
    setIsRequesting(true);
    setShowComingSoonPopup(true);
    setTimeout(() => {
      setShowComingSoonPopup(false);
      setIsRequesting(false);
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 text-center"
    >
      {showComingSoonPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/95 p-5 text-center shadow-2xl">
            <p className="text-xl font-bold text-white">Coming Soon</p>
            <p className="mt-2 text-sm text-slate-300">
              Auto location detection is coming soon. Please enter your location manually for now.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-4xl font-bold leading-tight text-white">So, are you from around here?</h2>
        <p className="mx-auto max-w-xl text-lg text-slate-300">
          Set your location to see who&apos;s in your area or beyond. You won&apos;t be able to match with people otherwise.
        </p>
      </div>

      <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full bg-white/10">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/40 bg-white/10">
          <MapPin className="h-14 w-14 text-slate-300" />
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-3">
        <button
          type="button"
          onClick={requestLocation}
          disabled={isRequesting}
          className="w-full rounded-full bg-white py-4 text-2xl font-bold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRequesting ? 'Allowing...' : 'Allow'}
        </button>

        <button
          type="button"
          onClick={() => setShowHowUsed((prev) => !prev)}
          className="flex w-full items-center justify-center gap-2 py-2 text-lg font-semibold text-white"
        >
          How is my location used?
          <ChevronDown className={`h-5 w-5 transition ${showHowUsed ? 'rotate-180' : ''}`} />
        </button>

        {showHowUsed && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-left text-sm text-slate-300">
            We use your location to show nearby matches, filter by distance, and improve discovery quality. You can
            update this later in profile settings.
          </div>
        )}
      </div>

      <div className="mx-auto max-w-xl text-left">
        <label className="mb-2 block text-sm font-semibold text-gray-300">Or enter location manually</label>
        <input
          type="text"
          value={onboardingData.location || ''}
          onChange={(e) => setOnboardingData((prev) => ({ ...prev, location: e.target.value }))}
          placeholder="City, State / Country"
          className="w-full rounded-xl border border-white/15 bg-slate-900/50 p-4 text-white placeholder-slate-400 focus:border-pink-400 focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-amber-300">{error}</p>}
        {onboardingData.location && (
          <p className="mt-2 text-sm text-emerald-300">Location set: {onboardingData.location}</p>
        )}
      </div>
    </motion.div>
  );
};

export default LocationPermissionSlide;
