import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { View } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PricingSection } from '@/components/settings/PricingSection';
import { BenefitsGrid } from '@/components/BenefitsGrid';
import { useState } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { YStack, Text, Card, Button } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { haptics } from '@/utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme/gradients';
import { getBenefits } from '@/constants/Benefits';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { IS_IOS } from '@/constants/platform';

export default function ModalScreen() {
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isProcessing, purchasePackage } = usePremium();
  const { showSuccess } = useAlertDialog();
  const { t } = useLanguage();
  const [selectedSubscription, setSelectedSubscription] = useState<
    'monthly' | 'yearly'
  >('yearly');
  const [selectedTier, setSelectedTier] = useState<'personal' | 'pro'>('pro');

  const handleUpgrade = async (pack?: any) => {
    haptics.light();
    if (pack) {
      await purchasePackage(pack);
    }
    showSuccess(
      t('modal_success_detail', {
        plan:
          selectedSubscription === 'monthly'
            ? t('common_monthly')
            : t('common_yearly'),
      }),
      () => {
        haptics.success();
        router.back();
      }
    );
  };

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
                {t('modal_unlock_premium')}
              </Text>
              <Text
                fontSize="$4"
                opacity={0.8}
                textAlign="center"
                maxWidth={300}
                color="white"
              >
                {feature
                  ? t('modal_upgrade_unlock', { feature })
                  : t('modal_get_unlimited')}
              </Text>
            </LinearGradient>
          </Card>

          {/* Pricing Section */}
          <PricingSection
            selectedSubscription={selectedSubscription}
            selectedTier={selectedTier}
            onSelectSubscription={setSelectedSubscription}
            onSelectTier={setSelectedTier}
            onUpgrade={handleUpgrade}
          />

          {/* Detailed Benefits - Using Reusable Component */}
          <BenefitsGrid
            layout="list"
            benefits={getBenefits(t)}
            accentColor={colors.tint}
          />

          {/* Close Button */}
          <Button
            variant="outlined"
            onPress={() => router.back()}
            marginTop="$2"
            marginBottom="$6"
            borderColor="$borderColor"
          >
            {t('modal_maybe_later')}
          </Button>
        </YStack>
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={IS_IOS ? 'light' : 'auto'} />
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
