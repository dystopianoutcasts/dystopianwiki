---
id: build-42-modding-add-a-profession
slug: modding-add-a-profession
title: 'Modding: add a PROFESSION'
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
  A complete Build 42.22 profession mod from an empty folder: register the id, write the script block, add the text, enable it, and what to see in the character creator.
last_updated: '2026-11-15'
related_articles:
  - professions-reading-them-and-what-they-unlock
  - modding-add-a-trait
  - trait-reference
  - recipe-gating-in-b42-scripts
  - new-profession
  - media-registries-lua-the-new-b42-identifier-file
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders making a first profession](#build-the-example-mod) | [the vanilla list](/pz/build-42/modding/skills-and-traits/professions-reading-them-and-what-they-unlock)

:::callout[The 1-minute version]{kind=key}
- A Build 42.22 profession is an id registered in `media/registries.lua` plus a `character_profession_definition` script block. It has the same shape as a trait.
- The Build 41 `ProfessionFactory` route is not in the 42.22 capture, and the older "uncertain" note on this page is settled in favor of the script route.
- A profession's `Cost` has the opposite sign from a trait's: a negative cost spends points, and a positive cost adds them.
- Profession ids cannot use the `base` namespace, and the engine lowercases every id.
- The steps below were written from the 42.22 code and have not been run in a game.
:::

:::facts
- **Registry file** `42/media/registries.lua`
- **Registry call** `CharacterProfession.register("<namespace>:<name>")`
- **Script block** `character_profession_definition`
- **Keys the loader reads** 8
- **Translation file** `Translate/EN/UI.json`
:::

## The two pieces of a profession

A Build 42 profession is a registered id and a script block that gives the id its cost, skills, traits and recipes.

Your `media/registries.lua` calls `CharacterProfession.register("<namespace>:<name>")`, and the game runs that file for every enabled mod before it loads any scripts. :cite[(`zombie/scripting/objects/CharacterProfession.java:56-65`, `zombie/scripting/objects/ModRegistries.java:16-31`, `zombie/GameWindow.java:208-210`)] The registry refuses the `base` namespace for a mod. :cite[(`zombie/scripting/objects/RegistryReset.java:22-29`)]

The script block's `CharacterProfession` key looks the id up, so registering must come first. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:52-53`)] The loader reads exactly these keys: `CharacterProfession`, `UIName`, `Cost`, `UIDescription`, `GrantedRecipes`, `GrantedTraits`, `XPBoosts` and `IconPathName`. Any other key is a script error. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:45-88`)]

| Key | Meaning | Code |
|---|---|---|
| `CharacterProfession` | The registered id this block fills. | :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:52-53`)] |
| `UIName`, `UIDescription` | Translation keys. `UIDescription` may be left out. | :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:54-59`, `zombie/characters/professions/CharacterProfessionDefinition.java:35-41`)] |
| `Cost` | Creation points. A negative value spends points and a positive value adds them. | :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:479`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:855-862`)] |
| `XPBoosts` | `Skill=level` pairs separated by `;`. An unknown skill name is skipped without an error. | :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:66-76`)] |
| `GrantedTraits` | Trait ids added to the character, separated by `;`. | :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:62-65`)] |
| `GrantedRecipes` | Recipe names separated by `;`, known from creation. | :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:60-61`, `zombie/characters/IsoGameCharacter.java:11610-11615`)] |
| `IconPathName` | The icon's texture name. The unemployed profession has none. | :cite[(`zombie/characters/professions/CharacterProfessionDefinition.java:43-46`, `media/scripts/generated/characters/character_professions.txt:242-248`)] |

## Build the example mod

This builds a mod called `MyProfMod` with one profession, Locksmith, from an empty folder.

Create the folders below. Put the mod root in the `mods` folder of the game's cache directory, as `Zomboid/mods/MyProfMod/`. :cite[(`zombie/ZomboidFileSystem.java:548-552`)]

The Workshop path `Zomboid/Workshop/MyProfMod/Contents/mods/MyProfMod/` is scanned only when Steam mode is on, so the plain `mods` folder is the route that always works. :cite[(`zombie/ZomboidFileSystem.java:457-465`)]

The mod root has `common` and `42` next to each other; the folder rules are in [the B42 mod project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure). The game reads `mod.info` from the version folder first and from `common` second. :cite[(`zombie/gameStates/ChooseGameInfo.java:198-209`)]

```
Zomboid/mods/MyProfMod/
  common/
  42/
    mod.info
    media/
      registries.lua
      scripts/myprofmod_professions.txt
      lua/shared/Translate/EN/UI.json
```

The game finds `registries.lua` at `media/registries.lua` in the version folder and falls back to the same path in `common`. :cite[(`zombie/scripting/objects/ModRegistries.java:20-27`)]

**Step 1. `42/mod.info`.** The loader reads `name=`, `id=` and `description=` lines. :cite[(`zombie/gameStates/ChooseGameInfo.java:217-243`)]

```
name=My Profession Mod
id=MyProfMod
description=Adds the Locksmith profession.
```

**Step 2. `42/media/registries.lua`.** This registers the id. The id is stored in lower case, so `myprofmod:locksmith` is the id everywhere else. :cite[(`zombie/scripting/objects/ResourceLocation.java:15-37`)]

```lua
MyProfMod = MyProfMod or {}
MyProfMod.professions = {
    Locksmith = CharacterProfession.register("myprofmod:locksmith"),
}
```

**Step 3. `42/media/scripts/myprofmod_professions.txt`.** This is the definition. `Nimble` and `Sneak` are vanilla skill names, `base:nightowl` is a vanilla profession-only trait and `CopyBuildingKey` is a vanilla recipe name, all used by the Burglar and Nurse blocks. :cite[(`media/scripts/generated/characters/character_professions.txt:3-12`, `media/scripts/generated/characters/character_professions.txt:158-166`)]

```
module MyProfMod
{
    character_profession_definition myprofmod:locksmith
    {
        CharacterProfession = myprofmod:locksmith,
        Cost = -2,
        UIName = UI_prof_MyProfMod_Locksmith,
        UIDescription = UI_profdesc_MyProfMod_Locksmith,
        XPBoosts = Nimble=2;Sneak=1,
        GrantedTraits = base:nightowl,
        GrantedRecipes = CopyBuildingKey,
    }
}
```

Write each trait id in `GrantedTraits` with its namespace. The `ResourceLocation` parser reads an id with no namespace as `base`, so a name that is not a vanilla trait points at nothing. :cite[(`zombie/scripting/objects/ResourceLocation.java:29-37`)]

**Step 4. The translations.** The `UIName` and `UIDescription` values are looked up as translation keys, and whatever key you write in the script is the key to define. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:54-59`, `zombie/characters/professions/CharacterProfessionDefinition.java:35-41`)] Vanilla keeps its profession text in the English translation file. :cite[(`media/lua/shared/Translate/EN/UI.json:919-920`)] The translator loads one `.json` file per language and file name, which is why the file sits at the path in the tree above. :cite[(`zombie/core/Translator.java:365`)]

```json
{
    "UI_prof_MyProfMod_Locksmith": "Locksmith",
    "UI_profdesc_MyProfMod_Locksmith": "Can copy building keys."
}
```

## Turn it on

Enable the mod where you play, and on a dedicated server list it in the server settings.

- **Single player or host.** Open the Mods screen from the main menu, tick My Profession Mod and start a new game. The menu wording is from the foundations pages, not from a test of this mod.
- **Dedicated server.** Either the server gets the mod from the Workshop, by listing its item id in `WorkshopItems=`, or you copy the mod root into the `mods` folder of the server's own cache directory, so that it is `mods/MyProfMod/` there. :cite[(`zombie/ZomboidFileSystem.java:443-455`, `zombie/ZomboidFileSystem.java:548-552`)] Then set `Mods=MyProfMod` in the server's settings file. Separate several entries with `;`, for example `Mods=MyProfMod;OtherMod` and `WorkshopItems=1234567890;2345678901`. Every player needs the mod too, because the character creation screen runs on their machine. These server steps have not been run in a game.

## What you should see

You can check the result in the character creation screen and in the first minutes of play.

The profession list is built from every registered definition, so Locksmith appears in it by name. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:865-881`)] Its tooltip shows your description, then one `+N` line per skill, then the name of the Night Owl trait. :cite[(`media/lua/shared/NPCs/MainCreationMethods.lua:167-193`)] Choosing it puts Night Owl in your selected traits where you cannot remove it, and lowers the points to spend by 2. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:434-486`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:375-379`)]

After you start, the character knows the profession's recipe and starts with the listed skill levels. :cite[(`zombie/characters/IsoGameCharacter.java:11551-11615`)]

To read the profession in Lua, use `player:getDescriptor():getCharacterProfession()`, as the [reference page](/pz/build-42/modding/skills-and-traits/professions-reading-them-and-what-they-unlock#reading-the-profession) shows.

If the profession is missing from the list, check the log, because a key the loader does not know is reported as a script error at load. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:79-84`)] None of this has been run in a game.

## What changed from the Build 41 route

The older version of this page showed a `ProfessionFactory.addProfession` snippet and marked it uncertain for Build 42, and the capture settles that.

A search of the 42.22 Lua finds no `ProfessionFactory`, and no Java class by that name is in the capture.

The script and registry route above is the one the game's own professions use. :cite[(`media/scripts/generated/characters/character_professions.txt:3-12`)] The older snippet called `addXPBoost`, `addFreeTrait` and `addFreeRecipe` on the profession. In 42.22 the same ideas are the `XPBoosts`, `GrantedTraits` and `GrantedRecipes` keys, and the definition object has `addXPBoost`, `addGrantedTrait` and `addGrantedRecipe` methods. :cite[(`zombie/characters/professions/CharacterProfessionDefinition.java:134-144`)] A definition can also be built from Lua with `CharacterProfessionDefinition.addCharacterProfessionDefinition`, though this route was not run. :cite[(`zombie/characters/professions/CharacterProfessionDefinition.java:49-55`)]

The older note about the FWolfe Profession Framework mod is not checked here, because we did not read that mod.

:::callout[How we know]{kind=proof}
The registry, script, translation and creator facts above come from reading the 42.22 Java and Lua cited beside each one. We did not run a game, so the example mod, the menu steps and the server settings are untested.

Dropped from the older page: the `ProfessionFactory` snippet and its Build 41 translation key `IGUI_prof_...`, which the capture does not support, and the "UNCERTAIN" tags, which the script route settles. We searched the Lua and Java for `ProfessionFactory` and found no match.
:::
