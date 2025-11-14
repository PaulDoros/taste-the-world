const tintColorLight = '#FF6B35'; // Vibrant orange (main brand color)
const tintColorDark = '#FFB627'; // Golden yellow (dark mode)

export const Colors = {
  light: {
    text: '#1A1A1A', // Almost black for readability
    background: '#FFFFFF', // Pure white
    card: '#F8F9FA', // Light gray for cards
    tint: tintColorLight, // Brand color (orange)
    tabIconDefault: '#9CA3AF', // Gray for inactive tabs
    tabIconSelected: tintColorLight,
    border: '#E5E7EB', // Light border
    success: '#10B981', // Green for success states
    error: '#EF4444', // Red for errors
    warning: '#F59E0B', // Amber for warnings
    premium: '#8B5CF6', // Purple for premium features
  },
  dark: {
    text: '#F3F4F6', // Light gray text
    background: '#111827', // Dark gray background
    card: '#1F2937', // Slightly lighter card
    tint: tintColorDark, // Brand color (golden)
    tabIconDefault: '#6B7280', // Muted gray
    tabIconSelected: tintColorDark,
    border: '#374151', // Dark border
    success: '#34D399', // Lighter green
    error: '#F87171', // Lighter red
    warning: '#FBBF24', // Lighter amber
    premium: '#A78BFA', // Lighter purple
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
