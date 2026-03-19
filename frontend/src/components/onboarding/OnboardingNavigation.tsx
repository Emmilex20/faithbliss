import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface OnboardingNavigationProps {
  currentSlide: number;
  totalSlides: number;
  canGoBack: boolean;
  canProceed: boolean;
  submitting: boolean;
  submittingLabel?: string;
  validationError: string | null;
  onPrevious: () => void;
  onNext: () => void;
}

export const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentSlide,
  totalSlides,
  canGoBack,
  canProceed,
  submitting,
  submittingLabel = 'Submitting...',
  validationError,
  onPrevious,
  onNext,
}) => {
  const isLastSlide = currentSlide === totalSlides - 1;
  const isNextDisabled = submitting;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-900 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrevious}
            className={`flex items-center gap-2 rounded-full bg-gray-700 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-gray-600 ${
              !canGoBack || submitting ? 'cursor-not-allowed opacity-50' : ''
            }`}
            disabled={!canGoBack || submitting}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
              canProceed ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-700/90 hover:bg-pink-700'
            }`}
          >
            {submitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                {submittingLabel}
              </>
            ) : (
              <>
                {isLastSlide ? 'Finish' : 'Next'}
                {isLastSlide ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </>
            )}
          </button>
        </div>

        {!canProceed && !validationError && (
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-center text-sm text-amber-300">Complete all required fields on this step to continue.</p>
          </div>
        )}

        {validationError && (
          <div className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 shadow-[0_10px_30px_rgba(127,29,29,0.18)]">
            <p className="text-center text-sm font-medium text-red-300">{validationError}</p>
          </div>
        )}
      </div>
    </div>
  );
};
