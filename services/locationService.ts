// services/locationService.ts
import * as Location from 'expo-location';
import { supabase } from '@/utils/supabase';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface LocationResponse {
  success: boolean;
  data?: LocationData;
  error?: string;
}

// 1. Request location permission
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error: any) {
    console.error('Request location permission error:', error);
    return false;
  }
};

// 2. Check current location permission
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error: any) {
    console.error('Check location permission error:', error);
    return false;
  }
};

// 3. Get current location
export const getCurrentLocation = async (): Promise<LocationResponse> => {
  try {
    const hasPermission = await checkLocationPermission();

    if (!hasPermission) {
      return {
        success: false,
        error: 'Location permission not granted',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      success: true,
      data: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
      },
    };
  } catch (error: any) {
    console.error('Get current location error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get location',
    };
  }
};

// 4. Start location tracking
export const startLocationTracking = async (
  userId: string,
  interval: number = 10000 // 10 seconds
): Promise<{ success: boolean; error?: string; taskId?: string }> => {
  try {
    const hasPermission = await checkLocationPermission();

    if (!hasPermission) {
      return {
        success: false,
        error: 'Location permission not granted',
      };
    }

    // Start foreground location tracking
    const taskId = await Location.startLocationUpdatesAsync('location-task', {
      accuracy: Location.Accuracy.High,
      timeInterval: interval,
      distanceInterval: 10, // Update every 10 meters
      foregroundService: {
        notificationTitle: 'Tracking Active',
        notificationBody: 'Your location is being tracked',
        notificationColor: '#FF4A2A',
      },
    });

    console.log('Location tracking started:', taskId);

    return {
      success: true,
      taskId: 'location-task',
    };
  } catch (error: any) {
    console.error('Start location tracking error:', error);
    return {
      success: false,
      error: error.message || 'Failed to start tracking',
    };
  }
};

// 5. Stop location tracking
export const stopLocationTracking = async (): Promise<boolean> => {
  try {
    await Location.stopLocationUpdatesAsync('location-task');
    console.log('Location tracking stopped');
    return true;
  } catch (error: any) {
    console.error('Stop location tracking error:', error);
    return false;
  }
};

// 6. Update rider location in database (PostGIS)
export const updateRiderLocation = async (
  userId: string,
  latitude: number,
  longitude: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('dispatch_riders')
      .update({
        latitude: latitude,
        longitude: longitude,
        // PostGIS point geometry - stored as ST_Point(longitude, latitude)
        location: `POINT(${longitude} ${latitude})`,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Update location error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update location',
      };
    }

    console.log('Location updated for user:', userId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Update location exception:', error);
    return {
      success: false,
      error: error.message || 'Failed to update location',
    };
  }
};

// 7. Get nearby riders (using PostGIS)
export const getNearbyRiders = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 5
): Promise<any[]> => {
  try {
    const { data, error } = await supabase.rpc('get_nearby_riders', {
      user_lat: latitude,
      user_lon: longitude,
      radius_km: radiusKm,
    });

    if (error) {
      console.error('Get nearby riders error:', error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Get nearby riders exception:', error);
    return [];
  }
};
