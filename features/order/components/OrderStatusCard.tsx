import { ViewStyle, StyleSheet, View, Pressable } from 'react-native';
import React, { useMemo, useState } from 'react';
import { useTheme } from '@/context/theme-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Badge, BadgeSeverity } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Row, Stack } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { Button, IconButton } from '@/components/ui/Button';
import { Package, MapPin, Phone, ChevronDown, ChevronUp, Clock } from 'lucide-react-native';
import { Linking } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import moment from 'moment';
import { OrderStatus } from '@/features/history/views/HistoryListView';

interface OrderStatusCardProps {
  /**
   * Order ID for tracking
   */
  orderId?: number;

  /**
   * Business name
   */
  name: string;

  /**
   * Location (local_gov_area, state)
   */
  location: string;

  /**
   * Order status
   */
  status: OrderStatus;

  /**
   * Contact person name (optional)
   */
  contactPerson?: string;

  /**
   * Phone number for calling
   */
  phoneNumber?: string;

  /**
   * Delivery address
   */
  deliveryAddress?: string;

  /**
   * Delivery notes
   */
  notes?: string;

  /**
   * Assigned date (ISO string)
   */
  assignedAt?: string;

  /**
   * Completed date (ISO string)
   */
  completedAt?: string;

  /**
   * Distance in km
   */
  distance?: number;

  /**
   * Order amount
   */
  amount?: number;

  /**
   * Callback when track button is pressed
   */
  onTrack?: () => void;

  /**
   * Callback when card is pressed
   */
  onPress?: () => void;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

/**
 * OrderStatusCard - Displays order status with bulk trader info and dynamic styling
 * Uses reusable Card and Button components
 * @example
 * <OrderStatusCard
 *   orderId={123}
 *   name="ABC Foods Limited"
 *   location="Lagos Island, Lagos"
 *   status="active"
 *   phoneNumber="+2348012345678"
 *   deliveryAddress="123 Market Street"
 *   distance={5.2}
 * />
 */
export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  orderId,
  name,
  location,
  status,
  contactPerson,
  phoneNumber,
  deliveryAddress,
  notes,
  assignedAt,
  completedAt,
  distance,
  amount,
  onTrack,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const heightValue = useSharedValue(0);

  const router = useRouter();

  const statusConfig = useMemo(() => {
    switch (status) {
      case 'active':
        return {
          badgeLabel: 'Active',
          badgeSeverity: 'success' as BadgeSeverity,
          showDistance: true,
          variant: 'filled' as const,
        };
      case 'completed':
        return {
          badgeLabel: 'Completed',
          badgeSeverity: 'success' as BadgeSeverity,
          showDistance: false,
          variant: 'filled' as const,
        };
      case 'cancelled':
        return {
          badgeLabel: 'Cancelled',
          badgeSeverity: 'error' as BadgeSeverity,
          showDistance: false,
          variant: 'filled' as const,
        };
      default:
        return {
          badgeLabel: 'Unknown',
          badgeSeverity: 'neutral' as BadgeSeverity,
          showDistance: false,
          variant: 'filled' as const,
        };
    }
  }, [status]);

  const handleCall = () => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleTrack = () => {
    if (orderId) {
      // come back here
      router.push(`/(protected)/track/[id]`);
    } else if (onTrack) {
      onTrack();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    heightValue.value = withTiming(isExpanded ? 0 : 1, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value === 0 ? 0 : 'auto',
    opacity: heightValue.value,
    overflow: 'hidden',
  }));

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return moment(dateString).format('MMM DD, YYYY • h:mm A');
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return null;
    return moment(dateString).fromNow();
  };

  return (
    <Card
      variant={statusConfig.variant}
      pressable={status !== 'active'}
      onPress={onPress}
      size="md"
      style={StyleSheet.flatten([style])}>
      <Stack gap="md">
        {/* Main Content */}
        <Row alignItems="center" justifyContent="space-between" gap="md">
          {/* Left Section: Icon + Info */}
          <Row alignItems="center" gap="md" flex={1}>
            {/* Package Icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: `${theme.color.primary}15`,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: `${theme.color.primary}30`,
              }}>
              <Package size={24} color={`${theme.color.primary}`} opacity={0.5} strokeWidth={2.5} />
            </View>

            {/* Business Info */}
            <Stack gap="xs" flex={1}>
              <Typography
                type="h6"
                color={theme.color.foreground}
                style={{
                  fontFamily: 'Inter_600SemiBold',
                }}
                numberOfLines={1}>
                {name}
              </Typography>

              <Row gap="xs" alignItems="center">
                <MapPin size={12} color={theme.color.mutedForeground} />
                <Typography
                  type="small"
                  color={theme.color.mutedForeground}
                  numberOfLines={1}
                  style={{ flex: 1 }}>
                  {location}
                </Typography>
              </Row>

              {/* Distance for active status */}
              {status === 'active' && distance !== undefined && (
                <Row gap="xs" alignItems="center">
                  <Typography type="small" color={theme.color.mutedForeground}>
                    Distance:
                  </Typography>
                  <Typography
                    type="small"
                    color={theme.color.foreground}
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                    }}>
                    {distance.toFixed(1)} km
                  </Typography>
                </Row>
              )}

              {/* Time info for all statuses */}
              {status === 'active' && assignedAt && (
                <Row gap="xs" alignItems="center">
                  <Clock size={12} color={theme.color.mutedForeground} />
                  <Typography type="xtraSmall" color={theme.color.mutedForeground}>
                    {getTimeAgo(assignedAt)}
                  </Typography>
                </Row>
              )}

              {status === 'completed' && completedAt && (
                <Row gap="xs" alignItems="center">
                  <Clock size={12} color={theme.color.mutedForeground} />
                  <Typography type="xtraSmall" color={theme.color.mutedForeground}>
                    {formatDate(completedAt)}
                  </Typography>
                </Row>
              )}

              {status === 'cancelled' && assignedAt && (
                <Row gap="xs" alignItems="center">
                  <Clock size={12} color={theme.color.mutedForeground} />
                  <Typography type="xtraSmall" color={theme.color.mutedForeground}>
                    {formatDate(assignedAt)}
                  </Typography>
                </Row>
              )}
            </Stack>
          </Row>

          {/* Right Section: Status Badge + Actions */}
          <Row alignItems="center" gap="sm">
            {status !== 'active' && (
              <Badge label={statusConfig.badgeLabel} severity={statusConfig.badgeSeverity} />
            )}

            {status === 'active' && (
              <>
                {phoneNumber && (
                  <IconButton
                    icon={<Phone size={18} color={theme.color.primary} />}
                    onPress={handleCall}
                    variant="ghost"
                    style={{
                      backgroundColor: `${theme.color.primary}10`,
                      borderRadius: 8,
                    }}
                  />
                )}
                <Button
                  label="Track"
                  onPress={handleTrack}
                  variant="primary"
                  size="sm"
                  icon={<MapPin size={16} color="#fff" />}
                  style={{ paddingHorizontal: 16 }}
                />
              </>
            )}

            {status !== 'active' && (
              <IconButton
                icon={
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={theme.color.mutedForeground}
                  />
                }
                onPress={onPress || (() => {})}
                variant="ghost"
              />
            )}
          </Row>
        </Row>

        {/* Amount Display (if available) */}
        {amount !== undefined && amount > 0 && status !== 'cancelled' && (
          <Row
            alignItems="center"
            justifyContent="space-between"
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: `${theme.color.success}10`,
              borderRadius: 8,
            }}>
            <Typography type="small" color={theme.color.mutedForeground}>
              Order Amount
            </Typography>
            <Typography
              type="body"
              color={theme.color.success}
              style={{ fontFamily: 'Inter_600SemiBold' }}>
              ₦{amount.toLocaleString()}
            </Typography>
          </Row>
        )}

        {/* Expandable Details Section */}
        {status === 'active' && (notes || deliveryAddress || contactPerson) && (
          <>
            <Pressable onPress={toggleExpand}>
              <Row
                alignItems="center"
                justifyContent="space-between"
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: `${theme.color.muted}90`,
                  borderRadius: 8,
                }}>
                <Typography
                  type="small"
                  color={theme.color.foreground}
                  style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Delivery Details
                </Typography>
                {isExpanded ? (
                  <ChevronUp size={16} color={theme.color.mutedForeground} />
                ) : (
                  <ChevronDown size={16} color={theme.color.mutedForeground} />
                )}
              </Row>
            </Pressable>

            <Animated.View style={animatedStyle}>
              <Stack
                gap="xs"
                style={{
                  paddingHorizontal: 12,
                  paddingTop: 8,
                }}>
                {contactPerson && (
                  <Row gap="xs">
                    <Typography
                      type="small"
                      color={theme.color.mutedForeground}
                      style={{ minWidth: 80 }}>
                      Contact:
                    </Typography>
                    <Typography type="small" color={theme.color.foreground} style={{ flex: 1 }}>
                      {contactPerson}
                    </Typography>
                  </Row>
                )}
                {deliveryAddress && (
                  <Row gap="xs">
                    <Typography
                      type="small"
                      color={theme.color.mutedForeground}
                      style={{ minWidth: 80 }}>
                      Address:
                    </Typography>
                    <Typography type="small" color={theme.color.foreground} style={{ flex: 1 }}>
                      {deliveryAddress}
                    </Typography>
                  </Row>
                )}
                {phoneNumber && (
                  <Row gap="xs">
                    <Typography
                      type="small"
                      color={theme.color.mutedForeground}
                      style={{ minWidth: 80 }}>
                      Phone:
                    </Typography>
                    <Typography type="small" color={theme.color.foreground} style={{ flex: 1 }}>
                      {phoneNumber}
                    </Typography>
                  </Row>
                )}
                {notes && (
                  <Row gap="xs">
                    <Typography
                      type="small"
                      color={theme.color.mutedForeground}
                      style={{ minWidth: 80 }}>
                      Notes:
                    </Typography>
                    <Typography type="small" color={theme.color.foreground} style={{ flex: 1 }}>
                      {notes}
                    </Typography>
                  </Row>
                )}
              </Stack>
            </Animated.View>
          </>
        )}
      </Stack>
    </Card>
  );
};
