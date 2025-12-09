import { XStack, Card, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export interface FilterChip {
  id: string;
  label: string;
  icon?: string;
}

export interface FilterChipGroupProps {
  filters: FilterChip[];
  selectedFilters: string[];
  onToggle: (filterId: string) => void;
  accentColor?: string;
  multiSelect?: boolean;
}

/**
 * Reusable FilterChipGroup component for displaying filter chips
 * Supports single or multi-select mode
 */
export function FilterChipGroup({
  filters,
  selectedFilters,
  onToggle,
  accentColor,
  multiSelect = true,
}: FilterChipGroupProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const finalAccentColor = accentColor || colors.tint;
  const isSelected = (filterId: string) => selectedFilters.includes(filterId);

  return (
    <XStack gap="$2" flexWrap="wrap">
      {filters.map((filter, index) => {
        const selected = isSelected(filter.id);

        return (
          <Animated.View
            key={filter.id}
            entering={FadeInDown.delay(index * 30).springify()}
          >
            <Card
              bordered
              padding="$2.5"
              paddingHorizontal="$3.5"
              backgroundColor={selected ? finalAccentColor : '$card'}
              borderColor={selected ? finalAccentColor : '$borderColor'}
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              onPress={() => {
                haptics.selection();
                onToggle(filter.id);
              }}
            >
              <XStack alignItems="center" gap="$2">
                {filter.icon && (
                  <FontAwesome5
                    name={filter.icon}
                    size={12}
                    color={selected ? 'white' : finalAccentColor}
                  />
                )}
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color={selected ? 'white' : '$color'}
                >
                  {filter.label}
                </Text>
              </XStack>
            </Card>
          </Animated.View>
        );
      })}
    </XStack>
  );
}
