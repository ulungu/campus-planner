import { router } from 'expo-router';
import { ROUTES } from '../types/navigation';

// Переходы между экранами собраны здесь, экраны вызывают только эти функции

export function openTask(id: string): void {
  router.push({ pathname: ROUTES.taskDetails, params: { id } });
}

export function openEditTask(id: string): void {
  router.push({ pathname: ROUTES.editTask, params: { id } });
}

export function openNewTask(): void {
  router.push(ROUTES.newTask);
}

export function openSettings(): void {
  router.push(ROUTES.settings);
}

// Назад, а если истории нет (открыли по ссылке) — на главный экран
export function goBackOrHome(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(ROUTES.home);
  }
}
