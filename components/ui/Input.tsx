import {
  TextInput as RNTextInput,
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import { Controller, Control } from 'react-hook-form';
import Typography from './Typography';
import { Stack, Row } from '../layout/Layout';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/context/theme-provider';
import { Eye, EyeOff } from 'lucide-react-native'; // or your icon library

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'filled' | 'outlined';

interface BaseInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  variant?: InputVariant;
  size?: InputSize;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  onRightIconPress?: () => void;
  style?: ViewStyle;
}

interface TextInputProps extends BaseInputProps {}

interface FormInputProps extends BaseInputProps {
  name: string;
  control: Control<any>;
  rules?: any;
}

const getSizeStyles = (size: InputSize) => {
  switch (size) {
    case 'sm':
      return {
        height: 36,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        fontSize: 12,
      };
    case 'lg':
      return {
        height: 52,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        fontSize: 16,
      };
    case 'md':
    default:
      return {
        height: 48,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        fontSize: 14,
      };
  }
};

const getVariantStyles = (
  variant: InputVariant,
  theme: any,
  focused: boolean,
  hasError: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    borderRadius: 8,
  };

  switch (variant) {
    case 'filled':
      return {
        ...baseStyle,
        backgroundColor: hasError
          ? `${theme.color.error}10`
          : focused
          ? theme.color.muted
          : `${theme.color.muted}80`,
        borderWidth: 0,
      };
    case 'outlined':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: hasError
          ? theme.color.error
          : focused
          ? theme.color.primary
          : theme.color.border,
      };
    case 'default':
    default:
      return {
        ...baseStyle,
        backgroundColor: theme.color.background,
        borderBottomWidth: 1,
        borderBottomColor: hasError
          ? theme.color.error
          : focused
          ? theme.color.primary
          : theme.color.border,
        borderRadius: 0,
      };
  }
};

/**
 * TextInput - Reusable text input component
 * @example
 * <TextInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   variant="outlined"
 *   size="md"
 *   keyboardType="email-address"
 * />
 */
export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      placeholder,
      variant = 'outlined',
      size = 'md',
      icon,
      rightIcon,
      error,
      helperText,
      disabled = false,
      onRightIconPress,
      secureTextEntry: initialSecure = false,
      style,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(initialSecure);
    const sizeStyles = getSizeStyles(size);
    const hasError = !!error;
    const isPasswordField = initialSecure;

    const variantStyles = useMemo(
      () => getVariantStyles(variant, theme, focused, hasError),
      [variant, theme, focused, hasError]
    );

    const textColor = useMemo(() => {
      if (disabled) return theme.color.mutedForeground;
      return theme.color.foreground;
    }, [disabled, theme]);

    const handlePasswordToggle = () => {
      setSecureTextEntry(!secureTextEntry);
    };

    return (
      <Stack gap="xs" style={style}>
        {label && (
          <Typography type="body" color={theme.color.foreground} fontWeight="500">
            {label}
          </Typography>
        )}

        <Row
          style={StyleSheet.flatten([
            styles.inputContainer,
            variantStyles,
            disabled && styles.disabled,
            {
              paddingRight: spacing.sm,
            },
          ])}
          gap="sm"
          alignItems="center">
          {icon && <View>{icon}</View>}

          <RNTextInput
            ref={ref}
            placeholder={placeholder}
            placeholderTextColor={theme.color.mutedForeground}
            editable={!disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onEndEditing={() => setFocused(false)}
            secureTextEntry={secureTextEntry}
            style={[
              {
                flex: 1,
                color: textColor,
                ...sizeStyles,
              },
              styles.input,
            ]}
            {...props}
          />

          {isPasswordField ? (
            <Pressable hitSlop={40} onPress={handlePasswordToggle} disabled={disabled}>
              <View>
                {secureTextEntry ? (
                  <Eye size={20} color={theme.color.mutedForeground} />
                ) : (
                  <EyeOff size={20} color={theme.color.mutedForeground} />
                )}
              </View>
            </Pressable>
          ) : rightIcon ? (
            <Pressable onPress={onRightIconPress} disabled={disabled}>
              <View>{rightIcon}</View>
            </Pressable>
          ) : null}
        </Row>

        {(error || helperText) && (
          <Typography type="small" color={error ? theme.color.error : theme.color.mutedForeground}>
            {error || helperText}
          </Typography>
        )}
      </Stack>
    );
  }
);

TextInput.displayName = 'TextInput';

/**
 * FormInput - Form input integrated with React Hook Form
 * @example
 * <FormInput
 *   name="email"
 *   control={control}
 *   label="Email"
 *   placeholder="Enter your email"
 *   rules={{ required: 'Email is required' }}
 *   keyboardType="email-address"
 * />
 */
export const FormInput = React.forwardRef<RNTextInput, FormInputProps>(
  (
    {
      name,
      control,
      rules,
      label,
      placeholder,
      variant = 'outlined',
      size = 'md',
      icon,
      rightIcon,
      helperText,
      disabled = false,
      onRightIconPress,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <TextInput
            ref={ref}
            label={label}
            placeholder={placeholder}
            variant={variant}
            size={size}
            icon={icon}
            rightIcon={rightIcon}
            error={error?.message}
            helperText={helperText}
            disabled={disabled}
            onRightIconPress={onRightIconPress}
            style={style}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            {...props}
          />
        )}
      />
    );
  }
);

FormInput.displayName = 'FormInput';

const styles = StyleSheet.create({
  inputContainer: {
    paddingVertical: 0,
  },
  input: {
    padding: 0,
    margin: 0,
  },
  disabled: {
    opacity: 0.6,
  },
});
