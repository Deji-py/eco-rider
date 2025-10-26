import DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

interface DocumentPickerResult {
  uri: string;
  name: string;
  size: number;
}

interface UseDocumentPickerReturn {
  pickDocument: (onDocumentPicked?: (doc: DocumentPickerResult) => void) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useDocumentPicker = (): UseDocumentPickerReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickDocument = async (onDocumentPicked?: (doc: DocumentPickerResult) => void) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const doc = result.assets[0];
        const fileSize = doc.size || 0;

        // Validate file size (5MB limit)
        if (fileSize > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'File must be less than 5MB');
          setError('File too large');
          setIsLoading(false);
          return;
        }

        onDocumentPicked?.({
          uri: doc.uri,
          name: doc.name,
          size: fileSize,
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to pick document';
      setError(errorMsg);
      if (!err.message?.includes('cancelled')) {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pickDocument,
    isLoading,
    error,
  };
};
