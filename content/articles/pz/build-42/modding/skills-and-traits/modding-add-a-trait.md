---
id: build-42-modding-add-a-trait
slug: modding-add-a-trait
title: 'Modding: add a TRAIT'
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - skills
  - traits
  - professions
  - xp
  - craftrecipe-gating
excerpt: >-
  MAJOR B42 CHANGE -- the old TraitFactory Lua route is superseded. B42 uses a
  script-based character_trait_definition plus a trait registry. This is
  [CONFIRMED via pzwiki "Creating a trait mod"...
last_updated: '2026-09-29'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
  - traits
  - professions-occupations
  - modding-add-a-skill
  - modding-add-a-profession
  - recipe-gating-in-b42-scripts
  - skill-ui
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
  - trait-modding-correction
---
# Modding: add a TRAIT

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**MAJOR B42 CHANGE -- the old `TraitFactory` Lua route is superseded.** B42 uses a
**script-based `character_trait_definition`** plus a **trait registry**. This is
**[CONFIRMED via pzwiki "Creating a trait mod", revid 1387543, page ver 42.13.0]**.
The three steps are: (1) register the trait, (2) define it in a script, (3)
reference it in Lua for any custom behavior.

> The previous draft's `TraitFactory.addTrait(id, name, cost, desc, professionBool)`
> / `t:addXPBoost(...)` / `t:addFreeRecipe(...)` / `TraitFactory.setMutualExclusive(...)`
> snippet was the **B41** API and is now incorrect for B42's primary flow. It is
> replaced below. A legacy Lua route still exists (`CharacterTraitDefinition
> .addCharacterTraitDefinition`, see 9d) but the script route is canonical.

### 9a. Step 1 -- Register the trait (`media/registries.lua`)

```lua
--- FILE: media/registries.lua

-- global that holds all your mod's registries (namespace everything under one mod)
_MyModRegistries = {}

_MyModRegistries.traits = {
    -- "mymod:mytrait" is the trait identifier; "mymod" is your mod namespace
    MyTrait = CharacterTrait.register("mymod:mytrait")
}
```

Then expose it as a module so other scripts can `require` it:

```lua
--- FILE: media/lua/shared/MyMod/Registries.lua

-- returns the global populated by media/registries.lua
return _MyModRegistries
```

`CharacterTrait.register("mymod:mytrait")` returns the registry key you use for
`player:hasTrait(...)` checks. Use a consistent `mymod:` namespace across all your
registries. **[CONFIRMED]**

### 9b. Step 2 -- The `character_trait_definition` script

Placed in a `media/scripts/*.txt` file inside a `module` block:

```
module MyMod {
    character_trait_definition mymod:mytrait {
        /* Identifier -- must match CharacterTrait.register */
        CharacterTrait = mymod:mytrait,
        /* Translation key for the display name */
        UIName = UI_trait_mymod:mytrait,
        /* Point cost (positive number = costs points) */
        Cost = 2,
        /* Translation key for the description */
        UIDescription = UI_trait_mymod:mytrait_Desc,
        /* If true, hidden from character creation (occupation-only) */
        IsProfessionTrait = false,
        /* If true, not selectable in multiplayer */
        DisabledInMultiplayer = false,
        /* Recipes granted to characters with this trait (semicolon list) */
        GrantedRecipes = MakeSawPlank;SheetMetalWeapon,
        /* Other traits granted automatically (namespaced ids, semicolon list) */
        GrantedTraits = base:smoker,
        /* Starting skill levels granted -- Skill=level pairs (drives the XP boost) */
        XPBoosts = Aiming=1;Reloading=1,
        /* Traits that cannot be taken alongside this one (namespaced, semicolon list) */
        MutuallyExclusiveTraits = base:clumsy;base:deaf,
    }
}
```

Field notes **[CONFIRMED]**:
- `XPBoosts` uses `Skill=level` pairs (the level drives the section-4 permanent XP
  multiplier), NOT a Lua `addXPBoost(Perks.X, n)` call. Skill names are the
  internal perk names (e.g. `Aiming`, `Blacksmith`, `Carving`).
- `GrantedRecipes` replaces the old `addFreeRecipe`.
- `MutuallyExclusiveTraits` replaces the old `setMutualExclusive`.
- `GrantedTraits` bakes in other traits (namespaced, e.g. `base:smoker`).
- `IsProfessionTrait = true` is how you make an occupation-only trait.
- Vanilla traits are referenced with the `base:` namespace (`base:clumsy`,
  `base:deaf`, `base:smoker`).

### 9c. Step 3 -- Reference the trait in Lua (custom behavior)

Use the registry key with `player:hasTrait(...)`:

```lua
-- pull in the registry we built in step 1
local MyModRegistries = require("MyMod/Registries")

---@param player IsoPlayer
local function addItemOnSpawn(player)
    if player:hasTrait(MyModRegistries.traits.MyTrait) then
        player:getInventory():addItem(ItemKey.Weapon.Pistol)
    end
end

-- OnNewGame fires whenever a NEW CHARACTER is created (not only new worlds)
Events.OnNewGame.Add(addItemOnSpawn)
```

**[CONFIRMED]** -- note `Events.OnNewGame` is the spawn hook (fires per new
character), and `player:hasTrait()` takes the registry key, not a string.

### 9d. Legacy alternative -- add a trait purely from Lua

Still available, but the script route above is preferred:

```lua
local function createDynamicTrait()
    local traitName = getText("UI_trait_NightVision")
    local traitDesc = getText("UI_trait_NightVisionDesc")
    local myTrait = CharacterTraitDefinition.addCharacterTraitDefinition(
        CharacterTrait.NightVision,  -- registered CharacterTrait key
        traitName,                   -- display name (already localized)
        2,                           -- cost
        traitDesc,                   -- description (already localized)
        false,                       -- IsProfessionTrait
        false                        -- DisabledInMultiplayer
    )
end
Events.OnGameBoot.Add(createDynamicTrait)
```

`CharacterTraitDefinition.addCharacterTraitDefinition(traitKey, name, cost, desc,
isProfessionTrait, disabledInMultiplayer)`. **[CONFIRMED via pzwiki]**

### 9e. Translations and icon

- **Translations** use the `UI_trait_` prefix and are fetched with `getText`:
  `UI_trait_mymod:mytrait` (name) and `UI_trait_mymod:mytrait_Desc` (description).
  This differs from the perk `IGUI_perks_` convention. **[CONFIRMED]**
- **Icon:** place an 18x18 PNG at `media/ui/Traits/trait_mytrait.png` -- the file
  name is the script id **without** the `mymod:` namespace. **[CONFIRMED]**
