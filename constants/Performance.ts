import { Platform } from 'react-native';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function parseBooleanFlag(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) return fallback;
  return TRUE_VALUES.has(normalized);
}

// Global performance switch:
// true  -> favor smoothness on Android (disable costly blur paths)
// false -> allow full visual effects on Android
const androidLowPerfEnabled = parseBooleanFlag(
  process.env.EXPO_PUBLIC_ANDROID_LOW_PERF,
  true
);

export const isAndroidLowPerf =
  Platform.OS === 'android' && androidLowPerfEnabled;

export const shouldUseGlassBlur = !isAndroidLowPerf;
