import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUserStore } from '@/store/useUserStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const loginAsGuest = useUserStore((state) => state.loginAsGuest);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleGuestAccess = () => {
    loginAsGuest();
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
        }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        <View style={styles.content}>
          {/* Logo / Title Area */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="utensils" size={40} color="#fff" />
            </View>
            <Text style={styles.title}>Taste the World</Text>
            <Text style={styles.subtitle}>
              Discover authentic recipes from every corner of the globe.
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.actions}
          >
            <Pressable
              onPress={handleLogin}
              style={[styles.button, { backgroundColor: colors.tint }]}
            >
              <Text style={styles.buttonText}>Continue with Email</Text>
            </Pressable>

            <Pressable
              onPress={handleGuestAccess}
              style={[styles.button, styles.guestButton]}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </Pressable>

            <Text style={styles.disclaimer}>
              Guest access has limited features.
            </Text>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: '80%',
  },
  actions: {
    gap: 16,
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  guestButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  guestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
