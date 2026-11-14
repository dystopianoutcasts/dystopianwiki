import { getSection } from '../../config/versions.generated';

// Fallback only, for when the generated navigation has no entry for the category.
const categoryDisplayNames: Record<string, string> = {
  'lua-api': 'Lua API',
  recipes: 'Recipes',
  items: 'Items',
  'game-mechanics': 'Game Mechanics',
  'weapon-repair': 'Weapon Repair',
  foraging: 'Foraging',
  tools: 'Tools',
  tilezed: 'TileZed',
  worlded: 'WorldEd',
  buildings: 'Buildings',
  terrain: 'Terrain',
};

/**
 * The name to show for a category: its `name` from _category.json (the generated navigation),
 * else the hand-written list above, else the id with its dashes turned into spaces.
 */
export function categoryLabel(version: string, section: string, category: string): string {
  const fromData = getSection(version, section)?.categories.find((c) => c.id === category)?.name;
  return fromData || categoryDisplayNames[category] || category.replace(/-/g, ' ');
}
