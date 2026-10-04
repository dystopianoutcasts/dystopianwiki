---
id: build-42-start-here
slug: start-here
title: 'Start here: what changed in Build 42'
game: pz
version: build-42
section: modding
category: getting-started
difficulty: beginner
tags:
  - getting-started
  - mod-compatibility
  - registries-lua
  - craftrecipe
  - build-42
excerpt: >-
  Build 42 is stable now. It is NOT save-compatible or mod-compatible with Build
  41:
last_updated: '2026-10-04'
---
# Start here: what changed in Build 42

> Source: 00_INDEX.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

## 0. Read this first

Build 42 is **stable now**. It is NOT save-compatible or mod-compatible with Build 41:

- **B41 saves do not load on B42.** Fresh world required.
- **Most B41 mods do not load on B42.** Steam will silently install a B41 mod onto a B42 game; it then fails only at world-load or connect time -- typically *"World loading could not proceed, there are script load errors."* This failure mode is routinely misdiagnosed because nothing complains at subscribe/enable time.
- Even 42.19 saves are incompatible with 42.20 (the stable cutover was a clean break).

This matters for creation because the target is fixed: author everything against B42 42.20 conventions (versioned mod layout, `craftRecipe`, `registries.lua`, server-authoritative MP). B41 habits silently fail. The B41->B42 differences are kept at the end as a reference for anyone who later ports.

### How this knowledge base is organized

Eight deep-dive docs plus TWO permanent local source caches. To BUILD a mod, start with doc 08 (the from-scratch cookbook); the numbered tracks are the deep reference behind each recipe:

| # | Doc | Covers | Enrichment status |
|---|-----|--------|-------------------|
| 01 | `01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md` | mod project structure, mod.info, registries.lua, load order, debug, packaging, MP status | pzwiki-enriched |
| 02 | `02_SCRIPTING_ITEMS_AND_CRAFTING.md` | item scripts, tags, the craftRecipe system, fluids | pzwiki-enriched (craftRecipe addendum) |
| 03 | `03_LUA_API_AND_ENGINE.md` | events, ModData, networking/commands, timed actions, Java bridge, typing | pzwiki-enriched |
| 04 | `04_FARMING_FORAGING_ANIMALS.md` | crops/agriculture, foraging, the new animal/husbandry system, AnimalDefinitions | written from cache |
| 05 | `05_SKILLS_TRAITS_PROGRESSION.md` | the B42 skill list, XP, traits, professions | pzwiki-enriched |
| 06 | `06_WORLD_MAP_BASEMENTS_TILES.md` | map expansion, multi-Z, basements, tiles/tiledefs, toolchain | pzwiki-enriched |
| 07 | `07_VEHICLES_POWER_COMBAT_MISC.md` | vehicles, electricity/generators, combat/animation, threading, misc | web-research + power addendum |
| 08 | `08_MOD_CREATION_TOOLKIT.md` | **from-scratch cookbook: how to build every mod type** (skeleton + fields + placement) | ScriptsDocs + pzwiki |

**Two permanent local source caches** (both offline -- look anything up without hitting the network again):
- `_raw_pzwiki_sources/` -- ~124 pzwiki modding pages as clean wikitext (per track) + full raw API JSON in `_json/`. The canonical HOW-TO / conceptual layer. Harvester: `scratchpad/pzwiki_harvest.py` (cache-first). Index: `_HARVEST_MANIFEST.txt`.
- `_raw_scriptsdocs/` -- 108 PZ-API-Docs ScriptsDocs pages as text. The authoritative FIELD-LEVEL script schema for every content type (`item`, `entity` + `component-*`, `vehicle`, `character_trait_definition`, `character_profession_definition`, `sound`, `fluid`, crafting blocks, etc.). Harvester: `scratchpad/scriptsdocs_harvest.py`. Index: `_SCRIPTSDOCS_MANIFEST.txt`. This is what you cite for exact parameter names.

### Confidence tags
Throughout these docs: **[CONFIRMED]** = backed by a canonical page (pzwiki revid, or ScriptsDocs schema); **[LIKELY]** = strong secondary/community sourcing; **[UNCERTAIN]** = single-source or inference, verify against a live install or vanilla scripts before relying on it.

---

## 1. What you can build (creation capability matrix)

Every common B42 mod type, with the primary schema/guide to author it. Full copy-pasteable skeletons live in **doc 08 (`08_MOD_CREATION_TOOLKIT.md`)**; the "deep reference" column is the field-level source.

| Mod type | Ready | Primary schema / guide (cached) | Deep reference |
|---|---|---|---|
| Project skeleton (mod.info, common/42, registries.lua) | GREEN | `_raw_scriptsdocs/module`, pzwiki Mod_structure/Registries | doc 01 |
| New item (normal) | GREEN | `_raw_scriptsdocs/item.txt` (ItemType) | doc 02 |
| New food | GREEN | `item.txt` (Food params) | doc 02 |
| New weapon | GREEN | `item.txt` (ItemType=Weapon fields) | doc 02 / 07 |
| New clothing / hair | GREEN | `Body_Location`, Creating_a_clothing/hair_mod | doc 02 |
| New craftRecipe | GREEN | `craftrecipe`/`inputs`/`outputs`/`itemmapper` | doc 02 (addendum) |
| Workstation / craft bench | GREEN | `entity` + `component-craftbench`/`-craftrecipe` | doc 02 |
| New fluid | GREEN | `fluid`/`fluids` + `component-fluidcontainer` | doc 02 |
| Item repair | GREEN | `fixing.txt` | doc 02 |
| Evolved / cooking recipe | GREEN | `evolvedrecipe.txt` | doc 02 |
| New trait | GREEN | `character_trait_definition` + registries | doc 05 |
| New profession | GREEN | `character_profession_definition` + registries | doc 05 |
| New skill / perk | YELLOW | doc 05 (perk mechanics; PerkFactory via vanilla scripts) | doc 05 |
| New animal / breed | GREEN | AnimalDefinitions | doc 04 |
| New crop | YELLOW | doc 04 (crop data format partial) | doc 04 |
| Lua gameplay (events/ModData/MP) | GREEN | pzwiki Lua/ModData/Networking | doc 03 |
| Custom UI / HUD (ISUI) | GREEN | `User_Interface`, `component-uiconfig` | doc 03 |
| Custom moodle | GREEN | `Moodle` + registries (MoodleType) | doc 05/01 |
| Sound mod | GREEN | `sound.txt`/`soundtimeline.txt`, Sound_scripts | doc 07 |
| Dynamic radio channel | GREEN | Creating_dynamic_radio_channels, `Radio` | doc 07 |
| Translations / localization | GREEN | `Translation`, `Language_txt` | doc 01 |
| Map / building / basement | GREEN | pzwiki Mapping/Creating_basements | doc 06 |
| Vehicle | GREEN | `vehicle.txt` + `wheel`/`part`/`passenger`/`physics` | doc 07 |

GREEN = you can author it now from the cached schema. YELLOW = authorable but one field/format detail should be verified against vanilla scripts first (see that doc's Gaps).

### The creation workflow (any mod)
1. **Scaffold** the versioned project: `common/` (assets) + `42/mod.info` + `media/` (scripts, lua, registries.lua). (doc 01)
2. **Register** any custom identifiers in `media/registries.lua` (traits, professions, moodles, item tags, ammo, etc.). (doc 01)
3. **Author the content** with the right script block -- copy the skeleton from doc 08, fill fields from the ScriptsDocs cache. (doc 08 + `_raw_scriptsdocs/`)
4. **Wire behavior** in Lua if needed (events/ModData; server-authoritative in MP). (doc 03)
5. **Translate** display names in the matching `*.txt`/JSON translation files. (doc 01)
6. **Test** with `-debug` + hot reloading; then package/upload via the in-game Workshop tool. (doc 01)

---

## 2. B41 -> B42 differences (reference only -- for porting, not creation)

Ordered roughly by how early it bites. Each item points to the track doc with the detail.

### A. Structure & manifest (doc 01) -- do this first, it is the #1 silent-break
1. **Convert to the versioned project layout.** B42 mods use `common/` (shared assets, mandatory even if you keep most content here) plus a `42/` folder containing the B42 `mod.info`. B41 fallback is the *old flat `media/` folder* alongside them -- there is **no `41/` build folder** (a common misconception; corrected in doc 01). The closest version folder overwrites `common/`; minor version is stripped (`42.1.5` resolves as `42.1`).
2. **mod.info fields are all-lowercase**: `id name description poster icon author require` (singular `author`, not `authors`). `versionMin`/`versionMax` control which game builds the manager shows the mod for.
3. **Add `media/registries.lua`** (new in 42.13). It registers custom identifiers and loads before ALL Lua and scripts. Registerable types (11): CharacterTrait, CharacterProfession, ItemTag, Brochure, Flier, ItemBodyLocation, ItemType, MoodleType, WeaponCategory, Newspaper, AmmoType. Any custom trait/profession/moodle/tag/ammo the Outcast mods add must be registered here. In scripts you then reference the string ID, not the Lua registry variable.
4. **workshop.txt** keys (confirmed): version/id/title/description/tags/visibility (exactly `public`, `friendsOnly`, `private` or `unlisted`; anything else, a number included, publishes the item public). Upload via the in-game Workshop "Create and update items" flow (or SteamCMD). preview.png must be a square PNG, 256x256 or 512x512, at most 1000 KB (the uploader checks this; its error text wrongly says only 256x256).

> **Proof:** Code. `zombie.core.znet.SteamWorkshopItem#validatePreviewImage` (square, width 256 or 512, at most 1,024,000 bytes, readable PNG). Build 42.20 (revision a2947723ca).

> **Proof:** Code. `zombie.core.znet.SteamWorkshopItem#readWorkshopTxt` and `#getVisibilityInteger` (only `friendsOnly`, `private` and `unlisted` map to a non-public value; anything else maps to 0, public), sent by `zombie.core.znet.SteamWorkshop#SubmitWorkshopItem`. Build 42.20 (revision a2947723ca).

### B. Crafting -- the biggest scripting break (doc 02)
5. **Rewrite every `recipe` block as a `craftRecipe` block.** Legacy B41 `recipe` scripts silently fail. craftRecipe lives inside `module { }` (item recipes) or `entity { }` (build recipes), with `inputs`/`outputs`/`itemMapper` children. Full confirmed schema is in doc 02's craftRecipe addendum (inputs item-line syntax, tags, skill/learning params, timing, fluids).
6. **A crafting-bench tag is MANDATORY** on each recipe (`AnySurfaceCraft`, `InHandCraft`, `Forge`, `Furnace`, `Grindstone`, etc.) or the recipe is not recognized. This is the single most common new-recipe failure.
7. **Runtime editing of vanilla recipes is largely gone.** B42 offers only limited tricks (`craftRecipe:Load()` for scalar overrides, `getModTags()`/`setTags()` from 42.18, additive itemMapper override); adding inputs via reflection no longer works outside debug mode. Any Outcast mod that mutated vanilla recipes at runtime must be redesigned as script-level soft-overrides. New recipes are easy; mutating vanilla ones is the pain point.
8. Recipe translations move to `Recipes.json`, keyed by the bare RecipeID (no module prefix).

### C. Lua / engine (doc 03)
9. **Multiplayer went server-authoritative.** Inventory and ALL timed actions moved server-side (42.13.1); clients are visual-only. Any B41 client-trusted inventory/timed-action logic will desync or be rejected.
10. **Timed actions must be stored globally** (`_G[Action.Type] = Action`) to work in MP (42.13 requirement).
11. **`sendClientCommand` is 3-arg** `(module, command, args)` -- the sender IsoPlayer is auto-passed to `OnClientCommand`, not sent. (The old 4-arg form in some B41 code is wrong for the canonical API.)
12. **ModData does not auto-sync.** Use `ModData.getOrCreate(key)`, and `ModData.transmit("key")` + `OnReceiveGlobalModData` to sync (small payloads only). The "it syncs when the item syncs" assumption is false.
13. Typing/tooling: EmmyLua (Tangzx) + Umbrella + LuaCATS with an `.emmyrc.json`; official JavaDocs are 41.77 only -- use the unofficial B42 JavaDocs for engine signatures.

### D. Skills / traits / professions (doc 05)
14. **Skill internal names changed.** Metalworking split into `MetalWelding`->Welding and `Blacksmith`->Blacksmithing; new/renamed: `FlintKnapping`->Knapping, `Farming`->Agriculture, `Husbandry`->Animal Care, plus Carving, Masonry, Pottery, Glassmaking, Butchering, Tracking, `Electricity`->Electrical. Any `xpAward`/`SkillRequired` in Outcast recipes and any `getPerkLevel` calls must use the new internal names. Full internal->display table in doc 05.
15. **Trait modding is now script-based**, not the B41 `TraitFactory`. Use `registries.lua` + `CharacterTrait.register("mymod:trait")` + a `character_trait_definition` script (fields: CharacterTrait, UIName, Cost, UIDescription, IsProfessionTrait, DisabledInMultiplayer, GrantedRecipes, GrantedTraits, XPBoosts as Skill=level, MutuallyExclusiveTraits), `UI_trait_` translations, and 18x18 icons at `media/ui/Traits/`.
16. **Professions**: pzwiki has no profession-*modding* page. The route is almost certainly a `character_profession_definition` script mirroring the trait pattern (+ registries CharacterProfession) -- treat as [UNCERTAIN], verify against vanilla scripts. Note the gameplay rename: "Unemployed" is now "Custom" occupation in B42.

### E. World / map / tiles (doc 06) -- only if the Outcast mods ship map content
17. **Cell size is 256x256** shipped (B41 was 300x300), but you still author on a 300x300 grid and the tools export to 256 (empty border tiles). Spawnpoint math still uses `worldX*300+posX`.
18. **Tiledef numbering** for mods: 0-99 reserved for devs, 100-16382 for modders, but keep numbers <=8190 (above that yields negative sprite IDs). Numbers are per-mod-unique, declared in mod.info; duplicates throw a load error and break the mods. Community registry is the conflict-avoidance mechanism.
19. **Mapping tools are unofficial-but-working** (Crater's Community Edition fork of the official tools is the current option; Alree/Unjammer forks also exist). Official TileZed/WorldZed/AnimZed release is deferred until after 42.20 hotfixes.

### F. Vehicles / power / combat (doc 07)
20. **Electricity = generator "power bubble"**, not a wired circuit graph. Connect a generator once to power an area; no vanilla circuit-graph API. Custom power mods hook the generator/appliance model. (See doc 07 power addendum.)
21. **Vehicles are content-moddable but physics-capped** -- the Lua API can't inject forces onto physics bodies, so behavior overhauls need Java/Mixin. Vehicle *script* format specifics are thin on the wiki; verify against vanilla scripts.
22. **Weapons gained new script fields** (separate Handle/Head condition, blade Sharpness; heads can fall off) and firearms were fully overhauled with a new precise-location aiming system. Exact weapon script field names are a [gap] -- read them from vanilla scripts.

---

## 3. What actually changed in B42 (executive summary)

- **Crafting overhaul**: `recipe` -> `craftRecipe`, tags, itemMappers, fluids, workstation/entity benches, learn-by-doing vs magazines.
- **Animals & husbandry**: a persistent, genetic living-animal system driven by the global `AnimalDefinitions` table (animals/stages/breeds/genome); ranch zones; procedural distributions.
- **Skills expansion**: Metalworking split; many new crafting/survival skills; new internal names.
- **Map & verticality**: bigger Knox County, first-class multi-Z, semi-procedural basements (authored pool injected under eligible buildings at stream-in), new lighting (windowless interiors are truly dark), 256x256 cells.
- **Server-authoritative MP**: inventory + timed actions server-side, anti-cheat, new `Mods=` server-config format.
- **Engine**: multithreading (rendering + server logic offload), fluid system, new identifier layer (`registries.lua`), the `media/registries.lua` load stage.

---

## 4. Per-track headline facts (quick reference)

- **01 Foundations**: versioned `common/`+`42/` layout; no `41/` folder; registries.lua (11 types); all-lowercase mod.info; MP stable in 42.20 but server-authoritative.
- **02 Crafting**: craftRecipe schema fully confirmed (see doc 02 addendum); bench tag mandatory; runtime vanilla-recipe editing largely gone.
- **03 Lua/Engine**: 3-arg sendClientCommand; ModData.getOrCreate + transmit (no auto-sync); timed actions global + server-side.
- **04 Farming/Animals**: AnimalDefinitions global table with animals[stage]/stages/breeds[forcedGenes]/genome; 3 farming skills (Agriculture/Animal Care/Butchering); 54-crop table; foraging tiers.
- **05 Skills/Traits**: definitive internal->display skill map; script-based trait/profession modding via registries.
- **06 World/Map**: 256 shipped / 300 authoring; tiledef ranges (<=8190 safe); Crater's Community Edition tools; multi-Z + basement injection.
- **07 Vehicles/Power/Combat**: generator power-bubble; vehicle physics cap (Java for overhauls); new weapon condition/sharpness + aiming; multithreading.

---

## 5. Using the local caches (offline lookups)

- Readable wikitext: `_raw_pzwiki_sources/<track>/<Page>.wiki.txt` (each has the source URL + revid in its header).
- Full raw API JSON: `_raw_pzwiki_sources/_json/<Page>.json`.
- Index of everything harvested: `_raw_pzwiki_sources/_HARVEST_MANIFEST.txt`.
- To add more wiki pages later: edit the `PAGES` dict in `scratchpad/pzwiki_harvest.py` and re-run -- it skips everything already cached and fetches only the new titles, at a slow browser-like pace.
- **Field-level script schema:** `_raw_scriptsdocs/<block>.txt` (e.g. `item.txt`, `vehicle.txt`, `character_profession_definition.txt`, `component__component-craftrecipe.txt`). Index: `_raw_scriptsdocs/_SCRIPTSDOCS_MANIFEST.txt`. Re-harvest/extend with `scratchpad/scriptsdocs_harvest.py` (self-enumerates from the ScriptsDocs index, cache-first). This is the authoritative source for exact parameter names when authoring a block.
- The `wink-/pzmcp` GitHub mirror of B42 vanilla `media/scripts` is the complement for real-world worked examples of any block.

---

## 6. Master gaps to verify against a live 42.20 install / vanilla scripts

Adding the ScriptsDocs cache CLOSED several gaps that were open in the earlier porting-framed pass: weapon fields (now in `item.txt`), vehicle schema (`vehicle.txt` + `wheel`/`part`/`passenger`/`physics`), profession schema (`character_profession_definition.txt` -- now CONFIRMED, no longer inferred), and workstation/craft-bench blocks (`entity` + `component-*`). What remains to verify against a live 42.20 install / vanilla scripts:

- Exact `Mods=` server-config backslash syntax (lives on the *Testing mods in multiplayer* page; cache has it now -- reconcile).
- Some ScriptsDocs parameters are auto-stub ("No description provided" / Type Unknown) -- e.g. many `entity` params; confirm meaning from vanilla `scripts` worked examples.
- Foraging/biome zone Lua schema (only ParkingStall zone type confirmed).
- Numeric drift from cached ~42.18/19 pages to stable 42.20 (XP tables, generator stats, crop values).
- The ~110 undocumented AnimalDefinitions parameter meanings; crop-definition script/data format.
- Colored-light / advanced tile-property field names (verify `tile.txt` vs a live install).
- Custom Lua event registration (`LuaEventManager.AddEvent`/`triggerEvent`) -- wiki points to community libs.

---

## 7. Sources

Primary (canonical), cached locally:
- pzwiki.net modding pages (~124), page-version ~42.19, via MediaWiki API (browser UA -> HTTP 200; a bot UA is what 403s). Full list: `_HARVEST_MANIFEST.txt`.
- PZ-API-Docs ScriptsDocs (108 script-block schema pages), the authoritative field reference. Full list: `_SCRIPTSDOCS_MANIFEST.txt`.

Official / secondary (per-track docs carry the full URL lists):
- projectzomboid.com B42 stable + 42.20 release blogs; theindiestone.com forums; Steam changelogs/SteamDB.
- wink-/pzmcp (B42 vanilla media/scripts mirror); demiurgeQuantified LuaDocs; supercraft.host; FWolfe; Konijima guides; hosting KBs (BisectHosting, etc.).

---

*Master index for building any B42 mod from scratch. Eight docs (01-08) + two permanent local caches (pzwiki how-to + ScriptsDocs field schemas). Last updated 2026-07-29.*

---

*Corrected 2026-10-04: the Workshop preview may be 256x256 or 512x512, square, up to 1000 KB; 256x256 is not the only size accepted.*

*Corrected 2026-10-04: `visibility` in `workshop.txt` takes the words public, friendsOnly, private or unlisted, not the numbers 0-3; a number publishes the item public.*
