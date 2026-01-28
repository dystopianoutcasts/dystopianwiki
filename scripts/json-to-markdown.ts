/**
 * json-to-markdown.ts
 * Converts JSON articles from the old format to Markdown with YAML frontmatter
 *
 * Usage:
 *   ts-node scripts/json-to-markdown.ts <json-file> [output-file]
 *   ts-node scripts/json-to-markdown.ts --batch <directory>
 */

import * as fs from 'fs';
import * as path from 'path';

interface JsonArticle {
  id: string;
  title: string;
  slug: string;
  version: string;
  section: string;
  category: string;
  subcategory?: string | null;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  excerpt: string;
  lastUpdated: string;
  relatedArticles?: string[];
  nextSteps?: Array<{ title: string; path: string }>;
  tableOfContents?: Array<{ id: string; text: string; level: number }>;
}

interface MarkdownArticle {
  frontmatter: string;
  content: string;
}

/**
 * Convert JSON article to Markdown with YAML frontmatter
 */
function convertToMarkdown(json: JsonArticle, game: string = 'pz'): MarkdownArticle {
  // Build YAML frontmatter
  const frontmatter = [
    '---',
    `id: ${json.id}`,
    `slug: ${json.slug}`,
    `title: "${json.title.replace(/"/g, '\\"')}"`,
    `game: ${game}`,
    `version: ${json.version}`,
    `section: ${json.section}`,
    `category: ${json.category}`,
    `subcategory: ${json.subcategory || 'null'}`,
  ];

  // Add difficulty if present
  if (json.difficulty) {
    frontmatter.push(`difficulty: ${json.difficulty}`);
  }

  // Add tags
  frontmatter.push('tags:');
  if (json.tags && json.tags.length > 0) {
    json.tags.forEach(tag => {
      frontmatter.push(`  - ${tag}`);
    });
  } else {
    frontmatter.push('  []');
  }

  // Add excerpt
  const cleanExcerpt = json.excerpt.replace(/\n/g, ' ').replace(/"/g, '\\"');
  frontmatter.push(`excerpt: "${cleanExcerpt}"`);

  // Add related articles if present
  if (json.relatedArticles && json.relatedArticles.length > 0) {
    frontmatter.push('related_articles:');
    json.relatedArticles.forEach(article => {
      frontmatter.push(`  - ${article}`);
    });
  }

  // Add table of contents if present
  if (json.tableOfContents && json.tableOfContents.length > 0) {
    frontmatter.push('table_of_contents:');
    json.tableOfContents.forEach(item => {
      frontmatter.push(`  - text: "${item.text}"`);
      frontmatter.push(`    link: "#${item.id}"`);
    });
  }

  // Add next steps if present
  if (json.nextSteps && json.nextSteps.length > 0) {
    frontmatter.push('next_steps:');
    json.nextSteps.forEach(step => {
      frontmatter.push(`  - title: "${step.title}"`);
      frontmatter.push(`    path: ${step.path}`);
    });
  }

  // Add last updated
  frontmatter.push(`last_updated: ${json.lastUpdated}`);
  frontmatter.push('---');

  return {
    frontmatter: frontmatter.join('\n'),
    content: json.content.trim()
  };
}

/**
 * Read JSON article from file
 */
function readJsonArticle(filePath: string): JsonArticle | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as JsonArticle;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

/**
 * Write markdown article to file
 */
function writeMarkdownArticle(filePath: string, article: MarkdownArticle): void {
  const content = `${article.frontmatter}\n\n${article.content}\n`;

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Generate output path from JSON article metadata
 */
function generateOutputPath(json: JsonArticle, game: string = 'pz'): string {
  const baseDir = path.resolve(__dirname, '../content/articles');
  return path.join(
    baseDir,
    game,
    json.version,
    json.section,
    json.category,
    `${json.slug}.md`
  );
}

/**
 * Convert a single JSON file to Markdown
 */
function convertFile(inputPath: string, outputPath?: string, game: string = 'pz'): void {
  console.log(`Converting: ${inputPath}`);

  const json = readJsonArticle(inputPath);
  if (!json) {
    console.error(`Failed to read JSON from ${inputPath}`);
    return;
  }

  const markdown = convertToMarkdown(json, game);
  const finalOutputPath = outputPath || generateOutputPath(json, game);

  writeMarkdownArticle(finalOutputPath, markdown);
  console.log(`✓ Written: ${finalOutputPath}`);
}

/**
 * Batch convert all JSON files in a directory
 */
function convertDirectory(dirPath: string, game: string = 'pz'): void {
  console.log(`Scanning directory: ${dirPath}`);

  const files = fs.readdirSync(dirPath, { recursive: true }) as string[];
  const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('index.json'));

  console.log(`Found ${jsonFiles.length} JSON articles`);

  jsonFiles.forEach(file => {
    const fullPath = path.join(dirPath, file);
    try {
      convertFile(fullPath, undefined, game);
    } catch (error) {
      console.error(`Error converting ${file}:`, error);
    }
  });

  console.log(`\n✓ Batch conversion complete!`);
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage:
  ts-node scripts/json-to-markdown.ts <json-file> [output-file] [game]
  ts-node scripts/json-to-markdown.ts --batch <directory> [game]

Examples:
  # Convert single file
  ts-node scripts/json-to-markdown.ts article.json

  # Convert single file with custom output
  ts-node scripts/json-to-markdown.ts article.json output.md

  # Batch convert directory
  ts-node scripts/json-to-markdown.ts --batch ./public/api/pz/v1/build-41/modding/

  # Specify game (default: pz)
  ts-node scripts/json-to-markdown.ts article.json output.md vs
    `);
    process.exit(1);
  }

  if (args[0] === '--batch') {
    const dirPath = args[1];
    const game = args[2] || 'pz';

    if (!dirPath) {
      console.error('Error: Directory path required for batch conversion');
      process.exit(1);
    }

    if (!fs.existsSync(dirPath)) {
      console.error(`Error: Directory not found: ${dirPath}`);
      process.exit(1);
    }

    convertDirectory(dirPath, game);
  } else {
    const inputPath = args[0];
    const outputPath = args[1];
    const game = args[2] || 'pz';

    if (!fs.existsSync(inputPath)) {
      console.error(`Error: File not found: ${inputPath}`);
      process.exit(1);
    }

    convertFile(inputPath, outputPath, game);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { convertToMarkdown, convertFile, convertDirectory };
