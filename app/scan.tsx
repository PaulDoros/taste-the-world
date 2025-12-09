import React, { useState } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { YStack, XStack, Text, Button, Card } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';

import { useAuth } from '@/hooks/useAuth';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/context/LanguageContext';
import { Translations } from '@/constants/Translations';
// import { usePantryStore } from '@/store/pantryStore';

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const addPantryItem = useMutation(api.pantry.addPantryItem);

  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const identifyFood = useAction(api.ai.identifyFood);

  const pickImage = async (useCamera: boolean) => {
    haptics.light();

    // Request permissions
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('scan_permission_title'), t('scan_permission_camera'));
        return;
      }
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('scan_permission_title'), t('scan_permission_gallery'));
        return;
      }
    }

    const result = await (useCamera
      ? ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
          base64: true,
        })
      : ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
          base64: true,
        }));

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].base64);
    }
  };

  const analyzeImage = async (base64: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await identifyFood({
        image: base64,
        language: Translations[language]?.languageName || 'English',
      });

      let jsonString = response;
      // Clean up markdown code blocks if present
      const markdownMatch =
        response.match(/```json\n([\s\S]*?)\n```/) ||
        response.match(/```\n([\s\S]*?)\n```/);
      if (markdownMatch) {
        jsonString = markdownMatch[1];
      } else {
        // Fallback cleanup
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
      }

      const parsed = JSON.parse(jsonString);
      setResult(parsed);
      haptics.success();
    } catch (error) {
      console.error('Analysis failed', error);
      Alert.alert(t('scan_error_title'), t('scan_error_failed'));
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItems = () => {
    if (!result?.items) return;

    result.items.forEach(async (item: string) => {
      // Simple logic to remove "(Mock)" suffix if present
      const name = item.replace(' (Mock)', '');
      if (user?._id) {
        await addPantryItem({
          userId: user._id as Id<'users'>,
          name: name,
          displayName: name,
          measure: '1',
        });
      }
    });

    haptics.success();
    Alert.alert(t('scan_success_title'), t('scan_success_message'));
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        backgroundColor="$background"
      >
        <Button
          size="$3"
          circular
          chromeless
          onPress={() => router.back()}
          icon={
            <FontAwesome5 name="arrow-left" size={16} color={colors.text} />
          }
        />
        <Text fontSize="$5" fontWeight="700" marginLeft="$3">
          {t('scan_title')}
        </Text>
      </XStack>

      <YStack flex={1} padding="$4" gap="$4">
        {/* Image Preview Area */}
        <View
          style={{
            height: 300,
            backgroundColor: colors.card,
            borderRadius: 20,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '$borderColor',
            borderStyle: image ? 'solid' : 'dashed',
          }}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <YStack alignItems="center" gap="$3" opacity={0.5}>
              <FontAwesome5 name="camera" size={40} color={colors.text} />
              <Text>{t('scan_take_photo')}</Text>
            </YStack>
          )}

          {isLoading && (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size="large" color="white" />
              <Text color="white" fontWeight="600" marginTop="$2">
                {t('scan_analyzing')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!image && (
          <XStack gap="$3">
            <Button
              flex={1}
              size="$5"
              backgroundColor={colors.tint}
              onPress={() => pickImage(true)}
              icon={<FontAwesome5 name="camera" color="white" />}
            >
              <Text color="white" fontWeight="700">
                {t('scan_camera_btn')}
              </Text>
            </Button>
            <Button
              flex={1}
              size="$5"
              variant="outlined"
              borderColor={colors.tint}
              onPress={() => pickImage(false)}
              icon={<FontAwesome5 name="images" color={colors.tint} />}
            >
              <Text color={colors.tint} fontWeight="700">
                {t('scan_gallery_btn')}
              </Text>
            </Button>
          </XStack>
        )}

        {/* Results */}
        {result && (
          <Animated.View entering={FadeInUp.springify()}>
            <Card padding="$4" bordered backgroundColor="$card">
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$4" fontWeight="700">
                    {t('scan_identified_items')}
                  </Text>
                  <View
                    style={{
                      backgroundColor: '$green3',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text fontSize="$2" color="$green10" fontWeight="700">
                      {t('scan_confidence', {
                        count: Math.round(result.confidence * 100),
                      })}
                    </Text>
                  </View>
                </XStack>

                {result.dish && (
                  <Text fontSize="$5" fontWeight="600" color={colors.tint}>
                    {t('scan_dish', { name: result.dish })}
                  </Text>
                )}

                <YStack gap="$2">
                  {result.items.map((item: string, index: number) => (
                    <XStack key={index} alignItems="center" gap="$2">
                      <FontAwesome5
                        name="check-circle"
                        size={14}
                        color={colors.tint}
                      />
                      <Text fontSize="$3">{item}</Text>
                    </XStack>
                  ))}
                </YStack>

                <Button
                  marginTop="$2"
                  backgroundColor={colors.tint}
                  onPress={handleAddItems}
                  icon={<FontAwesome5 name="plus" color="white" />}
                >
                  <Text color="white" fontWeight="700">
                    {t('scan_add_pantry')}
                  </Text>
                </Button>

                <Button
                  marginTop="$2"
                  chromeless
                  onPress={() => {
                    setImage(null);
                    setResult(null);
                  }}
                >
                  {t('scan_scan_another')}
                </Button>
              </YStack>
            </Card>
          </Animated.View>
        )}
      </YStack>
    </SafeAreaView>
  );
}
