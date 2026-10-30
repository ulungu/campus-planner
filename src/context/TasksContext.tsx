import React, { createContext, useCallback, useMemo, useReducer, useState } from 'react';
import { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import { applyTaskUpdate, buildTask, toggleStatus } from '../utils/task';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Решить задачи по матанализу №3',
    subject: 'Математический анализ',
    priority: 'high',
    status: 'active',
    createdAt: '2026-09-20T09:00:00.000Z',
    dueDate: '2026-09-30',
  },
  {
    id: '2',
    title: 'Прочитать главу 4 учебника по истории',
    subject: 'История',
    priority: 'low',
    status: 'completed',
    createdAt: '2026-09-21T09:00:00.000Z',
  },
  {
    id: '3',
    title: 'Подготовить доклад по физике',
    subject: 'Физика',
    priority: 'medium',
    status: 'active',
    createdAt: '2026-09-22T09:00:00.000Z',
    dueDate: '2026-12-15',
  },
  {
    id: '4',
    title: 'Сделать лабораторную по программированию',
    subject: 'Программирование',
    priority: 'high',
    status: 'active',
    createdAt: '2026-09-23T09:00:00.000Z',
  },
];

// Публичный интерфейс контекста: экраны знают только эти операции
export interface TasksContextValue {
  tasks: Task[];
  lastCreatedId: string | null;
  clearLastCreated: () => void;
  getTaskById: (id: string) => Task | undefined;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  removeTask: (id: string) => void;
  // Вернуть удалённую задачу на прежнее место в списке (отмена удаления)
  restoreTask: (task: Task, index: number) => void;
  toggleTaskStatus: (id: string) => void;
}

type TasksAction =
  | { type: 'create'; task: Task }
  | { type: 'update'; id: string; input: UpdateTaskInput }
  | { type: 'remove'; id: string }
  | { type: 'restore'; task: Task; index: number }
  | { type: 'toggle'; id: string };

function tasksReducer(state: Task[], action: TasksAction): Task[] {
  switch (action.type) {
    case 'create':
      return [action.task, ...state];
    case 'update':
      return state.map((task) =>
        task.id === action.id ? applyTaskUpdate(task, action.input) : task
      );
    case 'remove':
      return state.filter((task) => task.id !== action.id);
    case 'restore': {
      // Защита от повторного восстановления той же задачи
      if (state.some((task) => task.id === action.task.id)) return state;
      const index = Math.min(Math.max(action.index, 0), state.length);
      return [...state.slice(0, index), action.task, ...state.slice(index)];
    }
    case 'toggle':
      return state.map((task) =>
        task.id === action.id ? { ...task, status: toggleStatus(task.status) } : task
      );
  }
}

export const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const getTaskById = useCallback(
    (id: string) => tasks.find((task) => task.id === id),
    [tasks]
  );

  const createTask = useCallback((input: CreateTaskInput) => {
    const task = buildTask(input);
    dispatch({ type: 'create', task });
    setLastCreatedId(task.id);
    return task;
  }, []);

  const clearLastCreated = useCallback(() => setLastCreatedId(null), []);

  const updateTask = useCallback((id: string, input: UpdateTaskInput) => {
    dispatch({ type: 'update', id, input });
  }, []);

  const removeTask = useCallback((id: string) => {
    dispatch({ type: 'remove', id });
  }, []);

  const restoreTask = useCallback((task: Task, index: number) => {
    dispatch({ type: 'restore', task, index });
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    dispatch({ type: 'toggle', id });
  }, []);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      lastCreatedId,
      clearLastCreated,
      getTaskById,
      createTask,
      updateTask,
      removeTask,
      restoreTask,
      toggleTaskStatus,
    }),
    [
      tasks,
      lastCreatedId,
      clearLastCreated,
      getTaskById,
      createTask,
      updateTask,
      removeTask,
      restoreTask,
      toggleTaskStatus,
    ]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
