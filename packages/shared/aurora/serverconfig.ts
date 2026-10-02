// Pure parsers for the dedicated server's own configuration files, read over the
// same SFTP session as players.db (supabase/functions/aurora-ingest). No I/O here.
//
//   server-data/Server/<name>.ini              key=value, one per line
//   server-data/Server/<name>_SandboxVars.lua  a Lua table: SandboxVars = { ... }
//
// The .ini holds secrets (Password, RCONPassword, DiscordToken, ...). Only the
// keys in INI_KEYS are ever returned, and Password only as a yes/no
// (`HasPassword`). A key not on the list is dropped here, so it never reaches the
// database at all. The sandbox file holds game settings only; it is flattened
// whole ("ZombieLore.Speed"), and each value keeps the label the file's own
// comments give it ("-- 4 = Random"), so the site never hard-codes what 4 means.
//
// Tests: serverconfig.test.ts.

export type IniValue = string | number | boolean | string[];

/**
 * The .ini keys that are kept. Everything else is dropped, secrets included.
 * Lists (Mods, WorkshopItems, Map) are split on ";". DefaultPort, UDPPort and
 * server_browser_announced_ip are kept for the admin-only table; whether they
 * are shown publicly is decided in SQL (migration 027), not here.
 */
export const INI_KEYS = [
  'PublicName',
  'PublicDescription',
  'ServerWelcomeMessage',
  'MaxPlayers',
  'PVP',
  'Open',
  'Public',
  'PauseEmpty',
  'Mods',
  'WorkshopItems',
  'Map',
  'SafetySystem',
  'PlayerSafehouse',
  'SafehouseDaySurvivedToClaim',
  'Faction',
  'SleepAllowed',
  'SleepNeeded',
  'AnnounceDeath',
  'DropOffWhiteListAfterDeath',
  'MaxAccountsPerUser',
  'VoiceEnable',
  'War',
  'DefaultPort',
  'UDPPort',
  'server_browser_announced_ip',
] as const;

const LIST_KEYS = new Set(['Mods', 'WorkshopItems', 'Map']);
const KEEP = new Set<string>(INI_KEYS);

function scalar(raw: string): string | number | boolean {
  const v = raw.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

/** The kept .ini settings, plus HasPassword. Unknown and secret keys are dropped. */
export function parseServerIni(text: string): Record<string, IniValue> {
  const out: Record<string, IniValue> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#') || line.startsWith(';')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1);
    if (key === 'Password') {
      out.HasPassword = value.trim() !== '';
      continue;
    }
    if (!KEEP.has(key)) continue;
    if (LIST_KEYS.has(key)) {
      // B42 writes mod ids with a leading backslash ("\OutcastLib"); the id is what follows.
      out[key] = value
        .split(';')
        .map((s) => s.trim().replace(/^\\+/, ''))
        .filter((s) => s !== '');
    } else {
      out[key] = scalar(value);
    }
  }
  return out;
}

export interface SandboxValue {
  v: string | number | boolean;
  /** The label the file's comments give this value, when it lists one. */
  label?: string;
}

/**
 * SandboxVars flattened to "Section.Key" -> value, with labels from the comments.
 * Only scalar assignments are read; nested tables become a name prefix. A file
 * that is not a SandboxVars table yields {}.
 */
export function parseSandboxVars(text: string): Record<string, SandboxValue> {
  const out: Record<string, SandboxValue> = {};
  const lines = text.split(/\r?\n/);
  if (!lines.some((l) => /^\s*SandboxVars\s*=\s*\{/.test(l))) return out;

  const path: string[] = [];
  let inRoot = false;
  let labels = new Map<string, string>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!inRoot) {
      if (/^SandboxVars\s*=\s*\{/.test(line)) inRoot = true;
      continue;
    }
    if (line.startsWith('--')) {
      const m = /^--\s*(-?\d+)\s*=\s*(.+?)\s*$/.exec(line);
      if (m) labels.set(m[1], m[2]);
      continue;
    }
    const open = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\{\s*$/.exec(line);
    if (open) {
      path.push(open[1]);
      labels = new Map();
      continue;
    }
    if (/^\}\s*,?\s*$/.test(line)) {
      if (path.length === 0) break; // the end of SandboxVars itself
      path.pop();
      labels = new Map();
      continue;
    }
    const assign = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*,?\s*$/.exec(line);
    if (assign) {
      const [, key, rawValue] = assign;
      let v: string | number | boolean;
      const str = /^"(.*)"$/.exec(rawValue);
      if (str) v = str[1];
      else if (rawValue === 'true' || rawValue === 'false') v = rawValue === 'true';
      else if (/^-?\d+(\.\d+)?$/.test(rawValue)) v = Number(rawValue);
      else {
        labels = new Map();
        continue; // not a scalar this parser understands
      }
      const entry: SandboxValue = { v };
      const label = typeof v === 'number' ? labels.get(String(v)) : undefined;
      if (label !== undefined) entry.label = label;
      out[[...path, key].join('.')] = entry;
    }
    labels = new Map();
  }
  return out;
}
