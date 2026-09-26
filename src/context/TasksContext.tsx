import React, { createContext, useContext, useState } from 'react';
import { Task, TaskFormValues } from '../types/task';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Решить задачи по матанализу №3',
    subject: 'Математический анализ',
    priority: 'high',
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Прочитать главу 4 учебника по истории',
    subject: 'История',
    priority: 'low',
    isCompleted: true,
  },
  {
    id: '3',
    title: 'Подготовить доклад по физике',
    subject: 'Физика',
    priority: 'medium',
    isCompleted: false,
  },
  {
    id: '4',
    title: 'Сделать лабораторную по программированию',
    subject: 'Программирование',
    priority: 'high',
    isCompleted: false,
  },
];

interface TasksContextValue {
  tasks: Task[];
  getTaskById: (id: string) => Task | undefined;
  addTask: (data: TaskFormValues) => void;
  updateTask: (id: string, data: TaskFormValues) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const getTaskById = (id: string) => tasks.find((task) => task.id === id);

  const addTask = (data: TaskFormValues) => {
    const newTask: Task = { id: String(Date.now()), ...data, isCompleted: false };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, data: TaskFormValues) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...data } : task))
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <TasksContext.Provider
      value={{ tasks, getTaskById, addTask, updateTask, toggleTask, deleteTask }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks(): TasksContextValue {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks должен использоваться внутри TasksProvider');
  }
  return context;
}
