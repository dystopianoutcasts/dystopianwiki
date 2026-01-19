/**
 * useGameContext Hook
 * Provides game context for URL generation and navigation
 */

import { useLocation } from 'react-router-dom';

export type GameId = 'pz' | 'vs' | null;

interface GameContext {
  gameId: GameId;
  gameName: string;
  basePath: string; // e.g., '/pz' or ''
  buildPath: (version: string, section?: string, category?: string, slug?: string) => string;
}

const GAME_NAMES: Record<string, string> = {
  pz: 'Project Zomboid',
  vs: 'Vintage Story',
};

/**
 * Determines the current game context from the URL
 */
export function useGameContext(): GameContext {
  const location = useLocation();

  // Check if URL starts with a game prefix
  const pathParts = location.pathname.split('/').filter(Boolean);
  const firstPart = pathParts[0];

  let gameId: GameId = null;

  if (firstPart === 'pz' || firstPart === 'vs') {
    gameId = firstPart as GameId;
  }

  const gameName = gameId ? GAME_NAMES[gameId] || gameId.toUpperCase() : '';
  const basePath = gameId ? `/${gameId}` : '';

  /**
   * Build a path with the current game prefix
   */
  const buildPath = (
    version: string,
    section?: string,
    category?: string,
    slug?: string
  ): string => {
    let path = basePath;

    if (version) path += `/${version}`;
    if (section) path += `/${section}`;
    if (category) path += `/${category}`;
    if (slug) path += `/${slug}`;

    return path || '/';
  };

  return {
    gameId,
    gameName,
    basePath,
    buildPath,
  };
}

/**
 * Get game ID from a path
 */
export function getGameIdFromPath(path: string): GameId {
  const pathParts = path.split('/').filter(Boolean);
  const firstPart = pathParts[0];

  if (firstPart === 'pz' || firstPart === 'vs') {
    return firstPart as GameId;
  }

  return null;
}
