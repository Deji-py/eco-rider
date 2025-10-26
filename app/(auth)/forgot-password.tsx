import { useTheme } from '@/context/theme-provider';
import ForgotPasswordView from '@/features/auth/views/ForgotPasswordView';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPassword = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.color.background, flex: 1 }}>
      <ForgotPasswordView />
    </SafeAreaView>
  );
};

export default ForgotPassword;
