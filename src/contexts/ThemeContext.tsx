import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeMode, applyThemePalette, getNavigationTheme, getPaperTheme } from '../theme/colors';

type ThemeContextValue = {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  navigationTheme: ReturnType<typeof getNavigationTheme>;
};

const defaultMode: ThemeMode = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
applyThemePalette(defaultMode);

const ThemeContext = createContext<ThemeContextValue>({
  mode: defaultMode,
  toggleTheme: () => {},
  setTheme: () => {},
  navigationTheme: getNavigationTheme(defaultMode),
});

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  useEffect(() => {
    applyThemePalette(mode);
  }, [mode]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!colorScheme) return;
      setMode(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setMode((previous) => (previous === 'light' ? 'dark' : 'light'));
  };

  const navigationTheme = useMemo(() => getNavigationTheme(mode), [mode]);
  const paperTheme = useMemo(() => getPaperTheme(mode), [mode]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      mode,
      toggleTheme,
      setTheme: setMode,
      navigationTheme,
    }),
    [mode, navigationTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);

