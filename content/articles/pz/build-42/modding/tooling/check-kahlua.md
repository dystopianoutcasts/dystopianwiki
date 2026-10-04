---
id: build-42-check-kahlua
slug: check-kahlua
title: check-kahlua.py
game: pz
version: build-42
section: modding
category: tooling
difficulty: intermediate
tags:
  - tooling
  - kahlua
  - lua
  - outcast-lib
excerpt: >-
  Flags Lua that stock Lua accepts but PZ's Kahlua2 VM cannot run. Kahlua2 is a
  5.1-era VM that is a smaller language than stock Lua: code that parses cleanly
  and passes an off-game test harness...
last_updated: '2026-10-04'
---
# check-kahlua.py

> Source: check-kahlua.md (compiled 2026-09-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

## What it is for

Flags Lua that stock Lua accepts but PZ's Kahlua2 VM cannot run. Kahlua2 is a
5.1-era VM that is a smaller language than stock Lua: code that parses cleanly
and passes an off-game test harness (which typically runs on Lua 5.4) can
still crash the first time it actually executes in game. A parser cannot catch
this, and neither can a harness running the wrong Lua version.

The inventory of what Kahlua actually registers is read out of
`projectzomboid.jar`, `se/krka/kahlua/stdlib/*.class`, not remembered or
guessed -- `BaseLib`, `TableLib` and the rest are enumerated from the shipped
classes.

## What it flags, checked against Build 42.21

We compared the script's list of absent names with what Kahlua registers in the
42.21 jar and the install's `stdlib.lua`. Most of the list holds: `next`, `io`,
`dofile`, `rawlen`, `table.pack`, `table.unpack`, `table.move`, `os.clock`,
`os.getenv` and `os.exit` really are absent, and a call to any of them fails in
game. Three entries are out of date, so read its report with them in mind:

- **`loadstring` is flagged, but it exists.** The Lua compiler registers it
  (along with `loadstream`). A hit on `loadstring` is a false alarm.
- **`coroutine.wrap` is flagged, but it exists.** The Java coroutine library has
  only `create`, `resume`, `status`, `running` and `yield`, but the install's
  `stdlib.lua` defines `coroutine.wrap` on top. Also a false alarm.
- **`math.random` and `math.randomseed` are not flagged, and they do not exist.**
  Use `ZombRand` and `ZombRandFloat`. The script will not catch these for you.

The full list, read from the game, is in
[Kahlua: what Project Zomboid Lua does not have](/pz/build-42/modding/lua-api/kahlua-what-project-zomboid-lua-does-not-have).

> **Proof:** Code. Names registered by `se.krka.kahlua.stdlib.BaseLib` (no `next`, `loadstring`, `dofile`), `TableLib` (`concat`, `insert`, `remove`, `newarray`, `pairs`, `isempty`, `wipe`, `ipairs`), `CoroutineLib` (`create`, `resume`, `status`, `running`, `yield`), `OsLib` (`date`, `difftime`, `time`), `se.krka.kahlua.j2se.MathLib` (no `random` or `randomseed`) and `se.krka.kahlua.luaj.compiler.LuaCompiler` (`loadstring`, `loadstream`), read from the class files' constant pools in the 42.21 jar; the install's `stdlib.lua` (`function assert`, `function coroutine.wrap`); the script's `BANNED` table in the OutcastLib repository. Build 42.21.0 (revision 4a0e9546ec).

## How to invoke it

```
python check-kahlua.py <Mod> [<Mod> ...]
python check-kahlua.py --self-test
```

Each `<Mod>` argument is a mod repo folder (the one containing `Contents/`).

## Inputs and outputs

- Input: one or more mod repo folders. The script globs
  `Contents/**/*.lua` under each and scans every shipped Lua file for calls
  into functions Kahlua does not register (for example `next()`).
- Output: per mod, either `ok : <name> -- N shipped Lua file(s), nothing
  Kahlua lacks` or `FAIL : <name> -- N call(s) Kahlua cannot run`, with each
  fault printed as `path:line` plus the unregistered call name and advice.
- `--self-test` prints `check-kahlua self-test` and runs the built-in rule
  checks instead of scanning a mod.

## Exit codes

- `0`: no faults found across every mod passed in.
- `1`: at least one call Kahlua cannot run was found.
- `2`: no mod argument was given (usage is printed instead).

*Updated 2026-10-04: the script's absent list checked against Kahlua in 42.21: `loadstring` and `coroutine.wrap` exist (false alarms), and `math.random` is absent but not flagged.*
