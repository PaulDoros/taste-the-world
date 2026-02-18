import React from 'react';
import { Text } from 'tamagui';
import { Pressable } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '@/utils/haptics';

interface PlannerDayItemProps {
  day: any;
  index: number;
  isActive: boolean;
  setActiveDay: (index: number) => void;
  latestPlan: any;
  colors: any;
  t: (key: any) => string;
  language: string;
}

export const PlannerDayItem = ({
  index,
  isActive,
  setActiveDay,
  latestPlan,
  colors,
  t,
  language,
}: PlannerDayItemProps) => {
  const planStartDate = latestPlan?.startDate || Date.now();
  const date = new Date(planStartDate);
  date.setDate(date.getDate() + index);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive ? 1.1 : 1, {
          damping: 20,
          stiffness: 200,
        }),
      },
    ],
  }));

  return (
    <Animated.View
      key={index}
      entering={FadeInRight.delay(index * 50)
        .springify()
        .damping(50)}
    >
      <Pressable
        onPress={() => {
          haptics.light();
          setActiveDay(index);
        }}
      >
        <Animated.View style={scaleStyle}>
          <LinearGradient
            colors={
              isActive ? [colors.tint, colors.tint] : [colors.card, colors.card]
            }
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              width: 70,
              borderRadius: 35,
              borderWidth: isActive ? 0 : 1,
              borderColor: '$borderColor',
              elevation: isActive ? 4 : 0,
              shadowColor: colors.tint,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isActive ? 0.3 : 0,
              shadowRadius: 8,
              marginVertical: 8,
            }}
          >
            <Text
              color={isActive ? 'white' : colors.text}
              opacity={isActive ? 0.9 : 0.5}
              fontSize="$2"
              fontWeight="700"
              marginBottom={4}
            >
              {date
                .toLocaleDateString(language, { weekday: 'short' })
                .toUpperCase()}
            </Text>
            <Text
              color={isActive ? 'white' : colors.text}
              fontSize="$6"
              fontWeight="800"
            >
              {date.getDate()}
            </Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
