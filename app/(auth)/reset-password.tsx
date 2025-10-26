import { useTheme } from '@/context/theme-provider';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPassword = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.color.background, flex: 1 }}>
      <ResetPassword />
    </SafeAreaView>
  );
};

export default ResetPassword;
