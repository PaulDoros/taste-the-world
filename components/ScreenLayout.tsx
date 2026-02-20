import React from 'react';
import { ViewStyle } from 'react-native'; // Removed View, StyleSheet
// Removed gradients, lightTheme, darkTheme
import {
  SafeAreaView,
  SafeAreaViewProps,
} from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { isAndroidAnimationsDisabled } from '@/constants/Performance';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: SafeAreaViewProps['edges'];
  disableGradient?: boolean;
  disableBackground?: boolean;
  backgroundStyle?: 'plain' | 'gradient';
}

export const ScreenLayout = ({
  children,
  style,
  edges = ['top'],
  disableGradient = false, // Legacy name, often used for bg
  disableBackground = false,
  backgroundStyle,
}: ScreenLayoutProps) => {
  return (
    <YStack flex={1} backgroundColor="$background">
      {!disableGradient &&
        !disableBackground &&
        !isAndroidAnimationsDisabled && <AmbientBackground />}
      <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </YStack>
  );
};
