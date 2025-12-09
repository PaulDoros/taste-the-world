import { Benefit } from '@/components/BenefitsGrid';

export const getBenefits = (t: any): Benefit[] => [
  {
    icon: 'robot',
    title: t('benefit_ai_title'),
    description: t('benefit_ai_desc'),
  },
  {
    icon: 'globe-americas',
    title: t('benefit_countries_title'),
    description: t('benefit_countries_desc'),
  },
  {
    icon: 'download',
    title: t('benefit_offline_title'),
    description: t('benefit_offline_desc'),
  },
  {
    icon: 'camera',
    title: t('benefit_scanner_title'),
    description: t('benefit_scanner_desc'),
  },
  {
    icon: 'ban',
    title: t('benefit_noads_title'),
    description: t('benefit_noads_desc'),
  },
  {
    icon: 'star',
    title: t('benefit_premium_title'),
    description: t('benefit_premium_desc'),
  },
];
