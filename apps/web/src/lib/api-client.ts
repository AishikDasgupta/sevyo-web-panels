import type { ApiError } from '@sevyo/shared-types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseError(res: Response): Promise<ApiClientError> {
  let message = `Request failed (${res.status})`;
  let code: string | undefined;
  let details: unknown;
  try {
    const body = (await res.json()) as ApiError;
    message = body.error?.message ?? message;
    code = body.error?.code;
    details = body.error?.details;
  } catch {
    // non-JSON error body — keep default message
  }
  return new ApiClientError(message, res.status, code, details);
}

export const api = {
  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}/api${path}`, {
      credentials: 'include',
      headers: init?.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) throw await parseError(res);
    return (await res.json()) as T;
  },

  get<T>(path: string): Promise<T> {
    return api.request<T>(path);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return api.request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return api.request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) });
  },

  delete<T>(path: string): Promise<T> {
    return api.request<T>(path, { method: 'DELETE' });
  },
};

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}