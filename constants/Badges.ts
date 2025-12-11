export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string; // MaterialCommunityIcons name
  lottieSource?: any; // Required numeric ID from require()
  color: string;
  condition?: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Maintained a 3-day streak',
    icon: 'fire-alert',
    lottieSource: require('@/assets/animations/fire.json'),
    color: '#ef4444', // Red-500
  },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    description: 'Maintained a 7-day streak',
    icon: 'fire-circle',
    color: '#f97316', // Orange-500
  },
  {
    id: 'level_5',
    title: 'Sous Chef',
    description: 'Reached Level 5',
    icon: 'chef-hat',
    color: '#8b5cf6', // Violet-500
  },
  {
    id: 'level_10',
    title: 'Master Chef',
    description: 'Reached Level 10',
    icon: 'crown',
    color: '#fbbf24', // Amber-400
  },
  {
    id: 'first_cook',
    title: 'First Dish',
    description: 'Cooked your first recipe',
    icon: 'silverware-variant',
    color: '#10b981', // Emerald-500
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Visited 5 different country pages',
    icon: 'compass',
    color: '#3b82f6', // Blue-500
  },
  {
    id: 'gordon_r',
    title: 'Food Stylist',
    description: 'Uploaded 5 photos of your dishes',
    icon: 'camera-iris',
    color: '#e11d48', // Rose-600
  },
  {
    id: 'global_taster',
    title: 'Global Taster',
    description: 'Cooked from 3 different regions',
    icon: 'earth',
    color: '#059669', // Emerald-600
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Cooked breakfast before 9 AM',
    icon: 'weather-sunset-up',
    color: '#f59e0b', // Amber-500
  },
  {
    id: 'sweet_tooth',
    title: 'Sweet Tooth',
    description: 'Cooked 5 Dessert recipes',
    icon: 'cupcake',
    color: '#db2777', // Pink-600
  },
  {
    id: 'green_thumb',
    title: 'Green Thumb',
    description: 'Cooked 5 Vegetarian/Vegan recipes',
    icon: 'sprout',
    color: '#16a34a', // Green-600
  },
  {
    id: 'carnivore',
    title: 'Carnivore',
    description: 'Cooked 5 Meat recipes (Beef/Pork/Lamb)',
    icon: 'food-steak',
    color: '#b91c1c', // Red-700
  },
  {
    id: 'chatterbox',
    title: 'Chatterbox',
    description: 'Sent 10 messages to AI Chef',
    icon: 'message-text-outline',
    color: '#06b6d4', // Cyan-500
  },
  {
    id: 'ocean_lover',
    title: 'Ocean Lover',
    description: 'Cooked 3 Seafood/Fish recipes',
    icon: 'fish',
    color: '#0ea5e9', // Sky-500
  },
];
