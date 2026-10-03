/**
 * Test fixture for lib/leaderboard.ts (T66): an answer of aurora.leaderboard shaped exactly
 * as T65's contract (tasks/T65-leaderboard-backend-036.md). Used by the tests only.
 */
export const CONTRACT = {
  source: 'mod',
  world_seq: 1,
  seen_at: '2026-10-03T12:00:00Z',
  kills: [
    { rank: 1, username: 'Pootard', display_name: 'Pete Tard', live: 181, total: 181, alive: true, online: true },
    { rank: 2, username: 'rax', display_name: 'fisher man', live: 3, total: 214, alive: true, online: false },
    { rank: 2, username: 'skye', display_name: null, live: 0, total: 214, alive: false, online: false },
    { rank: 4, username: 'hok', display_name: 'Hokalt', live: 12, total: 12, alive: true, online: false },
  ],
  deaths: [
    { rank: 1, username: 'skye', display_name: null, deaths: 4, alive: false, online: false },
    { rank: 2, username: 'rax', display_name: 'fisher man', deaths: 1, alive: true, online: false },
  ],
  survival: [
    { rank: 1, username: 'Pootard', display_name: 'Pete Tard', hours: 176.3, alive: true, online: true },
    { rank: 2, username: 'hok', display_name: 'Hokalt', hours: 23.6, alive: true, online: false },
    { rank: 3, username: 'rax', display_name: 'fisher man', hours: 5.4, alive: true, online: false },
  ],
}

/**
 * T70: a mod-source answer after 037 (T69's contract), shaped like the owner's screenshot of
 * the in-game window: 21 players, every one in every list, zeros included (Payo has no kills),
 * ranks are row positions 1..n, ties ordered by username (Ann and Bo both 40). Crusty died and
 * has banked kills but 0 on the current life; Crusty's Survival is 0 hours (alive false).
 */
const NAMES = [
  'Crusty', 'Pootard', 'rax', 'Ann', 'Bo', 'hok', 'skye', 'Mira', 'Tomas', 'Wren', 'Juno',
  'Kale', 'Lio', 'Nell', 'Oren', 'Pia', 'Quin', 'Rue', 'Sol', 'Teo', 'Payo',
] as const
const TOTALS = [76, 70, 55, 40, 40, 33, 30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 6, 4, 3, 1, 0]
const LIVES = [0, 70, 9, 40, 12, 33, 30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 6, 4, 3, 1, 0]

export const BOARD_21 = {
  source: 'mod',
  world_seq: 1,
  seen_at: '2026-10-03T12:00:00Z',
  kills: NAMES.map((username, i) => ({
    rank: i + 1, username, display_name: null, live: LIVES[i], total: TOTALS[i], alive: username !== 'Crusty', online: false,
  })),
  // Crusty's 3 deaths, then everyone with 0, by username.
  deaths: ['Crusty', ...NAMES.slice(1).sort()].map((username, i) => ({
    rank: i + 1, username, display_name: null, deaths: username === 'Crusty' ? 3 : 0, alive: username !== 'Crusty', online: false,
  })),
  survival: [...NAMES.slice(1), 'Crusty'].map((username, i) => ({
    rank: i + 1, username, display_name: null, hours: username === 'Crusty' ? 0 : 200 - i * 5, alive: username !== 'Crusty', online: false,
  })),
}
