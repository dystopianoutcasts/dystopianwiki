# validate-data.ps1

## What it is for

Pre-upload checks for OutcastLib specifically. OutcastLib ships no scripts,
recipes or translations, so this validator is deliberately smaller than the
other mods' validators, and focuses on the things that fail SILENTLY -- the
game loads the mod, says nothing, and behaves wrong:

1. `mod.info` completeness, and its id matching the folder it lives in.
2. Assets named in `mod.info` actually existing -- a `mod.info` naming a
   missing poster loads fine and renders blank, with no log line at all.
3. `preview.png` present (the Workshop uploader needs one).
4. No UTF-8 BOM anywhere -- a BOM silently voids a PZ file, and
   PowerShell's own `Set-Content -Encoding utf8` emits one by default.
5. Every `OL_*.lua` file opens with `require "OutcastLib/OL_Init"` -- PZ
   loads a directory alphabetically, and `OL_Init` sorts after `OL_Compat`,
   `OL_Containers` and `OL_Debug`, so a module that skipped the require
   would nil-index purely on load order.
6. Every Lua file parses, if a Lua interpreter is on PATH.
7. The unit suite passes.

## How to invoke it

Run from PowerShell against the OutcastLib repo root; see `.PARAMETER
SkipTests` in the script header to skip step 7.

## Inputs and outputs

- Input: the OutcastLib repo tree (`mod.info`, `preview.png`, `OL_*.lua`
  files, the unit test suite).
- Output: a pass/fail line per check category, with file paths named for any
  failure.

## Exit codes

`exit 0` on a clean pass (gates an upload); `exit 1` on any failure.
