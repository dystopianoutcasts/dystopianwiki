/**
 * migrate-markdown.ts
 * Migrates vanilla Project Zomboid documentation from OutcastTESTING_DOCS
 * to the wiki's JSON data format
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination paths
const SOURCE_DIR = path.resolve(__dirname, '../../OutcastTESTING_DOCS');
const DEST_DIR = path.resolve(__dirname, '../public/data/build-41');

// Type definitions
interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  version: string;
  section: string;
  category: string;
  tags: string[];
  content: string;
  excerpt: string;
  lastUpdated: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tableOfContents: TOCItem[];
}

interface SearchEntry {
  id: string;
  title: string;
  slug: string;
  url: string;
  version: string;
  section: string;
  category: string;
  tags: string[];
  excerpt: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// Migration mapping
const MIGRATION_MAP = {
  'modding': {
    'lua-api': {
      sourceDir: 'API_Research',
      files: [
        { file: '01_JAVA_LUA_BRIDGE.md', slug: 'java-lua-bridge', difficulty: 'advanced' as const },
        { file: '02_ITEM_MODIFICATION_PATTERNS.md', slug: 'item-modification', difficulty: 'intermediate' as const },
        { file: '03_EVENT_ARCHITECTURE.md', slug: 'event-architecture', difficulty: 'intermediate' as const },
        { file: '04_IMPLEMENTATION_GUIDE.md', slug: 'implementation-guide', difficulty: 'beginner' as const },
        { file: '06_WEAPON_MODEL_SWAPPING.md', slug: 'weapon-model-swapping', difficulty: 'advanced' as const },
      ]
    },
    'recipes': {
      sourceDir: '',
      files: [
        { file: '01-recipe-creation-basics.md', slug: 'recipe-basics', difficulty: 'beginner' as const },
        { file: '02-recipe-with-tables.md', slug: 'crafting-tables', difficulty: 'intermediate' as const },
        { file: '03-consumable-items.md', slug: 'consumable-recipes', difficulty: 'beginner' as const },
        { file: '04-vanilla-recipe-anatomy.md', slug: 'vanilla-recipe-anatomy', difficulty: 'intermediate' as const },
      ]
    },
    'items': {
      sourceDir: '',
      files: [
        { file: '05-item-creation-guide.md', slug: 'item-creation', difficulty: 'beginner' as const },
        { file: '06-vanilla-item-anatomy.md', slug: 'vanilla-item-anatomy', difficulty: 'intermediate' as const },
        { file: '09-vanilla-ammunition-items.md', slug: 'ammunition-items', difficulty: 'intermediate' as const },
      ]
    },
    'game-mechanics': {
      sourceDir: '',
      files: [
        { file: 'PZ_Injury_System_Reference.md', slug: 'injury-system', difficulty: 'intermediate' as const },
        { file: 'ANIMATION_REFERENCE.md', slug: 'animation-reference', difficulty: 'advanced' as const },
        { file: 'SOUND_REFERENCE.md', slug: 'sound-reference', difficulty: 'intermediate' as const },
      ]
    },
    'weapon-repair': {
      sourceDir: 'Weapon_Repair_Research',
      files: [
        { file: '01_REPAIR_SYSTEM_OVERVIEW.md', slug: 'repair-system-overview', difficulty: 'beginner' as const },
        { file: '02_FIXING_TXT_ANATOMY.md', slug: 'fixing-txt-anatomy', difficulty: 'intermediate' as const },
        { file: '03_REPAIR_ITEMS_REFERENCE.md', slug: 'repair-items-reference', difficulty: 'intermediate' as const },
        { file: '04_REPAIRABLE_WEAPONS.md', slug: 'repairable-weapons', difficulty: 'beginner' as const },
        { file: '05_LUA_REPAIR_MECHANICS.md', slug: 'lua-repair-mechanics', difficulty: 'advanced' as const },
        { file: '06_FORMULAS_AND_CALCULATIONS.md', slug: 'repair-formulas', difficulty: 'intermediate' as const },
        { file: '08_CHEAT_SHEET.md', slug: 'repair-cheat-sheet', difficulty: 'beginner' as const },
      ]
    },
    'foraging': {
      sourceDir: 'FORAGING_RESEARCH',
      files: [
        { file: 'VANILLA_FORAGING_NOTES.md', slug: 'vanilla-foraging', difficulty: 'beginner' as const },
      ]
    },
    'tools': {
      sourceDir: '',
      files: [
        { file: 'TILEZED_SETUP_GUIDE.md', slug: 'tilezed-setup', difficulty: 'beginner' as const },
        { file: 'QUICK_START_MOD_DEVELOPMENT.md', slug: 'mod-quickstart', difficulty: 'beginner' as const },
      ]
    }
  },
  'mapping': {
    'tilezed': {
      sourceDir: '',
      files: [
        { file: 'TILEZED_SETUP_GUIDE.md', slug: 'tilezed-setup-guide', difficulty: 'beginner' as const },
      ]
    }
  }
};

// Utility functions
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractTitleFromMarkdown(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();

  // Try to extract from first line if no H1
  const firstLine = content.split('\n')[0].trim();
  return firstLine.replace(/^#+\s*/, '').trim() || 'Untitled';
}

function extractExcerpt(content: string, maxLength: number = 200): string {
  // Remove markdown headers and code blocks
  const cleaned = content
    .replace(/^#+\s+.+$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .trim();

  const firstParagraph = cleaned.split('\n\n')[0]?.trim() || '';
  if (firstParagraph.length <= maxLength) return firstParagraph;
  return firstParagraph.substring(0, maxLength - 3) + '...';
}

function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugify(text);
    items.push({ id, text, level });
  }

  return items;
}

function extractTags(content: string, filename: string): string[] {
  const tags: string[] = [];

  // Extract keywords from content
  const keywords = ['lua', 'recipe', 'item', 'repair', 'weapon', 'foraging', 'event',
                    'animation', 'sound', 'tilezed', 'modding', 'api', 'crafting'];

  const lowerContent = content.toLowerCase();
  keywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) {
      tags.push(keyword);
    }
  });

  // Add tags from filename
  const filenameTags = filename.replace('.md', '').split(/[-_]/).filter(t => t.length > 2);
  filenameTags.forEach(tag => {
    const cleanTag = tag.toLowerCase();
    if (!tags.includes(cleanTag) && cleanTag.length > 2) {
      tags.push(cleanTag);
    }
  });

  return tags.slice(0, 8); // Limit to 8 tags
}

function readMarkdownFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.warn(`Could not read file: ${filePath}`);
    return null;
  }
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeJSON(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Main migration function
async function migrateContent(): Promise<void> {
  console.log('Starting content migration...\n');

  const searchIndex: SearchEntry[] = [];
  const version = 'build-41';

  for (const [section, categories] of Object.entries(MIGRATION_MAP)) {
    console.log(`\nProcessing section: ${section}`);

    for (const [category, config] of Object.entries(categories)) {
      console.log(`  Category: ${category}`);

      const categoryDir = path.join(DEST_DIR, section, category);
      ensureDir(categoryDir);

      const articles: WikiArticle[] = [];

      for (const fileConfig of config.files) {
        const sourceFile = config.sourceDir
          ? path.join(SOURCE_DIR, config.sourceDir, fileConfig.file)
          : path.join(SOURCE_DIR, fileConfig.file);

        const content = readMarkdownFile(sourceFile);
        if (!content) {
          console.log(`    ⚠ Skipping: ${fileConfig.file} (not found)`);
          continue;
        }

        const title = extractTitleFromMarkdown(content);
        const slug = fileConfig.slug;
        const id = `${category}-${slug}`;

        const article: WikiArticle = {
          id,
          title,
          slug,
          version,
          section,
          category,
          tags: extractTags(content, fileConfig.file),
          content,
          excerpt: extractExcerpt(content),
          lastUpdated: new Date().toISOString().split('T')[0],
          difficulty: fileConfig.difficulty,
          tableOfContents: extractTOC(content),
        };

        // Write individual article JSON
        const articlePath = path.join(categoryDir, `${slug}.json`);
        writeJSON(articlePath, article);

        articles.push(article);

        // Add to search index
        searchIndex.push({
          id,
          title,
          slug,
          url: `/${version}/${section}/${category}/${slug}`,
          version,
          section,
          category,
          tags: article.tags,
          excerpt: article.excerpt,
          difficulty: fileConfig.difficulty,
        });

        console.log(`    ✓ Migrated: ${fileConfig.file} -> ${slug}.json`);
      }

      // Write category index
      const indexPath = path.join(categoryDir, 'index.json');
      writeJSON(indexPath, {
        articles: articles.map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          version: a.version,
          section: a.section,
          category: a.category,
          tags: a.tags,
          excerpt: a.excerpt,
          lastUpdated: a.lastUpdated,
          difficulty: a.difficulty,
          content: '',
          tableOfContents: [],
        }))
      });
    }
  }

  // Write search index
  const searchIndexPath = path.join(DEST_DIR, '..', 'search-index.json');
  writeJSON(searchIndexPath, searchIndex);
  console.log(`\n✓ Search index written with ${searchIndex.length} entries`);

  console.log('\nMigration complete!');
}

// Run migration
migrateContent().catch(console.error);
