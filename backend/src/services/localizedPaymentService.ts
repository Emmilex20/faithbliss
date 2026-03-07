 import { initializeTransaction } from './paystackService';
import { convertUsdToCurrencySubunits } from './exchangeRateService';
import { lookupCountryByIp } from './geoLocationService';

export type LocalizedCurrency = 'USD' | 'NGN' | 'GHS' | 'KES' | 'ZAR';
export type PaidTier = 'premium' | 'elite';

const COUNTRY_CURRENCY_MAP: Record<string, LocalizedCurrency> = {
  NG: 'NGN',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
};

export const resolveCurrencyFromCountry = (countryCode: string | null): LocalizedCurrency => {
  if (!countryCode) return 'USD';
  return COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
};

type InitializeLocalizedPaymentInput = {
  email: string;
  userId: string;
  tier: PaidTier;
  baseUsdPrice: number;
  ipAddress: string | null;
  callbackUrl?: string;
};

export const initializeLocalizedPayment = async ({
  email,
  userId,
  tier,
  baseUsdPrice,
  ipAddress,
  callbackUrl,
}: InitializeLocalizedPaymentInput) => {
  const geo = await lookupCountryByIp(ipAddress);
  const currency = resolveCurrencyFromCountry(geo.countryCode);
  const converted = await convertUsdToCurrencySubunits(baseUsdPrice, currency);

  const response = await initializeTransaction({
    email,
    amount: converted.amount,
    currency,
    callback_url: callbackUrl,
    metadata: {
      userId,
      tier,
      baseUsdPrice,
      detectedCountry: geo.countryCode,
      detectedCurrency: currency,
      exchangeRate: converted.exchangeRate,
      convertedMajorAmount: converted.convertedMajorAmount,
    },
  });

  return {
    authorizationUrl: response.data.authorization_url,
    accessCode: response.data.access_code,
    reference: response.data.reference,
    amount: converted.amount,
    currency,
    countryCode: geo.countryCode,
    exchangeRate: converted.exchangeRate,
    convertedMajorAmount: converted.convertedMajorAmount,
  };
};
