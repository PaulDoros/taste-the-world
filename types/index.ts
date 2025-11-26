// Country type - matches REST Countries API response
export interface Country {
  name: {
    common: string; // "United States"
    official: string; // "United States of America"
  };
  cca2: string; // Country code: "US"
  capital?: string[]; // ["Washington D.C."]
  region: string; // "Americas"
  subregion?: string; // "North America"
  population: number; // 331900000
  flags: {
    png: string; // URL to flag image
    svg: string;
  };
  flag?: string; // Emoji flag
  currencies?: {
    [key: string]: {
      name: string; // "United States dollar"
      symbol: string; // "$"
    };
  };
  languages?: {
    [key: string]: string; // { "eng": "English" }
  };
  latlng: [number, number]; // [38, -97] - for maps later
}

// Recipe type - matches TheMealDB API response
export interface Recipe {
  idMeal: string; // "52772"
  strMeal: string; // Recipe name: "Teriyaki Chicken Casserole"
  strCategory: string; // "Chicken"
  strArea: string; // Country/region: "Japanese"
  strInstructions: string; // Full cooking instructions
  strMealThumb: string; // URL to recipe image
  strTags?: string; // "Meat,Casserole" (comma separated)
  strYoutube?: string; // YouTube video URL
  strSource?: string; // Original recipe source URL

  // Ingredients (up to 20 in TheMealDB)
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;

  // Measurements (corresponding to ingredients)
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
}

// Simplified ingredient type for our shopping list
export interface Ingredient {
  name: string; // "Chicken breast"
  measure: string; // "500g"
}

// Shopping list item
export interface ShoppingListItem {
  id: string; // Unique ID
  ingredient: string; // "Chicken breast"
  measure: string; // "500g"
  recipeId: string; // Which recipe it's from
  recipeName: string; // "Teriyaki Chicken"
  checked: boolean; // Has user bought it?
  createdAt: number; // Timestamp
}

// User type (for later with Convex auth)
export interface User {
  id: string;
  email?: string;
  name?: string;
  isPremium: boolean; // Premium subscription status
  premiumUntil?: number; // Timestamp when premium expires
}

// Helper type for API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
