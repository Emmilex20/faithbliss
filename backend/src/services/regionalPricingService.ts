import { getUsdExchangeRates } from './exchangeRateService';
import { lookupCountryByIp } from './geoLocationService';

export type BillingCycle = 'monthly' | 'quarterly';
export type PricingRegion = 'nigeria' | 'africa' | 'global';
export type DisplayCurrency = string;
export type ChargeCurrency = 'NGN';
export type PaidTier = 'premium';

export type RegionalPricingQuote = {
  tier: PaidTier;
  billingCycle: BillingCycle;
  region: PricingRegion;
  countryCode: string | null;
  displayCurrency: DisplayCurrency;
  displayAmountMajor: number;
  chargeCurrency: ChargeCurrency;
  chargeAmountMajor: number;
  chargeAmountSubunits: number;
  exchangeRate: number;
  displayLabel: string;
};

const NGN_PRICE_CATALOG: Record<BillingCycle, number> = {
  monthly: 5000,
  quarterly: 10000,
};

const GLOBAL_USD_PRICE_CATALOG: Record<BillingCycle, number> = {
  monthly: 11.99,
  quarterly: 7.99,
};

const AFRICAN_COUNTRY_CODES = new Set([
  'AO', 'BF', 'BI', 'BJ', 'BW', 'CD', 'CF', 'CG', 'CI', 'CM', 'CV', 'DJ', 'DZ', 'EG', 'EH', 'ER',
  'ET', 'GA', 'GH', 'GM', 'GN', 'GQ', 'GW', 'KE', 'KM', 'LR', 'LS', 'LY', 'MA', 'MG', 'ML', 'MR',
  'MU', 'MW', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'SC', 'SD', 'SH', 'SL', 'SN', 'SO', 'SS', 'ST',
  'SZ', 'TD', 'TG', 'TN', 'TZ', 'UG', 'YT', 'ZA', 'ZM', 'ZW',
]);

const AFRICAN_DISPLAY_CURRENCY_MAP: Record<string, string> = {
  AO: 'AOA',
  BF: 'XOF',
  BI: 'BIF',
  BJ: 'XOF',
  BW: 'BWP',
  CD: 'CDF',
  CF: 'XAF',
  CG: 'XAF',
  CI: 'XOF',
  CM: 'XAF',
  CV: 'CVE',
  DJ: 'DJF',
  DZ: 'DZD',
  EG: 'EGP',
  ER: 'ERN',
  ET: 'ETB',
  GA: 'XAF',
  GH: 'GHS',
  GM: 'GMD',
  GN: 'GNF',
  GQ: 'XAF',
  GW: 'XOF',
  KE: 'KES',
  KM: 'KMF',
  LR: 'LRD',
  LS: 'LSL',
  LY: 'LYD',
  MA: 'MAD',
  MG: 'MGA',
  ML: 'XOF',
  MR: 'MRU',
  MU: 'MUR',
  MW: 'MWK',
  MZ: 'MZN',
  NA: 'NAD',
  NE: 'XOF',
  NG: 'NGN',
  RW: 'RWF',
  SC: 'SCR',
  SD: 'SDG',
  SL: 'SLE',
  SN: 'XOF',
  SO: 'SOS',
  SS: 'SSP',
  ST: 'STN',
  SZ: 'SZL',
  TD: 'XAF',
  TG: 'XOF',
  TN: 'TND',
  TZ: 'TZS',
  UG: 'UGX',
  ZA: 'ZAR',
  ZM: 'ZMW',
  ZW: 'USD',
};

const getRegionFromCountry = (countryCode: string | null): PricingRegion => {
  if (countryCode === 'NG') {
    return 'nigeria';
  }

  if (countryCode && AFRICAN_COUNTRY_CODES.has(countryCode)) {
    return 'africa';
  }

  return 'global';
};

const getAfricanDisplayCurrency = (countryCode: string | null): string => {
  if (!countryCode) {
    return 'USD';
  }

  return AFRICAN_DISPLAY_CURRENCY_MAP[countryCode] || 'USD';
};

const getRateFromUsdRates = (rates: Record<string, number>, currency: string): number => {
  const rate = rates[currency];
  if (!rate || !Number.isFinite(rate)) {
    throw new Error(`Exchange rate for ${currency} is unavailable`);
  }

  return rate;
};

const convertNgnToDisplayWholeAmount = (
  amountInNgn: number,
  displayCurrency: string,
  usdRates: Record<string, number>,
): { amount: number; exchangeRate: number } => {
  if (displayCurrency === 'NGN') {
    return {
      amount: amountInNgn,
      exchangeRate: 1,
    };
  }

  const ngnRate = getRateFromUsdRates(usdRates, 'NGN');
  const displayRate = getRateFromUsdRates(usdRates, displayCurrency);
  const crossRate = displayRate / ngnRate;
  const converted = Math.max(1, Math.ceil(amountInNgn * crossRate));

  return {
    amount: converted,
    exchangeRate: crossRate,
  };
};

const convertUsdToNgnWholeAmount = (
  usdAmount: number,
  usdRates: Record<string, number>,
): { amount: number; exchangeRate: number } => {
  const ngnRate = getRateFromUsdRates(usdRates, 'NGN');
  const converted = Math.max(1, Math.ceil(usdAmount * ngnRate));

  return {
    amount: converted,
    exchangeRate: ngnRate,
  };
};

const formatDisplayLabel = (currency: string, amount: number): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const getRegionalPricingQuote = async (
  billingCycle: BillingCycle,
  ipAddress: string | null,
  fallbackCountryCode?: string | null,
): Promise<RegionalPricingQuote> => {
  const geo = await lookupCountryByIp(ipAddress);
  const resolvedCountryCode = geo.countryCode || (fallbackCountryCode ? fallbackCountryCode.trim().toUpperCase() : null);
  const region = getRegionFromCountry(resolvedCountryCode);
  const usdRates = await getUsdExchangeRates();

  if (region === 'nigeria') {
    const ngnAmount = NGN_PRICE_CATALOG[billingCycle];
    return {
      tier: 'premium',
      billingCycle,
      region,
      countryCode: resolvedCountryCode,
      displayCurrency: 'NGN',
      displayAmountMajor: ngnAmount,
      chargeCurrency: 'NGN',
      chargeAmountMajor: ngnAmount,
      chargeAmountSubunits: ngnAmount * 100,
      exchangeRate: 1,
      displayLabel: formatDisplayLabel('NGN', ngnAmount),
    };
  }

  if (region === 'africa') {
    const displayCurrency = getAfricanDisplayCurrency(resolvedCountryCode);
    const ngnAmount = NGN_PRICE_CATALOG[billingCycle];
    const converted = convertNgnToDisplayWholeAmount(ngnAmount, displayCurrency, usdRates);

    return {
      tier: 'premium',
      billingCycle,
      region,
      countryCode: resolvedCountryCode,
      displayCurrency,
      displayAmountMajor: converted.amount,
      chargeCurrency: 'NGN',
      chargeAmountMajor: ngnAmount,
      chargeAmountSubunits: ngnAmount * 100,
      exchangeRate: converted.exchangeRate,
      displayLabel: formatDisplayLabel(displayCurrency, converted.amount),
    };
  }

  const usdAmount = GLOBAL_USD_PRICE_CATALOG[billingCycle];
  const ngnCharge = convertUsdToNgnWholeAmount(usdAmount, usdRates);

  return {
    tier: 'premium',
    billingCycle,
    region,
    countryCode: resolvedCountryCode,
    displayCurrency: 'USD',
    displayAmountMajor: usdAmount,
    chargeCurrency: 'NGN',
    chargeAmountMajor: ngnCharge.amount,
    chargeAmountSubunits: ngnCharge.amount * 100,
    exchangeRate: ngnCharge.exchangeRate,
    displayLabel: formatDisplayLabel('USD', usdAmount),
  };
};
