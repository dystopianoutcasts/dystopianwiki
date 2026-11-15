---
id: build-42-media-registries-lua-the-new-b42-identifier-file
slug: media-registries-lua-the-new-b42-identifier-file
title: 'media/registries.lua: the new B42 identifier file'
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - mod-info
  - registries-lua
  - project-structure
  - workshop-upload
  - debug-mode
excerpt: >-
  How a mod adds its own traits, item tags, moodles and other identifiers in 42.22: where media/registries.lua goes, when it runs, which register calls Lua can make, and the id rules.
last_updated: '2026-11-15'
related_articles:
  - b42-status-versioning-and-the-compatibility-model
  - mod-info-fields-and-the-versioning-compatibility-system
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - lua-folder-load-order
  - lua-load-order-and-the-three-lua-folders
  - editing-items-at-load
  - trait-reference
  - modding-add-a-trait
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders adding an identifier](#how-to-register-one) | [modders porting from Build 41](#porting-from-build-41)

:::callout[The 1-minute version]{kind=key}
- A mod's `media/registries.lua` is run before the scripts load, from the version folder or, when that has none, from `common`.
- Inside it you call `<Type>.register("yourmod:name")` to add an identifier, such as a trait, an item tag or a moodle.
- The engine refuses an id in the `base` namespace for a mod, and it stores every id in lower case.
- In scripts you write the string id (`yourmod:name`), and in Lua you keep the object that `register` returned.
- Of the types the engine keeps a registry for, 14 are exposed to Lua with a `register` call, and for the others it was not verified that Lua can register.
- The file is run only for a mod that is available, which depends on `versionMin`, `versionMax` and `require`.
:::

:::facts
- **Registries in the engine** 36
- **Types exposed to Lua with a `register` call** 14
- **Namespace refused for mods** `base`
- **Run before** the scripts load
:::

## Where the file goes and when it runs

The game runs `media/registries.lua` of each available mod before it loads any script, and it takes the file from the mod's version folder first.

The loader looks for `<version folder>/media/registries.lua`, and only when that file does not exist does it look for `common/media/registries.lua`. :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`)] The file sits directly under `media`, beside `lua` and `scripts`, and its name must be exactly `registries.lua`. :cite[(`zombie/scripting/objects/ModRegistries.java:20-24`)]

On the client the call happens in the window start-up before the script manager loads. :cite[(`zombie/GameWindow.java:208-210`)] The same call is made again when Lua is reset and when the dedicated server starts. :cite[(`zombie/core/Core.java:3470`, `zombie/core/Core.java:3528`, `zombie/network/GameServer.java:1494`)]

Only mods that `getAvailableModDetails` returns are run, so a `versionMin`, `versionMax` or `require` that switches a mod off also skips its registry file. :cite[(`zombie/scripting/objects/ModRegistries.java:16-19`, `zombie/gameStates/ChooseGameInfo.java:166-169`)] See [Build 42 status and versioning](/pz/build-42/modding/foundations/b42-status-versioning-and-the-compatibility-model) for those rules. How this fits with the other load steps is in [Lua folder load order](/pz/build-42/modding/foundations/lua-folder-load-order) and [Editing items at load](/pz/build-42/modding/changing-vanilla/editing-items-at-load).

## What is registered

The engine keeps one registry for each identifier type, and each registry holds the vanilla ids first.

:::chips[The registries in `Registries.java`]
ammo_type
book
book_subject
brochure
business
catalogue
character_profession
character_trait
comic_book
doodle
doodle_kids
flier
game_mode
genericMail
locket
tile_property_key
item_body_location
item_tag
item_type
job
magazine
magazine_subject
meta_recipe
moodle_type
newspaper
old_newspaper
pet_name
photo
postcard
rpg_magazine
season_recipe
sound_key
survival_guide_entry
weapon_category
container_type
keybind_id
:::

That is every registry the class creates, and the names above are the strings it passes. :cite[(`zombie/scripting/objects/Registries.java:25-60`)] The `Registries` class itself is exposed to Lua, so a script can read any of them, for example `Registries.FLIER:values()`. :cite[(`zombie/Lua/LuaManager.java:2288-2290`, `media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:333`)]

The types the engine exposes to Lua, and that have a public `register`, are `AmmoType`, `Brochure`, `CharacterProfession`, `CharacterTrait`, `Flier`, `ItemBodyLocation`, `ItemTag`, `ItemType`, `MoodleType`, `Newspaper`, `WeaponCategory`, `GameMode`, `SurvivalGuideEntry` and `KeybindId`. :cite[(`zombie/scripting/objects/AmmoType.java:13`, `zombie/scripting/objects/Brochure.java:13`, `zombie/scripting/objects/CharacterProfession.java:12`, `zombie/scripting/objects/CharacterTrait.java:12`, `zombie/scripting/objects/Flier.java:13`, `zombie/scripting/objects/ItemBodyLocation.java:12`, `zombie/scripting/objects/ItemTag.java:12`, `zombie/scripting/objects/ItemType.java:12`, `zombie/scripting/objects/MoodleType.java:12`, `zombie/scripting/objects/Newspaper.java:14`, `zombie/scripting/objects/WeaponCategory.java:12`, `zombie/Lua/LuaManager.java:1805`, `zombie/Lua/LuaManager.java:1883-1884`)] `GameMode` and `SurvivalGuideEntry` take other arguments than a single id: `GameMode.register` takes an id and a Boolean, and `SurvivalGuideEntry.register` takes an id, a sub-category and two lists. :cite[(`zombie/core/GameMode.java:69`, `zombie/core/SurvivalGuideEntry.java:381`)] The `ContainerType` that the Lua environment exposes is a different class, `ContainerID.ContainerType`, so the registry class `ContainerType` has no Lua `register`. :cite[(`zombie/Lua/LuaManager.java:2253`)]

Other types, such as `Book`, `Magazine` and `SoundKey`, have a `register` method in Java but no exposure mark, and whether Lua can call it was not verified. :cite[(`zombie/scripting/objects/Book.java:1751`, `zombie/scripting/objects/Magazine.java:229`, `zombie/scripting/objects/SoundKey.java:3621`)]

## How to register one

Each exposed type has a `register` call that takes your id, and most of them return the new identifier object.

Name every id with your own prefix and a colon, for example `testmod:nimblefingers`. :cite[(`zombie/scripting/objects/ResourceLocation.java:33-37`)] An id with no colon is put in the `base` namespace, and the engine throws "Default namespace 'base:...' is not allowed!" when a mod registers into it. :cite[(`zombie/scripting/objects/RegistryReset.java:22-29`)] The engine also lower-cases both halves of the id. :cite[(`zombie/scripting/objects/ResourceLocation.java:21-30`)] Registering the same id twice in one registry throws "Tried to register duplicate object". :cite[(`zombie/scripting/objects/Registry.java:39-47`)]

A registry file for a mod called `testmod`:

```lua
CharacterTrait.register("testmod:nimblefingers")
CharacterProfession.register("testmod:thief")
ItemTag.register("testmod:bobbypin")
Brochure.register("testmod:Village")
Flier.register("testmod:BirdMilk")
ItemBodyLocation.register("testmod:MiddleFinger")
ItemType.register("testmod:gamedev")
MoodleType.register("testmod:Happy")
WeaponCategory.register("testmod:birb")
-- the List.of form of the next line was not verified in Lua
Newspaper.register("testmod:BirdNews", List.of("BirdKnews_July30", "BirdKnews_July2"))
AmmoType.register("testmod:duck_bullets", "bullets_666")
```

The signatures behind that file are one string for most types, a string and a list of issue names for `Newspaper`, and two strings for `AmmoType`. :cite[(`zombie/scripting/objects/CharacterTrait.java:128-130`, `zombie/scripting/objects/Newspaper.java:74-76`, `zombie/scripting/objects/AmmoType.java:60-62`)] The second string of `AmmoType.register` is stored as the ammo's item key, and the format that key must have was not verified. :cite[(`zombie/scripting/objects/AmmoType.java:60-62`)] This file was not run in a game.

To use an identifier from Lua later, keep what `register` returns:

```lua
MyModName = {}
MyModName.ItemTag = {}
MyModName.ItemTag.MY_TAG = ItemTag.register("mymodname:my_tag")
```

`ItemTag.register` returns the new tag object, and `hasTag` on an item accepts such objects, for example `item:hasTag(MyModName.ItemTag.MY_TAG)`. :cite[(`zombie/scripting/objects/ItemTag.java:497-507`, `zombie/inventory/InventoryItem.java:321`)]

## Using the id in scripts

Scripts write the string id, and only Lua code uses the object that `register` returned.

Vanilla scripts show the shape: an item names its type and tags as `base:` ids, with several tags separated by `;`. :cite[(`media/scripts/generated/items/alarmclock.txt:6-11`)] A trait block names its own trait id in `CharacterTrait = base:adrenalinejunkie`. :cite[(`media/scripts/generated/characters/character_traits.txt:3-10`)] A mod writes the same lines with its own prefix on the tag. Keep `ItemType = base:normal` (or another vanilla type) on an item: the item builder has a branch for each vanilla item type, and an item with a custom type is left empty and then used, which fails when the item is made. :cite[(`zombie/scripting/objects/Item.java:1492-1494`, `zombie/scripting/objects/Item.java:1833-1835`)]

```
module Base
{
    item HandmadeBobbyPin
    {
        Weight = 0.01,
        ItemType = base:normal,
        Tags = testmod:bobbypin,
    }
}
```

The trait block's other keys, its cost and its exclusions, are in [Trait reference](/pz/build-42/modding/skills-and-traits/trait-reference) and [Adding a trait](/pz/build-42/modding/skills-and-traits/modding-add-a-trait).

## Porting from Build 41

A Build 41 mod has no `registries.lua`, so any identifier it defined has to be registered in this file.

Moodle types, item tags, ammo types and the other types listed above are registered here in Build 42. A mod that relied on adding them some other way needs a `registries.lua` with the matching `register` calls. For the other changes a port needs, see [Porting from Build 41: a concrete checklist](/pz/build-42/modding/foundations/b41-b42-porting-what-breaks-a-concrete-checklist).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and vanilla scripts. No game was run, and the example registry file was not loaded. Not verified: which Build 42 version first had the system, whether Lua can call `register` on the types that carry no exposure mark, the format of the `AmmoType` item key, how the vanilla trait and profession blocks refer to a trait a mod registered, and what each registry's vanilla entries are used for.
:::
