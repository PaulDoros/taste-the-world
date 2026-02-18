import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
} from 'react-native';
import { Sheet, Text, XStack, YStack, ScrollView, Button } from 'tamagui';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import { AVATARS } from '@/constants/Avatars';
import { BADGES, BadgeDef } from '@/constants/Badges';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useState } from 'react';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_COUNT = 3;
const GAP = 10;
const ITEM_WIDTH =
  (SCREEN_WIDTH - 40 - (COLUMN_COUNT - 1) * GAP) / COLUMN_COUNT;

const FRAMES = [
  {
    id: 'frame_1',
    name: 'Rookie Frame',
    unlockLevel: 1,
    source: require('@/assets/animations/Avatar-frame-one-star.json'),
  },
  {
    id: 'frame_2',
    name: 'Sous Chef Frame',
    unlockLevel: 10,
    source: require('@/assets/animations/Avatar-frame-two-stars.json'),
  },
  {
    id: 'frame_3',
    name: 'Master Frame',
    unlockLevel: 20,
    source: require('@/assets/animations/Avatar-frame-three-stars.json'),
  },
];

interface AvatarSelectorProps {
  visible: boolean;
  onClose: () => void;
  currentAvatar?: string;
  userLevel: number;
  unlockedBadgeIds: string[];
  onSelect: (avatarId: string) => void;
  onUpload: () => void;
}

import { useLanguage } from '@/context/LanguageContext';

export const AvatarSelector = ({
  visible,
  onClose,
  currentAvatar,
  userLevel,
  unlockedBadgeIds = [],
  onSelect,
  onUpload,
}: AvatarSelectorProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<
    'avatars' | 'badges' | 'frames'
  >('avatars');

  // Determine Frame based on Level
  const getFrameSource = () => {
    if (userLevel >= 20)
      return require('@/assets/animations/Avatar-frame-three-stars.json');
    if (userLevel >= 10)
      return require('@/assets/animations/Avatar-frame-two-stars.json');
    return require('@/assets/animations/Avatar-frame-one-star.json');
  };

  const frameSource = getFrameSource();

  // Show all badges with Lottie sources (both locked and unlocked)
  const availableBadges = BADGES.filter((b) => b.lottieSource);
  const unlockedBadgesCount = unlockedBadgeIds.filter((id) =>
    BADGES.find((b) => b.id === id && b.lottieSource)
  ).length;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#1F2937' : 'white' },
          ]}
        >
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom="$4"
          >
            <Text fontSize="$6" fontWeight="bold" color={colors.text}>
              {t('avatar_choose')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </XStack>

          {/* Tab Switcher */}
          <XStack
            backgroundColor={isDark ? '#374151' : '#F3F4F6'}
            borderRadius={12}
            padding={4}
            marginBottom="$4"
          >
            <TouchableOpacity
              onPress={() => setSelectedTab('avatars')}
              style={[
                styles.tab,
                selectedTab === 'avatars' && {
                  backgroundColor: colors.background,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                },
              ]}
            >
              <Text
                fontWeight={selectedTab === 'avatars' ? '700' : '400'}
                color={colors.text}
              >
                {t('avatar_tab_avatars')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('badges')}
              style={[
                styles.tab,
                selectedTab === 'badges' && {
                  backgroundColor: colors.background,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                },
              ]}
            >
              <Text
                fontWeight={selectedTab === 'badges' ? '700' : '400'}
                color={colors.text}
              >
                {t('avatar_tab_badges', {
                  count: `${unlockedBadgesCount}/${availableBadges.length}`,
                })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('frames')}
              style={[
                styles.tab,
                selectedTab === 'frames' && {
                  backgroundColor: colors.background,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                },
              ]}
            >
              <Text
                fontWeight={selectedTab === 'frames' ? '700' : '400'}
                color={colors.text}
              >
                {t('avatar_tab_frames')}
              </Text>
            </TouchableOpacity>
          </XStack>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Upload Option (Always top) */}
            {selectedTab !== 'frames' && (
              <TouchableOpacity
                onPress={onUpload}
                style={[styles.uploadButton, { borderColor: colors.border }]}
              >
                <XStack alignItems="center" space="$3">
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.tint },
                    ]}
                  >
                    <FontAwesome5 name="camera" size={16} color="white" />
                  </View>
                  <YStack>
                    <Text fontWeight="600" color={colors.text}>
                      {t('avatar_upload')}
                    </Text>
                    <Text fontSize="$2" opacity={0.6} color={colors.text}>
                      {t('avatar_library')}
                    </Text>
                  </YStack>
                </XStack>
              </TouchableOpacity>
            )}

            <Text
              fontSize="$4"
              fontWeight="600"
              marginTop="$4"
              marginBottom="$3"
              color={colors.text}
            >
              {selectedTab === 'avatars'
                ? t('avatar_unlockable')
                : selectedTab === 'badges'
                  ? t('avatar_earned_badges')
                  : t('avatar_unlockable_frames')}
            </Text>

            <XStack flexWrap="wrap" gap={GAP}>
              {selectedTab === 'avatars'
                ? AVATARS.map((avatar) => {
                    const isUnlocked = userLevel >= avatar.unlockLevel;
                    const isSelected = currentAvatar === avatar.id;

                    return (
                      <TouchableOpacity
                        key={avatar.id}
                        disabled={!isUnlocked}
                        onPress={() => onSelect(avatar.id)}
                        style={[
                          styles.avatarCard,
                          {
                            backgroundColor: isDark ? '#374151' : '#F3F4F6',
                            borderColor: isSelected
                              ? colors.tint
                              : 'transparent',
                            borderWidth: isSelected ? 2 : 0,
                            opacity: isUnlocked ? 1 : 0.6,
                          },
                        ]}
                      >
                        <View style={styles.lottieWrapper}>
                          {/* Frame - Only show if selected or unlocked preview */}
                          {isSelected && (
                            <LottieView
                              source={frameSource}
                              autoPlay
                              loop
                              style={styles.frameLottie}
                            />
                          )}

                          {/* Avatar */}
                          <View style={styles.innerAvatar}>
                            <LottieView
                              source={avatar.lottie}
                              autoPlay={isUnlocked}
                              loop={true}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </View>

                          {!isUnlocked && (
                            <View style={styles.lockOverlay}>
                              <FontAwesome5
                                name="lock"
                                size={16}
                                color="white"
                              />
                            </View>
                          )}
                        </View>

                        <Text
                          fontSize="$2"
                          fontWeight="600"
                          marginTop="$2"
                          color={colors.text}
                          textAlign="center"
                          numberOfLines={1}
                        >
                          {avatar.name}
                        </Text>
                        {!isUnlocked && (
                          <Text fontSize={10} color={colors.text} opacity={0.6}>
                            {t('avatar_level_req', {
                              level: avatar.unlockLevel,
                            })}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                : selectedTab === 'badges'
                  ? availableBadges.map((badge) => {
                      const isUnlocked = unlockedBadgeIds.includes(badge.id);
                      const isSelected = currentAvatar === badge.id;
                      return (
                        <TouchableOpacity
                          key={badge.id}
                          disabled={!isUnlocked}
                          onPress={() => onSelect(badge.id)}
                          style={[
                            styles.avatarCard,
                            {
                              backgroundColor: isDark ? '#374151' : '#F3F4F6',
                              borderColor: isSelected
                                ? colors.tint
                                : 'transparent',
                              borderWidth: isSelected ? 2 : 0,
                              opacity: isUnlocked ? 1 : 0.6,
                            },
                          ]}
                        >
                          <View style={styles.lottieWrapper}>
                            {isSelected && (
                              <LottieView
                                source={frameSource}
                                autoPlay
                                loop
                                style={styles.frameLottie}
                              />
                            )}
                            <View style={styles.innerAvatar}>
                              <LottieView
                                source={badge.lottieSource}
                                autoPlay={isUnlocked}
                                loop
                                style={{ width: '100%', height: '100%' }}
                              />
                            </View>
                            {!isUnlocked && (
                              <View style={styles.lockOverlay}>
                                <FontAwesome5
                                  name="lock"
                                  size={16}
                                  color="white"
                                />
                              </View>
                            )}
                          </View>
                          <Text
                            fontSize="$2"
                            fontWeight="600"
                            marginTop="$2"
                            color={colors.text}
                            textAlign="center"
                            numberOfLines={2}
                            style={{ height: 32 }}
                          >
                            {t(badge.titleKey as any)}
                          </Text>
                          {!isUnlocked && (
                            <Text
                              fontSize={10}
                              color={colors.text}
                              opacity={0.6}
                            >
                              {t('gamification_locked')}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  : FRAMES.map((frame) => {
                      const isUnlocked = userLevel >= frame.unlockLevel;
                      // Determine if this is the ACTIVE frame based on level
                      const isActive =
                        frame.source === frameSource && isUnlocked;

                      return (
                        <View
                          key={frame.id}
                          style={[
                            styles.avatarCard,
                            {
                              backgroundColor: isDark ? '#374151' : '#F3F4F6',
                              borderColor: isActive
                                ? colors.tint
                                : 'transparent',
                              borderWidth: isActive ? 2 : 0,
                              opacity: isUnlocked ? 1 : 0.6,
                            },
                          ]}
                        >
                          <View style={styles.lottieWrapper}>
                            <LottieView
                              source={frame.source}
                              autoPlay
                              loop
                              style={styles.frameLottie}
                            />
                            {/* Empty or Placeholder inside */}
                            <View
                              style={[
                                styles.innerAvatar,
                                {
                                  backgroundColor: isDark
                                    ? '#1F2937'
                                    : '#E5E7EB',
                                  borderRadius: 28,
                                },
                              ]}
                            />

                            {!isUnlocked && (
                              <View style={styles.lockOverlay}>
                                <FontAwesome5
                                  name="lock"
                                  size={16}
                                  color="white"
                                />
                              </View>
                            )}
                          </View>
                          <Text
                            fontSize="$2"
                            fontWeight="600"
                            marginTop="$2"
                            color={colors.text}
                            textAlign="center"
                            numberOfLines={2}
                          >
                            {frame.name}
                          </Text>
                          {!isUnlocked ? (
                            <Text
                              fontSize={10}
                              color={colors.text}
                              opacity={0.6}
                            >
                              {t('avatar_level_req', {
                                level: frame.unlockLevel,
                              })}
                            </Text>
                          ) : isActive ? (
                            <Text fontSize={10} color={colors.tint}>
                              {t('avatar_equipped')}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })}
            </XStack>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCard: {
    width: ITEM_WIDTH,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  lottieWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  frameLottie: {
    position: 'absolute',
    width: 110, // Frame needs to be larger than content
    height: 110,
    zIndex: 2,
    pointerEvents: 'none',
  },
  innerAvatar: {
    width: 56,
    height: 56,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    zIndex: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});
