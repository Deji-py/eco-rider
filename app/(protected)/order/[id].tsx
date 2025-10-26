import React from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Row, Stack as StackLayout } from '@/components/layout/Layout';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { Badge } from '@/components/ui/Badge';
import { Image } from 'expo-image';
import { Package, MapPin, User, Phone, Calendar } from 'lucide-react-native';
import Container from '@/components/layout/Container';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { SkeletonCard } from '@/components/ui/Skeleton';
import moment from 'moment';

interface ProduceItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_measure: string;
  unit_price: number;
  product_types?: {
    image_url: string;
    category: string;
    description: string;
  };
}

interface OrderDetails {
  id: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  assigned_at: string;
  pickup_time?: string;
  delivery_time?: string;
  notes?: string;
  bulk_food_request: {
    id: number;
    delivery_address: string;
    delivery_notes?: string;
    bulk_traders: {
      business_name: string;
      contact_person: string;
      phone_numbers: string;
      local_gov_area: string;
      state: string;
      business_address: string;
    };
  };
  farmer_produce: ProduceItem[];
}

// Fetch order details
const fetchOrderDetails = async (assignmentId: string): Promise<OrderDetails> => {
  const { data, error } = await supabase
    .from('dispatch_assignments')
    .select(
      `
      *,
      bulk_food_request:bulk_food_request_id (
        *,
        bulk_traders:bulk_trader_id (*)
      ),
      farmer_produce:bulk_food_request_id (
        *,
        product_types:product_name (
          image_url,
          category,
          description
        )
      )
    `
    )
    .eq('id', assignmentId)
    .single();

  if (error) throw error;
  return data;
};

// Produce Item Row Component
const ProduceItemRow: React.FC<{ item: ProduceItem; isLast: boolean }> = ({ item, isLast }) => {
  const { theme } = useTheme();

  return (
    <Row
      gap="md"
      alignItems="center"
      style={{
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.color.border,
      }}>
      {/* Product Image */}
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: theme.color.muted,
          overflow: 'hidden',
        }}>
        {item.product_types?.image_url ? (
          <Image
            source={{ uri: item.product_types.image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: `${theme.color.primary}10`,
            }}>
            <Package size={24} color={theme.color.primary} opacity={0.5} />
          </View>
        )}
      </View>

      {/* Product Details */}
      <StackLayout flex={1} gap="xs">
        <Typography
          type="body"
          color={theme.color.foreground}
          style={{ fontFamily: 'Inter_600SemiBold' }}>
          {item.product_name}
        </Typography>
        {item.product_types?.category && (
          <Typography type="small" color={theme.color.mutedForeground}>
            {item.product_types.category}
          </Typography>
        )}
      </StackLayout>

      {/* Quantity & Price */}
      <StackLayout gap="xs" alignItems="flex-end">
        <Typography
          type="body"
          color={theme.color.foreground}
          style={{ fontFamily: 'Inter_700Bold' }}>
          x{item.quantity}
        </Typography>
        <Typography type="small" color={theme.color.mutedForeground}>
          {item.unit_measure}
        </Typography>
      </StackLayout>

      {/* Unit Price */}
      <StackLayout alignItems="flex-end" style={{ minWidth: 80 }}>
        <Typography type="body" color={theme.color.primary} style={{ fontFamily: 'Inter_700Bold' }}>
          ₦{item.unit_price?.toLocaleString()}
        </Typography>
        <Typography type="small" color={theme.color.mutedForeground}>
          per unit
        </Typography>
      </StackLayout>
    </Row>
  );
};

// Loading State
const OrderDetailsLoading = () => {
  return (
    <Container>
      <StackLayout gap="md">
        <SkeletonCard height={120} />
        <SkeletonCard height={200} />
        <SkeletonCard height={300} />
      </StackLayout>
    </Container>
  );
};

// Main Screen
export default function OrderDetailsScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', id],
    queryFn: () => fetchOrderDetails(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Order Details',
            headerShown: true,
          }}
        />
        <OrderDetailsLoading />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Order Details',
            headerShown: true,
          }}
        />
        <Container>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Typography type="body" color={theme.color.mutedForeground}>
              Order not found
            </Typography>
          </View>
        </Container>
      </>
    );
  }

  const trader = order.bulk_food_request.bulk_traders;
  const statusConfig = {
    assigned: { label: 'Pending', severity: 'warning' as const },
    picked_up: { label: 'Picked Up', severity: 'info' as const },
    in_transit: { label: 'In Transit', severity: 'info' as const },
    delivered: { label: 'Delivered', severity: 'success' as const },
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Order Details',
          headerShown: true,
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F8F6F5' }}
        contentContainerStyle={{ paddingBottom: 100 }}>
        <Container>
          <StackLayout gap="md" spacingTop="base">
            {/* Status & Business Info Card */}
            <Card variant="filled" size="md">
              <Row justifyContent="space-between" alignItems="flex-start" gap="md">
                <StackLayout flex={1} gap="xs">
                  <Typography
                    type="h5"
                    color={theme.color.foreground}
                    style={{ fontFamily: 'Inter_700Bold' }}>
                    {trader.business_name}
                  </Typography>
                  <Row gap="xs" alignItems="center">
                    <MapPin size={14} color={theme.color.mutedForeground} />
                    <Typography type="small" color={theme.color.mutedForeground}>
                      {trader.local_gov_area}, {trader.state}
                    </Typography>
                  </Row>
                </StackLayout>
                <Badge
                  label={statusConfig[order.status].label}
                  severity={statusConfig[order.status].severity}
                />
              </Row>
            </Card>

            {/* Contact Information Card */}
            <Card variant="filled" size="md">
              <Card.Header title="Contact Information" />
              <Card.Content>
                <StackLayout gap="md">
                  <Row gap="md" alignItems="center">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: `${theme.color.primary}15`,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <User size={20} color={theme.color.primary} />
                    </View>
                    <StackLayout flex={1}>
                      <Typography
                        type="small"
                        color={theme.color.mutedForeground}
                        style={{ marginBottom: 2 }}>
                        Contact Person
                      </Typography>
                      <Typography type="body" color={theme.color.foreground}>
                        {trader.contact_person}
                      </Typography>
                    </StackLayout>
                  </Row>

                  <Row gap="md" alignItems="center">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: `${theme.color.primary}15`,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Phone size={20} color={theme.color.primary} />
                    </View>
                    <StackLayout flex={1}>
                      <Typography
                        type="small"
                        color={theme.color.mutedForeground}
                        style={{ marginBottom: 2 }}>
                        Phone Number
                      </Typography>
                      <Typography type="body" color={theme.color.foreground}>
                        {trader.phone_numbers}
                      </Typography>
                    </StackLayout>
                  </Row>

                  <Row gap="md" alignItems="flex-start">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: `${theme.color.primary}15`,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <MapPin size={20} color={theme.color.primary} />
                    </View>
                    <StackLayout flex={1}>
                      <Typography
                        type="small"
                        color={theme.color.mutedForeground}
                        style={{ marginBottom: 2 }}>
                        Delivery Address
                      </Typography>
                      <Typography type="body" color={theme.color.foreground}>
                        {order.bulk_food_request.delivery_address}
                      </Typography>
                    </StackLayout>
                  </Row>
                </StackLayout>
              </Card.Content>
            </Card>

            {/* Timeline Card */}
            <Card variant="filled" size="md">
              <Card.Header title="Delivery Timeline" />
              <Card.Content>
                <StackLayout gap="sm">
                  <Row gap="xs" alignItems="center">
                    <Calendar size={16} color={theme.color.mutedForeground} />
                    <Typography type="small" color={theme.color.mutedForeground}>
                      Assigned:
                    </Typography>
                    <Typography type="small" color={theme.color.foreground}>
                      {moment(order.assigned_at).format('MMM DD, YYYY • h:mm A')}
                    </Typography>
                  </Row>

                  {order.pickup_time && (
                    <Row gap="xs" alignItems="center">
                      <Calendar size={16} color={theme.color.mutedForeground} />
                      <Typography type="small" color={theme.color.mutedForeground}>
                        Picked Up:
                      </Typography>
                      <Typography type="small" color={theme.color.foreground}>
                        {moment(order.pickup_time).format('MMM DD, YYYY • h:mm A')}
                      </Typography>
                    </Row>
                  )}

                  {order.delivery_time && (
                    <Row gap="xs" alignItems="center">
                      <Calendar size={16} color={theme.color.mutedForeground} />
                      <Typography type="small" color={theme.color.mutedForeground}>
                        Delivered:
                      </Typography>
                      <Typography type="small" color={theme.color.foreground}>
                        {moment(order.delivery_time).format('MMM DD, YYYY • h:mm A')}
                      </Typography>
                    </Row>
                  )}
                </StackLayout>
              </Card.Content>
            </Card>

            {/* Package Details Card */}
            <Card variant="filled" size="md">
              <Card.Header
                title="Package Details"
                subtitle={`${order.farmer_produce?.length || 0} items`}
              />
              <Card.Content>
                <StackLayout>
                  {order.farmer_produce && order.farmer_produce.length > 0 ? (
                    order.farmer_produce.map((item, index) => (
                      <ProduceItemRow
                        key={item.id}
                        item={item}
                        isLast={index === order.farmer_produce.length - 1}
                      />
                    ))
                  ) : (
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <Package size={32} color={theme.color.mutedForeground} opacity={0.3} />
                      <Typography
                        type="small"
                        color={theme.color.mutedForeground}
                        style={{ marginTop: 8 }}>
                        No items found
                      </Typography>
                    </View>
                  )}
                </StackLayout>
              </Card.Content>
            </Card>

            {/* Delivery Notes (if any) */}
            {(order.notes || order.bulk_food_request.delivery_notes) && (
              <Card variant="filled" size="md">
                <Card.Header title="Delivery Notes" />
                <Card.Content>
                  <Typography type="body" color={theme.color.foreground}>
                    {order.notes || order.bulk_food_request.delivery_notes}
                  </Typography>
                </Card.Content>
              </Card>
            )}
          </StackLayout>
        </Container>
      </ScrollView>
    </>
  );
}
