import { View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ScreenLayout } from '@/components/ScreenLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import Markdown from 'react-native-markdown-display';
import { ScrollView } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* 
  Ideally, fetch these from a remote URL or keeping them in a separate file.
  For now, hardcoded for simplicity as requested.
*/

const PRIVACY_POLICY = `
# Privacy Policy

**Last Updated:** February 15, 2026

## 1. Introduction
"Taste the World" ("we," "our," or "us") respects your privacy. This Privacy Policy describes how we collect, use, process, and disclose your information, including personal information, in conjunction with your access to and use of our mobile application.

## 2. Information We Collect

### 2.1 Information You Give to Us
- **Account Information:** When you sign up, we collect your email address, name, and profile photo.
- **User Content:** Ingredients, recipes, photos, meal preferences, and other content you generate or upload.

### 2.2 Information Automatically Collected
- **Usage Data:** Pages or content you view, your searches for recipes/travel, features you use, and timestamps.
- **Device Information:** Device model, operating system, unique device identifiers (e.g., IDFA/AAID), and mobile network information.
- **Location Information:** General location data (IP address) to provide localized content.

## 3. How We Use Information
We use your information to:
- Provide, improve, and develop the App (e.g., generating AI recipes).
- Provide, personalize, measure, and improve our advertising and marketing.
- Process payments and manage subscriptions via RevenueCat.

## 4. Sharing & Disclosure
We may share information with service providers to help us operate our business:
- **Convex:** Backend database and serverless functions.
- **Google Gemini / OpenAI:** Artificial Intelligence services.
- **RevenueCat:** In-app purchase and subscription infrastructure.
- **Google AdMob:** Advertising services.

## 5. Your Rights (GDPR & CCPA)
Depending on your location, you may have the right to:
- **Access:** Request a copy of your data.
- **Delete:** Request deletion of your account and data.
- **Opt-out:** Opt-out of marketing communications.

To exercise these rights, please contact us via the App settings.

## 6. Data Security
We implement appropriate technical and organizational measures to protect your personal data.

## 7. Contact Us
**support@tastetheworld.app**
`;

const TERMS_CONDITIONS = `
# Terms and Conditions (EULA)

**Last Updated:** February 15, 2026

## 1. Acknowledgment
These Terms cover your use of "Taste the World". By creating an account or using the App, you agree to these terms.

## 2. Artificial Intelligence (AI) Disclaimer
- **No Professional Advice:** The App uses AI to generate recipes, nutritional info, and travel advice. This is for informational purposes only.
- **Accuracy:** AI may generate incorrect or dangerous information. **ALWAYS use common sense and verify food safety.**
- **Allergies:** You are solely responsible for checking ingredients for allergies.

## 3. Subscriptions & Payments
- **Billing:** Subscriptions ("Premium") are billed to your Apple ID or Google Play Account.
- **Auto-Renewal:** Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.
- **Cancellation:** Manage and cancel subscriptions in your Account Settings on the App Store / Play Store.
- **Refunds:** Directed to Apple or Google.

## 4. User Content
- **License:** By uploading content, you grant us a non-exclusive license to use it in connection with the App.
- **Prohibited:** Illegal or offensive content is prohibited.

## 5. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, "TASTE THE WORLD" SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

## 6. Contact Us
support@tastetheworld.app
`;

export default function LegalScreen() {
  const params = useLocalSearchParams();
  const type = params.type as string;
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const content = type === 'terms' ? TERMS_CONDITIONS : PRIVACY_POLICY;
  const title = type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy';

  return (
    <ScreenLayout disableBackground>
      <Stack.Screen options={{ title: title, headerBackTitle: 'Settings' }} />
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard borderRadius={16}>
          <View style={{ padding: 20 }}>
            <Markdown
              style={{
                body: { color: colors.text, fontSize: 16, lineHeight: 24 },
                heading1: {
                  color: colors.text,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginTop: 10,
                  marginBottom: 10,
                },
                heading2: {
                  color: colors.text,
                  fontSize: 20,
                  fontWeight: '600',
                  marginTop: 20,
                  marginBottom: 10,
                },
                strong: { fontWeight: 'bold', color: colors.tint },
              }}
            >
              {content}
            </Markdown>
          </View>
        </GlassCard>

        <View style={{ height: 20 }} />

        <GlassButton
          label="Close"
          onPress={() => router.back()}
          size="medium"
        />
      </ScrollView>
    </ScreenLayout>
  );
}
