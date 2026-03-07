type GeoLookupResult = {
  ip: string | null;
  countryCode: string | null;
};

const GEOLOOKUP_BASE_URL = 'https://ipapi.co';

const LOCAL_IPS = new Set(['127.0.0.1', '::1']);

const normalizeIp = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed;
};

export const extractClientIp = (headers: Record<string, unknown>): string | null => {
  const forwardedFor = headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    const first = normalizeIp(forwardedFor.split(',')[0]);
    if (first) return first;
  }

  const candidates = [
    headers['cf-connecting-ip'],
    headers['x-real-ip'],
    headers['x-client-ip'],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const normalized = normalizeIp(candidate);
      if (normalized) return normalized;
    }
  }

  return null;
};

export const lookupCountryByIp = async (ip: string | null): Promise<GeoLookupResult> => {
  const normalizedIp = normalizeIp(ip);
  if (!normalizedIp || LOCAL_IPS.has(normalizedIp)) {
    return { ip: normalizedIp, countryCode: null };
  }

  try {
    const response = await fetch(`${GEOLOOKUP_BASE_URL}/${encodeURIComponent(normalizedIp)}/json/`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return { ip: normalizedIp, countryCode: null };
    }

    const payload = await response.json() as { country_code?: unknown };
    const countryCode =
      typeof payload.country_code === 'string' && payload.country_code.trim()
        ? payload.country_code.trim().toUpperCase()
        : null;

    return { ip: normalizedIp, countryCode };
  } catch {
    return { ip: normalizedIp, countryCode: null };
  }
};
