---
id: build-42-community-mod-survey
slug: community-mod-survey
title: Community B42 vehicle mods -- survey
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: intermediate
tags:
  - vehicles
  - community-mods
  - survey
  - workshop
excerpt: >-
  Fourteen Workshop mods read from the local install
  (steamapps/workshop/content/108600), for technique only.
  Nothing here is copied. Where a finding contradicts something we...
last_updated: '2026-10-04'
---
# Community B42 vehicle mods -- survey

> Source: 23-community-mod-survey.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Fourteen Workshop mods read from the local install
(`steamapps/workshop/content/108600/<id>` in the Steam library), for technique only.
Nothing here is copied. Where a finding contradicts something we believed, the
decompile was consulted and is cited.

| Workshop | Mod | Read depth |
|---|---|---|
| 3628452306 | STA_EngineRebuild | full |
| 3635856965 | better-auto-mechanics | full (hooks, xp-tracker) |
| 3772415251 | VehicleMaintenanceOverhaul | full (client, odometer) |
| 3775910517 | ExpandedVehicleStorageB42 | full (capacity manager) |
| 3744391882 | ConsistentVehicleRepairs | full (core) |
| 3730070661 | Gores SVU4 Core + 3 siblings | API, armor damage, file map |
| 3728775267 | BetterVehicleDynamics | API |
| 3520758551 | WayMoreCars | file map, vehicle zones |
| 3727602756 | ChoppedVehicleSalvage | skim |
| 3742399637 | VehiclePaintSystem | file map |
| 3742291546 | Gores SVU4 Vanilla Cars | file map |
| 3576268735 | twistdwimc | file map |
| 3457670134 | VehicleAccelMultiplier | file map |
| 3779405897 | SampleVehiclePack | file map (1454 scripts, 427 FBX) |

Not installed: **3708816224 Navigator**.

---

## 1 · The correction: our crash absorption watches the wrong part

`BaseVehicle.addDamageFront` (decompile `BaseVehicle.java:4819-4833`):

```java
private void addDamageFront(int dmg) {
   if (!this.isDriverGodMode()) {
      this.currentFrontEndDurability -= dmg;
      VehiclePart part = this.getPartById("EngineDoor");
      if (part != null && part.getInventoryItem() != null) {
         part.damage(Rand.Next(Math.max(1, dmg - 5), dmg + 5));
      }
      if (part == null || part.getInventoryItem() == null || part.getCondition() < 25) {
         part = this.getPartById("Engine");
         ...
```

**A frontal crash does not touch the Engine part while the hood is fitted and
above 25% condition.** It damages the hood. The Engine is only reached once the
hood is already gone or nearly destroyed.

Our absorption reconciles `Engine` condition against `lastWritten`. On an intact
car that value never moves in a crash, so **absorption would have fired on
approximately no real collisions** -- while passing every Numpad 8 test, because
Numpad 8 damages the Engine part directly. Textbook §1 of
`22-lessons-and-guards.md`: the test exercised the half of the surface that was
never the real path.

The Java signal that always moves is `currentFrontEndDurability` --
`BaseVehicle.java:308` a public int defaulting to 100, reset to
`frontEndDurability` on repair (`:1565`), and serialised both ways (`:2646`,
`:2752`). Gores reads it defensively:

```lua
local ok, v = pcall(function() return vehicle.currentFrontEndDurability end)
```

We first took that as a working read. It is not: **Lua cannot read a public Java
field.** The game exposes Java *methods* to Lua, plus public *static* fields; an
instance field such as this one has no getter, so `vehicle.currentFrontEndDurability`
reads as nil, silently. The `pcall` hides that.

> **Proof:** Code. `se.krka.kahlua.integration.expose.LuaJavaClassExposer` binds methods, and `exposeStatics` only public static fields; `zombie.vehicles.BaseVehicle.currentFrontEndDurability` is a public instance field with no getter. Build 42.21.0 (revision 4a0e9546ec). The exposer was read from the installed jar's bytecode.

**Action:** absorption should key on the **hood's condition drop** (the
`EngineDoor` part), which a frontal crash damages first and which Lua can read
through `getCondition()`, with Engine-condition delta kept as a secondary signal
for the hood-destroyed case. This is the first thing to change before the
real-crash test is worth running.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#addDamageFront` (damages `EngineDoor` first, `Engine` only when the hood is missing or under 25). Build 42.21.0 (revision 4a0e9546ec).

## 2 · The UI mod does not need to replace the mechanics window

VehicleMaintenanceOverhaul adds six maintenance systems -- oil, coolant,
radiator, belt, alternator, gearbox -- to the vanilla Vehicle Mechanics window
**without replacing it**, by injecting fake entries into vanilla's own part list.

`self.vehiclePart` is a plain Lua table rebuilt inside `ISVehicleMechanics:initParts`
(vanilla `ISVehicleMechanics.lua:46`). So:

```lua
local original_initParts = ISVehicleMechanics.initParts
function ISVehicleMechanics:initParts()
    original_initParts(self)
    local cat = self.vehiclePart["engine"]
    ...
    table.insert(cat.parts, {
        name = vp.name,
        part = enginePart,   -- binds the graphical overlay to a real part
        isVirtual = true,
        virtualId = vp.id,
        condition = vp.val,
    })
```

then branch on `isVirtual` in three more hooks: `doDrawItem` (row render),
`doPartContextMenu` (right-click), `renderPartDetail` (right-hand pane).

**This is a materially better plan than the replacement panel in the
OutcastMotorsUI handoff.** Our nineteen engine parts become rows in vanilla's
own engine category. We inherit the window, the list, the part overlay
highlighting, the layout arithmetic, the font handling, the joypad support and
every future TIS fix to all of it -- and gates 1, 2, 3, 9 and 10 of the
`pz4-design` audit stop being our problem. Four small hooks instead of a panel.

Caveats, both real:

- **`initParts` rebuilds `self.vehiclePart` from scratch every call**, so
  injection must re-run each time and must remove its own stale rows first (VMO
  does: `if cat.parts[j].isVirtual then table.remove(...)`).
- **`doPartContextMenu` is contended.** VMO returns early without chaining when
  it owns the part; STA_EngineRebuild chains first and appends after. Two mods
  that both inject need the VMO shape (claim only your own rows, chain
  otherwise). Ours must chain -- see the late-binding rule.
- VMO also rebuilds the listbox and recomputes `listWidth` in `initParts`. Two
  mods doing that fight over width; last writer wins.

## 3 · The anti-grind problem is already solved, and it is worse than we thought

From better-auto-mechanics `xp-tracker.lua`, two findings we would have hit blind:

**The single-player XP key is reconstructible.** `player:getMechanicsItem(key)`
returns non-nil once a part has been worked, and the key is:

```lua
part:getInventoryItem():getID() .. vehicle:getMechanicalID() .. "1"
```

Note `"1"`: that is the **install** key. Vanilla records both jobs. A successful
install calls `addMechanicsItem` with the key ending `"1"`, a successful uninstall
with the key ending `"0"`, and each pays 2 to 13 XP only the first time that part
is done on that car in a game day. A failed attempt pays 1 XP every time. So
neither install nor uninstall grants success XP more than once per part, per car,
per game day.

> **Proof:** Code. `media/lua/shared/Vehicles/TimedActions/ISInstallVehiclePart.lua` and `ISUninstallVehiclePart.lua`, `complete()`; `zombie.characters.IsoPlayer#addMechanicsItem` and `#updateMechanicsItems`. Build 42.21.0 (revision 4a0e9546ec).

**`getMechanicsItem` does not work in multiplayer.** BAM replaces it with a
24-hour cooldown in `player:getModData().BAM_History`, keyed the same way but
stamped with `getGameTime():getWorldAgeHours()`, pruned on write, followed by
`player:transmitModData()`. It also handles world-age going *backwards* (server
wipe) by clearing the entry.

`vehicle:getMechanicalID()` (`BaseVehicle.java:9366`) is a stable per-vehicle int
distinct from `getId()` -- a better key for our per-vehicle `lastWritten` than
what we use now.

**Also from the same file, unprompted:** the comment

> These 'complete' hooks only work in SP, because in MP they never get called.
> In MP we use the OnMechanicActionDone event

That comment describes older builds, and it misled us. In Build 42 multiplayer,
`ISUninstallVehiclePart:complete` and `ISInstallVehiclePart:complete` **run on
the server**, not on the client that started the action. The client sends the
action to the server, the server rebuilds it from its `new` arguments and calls
its `complete()` there. So vanilla's part change and its XP do land on a
dedicated server, and completion logic hung on `complete()` runs, as long as it
is defined in code the server loads (`shared/` or `server/`). What a client sees
afterwards is the `OnMechanicActionDone` event, which `complete()` triggers by
sending `MECHANIC_ACTION_DONE` back to the player.

> **Proof:** Code. `zombie.core.NetTimedAction#parse` and `#perform`; `zombie.characters.CharacterTimedActions.LuaTimedActionNew#complete` (calls the Lua `complete` only where `!GameClient.client`); `zombie.characters.IsoGameCharacter` triggers `OnMechanicActionDone` on `MECHANIC_ACTION_DONE`. Build 42.21.0 (revision 4a0e9546ec).

## 4 · Gate the action, show the information -- confirmed by three mods

We derived "vanilla gates actions but never information" from reading vanilla.
Three independent mods land on the identical UI idiom:

```lua
local opt = context:addOption("Drain Engine Oil", self, onDrainOil, playerObj, container)
if not container or not hasHose or mechanicsLvl < reqLvl then
    opt.notAvailable = true
    local tooltip = ISWorldObjectContextMenu.addToolTip()
    tooltip.description = "Requirements: <LINE>"
        .. (hasHose and " <RGB:0,1,0> " or " <RGB:1,0,0> ") .. "Pipe or Hose <LINE>"
        .. ...
    opt.toolTip = tooltip
end
```

The option is **always added**, greyed via `notAvailable`, and the tooltip lists
every requirement with per-line red/green. The player learns the full recipe from
an option they cannot click. STA_EngineRebuild does the same thing with vanilla's
own colour constants:

```lua
ISVehicleMechanics.ghs = "<GHC>"   -- good, vanilla ISVehicleMechanics.lua:6
ISVehicleMechanics.bhs = "<BHC>"   -- bad,  vanilla ISVehicleMechanics.lua:7
```

Prefer `ghs`/`bhs` over hardcoded `<RGB:0,1,0>` -- they follow the player's
accessibility colour settings; literal RGB does not. That also satisfies the
"no colour-only state" gate, since the text carries `count/required` regardless.

**Adopt this verbatim as the OutcastMotors action idiom.** It is what the
community expects, it is self-teaching, and it is exactly the design position we
had already argued for.

## 5 · Vehicle-part levers we did not know existed

From ExpandedVehicleStorageB42's capacity manager, all runtime, all field/method
access:

| Call | Use to us |
|---|---|
| `part:setContainerCapacity(n)` | set bay capacity per vehicle instead of a fixed 100 in script |
| `part:setContainerContentAmount(w)` | **decouple carried weight from physics weight** |
| `part:getScriptPart()` then `.container.capacity` | read the script-declared capacity at runtime -- a validator hook |
| `vehicle:updatePartStats()` / `updateTotalMass()` | recompute after any part change |
| `vehicle:getInitialMass()` / `setMass(m)` | mass compensation floor |

`setContainerContentAmount` is the one that matters. Nineteen engine parts in the
bay add real mass and will make cars handle worse -- a bug we have not hit yet
only because nobody has driven a fully populated car far. EVS uses it to let a
container hold more than it physically weighs.

Their MP sync set after any part mutation, worth copying wholesale:

```lua
vehicle:updatePartStats()
part:transmitModData()
vehicle:transmitPartModData(part)
vehicle:transmitPartItem(part)
vehicle:transmitPartCondition(part)
```

Two structural habits also worth taking:

- **A `DATA_VERSION` in modData**, compared in the idempotency guard. A mod
  update bumps it and every vehicle recomputes once. Our `lastWritten` has no
  version, so a formula change would silently keep stale baselines.
- **A `restoreVehicle` path.** EVS can put vanilla capacities back and clear its
  own modData keys. We have nothing equivalent -- uninstalling OutcastMotors
  today leaves nineteen phantom parts and a mirrored engine condition with no
  mirror. That is a real user-facing defect.

## 6 · Repeat repairs: vanilla degrades them, and there is a clean way to intercept

`item:getHaveBeenRepaired()` / `setHaveBeenRepaired()` -- vanilla counts repairs
per item and each successive repair is worth less. ConsistentVehicleRepairs
neutralises it with a save/zero/call/restore sandwich:

```lua
setNativeRepairCount(item, 0)
local ok, result = pcall(originalComplete, action, ...)
local temporaryCount = getNativeRepairCount(item) or 0
setNativeRepairCount(item, originalCount + (temporaryCount > 0 and 1 or 0))
```

The `temporaryCount > 0` test infers *did vanilla count a repair* rather than
assuming it -- the same reconcile-against-observed discipline as §5 of
`22-lessons-and-guards.md`. Relevant when our repair action runs: our parts are
inventory items, so they inherit this decay whether or not we intend it.

## 7 · Wear should be by distance, and there is no odometer

VehicleMaintenanceOverhaul tracks distance by **player position delta** on
update, because vehicles expose no odometer:

```lua
local dist = math.sqrt((px - lastX)^2 + (py - lastY)^2)
if dist > 0 and dist < 200 then          -- guard: teleport / chunk load
    local kmMoved = dist / 1000.0        -- ~1000 tiles == 1 km
```

then wears each system at a per-km rate scaled by engine condition
(`1.0 + ((100 - engineCond)/100) * 2.0`). Our part wear currently rides vanilla's
per-tick dice roll, which §3 of the lessons doc already flags as unmeasurable.
Distance is deterministic, observable, and testable -- and it makes a worn engine
degrade its own parts faster, which is the feedback loop the whole mod is about.

## 8 · Registry APIs -- our design is the community norm

Both Gores SVU4 Core and BetterVehicleDynamics ship exactly the shape we built
into `OutcastLib.VehicleParts`: a global table, `API_VERSION`, register/get
pairs, forward-compatible unknown-key tolerance. BVD's contract is the better
written of the two and worth matching in spirit:

> This module NEVER calls `error()`. A misbehaving data pack can degrade its own
> coverage but can never break another mod's file load.

BVD also documents fields that are **accepted and validated but not yet
applied** (`cargo`), which lets consumers write forward-compatible registrations
today. Good pattern for our provider's `listActions` while it still returns
empty.

Gores gates every file behind an obfuscated `permit()` licence check. Noted and
deliberately not adopted.

## 9 · Smaller notes

- **`getVehicleZoneAt(x, y, z)`** returns a live, mutable zone --
  `setName/setW/setH/setX`. WayMoreCars rewrites vanilla spawn zones through it
  rather than overriding data files. Relevant to Part Spawning: part quality can
  vary by zone without touching distributions.
- **`vehicle:getUniqueId()`** exists alongside `getId()`; Gores prefers it for
  cache keys, falling back to `getId()`.
- **`vehicle:getScript():getEngineRepairLevel()`** -- a per-vehicle-script
  difficulty tier (`VehicleScript.java:1957`). STA_EngineRebuild scales both
  skill requirement and action time from it. Free per-vehicle balance we are not
  using.
- **`vehicle:getEngineQuality()`** (`BaseVehicle.java:8137`) is a *second*
  engine axis, separate from Engine part condition. Rebuild raises quality;
  wear lowers condition. Our mirror only writes condition -- quality is an
  untouched axis we could own.
- **Versioned build folders.** Several mods ship `42.12/`, `42.13/`, `42.15/`,
  `42.16/` side by side and PZ picks the highest that is <= the running build.
  This is how the community handles TIS breaking changes without abandoning
  players on older builds.
- **`ISVehicleMechanics.lua:1339`** is where vanilla draws `DBG: Gain XP:` --
  vanilla, debug-only, not a mod.
- Two mods hardcode untranslated strings in a non-English language into shipped
  UI (VMO's part names are Italian). A low bar to clear.

---

## What to change in OutcastMotors, ranked

1. **Absorption keys on the hood's condition drop**, not Engine condition (§1);
   `currentFrontEndDurability` cannot be read from Lua.
   Everything else is additive; this one is a correctness bug that all our
   testing missed.
2. **Add `restoreVehicle` and a `DATA_VERSION`** to the modData contract (§5).
3. **Adopt the `notAvailable` + requirement-tooltip idiom** with `ghs`/`bhs` for
   every action in the Actions milestone (§4).
4. **Put completion logic in `complete()`, defined where the server loads it**
   (§3): in Build 42 multiplayer it runs on the server. Use `OnMechanicActionDone`
   only for what the client should show afterwards, and reconstruct the vanilla
   XP key rather than inventing a parallel one.
5. **`setContainerContentAmount`** so a full engine bay does not wreck handling (§5).
6. **Move wear to distance** (§7).

## What to change in OutcastMotorsUI

Reopen the handoff. **Injecting virtual rows into vanilla's part list (§2) is
very likely the right architecture instead of a replacement panel** -- less
code, better compatibility, and it inherits the layout and accessibility work we
were about to redo. The layered inspection design (hood/gauge/jack gating)
survives intact; it becomes a filter on which rows are injected rather than a
bespoke panel.

---

*Corrected 2026-10-04: vanilla records and rate-limits both install and uninstall (keys ending 1 and 0), and pays 2 to 13 XP on success once per part, per car, per game day.*

*Corrected 2026-10-04: in Build 42 multiplayer a vehicle action's complete() runs on the server; the advice to avoid complete() in favour of OnMechanicActionDone is withdrawn.*

*Corrected 2026-10-04: Lua cannot read currentFrontEndDurability (a public Java field reads as nil); crash absorption keys on the hood's condition drop.*

*Re-checked 2026-10-04 for Build 42.21: the crash, XP and timed-action code is unchanged (42.21 only added an early return to `ISInstallVehiclePart:isValid` once the action is 90 percent done); line numbers updated; the code claims we re-checked still hold.*
