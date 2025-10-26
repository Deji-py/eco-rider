// NotificationPermission.tsx
import Container from '@/components/layout/Container';
import { Stack } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { SCREEN_WIDTH } from '@/lib/constants';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';
import { spacing } from '@/theme/spacing';
import { Image } from 'expo-image';
import { usePushNotification } from '@/hooks/usePushNotification';
import { useAuth } from '@/context/auth-provider';
import { useState } from 'react';

const NotificationPermission = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { isRequesting, requestPermission, enablePushNotifications } = usePushNotification();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnableNotification = async () => {
    setIsProcessing(true);

    try {
      // Step 1: Request permission
      const granted = await requestPermission();

      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Push notification permission is required. Please enable it in settings.'
        );
        setIsProcessing(false);
        return;
      }

      // Step 2: Enable push notifications
      if (user?.id) {
        const enabled = await enablePushNotifications(user.id);

        if (enabled) {
          Alert.alert('Success', 'Push notifications enabled!', [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(protected)/(tabs)/home');
              },
            },
          ]);
        } else {
          Alert.alert('Error', 'Failed to enable push notifications');
        }
      } else {
        Alert.alert('Error', 'User not authenticated');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to enable notifications');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    Alert.alert('Skip Notifications?', 'You can enable notifications later from settings.', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Skip',
        onPress: () => {
          router.replace('/(protected)/(tabs)/home');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#F8F6F5', flex: 1 }}>
      <Container
        flex={1}
        spacingHorizontal="lg"
        spacingVertical="xl"
        spacingBottom="2xl"
        backgroundColor={'#F8F6F5'}
        justifyContent="flex-start"
        alignItems="center">
        <Stack gap="xl" spacingTop="2xl" alignItems="center" flex={1} justifyContent="flex-start">
          {/* Header */}
          <Stack gap="base" alignItems="center">
            <Stack alignItems="center" style={{ maxWidth: '80%' }}>
              <Svg width="60" height="60" viewBox="0 0 50 50" fill="none">
                <Rect width="50" height="50" rx="25" fill="#FF4A2A" fillOpacity="0.1" />
                <Path
                  d="M30.4203 30.3502C30.7206 31.087 30.7159 31.9129 30.4072 32.6463C30.0986 33.3796 29.5113 33.9603 28.7745 34.2606C28.0377 34.5609 27.2117 34.5562 26.4784 34.2476C25.7451 33.9389 25.1644 33.3516 24.8641 32.6148M23.0269 18.2487L21.6682 18.7992C18.5685 20.0539 16.9057 23.6657 18.1265 26.7219L19.557 30.2316C19.8552 30.9632 20.0536 31.7149 19.9024 32.486L19.802 32.9999C19.6479 33.7797 20.4191 34.4265 21.146 34.1302L34.1383 28.8348C34.8653 28.5385 34.9636 27.5373 34.3093 27.087L33.8782 26.7897C33.232 26.3436 32.8471 25.6668 32.5489 24.9353L31.1192 21.4275C29.8397 18.394 26.1266 16.9939 23.0269 18.2487Z"
                  stroke="#FF4A2A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M21.2259 15.7398C21.7171 15.5396 22.2677 15.5427 22.7566 15.7484C23.2455 15.9542 23.6326 16.3458 23.8328 16.837L24.2102 17.763L20.5061 19.2727L20.1286 18.3467C19.9284 17.8555 19.9316 17.3049 20.1373 16.816C20.3431 16.3271 20.7347 15.94 21.2259 15.7398Z"
                  stroke="#FF4A2A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>

              <Typography
                type="h3"
                style={{ marginTop: spacing.sm, fontFamily: 'Inter_700Bold' }}
                color={theme.color.foreground}
                textAlign="center">
                Get Notified
              </Typography>

              <Stack alignItems="center" style={{ marginTop: 6 }}>
                <Typography type="body" color={theme.color.foreground} textAlign="center">
                  Keep up with requests, tracking and delivery
                </Typography>
                <Typography type="body" textAlign="center">
                  with speed, safety, and precision.
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Image */}
          <View style={[styles.imagePlaceholder]}>
            <Image
              contentFit="scale-down"
              source={require('../assets/images/notification.png')}
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        </Stack>

        {/* Buttons */}
        <Stack gap="base" style={styles.buttonContainer}>
          <Button
            size="lg"
            label={isRequesting || isProcessing ? 'Enabling...' : 'Enable Notification'}
            onPress={handleEnableNotification}
            loading={isRequesting || isProcessing}
            disabled={isRequesting || isProcessing}
          />
          <Button
            activeOpacity={0.5}
            size="lg"
            variant="ghost"
            style={{ backgroundColor: 'transparent' }}
            label="Skip"
            onPress={handleSkip}
            disabled={isRequesting || isProcessing}
          />
        </Stack>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_WIDTH,
    marginTop: spacing.md,
  },
  buttonContainer: {
    width: '100%',
  },
});

export default NotificationPermission;
