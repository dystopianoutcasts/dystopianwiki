---
id: build-42-what-anti-cheat-does-not-cover
slug: what-anti-cheat-does-not-cover
title: 'What the anti-cheat does not cover'
game: pz
version: build-42
section: engine
category: anti-cheat
difficulty: intermediate
tags:
  - engine
  - multiplayer
  - anti-cheat
  - server
  - administration
  - modding
excerpt: >-
  What the Build 42.22 anti-cheat leaves to each packet's handler and to mods, and what a server owner and a modder can do about it: logs, roles, careful mods and backups.
last_updated: '2026-11-15'
related_articles:
  - how-anti-cheat-works
  - anti-cheat-and-mods
  - reading-anti-cheat-logs-and-bans
  - anti-cheat-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [server owners](#what-a-server-owner-can-do) | [modders](#what-a-modder-must-do) | the checks themselves are on [How the anti-cheat works](/pz/build-42/engine/anti-cheat/how-anti-cheat-works)

:::callout[The 1-minute version]{kind=key}
- The anti-cheat checks the packet types that list a check, plus a few timers and error paths. For everything else the server relies on each packet's handler, and on mods, to check what the sender asks for.
- A quiet anti-cheat log does not prove that nothing was abused. A handler or a mod can refuse or accept a request without writing any anti-cheat line.
- A server owner can keep and read the logs, watch the admin chat, give roles only the capabilities they need, choose mods that check their own commands, and keep backups.
- `ClientCommandFilter` changes only what the `cmd` log records. It does not stop a command from reaching a mod.
- A modder checks the sender, every value, the target and the rate in the mod's own server handler, then logs and refuses.
- This page names no unchecked packet, handler or command on purpose.
:::

:::facts
- **Where the checks run** the server only
- **Policies** Ban, Kick, Log or Disabled for each option
- **Logs worth keeping** `user` and `cmd`
- **Backups** your own schedule (advice, not an engine feature)
:::

## What the checks leave to other code

The anti-cheat judges the packet types that list a check and a small set of timers and error paths, and it leaves the rest to each packet's own handler and to mods.

A packet type lists its checks in its settings. The server runs each enabled check after it parses the packet, and a type with no list goes straight to its handler. :cite[(`PacketTypes.java:706-724`, `PacketTypes.java:773-786`)] The three timers and the error paths run from other code, as [How the anti-cheat works](/pz/build-42/engine/anti-cheat/how-anti-cheat-works) explains. :cite[(`AntiCheat.java:100-106`)]

A packet type also names a capability that its sender's role must hold, and a packet from a sender whose role lacks it is dropped. :cite[(`PacketTypes.java:304-316`)] That decides who may send a packet type. It says nothing about the values inside a packet, which is the handler's job.

The reference page [lists the checks and the packet types that name them](/pz/build-42/engine/anti-cheat/anti-cheat-reference). It does not list what lies outside them, and neither does any other page in this series.

## What follows for a server owner

Silence from the anti-cheat is not proof that nothing was refused or abused, because a handler or a mod can act on a request without any anti-cheat line.

The anti-cheat writes a line only when a check it runs finds a fault and the check's option is not Disabled. :cite[(`AntiCheat.java:78-98`)] A mod's own refusal appears in your logs only if the mod writes it. A mod that accepts a request it should have refused writes no refusal line, because nothing was refused.

The server does keep one record that does not depend on the checks. When it receives a mod or vanilla command it writes the sender, the module, the command and the sender's position to the `cmd` log, for each command that the `ClientCommandFilter` option lets through. :cite[(`GameServer.java:2318-2336`)] The option's default value keeps some commands out of that log, so an owner who wants a fuller record reads the option's value in the ini file and edits it. :cite[(`ServerOptions.java:165-167`)]

`ClientCommandFilter` only decides what the log records. The command reaches the Lua event whether or not the filter lets it into the log. :cite[(`GameServer.java:2318-2343`, `ServerOptions.java:165-167`)] The `cmd` log is for finding out what happened, not for stopping it.

## What a server owner can do

These steps use only what the server already provides, and they are in the order that costs the least.

1. **Keep the logs and read them.** Anti-cheat lines go to the `user` log, and the `cmd` log records commands. :cite[(`AntiCheat.java:108-114`, `GameServer.java:2318-2336`)] Each log is a file named from the server's start time and the log's name inside the `Logs` folder of the server's cache folder, and the server moves the previous session's files into a dated folder when it starts. :cite[(`LoggerManager.java:42-64`, `LoggerManager.java:85-97`)] [Reading anti-cheat logs and bans](/pz/build-42/engine/anti-cheat/reading-anti-cheat-logs-and-bans) shows how to read the `user` log line by line.
2. **Watch the admin chat.** A role that holds the `AdminChat` capability receives each anti-cheat line live. :cite[(`ChatServer.java:140-143`, `AntiCheat.java:112`)]
3. **Look at suspicion points.** The users list in the admin panel shows a "Suspicion points" column, which adds up the anti-cheat's userlog entries for each player. :cite[(`ServerWorldDatabase.java:140-150`, `media/lua/client/ISUI/AdminPanel/ISUsersList.lua:237-254`)]
4. **Give roles only the capabilities they need.** A role's capabilities decide which packets its players may send and which vanilla commands accept them. See [Server roles and capabilities](/pz/build-42/server/roles-and-access/server-roles-and-capabilities) and [Where each capability is checked](/pz/build-42/server/roles-and-access/where-each-capability-is-checked).
5. **Choose mods that check their own commands.** Before you add a mod that sends commands, read its server files, or ask its author whether the handler checks the sender, the values and the target, and whether it logs a refusal. [Anti-cheat and mods](/pz/build-42/engine/anti-cheat/anti-cheat-and-mods) describes what a careful handler does.
6. **Keep backups.** Copy the server's save and its database on a schedule you choose, so that a change you find late can be undone. This is advice, not an engine feature.
7. **Choose each option's policy with the logs in view.** [The options page](/pz/build-42/engine/anti-cheat/anti-cheat-server-options) says how to move from Log to Kick on a server you have watched.

The first three steps give you evidence. The fourth and fifth reduce what a request can do, and the sixth limits the cost of a mistake.

## What a modder must do

A mod's own command handler is the only check its commands get, so it has to do the whole job.

The handler tests that the command is its own, takes the sender from the player argument and not from the table, tests every value in the table, measures distance and ownership from what the server holds, tests the role where the action needs one, limits how often a player can ask, then logs and refuses when any test fails. [Anti-cheat and mods](/pz/build-42/engine/anti-cheat/anti-cheat-and-mods) works through each step with a short handler. :cite[(`GameServer.java:2293-2321`, `LuaManager.java:3081-3092`)]

Test the handler as a normal player role, and again with a player who sends values it does not expect. A handler that only ever saw the values its own client menu produces has not yet been tested. Log every refusal with the player's name, the command and the values, because that line is the only evidence you will have. :cite[(`LuaManager.java:9142-9146`)]

The full example mod, with its client file, is on [Client and server commands](/pz/build-42/engine/networking-and-packets/client-and-server-commands), and [the packet system](/pz/build-42/engine/networking-and-packets/the-packet-system) explains the packet underneath.

:::callout[How we know]{kind=proof}
Every engine claim is read from the 42.22 decompiled Java in the capture and the vanilla Lua in its game snapshot. The claim that a quiet log proves nothing follows from where the anti-cheat line is written (only on a fault in a check that is enabled) and from the fact that mods write their own logs. It is a reasoning step, not something observed on a server.

This page gives no count, list or example of packets, handlers or commands that no check covers, on purpose. The full list of what the checks do cover is on the reference page.

Not run in a game: the log file names, the admin chat delivery, the Suspicion points column, and every step of the owner list. The backup advice is general practice, not read from the code.
:::
