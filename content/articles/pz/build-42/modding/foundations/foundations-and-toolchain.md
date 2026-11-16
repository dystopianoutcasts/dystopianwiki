---
id: build-42-foundations-and-toolchain
slug: foundations-and-toolchain
title: Modding foundations and toolchain
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
  The index of the Build 42 (42.22) modding foundations: thirteen pages on folders, mod.info, registries, Lua load order, debug, mapping, packaging, multiplayer and porting.
last_updated: '2026-11-16'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - b42-status-versioning-and-the-compatibility-model
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - in-game-debug-mode-and-dev-tools
  - mapping-toolchain-status
  - packaging-and-workshop-upload-for-b42
  - multiplayer-status-in-42-20-stable
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a modder new to Build 42 who wants to know which foundations page answers a question. It has no facts of its own beyond the list; each page carries its own checked facts.

:::callout[The 1-minute version]{kind=key}
- New to Build 42 and porting from Build 41: start with the TL;DR, then the folder pages.
- Building a first mod from nothing: use [the project skeleton](/pz/build-42/modding/cookbook/project-skeleton), then come back for the details.
- Something fails at world load: read [Build 42 status and versioning](/pz/build-42/modding/foundations/b42-status-versioning-and-the-compatibility-model).
- Ready to test a port: use the [readiness checklist](/pz/build-42/modding/foundations/practical-b42-readiness-checklist).
:::

:::facts
- **Game version read** 42.22
- **Pages in this index** 13
- **Lowest mod version folder** `42` (42.0)
- **First mod to build** the project skeleton
:::

## 1. Start here

**Read the porting summary first, then the three pages about folders and `mod.info`.**

::::cards
:::card[1. The five first moves]{accent=orange}
[TL;DR: what a B41 modder must change first](/pz/build-42/modding/foundations/tl-dr-what-a-b41-modder-must-change-first)
:::
:::card[2. Version and compatibility]{accent=purple}
[B42 status, versioning, and the compatibility model](/pz/build-42/modding/foundations/b42-status-versioning-and-the-compatibility-model)
:::
:::card[3. Folders]{accent=blue}
[The B42 mod project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure) and [the versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders)
:::
:::card[4. mod.info]{accent=cream}
[mod.info fields and the versioning system](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system)
:::
::::

## 2. How the game loads your mod

**These pages explain what runs, in what order, and what you can register.**

- [media/registries.lua: the new B42 identifier file](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file) covers adding your own ids.
- [Lua folder load order](/pz/build-42/modding/foundations/lua-folder-load-order) covers what loads at start-up and what loads when a world starts.
- [In-game debug mode and dev tools](/pz/build-42/modding/foundations/in-game-debug-mode-and-dev-tools) covers testing.

## 3. Mapping, packaging and multiplayer

**These pages are for the later steps: maps, upload and servers.**

- [Mapping toolchain status](/pz/build-42/modding/foundations/mapping-toolchain-status) covers the map tools.
- [Packaging and Workshop upload for B42](/pz/build-42/modding/foundations/packaging-and-workshop-upload-for-b42) covers the upload.
- [Multiplayer status in 42.20 stable](/pz/build-42/modding/foundations/multiplayer-status-in-42-20-stable) covers servers.

## 4. Porting

**Use the porting checklist when you move an existing mod.**

- [B41 -> B42 porting: what breaks + a concrete checklist](/pz/build-42/modding/foundations/b41-b42-porting-what-breaks-a-concrete-checklist) has the table and ten steps.
- [The readiness checklist](/pz/build-42/modding/foundations/practical-b42-readiness-checklist) is the last pass before you test.

:::callout[How we know]{kind=proof}
This page is a list of links, and every link points to a page in this wiki. The version and folder numbers in the strip are read from the 42.22 code, and each is cited on the pages above (for example [the versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders)). The older index named numbered sections of a single document that no longer exists, and those references are gone.
:::
