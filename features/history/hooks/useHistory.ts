import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/auth-provider';
import { useMemo } from 'react';
import useProfileStore from '@/features/profile/store/profile.store';
import { OrderStatus } from '../views/HistoryListView';

type SortBy = 'recent' | 'oldest' | 'amount-high' | 'amount-low';

interface OrderHistoryItem {
  id: number;
  bulk_food_request_id: number;
  dispatch_rider_id: number;
  assigned_at: string;
  pickup_time: string | null;
  delivery_time: string | null;
  status: OrderStatus;
  notes: string | null;
  customer_name: string;
  customer_avatar: string | null;
  delivery_address: string;
  aggregator_name: string;
  distance_km: number;
  amount: number;
}

interface UseHistoryParams {
  status?: OrderStatus;
  sortBy?: SortBy;
}

interface UseHistoryReturn {
  orders: OrderHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  refetchHistory: () => Promise<void>;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

// Query function
const fetchOrderHistory = async (riderId: number): Promise<OrderHistoryItem[]> => {
  const { data, error } = await supabase
    .from('dispatch_assignments')
    .select(
      `
      *,
      bulk_food_request:bulk_food_request_id (
        customer_name,
        customer_avatar,
        delivery_address,
        distance_km,
        amount,
        aggregator:aggregator_id (
          business_name
        )
      )
    `
    )
    .eq('dispatch_rider_id', riderId)
    .order('assigned_at', { ascending: false });

  if (error) throw error;

  // Transform nested data
  return data.map((assignment) => ({
    ...assignment,
    customer_name: assignment.bulk_food_request.customer_name || 'Customer',
    customer_avatar: assignment.bulk_food_request.customer_avatar,
    delivery_address: assignment.bulk_food_request.delivery_address,
    aggregator_name: assignment.bulk_food_request.aggregator.business_name,
    distance_km: assignment.bulk_food_request.distance_km || 0,
    amount: assignment.bulk_food_request.amount || 0,
  }));
};

// Hook
const useHistory = ({
  status = 'all',
  sortBy = 'recent',
}: UseHistoryParams = {}): UseHistoryReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { profile } = useProfileStore();

  // Fetch order history
  const {
    data: orders = [],
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['orderHistory', profile?.id],
    queryFn: () => fetchOrderHistory(profile!.id),
    enabled: !!profile?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter((order) => {
        if (status === 'assigned') return order.status === 'assigned';
        if (status === 'picked_up')
          return order.status === 'picked_up' || order.status === 'in_transit';
        if (status === 'delivered') return order.status === 'delivered';
        if (status === 'cancelled') return order.notes?.includes('cancelled');
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime();
        case 'oldest':
          return new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime();
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, status, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.notes?.includes('cancelled')).length;

    return { total, completed, cancelled };
  }, [orders]);

  const refetchHistory = async () => {
    await queryClient.refetchQueries({
      queryKey: ['orderHistory', profile?.id],
    });
  };

  return {
    orders: filteredAndSortedOrders,
    isLoading,
    error,
    isFetching,
    refetchHistory,
    totalOrders: stats.total,
    completedOrders: stats.completed,
    cancelledOrders: stats.cancelled,
  };
};

export default useHistory;
