import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { usePremium } from '@/hooks/usePremium';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  message?: string;
}

/**
 * Premium Gate Component
 * Restricts access to content based on premium subscription status
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  fallback,
  title = 'Premium Feature',
  message = 'Upgrade to Premium to unlock this feature and explore the world without limits!',
}) => {
  const { isPremium } = usePremium();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Animated.View 
      entering={FadeInUp.springify()}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.premium + '20' }]}>
        <FontAwesome5 name="crown" size={32} color={colors.premium} solid />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      
      <Pressable
        onPress={() => router.push('/(tabs)/settings')}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.premium, opacity: pressed ? 0.8 : 1 }
        ]}
      >
        <Text style={styles.buttonText}>Upgrade to Premium</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    margin: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
