---
id: build-42-new-trait
slug: new-trait
title: New trait
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
  Build a mod that adds one trait, Demo Cook, to character creation: a point cost, a Cooking boost, a granted recipe, and a bandage in the starting inventory.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-profession
  - modding-add-a-trait
  - trait-reference
  - translations
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoTrait`: a registry file, one trait script, one translation file, one Lua file, and the two files every mod has, `mod.info` and `poster.png`.
- The trait is called Demo Cook. It costs 2 points, starts you one level higher in Cooking, teaches the stick-trap recipe, and cannot be picked together with Clumsy.
- The Lua file gives each new character with the trait a bandage and writes one line to `console.txt`.
- You pick the trait on the character creation screen, so you need to start a new game to see it.
:::

:::facts
- **Mod id** `RecipeDemoTrait`
- **Trait id** `recipedemotrait:democook`, shown as Demo Cook
- **Files** 6 (`mod.info`, `poster.png`, `registries.lua`, the script, `UI.json`, `Kit.lua`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A trait that a player picks at character creation and that changes the new character.**

A Build 42 trait has three parts: an id registered in a Lua file, a script block that gives the id its cost and effects, and the text the player reads. This recipe adds a fourth, a small Lua file that reacts to the trait. The trait is Demo Cook, and it appears in the list of traits that cost points.

The depth is in the kept pages [Modding: add a TRAIT](/pz/build-42/modding/skills-and-traits/modding-add-a-trait) and the [trait reference](/pz/build-42/modding/skills-and-traits/trait-reference). This page is the short complete path.

## The files

**Six files make the mod, in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders and the same `poster.png`. The skeleton's `Boot.lua` is left out here.

```
Zomboid/mods/RecipeDemoTrait/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      registries.lua
      scripts/
        RecipeDemoTrait_traits.txt
      lua/
        shared/
          Translate/
            EN/
              UI.json
        server/
          RecipeDemoTrait/
            Kit.lua
```

The game finds `registries.lua` at `media/registries.lua` in the version folder, and falls back to the same path in `common/`. :cite[(`zombie/scripting/objects/ModRegistries.java:20-27`)] It runs that file for every enabled mod before it loads any script. :cite[(`zombie/scripting/objects/ModRegistries.java:16-30`, `zombie/GameWindow.java:208-210`)]

## Step by step

**Write the six files in this order: the mod info, the registry, the script, the text, then the Lua.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Trait
id=RecipeDemoTrait
description=Adds one trait, Demo Cook, that you pick at character creation.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/registries.lua`

This registers the trait id and keeps the returned object in a global table, so your Lua can use it later.

**File `42/media/registries.lua`**

```lua
RecipeDemoTrait = RecipeDemoTrait or {}
RecipeDemoTrait.traits = {
    DemoCook = CharacterTrait.register("recipedemotrait:democook"),
}
```

An id is a namespace, a colon and a name, and the engine stores both parts in lower case. :cite[(`zombie/scripting/objects/ResourceLocation.java:21-27`, `zombie/scripting/objects/ResourceLocation.java:33-36`)] A mod cannot use the `base` namespace, which belongs to the game's own traits. :cite[(`zombie/scripting/objects/RegistryReset.java:22-26`)] An id with no colon is read as `base`. :cite[(`zombie/scripting/objects/ResourceLocation.java:36`)] Registering the same id twice is an error. :cite[(`zombie/scripting/objects/Registry.java:39-47`)]

### Step 3. `42/media/scripts/RecipeDemoTrait_traits.txt`

This is the definition. It is modeled on the vanilla Graceful block, which also has a positive cost and one exclusion. :cite[(`media/scripts/generated/characters/character_traits.txt:380-389`)] The game reads every `.txt` file under a mod's `media/scripts/` folder as scripts. :cite[(`zombie/scripting/ScriptManager.java:1398-1402`, `zombie/scripting/ScriptManager.java:1637-1645`)]

**File `42/media/scripts/RecipeDemoTrait_traits.txt`**

```
module RecipeDemoTrait
{
    character_trait_definition recipedemotrait:democook
    {
        IsProfessionTrait = false,
        DisabledInMultiplayer = false,
        CharacterTrait = recipedemotrait:democook,
        Cost = 2,
        UIName = UI_trait_RecipeDemoTrait_DemoCook,
        UIDescription = UI_trait_RecipeDemoTrait_DemoCookDesc,
        MutuallyExclusiveTraits = base:clumsy,
        XPBoosts = Cooking=1,
        GrantedRecipes = MakeStickTrap,
    }
}
```

The `CharacterTrait` line looks the id up in the registry, which is why Step 2 comes first. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:56-57`)] A key the loader does not know is a script error, and in debug mode it also throws. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:91-95`)]

| Line | What it does | Code |
|------|--------------|------|
| `Cost = 2` | A positive cost puts the trait in the list of traits that take points, and the creator subtracts the cost from the points left. The label beside the name reads `-2`. | `media/lua/client/OptionScreens/CharacterCreationProfession.lua:640`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:896`, `zombie/characters/traits/CharacterTraitDefinition.java:158-171` |
| `MutuallyExclusiveTraits = base:clumsy` | Lists trait ids that cannot be picked together with this one, separated by `;`. Write the namespace on every id. | `zombie/scripting/objects/CharacterTraitDefinitionScript.java:85-88`, `zombie/scripting/objects/ResourceLocation.java:36` |
| `XPBoosts = Cooking=1` | `Skill=level` pairs separated by `;`. A name that is not a real skill is skipped without an error. The creator shows the boost as `+1 Cooking` in the tooltip. | `zombie/scripting/objects/CharacterTraitDefinitionScript.java:74-84`, `media/lua/shared/NPCs/MainCreationMethods.lua:113-133` |
| `GrantedRecipes = MakeStickTrap` | Recipe names separated by `;`, known from the start. `MakeStickTrap` is a vanilla craft recipe. | `zombie/scripting/objects/CharacterTraitDefinitionScript.java:68-69`, `media/scripts/generated/recipes/recipes_trapping.txt:25` |
| `UIName`, `UIDescription` | Translation keys. Step 4 defines them. | `zombie/scripting/objects/CharacterTraitDefinitionScript.java:58-63`, `zombie/characters/traits/CharacterTraitDefinition.java:42-46` |

The exclusion only has to be written on one side. This trait names Clumsy, but vanilla Clumsy does not name this trait. The creator hides a trait from its lists when the trait's own list names something already picked, and it rebuilds the lists after each pick. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:683-690`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:615-617`, `zombie/characters/traits/CharacterTraitDefinition.java:202-204`)] So Demo Cook disappears once Clumsy is picked, and Clumsy disappears once Demo Cook is picked. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:660-681`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:907`)]

The skill level in `XPBoosts` does two jobs. At creation it adds that many levels to the skill, so the character starts with Cooking one level higher than the profession alone would give. :cite[(`zombie/characters/IsoGameCharacter.java:11557-11574`, `zombie/characters/IsoGameCharacter.java:11594-11605`)] It also stores a boost for that skill, capped at 3. :cite[(`zombie/characters/IsoGameCharacter.java:11599`)]

### Step 4. `42/media/lua/shared/Translate/EN/UI.json`

This gives the trait its name and its description. The game keeps one table per file name and picks the table from the start of the key, so keys that start with `UI_` belong in `UI.json`. :cite[(`zombie/core/Translator.java:436-437`)] Vanilla keeps its trait text in the same file. :cite[(`media/lua/shared/Translate/EN/UI.json:839-840`)]

**File `42/media/lua/shared/Translate/EN/UI.json`**

```
{
    "UI_trait_RecipeDemoTrait_DemoCook": "Demo Cook",
    "UI_trait_RecipeDemoTrait_DemoCookDesc": "Starts with a bandage and knows how to make a stick trap."
}
```

The translator reads the file at `media/lua/shared/Translate/<language>/<name>.json` from each enabled mod. :cite[(`zombie/core/Translator.java:364-365`, `zombie/core/Translator.java:384-401`)] The definition looks the text up when its script loads. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:42-46`)] A key with no text shows the key itself, and in debug mode the log says `ERROR: Missing translation` with the key. :cite[(`zombie/core/Translator.java:489-506`)]

### Step 5. `42/media/lua/server/RecipeDemoTrait/Kit.lua`

This file gives each new character with the trait a bandage. The game applies the traits and then raises `OnNewGame` with the player, in single player and on a server. The event also fires on a multiplayer client, which creates its own player and raises it too, so the file ends early there, as vanilla's starter-kit handler does. :cite[(`zombie/iso/IsoWorld.java:2374-2377`, `zombie/iso/IsoWorld.java:2387`, `zombie/iso/IsoWorld.java:2416`, `zombie/network/packets/character/CreatePlayerPacket.java:300-308`, `media/lua/shared/Items/SpawnItems.lua:142-146`)] The `server` folder loads on a multiplayer client as well, so without the guard a client would add a bandage that only it sees. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)]

The event passes the player and a square. :cite[(`api/events.jsonl:135`)] Vanilla adds items the same way, with a full item type such as `Base.Belt2`. :cite[(`media/lua/shared/Items/SpawnItems.lua:142-165`)] The bandage is a vanilla item. :cite[(`media/scripts/generated/items/normal.txt:8071`)]

**File `42/media/lua/server/RecipeDemoTrait/Kit.lua`**

```lua
if isClient() then return end

local function giveDemoCookKit(player)
    if player:hasTrait(RecipeDemoTrait.traits.DemoCook) then
        player:getInventory():AddItem("Base.Bandage")
        print("[RecipeDemoTrait] gave the Demo Cook kit")
    end
end

Events.OnNewGame.Add(giveDemoCookKit)
```

`hasTrait` takes the registered object, not a string, which is why Step 2 kept it in a table. :cite[(`zombie/characters/IsoGameCharacter.java:5585-5587`)] The function is passed to `.Add` as a value, without calling it.

## Turn it on and see it work

**Enable the mod, start a new game, and pick the trait on the character creation screen.**

1. Put the `RecipeDemoTrait` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoTrait/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Trait**, choose **ACCEPT**, and start a new game.
3. On the character creation screen, look in the list of traits that cost points. **Demo Cook** is there with `-2` beside it, and its tooltip shows the description and a `+1` Cooking line. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:891-900`, `zombie/characters/traits/CharacterTraitDefinition.java:158-171`, `media/lua/shared/NPCs/MainCreationMethods.lua:113-134`)]
4. Add it. The points you can spend go down by 2. Check that Clumsy has left the list of traits that give points. Then remove Demo Cook and pick Clumsy: Demo Cook is now gone from its list. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:638-641`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:656-657`)]
5. Finish the character and start. Your inventory holds a bandage, your Cooking level is one higher than the profession alone gives, and `console.txt` holds `[RecipeDemoTrait] gave the Demo Cook kit`. The recipe `MakeStickTrap` is known from the start. :cite[(`zombie/characters/IsoGameCharacter.java:11617-11627`, `zombie/iso/IsoWorld.java:2395-2399`)]

On a dedicated server, copy the mod into the server's own `mods` folder and put `Mods=RecipeDemoTrait` in the settings file. Separate several entries with `;`, and do the same for `WorkshopItems=` when a mod comes from the Workshop. Every player needs the mod too, because the character creation screen runs on their machine.

On a dedicated server the `print` line goes to the server's own log, not to a player's `console.txt`. These server steps have not been run in a game.

## If it does not work

**A trait fails in a few predictable ways, and each one leaves a clue in `console.txt`.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| The trait name shows as `UI_trait_RecipeDemoTrait_DemoCook` | The text is missing from `UI.json`, the file is in the wrong folder, or the key is spelled differently. In debug mode the log has `ERROR: Missing translation`. | `zombie/core/Translator.java:489-506` |
| `JSON Error in:` and the path of your file | The JSON is not valid, for example a comma after the last entry. Fix the file. | `zombie/core/Translator.java:379` |
| `Unknown key '...' in CharacterTraitDefinitionScript` | A line in the script block uses a key the loader does not read, or a key is misspelled. In debug mode the load throws too. | `zombie/scripting/objects/CharacterTraitDefinitionScript.java:91-95` |
| `Default namespace 'base:...' is not allowed!` | The id in `registries.lua` uses the `base` namespace, or has no colon and is read as `base`. Use your own namespace. | `zombie/scripting/objects/RegistryReset.java:24-25`, `zombie/scripting/objects/ResourceLocation.java:36` |
| `Tried to register duplicate object` | The same id is registered twice, for example in two mods or twice in your file. | `zombie/scripting/objects/Registry.java:46` |
| The trait is missing from the list and the script loads without a message | The script's `CharacterTrait` id was not registered, so the lookup returns nothing and the definition is built on that empty value. Check that both files spell the id the same way. This error line was not read in the capture, so look for any error that names the trait. | `zombie/scripting/objects/Registry.java:50-52`, `zombie/characters/traits/CharacterTraitDefinition.java:49` |
| No `[RecipeDemoTrait] gave the Demo Cook kit` line | The character did not pick the trait, or the character was created before the mod was checked. Start a new game and pick the trait. `OnNewGame` fires once per new character. | `api/events.jsonl:135` |
| A skill boost does nothing | The skill name is not a real skill and was skipped. Copy a name from the vanilla trait blocks. | `zombie/scripting/objects/CharacterTraitDefinitionScript.java:74-84` |

Script files are parsed when the game loads, so restart the game after every change to the `.txt` file. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors.

## Going further

**Add an icon, add behavior while the game runs, or build a profession from the same pieces.**

- [New profession](/pz/build-42/modding/cookbook/new-profession) uses the same registry and script route and can grant this trait.
- [Modding: add a TRAIT](/pz/build-42/modding/skills-and-traits/modding-add-a-trait) covers adding and removing a trait while the game runs, the second Lua-only route, and what older guides got wrong.
- [Trait reference](/pz/build-42/modding/skills-and-traits/trait-reference) lists the keys of the trait block and the vanilla traits.
- [Translations](/pz/build-42/modding/cookbook/translations) covers the translation files in more depth.

:::callout[How we know]{kind=proof}
Every line of the script is modeled on a vanilla block, and the loader, creator and translation behavior come from the 42.22 engine and Lua code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker.

It has not been run in a game: what you see on the character creation screen, in your inventory and in `console.txt` is what you check yourself. The server steps and the line the engine writes for an unregistered trait id are not verified. The trait has no icon file, so the game uses its generic trait icon. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:49-52`)]
:::
