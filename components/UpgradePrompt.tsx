import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@tamagui/linear-gradient';
import { YStack, XStack, Text, Button, Card, Theme } from 'tamagui';
import { useUserStore } from '@/store/useUserStore';
import { getTierDisplayName } from '@/utils/userTiers';

type UpgradePromptProps = {
  feature: string;
};

export function UpgradePrompt({ feature }: UpgradePromptProps) {
  const router = useRouter();
  const tier = useUserStore((state) => state.tier);

  return (
    <Theme name="dark">
      <Card
        bordered
        elevate
        m="$3"
        p={0}
        br="$6"
        overflow="hidden"
        shadowColor="rgba(15,23,42,0.45)"
        shadowRadius={24}
      >
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#0EA5E9']} // modern, premium blue gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 24 }}
        >
          <YStack ai="center" space="$3">
            {/* Badge / pill */}
            <XStack
              ai="center"
              jc="center"
              bc="rgba(15, 23, 42, 0.6)"
              px="$2"
              py="$1"
              br="$10"
              alignSelf="flex-start"
            >
              <Ionicons name="star" size={14} color="#FACC15" />
              <Text ml="$1" fontSize={11} fontWeight="600" color="#E5E7EB">
                PREMIUM ACCESS
              </Text>
            </XStack>

            {/* Icon circle */}
            <YStack
              w={72}
              h={72}
              br={999}
              ai="center"
              jc="center"
              bg="rgba(15,23,42,0.45)"
              boc="rgba(248,250,252,0.18)"
              bw={1}
              mt="$2"
              mb="$2"
            >
              <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
            </YStack>

            {/* Title & description */}
            <YStack space="$1" ai="center">
              <Text
                fontSize={22}
                fontWeight="700"
                color="#F9FAFB"
                textAlign="center"
              >
                Upgrade to Premium
              </Text>
              <Text
                fontSize={14}
                color="rgba(226,232,240,0.9)"
                textAlign="center"
                maxWidth={260}
              >
                Unlock {feature} and explore all{' '}
                <Text fontWeight="700" color="#E5E7EB">
                  250+ countries
                </Text>{' '}
                with full access.
              </Text>
            </YStack>

            {/* Current tier pill */}
            <XStack
              ai="center"
              jc="center"
              px="$3"
              py="$1.5"
              br="$10"
              bg="rgba(15,23,42,0.65)"
              boc="rgba(148,163,184,0.5)"
              bw={1}
              mt="$2"
            >
              <Ionicons name="person-circle" size={16} color="#E5E7EB" />
              <Text ml="$2" fontSize={13} fontWeight="600" color="#E5E7EB">
                Current: {getTierDisplayName(tier)}
              </Text>
            </XStack>

            {/* CTA button */}
            <Button
              mt="$3"
              h={44}
              px="$4"
              br="$6"
              bg="#FACC15"
              pressStyle={{ opacity: 0.9, scale: 0.98 }}
              onPress={() => router.push('/settings/premium')}
              iconAfter={
                <Ionicons name="arrow-forward" size={16} color="#0F172A" />
              }
            >
              <Text fontSize={15} fontWeight="700" color="#0F172A">
                View Premium Plans
              </Text>
            </Button>

            {/* Tiny helper text */}
            <Text
              mt="$1"
              fontSize={11}
              color="rgba(226,232,240,0.75)"
              textAlign="center"
            >
              Cancel anytime. Your current tier will stay active until the end
              of the billing period.
            </Text>
          </YStack>
        </LinearGradient>
      </Card>
    </Theme>
  );
}
