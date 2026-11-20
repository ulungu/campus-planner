import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { focusManager, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError, isUnauthorized } from './client';

// Что делать при 401 любого запроса или мутации. Обработчик регистрирует
// AuthProvider (signOut), сам QueryClient про сессию ничего не знает
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function handleError(error: unknown): void {
  // Выход только при 401. Сеть, 400, 404, 500 показываются экраном как ошибка
  if (isUnauthorized(error)) unauthorizedHandler?.();
}

// Ошибки клиента (400, 401, 404) повтор не исправит — повторяем только сеть и 5xx
const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

// Один экземпляр на всё приложение — создаётся при импорте модуля, а не в компоненте,
// иначе каждый рендер получал бы новый пустой кэш
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
    },
    mutations: {
      // Повтор POST создал бы дубликат задачи
      retry: false,
    },
  },
});

// В React Native нет события «вкладка снова активна», как в браузере.
// Сообщаем TanStack Query, что приложение вернулось из фона: устаревшие
// запросы на экране обновятся сами (например, задачи изменили на другом устройстве)
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
}

export function useRefetchOnAppFocus(): void {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);
}
