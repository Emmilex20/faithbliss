type ExchangeRateResponse = {
  conversion_rates?: Record<string, number>;
};

const EXCHANGE_RATE_BASE_URL = 'https://v6.exchangerate-api.com/v6';
const CACHE_TTL_MS = 15 * 60 * 1000;

let cachedRates: Record<string, number> | null = null;
let cachedAt = 0;

export const getUsdExchangeRates = async (): Promise<Record<string, number>> => {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('EXCHANGE_RATE_API_KEY is not set');
  }

  if (cachedRates && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  const response = await fetch(`${EXCHANGE_RATE_BASE_URL}/${encodeURIComponent(apiKey)}/latest/USD`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  const payload = await response.json() as ExchangeRateResponse;
  if (!payload.conversion_rates || typeof payload.conversion_rates !== 'object') {
    throw new Error('Exchange rate payload is invalid');
  }

  cachedRates = payload.conversion_rates;
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
