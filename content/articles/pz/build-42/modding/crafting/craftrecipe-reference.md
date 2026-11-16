---
id: build-42-craftrecipe-reference
slug: craftrecipe-reference
title: craftRecipe reference
game: pz
version: build-42
section: modding
category: crafting
difficulty: intermediate
tags:
  - craftrecipe
  - crafting
  - reference
excerpt: >-
  A map of the Build 42.22 crafting pages: which one to read for the recipe block, inputs, outputs and itemMappers, the legacy recipe, the schema, and starting a craft from Lua.
last_updated: '2026-11-16'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - craftrecipe-outputs-and-itemmappers
  - craftrecipe-vs-legacy-recipe
  - addendum-canonical-craftrecipe-schema
  - handcraft-from-lua-what-the-server-does
  - new-craftrecipe
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who need a recipe, and want to know which crafting page answers their question.

:::callout[The 1-minute version]{kind=key}
- To write your first recipe, follow [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe), then read the pages below for the line you need.
- A recipe is a `craftRecipe` block with an `inputs` block, an `outputs` block and top-level keys. Vanilla 42.22 has no `recipe` block.
- The `time` number is not seconds, and a missing comma on the last line is dropped without a message.
- To change a vanilla recipe, use [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting) and not a copy of the whole block.
- To start a craft from your own Lua, read the handcraft page, and expect a multiplayer server to refuse without telling the client why.
:::

:::facts
- **Pages in this section** 7, this map included
- **Vanilla recipes** 965 `craftRecipe` blocks and 0 `recipe` blocks
- **Top-level keys the loader reads** 26
- **Input flag names** 69, and **output flag names** 12
:::

## 1. Which page to read

**Each crafting page answers one kind of question, and the table says which.**

| Page | Read it when | Short answer |
|---|---|---|
| [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block) | you write the top lines of a recipe | The 26 keys, the comma rule, `time`, and what a bad line does. |
| [craftRecipe inputs in depth](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth) | you write the `inputs` block | Lists, tags, any item, amounts, the three modes, 69 flags and fluid lines. |
| [craftRecipe outputs and itemMappers](/pz/build-42/modding/crafting/craftrecipe-outputs-and-itemmappers) | you write the `outputs` block, or need a result that depends on the input | Plain and mapped results, counts, 12 flags and the default line. |
| [craftRecipe vs legacy recipe](/pz/build-42/modding/crafting/craftrecipe-vs-legacy-recipe) | you have a Build 41 `recipe` | The old parser reads only ingredient lines, so rewrite it as a `craftRecipe`. |
| [ADDENDUM: Canonical craftRecipe schema](/pz/build-42/modding/crafting/addendum-canonical-craftrecipe-schema) | you want every key, tag and form in one place | The schema in tables, and how a mod edits a recipe at runtime. |
| [Crafting and timed actions from Lua](/pz/build-42/modding/crafting/handcraft-from-lua-what-the-server-does) | your Lua presses the craft button for the player | Where inputs come from, what the server re-checks, and why failures are silent. |

## 2. Nearby pages

**The recipe pages lean on the item, tag, workstation and learning pages, and each has its own page.**

- [Items: the item block](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42) and [Tags](/pz/build-42/modding/items-and-scripting/tags): the items a recipe takes and the tags it matches.
- [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system): how a bench picks its recipes from `Tags`.
- [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning): `SkillRequired`, `xpAward`, `NeedToBeLearn` and the Lua hooks.
- [Master checklist](/pz/build-42/modding/items-and-scripting/master-checklist): a last pass over a recipe, with the worked `time` numbers.
- [Evolved recipe](/pz/build-42/modding/cookbook/evolved-recipe) and [New workstation](/pz/build-42/modding/cookbook/new-workstation): the two recipe kinds that follow the same parts.

:::callout[How we know]{kind=proof}
This page only points at the pages above, and the counts in its strip are stated and cited on those pages: 965 and 0 on [craftRecipe vs legacy recipe](/pz/build-42/modding/crafting/craftrecipe-vs-legacy-recipe), 26 keys on [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block), 69 input flags on the inputs page, and 12 output flags on the outputs page. The old page listed five parts and no code reference, so nothing from it was dropped.
:::
