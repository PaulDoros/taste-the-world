import { brandColors } from '../theme/colors';

const tintColorLight = brandColors.primary;
const tintColorDark = brandColors.primarySoft;

export const Colors = {
  light: {
    text: brandColors.slate900,
    background: brandColors.slate50,
    card: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: brandColors.slate400,
    tabIconSelected: tintColorLight,
    border: brandColors.slate200,
    success: brandColors.success,
    error: brandColors.danger,
    warning: brandColors.warning,
    premium: '#8B5CF6', // Keep as specific accent or move to theme if needed
  },
  dark: {
    text: brandColors.slate50,
    background: brandColors.slate900,
    card: brandColors.slate800,
    tint: tintColorDark,
    tabIconDefault: brandColors.slate500,
    tabIconSelected: tintColorDark,
    border: brandColors.slate700,
    success: brandColors.successSoft,
    error: brandColors.dangerSoft,
    warning: brandColors.warningSoft,
    premium: '#A78BFA',
  },
};

// Additional semantic colors (same in light & dark)
export const SemanticColors = {
  // Country regions
  africa: '#F59E0B',
  americas: '#10B981',
  asia: '#EF4444',
  europe: '#3B82F6',
  oceania: '#8B5CF6',

  // Recipe categories
  vegetarian: '#10B981',
  vegan: '#34D399',
  meat: '#EF4444',
  seafood: '#3B82F6',
  dessert: '#EC4899',
};
