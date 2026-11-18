import { useContext } from 'react';
import { TasksUiContext, TasksUiContextValue } from '../context/TasksContext';

// Доступ к UI-состоянию списка (фильтр, подсветка новой задачи)
export function useTasksUi(): TasksUiContextValue {
  const context = useContext(TasksUiContext);
  if (!context) {
    throw new Error(
      'useTasksUi() вызван вне TasksUiProvider. Он подключается в app/(app)/_layout.tsx.'
    );
  }
  return context;
}
