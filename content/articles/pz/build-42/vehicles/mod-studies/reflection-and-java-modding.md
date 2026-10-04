---
id: build-42-reflection-and-java-modding
slug: reflection-and-java-modding
title: Why reflection was disallowed -- the fun police story
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: advanced
tags:
  - vehicles
  - reflection
  - java-modding
  - kahlua
  - engine-limits
excerpt: >-
  Follow-up investigation, 2026-08-05. Triggered by this comment in Project
  Summer Car's source (42.15/media/lua/server/Project_Summer_Car_Server.lua:12):
last_updated: '2026-10-04'
---
# Why reflection was disallowed -- the fun police story

> Source: 06-reflection-and-java-modding.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Follow-up investigation, 2026-08-05. Triggered by this comment in Project Summer
Car's source (`42.15/media/lua/server/Project_Summer_Car_Server.lua:12`):

```lua
local cachedThrottleField = nil;
function getThrottle(vehicle)
  return 0.2;
  end
  --[[ -- Reflection no longer allowed due to fun police.
  if cachedField == nil then
    for x = 0, getNumClassFields(vehicle)-1 do
      local field = getClassField(vehicle, x)
      if tostring(field) == "public float zombie.vehicles.BaseVehicle.throttle" then
        cachedThrottleField = field;
      end
    end
  end
  ...
```

## Short answer

**"The fun police" is The Indie Stone** -- the phrase is Black_moons' sardonic
label for them, not an official anything.

**The policy:** the seven Lua reflection functions were gated behind the `-debug`
launch flag in **Build 42.15** (March 2026), as part of an emergency modding-system
security hardening.

**Why:** two responsibly-disclosed vulnerabilities plus an internal audit found
that the Lua modding sandbox could be escaped. A month later a live Workshop
attack confirmed the risk was real. Lua reflection lets a mod reach arbitrary
Java fields and methods -- it is the most direct sandbox-escape primitive the
API offered, so it got shut.

## The timeline

| Date | Event |
|---|---|
| **2026-03-03** | Modder **copiumsawsed** responsibly reports a significant security vulnerability. TIS patches stable + unstable the same day; all legacy versions **pulled from circulation** because they couldn't be patched fast enough. |
| **2026-03-09** | **Build 42.15.0 Unstable** released. Reflection is gated. **Not mentioned anywhere in the changelog.** |
| **~2026-03-10** | Modder **Albion** reports a second issue; TIS is simultaneously running an internal security audit which finds more. |
| **2026-03-18** | Official announcement: *[Updated 2026-03-20] Important Security Updates*. Branches move to 41.78.18 / 42.15.3 / 42.15.2. Legacy versions removed **permanently** this time. `#mod_portal` Discord channel opened for breakage reports. |
| **2026-04-07** | **A real attack lands.** A Workshop user uploads 14 mods (fake OST packs branded "True MoooZIC") with heavily obfuscated code that **created malicious files outside the Project Zomboid directory**. Installed on **500-2200 devices**. |
| **2026-04-08** | Announcement *"Patching a Zero Day Exploit"*. User banned, all 14 mods removed. TIS: *"because these mods were capable of creating files outside the game directory, we strongly recommend that anyone who downloaded them take appropriate security measures... Simply uninstalling the mods is not sufficient."* B41 was not vulnerable to this one. |
| **2026-07-29** | **Build 42.20.0 Stable.** Another security patch, credited to **Jorge Escabias**. Reflection is still gated. |

TIS's own framing, from the 2026-03-18 announcement:

> *"Like the vulnerability reported on the 3rd of March, these new vulnerabilities
> only affected mods, and we have received no reports of anyone being affected in
> a malicious way due to these issues, nor have we seen anybody being exploited in
> the wild. Nevertheless, we have both a legal and an ethical responsibility to
> ensure that our users are protected, and so some difficult decisions had to be
> made."*

And on mod breakage:

> *"It is possible that some mods may be affected by this patch, however we
> estimate the number of affected mods to be very low. If you are a mod developer
> and your mod stops working after this update... please report it in our
> #mod_portal channel on Discord."*

That estimate is the source of the friction. Reflection users were a small
population, but they were the *advanced* mods -- and the change shipped in 42.15
with no changelog entry at all.

## What was actually done -- verified in the bytecode

Not from documentation. Read directly out of the installed game.

Installed build: `projectzomboid.jar` in your Steam library's `ProjectZomboid` folder,
dated 2026-07-29 (Build 42.20.0 Stable), Steam buildid 24449119.

The seven functions are **not removed.** They still exist in
`zombie/Lua/LuaManager$GlobalObject`:

```
getNumClassFields          PRESENT
getNumClassFunctions       PRESENT
getClassField              PRESENT
getClassFieldVal           PRESENT
getClassFunction           PRESENT
getMethodParameter         PRESENT
getMethodParameterCount    PRESENT
```

What changed is a new private gate in `zombie/Lua/LuaManager`:

```
LuaManager.validateReflectionAccess(Ljava/lang/Object;)V      // @HiddenFromLua
```

In `LuaManager$GlobalObject` the symbol `validateReflectionAccess` sits directly
adjacent in the constant pool to `getDeclaredMethods`, `getDeclaredFields`,
`java/lang/reflect/Field`, `setAccessible` and
`java/lang/reflect/InaccessibleObjectException` -- it wraps the reflection
implementation itself.

In `LuaManager` the string `"Not in debug"` sits immediately adjacent to
`zombie/core/Core` and `debug`. The gate reads `Core.debug` -- the `-debug`
launch flag -- and throws when it's false.

### A/B against a pre-incident build

`zombie/Lua/LuaManager$GlobalObject.class` in a copy of the game install
(snapshot taken 2026-01-31, before the March incident):

| Symbol | B41 snapshot (Jan 2026) | B42.20 (Jul 2026) |
|---|---|---|
| the 7 reflection functions | PRESENT | PRESENT |
| `validateReflectionAccess` | **absent** | **PRESENT** |
| `"Not in debug"` | **absent** | **PRESENT** (in `LuaManager`) |

So: **the functions survived, the access did not.** Reflection is now a
debug-mode-only facility. Run the game normally and every call throws.

## Why reflection specifically

Reflection is the canonical sandbox-escape primitive. The Lua API is a curated
allowlist of exposed Java methods -- that curation *is* the sandbox. With
`getClassField` / `getClassFieldVal` / `getClassFunction` a mod can walk to any
field or method on any object it can reach, including ones TIS deliberately never
exposed. From there it's a short hop to `java.io`, `java.lang.Runtime`, and
writing files outside the game directory -- exactly what the April Workshop
attack did.

Note the sequence: the gate went in on **March 9**, a month *before* the April 7
attack. TIS closed the primitive proactively after the disclosures, and then the
attack proved the threat model right. That ordering is the strongest argument
that the decision was correct, whatever it cost modders.

## The workaround: Reflection Enabler

Workshop `3682136459`, currently titled **"Reflection Enabler [B42.19 - B42.20]"**
(originally "[B42.15 - B42.16.2]" -- it has tracked every build since).

> *"This is a java mod that re-enables reflection functionality that was disabled
> in B42.15."*

It restores all seven functions, via the same manual `zombie` folder install the
car physics mods use. It also exposes two detection helpers:

```lua
getReflectionVersion()      -- version of the mod
getReflectionGameVersion()  -- game version the patch was built for

local status, result = pcall(getReflectionGameVersion)
-- status == true if the patch is installed
```

Its own page leads with **"!!!!! YOU ONLY NEED THIS MOD IF ANOTHER MOD REQUIRES IT !!!!!"**
-- the author is aware of what they're handing out. Installing it re-opens the
hole TIS closed. Treat it as a downgrade of your machine's security posture.

## The real alternative: TIS added the getters

**Correction to an earlier draft of this file, which said Starlit Library was the
sanctioned replacement. It is not, on either count.**

Starlit's `utils/Reflection.lua` was **built on the same seven gated functions**
and died with them. In Starlit 2.0.0 (`42.15` branch) the module went from 404
lines to 147, and every entry point is now:

```lua
Reflection.getClassName = function(o)
    error("TIS removed reflection API, this module no longer works.")
end
```

Starlit also never exposed throttle -- `grep -rn "throttle"` across the whole
library returns nothing. PSC's in-source recommendation is stale advice from
before Starlit gutted the module.

What actually replaced reflection is TIS **exposing the missing getters**.
Verified in `zombie/vehicles/BaseVehicle.class`:

| Method | B41 snapshot (2026-01-31) | B42.20 (2026-07-29) |
|---|---|---|
| `getThrottle()F` | absent | **present** |
| `isBrakePedalPressed()Z` | absent | **present** |
| `isGasPedalPressed()Z` | present | present |

`BaseVehicle` carries no `HiddenFromLua` annotation, so all of its public methods
are Lua-callable. The single thing PSC needed reflection for is now
`vehicle:getThrottle()`.

This is the 42.17 patch note *"new exposed functions for modders"* in practice:
close the escape hatch, then fill the gaps it was papering over.

So the order of preference is:

1. **Check whether the current build already exposes it.** Parse the class's
   method table out of `projectzomboid.jar` -- don't trust the online javadoc,
   which lags. This is a two-minute check and it has already answered the one
   case that mattered here.
2. Ask in `#mod_portal` on the TIS Discord and get it exposed. That channel
   exists specifically because of this.
3. Redesign around the gap.
4. Do **not** ship a mod that depends on Reflection Enabler -- you are asking
   every user to unpatch a security fix.

Starlit remains a useful library for other things. It is not a reflection
replacement and never was a throttle source.

## Practical rules for our mods

- **Never call `getClassField` / `getClassFieldVal` / `getClassFunction` /
  `getNumClassFields` / `getNumClassFunctions` / `getMethodParameter` /
  `getMethodParameterCount`.** They will throw for every normal player. Code
  written against them only ever worked on the author's `-debug` machine.
- If a design needs an unexposed field, that's a signal to redesign, not to
  reach for a Java mod.
- If existing code might call them, guard with `pcall` and have a real fallback --
  PSC's `return 0.2` is a fallback, but a silently wrong one: its fuel and heat
  models run on a constant throttle for anyone without Starlit.
- The security bar for PZ mods is now genuinely enforced. A mod that writes
  outside the game directory, obfuscates its Lua, or asks users to overwrite
  engine files is going to draw scrutiny -- correctly.

## Sources

- TIS, *[Updated 2026-03-20] Important Security Updates* -- Steam announcement
  `1827626365750608`, dated 2026-03-18. Retrieved via the Steam news API.
- TIS, *Patching a Zero Day Exploit* -- announcement `1829528821304702`,
  dated 2026-04-08.
- TIS, *Build 42.20.0 Stable Released* -- announcement `1839676055882259`,
  2026-07-29 (Jorge Escabias credit).
- Bytecode inspection of `projectzomboid.jar` (B42.20.0, buildid 24449119) and
  `ProjectZomboid_B41_01312026\zombie\Lua\` -- primary evidence, highest confidence.
- Reflection Enabler workshop page `3682136459`.
- Build 42.15.0 changelog (pzwiki + Steam) -- confirmed to contain **no**
  mention of reflection.

*Re-checked 2026-10-04 for Build 42.21 (revision 4a0e9546ec): the seven reflection functions are still present, `validateReflectionAccess` still throws `"Not in debug"` unless `Core.debug` is set, and `getThrottle()` and `isBrakePedalPressed()` are still on `BaseVehicle`. 42.21 neither lifted nor widened the gate.*
