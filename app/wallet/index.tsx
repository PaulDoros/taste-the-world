import React, { useState } from 'react';
import { View, FlatList, Alert, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/ScreenLayout';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/context/LanguageContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  YStack,
  XStack,
  Heading,
  Text,
  Button,
  Card,
  Spinner,
  Spacer,
} from 'tamagui';
import { Loading } from '@/components/shared/Loading';
import { format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/store/authStore';
import * as Notifications from 'expo-notifications';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function WalletScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();

  const trips = useQuery(api.trips.getTrips, token ? { token } : 'skip');
  const deleteTrip = useMutation(api.trips.deleteTrip);

  // Sorting and Upcoming Logic
  const mobileTrips = trips ? [...trips] : [];

  // Find upcoming (Nearest Future Trip)
  const now = Date.now();
  const upcomingTripId = mobileTrips
    .filter((t) => t.startDate > now)
    .sort((a, b) => a.startDate - b.startDate)[0]?._id;

  // Sort for Display (Newest to Oldest)
  const sortedTrips = mobileTrips.sort((a, b) => b.startDate - a.startDate);

  const handleDelete = (id: any) => {
    Alert.alert(t('wallet_delete_title'), t('wallet_delete_msg'), [
      { text: t('common_cancel'), style: 'cancel' },
      {
        text: t('wallet_delete_confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            // Cancel all notifications for this trip
            const scheduled =
              await Notifications.getAllScheduledNotificationsAsync();
            const tripNotifications = scheduled.filter(
              (n) => n.content.data?.tripId === id
            );

            for (const n of tripNotifications) {
              await Notifications.cancelScheduledNotificationAsync(
                n.identifier
              );
            }

            await deleteTrip({ id, token: token! });
          } catch (e) {
            console.error(e);
            Alert.alert(t('common_error'), t('wallet_error_save'));
          }
        },
      },
    ]);
  };

  const renderTrip = ({ item, index }: { item: any; index: number }) => {
    const isUpcoming = item._id === upcomingTripId;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <Pressable
          onPress={() => router.push(`/wallet/${item._id}` as any)}
          style={{ marginBottom: 14, marginHorizontal: 12 }}
        >
          <GlassCard
            variant={isUpcoming ? 'default' : 'thin'}
            borderRadius={20}
            contentContainerStyle={{ overflow: 'hidden' }}
            backgroundColor={isUpcoming ? colors.tint : undefined}
            backgroundOpacity={isUpcoming ? 0.1 : 0.3}
            shadowRadius={5} // Smaller shadow radius as requested
          >
            {isUpcoming && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: colors.tint,
                  paddingHorizontal: 18,

                  borderBottomLeftRadius: 8,
                }}
              >
                <Text color="white" fontSize="$2" fontWeight="bold">
                  COMING NEXT
                </Text>
              </View>
            )}

            <XStack
              padding="$4"
              alignItems="flex-start"
              justifyContent="space-between"
            >
              {/* Trip Details */}
              <YStack flex={1} space="$2">
                <XStack alignItems="center" space="$2">
                  <FontAwesome5
                    name="map-marker-alt"
                    size={16}
                    color={colors.tint}
                  />
                  <Heading size="$5" color="$color">
                    {item.destination}
                  </Heading>
                </XStack>

                <XStack alignItems="center" space="$3">
                  <XStack alignItems="center" space="$1.5">
                    <FontAwesome5
                      name="calendar-alt"
                      size={14}
                      color={colors.tabIconDefault}
                    />
                    <Text color={colors.text} opacity={0.7} fontSize="$3">
                      {format(new Date(item.startDate), 'MMM dd, HH:mm')}
                    </Text>
                  </XStack>
                  {item.flightNumber && (
                    <XStack alignItems="center" space="$1.5">
                      <FontAwesome5
                        name="plane"
                        size={14}
                        color={colors.tabIconDefault}
                      />
                      <Text color={colors.text} opacity={0.7} fontSize="$3">
                        {item.flightNumber}
                      </Text>
                    </XStack>
                  )}
                </XStack>

                {item.notes ? (
                  <GlassCard
                    variant="thin"
                    style={{ marginTop: 8 }}
                    borderRadius={8}
                    backgroundColor="$background"
                    backgroundOpacity={0.5}
                  >
                    <Text color="$color10" fontSize="$2" fontWeight="600">
                      ITINERARY PREVIEW
                    </Text>
                    <Text color="$color10" fontSize="$3" numberOfLines={2}>
                      {item.notes}
                    </Text>
                  </GlassCard>
                ) : null}
              </YStack>

              {/* Delete Action */}
              <GlassButton
                size="small"
                icon="trash"
                variant="default"
                shadowRadius={3}
                backgroundOpacity={0}
                onPress={() => handleDelete(item._id)}
                textColor={colors.tabIconDefault}
              />
            </XStack>
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <ScreenLayout edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingTop="$2"
        paddingBottom="$4"
        alignItems="center"
        justifyContent="space-between"
      >
        <YStack>
          <Heading size="$8" fontWeight="800" color={colors.text}>
            {t('wallet_title')}
          </Heading>
          <Text color={colors.text} opacity={0.6}>
            {t('wallet_header_upcoming')}
          </Text>
        </YStack>

        <GlassButton
          size="medium"
          icon="plus"
          onPress={() => router.push('/wallet/add')}
          variant="active"
          backgroundColor={colors.tint}
          textColor="white"
          style={{ width: 44, height: 44, paddingHorizontal: 0 }}
        />
      </XStack>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {trips === undefined ? (
          <Loading fullScreen={false} />
        ) : trips.length === 0 ? (
          <GlassCard
            shadowRadius={3}
            variant="default"
            contentContainerStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              gap: 20,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.tint + '15',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesome5
                name="suitcase-rolling"
                size={40}
                color={colors.tint}
              />
            </View>
            <Heading size="$6" textAlign="center" color={colors.text}>
              {t('wallet_empty_title')}
            </Heading>
            <Text textAlign="center" color="$color11" maxWidth={300}>
              {t('wallet_empty_desc')}
            </Text>
            <GlassButton
              size="medium"
              label={t('wallet_add')}
              onPress={() => router.push('/wallet/add')}
              variant="active"
              backgroundColor={colors.tint}
            />
          </GlassCard>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Upcoming Trips Section */}
            {mobileTrips.filter((t) => t.startDate > now).length > 0 && (
              <YStack marginBottom="$4">
                <Heading
                  size="$5"
                  color="$color11"
                  marginBottom="$2"
                  textTransform="uppercase"
                  fontSize={12}
                  letterSpacing={1}
                >
                  {t('wallet_upcoming')}
                </Heading>
                {mobileTrips
                  .filter((t) => t.startDate > now)
                  .sort((a, b) => a.startDate - b.startDate)
                  .map((item, index) => (
                    <View key={item._id}>{renderTrip({ item, index })}</View>
                  ))}
              </YStack>
            )}

            {/* Past Trips Section */}
            {mobileTrips.filter((t) => t.startDate <= now).length > 0 && (
              <YStack>
                <Heading
                  size="$5"
                  color="$color11"
                  marginBottom="$2"
                  textTransform="uppercase"
                  fontSize={12}
                  letterSpacing={1}
                >
                  {t('wallet_past')}
                </Heading>
                {mobileTrips
                  .filter((t) => t.startDate <= now)
                  .sort((a, b) => b.startDate - a.startDate)
                  .map((item, index) => (
                    <View key={item._id} style={{ opacity: 0.8 }}>
                      {renderTrip({ item, index })}
                    </View>
                  ))}
              </YStack>
            )}
          </ScrollView>
        )}
      </View>
    </ScreenLayout>
  );
}
