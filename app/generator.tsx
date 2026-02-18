import React, { useState } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { YStack, XStack, Text, Button, Card, Theme, Checkbox } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from 'convex/react';
import { useLanguage } from '@/context/LanguageContext';
import { Translations } from '@/constants/Translations';
// import { usePantryStore } from '@/store/pantryStore';

export default function GeneratorScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { token } = useAuth();

  const { t, language } = useLanguage();

  // Fetch pantry items from Convex
  const convexItems =
    useQuery(api.pantry.getPantryItems, token ? { token } : 'skip') || [];

  // Map to format expected by UI
  const pantryItems = convexItems.map((item: any) => ({
    ...item,
    id: item._id,
  }));

  // State
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = useAction(api.ai.generateRecipe);

  const toggleIngredient = (name: string) => {
    haptics.light();
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleSelectAll = () => {
    haptics.light();
    if (selectedIngredients.length === pantryItems.length) {
      setSelectedIngredients([]);
    } else {
      setSelectedIngredients(pantryItems.map((i) => i.displayName));
    }
  };

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) return;

    haptics.medium();
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);

    try {
      const result = await generateRecipe({
        ingredients: selectedIngredients,
        language: Translations[language]?.languageName || 'English',
      });

      try {
        let jsonString = result;

        // 1. Extract JSON from markdown code blocks
        const markdownMatch =
          result.match(/```json\n([\s\S]*?)\n```/) ||
          result.match(/```\n([\s\S]*?)\n```/);

        if (markdownMatch) {
          jsonString = markdownMatch[1];
        } else {
          // Fallback: simple strip of markdown tags
          jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
        }

        // 2. Sanitize: Remove invalid control characters (0x00-0x1F)
        // EXCEPT: \t (0x09), \n (0x0A), \r (0x0D)
        // This fixes "JSON Parse error: U+0000 thru U+001F is not allowed in string"
        jsonString = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

        // 3. Trim whitespace
        jsonString = jsonString.trim();

        const recipe = JSON.parse(jsonString);
        setGeneratedRecipe(recipe);
        haptics.success();
      } catch (e) {
        console.error('Failed to parse recipe JSON', e);
        console.log('Raw JSON string:', result); // For debugging
        setError(t('generator_error_process'));
        haptics.error();
      }
    } catch (err) {
      console.error('Generation failed', err);
      setError(t('generator_error_failed'));
      haptics.error();
    } finally {
      setIsLoading(false);
    }
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
          {t('generator_title')}
        </Text>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {!generatedRecipe ? (
          <YStack gap="$4">
            <Card padding="$4" bordered backgroundColor="$card">
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <FontAwesome5 name="magic" size={18} color={colors.tint} />
                  <Text fontSize="$4" fontWeight="600">
                    {t('generator_select_ingredients')}
                  </Text>
                </XStack>
                <Text fontSize="$3" opacity={0.7}>
                  {t('generator_select_ingredients_desc')}
                </Text>
              </YStack>
            </Card>

            {pantryItems.length > 0 ? (
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$3" fontWeight="600" opacity={0.6}>
                    {t('generator_pantry_count', { count: pantryItems.length })}
                  </Text>
                  <Button size="$2" chromeless onPress={handleSelectAll}>
                    {selectedIngredients.length === pantryItems.length
                      ? t('generator_deselect_all')
                      : t('generator_select_all')}
                  </Button>
                </XStack>

                <YStack gap="$2">
                  {pantryItems.map((item) => {
                    const isSelected = selectedIngredients.includes(
                      item.displayName
                    );
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => toggleIngredient(item.displayName)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 12,
                          backgroundColor: isSelected
                            ? `${colors.tint}15`
                            : colors.card,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: isSelected ? colors.tint : 'transparent',
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: isSelected ? colors.tint : colors.text,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            opacity: isSelected ? 1 : 0.4,
                          }}
                        >
                          {isSelected && (
                            <FontAwesome5
                              name="check"
                              size={10}
                              color={colors.tint}
                            />
                          )}
                        </View>
                        <Text
                          fontSize="$3"
                          fontWeight={isSelected ? '600' : '400'}
                        >
                          {item.displayName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </YStack>
              </YStack>
            ) : (
              <YStack padding="$8" alignItems="center" opacity={0.5}>
                <FontAwesome5
                  name="shopping-basket"
                  size={40}
                  color={colors.text}
                />
                <Text marginTop="$4" textAlign="center">
                  {t('generator_empty_pantry')}
                </Text>
              </YStack>
            )}

            <Button
              size="$5"
              backgroundColor={colors.tint}
              onPress={handleGenerate}
              disabled={selectedIngredients.length === 0 || isLoading}
              opacity={selectedIngredients.length === 0 || isLoading ? 0.5 : 1}
              icon={
                isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <FontAwesome5 name="utensils" color="white" />
                )
              }
            >
              <Text color="white" fontWeight="700">
                {isLoading
                  ? t('generator_generating')
                  : t('generator_generate_btn')}
              </Text>
            </Button>

            {error && (
              <Card
                padding="$3"
                backgroundColor="$red3"
                borderColor="$red8"
                bordered
              >
                <Text color="$red10">{error}</Text>
              </Card>
            )}
          </YStack>
        ) : (
          <Animated.View entering={FadeInUp.springify()}>
            <YStack gap="$4">
              <Card padding="$0" overflow="hidden" bordered elevation={4}>
                <View
                  style={{
                    height: 150,
                    backgroundColor: colors.tint,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5 name="utensils" size={40} color="white" />
                </View>
                <YStack padding="$4" gap="$2">
                  <Text fontSize="$6" fontWeight="800">
                    {generatedRecipe.name}
                  </Text>
                  <Text fontSize="$3" opacity={0.8}>
                    {generatedRecipe.description}
                  </Text>

                  <XStack gap="$3" marginTop="$2">
                    <XStack
                      alignItems="center"
                      gap="$1"
                      backgroundColor="$gray4"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$2"
                    >
                      <FontAwesome5
                        name="clock"
                        size={12}
                        color={colors.text}
                      />
                      <Text fontSize="$2">{generatedRecipe.time}</Text>
                    </XStack>
                  </XStack>
                </YStack>
              </Card>

              <Card padding="$4" bordered>
                <Text fontSize="$4" fontWeight="700" marginBottom="$3">
                  {t('generator_ingredients')}
                </Text>
                <YStack gap="$2">
                  {generatedRecipe.ingredients.map((ing: string, i: number) => (
                    <XStack key={i} gap="$2" alignItems="center">
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: colors.tint,
                        }}
                      />
                      <Text fontSize="$3">{ing}</Text>
                    </XStack>
                  ))}
                </YStack>
              </Card>

              <Card padding="$4" bordered>
                <Text fontSize="$4" fontWeight="700" marginBottom="$3">
                  {t('generator_instructions')}
                </Text>
                <YStack gap="$4">
                  {generatedRecipe.instructions.map(
                    (step: string, i: number) => (
                      <XStack key={i} gap="$3">
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: colors.tint,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text color="white" fontWeight="700" fontSize="$2">
                            {i + 1}
                          </Text>
                        </View>
                        <Text flex={1} fontSize="$3" lineHeight={22}>
                          {step}
                        </Text>
                      </XStack>
                    )
                  )}
                </YStack>
              </Card>

              <Button
                size="$4"
                variant="outlined"
                borderColor={colors.tint}
                color={colors.tint}
                onPress={() => setGeneratedRecipe(null)}
                icon={<FontAwesome5 name="redo" color={colors.tint} />}
              >
                {t('generator_generate_another')}
              </Button>
            </YStack>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
