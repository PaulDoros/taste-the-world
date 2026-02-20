import { zinc, sky, electric } from './colors';

// 1. BRAND COLORS (The Identity)
// Integrating the "Split-Primary" strategy for light/dark adaptability.
export const brandColors = {
  primary: sky[500], // #0EA5E9 - The core identity (Light Mode)
  primaryDark: sky[400], // #38bdf8 - Optimized for dark mode contrast
  secondary: zinc[900], // #18181b - Stark contrast element

  // The "Modern Look" Accents
  accent: electric.cyan, // #7DF9FF - For "Glow" effects
  tertiary: '#A47764', // "Mocha Mousse" - The 2025 warm neutral trend

  // Semantic Status Colors
  success: '#22c55e', // Green-500
  warning: electric.amber, // #F59E0B
  error: '#ef4444', // Red-500
  info: sky[500],
};

// 2. GRADIENTS (The Vibe)
// Implementing "Mesh" and "Aurora" style gradients
export const gradients = {
  // "Cosmos": Classic Brand Gradient (Blue to Violet)
  // Usage: Hero headers, Primary Buttons
  primary: [brandColors.primary, electric.violet] as const,

  // "Electric Horizon": High Energy (Electric Cyan to Blue)
  // Usage: Dark mode accents, active states, "Glow" effects
  electric: [electric.cyan, brandColors.primary] as const,

  // "Golden Hour": Warmth Trend (Amber to Fuchsia)
  // Usage: Special offers, "Pro" features
  warmth: [electric.amber, electric.rose] as const,

  // "Glasswater": Subtle background mesh (Teal to Blue)
  glasswater: ['#2dd4bf', '#38bdf8'] as const,

  // Dark Mode Background Mesh (Subtle elevation)
  darkMesh: ['#18181b', '#27272a'] as const,
};

// 3. THEMES (Semantic Mapping)
// Fully abstracted themes supporting Glassmorphism 2.0

export const lightTheme = {
  background: '#FFFFFF', // Pure white for maximum clarity
  backgroundHover: zinc[50],
  backgroundPress: zinc[100],
  backgroundFocus: zinc[50],

  surface: zinc[50], // #fafafa - Subtle separation
  surfaceHighlight: zinc[100], // #f4f4f5 - Interactive areas

  color: zinc[900], // #18181b - Soft Black (High readability)
  colorHover: zinc[800],
  colorPress: zinc[950],
  colorFocus: zinc[900],

  textPrimary: zinc[900], // #18181b
  textSecondary: zinc[600], // #52525b - Accessible gray (4.5:1+)
  textTertiary: zinc[400], // #a1a1aa - Placeholders

  borderColor: zinc[200], // #e4e4e7 - Crisp, thin borders
  borderColorHover: zinc[300],
  borderColorFocus: sky[500],

  primary: brandColors.primary, // #a9d0e2ff
  onPrimary: '#FFFFFF', // White text on blue button

  // Glassmorphism Tokens
  glass: 'rgba(255, 255, 255, 0.70)', // High opacity blur
  glassBorder: 'rgba(255, 255, 255, 0.50)', // Crisp edge

  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', // Soft, diffuse shadow

  // Required by Tamagui/Standard
  tint: brandColors.primary,
  tintColor: '#fff',
};

export const darkTheme = {
  background: sky[880], // #09090b - The "Modern Black"
  backgroundHover: zinc[900],
  backgroundPress: zinc[800],
  backgroundFocus: zinc[900], // Ensure focus state exists

  surface: zinc[900], // #18181b - Elevation 1
  surfaceHighlight: zinc[800], // #27272a - Elevation 2 / Hover

  color: zinc[50], // #fafafa - Almost white, avoids eye strain
  colorHover: zinc[100],
  colorPress: '#fff',
  colorFocus: zinc[50],

  textPrimary: zinc[50], // #fafafa
  textSecondary: zinc[400], // #a1a1aa - Good contrast against dark
  textTertiary: zinc[500], // #71717a

  borderColor: zinc[800], // #27272a - Low contrast borders
  borderColorHover: zinc[700],
  borderColorFocus: sky[400],

  primary: brandColors.primaryDark, // #38bdf8 - Lighter blue for dark mode
  onPrimary: zinc[900], // Dark text on bright blue button

  // Glassmorphism Tokens
  glass: 'rgba(9, 9, 11, 0.70)', // Zinc-950 with opacity
  glassBorder: 'rgba(255, 255, 255, 0.08)', // Subtle white rim for definition

  shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', // Deep shadow for depth

  // Required by Tamagui/Standard
  tint: brandColors.primaryDark,
  tintColor: zinc[900],
};
