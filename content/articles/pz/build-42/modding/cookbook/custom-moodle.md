---
id: build-42-custom-moodle
slug: custom-moodle
title: Custom moodle
game: pz
version: build-42
section: modding
category: cookbook
difficulty: intermediate
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  A real custom moodle cannot show without Java. Build the Lua substitute instead: a Quiet status badge that appears on the screen while your character sneaks.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - custom-ui
  - modding-stats-and-moodles
  - how-moodles-work
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You can register a moodle type from Lua, but it never shows: its level stays at 0, Lua has no way to set a level, and the game has no icon for it. This follows from the code and was not run in a game.
- What Lua can do instead is draw its own status badge with the UI classes. You build `RecipeDemoMoodle`: one client Lua file, one translation file, and the two files every mod has, `mod.info` and `poster.png`.
- The badge says **Quiet** in a small dark box at the top of the screen, and only while your character is sneaking.
- It does not have the engine's moodle bar, wiggle, tooltip or colors. A real moodle needs a Java change.
:::

:::facts
- **Mod id** `RecipeDemoMoodle`
- **Badge class** `RecipeDemoBadge`, derived from `ISPanel`
- **Files** 4 (`mod.info`, `poster.png`, `QuietBadge.lua`, `UI.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A status badge of your own, because a moodle of your own cannot be made in Lua.**

The moodles are the status icons at the right of the screen, such as Hungry and Panic. This page first shows why a new one cannot join them, and then builds a badge that does a similar job: it appears when a condition is true and vanishes when it is not. The condition here is that your character is sneaking, which is easy to switch on and off.

Why not a real moodle? Three things stand in the way. The level that stays at 0 and the screen's rule of drawing only levels above 0 are what keep it hidden, and a missing icon would matter only if the level were ever raised.

The levels are computed in Java, one branch for each built-in type, and a type you register has no branch, so its level stays at 0. :cite[(`zombie/characters/Moodles/Moodle.java:90-110`, `zombie/characters/Moodles/Moodle.java:578`)] Lua can read a level but not set one: the `Moodle` class has only getters, a chevron setter and `Update`, and `Moodles` has no call that returns a `Moodle`. :cite[(`zombie/characters/Moodles/Moodle.java:38-90`, `zombie/characters/Moodles/Moodles.java:32-63`)] And the icons are a fixed table in code, so a registered type has no texture. :cite[(`zombie/ui/MoodleTextureSet.java:28-57`)] The screen draws only moodles with a level above 0. :cite[(`zombie/ui/MoodlesUI.java:437-450`)]

Registering itself works. `MoodleType.register("<namespace>:<name>")` in `media/registries.lua` makes the type, refuses the `base` namespace, and every character then gets a `Moodle` object for it. :cite[(`zombie/scripting/objects/MoodleType.java:59-69`, `zombie/scripting/objects/RegistryReset.java:22-26`, `zombie/characters/Moodles/Moodles.java:26-30`)]

It would be harmless, and pointless, so this recipe leaves it out. The text keys would be `Moodles_<id>_lvl<N>` and `Moodles_<id>_desc_lvl<N>`, where `<id>` is the registered string with its colon, and they belong in `Moodles.json`. :cite[(`zombie/characters/Moodles/Moodles.java:80`, `zombie/characters/Moodles/Moodles.java:91`, `zombie/scripting/objects/MoodleType.java:68`, `zombie/core/Translator.java:438-439`)] The [modding stats and moodles](/pz/build-42/engine/character-stats/modding-stats-and-moodles) page has the full account.

## The files

**Four files make the mod, in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders and the same `poster.png`. The skeleton's `Boot.lua` is left out here. This recipe uses the panel classes that the [custom UI recipe](/pz/build-42/modding/cookbook/custom-ui) explains.

```
Zomboid/mods/RecipeDemoMoodle/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      lua/
        shared/
          Translate/
            EN/
              UI.json
        client/
          RecipeDemoMoodle/
            QuietBadge.lua
```

The game loads the Lua files of the `shared` folder and then those of the `client` folder, so a UI file belongs in `client`. :cite[(`zombie/Lua/LuaManager.java:1253-1257`)]

## Step by step

**Write the four files in this order: the mod info, the text, then the badge.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Moodle
id=RecipeDemoMoodle
description=Shows a Quiet status badge on the screen while your character sneaks.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/lua/shared/Translate/EN/UI.json`

This holds the badge text. The game picks the table from the start of the key, so keys that start with `UI_` belong in `UI.json`. :cite[(`zombie/core/Translator.java:436-437`)]

**File `42/media/lua/shared/Translate/EN/UI.json`**

```
{
    "UI_RecipeDemoMoodle_Quiet": "Quiet"
}
```

A key with no text shows the key itself, and in debug mode the log says `ERROR: Missing translation`. :cite[(`zombie/core/Translator.java:489-506`)]

### Step 3. `42/media/lua/client/RecipeDemoMoodle/QuietBadge.lua`

This is the badge. It is a class derived from `ISPanel`, as in the [custom UI recipe](/pz/build-42/modding/cookbook/custom-ui). :cite[(`media/lua/shared/ISBaseObject.lua:9-16`, `media/lua/client/ISUI/ISPanel.lua:96-115`)]

**File `42/media/lua/client/RecipeDemoMoodle/QuietBadge.lua`**

```lua
require "ISUI/ISPanel"

RecipeDemoBadge = ISPanel:derive("RecipeDemoBadge")

function RecipeDemoBadge:isActive()
    local player = getPlayer()
    return player ~= nil and player:isSneaking()
end

function RecipeDemoBadge:prerender()
    if self:isActive() then
        ISPanel.prerender(self)
    end
end

function RecipeDemoBadge:render()
    if self:isActive() then
        self:drawText(getText("UI_RecipeDemoMoodle_Quiet"), 12, 6, 0.6, 1, 0.6, 1, UIFont.Small)
    end
end

function RecipeDemoBadge:new(x, y, width, height)
    local o = ISPanel.new(self, x, y, width, height)
    o.wantMouseEvents = false
    return o
end

local function addBadge()
    local width = 80
    local x = (getCore():getScreenWidth() - width) / 2
    local badge = RecipeDemoBadge:new(x, 20, width, 26)
    badge:initialise()
    badge:addToUIManager()
    print("[RecipeDemoMoodle] badge added")
end

Events.OnGameStart.Add(addBadge)
```

Each piece, in the order it appears:

| Piece | What it does | Code |
|-------|--------------|------|
| `player:isSneaking()` | The condition. Vanilla Lua reads it the same way. | `media/lua/client/Foraging/ISSearchManager.lua:1165`, `media/lua/client/ISUI/ISJoystickButtonRadialMenu.lua:76` |
| `prerender` | The panel's own `prerender` draws the dark background and the border. Calling it only while the condition holds is what makes the badge vanish, because the panel itself stays on the screen. | `media/lua/client/ISUI/ISPanel.lua:18-23` |
| `render` | Draws the text, in light green, when the condition holds. `drawText` takes the text, then x, y, red, green, blue, alpha and the font. | `media/lua/client/ISUI/ISUIElement.lua:1293` |
| `o.wantMouseEvents = false` | The panel does not take mouse clicks, so a click on it reaches the game. The new panel starts with the value true, and the Java object reads the field when it is made. | `media/lua/client/ISUI/ISUIElement.lua:1998`, `media/lua/client/ISUI/ISUIElement.lua:1004` |
| `Events.OnGameStart.Add(addBadge)` | Adds the badge once the game has loaded and the player is in. | `zombie/gameStates/IngameState.java:775`, `zombie/Lua/LuaEventManager.java:604` |

Because the panel always exists and decides each frame whether to draw, there is nothing to create and destroy when the condition changes. The function is passed to `.Add` as a value, without calling it.

Leaving a game wipes every Lua event handler and the Lua environment, then loads the files again for the main menu, so the files run again and register the handler again for the next game. :cite[(`zombie/gameStates/IngameState.java:978`, `zombie/gameStates/IngameState.java:1009`, `zombie/gameStates/IngameState.java:1085`)] This page did not check whether the old panel itself is removed from the screen.

### Reading a real moodle

The badge could use a real moodle as its condition instead. A moodle's level is 0 to 4, and a player has a shortcut to read it, for example `player:getMoodleLevel(MoodleType.PANIC)`. :cite[(`zombie/characters/Moodles/Moodles.java:44-46`, `zombie/characters/IsoPlayer.java:8251-8253`)] The engine page lists what Lua can change on the stats that drive the vanilla moodles. Floating text over the character is another substitute, with `player:setHaloNote("text")`, as vanilla does for stat changes. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:27`)]

## Turn it on and see it work

**Enable the mod, start a game, and sneak.**

1. Put the `RecipeDemoMoodle` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoMoodle/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Moodle**, choose **ACCEPT**, and start a new game.
3. At first nothing shows at the top of the screen, and `console.txt` holds `[RecipeDemoMoodle] badge added`.
4. Start sneaking. The key is listed as **Sneak** in the key bindings of the options. :cite[(`media/lua/shared/Translate/EN/UI.json:707`)] A dark box with **Quiet** in green appears at the top center of the screen.
5. Stop sneaking and the box goes away.

The position and size are choices of this page. If the badge sits on top of something, change the numbers in `addBadge`.

On a dedicated server, copy the mod into the server's own `mods` folder and put `Mods=RecipeDemoMoodle` in the settings file. Separate several entries with `;`, and do the same for `WorkshopItems=` when a mod comes from the Workshop. A UI mod needs no server code, but every player needs the mod. These steps have not been run in a game.

## If it does not work

**A badge fails in a few predictable ways, and each one leaves a clue in `console.txt`.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| No `[RecipeDemoMoodle] badge added` line | The mod is not checked, or the file is not under `media/lua/client/`. | `zombie/Lua/LuaManager.java:1253-1257` |
| The badge is always visible, or never | The condition is the whole test. Check that `isSneaking` returns what you expect by printing it. | `media/lua/client/Foraging/ISSearchManager.lua:1165` |
| The badge says `UI_RecipeDemoMoodle_Quiet` | The text is missing from `UI.json`, the file is in the wrong folder, or the key is spelled differently. | `zombie/core/Translator.java:489-506` |
| The moodle you registered from `registries.lua` never appears | This is expected. A registered moodle stays at level 0 and has no icon. | `zombie/characters/Moodles/Moodle.java:578`, `zombie/ui/MoodleTextureSet.java:28-57` |
| The text of a registered moodle shows its key | The keys keep the colon of the id: `Moodles_<namespace>:<name>_lvl1`. An underscore in place of the colon does not match. | `zombie/characters/Moodles/Moodles.java:80`, `zombie/scripting/objects/MoodleType.java:68` |
| A click on the badge does nothing for the game | `o.wantMouseEvents = false` is missing, so the panel takes the click. | `media/lua/client/ISUI/ISUIElement.lua:1004`, `media/lua/client/ISUI/ISUIElement.lua:1998` |

Lua files are read when the game loads, so restart the game after every change. The [debugging Lua page](/pz/build-42/modding/lua-api/debugging-lua-in-b42) covers the log and the debug tools.

## Going further

**Learn the UI classes, read and change the stats behind the moodles, or see how the real ones work.**

- [Custom UI](/pz/build-42/modding/cookbook/custom-ui) builds a full panel with buttons and a right-click entry.
- [Modding stats and moodles](/pz/build-42/engine/character-stats/modding-stats-and-moodles) covers reading and changing stats, multiplayer sync and the Java-only limits.
- [How moodles work](/pz/build-42/engine/character-stats/how-moodles-work) explains the levels and thresholds of the real moodles.
- [Stats and moodles reference](/pz/build-42/engine/character-stats/stats-and-moodles-reference) lists every stat and its range.

:::callout[How we know]{kind=proof}
The claims about why a moodle cannot show come from reading the 42.22 Java and Lua cited above. They were not run in a game: we did not register a moodle and watch it. The badge mod in this page was built file for file in a test folder and passed the script checker and the Lua checker.

It has not been run in a game: the badge, its position and the sneak key are what you check yourself. We did not check controller or split-screen behavior, or how the old badge is removed after you leave a game. The older page also listed unused icons, such as Concentrating and Dizzy, and a mod called MoodleFramework. The texture set loads a fixed list that does not include them, and we did not read that mod.
:::
