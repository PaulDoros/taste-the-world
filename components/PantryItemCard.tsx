import { View, Text, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { PantryItem } from '@/store/pantryStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface PantryItemCardProps {
  item: PantryItem;
  index: number;
  onDelete: () => void;
}

export const PantryItemCard = ({
  item,
  index,
  onDelete,
}: PantryItemCardProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={[
        {
          marginBottom: 12,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.tint + '15',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <FontAwesome5
            name="check-circle"
            size={18}
            color={colors.tint}
            solid
          />
        </View>

        {/* Item Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {item.displayName}
          </Text>
          <Text
            style={{
              color: colors.tint,
              fontSize: 13,
              fontWeight: '600',
              marginTop: 2,
            }}
          >
            {item.measure}
          </Text>
        </View>

        {/* Delete Button */}
        <Pressable
          onPress={onDelete}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.error + '15',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <FontAwesome5 name="trash-alt" size={14} color={colors.error} />
        </Pressable>
      </View>
    </Animated.View>
  );
};
