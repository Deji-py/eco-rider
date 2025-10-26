import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/theme-provider';
import { Home, FileText, History, User } from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import * as Haptics from 'expo-haptics';
// Type for Lucide icon component
interface TabBarIconProps {
  color: string;
  focused: boolean;
}

// Generic wrapper for Lucide icons
function TabBarIcon({
  Icon,
  color,
  focused,
}: {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
}) {
  return <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
}

// Custom TabBarIcon with badge support
function TabBarIconWithBadge({
  Icon,
  color,
  focused,
  badge,
  badgeCount,
}: {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
  badge?: boolean;
  badgeCount?: number;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ position: 'relative' }}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      {badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.color.error,
              borderColor: theme.color.background,
            },
          ]}>
          {badgeCount !== undefined && badgeCount > 0 && (
            <Typography
              type="xtraSmall"
              color="#fff"
              fontWeight="600"
              style={{ fontSize: 10, lineHeight: 12 }}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Typography>
          )}
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.color.secondary,
        tabBarInactiveTintColor: theme.color.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.color.background,
          borderTopColor: theme.color.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 85 : 80,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          shadowOpacity: 0,
          elevation: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter_500Medium',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      {/* Home Tab */}
      <Tabs.Screen
        name="home"
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />

      {/* Orders Tab with Badge */}
      <Tabs.Screen
        name="orders"
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWithBadge
              Icon={FileText}
              color={color}
              focused={focused}
              // badge={true}
              // badgeCount={3}
            />
          ),
        }}
      />

      {/* History Tab */}
      <Tabs.Screen
        name="history"
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={History} color={color} focused={focused} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
});
