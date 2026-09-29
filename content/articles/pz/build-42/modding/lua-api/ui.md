---
id: build-42-ui
slug: ui
title: UI
game: pz
version: build-42
section: modding
category: lua-api
difficulty: intermediate
tags:
  - lua-api
  - events
  - moddata
  - timed-actions
  - multiplayer
excerpt: >-
  B42 UI still builds on the ISUI hierarchy (ISUIElement -> ISPanel ->
  ISCollapsableWindow, etc.), and these are Lua objects created via derive + new
  (same mechanism as timed actions, see Section...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
  - registries-lua-the-new-b42-13-identifier-system
  - the-events-system
  - key-globals-and-classes
  - moddata
  - multiplayer-command-patterns
  - timed-actions
  - engine-internals-calling-exposed-java-from-lua
  - b41-b42-breaking-changes
  - hooks-for-new-b42-systems
  - debugging-lua-in-b42
  - recommended-tooling
---
# UI (ISUIElement / ISPanel)  [LIKELY — pzwiki cache does not include a UI page; verify against B42 ISUI / LuaDocs]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B42 UI still builds on the ISUI hierarchy (`ISUIElement` -> `ISPanel` -> `ISCollapsableWindow`, etc.), and these are Lua objects created via `derive` + `new` (same mechanism as timed actions, see [Section 12](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)). Typical panel:
```lua
local MyWindow = ISCollapsableWindow:derive("MyWindow")

function MyWindow:createChildren()
    ISCollapsableWindow.createChildren(self)
    self.btn = ISButton:new(10, 30, 100, 25, "Click", self, MyWindow.onClick)
    self.btn:initialise()
    self:addChild(self.btn)
end

function MyWindow:onClick() print("clicked") end

function MyWindow:new(x, y, w, h)
    return ISCollapsableWindow.new(self, x, y, w, h)
end
```
Hook creation via `Events.OnCreateUI` or open on demand. **[LIKELY]** The pzwiki `Lua (API)` page notes UI elements are Lua objects and points to the `User Interface` page (not in this cache). Verify exact ISUI method availability against LuaDocs before relying on edge features. **[CONFIRMED that UI elements are Lua objects via derive — pzwiki Lua (API), revid 1390433 / Lua object, revid 1390443]**

---

<a name="12-engine-internals"></a>
