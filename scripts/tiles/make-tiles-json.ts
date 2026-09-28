// Derive tiles.json from a rendered pyramid so it is never written by hand.
//
//   npx tsx scripts/tiles/make-tiles-json.ts <base_top dir> [--baseUrl <url>] [--out <file>]
//
// <base_top dir> is <render out>/html/map_data/base_top (holds layer0.dzi,
// map_info.json and sources.json). Run twice on the same render: the second
// run must produce a byte-identical file, so every field below is derived
// from render artifacts, never from wall-clock "now" or hand-editing.
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const dir = process.argv[2];
if (!dir || dir.startsWith('--')) {
  console.error('usage: make-tiles-json.ts <base_top dir> [--baseUrl <url>] [--out <file>]');
  process.exit(1);
}
const out = resolve(arg('--out') ?? 'packages/aurora/public/tiles.json');

// --- layer0.dzi: pixel dimensions and tile format -------------------------
const dzi = readFileSync(join(dir, 'layer0.dzi'), 'utf8');
const tileSize = Number(/TileSize="(\d+)"/.exec(dzi)?.[1]);
const format = /Format="(\w+)"/.exec(dzi)?.[1];
const width = Number(/Width="(\d+)"/.exec(dzi)?.[1]);
const height = Number(/Height="(\d+)"/.exec(dzi)?.[1]);
if (!tileSize || !format || !width || !height) throw new Error(`could not parse ${join(dir, 'layer0.dzi')}`);
const maxLevel = Math.ceil(Math.log2(Math.max(width, height)));

// --- map_info.json: world geometry -----------------------------------------
interface MapInfo {
  w: number; h: number; cell_size: number; pz_version: string;
  pzmap2dzi_version: string; git_commit: string;
  cell_rects: [number, number, number, number][];
  x0: number; y0: number; sqr: number;
  minlayer: number; maxlayer: number;
}
const mapInfo: MapInfo = JSON.parse(readFileSync(join(dir, 'map_info.json'), 'utf8'));
const cellsWide = mapInfo.w / mapInfo.cell_size;
const cellsHigh = mapInfo.h / mapInfo.cell_size;

// --- sources.json: per-cell provenance --------------------------------------
// [[cellX, cellY], [mtime, modSourceNames[]]] per populated cell, plus one
// trailing ["__metadata__", {...}] entry that is not a cell.
type SourcesEntry = [[number, number] | '__metadata__', [number, string[]] | Record<string, unknown>];
const sourcesRaw: SourcesEntry[] = JSON.parse(readFileSync(join(dir, 'sources.json'), 'utf8'));
const cellEntries = sourcesRaw.filter((e): e is [[number, number], [number, string[]]] => e[0] !== '__metadata__');
const populatedCells = cellEntries.length;
// This is the reliable signal for map-mod content: unlike the out/texture/
// folder list (populated for every declared mod regardless of whether its
// cells were rendered, because use_depend_texture_only=false), each cell's
// own mod-source list only names a mod when that cell actually drew from it.
const renderedWithMapMods = cellEntries.some(([, [, mods]]) => mods.length > 0);
const sparse = populatedCells < cellsWide * cellsHigh;

// --- populated floor layers: base_top/layer<N>_files with >=1 tile file ----
function hasAnyFile(path: string): boolean {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isFile()) return true;
    if (entry.isDirectory() && hasAnyFile(full)) return true;
  }
  return false;
}
const layerDirPattern = /^layer(-?\d+)_files$/;
const populatedLayers = readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && layerDirPattern.test(e.name))
  .filter((e) => hasAnyFile(join(dir, e.name))).length;

// --- render timing: optional render-start.txt / render-end.txt, written by
// render.ps1 at the render root (four levels above <base_top dir>: base_top
// -> map_data -> html -> <Out> -> render root). Older renders may not have
// them; the fields are then omitted rather than guessed.
const renderRoot = resolve(dir, '..', '..', '..', '..');
const startFile = join(renderRoot, 'render-start.txt');
const endFile = join(renderRoot, 'render-end.txt');
let renderedAt: string | null = null;
let renderSeconds: number | null = null;
if (existsSync(startFile) && existsSync(endFile)) {
  const startEpoch = Number(readFileSync(startFile, 'utf8').trim());
  const endEpoch = Number(readFileSync(endFile, 'utf8').trim());
  if (Number.isFinite(startEpoch) && Number.isFinite(endEpoch)) {
    renderSeconds = endEpoch - startEpoch;
    renderedAt = new Date(endEpoch * 1000).toISOString().slice(0, 10);
  }
}

const mapModsNote = renderedWithMapMods
  ? `Rendered WITH map mods: sources.json names a mod source for at least one of the ${populatedCells} populated cells.`
  : `Vanilla ${mapInfo.pz_version} only: sources.json names no mod source for any of the ${populatedCells} populated cells. Mod texture folders under out/texture/ can appear anyway as a side effect of use_depend_texture_only=false and do NOT mean those maps were rendered - sources.json's per-cell provenance is the reliable signal, not the texture folder listing.`;

const tiles = {
  _comment: 'Generated by scripts/tiles/make-tiles-json.ts from map_info.json and sources.json. Do not hand-edit.',
  coordinateSpace: 'b42-square',
  tileSize,
  maxLevel,
  format,
  cellSize: mapInfo.cell_size,
  originSquare: { x: mapInfo.x0, y: mapInfo.y0 },
  squaresPerPixelAtMax: mapInfo.sqr,
  world: {
    pixels: { w: mapInfo.w, h: mapInfo.h },
    cells: { w: cellsWide, h: cellsHigh },
    squares: { w: mapInfo.w / mapInfo.sqr, h: mapInfo.h / mapInfo.sqr },
  },
  cellRects: mapInfo.cell_rects,
  layers: { min: mapInfo.minlayer, max: mapInfo.maxlayer, ground: 0, populated: populatedLayers },
  baseUrl: arg('--baseUrl') ?? '',
  tileUrlTemplate: '{baseUrl}/base_top/layer{layer}_files/{z}/{x}_{y}.webp',
  sparse,
  renderedWithMapMods,
  source: {
    tool: 'pzmap2dzi',
    version: mapInfo.pzmap2dzi_version,
    commit: mapInfo.git_commit,
    renderedAt,
    renderSeconds,
  },
  _mapModsNote: mapModsNote,
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(tiles, null, 2) + '\n');
console.log(`wrote ${out}`);
console.log(JSON.stringify(tiles));
