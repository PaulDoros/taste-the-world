import { useState, useEffect, useCallback } from 'react';
import { Country } from '@/types';
import { getAllCountries } from '@/services/countriesApi';
import { APP_CONFIG } from '@/constants/Config';

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allCountries = await getAllCountries();

      // Split into free and premium
      const freeCountries: Country[] = [];
      const premiumCountries: Country[] = [];

      allCountries.forEach((country) => {
        if (APP_CONFIG.FREE_COUNTRIES.includes(country.name.common)) {
          freeCountries.push(country);
        } else {
          premiumCountries.push(country);
        }
      });

      // Sort each group alphabetically
      freeCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      premiumCountries.sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      );

      // Combine: Free first, then Premium
      const sortedCountries = [...freeCountries, ...premiumCountries];

      setCountries(sortedCountries);
    } catch (err) {
      setError('Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return { countries, loading, error, refetch: fetchCountries };
};
