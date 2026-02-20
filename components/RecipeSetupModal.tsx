import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { IS_IOS } from '@/constants/platform';

export type CookingStyle = 'quick' | 'family' | 'gourmet';
export type IngredientSource = 'random' | 'pantry';

interface RecipeSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (config: {
    style: CookingStyle;
    cuisine: string;
    source: IngredientSource;
    ingredients?: string[];
  }) => void;
  pantryItems?: any[];
  initialSource?: IngredientSource;
}

export const RecipeSetupModal: React.FC<RecipeSetupModalProps> = ({
  visible,
  onClose,
  onGenerate,
  pantryItems = [],
  initialSource = 'random',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [style, setStyle] = useState<CookingStyle>('family');
  const [cuisine, setCuisine] = useState('');
  const [source, setSource] = useState<IngredientSource>(initialSource);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Reset or sync source when modal opens
  React.useEffect(() => {
    if (visible) {
      setSource(initialSource);
    }
  }, [visible, initialSource]);

  const handleGenerate = () => {
    haptics.success();
    onGenerate({
      style,
      cuisine: cuisine.trim() || 'Any',
      source,
      ingredients: source === 'pantry' ? selectedIngredients : [],
    });
    onClose();
  };

  const toggleIngredient = (name: string) => {
    haptics.selection();
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const toggleAll = () => {
    if (selectedIngredients.length === pantryItems.length) {
      setSelectedIngredients([]);
    } else {
      setSelectedIngredients(pantryItems.map((i) => i.name));
    }
  };

  const styles = [
    {
      id: 'quick',
      title: 'Quick Bite',
      icon: 'stopwatch',
      desc: '< 15 mins, 5 ingredients',
    },
    {
      id: 'family',
      title: 'Family Dinner',
      icon: 'utensils',
      desc: '~45 mins, 10 ingredients',
    },
    {
      id: 'gourmet',
      title: 'Gourmet',
      icon: 'star',
      desc: '1+ hour, unlimited',
    },
  ];

  const cuisines = ['Italian', 'Mexican', 'Asian', 'Healthy', 'Vegetarian'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={IS_IOS ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
          <Animated.View
            entering={FadeInDown.springify()}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              paddingBottom: 40,
              maxHeight: '90%',
            }}
          >
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

            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 20,
              }}
            >
              Chef's Table 👨‍🍳
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Cooking Style */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Cooking Style
              </Text>
              <View style={{ gap: 10, marginBottom: 24 }}>
                {styles.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      haptics.light();
                      setStyle(s.id as CookingStyle);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor:
                        style === s.id ? `${colors.tint}15` : colors.background,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: style === s.id ? colors.tint : 'transparent',
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor:
                          style === s.id ? colors.tint : `${colors.text}10`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}
                    >
                      <FontAwesome5
                        name={s.icon}
                        size={18}
                        color={style === s.id ? 'white' : colors.text}
                      />
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: colors.text,
                        }}
                      >
                        {s.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.text,
                          opacity: 0.6,
                        }}
                      >
                        {s.desc}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Cuisine */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Cuisine / Theme
              </Text>
              <TextInput
                placeholder="e.g. Spicy Thai, Comfort Food..."
                placeholderTextColor={colors.tabIconDefault}
                value={cuisine}
                onChangeText={setCuisine}
                style={{
                  backgroundColor: colors.background,
                  padding: 16,
                  borderRadius: 16,
                  color: colors.text,
                  fontSize: 16,
                  marginBottom: 12,
                }}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 24 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {cuisines.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => {
                      haptics.light();
                      setCuisine(c);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor:
                        cuisine === c ? colors.tint : colors.background,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: cuisine === c ? colors.tint : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: cuisine === c ? 'white' : colors.text,
                        fontWeight: '600',
                      }}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Ingredient Source */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Ingredients
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <Pressable
                  onPress={() => setSource('random')}
                  style={{
                    flex: 1,
                    padding: 16,
                    backgroundColor:
                      source === 'random'
                        ? `${colors.tint}15`
                        : colors.background,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor:
                      source === 'random' ? colors.tint : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <FontAwesome5
                    name="dice"
                    size={24}
                    color={source === 'random' ? colors.tint : colors.text}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      fontWeight: '600',
                      color: source === 'random' ? colors.tint : colors.text,
                    }}
                  >
                    Random
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setSource('pantry')}
                  style={{
                    flex: 1,
                    padding: 16,
                    backgroundColor:
                      source === 'pantry'
                        ? `${colors.tint}15`
                        : colors.background,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor:
                      source === 'pantry' ? colors.tint : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <FontAwesome5
                    name="carrot"
                    size={24}
                    color={source === 'pantry' ? colors.tint : colors.text}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      fontWeight: '600',
                      color: source === 'pantry' ? colors.tint : colors.text,
                    }}
                  >
                    Use Pantry
                  </Text>
                </Pressable>
              </View>

              {/* Pantry Selection */}
              {source === 'pantry' && (
                <View style={{ marginBottom: 24 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.text,
                        opacity: 0.6,
                      }}
                    >
                      Select Items ({selectedIngredients.length})
                    </Text>
                    <Pressable onPress={toggleAll}>
                      <Text
                        style={{
                          color: colors.tint,
                          fontWeight: '600',
                          fontSize: 14,
                        }}
                      >
                        {selectedIngredients.length === pantryItems.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Text>
                    </Pressable>
                  </View>

                  {pantryItems.length === 0 ? (
                    <Text
                      style={{
                        color: colors.text,
                        opacity: 0.5,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: 20,
                      }}
                    >
                      Your pantry is empty!
                    </Text>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      {pantryItems.map((item) => {
                        const isSelected = selectedIngredients.includes(
                          item.name
                        );
                        return (
                          <Pressable
                            key={item._id}
                            onPress={() => toggleIngredient(item.name)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 20,
                              backgroundColor: isSelected
                                ? colors.tint
                                : colors.background,
                              borderWidth: 1,
                              borderColor: isSelected
                                ? colors.tint
                                : colors.border,
                            }}
                          >
                            <Text
                              style={{
                                color: isSelected ? 'white' : colors.text,
                                fontSize: 14,
                                fontWeight: isSelected ? '600' : '400',
                              }}
                            >
                              {item.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {/* Generate Button */}
              <Pressable
                onPress={handleGenerate}
                style={({ pressed }) => ({
                  backgroundColor: colors.tint,
                  padding: 20,
                  borderRadius: 20,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                  marginBottom: 20,
                })}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: '700',
                  }}
                >
                  Start Cooking 🍳
                </Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
