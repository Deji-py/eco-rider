// OTPInput.tsx
import { View, ViewStyle, TextStyle } from 'react-native';
import React, { useState, useMemo } from 'react';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import Typography from './Typography';
import { Stack } from '../layout/Layout';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/context/theme-provider';

type OTPInputSize = 'sm' | 'md' | 'lg';
type OTPInputVariant = 'default' | 'filled' | 'outlined';

interface OTPInputProps {
  /**
   * Label text displayed above the OTP input
   */
  label?: string;

  /**
   * Helper text displayed below the OTP input
   */
  helperText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Number of OTP digits (default: 6)
   */
  numberOfDigits?: number;

  /**
   * Size variant of the input
   */
  size?: OTPInputSize;

  /**
   * Visual variant of the input
   */
  variant?: OTPInputVariant;

  /**
   * Callback when OTP text changes
   */
  onTextChange?: (text: string) => void;

  /**
   * Callback when OTP is fully filled
   */
  onFilled?: (text: string) => void;

  /**
   * Auto focus the input on mount
   */
  autoFocus?: boolean;

  /**
   * Blur input when OTP is fully filled
   */
  blurOnFilled?: boolean;

  /**
   * Disable the input
   */
  disabled?: boolean;

  /**
   * Hide cursor in focused input
   */
  hideStick?: boolean;

  /**
   * Placeholder text for empty inputs
   */
  placeholder?: string;

  /**
   * Type of input validation
   */
  type?: 'alpha' | 'numeric' | 'alphanumeric';

  /**
   * Additional container style
   */
  style?: ViewStyle;

  /**
   * Custom theme override (optional)
   */
  theme?: {
    containerStyle?: ViewStyle;
    pinCodeContainerStyle?: ViewStyle;
    pinCodeTextStyle?: TextStyle;
    focusStickStyle?: ViewStyle;
    focusedPinCodeContainerStyle?: ViewStyle;
    filledPinCodeContainerStyle?: ViewStyle;
    disabledPinCodeContainerStyle?: ViewStyle;
  };
}

const getSizeConfig = (size: OTPInputSize) => {
  switch (size) {
    case 'sm':
      return {
        height: 40,
        width: 40,
        fontSize: 16,
        borderRadius: 6,
      };
    case 'lg':
      return {
        height: 64,
        width: 64,
        fontSize: 28,
        borderRadius: 12,
      };
    case 'md':
    default:
      return {
        height: 52,
        width: 52,
        fontSize: 24,
        borderRadius: 8,
      };
  }
};

/**
 * OTPInput - Reusable OTP input component built on react-native-otp-entry
 *
 * @example
 * <OTPInput
 *   label="Enter OTP"
 *   numberOfDigits={6}
 *   variant="outlined"
 *   size="md"
 *   onFilled={(otp) => console.log('OTP:', otp)}
 *   helperText="Enter the 6-digit code sent to your email"
 * />
 */
export const OTPInput = React.forwardRef<OtpInputRef, OTPInputProps>(
  (
    {
      label,
      helperText,
      error,
      numberOfDigits = 6,
      size = 'md',
      variant = 'outlined',
      onTextChange,
      onFilled,
      autoFocus = true,
      blurOnFilled = true,
      disabled = false,
      hideStick = false,
      placeholder = '',
      type = 'numeric',
      style,
      theme: customTheme,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const hasError = !!error;
    const sizeConfig = getSizeConfig(size);

    // Generate variant-specific styles
    const getInputStyles = useMemo(() => {
      const baseStyle: ViewStyle = {
        height: sizeConfig.height,
        width: sizeConfig.width,
        borderRadius: sizeConfig.borderRadius,
      };

      switch (variant) {
        case 'filled':
          return {
            pinCodeContainer: {
              ...baseStyle,
              backgroundColor: hasError ? `${theme.color.error}10` : `${theme.color.muted}80`,
              borderWidth: 0,
            },
            focusedContainer: {
              backgroundColor: theme.color.muted,
              borderWidth: 2,
              borderColor: hasError ? theme.color.error : theme.color.primary,
            },
            filledContainer: {
              backgroundColor: theme.color.muted,
              borderWidth: 0,
            },
          };

        case 'outlined':
          return {
            pinCodeContainer: {
              ...baseStyle,
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: hasError ? theme.color.error : theme.color.border,
            },
            focusedContainer: {
              borderWidth: 2,
              borderColor: hasError ? theme.color.error : theme.color.primary,
              backgroundColor: 'transparent',
            },
            filledContainer: {
              borderColor: hasError ? theme.color.error : theme.color.primary,
              backgroundColor: 'transparent',
            },
          };

        case 'default':
        default:
          return {
            pinCodeContainer: {
              ...baseStyle,
              backgroundColor: theme.color.background,
              borderWidth: 0,
              borderBottomWidth: 2,
              borderBottomColor: hasError ? theme.color.error : theme.color.border,
              borderRadius: 0,
            },
            focusedContainer: {
              borderBottomWidth: 2,
              borderBottomColor: hasError ? theme.color.error : theme.color.primary,
            },
            filledContainer: {
              borderBottomColor: hasError ? theme.color.error : theme.color.primary,
            },
          };
      }
    }, [variant, theme, hasError, sizeConfig]);

    const textStyle: TextStyle = {
      fontSize: sizeConfig.fontSize,
      color: disabled ? theme.color.mutedForeground : theme.color.foreground,
      fontFamily: 'Inter_600SemiBold',
    };

    const focusStickStyle: ViewStyle = {
      backgroundColor: hasError ? theme.color.error : theme.color.primary,
      width: 2,
      height: sizeConfig.height * 0.5,
    };

    const disabledStyle: ViewStyle = {
      opacity: 0.6,
      backgroundColor: variant === 'filled' ? `${theme.color.muted}40` : 'transparent',
    };

    return (
      <Stack gap="xs" style={style}>
        {/* Label */}
        {label && (
          <Typography
            type="body"
            color={theme.color.foreground}
            fontWeight="500"
            style={{ marginBottom: spacing.xs }}>
            {label}
          </Typography>
        )}

        {/* OTP Input */}
        <View>
          <OtpInput
            ref={ref}
            numberOfDigits={numberOfDigits}
            autoFocus={autoFocus}
            focusColor={hasError ? theme.color.error : theme.color.primary}
            onTextChange={(text) => {
              setFocused(text.length > 0);
              onTextChange?.(text);
            }}
            onFilled={onFilled}
            blurOnFilled={blurOnFilled}
            disabled={disabled}
            hideStick={hideStick}
            placeholder={placeholder}
            type={type}
            theme={{
              // Container that wraps all inputs
              containerStyle: {
                width: 'auto',
                gap: spacing.sm,
                ...customTheme?.containerStyle,
              },
              // Individual input box
              pinCodeContainerStyle: {
                ...getInputStyles.pinCodeContainer,
                ...customTheme?.pinCodeContainerStyle,
              },
              // Text inside input
              pinCodeTextStyle: {
                ...textStyle,
                ...customTheme?.pinCodeTextStyle,
              },
              // Cursor/focus stick
              focusStickStyle: {
                ...focusStickStyle,
                ...customTheme?.focusStickStyle,
              },
              // Focused input style
              focusedPinCodeContainerStyle: {
                ...getInputStyles.focusedContainer,
                ...customTheme?.focusedPinCodeContainerStyle,
              },
              // Filled input style
              filledPinCodeContainerStyle: {
                ...getInputStyles.filledContainer,
                ...customTheme?.filledPinCodeContainerStyle,
              },
              // Disabled input style
              disabledPinCodeContainerStyle: {
                ...disabledStyle,
                ...customTheme?.disabledPinCodeContainerStyle,
              },
            }}
          />
        </View>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <Typography
            type="small"
            color={error ? theme.color.error : theme.color.mutedForeground}
            style={{ marginTop: spacing.xs }}>
            {error || helperText}
          </Typography>
        )}
      </Stack>
    );
  }
);

OTPInput.displayName = 'OTPInput';

// ================================================================
// USAGE EXAMPLES
// ================================================================

/*
// Example 1: Basic Usage
<OTPInput
  label="Enter Verification Code"
  numberOfDigits={6}
  variant="outlined"
  size="md"
  onFilled={(otp) => console.log('OTP:', otp)}
  helperText="Enter the 6-digit code sent to your email"
/>

// Example 2: With Error State
const [otp, setOtp] = useState('');
const [error, setError] = useState('');

<OTPInput
  label="Enter OTP"
  numberOfDigits={6}
  variant="outlined"
  size="md"
  error={error}
  onTextChange={(text) => {
    setOtp(text);
    setError(''); // Clear error on change
  }}
  onFilled={async (code) => {
    const isValid = await verifyOTP(code);
    if (!isValid) {
      setError('Invalid OTP. Please try again.');
    }
  }}
/>

// Example 3: Different Variants
<Stack gap="lg">
  <OTPInput
    label="Default Variant"
    variant="default"
    numberOfDigits={4}
    onFilled={(otp) => console.log('OTP:', otp)}
  />
  
  <OTPInput
    label="Filled Variant"
    variant="filled"
    numberOfDigits={6}
    onFilled={(otp) => console.log('OTP:', otp)}
  />
  
  <OTPInput
    label="Outlined Variant"
    variant="outlined"
    numberOfDigits={6}
    onFilled={(otp) => console.log('OTP:', otp)}
  />
</Stack>

// Example 4: Different Sizes
<Stack gap="lg">
  <OTPInput label="Small" size="sm" numberOfDigits={4} />
  <OTPInput label="Medium (Default)" size="md" numberOfDigits={6} />
  <OTPInput label="Large" size="lg" numberOfDigits={6} />
</Stack>

// Example 5: Alphanumeric OTP
<OTPInput
  label="Enter Alphanumeric Code"
  type="alphanumeric"
  numberOfDigits={6}
  variant="outlined"
  placeholder="•"
  onFilled={(otp) => console.log('Code:', otp)}
/>

// Example 6: Using Ref to Control
const otpRef = useRef<OtpInputRef>(null);

<View>
  <OTPInput
    ref={otpRef}
    label="Enter Code"
    numberOfDigits={6}
    variant="outlined"
  />
  <Button
    label="Clear OTP"
    onPress={() => otpRef.current?.clear()}
  />
  <Button
    label="Focus OTP"
    onPress={() => otpRef.current?.focus()}
  />
</View>

// Example 7: Complete OTP Verification Screen
const OTPVerificationScreen = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRef = useRef<OtpInputRef>(null);

  const handleVerifyOTP = async (code: string) => {
    try {
      setLoading(true);
      setError('');
      
      // API call to verify OTP
      const response = await verifyOTPAPI(code);
      
      if (response.success) {
        // Navigate to next screen
        navigation.navigate('Home');
      } else {
        setError('Invalid OTP. Please try again.');
        otpRef.current?.clear();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      otpRef.current?.clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack gap="xl">
        <Typography type="h2">Verify Your Account</Typography>
        <Typography type="body" color={theme.color.mutedForeground}>
          Enter the 6-digit code sent to your email
        </Typography>

        <OTPInput
          ref={otpRef}
          label="Verification Code"
          numberOfDigits={6}
          variant="outlined"
          size="lg"
          error={error}
          disabled={loading}
          onTextChange={(text) => {
            setOtp(text);
            setError('');
          }}
          onFilled={handleVerifyOTP}
          helperText="Didn't receive code? Resend"
        />

        <Button
          label="Verify"
          onPress={() => handleVerifyOTP(otp)}
          loading={loading}
          disabled={otp.length !== 6}
        />
      </Stack>
    </Container>
  );
};
*/
