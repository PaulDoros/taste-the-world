import React, { useMemo } from 'react';
import { Linking, View } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Card,
  Avatar,
  Button,
  useTheme,
  Paragraph,
  H3,
  H4,
  Separator,
} from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '@/components/useColorScheme';

// Avatar assets (can be passed as props if needed, or imported here)
const CHEF_AVATAR = require('@/assets/images/chef-avatar.jpg');
const TRAVEL_AVATAR = require('@/assets/images/travel-avatar.jpg');
import Svg, { Path } from 'react-native-svg';

// Revert SVG import if used, or just unused.
// We are using GlassCard for the tail now.

const BubbleTail = ({
  side,
  color,
  borderColor,
}: {
  side: 'left' | 'right';
  color?: string;
  borderColor?: string;
  intensity?: number;
}) => {
  const isRight = side === 'right';
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 10,
        [isRight ? 'right' : 'left']: -10,
        width: 20,
        height: 20,
        zIndex: 1, // Visible on top of border seams
      }}
    >
      <Svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        style={{ transform: [{ scaleX: isRight ? 1 : -1 }] }}
      >
        <Path
          d="M0 0 C4 0 6 14 20 20 L0 20 L0 0 Z"
          fill={color}
          stroke={borderColor}
          strokeWidth={1}
        />
        {/* Cover the inside seam with a fill-only patch to hide the border stroke where it joins */}
        <Path d="M0 0 L0 20 L5 20 L0 0 Z" fill={color} />
      </Svg>
    </View>
  );
};

interface ActionButtonsProps {
  jsonBlock: string | null;
  fullContent: string;
  mode: 'chef' | 'travel';
  onAdd: (json: string) => void;
  onCook: (json: string) => void;
  onSavePlan?: (json: string) => void;
}

// Re-defining ActionButtons here or importing it?
// Ideally it should be its own component too, but for now we can duplicate or export it.
// Let's passed it as a prop or render prop?
// No, let's just implement a simple version here or import the one from ChefScreen if we exported it?
// We didn't export it. We'll duplicate it for now to decoupled, or better yet, make action buttons a slot.
// Actually, to fully optimize, ActionButtons should also be memoized.
// Let's implement the ActionButtons logic inside here for simplicity of extraction.

const ActionButtons = ({
  jsonBlock,
  fullContent,
  mode,
  onAdd,
  onCook,
  onSavePlan,
}: ActionButtonsProps) => {
  let detectedMode = mode;
  let hasRecipeData = false;

  if (jsonBlock) {
    try {
      const data = JSON.parse(jsonBlock);
      if (data.tripName || data.itinerary) detectedMode = 'travel';
      if (data.ingredients || data.steps || data.recipeName)
        hasRecipeData = true;
    } catch (e) {}
  }

  if (detectedMode === 'travel' && onSavePlan) {
    return (
      <XStack gap="$3" marginTop="$2" justifyContent="flex-end">
        <GlassButton
          size="small"
          variant="active"
          icon="save"
          label="Save Trip"
          onPress={() =>
            onSavePlan(
              jsonBlock ||
                JSON.stringify({
                  tripName: 'New Trip',
                  itinerary: fullContent,
                })
            )
          }
        />
      </XStack>
    );
  }

  // Only show Cook/Add buttons if valid recipe data exists
  if (!jsonBlock || !hasRecipeData) return null;

  return (
    <XStack gap="$3" marginTop="$2" justifyContent="flex-end">
      <GlassButton
        size="small"
        icon="carrot"
        label="Cook It"
        onPress={() => onCook(jsonBlock)}
      />
      <GlassButton
        size="small"
        variant="active"
        icon="shopping-cart"
        label="Add to List"
        onPress={() => onAdd(jsonBlock)}
      />
    </XStack>
  );
};

interface MessageBubbleProps {
  item: any;
  index: number;
  mode: 'chef' | 'travel';
  userName?: string;
  userImage?: string;
  onAdd: (json: string) => void;
  onCook: (json: string) => void;
  onSavePlan?: (json: string) => void;
}

export const MessageBubble = React.memo(
  ({
    item,
    index,
    mode,
    userName,
    userImage,
    onAdd,
    onCook,
    onSavePlan,
  }: MessageBubbleProps) => {
    const theme = useTheme();
    const colorScheme = useColorScheme(); // Only if needed for specifics not in theme
    const isUser = item.role === 'user';

    // Get Initials
    const initials = userName
      ? userName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';

    // Parse content for JSON block
    let content = item.content;
    let jsonBlock = null;
    const jsonMatch = content.match(new RegExp('```json\\n([\\s\\S]*?)\\n```'));

    if (jsonMatch && !isUser) {
      jsonBlock = jsonMatch[1];
      content = content
        .replace(new RegExp('```json\\n[\\s\\S]*?\\n```'), '')
        .trim();
    }

    // Markdown Styles using Tamagui Token values
    const markdownStyles = useMemo(
      () => ({
        body: {
          color: isUser
            ? colorScheme === 'dark' // If dark mode, keep white. If light, black.
              ? '#FFFFFF'
              : '#000000'
            : theme.color.get(),
          fontSize: 16,
          lineHeight: 24,
        },
        heading1: {
          color: isUser
            ? colorScheme === 'dark'
              ? '#FFFFFF'
              : '#000000'
            : theme.color.get(),
          fontSize: 24,
          fontWeight: 'bold' as const,
          marginBottom: 8,
          marginTop: 8,
          borderBottomWidth: 1,
          borderBottomColor: isUser ? '#FFFFFF' : theme.borderColor.get(),
          paddingBottom: 4,
        },
        heading2: {
          color: isUser ? '#FFFFFF' : theme.color.get(),
          fontSize: 20,
          fontWeight: 'bold' as const,
          marginBottom: 8,
          marginTop: 16,
        },
        heading3: {
          color: isUser ? '#FFFFFF' : theme.color11.get(),
          fontSize: 18,
          fontWeight: 'bold' as const,
          marginBottom: 4,
          marginTop: 8,
        },
        bullet_list: { marginBottom: 8 },
        ordered_list: { marginBottom: 8 },
        list_item: {
          marginBottom: 4,
          color: isUser ? '#FFFFFF' : theme.color.get(),
        },
        code_inline: {
          backgroundColor: isUser
            ? 'rgba(255,255,255,0.2)'
            : theme.backgroundHover.get(),
          color: isUser ? '#FFD700' : theme.color10.get(),
          borderRadius: 4,
          paddingHorizontal: 4,
          paddingVertical: 0,
          fontWeight: 'bold' as const,
        },
        strong: {
          color: isUser ? '#FFFFFF' : theme.green10.get(),
          fontWeight: 'bold' as const,
        },
        em: {
          color: isUser ? '#FFFFFF' : theme.red10.get(),
          fontStyle: 'normal' as const,
          fontWeight: 'bold' as const,
        },
        s: {
          color: isUser ? '#FFFFFF' : theme.blue10.get(),
          textDecorationLine: 'none' as const,
          fontWeight: 'bold' as const,
        },
        link: {
          color: isUser ? '#FFD700' : theme.blue10.get(),
          textDecorationLine: 'underline' as const,
          fontWeight: 'bold' as const,
        },
      }),
      [theme, isUser]
    );

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).springify()}
        style={{
          maxWidth: '98%',
          marginBottom: 16,
          width: '100%',
        }}
      >
        <XStack
          marginLeft={isUser ? 0 : 20}
          marginRight={isUser ? 20 : 0}
          gap="$2"
          alignItems="flex-end"
          flexDirection={isUser ? 'row-reverse' : 'row'}
          paddingBottom="$4" // visual offset for tail alignment
        >
          <YStack gap="$2" flex={1} maxWidth="95%">
            {isUser ? (
              <View style={{ alignSelf: 'flex-end', position: 'relative' }}>
                <GlassCard
                  backgroundColor="rgba(33, 150, 243, 0.1)"
                  borderRadius={20}
                  intensity={50}
                  style={{
                    padding: 12,
                    paddingBottom: 12,
                    paddingTop: 12,
                    marginRight: 0,
                    borderColor:
                      theme.blue6?.get() || 'rgba(33, 150, 243, 0.2)',
                  }}
                >
                  <YStack>
                    <Markdown
                      style={markdownStyles}
                      rules={{
                        link: (node, children, parent, styles) => {
                          const href = node.attributes.href;
                          return (
                            <Text
                              key={node.key}
                              style={styles.link}
                              onPress={() => Linking.openURL(href)}
                            >
                              🔗 {children}
                            </Text>
                          );
                        },
                      }}
                    >
                      {content}
                    </Markdown>
                  </YStack>
                </GlassCard>
                <Avatar
                  position="absolute"
                  bottom={-10}
                  right={-10}
                  circular
                  size="$4"
                >
                  <Avatar.Image
                    accessibilityLabel={'User'}
                    src={userImage} // Use the profile image from settings
                  />
                  <Avatar.Fallback
                    backgroundColor="$tint" // Use main theme tint instead of random blue
                    alignItems="center"
                    justifyContent="center"
                    borderColor="$borderColor"
                    borderWidth={1}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="bold"
                      color="white"
                      style={{ includeFontPadding: false }}
                    >
                      {initials}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
              </View>
            ) : (
              <View style={{ alignSelf: 'flex-start', position: 'relative' }}>
                <GlassCard
                  borderRadius={20}
                  style={{
                    padding: 12,
                  }}
                >
                  <YStack width="100%">
                    <Markdown
                      style={markdownStyles}
                      rules={{
                        link: (node, children, parent, styles) => {
                          const href = node.attributes.href;
                          // Custom handlers for specific keywords
                          const colors: Record<string, string | undefined> = {
                            fish: theme.teal10?.get(),
                            dairy: theme.indigo10?.get(),
                            time: theme.purple10?.get(),
                          };

                          if (['fish', 'dairy', 'time'].includes(href)) {
                            return (
                              <Text
                                key={node.key}
                                color={colors[href as keyof typeof colors]}
                                fontWeight="bold"
                              >
                                {children}
                              </Text>
                            );
                          }

                          return (
                            <Text
                              key={node.key}
                              style={styles.link}
                              onPress={() => Linking.openURL(href)}
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
                  </YStack>
                </GlassCard>
                <Avatar
                  position="absolute"
                  top={-25}
                  left={-25}
                  circular
                  size="$5"
                >
                  <Avatar.Image
                    accessibilityLabel={'Chef'}
                    source={mode === 'chef' ? CHEF_AVATAR : TRAVEL_AVATAR}
                  />
                  <Avatar.Fallback
                    backgroundColor={'$tint'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FontAwesome5 name={'utensils'} size={12} color="white" />
                  </Avatar.Fallback>
                </Avatar>
              </View>
            )}

            {!isUser && (
              <ActionButtons
                jsonBlock={jsonBlock}
                fullContent={content}
                mode={mode}
                onAdd={onAdd}
                onCook={onCook}
                onSavePlan={onSavePlan}
              />
            )}
          </YStack>
        </XStack>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.item._id === nextProps.item._id &&
      prevProps.item.content === nextProps.item.content &&
      prevProps.mode === nextProps.mode
    );
  }
);
