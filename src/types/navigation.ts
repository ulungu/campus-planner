// Параметры динамических маршрутов app/task/[id].tsx и app/task/edit/[id].tsx
export type TaskRouteParams = {
  id: string;
};

// Все пути приложения в одном месте, чтобы не ошибиться в строке маршрута
export const ROUTES = {
  home: '/',
  settings: '/settings',
  newTask: '/task/new',
  taskDetails: '/task/[id]',
  editTask: '/task/edit/[id]',
} as const;
