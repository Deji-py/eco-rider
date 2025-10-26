type ColorType = {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  error: string;
  warning: string;
  success: string;
  border: string;
  cardBackground: string;
  cardBorder: string;
};

type SpacingType = {
  base: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
};

type Typography = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

type TypographyType = {
  h1: Typography;
  h2: Typography;
  h3: Typography;
  h4: Typography;
  h5: Typography;
  h6: Typography;
  body: Typography;
  small: Typography;
  xtraSmall: Typography;
  display: Typography;
};

type BreakPointType = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};
type SizeType = {
  base: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
};

type BorderRadiusType = {
  base: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};
type ThemeType = {
  color: ColorType;
  spacing: SpacingType;
  typography: TypographyType;
  breakpoints: BreakPointType;
  size: SizeType;
  radius: BorderRadiusType;
};

export type {
  ThemeType,
  ColorType,
  TypographyType,
  BreakPointType,
  SizeType,
  SpacingType,
  BorderRadiusType,
};
