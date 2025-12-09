import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { YStack, XStack, Text, Input, Button, Card, Avatar } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';

import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import {
  RecipeSetupModal,
  CookingStyle,
  IngredientSource,
} from '@/components/RecipeSetupModal';
import { CountrySelectorModal } from '@/components/CountrySelectorModal';
import { Country } from '@/types';
import { ChatHistoryModal } from '@/components/ChatHistoryModal';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { useTierLimit } from '@/hooks/useTierLimit';

// Local assets
const CHEF_AVATAR = require('@/assets/images/chef-avatar.png');
const TRAVEL_AVATAR = require('@/assets/images/travel-avatar.png');

export default function ChefScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user: currentUser, token, signOut, tier } = useAuth();
  const { t, language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [mode, setMode] = useState<'chef' | 'travel'>('chef');
  const [showRecipeSetup, setShowRecipeSetup] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<
    Id<'chats'> | null | undefined
  >(undefined);
  const [modalInitialSource, setModalInitialSource] =
    useState<IngredientSource>('random');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  // Reset selected chat when mode changes
  useEffect(() => {
    setSelectedChatId(undefined);
  }, [mode]);

  // Fetch pantry items
  const pantryItems =
    useQuery(api.pantry.getPantryItems, token ? { token } : 'skip') || [];

  // Fetch chats filtered by mode
  const chats =
    useQuery(api.chat.getChats, token ? { token, mode } : 'skip') || [];
  const currentChatId =
    selectedChatId === null
      ? undefined
      : selectedChatId || (chats.length > 0 ? chats[0]._id : undefined);

  // Fetch messages for the current chat
  const messages =
    useQuery(
      api.chat.getMessages,
      currentChatId && token ? { chatId: currentChatId, token } : 'skip'
    ) || [];

  const sendMessage = useAction(api.ai.sendMessage);

  // Quota & Tier Limit
  const { usage } = useTierLimit();

  const isUnlimited = usage?.aiLimit === -1;
  const remainingPrompts = isUnlimited
    ? '∞'
    : Math.max(0, usage?.remainingAi || 0);

  // Animation for tab indicator
  const tabPosition = useSharedValue(0);

  useEffect(() => {
    tabPosition.value = withSpring(mode === 'chef' ? 0 : 1, {
      damping: 20,
      stiffness: 150,
    });
  }, [mode]);

  const animatedTabStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPosition.value * 100 }], // Adjust 100 based on width
    };
  });

  // Quick Action Animations
  const activeQuickAction = useSharedValue<number | null>(null);
  const quickActionAnim = useSharedValue(0);

  useEffect(() => {
    const triggerAnimation = () => {
      // Randomly select one of the 3 buttons (0, 1, 2)
      const randomIndex = Math.floor(Math.random() * 3);
      activeQuickAction.value = randomIndex;

      // Reset animation value
      quickActionAnim.value = 0;

      // Trigger bounce/shake
      quickActionAnim.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withRepeat(withTiming(5, { duration: 100 }), 3, true),
        withTiming(0, { duration: 100 })
      );

      // Schedule next animation (random between 5s and 10s)
      const nextDelay = Math.random() * 5000 + 5000;
      timeoutId = setTimeout(triggerAnimation, nextDelay);
    };

    let timeoutId = setTimeout(triggerAnimation, 2000); // Start after 2s

    return () => clearTimeout(timeoutId);
  }, []);

  const handleRecipeGenerate = (config: {
    style: CookingStyle;
    cuisine: string;
    source: IngredientSource;
    ingredients?: string[];
  }) => {
    let prompt = `I want to cook a ${config.style} meal. `;

    if (config.style === 'quick')
      prompt +=
        'It should be ready in under 15 minutes with max 5 ingredients. ';
    if (config.style === 'family')
      prompt += 'It should be a nice family dinner (~45 mins). ';
    if (config.style === 'gourmet')
      prompt += 'I want a full gourmet experience (1+ hour). ';

    prompt += `The cuisine/style should be ${config.cuisine}. `;

    if (config.source === 'pantry') {
      if (pantryItems.length === 0) {
        prompt +=
          'I wanted to use my pantry, but it seems empty. Please suggest a recipe with common ingredients.';
      } else {
        // Use selected ingredients if available, otherwise use all pantry items
        const ingredientsToUse =
          config.ingredients && config.ingredients.length > 0
            ? config.ingredients.join(', ')
            : pantryItems.map((i: any) => i.name).join(', ');
        prompt += `I have these ingredients in my pantry: ${ingredientsToUse}. Please use some of them.`;
      }
    } else {
      prompt += 'Please suggest the ingredients.';
    }

    // JSON requirement is now enforced by the backend (hidden context)
    // so we don't need to append it here, keeping the chat clean.

    handleSend(prompt);
  };

  const handleCountrySelect = (country: Country) => {
    const prompt = t('chef_prompt_country', {
      country: country.name.common,
      region: country.region,
    });
    // @ts-ignore - language param is not yet typed in the mutation hook locally but validated in convex
    handleSend(prompt, 'travel');
  };

  const handleSend = async (
    text: string = inputText,
    overrideMode?: 'chef' | 'travel'
  ) => {
    if (!text.trim()) return;
    if (!token) {
      alert(t('chef_warning_login'));
      return;
    }

    haptics.medium();
    const content = text.trim();
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    const modeToSend = overrideMode || mode;

    // Optimistic Update
    const tempId = Date.now().toString();
    const optimisticMsg = {
      _id: tempId,
      role: 'user',
      content: content,
      createdAt: Date.now(),
      isOptimistic: true,
    };
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);

    try {
      const response = await sendMessage({
        chatId: currentChatId,
        content,
        token,
        mode: modeToSend,
        language: language,
      });

      // Correcting the sendMessage call inside try block below

      if (response && response.chatId && !currentChatId) {
        setSelectedChatId(response.chatId);
      }
      haptics.success();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      haptics.error();
      // Remove optimistic message on error
      setOptimisticMessages((prev) => prev.filter((m) => m._id !== tempId));

      if (error.message && error.message.includes('AI_QUOTA_EXCEEDED')) {
        Alert.alert(
          t('chef_warning_quota_title'),
          tier === 'guest'
            ? t('chef_warning_quota_guest')
            : t('chef_warning_quota_free'),
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text:
                tier === 'guest'
                  ? t('chef_warning_quota_signup')
                  : t('chef_warning_quota_upgrade'),
              onPress: () => router.push('/auth/login'),
            },
          ]
        );
      } else {
        alert(t('chef_error_send'));
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      // Clear optimistic message (Convex should have updated by now)
      setOptimisticMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  // Deduplicate optimistic messages: if a real message has the same content, remove the optimistic one
  useEffect(() => {
    if (messages.length > 0 && optimisticMessages.length > 0) {
      const lastRealMessage = messages[messages.length - 1];
      setOptimisticMessages((prev) =>
        prev.filter((optMsg) => optMsg.content !== lastRealMessage.content)
      );
    }
  }, [messages, optimisticMessages]);

  const handleNewChat = async () => {
    haptics.medium();
    Alert.alert(t('chef_alert_new_chat_title'), t('chef_alert_new_chat_msg'), [
      { text: t('chef_alert_cancel'), style: 'cancel' },
      {
        text: t('chef_alert_start_new'),
        onPress: async () => {
          haptics.success();
          setSelectedChatId(null);
        },
      },
    ]);
  };

  const handleQuickAction = (action: string) => {
    let prompt = '';
    switch (action) {
      case 'random':
        prompt = t('chef_prompt_random');
        break;
      case 'pantry':
        setModalInitialSource('pantry');
        setShowRecipeSetup(true);
        return; // Don't send immediate message, let modal handle it
      case 'surprise':
        prompt = t('chef_prompt_surprise');
        break;
    }
    handleSend(prompt);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const addToShoppingList = useMutation(
    api.shoppingList.addMultipleShoppingListItems
  );

  const consumePantryItems = useMutation(api.pantry.consumePantryItems);

  const handleCookAndRemove = async (jsonBlock: string) => {
    if (!currentUser?._id) return;
    try {
      const data = JSON.parse(jsonBlock);
      if (data.items && Array.isArray(data.items)) {
        // Find matches in pantry
        const recipeIngredients = data.items.map((i: any) =>
          i.name.toLowerCase()
        );
        const matches = pantryItems.filter((pItem: any) =>
          recipeIngredients.some((rItem: string) => rItem.includes(pItem.name))
        );

        if (matches.length === 0) {
          Alert.alert(
            t('chef_pantry_no_matches_title'),
            t('chef_pantry_no_matches')
          );
          return;
        }

        Alert.alert(
          t('chef_success_pantry_title'),
          t('chef_success_pantry_msg', { count: matches.length }) +
            `\n\n${matches.map((m: any) => m.name).join(', ')}`,
          [
            { text: t('chef_alert_cancel'), style: 'cancel' },
            {
              text: t('chef_confirm'),
              onPress: async () => {
                haptics.medium();
                const count = await consumePantryItems({
                  userId: currentUser._id as Id<'users'>,
                  itemNames: matches.map((m: any) => m.name),
                });
                haptics.success();
                Alert.alert(
                  'Success',
                  t('chef_success_pantry_removed', { count })
                );
              },
            },
          ]
        );
      }
    } catch (e) {
      console.error('Failed to process pantry items', e);
      Alert.alert(t('common_error'), t('chef_error_pantry'));
    }
  };

  const handleAddToShoppingList = async (jsonBlock: string) => {
    if (!currentUser?._id) return;
    try {
      const data = JSON.parse(jsonBlock);
      if (data.items && Array.isArray(data.items)) {
        haptics.medium();
        await addToShoppingList({
          userId: currentUser._id as Id<'users'>,
          items: data.items.map((item: any) => ({
            name: item.name,
            measure: item.measure || '',
            recipeId: 'ai-generated', // We could use chat ID or something unique
            recipeName: data.recipeName || 'AI Recipe',
          })),
        });
        haptics.success();
        Alert.alert(t('common_success'), t('chef_success_shopping_list'));
      }
    } catch (e) {
      console.error('Failed to parse shopping list JSON', e);
      Alert.alert(t('common_error'), t('chef_error_shopping_list'));
    }
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isUser = item.role === 'user';

    // Parse content for JSON block
    let content = item.content;
    let jsonBlock = null;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch && !isUser) {
      jsonBlock = jsonMatch[1];
      // Remove the JSON block from the displayed content
      content = content.replace(/```json\n[\s\S]*?\n```/, '').trim();
    }

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).springify()}
        style={{
          maxWidth: '98%',
          marginBottom: 16,
        }}
      >
        <XStack
          gap="$2"
          alignItems="flex-end"
          flexDirection={isUser ? 'row-reverse' : 'row'}
        >
          <Avatar
            circular
            size="$4"
            backgroundColor={isUser ? '$blue10' : colors.tint}
          >
            <Avatar.Image
              accessibilityLabel="Cam"
              source={
                isUser
                  ? undefined
                  : mode === 'chef'
                    ? CHEF_AVATAR
                    : TRAVEL_AVATAR
              }
            />
            <Avatar.Fallback
              backgroundColor={isUser ? '$blue10' : colors.tint}
              alignItems="center"
              justifyContent="center"
            >
              <FontAwesome5
                name={isUser ? 'user' : 'utensils'}
                size={12}
                color="white"
              />
            </Avatar.Fallback>
          </Avatar>

          <YStack gap="$2" flex={1}>
            <Card
              bordered
              padding="$3"
              borderRadius="$5"
              borderBottomRightRadius={isUser ? 0 : '$5'}
              borderBottomLeftRadius={isUser ? '$5' : 0}
              backgroundColor={isUser ? colors.tint : colors.card}
              borderColor={isUser ? 'transparent' : '$borderColor'}
              elevation={isUser ? 0 : 4}
              shadowColor={isUser ? undefined : '$shadowColor'}
              shadowRadius={isUser ? 0 : 8}
              shadowOffset={isUser ? undefined : { width: 0, height: 4 }}
              shadowOpacity={isUser ? 0 : 0.1}
            >
              <View style={{ width: '100%' }}>
                <Markdown
                  style={{
                    body: {
                      color: isUser ? 'white' : colors.text,
                      fontSize: 16,
                      lineHeight: 24,
                    },
                    heading1: {
                      color: isUser ? 'white' : colors.tint,
                      fontSize: 24,
                      fontWeight: 'bold',
                      marginBottom: 8,
                      marginTop: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: isUser ? 'white' : colors.tint,
                      paddingBottom: 4,
                    },
                    heading2: {
                      color: isUser ? 'white' : colors.tint,
                      fontSize: 20,
                      fontWeight: 'bold',
                      marginBottom: 8,
                      marginTop: 16,
                    },
                    heading3: {
                      color: isUser ? 'white' : colors.text,
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 4,
                      marginTop: 8,
                    },
                    bullet_list: {
                      marginBottom: 8,
                    },
                    ordered_list: {
                      marginBottom: 8,
                    },
                    list_item: {
                      marginBottom: 4,
                      color: isUser ? 'white' : colors.text,
                    },
                    code_inline: {
                      backgroundColor: 'transparent',
                      color: '#FF9800', // Orange for time/temp
                      borderRadius: 4,
                      paddingHorizontal: 4,
                      paddingVertical: 0,
                      fontWeight: 'bold',
                    },
                    strong: {
                      color: isUser ? 'white' : '#4CAF50', // Green for vegetables
                      fontWeight: 'bold',
                    },
                    em: {
                      color: isUser ? 'white' : '#F44336', // Red for meat
                      fontStyle: 'normal',
                      fontWeight: 'bold',
                    },
                    s: {
                      color: isUser ? 'white' : '#2196F3', // Blue for condiments
                      textDecorationLine: 'none',
                      fontWeight: 'bold',
                    },
                    del: {
                      color: isUser ? 'white' : '#2196F3', // Blue for condiments
                      textDecorationLine: 'none',
                      fontWeight: 'bold',
                    },
                    link: {
                      color: isUser ? '#ffd700' : colors.tint,
                      textDecorationLine: 'underline',
                      fontWeight: 'bold',
                    },
                  }}
                  rules={{
                    link: (node, children, parent, styles) => {
                      const href = node.attributes.href;
                      if (href === 'fish') {
                        return (
                          <Text
                            key={node.key}
                            style={{
                              color: '#009688', // Teal for Fish
                              fontWeight: 'bold',
                            }}
                          >
                            {children}
                          </Text>
                        );
                      }
                      if (href === 'dairy') {
                        return (
                          <Text
                            key={node.key}
                            style={{
                              color: '#3F51B5', // Indigo for Dairy
                              fontWeight: 'bold',
                            }}
                          >
                            {children}
                          </Text>
                        );
                      }
                      if (href === 'time') {
                        return (
                          <Text
                            key={node.key}
                            style={{
                              color: '#9C27B0', // Purple for Time
                              fontWeight: 'bold',
                            }}
                          >
                            {children}
                          </Text>
                        );
                      }
                      return (
                        <Text
                          key={node.key}
                          style={styles.link}
                          onPress={() => Linking.openURL(node.attributes.href)}
                        >
                          {mode === 'travel' ? '🗺️ ' : '🔗 '}
                          {children}
                        </Text>
                      );
                    },
                  }}
                >
                  {content}
                </Markdown>
              </View>
            </Card>

            {/* Shopping List Button */}
            {jsonBlock && (
              <ActionButtons
                jsonBlock={jsonBlock}
                onAdd={handleAddToShoppingList}
                onCook={handleCookAndRemove}
              />
            )}
          </YStack>
        </XStack>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <YStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          backgroundColor={colors.background}
          gap="$3"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$3">
              <View
                style={{
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                <Avatar circular size="$4" backgroundColor={colors.tint}>
                  <Avatar.Image
                    accessibilityLabel="Cam"
                    source={mode === 'chef' ? CHEF_AVATAR : TRAVEL_AVATAR}
                  />
                  <Avatar.Fallback alignItems="center" justifyContent="center">
                    <FontAwesome5 name={'utensils'} size={12} color="white" />
                  </Avatar.Fallback>
                </Avatar>
              </View>
              <YStack>
                <Text fontSize="$5" fontWeight="700">
                  {mode === 'chef' ? t('chef_title') : t('chef_travel_guide')}
                </Text>
                <Text fontSize="$2" opacity={0.6}>
                  {subscriptionType === 'monthly' ||
                  subscriptionType === 'yearly'
                    ? t('chef_prompts_unlimited')
                    : remainingPrompts === 1
                      ? t('chef_prompts_single', { count: remainingPrompts })
                      : t('chef_prompts_left', { count: remainingPrompts })}
                </Text>
              </YStack>
            </XStack>

            <XStack gap="$2">
              <Button
                size="$3"
                chromeless
                icon={
                  <FontAwesome5 name="history" size={16} color={colors.text} />
                }
                onPress={() => setShowHistory(true)}
              />
              <Button
                size="$3"
                chromeless
                icon={
                  <FontAwesome5 name="edit" size={16} color={colors.text} />
                }
                onPress={handleNewChat}
              />
            </XStack>
          </XStack>

          {/* Mode Switcher */}
          <View
            style={{
              backgroundColor: '$gray4',
              padding: 4,
              borderRadius: 12,
              height: 48,
              flexDirection: 'row',
              position: 'relative',
            }}
          >
            {/* Animated Background Indicator */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  width: '50%',
                  height: 40,
                  backgroundColor: colors.card,
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
                useAnimatedStyle(() => ({
                  transform: [
                    { translateX: withSpring(mode === 'chef' ? 0 : 200) },
                  ], // Approximate width calculation, better to use onLayout
                })),
              ]}
            />

            <Pressable
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
              onPress={() => setMode('chef')}
            >
              <Text
                fontWeight={mode === 'chef' ? '700' : '500'}
                color={mode === 'chef' ? colors.text : '$gray11'}
              >
                {t('chef_tab_chef')}
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
              onPress={() => setMode('travel')}
            >
              <Text
                fontWeight={mode === 'travel' ? '700' : '500'}
                color={mode === 'travel' ? colors.text : '$gray11'}
              >
                {t('chef_tab_travel')}
              </Text>
            </Pressable>
          </View>
        </YStack>

        {/* Quick Actions / New Recipe Button */}
        {mode === 'chef' && messages.length === 0 && (
          <View style={{ padding: 16 }}>
            <Button
              size="$5"
              theme="active"
              onPress={() => {
                setModalInitialSource('random');
                setShowRecipeSetup(true);
              }}
              icon={<FontAwesome5 name="utensils" size={18} />}
            >
              {t('chef_start_new_recipe')}
            </Button>
          </View>
        )}

        {/* Travel Guide Quick Action */}
        {mode === 'travel' && messages.length === 0 && (
          <View style={{ padding: 16 }}>
            <Button
              size="$5"
              theme="active"
              backgroundColor="$orange10"
              onPress={() => setShowCountrySelector(true)}
              icon={<FontAwesome5 name="globe-americas" size={18} />}
            >
              {t('chef_select_destination')}
            </Button>
          </View>
        )}

        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={[...messages, ...optimisticMessages]}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          style={{ flex: 1 }}
          ListFooterComponent={
            isTyping ? (
              <Animated.View
                entering={FadeIn}
                style={{
                  marginBottom: 16,
                }}
              >
                <XStack gap="$2" alignItems="flex-end">
                  <Avatar circular size="$4" backgroundColor={colors.tint}>
                    <Avatar.Image
                      accessibilityLabel="Cam"
                      source={mode === 'chef' ? CHEF_AVATAR : TRAVEL_AVATAR}
                    />
                    <Avatar.Fallback
                      backgroundColor={colors.tint}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FontAwesome5 name={'utensils'} size={12} color="white" />
                    </Avatar.Fallback>
                  </Avatar>

                  <View
                    style={{
                      backgroundColor: colors.card,
                      padding: 12,
                      borderRadius: 16,
                      borderBottomLeftRadius: 0,
                    }}
                  >
                    <XStack gap="$2" alignItems="center">
                      <ActivityIndicator size="small" color={colors.tint} />
                      <Text fontSize="$2" color="$color11">
                        {mode === 'chef'
                          ? t('chef_chat_cooking')
                          : t('chef_chat_planning')}
                      </Text>
                    </XStack>
                  </View>
                </XStack>
              </Animated.View>
            ) : null
          }
          ListEmptyComponent={
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              marginTop="$10"
              opacity={0.5}
              gap="$4"
            >
              <FontAwesome5
                name={mode === 'chef' ? 'utensils' : 'map-marked-alt'}
                size={48}
                color={colors.text}
              />
              <Text fontSize="$4" textAlign="center">
                {mode === 'chef'
                  ? t('chef_start_conversation_chef')
                  : t('chef_start_conversation_guide')}
              </Text>

              {/* Quick Actions in Empty State */}
              {mode === 'chef' && (
                <XStack
                  gap="$3"
                  flexWrap="wrap"
                  justifyContent="center"
                  marginTop="$4"
                >
                  <Button
                    size="$3"
                    bordered
                    onPress={() => handleQuickAction('random')}
                    icon={<FontAwesome5 name="dice" size={14} />}
                  >
                    {t('chef_qa_random_recipe')}
                  </Button>
                  <Button
                    size="$3"
                    bordered
                    onPress={() => handleQuickAction('pantry')}
                    icon={<FontAwesome5 name="carrot" size={14} />}
                  >
                    {t('chef_qa_use_pantry')}
                  </Button>
                </XStack>
              )}
            </YStack>
          }
        />

        {/* Input Area - Always visible at bottom */}
        <View
          style={{
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: 12,
            paddingBottom: 110,
          }}
        >
          {/* Quick Actions Bar (if not empty) */}
          {messages.length > 0 && mode === 'chef' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
              contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
            >
              <QuickActionButton
                index={0}
                activeQuickAction={activeQuickAction}
                quickActionAnim={quickActionAnim}
                onPress={() => handleQuickAction('random')}
              >
                {t('chef_qa_random')}
              </QuickActionButton>

              <QuickActionButton
                index={1}
                activeQuickAction={activeQuickAction}
                quickActionAnim={quickActionAnim}
                onPress={() => handleQuickAction('pantry')}
              >
                {t('chef_qa_pantry')}
              </QuickActionButton>

              <QuickActionButton
                index={2}
                activeQuickAction={activeQuickAction}
                quickActionAnim={quickActionAnim}
                onPress={() => handleQuickAction('surprise')}
              >
                {t('chef_qa_surprise')}
              </QuickActionButton>
            </ScrollView>
          )}

          <XStack space="$3" alignItems="center">
            <Input
              flex={1}
              size="$4"
              placeholder={
                mode === 'chef'
                  ? t('chef_placeholder_chef')
                  : t('chef_placeholder_travel')
              }
              value={inputText}
              onChangeText={setInputText}
              borderRadius="$4"
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <Button
              size="$4"
              circular
              backgroundColor={inputText.trim() ? colors.tint : '$gray8'}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              icon={<FontAwesome5 name="paper-plane" size={16} color="white" />}
            />
          </XStack>
        </View>
      </KeyboardAvoidingView>

      <RecipeSetupModal
        visible={showRecipeSetup}
        onClose={() => setShowRecipeSetup(false)}
        onGenerate={handleRecipeGenerate}
        pantryItems={pantryItems}
        initialSource={modalInitialSource}
      />

      <CountrySelectorModal
        visible={showCountrySelector}
        onClose={() => setShowCountrySelector(false)}
        onSelect={handleCountrySelect}
      />

      <ChatHistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        chats={chats}
        onSelectChat={setSelectedChatId}
        currentChatId={currentChatId}
        mode={mode}
      />
    </SafeAreaView>
  );
}

// Action Buttons Component
const ActionButtons = ({
  jsonBlock,
  onAdd,
  onCook,
}: {
  jsonBlock: string;
  onAdd: (json: string) => void;
  onCook: (json: string) => void;
}) => {
  const cartScale = useSharedValue(1);
  const fireScale = useSharedValue(1);

  const cartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  const { t } = useLanguage();

  const handleAddPress = () => {
    cartScale.value = withSequence(withSpring(1.5), withSpring(1));
    onAdd(jsonBlock);
  };

  const handleCookPress = () => {
    fireScale.value = withSequence(
      withTiming(1.5, { duration: 100 }),
      withRepeat(withTiming(1.2, { duration: 100 }), 3, true),
      withTiming(1, { duration: 100 })
    );
    onCook(jsonBlock);
  };

  return (
    <XStack gap="$3" flexWrap="wrap" marginTop="$2">
      <Pressable
        onPress={handleAddPress}
        style={({ pressed }) => ({
          backgroundColor: '#10b981', // Emerald Green
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Animated.View style={cartStyle}>
          <FontAwesome5 name="shopping-basket" size={16} color="white" />
        </Animated.View>
        <Text color="white" fontWeight="700" fontSize="$3" marginLeft="$2">
          {t('chef_action_add_to_list')}
        </Text>
      </Pressable>

      <Pressable
        onPress={handleCookPress}
        style={({ pressed }) => ({
          backgroundColor: '#f97316', // Orange
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#f97316',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Animated.View style={fireStyle}>
          <FontAwesome5 name="fire" size={16} color="white" />
        </Animated.View>
        <Text color="white" fontWeight="700" fontSize="$3" marginLeft="$2">
          {t('chef_action_cook_update')}
        </Text>
      </Pressable>
    </XStack>
  );
};

const QuickActionButton = ({
  index,
  activeQuickAction,
  quickActionAnim,
  onPress,
  children,
}: {
  index: number;
  activeQuickAction: SharedValue<number | null>;
  quickActionAnim: SharedValue<number>;
  onPress: () => void;
  children: React.ReactNode;
}) => {
  const style = useAnimatedStyle(() => {
    if (activeQuickAction.value !== index) return {};

    return {
      transform: [
        { rotateZ: `${quickActionAnim.value}deg` },
        {
          scale: withSpring(
            activeQuickAction.value === index && quickActionAnim.value !== 0
              ? 1.1
              : 1
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={style}>
      <Button
        size="$2"
        theme="active"
        variant="outlined"
        onPress={onPress}
        borderRadius="$10"
      >
        {children}
      </Button>
    </Animated.View>
  );
};
