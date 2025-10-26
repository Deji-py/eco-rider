import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  backgroundColor?: string;
  highlightColor?: string;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  backgroundColor = '#E1E9EE',
  highlightColor = '#F2F8FC',
  style,
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(animatedValue.value, [0, 1], [-300, 300]);

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          overflow: 'hidden',
        },
        style,
      ]}>
      <Animated.View style={[styles.gradient, animatedStyle]}>
        <LinearGradient
          colors={[backgroundColor, highlightColor, backgroundColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.linearGradient}
        />
      </Animated.View>
    </View>
  );
};

// Preset skeleton components for common patterns
export const SkeletonCircle: React.FC<Omit<SkeletonProps, 'borderRadius'>> = ({
  width = 50,
  height = 50,
  ...props
}) => {
  const size = typeof width === 'number' ? width : 50;
  return <Skeleton width={size} height={size} borderRadius={size / 2} {...props} />;
};

export const SkeletonText: React.FC<SkeletonProps> = ({ height = 16, ...props }) => {
  return <Skeleton height={height} {...props} />;
};

export const SkeletonCard: React.FC<SkeletonProps> = ({
  height = 120,
  borderRadius = 12,
  ...props
}) => {
  return <Skeleton height={height} borderRadius={borderRadius} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    width: 300,
    height: '100%',
  },
  linearGradient: {
    flex: 1,
  },
});
