import React from 'react';
import { getErrorMessage } from '../../api/client';
import EmptyState from './EmptyState';
import Screen from './Screen';

interface ErrorStateProps {
  title: string;
  error: unknown;
  onRetry: () => void;
  // Повторный запрос уже идёт — кнопка показывает «Загрузка…»
  isRetrying?: boolean;
}

// Экран ошибки запроса с кнопкой повтора. Текст — понятный пользователю,
// без технических сообщений сервера (см. getErrorMessage)
export default function ErrorState({ title, error, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <Screen>
      <EmptyState
        icon="⚠️"
        title={title}
        description={getErrorMessage(error)}
        actionLabel={isRetrying ? 'Загрузка…' : 'Повторить'}
        onAction={onRetry}
        actionDisabled={isRetrying}
      />
    </Screen>
  );
}
