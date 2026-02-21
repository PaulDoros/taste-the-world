import React from 'react';
import { Image } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { FadeInImage } from '@/components/ui/FadeInImage';

interface RecipeBookCardProps {
  item: any;
  colors: any;
  onPress: () => void;
  onDelete: (id: any) => void;
}

export const RecipeBookCard = ({
  item,
  colors,
  onPress,
  onDelete,
}: RecipeBookCardProps) => {
  return (
    <YStack onPress={onPress}>
      <GlassCard
        shadowRadius={2}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ padding: 0, overflow: 'hidden' }}
      >
        {item.imageUrl && (
          <FadeInImage
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: 150 }}
            resizeMode="cover"
          />
        )}
        <YStack padding="$3" gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$5" fontWeight="bold" color={colors.text}>
              {item.title}
            </Text>
            {item.source === 'scan' && (
              <XStack
                backgroundColor={colors.tint}
                paddingHorizontal="$2"
                borderRadius="$2"
              >
                <Text fontSize="$1" color="white">
                  Scanned
                </Text>
              </XStack>
            )}
          </XStack>
          {item.description && (
            <Text
              fontSize="$3"
              color={colors.text}
              opacity={0.7}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}
          <XStack
            justifyContent="space-between"
            marginTop="$2"
            alignItems="center"
          >
            <Text fontSize="$2" color={colors.text} opacity={0.5}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <GlassButton
              shadowRadius={2}
              size="small"
              backgroundColor="transparent"
              icon="trash"
              textColor="#EF4444" // red-500
              onPress={() => onDelete(item._id)}
            />
          </XStack>
        </YStack>
      </GlassCard>
    </YStack>
  );
};
