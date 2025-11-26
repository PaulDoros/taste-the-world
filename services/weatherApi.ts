/**
 * Weather API Service
 * Fetches real-time weather data from OpenWeatherMap
 * Documentation: https://openweathermap.org/current
 */

import { API_URLS } from '@/constants/Config';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_KEY || '';
console.log(API_KEY);
export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
}
/**
 * Get current weather for a city
 */
export const getWeatherByCity = async (
  city: string
): Promise<WeatherData | null> => {
  console.log(API_KEY, 'hello');
  if (!API_KEY) {
    console.warn('OpenWeatherMap API key is missing');
    return null;
  }

  try {
    const response = await fetch(
      `${API_URLS.openWeather}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Weather not found for city: ${city}`);
        return null;
      }
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return null;
  }
};
