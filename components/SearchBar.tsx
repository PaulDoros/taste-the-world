import { View, TextInput, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/**
 * SearchBar Component
 * Modern search input with animated focus states
 * Follows iOS & Material Design patterns
 */

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}: SearchBarProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isFocused = useSharedValue(false);

  // Animation for search bar scaling
  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(isFocused.value ? 1.01 : 1, { duration: 200 }),
      },
    ],
  }));

  const handleFocus = () => {
    isFocused.value = true;
  };

  const handleBlur = () => {
    isFocused.value = false;
  };

  const clearSearch = () => {
    onChangeText('');
  };

  return (
    <Animated.View
      style={[
        {
          marginHorizontal: 16,
          marginBottom: 16,
        },
        searchAnimatedStyle,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 2,
          borderColor: isFocused.value ? colors.tint : 'transparent',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused.value ? 0.08 : 0.03,
          shadowRadius: isFocused.value ? 12 : 4,
          elevation: isFocused.value ? 4 : 2,
        }}
      >
        {/* Search Icon */}
        <FontAwesome5
          name="search"
          size={16}
          color={isFocused.value ? colors.tint : colors.text}
          style={{ opacity: isFocused.value ? 1 : 0.4 }}
        />

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={`${colors.text}60`}
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 16,
            color: colors.text,
            fontWeight: '500',
          }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
        />

        {/* Clear Button */}
        {value.length > 0 && (
          <Pressable onPress={clearSearch} hitSlop={8}>
            <View
              style={{
                backgroundColor: `${colors.tint}20`,
                borderRadius: 12,
                padding: 6,
              }}
            >
              <FontAwesome5 name="times" size={12} color={colors.tint} />
            </View>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};
