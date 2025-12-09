import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Input,
  Theme,
  Stack,
} from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  FadeInRight,
  FadeOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import BabyProfile from '@/components/BabyProfile';
import { COUNTRY_TO_AREA_MAP } from '@/constants/Config';
import { useLanguage } from '@/context/LanguageContext';
import { Translations } from '@/constants/Translations';

// Extract keys for selection list
const AVAILABLE_CUISINES = Object.keys(COUNTRY_TO_AREA_MAP).sort();

export default function PlannerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [preferences, setPreferences] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null); // New state (fixed)
  const [planData, setPlanData] = useState<any>(null);
  const [mode, setMode] = useState<'standard' | 'baby'>('standard');
  const [generatingRecipe, setGeneratingRecipe] = useState<string | null>(null); // Track which meal is generating
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const { t, language } = useLanguage();

  const router = useRouter();
  const generateMealPlan = useAction(api.ai.generateMealPlan);
  const generateRecipeByName = useAction(api.ai.generateRecipeByName);
  const generateShoppingListFromPlan = useAction(
    api.ai.generateShoppingListFromPlan
  );
  const generateDiversificationPlan = useAction(
    api.babyFood.generateDiversificationPlan
  );
  const babyProfile = useQuery(api.babyFood.getProfile);
  const { isAuthenticated, token } = useAuth();
  // Local state for guest users to persist data between tab switches
  const [guestPlans, setGuestPlans] = useState<{ standard: any; baby: any }>({
    standard: null,
    baby: null,
  });

  const latestPlan = useQuery(api.mealPlan.getLatestMealPlan, {
    type: mode,
    token: token || undefined,
  });
  const mealPlanHistory = useQuery(api.mealPlan.getMealPlans, {
    type: mode,
    token: token || undefined,
  });
  const { addMultipleItems } = useShoppingList();

  const [currentPlan, setCurrentPlan] = useState<any>(null);
  // Sync animation with mode
  // ... (auth/queries)

  useEffect(() => {
    // If authenticated, sync with backend
    if (isAuthenticated) {
      if (latestPlan && latestPlan.plan) {
        try {
          setPlanData(JSON.parse(latestPlan.plan));
          setCurrentPlan(latestPlan);
        } catch (e) {
          console.error('Failed to parse meal plan', e);
          setPlanData(null);
          setCurrentPlan(null);
        }
      } else if (latestPlan === null) {
        setPlanData(null);
        setCurrentPlan(null);
      }
    } else {
      // If guest, load from local state when mode changes
      setPlanData(guestPlans[mode]);
      setCurrentPlan(null);
    }
  }, [latestPlan, mode, isAuthenticated, guestPlans]);

  // handleGenerate ...
  const handleGenerate = async () => {
    haptics.medium();
    setIsLoading(true);
    try {
      let result;

      if (mode === 'baby' && babyProfile) {
        // Use smart diversification agent
        const plan = await generateDiversificationPlan({
          babyId: babyProfile._id,
          language: Translations[language]?.languageName || 'English',
        });
        result = JSON.stringify(plan); // Unify format
      } else {
        // Fallback to standard generation
        result = await generateMealPlan({
          preferences:
            preferences ||
            (mode === 'baby'
              ? '6 months old, just starting' // Keeping this English for AI context or should we localise prompt inputs? Prompt inputs should likely remain English unless AI supports multilingual prompts well. For now, leave these defaults as internal values or display values? These seem to be defaults if empty.
              : 'Balanced diet, no restrictions'),
          type: mode,
          cuisine: selectedCuisine || undefined, // Pass cuisine
          token: token || undefined,
          language: Translations[language]?.languageName || 'English',
        });
      }
      const parsed = JSON.parse(result);

      setPlanData(parsed);
      setActiveDay(0);

      // Force refresh of query will happen automatically, which sets currentPlan

      if (!isAuthenticated) {
        // Save to local guest state
        setGuestPlans((prev) => ({ ...prev, [mode]: parsed }));
        setCurrentPlan(null);
      }

      haptics.success();
    } catch (error) {
      console.error('Failed to generate plan', error);
      haptics.error();
      haptics.error();
      alert(t('planner_error_generate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (!planData || !planData.days) return;
    haptics.medium();

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('planner_permission_title'),
          t('planner_permission_calendar')
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const defaultCalendar =
        calendars.find((cal) => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert(t('common_error'), t('planner_error_no_calendar'));
        return;
      }

      // Create events for the week
      const startDate = new Date(); // Start from today

      for (let i = 0; i < planData.days.length; i++) {
        const day = planData.days[i];
        const eventDate = new Date(startDate);
        eventDate.setDate(startDate.getDate() + i);

        // Create all-day event description
        const description = `Breakfast: ${day.meals.breakfast}\nLunch: ${day.meals.lunch}\nDinner: ${day.meals.dinner}`;

        await Calendar.createEventAsync(defaultCalendar.id, {
          title: `Meal Plan: ${day.day}`,
          startDate: eventDate,
          endDate: eventDate,
          allDay: true,
          notes: description,
          timeZone: 'UTC',
        });
      }

      haptics.success();
      haptics.success();
      haptics.success();
      haptics.success();
      Alert.alert(t('common_success'), t('planner_success_calendar'));
    } catch (error) {
      console.error('Calendar Error:', error);
      Alert.alert('Error', t('planner_error_calendar'));
    }
  };

  const handleAddWeekToList = async () => {
    if (!planData || !planData.days) return;
    haptics.medium();
    setIsGeneratingList(true);

    try {
      let result;

      // 1. Check if we have a cached shopping list for this plan
      if (currentPlan && currentPlan.shoppingListData) {
        console.log('Using cached shopping list');
        result = currentPlan.shoppingListData;
      } else {
        // 2. Generate new list
        result = await generateShoppingListFromPlan({
          planData: JSON.stringify(planData),
          planId: currentPlan?._id, // Pass ID to save result
          language: Translations[language]?.languageName || 'English',
        });
      }

      const ingredients = JSON.parse(result);

      // Add common props
      const itemsToAdd = ingredients.map((item: any) => ({
        name: item.name,
        measure: item.measure,
        recipeId: 'weekly-plan',
        recipeName: 'Weekly Meal Plan',
      }));

      await addMultipleItems(itemsToAdd);
      haptics.success();
      Alert.alert(
        t('common_success'),
        t('planner_success_list_added', { count: itemsToAdd.length })
      );
    } catch (error) {
      console.error('Shopping List Error:', error);
      Alert.alert(t('common_error'), t('planner_error_list'));
    } finally {
      setIsGeneratingList(false);
    }
  };

  // handleViewRecipe ...
  const handleViewRecipe = async (mealName: string) => {
    haptics.selection();
    setGeneratingRecipe(mealName);
    try {
      // Generate (or fetch existing) recipe
      const recipeId = await generateRecipeByName({
        mealName,
        type: mode,
        language: Translations[language]?.languageName || 'English',
      });

      if (recipeId) {
        router.push(`/recipe/${recipeId}`);
      } else {
        Alert.alert(t('common_error'), t('planner_error_recipe'));
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      Alert.alert(t('common_error'), t('planner_error_generate'));
    } finally {
      setGeneratingRecipe(null);
    }
  };

  const loadHistoricalPlan = (historyItem: any) => {
    try {
      const parsed = JSON.parse(historyItem.plan);
      setPlanData(parsed);
      setCurrentPlan(historyItem); // Set source object
      setActiveDay(0);
      setShowHistory(false);
      haptics.success();
    } catch (e) {
      console.error('Failed to parse historical plan', e);
      Alert.alert(t('common_error'), t('planner_error_generate'));
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <YStack flex={1}>
        {/* Header */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          backgroundColor="$background"
        >
          <XStack alignItems="center" gap="$3">
            <View
              style={{
                backgroundColor: colors.tint,
                padding: 8,
                borderRadius: 12,
              }}
            >
              <FontAwesome5 name="calendar-alt" size={20} color="white" />
            </View>
            <YStack>
              <Text fontSize="$5" fontWeight="700">
                {t('meal_planner')}
              </Text>
              <Text fontSize="$2" opacity={0.6}>
                {t('planner_subtitle')}
              </Text>
            </YStack>
          </XStack>

          <Button
            size="$3"
            chromeless
            icon={<FontAwesome5 name="history" size={16} color={colors.text} />}
            onPress={() => setShowHistory(true)}
          />
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Input Section */}
          <Card
            padding="$0"
            bordered
            backgroundColor="$card"
            marginBottom="$6"
            elevation={2}
            overflow="hidden"
          >
            <LinearGradient
              colors={[
                mode === 'baby' ? '#FFE4E1' : `${colors.tint}15`,
                colors.card,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ padding: 16, gap: 12 }}
            >
              <YStack gap="$3">
                {/* Custom Animated Mode Switcher */}
                <AnimatedModeSwitcher
                  mode={mode}
                  setMode={setMode}
                  colors={colors}
                  t={t}
                />

                <Animated.View
                  key={mode}
                  entering={FadeInUp.springify().damping(50)}
                  style={{ gap: 12 }}
                >
                  <YStack>
                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      marginBottom="$2"
                      opacity={0.7}
                    >
                      {t('planner_preferences_label')}
                    </Text>
                    <Input
                      placeholder={
                        mode === 'baby'
                          ? t('planner_preferences_placeholder_baby')
                          : t('planner_preferences_placeholder_standard')
                      }
                      value={preferences}
                      onChangeText={setPreferences}
                      backgroundColor="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      size="$4"
                    />

                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      marginBottom="$2"
                      marginTop="$3"
                      opacity={0.7}
                    >
                      {t('planner_cuisine_label')}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8, paddingRight: 20 }}
                    >
                      <Pressable
                        onPress={() => {
                          haptics.selection();
                          setSelectedCuisine(null);
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor:
                            selectedCuisine === null
                              ? colors.tint
                              : colors.background,
                          borderWidth: 1,
                          borderColor:
                            selectedCuisine === null
                              ? colors.tint
                              : '$borderColor',
                        }}
                      >
                        <Text
                          fontSize="$3"
                          fontWeight="600"
                          color={
                            selectedCuisine === null ? 'white' : colors.text
                          }
                        >
                          {t('planner_cuisine_all')}
                        </Text>
                      </Pressable>

                      {AVAILABLE_CUISINES.map((cuisine) => (
                        <Pressable
                          key={cuisine}
                          onPress={() => {
                            haptics.selection();
                            setSelectedCuisine(cuisine);
                          }}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            backgroundColor:
                              selectedCuisine === cuisine
                                ? colors.tint
                                : colors.background,
                            borderWidth: 1,
                            borderColor:
                              selectedCuisine === cuisine
                                ? colors.tint
                                : '$borderColor',
                          }}
                        >
                          <Text
                            fontSize="$3"
                            fontWeight="600"
                            color={
                              selectedCuisine === cuisine
                                ? 'white'
                                : colors.text
                            }
                          >
                            {cuisine}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </YStack>

                  <Button
                    size="$5"
                    backgroundColor={mode === 'baby' ? '#FFB6C1' : colors.tint}
                    onPress={handleGenerate}
                    disabled={isLoading}
                    marginTop="$2"
                    pressStyle={{ scale: 0.97 }}
                    icon={
                      isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <FontAwesome5
                          name={mode === 'baby' ? 'baby' : 'magic'}
                          size={18}
                          color="white"
                        />
                      )
                    }
                  >
                    <Text color="white" fontWeight="700" fontSize="$4">
                      {isLoading
                        ? t('planner_generating')
                        : t('planner_generate_button')}
                    </Text>
                  </Button>
                </Animated.View>
              </YStack>
            </LinearGradient>
          </Card>

          {/* Plan Display */}
          {planData && planData.days ? (
            <Animated.View
              key={`${mode}-plans`} // Force re-render on mode change
              entering={FadeInUp.springify().damping(50)}
            >
              {/* Weekly Calendar Horizontal Scroll */}
              <View style={{ marginBottom: 24 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
                >
                  {planData.days.map((day: any, index: number) => (
                    <PlannerDayItem
                      key={index}
                      day={day}
                      index={index}
                      isActive={activeDay === index}
                      setActiveDay={setActiveDay}
                      latestPlan={latestPlan}
                      colors={colors}
                      t={t}
                      language={useLanguage().language}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Meals for Active Day */}
              <YStack gap="$4">
                {['breakfast', 'lunch', 'dinner'].map((mealType, index) => {
                  const mealName = planData.days[activeDay].meals[mealType];

                  const getTheme = () => {
                    switch (mealType) {
                      case 'breakfast':
                        return {
                          icon: 'coffee',
                          color: '$orange10',
                          iconBg: '$orange3',
                          bg: ['#FFF8E1', '#FFFFFF'],
                        };
                      case 'lunch':
                        return {
                          icon: 'sun',
                          color: '$yellow11',
                          iconBg: '$yellow4',
                          bg: ['#F9FBE7', '#FFFFFF'],
                        };
                      case 'dinner':
                        return {
                          icon: 'moon',
                          color: '$blue10',
                          iconBg: '$blue3',
                          bg: ['#E3F2FD', '#FFFFFF'],
                        };
                      default:
                        return {
                          icon: 'utensils',
                          color: colors.tint,
                          iconBg: '$gray3',
                          bg: ['#F3E5F5', '#FFFFFF'],
                        };
                    }
                  };

                  const theme = getTheme();

                  return (
                    <Animated.View
                      key={`${mealType}-${activeDay}`}
                      entering={FadeInUp.delay(index * 150)
                        .springify()
                        .damping(50)
                        .stiffness(200)}
                    >
                      <Card
                        padding="$0"
                        bordered
                        backgroundColor="$card"
                        elevation={2}
                        overflow="hidden"
                        borderRadius="$5"
                      >
                        {/* Header Strip */}
                        <XStack
                          padding="$3"
                          alignItems="center"
                          justifyContent="space-between"
                          backgroundColor={`${theme.color.replace('$', '')}10`}
                        >
                          <XStack gap="$3" alignItems="center">
                            <Stack
                              backgroundColor={theme.iconBg}
                              padding={8}
                              borderRadius={100}
                              width={34}
                              height={34}
                              alignItems="center"
                              justifyContent="center"
                              animation="bouncy"
                              pressStyle={{ scale: 0.9 }}
                            >
                              <FontAwesome5
                                name={theme.icon}
                                size={14}
                                color={theme.color}
                              />
                            </Stack>
                            <Text
                              fontSize="$3"
                              fontWeight="700"
                              textTransform="uppercase"
                              color={theme.color}
                              letterSpacing={0.5}
                            >
                              {t(`common_meal_${mealType}` as any)}
                            </Text>
                          </XStack>

                          {/* Actions Right */}
                          <Pressable
                            onPress={() => handleViewRecipe(mealName)}
                            disabled={generatingRecipe === mealName}
                            hitSlop={10}
                          >
                            <XStack gap="$1" alignItems="center" opacity={0.8}>
                              <Text
                                fontSize="$2"
                                fontWeight="600"
                                color={colors.tint}
                              >
                                {t('planner_see_recipe')}
                              </Text>
                              <FontAwesome5
                                name="chevron-right"
                                size={10}
                                color={colors.tint}
                              />
                            </XStack>
                          </Pressable>
                        </XStack>

                        {/* Content Body */}
                        <YStack paddingHorizontal="$4" paddingVertical="$4">
                          {generatingRecipe === mealName ? (
                            <XStack gap="$3" alignItems="center">
                              <ActivityIndicator
                                size="small"
                                color={colors.tint}
                              />
                              <Text fontSize="$3" color="$gray10">
                                {t('planner_preparing_recipe')}
                              </Text>
                            </XStack>
                          ) : (
                            <Text
                              fontSize="$6"
                              fontWeight="600"
                              lineHeight={28}
                            >
                              {mealName}
                            </Text>
                          )}
                        </YStack>
                      </Card>
                    </Animated.View>
                  );
                })}
              </YStack>

              {/* Bottom Action Bar */}
              <XStack gap="$3" marginTop="$6" marginBottom="$4">
                <Button
                  flex={1}
                  size="$4"
                  backgroundColor="$background"
                  borderColor="$borderColor"
                  borderWidth={1}
                  onPress={handleAddToCalendar}
                  icon={
                    <FontAwesome5
                      name="calendar-check"
                      size={16}
                      color={colors.text}
                    />
                  }
                >
                  <Text fontWeight="600">{t('planner_sync_calendar')}</Text>
                </Button>
                <Button
                  flex={1}
                  size="$4"
                  backgroundColor={colors.tint}
                  onPress={handleAddWeekToList}
                  disabled={isGeneratingList}
                  icon={
                    isGeneratingList ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <FontAwesome5
                        name="shopping-basket"
                        size={16}
                        color="white"
                      />
                    )
                  }
                >
                  <Text color="white" fontWeight="600">
                    {t('planner_shop_ingredients')}
                  </Text>
                </Button>
              </XStack>
            </Animated.View>
          ) : (
            <YStack
              padding="$8"
              alignItems="center"
              opacity={0.6}
              gap="$4"
              marginTop="$6"
            >
              <View
                style={{
                  marginBottom: 10,
                  padding: 20,
                  backgroundColor: `${colors.tint}10`,
                  borderRadius: 100,
                }}
              >
                <FontAwesome5
                  name="calendar-plus"
                  size={40}
                  color={colors.tint}
                />
              </View>
              <Text fontSize="$5" fontWeight="600" textAlign="center">
                {t('planner_empty_title')}
              </Text>
              <Text
                fontSize="$3"
                textAlign="center"
                opacity={0.7}
                paddingHorizontal="$4"
              >
                {t('planner_empty_text')}
              </Text>
            </YStack>
          )}
        </ScrollView>
      </YStack>
      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistory(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <XStack
            padding="$4"
            justifyContent="space-between"
            alignItems="center"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <Text fontSize="$5" fontWeight="700">
              {t('planner_history')}
            </Text>
            <Button
              size="$3"
              chromeless
              onPress={() => setShowHistory(false)}
              icon={<FontAwesome5 name="times" size={16} color={colors.text} />}
            />
          </XStack>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {mealPlanHistory?.map((plan: any) => (
              <Card
                key={plan._id}
                padding="$4"
                marginBottom="$3"
                bordered
                backgroundColor="$card"
                pressStyle={{ scale: 0.98 }}
                onPress={() => loadHistoricalPlan(plan)}
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack>
                    <Text fontWeight="600" fontSize="$4">
                      {new Date(plan._creationTime).toLocaleDateString()}
                    </Text>
                    <Text fontSize="$3" opacity={0.6}>
                      {plan.type === 'baby'
                        ? t('planner_baby_plan')
                        : t('planner_standard_plan')}
                    </Text>
                  </YStack>
                  <FontAwesome5
                    name="chevron-right"
                    size={14}
                    color={colors.text}
                  />
                </XStack>
              </Card>
            ))}
            {(!mealPlanHistory || mealPlanHistory.length === 0) && (
              <Text textAlign="center" opacity={0.5} marginTop="$10">
                {t('planner_history_empty')}
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/**
 * Animated Mode Switcher Component
 * Extracted to ensure proper hook usage and avoid crashes
 */
const AnimatedModeSwitcher = ({ mode, setMode, colors, t }: any) => {
  const [layoutWidth, setLayoutWidth] = useState(0);

  // Animated styles defined at component top level
  // Using direct state in useAnimatedStyle as requested
  const sliderStyle = useAnimatedStyle(() => {
    // If layout hasn't been measured yet, avoid jumping
    if (layoutWidth === 0) return {};

    return {
      transform: [
        {
          translateX: withSpring(mode === 'standard' ? 0 : layoutWidth * 0.49, {
            damping: 15,
            stiffness: 150,
            mass: 0.8,
          }),
        },
      ],
    };
  });

  const standardTextStyle = useAnimatedStyle(() => ({
    color: withSpring(mode === 'standard' ? '#ffffff' : colors.text),
  }));

  const babyTextStyle = useAnimatedStyle(() => ({
    color: withSpring(mode === 'baby' ? '#ffffff' : colors.text),
  }));

  return (
    <View
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      style={{
        backgroundColor: colors.card,
        flexDirection: 'row',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        height: 54,
        position: 'relative',
      }}
    >
      {/* Animated Slider Background */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 4,
            left: 4,
            bottom: 4,
            width: '50%',
            borderRadius: 12,
            backgroundColor: mode === 'baby' ? '#FFB6C1' : colors.tint,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          },
          sliderStyle,
        ]}
      />

      <Pressable
        onPress={() => {
          haptics.selection();
          setMode('standard');
        }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Animated.Text style={[{ fontWeight: '700' }, standardTextStyle]}>
          {t('planner_mode_standard')}
        </Animated.Text>
      </Pressable>
      <Pressable
        onPress={() => {
          haptics.selection();
          setMode('baby');
        }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Animated.Text style={[{ fontWeight: '700' }, babyTextStyle]}>
          {t('planner_mode_baby')}
        </Animated.Text>
      </Pressable>
    </View>
  );
};

/**
 * Planner Day Item Component
 * Extracted to allow safe use of hooks (useAnimatedStyle) for each item
 */
const PlannerDayItem = ({
  day,
  index,
  isActive,
  setActiveDay,
  latestPlan,
  colors,
  t,
  language,
}: any) => {
  const planStartDate = latestPlan?.startDate || Date.now();
  const date = new Date(planStartDate);
  date.setDate(date.getDate() + index);

  // Safe to use hooks here!
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive ? 1.1 : 1, {
          damping: 20,
          stiffness: 200,
        }),
      },
    ],
  }));

  return (
    <Animated.View
      key={index}
      entering={FadeInRight.delay(index * 50)
        .springify()
        .damping(50)}
    >
      <Pressable
        onPress={() => {
          haptics.light();
          setActiveDay(index);
        }}
      >
        <Animated.View style={scaleStyle}>
          <LinearGradient
            colors={
              isActive ? [colors.tint, colors.tint] : [colors.card, colors.card]
            }
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              width: 70,
              borderRadius: 35,
              borderWidth: isActive ? 0 : 1,
              borderColor: '$borderColor',
              elevation: isActive ? 4 : 0,
              shadowColor: colors.tint,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isActive ? 0.3 : 0,
              shadowRadius: 8,
              marginVertical: 8,
            }}
          >
            <Text
              color={isActive ? 'white' : colors.text}
              opacity={isActive ? 0.9 : 0.5}
              fontSize="$2"
              fontWeight="700"
              marginBottom={4}
            >
              {date
                .toLocaleDateString(language, { weekday: 'short' })
                .toUpperCase()}
            </Text>
            <Text
              color={isActive ? 'white' : colors.text}
              fontSize="$6"
              fontWeight="800"
            >
              {date.getDate()}
            </Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
