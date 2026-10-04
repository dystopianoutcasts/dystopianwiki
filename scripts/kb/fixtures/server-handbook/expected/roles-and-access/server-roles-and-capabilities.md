---
slug: server-roles-and-capabilities
title: 'Roles and capabilities (Build 9.99)'
game: pz
version: build-42
section: server
category: roles-and-access
difficulty: beginner
tags:
  - server
  - admin
  - roles
  - generated
excerpt: 'The 3 built-in roles of Build 9.99, what each may do, and all 4 capabilities with the commands that need them.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - where-each-capability-is-checked
  - admin-commands
---
# Roles and capabilities

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Outcast, in Build 9.99 what a player may do on your server is a list of capabilities, and a role is a named set of them. The game ships 3 built-in roles. You give a player a role with `/setaccesslevel`, and admins can add their own roles in the game's Roles window.

## How roles work

- **The built-in roles cannot be edited.** Each is marked read-only once it is built, and adding or removing a capability on a read-only role does nothing. A role you add yourself starts with one capability, `LoginOnServer`, and you choose the rest.
- **Where they are kept.** The roles live in the server's database. At start-up the server builds the built-in roles, then loads the roles you added.
- **Default roles.** The server keeps a default role for each kind of account. Out of the box: `defaultForUser` is `user`, `defaultForNewUser` is `user`, `defaultForGM` is `gm`, `defaultForOverseer` is `gm`, `defaultForAdmin` is `admin`.
- **Single player in debug mode** grants every capability; a dedicated server never does that.

> **Proof:** Code. zombie.characters.Roles#addStatic (the built-in roles, their capabilities, descriptions and defaults), #init (built-in roles first, then the database), #addRole (a new role gets LoginOnServer); zombie.characters.Role#addCapability (does nothing on a read-only role), #hasCapability and #isUsingDebugMode. Build 9.99 (revision 0f0f0f0f0f).

## The built-in roles

| Role | The game's description | Capabilities | Default for |
|---|---|---|---|
| `user` | "Have no capabilities." | 1 | `defaultForUser`, `defaultForNewUser` |
| `gm` | "Can teleport." | 3 | `defaultForGM`, `defaultForOverseer` |
| `admin` | "Have all capabilities." | all | `defaultForAdmin` |

## Which role has which capability

Every capability in 9.99, the game's description of it, the built-in roles that hold it (Y), and the commands that need it. [Where each capability is checked](/pz/build-42/server/roles-and-access/where-each-capability-is-checked) lists the code that reads each one.

| Capability | user | gm | admin | Commands | The game's description |
|---|---|---|---|---|---|
| `LoginOnServer` | Y | Y | Y |  | "Allows login." |
| `TeleportToPlayer` |  | Y | Y | `/teleport` | "Allows teleport." |
| `SeePlayers` |  | Y | Y | `/connections`, `/horde2` |  |
| `SaveWorld` |  |  | Y | `/save`, `/teleport` | "Allows saving." |
