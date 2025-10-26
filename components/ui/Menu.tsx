import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import React, { ReactNode } from 'react';
import { useTheme } from '@/context/theme-provider';
import Typography from '@/components/ui/Typography';
import { Row } from '@/components/layout/Layout';
import { spacing } from '@/theme/spacing';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// MenuItem Type
interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  badge?: number | string;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
  rightComponent?: ReactNode;
}

// ListItem Props
interface MenuListItemProps extends Omit<MenuItem, 'id'> {
  style?: ViewStyle;
  activeOpacity?: number;
  showDivider?: boolean;
  dividerColor?: string;
}

// MenuList Props
interface MenuListProps {
  items: MenuItem[];
  onItemPress?: (id: string) => void;
  spacing?: number;
  showDividers?: boolean;
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
}

/**
 * MenuListItem - Individual menu item component
 */
export const MenuListItem = React.forwardRef<typeof Pressable, MenuListItemProps>(
  (
    {
      label,
      icon,
      onPress,
      badge,
      variant = 'default',
      disabled = false,
      rightComponent,
      style,
      activeOpacity = 0.7,
      showDivider = false,
      dividerColor,
    },
    ref
  ) => {
    const { theme } = useTheme();

    const variantColor = {
      default: theme.color.foreground,
      danger: theme.color.error,
      success: theme.color.success,
    }[variant];

    const iconColor = disabled ? theme.color.mutedForeground : variantColor;

    return (
      <View>
        <Pressable
          ref={ref as any}
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.itemContainer,
            {
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.base,
              backgroundColor: pressed && !disabled ? theme.color.muted : 'transparent',
              opacity: disabled ? 0.5 : 1,
            },
            style,
          ]}>
          <Row alignItems="center" gap="md" flex={1}>
            {/* Icon */}
            {icon && (
              <View style={{ opacity: disabled ? 0.6 : 1 }}>
                {React.isValidElement(icon) &&
                  React.cloneElement(icon as React.ReactElement<any>, {
                    color: iconColor,
                    size: 24,
                  })}
              </View>
            )}

            {/* Label */}
            <Typography
              type="body"
              fontWeight="500"
              color={variantColor}
              style={{ opacity: disabled ? 0.6 : 1, flex: 1 }}>
              {label}
            </Typography>

            {/* Badge */}
            {badge && (
              <View
                style={{
                  backgroundColor: theme.color.primary,
                  borderRadius: 12,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  marginHorizontal: spacing.xs,
                }}>
                <Typography type="small" color={theme.color.primaryForeground} fontWeight="600">
                  {badge}
                </Typography>
              </View>
            )}

            {/* Right Component or Chevron */}
            {rightComponent ? (
              <View>{rightComponent}</View>
            ) : (
              <ChevronRight
                size={20}
                color={disabled ? theme.color.mutedForeground : theme.color.mutedForeground}
              />
            )}
          </Row>
        </Pressable>

        {/* Divider */}
        {showDivider && (
          <View
            style={{
              height: 1,
              backgroundColor: dividerColor || theme.color.border,
              marginHorizontal: spacing.base,
            }}
          />
        )}
      </View>
    );
  }
);

MenuListItem.displayName = 'MenuListItem';

/**
 * MenuList - Container component for menu items
 */
export const MenuList = React.forwardRef<View, MenuListProps>(
  (
    {
      items,
      onItemPress,
      spacing: itemSpacing = 0,
      showDividers = true,
      containerStyle,
      itemStyle,
    },
    ref
  ) => {
    const { theme } = useTheme();

    const handleItemPress = (id: string, onPress?: () => void) => {
      onPress?.();
      onItemPress?.(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <View
        ref={ref}
        style={[
          {
            backgroundColor: theme.color.cardBackground,
            borderRadius: 12,
            overflow: 'hidden',
          },
          containerStyle,
        ]}>
        {items.map((item, index) => (
          <View
            key={item.id}
            style={{
              marginBottom: itemSpacing,
            }}>
            <MenuListItem
              label={item.label}
              icon={item.icon}
              onPress={() => handleItemPress(item.id, item.onPress)}
              badge={item.badge}
              variant={item.variant}
              disabled={item.disabled}
              rightComponent={item.rightComponent}
              style={itemStyle}
              showDivider={showDividers && index < items.length - 1}
            />
          </View>
        ))}
      </View>
    );
  }
);

MenuList.displayName = 'MenuList';

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    justifyContent: 'center',
  },
});

export type { MenuItem, MenuListProps, MenuListItemProps };
