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
  A complete Build 42.22 trait mod from an empty folder: register the id, write the script block, add the text, react in Lua, and what changes if you add a trait while the game runs.
last_updated: '2026-11-15'
related_articles:
  - trait-reference
  - modding-add-a-profession
  - professions-reading-them-and-what-they-unlock
  - the-xp-grant-skill-query-lua-api
  - xp-level-thresholds-multipliers
  - recipe-gating-in-b42-scripts
  - new-trait
  - media-registries-lua-the-new-b42-identifier-file
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders making a first trait](#build-the-example-mod) | [modders who add traits while the game runs](#adding-or-removing-a-trait-while-the-game-runs) | [the vanilla list](/pz/build-42/modding/skills-and-traits/trait-reference)

:::callout[The 1-minute version]{kind=key}
- A trait is three pieces: an id registered in `media/registries.lua`, a `character_trait_definition` script block, and optional Lua that asks `player:hasTrait(...)`.
- The mod's ids must use a namespace other than `base`, and the engine lowercases every id.
- The Build 41 calls `TraitFactory`, `HasTrait` and `getTraits()` do not exist in the 42.22 capture.
- A positive `Cost` costs points at character creation, and a negative `Cost` refunds them.
- A trait that Lua adds later gets no recipes, no exclusion check and, unless you call it, no XP boost.
- The steps below were written from the 42.22 code and have not been run in a game.
:::

:::facts
- **Registry file** `42/media/registries.lua`
- **Script block** `character_trait_definition`
- **Check a trait** `player:hasTrait(CharacterTrait)`
- **Read the held traits** `player:getCharacterTraits():getKnownTraits()`
- **Translation file** `Translate/EN/UI.json`
:::

## The three pieces of a trait

A Build 42 trait is an id in a registry, a script block that gives the id its cost and effects, and the Lua that reacts to it.

The id comes first. Your `media/registries.lua` calls `CharacterTrait.register("<namespace>:<name>")`, and the game runs that file for every enabled mod before it loads any scripts. :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`, `zombie/GameWindow.java:208-210`)] The id may not use the `base` namespace, because that namespace is reserved for the game's own traits. :cite[(`zombie/scripting/objects/RegistryReset.java:22-29`)]

The second piece is the script block. Its `CharacterTrait` key looks the id up in the registry, which is why registering must come first. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:56-57`)] The keys the block accepts are in the [trait reference](/pz/build-42/modding/skills-and-traits/trait-reference#what-a-trait-definition-holds).

The third piece is your behavior. Vanilla Lua asks `character:hasTrait(CharacterTrait.HEMOPHOBIC)` and passes the registered object, not a string. :cite[(`media/lua/shared/TimedActions/ISApplyBandage.lua:105`, `zombie/characters/IsoGameCharacter.java:5585-5587`)]

## Build the example mod

This builds a mod called `MyTraitMod` with one trait, Scavenger, from an empty folder.

Create the folders below. Put the mod root in the `mods` folder of the game's cache directory, as `Zomboid/mods/MyTraitMod/`. :cite[(`zombie/ZomboidFileSystem.java:548-552`)]

The Workshop path `Zomboid/Workshop/MyTraitMod/Contents/mods/MyTraitMod/` is scanned only when Steam mode is on, so the plain `mods` folder is the route that always works. :cite[(`zombie/ZomboidFileSystem.java:457-465`)]

The mod root has `common` and `42` next to each other; the folder rules are in [the B42 mod project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure). The game reads `mod.info` from the version folder first and from `common` second. :cite[(`zombie/gameStates/ChooseGameInfo.java:198-209`)]

```
Zomboid/mods/MyTraitMod/
  common/
  42/
    mod.info
    media/
      registries.lua
      scripts/mytraitmod_traits.txt
      lua/shared/Translate/EN/UI.json
      lua/server/MyTraitMod_Kit.lua
```

The game finds `registries.lua` at `media/registries.lua` in the version folder, and falls back to the same path in `common`. :cite[(`zombie/scripting/objects/ModRegistries.java:20-27`)]

**Step 1. `42/mod.info`.** The loader reads `name=`, `id=` and `description=` lines. :cite[(`zombie/gameStates/ChooseGameInfo.java:217-243`)]

```
name=My Trait Mod
id=MyTraitMod
description=Adds the Scavenger trait.
```

**Step 2. `42/media/registries.lua`.** This registers the id and keeps the handle in a global table for your Lua. The id is stored in lower case, so `mytraitmod:scavenger` is the id everywhere else. :cite[(`zombie/scripting/objects/ResourceLocation.java:15-37`, `zombie/scripting/objects/CharacterTrait.java:128-137`)]

```lua
MyTraitMod = MyTraitMod or {}
MyTraitMod.traits = {
    Scavenger = CharacterTrait.register("mytraitmod:scavenger"),
}
```

**Step 3. `42/media/scripts/mytraitmod_traits.txt`.** This is the definition. `base:clumsy` and `PlantScavenging` are vanilla names from the trait reference, and `MakeStickTrap` is a vanilla recipe name. :cite[(`media/scripts/generated/recipes/recipes_trapping.txt:25`)]

```
module MyTraitMod
{
    character_trait_definition mytraitmod:scavenger
    {
        IsProfessionTrait = false,
        DisabledInMultiplayer = false,
        CharacterTrait = mytraitmod:scavenger,
        Cost = 4,
        UIName = UI_trait_MyTraitMod_Scavenger,
        UIDescription = UI_trait_MyTraitMod_ScavengerDesc,
        MutuallyExclusiveTraits = base:clumsy,
        XPBoosts = PlantScavenging=1,
        GrantedRecipes = MakeStickTrap,
    }
}
```

The keys, defaults and separators are in the [trait reference](/pz/build-42/modding/skills-and-traits/trait-reference#what-a-trait-definition-holds). The `ResourceLocation` parser reads an id with no namespace as `base`, so a name such as `ClumsyTrait` in `MutuallyExclusiveTraits` points at a trait that does not exist. :cite[(`zombie/scripting/objects/ResourceLocation.java:29-37`)] A skill name that is not a real perk is skipped without an error, and the lookup is case sensitive. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:78-80`, `zombie/characters/skills/PerkFactory.java:392-394`)]

**Step 4. `42/media/lua/shared/Translate/EN/UI.json`.** The `UIName` and `UIDescription` values are looked up as translation keys, and whatever key you write in the script is the key to define. Vanilla keeps its trait text in `UI.json`. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:42-46`, `media/lua/shared/Translate/EN/UI.json:839-840`)] The translator loads one `.json` file per language and file name. :cite[(`zombie/core/Translator.java:365`)]

```json
{
    "UI_trait_MyTraitMod_Scavenger": "Scavenger",
    "UI_trait_MyTraitMod_ScavengerDesc": "Starts with a bandage and knows how to make a stick trap."
}
```

**Step 5. `42/media/lua/server/MyTraitMod_Kit.lua`.** This gives each new Scavenger a bandage. The game applies the traits and then fires `OnNewGame` for a new character, on a server and in single player. :cite[(`zombie/network/packets/character/CreatePlayerPacket.java:300-308`, `zombie/iso/IsoWorld.java:2387-2416`)] Vanilla gives items the same way, with a full item type such as `Base.Belt2`. :cite[(`media/lua/shared/Items/SpawnItems.lua:288`)]

```lua
local function giveScavengerKit(player)
    if player:hasTrait(MyTraitMod.traits.Scavenger) then
        player:getInventory():AddItem("Base.Bandage")
    end
end

Events.OnNewGame.Add(giveScavengerKit)
```

`OnNewGame` receives the player and a square, and fires once per new character, not once per world. :cite[(`api/events.jsonl:135`)]

## Turn it on

Enable the mod where you play, and on a dedicated server list it in the server settings.

- **Single player or host.** Open the Mods screen from the main menu, tick My Trait Mod and start a new game. The menu wording is from the foundations pages, not from a test of this mod.
- **Dedicated server.** Either the server gets the mod from the Workshop, by listing its item id in `WorkshopItems=`, or you copy the mod root into the `mods` folder of the server's own cache directory, so that it is `mods/MyTraitMod/` there. :cite[(`zombie/ZomboidFileSystem.java:443-455`, `zombie/ZomboidFileSystem.java:548-552`)] Then set `Mods=MyTraitMod` in the server's settings file. Separate several entries with `;`, for example `Mods=MyTraitMod;OtherMod` and `WorkshopItems=1234567890;2345678901`. Every player needs the mod too, because the character creation screen runs on their machine. These server steps have not been run in a game.

## What you should see

You can check the result in the character creation screen and in the first minutes of play.

In the trait picker, Scavenger appears in the list of good traits, because its `Cost` is positive, and its right-hand label reads `-4`. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:891-900`, `zombie/characters/traits/CharacterTraitDefinition.java:158-171`)] Its tooltip shows the description plus a `+1` line for the skill in `XPBoosts`. :cite[(`media/lua/shared/NPCs/MainCreationMethods.lua:113-138`)] Picking Clumsy takes Scavenger out of the picker. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:660-682`)]

After you start, the character carries a bandage, knows the stick-trap recipe, and `hasTrait` returns true for the registered object.

If the trait is missing from the picker, check the log. A key the loader does not know is reported as a script error at load. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:91-95`)] None of this has been run in a game.

## Adding or removing a trait while the game runs

Adding a trait after character creation only sets a flag, so everything else the trait normally does is yours to do.

`getCharacterTraits():add(trait)` writes the flag and puts the trait in the list of known traits. It grants no recipes, applies no boost and checks no exclusion. :cite[(`zombie/characters/traits/CharacterTraits.java:76-90`)] It also appends the trait to `knownTraits` each time you call it, even when the character already has it, so test `hasTrait` before you add. :cite[(`zombie/characters/traits/CharacterTraits.java:76-86`)]

Vanilla's own debug panel shows the full pattern for the XP part. It calls `add`, then `modifyTraitXPBoost(trait, false)`, then `SyncXp`, and for removal it calls `remove`, then `modifyTraitXPBoost(trait, true)`. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:592-598`, `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:668-672`)] That call adds or subtracts the trait's `XPBoosts` levels in the character's boost map. :cite[(`zombie/characters/IsoGameCharacter.java:11533-11549`)] Older guides said removal could never undo a boost, and that is no longer true when you make this call.

Recipes are the part nothing undoes. The panel never touches them, so a recipe copied in by hand stays known after the trait is removed. To grant them yourself, read `getGrantedRecipes()` from the definition and add each name to `player:getKnownRecipes()`, the list the engine itself fills. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:128-130`, `zombie/characters/IsoGameCharacter.java:11617-11628`)]

The boost level has two limits to know. `setPerkBoost` clamps a level to 0 through 10, and the XP multiplier is the same for 3 as for any higher level, so a stack of boosts on one skill stops helping at 3. :cite[(`zombie/characters/IsoGameCharacter.java:17720-17728`, `zombie/characters/IsoGameCharacter.java:17824`)]

The save file stores only the trait ids, so nothing in it records why a character has a trait. If your mod must tell a granted trait from a chosen one, keep your own record, for example in the player's mod data. :cite[(`zombie/characters/traits/CharacterTraits.java:106-113`)]

In multiplayer, do the decision and the `add` on the server, and send the change to the client the way vanilla's panel does with `SyncXp`. A client-only `add` is not verified here to desync, but the vanilla panel runs on the owner's client and syncs after it. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:592-598`)]

## Other ways to define or remove a trait

There is a second, Lua-only route to a definition, and a way to hide a trait you do not want.

`CharacterTraitDefinition.addCharacterTraitDefinition` takes a registered trait, a name key, a cost, a description key, a profession flag and optionally the multiplayer flag, and returns the definition. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:57-69`)] You then add the skills, recipes and exclusions on that object with `addXPBoost`, `addGrantedRecipe`, `addMutuallyExclusive` and `addGrantedTrait`. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:181-196`)] The older guide's example passed `CharacterTrait.NightVision`, but the vanilla constant is `CharacterTrait.NIGHT_VISION`, and a new trait still needs its own `register` call. :cite[(`zombie/scripting/objects/CharacterTrait.java:76`)] The script route is simpler, and this route was not run.

The definitions are in a public static map, and `reset` clears it. A mod could remove a definition from that map to hide a trait. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:25`, `zombie/characters/traits/CharacterTraitDefinition.java:71-73`)] The More Traits mod is reported to hide traits this way in a file called `HideTraits.lua`. That report was not checked here.

## What older guides got wrong

These are the claims in the older trait pages that 42.22 contradicts, with the line that decides each.

| Older claim | What 42.22 shows | Code |
|---|---|---|
| Translation keys look like `UI_trait_mymod:mytrait`, or must be `UI_trait_<name>desc` with no namespace. | The key is whatever string `UIName` and `UIDescription` hold, and vanilla keys have mixed spelling. | :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:42-46`, `media/lua/shared/Translate/EN/UI.json:407-408`, `media/lua/shared/Translate/EN/UI.json:839-840`)] |
| An icon is required, or an 18x18 file at `media/ui/Traits/trait_mytrait.png` must exist. | The icon is optional. A missing file falls back to a generic icon, and `Texture` can name another file. The 18x18 size was not checked. | :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:49-52`, `zombie/scripting/objects/CharacterTraitDefinitionScript.java:89-90`)] |
| `Cost` is positive for a benefit on the wiki, so scripts invert it. | In the script a positive `Cost` costs points. This is the same sign the creator uses. | :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:640`)] |
| `MutuallyExclusiveTraits` replaces `setMutualExclusive`. | `CharacterTraitDefinition.setMutualExclusive(a, b)` still exists and adds the pair in both directions. | :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:83-94`)] |
| `XPBoosts` is a boost level capped at 3. | The levels also set the starting skill level, up to 10. Only the stored boost is capped at 3. | :cite[(`zombie/characters/IsoGameCharacter.java:11551-11608`)] |
| Adding a trait never applies an XP boost, and removal can never undo one. | `modifyTraitXPBoost` adds and subtracts a trait's boost levels. | :cite[(`zombie/characters/IsoGameCharacter.java:11533-11549`)] |
| `Events.OnNewGame` and `ItemKey.Weapon.Pistol` in the example. | The event exists. The constant is spelled `ItemKey.Weapon.PISTOL`. | :cite[(`zombie/scripting/objects/ItemKey.java:5105`)] |

Script comments are `/* ... */` only. The parser strips those before it reads the file, then splits values at commas, so a `--` is read as part of a value. :cite[(`zombie/scripting/ScriptParser.java:20-54`, `zombie/scripting/ScriptParser.java:58-89`, `zombie/scripting/ScriptManager.java:1335`)]

The older pages also said `TraitFactory` has no hits anywhere in the game's Lua. That still holds, and no Java class by that name is in the capture either.

The B41 call `HasTrait` and a `getTraits()` method are also missing from `IsoGameCharacter`, which has `hasTrait` and `getCharacterTraits` instead. :cite[(`zombie/characters/IsoGameCharacter.java:4008`, `zombie/characters/IsoGameCharacter.java:5585`)] The method names differ in case, so a B41 `HasTrait` call finds no method in B42. The older notes said this fails silently; we did not check whether it raises an error or returns nil, so test your port.

To walk a Java map from Lua, such as the `XPBoosts` map, wrap it in `transformIntoKahluaTable` first, as vanilla does. :cite[(`zombie/Lua/LuaManager.java:4793-4796`, `media/lua/shared/NPCs/MainCreationMethods.lua:113-118`)]

| Task | Build 41 | Build 42.22 |
|---|---|---|
| Define a trait | `TraitFactory.addTrait(...)` in Lua | A `character_trait_definition` block, or `CharacterTraitDefinition.addCharacterTraitDefinition` |
| Identify a trait | A plain string | A `CharacterTrait` object, for example `CharacterTrait.DESENSITIZED` |
| Check a trait | `HasTrait("Name")` | `hasTrait(CharacterTrait)` |
| Read the held traits | `getTraits()` | `getCharacterTraits():getKnownTraits()` |
| List every definition | `TraitFactory.getTraits()` | `CharacterTraitDefinition.getTraits()` |
| Find one definition | `TraitFactory.getTrait(name)` | `CharacterTraitDefinition.getCharacterTraitDefinition(trait)` |

The Build 41 column is from the older notes and is not part of the 42.22 capture. The Build 42 column is in the cited code. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:75-81`, `zombie/characters/traits/CharacterTraits.java:138-140`)]

## Where the game keeps trait things

These are the vanilla files to read when your trait does not behave.

| Thing | Path | Code |
|---|---|---|
| Trait definitions | `media/scripts/generated/characters/character_traits.txt` | :cite[(`media/scripts/generated/characters/character_traits.txt:1-5`)] |
| Trait text | `media/lua/shared/Translate/EN/UI.json` | :cite[(`zombie/core/Translator.java:365`)] |
| Starting clothing by trait | `media/lua/shared/Definitions/TraitClothingSelectionDefinitions.lua` | :cite[(`media/lua/shared/Definitions/TraitClothingSelectionDefinitions.lua:1-4`)] |
| Character creation screen | `media/lua/client/OptionScreens/CharacterCreationProfession.lua` | :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:638-641`)] |
| Debug panel that adds and removes traits | `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua` | :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:592-598`)] |
| Trait chooser used by that panel | `media/lua/client/ISUI/PlayerStats/ISPlayerStatsChooseTraitUI.lua` | :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsChooseTraitUI.lua:3`)] |

Vanilla call sites to copy:

- `hasTrait(CharacterTrait.HEMOPHOBIC)` in the bandage action. :cite[(`media/lua/shared/TimedActions/ISApplyBandage.lua:105`)]
- `hasTrait(CharacterTrait.DESENSITIZED)` in the inventory transfer action. :cite[(`media/lua/client/TimedActions/ISInventoryTransferAction.lua:131`)]
- `getCharacterTraits():add(trait:getType())` in the debug panel. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:594`)]
- `getCharacterTraits():remove(button.internal)` in the same panel. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:669`)]
- Reading the held traits through `getKnownTraits()`. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:682`)]

## What other trait mods already do

Dynamic traits, the ones you earn or lose by playing, are the first idea most trait modders have, and several mods have built them.

This survey is reported, not verified against 42.22. We searched about a thousand downloaded Workshop items, once by code (`TraitFactory`, which finds older trait mods) and once by name and description (which finds the Build 42 ones). The versions are as we found them on 2026-08-05 on Build 42.20, read from each mod's files and not run in a game by us, and the mods have likely moved on.

[Evolving Traits World](https://steamcommunity.com/sharedfiles/filedetails/?id=2914075159) (ETW), by MusicManiac, makes about sixty vanilla traits dynamic. It was large when we read it (49 Lua files), sandbox-tunable and written with multiplayer in mind, so a mod that fights it over the same traits is likely to lose. Its structure is worth studying: one server-side module per trigger channel.

| Channel | Example traits |
|---|---|
| Kills | Desensitized, Brave, Cowardly, Hemophobic, Pacifist, Eagle Eyed |
| Health and body | Iron Gut, Weak Stomach, Resilient, Prone to Illness, Thick and Thin Skinned, Asthmatic |
| Skills | about 29, from Keen Hearing and Graceful to Handy and Fast Learner |
| Time and routine | Needs Less or More Sleep, Smoker |
| Location | Outdoorsman, Agoraphobic, Claustrophobic |
| Weather, actions, foraging | Night Vision, Axeman, the reader traits, Herbalist, Organized and Dextrous |

Three of its ideas travel well:

- **Smoking as an addiction.** An addiction value rises with each smoke and decays over time, more slowly under stress and panic, with gain and loss thresholds you can tune in the sandbox.
- **Delayed traits.** A trait you qualify for is queued and announced before it lands, instead of appearing out of nowhere.
- **Functions other mods can call.** ETW publishes a shared file of functions, such as its smoking maths, and registers its traits with a separate framework so the character screen can mark which traits are dynamic. Feeding your own actions into ETW costs less than competing with it.

Smaller systems are good reading too:

| Mod | What it is | Worth reading for |
|---|---|---|
| [Adaptive Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3622328997) | About thirty traits in eight Lua files, split into registry, manager, store, notifier, client and server | The smallest complete architecture |
| More Traits - Dynamic (a part of [More Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=1299328280)) | Makes More Traits' own traits dynamic; by the author of ETW | Shipping the traits and the dynamism as separate, optional mods |
| [Lifestyle](https://steamcommunity.com/sharedfiles/filedetails/?id=2997342681) and [Lifestyle: Hobbies](https://steamcommunity.com/sharedfiles/filedetails/?id=3622178177) | A small hourly engine: one flat table of trait, skill and level, checked every in-game hour | The ledger idea below |
| [Somewhat Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3498347699) | Toggles Speed Demon and Sunday Driver from how you drive | A single behavior-driven pair |

The best single idea in the survey is Lifestyle's ledger. It records in the player's mod data which traits its own system granted, and its sandbox option for losing traits has three modes: never lose, lose any, or lose only what the system gave you. The third mode never takes away a trait the player chose at creation, and it is the right default for a mod like this.

When we looked, nobody had built addictions other than smoking, such as alcohol and painkillers, or a general "use it or lose it" decay layer with a grace period, a decay curve and a warning before loss. ETW decays only a handful of channels, because skills themselves never decay.

Trait packs and single-trait mods are good idea sources. The packs are [More Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=1299328280), [Simple Overhaul: Traits and Occupations](https://steamcommunity.com/sharedfiles/filedetails/?id=2840805724), [Even More Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3650143655), [Trait Menagerie](https://steamcommunity.com/sharedfiles/filedetails/?id=3529845220), [Challenge Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3634630898), [Combat Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3427091746) and [Mindset](https://steamcommunity.com/sharedfiles/filedetails/?id=3554341903). The single-trait mods include [Psychopath Trait](https://steamcommunity.com/sharedfiles/filedetails/?id=3736555309) (31 Lua files for one trait), [Asthma](https://steamcommunity.com/sharedfiles/filedetails/?id=3470657747), [Break Into Tears](https://steamcommunity.com/sharedfiles/filedetails/?id=2871038554) and [Paniqeur Trait](https://steamcommunity.com/sharedfiles/filedetails/?id=3393305357). [Driving Skill](https://steamcommunity.com/sharedfiles/filedetails/?id=2721945297) shows how to hang traits off a new skill.

One warning applies to all of them. Mods that add traits with `getTraits():add(...)` or `TraitFactory` were written for Build 41, so they are design references, not code to port. The More Traits mod keeps its old calls commented out as a migration reference, which is reported and not checked here.

:::callout[How we know]{kind=proof}
The registry, script, translation and event facts above come from reading the 42.22 Java and Lua cited beside each one. We did not run a game, so the example mod, the menu steps, the server settings and the multiplayer advice are untested. We did not verify that a client-only `add` desyncs, the 18x18 icon size, or any claim about the mods in the survey, which come from the 2026-08-05 reading on Build 42.20.

Dropped from the older pages: the "CONFIRMED via pzwiki" revision tags, the wiki-derived percentage figures for individual traits, and the claim that no third-party add-a-trait API exists, because the code cannot show a negative about other mods.
:::
