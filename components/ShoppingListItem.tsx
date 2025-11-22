import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { UnifiedShoppingListItem } from '@/hooks/useShoppingList';
import { canConvert, getConvertedDisplay } from '@/utils/measurementConverter';

interface ShoppingListItemProps {
  item: UnifiedShoppingListItem;
  index: number;
  showConversion: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMoveToPantry: () => void;
  onNavigateToRecipe: () => void;
  colors: typeof Colors.light;
}

export const ShoppingListItem = ({
  item,
  index,
  showConversion,
  onToggle,
  onDelete,
  onMoveToPantry,
  onNavigateToRecipe,
  colors,
}: ShoppingListItemProps) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={{
        marginBottom: 12,
      }}
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
          opacity: item.checked ? 0.6 : 1,
        }}
      >
        {/* Checkbox */}
        <Pressable
          onPress={onToggle}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: item.checked ? colors.tint : colors.border,
            backgroundColor: item.checked ? colors.tint : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          {item.checked && (
            <FontAwesome5 name="check" size={14} color="white" />
          )}
        </Pressable>

        {/* Content */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              textDecorationLine: item.checked ? 'line-through' : 'none',
              opacity: item.checked ? 0.6 : 1,
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                opacity: 0.6,
              }}
            >
              {showConversion && canConvert(item.measure)
                ? getConvertedDisplay(item.measure)
                : item.measure}
            </Text>
            
            {item.recipeName && item.recipeName !== 'Custom Item' && (
              <>
                <Text style={{ color: colors.text, opacity: 0.4, marginHorizontal: 6 }}>•</Text>
                <Pressable onPress={onNavigateToRecipe}>
                  <Text 
                    style={{ 
                      color: colors.tint, 
                      fontSize: 13, 
                      fontWeight: '500' 
                    }}
                    numberOfLines={1}
                  >
                    {item.recipeName}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={onMoveToPantry}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
              marginRight: 4,
            })}
          >
            <FontAwesome5 name="box" size={16} color={colors.text} style={{ opacity: 0.4 }} />
          </Pressable>
          
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <FontAwesome5 name="trash-alt" size={16} color={colors.error} style={{ opacity: 0.6 }} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};
