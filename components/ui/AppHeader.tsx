// AppHeader.tsx
import { View, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import React, { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-provider';
import { ArrowLeft, X, MoreVertical, Search, Bell, Menu } from 'lucide-react-native';
import Typography from './Typography';
import { Row, Stack } from '../layout/Layout';
import { spacing } from '@/theme/spacing';
import * as Haptics from 'expo-haptics';

type HeaderVariant = 'default' | 'transparent' | 'floating' | 'large';
type HeaderAlignment = 'left' | 'center';

interface AppHeaderProps {
  /**
   * Title text displayed in the header
   */
  title?: string;

  /**
   * Subtitle text displayed below title (for large variant)
   */
  subtitle?: string;

  /**
   * Custom title component (overrides title string)
   */
  titleComponent?: ReactNode;

  /**
   * Show back button on the left
   */
  showBackButton?: boolean;

  /**
   * Custom back button icon
   */
  backButtonIcon?: ReactNode;

  /**
   * Callback when back button is pressed
   */
  onBackPress?: () => void;

  /**
   * Show close button instead of back button
   */
  showCloseButton?: boolean;

  /**
   * Callback when close button is pressed
   */
  onClosePress?: () => void;

  /**
   * Left side custom component (overrides back/close button)
   */
  leftComponent?: ReactNode;

  /**
   * Right side component
   */
  rightComponent?: ReactNode;

  /**
   * Show search icon on the right
   */
  showSearch?: boolean;

  /**
   * Callback when search icon is pressed
   */
  onSearchPress?: () => void;

  /**
   * Show notification bell icon on the right
   */
  showNotification?: boolean;

  /**
   * Callback when notification icon is pressed
   */
  onNotificationPress?: () => void;

  /**
   * Show badge on notification icon
   */
  notificationBadge?: boolean;

  /**
   * Show menu icon on the right
   */
  showMenu?: boolean;

  /**
   * Callback when menu icon is pressed
   */
  onMenuPress?: () => void;

  /**
   * Show more options icon on the right
   */
  showMoreOptions?: boolean;

  /**
   * Callback when more options icon is pressed
   */
  onMoreOptionsPress?: () => void;

  /**
   * Variant of the header
   */
  variant?: HeaderVariant;

  /**
   * Title alignment
   */
  titleAlignment?: HeaderAlignment;

  /**
   * Custom background color
   */
  backgroundColor?: string;

  /**
   * Show border at the bottom
   */
  showBorder?: boolean;

  /**
   * Custom border color
   */
  borderColor?: string;

  /**
   * Show shadow
   */
  showShadow?: boolean;

  /**
   * Custom height (default varies by variant)
   */
  height?: number;

  /**
   * Disable safe area padding
   */
  disableSafeArea?: boolean;

  /**
   * Custom padding horizontal
   */
  paddingHorizontal?: number;

  /**
   * Additional content below header (for large variant)
   */
  children?: ReactNode;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

/**
 * AppHeader - Highly customizable and reusable header component
 *
 * @example
 * // Basic header with back button
 * <AppHeader
 *   title="Profile"
 *   showBackButton
 *   onBackPress={() => navigation.goBack()}
 * />
 *
 * // Header with search and notification
 * <AppHeader
 *   title="Dashboard"
 *   showSearch
 *   showNotification
 *   notificationBadge
 *   onSearchPress={handleSearch}
 *   onNotificationPress={handleNotifications}
 * />
 *
 * // Large header with subtitle
 * <AppHeader
 *   variant="large"
 *   title="Welcome Back"
 *   subtitle="John Doe"
 *   showMenu
 *   onMenuPress={handleMenu}
 * />
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  titleComponent,
  showBackButton = false,
  backButtonIcon,
  onBackPress,
  showCloseButton = false,
  onClosePress,
  leftComponent,
  rightComponent,
  showSearch = false,
  onSearchPress,
  showNotification = false,
  onNotificationPress,
  notificationBadge = false,
  showMenu = false,
  onMenuPress,
  showMoreOptions = false,
  onMoreOptionsPress,
  variant = 'default',
  titleAlignment = 'left',
  backgroundColor,
  showBorder = false,
  borderColor,
  showShadow = false,
  height,
  disableSafeArea = false,
  paddingHorizontal = spacing.lg,
  children,
  style,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate header height based on variant
  const getHeaderHeight = () => {
    if (height) return height;
    switch (variant) {
      case 'large':
        return 120;
      case 'floating':
        return 56;
      default:
        return 56;
    }
  };

  const headerHeight = getHeaderHeight();
  const topPadding = disableSafeArea ? 0 : insets.top;

  // Get background color
  const bgColor =
    backgroundColor || (variant === 'transparent' ? 'transparent' : theme.color.background);

  // Handle back press with haptic feedback
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBackPress?.();
  };

  const handleClosePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClosePress?.();
  };

  // Render left component
  const renderLeftComponent = () => {
    if (leftComponent) return leftComponent;

    if (showBackButton) {
      return (
        <Pressable onPress={handleBackPress} hitSlop={12}>
          {backButtonIcon || <ArrowLeft size={24} color={theme.color.foreground} />}
        </Pressable>
      );
    }

    if (showCloseButton) {
      return (
        <Pressable onPress={handleClosePress} hitSlop={12}>
          <X size={24} color={theme.color.foreground} />
        </Pressable>
      );
    }

    // Return empty view to maintain layout
    return <View style={{ width: 24 }} />;
  };

  // Render right component
  const renderRightComponent = () => {
    if (rightComponent) return rightComponent;

    const rightIcons: ReactNode[] = [];

    if (showSearch) {
      rightIcons.push(
        <Pressable key="search" onPress={onSearchPress} hitSlop={12}>
          <Search size={24} color={theme.color.foreground} />
        </Pressable>
      );
    }

    if (showNotification) {
      rightIcons.push(
        <Pressable key="notification" onPress={onNotificationPress} hitSlop={12}>
          <View style={{ position: 'relative' }}>
            <Bell size={24} color={theme.color.foreground} />
            {notificationBadge && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.color.error,
                  },
                ]}
              />
            )}
          </View>
        </Pressable>
      );
    }

    if (showMenu) {
      rightIcons.push(
        <Pressable key="menu" onPress={onMenuPress} hitSlop={12}>
          <Menu size={24} color={theme.color.foreground} />
        </Pressable>
      );
    }

    if (showMoreOptions) {
      rightIcons.push(
        <Pressable key="more" onPress={onMoreOptionsPress} hitSlop={12}>
          <MoreVertical size={24} color={theme.color.foreground} />
        </Pressable>
      );
    }

    if (rightIcons.length === 0) {
      return <View style={{ width: 24 }} />;
    }

    return <Row gap="lg">{rightIcons}</Row>;
  };

  // Render title
  const renderTitle = () => {
    if (titleComponent) return titleComponent;

    if (variant === 'large') {
      return (
        <Stack gap="xs">
          {title && (
            <Typography
              type="h3"
              color={theme.color.foreground}
              fontWeight="600"
              style={{
                fontFamily: 'Lexend_600SemiBold',
              }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography type="body" color={theme.color.mutedForeground}>
              {subtitle}
            </Typography>
          )}
        </Stack>
      );
    }

    return title ? (
      <Typography
        type="h6"
        color={theme.color.foreground}
        fontWeight="600"
        numberOfLines={1}
        style={{
          fontFamily: 'Lexend_500Medium',
        }}>
        {title}
      </Typography>
    ) : null;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingTop: topPadding,
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: borderColor || theme.color.border,
          ...(showShadow && styles.shadow),
          ...(variant === 'floating' && {
            marginHorizontal: spacing.base,
            marginTop: topPadding + spacing.sm,
            borderRadius: theme.radius.lg,
            ...styles.floating,
          }),
        },
        style,
      ]}>
      {/* Main Header Content */}
      <Row
        style={{
          height: headerHeight,
          paddingHorizontal: variant === 'floating' ? spacing.base : paddingHorizontal,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {/* Left Section */}
        <View style={styles.leftSection}>{renderLeftComponent()}</View>

        {/* Center/Title Section */}
        <View style={[styles.centerSection, titleAlignment === 'center' && styles.centerAligned]}>
          {renderTitle()}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>{renderRightComponent()}</View>
      </Row>

      {/* Additional Content (for large variant) */}
      {children && variant === 'large' && (
        <View style={{ paddingHorizontal: paddingHorizontal, paddingBottom: spacing.sm }}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
  },
  centerAligned: {
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  floating: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
