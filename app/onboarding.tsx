import Container from '@/components/layout/Container';
import { Box, Stack } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { SCREEN_WIDTH } from '@/lib/constants';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingImage from '../assets/svg/onboardImage.svg';
import EcologLogo from '../assets/svg/ecolog-logo.svg';
import GoogleLogo from '../assets/svg/google-logo.svg';
import { sizes } from '@/theme/sizes';
import { setOnBoarded } from '@/lib/utils';
import { useRouter } from 'expo-router';

const Onboarding = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const handleOnboard = ({ method }: { method: 'email' | 'google' }) => {
    switch (method) {
      case 'email':
        console.log('onboarded');
        setOnBoarded();
        router.replace('/');
        break;
      case 'google':
        // Implement direct login with google here
        console.log('google');
        setOnBoarded();
        router.replace('/');
        break;
      default:
        console.log('email');
        break;
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: theme.color.background, flex: 1 }}>
      <Container
        flex={1}
        spacingHorizontal="lg"
        spacingVertical="xl"
        spacingBottom="2xl"
        backgroundColor={theme.color.background}
        justifyContent="flex-start"
        alignItems="center">
        <Stack gap="xl" alignItems="center" flex={1} justifyContent="center">
          {/* Header */}
          <Stack gap="base" alignItems="center">
            <Typography type="h6" color={theme.color.foreground}>
              Hi, Rider 👋
            </Typography>
            <Stack alignItems="center" style={{ maxWidth: '60%' }}>
              <Typography type="display" color={theme.color.foreground} textAlign="center">
                Welcome to
              </Typography>
              <Typography type="display" color={theme.color.foreground} textAlign="center">
                Ecolog Logistics
              </Typography>
            </Stack>
          </Stack>

          {/* Image Placeholder */}
          <View style={[styles.imagePlaceholder]}>
            <OnboardingImage width={'100%'} height={'100%'} />
          </View>

          {/* Logo */}
          <Box>
            <EcologLogo />
          </Box>

          {/* Description */}
          <Stack alignItems="center" style={{ maxWidth: '80%' }}>
            <Typography type="body" color={theme.color.foreground} textAlign="center">
              Delivering with speed, safety, and precision.
            </Typography>
            <Typography type="body" textAlign="center">
              Track every move in real time.
            </Typography>
          </Stack>
        </Stack>

        {/* Buttons */}
        <Stack gap="base" style={styles.buttonContainer}>
          <Button
            size="lg"
            label="Continue with Email"
            onPress={() => handleOnboard({ method: 'email' })}
          />
          <Button
            activeOpacity={0.5}
            size="lg"
            variant="ghost"
            label="Continue with Google"
            icon={<GoogleLogo width={sizes.base} height={sizes.base} />}
            onPress={() => handleOnboard({ method: 'google' })}
          />
        </Stack>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    fontWeight: '700',
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH * 0.8,
    height: 350,
    maxHeight: 350,
    maxWidth: 350,
    borderRadius: 20,
    marginVertical: 16,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  emailButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  googleButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default Onboarding;
