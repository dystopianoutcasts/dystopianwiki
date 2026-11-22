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
  Running log of verified Build 42 engine findings, each with its evidence and confidence. F-001 to F-008 are read at 42.22; F-009 to F-016 are still the 42.21 text and are being rechecked.
last_updated: '2026-11-21'
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21, for F-001 to F-008. F-009 to F-016 are still the 42.21 text (revision 4a0e9546ec) and are being rechecked.

Running log of verified findings. Each entry states its evidence and its confidence level. **Preliminary findings are labeled as such** -- do not cite them as settled.

F-001 to F-008 below were reread against the 42.22 decompile, and each line they cite was opened. The confidence tags are the original author's, changed only where a reread changed the answer. In F-009 onward, a citation written `B42/src/...` still means our decompile of 42.21, and its line numbers have not been moved to 42.22.

:::callout[The 1-minute version]{kind=key}
- Build 42 has an entity component system in `zombie/entity/`, and `GameEntity` is the base class of world objects, inventory items and vehicle parts. The 14 files that name `ECSComponent` belong to a separate character-side system, so they do not measure its footprint.
- Java-side modding by classpath shadowing rests on the sealed launcher file listing `.` before `projectzomboid.jar`. That file is the one saved before a tool edited it, and whether Steam changed the stock file in 42.22 could not be measured.
- The engine jar carries full debug information, the engine has no Kotlin of its own, and the 42.22 decompile covers every in-scope class.
- A tile's sprite can be replaced by a 3D model that only changes what is drawn. A mod declares it in `common/media/spriteModels.txt` or as `spriteModel` script objects, and the sprite stays as the fallback.
- Nothing in the engine draws what is inside an ordinary container, and the container events are weak: `OnContainerUpdate` is a screen-refresh signal. The one exception we found is the mannequin, which draws its worn items.
:::

:::facts
- **Files in `zombie/entity/`** 153 (156 in 42.21)
- **Top-level classes in the 42.22 jar** 3,221, all decompiled, 0 failures (3,352 in 42.21)
- **Debug tables in `IsoZombie.class`** 325 local-variable tables and 327 line-number tables, one of each per method that has them
- **Classes under `zombie/` carrying Kotlin metadata** 0
- **Event trigger sites in Java** `OnFillContainer` 15, `OnContainerUpdate` 39
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

:::callout[F-009 to F-016 are not rechecked yet]{kind=warn}
F-009 to F-016 below are still the 42.21 text and are being rechecked. Their `B42/src/...` citations point at our 42.21 decompile.
:::

## F-009 -- Model asset pipeline: formats, path resolution, and the scale convention

**Confidence: CONFIRMED**

Needed before authoring any custom mesh.

### Accepted formats

`ModelFileExtensionType` (`B42/src/zombie/core/skinnedmodel/model/ModelFileExtensionType.java`)
enumerates `None, X, Fbx, glTF, Txt`. **FBX, glTF binary (`.glb`), and DirectX
`.x` all load.**

### Path roots

`FileTask_LoadMesh` (`B42/src/zombie/core/skinnedmodel/model/FileTask_LoadMesh.java:29`):

```java
super(fileSystem, cb, "media/models", "media/models_x");
```

`media/models_x` is the mesh root; `media/models` holds `.txt` model definitions
(vehicles).

### Resolution order for a bare `mesh =` value

`checkExtensionType()`
(`B42/src/zombie/core/skinnedmodel/model/FileTask_AbstractLoadModel.java:60-125`).
For an extensionless name, the probe order is:

1. `media/models_x/<name>.fbx`
2. `media/models_x/<name>.glb`
3. `media/models_x/<name>.x`
4. `media/models/<name>.txt`
5. `None` (silent failure)

A value containing `media/` or a `.` is treated as an explicit path. The legacy
`x:` prefix is accepted but warns that it is unnecessary (`:69`). Unknown
extensions on an existing file fall back to `X` (`:92`).

### Scale convention -- the one that will bite

`undoCoreScale = true` multiplies the declared scale by **0.6666667**:

```java
// B42/src/zombie/scripting/objects/ModelScript.java:113
if (bUndoCoreScale) {
   this.scale *= 0.6666667F;
}
```

Every vanilla `IsoObject` entry in `media/scripts/generated/models_isoobject.txt`
uses `scale = 1.0` with `undoCoreScale = true`, i.e. an **effective 0.6667**. The
hardcoded door path sets `scale = 0.6666667F` directly
(`B42/src/zombie/iso/SpriteModel.java:~180`), confirming the same target.

**Do not derive tile-to-Blender units from this figure.** Calibrate empirically
against an existing `IsoObject/` mesh before committing to a model's dimensions.

### Recognised `model` script keys

From `B42/src/zombie/scripting/objects/ModelScript.java:77-109`: `mesh`, `scale`,
`shader`, `static`, `texture`, `invertX`, `cullFace`, `postProcess`,
`undoCoreScale`, `boneWeight`, `animationsMesh`, plus `attachment` sub-blocks
(`:118`).

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

For a static, non-animated piece, drop `animationsMesh`, `shader`, and `static`.

---

## F-010 -- The world projection is uniform orthographic; one z-level is sqrt(6) tiles

**Confidence: CONFIRMED (derived from engine constants, verified by render)**

Needed to author any 3D asset that must line up with existing 2D tile art.

### The engine constants

`B42/src/zombie/iso/IsoUtils.java:79` and `:107`, at `Core.tileScale = 2`:

```java
XToScreen: sx = objectX * 64 - objectY * 64
YToScreen: sy = objectY * 32 + objectX * 32 + (screenZ - objectZ) * 192
```

So a 1x1 tile is a diamond **128 px wide by 64 px tall** (a 2:1 dimetric), and
one z-level is **192 px**.

### The calibration

Modelled in Blender 5.2 as a unit cube, solved against those constants, and
checked two independent ways -- analytically via `world_to_camera_view` and by
an actual 128x256 render. Both agree to the pixel.

```python
cam.data.type        = 'ORTHO'
cam.data.ortho_scale = 2.8284271           # 2 * sqrt(2), exact
cam.rotation_euler   = (radians(60), 0, radians(45))
render resolution    = 128 x 256
```

| Quantity | Blender units | Projects to |
|----------|---------------|-------------|
| Tile footprint | 1.0 x 1.0 | 128 x 64 px |
| One z-level | **sqrt(6) = 2.4494897** | 192 px |
| Tile + z-level | 1 x 1 x sqrt(6) | 128 x 256 px -- the full sprite canvas |

**1 PZ tile = 1.0 Blender unit** under that camera.

### The result that matters

The z coefficient (192) is *not* a stylisation or a non-uniform stretch. It is
exactly what a uniform orthographic camera at 45 deg azimuth / 30 deg elevation
produces when the z-level is `sqrt(6)` tile-widths tall.

Closed form: screen-x scale is `64 / cos(45) = 64*sqrt(2)` px per BU; the z axis
projects through `sin(60)`, giving `(sqrt(3)/2) * 64*sqrt(2) = 32*sqrt(6)` px per
BU; and `192 / (32*sqrt(6)) = sqrt(6)`.

**Practical consequence:** model in true proportions and the projection resolves
itself. There is nothing to fudge by eye. A 1x1x1-tile object fills 128x144 px;
a full-storey object fills the 128x256 sprite canvas exactly.

### Two caveats

- **Axis convention differs.** With `rotation_euler = (60, 0, 45)` world +X and
  +Y both project screen-right, whereas the engine's convention is +X right /
  +Y left (`sx = (x - y) * 64`). Scale is unaffected -- it is a mirror, and the
  diamond is identical -- but the facing-to-axis mapping must be confirmed
  against reference art, not assumed.
- **This calibrates authoring geometry, not the runtime scale knob.**
  `undoCoreScale` (F-009) is a separate multiplier applied at load; treat it as
  in-game trim, not as the source of authoring dimensions.

### Why this method

The obvious alternative -- import a vanilla mesh and measure it -- **does not
work.** PZ ships meshes in `media/models_X` as DirectX `.X`, and Blender has no
maintained `.X` importer (`io_scene_x` has been dead since the 2.7x era). The
cube method needs no game asset at all and is reproducible from the two engine
constants above.

---

## F-011 -- Tile depth-map coverage is partial

**Confidence: CONFIRMED**

`media/depthmaps/DEPTH_<tileset>.png` supplies the per-pixel depth textures that
let flat sprites occlude correctly. **Coverage is far from complete**, which
matters when using depth maps as a modelling or analysis reference.

Measured over the sheets backing the six craftable bookcases (128x256 cells,
8 columns):

| Sheet | Cells with data |
|-------|-----------------|
| `DEPTH_furniture_shelving_01` | 48 / 64 |
| `DEPTH_carpentry_02` | 61 / 128 |
| `DEPTH_crafted_05` | 52 / 152 |

Concretely, `carpentry_02` tiles 64-67 and `crafted_05` tiles 50/51/138/139 --
the sprites backing `entity_carpentry_bookcase_lvl1` and
`entity_carpentry_bookcasesmall_lvl1` -- are **entirely blank** (extrema 0,0),
while `furniture_shelving_01` tiles 40-43 for the lvl2 equivalents carry real
data (extrema up to 231).

So a sprite having a depth sheet does **not** imply that sprite has depth data.
Check the specific cell before relying on it.

### Cell addressing

For sprite `<tileset>_<index>`, the depth cell is at
`col = index % 8`, `row = index / 8`, each cell 128x256 px at 2x art scale.
Verified against `furniture_shelving_01_40..43` and `crafted_04_88..95`.

---

## F-012 -- Shipped mesh asset inventory: most of it opens in Blender, and TIS ships their own `.blend` sources

**Confidence: CONFIRMED** (inventory, formats, measurement, and `.X` import all
verified by execution in Blender 5.2)

Derived by direct inspection of the live B42 install
(the `media` folder in your Steam library's `ProjectZomboid` folder), not from engine source.
Counts are from the shipped tree at buildid `24449119`.

### Format inventory -- `media/models_X` (303.8 MB)

| Directory | FBX | GLB | BLEND | `.X` |
|-----------|-----|-----|-------|------|
| `IsoObject` | 6 | 57 | 58 | **0** |
| `WorldItems` | 1826 | - | - | 13 |
| `vehicles` | 146 | - | 2 | 0 |
| `weapons` | 29 | - | - | 485 |
| `Static` | 1 | - | - | 431 |
| `Skinned` | 0 | 0 | 0 | **743** |
| (root) | 23 | - | - | 109 |
| **Total** | **2031** | **59** | **60** | **1781** |

**2,150 of 3,931 meshes open in Blender with no conversion.** Blender imports
FBX and glTF natively.

Two consequences worth stating plainly:

- **`IsoObject/` contains zero `.X` files.** The directory that holds
  world-furniture models -- the category `spriteModels.txt` targets (F-007) --
  is entirely importable. Any vanilla furniture piece can be opened and measured.
- **`Skinned/` is 100% `.X`.** Every character and animal, including
  `MaleBody.x`, `FemaleBody.x`, `Male_Skeleton.X`, `Female_Skeleton.X`. No
  importable copy of the player model ships.

### TIS ships their own Blender authoring files

**58 `.blend` files in `media/models_X/IsoObject/blender/`**, plus 2 in
`media/models_X/vehicles/`. Note the nesting -- they are inside `IsoObject/`,
not at the `models_X/` root.

These are authoring sources, not exports. `carpentry_01_48.blend` (the door used
as the `model` script example in F-009) contains:

```
objects   : Dummy01, Cube
meshes    : Cube
armatures : Armature
actions   : Open, Close
images    : door3.png, carpentry_01_49.png
materials : Material, Dots Stroke
```

So the shipped convention for an animated `IsoObject` is: a single mesh, an
armature, named actions matching the animation states, and a `Dummy01` empty
that survives into the exported GLB. For a static piece, F-009's guidance to drop
`animationsMesh` / `shader` / `static` still applies -- but note that even a
two-state door is rigged rather than modelled per-state.

### `.X` is ASCII, not binary -- the format is parseable

`MaleBody.x` begins:

```
xof 0303txt 0032
template ColorRGBA {
 <35ff44e0-6c7c-11cf-8f52-0040333594a3>
 FLOAT red; FLOAT green; FLOAT blue; FLOAT alpha;
}
```

The `txt` token in the DirectX header declares **text encoding**. The files are
plain, self-describing ASCII carrying their own template definitions.

### `.X` imports into current Blender -- no parser or converter needed

**A maintained importer exists on Blender's official Extensions Platform.**

```
id                 io_directx_x
name               DirectX X Format (.x)
version            1.4.0
blender_version_min 4.2.0
source             https://extensions.blender.org/add-ons/io-directx-x/
```

Install from inside Blender (requires `use_online_access`, which is **off by
default** in 4.2+ and is the usual reason the extension repo appears empty):

```python
bpy.context.preferences.system.use_online_access = True
bpy.ops.extensions.repo_sync_all()
bpy.ops.extensions.package_install(repo_index=0, pkg_id="io_directx_x",
                                   enable_on_install=True)
# provides bpy.ops.import_scene.directx_x(filepath=...)
```

**Verified by execution** in Blender 5.2 against
`media/models_X/Skinned/MaleBody.x`:

```
Armature : 35 bones
Body     : 451 verts, 916 tris, 28 vertex groups, 1 UV layer
```

Mesh, skeleton, skin weights, and UVs all survive the round trip. Earlier notes
in this repo -- and an earlier draft of this very finding -- claimed Blender had
no working `.X` importer and that `.X` content was effectively inaccessible.
**That was wrong.** The `io_scene_x` addon that is genuinely unmaintained is a
different, older project; it is not the only option and has been superseded.

The community route (converting `.X` to FBX with an external tool) also works
and is what most PZ modders have historically used, but it is no longer
necessary.

### The character rig

`MaleBody.x` carries a 3ds Max Character Studio biped, plus PZ-specific
additions:

```
Dummy01, Bip01, Bip01_Pelvis, Bip01_Spine, Bip01_Spine1, Bip01_Neck, Bip01_Head,
Bip01_{L,R}_Clavicle, Bip01_{L,R}_UpperArm, Bip01_{L,R}_Forearm,
Bip01_{L,R}_Hand, Bip01_{L,R}_Finger0, Bip01_{L,R}_Finger1,
Bip01_{L,R}_Thigh, Bip01_{L,R}_Calf, Bip01_{L,R}_Foot, Bip01_{L,R}_Toe0,
Bip01_BackPack, Bip01_DressFront, Bip01_DressFront02,
Bip01_DressBack, Bip01_DressBack02, Bip01_Prop1, Bip01_Prop2, Translation_Data
```

`Bip01_Prop1` / `Bip01_Prop2` are the weapon/item attachment points.
`Translation_Data` carries root motion. The dress and backpack bones drive
clothing meshes, which are separate `.X` files skinned to the same rig.

### Character scale differs from IsoObject scale -- do not assume 1 BU = 1 m

`MaleBody.x` imports at **0.3304 x 0.4942 x 0.9857 BU**. Under the IsoObject
convention (1 BU = 1 m, F-010 / this finding) that would be a 0.99 m tall human,
which is wrong by roughly half.

**Skinned content is authored on a different scale from world furniture.** The
IsoObject calibration above is confirmed and applies to `spriteModels.txt`
props; it must NOT be carried over to characters, weapons, or world items
without separate verification. Community guidance reports weapon and tool models
being handled at 0.01 scale, which is a third distinct convention.

Treat scale as per-asset-class and verify each one before authoring.

### Animation data

| Path | Count | Format |
|------|-------|--------|
| `media/anims_X` | 2209 | `.x` |
| `media/AnimSets` | 2949 | `.xml` |
| `media/animsold` | 400 | `.txt` |
| `media/animstates` | 3 | `.animstates`, `.xml` |
| `media/animscript` | 1 | `.xml` |

Animations are `.X` as well, and import through the same add-on -- see F-013 for
the clip structure, the import gotcha, and a measured breakdown of the unarmed
punch. The XML layers (`AnimSets`, `animstates`) are readable today and describe
how clips are selected and blended.

### Scale confirmed by measurement -- closes the open item in F-009

F-009 said: *"Do not derive tile-to-Blender units from [`undoCoreScale`].
Calibrate empirically against an existing `IsoObject/` mesh before committing to
a model's dimensions."* That calibration has now been done.

`media/models_X/IsoObject/carpentry_01_48.glb` imports into Blender 5.2 at:

```
dimensions = 0.0869 x 0.7953 x 1.9602 BU     (220 verts, 134 tris)
```

That is a 0.80 m wide, 1.96 m tall door -- real-world dimensions at **1 Blender
unit = 1 metre**. Vanilla declares this exact mesh with `scale = 1.0,
undoCoreScale = true`.

This agrees with F-010's independently derived result (1 PZ tile = 1.0 BU, one
z-level = sqrt(6) BU) from two directions: F-010 solved it from the projection
constants, F-012 measured it off a shipped asset. **Author in true metres and
declare `scale = 1.0, undoCoreScale = true`, exactly as vanilla does.** Do not
pre-compensate for the 0.6666667 multiplier -- vanilla authors at true scale and
declares the same values.

---

## F-013 -- Character animation clips import as Actions and carry the full Character Studio hierarchy

**Confidence: CONFIRMED** (imported and measured in Blender 5.2)

Follows from F-012's `.X` import path. Needed before authoring custom character
animation.

### Where the clips live

`media/anims_X/Bob` holds **1650 clips** -- the player character. `Zombie` has
185, animals ~360 across nine species.

`Bob_Attack*` spans ~70 attack families. **Unarmed melee is
`Bob_AttackPunch{01,02,03}_{Hit,CritHit}.X`** -- six clips. The naming is not
obvious: `Attack1Hand` and `AttackBat` are weapon swings, not fists.

### Import gotcha

`bpy.ops.import_scene.directx_x` requires an **active object in OBJECT mode** or
it fails with `bpy.ops.object.mode_set.poll() Context missing active object` --
and leaves a partial armature behind when it does. Set an active object first.

Each animation `.X` carries **its own armature copy**, so importing a clip beside
the body yields a second rig (`Armature.001`) rather than retargeting onto the
existing one. Retargeting is a manual step.

On Blender 4.4+/5.x `action.fcurves` no longer exists (slotted Actions). Read
curves via `action.layers[].strips[].channelbag(slot).fcurves`.

### Clip rigs have more bones than the skinned body

| Source | Bones |
|--------|-------|
| `MaleBody.x` (skinned mesh rig) | 35 |
| `Bob_AttackPunch01_Hit.X` (clip rig) | 45 |

The extra 10 are Character Studio `Nub` terminators -- `Bip01_HeadNub`,
`Bip01_{L,R}_Finger0Nub`, `Bip01_{L,R}_Finger1Nub`, `Bip01_{L,R}_Toe0Nub`,
`Bip01_BackPackNub`, `Bip01_DressFrontNub`, `Bip01_DressBackNub`. Keyed in clips,
but they carry no skin weights.

`Translation_Data` and both `Bip01_Prop1` / `Bip01_Prop2` are keyed **even in an
unarmed punch**, so a custom clip should key them rather than leave them at rest.

### `MaleBody.x` ships with a walk cycle embedded

Importing the body alone also yields an action `Bob_Walk` (21 frames, 350
fcurves, 35 bones). The mesh file is not animation-free.

### Measured -- `Bob_AttackPunch01_Hit`

31 frames (0..30), 450 fcurves, 45 bones. At 30 fps that is **1.03 s**.

`Bip01_R_Hand`, armature space:

```
frame  0   (-0.144, -0.021, 0.561)   guard / rest
frame  3   (-0.106, -0.192, 0.731)   wind-up -- hand pulls BACK (-Y)
frame  6   (-0.176, +0.099, 0.793)   drive begins, rising
frame  9   (+0.121, +0.378, 0.758)   full extension -- impact window
frame 12   (+0.171, +0.350, 0.746)   peak
frame 30   (-0.144, -0.021, 0.561)   identical to frame 0
```

Phase split is roughly **wind-up 0-6, strike 6-12, recovery 12-30** -- the strike
is ~20% of the clip, recovery ~60%. Frame 30 matches frame 0 exactly, so clips
return to a common rest pose and chain without a seam artefact. Any custom clip
should preserve that invariant.

Hand travel on +Y is ~0.57 BU against a ~0.99 BU character -- a little over half
body height of reach.

### Working files

`PZ_3D_Assets/_vanilla/models_X/Skinned/player_model/MaleBody_imported.blend`
(rig + mesh) and `punch_study.blend` (rig + vanilla punch action, 30 fps,
frame range 0-30).

---

## F-014 -- Animation clips are declared by DIRECTORY, not enumerated; and Blender can export loadable `.X`

**Confidence: CONFIRMED** (`.X` export round-trip, and the vanilla script format)
**/ PRELIMINARY** (whether a mod can extend the scanned directory list -- not yet
tested in-game)

> The `api/` index layer is still PENDING, so the engine reading below is manual
> source reading, not a generated-index lookup.

### Clips are declared as directories

`media/scripts/generated/animations_meshes.txt`:

```
module Base
{
    animationsMesh Human
    {
        meshFile = Skinned/MaleBody,
        animationDirectory = Bob,
        animationDirectory = Kate,
        animationDirectory = Zombie,
    }
}
```

`animationDirectory = Bob` resolves to `media/anims_X/Bob/`. **The engine does
not enumerate individual clips** -- it takes whole directories. So adding a clip
is, in principle, adding a `.X` file to a scanned directory rather than editing
a manifest.

`AnimationsMesh` (`B42/src/zombie/scripting/objects/AnimationsMesh.java:18`) is a
`BaseScriptObject` of `ScriptType.AnimationMesh`, parsing keys `meshFile`,
`animationDirectory` (repeatable, `:41-42`), `animationPrefix` (repeatable,
`:43-44`), `keepMeshAnimations` (`:45`), `postProcess` (`:47`).

It is `@UsedFromLua` (`:17`) and registered via `setExposed(AnimationsMesh.class)`
(`B42/src/zombie/Lua/LuaManager.java:2313`). Lookup is
`ScriptManager.instance.getAnimationsMesh(name)`, reached from `ModelScript`
via its `animationsMesh` field
(`B42/src/zombie/gameStates/AnimationViewerState.java:219`,
`B42/src/zombie/spriteModel/TilesetImageCreator.java:104`).

**The mechanism is data-driven, not hardcoded.** That is the important result:
custom animation does not obviously require a Java patch (L3).

### RESOLVED -- mods ship custom animations as a first-class path

**Capability tier: L0 `LUA_DIRECT` -- data files only. No Java patch, no Lua,
no script changes.**

`ModelManager.loadModAnimations()`
(`B42/src/zombie/core/skinnedmodel/ModelManager.java:1665`, called from `:173`)
walks every loaded mod and, for each `animationsMesh`'s declared
`animationDirectory`, scans that same subfolder **inside the mod**:

```java
// ModelManager.java:1671-1698
List<String> modIDs = ZomboidFileSystem.instance.getModIDs();
for (int i = 0; i < modIDs.size(); i++) {
   ChooseGameInfo.Mod mod = ChooseGameInfo.getAvailableModDetails(modIDs.get(i));
   if (mod != null && (mod.animsXFile.common.absoluteFile.isDirectory()
                    || mod.animsXFile.version.absoluteFile.isDirectory())) {
      ...
      for (AnimationsMesh am2 : animationsMeshes) {
         for (String dir : am2.animationDirectories) {
            File subDir = new File(mod.animsXFile.common.canonicalFile, dir);
            if (subDir.exists()) this.loadAnimsFromDir(..., modAnimations, ...);
            subDir = new File(mod.animsXFile.version.canonicalFile, dir);
            if (subDir.exists()) this.loadAnimsFromDir(..., modAnimations, ...);
```

So a mod does **not** need to declare its own `animationsMesh`. Vanilla's
`Base.Human` already declares `animationDirectory = Bob`, and the loader looks
for `<mod>/media/anims_X/Bob/` for every mod. Dropping a `.X` there is enough.

### Mods override vanilla clips by priority

```java
// ModelManager.java:1667, :1679, :1682
modAnimations.setPriority(modAnimations == this.gameAnimations ? 0 : -1);  // game = 0
modAnimations.setPriority(i + 1);                                          // mods = 1..n

// ModelManager.java:1734 -- the resolution rule
if (existing == null || existing == animationAsset
    || existing.modAnimations.priority <= modAnimations.priority) {
   this.animationAssets.put(animationAsset.modelManagerKey, animationAsset);
```

Game animations sit at priority **0**; each mod gets **load-order index + 1**.
Higher priority wins, so **a mod file named identically to a vanilla clip
replaces it**, and a later-loading mod beats an earlier one.

Replacing the unarmed punches is therefore just:

```
<mod>/common/media/anims_X/Bob/Bob_AttackPunch01_Hit.X
<mod>/common/media/anims_X/Bob/Bob_AttackPunch02_Hit.X
```

No script, no `spriteModels.txt`, no Lua. The engine's existing clip cycling
(F-013: 01=RIGHT, 02=LEFT, 03=RIGHT) then drives them.

### Contrast with F-007 -- BOTH mod folders are scanned here

`spriteModels.txt` is read only from `<mod>/common/media` and silently no-ops in
the version folder (F-007). **Animations are different:** `:1668` accepts either
`mod.animsXFile.common` or `mod.animsXFile.version`, and `:1680`/`:1687` scan
both. Do not carry the F-007 path gotcha over to animation work.

### Blender `.X` export works

`io_directx_x` (F-012) exports as well as imports. `bpy.ops.export_scene.directx_x`
produced a structurally sound file from the rig + punch action:

| Block | Vanilla `Bob_AttackPunch01_Hit.X` | Exported |
|-------|-----------------------------------|----------|
| header | `xof 0303txt 0032` | `xof 0303txt 0032` |
| `Frame` | 47 | 39 |
| `SkinWeights` | 31 | 45 |
| `AnimationSet` | 2 | 2 |
| `AnimationKey` | 136 | 106 |
| `FrameTransformMatrix` | 47 | 39 |

Round-trip re-import returns 35 bones, 350 fcurves, and preserves the animation
(root translation `y -0.024 -> +0.083`, `z` constant). Bone count is 35 rather
than vanilla's 45 because the authoring rig lacks the `Nub` terminators (F-013);
whether PZ requires them is untested.

**Two exporter defects:**

- **Frame 0 is dropped.** A 31-frame clip (0..30) returns as 1..30. This breaks
  the frame-0-equals-frame-30 chaining invariant (F-013). Author from frame 1,
  or offset keys before export.
- **Selection is ignored.** Exporting "armature + one mesh" produced a
  byte-identical file to exporting the whole scene. Hide or delete what should
  not be exported; do not rely on selection.

### Import-context gotcha (supersedes part of F-013)

`bpy.ops.import_scene.directx_x` can fail with
`bpy.ops.object.mode_set.poll() Context missing active object` **even with a
valid active object**, leaving a 0-bone armature behind. It is intermittent and
tied to importing immediately after `bpy.ops.wm.open_mainfile`. A second attempt
in the same session succeeds. **Do not diagnose a file as malformed on a single
failed import** -- re-run it first. A control test importing a known-good vanilla
clip is the fastest way to tell file problems from context problems.

---

## F-015 -- A bare-handed attack cannot damage anything, and the suppression is three gates deep

**Confidence: CONFIRMED** (chain read end to end, and verified identical in B41)

> The `api/` index layer is still PENDING, so this is manual source reading.

The community belief that "you cannot punch in Project Zomboid" is correct, and
the reason is more deliberate than it looks. A standing bare-handed attack
applies **exactly zero** health damage. Not a small number: zero.

### The chain

**1. Bare hands are forced into the shove branch.**

```java
// CombatManager.java:1362
} else if ((vars.getWeapon(owner) == owner.bareHands || vars.doShove)
           && !((IsoPlayer)owner).isAttackType(AttackType.CHARGE)) {
   vars.doShove = true;
```

The `AttackType.CHARGE` escape is unreachable for fists.
`WeaponType.UNARMED` declares `AttackType.NONE` as its **only** possible attack
(`WeaponType.java:19`), and the attack type is re-rolled from the weapon type at
`CombatManager.java:3173` -- seven lines before `calculateAttackVars` reads it at
`:3180`, with no Lua event in between. Vanilla produces `CHARGE` in exactly one
place, a sprinting spear collision (`IsoMovingObject.java:1238`).

**2. A shoving player has damage switched off.**

```java
// IsoGameCharacter.java:6086
if (wielder instanceof IsoPlayer player && player.isDoShove() && !wielder.isAimAtFloor()) {
   bIgnoreDamage = true;
   modDelta *= 1.5F;
}
```

**3. Health is only touched when that flag is false.**

```java
// IsoGameCharacter.java:6218, in hitConsequences
if (!bIgnoreDamage) {
   damage = CombatManager.getInstance().applyGlobalDamageReductionMultipliers(weapon, damage);
   CombatManager.getInstance().applyDamage(this, damage);
}
```

The `!wielder.isAimAtFloor()` in gate 2 is why **stomping a downed zombie kills
it but punching a standing one never will** -- a stomp is also a shove, but it
skips the suppression, and `CombatManager.java:1045` then overrides the damage to
`Rand.Next(0.7, 1.0) + Strength * 0.2` scaled by the shoes' `getStompPower()`.

`Base.BareHands` does declare `MinDamage 0.2 / MaxDamage 0.4`
(`media/scripts/generated/items/weapon.txt:14257`). Those numbers are unreachable
on the player attack path.

**Identical in B41.** `B41/src/characters/IsoGameCharacter.java:4559` carries the
same gate using the public `bDoShove` field rather than the accessor. This is not
a B42 regression.

### Three ways past it, and what each costs

**Capability tier: L0 `LUA_DIRECT` for all three.**

| route | mechanism | cost |
|-------|-----------|------|
| A. equip a real `HandWeapon` | satisfies `leftHandItem != this.bareHands` at `IsoLivingCharacter.java:51`, so nothing forces `doShove` | an equipped item not in the inventory can escape: `ISDropWorldItemAction` calls `getInventory():Remove()` (a no-op for a non-member) then `sq:AddWorldInventoryItem()`, materialising a phantom weapon on the floor. `getPrimaryHandItem()` is read all over vanilla and by other mods, so the escape paths cannot be audited |
| B. call `Hit()` directly | `IsoGameCharacter.Hit(weapon, wielder, dmg, false, delta)` with `bIgnoreDamage = false` runs the full pipeline | needs your own attack trigger, targeting and animation, because of the corollary below. This is what Brutal Handwork (workshop `2934621024`) does |
| C. hook `OnWeaponHitCharacter` | the event fires at `IsoGameCharacter.java:6091` **during** a shove, after `bIgnoreDamage` is set but before `processHitDamage` (`:6112`) and `hitConsequences` (`:6113`). Call `applyDamage()` (`:16152`) in that window | none structurally. Vanilla keeps doing targeting, arc, range, multi-hit, knockback, melee delay and multiplayer sync |

Route C also gets the kill handling free: `isDead()` is health-based
(`IsoGameCharacter.java:4920`), so a target taken to zero is already dead when
`hitConsequences` runs and the engine performs the death, kill credit and
animation itself.

Route C in multiplayer was written for Build 42.20 and has not been re-checked on
42.21, because 42.21 changed the client side of a hit: a client now sends its
hits in one packet per target, and a zombie the client does not own gets
`hitConsequences` with damage switched off (`IsoZombie#hitConsequences`). Whether
an `applyDamage()` call made in the event on a client still reaches that zombie
needs a test on a dedicated server.

### Corollary 1 -- `Hook.Attack` never fires unarmed

```java
// IsoLivingCharacter.java:44-55
if (this.leftHandItem instanceof HandWeapon hw) { leftHandItem = hw; }
else { leftHandItem = this.bareHands; }

if (leftHandItem != this.bareHands && this instanceof IsoPlayer) {
   if (LuaHookManager.TriggerHook("Attack", this, chargeDelta, leftHandItem)) { return false; }
}
```

Empty hands substitute `bareHands`, so the hook is skipped. **Identical in B41**
(`B41/src/characters/IsoLivingCharacter.java:42`). Any mod wanting to intercept an
unarmed swing must use `OnMouseDown` / `OnKeyPressed` and call its own logic --
which is exactly why Brutal Handwork does, and it is a workaround rather than a
choice.

### Corollary 2 -- unarmed can never earn weapon skill

```java
// IsoGameCharacter.java:11136
if (weaponType != null && weaponType != WeaponType.UNARMED && weapon != null) {
   ... per-WeaponCategory perk lookups ...
}
...
return level == -1 ? 0 : level;   // :11166
```

`WeaponType.UNARMED` is structurally excluded and the lookup reads
`WeaponCategory` off the primary hand item, so **an unarmed character is weapon
level 0 permanently** and no custom perk can feed it.
`applyWeaponLevelDamageModifier` (`CombatManager.java:3833`) therefore always
applies `BASE_WEAPON_DAMAGE_MULTIPLIER` alone.

**Consequence for any unarmed-combat mod:** a custom fist skill must apply its
own damage multiplier. It cannot join the engine's weapon-level curve.

### Corollary 3 -- the melee damage constants are NOT sandbox settings

`CombatConfig` is built purely from defaults, with no file, sandbox or
persistence layer:

```java
// CombatConfig.java:19-23
public CombatConfig() {
   for (CombatConfigKey k : CombatConfigKey.values()) {
      this.values.put(k, k.getDefaultValue());
   }
}
```

`set()` exists for runtime change (a debug panel), and the class is
`@UsedFromLua` (`:15`), but nothing loads player-facing configuration into it.
Relevant defaults from `CombatConfigKey.java`:

| key | default | line |
|-----|---------|------|
| `BASE_WEAPON_DAMAGE_MULTIPLIER` | 0.3 | :14 |
| `WEAPON_LEVEL_DAMAGE_MULTIPLIER_INCREMENT` | 0.1 | :15 |
| `PLAYER_RECEIVED_DAMAGE_MULTIPLIER` | 0.4 | :16 |
| `NON_PLAYER_RECEIVED_DAMAGE_MULTIPLIER` | 1.5 | :17 |
| `GLOBAL_MELEE_DAMAGE_REDUCTION_MULTIPLIER` | 0.15 | :64 |

So vanilla melee reaching health is roughly
`declared x 2 (first-target split, CombatManager.java:1009) x 1.5 x (0.3 + level x 0.1) x 0.15`,
i.e. **declared x 0.135 at weapon level 0** and **x 0.585 at level 10**. Melee is
far more skill-gated than the declared item numbers suggest, and a mod applying
damage directly is not comparable to those numbers without this correction.

**Sandbox difficulty still applies through zombie health**
(`IsoZombie.java:4442-4456`: 3.5 tough / 1.8 normal / 0.5 fragile / a random
0.5 to 3.5, each `+ Rand(0, 0.3)`), which any direct-damage approach gets for
free. The sandbox option is `ZombieLore.Toughness` (values 1 to 4, default 2,
normal).

> **Proof:** Code. `zombie.characters.IsoZombie` (health set from `SandboxOptions.instance.lore.toughness`, values 1 to 4); `zombie.SandboxOptions` (`newEnumOption("ZombieLore.Toughness", 4, 2)`). Build 42.21.0 (revision 4a0e9546ec).

---

## F-016 -- AnimSet nodes: how mods add them, how one wins, and what `m_AnimName` actually resolves against

**Confidence: CONFIRMED** (traced end to end, and validated in game)

F-014 covers animation **clips** in `anims_X`. This covers the separate
`AnimSets` subsystem: the XML state machine that decides which clip plays.

**Capability tier: L0 `LUA_DIRECT` -- data files only.**

### A mod adds nodes by dropping XML into an existing state folder

`AnimationSet.Load` enumerates state directories, then `AnimState.Parse`
enumerates the node files inside:

```java
// AnimationSet.java:58
String[] listOfDirs = ZomboidFileSystem.instance.resolveAllDirectories("media/AnimSets/" + name, dir -> true, false);
...
this.states.put(stateName.toLowerCase(Locale.ENGLISH), newState);   // put, not merge

// AnimState.java:79
String[] listOfNodeFiles = ZomboidFileSystem.instance.resolveAllFiles(statePath, f -> f.getName().endsWith(".xml"), true);
```

Both resolvers use `walkGameAndModFiles`, which walks the base game and then
**every mod's `common` and `version` directory**
(`ZomboidFileSystem.java:1209-1220`), deduplicating by **relative** path
(`:1243`).

Two consequences that matter:

- **A uniquely-named file is additive.** Dropping `MyMod_Foo.xml` into
  `AnimSets/player/shove/` adds a node to vanilla's state.
- **A file named like a vanilla one is SKIPPED, not preferred.** The base game is
  walked first and `result.contains()` rejects the duplicate relative path. This
  is the opposite of the clip-asset rule in F-014, where a mod file of the same
  name *replaces* vanilla by priority. **Do not carry F-014's intuition here.**

Both `common/media/AnimSets` and `<version>/media/AnimSets` are registered
(`ChooseGameInfo.java:514`) and both are walked.

### Which node wins

`AnimState.addNode` keeps nodes sorted, and `getNodes` takes the first whose
conditions pass:

```java
// AnimNode.java:365
public static int compareSelectionConditions(AnimNode a, AnimNode b) {
   if (a.isAbstract() != b.isAbstract()) return a.isAbstract() ? -1 : 1;
   else if (a.conditionPriority < b.conditionPriority) return -1;
   else if (a.conditionPriority > b.conditionPriority) return 1;
   else if (a.conditions.length < b.conditions.length) return -1;
   else return a.conditions.length > b.conditions.length ? 1 : 0;
}
```

Ranking is: abstract, then `m_ConditionPriority` (default **0**,
`AnimNode.java:46`), then **number of conditions**. Vanilla shove nodes declare
no `m_ConditionPriority`, so **declaring `1` beats all of them outright** without
relying on a condition-count tiebreak.

### `m_AnimName` resolves against the name INSIDE the asset

This is the trap. The clip is keyed by the Assimp animation name, not the
filename:

```java
// ImportedSkeleton.java:343-352
String animName = srcAnim.getName();
...
this.clips.put(animName, clip);
```

Which for each container is:

| format | source of the name |
|--------|--------------------|
| `.x` | the `AnimationSet <name> {` block |
| `.glb` / `.gltf` | `animations[].name`, which in Blender is the **Action** name |
| `.fbx` | the AnimStack name |

**Real-world proof:** Fancy Handwork (workshop `2904920097`) ships
`Bob_FH_AddToPan_Griddle.x` declaring `AnimationSet Bob_FH_AddToGriddlePan`, and
its `AddToRecipe_Griddle.xml` references `Bob_FH_AddToGriddlePan` -- the internal
name. Convention across three shipped mods is to keep them equal (Brutal Handwork
7/7, Fancy Handwork 31/32, Horse Mod 55/55), but it is **not enforced**, and a
Blender export can silently leave a name like `_tmp`. The node then never plays,
with no error anywhere.

`ModelManager.instance:getAnimationClip(name)` (`ModelManager.java:111`, `:1613`)
is the direct check.

### `x_extends` does not cross the mod boundary reliably

`PZXmlUtil.parseXml` resolves it with `resolveRelativePath` against **the
declaring file's own folder** (`PZXmlUtil.java:70`). A mod node extending
`ShoveDefault.xml` therefore looks inside the mod's directory. A failed parse
yields a not-ready asset that `AnimState.Parse` **silently skips**
(`AnimState.java:87`). Prefer self-contained mod nodes.

### glTF and FBX are accepted, at 100x the `.x` scale

`FileTask_LoadAnimation` (`:29`) roots at `media/anims` and `media/anims_x`, and
the probe order for an extensionless name is `.fbx`, `.glb`, `.x`, then
`media/anims/<name>.txt` (`FileTask_AbstractLoadModel.java:96-125`) -- **FBX
first**. `loadFBX()` and `loadGLTF()` apply `animBonesScaleModifier = 0.01F` and a
-90 degree X rotation that `loadX()` does not.

Measured on Horse Mod (workshop `3661336777`), which ships **55 `.glb` clips for
the Bob rig**: bone offset magnitudes run median 10.0, max 51.0, against
sub-unit values in `.x` space. So glTF is authored at roughly **100x** `.x`
scale and the engine divides it back. glTF is the better authoring path -- Blender
ships the exporter, there is no frame-0 drop (F-014), and the clip name comes
from the Action name automatically.

### Animation states are finer-grained than they look

The engine keeps `shove` and `shoveAim` as **separate states** and consults
exactly one per swing: `shove` for a plain attack press, `shoveAim` while aiming.
Overriding one leaves the other on vanilla. `shoveAim/ShoveAim.xml` is
additionally a 2D blend over `ShoveAimX` / `ShoveAimY`, and its base emits
`FlagWhileAlive ShoveAnim` where `shove/ShoveDefault.xml` emits paired
`ShoveAnim` TRUE/FALSE events. Copy events from the state you are actually
overriding.

`AttackCollisionCheck` at `m_TimePc 0.15` is the event that drives the hit, by
calling `CombatManager.attackCollisionCheck` (`:658`). Dropping it gives an
animation that connects with nothing.

### `m_SpeedScale` accepts a variable name

```java
// AnimNode.java:289
public float getSpeedScale(IAnimationVariableSource varSource) {
   return this.speedScaleF != Float.POSITIVE_INFINITY
      ? this.speedScaleF
      : varSource.getVariableFloat(this.speedScale, 1.0F);
}
```

The field is a `String` (`:142`). If it does not parse as a float the string is
read as an **animation variable name**, per character, per swing. So playback
speed can be driven from Lua -- the basis for skill-scaled or fatigue-scaled
animation. `m_SpeedScaleRandomMultiplierMin` / `Max` (`:150-154`) additionally
give free per-swing variation.

### Reloading without a restart

`AnimationSet` caches states in `setMap`, and a Lua reload does not touch them.
`LuaManager.GlobalObject.refreshAnimSets(true)` (`LuaManager.java:6079`) resets
the set, reloads every `AnimNodeAsset` and pushes the change into live
characters; it is what `AdvancedAnimator.checkModifiedFiles` (`:151`) calls.

**PRELIMINARY:** no vanilla Lua calls `refreshAnimSets`, so its Lua exposure is
inferred from its presence on `LuaManager.GlobalObject` rather than proven.

There is a hot-reload file watcher (`AdvancedAnimator.java:73`), but its predicate
compares paths against `mod.animSetsFile.*.canonicalFile` (`:92`, `:100`). Java
resolves a junction to its real target, so **a dev setup that symlinks or
junctions the mod folder may never trigger it** -- the watcher holds the real
path while watching the linked one.

*Updated 2026-10-04 for Build 42.21: engine line numbers moved to 42.21; F-008 corrected (Java does fire `OnFillContainer` and `OnContainerUpdate`); F-015 route C marked unchecked in multiplayer on 42.21.*

*Updated 2026-10-04: F-001 and F-006 give the class count for both builds (3,335 on 42.20, 3,352 on 42.21); F-015 names the toughness option, `ZombieLore.Toughness`, and its random setting.*
