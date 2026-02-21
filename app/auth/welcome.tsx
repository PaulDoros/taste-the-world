import {

  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  Easing,
  LinearTransition,
} from 'react-native-reanimated';
import { useUserStore } from '@/store/useUserStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useMutation, useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelectorModal } from '@/components/settings/LanguageSelectorModal';
import { FLAGS } from '@/constants/Translations';

export default function WelcomeScreen() {
  const router = useRouter();
  const loginAsGuest = useUserStore((state) => state.loginAsGuest);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const createGuestUser = useMutation(api.auth.createGuestUser);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Check if user is already logged in - _layout.tsx handles the redirect
  // Check if user is already logged in - _layout.tsx handles the redirect
  const { isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  const SLIDES = [
    {
      id: 0,
      title: t('welcome_slide1_title'),
      subtitle: t('welcome_slide1_subtitle'),
      icon: 'globe-americas',
      backgroundImage: require('@/assets/images/airplane.avif'),
    },
    {
      id: 1,
      title: t('welcome_slide2_title'),
      subtitle: t('welcome_slide2_subtitle'),
      icon: 'robot',
      backgroundImage: require('@/assets/images/boat.avif'),
    },
    {
      id: 2,
      title: t('welcome_slide3_title'),
      subtitle: t('welcome_slide3_subtitle'),
      icon: 'utensils',
      backgroundImage: require('@/assets/images/food.avif'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const convex = useConvex();

  const handleGuestAccess = async () => {
    try {
      setIsLoading(true);

      // Check if we already have a token in the store
      const existingToken = useAuthStore.getState().token;

      if (existingToken) {
        const user = await convex.query(api.auth.verifySession, {
          token: existingToken,
        });

        if (user) {
          console.log('Restoring existing guest session');
          loginAsGuest();
          // Update auth store with user
          useAuthStore.setState({ user });
          router.replace('/(tabs)');
          return;
        } else {
          // Invalid token, clear it
          useAuthStore.setState({ token: null, user: null });
        }
      }

      const result = await createGuestUser();

      // Update Auth Store (this triggers persistence and _layout.tsx redirect)
      useAuthStore.setState({
        token: result.token,
        user: result.user,
      });

      loginAsGuest();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to create/restore guest user:', error);
      alert(t('welcome_guest_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {SLIDES.map((slide, index) => {
        if (index !== currentSlide) return null;
        return (
          <Animated.Image
            key={`bg-${slide.id}`}
            source={slide.backgroundImage}
            style={styles.backgroundImage}
            entering={FadeIn.duration(800)}
            exiting={FadeOut.duration(800)}
            resizeMode="cover"
          />
        );
      })}

      <LinearGradient
        colors={[
          'rgba(15,23,42,0.5)',
          'rgba(30,41,59,0.7)',
          'rgba(15,23,42,0.95)',
        ]}
        style={styles.gradient}
      />

      <Animated.View
        entering={FadeIn.delay(300)}
        style={{
          position: 'absolute',
          top: 60,
          right: 24,
          zIndex: 50,
        }}
      >
        <Pressable
          onPress={() => {
            console.log('Language button pressed');
            setLanguageModalVisible(true);
          }}
          style={({ pressed }) => ({
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 30,
            backgroundColor: 'rgba(255,255,255,0.95)', // High visibility background
            flexDirection: 'row', // Ensure row layout
            alignItems: 'center', // Vertically center items
            gap: 8, // Gap between flag and text
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text style={{ fontSize: 20 }}>{FLAGS[language]}</Text>
          <FontAwesome5 name="globe" size={18} color={colors.tint} />
          <Text
            style={{
              color: colors.tint,
              fontWeight: '800',
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            {t('language').toUpperCase()} ▾
          </Text>
        </Pressable>
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.carouselContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require('@/assets/images/taste-the-world-banner.png')}
              style={{ width: 380, height: 380 }}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.slidesContainer, { height: 120 }]}>
            {SLIDES.map((slide, index) => {
              if (index !== currentSlide) return null;
              return (
                <Animated.View
                  key={slide.id}
                  entering={SlideInRight.duration(500).easing(
                    Easing.out(Easing.cubic)
                  )}
                  exiting={SlideOutLeft.duration(400).easing(
                    Easing.in(Easing.cubic)
                  )}
                  style={styles.slide}
                >
                  <Animated.Text
                    entering={FadeInDown.delay(300).duration(400)}
                    style={styles.subtitle}
                  >
                    {slide.subtitle}
                  </Animated.Text>
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <Animated.View
                key={index}
                layout={LinearTransition.springify()}
                style={[
                  styles.dot,
                  index === currentSlide && {
                    backgroundColor: colors.tint,
                    width: 24,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.actions}
        >
          {authLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.disclaimer, { marginTop: 16 }]}>
                {t('welcome_loading')}
              </Text>
            </View>
          ) : (
            <>
              <Pressable
                onPress={handleLogin}
                style={[styles.button, { backgroundColor: colors.tint }]}
              >
                <Text style={styles.buttonText}>
                  {t('welcome_email_button')}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleGuestAccess}
                style={[styles.button, styles.guestButton]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.guestButtonText}>
                    {t('welcome_guest_button')}
                  </Text>
                )}
              </Pressable>

              <Text style={styles.disclaimer}>
                {t('welcome_guest_disclaimer')}
              </Text>
            </>
          )}
        </Animated.View>
      </View>

      <LanguageSelectorModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  carouselContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  slidesContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: '90%',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
