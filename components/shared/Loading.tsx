import React from 'react';
import { Dimensions } from 'react-native';
import { YStack, useTheme } from 'tamagui';
import { LottieAnimation } from './LottieAnimation';

const { width } = Dimensions.get('window');

interface Props {
  fullScreen?: boolean;
}

export const Loading = ({ fullScreen = true }: Props) => {
  const theme = useTheme();

  return (
    <YStack
      flex={fullScreen ? 1 : 0}
      backgroundColor="$background"
      justifyContent="center"
      alignItems="center"
      padding="$4"
    >
      <LottieAnimation
        source={require('@/assets/animations/loading.json')}
        style={{ width: width * 0.4, height: width * 0.4 }}
        autoPlay
        loop
      />
    </YStack>
  );
};
