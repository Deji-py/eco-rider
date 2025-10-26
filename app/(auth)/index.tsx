import { useAuth } from '@/context/auth-provider';
import { useTheme } from '@/context/theme-provider';
import LoginView from '@/features/auth/views/LoginView';
import { hasOnBoarded } from '@/lib/utils';
import { Redirect } from 'expo-router';

import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
  const { session, isLoading, isProfileComplete } = useAuth();
  const { theme } = useTheme();

  if (!hasOnBoarded()) {
    return <Redirect href="/onboarding" />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color={theme.color.primary} />
      </View>
    );
  }

  if (session && !isProfileComplete) {
    return <Redirect href="/(protected)/submit-profile" />;
  }

  if (session && !isLoading) {
    return <Redirect href="/(protected)/(tabs)/home" />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: theme.color.background, flex: 1 }}>
      <LoginView />
    </SafeAreaView>
  );
};

export default Login;
