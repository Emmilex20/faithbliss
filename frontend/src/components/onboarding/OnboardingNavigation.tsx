import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface OnboardingNavigationProps {
  currentSlide: number;
  totalSlides: number;
  canGoBack: boolean;
  canProceed: boolean;
  submitting: boolean;
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
  validationError,
  onPrevious,
  onNext,
}) => {
  const isLastSlide = currentSlide === totalSlides - 1;
  const isNextDisabled = submitting || !canProceed;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-900 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrevious}
            className={`flex items-center gap-2 rounded-full bg-gray-700 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-gray-600 ${
              !canGoBack ? 'cursor-not-allowed opacity-50' : ''
            }`}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className="flex items-center justify-center gap-2 rounded-full bg-pink-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                {isLastSlide ? 'Finish' : 'Next'}
                {isLastSlide ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </>
            )}
          </button>
        </div>

        {validationError && (
          <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-center text-sm text-red-400">{validationError}</p>
          </div>
        )}
      </div>
    </div>
  );
};
