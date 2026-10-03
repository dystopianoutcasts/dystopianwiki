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
