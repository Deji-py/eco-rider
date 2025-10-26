import Container from '@/components/layout/Container';
import { AppHeader } from '@/components/ui/AppHeader';
import React from 'react';
import AnalyticsView from '@/features/analytics/views/AnalyticsView';
import QuickActionView from '@/features/order/views/QuickActionView';
import { ScrollView } from 'react-native';
import { HeaderProfileGreeting } from '@/components/shared/HeaderGreeting';
import { Box } from '@/components/layout/Layout';

export default function HomeScreen() {
  return (
    <React.Fragment>
      <AppHeader
        showNotification
        notificationBadge
        showBorder
        leftComponent={<HeaderProfileGreeting />}
        variant="default"
        onNotificationPress={() => console.log('Notifications pressed')}
      />
      <ScrollView
        overScrollMode="never"
        contentContainerStyle={{ paddingBottom: 100, backgroundColor: '#F8F6F5' }}>
        <Container flex={1} backgroundColor="transparent">
          {/* <ProfileCompletionStatus profileComplete={false} /> */}
          <AnalyticsView />
          <Box spacingVertical="xs" />
          <QuickActionView />
        </Container>
      </ScrollView>
    </React.Fragment>
  );
}
