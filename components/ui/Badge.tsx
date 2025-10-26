import { View, ViewStyle } from 'react-native';
import React, { ReactNode, useMemo } from 'react';
import { useTheme } from '@/context/theme-provider';
import Typography from './Typography';
import { Row } from '../layout/Layout';
import { spacing } from '@/theme/spacing';

// ============ BADGE COMPONENT ============

export type BadgeSeverity = 'success' | 'warning' | 'error' | 'neutral' | 'info';

interface BadgeProps {
  /**
   * Badge label
   */
  label: string;

  /**
   * Severity level affecting styling
   */
  severity?: BadgeSeverity;

  /**
   * Optional icon
   */
  icon?: ReactNode;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

/**
 * Badge - Status indicator component with severity levels
 * @example
 * <Badge label="Active" severity="success" />
 * <Badge label="Cancelled" severity="error" />
 */
export const Badge: React.FC<BadgeProps> = ({ label, severity = 'neutral', icon, style }) => {
  const { theme } = useTheme();

  const severityStyles = useMemo(() => {
    switch (severity) {
      case 'success':
        return {
          backgroundColor: `#B5FA5890`, // 20% opacity
          borderColor: theme.color.success,
          textColor: theme.color.success,
        };
      case 'error':
        return {
          backgroundColor: `${theme.color.error}20`,
          borderColor: theme.color.error,
          textColor: theme.color.error,
        };
      case 'warning':
        return {
          backgroundColor: `${theme.color.warning}20`,
          borderColor: theme.color.warning,
          textColor: theme.color.warning,
        };
      case 'neutral':
      default:
        return {
          backgroundColor: theme.color.muted,
          borderColor: theme.color.border,
          textColor: theme.color.mutedForeground,
        };
    }
  }, [severity, theme]);

  return (
    <View
      style={[
        {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: theme.radius.md,
          backgroundColor: severityStyles.backgroundColor,
          borderWidth: 0.5,
          borderColor: severityStyles.borderColor,
        },
        style,
      ]}>
      <Row gap="xs" alignItems="center">
        {icon && icon}
        <Typography type="xtraSmall" color={severityStyles.textColor} fontWeight="500">
          {label}
        </Typography>
      </Row>
    </View>
  );
};
