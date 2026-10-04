---
slug: admin-commands
title: 'Admin commands (Build 9.99)'
game: pz
version: build-42
section: server
category: admin-commands
difficulty: beginner
tags:
  - server
  - admin
  - commands
  - generated
excerpt: 'All 4 Build 9.99 server commands: their forms, the capability each needs, the roles that have it, and the game''s help text.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - server-roles-and-capabilities
  - server-options-directory
---
# Admin commands

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Outcast, these are the 4 commands the Build 9.99 server knows, in the order the server tries them. You type them in chat with a `/` in front, or in the server console without it. Each form of a command needs one capability; the built-in roles that hold it are listed with it, and [Roles and access](/pz/build-42/server/roles-and-access/server-roles-and-capabilities) says what each role holds.

## How the server reads a command

- **Matching.** The server walks its command list in order and takes the first command whose name starts the line, ignoring case and stopping at a word boundary. A disabled command is skipped.
- **Arguments.** The line is split at spaces; text in double quotes stays one argument (the quotes are removed). Each form of a command lists the arguments it takes; the first form that fits is used. When none fits, the server answers with the command's help text.
- **Who may run it.** After the arguments fit, the server checks the capability that form needs against your role. Without it you get "no right to execute" and nothing happens.
- **1 command is disabled in 9.99:** `/connections`. They are in the list, but the server skips them.

## Quick list

| Command | Needs | Built-in roles that have it |
|---|---|---|
| [/save](#save) | `SaveWorld` | admin |
| [/teleport](#teleport) | `TeleportToPlayer`, `SaveWorld` | gm, admin |
| [/connections](#connections) (disabled) | `SeePlayers` | gm, admin |
| [/horde2](#horde2) | `SeePlayers` | gm, admin |

### /save

- **Forms:** `/save`
- **Needs:** `SaveWorld` (admin)
- **The game's help text:** "Save the world"
- **Runs in:** `zombie.commands.serverCommands.SaveCommand#Command` (line 30)

### /teleport

- **Also typed as:** `/tp`
- **Forms:** `/teleport <"name or text">` (needs `TeleportToPlayer`); `/teleport <"name or text"> <"name or text">` (needs `SaveWorld`)
- **Needs:** `TeleportToPlayer` (gm, admin); `SaveWorld` (admin)
- **The game's help text:** "Teleport to a player. Use /teleport "name""
- **Runs in:** `zombie.commands.serverCommands.TeleportCommand#Command` (line 40)
- **What the code does:** Fixture: moves you.

### /connections

- **Also typed as:** `/list`
- **Disabled in this build:** the server skips it.
- **Forms:** `/connections [<-true or -false>]`
- **Needs:** `SeePlayers` (gm, admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.ConnectionsCommand#Command` (line 20)

### /horde2

- **Forms:** `/horde2 ...` (any arguments; the command reads them itself)
- **Needs:** `SeePlayers` (gm, admin)
- **The game's help text:** none (the command has no help text)

## Commands every player has

The server also keeps a short help list for players, shown by `/help` to someone without admin capabilities. These are the entries, with the game's own text:

- `/roll`: "Roll a die. Use: /roll 6"

> **Proof:** Code. zombie.commands.CommandBase#findCommandCls (the order, case-insensitive match, disabled commands skipped), the CommandBase constructor (splitting the line), #parseCommand (the forms), #canBeExecuted and #PlayerSatisfyRequiredRights (the capability check), the annotations of each class in zombie.commands.serverCommands, zombie.network.ServerOptions#initClientCommandsHelp (the player help list), and the help strings in media/lua/shared/Translate/EN/UI.json. Build 9.99 (revision 0f0f0f0f0f).
