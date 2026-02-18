import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ScrollView, Alert } from 'react-native';
import { YStack, Text, Button, Stack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/ScreenLayout';
import { useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import * as Calendar from 'expo-calendar';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useAuth } from '@/hooks/useAuth';
import { Translations } from '@/constants/Translations';
import { useLanguage } from '@/context/LanguageContext';
import { useTierLimit } from '@/hooks/useTierLimit';
import { useFocusEffect } from 'expo-router';
import { PremiumLockModal } from '@/components/PremiumLockModal';

// Imported Components
import { PlannerHeader } from '@/components/planner/PlannerHeader';
import { PlannerInputSection } from '@/components/planner/PlannerInputSection';
import { PlannerDayItem } from '@/components/planner/PlannerDayItem';
import { PlannerMealCard } from '@/components/planner/PlannerMealCard';
import { PlannerActions } from '@/components/planner/PlannerActions';
import { PlannerHistoryModal } from '@/components/planner/PlannerHistoryModal';
import { PlannerEmptyState } from '@/components/planner/PlannerEmptyState';

export default function PlannerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [mode, setMode] = useState<'standard' | 'baby'>('standard');
  const [generatingRecipe, setGeneratingRecipe] = useState<string | null>(null);
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
              ? '6 months old, just starting'
              : 'Balanced diet, no restrictions'),
          type: mode,
          cuisine: selectedCuisine || undefined,
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
    }
  };

  const { canAccessFeature } = useTierLimit();
  const isUnlocked = canAccessFeature('planner');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (isUnlocked === false) {
        const timer = setTimeout(() => setShowPremiumModal(true), 100);
        return () => clearTimeout(timer);
      }
    }, [isUnlocked])
  );

  if (isUnlocked === false) {
    return (
      <ScreenLayout edges={['top', 'left', 'right']}>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
          gap="$4"
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: `${colors.tint}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <FontAwesome5 name="lock" size={32} color={colors.tint} />
          </View>
          <Text fontSize="$6" fontWeight="800" textAlign="center">
            {t('meal_planner')}
          </Text>
          <Text fontSize="$4" color="$gray10" textAlign="center" opacity={0.8}>
            {t('premium_feature_desc')}
          </Text>
          <Button
            marginTop="$4"
            size="$5"
            themeInverse
            backgroundColor={colors.tint}
            onPress={() => router.push('/(tabs)/settings')}
          >
            {t('pricing_get_premium')}
          </Button>

          <PremiumLockModal
            isVisible={showPremiumModal}
            onClose={() => {
              setShowPremiumModal(false);
              router.back();
            }}
            onUpgrade={() => {
              setShowPremiumModal(false);
              router.push('/(tabs)/settings');
            }}
            featureTitle={t('meal_planner')}
          />
        </YStack>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout edges={['left', 'right']}>
      <YStack flex={1}>
        <PlannerHeader
          colorScheme={colorScheme}
          insets={insets}
          colors={colors}
          t={t}
          onHistoryPress={() => setShowHistory(true)}
        />

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <PlannerInputSection
            mode={mode}
            setMode={setMode}
            preferences={preferences}
            setPreferences={setPreferences}
            selectedCuisine={selectedCuisine}
            setSelectedCuisine={setSelectedCuisine}
            colors={colors}
            t={t}
            isLoading={isLoading}
            onGenerate={handleGenerate}
          />

          {planData && planData.days ? (
            <Animated.View
              key={`${mode}-plans`}
              entering={FadeInUp.springify().damping(50)}
            >
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
                      language={language}
                    />
                  ))}
                </ScrollView>
              </View>

              <YStack gap="$4">
                {['breakfast', 'lunch', 'dinner'].map((mealType, index) => {
                  const mealName = planData.days[activeDay].meals[mealType];
                  return (
                    <PlannerMealCard
                      key={`${mealType}-${activeDay}`}
                      mealType={mealType}
                      mealName={mealName}
                      activeDay={activeDay}
                      index={index}
                      colors={colors}
                      t={t}
                      onViewRecipe={handleViewRecipe}
                      generatingRecipe={generatingRecipe}
                    />
                  );
                })}
              </YStack>

              <PlannerActions
                onAddToCalendar={handleAddToCalendar}
                onAddWeekToList={handleAddWeekToList}
                isGeneratingList={isGeneratingList}
                colors={colors}
                t={t}
              />
            </Animated.View>
          ) : (
            <PlannerEmptyState colors={colors} t={t} />
          )}
        </ScrollView>
      </YStack>

      <PlannerHistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        mealPlanHistory={mealPlanHistory || []}
        onLoadPlan={loadHistoricalPlan}
        colors={colors}
        t={t}
      />
    </ScreenLayout>
  );
}
