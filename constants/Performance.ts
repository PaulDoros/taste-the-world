import { IS_ANDROID } from '@/constants/platform';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function parseBooleanFlag(
  value: string | undefined,
  fallback: boolean
): boolean {
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
  IS_ANDROID && androidLowPerfEnabled;

// Diagnostics switch:
// true  -> disable most motion-heavy effects on Android for A/B perf testing
// false -> keep normal animation behavior
const androidDisableAnimationsEnabled = parseBooleanFlag(
  process.env.EXPO_PUBLIC_ANDROID_DISABLE_ANIMATIONS,
  false
);

export const isAndroidAnimationsDisabled =
  IS_ANDROID && androidDisableAnimationsEnabled;

export const shouldUseGlassBlur = !isAndroidLowPerf;
