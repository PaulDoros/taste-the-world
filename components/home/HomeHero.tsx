import React, { useMemo } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { YStack, XStack, Text, Paragraph, Button, Card } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { HOME_STATS } from '@/constants/HomeConfig';
import { haptics } from '@/utils/haptics';

interface HomeHeroProps {
  isAuthenticated: boolean;
  userName?: string;
  countriesCount: number;
  onBrowseAll: () => void;
}

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedXStack = Animated.createAnimatedComponent(XStack);

/**
 * Hero Section Component
 * Premium App Store-quality design with Tamagui components
 */
export const HomeHero = React.memo<HomeHeroProps>(
  ({ isAuthenticated, userName, countriesCount, onBrowseAll }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const welcomeText = useMemo(() => {
      if (isAuthenticated && userName) {
        return `Welcome back, ${userName.split(' ')[0]}! 👋`;
      }
      return 'Taste the World';
    }, [isAuthenticated, userName]);

    const subtitleText = useMemo(() => {
      return isAuthenticated
        ? 'Continue your culinary journey'
        : 'Discover authentic cuisines from around the world';
    }, [isAuthenticated]);

    const gradientColors = useMemo(() => {
      if (colorScheme === 'dark') {
        return [
          colors.tint + '35',
          colors.tint + '18',
          colors.tint + '10',
          colors.background,
        ] as const;
      }
      return [
        colors.tint + '28',
        colors.tint + '15',
        colors.tint + '08',
        colors.background,
      ] as const;
    }, [colorScheme, colors]);

    const handleBrowseAllPress = () => {
      haptics.medium();
      onBrowseAll();
    };

    const stats = useMemo(
      () => [
        {
          label: 'Countries',
          value: `${countriesCount}+`,
          icon: 'globe' as const,
        },
        {
          label: 'Recipes',
          value: HOME_STATS.RECIPES,
          icon: 'utensils' as const,
        },
        {
          label: 'Regions',
          value: `${HOME_STATS.REGIONS}`,
          icon: 'map' as const,
        },
      ],
      [countriesCount]
    );

    return (
      <AnimatedYStack entering={FadeInDown.delay(100)} width="100%">
        <LinearGradient
          colors={gradientColors}
          style={{
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: 40,
          }}
        >
          {/* Header Section */}
          <YStack mb="$4">
            {/* Icon and Title */}
            <XStack ai="center" mb="$3">
              <Animated.View
                entering={FadeIn.delay(150)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.tint,
                  shadowColor: colors.tint,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5,
                  marginRight: 12,
                }}
                accessibilityRole="image"
                accessibilityLabel="Taste the World app icon"
              >
                <FontAwesome5 name="utensils" size={26} color="#FFFFFF" />
              </Animated.View>
              <YStack flex={1}>
                <Text
                  fontSize="$8"
                  fontWeight="800"
                  letterSpacing={-0.5}
                  mb="$1"
                  color="$color"
                  accessibilityRole="header"
                >
                  {welcomeText}
                </Text>
                <Paragraph size="$3" color="$color11" lineHeight="$1">
                  {subtitleText}
                </Paragraph>
              </YStack>
            </XStack>

            {/* Stats Row */}
            <XStack space="$2" mb="$3">
              {stats.map((stat, index) => (
                <AnimatedXStack
                  key={stat.label}
                  entering={FadeIn.delay(200 + index * 40)}
                  flex={1}
                >
                  <Card
                    elevate
                    bordered
                    padding="$2.5"
                    borderRadius="$4"
                    backgroundColor={
                      colorScheme === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(255,255,255,0.75)'
                    }
                    borderColor={
                      colorScheme === 'dark'
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(0,0,0,0.06)'
                    }
                  >
                    <XStack ai="center" mb="$1">
                      <YStack
                        width={24}
                        height={24}
                        borderRadius="$2"
                        ai="center"
                        jc="center"
                        backgroundColor={colors.tint + '25'}
                        mr="$1.5"
                        accessibilityElementsHidden
                        importantForAccessibility="no"
                      >
                        <FontAwesome5
                          name={stat.icon}
                          size={11}
                          color={colors.tint}
                        />
                      </YStack>
                      <Text
                        fontSize="$6"
                        fontWeight="800"
                        color={colors.tint}
                        accessibilityLabel={`${stat.value} ${stat.label.toLowerCase()}`}
                      >
                        {stat.value}
                      </Text>
                    </XStack>
                    <Text
                      fontSize="$1"
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing={0.5}
                      color="$color11"
                    >
                      {stat.label}
                    </Text>
                  </Card>
                </AnimatedXStack>
              ))}
            </XStack>
          </YStack>

          {/* Primary CTA Button */}
          <AnimatedYStack entering={FadeIn.delay(320)}>
            <Button
              onPress={handleBrowseAllPress}
              size="$4"
              borderRadius="$4"
              backgroundColor={
                colorScheme === 'dark'
                  ? 'rgba(255,255,255,0.15)'
                  : '$background'
              }
              borderWidth={1}
              borderColor={
                colorScheme === 'dark'
                  ? 'rgba(255,255,255,0.18)'
                  : 'rgba(0,0,0,0.06)'
              }
              pressStyle={{ scale: 0.97 }}
              accessibilityRole="button"
              accessibilityLabel="Explore all countries"
              accessibilityHint={`Browse ${countriesCount} countries from around the world`}
            >
              <XStack ai="center" jc="space-between" width="100%" flex={1}>
                <XStack ai="center" flex={1}>
                  <YStack
                    width={44}
                    height={44}
                    borderRadius="$3"
                    ai="center"
                    jc="center"
                    backgroundColor={colors.tint}
                    mr="$3"
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  >
                    <FontAwesome5
                      name="globe-americas"
                      size={20}
                      color="#FFFFFF"
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      fontSize="$4"
                      fontWeight="800"
                      mb="$0.5"
                      color="$color"
                    >
                      Explore All Countries
                    </Text>
                    <Paragraph size="$2" color="$color11">
                      {countriesCount} destinations
                    </Paragraph>
                  </YStack>
                </XStack>
                <YStack
                  width={32}
                  height={32}
                  borderRadius="$10"
                  ai="center"
                  jc="center"
                  backgroundColor={colors.tint + '20'}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                >
                  <FontAwesome5
                    name="arrow-right"
                    size={14}
                    color={colors.tint}
                  />
                </YStack>
              </XStack>
            </Button>
          </AnimatedYStack>
        </LinearGradient>
      </AnimatedYStack>
    );
  }
);

HomeHero.displayName = 'HomeHero';
