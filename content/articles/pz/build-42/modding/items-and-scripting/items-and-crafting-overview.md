---
id: build-42-items-and-crafting-overview
slug: items-and-crafting-overview
title: 'Items, tags and crafting overview'
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - tags
  - workstation
  - skills
excerpt: >-
  A map of the Build 42.22 items and scripting pages: which page to open to write an item, a tag, a workstation, a skill gate, an override, and how to test them.
last_updated: '2026-11-16'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a modder who is about to write a script and wants to know which page to open first. It holds no engine claims of its own; every claim is on the page it links to.

:::callout[The 1-minute version]{kind=key}
- Start with [The big picture](/pz/build-42/modding/items-and-scripting/the-big-picture) for the shape of the system, then [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy) before you write a line.
- To make something, use a cookbook page: [New item](/pz/build-42/modding/cookbook/new-item), [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) or [New workstation](/pz/build-42/modding/cookbook/new-workstation).
- When a script does nothing, open [Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) and read `console.txt`.
:::

## 1. Pick by what you want to do

**Each job below has one page to open first.**

::::cards
:::card[Understand the system]{accent=blue}
[The big picture](/pz/build-42/modding/items-and-scripting/the-big-picture), and the [master checklist](/pz/build-42/modding/items-and-scripting/master-checklist) before you ship.
:::
:::card[Write a script file]{accent=orange}
[Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy): folders, modules, commas, comments.
:::
:::card[Write an item]{accent=purple}
[Items: the item block](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42), then [Item block merge behaviour](/pz/build-42/modding/items-and-scripting/item-block-merge-behaviour).
:::
:::card[Use or add tags]{accent=cream}
[Tags](/pz/build-42/modding/items-and-scripting/tags) for what tags are, [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua) for registering your own.
:::
:::card[Gate by skill and learning]{accent=blue}
[Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning).
:::
:::card[Add a workstation]{accent=orange}
[The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system), then [Tech tiers and production chains](/pz/build-42/modding/items-and-scripting/tech-tiers-and-production-chains).
:::
:::card[Change vanilla]{accent=purple}
[Overriding / patching vanilla](/pz/build-42/modding/items-and-scripting/overriding-patching-vanilla).
:::
:::card[Test and debug]{accent=cream}
[Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors).
:::
::::

## 2. All the pages in order

**The pages are listed in the order a first script usually needs them.**

1. [The big picture](/pz/build-42/modding/items-and-scripting/the-big-picture)
2. [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy)
3. [Items: the item block in B42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42)
4. [Item block merge behaviour](/pz/build-42/modding/items-and-scripting/item-block-merge-behaviour)
5. [Tags](/pz/build-42/modding/items-and-scripting/tags)
6. [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua)
7. [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning)
8. [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system)
9. [Tech tiers and production chains](/pz/build-42/modding/items-and-scripting/tech-tiers-and-production-chains)
10. [timedAction blocks](/pz/build-42/modding/items-and-scripting/timedaction-blocks), a pointer to [Timed actions](/pz/build-42/modding/lua-api/timed-actions), where the topic now lives
11. [Overriding / patching vanilla](/pz/build-42/modding/items-and-scripting/overriding-patching-vanilla)
12. [Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors)
13. [Master checklist](/pz/build-42/modding/items-and-scripting/master-checklist)

The recipe blocks themselves are in the [crafting section](/pz/build-42/modding/crafting/the-new-craftrecipe-block), and the step-by-step builds are in the [cookbook](/pz/build-42/modding/cookbook/cookbook-index).

:::callout[How we know]{kind=proof}
This page only points to other pages, so it holds no engine claim to check. The old page listed 11 parts; this folder now holds the 13 pages above, which adds the two item pages `item-block-merge-behaviour` and `item-tags-from-lua`.
:::
