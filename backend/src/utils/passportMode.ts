import { db } from '../config/firebase-admin';

type PassportFeatureSettings = {
  passportModeEnabled: boolean;
  maintenanceModeEnabled: boolean;
  shutdownModeEnabled: boolean;
};

type PassportUserLike = {
  countryCode?: unknown;
  location?: unknown;
  passportCountry?: unknown;
  subscriptionStatus?: unknown;
  subscriptionTier?: unknown;
};

const FEATURES_COLLECTION = 'appConfig';
const FEATURES_DOC_ID = 'features';

const DIAL_CODE_TO_COUNTRY: Record<string, string> = {
  '+1': 'US',
  '+20': 'EG',
  '+27': 'ZA',
  '+30': 'GR',
  '+31': 'NL',
  '+32': 'BE',
  '+33': 'FR',
  '+34': 'ES',
  '+39': 'IT',
  '+40': 'RO',
  '+41': 'CH',
  '+44': 'GB',
  '+45': 'DK',
  '+46': 'SE',
  '+47': 'NO',
  '+48': 'PL',
  '+49': 'DE',
  '+51': 'PE',
  '+52': 'MX',
  '+54': 'AR',
  '+55': 'BR',
  '+56': 'CL',
  '+57': 'CO',
  '+58': 'VE',
  '+60': 'MY',
  '+61': 'AU',
  '+62': 'ID',
  '+63': 'PH',
  '+64': 'NZ',
  '+65': 'SG',
  '+66': 'TH',
  '+81': 'JP',
  '+82': 'KR',
  '+84': 'VN',
  '+86': 'CN',
  '+90': 'TR',
  '+91': 'IN',
  '+92': 'PK',
  '+94': 'LK',
  '+212': 'MA',
  '+213': 'DZ',
  '+216': 'TN',
  '+221': 'SN',
  '+225': 'CI',
  '+233': 'GH',
  '+234': 'NG',
  '+237': 'CM',
  '+244': 'AO',
  '+250': 'RW',
  '+251': 'ET',
  '+254': 'KE',
  '+255': 'TZ',
  '+256': 'UG',
  '+263': 'ZW',
  '+264': 'NA',
  '+267': 'BW',
  '+351': 'PT',
  '+353': 'IE',
  '+358': 'FI',
  '+380': 'UA',
  '+420': 'CZ',
  '+502': 'GT',
  '+506': 'CR',
  '+507': 'PA',
  '+598': 'UY',
  '+852': 'HK',
  '+880': 'BD',
  '+971': 'AE',
  '+972': 'IL',
  '+974': 'QA',
  '+977': 'NP',
};

const COUNTRY_KEYWORDS: Array<{ code: string; keywords: string[] }> = [
  { code: 'NG', keywords: ['nigeria', 'abuja', 'lagos', 'ibadan', 'kaduna', 'enugu', 'owerri', 'port harcourt'] },
  { code: 'GH', keywords: ['ghana', 'accra', 'kumasi', 'tamale'] },
  { code: 'KE', keywords: ['kenya', 'nairobi', 'mombasa', 'kisumu'] },
  { code: 'ZA', keywords: ['south africa', 'cape town', 'johannesburg', 'durban', 'pretoria'] },
  { code: 'MA', keywords: ['morocco', 'casablanca', 'rabat', 'marrakech', 'fes', 'agadir', 'tangier'] },
  { code: 'EG', keywords: ['egypt', 'cairo', 'alexandria', 'giza'] },
  { code: 'TZ', keywords: ['tanzania', 'dar es salaam', 'arusha', 'dodoma'] },
  { code: 'UG', keywords: ['uganda', 'kampala', 'entebbe'] },
  { code: 'RW', keywords: ['rwanda', 'kigali'] },
  { code: 'ET', keywords: ['ethiopia', 'addis ababa'] },
  { code: 'CM', keywords: ['cameroon', 'yaounde', 'douala'] },
  { code: 'SN', keywords: ['senegal', 'dakar'] },
  { code: 'CI', keywords: ['ivory coast', "cote d'ivoire", 'abidjan'] },
  { code: 'DZ', keywords: ['algeria', 'algiers'] },
  { code: 'TN', keywords: ['tunisia', 'tunis'] },
  { code: 'AO', keywords: ['angola', 'luanda'] },
  { code: 'NA', keywords: ['namibia', 'windhoek'] },
  { code: 'BW', keywords: ['botswana', 'gaborone'] },
  { code: 'US', keywords: ['united states', 'usa', 'new york', 'houston', 'atlanta', 'los angeles'] },
  { code: 'GB', keywords: ['united kingdom', 'uk', 'london', 'manchester'] },
  { code: 'CA', keywords: ['canada', 'toronto', 'vancouver'] },
];

const featureSettingsRef = db.collection(FEATURES_COLLECTION).doc(FEATURES_DOC_ID);

export const getPassportFeatureSettings = async (): Promise<PassportFeatureSettings> => {
  const doc = await featureSettingsRef.get();
  const data = doc.data() as Partial<PassportFeatureSettings> | undefined;
  return {
    passportModeEnabled: Boolean(data?.passportModeEnabled),
    maintenanceModeEnabled: Boolean(data?.maintenanceModeEnabled),
    shutdownModeEnabled: Boolean(data?.shutdownModeEnabled),
  };
};

export const setPassportFeatureSettings = async (
  settings: PassportFeatureSettings
): Promise<PassportFeatureSettings> => {
  await featureSettingsRef.set(
    {
      passportModeEnabled: Boolean(settings.passportModeEnabled),
      maintenanceModeEnabled: Boolean(settings.maintenanceModeEnabled),
      shutdownModeEnabled: Boolean(settings.shutdownModeEnabled),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return {
    passportModeEnabled: Boolean(settings.passportModeEnabled),
    maintenanceModeEnabled: Boolean(settings.maintenanceModeEnabled),
    shutdownModeEnabled: Boolean(settings.shutdownModeEnabled),
  };
};

export const normalizeCountryCode = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;
  if (trimmed in DIAL_CODE_TO_COUNTRY) return DIAL_CODE_TO_COUNTRY[trimmed];
  return null;
};

export const resolveCountryFromLocation = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  for (const entry of COUNTRY_KEYWORDS) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.code;
    }
  }

  return null;
};

export const resolveUserHomeCountry = (user: PassportUserLike): string | null => {
  return (
    normalizeCountryCode(user.countryCode)
    || resolveCountryFromLocation(user.location)
    || null
  );
};

export const isPassportPremiumUser = (user: PassportUserLike): boolean =>
  user.subscriptionStatus === 'active'
  && ['premium', 'elite'].includes(String(user.subscriptionTier || '').toLowerCase());

export const getActivePassportCountry = (
  user: PassportUserLike,
  passportModeEnabled: boolean
): string | null => {
  if (!passportModeEnabled) return null;
  if (!isPassportPremiumUser(user)) return null;
  return normalizeCountryCode(user.passportCountry);
};

export const canViewerSeeCandidate = (
  viewer: PassportUserLike,
  candidate: PassportUserLike,
  passportModeEnabled: boolean
): boolean => {
  if (!passportModeEnabled) return true;

  const viewerHomeCountry = resolveUserHomeCountry(viewer);
  const candidateHomeCountry = resolveUserHomeCountry(candidate);
  const viewerPassportCountry = getActivePassportCountry(viewer, passportModeEnabled);
  const candidatePassportCountry = getActivePassportCountry(candidate, passportModeEnabled);

  if (candidatePassportCountry && viewerHomeCountry !== candidatePassportCountry) {
    return false;
  }

  if (viewerPassportCountry) {
    return candidateHomeCountry === viewerPassportCountry;
  }

  return true;
};
