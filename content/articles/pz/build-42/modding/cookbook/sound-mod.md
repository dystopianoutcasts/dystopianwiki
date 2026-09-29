---
id: build-42-sound-mod
slug: sound-mod
title: Sound mod
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
excerpt: 'What you build: a custom sound definition playable from scripts/Lua/vehicles.'
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
  - custom-moodle
  - radio-channel
  - translations
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# Sound mod

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a custom sound definition playable from scripts/Lua/vehicles.

**Files + placement:** `42/media/scripts/sounds.txt` inside a `module`; audio clips (`.ogg`) under `media/sound/`.

**Skeleton** (verbatim from `sound.txt`):

```
module yourModule
{
    sound yourSound
    {
        category = Animal,
        loop     = true,
        is3D     = true,
        clip
        {
            file         = media/sound/RideOfTheValkyries.ogg,
            distanceMin  = 20,
            distanceMax  = 650,
            reverbFactor = 0.1,
            volume       = 0.7,
        }
    }
}
```

**Key fields** (`sound` block fields CONFIRMED from `sound.txt`; `clip` fields CONFIRMED via the worked example -- there is no separate clip schema file):

| Field | Where | Meaning | Tag |
|-------|-------|---------|-----|
| `category` | sound | Grouping (ScriptsDocs: "unclear what this is for"). | CONFIRMED |
| `is3D` | sound | If false, distance does not affect volume (does not affect directionality). | CONFIRMED |
| `loop` | sound | Loops until stopped via Lua or emitter destroyed. | CONFIRMED |
| `master` | sound | Volume group: `Primary` (default), `Ambient`, `Music`, `VehicleEngine` (noted possibly buggy). | CONFIRMED |
| `maxInstancesPerEmitter` | sound | Simultaneous copies per emitter. | CONFIRMED |
| `file` | clip | Path to the `.ogg` clip. | CONFIRMED (example) |
| `distanceMin` / `distanceMax` | clip | Full-volume inner distance / zero-volume outer distance. | CONFIRMED (example) |
| `reverbFactor` | clip | Reverb amount. | CONFIRMED (example) |
| `volume` | clip | Clip gain (0-1). | CONFIRMED (example) |

Multiple `clip { }` blocks may be added; the game randomly picks one on trigger. Vehicle-audio hooks also live on the `sound` block: `engine`, `engineStart`, `engineTurnOff`, `horn`, `handBrake`, `backSignal`, `ignitionFail`, `alarm`, `alarmLoop` (all CONFIRMED names, no descriptions).

**Gotchas.** There is **no** `maxrange`, `gain`, or clip-level `event` field -- use `distanceMin`/`distanceMax` for range and `volume` for gain. The `soundTimeline` block (`soundtimeline.txt`) is a `module` child requiring an ID but declares no parameters.

**Deep reference:** `_raw_scriptsdocs/sound.txt`, `soundtimeline.txt`; `_raw_pzwiki_sources/08_creation_toolkit/Sound_scripts.wiki.txt`; doc 07 (sound).

---

<a name="20-custom--dynamic-radio-channel"></a>
