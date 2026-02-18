import {
  GetProps,
  styled,
  Button as TamaguiButton,
  Text as TamaguiText,
  Spinner,
  createStyledContext,
  withStaticProperties,
  View,
} from 'tamagui';
import React from 'react';

// 1. Create Context for compound logic (size propagation)
export const ButtonContext = createStyledContext({
  size: '$medium',
  variant: 'primary',
});

// 2. Styled Frame (The Container)
const ButtonFrame = styled(TamaguiButton, {
  userSelect: 'none',
  context: ButtonContext,
  borderRadius: '$4',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  pressStyle: { scale: 0.98 },
  animation: 'bouncy',

  // Base sizing
  paddingVertical: '$3',
  paddingHorizontal: '$4',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$tint',
        color: 'white',
        borderWidth: 0,
        hoverStyle: { backgroundColor: '$tint', opacity: 0.9 },
        pressStyle: { backgroundColor: '$tint', opacity: 0.8 },
      },
      secondary: {
        backgroundColor: '$surface',
        color: '$color',
        borderWidth: 1,
        borderColor: '$borderColor',
        hoverStyle: { backgroundColor: '$backgroundHover' },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '$tint',
        color: '$tint',
        hoverStyle: {
          borderColor: '$tint',
          backgroundColor: '$backgroundHover',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: '$tint',
        hoverStyle: { backgroundColor: '$backgroundHover' },
      },
    },

    size: {
      small: {
        height: 44,
        paddingHorizontal: '$3',
      },
      medium: {
        height: 56,
        paddingHorizontal: '$4',
      },
      large: {
        height: 64,
        paddingHorizontal: '$6',
      },
    },

    fullWidth: {
      true: {
        width: '100%',
        alignSelf: 'stretch',
      },
    },

    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

// 3. Styled Text (The Label)
const ButtonText = styled(TamaguiText, {
  context: ButtonContext,
  textAlign: 'center',
  fontWeight: '600',
  fontFamily: '$body', // Ensure you have a font token

  variants: {
    size: {
      small: { fontSize: '$3' },
      medium: { fontSize: '$4' },
      large: { fontSize: '$6' },
      // '$medium': { fontSize: '$4' }
    },
    variant: {
      primary: { color: 'white' },
      secondary: { color: '$color' },
      outline: { color: '$tint' },
      ghost: { color: '$tint' },
    },
  } as const,
});

// 4. Styled Icon (Helper)
const ButtonIcon = styled(View, {
  context: ButtonContext,
  variants: {
    size: {
      small: { scale: 0.9 },
      medium: { scale: 1 },
      large: { scale: 1.2 },
    },
  } as const,
});

// 5. Types
type ButtonProps = GetProps<typeof ButtonFrame> & {
  title?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

// 6. The Component
const ButtonComponent = React.forwardRef<any, ButtonProps>((props, ref) => {
  const { title, loading, leftIcon, rightIcon, children, ...rest } = props;

  return (
    <ButtonFrame ref={ref} {...rest}>
      {loading ? (
        <Spinner color={props.variant === 'primary' ? 'white' : '$tint'} />
      ) : (
        <>
          {leftIcon && <ButtonIcon marginRight="$2">{leftIcon}</ButtonIcon>}

          {/* Support both children (compound) and title prop (simple) */}
          {children ? children : <ButtonText>{title}</ButtonText>}

          {rightIcon && <ButtonIcon marginLeft="$2">{rightIcon}</ButtonIcon>}
        </>
      )}
    </ButtonFrame>
  );
});

// 7. Compound Export
export const Button = withStaticProperties(ButtonComponent, {
  Text: ButtonText,
  Icon: ButtonIcon,
  Props: ButtonContext.Provider,
});
