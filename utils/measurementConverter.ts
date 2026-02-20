/**
 * Measurement Conversion Utility
 * Converts cooking measurements between different units
 *
 * NOTE: Some conversions (like tbs to grams) depend on ingredient density.
 * We use average values for common ingredients.
 */

// Conversion rates to grams (for volume measurements, using water density as baseline)
const VOLUME_TO_GRAMS: { [key: string]: number } = {
  // Tablespoons
  tablespoon: 15,
  tablespoons: 15,
  tbsp: 15,
  tbs: 15,
  tb: 15,
  T: 15,

  // Teaspoons
  teaspoon: 5,
  teaspoons: 5,
  tsp: 5,
  t: 5,

  // Cups
  cup: 240,
  cups: 240,
  c: 240,

  // Fluid Ounces
  'fluid ounce': 30,
  'fluid ounces': 30,
  'fl oz': 30,
  'fl. oz.': 30,
  floz: 30,
};

// Weight conversions to grams
const WEIGHT_TO_GRAMS: { [key: string]: number } = {
  // Pounds
  pound: 453.592,
  pounds: 453.592,
  lb: 453.592,
  lbs: 453.592,

  // Ounces
  ounce: 28.3495,
  ounces: 28.3495,
  oz: 28.3495,

  // Kilograms
  kilogram: 1000,
  kilograms: 1000,
  kg: 1000,

  // Grams (already in grams)
  gram: 1,
  grams: 1,
  g: 1,
};

// Volume conversions to milliliters
const VOLUME_TO_ML: { [key: string]: number } = {
  tablespoon: 15,
  tablespoons: 15,
  tbsp: 15,
  tbs: 15,
  tb: 15,
  T: 15,

  teaspoon: 5,
  teaspoons: 5,
  tsp: 5,
  t: 5,

  cup: 240,
  cups: 240,
  c: 240,

  'fluid ounce': 30,
  'fluid ounces': 30,
  'fl oz': 30,
  'fl. oz.': 30,
  floz: 30,

  liter: 1000,
  liters: 1000,
  l: 1000,
  L: 1000,

  milliliter: 1,
  milliliters: 1,
  ml: 1,
  mL: 1,
};

/**
 * Parse a measurement string to extract quantity and unit
 * Examples: "2 tablespoons", "1/2 cup", "1.5 tsp", "200g"
 */
export const parseMeasurement = (
  measureString: string
): {
  quantity: number;
  unit: string;
  originalString: string;
} | null => {
  if (!measureString || measureString.trim() === '') {
    return null;
  }

  const trimmed = measureString.trim().toLowerCase();

  // Try to match patterns like "2 tablespoons", "1/2 cup", "1.5 tsp"
  const patterns = [
    // "2 tablespoons", "1.5 tsp"
    /^(\d+\.?\d*)\s*([a-zA-Z\s.]+)$/,
    // "1/2 cup", "1/4 tsp"
    /^(\d+)\/(\d+)\s*([a-zA-Z\s.]+)$/,
    // "200g", "2tbsp" (no space)
    /^(\d+\.?\d*)([a-zA-Z]+)$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      if (match.length === 3) {
        // Pattern: "2 tablespoons" or "200g"
        return {
          quantity: parseFloat(match[1]),
          unit: match[2].trim(),
          originalString: measureString,
        };
      } else if (match.length === 4) {
        // Pattern: "1/2 cup" (fraction)
        const numerator = parseFloat(match[1]);
        const denominator = parseFloat(match[2]);
        return {
          quantity: numerator / denominator,
          unit: match[3].trim(),
          originalString: measureString,
        };
      }
    }
  }

  return null;
};

/**
 * Convert a measurement to grams (best for weight-based ingredients)
 */
export const convertToGrams = (
  quantity: number,
  unit: string
): number | null => {
  const normalizedUnit = unit.toLowerCase().trim();

  // Check if it's a volume measurement
  if (VOLUME_TO_GRAMS[normalizedUnit]) {
    return quantity * VOLUME_TO_GRAMS[normalizedUnit];
  }

  // Check if it's a weight measurement
  if (WEIGHT_TO_GRAMS[normalizedUnit]) {
    return quantity * WEIGHT_TO_GRAMS[normalizedUnit];
  }

  return null;
};

/**
 * Convert a measurement to milliliters (best for liquid ingredients)
 */
export const convertToMilliliters = (
  quantity: number,
  unit: string
): number | null => {
  const normalizedUnit = unit.toLowerCase().trim();

  if (VOLUME_TO_ML[normalizedUnit]) {
    return quantity * VOLUME_TO_ML[normalizedUnit];
  }

  return null;
};

/**
 * Convert a measurement string to a more useful format
 * Returns both grams and milliliters when applicable
 */
export const convertMeasurement = (
  measureString: string
): {
  original: string;
  grams: string | null;
  milliliters: string | null;
} => {
  const parsed = parseMeasurement(measureString);

  if (!parsed) {
    return {
      original: measureString,
      grams: null,
      milliliters: null,
    };
  }

  const gramsValue = convertToGrams(parsed.quantity, parsed.unit);
  const mlValue = convertToMilliliters(parsed.quantity, parsed.unit);

  return {
    original: measureString,
    grams: gramsValue ? `${gramsValue.toFixed(0)}g` : null,
    milliliters: mlValue ? `${mlValue.toFixed(0)}ml` : null,
  };
};

/**
 * Get a friendly display string for a converted measurement
 * Shows the most relevant conversion based on the original unit
 */
export const getConvertedDisplay = (measureString: string): string => {
  const converted = convertMeasurement(measureString);

  // If we have a grams conversion, prefer that for weight/volume
  if (converted.grams) {
    return `≈ ${converted.grams}`;
  }

  // If we have a milliliters conversion, show that
  if (converted.milliliters) {
    return `≈ ${converted.milliliters}`;
  }

  // No conversion available
  return '';
};

/**
 * Check if a measurement can be converted
 */
export const canConvert = (measureString: string): boolean => {
  const parsed = parseMeasurement(measureString);
  if (!parsed) return false;

  const gramsValue = convertToGrams(parsed.quantity, parsed.unit);
  const mlValue = convertToMilliliters(parsed.quantity, parsed.unit);

  return gramsValue !== null || mlValue !== null;
};
