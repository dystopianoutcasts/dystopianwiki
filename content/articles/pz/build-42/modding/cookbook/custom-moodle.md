---
id: build-42-custom-moodle
slug: custom-moodle
title: Custom moodle
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
  What you build: a custom moodle (the top-right status indicators). This recipe
  is PARTIAL / UNCERTAIN -- the cached Moodle.wiki.txt is a player-facing
  reference, not a creation guide, so the...
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
  - new-workstation
  - new-fluid
  - item-repair
  - evolved-recipe
  - new-trait
  - new-profession
  - new-skill
  - new-animal
  - new-crop
  - lua-gameplay-mod
  - custom-ui
  - sound-mod
  - radio-channel
  - translations
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# Custom moodle

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a custom moodle (the top-right status indicators). **This recipe is PARTIAL / UNCERTAIN** -- the cached `Moodle.wiki.txt` is a *player-facing reference*, not a creation guide, so the authoring mechanism is not fully in the cache.

**What is known:**
- `MoodleType` is one of the 11 registerable identifier types -- declare a custom moodle with `MoodleType.register("mymod:Focused")` in `media/registries.lua`. [CONFIRMED -- registries list, doc 01 sec 6]
- Custom moodle text uses translation type `Moodles` -> file `Moodles.json`, key prefix `Moodles_`, retrieved via `getText`. [CONFIRMED -- `Translation.wiki.txt`]
- B42 ships extra moodle icons that exist but are currently unwired: `Concentrating`, `Dizzy`, `Exhausted`, `Happy`, `Scared`, and status types `HearingImpaired`, `Sedated`, `VisionImpaired`, `Wired` (each with a `_32` variant). [CONFIRMED -- `Moodle.wiki.txt` gallery]

**Skeleton (registration + translation only -- the full behavior wiring is a GAP):**

```lua
-- media/registries.lua
MoodleType.register("mymod:Focused")
```
```json
// media/lua/shared/Translate/EN/Moodles.json
{ "Moodles_mymod_Focused_lvl1": "Focused", "Moodles_mymod_Focused_desc1": "You are dialed in." }
```

**Gotchas / GAP.** The cache does **not** contain the "create a custom moodle" behavior mechanism -- whether via engine-native `MoodleType` + icon set + `getMoodles():getMoodle(...)` Lua, or a community `MoodleFramework`. Treat the icon/threshold/effect wiring as **UNCERTAIN**; source a dedicated MoodleFramework / `ISMoodles` reference before shipping. Register the type in registries.lua and prepare `Moodles.json` strings + icons in the meantime.

**Deep reference:** `_raw_pzwiki_sources/08_creation_toolkit/Moodle.wiki.txt` (player reference), `Translation.wiki.txt` (Moodles type); doc 01 sec 6 (registries), doc 05. GAP: custom-moodle behavior mechanism not in cache.

---

<a name="19-sound-mod"></a>
