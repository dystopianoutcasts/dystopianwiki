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
  Build a mod that adds a radio channel and airs a three-line broadcast on it every game hour, then tune a walkie-talkie to it.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - radio-and-television
  - lua-classes-sound-and-radio
  - lua-gameplay-mod
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoRadio`: `mod.info`, `poster.png` and one server Lua file that adds a channel to vanilla's dynamic radio list.
- The channel is called Recipe Demo Radio. The mod airs a three-line broadcast when the world loads and again every game hour.
- The channel takes a random frequency between 88.0 and 108.0 MHz the first time a world loads. The mod writes that frequency into `console.txt`, so you know where to tune.
- You spawn a walkie-talkie from the debug Items List, tune it to that frequency and read the lines.
:::

:::facts
- **Mod id** `RecipeDemoRadio`
- **Files** 3 (`mod.info`, `poster.png`, `RecipeDemoRadioChannel.lua`)
- **Channel** `RDMO-420001`, category Amateur, frequency chosen from 88000 to 108000
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A radio station that the game lists next to the vanilla ones, speaking lines you wrote.**

The vanilla emergency weather channel is a dynamic channel: a Lua table entry registers it, and Lua hands it a new broadcast every game hour. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:15-24`, `media/lua/server/radio/ISDynamicRadio.lua:138-153`, `media/lua/server/radio/ISWeatherChannel.lua:82-96`)] This recipe copies that pattern for a channel of your own, so you never edit a vanilla file.

In the game, a walkie-talkie tuned to the channel shows three lines of text, in light green, one after another. Then the channel goes quiet until the next game hour.

## The files

**One Lua file on top of the skeleton's `mod.info` and `poster.png`.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders and the same `poster.png`. This recipe leaves out the skeleton's `Boot.lua`.

```
Zomboid/mods/RecipeDemoRadio/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      lua/
        server/
          RecipeDemoRadio/
            RecipeDemoRadioChannel.lua
```

Vanilla keeps its radio scripts in `media/lua/server/radio/`, and the recipe puts its file in `media/lua/server/` as well. The game loads the vanilla files first and the mod files after them, so `DynamicRadio` already exists when your file runs. :cite[(`zombie/Lua/LuaManager.java:1196-1203`)]

## Step by step

**Write `mod.info`, copy the poster, then write the one Lua file.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page. The recipe has no `require=` line, because it needs no other mod.

**File `42/mod.info`**

```
name=Recipe Demo Radio
id=RecipeDemoRadio
description=A dynamic radio channel that airs a short broadcast every game hour.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/lua/server/RecipeDemoRadio/RecipeDemoRadioChannel.lua`

This file adds one entry to vanilla's channel list, then registers a script that gives the channel a broadcast. It is modeled on the vanilla channel table and on the weather channel's two functions. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:15-24`, `media/lua/server/radio/ISWeatherChannel.lua:82-96`)]

**File `42/media/lua/server/RecipeDemoRadio/RecipeDemoRadioChannel.lua`**

```lua
if isClient() then return end

local CHANNEL_UUID = "RDMO-420001"

RecipeDemoRadio = {}
RecipeDemoRadio.channelUUID = CHANNEL_UUID

table.insert(DynamicRadio.channels, {
    name = "Recipe Demo Radio",
    freq = {88000, 108000},
    category = "Amateur",
    uuid = CHANNEL_UUID,
    register = true,
    airCounterMultiplier = 1.0,
})

local function buildBroadcast(hour)
    local bc = RadioBroadCast.new("RDMO-" .. tostring(ZombRand(100000, 999999)), -1, -1)
    bc:AddRadioLine(RadioLine.new("This is Recipe Demo Radio, broadcasting from a basement near you.", 0.6, 0.9, 0.6))
    bc:AddRadioLine(RadioLine.new("The hour is " .. tostring(hour) .. ". Stay inside and stay quiet.", 0.6, 0.9, 0.6))
    bc:AddRadioLine(RadioLine.new("This broadcast repeats every hour. Good night.", 0.6, 0.9, 0.6))
    return bc
end

function RecipeDemoRadio.OnEveryHour(channel, gametime, radio)
    channel:setAiringBroadcast(buildBroadcast(gametime:getHour()))
end

function RecipeDemoRadio.OnLoadRadioScripts(scriptManager, isNewGame)
    table.insert(DynamicRadio.scripts, RecipeDemoRadio)

    local channel = DynamicRadio.cache[CHANNEL_UUID]
    if not channel then
        print("[RecipeDemoRadio] ERROR: channel " .. CHANNEL_UUID .. " was not registered")
        return
    end

    print("[RecipeDemoRadio] channel registered: " .. channel:GetName() .. " at " .. tostring(channel:GetFrequency() / 1000) .. " MHz")
    channel:setAiringBroadcast(buildBroadcast(getGameTime():getHour()))
end

Events.OnLoadRadioScripts.Add(RecipeDemoRadio.OnLoadRadioScripts)
```

**The first line** stops the file on a multiplayer client. The game loads `media/lua/server/` on a client too, but a client has no radio script manager and never raises the radio-load event. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`, `zombie/radio/ZomboidRadio.java:223-230`, `zombie/radio/ZomboidRadio.java:258`)] Vanilla opens other server files with the same guard. :cite[(`media/lua/server/ClientCommands.lua:1`)]

**The channel table** has the fields vanilla's own entry has. The vanilla loader reads them like this:

| Field | What vanilla does with it | Code |
|-------|---------------------------|------|
| `name` | Becomes the channel's display name. | `media/lua/server/radio/ISDynamicRadio.lua:111` |
| `freq` | A number is a fixed frequency. A table `{min, max}` is turned into one random frequency, or into that number when min and max are equal. | `media/lua/server/radio/ISDynamicRadio.lua:73-81` |
| `category` | One of `Radio`, `Emergency`, `Television`, `Military`, `Amateur` or `Bandit`. Any other text becomes `Other`. | `media/lua/server/radio/ISDynamicRadio.lua:92-107` |
| `uuid` | The id that finds the channel again, and that the cache is keyed by. | `media/lua/server/radio/ISDynamicRadio.lua:119-123` |
| `register` | `true` creates the channel. `false` looks up an existing channel by its uuid instead. | `media/lua/server/radio/ISDynamicRadio.lua:109-120` |
| `airCounterMultiplier` | Optional. A value above 0 is passed to the channel, which keeps it between 0.1 and 10. | `media/lua/server/radio/ISDynamicRadio.lua:113-115`, `zombie/radio/scripting/RadioChannel.java:286-288` |

A random frequency is a multiple of 200 inside the range, and the engine skips frequencies that are already in use. :cite[(`zombie/radio/ZomboidRadio.java:181-187`)] The vanilla loader stores the result in the game's mod data, and a later load reuses a stored number. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:63-71`, `media/lua/server/radio/ISDynamicRadio.lua:83`)] That is why the channel keeps its frequency in a saved game.

**The broadcast** is a `RadioBroadCast` with an id and the two stamps `-1, -1`, followed by lines made with `RadioLine.new(text, red, green, blue)`. :cite[(`zombie/radio/scripting/RadioBroadCast.java:27`, `zombie/radio/scripting/RadioBroadCast.java:124-128`, `zombie/radio/scripting/RadioLine.java:21-23`)] The weather channel builds its broadcast the same way, with an id made from a random number. :cite[(`media/lua/server/radio/ISWeatherChannel.lua:100-101`)] The three numbers are the text color, from 0 to 1, and the channel sends each line in that color. :cite[(`zombie/radio/scripting/RadioChannel.java:244`)] How long a line stays on air depends on its text length, with a minimum and a maximum, and `airCounterMultiplier` scales it. :cite[(`zombie/radio/scripting/RadioChannel.java:249-258`)] When the last line has aired, the channel drops the broadcast and stays quiet. :cite[(`zombie/radio/scripting/RadioChannel.java:231-235`)]

**The two functions** do the work after the world loads. The engine raises `OnLoadRadioScripts` once the radio starts on a server or in single player. :cite[(`zombie/radio/ZomboidRadio.java:258`)] Vanilla's handler was added to the event first, and the event calls handlers in the order they were added, so by the time yours runs the channel is already in `DynamicRadio.cache`. :cite[(`zombie/Lua/Event.java:38-39`, `zombie/Lua/Event.java:106`)] Pushing your table into `DynamicRadio.scripts` makes vanilla's hourly handler call your `OnEveryHour` with the channel, the game time and the radio. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:138-153`)] The hourly handler runs from the `EveryHours` event, which the game time raises when the hour changes. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:157`, `zombie/GameTime.java:609-611`)]

The classes you call are exposed to Lua by the engine. :cite[(`zombie/Lua/LuaManager.java:2268-2273`)]

## Turn it on and see it work

**Load the mod, read the frequency in the log, spawn a walkie-talkie and tune it.**

1. Put the `RecipeDemoRadio` folder in `Zomboid/mods/`. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Radio**, choose **ACCEPT**, and start a new game.
2. Open `Zomboid/console.txt` and find the line `[RecipeDemoRadio] channel registered: Recipe Demo Radio at 97.4 MHz`. Your frequency will differ; note it.
3. Click the debug button in the left side bar, choose **Items List**, search for `Walkie` and add a walkie-talkie. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:453-458`, `media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:23`)] The item `Base.WalkieTalkie1` is a battery radio that can tune from 75000 to 150000, which includes 88000 to 108000. :cite[(`media/scripts/generated/items/radio.txt:3-30`)]
4. Hold the radio in a hand, right-click it and choose **Device Options**. :cite[(`media/lua/client/ISUI/ISRadioAndTvMenu.lua:34-36`, `media/lua/shared/Translate/EN/IG_UI.json:703`)] In the window, power the radio up, set the frequency from step 2 and choose **Tune in**. :cite[(`media/lua/client/RadioCom/RadioWindowModules/RWMChannel.lua:25`, `media/lua/shared/Translate/EN/IG_UI.json:717`)]
5. Wait. The mod aired its first broadcast when the world loaded, so the lines may already be over. The next one starts when the game hour changes.

You should see the three lines, one after another, then silence. With the radio tuned, each new game hour starts them again.

On a dedicated server, put `Mods=RecipeDemoRadio` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. A `print` on a server goes to the server's log, not to your `console.txt`, so read the server log for the frequency line. These server steps have not been run in a game.

## If it does not work

**A radio channel fails quietly, so the clue is the frequency line in the log, or its absence.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| No `[RecipeDemoRadio]` line at all | The mod is not checked for this game, or the file is not under `media/lua/server/`. On a multiplayer client the file stops at its first line by design. | `zombie/radio/ZomboidRadio.java:223-230`, `media/lua/server/ClientCommands.lua:1` |
| `[RecipeDemoRadio] ERROR: channel RDMO-420001 was not registered` | The table entry was not in `DynamicRadio.channels` when the event fired, or `register` was `false`. | `media/lua/server/radio/ISDynamicRadio.lua:109-123` |
| A Lua error about indexing `DynamicRadio` (a nil value) | The channel table does not exist yet, so your file ran before the vanilla file or the vanilla file is gone. Keep the file under `media/lua/server/`. | `zombie/Lua/LuaManager.java:1196-1203` |
| The frequency line is printed, but no radio finds the channel, and the log (with radio debug output on) says `channel is null or frequency key already exists` | You gave a fixed `freq` that another channel already uses. The channel is created but not added to the dial. Use a `{min, max}` range, which skips used frequencies. | `zombie/radio/scripting/RadioScriptManager.java:104-106`, `zombie/radio/ZomboidRadio.java:181-187` |
| The lines never appear on the radio | The radio is off, has no battery, or is tuned to another frequency. Check the number against the log line. | `media/scripts/generated/items/radio.txt:3-30` |
| The channel moved to a new frequency | A new world picks a new random number. An old save keeps the one stored in its mod data. | `media/lua/server/radio/ISDynamicRadio.lua:63-71` |

Radio debug output is a separate debug type, so the log line in the fourth row may not appear unless you turn that type on. This page did not check how to turn it on.

## Going further

**Read how the radio system works, or add more channels and scripts.**

- [Radio and television](/pz/build-42/modding/engine/radio-and-television) explains the radio system the channel plugs into.
- [Lua classes: sound and radio](/pz/build-42/modding/reference/lua-classes-sound-and-radio) lists the radio classes the game exposes to Lua.
- [Lua gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod) shows events and a server command round trip.

:::callout[How we know]{kind=proof}
The channel table, the registration and the hourly call come from vanilla's `ISDynamicRadio.lua` and `ISWeatherChannel.lua`, and the class behavior from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker. It has not been run in a game: the log line, the walkie-talkie window and the three lines of text are what you check yourself.

This page did not check whether the first broadcast is still airing when you tune in, and it did not check the walkie-talkie's starting battery charge. The old page said the channel is created only on a new save; the code raises the event on every load of a world, so that claim was dropped.
:::
