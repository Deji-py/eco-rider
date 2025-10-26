import Container from '@/components/layout/Container';
import { AppHeader } from '@/components/ui/AppHeader';
import React from 'react';
import OrderCounts from '@/features/analytics/components/OrderCounts';
import HistoryListView from '@/features/history/views/HistoryListView';
import { HeaderProfileGreeting } from '@/components/shared/HeaderGreeting';
import useAnalytics from '@/features/analytics/hooks/useAnalytics';

const History = () => {
  const { analytics, isLoading, error } = useAnalytics();

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

      <Container flex={1} backgroundColor="#F8F6F5">
        {!isLoading && analytics && (
          <OrderCounts
            columns={3}
            cancelled={analytics?.orderStats.cancelled as number}
            completed={analytics?.orderStats.completed as number}
          />
        )}

        <HistoryListView />
      </Container>
    </React.Fragment>
  );
};

export default History;
