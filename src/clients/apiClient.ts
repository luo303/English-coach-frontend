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

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${ApiRuntimeConfig.apiBaseUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    method: options.method ?? 'GET',
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.code !== 200) {
    throw new ApiClientError(payload.info || 'API request failed.', response.status, payload.requestId);
  }

  return payload.data;
}
