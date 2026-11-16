---
id: build-42-tags
slug: tags
title: Tags
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - tags
  - crafting
  - itemtag
excerpt: >-
  Tags are the words that join items to recipes in Build 42.22. Where they appear (items, recipe inputs, recipes), how a mod item joins vanilla recipes by carrying a tag, and where to read about Lua.
last_updated: '2026-11-16'
related_articles:
  - items-the-item-block-in-b42
  - item-tags-from-lua
  - script-file-anatomy
  - overriding-patching-vanilla
  - new-craftrecipe
  - new-workstation
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders making an item that vanilla recipes should accept](#2-tags-on-items-and-in-recipe-inputs) | [modders making a recipe or a workstation](#3-tags-on-the-recipe-itself)

:::callout[The 1-minute version]{kind=key}
- A tag is a word that shows up in three places: on an item (`Tags = ...`), in a recipe input (`tags[...]`), and on the recipe itself (`Tags = ...`). The first two are item tags. The third is a separate kind of tag.
- An input written `tags[base:sharpknife;base:meatcleaver]` accepts any item that carries one of the listed tags, and the engine builds that list from every loaded item, mod items included.
- So a mod tool that carries `base:sharpknife` joins every vanilla recipe that asks for that tag, without editing the recipe.
- Recipe tags are plain words. The Java code asks for 66 of them by name (`InHandCraft`, `AnySurfaceCraft`, `CanBeDoneInDark` and others), and a workstation picks its recipes by a tag of the recipe.
- Item tags are objects in Lua, not strings. [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua) covers that.
:::

:::facts
- **Item tags the engine registers** 464
- **Distinct item tags vanilla item scripts use** 458
- **Recipe tags the Java code asks for by name** 66
- **Vanilla item tag ids written without `base:`** 0, in the item files and in the recipe and entity inputs
:::

## 1. Three places, two kinds of tag

**The same word `Tags` means an item tag on an item and a recipe tag on a recipe, and the engine keeps the two apart.**

Item tags and recipe tags are different things in the code. An item tag is an `ItemTag` object in a registry. :cite[(`zombie/scripting/objects/ItemTag.java:484-486`)] A recipe tag is a plain string kept on the recipe. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`)]

::::cards
:::card[On an item]{accent=blue}
`Tags = base:hasmetal;base:sharpknife,` says what the item is. The ids are `;`-separated.
:::
:::card[In a recipe input]{accent=orange}
`item 1 tags[base:sharpknife;base:meatcleaver]` says which items satisfy this ingredient. Any one of the listed tags is enough.
:::
:::card[On the recipe itself]{accent=purple}
`Tags = InHandCraft,` says where and how the recipe can be made, and which workstation offers it.
:::
::::

## 2. Tags on items and in recipe inputs

**An item gets into a recipe by carrying a tag the recipe's input names, so a mod item can join vanilla recipes without touching them.**

An item's `Tags` line is split on `;`, and each entry is looked up as an item tag. :cite[(`zombie/scripting/objects/Item.java:2353-2359`)] An id with no colon is read in the `base` namespace, and ids are lower-cased. :cite[(`zombie/scripting/objects/ResourceLocation.java:25-26`, `zombie/scripting/objects/ResourceLocation.java:33-36`)] Vanilla writes every one of them with the `base:` prefix. :cite[(`media/scripts/generated/items/normal.txt:2812`)]

A recipe input reads its `tags[...]` list the same way, splitting on `;`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:729-739`)] When the engine finishes loading the items, it builds a list of items for each tag from all loaded items. :cite[(`zombie/scripting/ScriptManager.java:158-163`, `zombie/inventory/ItemTags.java:22-30`)] Each input then takes the items of every tag in its list, so one matching tag is enough. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:891-900`)] A tag that no item carries makes the input throw "Tag has no items". :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:893-896`)]

This is the way to make a mod item work in vanilla recipes. A recipe such as the one that carves a stake asks for `tags[base:sharpknife;base:meatcleaver]`, and a mod blade that carries `base:sharpknife` is accepted there. :cite[(`media/scripts/generated/recipes/recipes_carving.txt:3-19`)] You rarely need to edit a vanilla recipe. When you do, see [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts).

### Try it: a blade that vanilla recipes accept

**A one-item mod, then a look at the recipe's ingredient list in game.**

1. Make the folder `Zomboid/mods/TagKnife/` with `42/mod.info` (`name=Tag Knife` and `id=TagKnife`) and `poster.png`, as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Make `Zomboid/mods/TagKnife/42/media/scripts/TagKnife_items.txt`:

```
module TagKnife
{
    item Blade
    {
        DisplayCategory = Tool,
        ItemType = base:normal,
        Weight = 0.5,
        Icon = Cork,
        WorldStaticModel = Cork,
        Tags = base:sharpknife,
    }
}
```

3. Start the game with `-debug`, check **Tag Knife** in the mod list, accept, and start a new game.
4. Open the debug **Items List**, as [New item](/pz/build-42/modding/cookbook/new-item) shows. Add `Blade` and one **Long Stick**.
5. Open the crafting window with the key bound to **Toggle Crafting UI**, as [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) shows, and find **Carve Stake**. Read its **Required Items** list. :cite[(`media/lua/shared/Translate/EN/Recipes.json:1073`, `media/lua/shared/Translate/EN/ItemName.json:2545`)]

Your item shows under its full type, `TagKnife.Blade`, because the mod has no translation file; [New item](/pz/build-42/modding/cookbook/new-item) shows how to name it. This check has not been run in a game. Whether the craft then finishes with a plain item is not verified, because the carving recipe also asks the knife not to be dull. :cite[(`media/scripts/generated/recipes/recipes_carving.txt:13`)]

## 3. Tags on the recipe itself

**A recipe's own `Tags` line is a list of plain words, and the game reads some of them as switches and workstation names.**

The recipe keeps each word of its `Tags` line as a string. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`)] The Java code asks for 66 of those words by name, as the entries of an enum, and a check is a plain look in the recipe's list. :cite[(`zombie/scripting/objects/CraftRecipeTag.java:11-76`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1042-1044`)]

| Recipe tag | What reads it | Code |
|---|---|---|
| `InHandCraft` | The in-hand crafting window lists recipes with this tag or `AnySurfaceCraft`. | `media/lua/client/ISUI/Crafting/ISHandcraftWindow.lua:53`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1058-1060` |
| `AnySurfaceCraft` | The recipe is made on any surface rather than at a workstation, and the crafting logic checks the player's range to the workbench for it. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1054-1056`, `zombie/entity/components/crafting/BaseCraftingLogic.java:928` |
| `CanBeDoneInDark` | Without it, a player too dark to read cannot craft the recipe. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1050-1052`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:760` |
| `PrimitiveForge`, `Stone_Mill`, `ChurnBucket`, `Scutching`, `DryLeatherLarge` | Names of workstations and drying or processing stations. They are in the list of names the Java code knows; how a workstation uses its tag is covered in [New workstation](/pz/build-42/modding/cookbook/new-workstation). | `zombie/scripting/objects/CraftRecipeTag.java:11-76` |
| `Cooking` | In the same list of names. No Java code was found that reads this tag, and what reads it in Lua was not checked. | `zombie/scripting/objects/CraftRecipeTag.java:25` |

A workstation offers the recipes whose tag matches its `Recipes` value, and the tag can be a word of your own, because the game registers the tags it finds on recipes. :cite[(`zombie/scripting/entity/components/crafting/CraftBenchScript.java:58`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:84-91`)] [New workstation](/pz/build-42/modding/cookbook/new-workstation) builds one from scratch. The recipes and their inputs themselves are explained in [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe).

## 4. Where to go next

**Read the Lua page before you check an item's tags in code, and the override page before you edit a vanilla item.**

- [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua): `ItemTag.get`, why `register` is not a lookup, and how a mod registers its own tag.
- [Items: the item block in B42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42): the keys of an item block.
- [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts): what happens when your block has the same name as a vanilla one. An item `Tags` line only adds tags; it never removes one. :cite[(`zombie/scripting/objects/Item.java:2353-2359`)]

:::callout[How we know]{kind=proof}
Read from the 42.22 engine source and scripts; the counts (464 tag fields, 458 distinct item tags, 66 recipe tag names, no tag without a colon) were recounted. The `TagKnife` mod has not been run in a game. Not verified: what each of the 66 recipe tags does beyond the four rows above, what reads `Cooking`, how several tags in one workstation `Recipes` value combine, and what the game does after the "Tag has no items" exception.
:::
