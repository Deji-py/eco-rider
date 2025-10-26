import {
  Pressable,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { ReactNode, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Typography, { TypographyVariant } from './Typography';
import { Row } from '../layout/Layout';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/context/theme-provider';

type SpacingKey = keyof typeof spacing;
export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  borderRadius?: number;
  style?: ViewStyle;
  activeOpacity?: number;
  loadingColor?: string;
}

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        height: 36,
      };
    case 'lg':
      return {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        height: 52,
      };
    case 'md':
    default:
      return {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        height: 44,
      };
  }
};

const getTypographyVariant = (size: ButtonSize): TypographyVariant => {
  switch (size) {
    case 'sm':
      return 'small' as const;
    case 'lg':
      return 'h6' as const;
    case 'md':
    default:
      return 'body' as const;
  }
};

/**
 * Button - Reusable button component with multiple variants and sizes
 * @example
 * <Button
 *   label="Click Me"
 *   onPress={() => console.log('pressed')}
 *   variant="primary"
 *   size="md"
 * />
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  borderRadius = 12,
  style,
  activeOpacity = 0.9,
  loadingColor = '#ffffff',
}) => {
  const { theme } = useTheme();
  const sizeStyles = getSizeStyles(size);
  const typographyVariant = getTypographyVariant(size);

  const getVariantStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius,
      ...sizeStyles,
      ...(fullWidth && { width: '100%' }),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.color.muted : theme.color.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.color.muted : theme.color.secondary,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled ? theme.color.muted : theme.color.border,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: theme.color.muted,
        };
      default:
        return baseStyle;
    }
  }, [variant, disabled, borderRadius, sizeStyles, fullWidth, theme]);

  const textColor = useMemo(() => {
    switch (variant) {
      case 'primary':
        return disabled ? theme.color.mutedForeground : theme.color.primaryForeground;
      case 'secondary':
        return disabled ? theme.color.mutedForeground : theme.color.secondaryForeground;
      case 'outlined':
        return disabled ? theme.color.mutedForeground : theme.color.mutedForeground;
      case 'ghost':
        return disabled ? theme.color.mutedForeground : theme.color.foreground;
      default:
        return theme.color.foreground;
    }
  }, [variant, disabled, theme]);

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      activeOpacity={activeOpacity}
      disabled={disabled || loading}
      style={[getVariantStyles, style]}>
      <Row gap="sm" justifyContent="center" alignItems="center">
        {loading ? (
          <ActivityIndicator color={loadingColor || textColor} size={size === 'sm' ? 16 : 20} />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            <Typography
              type={typographyVariant}
              color={textColor}
              fontWeight="500"
              style={{ lineHeight: 16 }}>
              {label}
            </Typography>
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </Row>
    </TouchableOpacity>
  );
};

/**
 * IconButton - Compact button for icons
 * @example
 * <IconButton
 *   icon={<Icon />}
 *   onPress={() => console.log('pressed')}
 *   size="md"
 * />
 */
export const IconButton: React.FC<{
  icon: ReactNode;
  onPress: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ icon, onPress, size = 'md', variant = 'ghost', disabled = false, style }) => {
  const { theme } = useTheme();

  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const iconSize = sizeMap[size];

  const getVariantBg = useMemo(() => {
    switch (variant) {
      case 'primary':
        return disabled ? theme.color.muted : theme.color.primary;
      case 'secondary':
        return disabled ? theme.color.muted : theme.color.secondary;
      case 'outlined':
        return 'transparent';
      case 'ghost':
        return disabled ? theme.color.muted : theme.color.muted;
      default:
        return 'transparent';
    }
  }, [variant, disabled, theme]);

  const borderStyle =
    variant === 'outlined'
      ? {
          borderWidth: 2,
          borderColor: disabled ? theme.color.muted : theme.color.primary,
        }
      : {};

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize / 2,
          backgroundColor: getVariantBg,
          justifyContent: 'center',
          alignItems: 'center',
          ...borderStyle,
        },
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      {icon}
    </Pressable>
  );
};

/**
 * ButtonGroup - Group of buttons
 * @example
 * <ButtonGroup
 *   buttons={[
 *     { label: 'Cancel', onPress: () => {} },
 *     { label: 'Confirm', onPress: () => {}, variant: 'primary' }
 *   ]}
 *   horizontal
 *   gap="base"
 * />
 */
export const ButtonGroup: React.FC<{
  buttons: Array<Omit<ButtonProps, 'fullWidth'>>;
  horizontal?: boolean;
  gap?: SpacingKey;
}> = ({ buttons, horizontal = false, gap = 'base' }) => {
  const gapValue = spacing[gap];

  return (
    <Row
      style={{
        flexDirection: horizontal ? 'row' : 'column',
        gap: gapValue,
      }}
      flex={1}>
      {buttons.map((btn, idx) => (
        <Button key={idx} {...btn} fullWidth={!horizontal} />
      ))}
    </Row>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
});
