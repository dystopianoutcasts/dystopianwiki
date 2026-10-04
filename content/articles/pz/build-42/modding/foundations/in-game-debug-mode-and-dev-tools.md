---
id: build-42-in-game-debug-mode-and-dev-tools
slug: in-game-debug-mode-and-dev-tools
title: In-game DEBUG mode and dev tools
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - mod-info
  - registries-lua
  - project-structure
  - workshop-upload
  - debug-mode
excerpt: >-
  [CONFIRMED] (pzwiki Debug mode rev 1442683, page version 42.18.0.) Debug mode
  is the primary modder dev toolkit -- "a modified game state" giving access to
  developer tools that spawn items, toggle...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - b42-status-versioning-and-the-compatibility-model
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - mapping-toolchain-status
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# In-game DEBUG mode and dev tools

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED]** (pzwiki *Debug mode* rev 1442683, page version 42.18.0.) Debug mode is the primary modder dev toolkit -- "a modified game state" giving access to developer tools that spawn items, toggle cheats, teleport, and inspect/edit game state.

**Enable it:**
- Add `-debug` to the game's **startup parameters** before booting. On Steam: right-click Project Zomboid -> Properties -> **Launch Options** -> add `-debug`. **[CONFIRMED]**

**Using it in-game:**
- A **gray bug icon** appears on the left of the HUD (below the map icon). **Clicking it turns it green and opens the debug menu.** **[CONFIRMED -- correction: it turns GREEN, not red as the earlier snippet research stated.]** (pzwiki *Debug mode*.)
- **Debug menu (Main tab)** provides: General debuggers (Game / Blood / Body / Search Mode), a large **Cheats** panel (God Mode, No Clip, Invisible, Unlimited Carry/Endurance/Ammo, Know All Recipes, Build Cheat, Timed Action Instant, Animal Cheat, LootZed/LootLog, Brush Tool, and more), **Items List** (spawn any item), **Player's Stats** (traits/skills), plus stubs for Craft Recipes, Entities, Fluids, Recipe Monitor, Sandbox Settings, Script Manager, XUI Debugger. **[CONFIRMED]**
- **Dev tab** adds advanced tools: Animation Viewer, Attachment Editor, Character/Chunk Debuggers, Global Mod Data/Objects, isoRegions, Map Editor, Vehicle Editor, Zombie Population, and more. **[CONFIRMED]**
- **Debug scenarios**: a list on the main menu; double-click one to start a predefined scenario. Custom scenarios edit `ProjectZomboid\media\lua\client\DebugUIs\Scenarios\DebugScenario.lua`. **[CONFIRMED]**
- **Lua Debugger**: press **F11** (rebindable) to break into the debugger at the next Lua entry point; shows all loaded Lua files. The **Map Debugger** (its "Map" button) lets you teleport to the cursor with **T** (no confirmation prompt). **[CONFIRMED]**
- **Command console / Lua Console** is available in options. If a Lua-debugger option keeps crashing the client on launch, disable it in `%UserProfile%\Zomboid\debug-options.init` (`~/Zomboid/debug-options.init` on Linux and macOS). **[CONFIRMED]**

**Hot reloading [CONFIRMED]** (pzwiki *Hot reloading* rev 1324301, page version 42.14.0): you can apply Lua / animation / model / script changes in-game without restarting, via the debug menu (F11) or, more manageably, the Community Debug Tools. Note the in-game "reload file" button is often unreliable for freshly edited code.

**Diagnosing the silent-B41 failure:** with `-debug` the console prints script and Lua load errors; combined with `console.txt` / `server-console.txt` (Section 2) this names the offending file. Running with `-debug` surfaces errors loudly instead of swallowing them -- desirable during porting; fix or disable the erroring mod rather than turning debug off. **[CONFIRMED]**

There is also a community `[B42]DebugMenu` Workshop mod that extends the debug UI, but the built-in `-debug` is sufficient for foundation work. **[CONFIRMED]**

---

<a name="9-mapping"></a>
