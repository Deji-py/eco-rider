// LocationPermission.tsx
import Container from '@/components/layout/Container';
import { Stack } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { SCREEN_WIDTH } from '@/lib/constants';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { spacing } from '@/theme/spacing';
import { Image } from 'expo-image';
import Svg, { Path, Rect } from 'react-native-svg';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useAuth } from '@/context/auth-provider';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { usePushNotification } from '@/hooks/usePushNotification';

const LocationPermission = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { isRequesting, requestPermission, startTracking } = useLocationPermission();

  const { hasPermission: hasPushNotificationPermission } = usePushNotification();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnableLocation = async () => {
    setIsProcessing(true);

    try {
      // Step 1: Request permission
      const granted = await requestPermission();

      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to enable tracking. Please enable it in settings.'
        );
        setIsProcessing(false);
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Location tracking enabled!',
        text2: 'You can now submit deliveries.',
      });

      if (!hasPushNotificationPermission) {
        router.replace('/notification-permission');
        return;
      }
      router.replace('/(protected)/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to enable location');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    Alert.alert('Skip Location?', 'You can enable location tracking later from settings.', [
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
                  d="M23.0037 19.5099C23.0037 19.1151 23.1208 18.7291 23.3401 18.4008C23.5595 18.0725 23.8713 17.8166 24.2361 17.6655C24.6009 17.5144 25.0023 17.4749 25.3895 17.5519C25.7768 17.629 26.1325 17.8191 26.4117 18.0983C26.6909 18.3775 26.8811 18.7332 26.9581 19.1205C27.0351 19.5077 26.9956 19.9091 26.8445 20.2739C26.6934 20.6387 26.4375 20.9505 26.1092 21.1699C25.7809 21.3892 25.3949 21.5063 25.0001 21.5063C24.4706 21.5063 23.9628 21.296 23.5884 20.9216C23.214 20.5472 23.0037 20.0394 23.0037 19.5099ZM17.0145 19.5099C17.0145 17.3921 17.8559 15.3609 19.3534 13.8633C20.851 12.3657 22.8822 11.5244 25.0001 11.5244C27.118 11.5244 29.1491 12.3657 30.6467 13.8633C32.1443 15.3609 32.9856 17.3921 32.9856 19.5099C32.9856 26.9901 25.8011 31.1813 25.4992 31.3572C25.3483 31.4435 25.1776 31.4888 25.0038 31.4888C24.8301 31.4888 24.6593 31.4435 24.5085 31.3572C24.199 31.1813 17.0145 26.9964 17.0145 19.5099ZM19.0109 19.5099C19.0109 24.7754 23.4828 28.2703 25.0001 29.3047C26.5161 28.2716 30.9892 24.7754 30.9892 19.5099C30.9892 17.9215 30.3582 16.3982 29.235 15.275C28.1119 14.1518 26.5885 13.5208 25.0001 13.5208C23.4117 13.5208 21.8883 14.1518 20.7651 15.275C19.6419 16.3982 19.0109 17.9215 19.0109 19.5099ZM34.3294 27.9484C34.0837 27.8672 33.8161 27.8846 33.583 27.9969C33.35 28.1092 33.1696 28.3077 33.0799 28.5504C32.9903 28.7931 32.9984 29.0611 33.1025 29.298C33.2067 29.5348 33.3987 29.722 33.6382 29.82C35.6982 30.5824 36.9784 31.603 36.9784 32.4864C36.9784 34.1534 32.4216 36.4792 25.0001 36.4792C17.5785 36.4792 13.0218 34.1534 13.0218 32.4864C13.0218 31.603 14.302 30.5824 16.362 29.8213C16.6014 29.7233 16.7935 29.5361 16.8976 29.2992C17.0018 29.0624 17.0099 28.7943 16.9202 28.5516C16.8306 28.3089 16.6502 28.1105 16.4171 27.9982C16.184 27.8859 15.9164 27.8685 15.6707 27.9497C12.6749 29.0539 11.0254 30.666 11.0254 32.4864C11.0254 36.3769 18.2261 38.4756 25.0001 38.4756C31.774 38.4756 38.9748 36.3769 38.9748 32.4864C38.9748 30.666 37.3252 29.0539 34.3294 27.9484Z"
                  fill="#FF4A2A"
                />
              </Svg>

              <Typography
                type="h3"
                style={{ marginTop: spacing.sm, fontFamily: 'Inter_700Bold' }}
                color={theme.color.foreground}
                textAlign="center">
                Get Tracking
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
              source={require('../assets/images/location.png')}
              style={{ width: '85%', height: '100%' }}
            />
          </View>
        </Stack>

        {/* Buttons */}
        <Stack gap="base" style={styles.buttonContainer}>
          <Button
            size="lg"
            label={isRequesting || isProcessing ? 'Enabling...' : 'Enable Location'}
            onPress={handleEnableLocation}
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

export default LocationPermission;
