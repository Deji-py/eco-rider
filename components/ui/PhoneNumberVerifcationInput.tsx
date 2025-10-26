// components/ui/PhoneVerificationInput.tsx (Updated - Latest Supabase MFA)

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import Typography from './Typography';
import { Stack, Row } from '../layout/Layout';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/context/theme-provider';
import SheetModal from './SheetModal';
import useSheet from '@/hooks/useSheet';
import { Phone, ShieldCheck } from 'lucide-react-native';
import { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Button } from './Button';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import { radius } from '@/theme/radius';
import { Alert } from 'react-native';

interface PhoneVerificationInputProps {
  phoneNumber?: string;
  onVerified: (verified: boolean) => void;
  disabled?: boolean;
}

interface PhoneVerificationFormInputProps extends PhoneVerificationInputProps {
  name: string;
  control: Control<any>;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export const PhoneVerificationInput: React.FC<PhoneVerificationInputProps> = ({
  phoneNumber,
  onVerified,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const { ref: sheetRef, open, close } = useSheet();
  const [otpCode, setOtpCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  const {
    isVerified,
    isEnrolling: hookIsEnrolling,
    isSendingOTP,
    isVerifyingOTP,
    timeRemaining,
    canResend,
    enrollPhoneHandler,
    sendOTPHandler,
    verifyOTPHandler,
    error,
  } = usePhoneVerification();

  // Handle enrollment + send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setIsEnrolling(true);

    try {
      // Step 1: Enroll phone
      const enrolled = await enrollPhoneHandler(phoneNumber);

      if (!enrolled) {
        Alert.alert('Error', error || 'Failed to enroll phone');
        setIsEnrolling(false);
        return;
      }

      // Step 2: Send OTP
      const sent = await sendOTPHandler();

      if (!sent) {
        Alert.alert('Error', error || 'Failed to send OTP');
        setIsEnrolling(false);
        return;
      }

      // Open modal to enter OTP
      open();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start verification');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit code');
      return;
    }

    const success = await verifyOTPHandler(otpCode);

    if (success) {
      onVerified(true);
      setOtpCode('');
      close();
      Alert.alert('Success', 'Phone verified successfully!');
    } else {
      Alert.alert('Error', error || 'Invalid OTP code');
    }
  };

  const handleResendOTP = async () => {
    setOtpCode('');
    const sent = await sendOTPHandler();

    if (!sent) {
      Alert.alert('Error', error || 'Failed to resend OTP');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Row
        alignItems="center"
        gap="md"
        style={{
          backgroundColor: `${theme.color.muted}`,
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: radius.sm,
        }}>
        <Stack style={{ flex: 1 }}>
          <Typography type="small" color={theme.color.foreground} fontWeight="500">
            Phone Number
          </Typography>
          <Typography type="small" style={{ opacity: 0.8 }} color={theme.color.mutedForeground}>
            {phoneNumber || 'enter your 11 digit number'}
          </Typography>
        </Stack>

        <Button
          label={isVerified ? '✓ Verified' : 'Verify'}
          onPress={handleSendOTP}
          variant={isVerified ? 'outlined' : 'primary'}
          size="sm"
          icon={<ShieldCheck size={16} color={!disabled ? '#ffffff' : theme.color.primary} />}
          disabled={disabled || isVerified || isSendingOTP || isEnrolling}
          loading={isSendingOTP || isEnrolling}
          loadingColor="#ffffff"
          style={{
            borderColor: isVerified ? theme.color.primary : undefined,
            backgroundColor: disabled ? '#ffffff' : '#2260ff',
          }}
        />
      </Row>

      {error && (
        <Typography type="small" color={theme.color.error} style={{ marginTop: spacing.xs }}>
          {error}
        </Typography>
      )}

      {/* OTP Verification Modal */}
      <SheetModal ref={sheetRef} detached>
        <BottomSheetView
          style={{
            paddingHorizontal: spacing.base,
            paddingBottom: spacing.xl,
            paddingTop: spacing.lg,
          }}>
          {/* Header */}
          <Stack gap="md" alignItems="center" style={{ marginBottom: spacing.lg }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: `${theme.color.primary}15`,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Phone size={28} color={theme.color.primary} />
            </View>
            <Typography type="h6" fontWeight="600" color={theme.color.foreground}>
              Verify Phone Number
            </Typography>
            <Typography
              type="small"
              color={theme.color.mutedForeground}
              style={{ textAlign: 'center' }}>
              Enter the 6-digit code sent to {phoneNumber}
            </Typography>
          </Stack>

          {/* OTP Input */}
          <Stack gap="lg" spacingBottom="lg">
            <View
              style={[
                styles.otpContainer,
                {
                  borderColor: error ? theme.color.error : theme.color.border,
                  backgroundColor: theme.color.background,
                },
              ]}>
              <BottomSheetTextInput
                placeholder="000000"
                placeholderTextColor={theme.color.mutedForeground}
                value={otpCode}
                onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                style={[
                  styles.otpInput,
                  {
                    color: theme.color.foreground,
                    fontSize: 24,
                  },
                ]}
              />
            </View>

            {/* Timer and Resend */}
            <Row alignItems="center" justifyContent="center" gap="md">
              {timeRemaining > 0 ? (
                <Typography type="small" color={theme.color.mutedForeground}>
                  Resend in {formatTime(timeRemaining)}
                </Typography>
              ) : (
                <Pressable onPress={handleResendOTP} disabled={isVerifyingOTP}>
                  <Typography
                    type="small"
                    color={theme.color.primary}
                    fontWeight="600"
                    style={{
                      opacity: isVerifyingOTP ? 0.5 : 1,
                    }}>
                    Resend Code
                  </Typography>
                </Pressable>
              )}
            </Row>

            {error && (
              <Typography type="small" color={theme.color.error} style={{ textAlign: 'center' }}>
                {error}
              </Typography>
            )}
          </Stack>

          {/* Action Buttons */}
          <Stack gap="md">
            <Button
              label={isVerifyingOTP ? 'Verifying...' : 'Verify Code'}
              onPress={handleVerifyOTP}
              variant="primary"
              size="lg"
              fullWidth
              disabled={otpCode.length !== 6 || isVerifyingOTP}
              loading={isVerifyingOTP}
            />
            <Button
              label="Cancel"
              onPress={() => {
                setOtpCode('');
                close();
              }}
              variant="outlined"
              size="lg"
              fullWidth
            />
          </Stack>
        </BottomSheetView>
      </SheetModal>
    </>
  );
};

// FIXED: Call useTheme at component level, NOT inside Controller render
export const FormPhoneVerificationInput: React.FC<PhoneVerificationFormInputProps> = ({
  name,
  control,
  placeholder = 'Phone Number',
  error,
  helperText,
  onVerified,
  disabled = false,
}) => {
  const { theme } = useTheme(); // ✅ FIXED: Moved outside Controller

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value }, fieldState: { error: fieldError } }) => (
        <Stack>
          <PhoneVerificationInput
            phoneNumber={value || ''}
            onVerified={onVerified}
            disabled={disabled || !value}
          />
          {(fieldError?.message || helperText) && (
            <Typography
              type="small"
              color={fieldError ? theme.color.error : theme.color.mutedForeground}>
              {fieldError?.message || helperText}
            </Typography>
          )}
        </Stack>
      )}
    />
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  otpInput: {
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 8,
    padding: 0,
    margin: 0,
  },
});
