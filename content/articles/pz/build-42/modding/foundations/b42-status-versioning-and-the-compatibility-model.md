---
id: build-42-b42-status-versioning-and-the-compatibility-model
slug: b42-status-versioning-and-the-compatibility-model
title: 'B42 status, versioning, and the compatibility model'
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
  42.20 is stable and public as of 2026-07-29. Multiplayer, the animal update,
  rebuilt/expanded maps, the new crafting system, lighting, and QoL are all now
  on the default branch. [CONFIRMED] Saves...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
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
# B42 status, versioning, and the compatibility model

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

- **42.20 is stable and public** as of 2026-07-29. Multiplayer, the animal update, rebuilt/expanded maps, the new crafting system, lighting, and QoL are all now on the default branch. **[CONFIRMED]**
- **Saves do not transfer.** B41 saves are incompatible with B42, and even **B42.19 saves are incompatible with B42.20** (42.20 added map content and other changes). Hosting guidance across providers is: back up, then start a **fresh world / fresh server install** on 42.20. **[CONFIRMED]**
- **Most B41 mods are incompatible.** Many B41 Workshop mods have not been updated for B42; some throw load errors, some silently do nothing. Mods are version-specific and old mods are likely to not work with new versions. **[CONFIRMED]** (pzwiki *Mods* rev 1391047)

### The silent-B41-install failure mode (call this out to users)

**[CONFIRMED]** When a player runs B42 and subscribes to (or already has) a B41-only mod:

- Steam still downloads and "installs" it. Nothing warns you at subscribe time.
- The mod may even appear in the in-game mods list (mods start **disabled**; you must enable them in the mod manager after subscribing).
- The failure surfaces **at world load**, not at menu time: *"World loading could not proceed, there are script load errors."* B42 parses the mod's scripts, hits B41-only schema (old `recipe` blocks, removed fields, no B42 build folder), and aborts world init.
- Because the error appears only when you try to start/load a world, users routinely misdiagnose it as a world-corruption or save bug rather than a mod-compatibility bug.

**Diagnostic workflow that works [CONFIRMED]:**
1. Enable `-debug` (Section 8) and read the console. Log files: `%USERNAME%/Zomboid/console.txt` for solo games and MP clients/hosts, and `%USERNAME%/Zomboid/server-console.txt` for the dedicated server. Red error boxes at bottom-right point to the offending file. (pzwiki *Resolving problems with mods* rev 1392779)
2. Disable all mods, then re-enable in halves ("search by bifurcation") to binary-search the culprit. (pzwiki *Resolving problems with mods*)
3. Framework mods (a shared library some mods require) that error will cascade into *every* dependent mod -- a mod shown **red** in the mod manager is missing a dependency it requires. Unsubscribe/resubscribe the framework first. (pzwiki *Resolving problems with mods*)
4. In `Zomboid/mods/`, deleting the `reset-mods_41_54` / `reset-mods_42_00` activation-state files clears the enabled-mods list to recover from a broken state. **[LIKELY -- not in pzwiki cache]**

---

<a name="3-structure"></a>
