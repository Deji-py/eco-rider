import React from 'react';
import { Card } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { Row, Stack } from '@/components/layout/Layout';
import { useTheme } from '@/context/theme-provider';
import { Package, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Skeleton, SkeletonCircle } from '@/components/ui/Skeleton';
import { View } from 'react-native';

interface TotalDeliveriesCardProps {
  /**
   * Total number of deliveries
   */
  totalDeliveries: number;

  /**
   * Average rating (out of 5)
   */
  rating: number;

  /**
   * Total number of reviews
   */
  reviewCount: number;

  /**
   * Illustration image source (optional)
   */
  illustrationSource?: any;

  /**
   * Callback when card is pressed
   */
  onPress?: () => void;

  /**
   * Loading state
   */
  isLoading?: boolean;
}

/**
 * StarRating - Displays star rating component
 */
const StarRating: React.FC<{ rating: number; maxStars?: number }> = ({ rating, maxStars = 5 }) => {
  const { theme } = useTheme();
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <Row gap="xs" alignItems="center">
      {[...Array(maxStars)].map((_, index) => {
        const isFilled = index < fullStars;
        const isHalf = index === fullStars && hasHalfStar;

        return (
          <Star
            key={index}
            size={14}
            color={isFilled || isHalf ? '#FF9500' : theme.color.border}
            fill={isFilled || isHalf ? '#FF9500' : 'transparent'}
            strokeWidth={2}
          />
        );
      })}
    </Row>
  );
};

/**
 * TotalDeliveriesCard - Displays delivery statistics with rating
 *
 * @example
 * <TotalDeliveriesCard
 *   totalDeliveries={234}
 *   rating={4.5}
 *   reviewCount={200}
 *   onPress={() => console.log('View details')}
 * />
 */
export const TotalDeliveriesCard: React.FC<TotalDeliveriesCardProps> = ({
  totalDeliveries,
  rating,
  reviewCount,
  onPress,
  isLoading,
}) => {
  const { theme } = useTheme();

  // Loading state
  if (isLoading) {
    return (
      <Card
        variant="filled"
        size="sm"
        style={{ overflow: 'hidden', borderWidth: 0.5, borderColor: theme.color.border }}
        showShadow>
        <Row justifyContent="space-between" alignItems="center">
          <Stack gap="xs" flex={1}>
            <Skeleton width="50%" height={14} />
            <Row gap="xs" alignItems="center" style={{ marginVertical: 4 }}>
              {[...Array(5)].map((_, i) => (
                <SkeletonCircle key={i} width={14} height={14} />
              ))}
            </Row>
            <Skeleton width="40%" height={32} />
          </Stack>
        </Row>
      </Card>
    );
  }

  return (
    <Card
      variant="filled"
      size="sm"
      pressable={!!onPress}
      style={{ overflow: 'hidden', borderWidth: 4, borderColor: theme.color.border }}
      onPress={onPress}
      showShadow>
      <Row justifyContent="space-between" alignItems="center">
        {/* Left Section - Stats */}

        {totalDeliveries === 0 ? (
          <Row justifyContent="space-between" alignItems="center">
            <Stack gap="xs" flex={1}>
              <Typography type="small" color={theme.color.mutedForeground} style={{ opacity: 0.8 }}>
                Total Deliveries
              </Typography>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  paddingVertical: 12,
                }}>
                <Row gap="xs" alignItems="center">
                  <Package size={16} color={theme.color.mutedForeground} opacity={0.8} />
                  <Typography
                    type="body"
                    color={theme.color.mutedForeground}
                    style={{ opacity: 0.9 }}>
                    No deliveries yet
                  </Typography>
                </Row>
                <Typography
                  type="small"
                  color={theme.color.mutedForeground}
                  style={{ opacity: 0.6, marginTop: 4 }}>
                  Start by completing deliveries
                </Typography>
              </View>
            </Stack>
          </Row>
        ) : (
          <Stack gap="xs" flex={1}>
            {/* Title */}
            <Typography type="small" color={theme.color.mutedForeground} style={{ opacity: 0.8 }}>
              Total Deliveries
            </Typography>

            {/* Rating */}
            <Row gap="xs" alignItems="center">
              <StarRating rating={rating} />
              <Typography
                style={{ marginLeft: 4 }}
                type="body"
                color={theme.color.foreground}
                fontWeight="600">
                {rating.toFixed(1)}
              </Typography>
              <Typography type="small" color={theme.color.mutedForeground} style={{ opacity: 0.6 }}>
                ({reviewCount})
              </Typography>
            </Row>

            {/* Total Count */}
            <Typography
              type="display"
              color={theme.color.foreground}
              style={{
                fontSize: 34,
                fontFamily: 'Inter_700Bold',
              }}>
              {totalDeliveries}
            </Typography>
          </Stack>
        )}

        <Image
          alt="dispatch-rider"
          style={{
            right: 0,
            bottom: 0,
            position: 'absolute',
            width: 160,
            height: 100,
            transform: [{ translateY: 30 }],
          }}
          source={require('../../../assets/images/dispatch.png')}
        />
      </Row>
    </Card>
  );
};

export default TotalDeliveriesCard;
