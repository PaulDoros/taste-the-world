import React, { useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { format } from 'date-fns'; // Assuming date-fns is available or standard Date
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function WalletScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const trips = useQuery(api.trips.getTrips);
  const deleteTrip = useMutation(api.trips.deleteTrip);

  const handleDelete = (id: any) => {
    Alert.alert(t('wallet_delete_title'), t('wallet_delete_msg'), [
      { text: t('common_cancel'), style: 'cancel' },
      {
        text: t('wallet_delete_confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrip({ id });
          } catch (e) {
            console.error(e);
            Alert.alert(t('common_error'), t('wallet_error_save'));
          }
        },
      },
    ]);
  };

  const renderTrip = ({ item, index }: { item: any; index: number }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <Card
          bordered
          elevate
          size="$4"
          marginBottom="$3"
          backgroundColor="$background"
          borderColor="$borderColor"
          overflow="hidden"
          pressStyle={{ scale: 0.98 }}
        >
          <XStack
            padding="$4"
            alignItems="center"
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
                    color="$color11"
                  />
                  <Text color="$color11" fontSize="$3">
                    {new Date(item.startDate).toLocaleDateString()}
                  </Text>
                </XStack>
                {item.flightNumber && (
                  <XStack alignItems="center" space="$1.5">
                    <FontAwesome5 name="plane" size={14} color="$color11" />
                    <Text color="$color11" fontSize="$3">
                      {item.flightNumber}
                    </Text>
                  </XStack>
                )}
              </XStack>

              {item.notes && (
                <Text color="$color10" fontSize="$3" numberOfLines={2}>
                  {item.notes}
                </Text>
              )}
            </YStack>

            {/* Delete Action */}
            <Button
              size="$3"
              chromeless
              icon={
                <FontAwesome5
                  name="trash"
                  size={16}
                  color={colors.tabIconDefault}
                />
              }
              onPress={() => handleDelete(item._id)}
            />
          </XStack>
        </Card>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
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

        <Button
          size="$4"
          backgroundColor={colors.tint}
          color="white"
          icon={<FontAwesome5 name="plus" size={16} color="white" />}
          onPress={() => router.push('/wallet/add')}
          circular
          elevate
        />
      </XStack>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {trips === undefined ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" color={colors.tint} />
          </YStack>
        ) : trips.length === 0 ? (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            space="$4"
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
            <Button
              marginTop="$4"
              backgroundColor={colors.tint}
              color="white"
              onPress={() => router.push('/wallet/add')}
            >
              {t('wallet_add')}
            </Button>
          </YStack>
        ) : (
          <FlatList
            data={trips}
            renderItem={renderTrip}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
