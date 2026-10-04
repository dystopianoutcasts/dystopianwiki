---
id: build-42-the-entity-component-system
slug: the-entity-component-system
title: 'The Build 42 entity component system: GameEntity, components and the engine'
game: pz
version: build-42
section: modding
category: engine
difficulty: advanced
tags:
  - engine
  - entities
  - crafting
  - fluids
  - multiplayer
excerpt: >-
  Build 42 bolted a small entity component system onto the old object classes.
  Crafting benches, drying racks and every fluid container are made of its
  components. What a GameEntity is, the 23 fixed component types, when
  the engine ticks them and on which side, how machines keep working while
  nobody is near, and the traps in the code.
last_updated: '2026-10-04'
related_articles:
  - the-workstation-entity-system
  - fluids-for-modders-start-here
  - handcraft-from-lua-what-the-server-does
  - lua-classes-entities
---
# The Build 42 entity component system: GameEntity, components and the engine

Outcast, if you have written a workstation, a fluid container or a crafting machine for Build 42, you have used this system without seeing it: the `component` blocks in your scripts become Java objects hung on a world object or an item, and a small engine ticks some of them. Knowing how it works tells you why your rain barrel fills while you are away, why your machine's recipe gets no player, and why you cannot invent a new kind of component. This page is read from the 42.21 code.

## What it does for the player

The stone mill that opens its own crafting window, the herb and leather drying racks that finish their work over time, the rain barrel that keeps filling while you are on the other side of the map, the water in your bottle: each is an ordinary object or item carrying components. Only one player can use a bench at a time; walk away and it frees up.

## Where it lives

| Piece | Where | What it is |
|---|---|---|
| `GameEntity` | `zombie.entity.GameEntity` | The new base class. `IsoObject`, `InventoryItem`, `VehiclePart` and `MetaEntity` all extend it, so every world object and every item can carry components |
| `Component`, `ComponentType` | `zombie.entity.Component`, `zombie.entity.ComponentType` (enum) | One component per type per entity; the types are a fixed Java enum |
| The engine | `zombie.entity.Engine`, `EngineSystem`, `Family`, `EntityBucket` | Systems that each tick a bucket of entities with given components |
| The registry | `zombie.entity.GameEntityManager` | Ids, the engine, meta entities and their save file |
| Creation | `zombie.entity.GameEntityFactory` | Builds components from scripts; add, remove and transfer helpers |
| Networking | `zombie.entity.GameEntityNetwork`, `GameEntity#sendSyncEntity` | Entity packets between server and clients |
| Off-screen work | `zombie.entity.MetaEntity` | Holds the components of an unloaded object so they keep working |

> **Proof:** Code. `zombie.entity.GameEntity` (abstract; `getGameEntityType`, `getEntityNetID`), and `zombie.iso.IsoObject`, `zombie.inventory.InventoryItem`, `zombie.vehicles.VehiclePart`, `zombie.entity.MetaEntity` all `extends GameEntity`; `zombie.entity.ComponentType` (enum); `zombie.entity.Engine`, `zombie.entity.GameEntityManager`, `zombie.entity.GameEntityFactory`, `zombie.entity.GameEntityNetwork`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The 23 component types

`ComponentType` is an enum, so this list is the whole list. "Ticked" means a system updates it; "keeps working unloaded" means it may move into a meta entity when its object unloads (below).

| Component | What it is for | Ticked | Keeps working unloaded |
|---|---|---|---|
| `FluidContainer` | Fluids in an item or object; rain catching | Yes (rain, and petrol evaporating from rain catchers) | Yes, if it catches rain |
| `CraftBench` | The recipe tags a bench offers | No | No |
| `CraftLogic`, `DryingCraftLogic` | A machine that runs recipes by itself over time | Yes | Yes |
| `FurnaceLogic`, `MashingLogic` | Furnace and mashing machines | Yes | Yes |
| `DryingLogic` | An older drying machine | **No**: its system class exists but is never added to the engine | Flagged, but nothing ticks it |
| `Resources` | The input and output slots a machine works from | Yes | Yes |
| `CraftRecipe` | A recipe carried by an entity | No | No |
| `UiConfig`, `ContextMenuConfig` | Which window and context menu entries it gets | No | No |
| `SpriteConfig`, `SpriteOverlayConfig`, `WallCoveringConfig` | Multi-tile sprites, overlays, wall coverings | No | No |
| `CraftBenchSounds` | Bench sounds | No | No |
| `Durability` | A durability value | No | No |
| `Attributes` | Typed attribute values | No | No |
| `Parts`, `Signals`, `TestComponent` | Present in the enum; no vanilla system ticks them | No | No |
| `Lua` | **An empty shell** (see the traps) | No | No |
| `Script`, `MetaTag` | Internal: the script an entity came from; the pointer from an unloaded object to its meta entity | No | No |

The machine components (`CraftLogic` and the rest) and `FluidContainer`, `SpriteConfig` and `MetaTag` only count as valid on a world object or a meta entity; on an item, the systems skip them.

What vanilla actually uses is a smaller list. Across every 42.21 script file, the `component` blocks are `UiConfig` (215), `SpriteConfig` (210), `CraftRecipe` (202), `FluidContainer` (144), `CraftBench` (35), `ContextMenuConfig` (15), `CraftBenchSounds` (9), `WallCoveringConfig` (8), `SpriteOverlayConfig` (8), `Resources` (7), `DryingCraftLogic` (7) and `Durability` (5). No vanilla script uses `CraftLogic`, `FurnaceLogic`, `MashingLogic` or `Lua`: the only self-running machines in 42.21 are the seven `DryingCraftLogic` entities (the plain and simple drying racks, the plain and simple herb drying racks, and the large, medium and small leather drying racks). If you build on the other machine components, you are on code paths vanilla content does not exercise.

> **Proof:** Code. `zombie.entity.ComponentType` (23 named values plus `Undefined`; flag 2 "run in meta" on `FluidContainer`, flags 3 on `CraftLogic`, `FurnaceLogic`, `MashingLogic`, `DryingLogic`, `Resources`, `DryingCraftLogic`; valid owner types `IsoObject` and `MetaEntity` for those and for `SpriteConfig`, `SpriteOverlayConfig`, `MetaTag`); `zombie.entity.Component#isValid` (owner type check); `zombie.entity.GameEntityManager#Init` (the ten systems; `DryingLogicSystem` is not among them and has no caller of its constructor; the vanilla drying racks use `DryingCraftLogic`, ticked by `CraftLogicSystem`); `zombie.entity.components.fluids.FluidContainerUpdateSystem#updateEntity` (petrol loss and rain), `zombie.entity.components.fluids.FluidContainer#isQualifiesForMetaStorage` (`getRainCatcher() > 0.0F`); the counts are a search of every `component <Type>` line in the installed game's `media/scripts`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How an entity gets its components

- **A world object** gets them when its tile has the `EntityScript` property (the components come from the named `entity` script), or when it is a moveable whose `CustomItem` item script has components. `GameEntityFactory.CreateIsoEntityFromCellLoading` does this as the chunk loads.
- **An item** gets the components in its item script (`component FluidContainer { ... }` and the like) when it is created (`GameEntityFactory.CreateInventoryItemEntity`).
- **From Lua**, `GameEntityFactory.AddComponent(entity, component)` adds one made with `ComponentType.X:CreateComponent()`, and `RemoveComponentType`, `TransferComponent` and `TransferComponents` do the rest. Transfers refuse multi-tile objects.

Each built entity also gets a hidden `Script` component recording which script it came from.

> **Proof:** Code. `zombie.entity.GameEntityFactory#CreateIsoEntityFromCellLoading` (`IsoFlagType.EntityScript` with `EntityScriptName`, or `IsMoveAble` plus `CustomItem`), `#CreateInventoryItemEntity` (only when the item script `hasComponents()`), `#createEntity` (adds `EntityScriptInfo` as `ComponentType.Script`), `#AddComponent`, `#TransferComponents` ("Cannot transfer components for multi-square objects"). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When the engine runs, and on which side

`IngameState` calls `GameEntityManager#Update` once per frame. It does two things:

1. **Every frame:** the updater systems. `UsingPlayerUpdateSystem` frees a bench when its user is more than 10 tiles away on either axis, on another floor, or dead. `InventoryItemSystem` drops items from the engine once they are no longer equipped. `MashingLogicSystem` runs mashing.
2. **Simulation ticks:** one tick per 100 milliseconds of game-scaled time, each worth 2.4 game seconds, run on everything **except a multiplayer client** (the tick count is forced to 0 there). The crafting machines (`CraftLogicSystem`), furnaces, fluids, logistics and resources systems run here.

What is in the engine at all:

- **World objects** join when added to the world and leave when removed.
- **Items** join only while **equipped** (held or worn) and leave when unequipped. A bottle in a bag is not ticked; its components are plain data until some code calls them.
- **On a multiplayer client**, entities are only indexed by id. They are never added to the client's engine, so no system touches them there. The server pushes changes with `sendSyncEntity` (and a client asks for a fresh copy when an object comes back from a meta entity).

So in multiplayer **every machine, every rain catcher and the check that frees a bench whose user walked away run on the server**, and the client only shows what the server sends.

> **Proof:** Code. `zombie.gameStates.IngameState` (`GameEntityManager.Update()` each update); `zombie.entity.GameEntityManager#Update` (`int simulationTicks = GameClient.client ? 0 : EntitySimulation.getSimulationTicksThisFrame()`), `#RegisterEntity` (on a client: id map and `sendRequestSyncGameEntity`, no `engine.addEntity`), `zombie.entity.GameEntity#sendRequestSyncGameEntity` (only when the entity has a `MetaTag` component); `zombie.entity.EntitySimulation` (`MILLIS_PER_TICK` 100, `getGameSecondsPerTick` 2.4, time from `GameTime#getTimeDelta`); each system's `EngineSystem` constructor (updater or simulation updater); `zombie.entity.UsingPlayerUpdateSystem#update` (10 tiles, floor, death; `!GameClient.client`); `zombie.entity.InventoryItemSystem#update`; `zombie.entity.GameEntity#onEquip`, `#onUnEquip`, `#addToWorld`; `zombie.inventory.InventoryItem#setEquipParent`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How machines keep working when nobody is near

When a chunk unloads, each world object with components leaves the engine. If it has any component that may "run in meta" and that currently qualifies (a crafting machine always does; a fluid container only if it catches rain), `GameEntityManager#UnregisterEntity` moves **all** its components into a new `MetaEntity`, registers that in its place, and leaves a `MetaTag` component on the object pointing to it. The meta entity keeps being ticked by the simulation, so the machine finishes its batch and the barrel keeps filling. When the chunk loads again, `RegisterEntity` finds the `MetaTag`, moves the components back onto the object and drops the meta entity.

Components normally save with the object or item that owns them, each in its own length-prefixed block. Meta entities save separately, in `entity_data.bin` inside the save folder.

> **Proof:** Code. `zombie.entity.GameEntityManager#UnregisterEntity(GameEntity, boolean)` (`offloadToMeta`, `ComponentType.bitsRunInMeta`, `isQualifiesForMetaStorage`, `MetaEntity.alloc`, `MetaTagComponent#setStoredID`), `#RegisterEntity` (the `MetaTag` path moves components back and unregisters the meta entity), `#Save` and the `entity_data.bin` cache file; `zombie.entity.Component#isQualifiesForMetaStorage` (default true); `zombie.entity.GameEntity#saveEntity` (each component inside a `ByteBlock`); `zombie.iso.IsoObject` and `zombie.inventory.InventoryItem` call `saveEntity` when `requiresEntitySave()`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) on any object or item: `hasComponent(ComponentType.X)`, `getComponent(ComponentType.X)`, `getComponentAny`, `componentSize`, `getFluidContainer`, `getEntityScript`, `getUsingPlayer`, `isMeta`, `getEntityNetID`, and `sendSyncEntity(nil)`.
- [ComponentType](/pz/build-42/modding/reference/lua-classes-entities#componenttype): the values, `CreateComponent()`, `GetList()`, `isRunInMeta()`.
- [GameEntityFactory](/pz/build-42/modding/reference/lua-classes-entities#gameentityfactory): `AddComponent`, `RemoveComponentType`, `TransferComponent`, `TransferComponents`.
- The component classes themselves: [FluidContainer](/pz/build-42/modding/reference/lua-classes-entities#fluidcontainer), [CraftBench](/pz/build-42/modding/reference/lua-classes-entities#craftbench), [CraftLogic](/pz/build-42/modding/reference/lua-classes-entities#craftlogic), [Resources](/pz/build-42/modding/reference/lua-classes-entities#resources) and the rest, all on the [entities reference page](/pz/build-42/modding/reference/lua-classes-entities).
- A recipe's Lua hooks `OnStart`, `OnUpdate`, `OnCreate` and `OnFailed`, which a crafting machine calls from its simulation tick.

## What a mod can and cannot change, and the traps

- **You cannot add a component type.** `ComponentType` is a Java enum. A mod works with the 23 that exist.
- **The `Lua` component does nothing.** In 42.21 `LuaComponent` has no fields and its script has no keys; the `LuaCall` names inside it (`OnStart`, `OnUpdate` and so on) are used nowhere. Hooks belong on the recipe, not on a `component Lua` block.
- **A machine's recipe hooks get no player.** `CraftLogicSystem` calls a recipe's `OnStart` and `OnCreate` with the character argument `nil`, even when a player pressed start. Write those functions so they work without one.
- **`StartMode = Automatic` on a `CraftLogic` looks broken.** The automatic start passes no player, and `CraftLogicSystem#start` then reads that player's craft history with no check for `nil`, after the inputs were already consumed. All seven vanilla machines in 42.21 use `Manual`. If you try `Automatic`, test it and watch the log.
- **Add components on the server, then sync.** On a multiplayer server, add or change a component, then call `entity:sendSyncEntity(nil)`. The client's copy then takes the server's full list: components the server sent are created or updated, and any component the server did not send is removed from the client's copy.
- **Use `DryingCraftLogic`, not `DryingLogic`.** Nothing ticks a `DryingLogic` component in 42.21; every vanilla drying entity uses `DryingCraftLogic`.
- **Items only tick while equipped.** Do not expect a component on an item in a bag to be updated by a system.

> **Proof:** Code. `zombie.entity.ComponentType` (enum); `zombie.entity.components.lua.LuaComponent` and `zombie.scripting.entity.components.lua.LuaComponentScript` (no fields, no keys; `LuaComponent.LuaCall` has no references in the 42.21 source); `zombie.entity.components.crafting.CraftLogicSystem#start` (`pendingCraftData.luaCallOnStart()` with no character; `player.getPlayerCraftHistory()` with no null check, bytecode confirms; `consumeInputs` before it), `#stop` (`luaCallOnCreate()` with no character); `zombie.entity.components.crafting.recipe.CraftRecipeData#luaCallOnStart(IsoGameCharacter)` and `#luaCallOnCreate(IsoGameCharacter)` (pass the character through); `zombie.scripting.entity.components.crafting.CraftLogicScript` (`startMode`); vanilla `StartMode = Manual` on all seven lines in `media/scripts` that set it; `zombie.entity.GameEntity#sendSyncEntity` (`GameServer.server` only) and `#receiveSyncEntity` (creates missing components, removes unsent ones). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

The `Automatic` trap is read from the code; no machine we know of uses it. The test: a test entity with `CraftLogic` set to `StartMode = Automatic` and a one-input recipe, inputs loaded in single player; by the code the log shows a `NullPointerException` from `CraftLogicSystem.start` and the inputs disappear.

> **Proof:** Unknown. The automatic-start failure is inferred from `CraftLogicSystem#start`; no game test yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system): the script side of benches.
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here): the biggest component, in depth.
- [Crafting and timed actions from Lua: what the server really does](/pz/build-42/modding/crafting/handcraft-from-lua-what-the-server-does).
