import { useAudioPlayer } from 'expo-audio';

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

/**
 * React hook to play short UI sounds.
 * Must be called from inside a React component.
 *
 * Usage:
 *   const playSound = useSoundPlayer();
 *   playSound('success');
 */
export function useSoundPlayer() {
  // We can't dynamically switch sources, so we create a simple wrapper
  // that creates a player on-the-fly for the requested sound.
  return (type: SoundType) => {
    playSound(type);
  };
}

/**
 * Play a short UI sound. Can be called from anywhere.
 * Uses the global Audio API from expo-audio.
 */
export const playSound = async (type: SoundType) => {
  try {
    const soundSource = SOUND_MAP[type];
    if (soundSource) {
      // expo-audio: createAudioPlayer for non-component contexts
      const { createAudioPlayer } = await import('expo-audio');
      const player = createAudioPlayer(soundSource);
      player.play();
      // Auto-cleanup after playback finishes
      const checkInterval = setInterval(() => {
        if (!player.playing) {
          clearInterval(checkInterval);
          player.remove();
        }
      }, 500);
      // Safety cleanup after 10s max
      setTimeout(() => {
        clearInterval(checkInterval);
        try {
          player.remove();
        } catch {}
      }, 10000);
    }
  } catch (error) {
    console.log('[Sound] Failed to play sound', error);
  }
};
