import { ScrollView, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Container from '@/components/layout/Container';
import { Stack, Box } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { useAuth } from '@/context/auth-provider';
import Svg, { Path } from 'react-native-svg';
import ForgotPasswordForm from '../components/ForgorPasswordForm';

interface ForgotPasswordViewProps {
  onNavigateBack?: () => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigateBack }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const handleResetPassword = async (data: { email: string }) => {
    await resetPassword(data.email);
    // Navigate back to login after successful request
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  const handleNavigateBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      router.push('/');
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
                <Svg width="70" height="70" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z"
                    fill="#0094F0"
                  />
                  <Path
                    d="M17.08 14.15C14.29 12.29 9.74 12.29 6.93 14.15C5.66 15 4.96 16.15 4.96 17.38C4.96 18.61 5.66 19.75 6.92 20.59C8.32 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z"
                    fill="#0094F0"
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
                Forgot Password?
              </Typography>
              <Typography
                type="body"
                color={theme.color.mutedForeground}
                style={{ textAlign: 'center', opacity: 0.8, paddingHorizontal: 20 }}>
                Enter your email address and we'll send you a link to reset your password
              </Typography>
            </Stack>
          </Stack>

          {/* Form Section */}
          <ForgotPasswordForm onSubmit={handleResetPassword} />

          {/* Footer Section */}
          <Stack
            style={{ gap: 4 }}
            alignItems="center"
            justifyContent="flex-end"
            flex={1}
            spacingVertical="xl">
            <Pressable onPress={handleNavigateBack}>
              <Typography type="body" color={theme.color.mutedForeground}>
                Remember your password?{' '}
                <Typography type="body" color={theme.color.secondary} fontWeight="600">
                  Login
                </Typography>
              </Typography>
            </Pressable>
          </Stack>
        </Stack>
      </ScrollView>
    </Container>
  );
};

export default ForgotPasswordView;
