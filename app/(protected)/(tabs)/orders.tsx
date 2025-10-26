import { useTheme } from '@/context/theme-provider';
import Container from '@/components/layout/Container';
import { Stack } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScrollView, View } from 'react-native';
import RequestCard from '@/features/order/components/RequestCard';
import QuickActionView from '@/features/order/views/QuickActionView';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Package } from 'lucide-react-native';
import useOrders from '@/features/order/hooks/useOrders';
import { HeaderProfileGreeting } from '@/components/shared/HeaderGreeting';

// Loading State for Requests
const RequestsLoading = () => {
  return (
    <Stack gap="md">
      <SkeletonCard height={200} />
      <SkeletonCard height={200} />
    </Stack>
  );
};

// Empty State for Requests
const RequestsEmpty = () => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
      }}>
      <Package size={48} color={theme.color.mutedForeground} opacity={0.3} />
      <Typography
        type="body"
        color={theme.color.mutedForeground}
        style={{ marginTop: 16, opacity: 0.6 }}>
        No pending requests
      </Typography>
      <Typography
        type="small"
        color={theme.color.mutedForeground}
        style={{ marginTop: 8, opacity: 0.5, textAlign: 'center', paddingHorizontal: 32 }}>
        New delivery requests will appear here
      </Typography>
    </View>
  );
};

export default function OrderScreen() {
  const { theme } = useTheme();
  const { pendingRequests, isLoading, acceptOrder, rejectOrder } = useOrders();

  const handleAccept = async (assignmentId: number) => {
    const result = await acceptOrder(assignmentId);
    if (result.success) {
      console.log(`Request ${assignmentId} accepted`);
    } else {
      console.error('Failed to accept request:', result.error);
    }
  };

  const handleDecline = async (assignmentId: number, reason: string) => {
    const result = await rejectOrder(assignmentId, reason);
    if (result.success) {
      console.log(`Request ${assignmentId} declined with reason: ${reason}`);
    } else {
      console.error('Failed to decline request:', result.error);
    }
  };

  console.log(pendingRequests);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F6F5' }}>
      <AppHeader
        showNotification
        notificationBadge
        showBorder
        leftComponent={<HeaderProfileGreeting />}
        variant="default"
        onNotificationPress={() => console.log('Notifications pressed')}
      />
      <Stack backgroundColor="#F8F6F5" spacingHorizontal="base" spacingTop="base">
        <QuickActionView />
      </Stack>
      <ScrollView
        overScrollMode="never"
        contentContainerStyle={{ paddingBottom: 100, backgroundColor: '#F8F6F5' }}>
        <Container flex={1} backgroundColor="transparent">
          {isLoading ? (
            <RequestsLoading />
          ) : pendingRequests && pendingRequests.length > 0 ? (
            <View>
              {pendingRequests.map((assignment) => {
                const trader = assignment.bulk_food_request?.bulk_traders;
                const request = assignment.bulk_food_request;

                return (
                  <RequestCard
                    key={assignment.id}
                    assignmentId={assignment.id}
                    businessName={trader?.business_name || 'Unknown Business'}
                    location={`${trader?.local_gov_area || 'Unknown'}, ${
                      trader?.state || 'Unknown'
                    }`}
                    contactPerson={trader?.contact_person}
                    phoneNumber={trader?.phone_numbers}
                    deliveryAddress={request?.delivery_address}
                    items={request?.items || []}
                    notes={assignment.notes || request?.delivery_notes}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                );
              })}
            </View>
          ) : (
            <RequestsEmpty />
          )}
        </Container>
      </ScrollView>
    </View>
  );
}
