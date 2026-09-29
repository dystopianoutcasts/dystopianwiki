---
id: build-42-ui-overview
slug: ui-overview
title: UI research overview
game: pz
version: build-42
section: modding
category: ui
difficulty: intermediate
tags:
  - ui-overview
  - isui
  - vehicle-mechanics-ui
  - engine-traps
excerpt: >-
  Everything learned about Project Zomboid's Build 42 UI layer while building
  Outcast Motors UI, the vehicle mechanics window replacement.
last_updated: '2026-09-29'
---
# UI research overview

> Source: 00-README.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Everything learned about Project Zomboid's Build 42 UI layer while building
**Outcast Motors UI**, the vehicle mechanics window replacement.

Machine-checked against the installed game at
`R:\Games\Steam\steamapps\common\ProjectZomboid`, not recalled. Every claim
carries a file and line so it can be re-checked rather than trusted.

## Documents

| File | Contents |
|---|---|
| `01-ui-engine-reference.md` | The engine API and the nine traps. **Read section 1 before writing any panel.** |

## The three that cost the most

**1. Anchors must go through the setters.** `btn.anchorBottom = true` does
nothing -- anchoring is enforced by the java object, which `instantiate()`
populates once and never revisits. Presents as elements frozen in place while the
window resizes, and it shipped in two Outcast mods from the same copied lines.

**2. `ISCollapsableWindow` has a full-width resize strip across its entire bottom
edge**, not just a corner grip, and its height scales with the player's UI-scale
option. Anything inside it is unclickable. Scale-dependent, so it works fine on
the machine that built it.

**3. A cold parked car never updates its parts.** Vanilla stops sending part
updates to a car with no driver and no heat, so anything hooked to that update --
population, wear, ageing -- never runs on most of the cars in the world. Call
`setNeedPartsUpdate(true)` when a panel opens.

## Related

- `R:\ZOMBOID\_dev\OutcastMotorsUI\` -- the mod this came out of; `01` there is
  the vanilla mechanics-window analysis in depth
- `R:\ZOMBOID\_dev\B42_Vehicles\` -- vehicle API and mod landscape
- `R:\ZOMBOID\_dev\B42_Traits\` -- trait and profession API
- `~\.claude\references\pz-ui-design-lens.md` -- the *design* lens; this pack is
  the *engine* half and does not replace it
