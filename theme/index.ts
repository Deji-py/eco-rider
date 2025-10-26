import { breakpoints } from './breakpoints';
import { colors } from './colors';
import { radius } from './radius';
import { sizes } from './sizes';
import { spacing } from './spacing';
import { ThemeType } from './theme.type';
import typography from './typography';

const theme: ThemeType = {
  color: colors,
  spacing: spacing,
  typography: typography,
  breakpoints: breakpoints,
  size: sizes,
  radius: radius,
};

const lightTheme: ThemeType = {
  ...theme,
  // add light theme overrides here
};

const darkTheme: ThemeType = {
  ...theme,
  // add dark theme oeverrides here
};

const AppTheme = {
  light: lightTheme,
  dark: darkTheme,
};

export { theme, lightTheme, darkTheme, AppTheme };
