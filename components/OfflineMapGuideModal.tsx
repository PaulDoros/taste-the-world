import React from 'react';
import { Modal, Platform } from 'react-native';
import { YStack, XStack, Text, Button, Card, Separator } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

interface OfflineMapGuideModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  countryName: string;
}

export const OfflineMapGuideModal = ({
  visible,
  onClose,
  onConfirm,
  countryName,
}: OfflineMapGuideModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={20}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}

        <Animated.View
          entering={FadeInUp.springify().damping(15)}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Card
            bordered
            elevate
            size="$4"
            backgroundColor={colors.card}
            padding="$0"
            overflow="hidden"
            borderRadius="$6"
          >
            {/* Header */}
            <YStack
              padding="$4"
              backgroundColor={colors.tint}
              alignItems="center"
            >
              <FontAwesome5 name="map-marked-alt" size={32} color="white" />
              <Text
                fontSize="$5"
                fontWeight="700"
                color="white"
                marginTop="$3"
                textAlign="center"
              >
                How to Download Offline Map
              </Text>
              <Text
                fontSize="$3"
                color="rgba(255,255,255,0.8)"
                textAlign="center"
              >
                For {countryName}
              </Text>
            </YStack>

            {/* Steps */}
            <YStack padding="$5" gap="$4">
              <InstructionStep
                number={1}
                text="We'll open Google Maps for you."
                icon="external-link-alt"
                colors={colors}
              />
              <Separator />
              <InstructionStep
                number={2}
                text="Tap the name/address bar at the bottom."
                icon="arrow-up"
                colors={colors}
              />
              <Separator />
              <InstructionStep
                number={3}
                text="Tap the 3 dots (⋮) menu button."
                icon="ellipsis-v"
                colors={colors}
              />
              <Separator />
              <InstructionStep
                number={4}
                text="Select 'Download offline map'."
                icon="download"
                colors={colors}
              />
            </YStack>

            {/* Actions */}
            <YStack
              padding="$4"
              gap="$3"
              backgroundColor={isDark ? '$gray2' : '$gray1'}
            >
              <Button
                size="$4"
                backgroundColor={colors.tint}
                onPress={onConfirm}
                icon={<FontAwesome5 name="external-link-alt" color="white" />}
              >
                <Text color="white" fontWeight="700">
                  Open Google Maps
                </Text>
              </Button>
              <Button size="$3" chromeless onPress={onClose}>
                <Text color="$gray9">Cancel</Text>
              </Button>
            </YStack>
          </Card>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const InstructionStep = ({
  number,
  text,
  icon,
  colors,
}: {
  number: number;
  text: string;
  icon: string;
  colors: any;
}) => (
  <XStack alignItems="center" gap="$3">
    <YStack
      width={28}
      height={28}
      borderRadius={14}
      backgroundColor={colors.tint}
      alignItems="center"
      justifyContent="center"
    >
      <Text color="white" fontWeight="700" fontSize="$3">
        {number}
      </Text>
    </YStack>
    <Text flex={1} fontSize="$4" color={colors.text}>
      {text}
    </Text>
    <FontAwesome5
      name={icon}
      size={16}
      color={colors.text}
      style={{ opacity: 0.5 }}
    />
  </XStack>
);
