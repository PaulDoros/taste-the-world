/**
 * Utility to get translated country names based on English input
 */

export const getTranslatedCountryName = (
  countryName: string,
  t: any
): string => {
  if (!countryName) return '';

  const normalized = countryName.toLowerCase().trim();

  // Direct mapping for names that don't match the simple snake_case pattern
  const keyMap: Record<string, string> = {
    'united states': 'country_united_states',
    'united states of america': 'country_united_states',
    usa: 'country_united_states',
    'united kingdom': 'country_united_kingdom',
    uk: 'country_united_kingdom',
    'great britain': 'country_united_kingdom',
    'south korea': 'country_south_korea',
    // Add variations if needed
  };

  let key = '';

  if (keyMap[normalized]) {
    key = keyMap[normalized];
  } else {
    // Generate key: Spain -> country_spain, Saudi Arabia -> country_saudi_arabia
    key = `country_${normalized.replace(/ /g, '_')}`;
  }

  const translated = t(key);

  // If translation seems to be missing (returns key or specific message), return original
  // Note: This check depends on i18n configuration.
  // Often it returns the string "missing..." or just the key.
  if (
    !translated ||
    translated === key ||
    translated.includes('missing_translation') ||
    translated.startsWith('[missing')
  ) {
    return countryName; // Fallback to English name
  }

  return translated;
};
