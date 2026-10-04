---
id: build-42-trait-api
slug: trait-api
title: Trait API reference
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - trait-api
  - traitfactory
  - gettraits
  - engine-gotchas
excerpt: 'Everything here was verified against the installed builds, not recalled:'
last_updated: '2026-09-29'
---
# Trait API reference

> Source: 03-b42-trait-api.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Everything here was verified against the installed builds, not recalled:

- B42: the installed game (your Steam library's `ProjectZomboid` folder)
- B41: a copy of the Build 41 install, taken 2026-01-31

## The headline: traits were rewritten between B41 and B42

`TraitFactory` **does not exist in B42**. A grep across the whole of `<PZ-B42>/media/lua/` returns zero
hits. Every B41 trait tutorial, snippet, and StackOverflow answer you will find is wrong for B42.

| Concern | B41 | B42 |
|---|---|---|
| Where traits are defined | Lua: `media/lua/shared/NPCs/MainCreationMethods.lua`, via `TraitFactory.addTrait(id, name, cost, desc, isProfession)` | Script: `media/scripts/generated/characters/character_traits.txt`, via `character_trait_definition base:<id> { ... }` |
| Trait identity | plain string, e.g. `"Desensitized"` | `CharacterTrait` enum object, e.g. `CharacterTrait.DESENSITIZED` |
| Read the trait set | `character:getTraits()` (string collection) | `character:getCharacterTraits()` |
| Check a trait | `character:HasTrait("Desensitized")` (capital H, string) | `character:hasTrait(CharacterTrait.DESENSITIZED)` (lowercase h, enum) |
| Add / remove | `character:getTraits():add("Smoker")` | `character:getCharacterTraits():add(CharacterTrait.SMOKER)` |
| Enumerate held traits | iterate `getTraits()` | `character:getCharacterTraits():getKnownTraits()` |
| Enumerate all definitions | `TraitFactory.getTraits()` | `CharacterTraitDefinition.getTraits()` |
| Definition lookup | `TraitFactory.getTrait(name)` | `CharacterTraitDefinition.getCharacterTraitDefinition(trait)` |
| Translations | `media/lua/shared/Translate/EN/UI_EN.txt` | `media/lua/shared/Translate/EN/UI.json` (JSON) |

Note the casing flip on the has-check: B41 `HasTrait`, B42 `hasTrait`. This is a silent failure -- calling
the wrong one is a nil-index crash at best and a silently-false branch at worst.

### Canonical B42 call sites in vanilla

Real examples to copy from, all in the shipped game:

- `media/lua/shared/TimedActions/ISApplyBandage.lua:105` -- `self.character:hasTrait(CharacterTrait.HEMOPHOBIC)`
- `media/lua/client/TimedActions/ISInventoryTransferAction.lua:131` -- `not self.character:hasTrait(CharacterTrait.DESENSITIZED)`
- `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:594` -- `char:getCharacterTraits():add(trait:getType())`
- `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:669` -- `self.char:getCharacterTraits():remove(button.internal)`
- `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:682` -- iterating `getKnownTraits()`

`ISPlayerStatsUI.lua` is the debug trait add/remove panel. It is the single best vanilla reference for a
runtime trait-mutation UI, because it is the only place vanilla adds and removes traits after character
creation.

## Gotcha 1: adding a trait grants none of its side effects

This is the biggest trap and the reason a naive implementation feels broken.

`getCharacterTraits():add(trait)` writes the trait into the character's trait set. It does **not**:

- grant the trait's `GrantedRecipes`
- apply the trait's `XPBoosts`
- honour `GrantedTraits`
- enforce `MutuallyExclusiveTraits`

ETW works around all of this by hand. Its `addTraitToPlayer()` in
`shared/ETW_CommonFunctions.lua` does the add, then explicitly replays the side effects:

```lua
player:getCharacterTraits():add(trait)
addRecipes(player, trait)          -- reads getGrantedRecipes(), pushes into getKnownRecipes()
addXPBoostsFromTrait(player, trait) -- reads getXpBoosts(), pushes into getXp():setPerkBoost()
```

The two helpers, condensed from ETW:

```lua
-- Recipes
local def = CharacterTraitDefinition.getCharacterTraitDefinition(trait)
local freeRecipes = def:getGrantedRecipes()
local playerRecipes = player:getKnownRecipes()
for i = 0, freeRecipes:size() - 1 do
    local recipe = freeRecipes:get(i)
    if not playerRecipes:contains(recipe) then playerRecipes:add(recipe) end
end

-- XP boosts (note the hard cap of 3)
local xpBoostMap = CharacterTraitDefinition.getCharacterTraitDefinition(trait):getXpBoosts()
if xpBoostMap then
    for perk, boostLevel in pairs(transformIntoKahluaTable(xpBoostMap)) do
        local oldBoost = player:getXp():getPerkBoost(perk)
        local newBoost = math.min(oldBoost + tonumber(tostring(boostLevel)), 3)
        player:getXp():setPerkBoost(perk, newBoost)
    end
end
```

`transformIntoKahluaTable` is required to iterate a Java map from Lua.

**Removal is worse.** `remove()` is symmetric in the trait set only -- it does not claw back recipes or XP
boosts. ETW's `removeTraitFromPlayer()` does *not* attempt to. So a gain/lose cycle on an XP-boosting trait
is a one-way ratchet toward permanent boosts. Any design that lets a boosting trait be regained repeatedly
needs to either track and reverse the boost itself, or restrict dynamic traits to non-boosting ones.

35 of 97 traits carry `XPBoosts` and 18 carry `GrantedRecipes` -- see the reference doc for the lists.

## Gotcha 2: mutual exclusivity is a character-creation constraint only

The engine validates `MutuallyExclusiveTraits` in the character-creation UI. It performs no check when Lua
calls `add()` at runtime. You can absolutely put `brave` and `cowardly` on the same character, and the game
will apply both sets of effects.

The 25 exclusivity clusters are tabulated in `01-b42-trait-reference.md`. Two matter most:

- A 12-member fitness/weight/appetite cluster (`athletic`, `fit`, `unfit`, `out of shape`, `obese`,
  `overweight`, `underweight`, `very underweight`, `emaciated`, `heartyappetite`, `lighteater`, **`smoker`**).
  Note `smoker` sits inside this cluster -- it is exclusive with `athletic`.
- A 7-member fear/nerve cluster (`adrenalinejunkie`, `agoraphobic`, `brave`, `claustrophobic`, `cowardly`,
  `desensitized`, `hemophobic`).

Declarations are not always symmetric -- trait A may list B while B omits A. Always resolve exclusivity as
the union of both directions.

## Gotcha 3: it has to work in multiplayer

`getCharacterTraits():add()` on the client alone will desync. ETW's structure is the model to copy:

- Detection and decision logic lives in `media/lua/server/` (`ETW_ByKills.lua`, `ETW_ByHealth.lua`, ...).
- `media/lua/client/ETW_ServerCommands.lua` and `server/ETW_ClientCommands.lua` carry the round trip.
- Shared logic and the trait registry live in `media/lua/shared/`.

`DisabledInMultiplayer` exists on all 97 definitions but is `false` for every vanilla trait -- it is an
available lever, unused.

## Gotcha 4: XP boost is capped at 3

`setPerkBoost` accepts higher values but the game treats 3 as the ceiling; ETW clamps with
`math.min(old + boost, 3)`. Stacking dynamic traits that boost the same perk silently saturates.

## Persistence

There is no engine-side record of *why* a character has a trait. If you need "gained dynamically" vs
"chosen at creation" -- and you do, for the lose-it-again half of the feature -- you must track it yourself
in `player:getModData()`.

Prior art for the pattern:

- **Lifestyle** keeps `player:getModData().LSDLT` as a `{ [traitName] = bool }` map, and gates trait loss on
  a sandbox option with three modes (never / any trait / only traits this system granted). That third mode
  is the right default: do not strip a trait the player paid points for at creation.
- **ETW** keeps a richer mod-data type (`shared/Types/ETW_ModDataType.lua`) holding accumulated counters
  per trigger channel, plus a "delayed traits" queue so a trait that is about to be gained can be announced
  and applied on a delay rather than instantly.

## Where B42 stores what

| Thing | Path |
|---|---|
| Trait definitions | `media/scripts/generated/characters/character_traits.txt` |
| Trait icons | `media/ui/Traits/trait_<name>.png` |
| Trait display text | `media/lua/shared/Translate/EN/UI.json` |
| Trait->starting-clothing map | `media/lua/shared/Definitions/TraitClothingSelectionDefinitions.lua` |
| Character-creation UI | `media/lua/client/OptionScreens/CharacterCreationProfession.lua` |
| Runtime add/remove UI (debug) | `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua` |
| Trait picker UI | `media/lua/client/ISUI/PlayerStats/ISPlayerStatsChooseTraitUI.lua` |
