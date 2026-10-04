---
id: build-42-professions-reading-them-and-what-they-unlock
slug: professions-reading-them-and-what-they-unlock
title: 'Professions: reading them from Lua, and what they really unlock'
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - professions
  - recipes
  - mechanics
  - gating
excerpt: >-
  How to read a character's profession in Build 42 Lua, and why gating on the
  recipes a profession grants is only a delay: the same recipe names come from
  magazines. Read from the 42.21 scripts and code.
last_updated: '2026-10-04'
related_articles:
  - professions-occupations
  - modding-add-a-profession
  - recipe-gating-in-b42-scripts
---
# Professions: reading them from Lua, and what they really unlock

Outcast, if you want your mod to treat a mechanic differently from a burger flipper, you need two things: a reliable way to ask "what was this character's job?", and an honest picture of what vanilla already gates on it. Here are both.

## Reading the profession

```lua
local prof = player:getDescriptor():getCharacterProfession()
-- prof:getName()  -> "mechanics"
-- tostring(prof)  -> "base:mechanics"
```

`getCharacterProfession()` returns a `CharacterProfession` registry object, not a string. There is no `getProfession()` in Build 42, so code ported from Build 41 that calls it fails. Compare the object with a constant such as `CharacterProfession.MECHANICS`, or compare `getName()` with the bare name. Vanilla's own character screen reads it this way and then fetches the full definition:

```lua
local characterProfession = self.char:getDescriptor():getCharacterProfession()
local characterProfessionDefinition = CharacterProfessionDefinition.getCharacterProfessionDefinition(characterProfession)
```

> **Proof:** Code. `zombie.characters.SurvivorDesc#getCharacterProfession`; `zombie.scripting.objects.CharacterProfession` (`#getName` returns the path, `#toString` the full id, `MECHANICS = registerBase("mechanics")`); no `getProfession(` in the engine source; call site `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Why the profession is worth reading at all: it is the one thing on a character nobody can farm. It is chosen at creation, it never changes, it is saved and synced with the character, and no book grants it. If you derive your mod's roles from it every time you need them, instead of storing a flag, you add no new state that can go out of sync.

## What a profession unlocks, and why it leaks

Build 42 does gate by profession. The mechanic's definition in `character_professions.txt`:

```
character_profession_definition base:mechanics
    CharacterProfession = base:mechanics,
    GrantedTraits = base:mechanics2,
    XPBoosts = Mechanics=4;MetalWelding=1,
    GrantedRecipes = Basic Mechanics;Intermediate Mechanics;Advanced Mechanics,
```

And vehicle parts really do ask for those recipe names. Counting the `recipes =` lines in the vehicle scripts' install and uninstall tables:

| Recipe | Install tables | Uninstall tables |
|---|---|---|
| Intermediate Mechanics | 910 | 908 |
| Advanced Mechanics | 101 | 101 |
| Basic Mechanics | 12 | 12 |

These are script table occurrences across templates and per-car overrides, not a count of distinct parts.

**The leak:** the same three names are taught by magazines. In `literature.txt`, `MechanicMag1` teaches Basic Mechanics, `MechanicMag2` Intermediate Mechanics and `MechanicMag3` Advanced Mechanics, through `LearnedRecipes`. The profession and the paperback hand out the identical string. The Mechanics trait also grants Basic and Intermediate. So a gate on these recipes holds only until someone finds the magazines; after that the profession is an XP boost.

That is not a bug, it is how vanilla is designed: every gate is a delay, nothing is exclusive. If your mod wants something only a mechanic can do, gate on the profession itself, over content your mod owns. Trying to make vanilla's own parts exclusive would mean editing every one of those table entries and every loot table that drops the magazines.

> **Proof:** Code. `media/scripts/generated/characters/character_professions.txt` (`base:mechanics`), `character_traits.txt` (`base:mechanics`), `media/scripts/generated/items/literature.txt` (`MechanicMag1`, `MechanicMag2`, `MechanicMag3`, `LearnedRecipes`); `recipes =` lines under `media/scripts/generated/vehicles`, counted by enclosing `table install` or `table uninstall`; loader `zombie.characters.professions.CharacterProfessionDefinition#getGrantedRecipes`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A note for balance claims

If your mod's design says "a punch kills a zombie in three hits", say which sandbox settings that assumes. Zombie toughness is the sandbox option `ZombieLore.Toughness` (Tough, Normal, Fragile, Random; Normal by default), and how badly the player is hurt is `InjurySeverity` (Low 0.5, Normal 1.0, High 1.5). A number that does not name them cannot be reproduced on someone else's server.

> **Proof:** Code. `zombie.SandboxOptions` (`newEnumOption("ZombieLore.Toughness", 4, 2)` and `newEnumOption("InjurySeverity", InjurySeverity.class, InjurySeverity.NORMAL)`); `zombie.characters.InjurySeverity` (`LOW(0.5F), NORMAL(1.0F), HIGH(1.5F)`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).
