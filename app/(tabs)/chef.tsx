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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  YStack,
  XStack,
  Text,
  Input,
  Button,
  Card,
  Avatar,
  useTheme,
} from 'tamagui';
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
import LottieView from 'lottie-react-native';
import { haptics } from '@/utils/haptics';
import { playSound } from '@/utils/sounds';

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
import { MessageBubble } from '@/components/MessageBubble';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { useTierLimit } from '@/hooks/useTierLimit';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

// Local assets
const CHEF_AVATAR = require('@/assets/images/chef-avatar.jpg');
const TRAVEL_AVATAR = require('@/assets/images/travel-avatar.jpg');

// ActionButtons extracted to MessageBubble.tsx

export default function ChefScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // Bridge legacy colors to theme tokens
  // Bridge legacy colors to theme tokens
  // Removed legacy colors object in favor of direct token usage
  const {
    user: currentUser,
    token,
    signOut,
    tier,
    subscriptionType,
  } = useAuth();
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
    let prompt = t('chef_prompt_style', { style: config.style });

    if (config.style === 'quick') prompt += t('chef_prompt_quick');
    if (config.style === 'family') prompt += t('chef_prompt_family');
    if (config.style === 'gourmet') prompt += t('chef_prompt_gourmet');

    prompt += t('chef_prompt_cuisine', { cuisine: config.cuisine });

    if (config.source === 'pantry') {
      if (pantryItems.length === 0) {
        prompt += t('chef_prompt_pantry_empty');
      } else {
        // Use selected ingredients if available, otherwise use all pantry items
        const ingredientsToUse =
          config.ingredients && config.ingredients.length > 0
            ? config.ingredients.join(', ')
            : pantryItems.map((i: any) => i.name).join(', ');
        prompt += t('chef_prompt_pantry_ingredients', {
          ingredients: ingredientsToUse,
        });
      }
    } else {
      prompt += t('chef_prompt_suggest_ingredients');
    }

    // JSON requirement is now enforced by the backend (hidden context)
    // so we don't need to append it here, keeping the chat clean.

    handleSend(prompt);
  };

  // ... (ActionButtons removed from here)

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
    playSound('message-sent');
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
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      // Only play if it's AI and likely a "new" one (we could improve this with timestamp check)
      // For now, rely on length change + role check.
      if (lastMsg.role !== 'user' && !isTyping) {
        playSound('message-received');
      }
    }

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

  const createTrip = useMutation(api.trips.createTrip);

  const handleSavePlan = async (jsonBlockOrString: string) => {
    if (!currentUser?._id) return;
    try {
      let data;
      // Check if input is a JSON string or plain text
      if (jsonBlockOrString.trim().startsWith('{')) {
        try {
          data = JSON.parse(jsonBlockOrString);
        } catch (e) {
          // Fallback if parse fails, treat as raw object structure passed from ActionButtons
          data = { tripName: 'New Trip', itinerary: jsonBlockOrString };
        }
      } else {
        // It's a raw string passed explicitly
        data = { tripName: 'New Trip', itinerary: jsonBlockOrString };
      }

      // If called from ActionButtons with built object (which is stringified there)
      // Wait, ActionButtons calls it with:
      // 1. jsonBlock (string) -> parsed -> data.itinerary might be object or string
      // 2. JSON.stringify({ tripName, itinerary: fullContent }) -> parsed -> data.itinerary is string

      // Let's re-parse if we received a string that looks like JSON
      try {
        const parsed = JSON.parse(jsonBlockOrString);
        data = parsed;
      } catch (e) {
        // Not JSON, assume it's just the itinerary text?
        // Actually ActionButtons *always* passes a JSON string now?
        // "onSavePlan(jsonBlock || JSON.stringify(...))"
        // So it is always a JSON string.
        // However, if the jsonBlock *was* the itinerary note itself? No, jsonBlock is usually the whole plan.
      }

      if (!data) return;

      if (data.tripName || data.itinerary) {
        haptics.medium();

        // Prepare notes: if itinerary is an object, stringify it. If string, leave as is.
        let notesContent =
          typeof data.itinerary === 'string'
            ? data.itinerary
            : JSON.stringify(data.itinerary, null, 2);

        // Fix for escaped newlines often returned by AI or double-stringified
        notesContent = notesContent.replace(/\\n/g, '\n');

        // Optional: Remove starting/ending quotes if they exist and wrap the whole text unnecessarily
        // This handles cases where the string itself was JSON stringified twice "Content..."
        if (notesContent.startsWith('"') && notesContent.endsWith('"')) {
          notesContent = notesContent.slice(1, -1);
        }

        await createTrip({
          token: token!,
          destination: data.tripName || 'New Trip',
          startDate: Date.now(),
          notes: notesContent,
        });
        haptics.success();
        Alert.alert(
          t('common_success'),
          'Trip saved to your Travel Wallet! ✈️'
        );
      }
    } catch (e) {
      console.error('Failed to save trip', e);
      Alert.alert(t('common_error'), 'Failed to save travel plan.');
    }
  };

  return (
    <ScreenLayout edges={['bottom']}>
      <AmbientBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header with Glassmorphism */}
        <GlassCard
          borderRadius={0}
          style={{
            zIndex: 10,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <YStack
            paddingHorizontal="$4"
            paddingTop={insets.top + 12} // Adjusted for safe area
            paddingBottom="$3"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
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
                  <Avatar circular size="$4" backgroundColor="$tint">
                    <Avatar.Image
                      accessibilityLabel="Cam"
                      source={mode === 'chef' ? CHEF_AVATAR : TRAVEL_AVATAR}
                    />
                    <Avatar.Fallback
                      alignItems="center"
                      justifyContent="center"
                    >
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
                    <FontAwesome5
                      name="history"
                      size={16}
                      color={theme.color.get()}
                    />
                  }
                  onPress={() => setShowHistory(true)}
                />
                <Button
                  size="$3"
                  chromeless
                  icon={
                    <FontAwesome5
                      name="edit"
                      size={16}
                      color={theme.color.get()}
                    />
                  }
                  onPress={handleNewChat}
                />
              </XStack>
            </XStack>

            {/* Mode Switcher */}
            <XStack
              backgroundColor="$gray4"
              padding={4}
              borderRadius={12}
              height={48}
              position="relative"
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
                    backgroundColor: theme.backgroundHover?.get() || '#F5F5F5',
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
                  color={mode === 'chef' ? '$color' : '$gray11'}
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
                  color={mode === 'travel' ? '$color' : '$gray11'}
                >
                  {t('chef_tab_travel')}
                </Text>
              </Pressable>
            </XStack>
          </YStack>
        </GlassCard>

        {/* Quick Actions / New Recipe Button */}
        {mode === 'chef' && messages.length === 0 && (
          <View style={{ padding: 16 }}>
            <GlassButton
              size="large"
              variant="active"
              onPress={() => {
                setModalInitialSource('random');
                setShowRecipeSetup(true);
              }}
              icon="utensils"
              label={t('chef_start_new_recipe')}
              backgroundOpacity={0.7}
            />
          </View>
        )}

        {/* Travel Guide Quick Action */}
        {mode === 'travel' && messages.length === 0 && (
          <View style={{ padding: 16 }}>
            <GlassButton
              size="large"
              variant="active"
              onPress={() => setShowCountrySelector(true)}
              icon="globe-americas"
              label={t('chef_select_destination')}
              backgroundColor={theme.tint.get()}
            />
          </View>
        )}

        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={[...messages, ...optimisticMessages]}
          renderItem={({ item, index }) => (
            <MessageBubble
              item={item}
              index={index}
              mode={mode}
              userName={currentUser?.name || 'User'}
              userImage={currentUser?.image}
              onAdd={handleAddToShoppingList}
              onCook={handleCookAndRemove}
              onSavePlan={handleSavePlan}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 48, // Increased padding to accommodate floating avatars at top
            paddingBottom: 100,
          }}
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
                  <Avatar circular size="$4" backgroundColor="$tint">
                    <Avatar.Image
                      accessibilityLabel="Cam"
                      source={mode === 'chef' ? CHEF_AVATAR : TRAVEL_AVATAR}
                    />
                    <Avatar.Fallback
                      backgroundColor="$tint"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FontAwesome5 name={'utensils'} size={12} color="white" />
                    </Avatar.Fallback>
                  </Avatar>

                  {/* Animated Background Indicator */}
                  <View
                    style={{
                      backgroundColor:
                        theme.backgroundHover?.get() || '#F5F5F5',
                      padding: 12,
                      borderRadius: 16,
                      borderBottomLeftRadius: 0,
                    }}
                  >
                    <XStack gap="$2" alignItems="center">
                      <ActivityIndicator
                        size="small"
                        color={theme.blue10.get()}
                      />
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
              <LottieView
                source={
                  mode === 'chef'
                    ? require('@/assets/animations/Cooking.json')
                    : require('@/assets/animations/travel.json')
                }
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
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
                    icon={
                      <FontAwesome5
                        name="dice"
                        size={14}
                        color={theme.tint.get()}
                      />
                    }
                    borderColor="$tint"
                    color="$tint"
                    pressStyle={{ backgroundColor: '$tint', opacity: 0.1 }}
                  >
                    {t('chef_qa_random_recipe')}
                  </Button>
                  <Button
                    size="$3"
                    bordered
                    onPress={() => handleQuickAction('pantry')}
                    icon={
                      <FontAwesome5
                        name="carrot"
                        size={14}
                        color={theme.tint.get()}
                      />
                    }
                    borderColor="$tint"
                    color="$tint"
                    pressStyle={{ backgroundColor: '$tint', opacity: 0.1 }}
                  >
                    {t('chef_qa_use_pantry')}
                  </Button>
                </XStack>
              )}
            </YStack>
          }
        />

        {/* Input Area - Always visible at bottom */}
        <YStack
          backgroundColor="$background"
          borderTopWidth={1}
          borderTopColor="$borderColor"
          padding={12}
          paddingBottom={110}
        >
          {/* Quick Actions Bar (if not empty) */}
          {messages.length > 0 && mode === 'chef' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
              contentContainerStyle={{
                paddingHorizontal: 4,
                gap: 8,
                paddingBottom: 8,
              }}
            >
              <QuickActionButton
                index={0}
                icon="dice"
                activeQuickAction={activeQuickAction}
                quickActionAnim={quickActionAnim}
                onPress={() => handleQuickAction('random')}
              >
                {t('chef_qa_random')}
              </QuickActionButton>

              <QuickActionButton
                index={1}
                icon="carrot"
                activeQuickAction={activeQuickAction}
                quickActionAnim={quickActionAnim}
                onPress={() => handleQuickAction('pantry')}
              >
                {t('chef_qa_pantry')}
              </QuickActionButton>

              <QuickActionButton
                index={2}
                icon="magic"
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
              backgroundColor={inputText.trim() ? '$tint' : '$gray8'}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              icon={<FontAwesome5 name="paper-plane" size={16} color="white" />}
            />
          </XStack>
        </YStack>
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
    </ScreenLayout>
  );
}

const QuickActionButton = ({
  index,
  icon,
  activeQuickAction,
  quickActionAnim,
  onPress,
  children,
}: {
  index: number;
  icon: string;
  activeQuickAction: SharedValue<number | null>;
  quickActionAnim: SharedValue<number>;
  onPress: () => void;
  children: React.ReactNode;
}) => {
  const theme = useTheme();

  // Animate ONLY the icon
  const iconStyle = useAnimatedStyle(() => {
    if (activeQuickAction.value !== index) return {};

    return {
      transform: [
        { rotateZ: `${quickActionAnim.value * 2}deg` }, // Rotate
        {
          scale: withSpring(
            activeQuickAction.value === index && quickActionAnim.value !== 0
              ? 1.2
              : 1
          ),
        },
      ],
    };
  });

  return (
    <GlassButton
      size="small"
      onPress={onPress}
      label={children}
      shadowRadius={3}
      iconComponent={
        <Animated.View style={iconStyle}>
          <FontAwesome5 name={icon} size={14} color={theme.blue10?.get()} />
        </Animated.View>
      }
    />
  );
};
