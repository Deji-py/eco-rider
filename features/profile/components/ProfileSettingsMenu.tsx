import { View } from 'react-native';
import { useTheme } from '@/context/theme-provider';
import Typography from '@/components/ui/Typography';
import { spacing } from '@/theme/spacing';
import { Edit, Settings, HelpCircle, Shield, Info, LogOut } from 'lucide-react-native';
import { MenuItem, MenuList } from '@/components/ui/Menu';
import { Card } from '@/components/ui/Card';

interface ProfileSettingsMenuProps {
  onEditProfile?: () => void;
  onSettings?: () => void;
  onHelpSupport?: () => void;
  onTermsPrivacy?: () => void;
  onAboutApp?: () => void;
  onLogout?: () => void;
  appName?: string;
  appVersion?: string;
}

export const ProfileSettingsMenu: React.FC<ProfileSettingsMenuProps> = ({
  onEditProfile,
  onSettings,
  onHelpSupport,
  onTermsPrivacy,
  onAboutApp,
  onLogout,
  appName = 'Ecolog',
  appVersion = '1.0.0',
}) => {
  const { theme } = useTheme();

  const menuItems: MenuItem[] = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      icon: <Edit />,
      onPress: onEditProfile,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
      onPress: onSettings,
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: <HelpCircle />,
      onPress: onHelpSupport,
    },
    {
      id: 'terms-privacy',
      label: 'Terms and Privacy',
      icon: <Shield />,
      onPress: onTermsPrivacy,
    },
    {
      id: 'about',
      label: `About ${appName}`,
      icon: <Info />,
      onPress: onAboutApp,
    },
  ];

  const logoutItem: MenuItem = {
    id: 'logout',
    label: 'Logout',
    icon: <LogOut />,
    variant: 'danger',
    onPress: onLogout,
  };

  return (
    <Card
      size="sm"
      variant="filled"
      style={{ paddingHorizontal: 8, borderWidth: 1, borderColor: theme.color.border }}>
      {/* Main Menu */}
      <View>
        <MenuList
          items={menuItems}
          showDividers
          containerStyle={{
            backgroundColor: theme.color.cardBackground,
          }}
        />
      </View>

      {/* Logout Menu */}
      <View style={{ marginBottom: spacing.xl }}>
        <MenuList
          items={[logoutItem]}
          showDividers={false}
          containerStyle={{
            backgroundColor: theme.color.cardBackground,
          }}
        />
      </View>

      {/* Footer Info */}
      <View
        style={{
          alignItems: 'center',
          paddingVertical: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
        }}>
        <Typography
          type="small"
          color={theme.color.mutedForeground}
          textAlign="center"
          style={{ marginBottom: spacing.xs }}>
          {appName}
        </Typography>
        <Typography type="small" color={theme.color.mutedForeground} textAlign="center">
          v{appVersion}
        </Typography>
      </View>
    </Card>
  );
};

export default ProfileSettingsMenu;
