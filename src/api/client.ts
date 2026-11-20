import { ApiErrorResponse } from '../types/auth';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

// Статус 0 — запрос вообще не дошёл до сервера (нет сети, неверный адрес)
export const NETWORK_ERROR_STATUS = 0;

// Ошибка запроса с HTTP-статусом: по статусу вызывающий код решает,
// что делать (показать сообщение, завершить сессию при 401 и т. д.)
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === NETWORK_ERROR_STATUS;
}

// Понятный текст для интерфейса. Сообщение сервера (`ApiError.message`) на экран
// не выводится: оно техническое («Поле title должно быть строкой.»), поэтому
// текст выбирается по HTTP-статусу. Исключение — статус 0: его текст пишет
// сам клиент (нет сети, не задан адрес сервера)
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Что-то пошло не так. Попробуйте ещё раз.';
  const { status } = error;
  if (status === NETWORK_ERROR_STATUS) return error.message;
  if (status === 400) return 'Проверьте введённые данные и попробуйте снова.';
  if (status === 401) return 'Сессия истекла. Войдите снова.';
  if (status === 403) return 'Нет доступа к этой записи.';
  if (status === 404) return 'Запись не найдена. Возможно, она уже удалена.';
  if (status >= 500) return 'Сервер временно недоступен. Попробуйте позже.';
  return 'Не удалось выполнить запрос. Попробуйте ещё раз.';
}

// Ошибка экрана входа: здесь 401 означает неверную пару логин–пароль
export function getLoginErrorMessage(error: unknown): string {
  if (isUnauthorized(error)) return 'Неверный логин или пароль.';
  return getErrorMessage(error);
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).error === 'string'
  );
}

// Текст по умолчанию, если сервер (или посредник) не прислал { error }
function fallbackMessage(status: number): string {
  if (status === 401) return 'Требуется авторизация.';
  if (status === 404) return 'Не найдено.';
  if (status >= 500) return 'Сервер временно недоступен. Попробуйте позже.';
  return `Ошибка запроса (${status}).`;
}

// Общая обёртка над fetch: собирает URL, проверяет response.ok,
// превращает любые сбои в ApiError. Тело запроса и заголовки не логируются
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      NETWORK_ERROR_STATUS,
      'Не задан адрес сервера. Добавьте EXPO_PUBLIC_API_URL в файл .env.'
    );
  }

  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      NETWORK_ERROR_STATUS,
      'Не удалось связаться с сервером. Проверьте подключение к интернету.'
    );
  }

  if (!response.ok) {
    let message = fallbackMessage(response.status);
    try {
      const body: unknown = await response.json();
      if (isApiErrorResponse(body)) message = body.error;
    } catch {
      // Тело не JSON — оставляем текст по умолчанию
    }
    throw new ApiError(response.status, message);
  }

  // У 204 нет тела: response.json() вызывать нельзя
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Защищённый запрос: тот же apiRequest, но с заголовком Authorization.
// Токен передаёт вызывающий код — модуль не хранит сессию сам
export function authorizedRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return apiRequest<T>(path, { ...init, headers });
}
