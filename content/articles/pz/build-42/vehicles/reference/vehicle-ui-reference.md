---
id: build-42-vehicle-ui-reference
slug: vehicle-ui-reference
title: Vehicle UI reference
game: pz
version: build-42
section: vehicles
category: reference
difficulty: intermediate
tags:
  - vehicle-ui
  - mechanics-window
  - isui
excerpt: >-
  How vanilla presents vehicles, where to hook it, and the traps that only
  appear at some UI scales. Companion to 20-vehicle-engine-reference.md.
last_updated: '2026-09-29'
---
# Vehicle UI reference

> Source: 21-vehicle-ui-reference.md (compiled 2026-09-01, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

How vanilla presents vehicles, where to hook it, and the traps that only appear
at some UI scales. Companion to `20-vehicle-engine-reference.md`.

Design *judgement* lives in `~/.claude/references/pz-ui-design-lens.md`. This is
the factual half.

---

## 1 · The mechanics window, anatomy

`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, an
`ISCollapsableWindow` at 800x600.

**Visual furniture worth reusing** -- a mod that speaks the game's vocabulary
reads as part of the game:

- a **bordered info rect** at the top: vehicle name, script, type, overall
  condition, mass, engine power
- a **progress bar inside it**, flashing red on failure and green on success
- a **car diagram** built from layered textures, each part tinted by condition
- **two scrolling lists** with alternating row shading

### The left/right split is a hardcoded whitelist

The entire rule is one line (`:80`):

```lua
local list = self.listbox                                    -- LEFT
if i == "door" or i == "bodywork" or i == "lights" then
    list = self.bodyworklist                                 -- RIGHT
end
```

Right gets door, bodywork, lights. Left gets **everything else**, which is why it
is lopsided: engine, four tyres, four suspensions, four brakes, seats, gas tank.

**It cannot be extended.** A new category lands in the already-heavy left column,
and there is no third list without replacing the window. Column widths come from
the longest part *name* (`MeasureStringX`, `:86`), so the layout is text-driven
rather than content-driven.

### The car diagram already exists

`media/ui/vehicles/mechanic overlay/` ships **314 textures**, keyed by body type
and part:

```
4door_base.png  4door_engine.png  4door_suspension_rear_right.png  ...
```

Drawn as a base image plus per-part overlays tinted by condition (`:918`, `:936`).
Prefix from `ISCarMechanicsOverlay.CarList[name].imgPrefix`.

**Keyed to vanilla body types.** A modded vehicle has no entry, so any spatial
layout needs a non-spatial fallback.

## 2 · Vanilla gates actions, never information

The important finding, and the design opportunity.

Every `getPerkLevel(Perks.Mechanics)` check in the file gates whether an *option
appears* -- repair, uninstall, focus headlight (`:325`, `:333`, `:344`, `:355`,
`:651`, `:671`, `:694`, `:714`).

**Not one gates what the panel displays.** Lines 1172-1331 draw, unconditionally:
overall condition, mass, engine power, per-part condition, item name and weight,
remaining uses, engine temperature, engine loudness, engine quality, wheel
friction, total braking force, door open/locked/lock-broken state.

A character with Mechanics 0, no tools and no idea what a crankshaft is reads
exact numeric condition on every part of a car they have never touched.

`DBG: Gain XP: true` (`:1339`) is debug-only and is a readout of the anti-grind
flag -- see `20-vehicle-engine-reference.md` §7.

## 3 · Where to hook

### One choke point covers every route

Two ways into the mechanics window:

- the hood -- `Vehicles.Use.EngineDoor` (`Vehicles.lua:831`)
- the radial -- `ISVehicleMenu.onMechanic` (`ISVehicleMenu.lua:188`, `:297`)

Both end at:

```lua
ISTimedActionQueue.add(ISOpenMechanicsUIAction:new(character, vehicle, part))
```

So **`ISOpenMechanicsUIAction:perform()` is a single interception point**,
including for routes vanilla might add later. `ISVehicleMenu.lua` alone builds
that action in four places, so patching entry points individually is four chances
to miss one.

**Chain it, never assign over it.** Project Summer Car assigns straight over
`ISVehicleMechanics:doPartContextMenu`, and two mods doing that silently fight.

Three things a chained `perform()` must do:

1. **Call `ISBaseTimedAction.perform(self)` on every path**, or the action never
   leaves the queue and everything behind it stalls -- which reads as a freeze,
   not a UI bug.
2. **Be idempotent.** Mark the function; the Lua debugger's reload would
   otherwise chain your wrapper onto itself and stack two panels per open.
3. **Provide a route back to vanilla's window**, with a one-shot bypass flag so
   your own hook does not immediately grab that call back.

### Where "Open Hood" comes from

The radial, not a context menu, and only when standing at the **front** of the
car -- `ISVehicleMenu.lua:316` uses `vehicle:getUseablePart(playerObj)`, which
returns the one door-ish part nearest the player. A removed hood offers no slice
at all, because the code also requires `doorPart:getInventoryItem()`.

## 4 · ISUIElement traps

Every one of these has cost real time.

### `FONT_HGT_SMALL` is not a global

It appears in dozens of vanilla UI files and **every one declares its own
file-local copy** (`ISVehicleMechanics.lua:13`). Referencing it unqualified reads
nil and fails on the first arithmetic, at panel construction.

```lua
local FONT_HGT_SMALL = getTextManager():getFontHeight(UIFont.Small)
```

Measure it -- the player's font-size option changes it at runtime.

### `ISCollapsableWindow` covers its own bottom edge

`createChildren()` adds **two** resize widgets, and the second is the trap:

```lua
ISResizeWidget:new(0, self.height-rh, self.width-rh, rh, self, true)
```

A **full-width strip across the entire bottom edge**, not just the corner grip.
Anything inside it is unclickable.

`rh = (BUTTON_HGT/2)+2` and `BUTTON_HGT = FONT_HGT_SMALL + 6`, so **it scales
with the font option** -- a button overlapping it is broken at some UI scales and
fine at others. Vanilla reserves for it (`ISVehicleMechanics.lua:141`):

```lua
local rh = self.resizable and self:resizeWidgetHeight() or 0
```

### `setWantKeyEvents(true)` swallows `Events.OnKeyPressed`

A panel that claims keyboard events stops global key handlers firing while it is
open. This silently disabled a debug probe's numpad keys, and would equally eat a
player's hotbar and movement keys.

**Only set it if the panel actually handles keys.**

### `doDrawItem` must return the next y

`ISScrollingListBox.doDrawItem(y, item, alt)` -- returning nothing stacks every
row on the first, with no error.

Assign it onto the listbox and set `listbox.parent`, per
`ISVehicleMechanics.lua:161`. Inside it, `self` is the **listbox**, not your
panel.

### `render()` and `prerender()` run every frame

~60 times a second. A container scan there runs sixty times a second forever.
Refresh on a counter or an event.

### Item icons work on empty slots

`item:getTex()` for an instance; `getNormalTexture()` on the script item
(`Item.java:532`) when nothing is fitted. So a slot can show a greyed icon of
what *should* be there -- something vanilla structurally cannot do, since it has
no per-part art.

## 5 · Multi-mod hook ordering

Mods load alphabetically, so two mods wrapping the same UI function end up nested
in name order and the **outermost decides first**.

**Do not rely on that.** It is alphabetical accident, inverts if either mod is
renamed, and "two panels race for one click" is not a state to leave to chance.
Have the lower-priority mod check for the higher one and stand down explicitly.

`OutcastLib.Compat.has` refuses to answer at file scope and says so -- the mod
list is not built during load, and returning false for "I could not check" is
indistinguishable from "not installed". Ask at first use instead; a click is
always well after `OnGameStart`.
