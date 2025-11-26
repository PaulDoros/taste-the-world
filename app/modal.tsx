import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView, Alert } from 'react-native';
import { View } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PricingSection } from '@/components/settings/PricingSection';
import { useState } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { YStack, Text, XStack, Card, useTheme, Button } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme/gradients';
import { brandColors } from '@/theme/colors';

export default function ModalScreen() {
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { setSubscription } = usePremium();
  const [selectedSubscription, setSelectedSubscription] = useState<
    'monthly' | 'yearly'
  >('yearly');

  const handleUpgrade = () => {
    haptics.light();
    setSubscription(selectedSubscription);
    Alert.alert(
      '🎉 Welcome to Premium!',
      `You've successfully upgraded to ${selectedSubscription === 'monthly' ? 'Monthly' : 'Yearly'} Premium. Enjoy unlimited access to all features!`,
      [
        {
          text: 'Awesome!',
          onPress: () => {
            haptics.success();
            router.back();
          },
        },
      ]
    );
  };

  const benefits = [
    {
      icon: 'robot',
      title: 'AI Chef Assistant',
      description: 'Personalized AI suggestions',
    },
    {
      icon: 'globe-americas',
      title: 'All 195+ Countries',
      description: 'Unlock the entire world',
    },
    {
      icon: 'download',
      title: 'Offline Mode',
      description: 'Download maps & recipes',
    },
    {
      icon: 'camera',
      title: 'Pantry Scanner',
      description: 'Scan ingredients instantly',
    },
    {
      icon: 'ban',
      title: 'No Ads',
      description: 'Seamless experience',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$5" padding="$4">
          {/* Header with Gradient */}
          <Card bordered elevate size="$4" overflow="hidden" padding={0}>
            <LinearGradient
              colors={gradients.primaryDark}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 24, alignItems: 'center' }}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                ]}
              >
                <FontAwesome5 name="crown" size={32} color="#FFFFFF" />
              </View>
              <Text
                fontSize="$8"
                fontWeight="800"
                textAlign="center"
                color="white"
              >
                Unlock Premium
              </Text>
              <Text
                fontSize="$4"
                opacity={0.8}
                textAlign="center"
                maxWidth={300}
                color="white"
              >
                {feature
                  ? `Upgrade to unlock ${feature}`
                  : 'Get unlimited access'}
              </Text>
            </LinearGradient>
          </Card>

          {/* Pricing Section */}
          <PricingSection
            selectedSubscription={selectedSubscription}
            onSelectSubscription={setSelectedSubscription}
            onUpgrade={handleUpgrade}
          />

          {/* Detailed Benefits - More Subtle */}
          <YStack gap="$3">
            <Text
              fontSize="$4"
              fontWeight="700"
              marginLeft="$2"
              opacity={0.7}
              textTransform="uppercase"
              letterSpacing={1}
            >
              What's Included
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {benefits.map((benefit, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(100 + index * 50).springify()}
                  style={{ width: '48%' }}
                >
                  <Card
                    bordered
                    padding="$3"
                    backgroundColor="$card"
                    pressStyle={{ scale: 0.98 }}
                  >
                    <YStack gap="$2" alignItems="center">
                      <FontAwesome5
                        name={benefit.icon}
                        size={20}
                        color={brandColors.primary}
                      />
                      <YStack alignItems="center">
                        <Text fontSize="$3" fontWeight="700" textAlign="center">
                          {benefit.title}
                        </Text>
                        <Text
                          fontSize="$2"
                          opacity={0.6}
                          textAlign="center"
                          numberOfLines={1}
                        >
                          {benefit.description}
                        </Text>
                      </YStack>
                    </YStack>
                  </Card>
                </Animated.View>
              ))}
            </XStack>
          </YStack>

          {/* Close Button */}
          <Button
            variant="outlined"
            onPress={() => router.back()}
            marginTop="$2"
            marginBottom="$6"
            borderColor="$borderColor"
          >
            Maybe Later
          </Button>
        </YStack>
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
});
