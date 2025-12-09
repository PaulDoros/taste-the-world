declare module 'react-native-animated-spinkit' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface SpinnerProps {
    size?: number;
    color?: string;
    style?: ViewStyle;
    isVisible?: boolean;
  }

  export class Plane extends Component<SpinnerProps> {}
  export class ChasingDots extends Component<SpinnerProps> {}
  export class Circle extends Component<SpinnerProps> {}
  export class CubeGrid extends Component<SpinnerProps> {}
  export class DoubleBounce extends Component<SpinnerProps> {}
  export class FadingCircle extends Component<SpinnerProps> {}
  export class FadingCircleAlt extends Component<SpinnerProps> {}
  export class Pulse extends Component<SpinnerProps> {}
  export class ThreeBounce extends Component<SpinnerProps> {}
  export class WanderingCubes extends Component<SpinnerProps> {}
  export class Wave extends Component<SpinnerProps> {}
}
