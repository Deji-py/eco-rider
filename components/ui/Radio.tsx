import * as React from 'react';
import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import { View, Pressable } from 'react-native';
import { useTheme } from '@/context/theme-provider';
import Typography from '@/components/ui/Typography';
import { spacing } from '@/theme/spacing';

interface RadioOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

interface RadioGroupProps<T> {
  value: T;
  onValueChange: (value: T) => void;
  options: RadioOption<T>[];
  direction?: 'vertical' | 'horizontal';
  gap?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface RadioItemProps {
  label: string;
  value: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  inactiveColor?: string;
  labelColor?: string;
  onLabelPress?: () => void;
  isActive?: boolean;
}

const getSizeConfig = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return { outerSize: 18, innerSize: 8, labelSize: 'small' as const };
    case 'lg':
      return { outerSize: 24, innerSize: 12, labelSize: 'h6' as const };
    case 'md':
    default:
      return { outerSize: 20, innerSize: 10, labelSize: 'body' as const };
  }
};

const RadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioItemProps
>(
  (
    {
      label,
      value,
      disabled = false,
      size = 'md',
      activeColor,
      inactiveColor,
      labelColor,
      onLabelPress,
      isActive,
    },
    ref
  ) => {
    const { theme } = useTheme();

    const config = getSizeConfig(size);
    const active = activeColor || theme.color.secondary;
    const inactive = inactiveColor || theme.color.border;
    const labelCol = labelColor || theme.color.foreground;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.color.border,
        }}>
        <RadioGroupPrimitive.Item
          ref={ref}
          value={value}
          disabled={disabled}
          aria-labelledby={`radio-label-${value}`}
          style={{
            width: config.outerSize,
            height: config.outerSize,
            borderRadius: config.outerSize / 2,
            borderWidth: 2,
            borderColor: isActive ? active : inactive,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1,
          }}>
          <RadioGroupPrimitive.Indicator
            style={{
              width: config.innerSize,
              height: config.innerSize,
              borderRadius: config.innerSize / 2,
              backgroundColor: active,
            }}
          />
        </RadioGroupPrimitive.Item>

        <Pressable
          onPress={onLabelPress}
          style={{ width: '100%', paddingVertical: spacing.sm }}
          disabled={disabled}>
          <Typography
            type={config.labelSize}
            color={labelCol}
            style={{ opacity: disabled ? 0.5 : 1 }}>
            {label}
          </Typography>
        </Pressable>
      </View>
    );
  }
);

RadioItem.displayName = 'RadioItem';

interface RadioGroupComponentProps<T> extends RadioGroupProps<T> {
  activeColor?: string;
  inactiveColor?: string;
  labelColor?: string;
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupComponentProps<any>
>(
  (
    {
      value,
      onValueChange,
      options,
      direction = 'vertical',
      gap = spacing.sm,
      disabled = false,
      size = 'md',
      activeColor,
      inactiveColor,
      labelColor,
    },
    ref
  ) => {
    const { theme } = useTheme();

    const handleLabelPress = (optionValue: any) => {
      if (!disabled) {
        onValueChange(optionValue);
      }
    };

    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}>
        <View
          style={{
            flexDirection: direction === 'horizontal' ? 'row' : 'column',
            gap: gap,
          }}>
          {options.map((option) => (
            <RadioItem
              isActive={value === option.value}
              key={option.value}
              value={option.value}
              label={option.label}
              disabled={option.disabled || disabled}
              size={size}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              labelColor={labelColor}
              onLabelPress={() => handleLabelPress(option.value)}
            />
          ))}
        </View>
      </RadioGroupPrimitive.Root>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup, RadioItem };
export type { RadioGroupProps, RadioOption, RadioItemProps };
