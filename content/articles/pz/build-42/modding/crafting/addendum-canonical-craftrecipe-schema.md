---
id: build-42-addendum-canonical-craftrecipe-schema
slug: addendum-canonical-craftrecipe-schema
title: 'ADDENDUM: Canonical craftRecipe schema'
game: pz
version: build-42
section: modding
category: crafting
difficulty: intermediate
tags:
  - craftrecipe
  - crafting
  - schema
  - recipe-tags
excerpt: >-
  Every top-level craftRecipe key, the 66 named recipe tags, the input and output line forms and what Lua can change, read from the Build 42.22 code, with a one-recipe example.
last_updated: '2026-11-16'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - craftrecipe-outputs-and-itemmappers
  - craftrecipe-vs-legacy-recipe
  - craftrecipe-reference
  - changing-recipes-and-crafting
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who want every key, tag and line form of a `craftRecipe` in one place. Each row names the page that explains it.

:::callout[The 1-minute version]{kind=key}
- A `craftRecipe` sits in a `module`, or inside an entity as `component CraftRecipe`. A second body with the same id merges into the first.
- The loader reads 26 top-level keys, 4 child blocks, 66 named recipe tags, 69 input flags and 12 output flags. A key or flag it does not know is an error.
- The translation key is the bare recipe id, in `Recipes.json`.
- `CanWalk` and the tag `CanBeDoneWhileWalking` are two separate things at 42.22. The craft action reads the tag, and three Lua display spots read the key, so a recipe with only the tag shows a moving error and still runs.
- `getModTags()` hands Lua the live tag list, and `Load` on a live recipe appends to its input and output lists and does not replace them.
:::

:::facts
- **Top-level keys** 26, in 5 groups (section 2)
- **Child blocks** 4: `inputs`, `outputs`, `itemMapper`, `overlayMapper`
- **Named recipe tags** 66 (`CraftRecipeTag`); the 965 vanilla recipes use 56 of them
- **Hooks** 5 Lua call points, plus `OnAddToMenu`
- **`time` default** 50
:::

## 1. Where a recipe lives and how it is named

**A recipe is a `craftRecipe` block in a module, or a `component CraftRecipe` inside an entity, and its id is the name that translation and lookup use.**

The module form is the normal one for a mod. The entity form is read by the same code and gets the recipe tag `EntityRecipe` added. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipeComponentScript.java:61-67`)] Vanilla has 965 module recipes and 202 entity components. The id has no module in front of it in the translation file: the loader asks for the bare id. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:369`, `zombie/core/Translator.java:699-710`)]

A second body with the same id is added to the entry the first one made, and the loader reads the bodies in order. :cite[(`zombie/scripting/ScriptBucket.java:109-125`, `zombie/scripting/ScriptBucket.java:173-198`)] Single values then replace and list lines add, which is the merge shown on [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting). A body that holds only an `itemMapper` block adds its lines to the mapper of that name. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:614-648`)]

## 2. The top-level keys

**The loader reads these keys, grouped here by job, and a key with an empty value is skipped.**

Keys are compared without regard to case. The vanilla column counts the 965 module recipes, and the key `time` is set in all of them. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:375-503`)]

| Group | Key | Value | What the loader does | Vanilla | Code |
|---|---|---|---|---|---|
| Timing and action | `time` | whole number | Sets the length. 50 if the key is missing. See [the block page](/pz/build-42/modding/crafting/the-new-craftrecipe-block). | 965 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:70`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:380-381` |
| Timing and action | `timedAction` | name | Names a `timedAction` block; a missing block throws. | 885 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:487-488`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:770-775` |
| Timing and action | `Animation` | text | Stored as the recipe's animation name. | 0 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:485-486` |
| Timing and action | `AllowBatchCraft` | true or false | True by default, and any other value turns it off. The crafting panel passes it to its craft control. | 112 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:93`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:499-500`, `media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipePanel.lua:90` |
| Timing and action | `CanWalk` | true or false | Stored, and read only by Lua display code: the "Can walk" line, the list icon and the title header's moving error. The craft action does not read it. | 0 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:501-502`, `media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipeInfoBox.lua:65-70`, `media/lua/client/Entity/ISUI/CraftRecipe/ISRecipeScrollingListBox.lua:112`, `media/lua/client/Entity/ISUI/Controls/ISWidgetTitleHeader.lua:538` |
| Listing | `category` | text | Files the recipe in the crafting list; empty means `Miscellaneous`. | 930 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:489-490`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:223-225` |
| Listing | `Tags` | `;` list | Recipe tags; see section 3. | 965 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496` |
| Listing | `Tooltip` | translation key | Text in the window; an empty value gives none. | 38 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:497-498`, `media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipeInfoBox.lua:104-106` |
| Listing | `icon` | texture name | `Item_` is put in front when missing; a missing texture is logged in debug mode. Without it, the first output's icon is used. | 4 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:378-379`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:703-711`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:788-797` |
| Listing | `recipeGroup` | group name | Stored as the recipe's group. | 9 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:376-377` |
| Listing | `overlayStyle` | style name | Sets the default style of the overlay mapper. | 34 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:503-504` |
| Skill and learning | `SkillRequired` | `Skill:level;...` | Starts a new list. A level of 0 or less is not stored, and an unknown skill is logged and skipped. | 458 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415` |
| Skill and learning | `xpAward` | `Skill:amount;...` | Starts a new list of awards; an unknown skill is logged and skipped. | 560 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:468-481` |
| Skill and learning | `needToBeLearn` | `true` | The recipe has to be learned. The key is read without regard to case, and vanilla writes `NeedToBeLearn`. | 385 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:397-398` |
| Skill and learning | `AutoLearnAll` | `Skill:level;...` | Learned when every listed skill reaches its level. | 160 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:431-445` |
| Skill and learning | `AutoLearnAny` | `Skill:level;...` | Learned when any listed skill reaches its level. | 126 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:416-430` |
| Research | `ResearchSkillLevel` | whole number | Stored as the research level. | 2 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:382-383` |
| Research | `ResearchAll`, `ResearchAny` | skill names `;` | Lists of skills for research. | 0 and 1 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:446-467` |
| Research | `MetaRecipe` | recipe name | Stored as the meta recipe name. | 72 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:483-484` |
| Hooks | `OnTest`, `OnStart`, `OnUpdate`, `OnCreate`, `OnFailed` | function name | Stored by call point, and a later line for the same point replaces the earlier one. | 20, 0, 0, 147, 0 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:384-395`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:333-335` |
| Hooks | `OnAddToMenu` | function name | Stored as text. | 0 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:386-387` |

The words `consumeOnFinish` and `requiresPlayer` are skipped, and `enabled` and `debugOnly` are read by the common block code but then reported as an unknown key. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:375`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:396`, `zombie/scripting/objects/BaseScriptObject.java:172-185`)] The research keys and `MetaRecipe` are only stored here, and this page does not trace what the game does with them.

The five hooks and the learning keys are explained on [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning).

In the 965 module recipes every `OnCreate` value (147) is a method of the Java class `RecipeCodeOnCreate` and every `OnTest` value (20) is a method of `RecipeCodeOnTest`. The entity build recipes use `BuildRecipeCode` instead, for example `OnCreate = BuildRecipeCode.butcheringHook.OnCreate`. :cite[(`media/scripts/generated/entities/animals/workstations/entity_butcher_hook.txt:22`)] The old form `Recipe.OnCreate.Name` does not appear in the 42.22 files.

One key needs a warning. The `CanWalk` key is read by no Java beyond its getter. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:345-347`)] Lua reads it in three places: the window's "Can walk" line, the walking icon in the recipe list, and the title header, which copies it and adds a red moving error while the player moves and the key is unset. :cite[(`media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipeInfoBox.lua:65-70`, `media/lua/client/Entity/ISUI/CraftRecipe/ISRecipeScrollingListBox.lua:112`, `media/lua/client/Entity/ISUI/Controls/ISWidgetTitleHeader.lua:186-188`, `media/lua/client/Entity/ISUI/Controls/ISWidgetTitleHeader.lua:538`)]

That text is display only. The craft action stops a walking player unless the recipe has the tag `CanBeDoneWhileWalking`. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:408-411`)] Vanilla sets the tag on 15 recipes and the key on none, so from the code those 15 recipes show "Can walk: No" and the moving error while you walk, yet the action lets them run. This is read from the code and was not run in a game.

## 3. The recipe tags

**`Tags` is a `;` list of words, and 66 of them have names in the engine.**

:::chips
- AdvancedForge
- AdvancedFurnace
- AnySurfaceCraft
- AutoRotate
- BurnWood
- CannotBeResearched
- CanAlwaysBeResearched
- CanBeDoneFromFloor
- CanBeDoneInDark
- CanBeDoneWhileWalking
- Carpentry
- ChoppingBlock
- ChurnBucket
- CoffeeMachine
- Cooking
- DomeKiln
- DryLeatherLarge
- DryLeatherMedium
- DryLeatherSmall
- DryingRackGrain
- DryingRackHerb
- Electrical
- Engineer
- EntityRecipe
- Farming
- Fishing
- Forge
- FuelCharcoal
- Furnace
- Furniture
- Glassmaking
- Grindstone
- HandPress
- Health
- Heckling
- InHandCraft
- KeyDuplicator
- KilnLarge
- KilnSmall
- Masonry
- MetalBandsaw
- Outdoors
- Packing
- Pottery
- PotteryBench
- PotteryWheel
- PrimitiveForge
- PrimitiveFurnace
- RemoveFlesh
- RemoveFur
- RemoveResultItems
- RightClickOnly
- Rippling
- Scutching
- SpinningWheel
- StandingDrillPress
- Stone_Mill
- Stone_Quern
- Survival
- Survivalist
- TanLeather
- Toaster
- Trapper
- Weaving
- Welding
- WoodCharcoal
:::

The list is the `CraftRecipeTag` list, and each recipe stores its tags as plain strings. :cite[(`zombie/scripting/objects/CraftRecipeTag.java:13-79`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`)] A tag you invent, such as the bench word in the [New workstation](/pz/build-42/modding/cookbook/new-workstation) recipe, is stored the same way, and every one of the 56 tag words in vanilla's module recipes is in the list. Most tags only say which bench or window offers the recipe. The ones the code itself reads are in the table.

| Tag | What reads it | Code |
|---|---|---|
| `InHandCraft`, `AnySurfaceCraft` | Neither needs a workstation, and the crafting window asks for both. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1054-1060`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1590-1596`, `media/lua/client/ISUI/Crafting/ISHandcraftWindow.lua:53` |
| `EntityRecipe` | Marks a build recipe; the entity form adds it. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1598-1600` |
| `Outdoors` | Another tag that needs no workstation. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1590-1596` |
| `CanBeDoneFromFloor` | The crafting window moves items to the player first unless this is set. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1046-1048`, `media/lua/client/Entity/ISUI/CraftRecipe/ISWidgetHandCraftControl.lua:342-350` |
| `CanBeDoneInDark` | Without it the craft stops when the character is too dark to read. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1050-1052`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:19-21` |
| `CanBeDoneWhileWalking` | Without it the craft stops when the character walks. | `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:408-411` |
| `CanAlwaysBeResearched`, `CannotBeResearched` | Decide whether a recipe that must be learned can be researched. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:187-199` |
| `AutoRotate` | The recipe class answers `isAutoRotate()` from it. What asks that question is not traced here. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1062-1064` |

A recipe appears in a window or at a bench only when one of its tags is asked for. The in-hand window asks for `InHandCraft` and `AnySurfaceCraft`, and a bench asks for the tags in its `Recipes` value. :cite[(`media/lua/client/ISUI/Crafting/ISHandcraftWindow.lua:53`, `zombie/scripting/entity/components/crafting/CraftBenchScript.java:68-69`)] The [workstation page](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system) shows how a bench reads that value. Whether any other screen lists a recipe that carries neither is not verified.

## 4. The input and output lines at a glance

**An input line takes `[..]`, `tags[..]`, `mode:`, `flags[..]` and `mappers[..]`, and an output line takes a plain item or `mapper:` with a few options.**

```
inputs
{
    item <count> [Base.X;Base.Y] mode:keep flags[MayDegradeLight] mappers[Name],
    item <count> tags[base:name],
    item 1 [*],
    -fluid 1.0 [Petrol],
}
outputs
{
    item 3 Base.Plank,
    item 1 mapper:Name,
}
itemMapper Name
{
    Base.Plank = Base.Log,
    default = Base.Plank,
}
```

The block is a map and not a recipe: the angle brackets stand for values, and the full rules are on [inputs](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth) and [outputs](/pz/build-42/modding/crafting/craftrecipe-outputs-and-itemmappers). In short, an input names its items in brackets, `mode:keep` keeps a tool, `[*]` is any item, and the `-fluid` line belongs to the item line above it. An output names the item with no brackets. A mapper line reads `ResultItem = UsedItem,`.

## 5. What Lua can change on a live recipe

**A mod can read a recipe and change single values from Lua, but a `Load` on a live recipe adds lines and never removes them.**

The `CraftRecipe` class is exposed to Lua, and `getScriptManager():getCraftRecipe(name)` finds one. :cite[(`zombie/Lua/LuaManager.java:2302`, `zombie/scripting/ScriptManager.java:1059-1072`)] The public method `Load(name, body)` parses the body, takes the block at the top of it and runs the same key loop as a script file. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:361-364`)]

So the body has to hold one `{ ... }` block, and its last value needs a comma, as in a script file. Single values such as `time` are replaced. Each `inputs` or `outputs` line is appended to the recipe's list, and nothing clears the list first. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:585`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:605`)]

Three more things are in reach. `getInputs()` and `getOutputs()` return the live lists. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:253-259`)] `getModTags()` returns the live tag list, while `setTags` in the decompiled source never reads its argument. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:237-243`)] An output's mapper can be reached with `getOutputMapper()`, and the mapper has public `addOutputEntree` and `OnPostWorldDictionaryInit` methods. :cite[(`zombie/scripting/entity/components/crafting/OutputScript.java:167-169`, `zombie/entity/components/crafting/recipe/OutputMapper.java:65-72`, `zombie/entity/components/crafting/recipe/OutputMapper.java:115-135`)]

Not verified: whether an input line added by a late `Load` is resolved to items, because the lists of accepted items are built once when the world dictionary is built (`InputScript.java:874-889`), whether a mapper edited at runtime takes effect, and whether `setTags` works from the bytecode. The cheapest way to change a vanilla recipe stays the second script body on [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting).

## 6. Try it: one recipe that uses the schema

**A one-recipe mod with a skill requirement, an XP award and batch crafting turned off.**

1. Make `Zomboid/mods/SchemaDemo/` with `42/mod.info` and `42/poster.png`, laid out as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Write `42/mod.info`:

```
name=Schema Demo
id=SchemaDemo
description=One recipe that uses a skill requirement, an XP award and no batch crafting.
poster=poster.png
author=Your Name
```

3. Write `42/media/scripts/SchemaDemo_recipes.txt`:

```
module SchemaDemo
{
    craftRecipe SchemaDemoTwine
    {
        time = 150,
        timedAction = Making,
        Tags = AnySurfaceCraft,
        category = Carpentry,
        SkillRequired = Woodwork:1,
        xpAward = Woodwork:5,
        AllowBatchCraft = false,
        inputs
        {
            item 1 tags[base:hammer] mode:keep flags[MayDegradeVeryLight],
            item 2 [Base.Plank],
            item 1 [Base.Nails],
        }
        outputs
        {
            item 1 Base.Twine,
        }
    }
}
```

4. Start the game, open **Mods**, check **Schema Demo** and start a game. In debug mode, set Carpentry to exactly level 1, spawn a hammer, two planks and a nail, and open the crafting window next to a table.

You should find `SchemaDemoTwine` in the Carpentry list under its id. It should show a craft time of 15 seconds at Carpentry level 1, and the crafting panel should switch batch crafting off for it. The skill `Woodwork` is the one the game shows as Carpentry. :cite[(`zombie/characters/skills/PerkFactory.java:117`, `media/lua/shared/Translate/EN/IG_UI.json:200`)] The recipe follows the vanilla toolbox recipe, which also keeps a hammer and uses up planks and a nail. :cite[(`media/scripts/generated/recipes/recipes_carpentry.txt:296-317`)]

:::callout[How we know]{kind=proof}
Every code line above was opened in the 42.22 capture, and the vanilla counts were taken over every `craftRecipe` block under `media/scripts`.

The example mod passed the repo's recipe checker and was not run in a game. Not verified: what the game does with the research keys, `MetaRecipe`, `Animation` and `recipeGroup` beyond storing them, the "Can walk: No" display for the 15 vanilla recipes (read from code), whether a late `Load` resolves new inputs, and whether `setTags` works. Corrected from the old page: the schema no longer comes from a Wiki copy of 42.19, `OnCreate = Recipe.OnCreate.<Fn>` is not the form vanilla uses, `Smithing` is not one of the 66 named tags, `time` is not seconds, and a bench tag is not required for the recipe to load (the recipe is only not offered where nothing asks for its tags). Dropped: the claims about a shipping 42.20 mod rebuilding whole recipes with `Load`, and about Java reflection no longer working, because the 42.22 code shows `Load` appending and neither claim could be re-checked.
:::
