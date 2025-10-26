import { darkTheme, lightTheme } from '@/theme';
import React, { createContext } from 'react';

type ThemeType = 'light' | 'dark';

type ThemeProviderProps = {
  children: React.ReactNode;
  theme: ThemeType;
};

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
});

const ThemeProvider = ({ children, theme }: ThemeProviderProps) => {
  // Todo: Add Auto detect theme as an option autodetect:boolean
  //   aso add settheme function later

  const value = {
    theme: theme === 'light' ? lightTheme : darkTheme,
    isDark: theme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const { theme, isDark } = React.useContext(ThemeContext);
  return { theme, isDark };
};

export default ThemeProvider;
