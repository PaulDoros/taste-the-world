import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Ingredient } from '@/types';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { canConvert, getConvertedDisplay } from '@/utils/measurementConverter';
import { useLanguage } from '@/context/LanguageContext';

interface IngredientSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedIngredients: Ingredient[]) => void;
  ingredients: Ingredient[];
  title: string;
  description: string;
  confirmText: string;
  confirmColor: string;
  icon: string;
  iconColor: string;
  showPantryIndicator?: boolean;
  pantryIngredients?: Set<string>;
  showConversions?: boolean;
}

export const IngredientSelectorModal: React.FC<
  IngredientSelectorModalProps
> = ({
  visible,
  onClose,
  onConfirm,
  ingredients,
  title,
  description,
  confirmText,
  confirmColor,
  icon,
  iconColor,
  showPantryIndicator = false,
  pantryIngredients = new Set(),
  showConversions = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(
    new Set()
  );

  const toggleIngredient = (index: number) => {
    haptics.light();
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIngredients(newSelected);
  };

  const selectAll = () => {
    haptics.light();
    const allIndices = new Set(ingredients.map((_, index) => index));
    setSelectedIngredients(allIndices);
  };

  const deselectAll = () => {
    haptics.light();
    setSelectedIngredients(new Set());
  };

  const handleConfirm = () => {
    const selected = ingredients.filter((_, index) =>
      selectedIngredients.has(index)
    );
    if (selected.length > 0) {
      haptics.success();
      onConfirm(selected);
      setSelectedIngredients(new Set()); // Reset selection
      onClose();
    } else {
      haptics.warning();
    }
  };

  const handleClose = () => {
    haptics.light();
    setSelectedIngredients(new Set()); // Reset selection
    onClose();
  };

  const selectedCount = selectedIngredients.size;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'flex-end',
        }}
      >
        {/* Close on backdrop tap */}
        <Pressable style={{ flex: 1 }} onPress={handleClose} />

        {/* Modal Content */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 24,
            paddingHorizontal: 20,
            paddingBottom: 40,
            maxHeight: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Drag Handle */}
          <View
            style={{
              width: 40,
              height: 5,
              backgroundColor: colors.text,
              opacity: 0.2,
              borderRadius: 3,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                backgroundColor: `${iconColor}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <FontAwesome5 name={icon} size={20} color={iconColor} solid />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text,
                  opacity: 0.6,
                }}
              >
                {description}
              </Text>
            </View>
          </View>

          {/* Select All / Deselect All */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: colors.background,
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              {t('ingredient_modal_selected_count', {
                selected: selectedCount,
                total: ingredients.length,
              })}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={selectAll}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: pressed
                    ? `${colors.tint}20`
                    : `${colors.tint}10`,
                })}
              >
                <Text
                  style={{
                    color: colors.tint,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {t('ingredient_modal_select_all')}
                </Text>
              </Pressable>
              {selectedCount > 0 && (
                <Pressable
                  onPress={deselectAll}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: pressed
                      ? `${colors.text}10`
                      : `${colors.text}05`,
                  })}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 12,
                      fontWeight: '600',
                      opacity: 0.6,
                    }}
                  >
                    {t('ingredient_modal_clear')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Ingredients List */}
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ gap: 10 }}>
              {ingredients.map((ingredient, index) => {
                const isSelected = selectedIngredients.has(index);
                const isInPantry =
                  showPantryIndicator && pantryIngredients.has(ingredient.name);

                return (
                  <IngredientCheckboxItem
                    key={index}
                    ingredient={ingredient}
                    isSelected={isSelected}
                    isInPantry={isInPantry}
                    showConversion={showConversions}
                    onToggle={() => toggleIngredient(index)}
                    colors={colors}
                    confirmColor={confirmColor}
                    t={t}
                  />
                );
              })}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 20,
            }}
          >
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: colors.background,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  color: colors.text,
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                {t('ingredient_modal_cancel')}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={selectedCount === 0}
              style={({ pressed }) => ({
                flex: 2,
                backgroundColor:
                  selectedCount === 0 ? `${confirmColor}40` : confirmColor,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                opacity: pressed && selectedCount > 0 ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {confirmText} {selectedCount > 0 ? `(${selectedCount})` : ''}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Individual Ingredient Checkbox Item
 */
interface IngredientCheckboxItemProps {
  ingredient: Ingredient;
  isSelected: boolean;
  isInPantry: boolean;
  showConversion: boolean;
  onToggle: () => void;
  colors: any;
  confirmColor: string;
  t: any;
}

const IngredientCheckboxItem: React.FC<IngredientCheckboxItemProps> = ({
  ingredient,
  isSelected,
  isInPantry,
  showConversion,
  onToggle,
  colors,
  confirmColor,
  t,
}) => {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isSelected ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    checkScale.value = withSpring(isSelected ? 0 : 1, {
      damping: 12,
      stiffness: 300,
    });
  };

  React.useEffect(() => {
    checkScale.value = withSpring(isSelected ? 1 : 0, {
      damping: 12,
      stiffness: 300,
    });
  }, [isSelected]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isSelected
            ? `${confirmColor}10`
            : isInPantry
              ? '#f59e0b10'
              : colors.background,
          padding: 14,
          borderRadius: 14,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected
            ? confirmColor
            : isInPantry
              ? '#f59e0b30'
              : `${colors.text}10`,
        }}
      >
        {/* Checkbox */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: isSelected ? confirmColor : `${colors.text}30`,
            backgroundColor: isSelected ? confirmColor : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          {isSelected && (
            <Animated.View style={checkAnimatedStyle}>
              <FontAwesome5 name="check" size={12} color="white" solid />
            </Animated.View>
          )}
        </View>

        {/* Ingredient Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: '600',
                flex: 1,
              }}
            >
              {ingredient.name}
            </Text>
            {isInPantry && (
              <View
                style={{
                  backgroundColor: '#f59e0b',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: '700',
                  }}
                >
                  {t('ingredient_modal_in_pantry')}
                </Text>
              </View>
            )}
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 13,
                opacity: 0.6,
                fontWeight: '500',
              }}
            >
              {ingredient.measure}
            </Text>
            {showConversion && canConvert(ingredient.measure) && (
              <Text
                style={{
                  color: confirmColor,
                  fontSize: 12,
                  fontWeight: '600',
                  marginLeft: 8,
                }}
              >
                ≈ {getConvertedDisplay(ingredient.measure)}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};
