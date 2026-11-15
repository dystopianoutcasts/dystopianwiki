---
id: build-42-cookbook-index
slug: cookbook-index
title: Mod creation cookbook
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
  Start here for the cookbook: build the project skeleton first, pick a recipe from the list, and test each one by reading console.txt.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-item
  - start-here
  - testing-loop-and-common-load-errors
  - in-game-debug-mode-and-dev-tools
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- Build the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) first. It is the folder every other recipe starts from, and it teaches the loop you use to test.
- A recipe prints every file of a small mod in full, so if you copy every block you have the mod. The one exception is the translations page, which is a shorter guide to file layout.
- Each recipe's mod has its own id that starts with `RecipeDemo`, so you can install several at once.
- The loop is the same every time: edit a file, start the game with `-debug`, enable the mod, and read `console.txt`.
:::

:::facts
- **Pages** 22: 21 recipes and the translations guide, each listed below with a difficulty
- **Start with** [Project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
- **Test with** `Zomboid/console.txt` and the debug menu
- **Build** Project Zomboid 42.22
:::

## How to use the cookbook

**Pick one recipe, build its mod file by file, and test it before you start the next.**

The recipes follow one plan: what you will build, the file tree, every file in full, how to turn the mod on and what you should see, what to do when it does not work, and where to read more. The files are copied from a mod that was built and run through the checkers, and the closing note of each recipe says how far it was checked.

A recipe starts from the project skeleton and adds files to it, so you do not need to read the other recipes first.

A model, a texture or a map that comes from a 3D tool, a drawing tool or a mapping tool is named exactly in the recipe that needs it. The recipe either borrows a vanilla one so the mod still loads, or says plainly which step needs the tool.

## The recipes

**The pages are grouped by what they add, and each shows the difficulty its page states.**

Start with the first row. The rest can be done in any order.

| Recipe | What you build | Difficulty |
|--------|----------------|------------|
| [Project skeleton](/pz/build-42/modding/cookbook/project-skeleton) | The empty mod every other recipe starts from, enabled and logging two lines. | beginner |

**Items**

| Recipe | What you build | Difficulty |
|--------|----------------|------------|
| [New item](/pz/build-42/modding/cookbook/new-item) | One plain item with a name, a weight, an icon and a model. | beginner |
| [New food](/pz/build-42/modding/cookbook/new-food) | A food with hunger, nutrition, freshness and cooking. | beginner |
| [New weapon](/pz/build-42/modding/cookbook/new-weapon) | A melee weapon modeled on the vanilla baseball bat. | beginner |
| [New clothing](/pz/build-42/modding/cookbook/new-clothing) | A second cap and a side bag in two custom body locations. | intermediate |
| [Item repair](/pz/build-42/modding/cookbook/item-repair) | A fixing block that repairs a vanilla bat with nails. | beginner |

**Crafting, farming and animals**

| Recipe | What you build | Difficulty |
|--------|----------------|------------|
| [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) | A crafting recipe in the in-hand crafting window. | beginner |
| [Evolved or cooking recipe](/pz/build-42/modding/cookbook/evolved-recipe) | A crust that takes up to three toppings and becomes a snack. | beginner |
| [New workstation or craft bench](/pz/build-42/modding/cookbook/new-workstation) | A placeable bench and a recipe that appears only at it. | beginner |
| [New fluid](/pz/build-42/modding/cookbook/new-fluid) | A new drink and a flask that holds it. | beginner |
| [New crop](/pz/build-42/modding/cookbook/new-crop) | A crop with its own seed item. | beginner |
| [New animal or breed](/pz/build-42/modding/cookbook/new-animal) | A new rabbit breed from one Lua file. | beginner |

**The character and Lua**

| Recipe | What you build | Difficulty |
|--------|----------------|------------|
| [New trait](/pz/build-42/modding/cookbook/new-trait) | A trait in character creation. | beginner |
| [New profession](/pz/build-42/modding/cookbook/new-profession) | A profession in character creation. | beginner |
| [New skill or perk](/pz/build-42/modding/cookbook/new-skill) | A skill in its own group on the skills panel. | intermediate |
| [Custom moodle](/pz/build-42/modding/cookbook/custom-moodle) | A status badge, the Lua substitute for a moodle. | intermediate |
| [Lua gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod) | Client and server Lua with a command round trip and a custom event. | intermediate |
| [Custom UI or HUD](/pz/build-42/modding/cookbook/custom-ui) | A small movable panel with two buttons. | intermediate |

**Media, world and vehicles**

| Recipe | What you build | Difficulty |
|--------|----------------|------------|
| [Custom or dynamic radio channel](/pz/build-42/modding/cookbook/radio-channel) | A radio channel that airs a broadcast every game hour. | beginner |
| [Map, building, or basement](/pz/build-42/modding/cookbook/map-building-basement) | A new start location on the vanilla map, and which files the mapping tools add. | beginner |
| [Vehicle](/pz/build-42/modding/cookbook/vehicle-mod) | A small car built on the vanilla small-car template, model and texture. | beginner |
| [Translations and localization](/pz/build-42/modding/cookbook/translations) | Translated item names, recipes and UI text. | beginner |

Sound has no recipe in this list. The sound pages are in the engine section: [Adding and replacing sounds](/pz/build-42/engine/sound-and-noise/adding-and-replacing-sounds) builds a sound mod from an empty folder.

## How to test a recipe

**Start the game in debug mode, enable the mod, do what the recipe says, and read `console.txt`.**

1. Put the recipe's folder in `Zomboid/mods/`, in the user folder of the game, and not in the game install. :cite[(`zombie/ZomboidFileSystem.java:548-552`)]
2. Add `-debug` to the game's launch options. The game reads `-debug` from its arguments and switches debug mode to enabled. :cite[(`zombie/gameStates/MainScreenState.java:242-243`)]
3. Choose **MODS**, check the mod and choose **ACCEPT**, then start a new game. The [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page shows each click.
4. Do what the recipe's "Turn it on and see it work" section says. Several of them use the debug **Items List**, which the skeleton page introduces.
5. Open `Zomboid/console.txt` in a text editor. The game writes its standard output there. :cite[(`zombie/gameStates/MainScreenState.java:184-188`)] A mod that logs shows its lines, and a file that fails to load leaves an error line.

Script files and translation files are read when the game loads, so restart the game after you change one. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists the load errors you may see, and [debug mode and dev tools](/pz/build-42/modding/foundations/in-game-debug-mode-and-dev-tools) covers what the debug menu offers.

On a dedicated server, copy the mod into the server's own `mods` folder and put its id in the settings file as `Mods=<id>`, with several entries separated by `;`. A `print` on a server goes to the server's log, not to your `console.txt`.

## Where to go next

**The cookbook is the short path; these pages hold the depth.**

- [Start here: what changed in Build 42](/pz/build-42/modding/getting-started/start-here) is the overview of the Build 42 modding model.
- [Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) is the page to open when a script will not load.
- [The B42 mod folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model) explains `common/` and the version folders.

:::callout[How we know]{kind=proof}
Each recipe's mod was built file for file in a test folder, and the code of its page matches that test mod byte for byte. The script checker and the Lua checker passed on each mod that has script files or Lua. No recipe has been run in a game by its author, so the screens each one describes are what you check yourself.

The facts in each recipe are cited to the 42.22 engine code and vanilla files on that recipe's page. The translations guide is an older page and was not built as a test mod.
:::
