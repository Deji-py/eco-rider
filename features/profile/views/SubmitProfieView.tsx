// SubmitProfileView.tsx
// ================================================================

import { ScrollView, Alert, View } from 'react-native';
import React, { useState } from 'react';
import SubmitProfileForm, { ProfileData } from '../components/SubmitProfileForm';
import { useTheme } from '@/context/theme-provider';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-provider';
import { supabase } from '@/utils/supabase';
import Typography from '@/components/ui/Typography';
import Toast from 'react-native-toast-message';
import { usePushNotification } from '@/hooks/usePushNotification';
import { useLocationPermission } from '@/hooks/useLocationPermission';

interface SubmitProfileViewProps {
  onSubmitSuccess?: () => void;
}

const SubmitProfileView: React.FC<SubmitProfileViewProps> = ({ onSubmitSuccess }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission: hasPushNotificationsPermission } = usePushNotification();
  const { hasPermission: hasLocationPermission } = useLocationPermission();

  const handleSubmitProfile = async (data: ProfileData) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      throw new Error('User not authenticated');
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting profile for user:', user.id);
      console.log('Profile data:', data);

      // Insert profile into dispatch_riders table
      const { data: insertedData, error: insertError } = await supabase
        .from('dispatch_riders')
        .insert([
          {
            name: `${data.firstname} ${data.lastname}`,
            user_id: user.id,
            firstname: data.firstname,
            lastname: data.lastname,
            phone: null,
            // phone: data.phone.startsWith('+') ? data.phone : `+234${data.phone.slice(-10)}`,
            vehicle_type: data.vehicleType,
            state: data.state,
            local_gov_area: data.localGovArea,
            profile_picture: data.profilePicture,
            drivers_license: data.driversLicense,
            phone_verified: true, // Already verified via MFA
            status: 'available',
            distance_km: 0,
            rating: 5.0,
            completed_deliveries: 0,
          },
        ])
        .select();

      if (insertError) {
        console.error('Database insert error:', insertError);
        setError(insertError.message || 'Failed to save profile');
        throw insertError;
      }

      Toast.show({
        type: 'success',
        text1: 'Profile saved successfully!',
        text2: 'You can now submit deliveries.',
      });

      if (!hasLocationPermission) {
        router.replace('/location-permission');
        return;
      }
      if (!hasPushNotificationsPermission) {
        router.replace('/notification-permission');
        return;
      }
      router.replace('/(protected)/(tabs)/home');
    } catch (err: any) {
      console.error('Profile submission error:', err);
      const errorMessage = err.message || 'Failed to submit profile. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#18181B' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}>
      <SubmitProfileForm onSubmit={handleSubmitProfile} />

      {error && (
        <View
          style={{
            backgroundColor: `${theme.color.error}15`,
            borderLeftWidth: 4,
            borderLeftColor: theme.color.error,
            padding: 12,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 6,
          }}>
          <Typography type="small" color={theme.color.error}>
            {error}
          </Typography>
        </View>
      )}
    </ScrollView>
  );
};

export default SubmitProfileView;
