import { Pressable } from 'react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Stack, Row } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/theme-provider';
import { useAuth } from '@/context/auth-provider';
import GoogleLogo from '../../../assets/svg/google-logo.svg';
import { sizes } from '@/theme/sizes';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { signInWithGoogle } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <Stack gap="lg" spacingVertical="xl" style={{ width: '100%' }}>
      {/* Email Input */}
      <FormInput
        name="email"
        control={control}
        placeholder="example@gmail.com"
        variant="outlined"
        size="lg"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <Stack gap="sm">
        <FormInput
          name="password"
          control={control}
          placeholder="Password"
          variant="outlined"
          size="lg"
          secureTextEntry
        />
      </Stack>

      {/* Submit Button */}
      <Button
        label="Continue with Email"
        onPress={handleSubmit(onSubmit)}
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
      />

      {/* Google Button */}
      <Button
        activeOpacity={0.5}
        size="lg"
        variant="ghost"
        label="Continue with Google"
        icon={<GoogleLogo width={sizes.base} height={sizes.base} />}
        onPress={handleGoogleLogin}
      />

      <Row spacingVertical="xl" justifyContent="center">
        <Pressable
          onPress={() => {
            router.push('/forgot-password');
          }}>
          <Typography color={theme.color.mutedForeground} style={{ opacity: 0.7 }}>
            Forgot password?
          </Typography>
        </Pressable>
      </Row>

      {/* Signup Link */}
      <Row justifyContent="center">
        <Typography type="body" color={theme.color.mutedForeground}>
          Don't have an account -
        </Typography>
        <Pressable
          onPress={() => {
            router.push('/signup');
          }}>
          <Typography
            type="body"
            color={theme.color.secondary}
            style={{ fontFamily: 'Inter_700Bold' }}
            fontWeight="500">
            {' '}
            Signup
          </Typography>
        </Pressable>
      </Row>
    </Stack>
  );
};

export default LoginForm;
