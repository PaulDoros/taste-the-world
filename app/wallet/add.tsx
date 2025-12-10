import React, { useState } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from 'convex/react';
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
  Input,
  TextArea,
  Label,
  Spinner,
} from 'tamagui';

export default function AddTripScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const createTrip = useMutation(api.trips.createTrip);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [flight, setFlight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!destination.trim()) {
      Alert.alert(t('common_error'), t('wallet_error_missing'));
      return;
    }

    // Basic date validation (heuristic)
    let parsedDate = Date.now();
    if (date.trim()) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        parsedDate = d.getTime();
      }
    }

    setIsSubmitting(true);
    try {
      await createTrip({
        destination: destination.trim(),
        startDate: parsedDate,
        flightNumber: flight.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (e: any) {
      console.error(e);
      Alert.alert(t('common_error'), e.message || t('wallet_error_save'));
    } finally {
      setIsSubmitting(false);
    }
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
        paddingVertical="$3"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Button
          size="$3"
          circular
          chromeless
          icon={
            <FontAwesome5 name="arrow-left" size={20} color={colors.text} />
          }
          onPress={() => router.back()}
        />
        <Heading size="$6" marginLeft="$3" color={colors.text}>
          {t('wallet_new_trip')}
        </Heading>
      </XStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <YStack space="$4">
            {/* Destination */}
            <YStack space="$2">
              <Label color={colors.text} fontWeight="600">
                {t('wallet_label_dest')}
              </Label>
              <Input
                size="$4"
                borderWidth={1}
                placeholder={t('wallet_ph_dest')}
                value={destination}
                onChangeText={setDestination}
                backgroundColor={colors.card}
              />
            </YStack>

            {/* Date */}
            <YStack space="$2">
              <Label color={colors.text} fontWeight="600">
                {t('wallet_label_date')}
              </Label>
              <Input
                size="$4"
                borderWidth={1}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                backgroundColor={colors.card}
              />
              <Text fontSize="$2" color="$color10">
                Leavy empty for today
              </Text>
            </YStack>

            {/* Flight */}
            <YStack space="$2">
              <Label color={colors.text} fontWeight="600">
                {t('wallet_label_flight')}
              </Label>
              <Input
                size="$4"
                borderWidth={1}
                placeholder={t('wallet_ph_flight')}
                value={flight}
                onChangeText={setFlight}
                backgroundColor={colors.card}
              />
            </YStack>

            {/* Notes */}
            <YStack space="$2">
              <Label color={colors.text} fontWeight="600">
                {t('wallet_label_notes')}
              </Label>
              <TextArea
                size="$4"
                minHeight={100}
                borderWidth={1}
                placeholder={t('wallet_ph_notes')}
                value={notes}
                onChangeText={setNotes}
                backgroundColor={colors.card}
                multiline
              />
            </YStack>

            {/* Save Button */}
            <Button
              size="$5"
              themeInverse
              marginTop="$4"
              onPress={handleSave}
              disabled={isSubmitting}
              icon={isSubmitting ? <Spinner color="white" /> : undefined}
              backgroundColor={colors.tint}
            >
              {t('wallet_save_btn')}
            </Button>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
