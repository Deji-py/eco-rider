// hooks/usePushNotification.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  checkPushPermission,
  requestPushPermission,
  getPushToken,
  savePushToken,
  disablePushNotifications,
  setupNotificationListeners,
  clearNotificationBadge,
} from '@/services/pushNotificationService';

interface UsePushNotificationReturn {
  hasPermission: boolean;
  isRequesting: boolean;
  isEnabled: boolean;
  pushToken: string | null;
  error: string | null;

  // Methods
  checkPermission: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  enablePushNotifications: (userId: string) => Promise<boolean>;
  disablePushNotifications: (userId: string) => Promise<boolean>;
  clearBadge: () => Promise<void>;
  setupListeners: (
    onReceived?: (notification: Notifications.Notification) => void,
    onPressed?: (response: Notifications.NotificationResponse) => void
  ) => () => void;
  resetError: () => void;
}

export const usePushNotification = (): UsePushNotificationReturn => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Check permission on mount
  useEffect(() => {
    checkPermissionStatus();

    // Cleanup listeners on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const checkPermissionStatus = useCallback(async () => {
    try {
      const hasPermission = await checkPushPermission();
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
      const granted = await requestPushPermission();

      if (granted) {
        setHasPermission(true);
        console.log('Push notification permission granted');
      } else {
        setError('Push notification permission denied');
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

  const enablePushNotifications = useCallback(async (userId: string): Promise<boolean> => {
    setIsRequesting(true);
    setError(null);

    try {
      // Step 1: Check permission
      const hasPermission = await checkPushPermission();
      if (!hasPermission) {
        setError('Push notification permission not granted');
        setIsRequesting(false);
        return false;
      }

      // Step 2: Get push token
      const tokenResult = await getPushToken();
      if (!tokenResult.success || !tokenResult.token) {
        setError(tokenResult.error || 'Failed to get push token');
        setIsRequesting(false);
        return false;
      }

      setPushToken(tokenResult.token);

      // Step 3: Save token to database
      const saveResult = await savePushToken(userId, tokenResult.token);
      if (!saveResult.success) {
        setError(saveResult.error || 'Failed to save push token');
        setIsRequesting(false);
        return false;
      }

      setIsEnabled(true);
      console.log('Push notifications enabled');
      setIsRequesting(false);
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to enable push notifications';
      setError(errorMsg);
      setIsRequesting(false);
      return false;
    }
  }, []);

  const disablePushNotificationsHandler = useCallback(async (userId: string): Promise<boolean> => {
    setError(null);

    try {
      const result = await disablePushNotifications(userId);

      if (result.success) {
        setIsEnabled(false);
        setPushToken(null);
        console.log('Push notifications disabled');
        return true;
      } else {
        setError(result.error || 'Failed to disable push notifications');
        return false;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to disable push notifications';
      setError(errorMsg);
      return false;
    }
  }, []);

  const clearBadge = useCallback(async (): Promise<void> => {
    try {
      await clearNotificationBadge();
    } catch (err: any) {
      console.error('Clear badge error:', err);
    }
  }, []);

  const setupListeners = useCallback(
    (
      onReceived?: (notification: Notifications.Notification) => void,
      onPressed?: (response: Notifications.NotificationResponse) => void
    ): (() => void) => {
      const cleanup = setupNotificationListeners(onReceived, onPressed);
      cleanupRef.current = cleanup;
      return cleanup;
    },
    []
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    hasPermission,
    isRequesting,
    isEnabled,
    pushToken,
    error,
    checkPermission,
    requestPermission,
    enablePushNotifications,
    disablePushNotifications: disablePushNotificationsHandler,
    clearBadge,
    setupListeners,
    resetError,
  };
};
