---
id: build-42-radio-channel
slug: radio-channel
title: Custom or dynamic radio channel
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
  What you build: a dynamic radio channel that airs broadcasts at runtime
  (unlike static, pre-scripted channels).
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
  - sound-mod
  - translations
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# Custom or dynamic radio channel

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a dynamic radio channel that airs broadcasts at runtime (unlike static, pre-scripted channels).

**Files + placement:** Lua under `42/media/lua/server/radio/`; channel text via translation type `DynamicRadio` / `RadioData`. Radio channels are **not** a ZedScript block -- they are Lua/Java-driven. [mechanism source: `Creating_dynamic_radio_channels.wiki.txt`, page tagged 41.78; treat as LIKELY for 42.20]

**Channel definition table** (verbatim from vanilla `ISDynamicRadio.lua`):

```lua
modDynamicRadio = {}
modDynamicRadio.valid = true
modDynamicRadio.channels = {
    {
        name = "Super Cool Dynamic Channel",
        freq = {88000, 108000},        -- number = static freq; {min,max} = random pick
        category = "Amateur",          -- maps to ChannelCategory.*
        uuid = "AMTR-133769",          -- must remain fixed; must match radiodata.xml for existing channels
        register = true,               -- false when converting an existing/static channel to dynamic
        airCounterMultiplier = 1.0,    -- optional; how long each text line displays
    }
}
```

**Registration** (the wiki's 5 steps, on new-save world creation via `DynamicRadio.OnLoadRadioScripts`):

```lua
local scriptManager = getZomboidRadio():getScriptManager()
local cat = ChannelCategory.Amateur
local ch = DynamicRadioChannel.new(v.name, v.freq, cat, v.uuid)
ch:setAirCounterMultiplier(v.airCounterMultiplier)   -- optional
scriptManager:AddChannel(ch, false)
DynamicRadio.cache[v.uuid] = ch

-- air a broadcast:
local bc = RadioBroadCast.new(id, -1, -1)            -- -1,-1 = air immediately
bc:AddRadioLine(RadioLine.new("This is a test.", 1, 1, 1))
ch:setAiringBroadcast(bc)
```

**Key fields** (all CONFIRMED per the wiki):

| Field | Meaning |
|-------|---------|
| `name` | Display name in the preset box / radio debugger. |
| `freq` | Frequency: single number (static) or `{min,max}` (random). |
| `category` | String mapped to `ChannelCategory.*`: `Radio Television Military Amateur Bandit Emergency Other`. Determines which radios can preset it. |
| `uuid` | Fixed channel ID used to broadcast; must match `radiodata.xml`. |
| `register` | `true` to add; `false` when making an existing/static channel dynamic. |
| `airCounterMultiplier` | Optional; per-line display duration. |

**Gotchas.** Channel init only runs on **new saves** (`OnLoadRadioScripts`, `_isNewGame`); add/remove later via script-manager Java calls (`RemoveChannel(freq)`). The `uuid` must stay constant and match `radiodata.xml` (path not given in the cache). The wiki page is still 41.78-tagged -- verify the Java class names (`DynamicRadioChannel`, `RadioBroadCast`, `RadioLine`) against a live 42.20 client. RadioLine `effects` codes (`UHP-10`, `TRA+5`, ...) are enumerated in the wiki.

**Deep reference:** `_raw_pzwiki_sources/08_creation_toolkit/Creating_dynamic_radio_channels.wiki.txt`, `Radio.wiki.txt`; doc 07.

---

<a name="21-translations--localization"></a>
