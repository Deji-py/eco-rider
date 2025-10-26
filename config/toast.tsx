import { sizes } from '@/theme/sizes';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactNode } from 'react';
import { Platform, StatusBar, Text, View } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 44;

// Professional color palette with proper contrast
const COLORS = {
  success: {
    background: '#10b981', // emerald-500
    text: '#ffffff',
    accent: '#059669', // emerald-600
  },
  error: {
    background: '#f43f5e', // rose-500
    text: '#ffffff',
    accent: '#e11d48', // rose-600
  },
  warning: {
    background: '#f59e0b', // amber-500
    text: '#ffffff',
    accent: '#d97706', // amber-600
  },
  info: {
    background: '#3b82f6', // blue-500
    text: '#ffffff',
    accent: '#2563eb', // blue-600
  },
};

// Enhanced toast styles with modern design
const getToastStyle = (backgroundColor: string, accentColor: string) => ({
  backgroundColor,
  elevation: 0,
  minHeight: 50 + STATUS_BAR_HEIGHT,
  maxHeight: 90 + STATUS_BAR_HEIGHT, // Allow for two lines
  paddingTop: STATUS_BAR_HEIGHT + 20,
  paddingBottom: 16,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

const toastTextStyle = {
  fontSize: 15,
  fontWeight: '600' as const,
  lineHeight: 20,
  flex: 1,
  flexWrap: 'wrap' as const,
};

// Enhanced custom toast component
const CustomToast = ({
  text1,
  backgroundColor,
  accentColor,
  textColor,
  emoji,
  extra,
}: {
  text1?: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  emoji: ReactNode;
  extra?: React.ReactNode;
}) => (
  <View style={getToastStyle(backgroundColor, accentColor) as any}>
    <View style={{ marginRight: 12 }}>{emoji}</View>
    <Text style={[toastTextStyle, { color: textColor }]} numberOfLines={2} ellipsizeMode="tail">
      {text1}
    </Text>
    {extra}
  </View>
);

const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <CustomToast
      text1={text1}
      backgroundColor={COLORS.success.background}
      accentColor={COLORS.success.accent}
      textColor={COLORS.success.text}
      emoji={<MaterialIcons size={sizes.md} color={COLORS.success.text} name="celebration" />}
    />
  ),

  error: ({ text1 }) => (
    <CustomToast
      text1={text1}
      backgroundColor={COLORS.error.background}
      accentColor={COLORS.error.accent}
      textColor={COLORS.error.text}
      emoji={<MaterialIcons color={COLORS.success.text} size={sizes.md} name="error" />}
    />
  ),

  warning: ({ text1 }) => (
    <CustomToast
      text1={text1}
      backgroundColor={COLORS.warning.background}
      accentColor={COLORS.warning.accent}
      textColor={COLORS.warning.text}
      emoji={<MaterialIcons color={COLORS.success.text} size={sizes.md} name="warning" />}
    />
  ),

  info: ({ text1 }) => (
    <CustomToast
      text1={text1}
      backgroundColor={COLORS.info.background}
      accentColor={COLORS.info.accent}
      textColor={COLORS.info.text}
      emoji={<MaterialIcons name="info" />}
    />
  ),
};

// Toast configuration with reduced bounce and overdrag prevention
export const toastOptions = {
  // Reduce bounciness and prevent overdrag
  animationConfig: {
    tension: 100, // Reduced from default ~200
    friction: 8, // Increased from default ~7
    useNativeDriver: true,
  },
  // Prevent overdrag
  swipeable: true,
  dragThreshold: 50, // Reduced sensitivity
  velocityThreshold: 0.3, // Reduced velocity threshold
};

export default toastConfig;
