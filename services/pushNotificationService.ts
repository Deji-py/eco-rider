// services/pushNotificationService.ts
import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationResponse {
  success: boolean;
  token?: string;
  error?: string;
}

// 1. Request push notification permission
export const requestPushPermission = async (): Promise<boolean> => {
  try {
    // if (!Device.isDevice) {
    //   console.warn('Push notifications only work on physical devices');
    //   return false;
    // }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error: any) {
    console.error('Request push permission error:', error);
    return false;
  }
};

// 2. Check current push notification permission
export const checkPushPermission = async (): Promise<boolean> => {
  try {
    // if (!Device.isDevice) {
    //   return false;
    // }

    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error: any) {
    console.error('Check push permission error:', error);
    return false;
  }
};

// 3. Get push notification token
export const getPushToken = async (): Promise<PushNotificationResponse> => {
  try {
    // if (!Device.isDevice) {
    //   return {
    //     success: false,
    //     error: 'Push notifications only work on physical devices',
    //   };
    // }

    const hasPermission = await checkPushPermission();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Push notification permission not granted',
      };
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    if (!projectId) {
      return {
        success: false,
        error: 'EAS project ID not configured',
      };
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    console.log('Push token:', token.data);

    return {
      success: true,
      token: token.data,
    };
  } catch (error: any) {
    console.error('Get push token error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get push token',
    };
  }
};

// 4. Save push token to database
export const savePushToken = async (
  userId: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('dispatch_riders')
      .update({
        push_notification_token: token,
        push_notifications_enabled: true,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Save push token error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save push token',
      };
    }

    console.log('Push token saved for user:', userId);
    return { success: true };
  } catch (error: any) {
    console.error('Save push token exception:', error);
    return {
      success: false,
      error: error.message || 'Failed to save push token',
    };
  }
};

// 5. Send local notification (for testing)
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: {
        seconds: 1,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  } catch (error: any) {
    console.error('Send local notification error:', error);
  }
};

// 6. Setup notification listeners
export const setupNotificationListeners = (
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationPressed?: (response: Notifications.NotificationResponse) => void
) => {
  // Handle notification received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
    onNotificationReceived?.(notification);
  });

  // Handle notification pressed/tapped
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification pressed:', response);
    onNotificationPressed?.(response);
  });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

// 7. Disable push notifications
export const disablePushNotifications = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('dispatch_riders')
      .update({
        push_notifications_enabled: false,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Disable push error:', error);
      return {
        success: false,
        error: error.message || 'Failed to disable push notifications',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Disable push exception:', error);
    return {
      success: false,
      error: error.message || 'Failed to disable push notifications',
    };
  }
};

// 8. Clear notification badge
export const clearNotificationBadge = async (): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(0);
    }
  } catch (error: any) {
    console.error('Clear badge error:', error);
  }
};
