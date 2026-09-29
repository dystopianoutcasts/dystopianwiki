---
id: build-42-multiplayer-status-in-42-20-stable
slug: multiplayer-status-in-42-20-stable
title: Multiplayer status in 42.20 stable
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
  [CONFIRMED] Multiplayer is on the stable branch as of 42.20 (2026-07-29).
  Players no longer need the unstable beta to play B42 MP. MP first landed on
  unstable in 42.13 (Dec 11, 2025) and was...
last_updated: '2026-09-29'
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
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
# Multiplayer status in 42.20 stable (server-modder critical)

> Source: 01_MODDING_FOUNDATIONS_AND_TOOLCHAIN.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED] Multiplayer is on the stable branch as of 42.20 (2026-07-29).** Players no longer need the unstable beta to play B42 MP. MP first landed on unstable in 42.13 (Dec 11, 2025) and was stress-tested through the 42.x cycle. **[CONFIRMED]** (BisectHosting/Shockbyte patch notes; pzwiki *Modding* rev 1442589 dates the MP unstable modding guides to Dec 11, 2025.)

Architecture changes that matter for modders:
- **Inventory + all Timed Actions moved server-side.** Clients now "only run visuals." This improves fairness and prevents desyncs/stuck-animation bugs -- but **client-only timed-action or inventory logic can desync or be rejected**. Author timed actions and inventory mutations to be server-authoritative. **[CONFIRMED]**
- **Full anti-cheat suite enabled** (Speed, Hit, NoClip, Inventory, and more). Mods that move the player, grant items, or alter combat in "client-trusts-itself" ways may trip anti-cheat -- route such actions through server commands. **[CONFIRMED]**
- **Official Mod Manager** added in 42.20: search, favorite, set load order, view dependencies/incompatibilities, and save/share mod presets via clipboard. This mirrors the pzwiki-documented in-game mod manager (presets, favorites, filters by map/vehicle/features/modpack, dependency + incompatibility display). **[CONFIRMED]** (pzwiki *Mods* rev 1391047)

Server-admin essentials:
- **`Mods=`** takes comma-separated **Mod IDs** (from each `mod.info`). **`WorkshopItems=`** takes comma-separated **Workshop IDs** (the URL numbers). **[CONFIRMED]**
- **Order matters:** list every dependency **before** the mod that needs it. **[CONFIRMED]**
- **B42 `Mods=` format changed:** B42 expects a **backslash prefix before each Mod ID** on the `Mods=` line; using B41 format on a B42 server (or vice versa) is a common "mods not loading" cause. **[CONFIRMED via hosting KBs; the pzwiki cache does NOT cover server-config `Mods=` syntax -- read the exact literal off a B42 server's generated `servertest.ini`. See Gaps.]**
- The pzwiki GUI path to set server mods (host settings -> Steam Workshop, then Mods, then Map order) is documented but flagged "not verified" on the wiki. **[CONFIRMED it exists; wiki marks it unverified]** (pzwiki *Mods*, "Setting mods for host.")
- **Player cap guidance:** the devs recommend **no more than ~20 player-slots** on dedicated servers for now. **[CONFIRMED]**
- **Fresh install for 42.20:** 42.19 saves are incompatible with 42.20 -- back up and start fresh. **[CONFIRMED]**

---

<a name="12-porting"></a>
