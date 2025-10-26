import { View, ViewStyle, FlatList } from 'react-native';
import React, { JSXElementConstructor, ReactElement, ReactNode, useMemo } from 'react';
import { spacing } from '@/theme/spacing';

type SpacingKey = keyof typeof spacing;
type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch';

interface BaseLayoutProps {
  children?: ReactNode;
  spacingHorizontal?: SpacingKey;
  spacingVertical?: SpacingKey;
  spacingLeft?: SpacingKey;
  spacingRight?: SpacingKey;
  spacingTop?: SpacingKey;
  spacingBottom?: SpacingKey;
  gap?: SpacingKey;
  backgroundColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  flex?: number;
  style?: ViewStyle | ViewStyle[];
}

interface RowProps extends BaseLayoutProps {
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
}

interface StackProps extends BaseLayoutProps {
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
}

interface BoxProps extends BaseLayoutProps {
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  height?: number;
  width?: number;
}

interface GridProps<T> extends Omit<BaseLayoutProps, 'children'> {
  data: T[];
  renderItem: (
    item: T,
    index: number
  ) => ReactElement<unknown, string | JSXElementConstructor<any>> | null;
  numColumns?: number;
  keyExtractor?: (item: T, index: number) => string;
}

// Helper to get spacing value
const getSpacingValue = (key?: SpacingKey): number | undefined => {
  return key ? spacing[key] : undefined;
};

// Helper to build style
const buildStyle = (props: BaseLayoutProps): ViewStyle => {
  const style: ViewStyle = {
    paddingLeft: getSpacingValue(props.spacingLeft) || getSpacingValue(props.spacingHorizontal),
    paddingRight: getSpacingValue(props.spacingRight) || getSpacingValue(props.spacingHorizontal),
    paddingTop: getSpacingValue(props.spacingTop) || getSpacingValue(props.spacingVertical),
    paddingBottom: getSpacingValue(props.spacingBottom) || getSpacingValue(props.spacingVertical),
  };

  if (props.gap) style.gap = getSpacingValue(props.gap);
  if (props.backgroundColor) style.backgroundColor = props.backgroundColor;
  if (props.borderRadius) style.borderRadius = props.borderRadius;
  if (props.borderColor) style.borderColor = props.borderColor;
  if (props.borderWidth) style.borderWidth = props.borderWidth;
  if (props.flex !== undefined) style.flex = props.flex;

  return style;
};

/**
 * Row - Horizontal flex container
 * @example
 * <Row spacingHorizontal="md" gap="sm" alignItems="center">
 *   <Text>Item 1</Text>
 *   <Text>Item 2</Text>
 * </Row>
 */
export const Row: React.FC<RowProps> = ({
  children,
  justifyContent = 'flex-start',
  alignItems = 'center',
  flexWrap = 'nowrap',
  ...props
}) => {
  const dynamicStyle = useMemo(() => {
    const baseStyle = buildStyle(props);
    return {
      ...baseStyle,
      flexDirection: 'row' as const,
      justifyContent,
      alignItems,
      flexWrap,
    };
  }, [props, justifyContent, alignItems, flexWrap]);

  return <View style={[dynamicStyle, props.style]}>{children}</View>;
};

/**
 * Stack - Vertical flex container
 * @example
 * <Stack spacingVertical="md" gap="base" alignItems="stretch">
 *   <Text>Item 1</Text>
 *   <Text>Item 2</Text>
 * </Stack>
 */
export const Stack: React.FC<StackProps> = ({
  children,
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  ...props
}) => {
  const dynamicStyle = useMemo(() => {
    const baseStyle = buildStyle(props);
    return {
      ...baseStyle,
      flexDirection: 'column' as const,
      justifyContent,
      alignItems,
    };
  }, [props, justifyContent, alignItems]);

  return <View style={[dynamicStyle, props.style]}>{children}</View>;
};

/**
 * Box - Generic flex container with full control
 * @example
 * <Box
 *   spacingHorizontal="lg"
 *   spacingVertical="md"
 *   backgroundColor="#fff"
 *   borderRadius={12}
 *   flex={1}
 * >
 *   <Text>Content</Text>
 * </Box>
 */
export const Box: React.FC<BoxProps> = ({
  children,
  height,
  width,
  justifyContent = 'flex-start',
  alignItems = 'flex-start',
  ...props
}) => {
  const dynamicStyle = useMemo(() => {
    const baseStyle = buildStyle(props);
    return {
      ...baseStyle,
      justifyContent,
      alignItems,
      ...(height !== undefined && { height }),
      ...(width !== undefined && { width }),
    };
  }, [props, justifyContent, alignItems, height, width]);

  return <View style={[dynamicStyle, props.style]}>{children}</View>;
};

/**
 * Grid - Reusable grid layout component
 * @example
 * <Grid
 *   data={items}
 *   numColumns={2}
 *   gap="md"
 *   renderItem={(item) => <ItemCard item={item} />}
 * />
 */
export const Grid = React.forwardRef<FlatList, GridProps<any>>(
  ({ data, renderItem, numColumns = 2, keyExtractor, ...props }, ref) => {
    const dynamicStyle = useMemo(() => {
      const baseStyle = buildStyle(props);
      return {
        ...baseStyle,
        flex: props.flex !== undefined ? props.flex : 1,
      };
    }, [props]);

    const defaultKeyExtractor = (item: any, index: number) => `grid-item-${index}`;

    return (
      <FlatList
        ref={ref}
        data={data}
        numColumns={numColumns}
        renderItem={({ item, index }) => renderItem(item, index)}
        keyExtractor={keyExtractor || defaultKeyExtractor}
        scrollEnabled={false}
        contentContainerStyle={dynamicStyle}
        columnWrapperStyle={{
          gap: getSpacingValue(props.gap),
        }}
      />
    );
  }
);

Grid.displayName = 'Grid';
