---
id: build-42-patching-vanilla-lua
slug: patching-vanilla-lua
title: 'Patching vanilla Lua: wrap it, never replace it'
game: pz
version: build-42
section: modding
category: changing-vanilla
difficulty: intermediate
tags:
  - lua
  - patching
  - load-order
  - events
  - compatibility
excerpt: >-
  How to change a vanilla Lua function by keeping the original and calling it, where your file must sit, what happens if a mod ships a vanilla path, and how to remove a handler.
last_updated: '2026-11-14'
related_articles:
  - changing-vanilla-start-here
  - overriding-scripts
  - editing-items-at-load
  - changing-loot
  - changing-recipes-and-crafting
  - what-needs-java-and-what-is-impossible
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders writing a patch](#the-idea-in-one-picture) | [modders debugging a patch](#when-it-does-not-work) | [modders tempted to copy a vanilla file](#why-you-must-never-replace-a-whole-vanilla-file)

You know how eating a sandwich takes a fixed time on the progress bar? That time is not a magic number in the engine. It comes out of a Lua function you can read. So the question "how do I make eating faster?" becomes "how do I change one Lua function without breaking everything else?" The answer is a patch that wraps the original.

This page shows the wrap pattern with a complete working mod, explains the load order that makes it safe, shows what the engine does when a mod replaces a vanilla file (so you will not do it), and ends with taking a vanilla handler off an event.

:::callout[The 1-minute version]{kind=key}
- Keep the vanilla function in a `local`, put a new function in its place, and call the original from inside it.
- Put the file in the same folder as the vanilla one, or a later one: `shared` for a `shared` function, `client` for UI classes.
- A mod file always runs after every vanilla file of the same folder, and each relative path runs once.
- Never copy a vanilla file to the same path. Vanilla's copy never runs, the fix freezes at today's version, and the only evidence is one log line.
- To stop vanilla calling a handler, `Events.<Name>.Remove(fn)` with the same function object, after vanilla has added it.
:::

:::facts
- **Lua stages** 3: `shared` and `client` at game start, `server` when a world loads
- **Example patch** halves eating and drinking time, never below 1
- **Steps in a wrap** 3
:::

## The idea in one picture

A vanilla function is a value stored in a table, and your patch swaps it for one that calls the original.

Your patch does three things:

:::flow[A wrap, in three steps]
- Take the original out of the table and keep it in a `local`
- Put a new function in its place
- Inside the new function, call the original, and add your twist before or after it
:::

Nothing the rest of the game does needs to change, because everything that called the old function now calls yours, and yours calls the old one.

## Where the file goes

Your Lua goes under the mod's version folder, in `shared` for a `shared` vanilla function.

A B42 mod keeps its Lua under a version folder:

```
EatFaster\
  42\
    mod.info
    media\
      lua\
        shared\
          EatFaster.lua
```

The engine picks the highest version folder that is not newer than the game (so `42` works for 42.22), and it also reads a `common\` folder if you have one. :cite[(`zombie/ZomboidFileSystem.java:470-483`, `zombie/Lua/LuaManager.java:1161-1190`)] The engine chooses the version folder this way, and for each mod it searches both the common folder and the version folder for `media/lua/<shared|client|server>`.

Why `shared`? The vanilla function we want to change, `ISEatFoodAction:getDuration`, is defined in `media/lua/shared/TimedActions/ISEatFoodAction.lua`, a `shared` file, so it exists on both the client and the server. A patch to it should live in `shared` too, so both sides run it.

## Which folders run when

Lua files load in three stages, and each stage runs vanilla's files first, then the mods' files.

| Stage | Folder | When |
|---|---|---|
| 1 | `shared` | at game start |
| 2 | `client` | at game start |
| 3 | `server` | only when a save or a server world is loaded |

The client path loads `shared` then `client` at boot; the `server` folder is loaded later by the loading screen (and by a dedicated server at its own startup). :cite[(`zombie/Lua/LuaManager.java:1253-1257`, `zombie/gameStates/GameLoadingState.java:156`, `zombie/network/GameServer.java:1517-1519`)] The client loads `shared` then `client` with `LoadDirBase()`, calls `LoadDirBase("server")` when the world loads, and a dedicated server loads `shared`, checksums `client`, then loads `server`. The same table is in [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders); 42.22 matches it.

Inside a stage the engine does this:

- It collects vanilla's files for that folder and sorts them by relative path, ignoring case.
- Then for each mod, in mod-list order, it collects that mod's files, sorts them the same way, and adds them to the end.
- Each relative path runs once.

The code sorts each mod's files, sorts vanilla's, appends the mods and keeps a `done` set. :cite[(`zombie/Lua/LuaManager.java:1195-1201`, `:1204-1209`)]

What this means for you:

- **A mod file always runs after every vanilla file of the same folder.** So a `shared` patch to a `shared` vanilla function can rely on that function existing, without a `require`.
- **A `shared` patch cannot reach a vanilla `client` class.** `shared` runs before `client`. If you patch `ISToolTipInv` (a `client` file) from a `shared` file, `ISToolTipInv` is still `nil`. Put UI patches in `client`.
- **Between two mods, the mod list order decides, then alphabetical order by path inside each mod.** `shared/A_Thing.lua` runs before `shared/B_Thing.lua` in the same mod. If you need another mod's table, use `require` and list that mod in `require=` in `mod.info`.

### How `require` finds files

`require "ISUI/ISPanel"` runs the first file it finds in the folders loaded so far, runs a file only once, and logs a failure instead of crashing.

It tries each of the folders the engine has loaded so far (`media/lua/shared/`, then `client/`, then `server/`). A second `require` returns the same value. If nothing is found, the game logs `require("...") failed` and returns nothing. It does not crash.

Each folder is added to `paths` as it is loaded :cite[(`zombie/Lua/LuaManager.java:1146-1148`)]; `require` itself is a Lua global :cite[(`:5708-5727`)]; a file already loaded returns its saved result :cite[(`:1357-1359`)]; and a file that requires itself, directly or in a loop, logs "recursive require()" and returns nothing. :cite[(`:1336-1343`)]

One consequence: `require "something"` for a `server` file, done from a `client` file at boot, fails, because the `server` folder is not in the list yet.

## The wrap, as a complete mod

The complete mod is a three-line `mod.info` and one `shared` file that wraps two `getDuration` functions.

`mod.info`:

```
name=Eat Faster
id=EatFaster
description=Food and drink take half as long to consume.
```

`42\media\lua\shared\EatFaster.lua`:

```lua
-- Keep the original function before we replace it.
-- ISEatFoodAction is a table, getDuration is a function stored in it.
local vanillaGetDuration = ISEatFoodAction.getDuration

-- Replace it. The colon makes "self" the first argument,
-- the same way vanilla wrote "function ISEatFoodAction:getDuration()".
function ISEatFoodAction:getDuration()
    -- Call the original, passing self along.
    local duration = vanillaGetDuration(self)

    -- Add our twist: halve it, but never go below 1.
    return math.max(1, math.floor(duration / 2))
end

-- Drinking from a fluid container is a different action with its own function.
local vanillaDrinkDuration = ISDrinkFluidAction.getDuration

function ISDrinkFluidAction:getDuration()
    return math.max(1, math.floor(vanillaDrinkDuration(self) / 2))
end
```

Eating and drinking are two separate timed actions. `ISEatFoodAction` covers food; `ISDrinkFluidAction` covers drinking from a fluid container, and its `getDuration` simply returns `self.maxTime`. The second patch is the same pattern. If you only patched the first, drinking from a bottle would stay vanilla. The drink action is its own class :cite[(`media/lua/shared/TimedActions/ISDrinkFluidAction.lua:3`)], its `getDuration` returns `self.maxTime` :cite[(`:122-123`)], and `new` sets `maxTime`. :cite[(`:145`)]

Line by line (the eating patch; the drinking one works the same way):

| Line | What it does |
|---|---|
| `local vanillaGetDuration = ISEatFoodAction.getDuration` | Reads the vanilla function out of the table with a dot. A `local` is private to your file, so no other mod can overwrite it. |
| `function ISEatFoodAction:getDuration()` | Stores a new function under the same name. `:` is shorthand for adding a hidden first parameter called `self`. |
| `vanillaGetDuration(self)` | Calls the old function by hand, so you pass `self` yourself. With a dot call you must pass it; with a colon call it is automatic. |
| `math.max(1, math.floor(duration / 2))` | Returns half, rounded down, and never zero. |

The vanilla function really is written this way: it begins `function ISEatFoodAction:getDuration()` and returns a number of game time units in `maxTime`. The class is `ISBaseTimedAction:derive("ISEatFoodAction")` :cite[(`media/lua/shared/TimedActions/ISEatFoodAction.lua:3`)], `getDuration` starts further down the file :cite[(`:203`)] and ends by returning `maxTime`. :cite[(`:253`)]

**Try it:** enable the mod, start a game, and eat something and drink from a bottle. Both progress bars should fill in about half the time. To confirm the patch ran, add `print("[EatFaster] loaded")` as the last line of the file, then look for that line in the game's `console.txt` (it is in your `Zomboid` folder).

If you see the line but nothing changed, someone else's patch or the vanilla code may be reading a different field. Print the duration you return to see.

> **Multiplayer:** the file is in `shared`, so the server and the client both run it and compute the same duration. Whether the server uses the duration for anything beyond the client's progress bar: not verified.

### Why a derived class's methods follow your patch

A child class looks up a missing method on its parent live, so a patch on the parent reaches every child that does not override it.

Vanilla classes are built by `derive`. The new class gets a metatable that points at its parent, so a method that is not found on the child is looked up on the parent, live. :cite[(`media/lua/shared/ISBaseObject.lua:9-16`)]

So if you patch a method on the class that defines it, every child that does not override it picks up your change. If a child does override it, you must patch the child too. When a patch has no effect, check which class actually holds the function you want.

## Patching a UI method

UI classes use the identical pattern, with the file in `client`.

```lua
-- 42\media\lua\client\MyTooltipPatch.lua
local vanillaRender = ISToolTipInv.render

function ISToolTipInv:render()
    vanillaRender(self)
    -- your extra drawing or logic here, using self.item
end
```

`ISToolTipInv:render` is defined in a `client` file. :cite[(`media/lua/client/ISUI/ISToolTipInv.lua:43`)]

Two warnings. First, `render` very likely runs every frame while a tooltip is open (that is how Lua UI drawing works in general; not verified for this class), so keep your code cheap and do not `print` in it. Second, do not copy the vanilla body into your function. Call the original so every other mod's patch (and vanilla's future changes) keep working.

## Why you must never replace a whole vanilla file

If a mod ships a file at a vanilla path, vanilla's file never runs at all.

The tempting shortcut is to copy a vanilla file into your mod at the same path and edit it. Here is what the engine does when you do that, step by step.

:::flow[What the engine does with a vanilla path]
- Build a map of every file by relative path; a mod file at the same path overwrites the entry, with one log line
- The Lua loader reaches that path and asks the map for the file
- It runs your file in vanilla's place; the second copy is skipped
- Vanilla's file never runs: everything it defined is gone unless your copy repeats it
:::

1. **At start-up the engine builds a map of every file by relative path.** Vanilla's files go in first. Then each mod's files go in, in mod order, and a mod file with the same relative path as an existing entry **overwrites** the entry. The engine writes a line, `mod "<id>" overrides <path>`, to its log, and nothing else.
2. **When the Lua loader reaches that path, it asks the map for the file.** The map now returns your file.
3. **It runs your file in vanilla's place.** The path appears in the list once for vanilla and once for your mod; the loader keeps a set of paths already run, so the second copy is skipped.
4. **Vanilla's file never runs at all.** Everything it defined and every handler it registered is gone, unless your copy repeats it.

Vanilla entries go in first :cite[(`zombie/ZomboidFileSystem.java:123-126`)]; a mod's entry replaces the earlier one :cite[(`:672-677`, `:689-694`)] (and the `overrides` message is logged there :cite[(`:673`)]); `getAbsolutePath` returns whatever is in the map :cite[(`:382-385`)]; and each path runs once, using the map's file. :cite[(`zombie/Lua/LuaManager.java:1204-1215`)]

What can go wrong:

- **You freeze the file at today's version.** When the game updates the file, you do not get the fix. Only your old copy runs.
- **Two mods replacing the same file: only the later mod survives.** Neither knows about the other.
- **Every other mod that wraps a function in that file is working against your copy.** It still works if your copy kept the function; it breaks if you changed it.
- **It is invisible.** The game still starts. Something just behaves differently, and the only evidence is one log line.

A patch that wraps one function does the same job in six lines, leaves the rest of the file vanilla, and stacks with other mods. Use it.

> **Note:** There is one honest use for same-path replacement: a fix to a vanilla file that is so broken that wrapping cannot help. Even then, tell your players, and plan to remove it the day the game fixes the file.

## Removing a vanilla event handler

`Events.<Name>.Remove(fn)` takes a handler off an event, and it works only with the very same function object that `Add` was given.

Sometimes you do not want to change a function; you want vanilla to stop calling it.

```lua
-- 42\media\lua\server\NoDynamicRadioHourly.lua
Events.EveryHours.Remove(DynamicRadio.OnEveryHour)
```

The handler is removed by identity: `Remove` looks for the very same function object that `Add` was given. That is why this works only if you pass the same function. Vanilla added it like this:

```lua
Events.EveryHours.Add(DynamicRadio.OnEveryHour);
```

In vanilla, `DynamicRadio = {}` is declared first :cite[(`media/lua/server/radio/ISDynamicRadio.lua:12`)], then `function DynamicRadio.OnEveryHour()` :cite[(`:138`)], and the `Add` comes last. :cite[(`:157`)] `Remove` calls `callbacks.remove` on the closure it was handed :cite[(`zombie/Lua/Event.java:123-130`)], and `Add` appends the closure. :cite[(`:101-110`)]

Rules for removal:

- **The vanilla file must have run first.** If you remove before vanilla adds, nothing is removed and vanilla adds it afterward. A `server` mod file runs after every vanilla `server` file, so the example above is safe. The same rule as before: put your file in the same folder as the vanilla file, or a later one.
- **You need a name for the function.** `Events.OnTick.Add(function() ... end)` or `local function handler()` cannot be reached by anyone else, so it cannot be removed. Handlers stored in a global table (`DynamicRadio.OnEveryHour`) can.
- **If another mod replaced the table field first, the name now points at their function.** Take a local copy of the reference as early as you can.
- **Think about what the handler did.** Removing the hourly radio update stops that update for everything it served.

`Add` and `Remove` only accept Lua functions. A Java function passed in is ignored.

## When it does not work

Match the symptom in `console.txt` to its likely cause.

| Symptom in `console.txt` | Likely cause |
|---|---|
| `attempt to index nil` at the first line of your patch | You patched a class that has not been defined yet. Move the file to a later folder (`client` after `shared`), or `require` the vanilla file first. |
| Your patch runs twice | Two copies of your file are in play (for example the same file in `common\` and `42\`). The version folder's copy wins and loads once: it is added after `common` and replaces that entry, and each path runs only once :cite[(`ZomboidFileSystem.java:672-694`, `LuaManager.java:1204-1209`)]. Still, check you did not ship both under different names. |
| The patch runs but the behavior does not change | The function you wrapped is overridden further down (a child class). Patch the child, or the class that is really used. |
| Another mod's change disappeared | One of you replaced instead of wrapped. Look for a copy of the vanilla function body. |
| `require("...") failed` | The path or the folder is wrong. `require` takes the path under `media/lua/<folder>/` without `.lua`. |

## Where to go next

- [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts) for data, which merges instead of replacing.
- [Editing items at load](/pz/build-42/modding/changing-vanilla/editing-items-at-load) for changing items from Lua with the right timing.
- [The events system](/pz/build-42/modding/lua-api/the-events-system) for the full event list.
- [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here) for the whole ladder.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and vanilla Lua. Not verified: whether the server uses the eat or drink duration beyond the client's progress bar, and whether `ISToolTipInv:render` runs every frame (assumed from how Lua UI drawing works in general).
:::
