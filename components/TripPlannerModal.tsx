import React, { useState } from 'react';
import { Linking } from 'react-native';
import {
  YStack,
  Text,
  Button,
  Sheet,
  XStack,
  Separator,
  Spinner,
  useTheme,
} from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassButton } from '@/components/ui/GlassButton';
import { useUserStore } from '@/store/useUserStore';
import { haptics } from '@/utils/haptics';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { IS_IOS } from '@/constants/platform';

interface TripPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  countryName: string;
  countryLat?: number;
  countryLng?: number;
}

import { OfflineMapGuideModal } from './OfflineMapGuideModal';

export const TripPlannerModal = ({
  visible,
  onClose,
  countryName,
  countryLat,
  countryLng,
}: TripPlannerModalProps) => {
  const theme = useTheme();
  const tier = useUserStore((state) => state.tier);
  const isPro = tier === 'pro';
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showMapGuide, setShowMapGuide] = useState(false);
  const generateItinerary = useAction(api.ai.generateTripItinerary);
  const createTrip = useMutation(api.trips.createTrip);

  const { token } = useAuth();

  const handleDownloadMap = () => {
    haptics.selection();
    setShowMapGuide(true);
  };

  const executeMapDownload = async () => {
    haptics.selection();
    setShowMapGuide(false);

    // Deep link to Google Maps
    // On iOS, we use the specific comgooglemaps URL scheme or https fallback to ensure
    // we don't open Apple Maps, as our guide is specific to Google Maps.
    const query = encodeURIComponent(countryName);
    const latLng =
      countryLat && countryLng ? `${countryLat},${countryLng}` : undefined;

    let url = '';

    if (IS_IOS) {
      // Use universal link which opens Google Maps app if installed
      url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      if (latLng) {
        url += `&center=${latLng}`;
      }
    } else {
      // Android - prefer geo scheme
      if (latLng) {
        url = `geo:${latLng}?q=${latLng}(${query})`;
      } else {
        url = `geo:0,0?q=${query}`;
      }
    }

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleGeneratePlan = async () => {
    haptics.selection();
    onClose();
    // Navigate to the travel planner page with the destination pre-filled
    setTimeout(() => {
      router.push({
        pathname: '/travel-planner',
        params: { destination: countryName },
      });
    }, 300);
  };

  return (
    <>
      <Sheet
        modal
        open={visible}
        onOpenChange={(open: boolean) => !open && onClose()}
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
              <GlassButton
                size="large"
                label={
                  <XStack alignItems="center" gap="$2">
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
                }
                icon="map-marked-alt"
                onPress={isPro ? handleDownloadMap : () => {}}
                backgroundColor={isPro ? theme.tint.get() : '$gray5'}
                textColor={isPro ? 'white' : '$gray10'}
                backgroundOpacity={isPro ? 1 : 0.6}
                disabled={!isPro}
              />

              {/* Generate Itinerary Option */}
              <GlassButton
                size="large"
                label={
                  <XStack alignItems="center" gap="$2">
                    <Text
                      color={!isPro ? '$gray10' : 'white'}
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
                }
                icon={isGenerating ? undefined : 'magic'}
                iconComponent={
                  isGenerating ? <Spinner color="white" /> : undefined
                }
                onPress={handleGeneratePlan}
                backgroundColor={isPro ? '$purple10' : '$gray5'}
                textColor={!isPro ? '$gray10' : 'white'}
                backgroundOpacity={isPro ? 1 : 0.6}
                disabled={isGenerating || !isPro}
              />

              {/* Dismiss */}
              <YStack marginTop="$2">
                <GlassButton
                  size="small"
                  label="No, just adding to bucket list"
                  onPress={onClose}
                  backgroundColor={undefined}
                  backgroundOpacity={0}
                  textColor="$gray9"
                />
              </YStack>
            </YStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>

      <OfflineMapGuideModal
        visible={showMapGuide}
        onClose={() => setShowMapGuide(false)}
        onConfirm={executeMapDownload}
        countryName={countryName}
      />
    </>
  );
};
