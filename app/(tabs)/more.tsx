import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';

export default function MoreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  const handleNavigate = (route: string) => {
    haptics.light();
    router.push(route as any);
  };

  const menuItems = [
    {
      title: t('more_menu_map'),
      icon: 'map-marked-alt',
      route: '/(tabs)/map',
      color: '#3b82f6',
      description: t('more_menu_map_desc'),
    },
    {
      title: t('more_menu_planner'),
      icon: 'calendar-alt',
      route: '/(tabs)/planner',
      color: '#a855f7',
      description: t('more_menu_planner_desc'),
    },
    {
      title: t('more_menu_shopping'),
      icon: 'shopping-basket',
      route: '/(tabs)/shopping-list',
      color: '#f59e0b',
      description: t('more_menu_shopping_desc'),
    },
    {
      title: t('more_menu_pantry'),
      icon: 'box',
      route: '/(tabs)/pantry',
      color: '#ec4899',
      description: t('more_menu_pantry_desc'),
    },
    {
      title: t('more_menu_history'),
      icon: 'history',
      route: '/(tabs)/history',
      color: '#06b6d4',
      description: t('more_menu_history_desc'),
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
      >
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120, // Space for tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Grid */}
        <View style={{ gap: 12 }}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.title}
              onPress={() => handleNavigate(item.route)}
              style={({ pressed }) => ({
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
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

              {/* Chevron */}
              <FontAwesome5
                name="chevron-right"
                size={16}
                color={colors.tabIconDefault}
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
    </SafeAreaView>
  );
}
