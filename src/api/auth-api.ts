const ACCESS_STORAGE_KEY = 'dl_access_token';

export type PublicUser = {
  id: string;
  email: string;
};

function apiBase(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_STORAGE_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(ACCESS_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_STORAGE_KEY);
  }
}

export async function authFetch(
  path: string,
  init: RequestInit & { accessToken?: string | null } = {}
): Promise<Response> {
  const { accessToken, headers, ...rest } = init;
  const token =
    accessToken === undefined ? getStoredAccessToken() : accessToken;
  const h = new Headers(headers);
  if (token) {
    h.set('Authorization', `Bearer ${token}`);
  }
  if (!h.has('Content-Type') && rest.body && !(rest.body instanceof FormData)) {
    h.set('Content-Type', 'application/json');
  }
  return fetch(`${apiBase()}${path}`, {
    ...rest,
    headers: h,
    credentials: 'include',
  });
}

export type AuthSuccess = {
  user: PublicUser;
  accessToken: string;
  expiresIn: number;
};

export async function registerRequest(
  email: string,
  password: string
): Promise<AuthSuccess> {
  const res = await authFetch('/api/auth/register', {
    method: 'POST',
    accessToken: null,
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson<AuthSuccess & { error?: string }>(res);
  if (!res.ok) {
    throw new Error(data.error ?? 'Registration failed');
  }
  return data;
}

export async function loginRequest(
  email: string,
  password: string
): Promise<AuthSuccess> {
  const res = await authFetch('/api/auth/login', {
    method: 'POST',
    accessToken: null,
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson<AuthSuccess & { error?: string }>(res);
  if (!res.ok) {
    throw new Error(data.error ?? 'Login failed');
  }
  return data;
}

export async function refreshRequest(): Promise<AuthSuccess> {
  const res = await authFetch('/api/auth/refresh', {
    method: 'POST',
    accessToken: null,
  });
  const data = await parseJson<AuthSuccess & { error?: string }>(res);
  if (!res.ok) {
    throw new Error(data.error ?? 'Session expired');
  }
  return data;
}

export async function meRequest(accessToken: string): Promise<PublicUser> {
  const res = await authFetch('/api/auth/me', {
    method: 'GET',
    accessToken,
  });
  const data = await parseJson<{ user: PublicUser; error?: string }>(res);
  if (!res.ok) {
    throw new Error(data.error ?? 'Not authenticated');
  }
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await authFetch('/api/auth/logout', {
    method: 'POST',
    accessToken: null,
  });
}
