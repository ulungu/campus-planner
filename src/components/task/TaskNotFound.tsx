import React from 'react';
import EmptyState from '../ui/EmptyState';
import Screen from '../ui/Screen';
import { goBackOrHome } from '../../navigation/actions';

// Задачи нет: неверная ссылка, она удалена или принадлежит другому пользователю (404)
export default function TaskNotFound() {
  return (
    <Screen>
      <EmptyState
        icon="🔎"
        title="Задача не найдена"
        description="Возможно, она уже удалена"
        actionLabel="К списку задач"
        onAction={goBackOrHome}
      />
    </Screen>
  );
}
