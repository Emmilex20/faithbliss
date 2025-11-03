// src/utils/validation.ts (Vite/React)

/* eslint-disable no-irregular-whitespace */
// src/utils/validation.ts (Vite/React)
import type { OnboardingData } from './types';

// Basic phone number regex (adjust as needed for more strict validation)
const phoneRegex = /^[0-9]{7,15}$/;

/**
 * Validates the data for the first onboarding step (User's own profile data).
 */
export const validateStep1 = (data: OnboardingData): boolean => {
  // Birthday validation (must be at least 18 years old)
  if (!data.birthday) return false;
  const birthDate = new Date(data.birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 18) return false;

  // Phone number validation
  // Note: replace(/\D/g, '') removes all non-digit characters before testing
  if (!data.phoneNumber || !phoneRegex.test(data.phoneNumber.replace(/\D/g, ''))) {
    return false;
  }

  return !!(
    data.faithJourney && // Expected to be a single required value
    data.churchAttendance && // Expected to be a single required value
    // Check if relationshipGoals is an array and has at least one item
    data.relationshipGoals && data.relationshipGoals.length > 0 && 
    data.location &&
    data.denomination &&
    data.countryCode &&
    data.education &&
    data.baptismStatus
  );
};

/**
 * Validates the data for the second onboarding step (User's preferences).
 */
export const validateStep2 = (data: OnboardingData): boolean => {
  return !!(
    // Check if preferred fields are arrays and have at least one item
    (data.preferredFaithJourney?.length || 0) > 0 &&
    (data.preferredChurchAttendance?.length || 0) > 0 &&
    (data.preferredRelationshipGoals?.length || 0) > 0 &&
    
    // Note: Based on the component logic, preferredDenomination should be a single string (string | null), 
    // not an array, so we check for its existence, not its length.
    data.preferredDenomination && 
    
    data.preferredGender &&
    
    // Age range validation
    (data.minAge || 0) >= 18 &&
    (data.maxAge || 0) > (data.minAge || 0) &&
    (data.maxDistance || 0) > 0
  );
};

/**
 * A wrapper function to call the correct validation based on the step index.
 * The index starts at 0.
 */
export const validateOnboardingStep = (step: number, data: OnboardingData): boolean => {
  if (step === 0) {
    return validateStep1(data);
  }
  if (step === 1) {
    return validateStep2(data);
  }
  return false;
};