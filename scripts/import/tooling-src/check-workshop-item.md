# check-workshop-item.py

## What it is for

Checks a mod's Workshop item against what Steam will actually accept, before
anyone uploads it. It exists because on 2026-09-13 two Motors mods were found
stuck on old Workshop builds for days: their `workshop.txt` descriptions had
grown past Steam's 8000-byte limit, Steam refused the upload, and B42's
uploader (`SteamWorkshop.SubmitWorkshopItem`) handles that refusal by sending
NO files and printing one unhelpful log line, with no indication of which
field caused it. A bad-visibility refusal can also silently leave the item
PUBLIC instead of the visibility the mod intended.

## How to invoke it

```
python scripts/check-workshop-item.py <mod repo folder | workshop.txt> [--game-dir DIR]
python scripts/check-workshop-item.py --self-test
```

`--game-dir` overrides the Project Zomboid install directory used for
reference data; it defaults to the `PZ_GAME_DIR` environment variable or a
built-in default path.

## Inputs and outputs

- Input: a mod repo folder (its `workshop.txt` is located automatically) or a
  `workshop.txt` path directly.
- Output: a report line per check (title length, description length,
  visibility, tag validity) with `ok` or `FAIL` per item, plus warnings for
  things that will not block the upload but are worth fixing.
- `--self-test` runs the bundled fixture set that exercises the failure
  paths.

## Exit codes

- `0`: nothing blocks the upload (warnings may still print).
- `1`: something would abort the upload, or silently publish it wrong.
- `2`: there was no `workshop.txt` to measure -- never treated as a pass.
