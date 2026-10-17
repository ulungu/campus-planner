import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskFormValues, TaskPriority } from '../types/task';

export const DRAFT_STORAGE_KEY = '@campus-planner/task-draft';

const PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high'];

function isTaskFormValues(value: unknown): value is TaskFormValues {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.title === 'string' &&
    typeof draft.subject === 'string' &&
    PRIORITIES.includes(draft.priority as TaskPriority) &&
    (draft.dueDate === undefined || typeof draft.dueDate === 'string') &&
    (draft.description === undefined || typeof draft.description === 'string')
  );
}

export function isDraftEmpty(draft: TaskFormValues): boolean {
  return (
    !draft.title.trim() &&
    !draft.subject.trim() &&
    !draft.dueDate?.trim() &&
    !draft.description?.trim()
  );
}

export async function loadDraft(): Promise<TaskFormValues | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isTaskFormValues(parsed)) return null;
    return isDraftEmpty(parsed) ? null : parsed;
  } catch (e) {
    console.warn('Не удалось загрузить черновик', e);
    return null;
  }
}

export async function saveDraft(draft: TaskFormValues): Promise<void> {
  try {
    if (isDraftEmpty(draft)) {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  } catch (e) {
    console.warn('Не удалось сохранить черновик', e);
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (e) {
    console.warn('Не удалось удалить черновик', e);
  }
}
