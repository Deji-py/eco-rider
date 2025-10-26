// Alert.tsx
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import React, { ReactNode } from 'react';
import { useTheme } from '@/context/theme-provider';
import { CheckCircle, XCircle, Info, X, AlertCircleIcon } from 'lucide-react-native';
import Typography from './Typography';
import { Row, Stack } from '../layout/Layout';
import { spacing } from '@/theme/spacing';
import * as Haptics from 'expo-haptics';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';
type AlertSize = 'sm' | 'md' | 'lg';

interface AlertProps {
  /**
   * Alert variant/type
   */
  variant?: AlertVariant;

  /**
   * Title of the alert
   */
  title?: string;

  /**
   * Description/message of the alert
   */
  description: string;

  /**
   * Size of the alert
   */
  size?: AlertSize;

  /**
   * Show close button
   */
  closable?: boolean;

  /**
   * Callback when close button is pressed
   */
  onClose?: () => void;

  /**
   * Custom icon (overrides default variant icon)
   */
  icon?: ReactNode;

  /**
   * Hide icon
   */
  hideIcon?: boolean;

  /**
   * Custom action button
   */
  action?: ReactNode;

  /**
   * Show border
   */
  showBorder?: boolean;

  /**
   * Custom background color
   */
  backgroundColor?: string;

  /**
   * Custom border color
   */
  borderColor?: string;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Callback when alert is pressed (makes entire alert pressable)
   */
  onPress?: () => void;
}

const getVariantConfig = (variant: AlertVariant, theme: any) => {
  switch (variant) {
    case 'success':
      return {
        backgroundColor: `${theme.color.success}15`,
        borderColor: '#009A3B40',
        iconColor: '#009A3B',
        Icon: CheckCircle,
      };
    case 'warning':
      return {
        backgroundColor: `#FF8F2C20`,
        borderColor: theme.color.warning,
        iconColor: theme.color.warning,
        Icon: AlertCircleIcon,
      };
    case 'error':
      return {
        backgroundColor: `${theme.color.error}15`,
        borderColor: theme.color.error,
        iconColor: theme.color.error,
        Icon: XCircle,
      };
    case 'info':
    default:
      return {
        backgroundColor: `${theme.color.primary}15`,
        borderColor: theme.color.primary,
        iconColor: theme.color.primary,
        Icon: Info,
      };
  }
};

const getSizeConfig = (size: AlertSize) => {
  switch (size) {
    case 'sm':
      return {
        padding: spacing.sm,
        iconSize: 18,
        gap: spacing.sm,
      };
    case 'lg':
      return {
        padding: spacing.lg,
        iconSize: 28,
        gap: spacing.base,
      };
    case 'md':
    default:
      return {
        padding: spacing.base,
        iconSize: 24,
        gap: spacing.base,
      };
  }
};

/**
 * Alert - Reusable alert component with multiple variants
 *
 * @example
 * // Basic info alert
 * <Alert
 *   variant="info"
 *   title="Profile under review"
 *   description="We are reviewing your profile, you will be notified very soon of next action."
 *   closable
 *   onClose={() => console.log('Alert closed')}
 * />
 *
 * // Success alert
 * <Alert
 *   variant="success"
 *   title="Success"
 *   description="Your profile has been updated successfully."
 * />
 *
 * // Error alert
 * <Alert
 *   variant="error"
 *   title="Error"
 *   description="Something went wrong. Please try again."
 *   closable
 * />
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  description,
  size = 'md',
  closable = false,
  onClose,
  icon,
  hideIcon = false,
  action,
  showBorder = true,
  backgroundColor,
  borderColor,
  onPress,
}) => {
  const { theme } = useTheme();
  const variantConfig = getVariantConfig(variant, theme);
  const sizeConfig = getSizeConfig(size);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose?.();
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const alertContent = (
    <Row
      gap={'sm'}
      alignItems="flex-start"
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || variantConfig.backgroundColor,
          borderWidth: showBorder ? 1 : 0,
          borderColor: borderColor || variantConfig.borderColor,
          borderRadius: theme.radius.lg,
          padding: sizeConfig.padding,
        },
      ]}>
      {/* Icon */}
      {!hideIcon && (
        <View style={{ paddingTop: title ? 2 : 0 }}>
          {icon || (
            <variantConfig.Icon
              size={sizeConfig.iconSize}
              color={variantConfig.iconColor}
              strokeWidth={2}
            />
          )}
        </View>
      )}

      {/* Content */}
      <Stack flex={1}>
        {title && (
          <Typography
            type={size === 'lg' ? 'h6' : 'small'}
            color={variantConfig.iconColor}
            style={{
              fontFamily: 'Inter_600SemiBold',
            }}>
            {title}
          </Typography>
        )}
        <Typography
          type={size === 'sm' ? 'small' : 'body'}
          color={theme.color.foreground}
          style={{
            opacity: 0.6,
            lineHeight: size === 'sm' ? 18 : 20,
            marginTop: 4,
          }}>
          {description}
        </Typography>

        {/* Custom action */}
        {action && <View style={{ marginTop: spacing.sm }}>{action}</View>}
      </Stack>

      {/* Close button */}
      {closable && (
        <Pressable onPress={handleClose} hitSlop={8}>
          <X
            size={size === 'sm' ? 16 : 20}
            color={theme.color.foreground}
            style={{ opacity: 0.6 }}
          />
        </Pressable>
      )}
    </Row>
  );

  if (onPress) {
    return (
      <Pressable onPress={handlePress} style={{ width: '100%' }}>
        {alertContent}
      </Pressable>
    );
  }

  return alertContent;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
