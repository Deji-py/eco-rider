import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/auth-provider';
import { getProfileTimestamp } from '@/lib/utils';

// Type definitions
interface DispatchRiderProfile {
  id: number;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  distance_km: number;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  completed_deliveries: number;
  local_gov_area: string;
  state: string;
  created_at: string;
  firstname: string;
  lastname: string;
  phone_verified: boolean;
  profile_picture: string;
}

interface UseProfileReturn {
  profile: DispatchRiderProfile | undefined;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  isUpdating: boolean;
  updateProfile: (
    updates: Partial<DispatchRiderProfile>
  ) => Promise<{ success: boolean; error?: unknown }>;
  refetchProfile: () => Promise<{ success: boolean; error?: unknown }>;
  refreshProfile: () => Promise<{ success: boolean; error?: unknown }>;
  updateError: Error | null;
}

// Query functions (outside the hook)
const fetchProfile = async (userId: string): Promise<DispatchRiderProfile> => {
  const { data, error } = await supabase
    .from('dispatch_riders')
    .select('*')
    .eq('user_id', userId)
    .single();

  console.log('called');

  if (error) throw error;
  return data;
};

const updateProfileInDb = async (userId: string, updates: Partial<any>) => {
  const { data, error } = await supabase
    .from('dispatch_riders')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Hook
const useProfile = (): UseProfileReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch profile query
  const {
    data: profile,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['profile', user?.id, getProfileTimestamp()],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<any>) => updateProfileInDb(user!.id, updates),
    onSuccess: (updatedProfile) => {
      // Update cache immediately
      queryClient.setQueryData(['profile', user?.id], updatedProfile);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });

  // Helper functions
  const updateProfile = async (updates: Partial<any>) => {
    try {
      await updateMutation.mutateAsync(updates);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const refetchProfile = async () => {
    try {
      await queryClient.refetchQueries({
        queryKey: ['profile', user?.id],
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const refreshProfile = async () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    return refetchProfile();
  };

  return {
    // Data
    profile,
    isLoading,
    error,
    isFetching,
    isUpdating: updateMutation.isPending,

    // Functions
    updateProfile,
    refetchProfile,
    refreshProfile,

    // Mutation state if needed
    updateError: updateMutation.error,
  };
};

export default useProfile;
