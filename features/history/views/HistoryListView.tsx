import { useState } from 'react';
import { View, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { OrderStatusCard } from '@/features/order/components/OrderStatusCard';
import HistoryFilter from '../components/HistoryFilter';
import { Card } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { spacing } from '@/theme/spacing';
import { Package } from 'lucide-react-native';
import useHistory from '../hooks/useHistory';

export type OrderStatus =
  | 'all'
  | 'assigned'
  | 'picked_up'
  | 'delivered'
  | 'cancelled'
  | 'completed'
  | 'in_transit'
  | 'pending'
  | 'active';
type SortBy = 'recent' | 'oldest' | 'amount-high' | 'amount-low';

const HistoryListView = () => {
  const { theme } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [selectedSort, setSelectedSort] = useState<SortBy>('recent');
  const [refreshing, setRefreshing] = useState(false);

  const { orders, isLoading, isFetching, refetchHistory, totalOrders } = useHistory({
    status: selectedStatus,
    sortBy: selectedSort,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchHistory();
    setRefreshing(false);
  };

  // Map status from API to component status
  const mapStatus = (apiStatus: string): 'completed' | 'pending' | 'cancelled' => {
    if (apiStatus === 'delivered') return 'completed';
    if (apiStatus === 'assigned' || apiStatus === 'picked_up' || apiStatus === 'in_transit')
      return 'pending';
    return 'cancelled';
  };

  // Loading state
  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <ActivityIndicator size="large" color={theme.color.primary} />
        <Typography type="body" style={{ marginTop: spacing.md }}>
          Loading order history...
        </Typography>
      </View>
    );
  }

  // Empty state
  const EmptyState = () => (
    <Card variant="outlined" style={{ marginTop: spacing.lg }}>
      <View style={{ alignItems: 'center', paddingVertical: spacing['3xl'] }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.color.muted,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}>
          <Package size={40} color={theme.color.mutedForeground} />
        </View>
        <Typography
          type="body"
          fontWeight="600"
          style={{ marginBottom: spacing.xs, textAlign: 'center' }}>
          {selectedStatus === 'all' ? 'No Orders Yet' : 'No Orders Found'}
        </Typography>
        <Typography
          type="small"
          color={theme.color.mutedForeground}
          style={{ textAlign: 'center', paddingHorizontal: spacing.xl }}>
          {selectedStatus === 'all'
            ? "You haven't completed any deliveries yet"
            : `No ${selectedStatus} orders found. Try adjusting your filters.`}
        </Typography>
      </View>
    </Card>
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <HistoryFilter
          selectedStatus={selectedStatus as any}
          selectedSort={selectedSort}
          onStatusChange={setSelectedStatus}
          onSortChange={setSelectedSort}
          totalCount={totalOrders}
        />
      }
      ListEmptyComponent={<EmptyState />}
      renderItem={({ item }) => (
        <OrderStatusCard
          location={item.delivery_address}
          name={item.customer_name}
          status={mapStatus(item.status)}
          // avatarUri={item.customer_avatar as string}
          distance={item.distance_km}
          assignedAt={item.assigned_at}
          completedAt={item.delivery_time as string}
        />
      )}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.color.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        isFetching && !refreshing ? (
          <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={theme.color.primary} />
          </View>
        ) : null
      }
    />
  );
};

export default HistoryListView;
