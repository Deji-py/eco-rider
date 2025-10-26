import { ScrollView, Pressable } from 'react-native';
import React from 'react';
import Container from '@/components/layout/Container';
import { Stack, Row, Box } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import LoginForm from '../components/LoginForm';
import { useTheme } from '@/context/theme-provider';
import EcologLogo from '../../../assets/svg/ecolog-logo.svg';
import { useAuth } from '@/context/auth-provider';

interface LoginViewProps {
  onNavigateSignup?: () => void;
  onNavigateForgotPassword?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onNavigateSignup, onNavigateForgotPassword }) => {
  const { theme } = useTheme();

  const { signIn } = useAuth();

  const handleLogin = async (data: { email: string; password: string }) => {
    await signIn(data.email, data.password);
  };

  const handleForgotPassword = () => {
    onNavigateForgotPassword?.();
  };

  const handleSignup = () => {
    onNavigateSignup?.();
  };

  return (
    // <KeyboardAwareScrollView
    //   style={{ flex: 1, backgroundColor: theme.color.background }}
    //   contentContainerStyle={{ flexGrow: 1 }}
    //   keyboardShouldPersistTaps="handled">
    <Container
      flex={1}
      spacingHorizontal="lg"
      spacingVertical="lg"
      backgroundColor={theme.color.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Stack gap="xl" flex={1}>
          {/* Header Section */}
          <Stack gap="lg" spacingTop="2xl">
            {/* Logo */}
            <Box>
              <EcologLogo />
            </Box>

            {/* Title and Subtitle */}
            <Stack>
              <Typography
                type="h2"
                color={theme.color.foreground}
                style={{
                  fontFamily: 'Inter_700Bold',
                }}>
                Welcome Back
              </Typography>
              <Typography type="body" color={theme.color.mutedForeground}>
                Login to your account
              </Typography>
            </Stack>
          </Stack>

          {/* Form Section */}
          <LoginForm onSubmit={handleLogin} />

          {/* Footer Section */}
          <Stack
            style={{ gap: 4 }}
            alignItems="center"
            justifyContent="flex-end"
            flex={1}
            spacingVertical="xl">
            <Row justifyContent="center" alignItems="center" flexWrap="wrap" gap="xs">
              <Typography type="small" color={theme.color.mutedForeground}>
                by clicking login you agree to our
              </Typography>
            </Row>
            <Row justifyContent="center" alignItems="center" flexWrap="wrap">
              <Pressable>
                <Typography type="small" color={theme.color.secondary}>
                  privacy-policy
                </Typography>
              </Pressable>
              <Typography type="small" color={theme.color.mutedForeground}>
                {' '}
                and{' '}
              </Typography>
              <Pressable>
                <Typography type="small" color={theme.color.secondary}>
                  terms and conditions
                </Typography>
              </Pressable>
            </Row>
          </Stack>
        </Stack>
      </ScrollView>
    </Container>
    // </KeyboardAwareScrollView>
  );
};

export default LoginView;
