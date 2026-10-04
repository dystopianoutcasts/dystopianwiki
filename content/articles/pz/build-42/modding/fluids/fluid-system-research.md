---
id: build-42-fluid-system-research
slug: fluid-system-research
title: Outcast Motors -- fluid systems research
game: pz
version: build-42
section: modding
category: fluids
difficulty: advanced
tags:
  - fluids
  - vehicles
  - outcast-motors
  - containers
excerpt: >-
  Written 2026-08-22. Answers the dive scoped in 05-state-and-next-build.md
  section 6. Every claim below is cited to our B42 decompile (revision
  a2947723ca...
last_updated: '2026-10-04'
---
# Outcast Motors -- fluid systems research

> Source: 17-fluid-systems-research.md (compiled 2026-08-22, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Written 2026-08-22. Answers the dive scoped in `05-state-and-next-build.md` section 6.
Every claim below is cited to our B42 decompile (revision a2947723ca, buildid
24449119) or to
the shipped game scripts in that snapshot. On 2026-10-04 every citation was
re-checked on Build 42.21 (revision 4a0e9546ec): nothing it describes changed,
and the line numbers now point into 42.21.

---

## 0. The decision, up front

**Use B42's fluid containers. Do not port Project Summer Car's hand-rolled
modData approach.**

PSC predates the system entirely and is solving a solved problem. B42 ships
`zombie/entity/components/fluids/` -- fourteen classes, 3,727 lines -- plus a
complete Lua layer, 20 declared fluids and 133 items that already carry a
`FluidContainer` component. Mixtures, proportional draining, blend rules,
poison profiles, per-container whitelists and the UI bar are all provided.

**And the fluid lives on the ITEM, not on the VehiclePart.** That is the single
structural decision everything else follows from, and it costs us nothing --
Outcast Motors already stores its parts as `InventoryItem`s inside the engine
bay's `ItemContainer`. The fluid rides a part we already have.

One limit, stated here so it is not discovered late: **vanilla's own fluid
transfer action works in multiplayer, but only replicates items in a player's
inventory.** Section 5 covers it. An item fitted to a vehicle part is not
re-sent to clients by vanilla's sync, so a fitted reservoir needs our own server
command.

---

## 1. What B42 actually provides

### The component

`FluidContainer extends Component` (`FluidContainer.java:55`), 1,395 lines. It is
attached to a `GameEntity`. Zero `@HiddenFromLua` annotations in the whole file,
so the entire public surface is callable from Lua.

The parts that matter to us:

| Call | What it gives us |
|---|---|
| `addFluid(String, float)` | `:920` -- takes a fluid id string, so `"OMO_MotorOil"` works directly |
| `getAmount()` / `getCapacity()` / `getFilledRatio()` | `:565`, `:537`, `:546` |
| `getSpecificFluidAmount(Fluid)` | `:737` -- how much coolant is in the oil |
| `adjustSpecificFluidAmount(Fluid, float)` | `:721` |
| `isMixture()` | `:862` -- contaminated or not, in one call |
| `getPrimaryFluid()` / `getPrimaryFluidAmount()` | `:799`, `:817` |
| `isTainted()` / `isPoisonous()` / `getPoisonRatio()` | `:680`, `:654`, `:644` |
| `canAddFluid(Fluid)` | `:906` -- honours blend rules and both filters |
| `removeFluid(float)` | `:969` |
| `Empty()` | `:874` |
| `getWhitelist()` / `getBlacklist()` | `:866`, `:870` |

`MAX_FLUIDS = 8` per container (`:56`).

### The script syntax

Declared on an item, exactly as vanilla does it. `PetrolCan`
(`generated/items/normal.txt:7216`):

```
item PetrolCan
{
    ...
    component FluidContainer
    {
        ContainerName = GasCan,
        Capacity = 10.0,
        Fluids
        {
            fluid = Petrol:1.0,
        }
    }
}
```

Fields seen across vanilla items and entities: `ContainerName`, `Capacity`,
`InitialPercentMin`, `InitialPercentMax`, `InputLocked`, `RainFactor`,
`FillsWithCleanWater`, `HiddenAmount`, `TransferRate`, and the
`Fluids { fluid = X:ratio }` block. The item itself may also declare
`IconFluidMask` (seen on `BottleCrafted`), which is what draws the fill level on
the inventory icon.

**133 vanilla items already carry the component** -- 125 in `normal.txt`, 4 in
`clothing.txt`, 2 each in `container.txt` and `weapon.txt`.

### The Lua layer vanilla already ships

```
shared/Fluids/ISFluidContainer.lua        108 lines
shared/Fluids/ISFluidTransferAction.lua   141
shared/Fluids/ISFluidEmptyAction.lua      123
shared/Fluids/ISFluidUtil.lua              67
client/Fluids/ISFluidBar.lua
client/Fluids/ISFluidContainerPanel.lua
client/Fluids/ISFluidTransferUI.lua
client/Fluids/ISFluidInfoUI.lua
client/ISUI/ISFluidContainerMenu.lua
client/Entity/ISUI/Controls/ISFluidSlot.lua
client/Entity/ISUI/Controls/ISFluidSlotPanel.lua
```

`ISFluidBar` and `ISFluidSlotPanel` are directly reusable in `OMO_Workshop`. The
transfer *action* is not -- see section 5.

For contrast, PSC hand-rolled `shared/ISTransferEngineFluid.lua` at 168 lines
(`_dev/B42_Vehicles/01-project-summer-car-anatomy.md:122`) because B41 had none
of this.

---

## 2. Why the fluid goes on the item, not the part

This was the question the state doc asked as *"can an arbitrary part carry a
fluid the way the gas tank does?"* The answer is a qualified yes that we should
decline.

**Structurally a VehiclePart could.** `VehiclePart extends GameEntity`
(`VehiclePart.java:44`) and inherits `getFluidContainer()`
(`GameEntity.java:190`), which is just
`getComponent(ComponentType.FluidContainer)`.

**But nothing can attach one.** `VehicleScript` has no component support at all --
grep for `component` in it returns nothing -- so a vehicle part script cannot
declare a `FluidContainer`. And `GameEntity.addComponent` is package-private
(`:260`), so Lua cannot attach one at runtime either. The only paths that create
components are `loadEntity` (`:552`) and the sync receiver (`:727`), both driven
by serialized data, not by callers.

**`InventoryItem extends GameEntity` too** (`InventoryItem.java:129`), item
scripts *do* support the component, and we already store every Outcast Motors
part as an item in the bay container. So the oil pan item carries the oil, the
radiator item carries the coolant, and the storage question disappears.

This also means the four fluids and five `fluid = { type, capacity }` slot
entries already in `OMO_Slots.lua` were declared against the right model. The
`capacity` field maps onto the item script's `Capacity`; nothing needs
redesigning.

Vanilla's gas tank uses a different and much poorer channel --
`getContainerContentAmount` / `setContainerContentAmount`
(`VehiclePart.java:352`, `:382`), a single float on the part with no fluid
identity at all. It cannot express a mixture, which is the entire point of the
feature. Noted only so nobody re-proposes it.

---

## 3. Cross-contamination is free

The state doc records PSC's head-gasket cross-contamination as *"reportedly eight
lines for the best diagnostic in the genre."* Confirmed as a design, and in B42
it is roughly one line:

```lua
oilPan:getFluidContainer():addFluid("OMO_Coolant", loss * 0.5)
```

Because:

- a container holds up to 8 distinct fluids simultaneously (`:56`)
- `addFluid` merges into an existing instance or creates a new one (`:936-951`)
- **`removeFluid` drains proportionally across the mixture** (`:987-990`:
  `fluidRemoveAmount = remove * fluid.getPercentage()`) -- so draining a
  contaminated oil pan gives the player the mix, not clean oil first
- `isMixture()` and `getSpecificFluidAmount()` make the diagnostic readable
  without us tracking anything ourselves

**Blend rules control what is even allowed to mix.** `Fluid.canBlendWith`
(`Fluid.java:343`) consults a per-fluid `BlendWhitelist` / `BlendBlackList`
declared in the fluid script (`:198`, `:204`), and `canAddFluid` (`:906`) also
honours a per-*container* whitelist and blacklist. Together these are how we stop
a player topping up the brake reservoir with coolant -- declaratively, with no
Lua guard.

Worth noting for the poison work later: vanilla's `TaintedWater` carries a
`Poison { maxEffect, minAmount, diluteRatio }` block, but only `maxEffect` does
anything. `minAmount` and `diluteRatio` are loaded and never read: the poison
lookup returns the maximum effect whatever the amount. And a `Poison` block only
reaches the drinker when the fluid also has a `Properties` block, because the
dose is stored in the properties. Vanilla `Petrol` has a `Poison` block, no
`Properties`, and poisons nobody. Motor oil and brake fluid are `Hazardous` in
our existing declarations but carry no poison profile yet.

> **Proof:** Code. `zombie.entity.components.fluids.PoisonInfo#getPoisonEffect` (returns `maxEffect`); `zombie.entity.components.fluids.Fluid#setScript` (properties, with the poison dose, only when the script has a `Properties` block); `zombie.characters.IsoGameCharacter` reads the dose from `FluidConsume#getPoison`; `media/scripts/generated/fluids.txt`. Build 42.21.0 (revision 4a0e9546ec).

---

## 4. Multiplayer: it replicates, and it is server-authoritative

This was the question that mattered most, since the state doc flagged that PSC
needed a bespoke packet and warned *"that constraint lands on us identically."*
**It does not.**

### Component-level sync exists

`FluidContainer` overrides `saveSyncData` (`:1196`) and `loadSyncData` (`:1201`),
which are the `Component` sync hooks. `GameEntity.sendSyncEntity` (`:664`) walks
every component and writes each one's sync data. The receiving side creates the
component if the client did not have it (`:727-730`).

`sendSyncEntity` opens with `if (GameServer.server)`. Same shape as
`sendServerCommand`, same shape as every `transmit*` call we already make. The
server owns fluid state and pushes it. That is the architecture Outcast Motors
already has.

### The bay container path carries fluids today

`OMO_Backend.settle` already calls `sendAddItemToContainer` /
`sendRemoveItemFromContainer`. Following those through:

```
sendAddItemToContainer                    LuaManager.java:12380
  -> GameServer.sendAddItemToContainer    GameServer.java:2413
  -> AddInventoryItemToContainerPacket    write, :61
  -> CompressIdenticalItems.save          :182  item.saveWithSize
  -> InventoryItem.save                   :1829 requiresEntitySave
  -> GameEntity.saveEntity                -> every component, FluidContainer included
```

So **fluids ride the packet we already send.** Fitting a pre-filled oil pan
replicates its oil to every client with no new code.

### The compression trap that is already handled

`CompressIdenticalItems` merges identical stacked items, which would be a
catastrophe here -- two oil pans at different levels collapsing into one. It does
not happen: `areItemsIdentical` (`:79`) does a **full byte-level comparison of
the serialized item** with the id zeroed (`:107-124`), and the serialization
includes the entity components. Different oil levels produce different bytes and
are never merged.

### Persistence

`VehiclePart.save` writes its `ItemContainer` (`:559-563`) and `BaseVehicle.save`
writes every part (`:2660-2663`). Fluids survive a save/load without us doing
anything.

### The part's *fitted* item also replicates

Not our storage model, but worth recording: `VehiclePartItem`
(`zombie/network/fields/vehicle/VehiclePartItem.java`) transmits
`part.getInventoryItem()` via `saveWithSize` (`:61`), triggered by
`transmitPartItem` setting flag 128 (`BaseVehicle.java:8213`). That path carries
components too. If we ever need a fluid on a *slot* part rather than a bay part,
this is the channel.

---

## 5. Vanilla's transfer action works in multiplayer, for items in a player's inventory

We first read this section the other way round, and wrote "do not reuse
`ISFluidTransferAction`". That was a misreading. `ISFluidTransferAction` defines
`complete()`, which does the whole transfer with `FluidContainer.Transfer` and
then syncs both ends. A Lua timed action that defines `complete()` is run through
the server in multiplayer, and `complete()` is called only where the code is not
a client. The `if not isClient() then` block in `update()` is only the live
progress while the action runs, and the `--todo sync mp` comment in `perform()`
is stale. `ISFluidEmptyAction` (pouring on the ground) has the same shape.

> **Proof:** Code. `media/lua/shared/Fluids/ISFluidTransferAction.lua` and `ISFluidEmptyAction.lua`, `complete()`; `zombie.characters.CharacterTimedActions.LuaTimedActionNew` (net action created on a client when `complete` exists; `complete` called only where `!GameClient.client`). Build 42.21.0 (revision 4a0e9546ec).

What does still hold: the sync helper, `ISFluidContainer:sync()` (`:96`), calls
`syncItemFields()` for an item, and that method only sends when
`getOutermostContainer().getParent() instanceof IsoPlayer`
(`InventoryItem.java:4397`) -- **false for an item sitting in a vehicle part's
container.** So vanilla's transfer works for two items in a player's inventory
and does not replicate an item fitted to a vehicle part.

> **Proof:** Code. `zombie.inventory.InventoryItem#syncItemFields`. Build 42.21.0 (revision 4a0e9546ec).

So, for a fitted reservoir only, pouring must be a command the
client sends and the server performs, which is exactly the shape `OMO_Command`
already has for install / uninstall / repair. `OMO.Actions.can` gains a `pour`
predicate, `OMO_PartAction` gains a fourth action id, and the handler does the
transfer with `FluidContainer.Transfer` server-side before re-sending the
container.

This is a good outcome disguised as a problem. It means the fluids feature lands
in the architecture we just spent a milestone building, rather than beside it.

---

## 6. There is no built-in degradation -- we own the simulation

`FluidContainerUpdateSystem` (108 lines) looks like a per-tick fluid simulation
and is not. Its `updateSimulation` (`:41`) filters to
`entity.isMeta() || fluidContainer.isQualifiesForMetaStorage()`, and
`isQualifiesForMetaStorage()` returns `getRainCatcher() > 0.0F`
(`FluidContainer.java:1352`). It is a rain-catching system for world objects.
Ordinary items are never ticked. It is also gated `if (!GameClient.client)`
(`:43`).

So clean oil becoming dirty oil is ours to write. That is the right answer --
`Engine.step` already owns cooling, charge, wear and the condition mirror, all
driven by the hook's `elapsedMinutes`, and oil degradation is one more term in
the same place with the same rate semantics.

`OMO_Cooling.lua:276` already names itself as the hook cross-contamination will
hang on.

---

## 7. What this unblocks that was previously deferred

`OMO_Slots.lua:575` records that Part Spawning *"needs to spawn parts holding
mixed fluids"* and that this was why the fluid definitions had to exist in v0.1.

`FluidContainerScript` provides it declaratively: `getInitialFluids()` (`:339`),
`getInitialAmount()` (`:331`), `InitialPercentMin` / `InitialPercentMax`. A
scavenged oil pan can be declared to spawn 5-40% full of a dirty mixture in the
item script, with no spawn-time Lua at all.

---

## 8. Open question, and it is the only one

**In-place mutation.** The add/remove path is proven (section 4). What is *not*
verified is whether mutating a fluid on an item that is already sitting in a bay
container -- oil degrading over distance, coolant leaking into oil -- reaches
clients on its own, or whether the server must re-send the container each time it
changes.

`sendSyncEntity` is the mechanism, but reaching it for an item in a vehicle
part's container is the untested step, and `syncItemFields` demonstrably does not
cover that case (section 5). The likely answer is that we re-send deliberately,
on a transition, at whatever cadence `Engine.step` decides -- which is consistent
with how the mod already handles `transmitPartUsedDelta` in `settle()`.

This is a design question for the implementation plan, not a blocker, and it does
not change the decision in section 0. It should be settled by reading
`ItemContainer`'s own sync path before any fluid code is written, not discovered
on a server.

---

## 9. Standing facts, so they are not rediscovered

- Vanilla `Water` must never be redeclared in our module -- a same-named fluid in
  `module OutcastMotors` is not a second fluid: any fluid named like a vanilla
  one is bound to the vanilla fluid type and **overwrites vanilla's definition**.
  Already handled in `OMO_Fluids.txt`; the radiator deliberately uses vanilla's.
- `FluidUtil.TRANSFER_ACTION_TIME_PER_LITER = 40.0`,
  `MIN_TRANSFER_ACTION_TIME = 20.0` (`FluidUtil.java:31-32`) -- vanilla's timing
  for a pour, worth matching so ours does not feel foreign.
- `FluidUtil.MIN_CONTAINER_CAPACITY = 0.05F` -- our smallest declared capacity is
  1.0, so no conflict.
- Fluid amounts are litres (`UNIT_L = 1.0F`). Our declared capacities -- 5.0 for
  the oil pan, transmission and radiator -- read correctly as litres.
- `DebugCSVExportFluidContainers` exists and dumps every fluid item's capacity
  and transfer rate. Useful for balancing against vanilla, and it is an export,
  not a command anyone has to run in a session.

> **Proof:** Code. `zombie.scripting.objects.FluidDefinitionScript#Load` (a name matching a `FluidType` binds to it) and `zombie.entity.components.fluids.Fluid#Init` (sets that script on the vanilla fluid). Build 42.21.0 (revision 4a0e9546ec).

---

*Corrected 2026-10-04: vanilla's fluid transfer and empty actions work in multiplayer for items in a player's inventory; Poison minAmount and diluteRatio are never read; a fluid named like a vanilla one overwrites it.*
