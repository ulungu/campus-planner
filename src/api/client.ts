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

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === NETWORK_ERROR_STATUS;
}

// Понятный текст для интерфейса из любой ошибки
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
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
