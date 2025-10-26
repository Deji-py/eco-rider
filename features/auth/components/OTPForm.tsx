// OTPForm.tsx
import { Pressable } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { OtpInputRef } from 'react-native-otp-entry';
import { Button } from '@/components/ui/Button';
import { Stack } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { OTPInput } from '@/components/ui/OTPInput';
import { useTheme } from '@/context/theme-provider';
import { spacing } from '@/theme/spacing';

interface OTPFormProps {
  onSubmit: (otp: string) => Promise<void>;
  email?: string;
  numberOfDigits?: number;
  resendTimeout?: number; // in seconds
  onResend?: () => Promise<void>;
}

const OTPForm: React.FC<OTPFormProps> = ({
  onSubmit,
  email,
  numberOfDigits = 6,
  resendTimeout = 120, // 2 minutes default
  onResend,
}) => {
  const { theme } = useTheme();
  const otpRef = useRef<OtpInputRef>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingTime, setRemainingTime] = useState(resendTimeout);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [remainingTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (text: string) => {
    setOtp(text);
    if (error) setError(''); // Clear error on change
  };

  const handleOTPFilled = async (code: string) => {
    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(code);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      otpRef.current?.clear();
      setOtp('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== numberOfDigits) {
      setError(`Please enter all ${numberOfDigits} digits`);
      return;
    }
    await handleOTPFilled(otp);
  };

  const handleResend = async () => {
    if (!canResend || !onResend) return;

    try {
      setError('');
      await onResend();
      // Reset timer
      setRemainingTime(resendTimeout);
      setCanResend(false);
      otpRef.current?.clear();
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <Stack gap="xl" spacingVertical="xl" style={{ width: '100%' }}>
      {/* Email Display */}
      {email && (
        <Typography type="body" color={theme.color.mutedForeground} style={{ textAlign: 'center' }}>
          An OTP was sent to your email{' '}
          <Typography type="body" color={theme.color.foreground} fontWeight="600">
            {email}
          </Typography>
        </Typography>
      )}

      {/* OTP Input */}
      <OTPInput
        ref={otpRef}
        numberOfDigits={6}
        variant="outlined"
        size="md"
        error={error}
        disabled={isSubmitting}
        onTextChange={handleOTPChange}
        onFilled={handleOTPFilled}
        autoFocus
        blurOnFilled={true}
        type="numeric"
        theme={{
          containerStyle: {
            gap: 0,
            width: '100%',
            paddingHorizontal: spacing.sm,
          },
        }}
      />

      {/* Verify Button */}
      <Button
        label="Verify OTP"
        onPress={handleVerify}
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={otp.length !== numberOfDigits}
      />

      {/* Resend Timer/Link */}
      <Stack alignItems="center" spacingVertical="md">
        {canResend ? (
          <Pressable onPress={handleResend}>
            <Typography type="body" color={theme.color.secondary} fontWeight="600">
              Resend OTP
            </Typography>
          </Pressable>
        ) : (
          <Typography type="body" color={theme.color.mutedForeground}>
            Resend in {formatTime(remainingTime)}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default OTPForm;
