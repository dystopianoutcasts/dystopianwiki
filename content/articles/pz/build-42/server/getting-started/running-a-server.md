---
slug: running-a-server
title: Running a server
game: pz
version: build-42
section: server
category: getting-started
difficulty: beginner
tags:
  - server
  - server-options
  - sandbox-options
  - admin
excerpt: 'The Outcast server owner''s handbook for Build 42.21: your server''s files, every server option, sandbox option, admin command and role, what surprised us in the code, and how these pages are made.'
last_updated: '2026-10-04'
related_articles:
  - server-options-directory
  - sandbox-options-directory
  - admin-commands
  - server-roles-and-capabilities
  - reading-the-servers-numbers
---
# Running a server

Running a server is how an Outcast gets their own flavour of Zomboid. Slow shamblers or sprinters, a world already picked clean or shops still full, power for a month or for a day: all of it is a setting, and the server reads every one of them from a file you can edit.

We read the Build 42.21 code to write this section. It lists every option the server reads, what it defaults to, and where the code really uses it. The reference pages are generated from the code, so nothing in them is from memory. When the code shows plainly what an option does, we say so in one line. When it does not, we only say where it is read, because a guess is worse than no answer.

## What is in this section

- **[Server options A to Z](/pz/build-42/server/server-options/server-options-directory):** all 144 options of the server's ini file, then one page per part of the settings screen, with the game's own description, the default, the range and every place the code reads each one.
- **[Sandbox options A to Z](/pz/build-42/server/sandbox-options/sandbox-options-directory):** all 269 sandbox options, the flavour of your world, with the presets that change each one.
- **[Admin commands](/pz/build-42/server/admin-commands/admin-commands):** the 67 commands the server knows, their forms and the capability each needs.
- **[Roles and capabilities](/pz/build-42/server/roles-and-access/server-roles-and-capabilities):** the 7 built-in roles and the 98 capabilities that decide what a player may do, and [where each capability is checked](/pz/build-42/server/roles-and-access/where-each-capability-is-checked).
- **[Reading the server's numbers](/pz/build-42/server/getting-started/reading-the-servers-numbers):** the statistics, the logs, and who can see them.

## Your server's files

All of them sit in the `Server` folder of your Zomboid folder (`%UserProfile%\Zomboid\Server` on Windows, `~/Zomboid/Server` on Linux), named after your server:

- **`<servername>.ini`** holds the server options. At start-up the server reads it and then writes it out again with every option in it, so an option you delete from the file comes back at its default, with the game's description above it as a `#` comment.
- **`<servername>_SandboxVars.lua`** holds the sandbox options, grouped in tables (`ZombieLore`, `ZombieConfig` and others), each with its description as a `--` comment.
- **`<servername>_spawnregions.lua`** and **`<servername>_spawnpoints.lua`** say where new characters can start. The server writes both with an example the first time, if they are missing.

> **Proof:** Code. `zombie.network.ServerOptions#init`, `#loadServerTextFile`, `#saveServerTextFile` and `#tryInitSpawnRegionsFile`; `zombie.SandboxOptions#loadServerLuaFile`, `#saveServerLuaFile` and `#writeLuaFile`; `zombie.network.ServerSettingsManager#getSettingsFolder`; `zombie.config.ConfigFile#write`. Build 42.21 (revision 4a0e9546ec).

## What surprised us

Outcast, read these before you tune your world. Each one links to the full entry and its read sites.

- **The sandbox defaults are the Apocalypse preset.** The game loads the Apocalypse preset file when it builds its sandbox options and makes those values the defaults. For 45 options that is not the number written in the Java declaration; each entry shows both.
- **Two zombie options are only shortcuts on the settings screen.** No game code reads [ZombieRespawn](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombierespawn) or [ZombieMigrate](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombiemigrate). Changing them on the server settings screen fills in the advanced `ZombieConfig` values, and those are what the game reads. Edit the file by hand and only the `ZombieConfig` values count.
- **[RuralLooted](/pz/build-42/server/sandbox-options/sandbox-options-loot#rurallooted) is cut to a whole number.** The settings screen offers values such as 0.25 and 1.5, but the code drops the fraction before it multiplies, so anything below 1.0 counts as 0 and 1.5 counts as 1.
- **Options the code never reads.** The server option [BloodSplatLifespanDays](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#bloodsplatlifespandays) is read nowhere (the sandbox option with the same name is the one that works), and so are the sandbox options [AlarmDecayModifier](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#alarmdecaymodifier), [PlantAbundance](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#plantabundance), [NightLength](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#nightlength) and [Basement.SpawnFrequency](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#basementspawnfrequency). [Farming](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#farming) appears only in lines that are commented out; every other "Farming" in the code is the skill, a loot type or a crafting category.
- **[WebhookAddress](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#webhookaddress) is on the public list.** The server writes every public option, names and values, into the data a joining player's game downloads. The password, the RCON settings and the Discord token and channels are kept off that list; the webhook address is not.
- **[BadWordPolicy](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#badwordpolicy) cannot mute.** Its description offers "4 - mute", but the option only takes 1 to 3, and a 4 in the file is refused.
- **45 server options are not on the settings screen,** the anti-cheat options among them. You set those in the ini file, or with `/changeoption`.
- **`/setaccesslevel` names a level that does not exist.** Its help text lists "Overseer", but no built-in role has that name; overseers default to the `gm` role. And 3 commands, `/connections`, `/addalltowhitelist` and `/addusertowhitelist`, are switched off in this build.

> **Proof:** Code. `zombie.SandboxOptions` constructor (`loadGameFile("Apocalypse")`, then `setDefaultsToCurrentValues`) and `#getCurrentLootedChance` (the `(int)` cast on `ruralLooted`); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` `Page3:onComboBoxSelected` and `Page3:onTickBoxSelected`; `media/lua/server/Farming/farming_vegetableconf.lua` (the commented-out `SandboxVars.Farming` and `SandboxVars.PlantAbundance` lines); `zombie.network.ServerOptions` (the `BadWordPolicy` declaration, range 1 to 3, and the public list in its constructor); `zombie.network.ConnectionDetails#writeServerOptions`; `zombie.characters.Roles#addStatic`; `zombie.commands.CommandBase` and the `@DisabledCommand` annotations; the read-site search described below. Build 42.21 (revision 4a0e9546ec).

## How these pages are made

The reference pages in this section are generated, not written by hand. Two scripts in the wiki repository do it, and you can read them:

1. `scripts/kb/extract/extract-server-surface.ts` runs against a local copy of the game's decompiled code and its Lua. It reads every server option and sandbox option from their declarations, the settings screen's pages, the presets, the commands and their annotations, the roles and the capabilities, and the game's English text. Then it searches the Java and the vanilla Lua for every place each one is read. It writes one data file, `scripts/kb/data/server-surface-42.21.json`: names, types, defaults, ranges, text and locations, never the game's code.
2. `scripts/kb/gen-server-handbook.ts` turns that data into the pages: `npm run kb:gen-server`. A short hand-written notes file next to the data adds the "What the code does" lines, and each note names the read site it was written from. The generator refuses a note whose site is not one of the option's sites.

The rules for finding a read site are printed on [the server options page](/pz/build-42/server/server-options/server-options-directory#how-a-read-site-is-found) and [the sandbox options page](/pz/build-42/server/sandbox-options/sandbox-options-directory#how-a-read-site-is-found). After a game update we re-capture the engine, run the extractor and the generator again, and the pages describe the new build.

A read site tells you where the code uses a value, not what happens on a live server. Which side runs a piece of code, and what reaches the other side, takes a test on a dedicated server with its log as the evidence. These pages do not make those claims.

> **Proof:** Code. `scripts/kb/extract/extract-server-surface.ts` and `scripts/kb/gen-server-handbook.ts`, run against the engine capture of revision 4a0e9546ec. Build 42.21 (revision 4a0e9546ec).
