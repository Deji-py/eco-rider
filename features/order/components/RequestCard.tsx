import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Row, Stack } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { Button, IconButton } from '@/components/ui/Button';
import { useTheme } from '@/context/theme-provider';
import { Package, MapPin, User, Phone, X, Check, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

interface RequestItem {
  name: string;
  quantity: number;
}

interface RequestCardProps {
  /**
   * Business name
   */
  businessName: string;

  /**
   * Location (local_gov_area, state)
   */
  location: string;

  /**
   * Contact person name
   */
  contactPerson?: string;

  /**
   * Phone number
   */
  phoneNumber?: string;

  /**
   * Delivery address
   */
  deliveryAddress?: string;

  /**
   * Items in the request
   */
  items?: RequestItem[];

  /**
   * Delivery notes
   */
  notes?: string;

  /**
   * Assignment ID
   */
  assignmentId: number;

  /**
   * Accept callback
   */
  onAccept: (assignmentId: number) => Promise<void>;

  /**
   * Decline callback
   */
  onDecline: (assignmentId: number, reason: string) => Promise<void>;
}

/**
 * RequestCard - Displays pending delivery request with accept/decline actions
 */
const RequestCard: React.FC<RequestCardProps> = ({
  businessName,
  location,
  contactPerson,
  phoneNumber,
  deliveryAddress,
  items = [],
  notes,
  assignmentId,
  onAccept,
  onDecline,
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);

  const handleViewDetails = () => {
    router.push(`/order/[id]`);
  };

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await onAccept(assignmentId);
    } catch (error) {
      console.error('Failed to accept:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async (reason: string) => {
    try {
      setIsDeclining(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await onDecline(assignmentId, reason);
      setShowDeclineReason(false);
    } catch (error) {
      console.error('Failed to decline:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <Card
      variant="filled"
      size="md"
      style={{
        borderWidth: 2,
        borderColor: `${theme.color.primary}30`,
        marginBottom: 12,
      }}>
      <Stack gap="md">
        {/* Header */}
        <Row justifyContent="space-between">
          <Row alignItems="center" gap="md" style={{ width: '60%' }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                backgroundColor: `${theme.color.primary}15`,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: `${theme.color.primary}30`,
              }}>
              <Package size={28} color={theme.color.primary} strokeWidth={2.5} />
            </View>

            <Stack flex={1} gap="xs">
              <Typography
                type="h6"
                color={theme.color.foreground}
                style={{ fontFamily: 'Inter_600SemiBold' }}>
                {businessName}
              </Typography>
              <Row gap="xs" alignItems="center">
                <MapPin size={14} color={theme.color.mutedForeground} />
                <Typography type="small" color={theme.color.mutedForeground}>
                  {location}
                </Typography>
              </Row>
            </Stack>
          </Row>

          <IconButton
            onPress={handleViewDetails}
            variant="ghost"
            icon={<ChevronRight size={24} color={theme.color.primary} />}
          />
        </Row>

        {/* Delivery Details */}
        <Stack
          gap="xs"
          style={{
            backgroundColor: `${theme.color.muted}50`,
            padding: 12,
            borderRadius: 8,
          }}>
          {contactPerson && (
            <Row gap="xs" alignItems="center">
              <User size={14} color={theme.color.mutedForeground} />
              <Typography type="small" color={theme.color.foreground}>
                {contactPerson}
              </Typography>
            </Row>
          )}

          {phoneNumber && (
            <Row gap="xs" alignItems="center">
              <Phone size={14} color={theme.color.mutedForeground} />
              <Typography type="small" color={theme.color.foreground}>
                {phoneNumber}
              </Typography>
            </Row>
          )}

          {deliveryAddress && (
            <Row gap="xs" alignItems="flex-start">
              <MapPin size={14} color={theme.color.mutedForeground} style={{ marginTop: 2 }} />
              <Typography type="small" color={theme.color.foreground} style={{ flex: 1 }}>
                {deliveryAddress}
              </Typography>
            </Row>
          )}

          {notes && (
            <View
              style={{
                marginTop: 4,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: theme.color.border,
              }}>
              <Typography
                type="small"
                color={theme.color.mutedForeground}
                style={{ fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
                Notes:
              </Typography>
              <Typography type="small" color={theme.color.foreground}>
                {notes}
              </Typography>
            </View>
          )}
        </Stack>

        {/* Items */}
        {items.length > 0 && (
          <Stack gap="xs">
            <Typography
              type="small"
              color={theme.color.mutedForeground}
              style={{ fontFamily: 'Inter_600SemiBold' }}>
              Items ({items.length}):
            </Typography>
            <Row flexWrap="wrap" gap="xs">
              {items.slice(0, 3).map((item, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: theme.color.muted,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}>
                  <Typography type="small" color={theme.color.foreground}>
                    {item.name} x{item.quantity}
                  </Typography>
                </View>
              ))}
              {items.length > 3 && (
                <View
                  style={{
                    backgroundColor: theme.color.muted,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}>
                  <Typography type="small" color={theme.color.mutedForeground}>
                    +{items.length - 3} more
                  </Typography>
                </View>
              )}
            </Row>
          </Stack>
        )}

        {/* Action Buttons */}
        {!showDeclineReason ? (
          <Row gap="sm">
            <Button
              label="Decline"
              onPress={() => setShowDeclineReason(true)}
              variant="ghost"
              size="md"
              icon={<X size={18} color={theme.color.error} />}
              style={{ flex: 1 }}
              disabled={isAccepting || isDeclining}
            />
            <Button
              label={isAccepting ? 'Accepting...' : 'Accept'}
              onPress={handleAccept}
              variant="primary"
              size="md"
              icon={
                isAccepting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Check size={18} color="#fff" />
                )
              }
              style={{ flex: 1 }}
              disabled={isAccepting || isDeclining}
            />
          </Row>
        ) : (
          <Stack gap="sm">
            <Typography
              type="small"
              color={theme.color.foreground}
              style={{ fontFamily: 'Inter_600SemiBold' }}>
              Select reason for declining:
            </Typography>
            <Stack gap="xs">
              {[
                'Too far from current location',
                'Vehicle not suitable',
                'Already at capacity',
                'Other commitment',
              ].map((reason) => (
                <Pressable
                  key={reason}
                  onPress={() => handleDecline(reason)}
                  disabled={isDeclining}
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed
                        ? `${theme.color.error}20`
                        : `${theme.color.error}10`,
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: `${theme.color.error}30`,
                    },
                  ]}>
                  <Typography type="small" color={theme.color.error}>
                    {reason}
                  </Typography>
                </Pressable>
              ))}
            </Stack>
            <Button
              label="Cancel"
              onPress={() => setShowDeclineReason(false)}
              variant="ghost"
              size="sm"
              disabled={isDeclining}
            />
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default RequestCard;
