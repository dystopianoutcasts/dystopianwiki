/**
 * Generate Content Manifest
 * Creates a manifest file with hashes of all content JSON files
 * Used for cache invalidation - when content changes, hashes change
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface ContentManifest {
  version: string;
  generatedAt: string;
  files: Record<string, string>;
}

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const DATA_DIR = path.join(PUBLIC_DIR, 'data');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'content-manifest.json');

/**
 * Generate MD5 hash of file contents
 */
function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir: string, basePath: string = ''): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findJsonFiles(fullPath, relativePath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Use forward slashes for consistency across platforms
      files.push(relativePath.replace(/\\/g, '/'));
    }
  }

  return files;
}

/**
 * Generate the content manifest
 */
function generateManifest(): void {
  console.log('Generating content manifest...');

  const jsonFiles = findJsonFiles(DATA_DIR);
  console.log(`Found ${jsonFiles.length} JSON files in data directory`);

  const files: Record<string, string> = {};

  for (const relativePath of jsonFiles) {
    const fullPath = path.join(DATA_DIR, relativePath);
    const hash = hashFile(fullPath);
    // Store with 'data/' prefix to match fetch URLs
    files[`data/${relativePath}`] = hash;
  }

  const manifest: ContentManifest = {
    version: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    files,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written to: ${OUTPUT_FILE}`);
  console.log(`Manifest version: ${manifest.version}`);
  console.log(`Total files: ${Object.keys(files).length}`);
}

// Run the script
generateManifest();
