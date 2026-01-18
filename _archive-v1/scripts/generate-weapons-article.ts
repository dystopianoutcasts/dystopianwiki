/**
 * Generate Weapons Reference Article
 * Creates a comprehensive wiki article with all vanilla weapons
 */

import * as fs from 'fs';
import * as path from 'path';

interface ParsedItem {
  module: string;
  name: string;
  fullName: string;
  type: string;
  properties: Record<string, string | string[]>;
  sourceFile: string;
  lineNumber: number;
}

interface ParseResult {
  modules: { name: string; items: ParsedItem[] }[];
  totalItems: number;
  sourceFile: string;
}

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  version: string;
  section: string;
  category: string;
  tags: string[];
  difficulty: string;
  content: string;
  excerpt: string;
  lastUpdated: string;
  relatedArticles: string[];
}

// Category descriptions and ordering
const CATEGORY_INFO: Record<string, { order: number; description: string }> = {
  'Axe': { order: 1, description: 'Axes excel at chopping trees and can deal devastating critical hits. Affected by the Axe skill.' },
  'LongBlade': { order: 2, description: 'Long bladed weapons like katanas and machetes. High damage, affected by Long Blade skill.' },
  'SmallBlade': { order: 3, description: 'Knives, cleavers, and other small cutting weapons. Fast attacks, affected by Short Blade skill.' },
  'Blunt': { order: 4, description: 'Large blunt weapons like baseball bats and sledgehammers. Good knockback, affected by Long Blunt skill.' },
  'SmallBlunt': { order: 5, description: 'Hammers, pipes, and other small blunt weapons. Affected by Short Blunt skill.' },
  'Spear': { order: 6, description: 'Spears and polearms have excellent range but are fragile. Affected by Spear skill.' },
  'Improvised': { order: 7, description: 'Improvised weapons not designed for combat. Usually lower durability.' },
  'Unarmed': { order: 8, description: 'Items that enhance unarmed combat.' },
  'Uncategorized': { order: 99, description: 'Weapons without a defined category.' },
};

function getCategories(item: ParsedItem): string[] {
  const cats = item.properties['Categories'];
  if (!cats) return ['Uncategorized'];
  return Array.isArray(cats) ? cats : [cats];
}

function generateContent(items: ParsedItem[]): string {
  const lines: string[] = [];

  // Introduction
  lines.push('# Vanilla Weapons Reference');
  lines.push('');
  lines.push(`Complete reference for all **${items.length} vanilla weapons** in Project Zomboid Build 41. This document covers every weapon defined in \`items_weapons.txt\`, organized by category with full stats.`);
  lines.push('');
  lines.push('## Understanding Weapon Stats');
  lines.push('');
  lines.push('| Stat | Description |');
  lines.push('|------|-------------|');
  lines.push('| **Damage** | Min-Max damage per hit. Higher is better. |');
  lines.push('| **Crit** | Critical hit chance percentage. |');
  lines.push('| **Speed** | Attack speed multiplier. 1.0 is baseline, higher is faster. |');
  lines.push('| **Range** | Maximum attack range. Higher means you can hit from further away. |');
  lines.push('| **Durability** | Maximum condition. Higher means more hits before breaking. |');
  lines.push('| **Weight** | Item weight. Affects carrying capacity. |');
  lines.push('');
  lines.push('## Quick Navigation');
  lines.push('');

  // Group items by primary category
  const categoryMap = new Map<string, ParsedItem[]>();
  for (const item of items) {
    const cats = getCategories(item);
    const primaryCat = cats[0];
    if (!categoryMap.has(primaryCat)) {
      categoryMap.set(primaryCat, []);
    }
    categoryMap.get(primaryCat)!.push(item);
  }

  // Sort categories by defined order
  const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => {
    const orderA = CATEGORY_INFO[a[0]]?.order ?? 50;
    const orderB = CATEGORY_INFO[b[0]]?.order ?? 50;
    return orderA - orderB;
  });

  // Table of contents
  for (const [category, catItems] of sortedCategories) {
    lines.push(`- [${category}](#${category.toLowerCase()}) (${catItems.length} weapons)`);
  }
  lines.push('');

  // Generate each category section
  for (const [category, catItems] of sortedCategories) {
    const info = CATEGORY_INFO[category] || { description: `${category} weapons.` };

    lines.push(`## ${category}`);
    lines.push('');
    lines.push(info.description);
    lines.push('');

    // Sort items by max damage (best first)
    catItems.sort((a, b) => {
      const dmgA = parseFloat(a.properties['MaxDamage'] as string) || 0;
      const dmgB = parseFloat(b.properties['MaxDamage'] as string) || 0;
      return dmgB - dmgA;
    });

    // Create table
    lines.push('| Weapon | Damage | Crit | Speed | Range | Durability | Weight |');
    lines.push('|--------|--------|------|-------|-------|------------|--------|');

    for (const item of catItems) {
      const p = item.properties;
      const name = (p['DisplayName'] as string) || item.name;
      const minDmg = p['MinDamage'] || '0';
      const maxDmg = p['MaxDamage'] || '0';
      const crit = p['CriticalChance'] || '0';
      const speed = p['BaseSpeed'] || '1';
      const range = p['MaxRange'] || '1';
      const durability = p['ConditionMax'] || '?';
      const weight = p['Weight'] || '?';

      lines.push(`| **${name}** | ${minDmg}-${maxDmg} | ${crit}% | ${speed} | ${range} | ${durability} | ${weight} |`);
    }

    lines.push('');
  }

  // Property Reference
  lines.push('---');
  lines.push('');
  lines.push('## Complete Property Reference');
  lines.push('');
  lines.push('Every weapon in Project Zomboid can have the following properties in its definition:');
  lines.push('');
  lines.push('### Combat Properties');
  lines.push('');
  lines.push('| Property | Type | Description |');
  lines.push('|----------|------|-------------|');
  lines.push('| `MinDamage` | float | Minimum damage dealt per hit |');
  lines.push('| `MaxDamage` | float | Maximum damage dealt per hit |');
  lines.push('| `CriticalChance` | int | Percentage chance for critical hit |');
  lines.push('| `CritDmgMultiplier` | float | Damage multiplier on critical hit |');
  lines.push('| `MaxHitCount` | int | Maximum zombies hit per swing |');
  lines.push('| `KnockdownMod` | float | Knockdown chance modifier |');
  lines.push('| `PushBackMod` | float | Push back force on hit |');
  lines.push('| `DoorDamage` | int | Damage dealt to doors |');
  lines.push('| `TreeDamage` | int | Damage dealt to trees |');
  lines.push('');
  lines.push('### Range & Speed');
  lines.push('');
  lines.push('| Property | Type | Description |');
  lines.push('|----------|------|-------------|');
  lines.push('| `MinRange` | float | Minimum attack range |');
  lines.push('| `MaxRange` | float | Maximum attack range |');
  lines.push('| `BaseSpeed` | float | Attack speed (1.0 = normal) |');
  lines.push('| `SwingTime` | float | Time to complete swing |');
  lines.push('| `MinimumSwingTime` | float | Minimum swing duration |');
  lines.push('| `WeaponLength` | float | Physical length of weapon |');
  lines.push('');
  lines.push('### Durability');
  lines.push('');
  lines.push('| Property | Type | Description |');
  lines.push('|----------|------|-------------|');
  lines.push('| `ConditionMax` | int | Maximum condition (durability) |');
  lines.push('| `ConditionLowerChanceOneIn` | int | 1-in-X chance to lose condition per hit |');
  lines.push('');
  lines.push('### Categories & Skills');
  lines.push('');
  lines.push('| Property | Type | Description |');
  lines.push('|----------|------|-------------|');
  lines.push('| `Categories` | string | Weapon categories (semicolon-separated) |');
  lines.push('| `SubCategory` | string | Swinging, Stabbing, etc. |');
  lines.push('');
  lines.push('### Visual & Audio');
  lines.push('');
  lines.push('| Property | Type | Description |');
  lines.push('|----------|------|-------------|');
  lines.push('| `WeaponSprite` | string | Sprite used when equipped |');
  lines.push('| `Icon` | string | Inventory icon |');
  lines.push('| `SwingAnim` | string | Animation for swinging |');
  lines.push('| `HitSound` | string | Sound on zombie hit |');
  lines.push('| `SwingSound` | string | Sound when swinging |');
  lines.push('| `BreakSound` | string | Sound when weapon breaks |');
  lines.push('');

  // Source file info
  lines.push('---');
  lines.push('');
  lines.push('## Source');
  lines.push('');
  lines.push('All weapon definitions come from:');
  lines.push('```');
  lines.push('media/scripts/items_weapons.txt');
  lines.push('```');
  lines.push('');
  lines.push('To override vanilla weapons in your mod, create a file with the same module and item name. Your definitions will merge with or replace the vanilla ones.');

  return lines.join('\n');
}

function main() {
  // Read parsed data
  const parsedPath = path.join(process.cwd(), 'parsed-output.json');
  if (!fs.existsSync(parsedPath)) {
    console.error('Run "npx tsx scripts/parse-pz-scripts.ts parse items_weapons.txt" first');
    process.exit(1);
  }

  const parsed: ParseResult = JSON.parse(fs.readFileSync(parsedPath, 'utf-8'));
  const allWeapons = parsed.modules.flatMap(m => m.items);

  console.log(`Generating article for ${allWeapons.length} weapons...`);

  const content = generateContent(allWeapons);

  const article: WikiArticle = {
    id: 'vanilla-weapons-reference',
    title: 'Vanilla Weapons Reference',
    slug: 'vanilla-weapons-reference',
    version: 'build-41',
    section: 'modding',
    category: 'vanilla-reference',
    tags: ['reference', 'weapons', 'vanilla', 'items'],
    difficulty: 'beginner',
    content,
    excerpt: `Complete reference for all ${allWeapons.length} vanilla weapons in Project Zomboid, organized by category with full stats and property documentation.`,
    lastUpdated: new Date().toISOString().split('T')[0],
    relatedArticles: ['item-creation', 'item-anatomy', 'weapon-repair-system-overview'],
  };

  // Write article
  const outputPath = path.join(
    process.cwd(),
    'public/data/build-41/modding/vanilla-reference/vanilla-weapons-reference.json'
  );

  fs.writeFileSync(outputPath, JSON.stringify(article, null, 2));
  console.log(`Article written to ${outputPath}`);

  // Update index
  const indexPath = path.join(
    process.cwd(),
    'public/data/build-41/modding/vanilla-reference/index.json'
  );

  const index = {
    articles: [
      {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        tags: article.tags,
        difficulty: article.difficulty,
        lastUpdated: article.lastUpdated,
      }
    ]
  };

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Index updated at ${indexPath}`);

  // Update category count
  const categoriesPath = path.join(
    process.cwd(),
    'public/data/build-41/modding/categories.json'
  );

  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
  const vanillaRef = categories.categories.find((c: { id: string }) => c.id === 'vanilla-reference');
  if (vanillaRef) {
    vanillaRef.articleCount = 1;
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
    console.log('Updated category article count');
  }

  console.log('\nDone! Article generated successfully.');
}

main();
