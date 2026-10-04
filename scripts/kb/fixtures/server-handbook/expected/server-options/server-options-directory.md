---
slug: server-options-directory
title: 'Server options A to Z (Build 9.99)'
game: pz
version: build-42
section: server
category: server-options
difficulty: beginner
tags:
  - server
  - server-options
  - reference
  - generated
excerpt: 'All 5 options of the Build 9.99 server ini file, A to Z, with type, default and settings page, and how the game reads the file.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - server-options-details-steam-and-backups
  - server-options-players-and-admins
  - server-options-pvp-safehouses-and-factions
  - sandbox-options-directory
---
# Server options A to Z

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Outcast, these are all 5 options of the server's ini file in Build 9.99, A to Z. Click a name for its full entry: what the game says about it, where the code reads it, and what we found it does.

## The file and how the game reads it

- **Where it lives.** The server reads and writes `Server/<servername>.ini` in your Zomboid folder (`%UserProfile%\Zomboid\Server` on Windows, `~/Zomboid/Server` on Linux). The first start writes the file with every option at its default.
- **What each line is.** One `Name=value` line per option, with the game's description written above it as a `#` comment.
- **A value out of range is refused.** A number below the minimum or above the maximum is not clamped: the game logs an error and keeps the value it had (the default, on a fresh start). A true/false option accepts `true`, `false`, `1` and `0`, in any case; anything else is logged as an error and ignored.
- **What players can see.** All options except `Password` are on the public list. The server writes the public list, names and values, into the data a player's game downloads when it joins.
- **Not on the settings screen.** 2 options are on no page of the game's server settings screen. They are only in the file (and `/changeoption` can change them).

> **Proof:** Code. zombie.network.ServerOptions#init, #loadServerTextFile, #saveServerTextFile and its constructor (the public list); zombie.config.ConfigFile#write (one line per option, the description as a comment); zombie.config.IntegerConfigOption#setValue and zombie.config.DoubleConfigOption#setValue (out-of-range values refused); zombie.config.BooleanConfigOption#parse; zombie.network.ConnectionDetails#writeServerOptions (the public list sent to a joining player); zombie.network.ServerSettingsManager#getSettingsFolder. Build 9.99 (revision 0f0f0f0f0f).

## What we found

- **2 of 5 options are read** somewhere in the Java or the vanilla Lua, at 4 read sites.
- **2 options are read nowhere:** [ResetID](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#resetid), [AntiCheatFixture](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatfixture).

## How a read site is found

Every "Read in" line on these pages comes from a search of the Build 9.99 Java and the vanilla Lua, by these rules:

1. Fixture rule one.
2. Fixture rule two.

A read site says where the code uses the value. When the code there makes the effect plain, the entry adds a line on what it does, written by hand from that site. When it does not, the entry only says where the value is read: we do not guess.

## All options

| Option | Type | Default | Settings page |
|---|---|---|---|
| [AntiCheatFixture](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatfixture) | enum | `2` | - |
| [Password](/pz/build-42/server/server-options/server-options-details-steam-and-backups#password) | string | (empty) | Details |
| [PublicName](/pz/build-42/server/server-options/server-options-details-steam-and-backups#publicname) | string | `My Server` | Details |
| [PVP](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#pvp-1) | boolean | `true` | PVP |
| [ResetID](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#resetid) | integer | computed | - |
