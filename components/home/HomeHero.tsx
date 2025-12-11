import React, { useMemo, useEffect, useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { YStack, XStack, Heading, Paragraph, Button, Card } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { useColorScheme } from '@/components/useColorScheme';
import { HOME_STATS } from '@/constants/HomeConfig';
import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';

interface HomeHeroProps {
  isAuthenticated: boolean;
  userName?: string;
  countriesCount: number;
  onBrowseAll: () => void;
}

const WavingHand = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 150 }),
        withTiming(-10, { duration: 150 }),
        withTiming(35, { duration: 150 }),
        withTiming(-5, { duration: 150 }),
        withTiming(25, { duration: 150 }),
        withTiming(0, { duration: 150 }),
        withTiming(0, { duration: 5000 }) // 5 second delay between waves
      ),
      -1, // Infinite repeats
      false // No reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    transformOrigin: 'bottom right', // Pivot from bottom right like a hand wave
  }));

  return (
    <Animated.Text style={[{ fontSize: 18, lineHeight: 40 }, animatedStyle]}>
      👋
    </Animated.Text>
  );
};

const CountingNumber = ({
  value,
  color,
}: {
  value: string | number;
  color: string;
}) => {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    let numericValue = 0;
    let suffix = '';

    if (typeof value === 'number') {
      numericValue = value;
    } else {
      const match = value.toString().match(/(\d+)(.*)/);
      if (match) {
        numericValue = parseInt(match[1], 10);
        suffix = match[2];
      }
    }

    if (numericValue === 0) {
      setDisplayValue(value.toString());
      return;
    }

    // Dynamic duration based on value magnitude, capped at 2s
    const duration = Math.min(2000, Math.max(800, numericValue * 50));
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);

      // Ease out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      const current = Math.floor(numericValue * easeProgress);
      setDisplayValue(current + suffix);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value]);

  return (
    <Heading size="$6" fontWeight="800" color={color}>
      {displayValue}
    </Heading>
  );
};

export const HomeHero = React.memo<HomeHeroProps>(
  ({ isAuthenticated, userName, countriesCount, onBrowseAll }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { t } = useLanguage();

    const handleBrowseAllPress = () => {
      haptics.medium();
      onBrowseAll();
    };

    const welcomeText = useMemo(() => {
      if (isAuthenticated && userName) {
        // Extract first name for a friendlier greeting
        const firstName = userName.split(' ')[0];
        return t('home_welcome_back', { name: firstName });
      }
      return t('home_title');
    }, [isAuthenticated, userName, t]);

    const subtitleText = useMemo(() => {
      return isAuthenticated
        ? t('home_subtitle_loggedin')
        : t('home_subtitle_guest');
    }, [isAuthenticated, t]);

    const stats = useMemo(
      () => [
        {
          label: t('home_countries'),
          value: countriesCount,
          icon: 'globe-americas',
        },
        {
          label: t('home_recipes'),
          value: HOME_STATS.RECIPES,
          icon: 'utensils',
        },
        {
          label: t('home_regions'),
          value: HOME_STATS.REGIONS,
          icon: 'map-marked-alt',
        },
      ],
      [countriesCount, t]
    );

    return (
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <Card
          padded
          elevate
          bordered
          borderColor={
            colorScheme === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)'
          }
          shadowColor={colorScheme === 'dark' ? '#000' : colors.tint}
          shadowOffset={{ width: 0, height: 16 }}
          shadowOpacity={colorScheme === 'dark' ? 0.5 : 0.15}
          shadowRadius={32}
          elevation={Platform.select({ android: 8, default: 12 })} // Reduced elevation for Android
          justifyContent="center"
          overflow="hidden" // Required for BlurView borderRadius
        >
          {/* Native Blur View - Hide on Android if opacity is high to avoid double-layer look */}
          {Platform.OS !== 'android' && (
            <BlurView
              intensity={30}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          )}

          {isAuthenticated && (
            <View
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
            >
              <StreakCounter />
            </View>
          )}

          {/* Header Section */}
          <YStack alignItems="center" justifyContent="center" mb="$5">
            {/* Title and Subtitle */}
            <YStack alignItems="center" justifyContent="center" mb="$5">
              <Animated.View entering={FadeIn.delay(150)}>
                <XStack alignItems="center" flexWrap="wrap">
                  <Heading
                    size="$8"
                    fontWeight="900"
                    letterSpacing={-1}
                    mb="$2"
                    color="$color"
                    marginRight="$2"
                  >
                    {welcomeText}
                  </Heading>
                  {isAuthenticated && userName && <WavingHand />}
                </XStack>
                <Paragraph
                  size="$4"
                  color="$color11"
                  opacity={0.8}
                  lineHeight="$2"
                >
                  {subtitleText}
                </Paragraph>
              </Animated.View>
            </YStack>

            {/* Enhanced Stats Row with Glassmorphism */}
            <XStack space="$3" mb="$5">
              {stats.map((stat, index) => (
                <Animated.View
                  key={stat.label}
                  entering={FadeIn.delay(200 + index * 60)}
                  style={{ flex: 1 }}
                >
                  <Card
                    elevate
                    bordered
                    padding="$2"
                    borderRadius="$5"
                    alignItems="center" // Center content horizontally
                    justifyContent="center" // Center content vertically
                    animation="quick"
                    pressStyle={{ scale: 0.97 }}
                    overflow="hidden"
                  >
                    {/* Native Blur View */}
                    <BlurView
                      intensity={20}
                      tint={colorScheme === 'dark' ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />

                    {/* Icon */}
                    <YStack
                      width={36}
                      height={36}
                      borderRadius="$4"
                      ai="center"
                      jc="center"
                      backgroundColor={colors.tint + '15'}
                      mb="$2" // Reduced margin
                    >
                      <FontAwesome5
                        name={stat.icon}
                        size={16}
                        color={colors.tint}
                      />
                    </YStack>

                    {/* Value */}
                    <CountingNumber value={stat.value} color={colors.tint} />

                    {/* Label */}
                    <Paragraph
                      size="$2"
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing={0.5}
                      color="$color11"
                      opacity={0.6}
                      textAlign="center" // Ensure text is centered
                    >
                      {stat.label}
                    </Paragraph>
                  </Card>
                </Animated.View>
              ))}
            </XStack>
          </YStack>

          {/* Premium CTA Button with Gradient */}
          <Animated.View entering={FadeIn.delay(380)}>
            <Button
              onPress={handleBrowseAllPress}
              size="$5"
              borderRadius="$5"
              padding={0} // Remove padding to let gradient fill
              overflow="hidden"
              borderWidth={0}
              pressStyle={{ scale: 0.98, opacity: 0.9 }}
              animation="quick"
              shadowColor={colors.tint}
              shadowOffset={{ width: 0, height: 12 }}
              shadowOpacity={0.4}
              shadowRadius={20}
              elevation={10}
            >
              <LinearGradient
                colors={[colors.tint, '#FB923C']} // Gradient from primary to lighter orange
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <XStack ai="center" flex={1} space="$3">
                  {/* Icon Container */}
                  <YStack
                    width={42}
                    height={42}
                    borderRadius="$4"
                    padding="$2"
                    ai="center"
                    jc="center"
                    backgroundColor="rgba(255,255,255,0.2)"
                  >
                    <FontAwesome5
                      name="globe-americas"
                      size={24}
                      color="#FFFFFF"
                    />
                  </YStack>

                  {/* Text Content */}
                  <YStack flex={1}>
                    <Heading
                      size="$6"
                      fontWeight="900"
                      color="white"
                      letterSpacing={-0.5}
                    >
                      {t('home_explore_countries')}
                    </Heading>
                    <Paragraph size="$3" color="white" opacity={0.9}>
                      {t('home_destinations', { count: countriesCount })}
                    </Paragraph>
                  </YStack>
                </XStack>

                {/* Arrow */}
                <YStack
                  width={40}
                  height={40}
                  borderRadius="$10"
                  ai="center"
                  jc="center"
                  backgroundColor="rgba(255,255,255,0.25)"
                >
                  <FontAwesome5 name="arrow-right" size={18} color="white" />
                </YStack>
              </LinearGradient>
            </Button>
          </Animated.View>
        </Card>
      </Animated.View>
    );
  }
);

HomeHero.displayName = 'HomeHero';
