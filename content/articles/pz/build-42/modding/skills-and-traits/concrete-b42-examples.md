---
id: build-42-concrete-b42-examples
slug: concrete-b42-examples
title: Concrete B42 examples
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
  Copy-ready Build 42.22 pieces for one skill mod: a gated recipe, a skill book, a recipe magazine, an XP grant that works on a server, and a trait that boosts it, checked against vanilla.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - xp-level-thresholds-multipliers
  - learning-paths
  - modding-add-a-skill
  - modding-add-a-trait
  - recipe-gating-in-b42-scripts
  - the-xp-grant-skill-query-lua-api
  - sandbox-multiplayer-options
  - multiplayer-command-patterns
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Every piece below belongs to one small mod, `MySkillMod`, that adds the skill `MyTinkering` from [Modding: add a SKILL](/pz/build-42/modding/skills-and-traits/modding-add-a-skill). The `perks.txt` file and the text file for the skill are on that page.

:::callout[The 1-minute version]{kind=key}
- A recipe is a copy of a real vanilla recipe with a new name. Skill names in it are engine ids such as `Carving`, and a mod skill uses its own id.
- A skill book for a mod skill needs an item script and one line of Lua: an entry in the `SkillBook` table.
- A recipe magazine uses `LearnedRecipes`. The old key `TeachedRecipes` is not read in 42.22, and an item uses `ItemType = base:literature`, not `Type = Literature`.
- Grant XP with the global `addXp`, from a timed action's `complete` or from a server command handler. The Java `AddXP` call does nothing on a dedicated server.
- A trait boosts a skill with `XPBoosts`, and a trait id needs a namespace other than `base`. :cite[(`zombie/scripting/objects/RegistryReset.java:22-29`)]
:::

:::facts
- **Skill used** `MyTinkering`, under the vanilla Crafting group
- **Item key for a book or magazine** `ItemType = base:literature`
- **Book volumes** `LvlSkillTrained` 1, 3, 5, 7 or 9, with `NumLevelsTrained = 2`
- **XP in the grant examples** 10 `MyTinkering` XP, before the multipliers
:::

## 1. A recipe that needs and trains a skill

**This recipe is vanilla's wooden fork under a new name, and it shows each gating key once.**

It asks for Carving 2, gives 20 Carving XP, stays unknown until the character learns it, and is learned by levelling at Carving 4, or at Carving 3 for an Inventive character. :cite[(`media/scripts/generated/recipes/recipes_carving.txt:337-356`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:897-912`, `zombie/characters/IsoGameCharacter.java:17232-17234`)]

```
module MySkillMod
{
    craftRecipe MySkillMod_CarveFork
    {
        time = 200,
        Tags = AnySurfaceCraft,
        xpAward = Carving:20,
        SkillRequired = Carving:2,
        timedAction = SharpenStakeWood,
        category = Carving,
        NeedToBeLearn = true,
        AutoLearnAny = Carving:4,
        inputs
        {
            item 1 tags[base:sharpknife] mode:keep flags[Prop1;IsNotDull;MayDegradeLight],
            item 1 [Base.SmallHandle;Base.WoodenSpoon] flags[Prop2],
        }
        outputs
        {
            item 1 Base.WoodenFork,
        }
    }
}
```

Put it in `42/media/scripts/myskillmod_recipes.txt`. Apart from the module and the recipe name, the block is the vanilla one. The repo's recipe checker, run with the game folder, reports it well formed with every ingredient present. What each key does is in [Recipe gating in B42 scripts](/pz/build-42/modding/skills-and-traits/recipe-gating-in-b42-scripts). :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:399-445`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:468-481`)]

To gate on the mod skill as well, write `SkillRequired = Carving:2;MyTinkering:1` and `xpAward = Carving:20;MyTinkering:10`. The skill ids are read when the scripts load, after the game has read `perks.txt`, so the id resolves. The repo's recipe checker knows only vanilla skills and reports `MyTinkering` as "not in PerkFactory", which is expected for a mod skill. :cite[(`zombie/characters/skills/CustomPerks.java:32-69`, `zombie/GameWindow.java:204-210`)]

## 2. A skill book for a mod skill

**A skill book is a literature item, plus one entry in a Lua table that names the skill.**

The item copies vanilla's first Carpentry book and changes the skill. :cite[(`media/scripts/generated/items/literature.txt:6310-6322`)] The loader reads `ItemType` to choose the item class, and it builds a literature object only for `base:literature`. A line `Type = Literature`, which older guides used, is not a known key: the loader logs it as an unknown item parameter. :cite[(`zombie/scripting/objects/Item.java:1982-1983`, `zombie/scripting/objects/Item.java:1574-1576`, `zombie/scripting/objects/Item.java:2998-3009`)]

```
module MySkillMod
{
    item TinkeringBook1
    {
        DisplayName = Tinkering Basics,
        DisplayCategory = SkillBook,
        ItemType = base:literature,
        Weight = 1.0,
        Icon = Book8,
        LvlSkillTrained = 1,
        NumLevelsTrained = 2,
        NumberOfPages = 200,
        SkillTrained = MyTinkering,
        StaticModel = BookBrown,
        WorldStaticModel = BookBrown_Ground,
    }
}
```

`SkillTrained` is the key of the Lua table `SkillBook`, and the table has no `MyTinkering` entry until you add one. Without it, the book raises a Lua error when the player opens its inventory menu. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:38`, `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:1061`)] Put the entry in `42/media/lua/server/MySkillMod/SkillBook.lua`, which loads after vanilla's own file in every game mode, because a server file loads on a single player start, on a dedicated server and on a multiplayer client. :cite[(`zombie/Lua/LuaManager.java:1195-1203`, `zombie/gameStates/GameLoadingState.java:155-156`, `zombie/network/GameServer.java:1517-1519`)]

```lua
SkillBook["MyTinkering"] = {}
SkillBook["MyTinkering"].perk = Perks.MyTinkering
SkillBook["MyTinkering"].maxMultiplier1 = 3
SkillBook["MyTinkering"].maxMultiplier2 = 5
SkillBook["MyTinkering"].maxMultiplier3 = 8
SkillBook["MyTinkering"].maxMultiplier4 = 12
SkillBook["MyTinkering"].maxMultiplier5 = 16
```

The five numbers are vanilla's maximum multipliers for volumes 1 to 5, and the book's `LvlSkillTrained` picks which one applies. Only 1, 3, 5, 7 and 9 are handled, and any other value prints an error and uses 1. :cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-9`, `media/lua/shared/TimedActions/ISReadABook.lua:491-505`)] A full set is five items with `LvlSkillTrained` of 1, 3, 5, 7 and 9, each with `NumLevelsTrained = 2`. The multiplier rules are in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

## 3. A recipe magazine

**A magazine teaches recipes with `LearnedRecipes`, and reading it to the end adds each listed recipe the reader does not know.**

The item copies vanilla's `ArmorMag4`. :cite[(`media/scripts/generated/items/literature.txt:5159-5172`)]

```
module MySkillMod
{
    item TinkeringMagazine1
    {
        DisplayName = Tinkerers Monthly,
        DisplayCategory = RecipeResource,
        ItemType = base:literature,
        Weight = 0.5,
        Icon = Magazine_EarlyArmour3,
        LearnedRecipes = MySkillMod_CarveFork,
        StaticModel = Magazine,
        WorldStaticModel = ArmorMag4,
        Tags = base:magazine,
    }
}
```

The older example wrote `TeachedRecipes`. No script, Java or English Lua file in 42.22 reads that key, so a magazine that uses it teaches nothing. :cite[(`zombie/scripting/objects/Item.java:2777-2784`)] `LearnedRecipes` takes recipe names separated by `;`, and the character's known list holds exactly the strings written there. :cite[(`zombie/scripting/objects/Item.java:2777-2784`, `zombie/characters/IsoGameCharacter.java:4897-4907`, `zombie/characters/IsoGameCharacter.java:11757-11772`)] Vanilla lists a recipe by the id of its block, for example `Forge_Codpiece`. :cite[(`media/scripts/generated/items/literature.txt:5167`)] A recipe in your own module is named by its block id too, and that case is not tested. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:144-146`, `zombie/scripting/ScriptBucket.java:198`)]

A magazine is not used up unless it carries the tag `ConsumeOnRead`. The learning rules are in [Learning](/pz/build-42/modding/skills-and-traits/learning-paths). :cite[(`zombie/characters/IsoGameCharacter.java:4909-4911`)]

## 4. Grant XP from a custom action

**Call `addXp` from the action's `complete` function when you have a timed action, and from a command handler when you do not.**

A timed action's Lua `complete` runs in single player and on a dedicated server, and never on a multiplayer client. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:176-182`)] Vanilla's book reading grants its XP multiplier from `complete` for that reason. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:323-340`)] The global `addXp` then does the grant on either of those machines. :cite[(`zombie/Lua/LuaManager.java:11855-11867`, `zombie/network/GameServer.java:1892-1902`)] The class around it, the queue and the rule that an action with no `complete` is not synced are in [Timed actions](/pz/build-42/modding/lua-api/timed-actions).

```lua
function MySkillMod_Tinker:complete()
    addXp(self.character, Perks.MyTinkering, 10)
    return true
end
```

When there is no timed action, send a command and grant in the server handler. The handler goes in `42/media/lua/server/MySkillMod/Grant.lua`. A server file also loads on a multiplayer client, so it ends the file there. :cite[(`zombie/Lua/LuaManager.java:4432-4437`, `zombie/gameStates/GameLoadingState.java:155-156`)]

```lua
if isClient() then return end

local function onClientCommand(module, command, player, args)
    if module ~= "MySkillMod" or command ~= "tinker" then return end
    addXp(player, Perks.MyTinkering, 10)
end

Events.OnClientCommand.Add(onClientCommand)
```

`OnClientCommand` gets the module, the command, the sending player and the table. In single player it fires from the single-player server path, and on a dedicated server from the packet handler. :cite[(`zombie/spnetwork/SinglePlayerServer.java:195-205`, `zombie/network/GameServer.java:2343`)] The client sends it with the call below, which in single player goes to the local server path. :cite[(`zombie/Lua/LuaManager.java:8882-8896`)]

```lua
sendClientCommand(player, "MySkillMod", "tinker", {})
```

The older example called `player:getXp():AddXP(Perks.Carving, 15)` from the action. That call acts only for a local player, so it works in single player and on your own client, and does nothing on a dedicated server. On a multiplayer client the server's next XP record replaces its result. :cite[(`zombie/characters/IsoGameCharacter.java:17743-17747`, `zombie/characters/IsoPlayer.java:6507-6509`, `zombie/network/packets/PlayerXpPacket.java:52-64`)]

:::callout[Warning]{kind=warn}
Any logged-in client can send the command `tinker` as often as it likes, so the handler as written hands out 10 XP on every call. A real handler checks on the server that the action happened, and decides the amount itself. The command patterns are in [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns).
:::

## 5. A trait that boosts the skill

**A trait gives the skill its normal speed with `XPBoosts`, and the trait's id must use your own namespace.**

This trait gives `MyTinkering` a starting level of 2 and teaches the fork recipe. The pieces are the registry file, the script and the text, and the full walk-through is [Modding: add a TRAIT](/pz/build-42/modding/skills-and-traits/modding-add-a-trait). The registry file, `42/media/registries.lua`, registers the id in lower case, and a mod may not use the `base` namespace. :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`, `zombie/scripting/objects/ResourceLocation.java:15-37`, `zombie/scripting/objects/RegistryReset.java:22-29`)]

```lua
MySkillMod = MySkillMod or {}
MySkillMod.traits = {
    Tinkerer = CharacterTrait.register("myskillmod:tinkerer"),
}
```

The script goes in `42/media/scripts/myskillmod_traits.txt`. Its `XPBoosts` and `GrantedRecipes` keys take lists separated by `;`, and a boost is a skill id, an equals sign and a level. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:56-90`)]

```
module MySkillMod
{
    character_trait_definition myskillmod:tinkerer
    {
        IsProfessionTrait = false,
        DisabledInMultiplayer = false,
        CharacterTrait = myskillmod:tinkerer,
        Cost = 4,
        UIName = UI_trait_MySkillMod_Tinkerer,
        UIDescription = UI_trait_MySkillMod_TinkererDesc,
        XPBoosts = MyTinkering=2,
        GrantedRecipes = MySkillMod_CarveFork,
    }
}
```

The two text keys go in `42/media/lua/shared/Translate/EN/UI.json`. The translator reads one `.json` file per language and name, and the keys are whatever string the script holds. :cite[(`zombie/core/Translator.java:365`, `zombie/characters/traits/CharacterTraitDefinition.java:42-46`)]

```json
{
    "UI_trait_MySkillMod_Tinkerer": "Tinkerer",
    "UI_trait_MySkillMod_TinkererDesc": "Trains Tinkering faster. Knows how to carve a wooden fork."
}
```

A starting level of 2 gives the skill's XP a factor of 1.33, against 0.25 for a skill with no boost, and the character starts with the skill raised to level 2. :cite[(`zombie/characters/IsoGameCharacter.java:11594-11606`, `zombie/characters/IsoGameCharacter.java:17810-17832`)] A positive `Cost` costs points when the player picks the trait. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:640`)] The older example used text keys with a colon, such as `UI_trait_mymod:woodsy`, and listed an 18 by 18 icon path. The trait page's table lists each correction.

:::callout[How we know]{kind=proof}
We copied the recipe and the two items from vanilla blocks and changed only the names and the skill, then ran the repo's script checkers: the recipe checker (with the game folder) reports the recipe well formed with every ingredient present, the script checker parses all three script files and both text files, and the Lua checker finds nothing that Kahlua lacks in the two Lua files. The recipe checker reports `MyTinkering` as not a known skill when it is used in `SkillRequired`, because it knows only vanilla skills. All behavior claims are read from the 42.22 code in the lines cited, and we did not start a game.

Not tested: the Lua error of a book with no `SkillBook` entry, a recipe name in a module other than `Base`, and the handler in a multiplayer session. Dropped or corrected from the older page: `TeachedRecipes`; `Type = Literature`; the `Whittling` action name (nothing under `media/` uses it) and the `tags[SharpKnife]` spelling (the vanilla recipe uses `SharpenStakeWood` and `base:sharpknife`); the client-side `AddXP` grant; and the trait example's text keys, which the trait page replaces.
:::
