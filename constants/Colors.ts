const tintColorLight = '#F97316'; // Spiced Coral (Vibrant & Premium)
const tintColorDark = '#FB923C'; // Lighter Coral for Dark Mode

export const Colors = {
  light: {
    text: '#1F2937', // Deep Charcoal (Gray 800)
    background: '#FAFAFA', // Warm Off-White
    card: '#FFFFFF', // Pure White
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF', // Gray 400
    tabIconSelected: tintColorLight,
    border: '#E5E7EB', // Gray 200
    success: '#10B981', // Emerald 500
    error: '#EF4444', // Red 500
    warning: '#F59E0B', // Amber 500
    premium: '#8B5CF6', // Violet 500
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
