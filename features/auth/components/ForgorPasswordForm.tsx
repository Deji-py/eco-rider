import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Stack } from '@/components/layout/Layout';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

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

      {/* Submit Button */}
      <Button
        label="Send Reset Link"
        onPress={handleSubmit(onSubmit)}
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
      />
    </Stack>
  );
};

export default ForgotPasswordForm;
