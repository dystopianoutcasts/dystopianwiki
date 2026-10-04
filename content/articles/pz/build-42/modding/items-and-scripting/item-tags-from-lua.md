---
id: build-42-item-tags-from-lua
slug: item-tags-from-lua
title: 'Item tags from Lua: looking one up, and why register is not a lookup'
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - tags
  - itemtag
  - lua-api
  - items
excerpt: >-
  In Build 42 an item tag is an ItemTag object, not a string. Here is how to
  get one from Lua, why ItemTag.register is the wrong tool for that, why there
  is no hasTag(String), and why tags beat DisplayCategory when you sort items.
  Read from the 42.21 code.
last_updated: '2026-10-04'
related_articles:
  - tags
  - items-the-item-block-in-b42
  - vehicle-script-traps
---
# Item tags from Lua: looking one up, and why register is not a lookup

Outcast, if your mod asks "does this item have tag X?", this page saves you an evening. In Build 42 a tag is not a string any more. It is an `ItemTag` object living in a registry, and almost every way of turning a string into one from Lua either fails or does the wrong thing. For what tags are and how scripts declare them, see [Tags](/pz/build-42/modding/items-and-scripting/tags).

## There is no hasTag(String)

`InventoryItem` and the script `Item` both have `hasTag(ItemTag)` and `hasTag(ItemTag...)`, and `getTags()` returns a set of `ItemTag` objects. There is no overload that takes a string. `item:hasTag("base:hammer")` does not ask the question you think it asks.

> **Proof:** Code. `zombie.inventory.InventoryItem#hasTag(ItemTag)`, `#hasTag(ItemTag...)`, `#getTags`; `zombie.scripting.objects.Item#hasTag(ItemTag)`, `#hasTag(ItemTag...)`; no `hasTag(String` anywhere in the engine source. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Two ways that work

**1. Read the static field.** Every base-game tag has a static field on `ItemTag`, named in capitals with underscores. Lua can read static fields, and vanilla does it all the time:

```lua
if item:hasTag(ItemTag.SMOKABLE) then ... end
```

The field name is not the tag's id. The field `ItemTag.BAR_STOCK_HALF` is created as `registerBase("BarStockHalf")`, and the id the game stores is all lower case with a namespace: `base:barstockhalf`. That lower-case id is also what scripts write (`Tags = base:hasmetal;base:ismemento`). So if you start from a script tag, turn `base:barstockhalf` into `BAR_STOCK_HALF` yourself; you cannot get the underscores back from the lower-case id, so keep a small table of the tags you need.

**2. Look it up by id.** This is the general way, and vanilla uses it too:

```lua
local tag = ItemTag.get(ResourceLocation.of("base:hammer"))
if tag and item:hasTag(tag) then ... end
```

`ResourceLocation.of` with no colon assumes the `base` namespace, and lower-cases what you give it. `ItemTag.get` returns the registered tag, or nothing if no tag has that id.

> **Proof:** Code. `zombie.scripting.objects.ItemTag` (static fields such as `BAR_STOCK_HALF = registerBase("BarStockHalf")`, and `#get(ResourceLocation)`); `zombie.scripting.objects.ResourceLocation` (constructor lower-cases namespace and path; `#of` defaults to `base`); call site `media/lua/client/ISUI/Maps/ISMapSymbolDialog.lua`, `inv:containsTagRecurse(ItemTag.get(ResourceLocation.of(info.item)))`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Why ItemTag.register is not a lookup

`ItemTag.register("name")` looks like "give me the tag called name". It is not. It **creates** a tag and adds it to the registry.

- Called with a base-game name (`"BarStockHalf"`, or anything without a namespace, or `base:...`), it throws `Default namespace ... is not allowed` straight away. Mods may not register in the `base` namespace.
- Called twice with your own namespaced id (`"mymod:widget"`), the second call is worse. The registry writes the new object into its maps first and only then notices the duplicate and throws. By then the old entry has been replaced and the list of values holds the tag twice.

Our notes said register could overwrite a base-game tag. On 42.21 it cannot: the namespace check throws before the registry is touched. The double-registration damage is real for your own ids, so register each of your own tags exactly once, at load, and **keep the object it returns**. Your own tag has no static field to read later.

> **Proof:** Code. `zombie.scripting.objects.ItemTag#register(String)` calls `register(false, id)`; `zombie.scripting.objects.RegistryReset#createLocation` throws for the `base` namespace when not allowed; `zombie.scripting.objects.Registry#register` puts into `byObject`, `byLocation` and `values` before it throws `Tried to register duplicate object`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Sorting items: tags, not DisplayCategory

If you are building a "put like with like" feature, you will be tempted by `getDisplayCategory()`. It is too coarse. Here are the vanilla numbers:

| What we counted in `media/scripts/generated/items` | Count |
|---|---|
| Item blocks | 5,105 |
| Distinct DisplayCategory values | 82 |
| Items with DisplayCategory `Material` | 383 |
| Items with at least one tag | 3,527 |
| Distinct tags | 454 |

`Material` alone holds logs, nails, rope, stones and sheets. A storage mod keyed on display category files sticks, stones, nails and rope into the same box. Tags such as `base:log`, `base:isfirefuel`, `base:rope` and `base:hasmetal` are the usable middle rung.

And one surprise inside that: `Plank` is not `Material` at all. It lives in `weapon.txt` with `DisplayCategory = MaterialWeapon`, because a plank is also a weapon. A filter on `Material` silently misses it. `Log` and `Nails` are in `normal.txt` as `Material`.

> **Proof:** Code. Counted in the game's `media/scripts/generated/items` (15 files): `item` blocks, `Tags =` lines (split on `;` for distinct tags) and `DisplayCategory =` values; `Plank` in `weapon.txt`, `Log` and `Nails` in `normal.txt`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Vehicle tool lists use tag objects too

The same rule bites in the vehicle code. `VehicleUtils.getItems` builds a table of what the player carries keyed by tag, and the keys are `ItemTag` objects, so `tagToItem["base:wrench"]` finds nothing. See [Vehicle script traps](/pz/build-42/vehicles/reference/vehicle-script-traps) for the details.
