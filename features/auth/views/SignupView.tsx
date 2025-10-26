import { Pressable, ScrollView } from 'react-native';
import React from 'react';
import { Stack, Row, Box } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import Container from '@/components/layout/Container';
import SignupForm from '../components/SignupForm';
import EcologLogo from '../../../assets/svg/ecolog-logo.svg';
import { useAuth } from '@/context/auth-provider';

interface SignupViewProps {
  onNavigateLogin?: () => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onNavigateLogin }) => {
  const { theme } = useTheme();
  const { signUp } = useAuth();

  const handleSignup = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    await signUp(data.email, data.password);
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
                Create Account
              </Typography>
              <Typography type="body" color={theme.color.mutedForeground}>
                signup for an account
              </Typography>
            </Stack>
          </Stack>

          {/* Form Section */}
          <SignupForm onSubmit={handleSignup} />

          {/* Footer Section */}
          <Stack
            style={{ gap: 4 }}
            alignItems="center"
            justifyContent="flex-end"
            flex={1}
            spacingVertical="xl">
            <Row justifyContent="center" alignItems="center" flexWrap="wrap" gap="xs">
              <Typography type="small" color={theme.color.mutedForeground}>
                by clicking signup you agree to our
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
  );
};

export default SignupView;
