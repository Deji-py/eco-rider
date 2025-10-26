import { Text, TextStyle } from 'react-native';
import React, { ReactNode, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import typography from '@/theme/typography';
import { TypographyType } from '@/theme/theme.type';

export type TypographyVariant = keyof TypographyType;

interface TypographyProps {
  children: ReactNode;
  type?: TypographyVariant;
  color?: string;
  fontWeight?: 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  style?: TextStyle;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  type = 'body',
  color,
  fontWeight,
  textAlign,
  numberOfLines,
  ellipsizeMode,
  style,
}) => {
  const theme = useTheme();

  const dynamicStyle = useMemo(() => {
    const baseTypography = typography[type];

    const textStyle: TextStyle = {
      fontFamily: baseTypography.fontFamily,
      fontSize: baseTypography.fontSize,
      lineHeight: baseTypography.lineHeight,
      letterSpacing: baseTypography.letterSpacing,
    };

    if (color) textStyle.color = color;
    if (fontWeight) textStyle.fontWeight = fontWeight;
    if (textAlign) textStyle.textAlign = textAlign;

    return textStyle;
  }, [type, color, fontWeight, textAlign]);

  return (
    <Text style={[dynamicStyle, style]} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>
      {children}
    </Text>
  );
};

export default Typography;
