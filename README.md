# 🌍 Taste the World

npx expo start --clear

**Explore countries through their authentic cuisines**

A React Native mobile app built with Expo that combines travel exploration with recipe discovery. Browse countries, discover traditional recipes, manage shopping lists, and plan your culinary adventures!

---

## 📱 App Concept

**Taste the World** allows users to:

- 🌍 Explore countries with detailed information
- 🍳 Discover authentic recipes by country
- 🛒 Create smart shopping lists from recipe ingredients
- ⛅ Check weather in different countries
- 💎 Unlock premium features with subscription

---

## ✨ Current Features

### Country Explorer (Home Screen)

- **📱 Modern Grid Layout** - Beautiful 2-column grid with country cards
- **🔍 Smart Search** - Search by country name, capital, or region
- **🌍 Color-Coded Region Filters** - Vibrant filters (🟠 Africa, 🟢 Americas, 🔴 Asia, 🔵 Europe, 🟦 Oceania)
- **🆓 Premium Filters** - Toggle between Free (green), Premium (purple), or All
- **✨ Animated Filter Chips** - Spring animations on press with color transitions
- **🎨 Animated Cards** - Press animations with spring physics
- **👑 Premium Badges** - Visual indicators for locked premium content
- **📊 Live Results Counter** - Shows how many countries match your filters
- **🎯 Dynamic Routing** - Navigate to country details with smooth transitions

### Country Details

- **🏁 Flag Header** - Full-width flag image with gradient overlay
- **ℹ️ Country Info Cards** - Capital, population, region, currency, languages with color-coded icons
- **🍳 Popular Recipes** - Horizontal scrollable recipe cards (6 per country)
- **📜 Recipe Count** - Shows total number of authentic dishes available
- **🎯 View All Recipes** - Quick access to all recipes for that country
- **⏳ Loading States** - Smooth skeleton loaders for recipes
- **🚫 Empty States** - Helpful messages when no recipes are available
- **🔙 Animated Back Button** - Easy navigation back to explorer with haptics
- **🎨 Theme Support** - Automatic light/dark mode support

### Recipe Details

- **🖼️ Hero Image** - Full-width recipe image with gradient overlays
- **🏷️ Category & Area Badges** - Visual indicators for recipe type and cuisine
- **📝 Ingredients List** - Beautifully formatted ingredients with measurements
- **📖 Instructions** - Step-by-step cooking instructions
- **🛒 Add to Shopping List** - One-tap to add all ingredients
- **📺 Watch Video** - Direct link to YouTube cooking tutorial
- **🔗 Source Link** - Original recipe source for more details
- **✨ Staggered Animations** - Ingredients animate in with delays
- **🎨 Color-Coded Sections** - Different colors for ingredients/instructions

### Shopping List

- **📊 Smart Dashboard** - Shows total items and completed count
- **✅ Check/Uncheck Items** - Tap to mark items as purchased
- **🗑️ Delete Items** - Remove individual items with confirmation
- **🎯 Filter Tabs** - View All, Active, or Completed items
- **🧹 Clear Completed** - Batch delete all checked items
- **🗑️ Clear All** - Remove everything with confirmation
- **📦 Recipe Source Tags** - See which recipe each ingredient is from
- **💫 Empty State** - Helpful message when list is empty
- **✨ Animated Cards** - Smooth entrance animations for items
- **🎨 Visual Feedback** - Checked items are dimmed with strike-through

### UI Components (Reusable & Modern)

- **SearchBar** - Animated search with focus states, auto-clear
- **FilterBar** - Horizontal chip filters with icons, smooth animations
- **CountryCard** - Animated card with gradients, shadows, premium badges
- **RecipeCard** - Modern recipe card with image, category badge, press animations
- **SkeletonLoader** - Shimmer loading effect for async content
- **StaggeredList** - Animated list items with staggered entrance
- **Tab Navigation** - Sliding bubble indicator with predictive animations

---

## 🛠️ Tech Stack

### Frontend Framework

- **Expo SDK 54** - React Native framework
- **Expo Router v6** - File-based navigation
- **TypeScript** - Type safety
- **React Native 0.81** - Mobile framework

### Styling

- **NativeWind v4** - Tailwind CSS for React Native
- **Expo Vector Icons** - Icon library
- **React Native Reanimated v4** - Smooth animations

### Backend & Database

- **Convex.dev** - Real-time backend (Coming soon)
  - User authentication
  - Saved recipes & favorites
  - Shopping lists persistence
  - Premium subscription management

### State Management

- **Zustand** - Local state management (Shopping List)
- **Convex React hooks** - Backend data (Coming soon)

### External APIs

- **REST Countries API** - Country data (free, no key)
- **TheMealDB API** - Recipes by country (free, no key)
- **OpenWeather API** - Weather data (free tier)
- **Unsplash API** - Country images (free tier)

---

## 📂 Project Structure

```
taste-the-world/
├── app/                        # Expo Router pages (file-based routing)
│   ├── (tabs)/                 # Tab navigator screens
│   │   ├── index.tsx          # Home/Explore countries
│   │   ├── recipes.tsx        # All recipes browser
│   │   ├── shopping-list.tsx  # Shopping list manager
│   │   └── settings.tsx       # Settings & Premium upgrade
│   ├── country/[id].tsx       # Dynamic country details page
│   ├── recipe/[id].tsx        # Dynamic recipe details page
│   └── _layout.tsx            # Root layout with navigation
│
├── components/                 # Reusable UI components
│   ├── CountryCard.tsx        # Country grid item (animated)
│   ├── RecipeCard.tsx         # Recipe card with image & animations
│   ├── SearchBar.tsx          # Modern search input component
│   ├── FilterBar.tsx          # Filter chips component
│   ├── SkeletonLoader.tsx     # Shimmer loading skeleton
│   ├── StaggeredList.tsx      # Staggered entrance animations
│   ├── ShoppingListItem.tsx   # Shopping list item (coming soon)
│   └── PremiumGate.tsx        # Free vs Premium feature gate (coming soon)
│
├── services/                   # External API integrations
│   ├── countriesApi.ts        # REST Countries API calls
│   ├── recipesApi.ts          # TheMealDB API calls
│   └── weatherApi.ts          # OpenWeather API calls
│
├── hooks/                      # Custom React hooks
│   ├── useCountries.ts        # Fetch & manage countries data
│   ├── useRecipes.ts          # Fetch & manage recipes data
│   └── usePremium.ts          # Check premium status
│
├── store/                      # Zustand state management
│   ├── shoppingListStore.ts   # Shopping list state & actions
│   └── uiStore.ts             # UI state (filters, modals, etc.) (coming soon)
│
├── types/                      # TypeScript type definitions
│   └── index.ts               # Shared types
│
├── constants/                  # App constants
│   ├── Colors.ts              # Color palette
│   └── Config.ts              # API keys & configuration
│
└── convex/                     # Convex backend (Coming soon)
    ├── schema.ts              # Database schema
    ├── users.ts               # User functions
    ├── recipes.ts             # Recipe save/favorite functions
    └── shoppingList.ts        # Shopping list CRUD
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo Go app** installed on your iPhone (from App Store)
- **Git Bash** or terminal

---

### Step-by-Step Setup

#### **1. Create the Project**

Navigate to your workspace:

```bash
cd "E:\EXPO Training"
```

Create new Expo project with tabs template:

```bash
npx create-expo-app@latest taste-the-world --template tabs
```

Navigate into project:

```bash
cd taste-the-world
```

---

#### **2. Create Folder Structure**

Create necessary folders for organization:

```bash
mkdir components services hooks store types constants
```

---

#### **3. Install NativeWind (Tailwind CSS)**

Install NativeWind for styling:

```bash
npm install nativewind
npm install --save-dev tailwindcss@3.3.2
```

Initialize Tailwind configuration:

```bash
npx tailwindcss init
```

---

#### **4. Configure NativeWind (Tailwind CSS)**

**4.1 Update Tailwind Configuration**

Edit `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**4.2 Create Global CSS File**

Create `global.css` in root:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**4.3 Import Global CSS in Root Layout**

Edit `app/_layout.tsx` - add this import at the top:

```typescript
import '../global.css';
```

**4.4 Configure Metro Bundler**

Create `metro.config.js` in root:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

**4.5 Add TypeScript Support**

Create `nativewind-env.d.ts` in root:

```typescript
/// <reference types="nativewind/types" />
```

✅ NativeWind is now configured! You can now use Tailwind classes like `className="bg-blue-500 text-white p-4"`

---

#### **5. Set Up Prettier (Code Formatter)**

Install Prettier:

```bash
npm install --save-dev prettier
```

Create `.prettierrc` configuration file:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

Create `.prettierignore` file:

```
node_modules/
.expo/
.expo-shared/
dist/
build/
*.lock
```

Add format scripts to `package.json`:

```json
"scripts": {
  "start": "expo start",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

Format all existing code:

```bash
npm run format
```

---

#### **6. Create TypeScript Types**

Create `types/index.ts` with interfaces for:

- Country (REST Countries API)
- Recipe (TheMealDB API)
- ShoppingListItem (our shopping list)
- User (authentication & premium status)

See the file for complete type definitions!

---

#### **7. Create Constants & Colors**

Create `constants/Colors.ts` with:

- Light/dark mode color schemes
- Brand colors (orange/golden theme)
- Semantic colors for regions & categories

---

#### **8. Start Development Server**

Start the Expo dev server:

```bash
npm start
```

**Testing on iPhone:**

1. Ensure iPhone and PC are on the **same WiFi network**
2. Open **Expo Go** app on your iPhone
3. Scan the QR code from terminal with iPhone Camera app
4. App will open in Expo Go

**If connection issues occur:**

```bash
npx expo start --tunnel
```

---

## 📱 Testing the App

### On iPhone (Recommended)

1. Install **Expo Go** from App Store
2. Run `npm start` in terminal
3. Scan QR code with iPhone camera
4. App opens in Expo Go
5. ✅ Hot reload - changes appear instantly!

### On Android Emulator

1. Install Android Studio
2. Set up Android emulator
3. Run `npm start`, then press `a`

### On Web Browser (Limited)

1. Run `npm start`, then press `w`
2. Note: Not all React Native features work on web

---

## 🎯 Features Roadmap

### Free Tier 🆓

- ✅ Browse 20 featured countries
- ✅ Basic country info (flag, capital, currency)
- ✅ Current weather in capital city
- ✅ 3 recipes per country
- ✅ Basic shopping list (max 3 recipes)

### Premium Tier 💎

- 🔒 Unlock ALL 195+ countries
- 🔒 Unlimited recipes per country
- 🔒 Advanced filters (vegetarian, difficulty, time)
- 🔒 Save unlimited favorite recipes
- 🔒 Meal planner (weekly meal planning)
- 🔒 Nutritional information
- 🔒 Smart shopping list (organized by sections)
- 🔒 Multiple shopping lists
- 🔒 Offline mode
- 🔒 No ads

---

## 📋 Development Progress

### ✅ Completed

- [x] Project setup with Expo SDK 54
- [x] Folder structure created
- [x] NativeWind installed & configured (Tailwind CSS)
- [x] Tailwind CSS working with TypeScript support
- [x] Metro bundler configured
- [x] Prettier installed & configured (code formatting)
- [x] Testing on iPhone successful
- [x] TypeScript types defined (Country, Recipe, ShoppingListItem, User)
- [x] Colors & theme system created
- [x] Config file with API URLs & freemium logic
- [x] Countries API service completed (5 functions)
- [x] Recipes API service completed (8 functions)
- [x] Custom useCountries hook with cleanup logic
- [x] CountryCard component (reusable, responsive, animated)
- [x] Modern CountryCard redesign with gradients & shadows
- [x] React Native Reanimated integration for press animations
- [x] Country Explorer screen (Home tab with grid)
- [x] Modern SearchBar component (animated, with clear button)
- [x] Modern FilterBar component (region & premium filters)
- [x] "Clear All Filters" functionality
- [x] Filter chips with icons (FontAwesome5)
- [x] Search functionality (countries, capitals, regions)
- [x] Filter system (by region/continent & free/premium)
- [x] Component-based architecture for maintainability
- [x] Country Details screen (flag, info, navigation)
- [x] Dynamic routing with Expo Router
- [x] Show all countries (free + locked premium)
- [x] Modern tab navigation with 4 tabs (Explore, Shopping, Favorites, Settings)
- [x] Tab icons with FontAwesome5 (solid on active)
- [x] iOS safe area support for tab bar (home indicator fix)
- [x] Animated filter chips with spring physics
- [x] Color-coded region filters (Africa=orange, Americas=green, Asia=red, Europe=blue, Oceania=cyan)
- [x] Vibrant color palette for better visual distinction
- [x] Press animations on all filter chips (scale + opacity)
- [x] Colored shadows matching filter colors
- [x] Icon badges with circular backgrounds on active filters
- [x] Improved filter chip padding and spacing
- [x] Better ScrollView padding for last items
- [x] Animated tab bar icons with bounce effect
- [x] Scale animation on tab navigation (1.15x on active)
- [x] Opacity transitions for tab icons
- [x] Placeholder screens for future features
- [x] Country-to-Area mapping for TheMealDB API (33 countries mapped)
- [x] Recipe fetching by country on Country Details screen
- [x] RecipeCard component with animations and press effects
- [x] Horizontal scrollable recipe gallery (6 recipes per country)
- [x] Recipe loading states (spinner + helpful text)
- [x] Empty state for countries with no recipes
- [x] Recipe count badge on Country Details
- [x] "View All Recipes" button (ready for navigation)
- [x] Staggered entrance animations for recipe cards
- [x] Haptic feedback on recipe card press
- [x] Recipe Details screen (`/recipe/[id]`)
- [x] Full recipe with hero image, category/area badges
- [x] Ingredients list with measurements and staggered animations
- [x] Cooking instructions section
- [x] "Add to Shopping List" button (adds all ingredients)
- [x] "Watch Video" button (opens YouTube tutorial)
- [x] Source link to original recipe
- [x] Zustand store for Shopping List state management
- [x] Shopping List tab with full functionality
- [x] Add/Remove/Check/Uncheck items
- [x] Filter tabs (All, Active, Completed)
- [x] Clear Completed & Clear All buttons
- [x] Recipe source tags on each ingredient
- [x] Empty state for shopping list
- [x] Beautiful animated shopping list cards
- [x] Confirmation dialogs for destructive actions

### 🚧 In Progress

- [ ] Set up Convex backend for persistent data
- [ ] Integrate free AI (Google Gemini/Hugging Face) for missing country recipes
- [ ] Add "View All Recipes" screen for each country

### 📅 Upcoming

- [ ] Integrate REST Countries API
- [ ] Integrate TheMealDB API
- [ ] Build Country Explorer screen
- [ ] Build Recipe Details screen
- [ ] Build Shopping List functionality
- [ ] Implement Premium features
- [ ] Add authentication
- [ ] Polish UI/UX with animations

---

## 🐛 Troubleshooting

### Issue: "Could not connect to server" on iPhone

**Solution:** Use tunnel mode

```bash
npx expo start --tunnel
```

### Issue: "Project incompatible with Expo Go version"

**Solution:** Make sure project SDK matches Expo Go app version

```bash
npx expo install expo@latest
npx expo install --fix
```

### Issue: Dependency conflicts during installation

**Solution:** Use legacy peer deps flag

```bash
npm install --legacy-peer-deps
```

---

## 📚 Useful Commands

```bash
# Start development server
npm start

# Start with tunnel (for network issues)
npx expo start --tunnel

# Clear cache and restart
npx expo start --clear

# Install Expo SDK compatible packages
npx expo install package-name

# Check for outdated packages
npx expo-doctor

# Build for production (later)
eas build --platform ios
eas build --platform android
```

---

## 🔑 API Keys Needed (Later)

- ✅ REST Countries API - No key needed
- ✅ TheMealDB API - No key needed
- 🔑 OpenWeather API - Free tier (sign up at openweathermap.org)
- 🔑 Unsplash API - Free tier (sign up at unsplash.com/developers)
- 🔑 Convex - Free tier (sign up at convex.dev)

---

## 📖 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 👨‍💻 Author

Built with ❤️ as a learning project

---

## 📄 License

MIT License - Feel free to use this for learning!

---

**Last Updated:** November 14, 2024
**Current Version:** 0.1.0 (Initial Setup)
