// components/ui/Select.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
  Image,
} from 'react-native';
import { Controller, Control } from 'react-hook-form';
import Typography from './Typography';
import { Stack, Row } from '../layout/Layout';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/context/theme-provider';
import useSheet from '@/hooks/useSheet';
import { ChevronDown, X, Check, Search } from 'lucide-react-native';
import SheetModal from './SheetModal';
import {
  BottomSheetView,
  BottomSheetTextInput,
  BottomSheetFlatList,
  SCREEN_HEIGHT,
} from '@gorhom/bottom-sheet';

type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  image?: string;
  capacity?: number;
}

interface BaseSelectProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  options: SelectOption[] | string[];
  value?: string;
  onValueChange?: (value: string) => void;
  size?: SelectSize;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  style?: ViewStyle;
  searchable?: boolean;
  minResults?: number;
  showImage?: boolean;
  showIcon?: boolean;
}

interface SelectProps extends BaseSelectProps {}

interface FormSelectProps extends BaseSelectProps {
  name: string;
  control: Control<any>;
  rules?: any;
}

const getSizeStyles = (size: SelectSize) => {
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

const getVariantStyles = (theme: any, hasError: boolean): ViewStyle => {
  return {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: hasError ? theme.color.error : theme.color.border,
    borderRadius: 8,
  };
};

// Convert string[] to SelectOption[]
const normalizeOptions = (options: SelectOption[] | string[]): SelectOption[] => {
  if (!options || options.length === 0) return [];

  if (typeof options[0] === 'string') {
    return (options as string[]).map((opt) => ({
      label: opt,
      value: opt,
    }));
  }

  return options as SelectOption[];
};

interface OptionItemProps {
  item: SelectOption;
  isSelected: boolean;
  onPress: (value: string) => void;
  theme: any;
  showImage?: boolean;
  showIcon?: boolean;
}

const OptionItem = React.memo(
  ({ item, isSelected, onPress, theme, showImage, showIcon }: OptionItemProps) => (
    <Pressable
      onPress={() => onPress(item.value)}
      style={[
        styles.optionItem,
        {
          backgroundColor: isSelected ? `${theme.color.primary}10` : 'transparent',
          borderBottomColor: theme.color.border,
        },
      ]}>
      <Row alignItems="center" gap="md" style={{ flex: 1 }}>
        {/* Image */}
        {showImage && item.image && (
          <Image source={{ uri: item.image }} style={styles.optionImage} />
        )}

        {/* Icon */}
        {showIcon && item.icon && <View>{item.icon}</View>}

        {/* Content */}
        <Stack style={{ flex: 1 }}>
          <Typography
            type="body"
            color={isSelected ? theme.color.primary : theme.color.foreground}
            fontWeight={isSelected ? '600' : '400'}
            numberOfLines={1}>
            {item.label}
          </Typography>
          {item.capacity && (
            <Typography type="small" color={theme.color.mutedForeground} numberOfLines={1}>
              Capacity: {item.capacity}
            </Typography>
          )}
        </Stack>

        {/* Check Icon */}
        {isSelected && <Check size={20} color={theme.color.primary} strokeWidth={3} />}
      </Row>
    </Pressable>
  )
);

OptionItem.displayName = 'OptionItem';

interface DisplayValueProps {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  theme: any;
  showImage?: boolean;
  sizeStyles: any;
}

const DisplayValue = React.memo(
  ({ value, options, placeholder, theme, showImage, sizeStyles }: DisplayValueProps) => {
    const selectedOption = options.find((opt) => opt.value === value);
    const displayText = selectedOption?.label || placeholder;
    const textColor = value ? theme.color.foreground : theme.color.mutedForeground;

    return (
      <Row style={{ flex: 1 }} gap="md" alignItems="center" justifyContent="space-between">
        <Row alignItems="center" gap="md" style={{ flex: 1 }}>
          {showImage && selectedOption?.image && (
            <Image source={{ uri: selectedOption.image }} style={styles.displayImage} />
          )}
          <Typography
            type="body"
            color={textColor}
            style={{ fontSize: sizeStyles.fontSize }}
            numberOfLines={1}>
            {displayText}
          </Typography>
        </Row>
        <ChevronDown size={20} color={theme.color.mutedForeground} />
      </Row>
    );
  }
);

DisplayValue.displayName = 'DisplayValue';

export const Select = React.forwardRef<View, SelectProps>(
  (
    {
      label,
      placeholder,
      options: rawOptions,
      value,
      onValueChange,
      size = 'md',
      error,
      helperText,
      disabled = false,
      style,
      searchable = true,
      minResults = 10,
      showImage = false,
      showIcon = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { ref: sheetRef, open, close } = useSheet();
    const [searchQuery, setSearchQuery] = useState('');

    const sizeStyles = getSizeStyles(size);
    const hasError = !!error;
    const variantStyles = useMemo(() => getVariantStyles(theme, hasError), [theme, hasError]);

    // Normalize options to SelectOption[]
    const options = useMemo(() => normalizeOptions(rawOptions), [rawOptions]);

    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options;
      return options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [options, searchQuery]);

    const handleSelectOption = useCallback(
      (selectedValue: string) => {
        onValueChange?.(selectedValue);
        close();
        setSearchQuery('');
      },
      [onValueChange, close]
    );

    const handleOpen = useCallback(() => {
      open();
    }, [open]);

    const handleClose = useCallback(() => {
      close();
      setSearchQuery('');
    }, [close]);

    const renderOption = useCallback(
      ({ item }: { item: SelectOption }) => (
        <OptionItem
          item={item}
          isSelected={value === item.value}
          onPress={handleSelectOption}
          theme={theme}
          showImage={showImage}
          showIcon={showIcon}
        />
      ),
      [value, handleSelectOption, theme, showImage, showIcon]
    );

    const keyExtractor = useCallback((item: SelectOption) => item.value, []);

    const renderEmptyState = () => (
      <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
        <Typography type="body" color={theme.color.mutedForeground} style={{ textAlign: 'center' }}>
          No options found
        </Typography>
      </View>
    );

    return (
      <>
        <Stack gap="xs" style={style}>
          {label && (
            <Typography type="body" color={theme.color.foreground} fontWeight="500">
              {label}
            </Typography>
          )}

          <Pressable
            ref={ref}
            onPress={handleOpen}
            disabled={disabled}
            style={[
              styles.selectContainer,
              variantStyles,
              sizeStyles,
              disabled && styles.disabled,
            ]}>
            <DisplayValue
              value={value || ''}
              options={options}
              placeholder={placeholder}
              theme={theme}
              showImage={showImage}
              sizeStyles={sizeStyles}
            />
          </Pressable>

          {(error || helperText) && (
            <Typography
              type="small"
              color={error ? theme.color.error : theme.color.mutedForeground}>
              {error || helperText}
            </Typography>
          )}
        </Stack>

        <SheetModal enableOverDrag={false} ref={sheetRef}>
          <BottomSheetView
            style={{ flex: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xl }}>
            {/* Header */}
            <Row
              alignItems="center"
              justifyContent="space-between"
              style={{ marginBottom: spacing.lg, paddingHorizontal: spacing.xs }}>
              <Typography type="h6" fontWeight="600" color={theme.color.foreground}>
                {label || 'Select Option'}
              </Typography>
              <Pressable onPress={handleClose} hitSlop={40}>
                <X size={24} color={theme.color.mutedForeground} />
              </Pressable>
            </Row>

            {/* Search Input */}
            {searchable && (
              <Row
                alignItems="center"
                style={[
                  styles.searchInput,
                  {
                    borderColor: theme.color.border,
                    backgroundColor: theme.color.background,
                  },
                ]}
                gap="sm">
                <Search size={18} color={theme.color.mutedForeground} />
                <BottomSheetTextInput
                  placeholder="Search options..."
                  placeholderTextColor={theme.color.mutedForeground}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[
                    styles.textInput,
                    {
                      color: theme.color.foreground,
                      fontSize: 14,
                    },
                  ]}
                />
              </Row>
            )}

            {/* Options List with Virtualization */}
            {filteredOptions.length === 0 ? (
              renderEmptyState()
            ) : (
              <BottomSheetFlatList
                data={filteredOptions}
                renderItem={renderOption}
                keyExtractor={keyExtractor}
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
                initialNumToRender={Math.min(minResults, filteredOptions.length)}
                maxToRenderPerBatch={15}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={true}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={{ paddingBottom: 200 }}
                style={{ height: SCREEN_HEIGHT }}
              />
            )}
          </BottomSheetView>
        </SheetModal>
      </>
    );
  }
);

Select.displayName = 'Select';

export const FormSelect = React.forwardRef<View, FormSelectProps>(
  (
    {
      name,
      control,
      rules,
      label,
      placeholder,
      options,
      size = 'md',
      error,
      helperText,
      disabled = false,
      style,
      searchable = true,
      minResults = 10,
      showImage = false,
      showIcon = false,
      ...props
    },
    ref
  ) => {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
          <Select
            ref={ref}
            label={label}
            placeholder={placeholder}
            options={options}
            value={value}
            onValueChange={onChange}
            size={size}
            error={fieldError?.message}
            helperText={helperText}
            disabled={disabled}
            style={style}
            searchable={searchable}
            minResults={minResults}
            showImage={showImage}
            showIcon={showIcon}
            {...props}
          />
        )}
      />
    );
  }
);

FormSelect.displayName = 'FormSelect';

const styles = StyleSheet.create({
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  textInput: {
    flex: 1,
    paddingVertical: spacing.xs,
    marginVertical: 0,
  },
  optionItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 0.5,
  },
  displayImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginLeft: -6,
  },
  optionImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});
