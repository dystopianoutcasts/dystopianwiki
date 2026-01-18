/**
 * PZ Script Parser
 * Parses Project Zomboid .txt script files (items, recipes, etc.)
 * Extracts structured data for wiki documentation
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Types
// =============================================================================

export interface ParsedItem {
  module: string;
  name: string;
  fullName: string; // module.name
  type: string;
  properties: Record<string, string | string[]>;
  rawContent: string;
  sourceFile: string;
  lineNumber: number;
}

export interface ParsedModule {
  name: string;
  items: ParsedItem[];
}

export interface ParseResult {
  modules: ParsedModule[];
  totalItems: number;
  sourceFile: string;
}

// =============================================================================
// Parser
// =============================================================================

/**
 * Parse a PZ script file (.txt)
 */
export function parseScriptFile(filePath: string): ParseResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const modules: ParsedModule[] = [];

  let currentModule: ParsedModule | null = null;
  let currentItem: Partial<ParsedItem> | null = null;
  let braceDepth = 0;
  let itemStartLine = 0;
  let itemContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      if (currentItem) itemContent.push(line);
      continue;
    }

    // Module declaration
    const moduleMatch = trimmed.match(/^module\s+(\w+)\s*$/);
    if (moduleMatch) {
      currentModule = { name: moduleMatch[1], items: [] };
      modules.push(currentModule);
      continue;
    }

    // Opening brace for module
    if (trimmed === '{' && currentModule && braceDepth === 0) {
      braceDepth = 1;
      continue;
    }

    // Item declaration
    const itemMatch = trimmed.match(/^item\s+(\w+)\s*$/);
    if (itemMatch && currentModule && braceDepth === 1) {
      currentItem = {
        module: currentModule.name,
        name: itemMatch[1],
        fullName: `${currentModule.name}.${itemMatch[1]}`,
        properties: {},
        sourceFile: path.basename(filePath),
        lineNumber: i + 1,
      };
      itemStartLine = i;
      itemContent = [line];
      continue;
    }

    // Opening brace for item
    if (trimmed === '{' && currentItem && braceDepth === 1) {
      braceDepth = 2;
      itemContent.push(line);
      continue;
    }

    // Inside item - parse properties
    if (currentItem && braceDepth === 2) {
      itemContent.push(line);

      // Closing brace for item
      if (trimmed === '}' || trimmed === '},') {
        braceDepth = 1;
        currentItem.rawContent = itemContent.join('\n');

        // Determine type from properties
        currentItem.type = (currentItem.properties?.['Type'] as string) || 'Unknown';

        if (currentModule) {
          currentModule.items.push(currentItem as ParsedItem);
        }
        currentItem = null;
        itemContent = [];
        continue;
      }

      // Parse property line
      const propMatch = trimmed.match(/^(\w+)\s*=\s*(.+?),?\s*$/);
      if (propMatch && currentItem.properties) {
        const key = propMatch[1];
        let value = propMatch[2].trim();

        // Remove trailing comma
        if (value.endsWith(',')) {
          value = value.slice(0, -1);
        }

        // Handle semicolon-separated lists
        if (value.includes(';')) {
          currentItem.properties[key] = value.split(';').map(v => v.trim());
        } else {
          currentItem.properties[key] = value;
        }
      }
    }

    // Closing brace for module
    if (trimmed === '}' && braceDepth === 1) {
      braceDepth = 0;
      currentModule = null;
    }
  }

  const totalItems = modules.reduce((sum, m) => sum + m.items.length, 0);

  return {
    modules,
    totalItems,
    sourceFile: path.basename(filePath),
  };
}

// =============================================================================
// Categorization
// =============================================================================

export interface WeaponCategory {
  name: string;
  description: string;
  items: ParsedItem[];
}

/**
 * Categorize weapons by their Categories property
 */
export function categorizeWeapons(items: ParsedItem[]): WeaponCategory[] {
  const categoryMap = new Map<string, ParsedItem[]>();

  for (const item of items) {
    const categories = item.properties['Categories'];
    if (!categories) {
      categoryMap.set('Uncategorized', [...(categoryMap.get('Uncategorized') || []), item]);
      continue;
    }

    const cats = Array.isArray(categories) ? categories : [categories];
    for (const cat of cats) {
      categoryMap.set(cat, [...(categoryMap.get(cat) || []), item]);
    }
  }

  const categoryDescriptions: Record<string, string> = {
    'SmallBlunt': 'Small blunt weapons like nightsticks and hammers',
    'Blunt': 'Large blunt weapons like baseball bats and crowbars',
    'SmallBlade': 'Small bladed weapons like knives and scissors',
    'Blade': 'Large bladed weapons like machetes and katanas',
    'Axe': 'Axes and hatchets',
    'Spear': 'Spears and polearms',
    'Improvised': 'Improvised weapons not designed for combat',
    'Unarmed': 'Unarmed combat items',
    'Firearm': 'Ranged firearms',
    'Uncategorized': 'Items without a defined category',
  };

  return Array.from(categoryMap.entries())
    .map(([name, items]) => ({
      name,
      description: categoryDescriptions[name] || `${name} weapons`,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// =============================================================================
// Wiki Article Generation
// =============================================================================

export interface WikiArticle {
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

/**
 * Generate markdown content for a weapon
 */
function generateWeaponMarkdown(item: ParsedItem): string {
  const props = item.properties;
  const lines: string[] = [];

  lines.push(`# ${props['DisplayName'] || item.name}`);
  lines.push('');
  lines.push(`**Internal Name:** \`${item.fullName}\``);
  lines.push('');

  // Quick stats table
  lines.push('## Quick Stats');
  lines.push('');
  lines.push('| Stat | Value |');
  lines.push('|------|-------|');

  if (props['MinDamage']) lines.push(`| Min Damage | ${props['MinDamage']} |`);
  if (props['MaxDamage']) lines.push(`| Max Damage | ${props['MaxDamage']} |`);
  if (props['ConditionMax']) lines.push(`| Durability | ${props['ConditionMax']} |`);
  if (props['CriticalChance']) lines.push(`| Crit Chance | ${props['CriticalChance']}% |`);
  if (props['CritDmgMultiplier']) lines.push(`| Crit Multiplier | ${props['CritDmgMultiplier']}x |`);
  if (props['Weight']) lines.push(`| Weight | ${props['Weight']} |`);
  if (props['MaxRange']) lines.push(`| Range | ${props['MaxRange']} |`);
  if (props['BaseSpeed']) lines.push(`| Attack Speed | ${props['BaseSpeed']} |`);

  lines.push('');

  // Categories
  const cats = props['Categories'];
  if (cats) {
    const catList = Array.isArray(cats) ? cats : [cats];
    lines.push('## Categories');
    lines.push('');
    lines.push(catList.map(c => `- ${c}`).join('\n'));
    lines.push('');
  }

  // All properties section
  lines.push('## All Properties');
  lines.push('');
  lines.push('```');
  lines.push(`item ${item.name} {`);

  for (const [key, value] of Object.entries(props)) {
    const displayValue = Array.isArray(value) ? value.join(';') : value;
    lines.push(`    ${key} = ${displayValue},`);
  }

  lines.push('}');
  lines.push('```');
  lines.push('');

  // Source reference
  lines.push('## Source');
  lines.push('');
  lines.push(`Found in \`media/scripts/${item.sourceFile}\` at line ${item.lineNumber}.`);

  return lines.join('\n');
}

/**
 * Generate a wiki article for a weapon
 */
export function generateWeaponArticle(item: ParsedItem): WikiArticle {
  const displayName = (item.properties['DisplayName'] as string) || item.name;
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const content = generateWeaponMarkdown(item);

  const cats = item.properties['Categories'];
  const tags = ['weapon', 'vanilla'];
  if (cats) {
    const catList = Array.isArray(cats) ? cats : [cats];
    tags.push(...catList.map(c => c.toLowerCase()));
  }

  return {
    id: `vanilla-weapon-${slug}`,
    title: displayName,
    slug: `vanilla-${slug}`,
    version: 'build-41',
    section: 'modding',
    category: 'vanilla-reference',
    tags,
    difficulty: 'beginner',
    content,
    excerpt: `Reference documentation for ${displayName} (${item.fullName}). Includes all properties and stats.`,
    lastUpdated: new Date().toISOString().split('T')[0],
    relatedArticles: [],
  };
}

/**
 * Generate a category overview article
 */
export function generateCategoryOverview(category: WeaponCategory): WikiArticle {
  const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const lines: string[] = [];
  lines.push(`# ${category.name} Weapons`);
  lines.push('');
  lines.push(category.description);
  lines.push('');
  lines.push(`This category contains **${category.items.length}** weapons.`);
  lines.push('');
  lines.push('## Weapons List');
  lines.push('');
  lines.push('| Weapon | Damage | Durability | Speed |');
  lines.push('|--------|--------|------------|-------|');

  for (const item of category.items) {
    const props = item.properties;
    const name = props['DisplayName'] || item.name;
    const damage = `${props['MinDamage'] || '?'}-${props['MaxDamage'] || '?'}`;
    const durability = props['ConditionMax'] || '?';
    const speed = props['BaseSpeed'] || '?';

    lines.push(`| [${name}](/build-41/modding/vanilla-reference/vanilla-${item.name.toLowerCase()}) | ${damage} | ${durability} | ${speed} |`);
  }

  lines.push('');
  lines.push('## Category Properties');
  lines.push('');
  lines.push(`Weapons in the \`${category.name}\` category share common traits and are affected by related skills.`);

  return {
    id: `vanilla-weapons-${slug}`,
    title: `${category.name} Weapons`,
    slug: `weapons-${slug}`,
    version: 'build-41',
    section: 'modding',
    category: 'vanilla-reference',
    tags: ['weapon', 'vanilla', 'reference', slug],
    difficulty: 'beginner',
    content: lines.join('\n'),
    excerpt: `${category.description}. Contains ${category.items.length} weapons.`,
    lastUpdated: new Date().toISOString().split('T')[0],
    relatedArticles: [],
  };
}

// =============================================================================
// CLI
// =============================================================================

const PZ_SCRIPTS_PATH = 'R:\\Games\\Steam\\steamapps\\common\\ProjectZomboid\\media\\scripts';
const WIKI_DATA_PATH = path.join(process.cwd(), 'public', 'data', 'build-41', 'modding', 'vanilla-reference');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'parse') {
    // Parse a specific file
    const file = args[1] || 'items_weapons.txt';
    const filePath = path.join(PZ_SCRIPTS_PATH, file);

    console.log(`Parsing ${filePath}...`);
    const result = parseScriptFile(filePath);

    console.log(`Found ${result.modules.length} modules with ${result.totalItems} total items`);

    for (const mod of result.modules) {
      console.log(`  Module ${mod.name}: ${mod.items.length} items`);
    }

    // Output JSON
    const outputPath = path.join(process.cwd(), 'parsed-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nOutput written to ${outputPath}`);
  }

  else if (command === 'generate-weapons') {
    // Generate weapon wiki articles
    const filePath = path.join(PZ_SCRIPTS_PATH, 'items_weapons.txt');
    console.log(`Parsing ${filePath}...`);

    const result = parseScriptFile(filePath);
    const allWeapons = result.modules.flatMap(m => m.items);

    console.log(`Found ${allWeapons.length} weapons`);

    // Ensure output directory exists
    if (!fs.existsSync(WIKI_DATA_PATH)) {
      fs.mkdirSync(WIKI_DATA_PATH, { recursive: true });
    }

    // Generate category overviews
    const categories = categorizeWeapons(allWeapons);
    console.log(`\nCategories found:`);
    for (const cat of categories) {
      console.log(`  ${cat.name}: ${cat.items.length} weapons`);
    }

    // Generate individual weapon articles (just list them for now)
    console.log(`\nGenerating ${allWeapons.length} weapon articles...`);

    const articles: WikiArticle[] = [];
    for (const weapon of allWeapons) {
      const article = generateWeaponArticle(weapon);
      articles.push(article);
    }

    // Generate category articles
    for (const cat of categories) {
      const article = generateCategoryOverview(cat);
      articles.push(article);
    }

    // Write summary
    console.log(`\nGenerated ${articles.length} articles total`);
    console.log(`  - ${allWeapons.length} weapon articles`);
    console.log(`  - ${categories.length} category overview articles`);

    // Output manifest
    const manifest = {
      generated: new Date().toISOString(),
      source: 'items_weapons.txt',
      articles: articles.map(a => ({ id: a.id, title: a.title, slug: a.slug })),
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'weapons-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    console.log(`\nManifest written to weapons-manifest.json`);
  }

  else if (command === 'stats') {
    // Show stats for all script files
    const files = fs.readdirSync(PZ_SCRIPTS_PATH).filter(f => f.endsWith('.txt'));

    console.log('PZ Script Files Summary:\n');

    let totalItems = 0;
    for (const file of files) {
      try {
        const result = parseScriptFile(path.join(PZ_SCRIPTS_PATH, file));
        console.log(`${file}: ${result.totalItems} items`);
        totalItems += result.totalItems;
      } catch (e) {
        console.log(`${file}: (parse error)`);
      }
    }

    console.log(`\nTotal: ${totalItems} items across ${files.length} files`);
  }

  else {
    console.log('PZ Script Parser');
    console.log('');
    console.log('Usage:');
    console.log('  npx tsx scripts/parse-pz-scripts.ts parse [file]     - Parse a script file');
    console.log('  npx tsx scripts/parse-pz-scripts.ts generate-weapons - Generate weapon wiki articles');
    console.log('  npx tsx scripts/parse-pz-scripts.ts stats            - Show stats for all script files');
  }
}

main().catch(console.error);
