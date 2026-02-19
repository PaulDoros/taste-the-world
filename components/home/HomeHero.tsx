import React, { useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  useColorScheme as useNativeColorScheme,
} from 'react-native'; // Fallback
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  YStack,
  XStack,
  Heading,
  Paragraph,
  Card,
  useTheme,
  Image,
} from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { HOME_STATS } from '@/constants/HomeConfig';
import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';
// Use local helper or context if needed.
import { useColorScheme } from '@/components/useColorScheme';
import { glassTokens } from '@/theme/colors';

// Sub-components
import { WavingHand } from './hero/WavingHand';
import { HomeStatsRow } from './hero/HomeStatsRow';
import { ExploreButton } from './hero/ExploreButton';

interface HomeHeroProps {
  isAuthenticated: boolean;
  userName?: string;
  countriesCount: number;
  onBrowseAll: () => void;
}

export const HomeHero = React.memo<HomeHeroProps>(
  ({ isAuthenticated, userName, countriesCount, onBrowseAll }) => {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { t } = useLanguage();

    const handleBrowseAllPress = () => {
      haptics.medium();
      onBrowseAll();
    };

    const welcomeText = useMemo(() => {
      if (isAuthenticated && userName) {
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

    const glass = glassTokens[isDark ? 'dark' : 'light'];

    return (
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={{ width: '100%' }}
      >
        <GlassCard
          borderRadius={28}
          shadowRadius={4}
          contentContainerStyle={{
            paddingVertical: 24,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {isAuthenticated && (
            <YStack position="absolute" top={16} right={16} zIndex={10}>
              <StreakCounter />
            </YStack>
          )}

          {/* Header Section */}
          <YStack
            alignItems="center"
            justifyContent="center"
            style={{ marginTop: -10 }}
          >
            <Animated.View
              entering={FadeIn.delay(150)}
              style={{ alignItems: 'center', width: '100%' }}
            >
              {/* Banner Image - Restored Fixed Dimensions */}
              <Image
                source={require('@/assets/images/taste-the-world-banner.png')}
                style={{ width: 350, height: 200 }}
                resizeMode="contain"
              />
            </Animated.View>
          </YStack>

          {/* Stats Row */}
          <View style={{ width: '100%', marginTop: 8 }}>
            <HomeStatsRow stats={stats} />
          </View>

          {/* Premium CTA Button */}
          <View style={{ width: '100%', marginTop: 20 }}>
            <ExploreButton
              onPress={handleBrowseAllPress}
              title={t('home_explore_countries')}
              subtitle={t('home_destinations', { count: countriesCount })}
            />
          </View>
        </GlassCard>
      </Animated.View>
    );
  }
);

HomeHero.displayName = 'HomeHero';
