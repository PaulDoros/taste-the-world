import React, { useEffect, useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { YStack, XStack, Paragraph, Heading, useTheme } from 'tamagui';

const CountingNumber = ({
  value,
  color,
}: {
  value: string | number;
  color: string;
}) => {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    let numericValue = 0;
    let suffix = '';

    if (typeof value === 'number') {
      numericValue = value;
    } else {
      const match = value.toString().match(/(\d+)(.*)/);
      if (match) {
        numericValue = parseInt(match[1], 10);
        suffix = match[2];
      }
    }

    if (numericValue === 0) {
      setDisplayValue(value.toString());
      return;
    }

    // Dynamic duration based on value magnitude, capped at 2s
    const duration = Math.min(2000, Math.max(800, numericValue * 50));
    const startTime = Date.now();

    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);

      // Ease out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      const current = Math.floor(numericValue * easeProgress);
      setDisplayValue(current + suffix);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value]);

  return (
    <Heading size="$6" fontWeight="800" color={color}>
      {displayValue}
    </Heading>
  );
};

export interface StatItem {
  label: string;
  value: string | number;
  icon: string;
}

interface HomeStatsRowProps {
  stats: StatItem[];
}

export const HomeStatsRow = ({ stats }: HomeStatsRowProps) => {
  const theme = useTheme();

  return (
    <XStack space="$4" mb="$6" justifyContent="space-around" width="100%">
      {stats.map((stat, index) => (
        <Animated.View
          key={stat.label}
          entering={FadeIn.delay(200 + index * 60)}
          style={{ alignItems: 'center' }}
        >
          <YStack
            width={44}
            height={44}
            borderRadius="$10"
            alignItems="center"
            justifyContent="center"
            backgroundColor={theme.tint.val + '15'} // 15 is hex (~8%)
            marginBottom="$2"
          >
            <FontAwesome5 name={stat.icon} size={18} color={theme.tint.val} />
          </YStack>

          <CountingNumber value={stat.value} color="$color" />

          <Paragraph
            size="$2"
            fontWeight="600"
            color="$color10"
            textTransform="uppercase"
            letterSpacing={0.5}
            marginTop="$1"
          >
            {stat.label}
          </Paragraph>
        </Animated.View>
      ))}
    </XStack>
  );
};
