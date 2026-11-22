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
  Build 42.22 hangs components on world objects and items. What a GameEntity is, the 23 component types, when the engine ticks them and on which side, how machines run unloaded, and the traps.
last_updated: '2026-11-22'
related_articles:
  - the-workstation-entity-system
  - fluids-for-modders-start-here
  - handcraft-from-lua-what-the-server-does
  - lua-classes-entities
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

Outcast, if you have written a workstation, a fluid container or a crafting machine for Build 42, you have used this system without seeing it: the `component` blocks in your scripts become Java objects hung on a world object or an item, and a small engine ticks some of them. Knowing how it works tells you why your rain barrel fills while you are away, why your machine's recipe gets no player, and why you cannot invent a new kind of component.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [modders](#3-the-23-component-types) | [server owners](#5-when-the-engine-runs-and-on-which-side)

:::callout[The 1-minute version]{kind=key}
- Every world object, inventory item and vehicle part is a `GameEntity`, so each can carry components. The component types are a fixed Java enum of 23, and a mod cannot add one.
- The engine ticks machines, fluid containers and resources 10 times per real second at normal speed, on the server and in single player but not on a multiplayer client. Items are only in the engine while equipped.
- A rain barrel and a crafting machine keep working when their chunk unloads, because their components move into a meta entity.
- A machine's recipe hooks `OnStart` and `OnCreate` get no player, and the `Lua` component does nothing.
- Vanilla uses 12 component types in its scripts. The only self-running machines are 7 drying entities.
:::

:::facts
- **Component types** 23, and `Undefined` :cite[(`ComponentType.java:68-93`)]
- **Engine systems** 10, added at world start :cite[(`GameEntityManager.java:81-90`)]
- **Simulation tick** 0.1 s of game-time delta, about 10 per real second at normal speed, each worth 2.4 game seconds :cite[(`EntitySimulation.java:13-14`, `EntitySimulation.java:35-48`)]
- **Bench frees itself** when the user is more than 10 tiles away on either axis :cite[(`UsingPlayerUpdateSystem.java:36-42`)]
- **Package size** 153 Java files in `zombie/entity` at 42.22
:::

## 1. What it does for the player

**Benches, drying racks and fluid containers are ordinary objects or items that carry components.** The stone mill opens its own crafting window, the herb and leather drying racks finish their work over time, the rain barrel keeps filling while you are on the other side of the map, and the water in your bottle is a component too. Only one player can use a bench at a time; walk away and it frees up :cite[(`UsingPlayerUpdateSystem.java:27-42`)].

## 2. Where it lives

**`GameEntity` is the new base class, and the engine, registry and network code sit around it.**

| Piece | Where | What it is | Code |
|---|---|---|---|
| `GameEntity` | `zombie.entity.GameEntity` | The new base class. `IsoObject`, `InventoryItem`, `VehiclePart` and `MetaEntity` all extend it, so every world object and every item can carry components | `GameEntity.java:55`, `IsoObject.java:181`, `InventoryItem.java:131`, `VehiclePart.java:44`, `MetaEntity.java:20` |
| `Component`, `ComponentType` | `zombie.entity.Component`, `zombie.entity.ComponentType` (enum) | One component per type per entity; the types are a fixed Java enum | `ComponentType.java:68-93` |
| The engine | `zombie.entity.Engine`, `EngineSystem`, `Family`, `EntityBucket` | Systems that each tick a bucket of entities with given components | `GameEntityManager.java:81-90` |
| The registry | `zombie.entity.GameEntityManager` | Ids, the engine, meta entities and their save file | `GameEntityManager.java:36-49` |
| Creation | `zombie.entity.GameEntityFactory` | Builds components from scripts; add, remove and transfer helpers | `GameEntityFactory.java:90-277` |
| Networking | `zombie.entity.GameEntityNetwork`, `GameEntity#sendSyncEntity` | Entity packets between server and clients | `GameEntity.java:666-757` |
| Off-screen work | `zombie.entity.MetaEntity` | Holds the components of an unloaded object so they keep working | `GameEntityManager.java:242-301` |

The package holds 153 Java files at 42.22, down from 156 at 42.21 because three sort helper classes were removed. It has no Build 41 equivalent. The shorter, cited entry is [F-001 in the verified findings](/pz/build-42/modding/gotchas/verified-findings).

**There is a second, separate component system for characters.** The character-side `ECSEntity` and `ECSComponent` live in `zombie/characters/ecs` and are not part of `zombie/entity`. `ECSEntity` registers a frame keeper, `IsoGameCharacter` adds a state machine component, `IsoPlayer` adds input and network components, and `IsoZombie` adds the network component that stores its owner :cite[(`ECSEntity.java:25-27`, `IsoGameCharacter.java:857-860`, `IsoPlayer.java:691-695`, `IsoZombie.java:605-609`)]. Fourteen source files name `ECSComponent` or `registerECSComponents`, and `IsoObject` joins both systems: it extends `GameEntity` and implements `ECSEntity` :cite[(`ECSComponent.java:12`, `ECSEntity.java:22`, `IsoObject.java:181`)]. The rest of this page is about `zombie/entity`. See [how zombies are run](/pz/build-42/modding/engine/zombies-states-and-the-ai-director) for the zombie's component.

## 3. The 23 component types

**`ComponentType` is an enum, so this list is the whole list.** :cite[(`ComponentType.java:68-93`)] "Ticked" means a system updates it. "Keeps working unloaded" means it may move into a meta entity when its object unloads (section 6).

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

The enum flags say which types run in meta: `FluidContainer` has the run-in-meta flag, and `CraftLogic`, `FurnaceLogic`, `MashingLogic`, `DryingLogic`, `Resources` and `DryingCraftLogic` have it plus the add-to-engine flag :cite[(`ComponentType.java:69-92`)]. The machine components, `FluidContainer`, `SpriteConfig`, `SpriteOverlayConfig` and `MetaTag` only count as valid on a world object or a meta entity; on an item, the systems skip them :cite[(`ComponentType.java:69-92`, `Component.java:100-102`)].

`DryingLogicSystem` exists but nothing in the game constructs it, which is why `DryingLogic` is never ticked :cite[(`DryingLogicSystem.java:40`, `GameEntityManager.java:81-90`)]. The vanilla drying racks use `DryingCraftLogic`, which `CraftLogicSystem` ticks :cite[(`CraftLogicSystem.java:61-68`)].

**What vanilla actually uses is a smaller list.** Across every 42.22 script file, the `component` blocks are `UiConfig` (215), `SpriteConfig` (210), `CraftRecipe` (202), `FluidContainer` (144), `CraftBench` (35), `ContextMenuConfig` (15), `CraftBenchSounds` (9), `WallCoveringConfig` (8), `SpriteOverlayConfig` (8), `Resources` (7), `DryingCraftLogic` (7) and `Durability` (5). That is a count of every `component <Type>` line in `media/scripts`.

No vanilla script uses `CraftLogic`, `FurnaceLogic`, `MashingLogic` or `Lua`. The only self-running machines in 42.22 are the seven `DryingCraftLogic` entities: the plain and simple drying racks, the plain and simple herb drying racks, and the large, medium and small leather drying racks :cite[(`entity_Drying_Rack.txt:22`, `entity_Drying_Rack.txt:519`, `entity_Herb_Drying_Rack.txt:22`, `entity_Herb_Drying_Rack.txt:555`, `entity_leather_prep.txt:133`, `entity_leather_prep.txt:507`, `entity_leather_prep.txt:865`)]. If you build on the other machine components, you are on code paths vanilla content does not exercise.

## 4. How an entity gets its components

**A world object gets components from its tile or custom item, an item from its item script, and Lua can add or remove them.**

- **A world object** gets them when its tile has the `EntityScript` property (the components come from the named `entity` script), or when it is a moveable whose `CustomItem` item script has components. `GameEntityFactory.CreateIsoEntityFromCellLoading` does this as the chunk loads :cite[(`GameEntityFactory.java:90-110`)].
- **An item** gets the components in its item script (`component FluidContainer { ... }` and the like) when it is created, and only when the item script has components :cite[(`GameEntityFactory.java:121-129`)].
- **From Lua**, `GameEntityFactory.AddComponent(entity, component)` adds one made with `ComponentType.X:CreateComponent()`, and `RemoveComponentType`, `TransferComponent` and `TransferComponents` do the rest. Transfers refuse multi-tile objects :cite[(`GameEntityFactory.java:32-48`, `GameEntityFactory.java:75`, `GameEntityFactory.java:220`, `GameEntityFactory.java:256-277`)].

Each built entity also gets a hidden `Script` component recording which script it came from :cite[(`GameEntityFactory.java:179-195`)].

## 5. When the engine runs, and on which side

**`GameEntityManager#Update` runs once per frame, and the simulation part runs on everything except a multiplayer client.** `IngameState` calls it :cite[(`IngameState.java:1551`)]. It does two things :cite[(`GameEntityManager.java:99-123`)]:

1. **Every frame:** the updater systems. `UsingPlayerUpdateSystem` frees a bench when its user is more than 10 tiles away on either axis, on another floor, or dead :cite[(`UsingPlayerUpdateSystem.java:27-42`)]. `InventoryItemSystem` drops items from the engine once they are no longer equipped :cite[(`InventoryItemSystem.java:26-35`)]. `MashingLogicSystem` runs mashing :cite[(`MashingLogicSystem.java:40`)].
2. **Simulation ticks:** one tick per 100 milliseconds of game-time delta, each worth 2.4 game seconds, run on everything **except a multiplayer client** (the tick count is forced to 0 there). The crafting machines (`CraftLogicSystem`), furnaces, fluids, logistics and resources systems run here :cite[(`GameEntityManager.java:108-114`, `EntitySimulation.java:35-48`, `CraftLogicSystem.java:37`, `FluidContainerUpdateSystem.java:29`, `LogisticsSystem.java:23`, `ResourceUpdateSystem.java:24`)].

**At normal speed a tick is about a tenth of a real second.** The game-time delta is the multiplier divided by 0.8 and by 60 :cite[(`GameTime.java:994-1000`)]. The page on [how long a zombie remembers you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you) measured the multiplier at 48 per real second at normal speed, so the delta is 1.0 per real second and a tick is 0.1 seconds. That is our arithmetic, and fast-forward shortens it. The 2.4 game seconds per tick is a constant in the code, not read from the day length :cite[(`EntitySimulation.java:35-37`)]. So a machine recipe's time, counted in those seconds, passes at 24 per real second at normal speed whatever the sandbox day length is :cite[(`CraftLogicSystem.java:101-103`)].

What is in the engine at all:

- **World objects** join when added to the world and leave when removed :cite[(`GameEntity.java:488-505`)].
- **Items** join only while **equipped** (held or worn) and leave when unequipped. A bottle in a bag is not ticked; its components are plain data until some code calls them :cite[(`GameEntity.java:467-486`, `InventoryItem.java:368-370`)].
- **On a multiplayer client**, entities are only indexed by id. They are never added to the client's engine, so no system touches them there. The server pushes changes with `sendSyncEntity`, and a client asks for a fresh copy when an object comes back from a meta entity :cite[(`GameEntityManager.java:161-171`, `GameEntity.java:666-705`)].

So in multiplayer **every machine, every rain catcher and the check that frees a bench whose user walked away run on the server**, and the client only shows what the server sends.

The rain catcher adds 0.005 times the rain intensity times the container's rain-catcher factor times 2.4 per tick, halved in snow. That is 0.012 times intensity times the factor per tick, or 0.12 per real second at normal speed. We did not verify the unit of the amount :cite[(`FluidContainerUpdateSystem.java:41-109`)].

## 6. How machines keep working when nobody is near

**When a chunk unloads, an object whose components may run in meta moves them into a meta entity, which the simulation keeps ticking.** The chunk calls `removeFromWorldToMeta` on each object it unloads :cite[(`IsoChunk.java:3256`, `IsoObject.java:4583`, `IsoObject.java:4616-4624`)].

If the object has any component that may "run in meta" and that currently qualifies (a crafting machine always does; a fluid container only if it catches rain), `GameEntityManager#UnregisterEntity` moves **all** its components into a new `MetaEntity`, registers that in its place, and leaves a `MetaTag` component on the object pointing to it :cite[(`GameEntityManager.java:242-301`, `FluidContainer.java:1352-1354`, `Component.java:55-57`)]. The meta entity keeps being ticked by the simulation, so the machine finishes its batch and the barrel keeps filling. When the chunk loads again, `RegisterEntity` finds the `MetaTag`, moves the components back onto the object and drops the meta entity :cite[(`GameEntityManager.java:190-219`)].

Components normally save with the object or item that owns them, each in its own length-prefixed block :cite[(`GameEntity.java:516-531`)]. Meta entities save separately, in `entity_data.bin` inside the save folder :cite[(`GameEntityManager.java:39`, `GameEntityManager.java:377-413`)].

A crafting machine of the drying kind that has lost its object (the square no longer holds it) is removed from the engine by the crafting system. That check is new in 42.22 :cite[(`CraftLogicSystem.java:49-68`)].

## 7. What Lua can reach

**Lua can read and change an entity's components through `GameEntity`, `ComponentType` and `GameEntityFactory`.**

- [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) on any object or item: `hasComponent(ComponentType.X)`, `getComponent(ComponentType.X)`, `getComponentAny`, `componentSize`, `getFluidContainer`, `getEntityScript`, `getUsingPlayer`, `isMeta`, `getEntityNetID`, and `sendSyncEntity(nil)`.
- [ComponentType](/pz/build-42/modding/reference/lua-classes-entities#componenttype): the values, `CreateComponent()`, `GetList()`, `isRunInMeta()` :cite[(`ComponentType.java:138`)].
- [GameEntityFactory](/pz/build-42/modding/reference/lua-classes-entities#gameentityfactory): `AddComponent`, `RemoveComponentType`, `TransferComponent`, `TransferComponents`.
- The component classes themselves: [FluidContainer](/pz/build-42/modding/reference/lua-classes-entities#fluidcontainer), [CraftBench](/pz/build-42/modding/reference/lua-classes-entities#craftbench), [CraftLogic](/pz/build-42/modding/reference/lua-classes-entities#craftlogic), [Resources](/pz/build-42/modding/reference/lua-classes-entities#resources) and the rest, all on the [entities reference page](/pz/build-42/modding/reference/lua-classes-entities).
- A recipe's Lua hooks `OnStart`, `OnUpdate`, `OnCreate` and `OnFailed`, which a crafting machine calls from its simulation tick :cite[(`CraftLogicSystem.java:101-107`, `CraftLogicSystem.java:168`, `CraftLogicSystem.java:148`, `CraftLogicSystem.java:170`)].

## 8. What a mod can and cannot change, and the traps

**Work with the 23 types, add components on the server and sync them, and do not rely on a player in a machine's hooks.**

- **You cannot add a component type.** `ComponentType` is a Java enum. A mod works with the 23 that exist :cite[(`ComponentType.java:68-93`)].
- **The `Lua` component does nothing.** In 42.22 `LuaComponent` has no fields and its script has no keys. The `LuaCall` names inside it (`OnStart`, `OnUpdate` and so on) are used nowhere else in the game's Java code. Hooks belong on the recipe, not on a `component Lua` block :cite[(`LuaComponent.java:9-60`, `LuaComponentScript.java:15-22`)].
- **A machine's recipe hooks get no player.** `CraftLogicSystem` calls a recipe's `OnStart` and `OnCreate` with the character argument `nil`, even when a player pressed start :cite[(`CraftLogicSystem.java:148`, `CraftLogicSystem.java:170`, `CraftRecipeData.java:440-451`)]. Write those functions so they work without one.
- **`StartMode = Automatic` on a `CraftLogic` looks broken.** The automatic start passes no player, and `CraftLogicSystem#start` then reads that player's craft history with no check for `nil`, after the inputs were already consumed :cite[(`CraftLogicSystem.java:126-128`, `CraftLogicSystem.java:142`, `CraftLogicSystem.java:149`, `CraftLogic.java:366-382`)]. All seven vanilla lines that set `StartMode` use `Manual`. If you try `Automatic`, test it and watch the log.
- **Add components on the server, then sync.** On a multiplayer server, add or change a component, then call `entity:sendSyncEntity(nil)`. The client's copy then takes the server's full list: components the server sent are created or updated, and any component the server did not send is removed from the client's copy :cite[(`GameEntity.java:666-696`, `GameEntity.java:708-757`)].
- **Use `DryingCraftLogic`, not `DryingLogic`.** Nothing ticks a `DryingLogic` component in 42.22; every vanilla drying entity uses `DryingCraftLogic`.
- **Items only tick while equipped.** Do not expect a component on an item in a bag to be updated by a system :cite[(`GameEntity.java:467-486`)].

:::callout[How we know]{kind=proof}
All of this is read from the 42.22 code and a count of `media/scripts`. The `Automatic` trap is read from the code; no machine we know of uses it.

The test: a test entity with `CraftLogic` set to `StartMode = Automatic` and a one-input recipe, inputs loaded in single player. By the code the log shows a `NullPointerException` from `CraftLogicSystem.start` and the inputs disappear. Not tested.

The 10 ticks per real second is our arithmetic from the code's time-delta formula and the 48 per second on another page, not a measurement of the entity engine. On a dedicated server the game sets its frame multiplier from the server's own frame rate, and a server frame step is paced at about 100 ms, one tick per step, per [reading server performance numbers honestly](/pz/build-42/modding/multiplayer/reading-server-performance-numbers-honestly) :cite[(`GameServer.java:1160-1166`)]. We read that from the code and did not measure it. The unit of the rain amount is not verified.
:::

## 9. Where to go next

- [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system): the script side of benches.
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here): the biggest component, in depth.
- [Crafting and timed actions from Lua: what the server really does](/pz/build-42/modding/crafting/handcraft-from-lua-what-the-server-does).
