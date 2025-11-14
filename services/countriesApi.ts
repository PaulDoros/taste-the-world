/**
 * REST Countries API Service
 * Fetches country data from restcountries.com
 * Documentation: https://restcountries.com/
 */

import { API_URLS } from '@/constants/Config';
import { Country } from '@/types';

/**
 * Fetch all countries
 * Uses fields parameter to get only what we need (smaller payload)
 */
export const getAllCountries = async (): Promise<Country[]> => {
  try {
    // Request only the fields we need
    const fields =
      'name,cca2,capital,region,subregion,population,flags,currencies,languages,latlng';
    const url = `${API_URLS.restCountries}/all?fields=${fields}`;

    console.log('Fetching countries from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data: Country[] = await response.json();
    console.log('Fetched countries:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching all countries:', error);
    throw error;
  }
};

/**
 * Fetch a specific country by name
 */
export const getCountryByName = async (name: string): Promise<Country> => {
  try {
    const response = await fetch(
      `${API_URLS.restCountries}/name/${encodeURIComponent(name)}?fullText=true`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Country[] = await response.json();
    return data[0]; // API returns array, we take first result
  } catch (error) {
    console.error(`Error fetching country ${name}:`, error);
    throw error;
  }
};

/**
 * Fetch countries by region (e.g., "Europe", "Asia")
 */
export const getCountriesByRegion = async (
  region: string
): Promise<Country[]> => {
  try {
    const response = await fetch(
      `${API_URLS.restCountries}/region/${encodeURIComponent(region)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Country[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching countries in region ${region}:`, error);
    throw error;
  }
};

/**
 * Search countries by name (partial match)
 */
export const searchCountries = async (query: string): Promise<Country[]> => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await fetch(
      `${API_URLS.restCountries}/name/${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No results found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Country[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error searching countries with query "${query}":`, error);
    return [];
  }
};

/**
 * Get featured countries for free tier
 */
export const getFeaturedCountries = async (
  featuredNames: string[]
): Promise<Country[]> => {
  try {
    // Fetch all countries first
    const allCountries = await getAllCountries();

    // Filter to only featured countries
    const featured = allCountries.filter((country) =>
      featuredNames.includes(country.name.common)
    );

    return featured;
  } catch (error) {
    console.error('Error fetching featured countries:', error);
    throw error;
  }
};
