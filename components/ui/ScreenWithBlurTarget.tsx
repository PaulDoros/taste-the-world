import React, { useRef } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { IS_ANDROID } from '@/constants/platform';
// import { BlurTargetView } from 'expo-blur'; // Not available in SDK 54

export const BlurTargetContext =
  React.createContext<React.RefObject<View | null> | null>(null);

export function ScreenWithBlurTarget({ children, style, ...props }: ViewProps) {
  // We only need the ref on Android 12+ (API 31+) if we want real blur.
  // However, keeping the structure consistent is easier.
  const targetRef = useRef<View>(null);

  // We provide the ref via Context so deeply nested Glass components can access it
  // without prop drilling.

  const content = (
    <BlurTargetContext.Provider value={targetRef}>
      {children}
    </BlurTargetContext.Provider>
  );

  if (IS_ANDROID) {
    return (
      <View style={[styles.container, style]} {...props}>
        {/* Using View as the target owner. The methods in expo-blur (experimental)
                 typically need a ref to the view to be blurred. */}
        <View ref={targetRef} style={styles.flex} collapsable={false}>
          {content}
        </View>
      </View>
    );
  }

  // iOS doesn't need strict targetting usually, but context structure kept for consistency
  return (
    <View style={[styles.container, style]} {...props}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});
