import { brandColors } from './colors';

export const lightTheme = {
  // backgrounds
  bg: brandColors.slate50,
  bg2: brandColors.slate100,
  bg3: brandColors.slate200,

  // text
  color: brandColors.slate900,
  colorSubtle: brandColors.slate600,
  colorMuted: brandColors.slate500,

  // borders
  borderColor: brandColors.slate200,
  borderColorSubtle: brandColors.slate100,

  // brand
  colorBrand: brandColors.primary,
  colorBrandSoft: brandColors.primarySoft,
  colorBrandDeep: brandColors.primaryDeep,

  // states
  colorSuccess: brandColors.success,
  colorSuccessSoft: brandColors.successSoft,
  colorWarning: brandColors.warning,
  colorWarningSoft: brandColors.warningSoft,
  colorDanger: brandColors.danger,
  colorDangerSoft: brandColors.dangerSoft,

  // buttons / surfaces
  buttonBrandBg: brandColors.primary,
  buttonBrandBgHover: brandColors.primaryDeep,
  buttonBrandText: '#FFFFFF',

  cardBg: '#FFFFFF',
  cardBgElevated: '#FFFFFF',
  cardBorder: brandColors.slate200,

  // misc
  shadowColor: 'rgba(15,23,42,0.12)',
};

export const darkTheme = {
  // backgrounds
  bg: brandColors.slate900,
  bg2: brandColors.slate800,
  bg3: brandColors.slate700,

  // text
  color: brandColors.slate50,
  colorSubtle: brandColors.slate300,
  colorMuted: brandColors.slate400,

  // borders
  borderColor: brandColors.slate700,
  borderColorSubtle: brandColors.slate800,

  // brand
  colorBrand: brandColors.primary,
  colorBrandSoft: brandColors.primarySoft,
  colorBrandDeep: brandColors.primaryDeep,

  // states
  colorSuccess: brandColors.successSoft,
  colorSuccessSoft: brandColors.success,
  colorWarning: brandColors.warningSoft,
  colorWarningSoft: brandColors.warning,
  colorDanger: brandColors.dangerSoft,
  colorDangerSoft: brandColors.danger,

  // buttons / surfaces
  buttonBrandBg: brandColors.primary,
  buttonBrandBgHover: brandColors.primaryDeep,
  buttonBrandText: '#0F172A',

  cardBg: brandColors.slate800,
  cardBgElevated: brandColors.slate800,
  cardBorder: 'rgba(148,163,184,0.5)',

  // misc
  shadowColor: 'rgba(15,23,42,0.6)',
};
