// OrderCounts.tsx
import { View, Pressable, ViewStyle } from 'react-native';
import React from 'react';
import Typography from '@/components/ui/Typography';
import { Row, Stack } from '@/components/layout/Layout';
import { useTheme } from '@/context/theme-provider';
import * as Haptics from 'expo-haptics';

interface OrderCountItem {
  /**
   * Count/number value
   */
  count: number;

  /**
   * Label for the count
   */
  label: string;

  /**
   * Status type (affects color)
   */
  status: 'cancelled' | 'completed' | 'pending' | 'active' | 'failed';

  /**
   * Callback when item is pressed
   */
  onPress?: () => void;
}

interface OrderCountsProps {
  /**
   * Cancelled orders count
   */
  cancelled?: number;

  /**
   * Completed orders count
   */
  completed?: number;

  /**
   * Pending orders count
   */
  pending?: number;

  /**
   * Active/In-progress orders count
   */
  active?: number;

  /**
   * Failed orders count
   */
  failed?: number;

  /**
   * Custom order items (overrides individual props)
   */
  items?: OrderCountItem[];

  /**
   * Callback when an item is pressed
   */
  onItemPress?: (status: string) => void;

  /**
   * Number of columns (default: 2)
   */
  columns?: 2 | 3 | 4;

  /**
   * Show as cards or inline
   */
  variant?: 'cards' | 'inline';

  /**
   * Custom style
   */
  style?: ViewStyle;
}

const getStatusColor = (status: OrderCountItem['status'], theme: any) => {
  switch (status) {
    case 'cancelled':
      return {
        background: `${theme.color.mutedForeground}20`,
        text: theme.color.mutedForeground,
        textOpacity: 0.6,
      };
    case 'completed':
      return {
        background: '#B5FA5880',
        text: '#0D7C2D',
        textOpacity: 1,
        borderColor: '#0D7C2D',
      };
    case 'pending':
      return {
        background: `${theme.color.warning}20`,
        text: theme.color.warning,
        textOpacity: 1,
        borderColor: theme.color.warning,
      };
    case 'active':
      return {
        background: `#326ada30`,
        text: '#326ada',
        textOpacity: 1,
        borderColor: '#326ada',
      };
    case 'failed':
      return {
        background: `${theme.color.error}20`,
        text: theme.color.error,
        textOpacity: 1,
        borderColor: theme.color.error,
      };
    default:
      return {
        background: theme.color.muted,
        text: theme.color.foreground,
        textOpacity: 0.8,
      };
  }
};

/**
 * OrderCountCard - Individual order count card
 */
const OrderCountCard: React.FC<{
  count: number;
  label: string;
  status: OrderCountItem['status'];
  onPress?: () => void;
}> = ({ count, label, status, onPress }) => {
  const { theme } = useTheme();
  const colors = getStatusColor(status, theme);

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const content = (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: theme.radius.xl,
        paddingHorizontal: 24,
        paddingVertical: 16,
        minHeight: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: colors.borderColor,
      }}>
      <Stack alignItems="center">
        <Typography
          type="display"
          color={colors.text}
          style={{
            fontSize: 44,
            fontFamily: 'Lexend_700Bold',
            opacity: colors.textOpacity,
          }}>
          {count}
        </Typography>
        <Typography
          type="body"
          color={colors.text}
          style={{
            opacity: colors.textOpacity * 0.8,
            textAlign: 'center',
          }}>
          {label}
        </Typography>
      </Stack>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]}>
        {content}
      </Pressable>
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
};

/**
 * OrderCounts - Displays order statistics in a grid layout
 *
 * @example
 * <OrderCounts
 *   cancelled={20}
 *   completed={80}
 *   onItemPress={(status) => console.log(`Pressed: ${status}`)}
 * />
 */
const OrderCounts: React.FC<OrderCountsProps> = ({
  cancelled,
  completed,
  pending,
  active,
  failed,
  items,
  onItemPress,
  columns = 2,
  variant = 'cards',
  style,
}) => {
  const { theme } = useTheme();

  // Build items array from props or use custom items
  const orderItems: OrderCountItem[] = items || [
    ...(cancelled !== undefined
      ? [{ count: cancelled, label: 'Cancelled', status: 'cancelled' as const }]
      : []),
    ...(completed !== undefined
      ? [{ count: completed, label: 'Completed', status: 'completed' as const }]
      : []),
    ...(pending !== undefined
      ? [{ count: pending, label: 'Pending', status: 'pending' as const }]
      : []),
    ...(active !== undefined
      ? [{ count: active, label: 'Active', status: 'active' as const }]
      : []),
    ...(failed !== undefined
      ? [{ count: failed, label: 'Failed', status: 'failed' as const }]
      : []),
  ];

  // Split items into rows based on columns
  const rows: OrderCountItem[][] = [];
  for (let i = 0; i < orderItems.length; i += columns) {
    rows.push(orderItems.slice(i, i + columns));
  }

  if (variant === 'inline') {
    return (
      <Row gap="md" flexWrap="wrap" style={style}>
        {orderItems.map((item, index) => (
          <View key={index} style={{ width: `${100 / columns - 2}%` }}>
            <OrderCountCard
              count={item.count}
              label={item.label}
              status={item.status}
              onPress={() => onItemPress?.(item.status)}
            />
          </View>
        ))}
      </Row>
    );
  }

  return (
    <Stack gap="md" style={style}>
      {rows.map((row, rowIndex) => (
        <Row key={rowIndex} gap="md">
          {row.map((item, itemIndex) => (
            <OrderCountCard
              key={itemIndex}
              count={item.count}
              label={item.label}
              status={item.status}
              onPress={() => onItemPress?.(item.status)}
            />
          ))}
        </Row>
      ))}
    </Stack>
  );
};

export default OrderCounts;
