import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/ScreenLayout';
import {
  YStack,
  XStack,
  Heading,
  Text,
  Button,
  Card,
  Spinner,
  Separator,
  Input,
  Theme,
} from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/hooks/useAuth';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { haptics } from '@/utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useUserStore } from '@/store/useUserStore';
import Markdown from 'react-native-markdown-display';
import { Linking } from 'react-native';

export default function TravelPlannerScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token, isAuthenticated } = useAuth();
  const tier = useUserStore((state) => state.tier);
  const isPro = tier === 'pro';

  const { destination: initialDest } = useLocalSearchParams<{
    destination?: string;
  }>();

  const [destination, setDestination] = useState(initialDest || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState(3);
  const [flightNumber, setFlightNumber] = useState('');
  const [itinerary, setItinerary] = useState<string | null>(null);

  const generateItinerary = useAction(api.ai.generateTripItinerary);
  const createTrip = useMutation(api.trips.createTrip);
  const myTrips = useQuery(api.trips.getTrips, token ? { token } : 'skip');

  const handleGenerate = async () => {
    if (!destination.trim()) {
      Alert.alert(t('common_error'), t('wallet_error_missing'));
      return;
    }

    if (isGenerating) return;

    if (!isPro) {
      // Trigger premium modal (to be implemented)
      Alert.alert(t('travel_locked_pro_title'), t('travel_locked_pro_desc'));
      return;
    }

    if (!token) {
      Alert.alert(t('common_error'), 'Please sign in to save trips.');
      return;
    }

    try {
      setIsGenerating(true);
      haptics.selection();

      const generatedItinerary = await generateItinerary({
        destination: destination.trim(),
        duration,
      });

      setItinerary(generatedItinerary);
      haptics.success();

      // Auto-save the trip
      await createTrip({
        token,
        destination: destination.trim(),
        startDate: Date.now(),
        flightNumber: flightNumber.trim() || undefined,
        notes: generatedItinerary,
      });

      setDestination('');
      haptics.success();
      Alert.alert(
        'Success',
        'Your itinerary has been generated and saved to your wallet!'
      );
    } catch (error) {
      console.error('Failed to generate trip:', error);
      Alert.alert(
        t('common_error'),
        'Could not generate itinerary. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScreenLayout edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('travel_planner_title'),
          headerTransparent: true,
          headerBlurEffect: 'regular',
          headerShadowVisible: false,
          headerLeft: () => (
            <Button
              size="$3"
              chromeless
              onPress={() => router.back()}
              icon={
                <FontAwesome5
                  name="chevron-left"
                  size={16}
                  color={colors.text}
                />
              }
            />
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
        <YStack gap="$6">
          {/* Hero Section */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 24, borderRadius: 24, marginBottom: 8 }}
            >
              <YStack gap="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <FontAwesome5
                    name="plane-departure"
                    size={32}
                    color="white"
                  />
                  {!isPro && (
                    <XStack
                      backgroundColor="rgba(255,255,255,0.2)"
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      borderRadius="$10"
                      alignItems="center"
                      gap="$2"
                    >
                      <FontAwesome5 name="lock" size={12} color="white" />
                      <Text color="white" fontWeight="600" fontSize="$2">
                        PRO
                      </Text>
                    </XStack>
                  )}
                </XStack>
                <Heading color="white" size="$8" fontWeight="800">
                  {t('travel_planner_title')}
                </Heading>
                <Text color="rgba(255,255,255,0.8)" fontSize="$4">
                  AI-powered travel planning for your next adventure.
                </Text>
              </YStack>
            </LinearGradient>
          </Animated.View>

          {/* Generator Form */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Card
              bordered
              padding="$4"
              gap="$4"
              elevate
              backgroundColor="$background"
            >
              <YStack gap="$2">
                <Text fontWeight="700" color="$color11" fontSize="$3">
                  {t('wallet_label_dest').toUpperCase()}
                </Text>
                <Input
                  size="$5"
                  placeholder={t('wallet_ph_dest')}
                  value={destination}
                  onChangeText={setDestination}
                  backgroundColor="$background"
                  borderColor="$borderColor"
                />
              </YStack>

              <YStack gap="$2">
                <Text fontWeight="700" color="$color11" fontSize="$3">
                  DURATION (DAYS)
                </Text>
                <XStack gap="$2">
                  {[3, 5, 7, 10].map((d) => (
                    <Button
                      key={d}
                      flex={1}
                      size="$3"
                      backgroundColor={
                        duration === d ? colors.tint : '$background'
                      }
                      borderColor={
                        duration === d ? colors.tint : '$borderColor'
                      }
                      borderWidth={1}
                      onPress={() => {
                        haptics.selection();
                        setDuration(d);
                      }}
                    >
                      <Text color={duration === d ? 'white' : '$color'}>
                        {d}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              </YStack>

              <YStack gap="$2">
                <Text fontWeight="700" color="$color11" fontSize="$3">
                  FLIGHT (OPTIONAL)
                </Text>
                <Input
                  size="$5"
                  placeholder="e.g. RO342"
                  value={flightNumber}
                  onChangeText={setFlightNumber}
                  backgroundColor="$background"
                  borderColor="$borderColor"
                />
              </YStack>

              <Button
                size="$5"
                backgroundColor={isPro ? colors.tint : '$gray5'}
                onPress={handleGenerate}
                disabled={isGenerating}
                opacity={isGenerating ? 0.7 : 1}
                icon={
                  isGenerating ? (
                    <Spinner color="white" />
                  ) : (
                    <FontAwesome5 name="magic" size={18} color="white" />
                  )
                }
                marginTop="$2"
              >
                <Text color="white" fontWeight="700" fontSize="$5">
                  {isGenerating ? 'Planning...' : 'Generate Itinerary'}
                </Text>
              </Button>

              {!isPro && (
                <XStack gap="$2" justifyContent="center" alignItems="center">
                  <FontAwesome5 name="info-circle" size={12} color="$gray10" />
                  <Text color="$gray10" fontSize="$2">
                    {t('travel_locked_pro_desc')}
                  </Text>
                </XStack>
              )}
            </Card>
          </Animated.View>

          {/* Recent Trips */}
          <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <Heading size="$5">{t('travel_planner_my_trips')}</Heading>
              <TouchableOpacity onPress={() => router.push('/wallet')}>
                <Text color={colors.tint} fontWeight="600">
                  View All
                </Text>
              </TouchableOpacity>
            </XStack>

            {myTrips === undefined ? (
              <Spinner size="small" color={colors.tint} />
            ) : myTrips.length === 0 ? (
              <YStack
                padding="$8"
                alignItems="center"
                bg="$gray2"
                borderRadius="$6"
                borderStyle="dashed"
                borderWidth={1}
                borderColor="$gray5"
              >
                <Text color="$gray10">No trips generated yet.</Text>
              </YStack>
            ) : (
              <YStack gap="$3">
                {myTrips.slice(0, 3).map((trip: any, index: number) => (
                  <Animated.View
                    key={trip._id}
                    entering={FadeInDown.delay(300 + index * 100)}
                  >
                    <Card
                      bordered
                      padding="$4"
                      backgroundColor="$background"
                      onPress={() => router.push('/wallet')}
                      pressStyle={{ scale: 0.98 }}
                    >
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <YStack gap="$1">
                          <Heading size="$4">{trip.destination}</Heading>
                          <XStack gap="$2" alignItems="center">
                            <FontAwesome5
                              name="calendar"
                              size={12}
                              color="$gray10"
                            />
                            <Text color="$gray10" fontSize="$3">
                              {new Date(trip.startDate).toLocaleDateString()}
                            </Text>
                          </XStack>
                        </YStack>
                        <FontAwesome5
                          name="chevron-right"
                          size={14}
                          color="$gray8"
                        />
                      </XStack>
                    </Card>
                  </Animated.View>
                ))}
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenLayout>
  );
}
