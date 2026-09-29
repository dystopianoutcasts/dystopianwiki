---
id: build-42-script-file-anatomy
slug: script-file-anatomy
title: Script file anatomy
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - tags
  - workstation
  - tech-tiers
  - timedaction
excerpt: >-
  [CONFIRMED] Scripts live in media/scripts/ (game) or /media/scripts/ (mod),
  and in B42 the vanilla tree is heavily reorganized into subfolders, notably
  media/scripts/entities// containing three...
last_updated: '2026-09-29'
related_articles:
  - the-big-picture
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - timedaction-blocks
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
# Script file anatomy

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED]** Scripts live in `media/scripts/` (game) or `<mod>/media/scripts/` (mod), and in B42 the vanilla tree is heavily reorganized into subfolders, notably `media/scripts/entities/<domain>/` containing three parallel folders:

```
media/scripts/entities/blacksmith/craftRecipes/   <- craftRecipe blocks
media/scripts/entities/blacksmith/items/          <- item blocks
media/scripts/entities/blacksmith/workstations/   <- entity (workstation) blocks
```

You can name your files anything; the folder layout is organizational. Every block sits inside a `module`:

```
module Base
{
    item Foo { ... }
    craftRecipe Bar { ... }
    entity Baz { ... }
    fluid Qux { ... }
    itemMapper ... { ... }   // usually nested inside a craftRecipe
}
```

**Two different property syntaxes coexist and this trips people up** `[CONFIRMED]`:

- **`item` blocks use `Property = Value,`** (spaces around `=`, everything comma-terminated).
- **`craftRecipe` blocks use `property = value,`** at the top level too, BUT inside `inputs{}`/`outputs{}` the *lines* are ingredient statements (`item 1 tags[...]`) not `key=value`. And `itemMapper` blocks inside use `Source = Target,`.

**Module/import:** to reference items from another module, use `Base.ItemName` (fully-qualified) or add an `imports { Base }` block. Vanilla almost always fully-qualifies with `Base.`. `[CONFIRMED]`
