---
id: build-42-check-pz-scripts
slug: check-pz-scripts
title: check-pz-scripts.py
game: pz
version: build-42
section: modding
category: tooling
difficulty: intermediate
tags:
  - tooling
  - scripts
  - translations
  - outcast-lib
excerpt: >-
  A real parser for the Project Zomboid data files the engine reads and then
  fails silently on -- .txt scripts and, with --json, the Translate JSON files.
  It exists because a generator bug once...
last_updated: '2026-09-29'
---
# check-pz-scripts.py

> Source: check-pz-scripts.md (compiled 2026-09-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

## What it is for

A real parser for the Project Zomboid data files the engine reads and then
fails silently on -- `.txt` scripts and, with `--json`, the Translate JSON
files. It exists because a generator bug once shipped an `ItemName.json` that
killed the game on launch while every existing check passed: comparing
committed files against a freshly-regenerated copy is invisible to a bug in
the generator itself, by construction.

This is the CANONICAL COPY. It was written in Outcast Motors and moved to
OutcastLib on 2026-09-08 on the ruling that OutcastLib owns shared tooling.
Consumer mods vendor this copy and diff their local copy against it -- the
direction matters, because a comparison pointing the wrong way still passes
and quietly makes the consumer's stale copy canonical again.

## How to invoke it

```
python scripts/check-pz-scripts.py [path ...]          # .txt scripts
python scripts/check-pz-scripts.py --json [path ...]   # + Translate JSON
python scripts/check-pz-scripts.py --self-test
```

## Inputs and outputs

- Input: one or more file or directory paths. With no path given it scans the
  current tree's script and translation files.
- With `--json`, Translate JSON files are parsed and checked alongside the
  `.txt` scripts.
- Output: every fault is printed as `file:line` plus a description of what
  the engine will do with it (silently drop the field, refuse to load the
  script, etc).
- `--self-test` runs the bundled fixture set and reports failures.

## Exit codes

Exits non-zero and names `file:line` for every fault found; exits `0` when
nothing is wrong with the scanned files.
