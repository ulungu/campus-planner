import { apiRequest } from './client';

// Защищённый запрос: добавляет заголовок Authorization
export function authorizedFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return apiRequest<T>(path, { ...init, headers });
}
