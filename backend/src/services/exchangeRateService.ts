type ExchangeRateResponse = {
  conversion_rates?: Record<string, number>;
};

const EXCHANGE_RATE_BASE_URL = 'https://v6.exchangerate-api.com/v6';
const EXCHANGE_RATE_FALLBACK_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_TTL_MS = 15 * 60 * 1000;
const SUPPORTED_FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  NGN: 1600,
  GHS: 15,
  KES: 129,
  ZAR: 18,
  XOF: 605,
  XAF: 605,
  UGX: 3900,
  TZS: 2550,
  RWF: 1300,
};

let cachedRates: Record<string, number> | null = null;
let cachedAt = 0;

const isUsableRatesMap = (value: unknown): value is Record<string, number> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value).some((rate) => typeof rate === 'number' && Number.isFinite(rate));
};

const mergeWithFallbackRates = (rates: Record<string, number>): Record<string, number> => {
  return {
    ...SUPPORTED_FALLBACK_RATES,
    ...rates,
  };
};

const readProviderError = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json() as { result?: unknown; 'error-type'?: unknown; error?: unknown };
    const providerMessageParts = [
      typeof payload.result === 'string' ? payload.result : null,
      typeof payload['error-type'] === 'string' ? payload['error-type'] : null,
      typeof payload.error === 'string' ? payload.error : null,
    ].filter(Boolean);

    if (providerMessageParts.length > 0) {
      return providerMessageParts.join(' - ');
    }
  } catch {
    // ignore payload parse failures and fall back to status text
  }

  return response.statusText || 'Provider request failed';
};

const fetchPrimaryRates = async (): Promise<Record<string, number>> => {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('EXCHANGE_RATE_API_KEY is not set');
  }

  const response = await fetch(`${EXCHANGE_RATE_BASE_URL}/${encodeURIComponent(apiKey)}/latest/USD`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Primary exchange rate provider failed: ${await readProviderError(response)}`);
  }

  const payload = await response.json() as ExchangeRateResponse;
  if (!isUsableRatesMap(payload.conversion_rates)) {
    throw new Error('Primary exchange rate payload is invalid');
  }

  return mergeWithFallbackRates(payload.conversion_rates);
};

const fetchFallbackRates = async (): Promise<Record<string, number>> => {
  const response = await fetch(EXCHANGE_RATE_FALLBACK_URL, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Fallback exchange rate provider failed: ${await readProviderError(response)}`);
  }

  const payload = await response.json() as { rates?: Record<string, number> };
  if (!isUsableRatesMap(payload.rates)) {
    throw new Error('Fallback exchange rate payload is invalid');
  }

  return mergeWithFallbackRates(payload.rates);
};

export const getUsdExchangeRates = async (): Promise<Record<string, number>> => {
  if (cachedRates && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    cachedRates = await fetchPrimaryRates();
    cachedAt = Date.now();
    return cachedRates;
  } catch (primaryError) {
    console.error('Primary exchange rate provider failed:', primaryError);
  }

  try {
    cachedRates = await fetchFallbackRates();
    cachedAt = Date.now();
    return cachedRates;
  } catch (fallbackError) {
    console.error('Fallback exchange rate provider failed:', fallbackError);
  }

  if (cachedRates) {
    return cachedRates;
  }

  cachedRates = { ...SUPPORTED_FALLBACK_RATES };
  cachedAt = Date.now();
  return cachedRates;
};

export const convertUsdToCurrencySubunits = async (
  baseUsdPrice: number,
  currency: string
) => {
  if (currency === 'USD') {
    const amount = Math.round(baseUsdPrice * 100);
    return {
      amount,
      exchangeRate: 1,
      convertedMajorAmount: Number((amount / 100).toFixed(2)),
    };
  }

  const rates = await getUsdExchangeRates();
  const exchangeRate = rates[currency];
  if (!exchangeRate || !Number.isFinite(exchangeRate)) {
    throw new Error(`Exchange rate for ${currency} is unavailable`);
  }

  const convertedMajorAmount = Number((baseUsdPrice * exchangeRate).toFixed(2));
  const amount = Math.max(1, Math.round(convertedMajorAmount * 100));

  return {
    amount,
    exchangeRate,
    convertedMajorAmount,
  };
};
