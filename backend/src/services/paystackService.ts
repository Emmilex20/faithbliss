// src/services/paystackService.ts

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getHeaders = () => {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is not set');
  }
  return {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  };
};

const paystackRequest = async <T>(path: string, options: RequestInit): Promise<PaystackResponse<T>> => {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.message || 'Paystack request failed';
    throw new Error(message);
  }
  return payload as PaystackResponse<T>;
};

export const initializeTransaction = async (payload: Record<string, unknown>) => {
  return paystackRequest<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const verifyTransaction = async (reference: string) => {
  return paystackRequest<Record<string, any>>(`/transaction/verify/${reference}`, {
    method: 'GET',
  });
};
