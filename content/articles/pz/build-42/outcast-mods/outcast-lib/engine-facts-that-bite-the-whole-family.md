---
id: build-42-engine-facts-that-bite-the-whole-family
slug: engine-facts-that-bite-the-whole-family
title: Engine facts that bite the whole family
game: pz
version: build-42
section: outcast-mods
category: outcast-lib
difficulty: advanced
tags:
  - outcast-lib
  - api
  - ol-init
  - containers
excerpt: >-
  Not API. Things the library has had to establish, recorded here because each
  one has already cost somebody a day and none of them are guessable.
last_updated: '2026-10-04'
related_articles:
  - implementation-status
  - ol-init
  - ol-containers
  - ol-reach
  - ol-squares
  - ol-compat
  - ol-options
  - ol-vehicleparts
  - ol-debug
  - log-file-location
  - log-line-visibility
  - open-spikes-collected
---
# Engine facts that bite the whole family

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Not API. Things the library has had to establish, recorded here because each one
has already cost somebody a day and none of them are guessable.

### PZ's Lua exposes METHODS. It does not expose public instance fields.

Verified 2026-08-26, after OutcastHusbandry's offline catch-up turned out to be
inert on every server it had ever run on.

`LuaManager.Exposer` is an explicit allowlist of `setExposed(Class)` calls, and
`LuaJavaClassExposer` binds **methods**. The only field reflection anywhere in
`LuaManager` is three functions copying **constants** into Lua tables at boot:
`exposeKeyboardKeys` (`:1519`), `exposeMouseButtons` (`:1539`),
`exposeLuaCalendar` (`:1560`). That is the entire exception.

**A class being on the allowlist does not make its fields reachable.**
`DesignationZone` IS exposed (`LuaManager.java:2512`), which is why
`getAllZones()`, `getId()` and `getAnimals()` all work -- and
`DesignationZone.hourLastSeen` is a bare `public int` (`:27`) with no accessor,
so reading it from Lua yields **`nil`, silently**. No error, no trace, nothing to
grep for. The mechanism simply never ran, on any platform, since the mod existed.

**It has bitten twice in one day.** The second was
`SandboxOptions.multipliersConfig` (`SandboxOptions.java:267`), also a public
field, which is how the engine reaches the XP multipliers internally and is not a
route Lua can copy. The way through is `getOptionByName("MultiplierConfig.*")`,
a method on the exposed `SandboxOptions`.

**How to check before you build on a field:**

1. is the class in `setExposed(...)`? -- necessary, not sufficient
2. is there a **getter**? if the value is only a `public` field, Lua cannot see
   it, whatever the class's status
3. a careless grep finds an accessor on a *different* class and says yes --
   `getHourLastSeen` exists, on `IsoGridSquare`. Confirm the class

**And the failure mode is the dangerous one:** a nil that reads as "not set yet"
rather than "unreachable", inside a probe that returns early and reports success.

### A returned object is only useful if ITS class is exposed too

`SandboxOptions.getOptionByName` returns the base `SandboxOption`; the concrete
`BooleanSandboxOption` / `DoubleSandboxOption` / `IntegerSandboxOption` /
`StringSandboxOption` / `EnumSandboxOption` are all exposed
(`LuaManager.java:2476-2480`). We used to write here that `ConfigOption` is
**not** exposed, and that the Java idiom `option.asConfigOption().getValueAsString()`
therefore cannot be copied into Lua. That was wrong: `zombie.config.ConfigOption`
and its typed subclasses are on the allowlist too (`LuaManager.java:2496-2501`),
and were in 42.20 as well. Whether the idiom works from Lua comes down to the
same untested binding question below. Use the concrete option's own `getValue()`;
it is the shorter call either way.

> **Proof:** Code. `zombie.Lua.LuaManager$Exposer#exposeAll` (`setExposed(SandboxOptions.BooleanSandboxOption.class)` through `IntegerSandboxOption`, and `setExposed(ConfigOption.class)` with `BooleanConfigOption` to `StringConfigOption`). Build 42.21.0 (revision 4a0e9546ec).

Whether Kahlua binds on the runtime class or the declared return type is
**untested**; it decides whether `getOptionByName(...):getValue()` resolves at
all. Two lines in game settle it and nobody has run them.

*Updated 2026-10-04 for Build 42.21: line numbers re-pointed; corrected the claim that ConfigOption is not exposed to Lua (it is, and was in 42.20).*
