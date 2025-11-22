import { config } from '@tamagui/config';
import { createTamagui } from 'tamagui';

const appConfig = createTamagui(config);

export default appConfig;

export type Conf = typeof appConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

