import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMemo } from 'react';
import type { MD3Theme } from 'react-native-paper';

type StylesGenerator<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>> = (
  theme: MD3Theme,
) => T;

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  generator: StylesGenerator<T>,
) => {
  const theme = useTheme();

  return useMemo(() => StyleSheet.create(generator(theme)), [theme]);
};

