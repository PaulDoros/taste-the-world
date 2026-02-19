import React from 'react';

export interface GlassButtonProps {
  onPress: () => void;
  icon?: string;
  iconComponent?: React.ReactNode;
  label?: string | React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'active';
  disabled?: boolean;
  loading?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  intensity?: number;
  shadowOpacity?: number;
  shadowColor?: string;
  shadowRadius?: number;
  textColor?: string;
  style?: any;
  rightIcon?: React.ReactNode;
  solid?: boolean;
  androidFallbackBase?: string;
  androidElevation?: string;
}
