import { apiRequest } from './client';

// Защищённый запрос: добавляет заголовок Authorization: Bearer <token>.
// О статусе ответа сообщает через ApiError.status (401, 404, 500, 0 — нет сети),
// но сам из сессии не выходит: решение принимает вызывающий код.
// Выход только при 401 делает обёртка из AuthContext (useAuth().authorizedFetch)
export function authorizedFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return apiRequest<T>(path, { ...init, headers });
}
