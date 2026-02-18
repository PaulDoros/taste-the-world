import { BadgeDef } from '@/constants/Badges';
import { Doc } from '@/convex/_generated/dataModel';

export const getBadgeProgress = (
  badge: BadgeDef,
  userStats: NonNullable<Doc<'users'>['gamification']>,
  isUnlocked: boolean
) => {
  if (isUnlocked) return { percent: 100, text: 'Unlocked' };

  let current = 0;
  let target = 1;
  let suffix = '';
  const counts = (userStats as any).categoryCounts || {};

  switch (badge.id) {
    case 'streak_3':
      current = userStats.currentStreak;
      target = 3;
      suffix = 'days';
      break;
    case 'streak_7':
      current = userStats.currentStreak;
      target = 7;
      suffix = 'days';
      break;
    case 'level_5':
      current = userStats.level;
      target = 5;
      suffix = 'lvl';
      break;
    case 'level_10':
      current = userStats.level;
      target = 10;
      suffix = 'lvl';
      break;
    case 'first_cook':
      current = userStats.xp > 0 ? 1 : 0;
      target = 1;
      break;
    case 'explorer':
      // Tracks visited country pages
      current = ((userStats as any).visitedCountries || []).length;
      target = 5;
      suffix = 'visited';
      break;
    case 'globetrotter':
      // Tracks unique regions cooked from
      current = (userStats.uniqueRegions || []).length;
      target = 5;
      suffix = 'regions';
      break;
    case 'shopping_spree':
      current = (userStats as any).shoppingItemsAdded || 0;
      target = 50;
      suffix = 'items';
      break;
    case 'pantry_master':
      current = (userStats as any).pantryItemCount || 0;
      target = 20;
      suffix = 'items';
      break;
    case 'ai_chef_bestie':
      current = (userStats as any).aiRecipesSaved || 0;
      target = 5;
      suffix = 'saved';
      break;
    case 'night_owl':
      return { percent: 0, text: 'Cook after 9pm' };
    case 'weekend_warrior':
      return { percent: 0, text: 'Cook on Sat/Sun' };
    case 'variety_king':
      current = Object.keys(counts).length;
      target = 5;
      suffix = 'cats';
      break;
    case 'gordon_r':
      current = userStats.photosUploaded || 0;
      target = 5;
      suffix = 'photos';
      break;
    case 'early_bird':
      return { percent: 0, text: 'Cook before 9am' };
    case 'global_taster':
      // logic for global taster (cook from 3 regions)
      // simplifying for now if not fully tracked in stats object yet
      // but we did add uniqueRegions to schema, so maybe we use that?
      // The comment in badgedef says "Cooked from 3 different regions",
      // usually implies uniqueRegions is populated by cooking.
      current = (userStats.uniqueRegions || []).length;
      target = 3;
      break;
    case 'chatterbox':
      current = (userStats as any).aiMessagesSent || 0;
      target = 10;
      suffix = 'msgs';
      break;
    case 'sweet_tooth':
      current = counts['Dessert'] || 0;
      target = 5;
      suffix = 'eaten';
      break;
    case 'green_thumb':
      current = (counts['Vegetarian'] || 0) + (counts['Vegan'] || 0);
      target = 5;
      suffix = 'eaten';
      break;
    case 'carnivore':
      current =
        (counts['Beef'] || 0) + (counts['Pork'] || 0) + (counts['Lamb'] || 0);
      target = 5;
      suffix = 'eaten';
      break;
    case 'ocean_lover':
      current = counts['Seafood'] || 0;
      target = 3;
      suffix = 'eaten';
      break;

    default:
      return { percent: 0, text: 'Locked' };
  }

  const percent = Math.round(Math.min((current / target) * 100, 100));
  return {
    percent,
    text: `${current}/${target} ${suffix}`.trim(),
  };
};
