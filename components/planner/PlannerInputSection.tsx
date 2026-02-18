import React from 'react';
import { YStack, XStack, Text, Input, ScrollView, Stack } from 'tamagui';
import { ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { haptics } from '@/utils/haptics';
import { COUNTRY_TO_AREA_MAP } from '@/constants/Config';

const AVAILABLE_CUISINES = Object.keys(COUNTRY_TO_AREA_MAP).sort();

interface PlannerInputSectionProps {
  mode: 'standard' | 'baby';
  setMode: (mode: 'standard' | 'baby') => void;
  preferences: string;
  setPreferences: (text: string) => void;
  selectedCuisine: string | null;
  setSelectedCuisine: (cuisine: string | null) => void;
  colors: any;
  t: (key: any) => string;
  isLoading: boolean;
  onGenerate: () => void;
}

export const PlannerInputSection = ({
  mode,
  setMode,
  preferences,
  setPreferences,
  selectedCuisine,
  setSelectedCuisine,
  colors,
  t,
  isLoading,
  onGenerate,
}: PlannerInputSectionProps) => {
  return (
    <GlassCard
      style={{ marginBottom: 24 }}
      contentContainerStyle={{ padding: 0 }}
    >
      <LinearGradient
        colors={[mode === 'baby' ? '#FFE4E1' : `${colors.tint}15`, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ padding: 16, gap: 12 }}
      >
        <YStack gap="$3">
          <XStack
            backgroundColor="$background"
            padding={4}
            borderRadius={100}
            borderWidth={1}
            borderColor="$borderColor"
            height={50}
            position="relative"
          >
            <Animated.View
              style={useAnimatedStyle(() => ({
                position: 'absolute',
                left: 4,
                top: 4,
                bottom: 4,
                width: '50%',
                backgroundColor: mode === 'baby' ? '#FFB6C1' : colors.tint,
                borderRadius: 100,
                transform: [
                  {
                    translateX: withSpring(
                      mode === 'standard' ? 0 : 150, // Approximate width/2
                      { damping: 15, stiffness: 150 }
                    ),
                  },
                ],
              }))}
            />
            <Pressable
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
              onPress={() => {
                haptics.selection();
                setMode('standard');
              }}
            >
              <Text
                fontWeight="700"
                color={mode === 'standard' ? 'white' : '$gray10'}
                fontSize="$3"
              >
                {t('planner_mode_standard')}
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
              onPress={() => {
                haptics.selection();
                setMode('baby');
              }}
            >
              <Text
                fontWeight="700"
                color={mode === 'baby' ? 'white' : '$gray10'}
                fontSize="$3"
              >
                {t('planner_mode_baby')}
              </Text>
            </Pressable>
          </XStack>

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
                      selectedCuisine === null ? colors.tint : '$borderColor',
                  }}
                >
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color={selectedCuisine === null ? 'white' : colors.text}
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
                        selectedCuisine === cuisine ? 'white' : colors.text
                      }
                    >
                      {cuisine}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </YStack>

            <GlassButton
              size="large"
              backgroundColor={mode === 'baby' ? '#FFB6C1' : colors.tint}
              onPress={onGenerate}
              disabled={isLoading}
              label={
                isLoading
                  ? t('planner_generating')
                  : t('planner_generate_button')
              }
              icon={isLoading ? undefined : mode === 'baby' ? 'baby' : 'magic'}
              iconComponent={
                isLoading ? <ActivityIndicator color="white" /> : undefined
              }
              textColor="white"
            />
          </Animated.View>
        </YStack>
      </LinearGradient>
    </GlassCard>
  );
};
