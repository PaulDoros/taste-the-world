import React, { useMemo } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { YStack, XStack, Text, Heading, Paragraph, Button, Card } from 'tamagui';
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
      <AnimatedYStack entering={FadeInDown.delay(100)} width="100%" paddingHorizontal="$5">
        <Card
          elevate
          bordered
          borderRadius="$7"
          padding="$6"
          backgroundColor={
            colorScheme === 'dark'
              ? 'rgba(30, 30, 30, 0.7)'
              : 'rgba(255, 255, 255, 0.7)'
          }
          borderColor={
            colorScheme === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)'
          }
          shadowColor={colorScheme === 'dark' ? '#000' : colors.tint}
          shadowOffset={{ width: 0, height: 16 }}
          shadowOpacity={colorScheme === 'dark' ? 0.5 : 0.15}
          shadowRadius={32}
          elevation={12}
          // Glassmorphism effect
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Header Section */}
          <YStack mb="$5">
            {/* Title and Subtitle */}
            <YStack mb="$5">
              <Animated.View entering={FadeIn.delay(150)}>
                <Heading
                  size="$10"
                  fontWeight="900"
                  letterSpacing={-1}
                  mb="$2"
                  color="$color"
                >
                  {welcomeText}
                </Heading>
                <Paragraph size="$4" color="$color11" opacity={0.8} lineHeight="$2">
                  {subtitleText}
                </Paragraph>
              </Animated.View>
            </YStack>

            {/* Enhanced Stats Row with Glassmorphism */}
            <XStack space="$3" mb="$5">
              {stats.map((stat, index) => (
                <AnimatedXStack
                  key={stat.label}
                  entering={FadeIn.delay(200 + index * 60)}
                  flex={1}
                >
                  <Card
                    elevate
                    bordered
                    padding="$4"
                    borderRadius="$5"
                    backgroundColor={
                      colorScheme === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.6)'
                    }
                    borderColor={
                      colorScheme === 'dark'
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(255, 255, 255, 0.8)'
                    }
                    animation="quick"
                    pressStyle={{ scale: 0.97 }}
                    // Glassmorphism
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    {/* Icon */}
                    <YStack
                      width={36}
                      height={36}
                      borderRadius="$4"
                      ai="center"
                      jc="center"
                      backgroundColor={colors.tint + '15'}
                      mb="$3"
                    >
                      <FontAwesome5
                        name={stat.icon}
                        size={16}
                        color={colors.tint}
                      />
                    </YStack>

                    {/* Value */}
                    <Heading
                      size="$8"
                      fontWeight="900"
                      color={colors.tint}
                      letterSpacing={-0.8}
                      mb="$1"
                    >
                      {stat.value}
                    </Heading>

                    {/* Label */}
                    <Paragraph
                      size="$2"
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing={0.5}
                      color="$color11"
                      opacity={0.6}
                    >
                      {stat.label}
                    </Paragraph>
                  </Card>
                </AnimatedXStack>
              ))}
            </XStack>
          </YStack>

          {/* Premium CTA Button */}
          <AnimatedYStack entering={FadeIn.delay(380)}>
            <Button
              onPress={handleBrowseAllPress}
              size="$5"
              borderRadius="$5"
              backgroundColor={colors.tint}
              borderWidth={0}
              pressStyle={{ scale: 0.98, opacity: 0.85 }}
              hoverStyle={{ backgroundColor: colors.tint, opacity: 0.9 }}
              animation="quick"
              shadowColor={colors.tint}
              shadowOffset={{ width: 0, height: 12 }}
              shadowOpacity={0.4}
              shadowRadius={20}
              elevation={10}
            >
              <XStack ai="center" jc="space-between" width="100%" paddingHorizontal="$3">
                <XStack ai="center" flex={1} space="$3">
                  {/* Icon Container */}
                  <YStack
                    width={52}
                    height={52}
                    borderRadius="$4"
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
                      Explore Countries
                    </Heading>
                    <Paragraph size="$3" color="white" opacity={0.9}>
                      {countriesCount}+ destinations
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
                  <FontAwesome5
                    name="arrow-right"
                    size={18}
                    color="white"
                  />
                </YStack>
              </XStack>
            </Button>
          </AnimatedYStack>
        </Card>
      </AnimatedYStack>
    );
  }
);

HomeHero.displayName = 'HomeHero';
