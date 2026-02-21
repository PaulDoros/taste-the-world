import React from 'react';
import Animated from 'react-native-reanimated';
import { View, ViewProps } from 'react-native';
import { IS_ANDROID } from '@/constants/platform';

/**
 * A drop-in replacement for Animated.View that forces hardware-accelerated
 * offscreen alpha compositing on Android. Uses createAnimatedComponent to
 * ensure Reanimated's Babel plugin and pipeline still process inline shared values
 * successfully without throwing Invariant Violations on transforms.
 */
const BaseView = React.forwardRef<View, ViewProps>((props, ref) => {
  return (
    <View
      ref={ref}
      needsOffscreenAlphaCompositing={
        IS_ANDROID ? true : props.needsOffscreenAlphaCompositing
      }
      renderToHardwareTextureAndroid={
        IS_ANDROID ? true : props.renderToHardwareTextureAndroid
      }
      {...props}
    />
  );
});

BaseView.displayName = 'BaseView';

export const AnimatedView = Animated.createAnimatedComponent(BaseView);
