import { en } from './translations/en';
import { ro } from './translations/ro';
import { fr } from './translations/fr';
import { es } from './translations/es';
import { de } from './translations/de';
import { it } from './translations/it';
import { pt } from './translations/pt';
import { zh } from './translations/zh';
import { ja } from './translations/ja';
import { ru } from './translations/ru';
import { hu } from './translations/hu';
import { uk } from './translations/uk';
import { hi } from './translations/hi';
import { ar } from './translations/ar';
import { ko } from './translations/ko';
import { tr } from './translations/tr';
import { id } from './translations/id';

export type Language =
  | 'en'
  | 'ro'
  | 'fr'
  | 'es'
  | 'it'
  | 'de'
  | 'pt'
  | 'zh'
  | 'ja'
  | 'ru'
  | 'hu'
  | 'uk'
  | 'hi'
  | 'ar'
  | 'ko'
  | 'tr'
  | 'id';

export const Translations: Record<Language, typeof en> = {
  en,
  ro,
  fr,
  es,
  it,
  de,
  pt,
  zh,
  ja,
  ru,
  hu,
  uk,
  hi,
  ar,
  ko,
  tr,
  id,
};

export const FLAGS: Record<Language, string> = {
  en: '🇺🇸',
  ro: '🇷🇴',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  de: '🇩🇪',
  pt: '🇵🇹',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ru: '🇷🇺',
  hu: '🇭🇺',
  uk: '🇺🇦',
  hi: '🇮🇳',
  ar: '🇸🇦',
  ko: '🇰🇷',
  tr: '🇹🇷',
  id: '🇮🇩',
};
