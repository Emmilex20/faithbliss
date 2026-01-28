/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
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

  // --- STEP CONTROLS ---
  const nextStep = async () => {
    setValidationError(null);

    // --- Validation per step ---
    if (currentStep === 0 && onboardingData.photos.length < 2) {
      return setValidationError('Please upload at least 2 photos.');
    }
    if (
      currentStep === 1 &&
      (!onboardingData.birthday ||
        !onboardingData.location ||
        !onboardingData.faithJourney ||
        !onboardingData.churchAttendance)
    ) {
      return setValidationError('Please fill out all required profile information.');
    }
    if (currentStep === 2 && onboardingData.relationshipGoals.length === 0) {
      return setValidationError('Please select your relationship goal.');
    }
    if (currentStep === 3 && !onboardingData.preferredFaithJourney) {
      return setValidationError('Please complete your partner preferences.');
    }
    if (
      currentStep === 4 &&
      (!onboardingData.preferredGender ||
        !onboardingData.minAge ||
        !onboardingData.maxAge ||
        !onboardingData.maxDistance)
    ) {
      return setValidationError('Please fill out all matching preferences.');
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
      const rawData = { ...baseData };

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
