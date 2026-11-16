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
excerpt: 'The server owner''s handbook for Build 42.22: your server''s files, every option, command and role, the things in the code that surprised us, and how the reference pages are made.'
last_updated: '2026-11-15'
related_articles:
  - server-options-directory
  - sandbox-options-directory
  - admin-commands
  - server-roles-and-capabilities
  - reading-the-servers-numbers
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Running a server is how an Outcast gets their own flavor of Zomboid: sprinters or shamblers, a picked-clean world or full shops, all of it a setting in a file you can edit.

This section comes from the Build 42.22 code, and its reference pages are generated from it. When the code shows plainly what an option does, we say so in one line; when it does not, we only say where it is read.

:::callout[The 1-minute version]{kind=key}
- Your server keeps its settings in files named after it, in the `Server` folder of your Zomboid folder. At start-up it reads the ini file and writes it out again with every option in it.
- The sandbox options start from the Apocalypse preset, not from the numbers written in the Java.
- Two zombie options, `ZombieRespawn` and `ZombieMigrate`, are only shortcuts on the settings screen. The values the game reads are the `ZombieConfig` ones.
- `RuralLooted` is cut to a whole number before it is used while `DaysUntilMaximumLooted` is above 0 (default 90), so a value below 1.0 counts as 0.
- `BadWordPolicy` takes 1 to 3; the "4 - mute" in its description cannot be set.
- The webhook address is sent to every joining player with the other public options.
- One server option and four sandbox options are read nowhere in the vanilla code we searched, and a fifth sandbox option, `Farming`, is read only in commented-out lines. That is a code search, not a test on a live server.
:::

:::facts
- **Server options** 144, all in the ini file
- **Sandbox options** 269
- **Admin commands** 67 registered, 3 more switched off
- **Roles and capabilities** 7 built-in roles, 98 capabilities
- **Not on the settings screen** 45 server options
- **Default differs from the Java** 45 sandbox options
- **Read nowhere** 1 server option, 4 sandbox options (plus `Farming`, read only in commented-out lines)
:::

## 1. What is in this section

Five groups of pages cover the options, the commands, the roles and the numbers a server reports.

- **[Server options A to Z](/pz/build-42/server/server-options/server-options-directory):** all 144 options of the server's ini file, then one page per part of the settings screen, with the game's own description, the default, the range and every place the code reads each one.
- **[Sandbox options A to Z](/pz/build-42/server/sandbox-options/sandbox-options-directory):** all 269 sandbox options, the flavor of your world, with the presets that change each one.
- **[Admin commands](/pz/build-42/server/admin-commands/admin-commands):** the 67 commands the server knows, their forms and the capability each needs.
- **[Roles and capabilities](/pz/build-42/server/roles-and-access/server-roles-and-capabilities):** the 7 built-in roles and the 98 capabilities that decide what a player may do, and [where each capability is checked](/pz/build-42/server/roles-and-access/where-each-capability-is-checked).
- **[Reading the server's numbers](/pz/build-42/server/getting-started/reading-the-servers-numbers):** the statistics, the logs, and who can see them.

## 2. Your server's files

Your server's settings sit in a few files in the `Server` folder of your Zomboid folder, each named after the server.

The folder is `%UserProfile%\Zomboid\Server` on Windows and usually `~/Zomboid/Server` on Linux, where a `deployment.user.cachedir` setting, when present, replaces the home folder. :cite[(`zombie/network/ServerSettingsManager.java:33-35`, `zombie/ZomboidFileSystem.java:205-213`)]

- **`<servername>.ini`** holds the server options. At start-up the server reads it and then writes it out again with every option in it, so an option you delete from the file comes back at its default, with the game's description above it as a `#` comment. :cite[(`zombie/network/ServerOptions.java:262-282`, `zombie/network/ServerOptions.java:489-503`, `zombie/network/ServerOptions.java:506-519`, `zombie/config/ConfigFile.java:95-100`)]
- **`<servername>_SandboxVars.lua`** holds the sandbox options, grouped in tables (`ZombieLore`, `ZombieConfig` and others), each with its description as a `--` comment. The server loads it if it exists, creates it with every option when it is missing, and saves it again at start-up. :cite[(`zombie/network/GameServer.java:1527-1541`, `zombie/SandboxOptions.java:865-935`)]
- **`<servername>_spawnregions.lua`** and **`<servername>_spawnpoints.lua`** say where new characters can start. If either is missing, the server writes it with an example the first time. :cite[(`zombie/network/ServerOptions.java:294-330`)]

## 3. What surprised us

Outcast, read these before you tune your world: each one is a place where the code does something other than the setting's name suggests.

**The sandbox defaults are the Apocalypse preset.** The game loads the Apocalypse preset file when it builds its sandbox options and makes those values the defaults. :cite[(`zombie/SandboxOptions.java:278-279`)] For 45 options that is not the number written in the Java declaration; each entry shows both.

**Two zombie options are only shortcuts on the settings screen.** No game code reads [ZombieRespawn](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombierespawn) or [ZombieMigrate](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombiemigrate). Choosing a value on the server settings screen fills in the advanced `ZombieConfig` values, and the population code reads those. :cite[(`media/lua/client/OptionScreens/ServerSettingsScreen.lua:2740-2757`, `zombie/popman/ZombiePopulationManager.java:337-340`)] Edit the file by hand and only the `ZombieConfig` values count.

**[RuralLooted](/pz/build-42/server/sandbox-options/sandbox-options-loot#rurallooted) is cut to a whole number.** The settings screen offers 2.0, 1.5, 1.0, 0.5 (Normal), 0.25 and 0.0. :cite[(`media/lua/client/OptionScreens/ServerSettingsScreen.lua:4509-4519`)] While `DaysUntilMaximumLooted` is above 0 (its default is 90), the code drops the fraction before it multiplies, so anything below 1.0 counts as 0 and 1.5 counts as 1. A looted chance of 0 is then raised to its floor of 1. :cite[(`zombie/SandboxOptions.java:242`, `zombie/SandboxOptions.java:1210-1211`, `zombie/SandboxOptions.java:1224`, `zombie/SandboxOptions.java:1231-1233`)]

**Options the code never reads.** In the vanilla Java and Lua we searched, nothing reads the five options in the first two bullets, and the third is a special case.
- The server option [BloodSplatLifespanDays](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#bloodsplatlifespandays). The sandbox option with the same name is the one that works. :cite[(`zombie/iso/IsoChunk.java:3536`, `zombie/iso/IsoObject.java:1290`)]
- The sandbox options [AlarmDecayModifier](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#alarmdecaymodifier) (a different option, `AlarmDecay`, is the one read :cite[(`zombie/iso/IsoMetaGrid.java:1568`)]), [PlantAbundance](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#plantabundance), [NightLength](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#nightlength) and [Basement.SpawnFrequency](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#basementspawnfrequency).
- [Farming](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#farming) is read only in lines that are commented out. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:87-118`)] The challenge and debug scenario scripts only assign it, and every other "Farming" in the code is the skill, a loot type or a crafting category.

**[WebhookAddress](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#webhookaddress) is on the public list.** The server writes every public option, names and values, into the data a joining player's game downloads. :cite[(`zombie/network/ConnectionDetails.java:136-141`)] The password, the RCON settings and the Discord token and channels are kept off that list; the webhook address is not. :cite[(`zombie/network/ServerOptions.java:226-234`)] Treat the address as visible to every player who joins.

**[BadWordPolicy](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#badwordpolicy) cannot mute.** Its description offers "4 - mute", but the option only takes 1 to 3, and a 4 in the file is refused. :cite[(`zombie/network/ServerOptions.java:201`, `zombie/config/EnumConfigOption.java:14-16`, `zombie/config/IntegerConfigOption.java:99-104`)] The chat code has a branch for 4, but no value can reach it. :cite[(`zombie/network/chat/ChatServer.java:186-199`)]

**45 server options are not on the settings screen's option pages,** the ten anti-cheat options among them. :cite[(`zombie/network/ServerOptions.java:203-212`)] The count of 45 comes from the extractor's reading of the screen's lists. Two of the 45, `Map` and `Mods`, have their own panels in the screen. :cite[(`media/lua/client/OptionScreens/ServerSettingsScreen.lua:4184-4192`)] You set the rest in the ini file, or with `/changeoption`. :cite[(`zombie/commands/serverCommands/ChangeOptionCommand.java:41-45`)]

**`/setaccesslevel` names a level that does not exist.** Its help text lists "Overseer", but no built-in role has that name; overseers default to the `gm` role. :cite[(`media/lua/shared/Translate/EN/UI.json:1438`, `zombie/characters/Roles.java:363-480`, `zombie/characters/Roles.java:489`)] And 3 commands, `/connections`, `/addalltowhitelist` and `/addusertowhitelist`, are switched off in this build. :cite[(`zombie/commands/serverCommands/ConnectionsCommand.java:21`, `zombie/commands/serverCommands/AddAllToWhiteListCommand.java:25`, `zombie/commands/serverCommands/AddUserToWhiteListCommand.java:24`, `zombie/commands/CommandBase.java:172-175`)]

## 4. How these pages are made

The reference pages in this section are generated, not written by hand, by two scripts in the wiki repository that you can read.

1. `scripts/kb/extract/extract-server-surface.ts` runs against a local copy of the game's decompiled code and its Lua. It reads every server option and sandbox option from their declarations, the settings screen's pages, the presets, the commands and their annotations, the roles and the capabilities, and the game's English text. Then it searches the Java and the vanilla Lua for every place each one is read. It writes one data file, `scripts/kb/data/server-surface-42.22.json`: names, types, defaults, ranges, text and locations, never the game's code.
2. `scripts/kb/gen-server-handbook.ts` turns that data into the pages: `npm run kb:gen-server`. A short hand-written notes file, `scripts/kb/data/server-handbook-notes-42.22.json`, adds the "What the code does" lines, and each note names the read site it was written from. The generator refuses a note whose site is not one of the option's sites.

The rules for finding a read site are printed on [the server options page](/pz/build-42/server/server-options/server-options-directory#how-a-read-site-is-found) and [the sandbox options page](/pz/build-42/server/sandbox-options/sandbox-options-directory#how-a-read-site-is-found). After a game update we re-capture the engine, run the extractor and the generator again, and the pages describe the new build. This round the data comes from capture B42_3d39148846 (42.22).

:::callout[How we know]{kind=proof}
- Everything cited above was read in the 42.22 capture, line by line. The counts in the facts strip (144, 269, 67, 7, 98, the 45s and the read-nowhere ones) come from the generated data, and the generator's test recounts the options, commands, roles and capabilities from the capture. The 45 server options off the settings screen was also recounted by hand; the 45 sandbox defaults that differ from the Java was not recounted.
- "Read nowhere" means our search found no read of the value in the vanilla Java or Lua. The settings screen's lists and the presets name some of them, and the debug scenarios assign some, but that is not a read. A mod, or a part of the engine we did not search, could still use it.
- A read site tells you where the code uses a value, not what happens on a live server. Which side runs a piece of code, and what reaches the other side, takes a test on a dedicated server with its log as the evidence. These pages do not make those claims, and nothing here was tested in a running game.
:::
