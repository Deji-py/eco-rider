import { radius } from '@/theme/radius';
import { OrderStatusCard } from '../components/OrderStatusCard';
import { Stack } from '@/components/layout/Layout';
import { spacing } from '@/theme/spacing';
import { View } from 'react-native';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { Package } from 'lucide-react-native';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useRouter } from 'expo-router';
import useOrders from '../hooks/useOrders';

// Loading State Component
const QuickActionLoading = () => {
  return (
    <Stack
      gap="xs"
      style={{
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: radius.base,
        padding: spacing.xs,
        borderColor: 'hsla(20, 18%, 70%, 1.00)',
      }}>
      <SkeletonCard height={100} />
    </Stack>
  );
};

// Empty State Component
const QuickActionEmpty = () => {
  const { theme } = useTheme();

  return (
    <Stack
      gap="xs"
      style={{
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: radius.base,
        padding: spacing.md,
        borderColor: 'hsla(20, 18%, 70%, 1.00)',
      }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 20,
        }}>
        <Package size={32} color={theme.color.mutedForeground} opacity={0.3} />
        <Typography
          type="small"
          color={theme.color.mutedForeground}
          style={{ marginTop: 8, opacity: 0.6 }}>
          No active orders
        </Typography>
      </View>
    </Stack>
  );
};

const QuickActionView = () => {
  const { activeOrders, isLoading } = useOrders();
  const router = useRouter();

  // Show loading state
  if (isLoading) {
    return <QuickActionLoading />;
  }

  // Show empty state if no active orders
  if (!activeOrders || activeOrders.length === 0) {
    return <QuickActionEmpty />;
  }

  // Calculate distance (placeholder - you can integrate actual distance calculation)
  const calculateDistance = (order: any) => {
    // TODO: Implement actual distance calculation using rider location and delivery address
    return '12km away';
  };

  return (
    <Stack
      gap="sm"
      style={{
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: radius.base,
        padding: spacing.xs,
        borderColor: 'hsla(20, 18%, 70%, 1.00)',
      }}>
      {activeOrders.map((order) => {
        const trader = order.bulk_food_request?.bulk_traders;
        const request = order.bulk_food_request;

        return (
          <OrderStatusCard
            key={order.id}
            name={trader?.business_name || 'Unknown Business'}
            location={`${trader?.local_gov_area || 'Unknown'}, ${trader?.state || 'Unknown'}`}
            status="active"
            contactPerson={trader?.contact_person}
            phoneNumber={trader?.phone_numbers}
            deliveryAddress={request?.delivery_address}
            notes={order.notes || request?.delivery_notes}
            distance={parseInt(calculateDistance(order))}
            onTrack={() => {
              // Navigate to tracking screen with order ID
              router.push(`/(protected)/track/[id]`);
            }}
          />
        );
      })}
    </Stack>
  );
};

export default QuickActionView;
