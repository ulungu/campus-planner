import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskFormValues } from '../types/task';

export const DRAFT_STORAGE_KEY = '@campus-planner/task-draft';

export function isDraftEmpty(draft: TaskFormValues): boolean {
  return !draft.title.trim() && !draft.subject.trim();
}

export async function loadDraft(): Promise<TaskFormValues | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as TaskFormValues;
    return isDraftEmpty(draft) ? null : draft;
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
