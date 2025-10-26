import { useTheme } from '@/context/theme-provider';
import OTPView from '@/features/auth/views/OTPView';
import { SafeAreaView } from 'react-native-safe-area-context';

const VerifyOTP = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.color.background, flex: 1 }}>
      <OTPView />
    </SafeAreaView>
  );
};

export default VerifyOTP;
