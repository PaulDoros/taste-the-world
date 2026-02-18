export interface BadgeDef {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string; // MaterialCommunityIcons name
  lottieSource?: any; // Required numeric ID from require()
  color: string;
  condition?: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'streak_3',
    titleKey: 'badge_streak_3_title',
    descriptionKey: 'badge_streak_3_desc',
    icon: 'fire-alert',
    lottieSource: require('@/assets/animations/fire.json'),
    color: '#ef4444', // Red-500
  },
  {
    id: 'streak_7',
    titleKey: 'badge_streak_7_title',
    descriptionKey: 'badge_streak_7_desc',
    icon: 'fire-circle',
    lottieSource: require('@/assets/animations/unstoppable.json'),
    color: '#f97316', // Orange-500
  },
  {
    id: 'level_5',
    titleKey: 'badge_level_5_title',
    descriptionKey: 'badge_level_5_desc',
    icon: 'chef-hat',
    lottieSource: require('@/assets/animations/sous-chef.json'),
    color: '#8b5cf6', // Violet-500
  },
  {
    id: 'level_10',
    titleKey: 'badge_level_10_title',
    descriptionKey: 'badge_level_10_desc',
    icon: 'crown',
    lottieSource: require('@/assets/animations/master-chef.json'),
    color: '#fbbf24', // Amber-400
  },
  {
    id: 'first_cook',
    titleKey: 'badge_first_cook_title',
    descriptionKey: 'badge_first_cook_desc',
    icon: 'silverware-variant',
    lottieSource: require('@/assets/animations/first-dish.json'),
    color: '#10b981', // Emerald-500
  },
  {
    id: 'explorer',
    titleKey: 'badge_explorer_title',
    descriptionKey: 'badge_explorer_desc',
    icon: 'compass',
    lottieSource: require('@/assets/animations/travel.json'),
    color: '#3b82f6', // Blue-500
  },
  {
    id: 'gordon_r',
    titleKey: 'badge_gordon_r_title',
    descriptionKey: 'badge_gordon_r_desc',
    icon: 'camera-iris',
    lottieSource: require('@/assets/animations/food stylish.json'),
    color: '#e11d48', // Rose-600
  },
  {
    id: 'global_taster',
    titleKey: 'badge_global_taster_title',
    descriptionKey: 'badge_global_taster_desc',
    icon: 'earth',
    lottieSource: require('@/assets/animations/global-food.json'),
    color: '#059669', // Emerald-600
  },
  {
    id: 'early_bird',
    titleKey: 'badge_early_bird_title',
    descriptionKey: 'badge_early_bird_desc',
    icon: 'weather-sunset-up',
    lottieSource: require('@/assets/animations/early-bird.json'),
    color: '#f59e0b', // Amber-500
  },
  {
    id: 'sweet_tooth',
    titleKey: 'badge_sweet_tooth_title',
    descriptionKey: 'badge_sweet_tooth_desc',
    icon: 'cupcake',
    lottieSource: require('@/assets/animations/sweet-ooth.json'),
    color: '#db2777', // Pink-600
  },
  {
    id: 'green_thumb',
    titleKey: 'badge_green_thumb_title',
    descriptionKey: 'badge_green_thumb_desc',
    icon: 'sprout',
    lottieSource: require('@/assets/animations/green-thumb.json'),
    color: '#16a34a', // Green-600
  },
  {
    id: 'carnivore',
    titleKey: 'badge_carnivore_title',
    descriptionKey: 'badge_carnivore_desc',
    icon: 'food-steak',
    lottieSource: require('@/assets/animations/carnivore.json'),
    color: '#b91c1c', // Red-700
  },
  {
    id: 'chatterbox',
    titleKey: 'badge_chatterbox_title',
    descriptionKey: 'badge_chatterbox_desc',
    icon: 'message-text-outline',
    lottieSource: require('@/assets/animations/chatterbox.json'),
    color: '#06b6d4', // Cyan-500
  },
  {
    id: 'ocean_lover',
    titleKey: 'badge_ocean_lover_title',
    descriptionKey: 'badge_ocean_lover_desc',
    icon: 'fish',
    lottieSource: require('@/assets/animations/ocean.json'),
    color: '#0ea5e9', // Sky-500
  },
  {
    id: 'pantry_master',
    titleKey: 'badge_pantry_master_title',
    descriptionKey: 'badge_pantry_master_desc',
    icon: 'cupboard',
    lottieSource: require('@/assets/animations/pantry.json'),
    color: '#78350f', // Amber-900
  },
  {
    id: 'shopping_spree',
    titleKey: 'badge_shopping_spree_title',
    descriptionKey: 'badge_shopping_spree_desc',
    icon: 'cart-plus',
    lottieSource: require('@/assets/animations/shopping-spree.json'),
    color: '#be185d', // Pink-700
  },
  {
    id: 'ai_chef_bestie',
    titleKey: 'badge_ai_chef_bestie_title',
    descriptionKey: 'badge_ai_chef_bestie_desc',
    icon: 'robot',
    lottieSource: require('@/assets/animations/ai-chef-bestie.json'),
    color: '#6366f1', // Indigo-500
  },
  {
    id: 'night_owl',
    titleKey: 'badge_night_owl_title',
    descriptionKey: 'badge_night_owl_desc',
    icon: 'weather-night',
    lottieSource: require('@/assets/animations/night_owl.json'),
    color: '#312e81', // Indigo-900
  },
  {
    id: 'weekend_warrior',
    titleKey: 'badge_weekend_warrior_title',
    descriptionKey: 'badge_weekend_warrior_desc',
    icon: 'calendar-weekend',
    lottieSource: require('@/assets/animations/weekend_warrior.json'),
    color: '#b45309', // Amber-700
  },
  {
    id: 'variety_king',
    titleKey: 'badge_variety_king_title',
    descriptionKey: 'badge_variety_king_desc',
    icon: 'palette',
    lottieSource: require('@/assets/animations/variety-king.json'),
    color: '#0f766e', // Teal-700
  },
  {
    id: 'map_explorer',
    titleKey: 'badge_map_explorer_title',
    descriptionKey: 'badge_map_explorer_desc',
    icon: 'map-legend',
    lottieSource: require('@/assets/animations/world-traveler.json'),
    color: '#374151', // Gray-700
  },
];
