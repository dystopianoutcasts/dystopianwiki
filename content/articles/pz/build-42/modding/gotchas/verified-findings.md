---
id: build-42-verified-findings
slug: verified-findings
title: Verified engine findings
game: pz
version: build-42
section: modding
category: gotchas
difficulty: advanced
tags:
  - engine
  - decompile
  - findings
  - running-log
excerpt: >-
  Running log of verified Build 42 engine findings with evidence and confidence, read at 42.22: the entity system, Java modding, model and animation pipelines, bare-handed damage and AnimSet nodes.
last_updated: '2026-11-21'
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21. Shipped file counts come from the capture's list of files measured on the live install 2026-11-09; Blender results are dated 42.20 tool behavior.

Running log of verified findings. Each entry states its evidence and its confidence level. **Preliminary findings are labeled as such** -- do not cite them as settled.

All sixteen findings were reread against the 42.22 decompile, and each line they cite was opened. The confidence tags are the original author's, changed only where a reread changed the answer. F-013, F-014, F-015 and F-016 are short here because longer engine pages cover them; they link to those pages and keep what those pages lack. B41 lines are written as "B41 source" with the file and line.

:::callout[The 1-minute version]{kind=key}
- Build 42 has an entity component system in `zombie/entity/`, and `GameEntity` is the base class of world objects, inventory items and vehicle parts. The 14 files that name `ECSComponent` belong to a separate character-side system, so they do not measure its footprint.
- Java-side modding by classpath shadowing rests on the sealed launcher file listing `.` before `projectzomboid.jar`. That file is the one saved before a tool edited it, and whether Steam changed the stock file in 42.22 could not be measured.
- The engine jar carries full debug information, the engine has no Kotlin of its own, and the 42.22 decompile covers every in-scope class.
- A tile's sprite can be replaced by a 3D model that only changes what is drawn. A mod declares it in `common/media/spriteModels.txt` or as `spriteModel` script objects, and the sprite stays as the fallback.
- Nothing in the engine draws what is inside an ordinary container, and the container events are weak: `OnContainerUpdate` is a screen-refresh signal. The one exception we found is the mannequin, which draws its worn items.
- Models: a bare `mesh =` name is tried as `.fbx`, `.glb`, `.x` under `media/models_x`; `undoCoreScale = true` multiplies the scale by 0.6666667; one z-level is 192 px, which is sqrt(6) tile-widths under a uniform orthographic camera.
- Tile depth maps (F-011) cover only some cells of a sheet, and a cell with no depth data is drawn without depth. Of 3,931 shipped meshes (F-012), 2,150 are `.fbx`, `.glb` or `.blend` and open in Blender as is, and the `.x` files import through the `io_directx_x` extension.
- A standing bare-handed attack plays the shove animation and does zero health damage; a stomp on a downed zombie does damage (F-015). A mod file at the same path as a vanilla AnimSet node replaces it, and the clip a node plays is named by the animation name inside the file.
:::

:::facts
- **Files in `zombie/entity/`** 153 (156 in 42.21)
- **Top-level classes in the 42.22 jar** 3,221, all decompiled, 0 failures (3,352 in 42.21)
- **Debug tables in `IsoZombie.class`** 325 local-variable tables and 327 line-number tables, one of each per method that has them
- **Classes under `zombie/` carrying Kotlin metadata** 0
- **Event trigger sites in Java** `OnFillContainer` 15, `OnContainerUpdate` 39
- **Shipped meshes** 3,931 under `media/models_X` (2,150 open in Blender without conversion); `anims_X` holds 2,232 clips (2,209 in 42.20); both counts from the live install, 2026-11-09
- **Projection** 1 tile is 128 x 64 px, one z-level 192 px = sqrt(6) tile-widths :cite[(`zombie/iso/IsoUtils.java:78-82`, `zombie/iso/IsoUtils.java:106-110`)]
- **Melee reaching health** for a zombie facing you, at reach factor 1: declared damage x 0.135 at weapon level 0, x 0.585 at level 10; the reach factor (x1 to x2) and x1.5 for a zombie not facing you come on top :cite[(`zombie/combat/CombatConfigKey.java:14-17`, `zombie/combat/CombatConfigKey.java:64`, `zombie/CombatManager.java:776-794`)]
:::

---

## F-001 -- B42 introduces an Entity Component System

**Confidence: CONFIRMED (exists, and `GameEntity` is the base of world objects, items and vehicle parts) / PRELIMINARY (scope and role)**

**Build 42 adds an entity component system in `zombie/entity/`, and every world object, inventory item and vehicle part is a `GameEntity`.**

The package holds 153 `.java` files at 42.22 (156 at 42.21), in `components/`, `debug/`, `energy/`, `events/`, `meta/`, `network/`, `system/` and `util/`. It has no B41 equivalent: the B41 decompile in our records (1,599 files) has no `GameEntity` or `ComponentType` file. A longer page, not yet rechecked for 42.22, is [The Build 42 entity component system](/pz/build-42/modding/engine/the-entity-component-system). Keep this entry as the short, cited version.

| Class | Role | Code |
|-------|------|------|
| `Engine` | ECS engine root | `zombie/entity/Engine.java:14` |
| `EntitySimulation` | simulation driver | `zombie/entity/EntitySimulation.java:12` |
| `SystemManager`, `EngineSystem` | system registry and base | `zombie/entity/SystemManager.java:17`, `zombie/entity/EngineSystem.java:10` |
| `GameEntity`, `MetaEntity` | entity types | `zombie/entity/GameEntity.java:55`, `zombie/entity/MetaEntity.java:20` |
| `Component`, `ComponentContainer`, `ComponentType`, `ComponentFactory` | component model | `zombie/entity/Component.java:34`, `zombie/entity/ComponentContainer.java:18`, `zombie/entity/ComponentType.java:67`, `zombie/entity/ComponentFactory.java:20` |
| `Family`, `EntityBucket`, `EntityBucketManager` | entity queries and grouping | `zombie/entity/Family.java:15`, `zombie/entity/EntityBucket.java:23`, `zombie/entity/EntityBucketManager.java:15` |
| `GameEntityNetwork` | network sync for entities | `zombie/entity/GameEntityNetwork.java:37` |

**`GameEntity` reaches the old classes by inheritance.** `IsoObject`, `InventoryItem`, `VehiclePart` and `MetaEntity` all extend it. :cite[(`zombie/iso/IsoObject.java:181`, `zombie/inventory/InventoryItem.java:131`, `zombie/vehicles/VehiclePart.java:44`, `zombie/entity/MetaEntity.java:20`)] 103 files outside `zombie/entity/` import from it (counted), so its footprint is wide.

### Corrected: the 14 files that name `ECSComponent`

**The files that name `ECSComponent` or `registerECSComponents` are a separate, character-side component system, not `zombie/entity/`.**

We first took the count of those files (14, in both 42.20 and 42.21) as the narrow footprint of the entity system. It is not: they use `zombie/characters/ecs/`, which has its own `ECSComponent` and `ECSEntity`. :cite[(`zombie/characters/ecs/ECSComponent.java:12`, `zombie/characters/ecs/ECSEntity.java:22`)] The example we gave, `registerECSComponents` in `IsoZombie`, belongs to that system. :cite[(`zombie/characters/IsoZombie.java:606-609`)] `IsoObject` joins both: it extends `GameEntity` and implements `ECSEntity`. :cite[(`zombie/iso/IsoObject.java:181`)] At 42.22 the count is still 14 files.

**Preliminary interpretation:** B42 runs the entity system in parallel with the older character component code, and the old `IsoObject` hierarchy now sits on top of `GameEntity`. This is a grep-level read, not an analysis. Open questions, answered in part on the longer page above (not rechecked):
- Which entities are ECS-managed and which are legacy-managed?
- Is `EntitySimulation` driven from the main loop, and where?
- Is the ECS the substrate for B42's crafting and entity scripts (`media/scripts/generated/entities/`)?

---

## F-002 -- Java-side modding works by classpath precedence

**Confidence: CONFIRMED (the file); the JVM rule itself is standard Java and was not run here**

**The launcher file lists `.` before the jar, so a loose `.class` file in the install root is found first.**

The sealed `ProjectZomboid64.json` declares `"classpath": [".", "projectzomboid.jar"]`. :cite[(`ProjectZomboid64.json:3-6`)] `.` precedes the jar, so loose `.class` files placed in the install root **override** the corresponding classes inside `projectzomboid.jar` at runtime. This is the concrete mechanism behind the **`L3 JAVA_PATCH`** capability tier: What the file shows is the classpath order: a loose class in the install root is found before the jar. We did not rule out other ways to change Java code, such as an edited launcher file, which another page describes.

**The sealed file is the pre-tool copy.** The installed launcher file on our machine was edited by a tool, so the capture holds the copy saved before that, which is byte-identical to the 42.21 one. Whether Steam changed the stock file in 42.22 could not be measured, because no pristine copy was left.

**Corroborating incident (our own, 2026-07-30, not rechecked):** 403 stray B41-era `.class` files were found in the live install at `zombie/iso - Copy/`. That path maps to no real package, so they were never loaded. Had they been at `zombie/iso/`, they would have silently overridden B42 engine code with B41 implementations, with no error and no warning. (Archived to `_archive/stray_files_from_install_2026-07-30/`.)

---

## F-003 -- The engine ships with full debug information

**Confidence: CONFIRMED**

**The jar carries local-variable and line-number tables, so decompiled code has real names and its line numbers mean something.**

`IsoZombie.class` in the 42.22 jar has 327 methods. 325 of them carry a `LocalVariableTable` (914 rows in all) and 327 carry a `LineNumberTable` (3,312 rows). The old wording called these "entries"; they are attributes, one per method. The counts match 42.20 (checked by reading the class file, not by decompiling it).

Consequences:
- Decompiled output has **real parameter and local variable names** (`setOwner(UdpConnection connection)`), not `var1` or `var10001`. :cite[(`zombie/characters/IsoZombie.java:643`)]
- Line numbers are meaningful, so `file:line` citations are precise.
- The decompile `src/` is a readable surface for targeted reading, not merely a citation target.

---

## F-004 -- No Kotlin in the engine

**Confidence: CONFIRMED**

**No class under `zombie/` carries `kotlin/Metadata`, so straight Java decompilation covers the whole engine.**

We read every class of the 42.22 jar for the string `kotlin/Metadata`. None of the classes under `zombie/` has it. The 1,223 that do are all in three vendored libraries: `kotlin/` (824 classes), `okhttp3/` (329) and `okio/` (70).

The jar holds 865 classes under `kotlin/` in all. The old page said 566 Kotlin classes; that number does not reproduce at 42.22.

Straight Java decompilation covers **100%** of the engine. A planned Kotlin-aware fallback decompiler was cancelled as unnecessary.

---

## F-005 -- The Lua boundary is self-documented in bytecode

**Confidence: CONFIRMED (the two annotations exist) / CORRECTED (they are not the boundary list)**

**Build 42 ships `@UsedFromLua` and `@HiddenFromLua`, but neither is the list of what Lua can call: an explicit class list decides that, and `@HiddenFromLua` only subtracts from it.**

Both annotations exist as runtime annotations and are used by real engine classes, such as `IsoZombie`. :cite[(`zombie/UsedFromLua.java:14-19`, `zombie/HiddenFromLua.java:14-18`, `zombie/characters/IsoZombie.java:189`)] `@UsedFromLua` appears in 839 decompiled files and `@HiddenFromLua` in 13 (counted).

We first planned to read the whole Lua boundary from an annotation scan. The reread says that would give the wrong list.

The game registers its exposed classes by name in `LuaManager`, and the exposer exposes only a class on that list. For each exposed class it skips a method, field, constructor or class marked `@HiddenFromLua`, and it refuses some classes outright. :cite[(`zombie/Lua/LuaManager.java:1700-1701`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:53-78`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:322-329`)]

The exposer's compiled code names `zombie/HiddenFromLua` and does not name `zombie/UsedFromLua` (a byte search of the jar). The page [Engine internals: calling exposed Java from Lua](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua) explains the rules. The only `UsedFromLua` check in the decompiled source is a development-build validation. :cite[(`zombie/core/DevValidation.java:106-107`)] The page [Lua reference](/pz/build-42/modding/reference/lua-reference) says the same.

`zombie/Lua/` holds `Event`, `KahluaArrayConverter`, `KahluaNumberConverter`, `LuaBackendClass`, `LuaEventManager`, `LuaHookManager`, `LuaManager` and `MapObjects`. The generated index `api/api.jsonl` now exists and records per member whether Lua can reach it. This entry does not extract that list.

---

## F-006 -- Decompile completeness

**Confidence: CONFIRMED**

**The 42.22 decompile emitted 3,221 `.java` files from 3,221 top-level classes, with no failures.**

Vineflower 1.11.1 emitted 3,221 `.java` files from 3,221 top-level classes (5,246 class files): 100% coverage, zero failures and zero error lines, in 69.3 seconds. That is the 42.22 capture; the 42.20 build had 3,335 and the 42.21 capture 3,352. The drop is the 145-class `generation/` package, which is absent from the 42.22 jar.

In-scope packages (counted in `src/`): `zombie` (3,107), `fmod` (102), `astar` (11), `N3D` (1).

Output preserves full package paths (`zombie/characters/...`), unlike the B41 decompile, which was flattened to `characters/...`.

Every output file carries a six-line provenance banner (build, revision, jar hash, decompiler, date, and a warning that decompiled output is not original source), so a file can never be separated from its origin. :cite[(`zombie/iso/IsoObject.java:1-6`)] All 3,221 files carry the 42.22 revision line.

---

## F-007 -- Any world tile sprite can be replaced by a 3D model, and mods get a first-class slot

**Confidence: CONFIRMED (mechanism) / PRELIMINARY (limits at furniture scale)**

**Capability tier: L0 `LUA_DIRECT` for the runtime swap; the declaration itself is a data file, no code required.**

**The engine can draw a 3D model in place of a tile's sprite, and a mod declares the swap in its own `spriteModels.txt`.**

Build 42 renders most world furniture as flat isometric sprites, but the engine can substitute a real 3D model for any tile. `IsoObject.render()` tries the model first and falls through to the sprite path when it declines. :cite[(`zombie/iso/IsoObject.java:3613-3617`)] Two other render paths use the same try-model-then-sprite shape. :cite[(`zombie/iso/IsoObject.java:3733-3735`, `zombie/iso/IsoObject.java:3794-3796`)]

```java
// zombie/iso/IsoObject.java:3613
if (this.renderModel(x + 0.5F, y + 0.5F, z, col)) {
   this.updateRenderInfoForObjectPicker(x, y, z, col);
} else if (!this.isSpriteInvisible()) {
   // ... normal 2D sprite render path
}
```

### The substitution only changes the drawing

**`renderModel` changes how the object is drawn and fades, and touches no container or tile property.**

`renderModel` reads the model, steps the object's fade alpha, applies highlight and blackout colors, and draws. :cite[(`zombie/iso/IsoObject.java:6326-6419`)] It returns true only when the model is ready (or loading during chunk caching), and returns false otherwise, so the sprite is drawn meanwhile. :cite[(`zombie/iso/IsoObject.java:6415-6419`)] Tile properties (`container`, `ContainerCapacity`, `PickUpWeight`, `IsMoveAble`, health) are read by unrelated systems and are unaffected: a tile whose sprite is model-substituted keeps its 2D behavior.

### Resolution order for an object's model

**An object's own model name wins, then the sprite's shared model, and a set name that matches nothing gives no model.**

`getSpriteModel()` checks a per-object override first, then the sprite's shared assignment. :cite[(`zombie/iso/IsoObject.java:6306-6321`)]

1. `this.spriteModelName` -> `ScriptManager.getSpriteModel(name)` :cite[(`zombie/iso/IsoObject.java:6307-6311`, `zombie/scripting/ScriptManager.java:884-886`)]
2. `this.sprite.spriteModel` :cite[(`zombie/iso/IsoObject.java:6314-6318`)]

`setSpriteModelName()` is public and **serialized** with the object, so a per-instance model override persists across save and load. :cite[(`zombie/iso/IsoObject.java:6300-6304`, `zombie/iso/IsoObject.java:1394`, `zombie/iso/IsoObject.java:1616-1618`)] A name that is set keeps the same model when the sprite changes, because the lookup is by that name. If the name is set but unknown, `getSpriteModel()` returns null and does not fall back to the sprite's own model, so the object is drawn as a sprite. :cite[(`zombie/iso/IsoObject.java:6306-6313`)]

### Mods have a dedicated loading slot

**A mod's `spriteModels.txt` is read from its `common` folder only.**

`SpriteModelManager.init()` scans every loaded mod for its own `spriteModels.txt`. :cite[(`zombie/spriteModel/SpriteModelManager.java:36-47`)]

```java
for (String modID : ZomboidFileSystem.instance.getModIDs()) {
   ChooseGameInfo.Mod mod = ChooseGameInfo.getAvailableModDetails(modID);
   if (mod != null) {
      File file = new File(mod.mediaFile.common.absoluteFile, "spriteModels.txt");
      if (file.exists()) { this.initModData(mod); }
   }
}
```

**Path gotcha.** `mediaFile.common` resolves to `<mod>/common/media`. The **version** folder (`<mod>/42/media/`) is *not* scanned for this file. Wrong folder = silent no-op. :cite[(`zombie/gameStates/ChooseGameInfo.java:509-516`)]

Entries may also be declared as script objects: `spriteModel` is a registered `ScriptType`, and `SpriteModels.fromScriptManager()` merges them, keyed by the name convention `<tileset>_<tileIndex>`. :cite[(`zombie/scripting/ScriptType.java:30`, `zombie/iso/SpriteModels.java:74-86`)]

**Conflict rule: game data wins.** `Tileset.initSprites()` assigns only when the slot is empty. :cite[(`zombie/iso/SpriteModelsFile.java:283-289`)] A mod cannot override a tile vanilla has already claimed.

### TIS ships an authoring tool

**The game ships a sprite-model editor that saves into a chosen mod's folder.**

`media/lua/client/DebugUIs/SpriteModelEditor.lua` (1,082 lines) has a mod-ID dropdown fed by `SpriteModelManager.getInstance():getModIDs()`, and a SAVE button that writes the sprite-models file for the selected mod. :cite[(`media/lua/client/DebugUIs/SpriteModelEditor.lua:696`, `media/lua/client/DebugUIs/SpriteModelEditor.lua:1038-1041`, `zombie/iso/SpriteModels.java:28-30`)] Translate, rotate and scale can be tuned live against the tile. This is a supported pipeline, not an exploited seam.

### Constraints

**Four limits matter before you ship a model in place of a tile.**

- **Hard dependency on FBO chunk rendering.** `renderModel` opens with `if (!PerformanceSettings.fboRenderChunk) return false;`. :cite[(`zombie/iso/IsoObject.java:6326-6329`)] The default is `true`. :cite[(`zombie/core/PerformanceSettings.java:36`)] We first called this "a user graphics setting". The reread found no option that sets it: in vanilla code the only writer is a debug-mode key that toggles the old renderer. :cite[(`zombie/iso/IsoCell.java:3557-3560`)] The field is exposed to Lua, so a mod's Lua can set it. :cite[(`api/api.jsonl:23985`)] **Always ship the sprite as a working fallback** all the same.
- **Mouse picking still uses sprite bounds.** `updateRenderInfoForObjectPicker()` reads `this.sprite.getTextureForCurrentFrame(...)`, so hover and click targeting follow the 2D silhouette even when the model is what is drawn. Keep model and sprite silhouettes close. :cite[(`zombie/iso/IsoObject.java:6437-6440`)]
- **The `runtime =` shorthand is for doors only.** `SpriteModel.parseRuntimeString()` acts on the words `standard_door` and `pair_door` and does nothing for any other value. :cite[(`zombie/iso/SpriteModel.java:145-153`)]
- **Per-state models are per-sprite models.** Doors switch model by switching sprite, and each sprite carries its own `spriteModel`. `setSpriteFromName()` is the runtime lever, and `setSprite` also invalidates the render chunk level when it runs on the game thread. :cite[(`zombie/iso/IsoObject.java:2085-2088`, `zombie/iso/IsoObject.java:2068-2075`)] This holds only while no per-object `spriteModelName` is set, as above. The same technique works for any discrete object state.
- **Tileset and coordinate coupling.** Entries key on `<tilesetName>` plus an index that is split into a column and a row (`index % 8` and `index / 8`), so a TIS re-layout of that sheet silently retargets the model. :cite[(`zombie/iso/SpriteModels.java:80-82`)]

### Vanilla coverage (measured on an earlier build, not recounted)

**Vanilla shipped no 3D model for furniture-scale tiles when we counted.**

`media/spriteModels.txt` declared 19 tilesets and 232 model entries on Steam build 24449119: 184 are `runtime = standard_door ...` (doors, windows, fences, ramps), 100 carry an `animation`, and the static non-door remainder is entirely **small ground props**: `appliances_radio_01` (20) and `appliances_com_01` (24, walkie-talkies). `appliances_laundry_01` is registered with **zero** tiles: TIS opened the door on a container appliance and shipped nothing through it. The file is not in the 42.22 capture; its size is the same in the 42.21 and 42.22 file lists (77,515 bytes), and the counts were not redone.

**PRELIMINARY:** there is therefore **no shipped precedent at furniture scale.** Lighting behavior, wall occlusion, and how a 3D piece reads beside neighboring 2D furniture are unvalidated. This is an art and tuning risk, not an engine one.

---

## F-008 -- Container contents have no rendering representation whatsoever

**Confidence: CONFIRMED (the gap) / PRELIMINARY (that no hook exists anywhere)**

**Capability tier: L2 `EVENT_ONLY`, and the events are weak -- see below.**

**`ItemContainer` is pure data: apart from the mannequin, we found nothing in the engine that draws what is inside a container, and the events that mention containers are weak.**

**The exception we found is `IsoMannequin`.** It copies its worn items into its container and draws them from its `wornItems`, so its container is a copy of what it displays. :cite[(`zombie/iso/objects/IsoMannequin.java:799-801`, `zombie/iso/objects/IsoMannequin.java:832-835`)]

The one tile property that sounds relevant is not. `ContainerPosition` is a registered tile property, copied to the container object and stored as a plain string. :cite[(`zombie/core/properties/TilePropertyKey.java:70`, `zombie/iso/IsoObject.java:5329`, `zombie/inventory/ItemContainer.java:3479-3485`)] The only use we found is picking the reach animation: the transfer action sets an animation variable from it, and four loot animation sets read that variable. :cite[(`media/lua/client/TimedActions/ISInventoryTransferAction.lua:197-198`)] Its values were written as `High` and `Low`; the tile definitions are not in the capture, so that list was not rechecked.

**Consequence:** "show the books that are in the bookcase" cannot be switched on, because the mannequin's route draws worn items and is not a general container renderer. Container state must be *mirrored* into a render layer by the mod.

### There is no reliable container-mutation event

**`OnFillContainer` fires only for loot generation, and `OnContainerUpdate` is a screen-refresh signal.**

`OnFillContainer`, `OnContainerUpdate` and `OnObjectAdded` are registered events. :cite[(`zombie/Lua/LuaEventManager.java:730`, `zombie/Lua/LuaEventManager.java:741-742`)] We first wrote that Java never fires the first two. That was wrong: Java fires `OnFillContainer` at 15 places, all of them loot generation (`ItemPickerJava` 10, `ItemSpawner` 2, `IsoChunk`, `BaseVehicle`, and the dead-body filler in `LuaManager`), and `OnContainerUpdate` at 39 places (41 in 42.21). Each `OnFillContainer` call passes the container as its last argument. :cite[(`zombie/inventory/ItemPickerJava.java:598`, `zombie/iso/IsoChunk.java:5355`, `zombie/Lua/LuaManager.java:10334`, `zombie/vehicles/BaseVehicle.java:8952`)]

Lua fires them too, for example in the foraging code and the item-break code. :cite[(`media/lua/shared/Foraging/forageSystem.lua:1672`, `media/lua/shared/Items/OnBreak.lua:47`)] `OnContainerUpdate` is still a UI-refresh signal, not a data hook: its handler in the inventory page only marks the page dirty. :cite[(`media/lua/client/ISUI/ISInventoryPage.lua:2154-2156`, `media/lua/client/ISUI/ISInventoryPage.lua:2213`)] 33 of the 39 Java calls pass no argument, and the other six pass an item, a square or an object, never an `ItemContainer`. :cite[(`zombie/inventory/types/Food.java:785`, `zombie/iso/IsoGridSquare.java:3022`, `zombie/network/packets/RemoveItemFromSquarePacket.java:99`)]

**This is the hard part of any such mod**, not the rendering. Loot spawn has `OnFillContainer`, but coverage of corpse drops, server-side transfers, and other mods cannot be guaranteed by event subscription. Design for a reconciling refresh (on container open, on proximity) rather than trusting events.

**PRELIMINARY** on completeness: the trigger-site sweep was a text search over `zombie/`, redone on 2026-11-21 for 42.22. Loot generation is covered by `OnFillContainer`, while player transfers and changes made by other mods still are not.

### What the engine does provide

**Two primitives are usable today: item models at sub-tile positions, and phantom render objects.**

**1. Item models render at arbitrary sub-tile positions.** `IsoWorldInventoryObject.render()` draws an item's world model at the tile position plus its stored offsets, when the item's script says it has a world model. :cite[(`zombie/iso/objects/IsoWorldInventoryObject.java:557-566`)] The offsets have setters, are saved with the object, and sync in multiplayer. :cite[(`zombie/iso/objects/IsoWorldInventoryObject.java:867-877`, `zombie/iso/objects/IsoWorldInventoryObject.java:419`, `zombie/iso/objects/IsoWorldInventoryObject.java:485`, `zombie/iso/objects/IsoWorldInventoryObject.java:879-888`)] Spawn one with `IsoGridSquare.AddWorldInventoryItem(item, x, y, height)`. :cite[(`zombie/iso/IsoGridSquare.java:6057`)]

B42 already exposes this to players as **Extended Placement**, a 3D gizmo UI (`media/lua/client/ISUI/ISExtendedPlacementUI.lua`, 511 lines) that sets the offsets and the world rotation. :cite[(`media/lua/client/ISUI/ISExtendedPlacementUI.lua:436-438`, `media/lua/client/ISUI/ISExtendedPlacementUI.lua:446-448`)] Sub-tile 3D item placement is shipped, networked and persisted.

**2. Phantom render objects.** `IsoObject.new(sq, "tilename")` is Lua-constructible (used in vanilla at `media/lua/client/DebugUIs/Scenarios/Trailer2Scenario.lua:139`), and `setSpriteModelName()` (F-007) points it at any declared model.

**Constraint:** `SpriteModel` script objects are **shared singletons** resolved by name through `ScriptManager.getSpriteModel()`. :cite[(`zombie/scripting/ScriptManager.java:884-886`)] Mutating `translate` or `rotate` on one affects every user. Per-instance positioning therefore requires **pre-authored slot entries** (a fixed grid of named models), not runtime transform edits.

### Free visual variety

**One mesh plus a per-item color gives a varied shelf with no extra geometry.**

`ItemModelRenderer` tints the world model from the item's own color, and looks for a tint-mask texture beside the model's texture. :cite[(`zombie/core/skinnedmodel/model/ItemModelRenderer.java:144`, `zombie/core/skinnedmodel/model/ItemModelRenderer.java:229-238`)] Vanilla's book models use more than one texture of this kind, for example `BookRed_New` and `BookGrey_New`. :cite[(`media/scripts/generated/models_items.txt:36`, `media/scripts/generated/models_items.txt:4067`)]

### Performance shape

**We have not traced the cost of world-item models, and one earlier claim was wrong.**

World items drawn as models can go through a dedicated job list, `FBORenderItems`, only when the player's 3D ground items option is on and the item has a model. :cite[(`zombie/iso/fboRenderChunk/FBORenderItems.java:50-56`, `zombie/iso/fboRenderChunk/FBORenderCell.java:2800-2822`, `zombie/core/Core.java:4071`)] We first wrote that these are live draws every frame that never force a chunk invalidation. That is not supported: adding a world item invalidates its render chunk level, and so does moving it with `setOffset`. :cite[(`zombie/iso/IsoGridSquare.java:6078`, `zombie/iso/objects/IsoWorldInventoryObject.java:755-762`)] How often those jobs redraw was not traced.

Phantom `IsoObject`s take the `renderModel` path, which draws into the cached chunk texture, and a sprite change on the game thread invalidates its chunk level. :cite[(`zombie/core/skinnedmodel/model/IsoObjectModelDrawer.java:457-466`, `zombie/iso/IsoObject.java:2068-2075`)]

**Design implication.** The cheapest credible approach to "the container looks full" is neither of the above: author N discrete fullness states as separate sprites, each with its own `spriteModel`, and swap with `setSpriteFromName()`. One object, one draw, no shadow layer, no per-item bookkeeping, exactly how doors do open and closed. Each swap still invalidates the chunk level, so time the swaps.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompile, with every cited line opened. Counted for this page: the files in `zombie/entity/` (153), the files that import from it (103), the files that name `ECSComponent` (14), the `@UsedFromLua` and `@HiddenFromLua` files (839 and 13), the package file counts, and the event trigger sites. The debug-table counts (F-003), the Kotlin scan (F-004) and the exposer check (F-005) come from reading the compiled jar directly, not the decompile.

Not run in a game: the classpath override (F-002), the sprite-model swap and its fallback (F-007), and every event behavior (F-008). Not rechecked at 42.22: the 2026-07-30 stray-class incident (F-002) and the vanilla `spriteModels.txt` counts (F-007). Not traced: when `FBORenderItems` jobs redraw (F-008).
:::

---

## F-009 -- Model asset pipeline: formats, path resolution, and the scale convention

**Confidence: CONFIRMED** (code read at 42.22; the Blender side is dated tool behavior, see How we know)

Needed before authoring any custom mesh.

**The engine loads `.fbx`, `.glb` and `.x` meshes from `media/models_x`, tries them in that order for a bare name, and multiplies a model's declared scale by 0.6666667 when `undoCoreScale` is true.**

### Accepted formats and path roots

The loader knows five file types: none, `.x`, `.fbx`, glTF binary (`.glb`) and the old `.txt` model files. :cite[(`zombie/core/skinnedmodel/model/ModelFileExtensionType.java:10-15`)] A mesh is looked for under `media/models_x`, and `media/models` holds the `.txt` definitions. :cite[(`zombie/core/skinnedmodel/model/FileTask_LoadMesh.java:29`, `zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:26-29`)]

### Resolution order for a bare `mesh =` value

**A name without an extension is tried as `.fbx`, then `.glb`, then `.x` under `media/models_x`, then as a `.txt` under `media/models`.** :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:96-125`)]

1. `media/models_x/<name>.fbx`
2. `media/models_x/<name>.glb`
3. `media/models_x/<name>.x`
4. `media/models/<name>.txt`
5. no file: nothing loads, and the game logs "Failed to load asset" with the path. :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:32-48`, `zombie/core/skinnedmodel/model/MeshAssetManager.java:45-54`)]

A `mesh = File|Name` value has its `|` suffix stripped before any of this runs. :cite[(`zombie/core/skinnedmodel/model/FileTask_LoadMesh.java:47-51`, `media/scripts/generated/models_isoobject.txt:460`)] 

125 of the 3,775 `mesh =` values in the `models_*.txt` scripts of 42.22 use it.

A name ending in `.txt` is a text model at once. :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:63-64`)] A value containing `media/` or a dot is tried as an explicit path first, and an existing file with an unknown extension is read as `.x`. :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:72-92`)] The old `x:` prefix still works but logs that it is not needed. :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:66-69`)] A name with that prefix, or one ending in `.x`, never reaches the `.txt` step. :cite[(`zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:110-113`)]

### Scale convention -- the one that will bite

**`undoCoreScale = true` multiplies the declared scale by 0.6666667, and the default scale is 1.0.** :cite[(`zombie/scripting/objects/ModelScript.java:37`, `zombie/scripting/objects/ModelScript.java:72`, `zombie/scripting/objects/ModelScript.java:99-100`, `zombie/scripting/objects/ModelScript.java:113-115`)]

All 81 model blocks in `media/scripts/generated/models_isoobject.txt` set `undoCoreScale = true`. Six state `scale = 1.0`, two (the sheet doors) state `scale = 0.01`, and the rest leave the scale at its default. :cite[(`media/scripts/generated/models_isoobject.txt:10-19`, `media/scripts/generated/models_isoobject.txt:463`, `media/scripts/generated/models_isoobject.txt:472`)] The hardcoded door models set the scale to 0.6666667 directly. :cite[(`zombie/iso/SpriteModel.java:187`)]

Other model groups follow no single rule. In `media/scripts/generated/models_weapons.txt`, 113 `scale =` lines across 400 model blocks carry 34 different values, none of the blocks uses `undoCoreScale`, and the most common value is 1.0 (50 lines). In `models_items.txt` the most common scale line is 0.4 (407 lines). Calibrate each asset class against one existing mesh, and do not derive tile-to-Blender units from the 0.6666667 factor.

### Recognized `model` script keys

The loader reads `mesh`, `scale`, `shader`, `static`, `texture`, `invertX`, `cullFace`, `postProcess`, `undoCoreScale`, `boneWeight` and `animationsMesh`, and `attachment` child blocks. :cite[(`zombie/scripting/objects/ModelScript.java:61-110`, `zombie/scripting/objects/ModelScript.java:67-68`)] A key it does not know is ignored.

Minimal working shape, from vanilla:

```
model carpentry_01_48
{
    mesh = IsoObject/carpentry_01_48,
    animationsMesh = carpentry_01_48,
    texture = carpentry_01_50,
    shader = door,
    static = false,
    scale = 1.0,
    undoCoreScale = true,
}
```

For a static, non-animated piece, drop `animationsMesh`, `shader` and `static`.

---

## F-010 -- The world projection is uniform orthographic; one z-level is sqrt(6) tiles

**Confidence: CONFIRMED** (engine constants read at 42.22; the Blender render check is dated tool work)

Needed to author any 3D asset that must line up with existing 2D tile art.

**A 1x1 tile is a 128 by 64 pixel diamond, one z-level is 192 pixels, and a uniform orthographic camera produces that exactly when a z-level is sqrt(6) tile-widths tall.**

### The engine constants

At `Core.tileScale = 2`, the sprite projection is a fixed pair of formulas. :cite[(`zombie/iso/IsoUtils.java:78-82`, `zombie/iso/IsoUtils.java:106-110`, `zombie/core/Core.java:339`)]

```java
XToScreen: sx = objectX * 64 - objectY * 64
YToScreen: sy = objectY * 32 + objectX * 32 + (screenZ - objectZ) * 192
```

So a tile is a diamond **128 px wide by 64 px tall** (2:1 dimetric) and one z-level is **192 px**.

### What the model camera does

**The engine's own 3D camera is orthographic, tilted 30 degrees, turned 135 degrees, and scales height by 2.44949.** :cite[(`zombie/core/Core.java:2179`, `zombie/core/Core.java:2185-2186`, `zombie/core/Core.java:2189`)] That number is sqrt(6) rounded, and the physics code names it the world-to-physics height scale. :cite[(`zombie/characters/FallingConstants.java:13`, `zombie/core/Core.java:155`)] Models drawn through this camera are mirrored on X, and scaled by 1.0 for vehicles and by 1.5 for other models. :cite[(`zombie/core/Core.java:2190-2193`)]

### The calibration

**A Blender camera with `ortho_scale` 2 x sqrt(2), rotation (60, 0, 45) and a 128 x 256 render reproduces those constants to the pixel.** That was checked in Blender 5.2, analytically and by render, in the 42.20 era (How we know, below).

| Quantity | Blender units | Projects to |
|----------|---------------|-------------|
| Tile footprint | 1.0 x 1.0 | 128 x 64 px |
| One z-level | **sqrt(6) = 2.4494897** | 192 px |
| Tile + z-level | 1 x 1 x sqrt(6) | 128 x 256 px, the full sprite canvas |

**1 PZ tile = 1.0 Blender unit** under that camera.

Closed form: the screen-x scale is `64 / cos(45) = 64 x sqrt(2)` px per unit. The z axis projects through `sin(60)`, giving `(sqrt(3)/2) x 64 x sqrt(2) = 32 x sqrt(6)` px per unit, and `192 / (32 x sqrt(6)) = sqrt(6)`. So the 192 is not a stylization: model in true proportions and the projection resolves itself. A 1x1x1-tile object fills 128 x 144 px, and a full-storey object fills the 128 x 256 canvas.

### Two caveats

- **Axis convention differs.** With `rotation_euler = (60, 0, 45)` world +X and +Y both project screen-right, while the engine draws +X right and +Y left. Scale is unaffected (it is a mirror), but the facing-to-axis mapping must be confirmed against reference art.
- **This calibrates authoring geometry, not the runtime scale knob.** `undoCoreScale` (F-009) is a separate multiplier applied at load: treat it as in-game trim.

---

## F-011 -- Tile depth-map coverage is partial

**Confidence: CONFIRMED** (loader rules read at 42.22; per-cell counts measured on 42.20, images not in the capture)

**A depth sheet for a tileset does not mean every cell in it has data, and a cell with none is drawn without depth.**

The game scans `media/depthmaps` of itself and of each mod for `DEPTH_<tileset>.png`, skipping `DEPTH_whole_tile.png` and `DEPTH_preset_depthmaps_01.png`. :cite[(`zombie/tileDepth/TileDepthTextures.java:128-141`, `zombie/tileDepth/TileDepthTextureManager.java:66-81`)] A sheet is 8 cells wide. :cite[(`zombie/tileDepth/TileDepthTextures.java:83-89`)]

### Cell addressing

**For sprite `<tileset>_<index>`, the cell is at column `index % 8`, row `index / 8`, each cell 128 x 256 px at 2x art scale.** The sprite name is split at its last underscore, a cell is 64 x 128 px doubled at 2x, and the index is `col + row x columns`. :cite[(`zombie/tileDepth/TileDepthTextures.java:58-67`, `zombie/tileDepth/TilesetDepthTexture.java:89-95`, `zombie/tileDepth/TilesetDepthTexture.java:109-111`)]

### When a cell counts as empty

**A pixel with alpha 0 holds no depth, and a cell where every pixel has alpha 0 is empty.** Otherwise the depth is the blue channel divided by 255. :cite[(`zombie/tileDepth/TileDepthTexture.java:144-158`)] A sprite whose depth cell is empty is drawn without a depth texture. :cite[(`zombie/iso/sprite/IsoSprite.java:1066`, `zombie/iso/sprite/IsoSprite.java:1138`)]

### Measured coverage (42.20, not repeated)

The list of the live install (measured 2026-11-09) still shows these three sheets (`DEPTH_furniture_shelving_01.png`, `DEPTH_carpentry_02.png`, `DEPTH_crafted_05.png`), and 219 files sit under `media/depthmaps`. The cell counts below were measured on 42.20 over the sheets behind the six craftable bookcases, and the images are not in the 42.22 capture.

| Sheet | Cells with data |
|-------|-----------------|
| `DEPTH_furniture_shelving_01` | 48 / 64 |
| `DEPTH_carpentry_02` | 61 / 128 |
| `DEPTH_crafted_05` | 52 / 152 |

At that measurement, `carpentry_02` tiles 64-67 and `crafted_05` tiles 50, 51, 138 and 139 (the sprites behind `entity_carpentry_bookcase_lvl1` and `entity_carpentry_bookcasesmall_lvl1`) were blank, while `furniture_shelving_01` tiles 40-43 (the lvl2 equivalents) carried data. "Blank" there meant pixel values of 0, which is not the engine's alpha test above, so check a specific cell the way the engine does before relying on it.

---

## F-012 -- Shipped mesh asset inventory: most of it opens in Blender, and TIS ships their own `.blend` sources

**Confidence: CONFIRMED** (file counts recounted from the capture's list of the live install, measured 2026-11-09; Blender imports and measurements dated 42.20)

**Of 3,931 shipped meshes, 2,150 are `.fbx`, `.glb` or `.blend`, and the 1,781 `.x` files import into Blender through the maintained `io_directx_x` extension.**

### Format inventory -- `media/models_X` (303.8 MB)

The 42.22 capture holds no model files, so these counts come from its list of the files on the live install, measured 2026-11-09 (path and size), which reproduces every count of the 42.20 table.

| Directory | FBX | GLB | BLEND | `.X` |
|-----------|-----|-----|-------|------|
| `IsoObject` | 6 | 57 | 58 | **0** |
| `WorldItems` | 1826 | - | - | 13 |
| `vehicles` | 146 | - | 2 | 0 |
| `weapons` | 29 | - | - | 485 |
| `Static` | 1 | - | - | 431 |
| `Skinned` | 0 | 0 | 0 | **743** |
| `physics` | - | 2 | - | - |
| (root) | 23 | - | - | 109 |
| **Total** | **2031** | **59** | **60** | **1781** |

The folder holds 3,935 files and 318,507,001 bytes in all, which is the 303.8 MiB; the four files the 3,931 meshes leave out are `.png` files in `WorldItems`.

- **`IsoObject/` contains zero `.X` files.** The directory that holds world-furniture models, the category `spriteModels.txt` targets (F-007), opens in Blender as is.
- **`Skinned/` is 100% `.X`**, including `MaleBody.x`, `FemaleBody.x`, `Male_Skeleton.X` and `Female_Skeleton.X`.

### TIS ships their own Blender authoring files

**The list shows 58 `.blend` files in `media/models_X/IsoObject/blender/` and 2 in `media/models_X/vehicles/`.** They sit one level down inside `IsoObject/`, not at the `models_X/` root. `carpentry_01_48.blend` (1,028,568 bytes) sits beside `carpentry_01_48.glb` (33,272 bytes).

Opened in Blender 5.2 on 42.20, `carpentry_01_48.blend` held objects `Dummy01` and `Cube`, one armature, actions `Open` and `Close`, and the images and materials of the door. So the shipped convention for an animated `IsoObject` is one mesh, an armature, named actions matching the animation states, and a `Dummy01` empty; even a two-state door is rigged rather than modeled per state.

### `.X` is text and imports into current Blender

The DirectX header of `MaleBody.x` reads `xof 0303txt 0032`, and `txt` declares text encoding (measured on 42.20). A maintained importer exists on Blender's Extensions Platform: `io_directx_x` 1.4.0, for Blender 4.2 and later. It needs `use_online_access`, which is off by default and is the usual reason the extension list looks empty.

On `MaleBody.x` it produced an armature of 35 bones and a body of 451 vertices, 916 triangles, 28 vertex groups and 1 UV layer, so mesh, skeleton, skin weights and UVs survive. Earlier notes that said Blender had no working `.X` importer were wrong: the dead `io_scene_x` add-on is a different project.

### The character rig

**The engine knows 35 skeleton bones by name, from `Dummy01` through the biped, the dress and backpack bones and the two prop bones to `Translation_Data`.** :cite[(`zombie/core/skinnedmodel/model/SkeletonBone.java:13-47`)] That matches the 35 bones of `MaleBody.x` in Blender. `Bip01_Prop1` and `Bip01_Prop2` carry the item in the primary and secondary hand. :cite[(`zombie/core/skinnedmodel/ModelManager.java:660-693`)] The importer looks for `Dummy01` as the skeleton root. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:64`)]

### Character scale differs from IsoObject scale -- do not assume 1 BU = 1 m

`MaleBody.x` imported at 0.3304 x 0.4942 x 0.9857 BU, which would be a 0.99 m human under the IsoObject rule, wrong by roughly half. **Skinned content is authored on a different scale from world furniture**, and the engine's own model camera scales non-vehicle models by 1.5 (F-010). The IsoObject calibration applies to `spriteModels.txt` props and must not be carried over to characters, weapons or world items without checking. Vanilla weapon models declare many different scales (F-009), so treat scale as per asset class.

### Animation data

The same list (live install, 2026-11-09) gives 2,232 `.x` files in `media/anims_X` (2,209 at 42.20), 2,973 `.xml` files in `media/AnimSets` (2,949 at 42.20), 400 in `media/animsold`, 3 in `media/animstates` and 1 in `media/animscript`. Animations are `.X` too and import through the same add-on (F-013). The XML layers are readable today and describe how clips are selected and blended.

### Scale confirmed by measurement -- closes the open item in F-009

`carpentry_01_48.glb` imported into Blender 5.2 at 0.0869 x 0.7953 x 1.9602 BU (220 vertices, 134 triangles): a 0.80 m wide, 1.96 m tall door, so **1 Blender unit = 1 metre**. Vanilla declares that mesh with `scale = 1.0` and `undoCoreScale = true`. :cite[(`media/scripts/generated/models_isoobject.txt:10-19`)] This agrees with F-010 (1 tile = 1.0 BU, one z-level = sqrt(6) BU) from two directions. **Author in true metres and declare `scale = 1.0, undoCoreScale = true`, as vanilla does**, and do not pre-compensate for the 0.6666667 factor.

---

## F-013 -- Character animation clips import as Actions and carry the full Character Studio hierarchy

**Confidence: CONFIRMED** (imported and measured in Blender 5.2 on 42.20; engine side read at 42.22)

**Clip files sit in `media/anims_X/<folder>/`, and in Blender each carries its own armature with more bones than the skinned body.** The loading rules (bone names, clip names, scale, load order) are on [Skinned models and clips](/pz/build-42/engine/animation-system/skinned-models-and-clips), and the authoring steps are on [Modding animations](/pz/build-42/engine/animation-system/modding-animations).

### Where the clips live

The same list holds 1,673 clips in `media/anims_X/Bob` (1,650 at 42.20), 185 in `Zombie`, 11 in `Kate`, 361 across 12 animal folders and 2 for the mannequins. The human mesh scans `Bob`, `Kate` and `Zombie`. :cite[(`media/scripts/generated/animations_meshes.txt:3-9`)]

**The six `Bob_AttackPunch{01,02,03}_{Hit,CritHit}.X` clips ship, but nothing in the capture names them.** A search for `AttackPunch` in the capture's AnimSets, actiongroups, scripts, Lua and Java finds no hit (the capture has no `media/animsold` or `animscript` folder, so those were not searched). A bare-handed attack plays `Bob_Shove` through the shove state. :cite[(`media/AnimSets/player/shove/ShoveDefault.xml:5`)] The 42.20 note that these were the unarmed melee clips is dropped as a claim about what the game plays.

### What Blender showed (42.20, Blender 5.2)

- **Import needs an active object in Object mode.** `bpy.ops.import_scene.directx_x` fails with `mode_set.poll() Context missing active object` otherwise, and leaves a partial armature behind. It also fails intermittently right after `wm.open_mainfile`, with a valid active object, and a second try succeeds (F-014).
- **Each clip file carries its own armature**, so importing a clip beside the body gives `Armature.001`, and retargeting is a manual step. On Blender 4.4 and later, curves are read through `action.layers[].strips[].channelbag(slot).fcurves`.
- **Clip rigs have 45 bones against the body's 35.** The extra ten are Character Studio `Nub` terminators (`Bip01_HeadNub`, the finger, toe, backpack and dress nubs), keyed but with no skin weights. `Translation_Data`, `Bip01_Prop1` and `Bip01_Prop2` are keyed even in an unarmed clip, and `MaleBody.x` alone ships a 21-frame `Bob_Walk` action.
- **`Bob_AttackPunch01_Hit` is 31 frames (0..30) with 450 curves, 1.03 s at 30 fps.** The right hand pulls back (wind-up, frames 0-6), drives forward to full extension by frame 9, peaks at frame 12 and returns to the frame-0 pose at frame 30, so clips chain without a seam. Hand travel on +Y is about 0.57 BU against a 0.99 BU body.

When a clip names a bone the skeleton does not have, the game logs it and skips that channel. :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:398-400`)]

---

## F-014 -- Animation clips are declared by DIRECTORY, not enumerated; and Blender can export loadable `.X`

**Confidence: CONFIRMED** (declaration and loading read at 42.22; Blender export measured on 42.20) **/ PRELIMINARY** (not run in a game)

**A mod adds or replaces a clip by putting a file in a folder the engine scans, with no script change.** The full rules are on [Skinned models and clips](/pz/build-42/engine/animation-system/skinned-models-and-clips); this entry keeps the short version.

### Clips are declared as directories

The human mesh declares `animationDirectory = Bob`, `Kate` and `Zombie` and no individual clips. :cite[(`media/scripts/generated/animations_meshes.txt:3-9`)] An `animationsMesh` block reads `meshFile`, `animationDirectory` (repeatable), `animationPrefix` (repeatable), `keepMeshAnimations` and `postProcess`. :cite[(`zombie/scripting/objects/AnimationsMesh.java:39-48`)]

### Mods ship clips as data files

**Capability tier: L0 `LUA_DIRECT` -- data files only, no Java patch.** For each loaded mod, the engine scans `anims_X/<directory>` in the mod's `common` folder and its version folder for every directory a mesh block declares, so a mod needs no `animationsMesh` of its own. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1665-1706`, `zombie/gameStates/ChooseGameInfo.java:520`)] Any other subfolder or loose file in `anims_X` is loaded onto the human mesh as well. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1811-1856`)] A clip file at `<mod>/common/media/anims_X/Bob/` is enough. The 42.20 text said only the declared folders were scanned; that was incomplete.

### Same file path: priority decides

The base game has priority 0 and each mod its load-order position plus 1. For two files with the same path, the one from the mod with equal or higher priority wins. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1665-1683`, `zombie/core/skinnedmodel/ModelManager.java:1734`, `zombie/core/skinnedmodel/ModelManager.java:1748`)] So a mod file at the same path as a vanilla clip replaces it. Two files at different paths that hold a clip of the same name are not settled by priority; see the linked page.

Unlike `spriteModels.txt` (F-007, `common` only), clips are scanned in both the `common` and the version `anims_X`. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1686-1706`)] Do not carry the F-007 path gotcha over to animation work.

### Blender `.X` export (42.20, Blender 5.2)

`io_directx_x` exports as well as imports. The export of the rig plus the punch action had a header identical to vanilla's (`xof 0303txt 0032`) and an `AnimationSet` count of 2, with 39 frames against vanilla's 47, and it re-imported with 35 bones, 350 curves and the same motion. Whether the game needs the `Nub` bones the authoring rig lacked is untested.

- **Frame 0 is dropped.** A clip of frames 0..30 came back as 1..30, which breaks the frame-0-equals-last-frame chaining. Author from frame 1, or offset the keys.
- **Selection is ignored.** Exporting "armature + one mesh" gave a byte-identical file to exporting the whole scene. Hide or delete what should not export.
- **A failed import is not a malformed file.** The intermittent import failure in F-013 leaves a 0-bone armature; import a known-good vanilla clip first to tell file problems from context problems.

---

## F-015 -- A bare-handed attack cannot damage anything, and the suppression is three gates deep

**Confidence: CONFIRMED** (chain read end to end at 42.22 and in B41)

**A standing bare-handed attack is forced into the shove branch, a shove switches damage off, and health is only touched when it is not off, so the damage is exactly zero.** The multiplier chain for armed hits is on [Melee damage and critical hits](/pz/build-42/gameplay/the-real-numbers/melee-damage-and-critical-hits); this entry keeps what that page does not say.

### The chain

**1. Bare hands are forced into the shove branch.** When the weapon is the bare-hands item or the attack is already a shove, and the attack type is not `CHARGE`, the attack variables are set to shove. :cite[(`zombie/CombatManager.java:1404-1407`)] The `CHARGE` escape is unreachable for fists: `WeaponType.UNARMED` has `NONE` as its only possible attack, and the attack type is re-rolled from the weapon type seven lines before `calculateAttackVars` reads it. :cite[(`zombie/inventory/types/WeaponType.java:19`, `zombie/CombatManager.java:3275`, `zombie/CombatManager.java:3282`)] Vanilla sets `CHARGE` in one place, a sprinting spear collision. :cite[(`zombie/iso/IsoMovingObject.java:1238`)]

**2. A shoving player has damage switched off.** In `Hit`, a shoving player who is not aiming at the floor gets `bIgnoreDamage = true`. :cite[(`zombie/characters/IsoGameCharacter.java:6122-6125`)]

**3. Health is only touched when that flag is false.** :cite[(`zombie/characters/IsoGameCharacter.java:6253-6257`)]

The `isAimAtFloor` test in gate 2 is why **stomping a downed zombie kills it but punching a standing one never will**. A stomp is a shove that skips the suppression, and its damage is set to 0.7 to 1.0 plus 0.2 per Strength level, halved without shoes or scaled by the shoes' stomp power. :cite[(`zombie/CombatManager.java:883-891`)] `Base.BareHands` declares `MinDamage = 0.2` and `MaxDamage = 0.4`, which the player attack path never reaches. :cite[(`media/scripts/generated/items/weapon.txt:14838`, `media/scripts/generated/items/weapon.txt:14842`)]

**Identical in B41.** B41 source, `characters/IsoGameCharacter.java:4559`, carries the same gate using the public `bDoShove` field. This is not a B42 regression.

### Three ways past it, and what each costs

**Capability tier: L0 `LUA_DIRECT` for all three.**

| route | mechanism | cost |
|-------|-----------|------|
| A. equip a real `HandWeapon` | a hand-weapon item in the primary hand is not the bare-hands item, so nothing forces the shove branch | an item equipped without being in the inventory may escape through paths such as the drop action, which removes it from the inventory and then places a world item; we did not trace those paths |
| B. call `Hit()` directly | `IsoGameCharacter.Hit(weapon, wielder, dmg, false, delta)` runs the full pipeline with `bIgnoreDamage = false` | needs your own attack trigger, targeting and animation, because of corollary 1 |
| C. hook `OnWeaponHitCharacter` | the event fires during a shove, after `bIgnoreDamage` is set and before `processHitDamage` and `hitConsequences`; call `applyDamage` in that window | none structurally: targeting, arc, range, multi-hit, knockback, delay and multiplayer sync stay vanilla |

Route A rests on the player's primary item. :cite[(`zombie/characters/IsoLivingCharacter.java:44-55`)] For route C, the event is triggered right after the gate, with the wielder, the target, the weapon and the damage split as arguments. :cite[(`zombie/characters/IsoGameCharacter.java:6127`, `api/events.jsonl:235`)] `processHitDamage` and `hitConsequences` follow it. :cite[(`zombie/characters/IsoGameCharacter.java:6148-6149`)] `applyDamage(float)` is exposed to Lua, subtracts from health and floors it at 0. :cite[(`api/api.jsonl:14241`, `zombie/characters/IsoGameCharacter.java:16398-16403`)] `isDead()` is health-based, so a target taken to zero is already dead when `hitConsequences` runs and the engine performs the death, kill credit and animation. :cite[(`zombie/characters/IsoGameCharacter.java:4955-4957`)] Another modder's use of route B (Brutal Handwork, workshop `2934621024`) is reported, not rechecked.

**Route C in multiplayer is untested since 42.20.** A client sends its hits in one packet per target, and a zombie the client does not own gets `hitConsequences` with damage switched off. :cite[(`zombie/characters/IsoZombie.java:4201-4203`)] Whether an `applyDamage()` made in the event on a client still reaches that zombie needs a test on a dedicated server.

### Corollary 1 -- `Hook.Attack` never fires unarmed

Empty hands substitute the bare-hands item, so the `Attack` hook is skipped. :cite[(`zombie/characters/IsoLivingCharacter.java:44-55`)] **Identical in B41** (B41 source, `characters/IsoLivingCharacter.java:38-42`). A mod that wants to intercept an unarmed swing must use `OnMouseDown` or `OnKeyPressed` and call its own logic.

### Corollary 2 -- unarmed has weapon level 0 and earns no weapon-skill XP

`getWeaponLevel` starts at -1 and adds perk levels only when the weapon type is not `UNARMED` and a weapon is in the primary hand, then returns 0 for -1. :cite[(`zombie/characters/IsoGameCharacter.java:11304-11346`)] **An unarmed character is therefore weapon level 0.** The level scales damage by `0.3 + 0.1 x level`. :cite[(`zombie/CombatManager.java:3880-3888`)]

Experience agrees. The `OnWeaponHitXp` event fires for a hit whose damage is not ignored, which includes a shove: in single player from the combat code, and in multiplayer from the server's handling of the hit. :cite[(`zombie/CombatManager.java:1207-1208`, `zombie/network/fields/hit/Hit.java:205-206`)]

Its Lua handler gives Fitness 1 and Strength by the hit count, but combat perks only for a weapon in the axe, blunt, spear, long blade, small blade or small blunt categories, and `Base.BareHands` is in the `unarmed` category. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:73`, `media/lua/server/XpSystem/XpUpdate.lua:77`, `media/lua/server/XpSystem/XpUpdate.lua:89-104`, `media/scripts/generated/items/weapon.txt:14831`)]

Java adds 2 Strength XP for a non-lethal hit with a non-ranged weapon that knocks back on no death, and `Base.BareHands` sets that. :cite[(`zombie/characters/IsoGameCharacter.java:6277-6283`, `media/scripts/generated/items/weapon.txt:14837`)] So a fist earns Fitness and Strength, and a custom fist skill must apply its own damage multiplier and award its own XP.

### Corollary 3 -- the melee damage constants are NOT sandbox settings

**`CombatConfig` is built from compiled defaults with no file, sandbox or save layer.** :cite[(`zombie/combat/CombatConfig.java:19-23`)] `set()` exists for runtime change and the class is exposed to Lua, but nothing we found loads player-facing configuration into it. :cite[(`zombie/combat/CombatConfig.java:15`, `zombie/combat/CombatConfig.java:29-32`)] There is one instance, owned by `CombatManager`. :cite[(`zombie/CombatManager.java:139`)]

| key | default | Code |
|-----|---------|------|
| `BASE_WEAPON_DAMAGE_MULTIPLIER` | 0.3 | `zombie/combat/CombatConfigKey.java:14` |
| `WEAPON_LEVEL_DAMAGE_MULTIPLIER_INCREMENT` | 0.1 | `zombie/combat/CombatConfigKey.java:15` |
| `PLAYER_RECEIVED_DAMAGE_MULTIPLIER` | 0.4 | `zombie/combat/CombatConfigKey.java:16` |
| `NON_PLAYER_RECEIVED_DAMAGE_MULTIPLIER` | 1.5 | `zombie/combat/CombatConfigKey.java:17` |
| `GLOBAL_MELEE_DAMAGE_REDUCTION_MULTIPLIER` | 0.15 | `zombie/combat/CombatConfigKey.java:64` |

So melee reaching health is roughly `declared x 2 (first-target split) x 1.5 x (0.3 + level x 0.1) x 0.15`, which is **declared x 0.135 at weapon level 0** and **x 0.585 at level 10**. The split is x2 for the first zombie of a swing. :cite[(`zombie/CombatManager.java:863-865`)] 

That figure holds for a zombie facing you at reach factor 1; the reach factor (about x1 to x2) and x1.5 for a zombie not facing you come on top. :cite[(`zombie/CombatManager.java:776-794`, `zombie/characters/IsoGameCharacter.java:6226-6237`)] The strength, skill-bonus and moodle factors are on the linked page. A mod that applies damage directly is not comparable to the declared item numbers without this correction.

**Sandbox difficulty still applies through zombie health.** A zombie the world spawns gets 3.5 (Tough), 1.5 (Normal), 0.5 (Fragile) or a random 0.5 to 3.5, each plus 0 to 0.3. :cite[(`zombie/VirtualZombieManager.java:343-357`)] A zombie that is reset for reuse gets 1.8 instead of 1.5 for Normal. :cite[(`zombie/characters/IsoZombie.java:4420-4434`)] The option is `ZombieLore.Toughness`, values 1 to 4 (Tough, Normal, Fragile, Random). :cite[(`zombie/SandboxOptions.java:2100`, `media/lua/shared/Translate/EN/Sandbox.json:465-468`)] The Java default is 2 (Normal), but the presets set it: Apocalypse and Outbreak use 4 (Random), Extinction 1, Rising 3 and Six Months Later 2. Players who keep the default Apocalypse preset get Toughness 4. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:198`, `media/lua/shared/Sandbox/Extinction.lua:198`, `media/lua/shared/Sandbox/Outbreak.lua:198`, `media/lua/shared/Sandbox/Rising.lua:198`, `media/lua/shared/Sandbox/SixMonthsLater.lua:106`)]

---

## F-016 -- AnimSet nodes: how mods add them, how one wins, and what `m_AnimName` actually resolves against

**Confidence: CONFIRMED** (read at 42.22; not run in a game, so the 42.20 "validated in game" tag is dropped)

F-014 covers animation **clips** in `anims_X`. This covers the separate `AnimSets` subsystem, the XML state machine that decides which clip plays. The node format, ranking and reload are written out on [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions) and [Modding animations](/pz/build-42/engine/animation-system/modding-animations); this entry keeps the traps.

**Capability tier: L0 `LUA_DIRECT` -- data files only.**

**A mod adds a node by dropping a uniquely named XML file into a state folder, and replaces one by shipping a file at the same relative path.**

### A mod adds nodes by dropping XML into an existing state folder

The loader lists the state folders, and then the node files in each, across the base game and every mod's `common` and version folders. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimationSet.java:55-68`, `zombie/core/skinnedmodel/advancedanimation/AnimState.java:74-92`, `zombie/ZomboidFileSystem.java:1209-1220`)] The list holds each relative path once. :cite[(`zombie/ZomboidFileSystem.java:1238-1262`)] The file is then loaded from where the engine's file map points for that path, and a mod file overwrites the entry of an earlier source and is logged as "overrides". :cite[(`zombie/ZomboidFileSystem.java:1128-1136`, `zombie/ZomboidFileSystem.java:656-696`)]

- **A uniquely named file is additive.** `MyMod_Foo.xml` in `AnimSets/player/shove/` adds a node to vanilla's state.
- **A file at the same relative path replaces the vanilla file.** The 42.20 text of this entry said it was skipped; that is wrong at 42.22. The list drops only a repeated path, while the content comes from the last source.

### Which node wins

**Abstract nodes are never offered; the others rank by `m_ConditionPriority` (default 0), then by condition count, and higher ranks are tried first.** :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimState.java:97-111`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:361-377`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:46`)] Vanilla shove nodes declare no `m_ConditionPriority`, so declaring `1` beats them without relying on the condition count.

### `m_AnimName` resolves against the name INSIDE the asset

**A node plays a clip by the animation's name inside the file, cut at its `|`, not by the file name.** :cite[(`zombie/core/skinnedmodel/model/jassimp/ImportedSkeleton.java:343-351`)] The container supplies that name: the `AnimationSet <name> {` block in `.x`, the Action name in `.glb` (`animations[].name`), the stack name in `.fbx`. That list is importer behavior and was not rechecked at 42.22. A Blender export can leave a name like `_tmp`, and the node then never plays; the game logs "Anim Clip not found" and plays nothing (see [Skinned models and clips](/pz/build-42/engine/animation-system/skinned-models-and-clips)). Keep the file name and the inner name equal by habit: it is a convention, not enforced.

### `x_extends` and the declaring file's folder

**A node's `x_extends` is resolved against the folder of the file that declares it.** :cite[(`zombie/util/PZXmlUtil.java:58-72`, `zombie/ZomboidFileSystem.java:953-959`)] The path is shortened only when it sits under the game's own folder, so a mod file keeps an absolute path to its own folder. :cite[(`zombie/ZomboidFileSystem.java:920-933`)] A mod node that extends `ShoveDefault.xml` therefore looks in the mod's folder. A failed parse leaves the asset not ready, and `AnimState.Parse` skips it without a line of its own. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimState.java:87`)] We read this and did not run it: prefer self-contained mod nodes, or ship the file you extend.

### glTF and FBX are accepted, at 100x the `.x` scale

The loader's roots are `media/anims` and `media/anims_x`, and the probe order for a bare name is `.fbx`, `.glb`, `.x`, then a `.txt`, FBX first. :cite[(`zombie/core/skinnedmodel/model/FileTask_LoadAnimation.java:29`, `zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:96-125`)] `.fbx` and `.glb` files multiply key positions by 0.01 and turn the root -90 degrees about X, and `.x` does neither. :cite[(`zombie/core/skinnedmodel/model/FileTask_LoadAnimation.java:48-112`)] A Horse Mod survey on 42.20 (55 `.glb` clips for the Bob rig, workshop `3661336777`) found bone offsets with a median of 10.0 and a maximum of 51.0, against sub-unit values in `.x` space, which fits roughly 100 times the `.x` scale. glTF is the easier path: Blender ships the exporter, there is no frame-0 drop (F-014), and the clip name comes from the Action name.

### The player's shove states

**The player has four shove states, `shove`, `shoveAim`, `shoveWithFirearm` and `shoveWithHandgun`, each with its own AnimSets folder, so overriding one leaves the others on vanilla.** The aim-state transitions pick `shove` when `bShoveAiming` is false and `shoveAim` when it is true, and both also need `initiateAttack`, `bDoShove`, no running `AttackAnim` and no `bDoStomp`. :cite[(`media/actiongroups/player/aim/to_shove.xml:5-9`, `media/actiongroups/player/aim/to_shoveAim.xml:3-11`)] `ShoveAim.xml` extends `ShoveDefault.xml` as a 2D blend of `Bob_AimShove` over `ShoveAimX` and `ShoveAimY`. :cite[(`media/AnimSets/player/shoveAim/ShoveAim.xml:2-30`)] The `shove` base fires `ShoveAnim` as a paired TRUE and FALSE event, and the `shoveAim` base uses `FlagWhileAlive`, so copy events from the state you override. :cite[(`media/AnimSets/player/shove/ShoveDefault.xml:22-29`, `media/AnimSets/player/shoveAim/ShoveDefault.xml:36-40`)]

`AttackCollisionCheck` at `m_TimePc 0.15` is the event that drives the hit: the shove state routes it to `CombatManager.attackCollisionCheck`. :cite[(`media/AnimSets/player/shove/ShoveDefault.xml:17-19`, `zombie/ai/states/SwipeStatePlayer.java:89`, `zombie/ai/states/SwipeStatePlayer.java:284-299`, `zombie/CombatManager.java:979`)] Dropping it gives an animation that connects with nothing.

### `m_SpeedScale` accepts a variable name

`m_SpeedScale` is a string; if it does not parse as a number, it is kept as an animation variable name and read per swing. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:142`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:250-254`, `zombie/core/skinnedmodel/advancedanimation/AnimNode.java:289-291`)] Playback speed can therefore be driven from Lua, the basis for skill-scaled or fatigue-scaled animation. `m_SpeedScaleRandomMultiplierMin` and `Max` add a random factor per swing. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:150-154`)]

### Reloading without a restart

**The game reloads edited AnimSets through a file watcher, and the method behind it is not exposed to Lua.** A watcher on `media/AnimSets` marks a change, and one second later `checkModifiedFiles` calls `refreshAnimSets(true)`. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:71-75`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:146-164`)] The file watcher itself polls only in single player, on a server, or on a multiplayer client in debug mode, and waits 2 seconds after the last change before it reports one, so the full delay is about 3 seconds. :cite[(`zombie/DebugFileWatcher.java:143`, `zombie/DebugFileWatcher.java:178-179`)] That method resets the sets, reloads every node asset, rebuilds the `player`, `player-vehicle`, `zombie` and `zombie-crawler` sets, and tells players, zombies and animals. :cite[(`zombie/Lua/LuaManager.java:6053-6089`)] The 42.20 text left its Lua exposure as inferred; the engine's API index now lists it as not callable from Lua. :cite[(`api/api.jsonl:5506`)]

The AnimSets predicate accepts a changed `.xml` path under any mod's `common` or version AnimSets folder (canonical path), or under the base game's AnimSets path. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:79-106`)] Java resolves a junction to its real target, so a dev setup that links the mod folder may never trigger it: that is reasoning from the code, not a run.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompile with every cited line opened, and from the shipped scripts, Lua and XML. Counted again: the model-script blocks and scale lines in F-009, and the shipped file counts in F-012 (from the list of the live install (measured 2026-11-09), because the capture holds no model, depth-map or clip files). Nothing here was run in a game.

Dated tool behavior, from Blender 5.2 on 42.20 and not rerun: the `io_directx_x` importer and exporter results, the blend-file contents, the character and door sizes in Blender units, the Blender camera check in F-010, the cell counts in F-011 and the punch-clip frame numbers in F-013. They describe Blender, not the game. The Horse Mod survey and the Brutal Handwork story are other authors' mods, reported and not rechecked.

Not verified: the container-to-clip-name list in F-016, the route A escape paths and route C in multiplayer (F-015), a mod `x_extends` failing in play, and the watcher with a junction.
:::

*Updated 2026-11-21 for Build 42.22: F-009 to F-016 reread against the 42.22 decompile. Corrected: F-009 scale and "silent failure"; F-013 punch clips; F-014 scanned folders; F-015 line numbers and zombie health; F-016 same-path replacement, Lua exposure of `refreshAnimSets` and the shove states.*
