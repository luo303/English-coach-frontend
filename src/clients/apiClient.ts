import { ApiRuntimeConfig } from '@/config/runtime';
import { ApiResponse } from '@/types/api';

type RequestOptions = {
  body?: unknown;
  method?: 'GET' | 'POST';
  token?: string | null;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly requestId?: string,
  ) {
    super(message);
  }
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'code' in value && 'info' in value && 'requestId' in value && 'data' in value;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const url = `${ApiRuntimeConfig.apiBaseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    method: options.method ?? 'GET',
  });

  const text = await response.text();
  let payload: ApiResponse<T> | null = null;

  try {
    payload = text ? (JSON.parse(text) as ApiResponse<T>) : null;
  } catch {
    console.log('[API response]', {
      body: text,
      method: options.method ?? 'GET',
      status: response.status,
      url,
    });
    throw new ApiClientError('API returned non-JSON response.', response.status);
  }

  console.log('[API response]', {
    body: payload,
    method: options.method ?? 'GET',
    status: response.status,
    url,
  });

  if (!payload || !isApiResponse<T>(payload)) {
    throw new ApiClientError('API returned an invalid response shape.', response.status);
  }

  if (!response.ok || payload.code !== 200) {
    throw new ApiClientError(payload.info || 'API request failed.', response.status, payload.requestId);
  }

  return payload.data;
}
