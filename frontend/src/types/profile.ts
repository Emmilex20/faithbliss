import type { UserPreferences } from '@/services/api'; // Import User and UserPreferences
 // Import User and UserPreferences

export interface ProfileData {
  id: string;
  email: string;
  name: string;
  gender?: 'MALE' | 'FEMALE';
  age?: number;
  denomination?: 'BAPTIST' | 'METHODIST' | 'PRESBYTERIAN' | 'PENTECOSTAL' | 'CATHOLIC' | 'ORTHODOX' | 'ANGLICAN' | 'LUTHERAN' | 'ASSEMBLIES_OF_GOD' | 'SEVENTH_DAY_ADVENTIST' | 'OTHER';
  bio?: string;
  // UI-specific location object
  location?: {
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  phoneNumber?: string;
  countryCode?: string;
  birthday?: string; // ISO 8601 date string
  fieldOfStudy?: string;
  profession?: string;
  faithJourney?: 'GROWING' | 'ESTABLISHED' | 'SEEKING';
  sundayActivity?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'RARELY';
  lookingFor?: string[];
  hobbies?: string[]; // This maps to interests in UpdateProfileDto
  values?: string[];
  favoriteVerse?: string;
  // Photos as an array for UI convenience
  photos: string[];
  isVerified?: boolean;
  onboardingCompleted?: boolean;
  preferences?: UserPreferences; // Include preferences
}