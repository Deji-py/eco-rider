import ThemeProvider from '@/context/theme-provider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Lexend_400Regular,
  Inter_500Medium,
  Inter_400Regular,
  Inter_700Bold,
  Lexend_700Bold,
  Lexend_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/dev';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/auth-provider';
import Toast from 'react-native-toast-message';
import toastConfig from '@/config/toast';
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Lexend_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Lexend_700Bold,
    Inter_600SemiBold,
    Lexend_500Medium,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

// New Query Client
const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider theme="light">
                <Stack
                  initialRouteName="(auth)"
                  screenOptions={{
                    headerShown: false,
                  }}>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(protected)" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="notification-permission" />
                  <Stack.Screen name="location-permission" />
                </Stack>
                <StatusBar style="inverted" hidden />
                <Toast
                  topOffset={-40}
                  swipeable={false}
                  visibilityTime={1000}
                  config={toastConfig}
                />
              </ThemeProvider>
            </QueryClientProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </AuthProvider>
    </>
  );
}
