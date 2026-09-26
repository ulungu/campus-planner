import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '../theme/colors';

export const THEME_STORAGE_KEY = '@campus-planner/theme';

export async function loadTheme(): Promise<ThemeName | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch (e) {
    console.warn('Не удалось загрузить тему', e);
    return null;
  }
}

export async function saveTheme(theme: ThemeName): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.warn('Не удалось сохранить тему', e);
  }
}
