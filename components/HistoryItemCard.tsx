import { View, Text, Pressable, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { RecipeHistoryItem } from '@/store/recipeHistoryStore';
import { haptics } from '@/utils/haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface HistoryItemCardProps {
  item: RecipeHistoryItem;
  index: number;
  onPress: () => void;
  onRemove: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  getTimeAgo: (timestamp: number) => string;
}

export const HistoryItemCard = ({
  item,
  index,
  onPress,
  onRemove,
  isFavorited,
  onToggleFavorite,
  getTimeAgo,
}: HistoryItemCardProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={{ marginBottom: 12 }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
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
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {/* Recipe Image */}
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: colors.background,
            marginRight: 14,
          }}
        >
          <Image
            source={{ uri: item.image }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        {/* Recipe Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 6,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <FontAwesome5 name="globe" size={11} color={colors.tint} />
              <Text
                style={{
                  color: colors.tint,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {item.area}
              </Text>
            </View>
            <Text style={{ color: colors.text, opacity: 0.3 }}>•</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <FontAwesome5 name="tag" size={11} color="#fbbf24" />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 12,
                  opacity: 0.6,
                  fontWeight: '500',
                }}
              >
                {item.category}
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 12,
              opacity: 0.5,
              fontWeight: '500',
            }}
          >
            {getTimeAgo(item.timestamp)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 8, marginLeft: 12 }}>
          {/* Favorite Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              haptics.light();
              onToggleFavorite();
            }}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isFavorited ? '#ec489915' : `${colors.text}10`,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5
              name="heart"
              size={14}
              color={isFavorited ? '#ec4899' : colors.text}
              solid={isFavorited}
            />
          </Pressable>

          {/* Delete Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
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
      </Pressable>
    </Animated.View>
  );
};
