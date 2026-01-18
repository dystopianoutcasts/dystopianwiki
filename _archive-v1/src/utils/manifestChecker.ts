/**
 * Manifest Checker
 * Compares server content manifest with cached content hashes
 * Invalidates stale cache entries when content has changed
 */

import { CacheManager, getCacheKey } from '../managers/CacheManager';

interface ContentManifest {
  version: string;
  generatedAt: string;
  files: Record<string, string>;
}

const MANIFEST_VERSION_KEY = 'wiki-manifest-version';
const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Convert a file path from manifest to cache key
 * e.g., "data/build-41/modding/fundamentals/what-is-a-mod.json" -> "article:build-41:modding:fundamentals:what-is-a-mod"
 */
function pathToCacheKey(filePath: string): string | null {
  // Remove "data/" prefix and ".json" suffix
  const match = filePath.match(/^data\/(.+)\.json$/);
  if (!match) return null;

  const parts = match[1].split('/');

  // Handle different file types based on path structure
  if (parts.length === 1) {
    // Root level files like versions.json, sections.json
    return getCacheKey(parts[0].replace('.json', ''));
  }

  if (parts.length === 2) {
    // Version-level files like build-41/version-info.json
    const [version, file] = parts;
    if (file === 'version-info') {
      return getCacheKey('version-info', version);
    }
  }

  if (parts.length === 3) {
    // Section-level files like build-41/modding/section-info.json or categories.json
    const [version, section, file] = parts;
    if (file === 'section-info') {
      return getCacheKey('section-info', version, section);
    }
    if (file === 'categories') {
      return getCacheKey('categories', version, section);
    }
  }

  if (parts.length === 4) {
    // Category-level files like build-41/modding/tools/index.json
    const [version, section, category, file] = parts;
    if (file === 'index') {
      return getCacheKey('articles-list', version, section, category);
    }
    // Individual article files
    return getCacheKey('article', version, section, category, file);
  }

  return null;
}

/**
 * Fetch the content manifest from the server
 * Uses cache-busting timestamp to ensure we always get the latest
 */
async function fetchManifest(): Promise<ContentManifest | null> {
  try {
    const response = await fetch(`${BASE_URL}content-manifest.json?t=${Date.now()}`);
    if (!response.ok) {
      console.warn('Failed to fetch content manifest:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn('Error fetching content manifest:', error);
    return null;
  }
}

/**
 * Get the stored manifest version from localStorage
 */
function getStoredManifestVersion(): string | null {
  try {
    return localStorage.getItem(MANIFEST_VERSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Store the manifest version in localStorage
 */
function setStoredManifestVersion(version: string): void {
  try {
    localStorage.setItem(MANIFEST_VERSION_KEY, version);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Store file hashes for later comparison
 */
const manifestHashes = new Map<string, string>();

/**
 * Get the hash for a specific URL from the loaded manifest
 */
export function getManifestHash(url: string): string | undefined {
  // Normalize URL to match manifest format
  const normalizedUrl = url.startsWith('/') ? url.slice(1) : url;
  return manifestHashes.get(normalizedUrl);
}

/**
 * Check for content updates and invalidate stale cache entries
 * Should be called on app load
 */
export async function checkForContentUpdates(): Promise<void> {
  const manifest = await fetchManifest();
  if (!manifest) {
    // If we can't fetch the manifest, continue with existing cache
    return;
  }

  // Store all file hashes for later use
  manifestHashes.clear();
  for (const [path, hash] of Object.entries(manifest.files)) {
    manifestHashes.set(path, hash);
  }

  const storedVersion = getStoredManifestVersion();

  // Fast path: if manifest version matches, no content has changed
  if (storedVersion === manifest.version) {
    return;
  }

  // Manifest version changed - check for stale entries
  const staleKeys: string[] = [];

  for (const [filePath, newHash] of Object.entries(manifest.files)) {
    const cacheKey = pathToCacheKey(filePath);
    if (!cacheKey) continue;

    const storedHash = await CacheManager.getContentHash(cacheKey);

    // If we have a stored hash and it differs from the new hash, the content changed
    if (storedHash && storedHash !== newHash) {
      staleKeys.push(cacheKey);
    }
  }

  // Invalidate stale entries
  if (staleKeys.length > 0) {
    console.log(`Invalidating ${staleKeys.length} stale cache entries`);
    await CacheManager.invalidateByKeys(staleKeys);
  }

  // Update stored manifest version
  setStoredManifestVersion(manifest.version);
}
