import React, { useState } from 'react';
import { Linking, Platform } from 'react-native';
import {
  YStack,
  Text,
  Button,
  Sheet,
  XStack,
  Separator,
  Spinner,
} from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useUserStore } from '@/store/useUserStore';
import { haptics } from '@/utils/haptics';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'expo-router';

interface TripPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  countryName: string;
  countryLat?: number;
  countryLng?: number;
}

export const TripPlannerModal = ({
  visible,
  onClose,
  countryName,
  countryLat,
  countryLng,
}: TripPlannerModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const tier = useUserStore((state) => state.tier);
  const isPro = tier === 'pro';
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const generateItinerary = useAction(api.ai.generateTripItinerary);
  const createTrip = useMutation(api.trips.createTrip);

  const handleDownloadMap = async () => {
    haptics.selection();
    // Deep link to Google Maps
    const scheme = Platform.select({
      ios: 'maps://0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${countryLat},${countryLng}`;
    const label = countryName;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleGeneratePlan = async () => {
    haptics.selection();

    if (!isPro) {
      // Should be blocked by UI, but double check
      return;
    }

    try {
      setIsGenerating(true);

      // Default to a trip 1 month from now
      const startDateDate = new Date();
      startDateDate.setDate(startDateDate.getDate() + 30);

      const itinerary = await generateItinerary({
        destination: countryName,
        duration: 3,
        startDate: startDateDate.toISOString().split('T')[0],
      });

      await createTrip({
        destination: countryName,
        startDate: startDateDate.getTime(),
        notes: itinerary,
      });

      onClose();
      // Navigate to the wallet to see the new trip
      setTimeout(() => {
        router.push('/wallet');
      }, 500);
    } catch (error) {
      console.error('Failed to generate trip:', error);
      alert('Could not generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Sheet
      modal
      open={visible}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[45]}
      dismissOnSnapToBottom
      position={0}
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame
        padding="$4"
        justifyContent="flex-start"
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        <YStack gap="$4" alignItems="center" paddingBottom="$8">
          {/* Header Icon */}
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <FontAwesome5 name="plane-departure" size={28} color="white" />
          </LinearGradient>

          <YStack alignItems="center" gap="$2">
            <Text
              fontSize="$6"
              fontWeight="800"
              color="$color"
              textAlign="center"
            >
              Planning a trip to {countryName}?
            </Text>
            <Text
              fontSize="$3"
              color="$gray10"
              textAlign="center"
              paddingHorizontal="$4"
            >
              Get ready for your adventure with our Pro travel tools.
            </Text>
          </YStack>

          <Separator width="100%" opacity={0.5} />

          <YStack width="100%" gap="$3">
            {/* Download Offline Map Option */}
            <Button
              size="$5"
              themeInverse={isPro}
              backgroundColor={isPro ? '$tint' : '$gray5'}
              onPress={isPro ? handleDownloadMap : undefined}
              icon={
                <FontAwesome5
                  name="map-marked-alt"
                  size={18}
                  color={isPro ? 'white' : '$gray10'}
                />
              }
              opacity={isPro ? 1 : 0.6}
              disabled={!isPro}
            >
              <XStack
                flex={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Text
                  color={isPro ? 'white' : '$gray10'}
                  fontWeight="600"
                  fontSize="$4"
                >
                  Download Offline Map
                </Text>
                {!isPro && (
                  <FontAwesome5 name="lock" size={14} color="$gray10" />
                )}
              </XStack>
            </Button>

            {/* Generate Itinerary Option */}
            <Button
              size="$5"
              variant="outlined"
              borderColor="$borderColor"
              onPress={handleGeneratePlan}
              disabled={isGenerating || !isPro}
              opacity={isPro ? 1 : 0.6}
              icon={
                isGenerating ? (
                  <Spinner color="$tint" />
                ) : (
                  <FontAwesome5
                    name="magic"
                    size={16}
                    color={!isPro ? '#888' : colors.tint}
                  />
                )
              }
            >
              <XStack
                flex={1}
                justifyContent="center"
                alignItems="center"
                gap="$2"
              >
                <Text
                  color={!isPro ? '$gray10' : '$color'}
                  fontWeight="600"
                  fontSize="$4"
                >
                  {isGenerating
                    ? 'Generating Itinerary...'
                    : 'Generate AI Itinerary'}
                </Text>
                {!isPro && (
                  <FontAwesome5 name="lock" size={14} color="$gray10" />
                )}
              </XStack>
            </Button>

            {/* Dismiss */}
            <Button size="$3" chromeless onPress={onClose} marginTop="$2">
              <Text color="$gray9" fontSize="$3">
                No, just adding to bucket list
              </Text>
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
