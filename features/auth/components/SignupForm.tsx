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
const signupSchema = z
  .object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { signInWithGoogle } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google signup error:', error);
    }
  };

  return (
    <Stack gap="lg" spacingVertical="xl" style={{ width: '100%' }}>
      {/* Email Input */}
      <FormInput
        name="email"
        control={control}
        placeholder="Email"
        variant="outlined"
        size="lg"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <FormInput
        name="password"
        control={control}
        placeholder="Password"
        variant="outlined"
        size="lg"
        secureTextEntry
      />

      {/* Confirm Password Input */}
      <FormInput
        name="confirmPassword"
        control={control}
        placeholder="Confirm Password"
        variant="outlined"
        size="lg"
        secureTextEntry
      />

      {/* Submit Button */}
      <Button
        label="Create Account"
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
        onPress={handleGoogleSignup}
      />

      {/* Login Link */}
      <Row justifyContent="center">
        <Typography type="body" color={theme.color.mutedForeground}>
          Already have an account -{' '}
        </Typography>
        <Pressable
          onPress={() => {
            router.push('/');
          }}>
          <Typography
            type="body"
            color={theme.color.secondary}
            style={{ fontFamily: 'Inter_700Bold' }}
            fontWeight="500">
            Login
          </Typography>
        </Pressable>
      </Row>
    </Stack>
  );
};

export default SignupForm;
