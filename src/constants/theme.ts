/**
 * Tema minimalista de Rally.
 * Fondo oscuro y profundo, mucho espacio en blanco (negativo), un acento por deporte.
 */
export const colors = {
  background: '#0B0B0F',
  surface: '#16161D',
  surfaceAlt: '#1F1F29',
  border: '#2A2A36',
  text: '#F5F5F7',
  textMuted: '#9A9AA8',
  textFaint: '#5E5E6E',
  accent: '#C6FF4D',
  danger: '#FF5A5A',
  success: '#4DDD8A',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;
