import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Task } from '../types/task';
import { useTasks } from './useTasks';

// Сколько миллисекунд доступна кнопка «Отменить» после удаления
export const UNDO_TIMEOUT = 5000;

export interface RemovedTask {
  task: Task;
  // Позиция в общем списке, чтобы вернуть задачу на прежнее место
  index: number;
  // Уникален для каждого удаления: перезапускает таймер и анимацию плашки
  key: number;
}

// Удаление с подтверждением и временной возможностью отмены.
// Удалённая задача хранится только в состоянии экрана до конца сеанса.
export function useRemoveWithUndo() {
  const { tasks, removeTask, restoreTask } = useTasks();
  const [lastRemoved, setLastRemoved] = useState<RemovedTask | null>(null);
  const removalCounter = useRef(0);

  // Актуальный список читаем через ref: так confirmRemove не пересоздаётся
  // при каждом изменении задач (и не пересоздаёт жесты всех карточек),
  // а в момент нажатия «Удалить» берёт свежие данные, а не снимок
  // на момент открытия Alert
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Через UNDO_TIMEOUT плашка скрывается; новое удаление перезапускает таймер
  useEffect(() => {
    if (!lastRemoved) return;
    const timer = setTimeout(() => setLastRemoved(null), UNDO_TIMEOUT);
    return () => clearTimeout(timer);
  }, [lastRemoved]);

  const remove = useCallback(
    (id: string) => {
      const current = tasksRef.current;
      const index = current.findIndex((task) => task.id === id);
      if (index === -1) return;
      removeTask(id);
      removalCounter.current += 1;
      setLastRemoved({ task: current[index], index, key: removalCounter.current });
    },
    [removeTask]
  );

  // Запись не удаляется сразу: сначала пользователь подтверждает действие
  const confirmRemove = useCallback(
    (id: string) => {
      const task = tasksRef.current.find((item) => item.id === id);
      if (!task) return;
      Alert.alert(
        'Удалить задачу?',
        `«${task.title}» будет удалена из списка.`,
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Удалить', style: 'destructive', onPress: () => remove(id) },
        ],
        { cancelable: true }
      );
    },
    [remove]
  );

  const undo = useCallback(() => {
    if (!lastRemoved) return;
    restoreTask(lastRemoved.task, lastRemoved.index);
    setLastRemoved(null);
  }, [lastRemoved, restoreTask]);

  return { lastRemoved, confirmRemove, undo };
}
