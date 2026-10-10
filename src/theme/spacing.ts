// Дизайн-токены отступов, скруглений и типографики (не зависят от темы)
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  pill: 16,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 16,
  xl: 20,
} as const;

export type SpacingToken = keyof typeof spacing;
