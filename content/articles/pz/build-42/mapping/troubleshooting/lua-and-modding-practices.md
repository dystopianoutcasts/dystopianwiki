---
id: build-42-lua-and-modding-practices
slug: lua-and-modding-practices
title: Lua and modding practices for maps
game: pz
version: build-42
section: mapping
category: troubleshooting
difficulty: intermediate
tags:
  - lua-load-order
  - zedscript
  - distribution-practices
excerpt: >-
  Not mapping-specific, but every map mod ends up shipping Lua. These are the
  rules that cause silent breakage when ignored.
last_updated: '2026-10-04'
---
# Lua and modding practices for maps

> Source: 10-lua-and-modding-practices.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Not mapping-specific, but every map mod ends up shipping Lua. These are the rules
that cause silent breakage when ignored.

---

## Lua load order `[VERIFIED -- PZwiki Lua (API)]`

Lua files load at game launch, when exiting a save, and on manual reload in debug
mode from the main menu:

1. **Shared** -- vanilla files
2. **Shared** -- mod files
3. **Client** -- vanilla files
4. **Client** -- mod files

The `server` subfolder is loaded **only when launching a save**. Whenever Lua is
loaded or reloaded outside a save, server files are unloaded. Its order is:

1. **Server** -- vanilla files
2. **Server** -- mod files

| Folder | Singleplayer | MP client | MP server |
|---|---|---|---|
| `client` | loaded | loaded | not loaded |
| `server` | loaded | loaded (at world load) | loaded |
| `shared` | loaded | loaded | loaded |

The `server` folder loads on a multiplayer client too: the name sets *when* it
loads, not which side runs it. See [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

> **Proof:** Code. `zombie.gameStates.GameLoadingState` calls `LuaManager.LoadDirBase("server")` with no `GameClient.client` guard. Build 42.21.0 (revision 4a0e9546ec).

The practical consequence for mappers: **vanilla shared files always load before
your shared files**, so globals like `VehicleZoneDistribution` and
`Distributions` already exist by the time your code runs.

### File naming and clashes

Files with the same relative path as a vanilla file **overwrite it**. Put your
Lua inside a subfolder named after your mod:

```
media/lua/shared/MyMapMod/MyMapModVehicleZoneDefinition.lua
```

Avoid overwriting vanilla files. Override or hook specific functions instead.

---

## Do not guard things that always exist

`[VERIFIED reasoning -- PZwiki "Getting started with modding"; SimKDT]`

```lua
-- WRONG
if VehicleZoneDistribution then
    ...
end
```

The table is created by a vanilla shared file that loads first. If the check
could fail, your mod is already broken -- the guard just converts a loud failure
into a silent one.

The same antipattern with Java methods:

```lua
-- WRONG
if object.notAFunction then
    object:notAFunction()   -- never runs; the real bug is hidden
end
```

An instance of a Java class **always** has its class's methods. If the method
does not exist, the name is wrong -- and the `if` guarantees you never find out.

The wiki's rule: **do not check for things you should not need to check.** Let
your mod error. An error is a clear signal something is wrong; a silent no-op is
a bug you will hunt for months.

`pcall` wrapping is flagged the same way -- and in PZ it does not even suppress
red errors, so it is pure noise.

The wiki explicitly names both patterns as common **AI-generated** mistakes: a
model hallucinates a method, hits an error, and "fixes" it by adding an existence
check. It also notes the pattern predates AI and was common in Mod Options code.

### The legitimate version

```lua
-- fine, in the file that DEFINES the table
VehicleZoneDistribution = VehicleZoneDistribution or {};
```

That is a defining file establishing its table idempotently. A *consumer*
wrapping access in `if table then` is not the same thing.

---

## Debugging

Read `%UserProfile%\Zomboid\console.txt`. Prints and errors go there.

---

## Distribution-specific practices

See [05-zones-and-spawns.md](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview) for the verified merge
mechanics. Two additions from the wiki's *Procedural distributions* page
`[VERIFIED -- revised for 42.20.0]`:

**Chance values are neither weights nor percentages.** Each distribution has a
number of `rolls`; every item entry is rolled that many times against a random
chance derived from loot-spawn settings and zombie population. Pick values by
comparing against existing vanilla entries, not by reasoning about percentages.

**Adding items to a shared list bloats every container using it.** More entries
means a higher mean item count -- a known problem with large gun, music and
clothing packs. Better options than piling items in:

- one item with variants whose texture, name and data are set dynamically
- a dummy item intercepted in `OnFillContainer` and swapped for a random real one

Lowering your item's chance is a band-aid: if your item should spawn as often as
a comparable vanilla one, you have now made it rarer for no good reason.

Useful distribution tags: `ignoreZombieDensity`, `isShop`, `stashChance`,
`canBurn`, `isWorn`, `isTrash`, `isRotten`. `junk` sub-tables ignore zombie
density and carry a x1.4 chance multiplier.

---

## Scripts (zedscript) syntax traps `[VERIFIED -- PZwiki Scripts, 42.17.0]`

If your map mod ships `media/scripts/`:

- Files must end in `.txt`.
- Comments are `/* ... */` only. **`//` does not work.**
- Every key-value line needs a trailing comma -- **including the last one in a
  block**. A missing comma silently breaks parsing.
- A `module` block wraps everything, except sandbox-options scripts, which must
  **not** have one.
- Always reference with the module prefix (`MyModule.MyItem`). Unprefixed lookup
  order is current module -> imports -> `Base` -> everything else, and it is
  inconsistent across script types.
- Prefix your IDs with your mod name if you use `module Base`.
- Put scripts in a subfolder named after your mod.
- Many script types support **soft overrides**: redefining a block merges rather
  than replaces, so you can change one parameter without restating the rest.

VSCode extension for syntax highlighting and diagnostics: **ZedScripts**.
The wiki recommends VSCode or IntelliJ IDEA over Notepad++ for PZ modding.

---

*Corrected 2026-10-04: media/lua/server/ loads on a multiplayer client too, at world load; the folder sets when code loads, not which side runs it.*
