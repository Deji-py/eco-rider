import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/auth-provider';

// Type definitions
interface OrderStats {
  cancelled: number;
  completed: number;
  pending: number;
  active: number;
  failed: number;
}

interface MonthlyOrder {
  month: string;
  year: number;
  count: number;
  label: string;
}

interface AnalyticsData {
  totalDeliveries: number;
  rating: number;
  reviewCount: number;
  orderStats: OrderStats;
  monthlyOrders: MonthlyOrder[];
}

interface UseAnalyticsReturn {
  analytics: AnalyticsData | undefined;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  refetch: () => void;
}

// Query functions
const fetchAnalytics = async (userId: string): Promise<AnalyticsData> => {
  // Fetch dispatch rider profile for basic stats
  const { data: profile, error: profileError } = await supabase
    .from('dispatch_riders')
    .select('rating, completed_deliveries, id')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;

  // Fetch dispatch assignments for detailed analytics
  const { data: assignments, error: assignmentsError } = await supabase
    .from('dispatch_assignments')
    .select('status, delivery_time, assigned_at')
    .eq('dispatch_rider_id', profile.id);

  if (assignmentsError) throw assignmentsError;

  // Calculate order stats
  const orderStats: OrderStats = {
    cancelled: 0,
    completed: 0,
    pending: 0,
    active: 0,
    failed: 0,
  };

  assignments?.forEach((assignment) => {
    if (assignment.status === 'delivered') {
      orderStats.completed++;
    } else if (assignment.status === 'assigned') {
      orderStats.pending++;
    } else if (assignment.status === 'picked_up' || assignment.status === 'in_transit') {
      orderStats.active++;
    }
  });

  // Calculate monthly orders (last 6 months)
  const now = new Date();
  const monthlyOrdersMap = new Map<string, number>();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyOrdersMap.set(key, 0);
  }

  // Count assignments by month
  assignments?.forEach((assignment) => {
    const date = new Date(assignment.assigned_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (monthlyOrdersMap.has(key)) {
      monthlyOrdersMap.set(key, (monthlyOrdersMap.get(key) || 0) + 1);
    }
  });

  // Convert to array
  const monthlyOrders: MonthlyOrder[] = Array.from(monthlyOrdersMap.entries()).map(
    ([key, count]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        month: monthNames[month],
        year,
        count,
        label: monthNames[month],
      };
    }
  );

  // Calculate review count (completed deliveries = reviews for now)
  const reviewCount = orderStats.completed;

  return {
    totalDeliveries: profile.completed_deliveries || 0,
    rating: profile.rating || 0,
    reviewCount,
    orderStats,
    monthlyOrders,
  };
};

// Hook
const useAnalytics = (): UseAnalyticsReturn => {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: () => fetchAnalytics(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analytics,
    isLoading,
    error,
    isFetching,
    refetch,
  };
};

export default useAnalytics;
