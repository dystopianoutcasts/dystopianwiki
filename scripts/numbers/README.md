# Build 42 numbers tables generator

Turns the Project Zomboid 42.22 vanilla scripts and loot Lua into player-facing lookup tables:
melee weapons, firearms, food, clothing and armor, containers, crafting recipes, where items spawn
(procedural lists only) and vehicles. Every row cites its script `file:line`. Standard library only.
Deterministic: the same input gives byte-identical output, with no timestamps.

## Regenerate

Run from the repository root (`/r/Dystopian_Wiki` in Git Bash):

```bash
python -I scripts/numbers/generate.py \
  --capture /r/DystopianOutcasts/GAME/PZ_Engine_Records/B42_3d39148846 \
  --out content/drafts/pz/build-42/gameplay/numbers-tables \
  --notes docs/planning/unit-notes/p4b-numbers.md

python -I scripts/numbers/check.py \
  --capture /r/DystopianOutcasts/GAME/PZ_Engine_Records/B42_3d39148846 \
  --out content/drafts/pz/build-42/gameplay/numbers-tables \
  --articles content/articles/pz/build-42 \
  --icons packages/web/src/components/icons/iconShapes.ts
```

`check.py` runs the generator twice to compare the output byte for byte (about 45 seconds). It
prints PASS or exits 1. It checks:
- every vanilla item, craftRecipe, vehicle and procedural loot entry is in exactly one row,
  counted independently from the raw files;
- every Java citation's line holds the field or key it is cited for;
- links, the size limits, frontmatter and excerpts.

Output goes to `content/drafts/`, which is gitignored and never synced. Publishing is the owner's call: move
the folder to `content/articles/pz/build-42/gameplay/numbers-tables`, run `npm run nav`, then sync.

## Files

- `generate.py`: builds the pages.
- `scriptparse.py`: reads script blocks, merging stacked blocks the way the engine does.
- `luaparse.py`: reads the Lua table literals of the loot files. It fails loudly on syntax it does
  not handle.
- `check.py`: the check above.

## Known limits

- **Loot files not read:** `Distributions.lua`, `SuburbsDistributions.lua`,
  `VehicleDistributions.lua` and `Distribution_BagsAndContainers.lua`. The pages say so.
- **Brake force:** vehicle scripts set `brakingForce`, but `VehicleScript` never reads it. The
  table shows the script value and marks it as ignored.
- **Meanings not verified:** hit chance, recoil, aiming time, sound radius, speed modifiers, water
  resistance, equip slot and the vehicle units. Each table's "How to read this table" lists them.
