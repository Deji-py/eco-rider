import { View, ViewStyle } from 'react-native';
import React, { ReactNode, useMemo } from 'react';

import { spacing } from '@/theme/spacing';
import { useTheme } from '@/context/theme-provider';

interface ContainerProps {
  children: ReactNode;
  // Theme spacing keys
  spacingLeft?: keyof typeof spacing;
  spacingRight?: keyof typeof spacing;
  spacingTop?: keyof typeof spacing;
  spacingBottom?: keyof typeof spacing;
  spacingHorizontal?: keyof typeof spacing;
  spacingVertical?: keyof typeof spacing;
  // Additional style props
  flex?: number;
  backgroundColor?: string;
  borderRadius?: number;
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
}

const Container: React.FC<ContainerProps> = ({
  children,
  spacingLeft = 'base',
  spacingRight = 'base',
  spacingTop = 'base',
  spacingBottom = 'base',
  spacingHorizontal = 'base',
  spacingVertical = 'base',
  flex,
  backgroundColor,
  borderRadius,
  justifyContent,
  alignItems,
}) => {
  const { theme } = useTheme();

  const dynamicStyle = useMemo(() => {
    const getSpacingValue = (key?: keyof typeof spacing): number | undefined => {
      return key ? spacing[key] : undefined;
    };

    const containerStyle: ViewStyle = {
      paddingLeft: getSpacingValue(spacingLeft) || getSpacingValue(spacingHorizontal),
      paddingRight: getSpacingValue(spacingRight) || getSpacingValue(spacingHorizontal),
      paddingTop: getSpacingValue(spacingTop) || getSpacingValue(spacingVertical),
      paddingBottom: getSpacingValue(spacingBottom) || getSpacingValue(spacingVertical),
    };

    if (flex !== undefined) containerStyle.flex = flex;
    if (backgroundColor) containerStyle.backgroundColor = backgroundColor;
    if (borderRadius) containerStyle.borderRadius = borderRadius;
    if (justifyContent) containerStyle.justifyContent = justifyContent;
    if (alignItems) containerStyle.alignItems = alignItems;

    return containerStyle;
  }, [
    spacingLeft,
    spacingRight,
    spacingTop,
    spacingBottom,
    spacingHorizontal,
    spacingVertical,
    flex,
    backgroundColor,
    borderRadius,
    justifyContent,
    alignItems,
  ]);

  const defaultStyle = {
    backgroundColor: theme.color.background,
    borderRadius: theme.radius.base,
    flex: 1,
  };

  return <View style={[defaultStyle, dynamicStyle]}>{children}</View>;
};

export default Container;
