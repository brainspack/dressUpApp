// Centralized color theme for the app
// Usage: import { colors, hexToRgba } from '../constants/colors';

export const colors = {
  // Background Colors
  backgroundSecondary: '#f3f4f6', // Light grey for card backgrounds
  // Brand / Primary
  brand: '#2DBE91',
  brandDark: '#209F88',

  // Blues
  blueDark: '#0b2245',
  blue: '#3B82F6',
  indigo: '#4F46E5',

  // Functional
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Grays / Neutrals
  white: '#ffffff',
  black: '#000000',
  background: '#f3f4f6', // Slate-100
  card: '#ffffff',
  border: '#e5e7eb', // Gray-200
  textPrimary: '#111827', // Gray-900
  textSecondary: '#475569', // Slate-600
  textMuted: '#6b7280', // Gray-500
  gray700: '#374151',
  gray400: '#9AA0A6',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
  shadow: '#9ca3af',

  // Charts and UI accents
  charts: {
    // Current bar color preference (user-adjustable)
    bar: '#32FADC',
    pieCompleted: '#2DBE91',
    pieAlterations: '#0b2245',
  },
} as const;

export const hexToRgba = (hex: string, opacity: number = 1): string => {
  const value = hex.replace('#', '');
  if (value.length !== 6) return `rgba(0,0,0,${opacity})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default colors;


