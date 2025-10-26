import { useAuth } from '@/context/auth-provider';
import useProfileSync from '@/features/profile/hooks/useProfileSync';
import { Redirect, Stack } from 'expo-router';

function AppLayout() {
  const { session, isLoading } = useAuth();

  // Sync profile data to Zustand store
  useProfileSync();

  if (!session && !isLoading) {
    return <Redirect href="/" />;
  }
  return (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="submit-profile" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default AppLayout;
