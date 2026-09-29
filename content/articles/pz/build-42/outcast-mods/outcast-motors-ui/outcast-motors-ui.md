---
id: build-42-outcast-motors-ui
slug: outcast-motors-ui
title: Outcast Motors UI
game: pz
version: build-42
section: outcast-mods
category: outcast-motors-ui
difficulty: beginner
tags:
  - outcast-motors-ui
  - vehicles
  - ui
  - overview
excerpt: >-
  A replacement for the vehicle mechanics window that shows you the whole car at
  once, on the car.
last_updated: '2026-09-29'
---
# Outcast Motors UI

> Source: OutcastMotorsUI/README.md (compiled 2026-09-28, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A replacement for the vehicle mechanics window that shows you the whole car at
once, on the car.

Build 42 only. Requires **OutcastLib**, declared as `require=OutcastLib` in
`mod.info` so the game loads it first and marks this mod unavailable -- with a
log line -- if it is missing.

## What you get

The same window, opened the same ways: the mechanics keybind, the vehicle radial
menu, or walking to a hood. This mod intercepts the action that opens it, so
every route in still works and nothing else about the vehicle changes.

What is different is what you see.

**The car, drawn from the game's own diagram art.** Vanilla ships a top-down
image for each body type and uses it only as decoration beside two lists. Here it
is the navigation: click a wheel and you get that corner, click the hood and
you get the engine bay. Everything outside the region you are looking at dims
back, so the part you care about is the bright one.

**Parts as tiles, with icons.** Vanilla's window is two scrolling lists split by
a hardcoded three-name whitelist, and thirty-nine part types never appear in
either. This one groups by where the part is on the car, shows every part the
vehicle declares, and fits three or four to a row instead of one.

**Your character walks there.** Choose the front left wheel and they walk to the
front left wheel. Choose the engine bay and they walk to the front and open the
hood -- and close it again on the way out, but only if they were the one who
opened it.

**Right-click is vanilla's.** Install, uninstall and repair are the base game's
own context menu, with its skill gates, tool requirements, timed actions and
multiplayer path intact. This mod draws a window; it does not reimplement the
mechanics.

**Condition is in the plate, not in a colour.** A tile's backing plate and its
icon carry the same information at three strengths -- fitted, unknown, missing --
so presence reads at a glance without a second colour language competing with
condition. Nothing is hue-coded: colour means condition and only condition.

**Parts nobody can touch are not drawn.** Vanilla declares parts that have no
item, no install or uninstall table, no container and no player-facing lua hook
-- a row you can look at and never act on. Those are hidden. The rule is more
delicate than it reads: the obvious version of it deletes the Engine, and the
version after that hides the glove box, so it probes for an item type, install
and uninstall tables, a container, and the three hooks a player can actually
reach (`use`, `checkEngine`, `checkOperate`). Parts vanilla hardcodes an
affordance for, such as the lightbar, are kept by name.

**A car that shows no engine says why.** Where a body cannot display an engine,
the window carries the reason rather than an empty bay -- a cab-over van's engine
sits under the seats, a race car's nose has no room for one. The sentence comes
from the mod that owns the geometry, so it stays true when the geometry changes.

## Train Mechanics

The one action this window adds of its own, and only when another mod publishes
the capability.

Remove and refit the parts on a car in sequence, to practise. The button appears
only if a registered provider publishes `trainBuild`, `trainStart` and
`trainStop`; with no such provider there is no button and no trace of one. It
reports how many parts a run covers and how many of them can still teach you
something, refuses a run that cannot teach anybody anything, and says why in
words rather than a flash.

While a run is going the button reads **Stop after this part**, which is the
promise it keeps: it finishes the part in hand rather than abandoning it.

## How the window reads

Top to bottom, one question at a time:

1. **The headline** -- can I drive this, and why not.
2. **The chip strip** -- which group of parts you are looking at. One chip per
   group that has parts, coloured by the WORST part in it, with its count on the
   chip. Chips wrap onto a second row rather than shrinking past legibility.
   Under the Hood is its own group -- the battery, cooling, belts and the
   gearbox -- separate from the engine internals and from the headlights.
3. **The tray** -- the parts in that group, as tiles: icon, name, condition bar.
   Hover a tile and its exact reading shows in a tooltip, without clicking it.
4. **The detail band**, docked at the bottom -- everything about the one part you
   clicked, in the same place the Fluids view keeps its own detail strip.

The car picture is a second way into the same thing: click a part on it and you
get that part and its group. On a vehicle with no picture there is no left pane
at all and the tray takes the width.

This replaced three separate ways of saying which group was on screen -- a column
under the picture, a fallback column instead of the picture, and a heading over
the tray -- after the owner called the window "messy and pretty busy" on
2026-09-27.

**Parts and Fluids** is a switch at the top right, because it changes what you are
looking at. The bottom row holds only things you DO: 3D, Train, Close.

## Fluids

A **Fluids** button beside Close, shown only when a registered provider publishes
`listFluids`. It swaps both panes for one card per fluid, worst first, under a
line that names everything needing attention.

Three layers, because a glance and a reading are different jobs:

- **A chip strip**, one chip per fluid in a fixed slot. It carries STATE only --
  blue fresh, green good, yellow watch, orange a named problem, red costing you the car -- so it is read by position
  rather than by text. A chip is also a selector.
- **One line per fluid**: name, level bar in the state colour with the
  provider's damage mark on it, a thin wear strip under it, the percentage, and a
  state word. All fluids fit without scrolling, worst first. Brightness is the
  second channel: a quiet fluid draws dim, and one doing damage pulses on
  vanilla's own alarm alpha.
- **A detail strip** for the selected fluid: every figure the provider reports,
  from litres to what it is wearing per game minute.

**Nothing is gated by skill** -- full knowledge is the baseline, and hiding comes
later. **A value the server has not sent is "no reading"**, never drawn as fine.
A refusal that every fluid shares -- "you are in the car" -- is drawn once above
the rows rather than on each. The base game's fuel tank is a row too.

**Change** and **Top up** run the provider's own Service action; a refusal is the
provider's sentence, printed on the card. No damage line is drawn until the
provider publishes it, because a copy of another mod's threshold drifts. The view
never names what caused a contamination -- the water in the oil is data, and what
let it in is for the player to work out.

Not yet run in a live game.

## The 3D button

Honestly experimental. The base game ships a complete live vehicle viewer -- real
paint, real damage, drag to rotate -- that nothing in the game ever opens. This
offers a way in. It may show your car and it may show nothing; if it fails, the
2D diagram carries on untouched and the button removes itself.

## The radio has a box

The base game draws no radio on any of the thirteen bodies, so there is nothing
to click and nothing to derive a rectangle from -- the radio was reachable only
through the Cabin row under the picture. This draws a box for it, in the margin
beside the cabin that every shipped body leaves empty, carrying the radio's own
inventory icon. A missing radio draws its frame in vanilla's missing-part red.

Left-click selects it like any part; right-click opens vanilla's own install,
uninstall and repair menu, which the radio always had. The box is checked against
every rectangle the installed game ships, so it cannot quietly come to sit on top
of one (`tests/test_insets.lua`).

**It is not the top-left box on the diagram.** That one is the battery
(`PartList["Battery"]`, x 48-92, y 64-99), with the engine inset beside it.

## It shows other mods' parts too

Any mod can register parts into this window through
`OutcastLib.VehicleParts`. They arrive as their own group, in their own order,
alongside the vehicle's own parts rather than in a second screen.

**Outcast Motors** is the reason this exists. It simulates engine internals that
vanilla has no way to display -- spark plugs, a cylinder head, a crankshaft --
and a car with all of that under the hood needs somewhere to show it.

Neither mod requires the other. This one works on any car with or without Outcast
Motors installed, and Outcast Motors falls back to its own smaller panel if this
mod is absent. They meet through the registry and nowhere else.

When a registered part turns out to be a real vehicle slot -- which is how a mod
gets vanilla's install and uninstall for free -- it is drawn once, keeping the
mod's grouping and gaining the game's own actions.

## Hit rectangles vanilla never drew

The game pairs each part with a picture and, usually, a rectangle to click.
Usually: headlights carry artwork for all thirteen body types and a rectangle for
none of them, vans have no rectangle for either front door, and trailers have
none for their own wheels. Those parts draw on the diagram and cannot be clicked
-- in vanilla's own window too, since it reads the same table.

This mod ships **59 rectangles** measured from the game's own artwork, filling
only the gaps. Where vanilla has a rectangle, vanilla's is used unchanged.

`tools/derive-missing-rects.py` regenerates them.

## What it will not do

- **It does not tell you whether the car will start.** It reports the parts in
  front of it. Whether an engine turns over is the simulation's business, and a
  window that contradicts the simulation is worse than one that says less.
- **It adds no actions of its own except Train Mechanics and the Fluids view's
  Service buttons**, and those are performed by the mod that publishes the
  capability, not here. Everything else
  you can do to a part is vanilla's or the registering mod's, performed on the
  side that owns it.
- **It writes no save data** and changes no vehicle.
- **It does not replace the vehicle radial menu**, only the mechanics window.
- **The mechanics window it replaces is fully replaced.** There is no route back
  to vanilla's, because there is nothing left there to go back for: the part
  context menu, install, uninstall, repair and the whole debug and cheat block
  are all reached from this window, and the first four are literally vanilla's
  own code called with this panel as `self`. The one thing not carried across is
  vanilla's hover tooltip over the diagram, whose contents -- part name, fitted
  or missing, condition -- this window shows in the detail band instead, on
  click rather than on hover.

## Modded vehicles

The picture comes from the base game's table of vehicle names, and a reskin is
meant to name the picture it wears -- the base game's own reskins always do. One
that names nothing, and has no entry of its own, now **borrows the picture of the
listed vehicle wearing the same body mesh**, but only when every listed vehicle
on that mesh agrees on one picture. Otherwise, and for a vehicle on a body of its
own, the window shows a region column instead of the picture and everything else
works the same. The log says which picture was borrowed, or that none was, once
per car.

## Controller support

**None. This mod does not support controllers**, decided by the owner
2026-09-09. Mouse and keyboard are the supported inputs and the only ones any
part of this window is designed around.

Joypad handlers do exist in the code and are left in place -- the d-pad moves
between regions and tiles, **A** opens a part's menu, **B** closes. They are
**unsupported**, were never verified with a physical controller, and a control
that a pad cannot reach is not a defect here. Two buttons -- the 3D toggle and
Train Mechanics -- have no binding at all, and that is now by design rather than
an omission.

Anything the handlers do not cover is out of scope rather than outstanding. If
they are ever removed, this section goes with them.

## Multiplayer

Display is client-side and safe there: part condition arrives by the server's
own sync, and this window only reads it.

Opening the panel asks the **server** to wake the vehicle so a never-driven car
fills in its parts. That has to happen server-side -- a multiplayer client never
runs the part update loop at all -- so the client sends an id and the server
resolves the vehicle, checks you are near it, and acts.

**Verified on a dedicated server**: the window opens, reads the server's own part
data, and the wake request is the one thing it sends. It awards no XP of its own,
writes no save data and changes no vehicle, so there is nothing here for a client
to get wrong and a server to have to undo.

Train Mechanics is the newest part and the least proven in a live game.

## Options

None yet. Information gating -- where what your character can determine about a
car depends on what they know -- is designed and deliberately switched off until
the professions engine it depends on exists. Everything is fully readable today.

## Developing

```
cd tests && lua test_all.lua
```

**1675 assertions across 16 suites**, headless, no game required. `pz_stub.lua`
models the engine surface this mod touches; `harness.lua` resolves `require`
against the real OutcastLib next door rather than a vendored copy.

`test_lint.lua` is a build gate rather than a unit suite. Among other things it
fails when a file captures a module it does not `require` -- the fault that once
stopped the window opening on every car in the game -- and when a
player-visible feature is shipped with no mention of it anywhere a subscriber can
read.

`tools/derive-missing-rects.py` regenerates the hit rectangles from the game's
artwork. It needs Pillow.

## Status

- Verified in single player across five sessions.
- **Verified on a dedicated server** -- the window opens and reads the server's
  own part data. Nothing custom is sent except one wake request, which the
  server validates before acting.
- **Train Mechanics has not been used in a live game.** It is wired end to end
  against the published contract and covered by 58 assertions; no one has pressed
  it on a car.
- The plate strengths (`0.22 / 0.12 / 0.04`) are a judgement nobody has been able
  to make yet, because nobody has seen them on a screen. They are named constants
  so a screenshot settles it in one move. Do not adjust them from reasoning.
- The description line at the largest UI font size may overrun its pane. Known,
  unfixed, unhit so far.
- Information gating is built and switched off, waiting on the professions
  engine.
- `preview.png` is a placeholder. It blocks a public listing and nothing else;
  the item ships `visibility=unlisted`.

Under the owner's release policy, none of the above is a reason to hold a build:
shipping to testers is the test. A build is held only for a false claim in the
description, a red check, or a staging mistake.

## Credits

Raxdeg / Dystopian Outcasts.
