import { useTheme } from '@/context/theme-provider';
import { Box, Row, Stack } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { Avatar } from '@/components/ui/Avatar';
import { SCREEN_WIDTH } from '@/lib/constants';
import moment from 'moment';
import { SkeletonCircle, SkeletonText } from '../ui/Skeleton';
import useProfileStore from '@/features/profile/store/profile.store';

export const HeaderProfileGreeting = () => {
  const { theme } = useTheme();
  const profile = useProfileStore((state) => state.profile);
  const isHydrated = useProfileStore((state) => state.isHydrated);

  // Show skeleton layout while loading
  if (!isHydrated || !profile) {
    return (
      <Box flex={1} width={SCREEN_WIDTH * 0.5}>
        <Row>
          <SkeletonCircle
            width={40}
            height={40}
            backgroundColor="#E1E9EE"
            highlightColor="#F2F8FC"
          />
          <Stack style={{ marginLeft: 12, flex: 1 }}>
            <SkeletonText
              width="60%"
              height={18}
              backgroundColor="#E1E9EE"
              highlightColor="#F2F8FC"
              style={{ marginBottom: 6 }}
            />
            <SkeletonText
              width="40%"
              height={14}
              backgroundColor="#E1E9EE"
              highlightColor="#F2F8FC"
            />
          </Stack>
        </Row>
      </Box>
    );
  }

  return (
    <Box flex={1} width={SCREEN_WIDTH * 0.5}>
      <Row>
        <Avatar
          borderWidth={2}
          borderColor={theme.color.secondary}
          source={
            profile?.profile_picture ||
            'https://ucarecdn.com/e9c9daa7-cd80-4612-a5fa-a48148fb3341/Profile_avatar_placeholder_large.png'
          }
          size="sm"
          canUpload={false}
        />
        <Stack style={{ marginLeft: 12 }}>
          <Typography
            numberOfLines={1}
            type="h6"
            color="#000"
            style={{
              fontFamily: 'Inter_600SemiBold',
            }}>
            Hi, {profile?.firstname || 'User'} 👋
          </Typography>
          <Typography
            type="small"
            numberOfLines={1}
            color="#595959"
            style={{
              marginTop: 4,
            }}>
            {profile?.local_gov_area && `${profile.local_gov_area} • `}
            {moment().format('LT')}
          </Typography>
        </Stack>
      </Row>
    </Box>
  );
};
