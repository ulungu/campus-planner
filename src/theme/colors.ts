import { TaskPriority } from '../types/task';

export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  onPrimary: string;
  chip: string;
  chipText: string;
  danger: string;
  success: string;
  placeholder: string;
  shadow: string;
  // Подсветка только что созданной задачи
  highlight: string;
  // Фон дорожки прогресс-бара
  track: string;
  priority: Record<TaskPriority, string>;
  onPriority: string;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

export const THEMES: Record<ThemeName, ThemeColors> = {
  light: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#222222',
    textSecondary: '#666666',
    border: '#DDDDDD',
    primary: '#2196F3',
    onPrimary: '#FFFFFF',
    chip: '#E5E5EA',
    chipText: '#444444',
    danger: '#F44336',
    success: '#4CAF50',
    placeholder: '#999999',
    shadow: '#000000',
    highlight: '#D6EBFD',
    track: '#E5E5EA',
    priority: PRIORITY_COLORS,
    onPriority: '#FFFFFF',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#F2F2F2',
    textSecondary: '#A0A0A0',
    border: '#3A3A3C',
    primary: '#4DA3F7',
    onPrimary: '#FFFFFF',
    chip: '#2C2C2E',
    chipText: '#D0D0D0',
    danger: '#FF6B60',
    success: '#66BB6A',
    placeholder: '#777777',
    shadow: '#000000',
    highlight: '#1B3A57',
    track: '#2C2C2E',
    priority: PRIORITY_COLORS,
    onPriority: '#FFFFFF',
  },
};

// Фон экрана загрузки, пока тема ещё не прочитана из AsyncStorage
export const LOADING_COLORS = {
  background: '#808080',
  indicator: '#FFFFFF',
} as const;

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
};
