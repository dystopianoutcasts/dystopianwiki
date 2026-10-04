---
id: build-42-tags
slug: tags
title: Tags
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - tags
  - workstation
  - tech-tiers
  - timedaction
excerpt: >-
  [CONFIRMED] Tags are the join key of the whole B42 crafting system. Three
  places they appear:
last_updated: '2026-10-04'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - timedaction-blocks
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
# Tags

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED]** Tags are the join key of the whole B42 crafting system. Three places they appear:

1. **On items** — `Tags = SharpKnife;IsFireFuel;IronSource,` — declares capabilities/identity.
2. **In recipe inputs** — `item 1 tags[SharpKnife;Scissors]` — "any item with one of these tags satisfies this ingredient." (semicolon = OR inside the bracket.)
3. **On the recipe itself** — `tags = PrimitiveForge,` — used to bind the recipe to a workstation and to surface flags like `AnySurfaceCraft`, `InHandCraft`, `Cooking`, `CanBeDoneInDark`.

Recipe-level tag examples seen in vanilla `[CONFIRMED]`:

- `AnySurfaceCraft` — craftable at any surface (no special station).
- `InHandCraft` — craftable in-hand, no surface.
- `CanBeDoneInDark` — allowed without light.
- `PrimitiveForge`, `Stone_Mill`, `ChurnBucket`, `Scutching`, `DryLeatherLarge` — **workstation-binding tags** (match the entity's `CraftBench.Recipes` list).
- `Cooking` — flags it as a cooking action.

Because ingredients are tags, **a mod tool that adds `Tags = SharpKnife` to its item automatically works in every vanilla recipe that asks for `tags[SharpKnife]`** — this is the sanctioned B42 compatibility pattern; you rarely need to edit vanilla recipes to integrate.

## From Lua, a tag is an object, not a string

Outcast, when you check tags from Lua, a tag is an `ItemTag` object, and `item:hasTag(...)` takes that object, not a string. To turn a tag id from a script into the object, look it up:

```lua
local tag = ItemTag.get(ResourceLocation.of("base:hammer"))
if tag and item:hasTag(tag) then ... end
```

`ResourceLocation.of` assumes the `base` namespace when there is no colon. Base-game tags also have static fields you can read directly, such as `ItemTag.SMOKABLE`.

**`ItemTag.register` is not a lookup.** It creates a new tag. Given a base-game name it throws straight away, because mods may not register in the `base` namespace; given your own id twice, the second call damages the registry before it throws. Register each of your own tags once, at load, and keep the object it returns. The details are in [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua).

> **Proof:** Code. `zombie.scripting.objects.ItemTag#get(ResourceLocation)` and `#register(String)` (`register(false, id)`, through `RegistryReset#createLocation`, which throws `Default namespace ... is not allowed` for `base`); `zombie.scripting.objects.ResourceLocation#of` (no colon means `base`); vanilla call site `media/lua/client/ISUI/Maps/ISMapSymbolDialog.lua` (`ItemTag.get(ResourceLocation.of(info.item))`). Build 42.21.0 (revision 4a0e9546ec).

*Updated 2026-10-04: added how to look a tag up from Lua with `ItemTag.get(ResourceLocation.of(id))`, and why `register` is not a lookup.*
