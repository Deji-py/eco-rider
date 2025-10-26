import { useTheme } from '@/context/theme-provider';
import SignupView from '@/features/auth/views/SignupView';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.color.background, flex: 1 }}>
      <SignupView />
    </SafeAreaView>
  );
};

export default Login;
