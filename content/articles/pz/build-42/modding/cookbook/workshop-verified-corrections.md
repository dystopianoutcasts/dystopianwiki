---
id: build-42-workshop-verified-corrections
slug: workshop-verified-corrections
title: Workshop-verified corrections
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Verified against shipping B42 mods in
  ../13_WORKSHOP_ANALYSIS/patterns/clothing_content.md (Customizable Containers,
  Cheese's Functional Clothing). These fill/fix the clothing + body-location...
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
  - new-workstation
  - new-fluid
  - item-repair
  - evolved-recipe
  - new-trait
  - new-profession
  - new-skill
  - new-animal
  - new-crop
  - lua-gameplay-mod
  - custom-ui
  - custom-moodle
  - sound-mod
  - radio-channel
  - translations
  - map-building-basement
  - vehicle-mod
---
# Workshop-verified corrections

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Verified against shipping B42 mods in `../13_WORKSHOP_ANALYSIS/patterns/clothing_content.md` (Customizable Containers, Cheese's Functional Clothing). These fill/fix the clothing + body-location material above.

### Custom body location -- CONFIRMED wiring (fills the earlier UNCERTAIN gap)
The B42 custom-body-location flow is confirmed live:
1. In `media/registries.lua` at boot: `ItemBodyLocation.register("mymod:MySlot")`.
2. In shared Lua: `BodyLocations.getGroup("Human"):getOrCreateLocation(handle)` then `group:setExclusive(slotA, slotB)` to control which slots block each other.
3. Item scripts / `DoParam` reference the STRING form; vanilla slots are namespaced (`base:back`, `base:webbing`).
Custom slots are what let e.g. a satchel + fanny pack + backpack all be worn at once. (`group:setHidden(...)` exists in B41 but was not exercised by the mods -- still verify.)

### Wearable containers need `CanBeEquipped` (skeleton correction)
A bag/backpack/chest-rig is a CLOTHING item that is ALSO a container. Its `item` block carries BOTH `BodyLocation = <slot>` AND `CanBeEquipped = <slot>` (the equip-as-container field the earlier skeleton omitted), plus `Capacity`, `WeightReduction`, `RunSpeedModifier`, `ConditionAffectsCapacity`.

### New archetype: the runtime item-patcher (not a from-scratch content mod)
A large, popular pattern our cookbook did not name: a mod that authors ZERO items and instead mutates OTHER mods'/vanilla items at runtime.
- Template-level: `ScriptManager.instance:getItem(fullType):DoParam("Capacity = N")`, re-applied on `OnGameStart`/`OnLoad`/`OnSpawnRegionsLoaded` (DoParam only edits the template, resets per session).
- Per-instance: walk live items and call `item:setCapacity()`/`setWeightReduction()`/`setCustomWeight()`; stash randomized stats in ModData with a client->server->client sync round-trip.
- Gate targets with `getActivatedMods():contains(id)`; drive values from `SandboxVars`.
Use this for balance/config mods; note it needs instance walks (template DoParam alone won't resize existing items) and `syncItemFields()` + a command round-trip for MP. Clothing models must be `static = false`.

### Event system note (from `../13_WORKSHOP_ANALYSIS/API_HOOKING_AND_JAVA_BRIDGE.md`)
Custom Lua events are CONFIRMED in B42 vanilla: `LuaEventManager.AddEvent("MyEvent")` to declare, `triggerEvent("MyEvent", ...)` to fire, `Events.MyEvent.Add(fn)` to subscribe -- used by base-game code (`Vehicles`, `ISVehicleDashboard`, `forageSystem`). (Doc 03 previously kept this at LIKELY.) Remember: subscribe with a function REFERENCE (`.Add(fn)`), never `.Add(fn())`.
