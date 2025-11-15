# Taste the World

A modern React Native mobile application built with Expo that enables users to explore global cuisines through an intuitive interface. Discover authentic recipes from around the world, manage shopping lists, and organize your pantry—all in one beautifully designed app.

## Overview

Taste the World combines culinary exploration with practical meal planning tools. Users can browse countries, discover traditional recipes, create smart shopping lists from recipe ingredients, and maintain a digital pantry with quantity tracking.

## Features

### Core Functionality

- **Country Explorer** - Browse countries with detailed information including capital, population, region, currency, and languages
- **Recipe Discovery** - Access authentic recipes from TheMealDB API, organized by country and cuisine
- **Smart Shopping Lists** - Automatically generate shopping lists from recipe ingredients with intelligent pantry integration
- **Pantry Management** - Track ingredients with quantity management and automatic deduction when using recipes
- **Recipe History** - Keep track of recently viewed recipes for quick access
- **Favorites System** - Save and organize your favorite recipes

### User Experience

- **Modern UI/UX** - Clean, intuitive interface with smooth animations
- **Dark Mode Support** - Automatic theme switching based on system preferences
- **Responsive Design** - Optimized for various screen sizes
- **Offline Capability** - Core features work without constant internet connection

## Technology Stack

### Frontend Framework

- **Expo SDK 54** - React Native development platform
- **Expo Router v6** - File-based routing system
- **React Native 0.81** - Cross-platform mobile framework
- **TypeScript** - Type-safe development

### Styling & UI

- **NativeWind v4** - Tailwind CSS for React Native
- **React Native Reanimated v4** - High-performance animations
- **Expo Vector Icons** - Comprehensive icon library

### State Management

- **Zustand** - Lightweight state management for shopping lists, pantry, and user preferences

### External APIs

- **REST Countries API** - Country data and information
- **TheMealDB API** - Recipe database with international cuisines

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Expo Go** app (available on iOS App Store or Google Play Store)
- **Git** for version control

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd taste-the-world
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

   Or use Expo CLI directly:

   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Open the Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal
   - The app will load on your device

## Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start web version (limited functionality)
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Project Structure

```
taste-the-world/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── country/[id].tsx   # Country detail pages
│   └── recipe/[id].tsx    # Recipe detail pages
├── components/             # Reusable UI components
├── services/               # API integration services
├── hooks/                  # Custom React hooks
├── store/                  # Zustand state stores
├── types/                  # TypeScript type definitions
└── constants/              # App constants and configuration
```

## Configuration

The app uses external APIs that do not require API keys:

- **REST Countries API** - No authentication required
- **TheMealDB API** - No authentication required

Optional integrations (future implementation):

- OpenWeather API - For weather information
- Unsplash API - For enhanced imagery

## Contributing

This is a personal learning project. Contributions and suggestions are welcome through issues and pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [REST Countries API](https://restcountries.com/) for country data
- [TheMealDB](https://www.themealdb.com/) for recipe database
- Expo team for the excellent development platform
- React Native community for continuous improvements

---

**Version:** 1.0.0  
**Last Updated:** 2024
