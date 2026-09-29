# check-kahlua.py

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
