/* eslint-disable no-irregular-whitespace */
// src/components/onboarding/OnboardingNavigation.tsx (Vite/React)

import React from 'react'; // Explicit import of React for standard JSX environments
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface OnboardingNavigationProps {
  currentSlide: number;
  totalSlides: number;
  canGoBack: boolean;
  submitting: boolean;
  validationError: string | null;
  onPrevious: () => void;
  onNext: () => void;
}

export const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentSlide,
  totalSlides,
  canGoBack,
  submitting,
  validationError,
  onPrevious,
  onNext
}) => {
  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4 border-t border-gray-700">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onPrevious}
            className={`px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2 ${
              !canGoBack ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!canGoBack}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={onNext}
            // Add validationError to disabled condition to prevent proceeding when invalid
            disabled={submitting || !!validationError} 
            className="px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                {isLastSlide ? 'Finish' : 'Next'}
                {isLastSlide ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
        {validationError && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center">
              {validationError}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};