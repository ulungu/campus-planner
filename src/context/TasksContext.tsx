import React, { createContext, useCallback, useMemo, useState } from 'react';
import { TaskStatusFilter } from '../types/task';

// Только UI-состояние списка. Сами задачи — серверные данные,
// они живут в кэше TanStack Query (src/features/tasks), а не здесь
export interface TasksUiContextValue {
  statusFilter: TaskStatusFilter;
  setStatusFilter: (status: TaskStatusFilter) => void;
  // Только что созданная задача подсвечивается в списке один раз
  lastCreatedId: string | null;
  setLastCreatedId: (id: string) => void;
  clearLastCreated: () => void;
}

export const TasksUiContext = createContext<TasksUiContextValue | null>(null);

export function TasksUiProvider({ children }: { children: React.ReactNode }) {
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [lastCreatedId, setLastCreatedIdState] = useState<string | null>(null);

  const setLastCreatedId = useCallback((id: string) => setLastCreatedIdState(id), []);
  const clearLastCreated = useCallback(() => setLastCreatedIdState(null), []);

  const value = useMemo<TasksUiContextValue>(
    () => ({ statusFilter, setStatusFilter, lastCreatedId, setLastCreatedId, clearLastCreated }),
    [statusFilter, lastCreatedId, setLastCreatedId, clearLastCreated]
  );

  return <TasksUiContext.Provider value={value}>{children}</TasksUiContext.Provider>;
}
