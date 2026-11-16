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
  - itemtag
  - lua-api
  - items
excerpt: >-
  In Build 42.22 an item tag is an ItemTag object, not a string. How to get one from Lua, why ItemTag.register is not a lookup, why hasTag takes no string, and why tags beat categories for sorting.
last_updated: '2026-11-16'
related_articles:
  - tags
  - items-the-item-block-in-b42
  - vehicle-script-traps
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

Outcast, if your mod asks "does this item have tag X?", this page saves you an evening. In Build 42 a tag is not a string. It is an `ItemTag` object that lives in a registry, and most ways of turning a string into one from Lua either fail or do something else. For what tags are and how scripts declare them, see [Tags](/pz/build-42/modding/items-and-scripting/tags).

**Who this page is for:** [modders checking a tag in Lua](#1-hastag-takes-an-object-not-a-string) | [modders adding their own tag](#3-itemtagregister-is-not-a-lookup) | [modders sorting items](#4-sorting-items-tags-not-displaycategory)

:::callout[The 1-minute version]{kind=key}
- `item:hasTag(...)` takes an `ItemTag` object. The engine has no `hasTag` that takes a string on `InventoryItem` or on the script `Item`.
- Get the object by a static field (`ItemTag.SMOKABLE`) or by id: `ItemTag.get(ResourceLocation.of("base:hammer"))`, which returns nothing for an id nobody registered.
- `ItemTag.register("name")` creates a tag. It is not a lookup, and it throws for any id in the `base` namespace.
- A mod's own tags are registered in `media/registries.lua`, which runs before the scripts load. A script that names a tag nobody has registered adds an empty entry, and the item loader writes no message about it.
- To sort items, tags are finer than `DisplayCategory`: the vanilla scripts use 458 distinct tags and 82 display categories.
:::

:::facts
- **Tags registered by the engine** 464 static fields on `ItemTag`
- **Distinct tags used in vanilla item scripts** 458
- **Distinct display categories** 82
- **Items in the `Material` category** 383 of 5,105
:::

## 1. hasTag takes an object, not a string

**`hasTag` on an item accepts `ItemTag` objects, and no overload accepts a string.**

`InventoryItem` has `hasTag(ItemTag)` and `hasTag(ItemTag...)`, and its `getTags()` returns a set of `ItemTag` objects. :cite[(`zombie/inventory/InventoryItem.java:2953-2963`)] The script `Item` has the same two `hasTag` methods and a `getTags()` of the same kind. :cite[(`zombie/scripting/objects/Item.java:791`, `zombie/scripting/objects/Item.java:3276-3288`)] 

Neither class has a `hasTag` that takes a string. So `item:hasTag("base:hammer")` is not the question you mean to ask. What the Lua runtime does with a string argument there was not tested.

The check inside is a set lookup on the object you pass. :cite[(`zombie/scripting/objects/Item.java:3286-3288`)] `ItemTag` defines no `equals`, so only the very same object matches.

## 2. Two ways to get the object

**Read a static field for a base-game tag, or look the tag up by its id.**

**Read the static field.** Every base-game tag has a static field on `ItemTag`, named in capitals with underscores, and Lua can read it. Vanilla does so all the time:

```lua
if item:hasTag(ItemTag.SMOKABLE) then ... end
```

The field name is not the tag's id. The field `ItemTag.BAR_STOCK_HALF` is created as `registerBase("BarStockHalf")`, and the id the game stores is lower case with a namespace: `base:barstockhalf`. :cite[(`zombie/scripting/objects/ItemTag.java:36`, `zombie/scripting/objects/ResourceLocation.java:25-26`)] That lower-case id is what scripts write. So starting from a script tag you cannot get the underscores back; keep a small table of the tags you need.

**Look it up by id.** This is the general way, and vanilla uses it too:

```lua
local tag = ItemTag.get(ResourceLocation.of("base:hammer"))
if tag and item:hasTag(tag) then ... end
```

`ResourceLocation.of` with no colon assumes the `base` namespace, and it lower-cases both halves. :cite[(`zombie/scripting/objects/ResourceLocation.java:25-26`, `zombie/scripting/objects/ResourceLocation.java:33-36`)] `ItemTag.get` returns the registered tag, or nothing if no tag has that id. :cite[(`zombie/scripting/objects/ItemTag.java:484-486`, `zombie/scripting/objects/Registry.java:50-52`)] A vanilla map window uses this form. :cite[(`media/lua/client/ISUI/Maps/ISMapSymbolDialog.lua:45`)]

### Try it: ask the hammer

**One small Lua file prints the answer to your own console log.**

1. Make the folder `Zomboid/mods/TagCheck/`, with `42/mod.info` and `poster.png` as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton), and the lines `name=Tag Check` and `id=TagCheck` in `mod.info`, so the mod list shows **Tag Check**.
2. Make `Zomboid/mods/TagCheck/42/media/lua/client/TagCheck.lua`:

```lua
local function check()
    local hammer = instanceItem("Base.Hammer")
    local tag = ItemTag.get(ResourceLocation.of("base:hammer"))
    print("TagCheck hammer=" .. tostring(hammer:hasTag(ItemTag.HAMMER))
        .. " byId=" .. tostring(tag ~= nil and hammer:hasTag(tag))
        .. " nobody=" .. tostring(ItemTag.get(ResourceLocation.of("base:nobodyregistered"))))
end
Events.OnGameStart.Add(check)
```

3. Start the game, check **Tag Check** in the mod list, accept, and start a new game.
4. Open `Zomboid/console.txt` and search for `TagCheck`. You should find one line with `hammer=true byId=true nobody=nil`.

The vanilla hammer carries `base:hammer`. :cite[(`media/scripts/generated/items/weapon.txt:2940`, `media/scripts/generated/items/weapon.txt:2985`)] This file has not been run in a game; if the line is missing, check that the mod is enabled and that `console.txt` is from this run.

## 3. ItemTag.register is not a lookup

**`ItemTag.register("name")` creates a tag and adds it to the registry, so use it once per tag of your own and never to find one.**

- Called with a base-game name, or with the `base` namespace written out, it throws a "Default namespace" error right away. :cite[(`zombie/scripting/objects/ItemTag.java:497-499`, `zombie/scripting/objects/RegistryReset.java:22-26`)]
- Called twice with one id of your own, the second call does damage before it throws. The registry puts the new object into its maps and its list first, and only then sees the duplicate and throws. :cite[(`zombie/scripting/objects/Registry.java:39-47`)] The lookup now returns the newer object, the list holds both, and an item that already holds the earlier object in its tags no longer matches the object `ItemTag.get` returns.

Register each of your own tags exactly once, and **keep the object it returns**: your own tag has no static field to read later.

Where the call goes matters too. The engine runs each mod's `media/registries.lua` just before it loads the scripts. It reads the file from the version folder, and from `common` only when the version folder has none. :cite[(`zombie/scripting/objects/ModRegistries.java:17-26`, `zombie/GameWindow.java:208-210`)] 

The item loader turns each `Tags` entry into an object with `ItemTag.get`, and adds whatever comes back to the item, even nothing. :cite[(`zombie/scripting/objects/Item.java:2353-2359`)] A tag registered later than that is missing from every script that names it, and the item loader writes no message about that. [The registries page](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file) shows the file and the rules for ids.

Of the registry types, 14 have a `register` method that Lua can reach, and `ItemTag` is one of them: `AmmoType`, `Brochure`, `CharacterProfession`, `CharacterTrait`, `Flier`, `ItemBodyLocation`, `ItemTag`, `ItemType`, `MoodleType`, `Newspaper`, `WeaponCategory`, `GameMode`, `SurvivalGuideEntry` and `KeybindId`. :cite[(`zombie/scripting/objects/AmmoType.java:13`, `zombie/scripting/objects/Brochure.java:13`, `zombie/scripting/objects/CharacterProfession.java:12`, `zombie/scripting/objects/CharacterTrait.java:12`, `zombie/scripting/objects/Flier.java:13`, `zombie/scripting/objects/ItemBodyLocation.java:12`, `zombie/scripting/objects/ItemTag.java:12`, `zombie/scripting/objects/ItemType.java:12`, `zombie/scripting/objects/MoodleType.java:12`, `zombie/scripting/objects/Newspaper.java:14`, `zombie/scripting/objects/WeaponCategory.java:12`, `zombie/Lua/LuaManager.java:1805`, `zombie/Lua/LuaManager.java:1883-1884`)] The first eleven carry the Lua-exposure mark on the class; the last three are exposed by the Lua manager. The Lua environment exposes `ContainerID.ContainerType`, a different class from the registry type `ContainerType`, so that registry has no Lua `register`. :cite[(`zombie/Lua/LuaManager.java:2253`)] A custom `ItemType` registered the same way is another matter: an item that uses one cannot be created. [Items: the item block in B42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42) explains why.

## 4. Sorting items: tags, not DisplayCategory

**For a "put like with like" feature, `DisplayCategory` is too coarse, and tags are the finer key.**

Here are the vanilla numbers, counted over the 15 files in `media/scripts/generated/items`:

| What we counted | Count |
|---|---|
| Item blocks | 5,105 |
| Distinct `DisplayCategory` values | 82 |
| Items with `DisplayCategory = Material` | 383 |
| `Tags =` lines | 3,529 |
| Distinct tags in those lines | 458 |
| Tag fields on `ItemTag` | 464 |

`Material` alone holds logs, nails, rope, stones and sheets. A storage mod keyed on display category files sticks, stones, nails and rope into the same box. Tags such as `base:log`, `base:isfirefuel`, `base:rope` and `base:hasmetal` are the usable middle rung.

One more surprise: `Plank` is not `Material`. It lives in `weapon.txt` with `DisplayCategory = MaterialWeapon`, because a plank is also a weapon, and a filter on `Material` misses it. `Log` and `Nails` are `Material` items in `normal.txt`. :cite[(`media/scripts/generated/items/weapon.txt:9255-9257`)]

## 5. Vehicle tool lists use tag objects too

**The vanilla vehicle code keys its table of carried items by `ItemTag` objects, so a string key finds nothing.**

`VehicleUtils.getItems` builds `tagToItem` from each carried item's `getTags()`, so the keys are the tag objects. :cite[(`media/lua/server/Vehicles/Vehicles.lua:1037-1040`)] `tagToItem["base:wrench"]` therefore finds nothing, and `tagToItem[ItemTag.WRENCH]` does. See [Vehicle script traps](/pz/build-42/vehicles/reference/vehicle-script-traps) for the rest.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and scripts, and the counts were recounted from `media/scripts/generated/items`. The `TagCheck` file has not been run in a game. Not verified: what the Lua runtime does when `hasTag` gets a string, and whether the 14 types with a Lua `register` call all work from `registries.lua` in a running game.
:::
