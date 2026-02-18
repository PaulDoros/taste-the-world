import { Audio } from 'expo-av';

const SOUND_MAP = {
  success: require('@/assets/sounds/success.wav'),
  achievement: require('@/assets/sounds/achievement.wav'),
  error: require('@/assets/sounds/error.wav'),
  tap: require('@/assets/sounds/pop.wav'), // mapping tap to pop
  pop: require('@/assets/sounds/pop.wav'),
  'message-received': require('@/assets/sounds/message-received.wav'),
  'message-sent': require('@/assets/sounds/message-send.wav'),
  'chef-recipe': require('@/assets/sounds/chef-recipe.wav'),
  scratch: require('@/assets/sounds/scratch.wav'),
  trash: require('@/assets/sounds/trash.wav'),
  airplane: require('@/assets/sounds/airplane.wav'),
  check: require('@/assets/sounds/check.wav'),
  'modal-open': require('@/assets/sounds/modal-open.wav'),
  refresh: require('@/assets/sounds/refresh.wav'),
  shutter: require('@/assets/sounds/shutter.wav'),
  stamp: require('@/assets/sounds/stamp.wav'),
  'tab-switch': require('@/assets/sounds/tab-switch.wav'),
  notification: require('@/assets/sounds/notification.wav'),
};

export type SoundType = keyof typeof SOUND_MAP;

export const playSound = async (type: SoundType) => {
  try {
    const soundSource = SOUND_MAP[type];
    if (soundSource) {
      const { sound } = await Audio.Sound.createAsync(soundSource);
      // Play and forget - careful with memory leaks on repeatedly creating sounds without unloading,
      // but for short UI sounds usually fine or auto-unloads.
      // Better pattern:
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      await sound.playAsync();
    }
  } catch (error) {
    console.log('[Sound] Failed to play sound', error);
  }
};
