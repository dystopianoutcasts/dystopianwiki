---
slug: where-each-capability-is-checked
title: 'Where each capability is checked (Build 9.99)'
game: pz
version: build-42
section: server
category: roles-and-access
difficulty: advanced
tags:
  - server
  - admin
  - roles
  - reference
  - generated
excerpt: 'Every Build 9.99 capability with the Java and Lua code that checks it.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - server-roles-and-capabilities
  - admin-commands
---
# Where each capability is checked

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

For each of the 4 capabilities, the places in the Java and the vanilla Lua that check it. Commands are listed with the command instead (their capability is part of the command's declaration). A capability with no check here and no command does nothing by itself in 9.99.

### LoginOnServer

- **The game's description:** "Allows login."
- **Built-in roles:** `user`, `gm`, `admin`
- **Checked in:** `zombie.fixture.Login#check` (line 3).

### TeleportToPlayer

- **The game's description:** "Allows teleport."
- **Built-in roles:** `gm`, `admin`
- **Commands that need it:** `/teleport`
- **Checked in:** no other place.

### SeePlayers

- **Built-in roles:** `gm`, `admin`
- **Commands that need it:** `/connections`, `/horde2`
- **Checked in:** no other place.

### SaveWorld

- **The game's description:** "Allows saving."
- **Built-in roles:** `admin`
- **Commands that need it:** `/save`, `/teleport`
- **Checked in:** `media/lua/client/Admin.lua` in `Admin.save` (line 8).
- **What the code does with it:** Fixture: saving is allowed.

> **Proof:** Code. zombie.characters.Capability (the list), media/lua/shared/Translate/EN/IG_UI.json (IGUI_CapabilitiesTooltips_<name>), and the Capability.<name> references named under each entry. Build 9.99 (revision 0f0f0f0f0f).
