import { ApiError } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

// Данные сессии, которые нужны запросам задач
export function useTaskSession() {
  const { user, accessToken } = useAuth();

  return {
    // Пока пользователя нет, запросы выключены через enabled, так что пустой id в кэш не попадёт
    userId: user?.id ?? '',
    isReady: Boolean(accessToken && user),
    // queryFn/mutationFn вызываются только после входа, но тип токена — string | null
    requireToken(): string {
      if (!accessToken) throw new ApiError(401, 'Требуется авторизация.');
      return accessToken;
    },
  };
}
