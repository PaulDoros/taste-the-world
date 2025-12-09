import { Text, Image, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Country } from '@/types';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animated style for press effect
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Handle press in - Snappier for better feel
  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      // Less scale (was 0.95)
      damping: 12, // More responsive (was 15)
      stiffness: 250, // Faster (was 150)
    });
    opacity.value = withTiming(0.85, { duration: 100 }); // Faster (was 150ms)
  };

  // Handle press out
  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 250,
    });
    opacity.value = withTiming(1, { duration: 100 });
  };

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

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          marginBottom: 16,
        }}
      >
        {/* Flag Section */}
        <View style={{ height: 200, position: 'relative' }}>
          <Image
            source={{ uri: country.flags.png }}
            style={{
              width: '100%',
              height: '100%',
              opacity: isLocked ? 0.6 : 1,
            }}
            resizeMode="cover"
          />

          {/* Stronger Gradient Overlay */}
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
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: 16,
                  borderRadius: 40,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <FontAwesome5 name="lock" size={24} color="white" />
              </View>
            </View>
          )}

          {/* Premium Badge - Top Right */}
          {isPremium && !isLocked && (
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: '#9333ea',
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#9333ea',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <FontAwesome5 name="crown" size={12} color="#fbbf24" />
              <Text
                style={{
                  color: 'white',
                  fontSize: 11,
                  fontWeight: '700',
                  marginLeft: 4,
                  letterSpacing: 0.5,
                }}
              >
                {t('common_pro')}
              </Text>
            </View>
          )}

          {/* Country Name - Bottom */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '700',
                letterSpacing: 0.3,
                textShadowColor: 'rgba(0, 0, 0, 0.9)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
                opacity: isLocked ? 0.8 : 1,
              }}
            >
              {country.name.common}
            </Text>

            {/* Region Tag */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.5,
                  }}
                >
                  {country.region}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Info - Cleaner */}
        <View
          style={{
            padding: 12,
            backgroundColor: colors.card,
            opacity: isLocked ? 0.6 : 1,
          }}
        >
          {/* Capital & Population Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Capital */}
            {country.capital && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: `${colors.tint}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5
                    name="map-marker"
                    size={12}
                    color={colors.tint}
                  />
                </View>
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 11,
                      opacity: 0.6,
                      fontWeight: '500',
                    }}
                  >
                    {t('common_capital')}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.text,
                      fontSize: 13,
                      fontWeight: '600',
                      marginTop: 1,
                    }}
                  >
                    {country.capital[0]}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Population */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <FontAwesome5 name="users" size={11} color={colors.tint} />
            <Text
              style={{
                color: colors.text,
                fontSize: 12,
                marginLeft: 6,
                opacity: 0.7,
                fontWeight: '500',
              }}
            >
              {formatPopulation(country.population)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};
