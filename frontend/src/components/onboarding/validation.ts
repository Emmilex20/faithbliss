import { MIN_PROFILE_FITS } from '@/constants/profileFitOptions';
import type { OnboardingData } from './types';

const phoneRegex = /^[0-9]{7,15}$/;

export const validateStep1 = (data: OnboardingData): boolean => {
  if (!data.birthday) return false;

  const birthDate = new Date(data.birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  if (age < 18) return false;

  if (!data.phoneNumber || !phoneRegex.test(data.phoneNumber.replace(/\D/g, ''))) {
    return false;
  }

  return Boolean(
    data.faithJourney &&
      data.churchAttendance &&
      data.relationshipGoals &&
      data.relationshipGoals.length > 0 &&
      data.location &&
      data.denomination &&
      data.countryCode &&
      data.education &&
      data.baptismStatus &&
      Array.isArray(data.profileFits) &&
      data.profileFits.length >= MIN_PROFILE_FITS
  );
};

export const validateStep2 = (data: OnboardingData): boolean =>
  Boolean(
    (data.preferredFaithJourney?.length || 0) > 0 &&
      (data.preferredChurchAttendance?.length || 0) > 0 &&
      (data.preferredRelationshipGoals?.length || 0) > 0 &&
      data.preferredDenomination &&
      data.preferredGender &&
      (data.minAge || 0) >= 18 &&
      (data.maxAge || 0) > (data.minAge || 0) &&
      (data.maxDistance || 0) > 0
  );

export const validateOnboardingStep = (step: number, data: OnboardingData): boolean => {
  if (step === 0) return validateStep1(data);
  if (step === 1) return validateStep2(data);
  return false;
};
