// PRIMITIVES: The raw color scales based on Tailwind Zinc and Sky

// Zinc: Chosen for its industrial, modern neutrality [12, 16]
export const zinc = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
} as const;

// Sky: The modernized primary scale
export const sky = {
  300: '#7dd3fc',
  400: '#38bdf8', // Luminous Blue (Dark Mode Primary)
  500: '#0ea5e9', // Brand Blue (Light Mode Primary)
  600: '#0284c7', // Deep Blue (Interactive/Hover)
  700: '#0369a1',
  880: '#0F172A',
} as const;

// Electric & Accents: Trend colors for 2025 [4, 24]
export const electric = {
  cyan: '#7DF9FF', // "Electric Blue" - The 2025 Glow
  violet: '#8B5CF6',
  amber: '#F59E0B',
  rose: '#fb7185',
};

// GLASSMORPHISM TOKENS
export const glassTokens = {
  light: {
    overlay: 'rgba(255, 255, 255, 0)',
    border: 'rgba(255, 253, 253, 0.05)',
    blurIntensity: 40,
    shadowOpacity: 0.5,
  },
  dark: {
    overlay: 'rgba(20, 20, 20, 0.60)',
    border: 'rgba(255, 255, 255, 0.12)',
    blurIntensity: 80,
    shadowOpacity: 0.3,
  },
} as const;
