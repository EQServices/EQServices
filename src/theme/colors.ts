// Paleta base extraída do logo do Elastiquality
// Paleta clara: #2f61a6, #3b3435, #d5dfef, #5788ce, #94b2db

import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';

type Palette = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  background: string;
  backgroundLight: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  textLight: string;
  textDisabled: string;
  error: string;
  errorDark: string;
  errorLight: string;
  success: string;
  successDark: string;
  successLight: string;
  warning: string;
  warningDark: string;
  warningLight: string;
  info: string;
  infoDark: string;
  infoLight: string;
  border: string;
  borderLight: string;
  divider: string;
  client: string;
  clientDark: string;
  clientLight: string;
  professional: string;
  professionalDark: string;
  professionalLight: string;
  pending: string;
  active: string;
  completed: string;
  cancelled: string;
  disabled: string;
  placeholder: string;
  overlay: string;
  shadow: string;
  gradientStart: string;
  gradientEnd: string;
};

const lightPalette: Palette = {
  primary: '#2f61a6',
  primaryDark: '#1f4170',
  primaryLight: '#5788ce',
  secondary: '#94b2db',
  secondaryDark: '#6a8fc7',
  secondaryLight: '#d5dfef',
  accent: '#5788ce',
  accentDark: '#3d6aaf',
  accentLight: '#7fa3d9',
  background: '#FFFFFF',
  backgroundLight: '#F8FAFC',
  surface: '#F5F7FA',
  surfaceLight: '#d5dfef',
  text: '#3b3435',
  textSecondary: '#6b6566',
  textLight: '#FFFFFF',
  textDisabled: '#9E9E9E',
  error: '#DC2626',
  errorDark: '#B91C1C',
  errorLight: '#EF4444',
  success: '#2f61a6',
  successDark: '#1f4170',
  successLight: '#5788ce',
  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',
  info: '#5788ce',
  infoDark: '#2f61a6',
  infoLight: '#94b2db',
  border: '#d5dfef',
  borderLight: '#E5EAF0',
  divider: '#c5cfe0',
  client: '#5788ce',
  clientDark: '#3d6aaf',
  clientLight: '#94b2db',
  professional: '#2f61a6',
  professionalDark: '#1f4170',
  professionalLight: '#5788ce',
  pending: '#F59E0B',
  active: '#2f61a6',
  completed: '#5788ce',
  cancelled: '#6b6566',
  disabled: '#9E9E9E',
  placeholder: '#a0a8b5',
  overlay: 'rgba(59, 52, 53, 0.5)',
  shadow: 'rgba(47, 97, 166, 0.1)',
  gradientStart: '#2f61a6',
  gradientEnd: '#5788ce',
};

const darkPalette: Palette = {
  primary: '#94b2db',
  primaryDark: '#7a96c2',
  primaryLight: '#c0d3f1',
  secondary: '#3d4f7c',
  secondaryDark: '#2a3658',
  secondaryLight: '#566692',
  accent: '#648ad9',
  accentDark: '#4a6dbc',
  accentLight: '#8aa8e6',
  background: '#0b1220',
  backgroundLight: '#111c32',
  surface: '#141d33',
  surfaceLight: '#1f2c47',
  text: '#E2E8F0',
  textSecondary: '#94A3B8',
  textLight: '#FFFFFF',
  textDisabled: '#64748B',
  error: '#F87171',
  errorDark: '#DC2626',
  errorLight: '#FCA5A5',
  success: '#8fb5ff',
  successDark: '#3f5eb8',
  successLight: '#c0d3ff',
  warning: '#FBBF24',
  warningDark: '#D97706',
  warningLight: '#FCD34D',
  info: '#60A5FA',
  infoDark: '#2563EB',
  infoLight: '#93C5FD',
  border: '#22304F',
  borderLight: '#1b2741',
  divider: '#1f2d4d',
  client: '#648ad9',
  clientDark: '#4a6dbc',
  clientLight: '#8aa8e6',
  professional: '#94b2db',
  professionalDark: '#7a96c2',
  professionalLight: '#c0d3f1',
  pending: '#FBBF24',
  active: '#4c6fb3',
  completed: '#648ad9',
  cancelled: '#475569',
  disabled: '#64748B',
  placeholder: '#94A3B8',
  overlay: 'rgba(11, 18, 32, 0.6)',
  shadow: 'rgba(9, 16, 29, 0.6)',
  gradientStart: '#0f172a',
  gradientEnd: '#1d2a44',
};

export const colors: Palette = { ...lightPalette };

export type ThemeMode = 'light' | 'dark';

export const applyThemePalette = (mode: ThemeMode) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  Object.assign(colors, palette);
};

const buildPaperTheme = (mode: ThemeMode): MD3Theme => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  const baseTheme = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      surface: palette.surface,
      onSurface: palette.text,
      onSurfaceDisabled: palette.disabled,
      error: palette.error,
      outline: palette.border,
      inversePrimary: palette.primaryLight,
      inverseSurface: palette.primaryDark,
      inverseOnSurface: palette.textLight,
      surfaceVariant: palette.surfaceLight,
      surfaceDisabled: palette.disabled,
    },
  };
};

export const getPaperTheme = (mode: ThemeMode): MD3Theme => buildPaperTheme(mode);

export const paperTheme = getPaperTheme('light');

export const getNavigationTheme = (mode: ThemeMode): NavigationTheme => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  const base = mode === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      notification: palette.accent,
    },
  };
};

