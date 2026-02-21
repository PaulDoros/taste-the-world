import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/ScreenLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  YStack,
  XStack,
  Heading,
  Text,
  Button,
  Card,
  Input,
  Theme,
  Label,
  Switch,
} from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { haptics } from '@/utils/haptics';
import { playSound } from '@/utils/sounds';

export default function AddTripScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();
  const createTrip = useMutation(api.trips.createTrip);

  const [destination, setDestination] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        haptics.selection();
        // In a real implementation, we would upload here using generateUploadUrl
        // For now, we'll simulate success or handle the file URI locally if needed
        Alert.alert('File Selected', `Picked: ${result.assets[0].name}`);
        // storageId logic would go here
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleSave = async () => {
    if (!destination.trim()) {
      Alert.alert(t('common_error'), t('wallet_error_missing'));
      return;
    }

    if (!token) {
      Alert.alert(t('common_error'), 'Please sign in to save trips.');
      return;
    }

    try {
      setIsSubmitting(true);
      haptics.selection();

      const tripDate = new Date(date);
      tripDate.setHours(parseInt(hours) || 0);
      tripDate.setMinutes(parseInt(minutes) || 0);

      // Play sound
      playSound('airplane');

      await createTrip({
        token,
        destination: destination.trim(),
        startDate: tripDate.getTime(),
        flightNumber: flightNumber.trim() || undefined,
      });

      haptics.success();
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert(t('common_error'), t('wallet_error_save'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('wallet_new_trip'),
          headerLeft: () => (
            <Button
              size="$3"
              chromeless
              onPress={() => router.back()}
              icon={<FontAwesome5 name="times" size={16} color={colors.text} />}
            />
          ),
          headerBackground: () => (
            <View style={{ flex: 1, backgroundColor: 'transparent' }} />
          ),
          headerTransparent: true,
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 100 }}>
        <GlassCard
          variant="default"
          contentContainerStyle={{ padding: 24, gap: 20 }}
        >
          <YStack gap="$4">
            <YStack gap="$2">
              <Label fontWeight="700" color="$color" fontSize="$3">
                {t('wallet_label_dest')}
              </Label>
              <GlassCard
                variant="thin"
                borderRadius={12}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              >
                <Input
                  unstyled
                  size="$4"
                  placeholder={t('wallet_ph_dest')}
                  value={destination}
                  onChangeText={setDestination}
                  color="$color"
                  height={44}
                  placeholderTextColor="$gray10"
                  backgroundColor="transparent"
                  borderWidth={0}
                />
              </GlassCard>
            </YStack>

            <XStack gap="$3">
              <YStack flex={1} gap="$2">
                <Label fontWeight="700" color="$color" fontSize="$3">
                  {t('wallet_label_date')}
                </Label>
                <GlassCard
                  variant="thin"
                  borderRadius={12}
                  shadowRadius={0}
                  contentContainerStyle={{ paddingHorizontal: 12 }}
                >
                  <Input
                    unstyled
                    size="$4"
                    placeholder="YYYY-MM-DD"
                    value={date}
                    onChangeText={setDate}
                    color="$color"
                    height={44}
                    placeholderTextColor="$gray10"
                    backgroundColor="transparent"
                    borderWidth={0}
                  />
                </GlassCard>
              </YStack>
              <YStack flex={0.7} gap="$2">
                <Label fontWeight="700" color="$color" fontSize="$3">
                  Time
                </Label>
                <GlassCard
                  variant="thin"
                  borderRadius={12}
                  shadowRadius={0}
                  contentContainerStyle={{
                    paddingHorizontal: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Input
                    flex={1}
                    unstyled
                    textAlign="center"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={hours}
                    onChangeText={setHours}
                    color="$color"
                    height={44}
                    backgroundColor="transparent"
                    borderWidth={0}
                    placeholder="HH"
                    placeholderTextColor="$gray10"
                  />
                  <Text color="$gray10">:</Text>
                  <Input
                    flex={1}
                    unstyled
                    textAlign="center"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={minutes}
                    onChangeText={setMinutes}
                    color="$color"
                    height={44}
                    backgroundColor="transparent"
                    borderWidth={0}
                    placeholder="MM"
                    placeholderTextColor="$gray10"
                  />
                </GlassCard>
              </YStack>
            </XStack>

            <YStack gap="$2">
              <Label fontWeight="700" color="$color" fontSize="$3">
                {t('wallet_label_flight')}
              </Label>
              <GlassCard
                variant="thin"
                borderRadius={12}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              >
                <Input
                  unstyled
                  size="$4"
                  placeholder={t('wallet_ph_flight')}
                  value={flightNumber}
                  onChangeText={setFlightNumber}
                  color="$color"
                  height={44}
                  placeholderTextColor="$gray10"
                  backgroundColor="transparent"
                  borderWidth={0}
                />
              </GlassCard>
            </YStack>

            <View style={{ height: 10 }} />

            <GlassButton
              size="medium"
              label={
                <YStack>
                  <Text fontWeight="600" color="$color">
                    {t('wallet_upload_btn')}
                  </Text>
                  <Text fontSize="$2" color="$gray10">
                    Upload PDF or image ticket
                  </Text>
                </YStack>
              }
              icon="upload"
              onPress={handleUpload}
              variant="default"
              style={{ justifyContent: 'space-between' }}
              backgroundOpacity={0.4}
            />

            <View style={{ height: 10 }} />

            <GlassButton
              size="large"
              label={isSubmitting ? 'Saving...' : t('wallet_save_btn')}
              onPress={handleSave}
              variant="active"
              disabled={isSubmitting}
              backgroundColor={colors.tint}
              icon={isSubmitting ? undefined : 'save'}
              textColor="white"
            />
          </YStack>
        </GlassCard>
      </ScrollView>
    </ScreenLayout>
  );
}
