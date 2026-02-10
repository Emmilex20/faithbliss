/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuthContext } from '../contexts/AuthContext';
import {
  OnboardingHeader,
  OnboardingNavigation,
  OnboardingSuccessModal,
  type OnboardingData,
} from '../components/onboarding/index';

import ImageUploadSlide from '../components/onboarding/ImageUploadSlide';
import ProfileBuilderSlide from '../components/onboarding/ProfileBuilderSlide';
import MatchingPreferencesSlide from '../components/onboarding/MatchingPreferencesSlide';
import PartnerPreferencesSlide from '../components/onboarding/PartnerPreferencesSlide';
import RelationshipGoalsSlide from '../components/onboarding/RelationshipGoalsSlide';

import { uploadPhotosToCloudinary } from '../api/cloudinaryUpload';

// --- TYPE ---
type OnboardingUpdateData = Partial<Omit<OnboardingData, 'photos' | 'customDenomination'>> & {
  profilePhoto1?: string;
  profilePhoto2?: string;
  profilePhoto3?: string;
  profilePhoto4?: string;
};

const getStepValidationError = (step: number, data: OnboardingData): string | null => {
  if (step === 0 && data.photos.length < 2) {
    return 'Please upload at least 2 photos.';
  }

  if (
    step === 1 &&
    (!data.birthday || !data.location || !data.faithJourney || !data.churchAttendance)
  ) {
    return 'Please fill out all required profile information.';
  }

  if (step === 2 && data.relationshipGoals.length === 0) {
    return 'Please select your relationship goal.';
  }

  if (step === 3 && !data.preferredFaithJourney) {
    return 'Please complete your partner preferences.';
  }

  if (
    step === 4 &&
    (
      !data.preferredGender ||
      data.minAge === null ||
      data.minAge === undefined ||
      data.maxAge === null ||
      data.maxAge === undefined ||
      data.maxDistance === null ||
      data.maxDistance === undefined
    )
  ) {
    return 'Please fill out all matching preferences.';
  }

  return null;
};

// --- MAIN COMPONENT ---
const OnboardingPage = () => {
  const navigate = useNavigate();
  const { completeOnboarding, isCompletingOnboarding, user } = useAuthContext() as {
    completeOnboarding: (data: any) => Promise<boolean>;
    isCompletingOnboarding: boolean;
    user: { uid?: string | null; id?: string | null } | null;
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const totalSteps = 5;

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    photos: [],
    birthday: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
    faithJourney: null as any,
    churchAttendance: null as any,
    denomination: '',
    customDenomination: '',
    occupation: '',
    bio: '',
    personality: [],
    hobbies: [],
    values: [],
    favoriteVerse: '',
    relationshipGoals: [],
    preferredGender: null,
    minAge: 18,
    maxAge: 35,
    maxDistance: 50,
    phoneNumber: '',
    countryCode: '+1',
    education: '',
    baptismStatus: '',
    spiritualGifts: [],
    interests: [],
    lifestyle: '',
    preferredFaithJourney: null,
    preferredChurchAttendance: null,
    preferredRelationshipGoals: null,
    preferredDenomination: null,
  });

  useEffect(() => {
    if (!validationError) return;
    const stepError = getStepValidationError(currentStep, onboardingData);
    if (!stepError) {
      setValidationError(null);
    }
  }, [currentStep, onboardingData, validationError]);

  // --- STEP CONTROLS ---
  const nextStep = async () => {
    setValidationError(null);

    // --- Validation per step ---
    const stepError = getStepValidationError(currentStep, onboardingData);
    if (stepError) {
      return setValidationError(stepError);
    }

    // --- Continue or Submit ---
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // --- Final Submission ---
    try {
      const userId = user?.uid || user?.id;
      if (!userId) throw new Error('User not authenticated.');

      // --- UPLOAD PHOTOS TO CLOUDINARY ---
      const photoUrls = await uploadPhotosToCloudinary(onboardingData.photos as File[]);

      // Merge photo URLs with other data
      const { photos: _, customDenomination: __, ...baseData } = onboardingData;
      const rawData = {
        ...baseData,
        // Keep legacy keys and persist canonical profile keys used across the app.
        profession: onboardingData.occupation,
        fieldOfStudy: onboardingData.education,
      } as Record<string, any>;

      // Assign Cloudinary URLs to profilePhoto1,2,3,4
      photoUrls.forEach((url, index) => {
        (rawData as any)[`profilePhoto${index + 1}`] = url;
      });

      // Remove null/undefined/empty strings
      const dataToSubmit: OnboardingUpdateData = {};
      Object.entries(rawData).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          !(typeof value === 'string' && value.trim() === '')
        ) {
          (dataToSubmit as any)[key] = value;
        }
      });

      const success = await completeOnboarding({
        ...dataToSubmit,
        birthday: dataToSubmit.birthday ? new Date(dataToSubmit.birthday) : undefined,
      });

      if (success) {
        setShowSuccessModal(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        throw new Error('Onboarding failed. Please try again.');
      }
    } catch (err: any) {
      setValidationError(err.message || 'An error occurred.');
      console.error('❌ Onboarding error:', err);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (showSuccessModal) return <OnboardingSuccessModal />;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <OnboardingHeader
        currentSlide={currentStep}
        totalSlides={totalSteps}
        onPrevious={prevStep}
        canGoBack={currentStep > 0}
      />

      <main className="container mx-auto px-4 sm:px-6 py-8 pb-24 max-w-2xl">
        <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
          <ImageUploadSlide
            isVisible={currentStep === 0}
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
          />
          <ProfileBuilderSlide
            isVisible={currentStep === 1}
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
          />
          <RelationshipGoalsSlide
            isVisible={currentStep === 2}
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
          />
          <PartnerPreferencesSlide
            isVisible={currentStep === 3}
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
          />
          <MatchingPreferencesSlide
            isVisible={currentStep === 4}
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
          />
        </div>
      </main>

      <OnboardingNavigation
        currentSlide={currentStep}
        totalSlides={totalSteps}
        canGoBack={currentStep > 0}
        submitting={isCompletingOnboarding}
        validationError={validationError}
        onPrevious={prevStep}
        onNext={nextStep}
      />
    </div>
  );
};

export default function OnboardingRouteWrapper() {
  return (
    <ProtectedRoute requireOnboarding={true}>
      <OnboardingPage />
    </ProtectedRoute>
  );
}
