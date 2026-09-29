---
id: build-42-unstage-all
slug: unstage-all
title: unstage-all.ps1
game: pz
version: build-42
section: modding
category: tooling
difficulty: intermediate
tags:
  - tooling
  - multiplayer
  - staging
  - powershell
excerpt: >-
  Removes every local Outcast mod source so the client runs the PUBLISHED
  Workshop builds instead. Run this before joining any multiplayer server: a mod
  id with two sources (a local dev link plus...
last_updated: '2026-09-29'
---
# unstage-all.ps1

> Source: unstage-all.md (compiled 2026-09-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

## What it is for

Removes every local Outcast mod source so the client runs the PUBLISHED
Workshop builds instead. Run this before joining any multiplayer server: a mod
id with two sources (a local dev link plus the subscribed Workshop copy)
breaks the MP join, and single-player never exercises the code path that
fails, so the problem hides until the first MP test and then shows up as an
infinite loading screen or a crash during world load.

It clears both places a local source can live: `%USERPROFILE%\Zomboid\mods\
<ModId>` (the game's local mod loader) and `%USERPROFILE%\Zomboid\Workshop\
<RepoName>` (the in-game uploader, which `ZomboidFileSystem.
getStagedItemModsFolders` also adds to the mod search path -- so anything
staged there is loaded too, not just held for upload).

Ownership of what to remove is proved from `Contents\mods\<ModId>` inside each
repo, not assumed from the folder name, so it will not delete a same-named
third-party mod it does not actually own.

## How to invoke it

Run from PowerShell with no required arguments; see `.PARAMETER Path` and
`.PARAMETER WhatIf` in the script header for scoping to one path or previewing
without deleting.

## Inputs and outputs

- Input: the Outcast mod repos on disk (to prove ownership) plus the current
  contents of `Zomboid\mods\` and `Zomboid\Workshop\`.
- Output: console lines naming each link or copy removed, and anything left
  behind because ownership could not be proved.

## Exit codes

`exit 1` and `exit 2` mark distinct failure cases (see the script header for
which); a clean run exits `0`.
