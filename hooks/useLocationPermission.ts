// hooks/useLocationPermission.ts
import { useState, useCallback, useEffect } from 'react';
import {
  checkLocationPermission,
  requestLocationPermission,
  getCurrentLocation,
  startLocationTracking,
  stopLocationTracking,
  updateRiderLocation,
  LocationData,
} from '@/services/locationService';

interface UseLocationPermissionReturn {
  hasPermission: boolean;
  isRequesting: boolean;
  isTracking: boolean;
  isLoadingLocation: boolean;
  currentLocation: LocationData | null;
  error: string | null;

  // Methods
  checkPermission: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  getLocation: () => Promise<LocationData | null>;
  startTracking: (userId: string) => Promise<boolean>;
  stopTracking: () => Promise<boolean>;
  updateLocation: (userId: string, location: LocationData) => Promise<boolean>;
  resetError: () => void;
}

export const useLocationPermission = (): UseLocationPermissionReturn => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check permission on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = useCallback(async () => {
    try {
      const hasPermission = await checkLocationPermission();
      setHasPermission(hasPermission);
      return hasPermission;
    } catch (err: any) {
      console.error('Check permission error:', err);
      setError(err.message || 'Failed to check permission');
      return false;
    }
  }, []);

  const checkPermission = useCallback(async (): Promise<boolean> => {
    return checkPermissionStatus();
  }, [checkPermissionStatus]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    setError(null);

    try {
      const granted = await requestLocationPermission();

      if (granted) {
        setHasPermission(true);
        console.log('Location permission granted');
      } else {
        setError('Location permission denied');
      }

      setIsRequesting(false);
      return granted;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to request permission';
      setError(errorMsg);
      setIsRequesting(false);
      return false;
    }
  }, []);

  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsLoadingLocation(true);
    setError(null);

    try {
      const result = await getCurrentLocation();

      if (result.success && result.data) {
        setCurrentLocation(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to get location');
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to get location';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  const startTracking = useCallback(async (userId: string): Promise<boolean> => {
    setError(null);

    try {
      const result = await startLocationTracking(userId);

      if (result.success) {
        setIsTracking(true);
        console.log('Location tracking started');
        return true;
      } else {
        setError(result.error || 'Failed to start tracking');
        return false;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start tracking';
      setError(errorMsg);
      return false;
    }
  }, []);

  const stopTracking = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      const success = await stopLocationTracking();

      if (success) {
        setIsTracking(false);
        console.log('Location tracking stopped');
        return true;
      } else {
        setError('Failed to stop tracking');
        return false;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to stop tracking';
      setError(errorMsg);
      return false;
    }
  }, []);

  const updateLocation = useCallback(
    async (userId: string, location: LocationData): Promise<boolean> => {
      setError(null);

      try {
        const result = await updateRiderLocation(userId, location.latitude, location.longitude);

        if (result.success) {
          setCurrentLocation(location);
          return true;
        } else {
          setError(result.error || 'Failed to update location');
          return false;
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to update location';
        setError(errorMsg);
        return false;
      }
    },
    []
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    hasPermission,
    isRequesting,
    isTracking,
    isLoadingLocation,
    currentLocation,
    error,
    checkPermission,
    requestPermission,
    getLocation,
    startTracking,
    stopTracking,
    updateLocation,
    resetError,
  };
};
