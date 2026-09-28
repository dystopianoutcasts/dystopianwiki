// Derive tiles.json from a rendered pyramid so it is never written by hand.
//
//   npx tsx scripts/tiles/make-tiles-json.ts <base_top dir> [--baseUrl <url>] [--out <file>]
//
// <base_top dir> is <render out>/html/map_data/base_top (holds layer0.dzi).
// The origin is (0, 0) because pzmap2dzi's B42 cell range starts at cell 0,0 and
// the image is one pixel per world square (top_view_square_size: 1).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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

const dzi = readFileSync(join(dir, 'layer0.dzi'), 'utf8');
const tileSize = Number(/TileSize="(\d+)"/.exec(dzi)?.[1]);
const format = /Format="(\w+)"/.exec(dzi)?.[1];
const width = Number(/Width="(\d+)"/.exec(dzi)?.[1]);
const height = Number(/Height="(\d+)"/.exec(dzi)?.[1]);
if (!tileSize || !format || !width || !height) throw new Error(`could not parse ${join(dir, 'layer0.dzi')}`);

const tiles = {
  tileSize,
  maxLevel: Math.ceil(Math.log2(Math.max(width, height))),
  originSquare: { x: 0, y: 0 },
  squaresPerPixelAtMax: 1,
  baseUrl: arg('--baseUrl') ?? null,
  layer: 0,
  format,
  tilePath: `{z}/{x}_{y}.${format}`,
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(tiles, null, 2) + '\n');
console.log(`wrote ${out}`);
console.log(JSON.stringify(tiles));
