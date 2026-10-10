import React, { createContext, useCallback, useMemo, useReducer } from 'react';
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
  getTaskById: (id: string) => Task | undefined;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  removeTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
}

// Действия редьюсера — размеченное объединение (discriminated union)
type TasksAction =
  | { type: 'create'; task: Task }
  | { type: 'update'; id: string; input: UpdateTaskInput }
  | { type: 'remove'; id: string }
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
    case 'toggle':
      return state.map((task) =>
        task.id === action.id ? { ...task, status: toggleStatus(task.status) } : task
      );
  }
}

export const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  const getTaskById = useCallback(
    (id: string) => tasks.find((task) => task.id === id),
    [tasks]
  );

  const createTask = useCallback((input: CreateTaskInput) => {
    const task = buildTask(input);
    dispatch({ type: 'create', task });
    return task;
  }, []);

  const updateTask = useCallback((id: string, input: UpdateTaskInput) => {
    dispatch({ type: 'update', id, input });
  }, []);

  const removeTask = useCallback((id: string) => {
    dispatch({ type: 'remove', id });
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    dispatch({ type: 'toggle', id });
  }, []);

  const value = useMemo<TasksContextValue>(
    () => ({ tasks, getTaskById, createTask, updateTask, removeTask, toggleTaskStatus }),
    [tasks, getTaskById, createTask, updateTask, removeTask, toggleTaskStatus]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
