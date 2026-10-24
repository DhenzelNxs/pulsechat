import { getAccessToken, setAccessToken } from '../lib/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface ApiErrorBody {
  error: { code: string; message: string };
}

async function parseErrorBody(res: Response): Promise<ApiErrorBody['error']> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return body.error;
  } catch {
    return { code: 'UNKNOWN_ERROR', message: res.statusText };
  }
}

async function rawFetch(path: string, options: RequestInit): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}

async function refreshAccessToken(): Promise<boolean> {
  const res = await rawFetch('/api/auth/refresh', { method: 'POST' });

  if (!res.ok) {
    setAccessToken(null);
    return false;
  }

  const body = (await res.json()) as { accessToken: string };
  setAccessToken(body.accessToken);
  return true;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  { skipAuthRetry = false }: { skipAuthRetry?: boolean } = {},
): Promise<T> {
  let res = await rawFetch(path, options);

  if (res.status === 401 && !skipAuthRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await rawFetch(path, options);
    }
  }

  if (!res.ok) {
    const { code, message } = await parseErrorBody(res);
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
