import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { Package, MapPin, CheckCircle2, X } from 'lucide-react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import { Row } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import SheetModal from '@/components/ui/SheetModal';
import Typography from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/theme-provider';
import useSheet from '@/hooks/useSheet';
import { spacing } from '@/theme/spacing';
import { OTPInput } from '@/components/ui/OTPInput';
import useAssignment from '@/features/tracking/hooks/useAssignment';

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const TrackingPage = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ref: sheetRef, open, close } = useSheet();
  const mapRef = useRef<MapView>(null);

  const { assignment, isLoading, updateAssignmentStatus } = useAssignment(id);

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [code, setCode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // Get location updates
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Location permission denied',
          text2: 'Please enable location to track your delivery',
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLocation(location);
        }
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const handleMarkComplete = async () => {
    if (code.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter a 6-digit code',
      });
      return;
    }

    setIsConfirming(true);

    // Determine which status to update to
    const newStatus = assignment?.status === 'assigned' ? 'picked_up' : 'delivered';

    const result = await updateAssignmentStatus(id, newStatus, code);
    setIsConfirming(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: newStatus === 'picked_up' ? 'Pickup Confirmed!' : 'Order Completed!',
        text2: newStatus === 'picked_up' ? 'Now head to delivery location' : 'Great job!',
      });
      close();
      setCode('');

      // If completed, show success and go home
      if (newStatus === 'delivered') {
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: 'Invalid code. Please check and try again.',
      });
    }
  };

  const fitMapToRoute = () => {
    if (!currentLocation || !assignment || !mapRef.current) return;

    const destination =
      assignment.status === 'assigned'
        ? { latitude: assignment.aggregator_latitude, longitude: assignment.aggregator_longitude }
        : { latitude: assignment.delivery_latitude, longitude: assignment.delivery_longitude };

    const coordinates = [
      {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      },
      destination,
    ];

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
      animated: true,
    });
  };

  useEffect(() => {
    if (currentLocation && assignment) {
      setTimeout(() => fitMapToRoute(), 1000);
    }
  }, [currentLocation, assignment]);

  if (isLoading || !assignment || !currentLocation) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.color.background,
        }}>
        <ActivityIndicator size="large" color={theme.color.primary} />
        <Typography type="body" style={{ marginTop: spacing.md }}>
          Loading tracking...
        </Typography>
      </View>
    );
  }

  // Determine destination based on status
  const isPickupPhase = assignment.status === 'assigned';
  const destination = isPickupPhase
    ? {
        latitude: assignment.aggregator_latitude,
        longitude: assignment.aggregator_longitude,
        name: assignment.aggregator_name,
        address: assignment.aggregator_address,
      }
    : {
        latitude: assignment.delivery_latitude,
        longitude: assignment.delivery_longitude,
        name: 'Delivery Location',
        address: assignment.delivery_address,
      };

  const origin = {
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude,
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation>
        {/* Route with Directions */}
        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={4}
          strokeColor={theme.color.secondary}
          optimizeWaypoints={true}
          onReady={(result) => {
            setDistance(result.distance);
            setDuration(result.duration);
          }}
          onError={(errorMessage) => {
            console.log('Directions Error:', errorMessage);
          }}
        />

        {/* Destination Marker */}
        <Marker coordinate={destination} title={destination.name} description={destination.address}>
          <View
            style={{
              backgroundColor: theme.color.secondary,
              padding: spacing.sm,
              borderRadius: 100,
              borderWidth: 3,
              borderColor: theme.color.background,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
            {isPickupPhase ? (
              <Package size={24} color={theme.color.background} />
            ) : (
              <MapPin size={24} color={theme.color.background} />
            )}
          </View>
        </Marker>
      </MapView>

      {/* Info Card Overlay */}
      <View
        style={{
          position: 'absolute',
          top: 60,
          left: spacing.base,
          right: spacing.base,
        }}>
        <Card variant="filled" style={{ backgroundColor: theme.color.background }}>
          <Row
            alignItems="flex-start"
            justifyContent="space-between"
            style={{ marginBottom: spacing.sm }}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Typography
                type="xtraSmall"
                color={theme.color.mutedForeground}
                style={{ marginBottom: spacing.xs }}>
                {isPickupPhase ? '📦 Pickup Location' : '📍 Delivery Location'}
              </Typography>
              <Typography type="body" fontWeight="600" numberOfLines={2}>
                {destination.name}
              </Typography>
              <Typography type="xtraSmall" color={theme.color.mutedForeground} numberOfLines={1}>
                {destination.address}
              </Typography>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              {distance && (
                <View
                  style={{
                    backgroundColor: theme.color.secondary,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: theme.radius.md,
                    marginBottom: spacing.xs,
                  }}>
                  <Typography type="xtraSmall" color={theme.color.background} fontWeight="600">
                    {distance.toFixed(1)} km
                  </Typography>
                </View>
              )}
              {duration && (
                <Typography type="xtraSmall" color={theme.color.mutedForeground}>
                  ≈ {Math.round(duration)} min
                </Typography>
              )}
            </View>
          </Row>

          {/* Status Badge */}
          <View
            style={{
              backgroundColor: isPickupPhase
                ? `${theme.color.warning}15`
                : `${theme.color.success}15`,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: theme.radius.sm,
              alignSelf: 'flex-start',
            }}>
            <Typography
              type="xtraSmall"
              fontWeight="600"
              style={{ color: isPickupPhase ? theme.color.warning : theme.color.success }}>
              {isPickupPhase ? 'En Route to Pickup' : 'En Route to Delivery'}
            </Typography>
          </View>
        </Card>
      </View>

      {/* Action Button */}
      <View
        style={{
          position: 'absolute',
          bottom: spacing.xl,
          left: spacing.base,
          right: spacing.base,
        }}>
        <Button
          label={isPickupPhase ? 'Mark Pickup Complete' : 'Mark Delivery Complete'}
          onPress={open}
          size="lg"
        />
      </View>

      {/* Confirmation Sheet */}
      <SheetModal ref={sheetRef}>
        <BottomSheetView style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Row
              alignItems="center"
              justifyContent="space-between"
              style={{ marginBottom: spacing.lg }}>
              <Typography type="h6" fontWeight="600" color={theme.color.foreground}>
                {isPickupPhase ? 'Confirm Pickup' : 'Confirm Delivery'}
              </Typography>
              <Pressable onPress={close}>
                <X size={24} color={theme.color.mutedForeground} />
              </Pressable>
            </Row>

            {/* Icon */}
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <View
                style={{
                  backgroundColor: `${theme.color.secondary}15`,
                  borderRadius: 100,
                  padding: spacing.xl,
                  marginBottom: spacing.md,
                }}>
                {isPickupPhase ? (
                  <Package size={48} color={theme.color.secondary} />
                ) : (
                  <CheckCircle2 size={48} color={theme.color.success} />
                )}
              </View>
              <Typography
                type="body"
                color={theme.color.mutedForeground}
                style={{ textAlign: 'center' }}>
                {isPickupPhase
                  ? "Ask the vendor for their 6-digit PIN to confirm you've picked up the order"
                  : 'Ask the customer for their 6-digit PIN to complete this delivery'}
              </Typography>
            </View>

            {/* OTP Input */}
            <View style={{ marginBottom: spacing.xl }}>
              <Typography type="small" fontWeight="600" style={{ marginBottom: spacing.md }}>
                Enter 6-Digit Code
              </Typography>
              <OTPInput numberOfDigits={6} />
              {/* <OTPInput numberOfDigits={6}  value={code} onChange={setCode} autoFocus /> */}
            </View>

            {/* Action Buttons */}
            <Row gap="md">
              <Button
                label="Cancel"
                variant="outlined"
                onPress={() => {
                  close();
                  setCode('');
                }}
                style={{ flex: 1 }}
                disabled={isConfirming}
              />
              <Button
                label={isPickupPhase ? 'Confirm Pickup' : 'Complete Order'}
                onPress={handleMarkComplete}
                disabled={isConfirming || code.length !== 6}
                loading={isConfirming}
                style={{ flex: 1 }}
              />
            </Row>
          </ScrollView>
        </BottomSheetView>
      </SheetModal>
    </View>
  );
};

export default TrackingPage;
