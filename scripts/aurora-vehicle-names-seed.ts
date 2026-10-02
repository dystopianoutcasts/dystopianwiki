#!/usr/bin/env tsx
/**
 * Generate the vanilla vehicle display names that migration 031 seeds into
 * aurora.vehicle_names, from the game's own files.
 *
 *   npx tsx scripts/aurora-vehicle-names-seed.ts            print the seed SQL
 *   npx tsx scripts/aurora-vehicle-names-seed.ts --write    splice it into the migration
 *   npx tsx scripts/aurora-vehicle-names-seed.ts --check    exit 1 if the migration is stale
 *   --game <dir>   the Project Zomboid install (default: the Steam path on the dev machine)
 *
 * The rule is vanilla's (media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua,
 * getVehicleDisplayName), and the exporter's OA_VehicleNames.lua repeats it:
 *
 *   key  = "IGUI_VehicleName" .. (script:getCarModelName() or script:getName())
 *   name = EN translation of key
 *   a script whose name contains "Burnt" tries the key with "Burnt" removed first,
 *   then wraps the result in IGUI_VehicleNameBurntCar ("Burnt %1").
 *
 * A script whose key has no English translation gets NO row (vanilla would show
 * the key itself). The script name is the FULL name, "<module>.<name>", which is
 * what the exporter's veh records send as `s`.
 *
 * Inputs: media/scripts/**\/*.txt (vehicle blocks) and
 * media/lua/shared/Translate/EN/IG_UI.json. Mod cars are not covered here: the
 * exporter sends those at runtime and overwrites these rows.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const DEFAULT_GAME = 'R:/Games/Steam/steamapps/common/ProjectZomboid';
const MIGRATION = 'supabase/migrations/031_aurora_vehicle_names.sql';
const BEGIN = '-- BEGIN GENERATED SEED (scripts/aurora-vehicle-names-seed.ts)';
const END = '-- END GENERATED SEED';

export interface VehicleScript {
  module: string;
  name: string;
  carModelName: string | null;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (entry.toLowerCase().endsWith('.txt')) out.push(p);
  }
  return out;
}

/**
 * Vehicle blocks of one script file. Tracks brace depth: `module X {` opens depth 1,
 * `vehicle Y {` inside it opens depth 2, and `carModelName = Z,` counts only at depth 2
 * (a nested block never carries one). `template vehicle` is not a vehicle: the line does
 * not START with the word.
 */
export function parseVehicleScripts(text: string): VehicleScript[] {
  const out: VehicleScript[] = [];
  let module = '';
  let depth = 0;
  let current: VehicleScript | null = null;
  let pendingOpen: 'module' | 'vehicle' | null = null;
  let pendingName = '';

  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const raw of stripped.split(/\r?\n/)) {
    const line = raw.replace(/\/\/.*$/, '').trim();
    if (line === '') continue;

    const mod = /^module\s+(\S+)/.exec(line);
    const veh = /^vehicle\s+(\S+)/.exec(line);
    if (depth === 0 && mod) {
      pendingOpen = 'module';
      pendingName = mod[1];
    } else if (depth === 1 && veh) {
      pendingOpen = 'vehicle';
      pendingName = veh[1];
    }

    if (depth === 2 && current) {
      const m = /^carModelName\s*=\s*([^,\s]+)/.exec(line);
      if (m) current.carModelName = m[1];
    }

    for (const ch of line) {
      if (ch === '{') {
        depth++;
        if (pendingOpen === 'module' && depth === 1) module = pendingName;
        if (pendingOpen === 'vehicle' && depth === 2) {
          current = { module, name: pendingName, carModelName: null };
        }
        pendingOpen = null;
      } else if (ch === '}') {
        if (depth === 2 && current) {
          out.push(current);
          current = null;
        }
        depth--;
        if (depth === 0) module = '';
      }
    }
  }
  return out;
}

/** vanilla's rule; null when the key has no English translation. */
export function displayName(script: VehicleScript, en: Record<string, string>): string | null {
  const has = (k: string): string | null => {
    const v = en[`IGUI_VehicleName${k}`];
    return typeof v === 'string' && v !== '' ? v : null;
  };
  let name = has(script.carModelName ?? script.name);
  if (script.name.includes('Burnt')) {
    const plain = has(script.name.replace(/Burnt/g, ''));
    if (plain !== null) name = plain;
    if (name === null) return null;
    const fmt = en.IGUI_VehicleNameBurntCar;
    return typeof fmt === 'string' && fmt.includes('%1') ? fmt.replace('%1', name) : `Burnt ${name}`;
  }
  return name;
}

export function buildSeed(game: string): { rows: [string, string][]; unnamed: string[] } {
  const en = JSON.parse(readFileSync(join(game, 'media/lua/shared/Translate/EN/IG_UI.json'), 'utf8')) as Record<string, string>;
  const scripts = walk(join(game, 'media/scripts')).flatMap((f) => parseVehicleScripts(readFileSync(f, 'utf8')));
  const byFull = new Map<string, string>();
  const unnamed: string[] = [];
  for (const s of scripts) {
    const full = `${s.module}.${s.name}`;
    const d = displayName(s, en);
    if (d === null) unnamed.push(full);
    else byFull.set(full, d);
  }
  return { rows: [...byFull.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)), unnamed: unnamed.sort() };
}

function q(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

export function seedSql(rows: [string, string][]): string {
  const values = rows.map(([s, d]) => `  (${q(s)}, ${q(d)})`).join(',\n');
  return [
    BEGIN,
    `-- ${rows.length} vanilla Build 42 vehicles. Re-generate, do not hand-edit.`,
    'INSERT INTO aurora.vehicle_names (script_name, display_name, updated_at)',
    "SELECT v.script_name, v.display_name, TIMESTAMPTZ '1970-01-01 00:00:00+00'",
    'FROM (VALUES',
    values,
    ') AS v (script_name, display_name)',
    'ON CONFLICT (script_name) DO NOTHING;',
    END,
  ].join('\n');
}

function main(): number {
  const argv = process.argv.slice(2);
  const gi = argv.indexOf('--game');
  const game = gi >= 0 ? argv[gi + 1] : DEFAULT_GAME;
  const { rows, unnamed } = buildSeed(game);
  const sql = seedSql(rows);

  if (argv.includes('--write') || argv.includes('--check')) {
    const current = readFileSync(MIGRATION, 'utf8');
    const a = current.indexOf(BEGIN);
    const b = current.indexOf(END);
    if (a < 0 || b < 0) {
      console.error(`${MIGRATION} has no seed markers`);
      return 2;
    }
    const next = current.slice(0, a) + sql + current.slice(b + END.length);
    if (argv.includes('--check')) {
      if (next !== current) {
        console.error('seed is STALE: run with --write');
        return 1;
      }
      console.log(`seed is current (${rows.length} rows)`);
      return 0;
    }
    writeFileSync(MIGRATION, next, 'utf8');
    console.log(`wrote ${rows.length} rows; ${unnamed.length} scripts have no English name`);
    if (unnamed.length > 0) console.log(`  no name: ${unnamed.join(', ')}`);
    return 0;
  }

  console.log(sql);
  console.error(`${rows.length} rows; ${unnamed.length} scripts have no English name: ${unnamed.join(', ')}`);
  return 0;
}

if (process.argv[1] && /aurora-vehicle-names-seed\.ts$/.test(process.argv[1].replace(/\\/g, '/'))) {
  process.exit(main());
}
