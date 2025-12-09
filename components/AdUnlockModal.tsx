import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';

interface AdUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  onUnlock: () => void;
  countryName: string;
}

export const AdUnlockModal: React.FC<AdUnlockModalProps> = ({
  visible,
  onClose,
  onUnlock,
  countryName,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [stage, setStage] = useState<'prompt' | 'watching' | 'reward'>(
    'prompt'
  );
  const [timeLeft, setTimeLeft] = useState(5);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setStage('prompt');
      setTimeLeft(5);
      progress.value = 0;
    }
  }, [visible]);

  useEffect(() => {
    let timer: any;
    if (stage === 'watching') {
      progress.value = withTiming(1, {
        duration: 5000,
        easing: Easing.linear,
      });

      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStage('reward');
            haptics.success();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  const handleWatchAd = () => {
    haptics.medium();
    setStage('watching');
  };

  const handleClaimReward = () => {
    haptics.success();
    onUnlock();
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            width: '100%',
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {stage === 'prompt' && (
            <>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: `${colors.tint}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <FontAwesome5 name="lock-open" size={32} color={colors.tint} />
              </View>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                Unlock {countryName}
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: colors.text,
                  opacity: 0.7,
                  textAlign: 'center',
                  marginBottom: 32,
                  lineHeight: 24,
                }}
              >
                Watch a short video ad to permanently unlock {countryName} and
                access its local recipes and travel tips.
              </Text>

              <Pressable
                onPress={handleWatchAd}
                style={({ pressed }) => ({
                  width: '100%',
                  backgroundColor: colors.tint,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                  marginBottom: 12,
                })}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: '600',
                  }}
                >
                  Watch Ad to Unlock
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    opacity: 0.6,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
            </>
          )}

          {stage === 'watching' && (
            <>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 24,
                }}
              >
                Watching Ad...
              </Text>

              <View
                style={{
                  width: '100%',
                  height: 8,
                  backgroundColor: colors.border,
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                <Animated.View
                  style={[
                    {
                      height: '100%',
                      backgroundColor: colors.tint,
                    },
                    progressStyle,
                  ]}
                />
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.text,
                  opacity: 0.6,
                }}
              >
                Reward in {timeLeft}s
              </Text>
            </>
          )}

          {stage === 'reward' && (
            <>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#4ADE80',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <FontAwesome5 name="check" size={40} color="#fff" />
              </View>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Reward Granted!
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: colors.text,
                  opacity: 0.7,
                  marginBottom: 32,
                  textAlign: 'center',
                }}
              >
                {countryName} has been successfully unlocked.
              </Text>

              <Pressable
                onPress={handleClaimReward}
                style={({ pressed }) => ({
                  width: '100%',
                  backgroundColor: colors.tint,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: '600',
                  }}
                >
                  Start Exploring
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};
