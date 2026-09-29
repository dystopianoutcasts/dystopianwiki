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
  [CONFIRMED] (pzwiki Registries rev 1392729, page version 42.15.3.) Introduced
  in Build 42.13.0 as "a new system to manage various script elements in a more
  structured way." This is the single...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - b42-status-versioning-and-the-compatibility-model
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - mod-info-fields-and-the-versioning-compatibility-system
  - lua-folder-load-order
  - in-game-debug-mode-and-dev-tools
  - mapping-toolchain-status
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# media/registries.lua: the new B42 identifier file

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED]** (pzwiki *Registries* rev 1392729, page version 42.15.3.) Introduced in **Build 42.13.0** as "a new system to manage various script elements in a more structured way." This is the single largest upgrade over the original snippet research -- the exact identifier set and the registration API are now nailed down.

- **Path:** `media/registries.lua` (inside a version folder's `media/`, or `common/media/`). **The name must be exactly `registries.lua`** to be recognized, and the file "doesn't clash with other mod files." **[CONFIRMED]**
- **Load timing:** loaded **before all other Lua files and before scripts** (pzwiki links this to *Lua (API)#Load order*). This is what makes it the right place to declare identifiers that later scripts/Lua reference. **[CONFIRMED]**
- **Directory position:** at the top of `media/`, beside `lua/` and `scripts/`, not inside them. **[CONFIRMED]**

### The identifiers it manages **[CONFIRMED]** (exact list from pzwiki *Registries*)

Registries define these identifier types:

- `CharacterTrait`
- `CharacterProfession`
- `ItemTag`
- `Brochure`
- `Flier`
- `ItemBodyLocation`
- `ItemType`
- `MoodleType`
- `WeaponCategory`
- `Newspaper`
- `AmmoType`

### The registration API **[CONFIRMED]** (from pzwiki *Registries* examples)

Each type exposes a `.register("modname:id")` function. Most registry functions return an identifier object you can store for later use. Namespace your IDs with a `modname:` prefix. Example registration file:

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
Newspaper.register("testmod:BirdNews", List.of("BirdKnews_July30", "BirdKnews_July2"))

local item_key = ItemKey.new("bullets_666", ItemType.NORMAL)
AmmoType.register("testmod:duck_bullets", item_key)
```

Storing a reference so Lua can use it later:

```lua
MyModName = {}
MyModName.ItemTag = {}
MyModName.ItemTag.MY_TAG = ItemTag.register("mymodname:my_tag")
```

> **Important [CONFIRMED]:** in **scripts** you reference the **string ID** of the identifier (e.g. `Tags = testmod:bobbypin`), *not* the Lua variable. The Lua variable is only for Lua-API use (e.g. `item:hasTag(MyModName.ItemTag.MY_TAG)`). (pzwiki *Registries*.)

An identifier used across the layers looks like this in scripts (abbreviated from the pzwiki example):

```
character_trait_definition testmod:nimblefingers
{
    IsProfessionTrait = false,
    CharacterTrait = testmod:nimblefingers,
    Cost = 3,
    XPBoosts = Lockpicking=2,
    GrantedRecipes = Lockpicking;CreateBobbyPin,
}

item HandmadeBobbyPin
{
    Weight = 0.01,
    ItemType = base:normal,
    Tags = testmod:bobbypin,
}
```

> **Porting implication:** B41 mods have no `registries.lua`. If your B41 mod added custom moodles, skills/professions, item tags, ammo types, etc., that registration must be **re-authored into `registries.lua`** for B42 using the `.register()` calls above. This is a new required step with no B41 equivalent. **[CONFIRMED]** For deeper per-system use (moodles, skills/perks) see `03_LUA_API_AND_ENGINE.md` and `05_SKILLS_TRAITS_PROGRESSION.md`.

---

<a name="7-loadorder"></a>
