import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';

interface Props {
  source: string | any;
  style?: StyleProp<ViewStyle>;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
}

export const LottieAnimation = ({ source, style }: Props) => {
  // Web Fallback: Just render a placeholder or nothing
  // Ideally, we could render a static image if source was an image, but Lottie source is JSON
  return (
    <View
      style={[
        style,
        {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.05)',
        },
      ]}
    >
      <Text style={{ fontSize: 10, color: '#888' }}>Animation</Text>
    </View>
  );
};
