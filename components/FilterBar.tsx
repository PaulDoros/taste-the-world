import { View, Text, ScrollView, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { GlassButton } from '@/components/ui/GlassButton';
import { IS_ANDROID } from '@/constants/platform';

/**
 * FilterBar Component
 * Modern horizontal filter chips using GlassButton
 */

type RegionFilter =
  | 'All'
  | 'Africa'
  | 'Americas'
  | 'Asia'
  | 'Europe'
  | 'Oceania';
type PremiumFilter = 'All' | 'Free' | 'Premium';

interface FilterBarProps {
  selectedRegion: RegionFilter;
  selectedPremium: PremiumFilter;
  onRegionChange: (region: RegionFilter) => void;
  onPremiumChange: (premium: PremiumFilter) => void;
  onClearAll: () => void;
}

// Region color palette (vibrant, distinct colors)
const REGION_COLORS = {
  All: '#64748b', // Slate gray
  Africa: '#f97316', // Vibrant orange
  Americas: '#16a34a', // Emerald green
  Asia: '#dc2626', // Red
  Europe: '#2563eb', // Blue
  Oceania: '#0891b2', // Cyan/Teal
};

export const FilterBar = ({
  selectedRegion,
  selectedPremium,
  onRegionChange,
  onPremiumChange,
  onClearAll,
}: FilterBarProps) => {
  const colorScheme = useColorScheme();
  const isAndroid = IS_ANDROID;
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const hasActiveFilters =
    selectedRegion !== 'All' || selectedPremium !== 'All';
  const chipActiveShadow = isAndroid ? 0.24 : 0.7;
  const chipInactiveShadow = isAndroid ? 0.08 : 0.3;
  const chipShadowRadius = isAndroid ? 4 : 2;

  const regions: {
    label: string;
    value: RegionFilter;
    icon: string;
    color: string;
  }[] = [
    {
      label: t('filter_region_all'),
      value: 'All',
      icon: 'globe',
      color: REGION_COLORS.All,
    },
    {
      label: t('filter_region_africa'),
      value: 'Africa',
      icon: 'sun',
      color: REGION_COLORS.Africa,
    },
    {
      label: t('filter_region_americas'),
      value: 'Americas',
      icon: 'flag-usa',
      color: REGION_COLORS.Americas,
    },
    {
      label: t('filter_region_asia'),
      value: 'Asia',
      icon: 'yin-yang',
      color: REGION_COLORS.Asia,
    },
    {
      label: t('filter_region_europe'),
      value: 'Europe',
      icon: 'landmark',
      color: REGION_COLORS.Europe,
    },
    {
      label: t('filter_region_oceania'),
      value: 'Oceania',
      icon: 'water',
      color: REGION_COLORS.Oceania,
    },
  ];

  const premiumFilters: {
    label: string;
    value: PremiumFilter;
    icon: string;
    color: string;
  }[] = [
    {
      label: t('filter_premium_all'),
      value: 'All',
      icon: 'star',
      color: colors.tint,
    },
    {
      label: t('filter_premium_free'),
      value: 'Free',
      icon: 'gift',
      color: '#10b981',
    },
    {
      label: t('filter_premium_premium'),
      value: 'Premium',
      icon: 'crown',
      color: '#9333ea',
    },
  ];

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Header with Clear All button */}
      {hasActiveFilters && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: '600',
              opacity: 0.7,
            }}
          >
            {t('filter_active')}
          </Text>
          <Pressable onPress={onClearAll}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: `${colors.tint}15`,
                borderRadius: 12,
              }}
            >
              <FontAwesome5 name="times-circle" size={12} color={colors.tint} />
              <Text
                style={{
                  color: colors.tint,
                  fontSize: 12,
                  fontWeight: '600',
                  marginLeft: 6,
                }}
              >
                {t('filter_clear_all')}
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Region Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 16,
          paddingRight: 24,
          paddingVertical: 8,
          gap: 10,
        }}
      >
        {regions.map((region) => {
          const isActive = selectedRegion === region.value;
          return (
            <GlassButton
              key={region.value}
              label={region.label}
              icon={region.icon}
              shadowRadius={chipShadowRadius}
              onPress={() => onRegionChange(region.value)}
              size="small"
              // Active: Solid color, White text
              // Inactive: Tinted BG, Colored text
              backgroundColor={isActive ? region.color : `${region.color}15`}
              textColor={isActive ? '#FFFFFF' : region.color}
              backgroundOpacity={isActive ? 0.9 : 0.8} // Slightly more solid for active
              shadowOpacity={isActive ? chipActiveShadow : chipInactiveShadow}
            />
          );
        })}
      </ScrollView>

      {/* Premium Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 16,
          paddingRight: 24,
          paddingVertical: 8,
          gap: 10,
        }}
      >
        {premiumFilters.map((filter) => {
          const isActive = selectedPremium === filter.value;
          return (
            <GlassButton
              key={filter.value}
              label={filter.label}
              icon={filter.icon}
              onPress={() => onPremiumChange(filter.value)}
              size="small"
              shadowRadius={chipShadowRadius}
              backgroundColor={isActive ? filter.color : `${filter.color}15`}
              textColor={isActive ? '#FFFFFF' : filter.color}
              backgroundOpacity={isActive ? 0.9 : 0.8}
              shadowOpacity={isActive ? chipActiveShadow : chipInactiveShadow}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};
