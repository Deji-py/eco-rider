import { Stack } from '@/components/layout/Layout';
import TotalDeliveriesCard from '../components/TotalDeliveriesCard';
import OrderCounts from '../components/OrderCounts';
import MonthlyOrdersChart, { MonthlyOrder } from '../components/MonthlyOrderCharts';
import { View } from 'react-native';
import Typography from '@/components/ui/Typography';
import { SkeletonCard } from '@/components/ui/Skeleton';
import useAnalytics from '../hooks/useAnalytics';

// Loading State Component
const AnalyticsLoading = () => {
  return (
    <Stack spacingVertical="sm" gap="sm">
      <SkeletonCard height={120} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <SkeletonCard height={100} style={{ flex: 1 }} />
        <SkeletonCard height={100} style={{ flex: 1 }} />
      </View>
      <SkeletonCard height={280} />
    </Stack>
  );
};

const AnalyticsView = () => {
  const { analytics, isLoading, error } = useAnalytics();

  // Show loading state
  if (isLoading) {
    return <AnalyticsLoading />;
  }

  // Show error state
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 60,
        }}>
        <Typography type="body" color="#FF3B30">
          Failed to load analytics
        </Typography>
      </View>
    );
  }

  return (
    <Stack gap="sm">
      <TotalDeliveriesCard
        rating={analytics?.rating as number}
        reviewCount={analytics?.reviewCount as number}
        totalDeliveries={analytics?.totalDeliveries as number}
      />
      <OrderCounts
        columns={2}
        cancelled={analytics?.orderStats.cancelled as number}
        completed={analytics?.orderStats.completed as number}
        pending={analytics?.orderStats.pending as number}
        active={analytics?.orderStats.active as number}
      />

      <MonthlyOrdersChart monthlyOrders={analytics?.monthlyOrders as MonthlyOrder[]} />
    </Stack>
  );
};

export default AnalyticsView;
