import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { YStack, XStack, Heading, Paragraph, Button, useTheme } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';

interface ExploreButtonProps {
  onPress: () => void;
  title: string;
  subtitle: string;
}

export const ExploreButton = ({
  onPress,
  title,
  subtitle,
}: ExploreButtonProps) => {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeIn.delay(380)}>
      <Button
        onPress={onPress}
        size="$5"
        borderRadius="$5"
        padding={0}
        overflow="hidden"
        borderWidth={0}
        pressStyle={{ scale: 0.98, opacity: 0.9 }}
        animation="quick"
        shadowColor="$tint"
        shadowOffset={{ width: 0, height: 12 }}
        shadowOpacity={0.4}
        shadowRadius={20}
        elevation={10}
      >
        <LinearGradient
          colors={[theme.tint.val, '#FB923C']} // Standardize this orange if possible, but keeping for now as it's specific design
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            width: '100%',
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <XStack alignItems="center" flex={1} space="$3">
            {/* Icon Container */}
            <YStack
              width={42}
              height={42}
              borderRadius="$4"
              padding="$2"
              alignItems="center"
              justifyContent="center"
              backgroundColor="rgba(255,255,255,0.2)"
            >
              <FontAwesome5 name="globe-americas" size={24} color="#FFFFFF" />
            </YStack>

            {/* Text Content */}
            <YStack flex={1}>
              <Heading
                size="$6"
                fontWeight="900"
                color="white"
                letterSpacing={-0.5}
              >
                {title}
              </Heading>
              <Paragraph size="$3" color="white" opacity={0.9}>
                {subtitle}
              </Paragraph>
            </YStack>
          </XStack>

          {/* Arrow */}
          <YStack
            width={40}
            height={40}
            borderRadius="$10"
            alignItems="center"
            justifyContent="center"
            backgroundColor="rgba(255,255,255,0.25)"
          >
            <FontAwesome5 name="arrow-right" size={18} color="white" />
          </YStack>
        </LinearGradient>
      </Button>
    </Animated.View>
  );
};
