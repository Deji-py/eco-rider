// hooks/useVehicleTypes.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { SelectOption } from '@/components/ui/SelectInput';

interface VehicleType {
  id: number;
  name: string;
  capacity: number | null;
  image: string | null;
  created_at: string;
}

const fetchVehicleTypes = async (): Promise<VehicleType[]> => {
  const { data, error } = await supabase
    .from('vehicle_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const useVehicleTypes = () => {
  const {
    data: vehicleTypes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vehicle-types'],
    queryFn: fetchVehicleTypes,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  // Convert to SelectOption format
  const vehicleTypeOptions: SelectOption[] = vehicleTypes?.map((vt) => ({
    label: vt.name,
    value: vt.name.toLowerCase().replace(/\s+/g, '_'),
    image: vt.image || undefined,
    capacity: vt.capacity || undefined,
  })) as SelectOption[];

  return {
    vehicleTypes,
    vehicleTypeOptions,
    isLoading,
    error,
  };
};
