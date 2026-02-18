import React from 'react';
import { ViewStyle } from 'react-native'; // Removed View, StyleSheet
import { useColorScheme } from '@/components/useColorScheme';
// Removed gradients, lightTheme, darkTheme
import {
  SafeAreaView,
  SafeAreaViewProps,
} from 'react-native-safe-area-context';
import { YStack, useTheme } from 'tamagui';

import { AmbientBackground } from '@/components/ui/AmbientBackground';

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
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <YStack flex={1} backgroundColor="$background">
      {!disableGradient && !disableBackground && <AmbientBackground />}
      <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </YStack>
  );
};
