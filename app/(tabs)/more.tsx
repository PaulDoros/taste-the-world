import React from 'react';
import { XStack } from 'tamagui';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/ScreenLayout';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';
import { useTierLimit } from '@/hooks/useTierLimit';
import { PremiumLockModal } from '@/components/PremiumLockModal';
import { XPProgress } from '@/components/gamification/XPProgress';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { useState } from 'react';

export default function MoreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  const { canAccessFeature } = useTierLimit();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');

  const handleNavigate = (route: string, isLocked: boolean, title: string) => {
    haptics.light();
    if (isLocked) {
      setLockedFeatureName(title);
      setShowPremiumModal(true);
      return;
    }
    router.push(route as any);
  };

  const menuItems = [
    {
      title: t('more_menu_map'),
      icon: 'map-marked-alt',
      route: '/(tabs)/map',
      color: '#3b82f6',
      description: t('more_menu_map_desc'),
      locked: false,
    },
    {
      title: t('more_menu_wallet'),
      icon: 'ticket-alt',
      route: '/wallet',
      color: '#10b981', // Emerald green
      description: t('more_menu_wallet_desc'),
      locked: !canAccessFeature('wallet'),
    },
    {
      title: t('more_menu_planner'),
      icon: 'calendar-alt',
      route: '/(tabs)/planner',
      color: '#a855f7',
      description: t('more_menu_planner_desc'),
      locked: !canAccessFeature('planner'),
    },
    {
      title: t('more_menu_travel_planner'),
      icon: 'plane-departure',
      route: '/travel-planner',
      color: '#3b82f6',
      description: t('more_menu_travel_planner_desc'),
      locked: !canAccessFeature('planner'),
    },
    {
      title: t('more_menu_shopping'),
      icon: 'shopping-basket',
      route: '/(tabs)/shopping-list',
      color: '#f59e0b',
      description: t('more_menu_shopping_desc'),
      locked: false,
    },
    {
      title: t('more_menu_pantry'),
      icon: 'box',
      route: '/(tabs)/pantry',
      color: '#ec4899',
      description: t('more_menu_pantry_desc'),
      locked: false,
    },
    {
      title: t('more_menu_my_recipes'),
      icon: 'book-open',
      route: '/recipes/my-book',
      color: '#d946ef',
      description: t('more_menu_my_recipes_desc'),
      locked: false,
    },
    {
      title: t('more_menu_history'),
      icon: 'history',
      route: '/(tabs)/history',
      color: '#06b6d4',
      description: t('more_menu_history_desc'),
      locked: false,
    },
  ];

  return (
    <ScreenLayout edges={['top', 'left', 'right']}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text
            style={{
              color: colors.text,
              fontSize: 32,
              fontWeight: '700',
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            {t('more_title')}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
            {t('more_subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AmbientBackground />
        {/* Gamification Stats */}
        <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom={12}
            paddingHorizontal={4}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              Your Journey
            </Text>
            <Pressable
              onPress={() => router.push('/gamification/achievements' as any)}
            >
              <Text
                style={{ color: colors.tint, fontSize: 14, fontWeight: '600' }}
              >
                View All
              </Text>
            </Pressable>
          </XStack>

          {/* XP Card - Now Clickable */}
          <Pressable
            onPress={() => {
              haptics.light();
              router.push('/gamification/achievements' as any);
            }}
            style={({ pressed }) => ({
              padding: 16,
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <XPProgress />
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <FontAwesome5 name="medal" size={24} color={colors.tint} />
              <FontAwesome5
                name="chevron-right"
                size={16}
                color={colors.text}
                opacity={0.3}
              />
            </View>
          </Pressable>
        </View>
        {/* Menu Grid */}
        <View style={{ gap: 12, paddingHorizontal: 16 }}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.title}
              onPress={() =>
                handleNavigate(item.route, item.locked, item.title)
              }
              style={({ pressed }) => ({
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : item.locked ? 0.8 : 1, // Slight dim for locked items
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              })}
            >
              {/* Icon */}
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: `${item.color}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome5
                  name={item.icon as any}
                  size={24}
                  color={item.color}
                />
                {item.locked && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      backgroundColor: colors.card,
                      borderRadius: 10,
                      padding: 2,
                    }}
                  >
                    <FontAwesome5 name="lock" size={12} color={colors.text} />
                  </View>
                )}
              </View>

              {/* Text Content */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 17,
                    fontWeight: '600',
                    marginBottom: 2,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    opacity: 0.6,
                  }}
                >
                  {item.description}
                </Text>
              </View>

              {/* Chevron or Lock */}
              <FontAwesome5
                name={item.locked ? 'lock' : 'chevron-right'}
                size={16}
                color={colors.tabIconDefault}
                opacity={item.locked ? 0.5 : 1}
              />
            </Pressable>
          ))}
        </View>
        {/* Footer Section */}
        <View
          style={{
            marginTop: 32,
            padding: 16,
            backgroundColor: `${colors.tint}10`,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: `${colors.tint}20`,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 4,
            }}
          >
            {t('more_tip_title')}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 13,
              opacity: 0.7,
              lineHeight: 18,
            }}
          >
            {t('more_tip_desc')}
          </Text>
        </View>
      </ScrollView>

      <PremiumLockModal
        isVisible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => {
          setShowPremiumModal(false);
          router.push('/(tabs)/settings');
        }}
        featureTitle={lockedFeatureName}
      />
    </ScreenLayout>
  );
}
