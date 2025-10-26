import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Box, Stack } from '@/components/layout/Layout';
import { Avatar } from '@/components/ui/Avatar';
import { FileUploader } from '@/components/ui/FileUploader';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import Container from '@/components/layout/Container';
import { SCREEN_HEIGHT } from '@/lib/constants';
import { useAuth } from '@/context/auth-provider';
import { useImagePicker } from '@/hooks/useImagePicker';
import { uploadImageToSupabase } from '@/services/imageUploadService';
import { getAllStates, getLgasByState } from '@/data/nigeriaStatesLgas';
import { Alert } from 'react-native';
import { FormSelect } from '@/components/ui/SelectInput';
import { useVehicleTypes } from '../hooks/useVehicleType';

// Validation schema
const profileSchema = z.object({
  firstname: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .min(1, 'First name is required'),
  lastname: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .min(1, 'Last name is required'),
  // phone: z
  //   .string()
  //   .min(10, 'Phone number must be at least 10 digits')
  //   .min(1, 'Phone number is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  state: z.string().min(1, 'State is required'),
  localGovArea: z.string().min(1, 'Local government area is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ProfileDataType = {};

export interface ProfileData {
  firstname: string;
  lastname: string;
  // phone: string;
  vehicleType: string;
  state: string;
  localGovArea: string;
  profilePicture?: string;
  driversLicense?: string;
}
interface SubmitProfileFormProps {
  onSubmit: (data: ProfileData) => Promise<void>;
}

const SubmitProfileForm: React.FC<SubmitProfileFormProps> = ({ onSubmit }) => {
  const { theme } = useTheme();
  const { signOut } = useAuth();
  const { pickImage } = useImagePicker();
  const { vehicleTypeOptions, isLoading: isLoadingVehicleTypes } = useVehicleTypes();

  // Local file URIs for preview (not uploaded yet)
  const [profilePictureUri, setProfilePictureUri] = useState<string | undefined>();
  const [driversLicenseUri, setDriversLicenseUri] = useState<string | undefined>();
  const [licenseFileName, setLicenseFileName] = useState<string | undefined>();
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const { user } = useAuth();
  const [isUploadingOnSubmit, setIsUploadingOnSubmit] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      // phone: '',
      vehicleType: '',
      state: '',
      localGovArea: '',
    },
  });

  const selectedState = watch('state');
  const allStates = getAllStates();
  const availableLgAs = selectedState ? getLgasByState(selectedState) : [];

  // Reset LGA when state changes
  React.useEffect(() => {
    if (selectedState) {
      setValue('localGovArea', '');
    }
  }, [selectedState, setValue]);

  const handleProfilePictureUpload = async () => {
    await pickImage((uri) => {
      setProfilePictureUri(uri);
    });
  };

  const handleLicenseUpload = async () => {
    await pickImage((uri) => {
      setDriversLicenseUri(uri);
      setLicenseFileName('drivers-license.jpg');
    });
  };

  const handleRemoveLicense = () => {
    setDriversLicenseUri(undefined);
    setLicenseFileName(undefined);
  };

  const handleRemoveProfilePicture = () => {
    setProfilePictureUri(undefined);
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    if (!profilePictureUri) {
      Alert.alert('Required', 'Please select a profile picture');
      return;
    }

    if (!driversLicenseUri) {
      Alert.alert('Required', "Please select your driver's license");
      return;
    }

    // if (!isPhoneVerified) {
    //   Alert.alert('Required', 'Please verify your phone number');
    //   return;
    // }

    setIsUploadingOnSubmit(true);

    try {
      // Upload profile picture
      const profileResult = await uploadImageToSupabase(
        profilePictureUri,
        `profile-pictures/${user?.id}/profile-pic`
      );

      if (!profileResult.success) {
        Alert.alert('Upload Error', profileResult.error || 'Failed to upload profile picture');
        setIsUploadingOnSubmit(false);
        return;
      }

      // Upload driver's license
      const licenseResult = await uploadImageToSupabase(
        driversLicenseUri,
        `documents/${user?.id}/drivers-license`
      );

      if (!licenseResult.success) {
        Alert.alert('Upload Error', licenseResult.error || "Failed to upload driver's license");
        setIsUploadingOnSubmit(false);
        return;
      }

      // Both uploads successful, submit form
      await onSubmit({
        ...data,
        profilePicture: profilePictureUri,
        driversLicense: licenseResult.url,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setIsUploadingOnSubmit(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to logout');
    }
  };

  // Display profile picture
  const displayProfilePicture =
    profilePictureUri ||
    'https://ucarecdn.com/e9c9daa7-cd80-4612-a5fa-a48148fb3341/Profile_avatar_placeholder_large.png';

  return (
    <Stack
      style={{
        width: '100%',
        backgroundColor: theme.color.background,
        paddingBottom: SCREEN_HEIGHT * 0.15,
      }}>
      {/* Dark Header Background */}
      <Box
        style={{
          backgroundColor: '#18181B',
          width: '100%',
          height: '15%',
        }}
      />

      <Container>
        <Stack gap="sm" style={{ transform: [{ translateY: '-8%' }] }}>
          {/* Profile Picture Section */}
          <Stack gap="md" alignItems="center">
            <Avatar
              source={displayProfilePicture}
              size="xl"
              canUpload
              onUploadPress={handleProfilePictureUpload}
              initials="U"
              borderWidth={2}
            />
            <Stack style={{ gap: 4 }} alignItems="center">
              <Typography
                type="body"
                style={{ fontFamily: 'Inter_600SemiBold' }}
                color={theme.color.foreground}
                fontWeight="600">
                Upload your profile picture
              </Typography>
              <Typography type="small" color={theme.color.mutedForeground}>
                upload a clear image less than 5mb
              </Typography>
              {profilePictureUri && (
                <Button
                  label="Remove Picture"
                  onPress={handleRemoveProfilePicture}
                  variant="outlined"
                  size="sm"
                  style={{
                    marginTop: 8,
                    borderColor: theme.color.error,
                  }}
                />
              )}
            </Stack>
          </Stack>

          {/* Form Fields */}
          <Stack gap="lg" spacingTop="xl">
            {/* First Name */}
            <FormInput
              name="firstname"
              control={control}
              placeholder="Firstname"
              variant="outlined"
              size="md"
              autoCapitalize="words"
            />

            {/* Last Name */}
            <FormInput
              name="lastname"
              control={control}
              placeholder="Lastname"
              variant="outlined"
              size="md"
              autoCapitalize="words"
            />

            {/* <Stack gap="xs"> */}
            {/* Phone Number Input */}
            {/* <FormInput
                name="phone"
                control={control}
                maxLength={11}
                placeholder="Phone Number"
                variant="outlined"
                size="md"
                keyboardType="phone-pad"
              /> */}

            {/* Phone Number Verification */}
            {/* <FormPhoneVerificationInput
                name="phone"
                control={control}
                onVerified={setIsPhoneVerified}
              /> */}
            {/* </Stack> */}

            {/* Vehicle Type Select */}
            <FormSelect
              name="vehicleType"
              control={control}
              placeholder={isLoadingVehicleTypes ? 'Loading...' : 'Select Vehicle Type'}
              options={vehicleTypeOptions}
              size="md"
              searchable={true}
              showImage={true}
              disabled={isLoadingVehicleTypes}
              rules={{ required: 'Vehicle type is required' }}
            />

            {/* State Select */}
            <FormSelect
              name="state"
              control={control}
              placeholder="Select State"
              options={allStates}
              size="md"
              searchable={true}
              rules={{ required: 'State is required' }}
            />

            {/* Local Government Area Select */}
            <FormSelect
              name="localGovArea"
              control={control}
              placeholder="Select LGA"
              options={availableLgAs}
              size="md"
              searchable={true}
              disabled={!selectedState}
              rules={{ required: 'Local government area is required' }}
            />

            {/* Driver's License Upload */}
            <FileUploader
              placeholder="Upload Driver's License"
              helperText="Please upload a clear image less than 5mb"
              onPress={handleLicenseUpload}
              fileName={licenseFileName}
              onRemove={handleRemoveLicense}
              height={180}
            />
          </Stack>

          {/* Status Text */}
          {(profilePictureUri || driversLicenseUri) && (
            <Stack spacingTop="md">
              <Typography
                type="small"
                color={theme.color.mutedForeground}
                style={{ textAlign: 'center' }}>
                ✓ {profilePictureUri ? 'Profile picture' : ''}
                {profilePictureUri && driversLicenseUri ? ' & ' : ''}
                {driversLicenseUri ? "Driver's license" : ''} ready to upload
              </Typography>
            </Stack>
          )}

          {/* Verification Status */}
          {isPhoneVerified && (
            <Stack spacingTop="md">
              <Typography type="small" color={theme.color.primary} style={{ textAlign: 'center' }}>
                ✓ Phone number verified
              </Typography>
            </Stack>
          )}

          {/* Action Buttons */}
          <Stack gap="md" spacingTop="xl" spacingBottom="lg">
            <Button
              label={isUploadingOnSubmit ? 'Uploading & Saving...' : 'Save and Continue'}
              onPress={handleSubmit(handleFormSubmit)}
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting || isUploadingOnSubmit}
              // disabled={!isPhoneVerified}
            />
            <Button
              label="Logout"
              onPress={handleLogout}
              variant="outlined"
              style={{
                borderWidth: 1,
                borderColor: theme.color.primary,
              }}
              size="lg"
              fullWidth
            />
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
};

export default SubmitProfileForm;
