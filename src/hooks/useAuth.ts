import { useContext } from 'react';
import { AuthContext, AuthContextValue } from '../auth/AuthContext';

// Единственная точка доступа экранов к сессии
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth() вызван вне AuthProvider. Оберните приложение в <AuthProvider> (app/_layout.tsx).'
    );
  }
  return context;
}
