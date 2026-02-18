import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  YStack,
  XStack,
  Card,
  Text,
  Button,
  Input,
  Label,
  Heading,
  useTheme,
} from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { FontAwesome5 } from '@expo/vector-icons';
import { format } from 'date-fns';
import { scheduleFlightReminders } from '@/utils/notifications';

interface TripInfoCardProps {
  trip: any;
  token: string;
  updateTrip: any; // Using any for simplicity in rapid refactor, ideally strict typed
}

export const TripInfoCard = ({
  trip,
  token,
  updateTrip,
}: TripInfoCardProps) => {
  const theme = useTheme();

  const [isEditingFlight, setIsEditingFlight] = useState(false);
  const [flightNumberInput, setFlightNumberInput] = useState('');

  return (
    <GlassCard
      variant="default"
      shadowRadius={3}
      contentContainerStyle={{ padding: 16 }}
    >
      <XStack gap="$4" alignItems="center">
        <YStack
          alignItems="center"
          backgroundColor="$tint10"
          padding="$3"
          borderRadius="$4"
        >
          <FontAwesome5 name="plane" size={24} color={theme.tint.get()} />
        </YStack>
        <YStack flex={1}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$color11" fontSize="$3">
              FLIGHT
            </Text>
            <GlassButton
              size="small"
              icon={isEditingFlight ? 'check' : 'pen'}
              onPress={async () => {
                if (isEditingFlight) {
                  try {
                    await updateTrip({
                      id: trip._id,
                      token,
                      flightNumber: flightNumberInput,
                    });
                    Alert.alert('Success', 'Flight number updated');
                  } catch (e) {
                    Alert.alert('Error', 'Failed to update flight');
                  }
                } else {
                  setFlightNumberInput(trip.flightNumber || '');
                }
                setIsEditingFlight(!isEditingFlight);
              }}
              variant="default"
              backgroundOpacity={0}
            />
          </XStack>
          {isEditingFlight ? (
            <YStack gap="$2" marginTop="$2">
              <Label color="$color11" fontSize="$3">
                Flight Number
              </Label>
              <GlassCard
                variant="thin"
                borderRadius={12}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              >
                <Input
                  unstyled
                  size="$3"
                  value={flightNumberInput}
                  onChangeText={setFlightNumberInput}
                  placeholder="e.g. RO342"
                  backgroundColor="transparent"
                  borderWidth={0}
                  color="$color"
                  height={40}
                  placeholderTextColor="$gray10"
                />
              </GlassCard>
              <Label color="$color11" fontSize="$3">
                Departure Time
              </Label>
              <GlassCard
                variant="thin"
                borderRadius={12}
                contentContainerStyle={{
                  paddingHorizontal: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Input
                  flex={1}
                  unstyled
                  height={40}
                  placeholder="HH"
                  placeholderTextColor="$gray10"
                  keyboardType="number-pad"
                  maxLength={2}
                  backgroundColor="transparent"
                  borderWidth={0}
                  textAlign="center"
                  color="$color"
                  value={new Date(trip.startDate)
                    .getHours()
                    .toString()
                    .padStart(2, '0')}
                  onChangeText={(t) => {
                    const d = new Date(trip.startDate);
                    d.setHours(parseInt(t) || 0);
                    updateTrip({ id: trip._id, token, startDate: d.getTime() });
                  }}
                />
                <Text color="$gray10">:</Text>
                <Input
                  flex={1}
                  unstyled
                  height={40}
                  placeholder="MM"
                  placeholderTextColor="$gray10"
                  keyboardType="number-pad"
                  maxLength={2}
                  backgroundColor="transparent"
                  borderWidth={0}
                  textAlign="center"
                  color="$color"
                  value={new Date(trip.startDate)
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}
                  onChangeText={(t) => {
                    const d = new Date(trip.startDate);
                    d.setMinutes(parseInt(t) || 0);
                    updateTrip({ id: trip._id, token, startDate: d.getTime() });
                  }}
                />
              </GlassCard>
            </YStack>
          ) : (
            <Heading size="$6">{trip.flightNumber || 'N/A'}</Heading>
          )}

          <Text color="$color11" fontSize="$3" marginTop="$1">
            {format(new Date(trip.startDate), 'MMM dd, HH:mm')}
          </Text>

          <YStack marginTop="$3">
            <GlassButton
              size="medium"
              label="Set Reminders"
              icon="bell"
              variant="default"
              onPress={async () => {
                const ids = await scheduleFlightReminders(
                  trip._id,
                  trip.destination,
                  trip.flightNumber || '',
                  trip.startDate
                );
                if (ids && ids.length > 0) {
                  Alert.alert(
                    'Reminders Set',
                    "We'll remind you 24h and 3h before your trip!"
                  );
                } else {
                  Alert.alert(
                    'Notice',
                    'Could not set reminders (trip might be in the past or permission denied).'
                  );
                }
              }}
            />
          </YStack>
        </YStack>
      </XStack>
    </GlassCard>
  );
};
