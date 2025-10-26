import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/auth-provider';
import { useEffect } from 'react';

// Type definitions
interface BulkTrader {
  id: number;
  user_id: string;
  business_name: string;
  business_address: string;
  contact_person: string;
  phone_numbers: string;
  local_gov_area: string;
  state: string;
}

interface BulkFoodRequest {
  id: number;
  bulk_trader_id: number;
  items: any[];
  delivery_address: string;
  delivery_notes?: string;
  status: string;
  created_at: string;
}

interface DispatchAssignment {
  id: number;
  bulk_food_request_id: number;
  dispatch_rider_id: number;
  assigned_at: string;
  pickup_time?: string;
  delivery_time?: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  notes?: string;
  bulk_food_request: BulkFoodRequest & {
    bulk_traders: BulkTrader;
  };
}

interface UseOrdersReturn {
  activeOrders: DispatchAssignment[];
  pendingRequests: DispatchAssignment[];
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  acceptOrder: (assignmentId: number) => Promise<{ success: boolean; error?: unknown }>;
  rejectOrder: (
    assignmentId: number,
    reason: string
  ) => Promise<{ success: boolean; error?: unknown }>;
  updateOrderStatus: (
    assignmentId: number,
    status: DispatchAssignment['status']
  ) => Promise<{ success: boolean; error?: unknown }>;
  refetch: () => void;
}

// Query functions
const fetchActiveOrders = async (riderId: number): Promise<DispatchAssignment[]> => {
  const { data, error } = await supabase
    .from('dispatch_assignments')
    .select(
      `
      *,
      bulk_food_request:bulk_food_request_id (
        *,
        bulk_traders:bulk_trader_id (*)
      )
    `
    )
    .eq('dispatch_rider_id', riderId)
    .in('status', ['picked_up', 'in_transit'])
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchPendingRequests = async (riderId: number): Promise<DispatchAssignment[]> => {
  const { data, error } = await supabase
    .from('dispatch_assignments')
    .select(
      `
      *,
      bulk_food_request:bulk_food_request_id (
        *,
        bulk_traders:bulk_trader_id (*)
      )
    `
    )
    .eq('dispatch_rider_id', riderId)
    .eq('status', 'assigned')
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const acceptOrderInDb = async (assignmentId: number) => {
  const { data, error } = await supabase
    .from('dispatch_assignments')
    .update({ status: 'picked_up', pickup_time: new Date().toISOString() })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const rejectOrderInDb = async (assignmentId: number, reason: string) => {
  const { data, error } = await supabase
    .from('dispatch_assignments')
    .update({
      status: 'cancelled',
      notes: reason,
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateOrderStatusInDb = async (
  assignmentId: number,
  status: DispatchAssignment['status']
) => {
  const updates: any = { status };

  if (status === 'delivered') {
    updates.delivery_time = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('dispatch_assignments')
    .update(updates)
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Hook
const useOrders = (): UseOrdersReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get rider ID from profile
  const { data: riderProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispatch_riders')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const riderId = riderProfile?.id;

  // Fetch active orders
  const {
    data: activeOrders = [],
    isLoading: isLoadingActive,
    error: errorActive,
    isFetching: isFetchingActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ['active-orders', riderId],
    queryFn: () => fetchActiveOrders(riderId!),
    enabled: !!riderId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Fetch pending requests
  const {
    data: pendingRequests = [],
    isLoading: isLoadingPending,
    error: errorPending,
    isFetching: isFetchingPending,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ['pending-requests', riderId],
    queryFn: () => fetchPendingRequests(riderId!),
    enabled: !!riderId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Real-time subscription
  useEffect(() => {
    if (!riderId) return;

    const channel = supabase
      .channel('dispatch-assignments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispatch_assignments',
          filter: `dispatch_rider_id=eq.${riderId}`,
        },
        (payload) => {
          console.log('Order update received:', payload);
          // Invalidate and refetch queries
          queryClient.invalidateQueries({ queryKey: ['active-orders', riderId] });
          queryClient.invalidateQueries({ queryKey: ['pending-requests', riderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [riderId, queryClient]);

  // Accept order mutation
  const acceptMutation = useMutation({
    mutationFn: acceptOrderInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-orders', riderId] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests', riderId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', user?.id] });
    },
  });

  // Reject order mutation
  const rejectMutation = useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: number; reason: string }) =>
      rejectOrderInDb(assignmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests', riderId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', user?.id] });
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      assignmentId,
      status,
    }: {
      assignmentId: number;
      status: DispatchAssignment['status'];
    }) => updateOrderStatusInDb(assignmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-orders', riderId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', user?.id] });
    },
  });

  // Helper functions
  const acceptOrder = async (assignmentId: number) => {
    try {
      await acceptMutation.mutateAsync(assignmentId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const rejectOrder = async (assignmentId: number, reason: string) => {
    try {
      await rejectMutation.mutateAsync({ assignmentId, reason });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateOrderStatus = async (assignmentId: number, status: DispatchAssignment['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ assignmentId, status });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const refetch = () => {
    refetchActive();
    refetchPending();
  };

  return {
    activeOrders,
    pendingRequests,
    isLoading: isLoadingActive || isLoadingPending,
    error: (errorActive || errorPending) as Error | null,
    isFetching: isFetchingActive || isFetchingPending,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    refetch,
  };
};

export default useOrders;
export type { DispatchAssignment, BulkTrader, BulkFoodRequest };
