import { lightTheme, darkTheme, brandColors } from '../theme/themes';

const tintColorLight = brandColors.primary;
const tintColorDark = brandColors.primaryDark;

export const Colors = {
  light: {
    ...lightTheme,
    text: lightTheme.color,
    background: lightTheme.background,
    card: lightTheme.surface,
    tint: lightTheme.tint,
    tabIconDefault: lightTheme.textTertiary,
    tabIconSelected: lightTheme.tint,
    border: lightTheme.borderColor,
    success: brandColors.success,
    error: brandColors.error,
    warning: brandColors.warning,
    premium: brandColors.accent,
  },
  dark: {
    ...darkTheme,
    text: darkTheme.color,
    background: darkTheme.background,
    card: darkTheme.surface,
    tint: darkTheme.tint,
    tabIconDefault: darkTheme.textTertiary,
    tabIconSelected: darkTheme.tint,
    border: darkTheme.borderColor,
    success: brandColors.success,
    error: brandColors.error,
    warning: brandColors.warning,
    premium: brandColors.accent,
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
