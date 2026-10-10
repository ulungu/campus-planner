import { useContext } from 'react';
import { TasksContext, TasksContextValue } from '../context/TasksContext';

// Единственная точка доступа экранов к задачам
export function useTasks(): TasksContextValue {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error(
      'useTasks() вызван вне TasksProvider. Оберните приложение в <TasksProvider> (app/_layout.tsx).'
    );
  }
  return context;
}
