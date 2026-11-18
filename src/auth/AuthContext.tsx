import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { getErrorMessage, isUnauthorized } from '../api/client';
import { queryClient, setUnauthorizedHandler } from '../api/queryClient';
import { LoginInput, User } from '../types/auth';
import { clearDraft } from '../storage/draftStorage';
import { readToken, removeToken, saveToken } from './authStorage';

export interface AuthContextValue {
  user: User | null;
  // Токен держится в памяти приложения; на диске он только в SecureStore
  accessToken: string | null;
  // true, пока при запуске идёт восстановление сессии
  isLoading: boolean;
  isAuthenticated: boolean;
  // Не удалось проверить сохранённую сессию из-за сети или сервера
  // (токен при этом не удаляется — он может быть ещё действителен)
  restoreError: string | null;
  retryRestore: () => void;
  signIn: (credentials: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  // Увеличивается, чтобы перезапустить восстановление сессии кнопкой «Повторить»
  const [restoreAttempt, setRestoreAttempt] = useState(0);

  // Восстановление сессии при запуске: токен из SecureStore → проверка через /auth/me
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      setIsLoading(true);
      setRestoreError(null);

      const token = await readToken();
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.getCurrentUser(token);
        if (cancelled) return;
        setAccessToken(token);
        setUser(currentUser);
      } catch (error) {
        if (cancelled) return;
        if (isUnauthorized(error)) {
          // Токен истёк или недействителен: удаляем, пользователь войдёт заново
          await removeToken();
        } else {
          // Нет сети или ошибка сервера — это не повод удалять токен
          setRestoreError(getErrorMessage(error));
        }
        setAccessToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [restoreAttempt]);

  const retryRestore = useCallback(() => {
    setRestoreAttempt((attempt) => attempt + 1);
  }, []);

  const signIn = useCallback(async (credentials: LoginInput) => {
    const response = await authApi.signIn(credentials);
    await saveToken(response.accessToken);
    // Новый вход — кэш предыдущей сессии не должен попасть на экран
    queryClient.clear();
    setRestoreError(null);
    setAccessToken(response.accessToken);
    setUser(response.user);
  }, []);

  const signOut = useCallback(async () => {
    await removeToken();
    // Черновик новой задачи — данные пользователя, при выходе он не нужен
    await clearDraft();
    setAccessToken(null);
    setUser(null);
    setRestoreError(null);
    // Задачи пользователя в кэше TanStack Query больше не нужны никому
    queryClient.clear();
  }, []);

  // 401 любого запроса задач (QueryCache/MutationCache) завершает сессию;
  // Stack.Protected в корневом layout сам откроет экран входа
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(user && accessToken),
      restoreError,
      retryRestore,
      signIn,
      signOut,
    }),
    [user, accessToken, isLoading, restoreError, retryRestore, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
