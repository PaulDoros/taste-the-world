import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { YStack, H3, XStack, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassButton } from '@/components/ui/GlassButton';

interface RecipeDetailHeaderProps {
  recipe: any;
  colors: any;
  onBack: () => void;
  onEdit: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  t: (key: any) => string;
}

export const RecipeDetailHeader = ({
  recipe,
  colors,
  onBack,
  onEdit,
  isFavorite,
  onToggleFavorite,
  t,
}: RecipeDetailHeaderProps) => {
  return (
    <View style={{ height: 300, width: '100%', position: 'relative' }}>
      {recipe.imageUrl ? (
        <Image
          source={{ uri: recipe.imageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesome5
            name="utensils"
            size={64}
            color={colors.text}
            opacity={0.2}
          />
        </View>
      )}
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 160,
        }}
      />
      <SafeAreaView
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        edges={['top']}
      >
        <XStack justifyContent="space-between" padding="$4">
          <GlassButton
            size="small"
            icon="arrow-left"
            backgroundColor="white"
            textColor="black"
            onPress={onBack}
            // Enhance visibility on potential light images if header is transparent
            backgroundOpacity={0.9}
          />
          <XStack gap="$3">
            <GlassButton
              size="small"
              icon={isFavorite ? 'heart' : 'heart'}
              iconComponent={
                <FontAwesome5
                  name="heart"
                  size={16}
                  color={isFavorite ? colors.error : 'black'}
                  solid={isFavorite}
                />
              }
              backgroundColor="white"
              textColor="black"
              onPress={onToggleFavorite}
              backgroundOpacity={0.9}
            />
            <GlassButton
              size="small"
              icon="pen"
              backgroundColor="white"
              textColor="black"
              onPress={onEdit}
              backgroundOpacity={0.9}
            />
          </XStack>
        </XStack>
      </SafeAreaView>

      <YStack position="absolute" bottom="$4" left="$4" right="$4">
        <H3 color="white" fontWeight="bold">
          {recipe.title}
        </H3>
        {recipe.source === 'scan' && (
          <XStack
            backgroundColor={colors.tint} // Used theme tint instead of hardcoded blue
            alignSelf="flex-start"
            paddingHorizontal="$2"
            borderRadius="$2"
            marginTop="$2"
          >
            <Text color="white" fontSize="$1" fontWeight="bold">
              {t('recipe_ai_scanned')}
            </Text>
          </XStack>
        )}
      </YStack>
    </View>
  );
};
