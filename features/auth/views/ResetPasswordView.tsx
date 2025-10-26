import { ScrollView } from 'react-native';
import React from 'react';
import Container from '@/components/layout/Container';
import { Stack, Box } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { useAuth } from '@/context/auth-provider';
import Svg, { Path } from 'react-native-svg';
import ResetPasswordForm from '../components/ResetPasswordForm';

interface ResetPasswordViewProps {
  onResetSuccess?: () => void;
}

const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onResetSuccess }) => {
  const { theme } = useTheme();
  const { updatePassword } = useAuth();

  const handleResetPassword = async (data: { password: string; confirmPassword: string }) => {
    await updatePassword(data.password);
    onResetSuccess?.();
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
                    d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z"
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
                Reset Password
              </Typography>
              <Typography
                type="body"
                color={theme.color.mutedForeground}
                style={{ textAlign: 'center', opacity: 0.8, paddingHorizontal: 20 }}>
                Enter your new password
              </Typography>
            </Stack>
          </Stack>

          {/* Form Section */}
          <ResetPasswordForm onSubmit={handleResetPassword} />
        </Stack>
      </ScrollView>
    </Container>
  );
};

export default ResetPasswordView;
