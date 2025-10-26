import {
  TextInput as RNTextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { useTheme } from '@/context/theme-provider';
import { Stack } from '@/components/layout/Layout';
import Typography from './Typography';
import React from 'react';
import { spacing } from '@/theme/spacing';

type TextAreaSize = 'sm' | 'md' | 'lg';
type TextAreaVariant = 'default' | 'filled' | 'outlined';

interface TextAreaProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  variant?: TextAreaVariant;
  size?: TextAreaSize;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  minHeight?: number;
  style?: ViewStyle;
}

const getSizeStyles = (size: TextAreaSize) => {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        fontSize: 12,
      };
    case 'lg':
      return {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        fontSize: 16,
      };
    case 'md':
    default:
      return {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        fontSize: 14,
      };
  }
};

const getVariantStyles = (
  variant: TextAreaVariant,
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

export const TextArea = React.forwardRef<RNTextInput, TextAreaProps>(
  (
    {
      label,
      placeholder,
      variant = 'outlined',
      size = 'md',
      error,
      helperText,
      disabled = false,
      minHeight = 120,
      style,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [focused, setFocused] = React.useState(false);
    const sizeStyles = getSizeStyles(size);
    const hasError = !!error;

    const variantStyles = React.useMemo(
      () => getVariantStyles(variant, theme, focused, hasError),
      [variant, theme, focused, hasError]
    );

    const textColor = React.useMemo(() => {
      if (disabled) return theme.color.mutedForeground;
      return theme.color.foreground;
    }, [disabled, theme]);

    return (
      <Stack gap="xs" style={style}>
        {label && (
          <Typography type="body" color={theme.color.foreground} fontWeight="500">
            {label}
          </Typography>
        )}

        <View
          style={[
            styles.textAreaContainer,
            variantStyles,
            disabled && styles.disabled,
            { minHeight },
          ]}>
          <RNTextInput
            ref={ref}
            placeholder={placeholder}
            placeholderTextColor={theme.color.mutedForeground}
            editable={!disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline
            numberOfLines={4}
            style={[
              {
                color: textColor,
                ...sizeStyles,
              },
              styles.textArea,
            ]}
            {...props}
          />
        </View>

        {(error || helperText) && (
          <Typography type="small" color={error ? theme.color.error : theme.color.mutedForeground}>
            {error || helperText}
          </Typography>
        )}
      </Stack>
    );
  }
);

TextArea.displayName = 'TextArea';

const styles = StyleSheet.create({
  textAreaContainer: {
    padding: 0,
  },
  textArea: {
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
  },
  disabled: {
    opacity: 0.6,
  },
});
