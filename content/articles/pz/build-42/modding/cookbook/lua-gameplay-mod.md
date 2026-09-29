---
id: build-42-lua-gameplay-mod
slug: lua-gameplay-mod
title: Lua gameplay mod
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
  What you build: runtime behavior in Lua -- hooking engine events, persisting
  state in ModData, and doing server-authoritative work in multiplayer.
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
  - custom-ui
  - custom-moodle
  - sound-mod
  - radio-channel
  - translations
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# Lua gameplay mod

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** runtime behavior in Lua -- hooking engine events, persisting state in ModData, and doing server-authoritative work in multiplayer.

**Files + placement:** `42/media/lua/shared/` (data/utils, loaded first), `client/` (UI, input, visuals), `server/` (authoritative logic, loaded only when a world starts). [CONFIRMED -- doc 01 sec 7]

**Events** [CONFIRMED -- doc 03 sec 6-7]:

```lua
-- pass a bare function REFERENCE, never a call
local function onGameStart()
    print("mod loaded")
end
Events.OnGameStart.Add(onGameStart)     -- correct
-- Events.OnGameStart.Add(onGameStart()) -- BUG: calls it now, registers the return value

-- custom events (declare in shared/)
LuaEventManager.AddEvent("MyCustomEvent")
Events.MyCustomEvent.Add(handler)
```

Common events: `OnGameBoot`, `OnGameStart`, `OnInitGlobalModData(newGame)`, `EveryOneMinute`, `EveryHours`, `OnTick`, `OnCreatePlayer(num, player)`, `OnPlayerUpdate(player)`, `OnWeaponHitCharacter(attacker, target, weapon, damage)`, `OnFillInventoryObjectContextMenu(num, context, items)`, `OnFillWorldObjectContextMenu(num, context, objs, test)`.

**ModData (persistent state, NOT auto-synced)** [CONFIRMED -- doc 03 sec 8]:

```lua
local modData
Events.OnInitGlobalModData.Add(function()
    modData = ModData.getOrCreate("MyModDataID")   -- init/cache the stable reference here
    modData.counter = modData.counter or 0
end)
-- writes persist automatically:  modData.counter = modData.counter + 1
```

Gotchas: nothing auto-syncs. Don't mutate ModData in `OnSave` (it touches next session's data). On MP clients, GlobalModData is not saved -- store reconnect-critical data server-side. Small syncs: `ModData.transmit("key")` + intercept via `Events.OnReceiveGlobalModData(key, data)`; large data -> use commands.

**MP commands (server-authoritative)** [CONFIRMED -- doc 03 sec 9]:

```lua
-- CLIENT -> SERVER : 3-arg; the sender IsoPlayer is auto-passed to OnClientCommand
sendClientCommand("MyMod", "requestThing", { id = 42 })

-- SERVER: receive, validate, act, reply
local function onClientCommand(module, command, playerObj, args)
    if module == "MyMod" and command == "requestThing" then
        -- do authoritative work with playerObj + args
        sendServerCommand(playerObj, "MyMod", "thingResult", { ok = true })
    end
end
Events.OnClientCommand.Add(onClientCommand)

-- CLIENT: receive the reply
Events.OnServerCommand.Add(function(module, command, args) end)
```

`args` may hold only plain data (strings/numbers/booleans/tables) -- never a Java object like `IsoPlayer`. `onlineID` is not persistent; don't use it to identify entities across load/unload.

**Gotchas.** Inventory + all timed actions are server-side in B42 (42.13.1); client-trusted mutations desync or trip anti-cheat -- route them through commands. Timed actions must be stored globally (`_G[Action.Type] = Action`) to work in MP. Don't guard Java method calls with `if obj.method then` and don't use `pcall` -- both are AI-code tells that mask real errors.

**Deep reference:** doc 03 (`03_LUA_API_AND_ENGINE.md`) sec 6-9; doc 01 sec 7 (load order).

---

<a name="17-custom-ui--hud-isui"></a>
