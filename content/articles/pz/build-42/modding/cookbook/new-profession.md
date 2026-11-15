---
id: build-42-new-profession
slug: new-profession
title: New profession
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
  Build a mod that adds one profession, Demo Locksmith, to character creation: a point cost, skill boosts, a free trait and a granted recipe.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-trait
  - modding-add-a-profession
  - professions-reading-them-and-what-they-unlock
  - translations
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoProfession`: a registry file, one profession script, one translation file, one Lua file, and the two files every mod has, `mod.info` and `poster.png`.
- The profession is Demo Locksmith. Choosing it takes 2 points away, boosts Nimble and Sneak, gives the vanilla trait Night Owl for free, and teaches the vanilla recipe CopyBuildingKey.
- The Lua file writes one line to `console.txt` when a new character has the profession, which shows that the registered id and the character agree.
- A profession's cost has the opposite sign from a trait's: a negative cost spends points.
:::

:::facts
- **Mod id** `RecipeDemoProfession`
- **Profession id** `recipedemoprofession:demolocksmith`, shown as Demo Locksmith
- **Files** 6 (`mod.info`, `poster.png`, `registries.lua`, the script, `UI.json`, `Report.lua`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A profession that a player picks on the character creation screen.**

A profession is built from the same pieces as a [trait](/pz/build-42/modding/cookbook/new-trait): an id registered in a Lua file, a script block, and translation text. The block has two keys a trait does not need, `GrantedTraits` and `IconPathName`. When the profession is chosen, the creator adds its free traits to the selected list and takes its cost from your points.

The depth is in [Modding: add a PROFESSION](/pz/build-42/modding/skills-and-traits/modding-add-a-profession). This page is the short complete path.

## The files

**Six files make the mod, in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders and the same `poster.png`. The skeleton's `Boot.lua` is left out here.

```
Zomboid/mods/RecipeDemoProfession/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      registries.lua
      scripts/
        RecipeDemoProfession_professions.txt
      lua/
        shared/
          Translate/
            EN/
              UI.json
        server/
          RecipeDemoProfession/
            Report.lua
```

The game finds `registries.lua` at `media/registries.lua` in the version folder, and falls back to the same path in `common/`. :cite[(`zombie/scripting/objects/ModRegistries.java:20-27`)] It runs that file for every enabled mod before it loads any script. :cite[(`zombie/scripting/objects/ModRegistries.java:16-30`, `zombie/GameWindow.java:208-210`)]

## Step by step

**Write the six files in this order: the mod info, the registry, the script, the text, then the Lua.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Profession
id=RecipeDemoProfession
description=Adds one profession, Demo Locksmith, that you pick at character creation.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/registries.lua`

This registers the profession id and keeps the returned object in a global table, so your Lua can compare against it later.

**File `42/media/registries.lua`**

```lua
RecipeDemoProfession = RecipeDemoProfession or {}
RecipeDemoProfession.professions = {
    DemoLocksmith = CharacterProfession.register("recipedemoprofession:demolocksmith"),
}
```

The registry call refuses the `base` namespace, and the engine stores both parts of the id in lower case. :cite[(`zombie/scripting/objects/CharacterProfession.java:56-65`, `zombie/scripting/objects/RegistryReset.java:22-26`, `zombie/scripting/objects/ResourceLocation.java:21-27`)]

### Step 3. `42/media/scripts/RecipeDemoProfession_professions.txt`

This is the definition. It is modeled on the vanilla Nurse block, which has a skill boost line and one free trait, `base:nightowl`. :cite[(`media/scripts/generated/characters/character_professions.txt:158-166`)] Night Owl is a trait with `IsProfessionTrait = true`, which the creator treats as a free trait. :cite[(`media/scripts/generated/characters/character_traits.txt:701-709`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:695`)] The game reads every `.txt` file under a mod's `media/scripts/` folder as scripts. :cite[(`zombie/scripting/ScriptManager.java:1398-1402`, `zombie/scripting/ScriptManager.java:1637-1645`)]

**File `42/media/scripts/RecipeDemoProfession_professions.txt`**

```
module RecipeDemoProfession
{
    character_profession_definition recipedemoprofession:demolocksmith
    {
        CharacterProfession = recipedemoprofession:demolocksmith,
        Cost = -2,
        UIName = UI_prof_RecipeDemoProfession_DemoLocksmith,
        UIDescription = UI_profdesc_RecipeDemoProfession_DemoLocksmith,
        XPBoosts = Nimble=2;Sneak=1,
        GrantedTraits = base:nightowl,
        GrantedRecipes = CopyBuildingKey,
    }
}
```

The `CharacterProfession` line looks the id up in the registry, which is why Step 2 comes first. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:52-53`)] A key the loader does not know is a script error, and in debug mode it also throws. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:79-84`)]

| Line | What it does | Code |
|------|--------------|------|
| `Cost = -2` | The creator adds the profession's cost to the points you can spend, so a negative cost takes points away and a positive cost gives them. | `media/lua/client/OptionScreens/CharacterCreationProfession.lua:479`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:855-862` |
| `XPBoosts = Nimble=2;Sneak=1` | `Skill=level` pairs separated by `;`. A name that is not a real skill is skipped without an error. The tooltip shows one `+N` line per skill. | `zombie/scripting/objects/CharacterProfessionDefinitionScript.java:66-76`, `media/lua/shared/NPCs/MainCreationMethods.lua:167-185` |
| `GrantedTraits = base:nightowl` | Trait ids separated by `;`, added to the selected traits where the player cannot remove them. Write the namespace on each id. | `zombie/scripting/objects/CharacterProfessionDefinitionScript.java:62-65`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:459-468`, `zombie/scripting/objects/ResourceLocation.java:36` |
| `GrantedRecipes = CopyBuildingKey` | Recipe names separated by `;`, known from the start. `CopyBuildingKey` is a vanilla craft recipe. | `zombie/scripting/objects/CharacterProfessionDefinitionScript.java:60-61`, `media/scripts/generated/recipes/recipes.txt:447` |
| `UIName`, `UIDescription` | Translation keys. `UIDescription` may be left out. Step 4 defines them. | `zombie/scripting/objects/CharacterProfessionDefinitionScript.java:54-59`, `zombie/characters/professions/CharacterProfessionDefinition.java:35-41` |

The block has no `IconPathName` line. The icon is optional: the definition loads a texture only when the line has a value, and the vanilla unemployed profession has none. :cite[(`zombie/characters/professions/CharacterProfessionDefinition.java:43-46`, `media/scripts/generated/characters/character_professions.txt:242-248`)] A profession with an icon names a texture, as the Nurse block does with `IconPathName = profession_nurse`. :cite[(`media/scripts/generated/characters/character_professions.txt:163`)]

### Step 4. `42/media/lua/shared/Translate/EN/UI.json`

This gives the profession its name and its description. The game keeps one table per file name and picks the table from the start of the key, so keys that start with `UI_` belong in `UI.json`. :cite[(`zombie/core/Translator.java:436-437`)] Vanilla keeps its profession text in the same file. :cite[(`media/lua/shared/Translate/EN/UI.json:919-920`)]

**File `42/media/lua/shared/Translate/EN/UI.json`**

```
{
    "UI_prof_RecipeDemoProfession_DemoLocksmith": "Demo Locksmith",
    "UI_profdesc_RecipeDemoProfession_DemoLocksmith": "Can copy building keys."
}
```

The translator reads the file at `media/lua/shared/Translate/<language>/<name>.json` from each enabled mod. :cite[(`zombie/core/Translator.java:364-365`, `zombie/core/Translator.java:384-401`)] The definition looks the text up when its script loads. :cite[(`zombie/characters/professions/CharacterProfessionDefinition.java:35-41`)] A key with no text shows the key itself, and in debug mode the log says `ERROR: Missing translation` with the key. :cite[(`zombie/core/Translator.java:489-506`)]

### Step 5. `42/media/lua/server/RecipeDemoProfession/Report.lua`

This file shows that the character got the profession. The character's descriptor holds a profession object, and vanilla compares it with a definition's type to find the match. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsChooseProfessionUI.lua:64`)] The game raises `OnNewGame` with the player after the traits are applied, in single player and on a server. It also fires on a multiplayer client, and the `server` folder loads there too, so the file ends early on a client with the guard vanilla's starter-kit handler uses. :cite[(`zombie/iso/IsoWorld.java:2374-2377`, `zombie/iso/IsoWorld.java:2387-2393`, `zombie/iso/IsoWorld.java:2416`, `zombie/network/packets/character/CreatePlayerPacket.java:300-308`, `media/lua/shared/Items/SpawnItems.lua:142-146`, `zombie/gameStates/GameLoadingState.java:155-156`)]

**File `42/media/lua/server/RecipeDemoProfession/Report.lua`**

```lua
if isClient() then return end

local function reportProfession(player)
    local profession = player:getDescriptor():getCharacterProfession()
    if profession == RecipeDemoProfession.professions.DemoLocksmith then
        print("[RecipeDemoProfession] this character is a Demo Locksmith")
    end
end

Events.OnNewGame.Add(reportProfession)
```

The function is passed to `.Add` as a value, without calling it.

## Turn it on and see it work

**Enable the mod, start a new game, and choose the profession on the character creation screen.**

1. Put the `RecipeDemoProfession` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoProfession/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Profession**, choose **ACCEPT**, and start a new game.
3. On the character creation screen, open the profession list. **Demo Locksmith** is in it, and its tooltip shows the description, then a `+N` line for each skill, then the name of the Night Owl trait. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:865-871`, `media/lua/shared/NPCs/MainCreationMethods.lua:167-195`)]
4. Choose it. Night Owl joins your selected traits and cannot be removed, and the points you can spend go down by 2. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:434-486`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:695`)]
5. Finish the character and start. The character starts with the boosted skills, knows the recipe, and `console.txt` holds `[RecipeDemoProfession] this character is a Demo Locksmith`. :cite[(`zombie/characters/IsoGameCharacter.java:11551-11615`, `zombie/iso/IsoWorld.java:2388-2393`)]

On a dedicated server, copy the mod into the server's own `mods` folder and put `Mods=RecipeDemoProfession` in the settings file. Separate several entries with `;`, and do the same for `WorkshopItems=` when a mod comes from the Workshop. Every player needs the mod too, because the character creation screen runs on their machine.

On a dedicated server the `print` line goes to the server's own log, not to a player's `console.txt`. These server steps have not been run in a game.

## If it does not work

**A profession fails in a few predictable ways, and each one leaves a clue in `console.txt`.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| The profession name shows as `UI_prof_RecipeDemoProfession_DemoLocksmith` | The text is missing from `UI.json`, the file is in the wrong folder, or the key is spelled differently. In debug mode the log has `ERROR: Missing translation`. | `zombie/core/Translator.java:489-506` |
| `JSON Error in:` and the path of your file | The JSON is not valid, for example a comma after the last entry. Fix the file. | `zombie/core/Translator.java:379` |
| `Unknown key '...' in CharacterProfessionDefinitionScript` | A line in the block uses a key the loader does not read, or a key is misspelled. In debug mode the load throws too. | `zombie/scripting/objects/CharacterProfessionDefinitionScript.java:79-84` |
| `Default namespace 'base:...' is not allowed!` | The id in `registries.lua` uses the `base` namespace, or has no colon and is read as `base`. Use your own namespace. | `zombie/scripting/objects/RegistryReset.java:24-25`, `zombie/scripting/objects/ResourceLocation.java:36` |
| `Tried to register duplicate object` | The same id is registered twice, for example in two mods or twice in your file. | `zombie/scripting/objects/Registry.java:46` |
| The profession is missing from the list | The script's `CharacterProfession` id was not registered or is spelled differently, so the lookup returns nothing. Check that both files spell the id the same way, and look in the log for an error that names the profession. The exact line was not read in the capture. | `zombie/scripting/objects/Registry.java:50-52` |
| A skill boost does nothing | The skill name is not a real skill and was skipped. Copy a name from the vanilla profession blocks. | `zombie/scripting/objects/CharacterProfessionDefinitionScript.java:66-76` |
| No `[RecipeDemoProfession]` line in `console.txt` | The character did not choose the profession, or the character was created before the mod was checked. Start a new game and choose it. | `zombie/iso/IsoWorld.java:2416` |

Script files are parsed when the game loads, so restart the game after every change to the `.txt` file. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors.

## Going further

**Pair the profession with a trait, read it in Lua, or see what the vanilla ones grant.**

- [New trait](/pz/build-42/modding/cookbook/new-trait) builds the trait that a profession can grant through `GrantedTraits`.
- [Modding: add a PROFESSION](/pz/build-42/modding/skills-and-traits/modding-add-a-profession) covers the Lua-only route and what changed from Build 41.
- [Professions: reading them and what they unlock](/pz/build-42/modding/skills-and-traits/professions-reading-them-and-what-they-unlock) shows how to read a character's profession in Lua.
- [Translations](/pz/build-42/modding/cookbook/translations) covers the translation files in more depth.

:::callout[How we know]{kind=proof}
Every line of the script is modeled on a vanilla block, and the loader, creator and translation behavior come from the 42.22 engine and Lua code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker.

It has not been run in a game: what you see on the character creation screen and in `console.txt` is what you check yourself. The server steps and the line the engine writes for an unregistered profession id are not verified. The Build 41 `ProfessionFactory` route from the older page is not in the capture, and we found no match for it in the Lua or the Java.
:::
