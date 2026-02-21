import React from 'react';
import { Pressable, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Text } from 'tamagui';
import { haptics } from '@/utils/haptics';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';

interface GlassButtonProps {
  onPress: () => void;
  icon?: string;
  iconComponent?: React.ReactNode;
  label?: string | React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'active';
  disabled?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  textColor?: string;
  style?: any;
  rightIcon?: React.ReactNode;
  solid?: boolean;

  androidFallbackBase?: string;
  androidBorderColor?: string;
  androidOverlayOpacity?: number;
  androidElevation?: number;
}

export const GlassButton = ({
  onPress,
  icon,
  iconComponent,
  label,
  size = 'medium',
  variant = 'default',
  disabled = false,
  backgroundColor,
  textColor: customTextColor,
  style,
  rightIcon,
  solid,
  androidElevation,
}: GlassButtonProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isActive = variant === 'active';

  const sizes = {
    small: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 12,
      iconSize: 12,
      borderRadius: 12,
    },
    medium: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: 14,
      iconSize: 14,
      borderRadius: 16,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      fontSize: 16,
      iconSize: 16,
      borderRadius: 16,
    },
  } as const;

  const currentSize = sizes[size];
  const r = currentSize.borderRadius;

  const handlePress = () => {
    if (disabled) return;
    haptics.selection();
    onPress();
  };

  // Translucency check to drop elevation
  const isTransparentSurface = backgroundColor === 'transparent';
  const hasTranslucency =
    isTransparentSurface ||
    (backgroundColor &&
      (backgroundColor.includes('rgba') ||
        backgroundColor.includes('0.') ||
        (backgroundColor.startsWith('#') && backgroundColor.length === 9)));

  const finalBackgroundColor =
    backgroundColor || (isActive ? colors.tint : colors.card);
  const finalElevation =
    androidElevation !== undefined ? androidElevation : hasTranslucency ? 0 : 2;
  const finalTextColor =
    customTextColor || (isActive && !backgroundColor ? '#FFFFFF' : colors.text);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: finalBackgroundColor,
          borderRadius: r,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor:
            isActive && !backgroundColor ? colors.tint : colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: finalElevation,
        },
        style,
      ]}
    >
      {iconComponent ? (
        iconComponent
      ) : icon ? (
        <FontAwesome5
          name={icon}
          size={currentSize.iconSize}
          color={finalTextColor}
          solid={solid}
        />
      ) : null}

      {typeof label === 'string' ? (
        label ? (
          <Text
            color={finalTextColor}
            fontSize={currentSize.fontSize}
            fontWeight="600"
          >
            {label}
          </Text>
        ) : null
      ) : (
        label
      )}

      {rightIcon}
    </Pressable>
  );
};
