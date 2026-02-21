import React, { useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FadeInImageProps extends Omit<ImageProps, 'style'> {
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ImageStyle>;
  duration?: number;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

export const FadeInImage: React.FC<FadeInImageProps> = ({
  style,
  containerStyle,
  duration = 500,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const opacity = useSharedValue(0);

  const handleLoad = () => {
    setIsLoaded(true);
    opacity.value = withTiming(1, { duration });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[{ overflow: 'hidden' }, containerStyle, style]}>
      {/* Optional: Add a subtle loading background color here if desired */}
      <AnimatedImage
        {...props}
        style={[style, animatedStyle]}
        onLoad={handleLoad}
      />
    </View>
  );
};
