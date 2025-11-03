/* eslint-disable no-irregular-whitespace */
// src/types/User.ts
export interface User {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;

  age: number;
  gender: "MALE" | "FEMALE";

  denomination?:
    | "BAPTIST"
    | "METHODIST"
    | "PRESBYTERIAN"
    | "PENTECOSTAL"
    | "CATHOLIC"
    | "ORTHODOX"
    | "ANGLICAN"
    | "LUTHERAN"
    | "ASSEMBLIES_OF_GOD"
    | "SEVENTH_DAY_ADVENTIST"
    | "OTHER"
    | string; // 👈 allow flexible input

  bio: string;
  location: string;

  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  countryCode?: string;

  birthday?: string | Date; // 👈 fix for Firestore timestamp conversion

  fieldOfStudy?: string;
  profession?: string;
  faithJourney?: string;
  sundayActivity?: string;
  lookingFor?: string[];
  hobbies?: string[];
  values?: string[];
  favoriteVerse?: string;
  isVerified?: boolean;
  profilePhoto1?: string;
  profilePhoto2?: string;
  profilePhoto3?: string;
  profilePhoto4?: string;
  profilePhoto5?: string;
  profilePhoto6?: string;
  isActive?: boolean;

}




export interface UserPreferences {
  preferredGender?: 'MALE' | 'FEMALE' | null;
  preferredDenomination?: ('BAPTIST' | 'METHODIST' | 'PRESBYTERIAN' | 'PENTECOSTAL' | 'CATHOLIC' | 'ORTHODOX' | 'ANGLICAN' | 'LUTHERAN' | 'ASSEMBLIES_OF_GOD' | 'SEVENTH_DAY_ADVENTIST' | 'OTHER')[] | null;
  minAge?: number | null;
  maxAge?: number | null;
  maxDistance?: number | null;
  preferredFaithJourney?: string[] | null;
  preferredChurchAttendance?: string[] | null;
  preferredRelationshipGoals?: string[] | null;
}