import { config } from '@tamagui/config';
import { createTamagui } from 'tamagui';

import { lightTheme, darkTheme } from './theme/themes';

const appConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      ...lightTheme,
    },
    dark: {
      ...config.themes.dark,
      ...darkTheme,
    },
  },
});

export default appConfig;

export type Conf = typeof appConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
