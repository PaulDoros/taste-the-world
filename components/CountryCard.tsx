import React from 'react';
import { Image, Animated, Pressable } from 'react-native'; // Tamagui Image can be tricky with resizeMode sometimes, standard Image is fine inside Card
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  Text,
  View,
  YStack,
  XStack,
  Paragraph,
  Heading,
  useTheme,
  getTokens,
} from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';

import { Country } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface CountryCardProps {
  country: Country;
  isPremium: boolean;
  isLocked?: boolean;
  onPress: () => void;
}

export const CountryCard = ({
  country,
  isPremium,
  isLocked = false,
  onPress,
}: CountryCardProps) => {
  const theme = useTheme();
  const { t } = useLanguage();

  const formatPopulation = (pop: number): string => {
    if (pop >= 1_000_000_000) {
      return t('common_pop_b', { count: (pop / 1_000_000_000).toFixed(1) });
    } else if (pop >= 1_000_000) {
      return t('common_pop_m', { count: (pop / 1_000_000).toFixed(1) });
    } else if (pop >= 1_000) {
      return t('common_pop_k', { count: (pop / 1_000).toFixed(1) });
    }
    return t('common_pop_unit', { count: pop });
  };

  const scale = React.useRef(new Animated.Value(1)).current;

  // Simple scale animation
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ marginBottom: 16 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <GlassCard borderRadius={24} shadowOpacity={0.3} shadowRadius={3}>
          <View height={200}>
            <Image
              source={{ uri: country.flags.png }}
              style={{
                width: '100%',
                height: '100%',
                opacity: isLocked ? 0.6 : 1,
              }}
              resizeMode="cover"
            />

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 120,
              }}
            />

            {/* Locked Overlay */}
            {isLocked && (
              <YStack
                fullscreen
                backgroundColor="rgba(0,0,0,0.3)"
                alignItems="center"
                justifyContent="center"
                zIndex={10}
              >
                <YStack
                  backgroundColor="rgba(0,0,0,0.6)"
                  padding="$4"
                  borderRadius="$10"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.2)"
                >
                  <FontAwesome5 name="lock" size={24} color="white" />
                </YStack>
              </YStack>
            )}

            {/* Premium Badge */}
            {isPremium && !isLocked && (
              <XStack
                position="absolute"
                top="$3"
                right="$3"
                backgroundColor={theme.purple10.get()}
                borderRadius="$4"
                paddingHorizontal="$2.5"
                paddingVertical="$1.5"
                alignItems="center"
                space="$1.5"
                shadowColor={theme.purple10.get()}
                shadowOpacity={0.4}
                shadowRadius={8}
              >
                <FontAwesome5
                  name="crown"
                  size={10}
                  color={theme.yellow10.get()}
                />
                <Text
                  color="white"
                  fontSize={11}
                  fontWeight="700"
                  letterSpacing={0.5}
                >
                  {t('common_pro')}
                </Text>
              </XStack>
            )}

            {/* Country Info Overlay */}
            <YStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              padding="$4"
            >
              <Heading
                color="white"
                size="$8"
                fontWeight="800"
                textShadowColor="rgba(0,0,0,0.9)"
                textShadowOffset={{ width: 0, height: 2 }}
                textShadowRadius={8}
                opacity={isLocked ? 0.8 : 1}
                numberOfLines={2}
              >
                {country.name.common}
              </Heading>

              {/* Region Tag */}
              <XStack marginTop="$2">
                <View
                  backgroundColor="rgba(255, 255, 255, 0.25)"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="rgba(255, 255, 255, 0.3)"
                >
                  <Text
                    color="white"
                    fontSize={11}
                    fontWeight="600"
                    letterSpacing={0.5}
                  >
                    {country.region}
                  </Text>
                </View>
              </XStack>
            </YStack>
          </View>

          {/* Footer Info */}
          <YStack
            padding="$3"
            // No background color - let glass shine through
            opacity={isLocked ? 0.6 : 1}
          >
            <YStack flex={1} space="$2">
              {/* Capital */}
              {country.capital && (
                <XStack alignItems="center">
                  <YStack
                    width={28}
                    height={28}
                    borderRadius="$10"
                    backgroundColor={theme.tint.val + '15'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FontAwesome5
                      name="map-marker"
                      size={12}
                      color={theme.tint.val}
                    />
                  </YStack>
                  <YStack marginLeft="$2" flex={1}>
                    <Text
                      color="$color"
                      fontSize={11}
                      opacity={0.6}
                      fontWeight="500"
                    >
                      {t('common_capital')}
                    </Text>
                    <Paragraph
                      color="$color"
                      size="$2"
                      fontWeight="600"
                      numberOfLines={1}
                    >
                      {country.capital[0]}
                    </Paragraph>
                  </YStack>
                </XStack>
              )}

              {/* Population */}
              <XStack
                alignItems="center"
                paddingTop="$2"
                borderTopWidth={1}
                borderColor="$borderColor"
              >
                <FontAwesome5 name="users" size={11} color={theme.tint.val} />
                <Text
                  color="$color"
                  fontSize={12}
                  marginLeft="$2"
                  opacity={0.7}
                  fontWeight="500"
                >
                  {formatPopulation(country.population)}
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </GlassCard>
      </Animated.View>
    </Pressable>
  );
};
