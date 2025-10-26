import { View, Image, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { useTheme } from '@/context/theme-provider';
import { CloudUpload } from 'lucide-react-native';
import Typography from './Typography';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  /**
   * Source URI for the avatar image
   */
  source?: string;

  /**
   * Size variant of the avatar
   */
  size?: AvatarSize;

  /**
   * Show upload overlay and enable upload functionality
   */
  canUpload?: boolean;

  /**
   * Callback when upload is pressed
   */
  onUploadPress?: () => void;

  /**
   * Initials to display when no image is provided
   */
  initials?: string;

  /**
   * Custom border width
   */
  borderWidth?: number;

  /**
   * Custom border color
   */
  borderColor?: string;
}

const getSizeConfig = (size: AvatarSize) => {
  switch (size) {
    case 'sm':
      return { dimension: 44, iconSize: 16, fontSize: 16 };
    case 'md':
      return { dimension: 64, iconSize: 20, fontSize: 20 };
    case 'lg':
      return { dimension: 96, iconSize: 24, fontSize: 28 };
    case 'xl':
      return { dimension: 100, iconSize: 36, fontSize: 44 };
    default:
      return { dimension: 64, iconSize: 20, fontSize: 20 };
  }
};

/**
 * Avatar - Reusable avatar component with upload functionality
 *
 * @example
 * <Avatar
 *   source="https://example.com/avatar.jpg"
 *   size="xl"
 *   canUpload
 *   onUploadPress={() => console.log('Upload pressed')}
 * />
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'md',
  canUpload = false,
  onUploadPress,
  initials = 'U',
  borderWidth = 4,
  borderColor,
}) => {
  const { theme } = useTheme();
  const { dimension, iconSize, fontSize } = getSizeConfig(size);

  return (
    <View
      style={{
        position: 'relative',
      }}>
      {/* Avatar Container */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            borderWidth: borderWidth,
            borderColor: borderColor || theme.color.background,
            backgroundColor: theme.color.muted,
          },
        ]}>
        {source ? (
          <Image
            source={{ uri: source }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: dimension / 2,
            }}
            resizeMode="cover"
          />
        ) : (
          <Typography
            type="h3"
            color={theme.color.mutedForeground}
            style={{ fontSize: fontSize }}
            fontWeight="600">
            {initials}
          </Typography>
        )}
      </View>

      {/* Upload Overlay */}
      {canUpload && (
        <Pressable
          onPress={onUploadPress}
          style={[
            styles.uploadOverlay,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          ]}>
          <View
            style={[
              styles.uploadIcon,
              {
                width: dimension * 0.35,
                height: dimension * 0.35,
                borderRadius: (dimension * 0.35) / 2,
              },
            ]}>
            <CloudUpload size={iconSize} color={theme.color.primaryForeground} />
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
