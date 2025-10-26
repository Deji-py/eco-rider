// Card.tsx
import { View, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import React, { ReactNode } from 'react';
import { useTheme } from '@/context/theme-provider';
import Typography from './Typography';
import { Stack, Row } from '../layout/Layout';
import { spacing } from '@/theme/spacing';
import * as Haptics from 'expo-haptics';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  /**
   * Content inside the card
   */
  children: ReactNode;

  /**
   * Card variant/style
   */
  variant?: CardVariant;

  /**
   * Size of the card (affects padding)
   */
  size?: CardSize;

  /**
   * Make the card pressable
   */
  pressable?: boolean;

  /**
   * Callback when card is pressed
   */
  onPress?: () => void;

  /**
   * Show shadow (for elevated variant)
   */
  showShadow?: boolean;

  /**
   * Custom border radius
   */
  borderRadius?: number;

  /**
   * Custom background color
   */
  backgroundColor?: string;

  /**
   * Custom border color (for outlined variant)
   */
  borderColor?: string;

  /**
   * Border width (for outlined variant)
   */
  borderWidth?: number;

  /**
   * Disable the card
   */
  disabled?: boolean;

  /**
   * Active opacity when pressed
   */
  activeOpacity?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

interface CardHeaderProps {
  /**
   * Title text
   */
  title?: string;

  /**
   * Subtitle text
   */
  subtitle?: string;

  /**
   * Custom title component
   */
  titleComponent?: ReactNode;

  /**
   * Icon or avatar on the left
   */
  leftComponent?: ReactNode;

  /**
   * Action buttons or icons on the right
   */
  rightComponent?: ReactNode;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

interface CardContentProps {
  /**
   * Content inside card body
   */
  children: ReactNode;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

interface CardFooterProps {
  /**
   * Footer content
   */
  children: ReactNode;

  /**
   * Show divider above footer
   */
  showDivider?: boolean;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

const getSizeConfig = (size: CardSize) => {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
      };
    case 'lg':
      return {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,
      };
    case 'md':
    default:
      return {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
      };
  }
};

const getVariantStyles = (
  variant: CardVariant,
  theme: any,
  showShadow: boolean,
  borderWidth: number,
  borderColor?: string,
  backgroundColor?: string
): ViewStyle => {
  const baseStyle: ViewStyle = {};

  switch (variant) {
    case 'elevated':
      return {
        ...baseStyle,
        backgroundColor: backgroundColor || theme.color.background,
        borderWidth: 0,
        ...(showShadow && styles.shadow),
      };
    case 'outlined':
      return {
        ...baseStyle,
        backgroundColor: backgroundColor || 'transparent',
        borderWidth: borderWidth,
        borderColor: borderColor || theme.color.border,
      };
    case 'filled':
      return {
        ...baseStyle,
        backgroundColor: backgroundColor || theme.color.cardBackground,
        borderWidth: 0,
      };
    case 'ghost':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
    default:
      return baseStyle;
  }
};

/**
 * Card - Reusable card component
 *
 * @example
 * <Card variant="elevated" pressable onPress={() => console.log('Pressed')}>
 *   <Card.Header
 *     title="Card Title"
 *     subtitle="Card subtitle"
 *   />
 *   <Card.Content>
 *     <Typography>Card content goes here</Typography>
 *   </Card.Content>
 *   <Card.Footer>
 *     <Button label="Action" onPress={() => {}} />
 *   </Card.Footer>
 * </Card>
 */
export const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
} = ({
  children,
  variant = 'elevated',
  size = 'md',
  pressable = false,
  onPress,
  showShadow = true,
  borderRadius,
  backgroundColor,
  borderColor,
  borderWidth = 1,
  disabled = false,
  activeOpacity = 0.7,
  style,
}) => {
  const { theme } = useTheme();
  const sizeConfig = getSizeConfig(size);
  const variantStyles = getVariantStyles(
    variant,
    theme,
    showShadow && variant === 'elevated',
    borderWidth,
    borderColor,
    backgroundColor
  );

  const handlePress = () => {
    if (onPress && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const cardContent = (
    <View
      style={[
        styles.container,
        variantStyles,
        {
          borderRadius: borderRadius || theme.radius.lg,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          paddingVertical: sizeConfig.paddingVertical,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}>
      {children}
    </View>
  );

  if (pressable || onPress) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [pressed && !disabled && { opacity: activeOpacity }]}>
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

/**
 * Card.Header - Card header component
 */
Card.Header = ({ title, subtitle, titleComponent, leftComponent, rightComponent, style }) => {
  const { theme } = useTheme();

  return (
    <Row
      gap="md"
      alignItems="flex-start"
      justifyContent="space-between"
      style={StyleSheet.flatten([{ marginBottom: spacing.sm }, style])}>
      {/* Left Component */}
      {leftComponent && <View>{leftComponent}</View>}

      {/* Title Section */}
      <Stack gap="xs" flex={1}>
        {titleComponent ? (
          titleComponent
        ) : (
          <>
            {title && (
              <Typography type="h6" color={theme.color.foreground} fontWeight="600">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography type="small" color={theme.color.mutedForeground}>
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </Stack>

      {/* Right Component */}
      {rightComponent && <View>{rightComponent}</View>}
    </Row>
  );
};

/**
 * Card.Content - Card content/body component
 */
Card.Content = ({ children, style }) => {
  return <View style={[{ marginBottom: spacing.sm }, style]}>{children}</View>;
};

/**
 * Card.Footer - Card footer component
 */
Card.Footer = ({ children, showDivider = false, style }) => {
  const { theme } = useTheme();

  return (
    <View style={style}>
      {showDivider && (
        <View
          style={{
            height: 1,
            backgroundColor: theme.color.border,
            marginBottom: spacing.sm,
          }}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
