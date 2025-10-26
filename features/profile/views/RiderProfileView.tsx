// RiderProfileView.tsx
// ================================================================

import { ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '@/context/theme-provider';
import { useRouter } from 'expo-router';
import { Box, Stack } from '@/components/layout/Layout';
import { Avatar } from '@/components/ui/Avatar';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import Typography from '@/components/ui/Typography';
import ProfileSettingsMenu from '../components/ProfileSettingsMenu';
import Container from '@/components/layout/Container';
import { useAuth } from '@/context/auth-provider';
import useProfileStore from '../store/profile.store';

interface RiderProfileViewProps {
  onSubmitSuccess?: () => void;
}

const RiderProfileView: React.FC<RiderProfileViewProps> = ({ onSubmitSuccess }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { profile, isHydrated } = useProfileStore();

  const { signOut, user } = useAuth();

  const handleSubmitProfile = async (data: any) => {
    try {
      setError(null);
      // API call here
      console.log('Submit profile:', data);
      // Example: await submitProfileAPI(data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success, call the callback
      onSubmitSuccess?.();
      router.replace('/(protected)/(tabs)/home');
    } catch (err) {
      setError('Failed to submit profile. Please try again.');
      console.error('Profile submission error:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ScrollView style={{ backgroundColor: '#18181B' }} showsVerticalScrollIndicator={false}>
      <Stack
        style={{
          width: '100%',
          backgroundColor: '#F8F6F5',
          paddingBottom: SCREEN_HEIGHT * 0.15,
        }}>
        {/* Profile Picture Section */}

        <Box
          style={{
            backgroundColor: '#18181B',
            width: '100%',
            height: 150,
          }}
        />

        <Stack gap="sm" style={{ marginTop: '-12%' }}>
          <Stack gap="md" alignItems="center">
            <Avatar
              source={
                profile?.profile_picture ||
                'https://ucarecdn.com/e9c9daa7-cd80-4612-a5fa-a48148fb3341/Profile_avatar_placeholder_large.png'
              }
              size="xl"
              initials="U"
              borderWidth={2}
            />
          </Stack>
          <Box justifyContent="center" alignItems="center">
            <Typography type="h4" style={{ fontFamily: 'Inter_700Bold' }}>
              {profile?.firstname} {profile?.lastname}
            </Typography>
            <Typography type="body" color={theme.color.mutedForeground}>
              {user?.email}
            </Typography>
          </Box>
        </Stack>
        <Container backgroundColor="transparent" spacingTop="2xl">
          <ProfileSettingsMenu
            onEditProfile={() => {}}
            onSettings={() => {}}
            onLogout={handleLogout}
            appName="Ecolog"
            appVersion="1.0.0"
          />
        </Container>
      </Stack>
    </ScrollView>
  );
};

export default RiderProfileView;
