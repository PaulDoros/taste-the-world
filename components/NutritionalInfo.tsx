import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTierLimit } from '@/hooks/useTierLimit';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'expo-router';
import { Ingredient } from '@/types';

interface NutritionalInfoProps {
  ingredients: Ingredient[];
}

export const NutritionalInfo: React.FC<NutritionalInfoProps> = ({
  ingredients,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { canAccessFeature } = useTierLimit();
  const { t } = useLanguage();
  const router = useRouter();
  const { showError } = useAlertDialog();

  const isUnlocked = canAccessFeature('nutrition');

  // Simple mock calculation logic (placeholder for real data)
  const calculateNutrition = () => {
    // This is just a visual placeholder based on ingredient count
    const base = ingredients.length;
    return {
      calories: base * 45,
      protein: Math.round(base * 1.5),
      carbs: Math.round(base * 5),
      fat: Math.round(base * 2),
    };
  };

  const nutrition = calculateNutrition();

  const handlePressLocked = () => {
    showError(t('common_upgrade_required'));
    router.push('/(tabs)/settings');
  };

  return (
    <Animated.View entering={FadeInUp.delay(400).springify()}>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: `${colors.tint}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <FontAwesome5 name="fire" size={16} color={colors.tint} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
            {t('premium_benefit_nutri')}
          </Text>
          {!isUnlocked && (
            <View style={{ marginLeft: 'auto' }}>
              <FontAwesome5
                name="lock"
                size={16}
                color={colors.text}
                opacity={0.5}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <NutritionItem
            label="Calories"
            value={`${nutrition.calories}`}
            unit="kcal"
            colors={colors}
          />
          <NutritionItem
            label="Protein"
            value={`${nutrition.protein}`}
            unit="g"
            colors={colors}
          />
          <NutritionItem
            label="Carbs"
            value={`${nutrition.carbs}`}
            unit="g"
            colors={colors}
          />
          <NutritionItem
            label="Fat"
            value={`${nutrition.fat}`}
            unit="g"
            colors={colors}
          />
        </View>

        {/* Lock Overlay */}
        {!isUnlocked && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
            <BlurView
              intensity={20}
              style={[
                StyleSheet.absoluteFill,
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)', // Light overlay
                },
              ]}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
            >
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <FontAwesome5
                  name="lock"
                  size={16}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: 'white', fontWeight: '600' }}
                  onPress={handlePressLocked}
                >
                  Upgrade to View
                </Text>
              </View>
            </BlurView>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const NutritionItem = ({ label, value, unit, colors }: any) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
      {value}
      <Text
        style={{
          fontSize: 12,
          fontWeight: '400',
          color: colors.text,
          opacity: 0.6,
        }}
      >
        {unit}
      </Text>
    </Text>
    <Text
      style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginTop: 4 }}
    >
      {label}
    </Text>
  </View>
);
