---
id: build-42-loot-room-definitions-and-custom-distributions
slug: loot-room-definitions-and-custom-distributions
title: 'Loot: room definitions and custom distributions'
game: pz
version: build-42
section: mapping
category: zones-and-packaging
difficulty: intermediate
tags:
  - zones
  - objects-lua
  - spawn-points
  - loot-distribution
excerpt: >-
  BuildingEd exports each room's internal name into RoomDefs. TileZed's binary
  writer strips the RoomDef suffix and stores the room name. At runtime,
  ItemPickerJava looks up the room distribution...
last_updated: '2026-09-29'
related_articles:
  - what-mapping-can-and-cannot-control
  - objects-lua-the-zone-export
  - zombie-type-outfit-zones
  - vehicle-spawn-zones
  - farm-and-wildlife-animals
  - spawn-points
  - mannequins-as-fake-npcs
  - editor-lua-vs-gameplay-lua
---
# Loot: room definitions and custom distributions

> Source: 05-zones-and-spawns.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### How the engine resolves loot `[VERIFIED]`

BuildingEd exports each room's internal name into RoomDefs. TileZed's binary
writer strips the RoomDef suffix and stores the room name. At runtime,
`ItemPickerJava` looks up the **room distribution first**, then the **container
type**.

Procedural distributions can additionally be selected by:

| Selector | Trigger |
|---|---|
| `forceForTiles` | A mapped sprite is present on the container square |
| `forceForZones` | A WorldEd zone name or type covers it |
| `forceForRooms` | The building contains a matching RoomDef |
| `forceForItems` | A matching mapped sprite exists in the room |

Engine paths: `zombie/inventory/ItemPickerJava.java`,
`lua/server/Items/SuburbsDistributions.lua`,
`lua/server/Items/ProceduralDistributions.lua`.

**The map chooses context; the distribution creates inventory.**

### Custom distributions `[COMMUNITY -- BlackshotGER, with path correction]`

1. Create `.../media/lua/server/items/<YourMod>Distributions.lua` in your mod.
2. Structure:

```lua
local MyModNameDistributionsTable = {
    -- your rooms go here
}
table.insert(Distributions, MyModNameDistributionsTable);
```

**This appends to the end of `Distributions`.** `table.insert(t, v)` with two
arguments adds at the end; only the three-argument form
`table.insert(t, 1, v)` inserts at position 1. Appending is the correct thing to
do -- see the merge mechanism below.

3. Add rooms. **Prefix room names with your mod name** so you never collide with
   another mod or with a room vanilla adds later.

```lua
local ExampleDistributionsTable = {
  onlyseeds = {                 -- use this as the Internal Name in BuildingEd
    crate = {                   -- container: crate, shelves, counter,
                                -- metal_shelves, cardboardbox, ...
      procedural = true,
      procList = {
        -- CrateFarming is a vanilla ProceduralDistribution containing all seeds.
        -- It is the only entry here, so only seeds spawn.
        {name="CrateFarming", min=0, max=99},
      }
    },
  },
}
table.insert(Distributions, ExampleDistributionsTable);
```

Room-settings reference: https://pzwiki.net/wiki/Procedural_distributions

**Path note `[VERIFIED]`:** vanilla distribution files live under
`media/lua/server/Items/`, not `media/lua/server/`. The wiki's room lists are
outdated -- read `Distributions.lua` and `ProceduralDistributions.lua` from the
installed game.

---

### How the merge actually works `[VERIFIED -- read from the game]`

There was a community disagreement (June 2026) about whether a mod should insert
at position 1. The engine source settles it. From
`media/lua/server/Items/SuburbsDistributions.lua`:

```lua
local function mergeDistributions()
    SuburbsDistributions = Distributions[1] -- the games distribition table should always be the first in table.

    if #Distributions > 1 then
        for key,dist in pairs(Distributions) do
            if key > 1 then
                MergeDistributionRecursive(SuburbsDistributions, dist)
            end
        end
    end
    ...
end

Events.OnPreDistributionMerge.Add(preDistributionMerge)
Events.OnDistributionMerge.Add(mergeDistributions)
Events.OnPostDistributionMerge.Add(postDistributionMerge)
```

And vanilla `Distributions.lua` ends with:

```lua
table.insert(Distributions, 1, distributionTable);
--for mod compat:
SuburbsDistributions = distributionTable;
```

So:

- **`Distributions[1]` is the base.** Everything at index 2+ is merged *into* it.
  Vanilla explicitly claims slot 1 and the source comment says it "should always
  be the first in table."
- **Mods append.** `table.insert(Distributions, yourTable)` lands at the end and
  gets merged in. This is the correct form.

`MergeDistributionRecursive(_orig, _mod)` behaves like this:

| Case | Result |
|---|---|
| Key exists in `_mod` but not in `_orig` | **Added** |
| Key exists in both, `_mod` value is a table named `items` | `_mod`'s entries are **appended** to `_orig`'s array |
| Key exists in both, `_mod` value is any other table | **Recurses** into it |
| Key exists in both, `_mod` value is **not** a table | **Ignored -- nothing happens** |

That last row is the one nobody in the thread identified, and it is the practical
rule:

> **The merge is purely additive. It can never overwrite an existing scalar.**

You cannot change a vanilla `rolls = 1` to `rolls = 4`, or retune an existing
`min` / `max` / `weightChance`, by merging a table -- from *any* position.

### Which resolves the disagreement as follows

- **SimKDT was right that mods should not take slot 1**, and right that the
  cheapest approach is to touch `Distributions[1]` directly. The stated reason
  ("can cause issues") is understated: taking slot 1 makes *your* table the base
  that vanilla is merged into, inverts which table survives, and makes the
  outcome depend on mod load order if two mods both do it.
- **BlackshotGER's test was correct and his conclusion was correct** -- position
  genuinely made no difference to his result. But the reason is not that position
  is irrelevant; it is that **he was only adding**. Adding containers to the
  vanilla `bank` / `bankstorage` rooms works from any index, because the added
  keys do not exist in `_orig`. The difference would only have shown up if he had
  tried to *change* an existing scalar -- which fails everywhere.
- **The performance concern is real.** Each extra entry in `Distributions`
  triggers another full recursive walk of the whole tree. Vanilla
  `Distributions.lua` is ~630 KB and `ProceduralDistributions.lua` ~1 MB, so N
  mods means N full merge passes.

### Recommended patterns

**Adding new rooms (the normal case)** -- append, and prefix names with your mod:

```lua
local MyModDistributions = { mymod_vaultroom = { ... } }
table.insert(Distributions, MyModDistributions)
```

**Adding rooms with no extra merge pass** -- write straight into the base:

```lua
Events.OnPreDistributionMerge.Add(function()
    Distributions[1].mymod_vaultroom = { ... }
end)
```

**Actually modifying vanilla values** -- the merge cannot do this. Mutate the
table directly in a hook:

```lua
Events.OnPreDistributionMerge.Add(function()
    Distributions[1].bank.counter.procList[1].max = 4   -- before merge
end)

Events.OnPostDistributionMerge.Add(function()
    SuburbsDistributions.bank.counter.rolls = 4          -- after merge
end)
```

Three events exist and are fired from Java: `OnPreDistributionMerge`,
`OnDistributionMerge`, `OnPostDistributionMerge`. `[VERIFIED]`

**Procedural distributions are not merged at all.** `ProceduralDistributions.list`
is a plain global table -- add to it directly:

```lua
ProceduralDistributions.list.MyModCrate = { rolls = 1, items = { "Base.Nails", 10 } }
```

There is also a helper for surgical edits, `ReplaceItemInDistribution(...)`,
defined in the same file. `[VERIFIED]`

### Recommended loot workflow `[VERIFIED]`

1. Set the correct BuildingEd room internal name.
2. Use a tile whose object/container type matches the intended distribution.
3. Use `forceForTiles` / `forceForZones` / `forceForRooms` when a procedural
   distribution must be selected by map context.
4. Use runtime Lua only when a precise item instance must be guaranteed.
