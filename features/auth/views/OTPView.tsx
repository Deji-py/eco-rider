import { ScrollView, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Container from '@/components/layout/Container';
import { Stack, Box } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import OTPForm from '../components/OTPForm';
import { useTheme } from '@/context/theme-provider';
import { useAuth } from '@/context/auth-provider';
import Svg, { Path } from 'react-native-svg';

interface OTPViewProps {
  email?: string;
  onVerifySuccess?: () => void;
  onNavigateBack?: () => void;
}

const OTPView: React.FC<OTPViewProps> = ({ email: propEmail, onVerifySuccess, onNavigateBack }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { pendingEmail, verifyOTP, resendOTP } = useAuth();

  // Use prop email or pending email from auth context
  const email = propEmail || pendingEmail || 'your***@email.com';

  const handleVerifyOTP = async (otp: string) => {
    await verifyOTP(email, otp);
    onVerifySuccess?.();
  };

  const handleResendOTP = async () => {
    await resendOTP(email);
  };

  const handleNavigateBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      router.push('/signup');
    }
  };

  return (
    <Container
      flex={1}
      spacingHorizontal="lg"
      spacingVertical="lg"
      backgroundColor={theme.color.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Stack gap="xl" flex={1}>
          {/* Header Section */}
          <Stack gap="xl" spacingTop="2xl" alignItems="center">
            {/* Icon */}
            <Box
              style={{
                width: 120,
                height: 120,
                borderRadius: 9999,
                backgroundColor: `${theme.color.primary}15`,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Box
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Svg width="70" height="70" viewBox="0 0 59 47" fill="none">
                  <Path
                    d="M58.3333 10.2085V37.1877C58.3335 39.6084 57.4076 41.9375 55.7453 43.6974C54.0831 45.4572 51.8106 46.5145 49.3937 46.6522L48.8542 46.6668H9.47917C7.05793 46.667 4.72842 45.7406 2.96849 44.0778C1.20857 42.4149 0.151663 40.1417 0.0145837 37.7243L0 37.1877V10.2085L28.1517 24.9552C28.4648 25.1192 28.8131 25.2049 29.1667 25.2049C29.5202 25.2049 29.8685 25.1192 30.1817 24.9552L58.3333 10.2085Z"
                    fill="#0094F0"
                  />
                  <Path
                    d="M0 11.2583L28.1517 26.005C28.4648 26.169 28.8131 26.2547 29.1667 26.2547C29.5202 26.2547 29.8685 26.169 30.1817 26.005L58.3333 11.2583V9.47917C58.3333 8.23435 58.0881 7.00171 57.6118 5.85165C57.1354 4.70158 56.4372 3.65661 55.5569 2.77638C54.6767 1.89616 53.6317 1.19793 52.4817 0.721559C51.3316 0.245186 50.099 0 48.8542 0H9.47917C6.96514 0 4.55407 0.998695 2.77638 2.77638C0.998695 4.55407 0 6.96514 0 9.47917V11.2583Z"
                    fill="#66C4FF"
                  />
                </Svg>
              </Box>
            </Box>

            {/* Title and Subtitle */}
            <Stack gap="xs" alignItems="center">
              <Typography
                type="h2"
                color={theme.color.foreground}
                style={{
                  fontFamily: 'Lexend_500Medium',
                  textAlign: 'center',
                }}>
                Verify Email Address
              </Typography>
              <Typography
                type="body"
                color={theme.color.mutedForeground}
                style={{ textAlign: 'center', opacity: 0.8 }}>
                Enter the verification code sent to {email}
              </Typography>
            </Stack>
          </Stack>

          {/* Form Section */}
          <OTPForm
            email={email}
            numberOfDigits={6}
            resendTimeout={120} // 2 minutes
            onSubmit={handleVerifyOTP}
            onResend={handleResendOTP}
          />

          {/* Footer Section */}
          <Stack
            style={{ gap: 4 }}
            alignItems="center"
            justifyContent="flex-end"
            flex={1}
            spacingVertical="xl">
            <Pressable onPress={handleNavigateBack}>
              <Typography type="body" color={theme.color.mutedForeground}>
                Wrong email?{' '}
                <Typography type="body" color={theme.color.secondary} fontWeight="600">
                  Change Email
                </Typography>
              </Typography>
            </Pressable>
          </Stack>
        </Stack>
      </ScrollView>
    </Container>
  );
};

export default OTPView;
