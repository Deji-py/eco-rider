import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Stack } from '@/components/layout/Layout';

// Validation schema
const resetPasswordSchema = z
  .object({
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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <Stack gap="lg" spacingVertical="xl" style={{ width: '100%' }}>
      {/* Password Input */}
      <FormInput
        name="password"
        control={control}
        placeholder="New Password"
        variant="outlined"
        size="lg"
        secureTextEntry
      />

      {/* Confirm Password Input */}
      <FormInput
        name="confirmPassword"
        control={control}
        placeholder="Confirm New Password"
        variant="outlined"
        size="lg"
        secureTextEntry
      />

      {/* Submit Button */}
      <Button
        label="Reset Password"
        onPress={handleSubmit(onSubmit)}
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
      />
    </Stack>
  );
};

export default ResetPasswordForm;
