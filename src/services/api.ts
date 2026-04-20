import { env } from '@/config/env';

export interface ApiCallOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  getToken: () => Promise<string | null>;
  language?: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  requestId?: string;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly body?: unknown) {
    super(message);
  }
}

/**
 * Thin fetch wrapper: attaches Clerk bearer token, language header, and
 * normalizes errors. Use Clerk's `getToken()` from `useAuth()` in callers.
 */
export async function apiCall<T>({
  path,
  method = 'GET',
  body,
  getToken,
  language,
}: ApiCallOptions): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(language ? { 'Accept-Language': language } : {}),
  };
  const res = await fetch(`${env.apiBaseUrl}/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const raw = await res.text();
  const parsed: unknown = raw ? safeJson(raw) : undefined;

  if (!res.ok) {
    const errorBody = parsed as ApiErrorBody | undefined;
    throw new ApiError(res.status, errorBody?.message ?? `HTTP ${res.status}`, parsed);
  }
  return parsed as T;
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
