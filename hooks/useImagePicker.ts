import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UseImagePickerReturn {
  pickImage: (onImagePicked?: (uri: string) => void) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useImagePicker = (): UseImagePickerReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async (onImagePicked?: (uri: string) => void) => {
    setIsLoading(true);
    setError(null);

    try {
      // Request camera roll permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photos to upload an image. Please enable it in settings.'
        );
        setError('Permission denied');
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        onImagePicked?.(imageUri);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to pick image';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pickImage,
    isLoading,
    error,
  };
};
