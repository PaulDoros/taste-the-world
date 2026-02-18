import React, { useRef, useEffect } from 'react';
import LottieView from 'lottie-react-native';
import { StyleProp, ViewStyle } from 'react-native';

interface Props {
  source: string | any;
  style?: StyleProp<ViewStyle>;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
}

export const LottieAnimation = ({
  source,
  style,
  loop = true,
  autoPlay = true,
  speed = 1,
}: Props) => {
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay) {
      animation.current?.play();
    }
  }, [autoPlay]);

  return (
    <LottieView
      ref={animation}
      source={source}
      style={style}
      loop={loop}
      autoPlay={autoPlay}
      speed={speed}
    />
  );
};
