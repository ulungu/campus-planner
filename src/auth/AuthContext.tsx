import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as authApi from '../api/auth';
import { authorizedFetch as authorizedFetchWithToken } from '../api/authorizedFetch';
import { ApiError, getErrorMessage, isUnauthorized } from '../api/client';
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
  // Защищённый запрос от имени текущего пользователя; при 401 завершает сессию
  authorizedFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  // Увеличивается, чтобы перезапустить восстановление сессии кнопкой «Повторить»
  const [restoreAttempt, setRestoreAttempt] = useState(0);

  // Актуальный токен для authorizedFetch без пересоздания функции
  const tokenRef = useRef<string | null>(null);
  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

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
  }, []);

  const authorizedFetch = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const token = tokenRef.current;
      if (!token) {
        throw new ApiError(401, 'Требуется авторизация.');
      }
      try {
        return await authorizedFetchWithToken<T>(path, token, init);
      } catch (error) {
        // Из сессии выходим только при 401. Сеть и 500 токен не отменяют
        if (isUnauthorized(error)) {
          await signOut();
        }
        throw error;
      }
    },
    [signOut]
  );

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
      authorizedFetch,
    }),
    [user, accessToken, isLoading, restoreError, retryRestore, signIn, signOut, authorizedFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
