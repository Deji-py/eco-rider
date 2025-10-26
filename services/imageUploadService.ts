// 1. imageUploadService.ts
import { supabase } from '@/utils/supabase';
import { decode } from 'base64-arraybuffer';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImageToSupabase = async (
  imageUri: string,
  bucket: string
): Promise<UploadResult> => {
  try {
    // Validate file size (5MB limit)
    const response = await fetch(imageUri);
    const blob = await response.blob();

    if (blob.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size must be less than 5MB',
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${bucket}-${timestamp}-${Math.random().toString(36).substring(7)}`;

    // Read file as base64
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Upload to Supabase
    const { data, error } = await supabase.storage.from(bucket).upload(filename, decode(base64), {
      contentType: blob.type,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload image',
    };
  }
};
