import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';

// Type definitions
interface DispatchAssignment {
  id: number;
  bulk_food_request_id: number;
  dispatch_rider_id: number;
  assigned_at: string;
  pickup_time: string | null;
  delivery_time: string | null;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  notes: string | null;
  aggregator_name: string;
  aggregator_address: string;
  aggregator_latitude: number;
  aggregator_longitude: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  pickup_code: string;
  delivery_code: string;
}

interface UseAssignmentReturn {
  assignment: DispatchAssignment | undefined;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  isUpdating: boolean;
  updateAssignmentStatus: (
    assignmentId: string,
    status: 'picked_up' | 'delivered',
    code: string
  ) => Promise<{ success: boolean; error?: unknown }>;
  refetchAssignment: () => Promise<{ success: boolean; error?: unknown }>;
}

// Query function
const fetchAssignment = async (assignmentId: string): Promise<DispatchAssignment> => {
  const { data, error } = await supabase
    .from('dispatch_assignments')
    .select(
      `
      *,
      bulk_food_request:bulk_food_request_id (
        pickup_code,
        delivery_code,
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        aggregator:aggregator_id (
          business_name,
          business_address,
          latitude,
          longitude
        )
      )
    `
    )
    .eq('id', assignmentId)
    .single();

  if (error) throw error;

  // Transform nested data
  const transformed: DispatchAssignment = {
    ...data,
    aggregator_name: data.bulk_food_request.aggregator.business_name,
    aggregator_address: data.bulk_food_request.aggregator.business_address,
    aggregator_latitude: data.bulk_food_request.aggregator.latitude,
    aggregator_longitude: data.bulk_food_request.aggregator.longitude,
    delivery_address: data.bulk_food_request.delivery_address,
    delivery_latitude: data.bulk_food_request.delivery_latitude,
    delivery_longitude: data.bulk_food_request.delivery_longitude,
    pickup_code: data.bulk_food_request.pickup_code,
    delivery_code: data.bulk_food_request.delivery_code,
  };

  return transformed;
};

// Update assignment function
const updateAssignmentInDb = async (
  assignmentId: string,
  status: 'picked_up' | 'delivered',
  code: string
) => {
  // First, fetch the assignment to verify the code
  const { data: assignment, error: fetchError } = await supabase
    .from('dispatch_assignments')
    .select(
      `
      *,
      bulk_food_request:bulk_food_request_id (
        pickup_code,
        delivery_code
      )
    `
    )
    .eq('id', assignmentId)
    .single();

  if (fetchError) throw fetchError;

  // Verify code matches
  const correctCode =
    status === 'picked_up'
      ? assignment.bulk_food_request.pickup_code
      : assignment.bulk_food_request.delivery_code;

  if (code !== correctCode) {
    throw new Error('Invalid verification code');
  }

  // Prepare update data
  const updateData: any = {
    status: status,
  };

  if (status === 'picked_up') {
    updateData.pickup_time = new Date().toISOString();
  } else if (status === 'delivered') {
    updateData.delivery_time = new Date().toISOString();
  }

  // Update assignment
  const { data, error } = await supabase
    .from('dispatch_assignments')
    .update(updateData)
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;

  // If delivered, update rider stats
  if (status === 'delivered') {
    const { error: riderError } = await supabase.rpc('increment_rider_deliveries', {
      rider_id: assignment.dispatch_rider_id,
    });

    if (riderError) console.error('Failed to update rider stats:', riderError);

    // Also set rider back to available
    await supabase
      .from('dispatch_riders')
      .update({ status: 'available' })
      .eq('id', assignment.dispatch_rider_id);
  }

  return data;
};

// Hook
const useAssignment = (assignmentId: string): UseAssignmentReturn => {
  const queryClient = useQueryClient();

  // Fetch assignment query
  const {
    data: assignment,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => fetchAssignment(assignmentId),
    enabled: !!assignmentId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  // Update assignment mutation
  const updateMutation = useMutation({
    mutationFn: ({ status, code }: { status: 'picked_up' | 'delivered'; code: string }) =>
      updateAssignmentInDb(assignmentId, status, code),
    onSuccess: (updatedAssignment) => {
      // Update cache
      queryClient.setQueryData(['assignment', assignmentId], updatedAssignment);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Failed to update assignment:', error);
    },
  });

  // Helper functions
  const updateAssignmentStatus = async (
    assignmentId: string,
    status: 'picked_up' | 'delivered',
    code: string
  ) => {
    try {
      await updateMutation.mutateAsync({ status, code });
      return { success: true };
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, error };
    }
  };

  const refetchAssignment = async () => {
    try {
      await queryClient.refetchQueries({
        queryKey: ['assignment', assignmentId],
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    assignment,
    isLoading,
    error,
    isFetching,
    isUpdating: updateMutation.isPending,
    updateAssignmentStatus,
    refetchAssignment,
  };
};

export default useAssignment;
