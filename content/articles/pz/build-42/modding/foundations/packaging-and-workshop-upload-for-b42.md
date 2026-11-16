---
id: build-42-packaging-and-workshop-upload-for-b42
slug: packaging-and-workshop-upload-for-b42
title: Packaging and Workshop upload for B42
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - workshop-upload
  - packaging
  - mod-info
excerpt: >-
  Where a Build 42.22 mod goes to be uploaded, which files the uploader sends, what the game writes into workshop.txt, and the keys in it. The checks and Steam limits are on the next page.
last_updated: '2026-11-16'
related_articles:
  - workshop-upload-what-the-uploader-checks
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - mod-info-fields-and-the-versioning-compatibility-system
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders about to upload a Build 42 mod for the first time. It covers the folder layout and the `workshop.txt` keys. Every rule the uploader enforces, and what a server and a joining client check, is on [Workshop upload and server deployment: what the game checks](/pz/build-42/modding/foundations/workshop-upload-what-the-uploader-checks).

:::callout[The 1-minute version]{kind=key}
- Put the item under `Zomboid/Workshop/<ItemName>/`, with your mod at `Contents/mods/<YourMod>/`. The game lists every folder in `Zomboid/Workshop/` as an item you can upload.
- Only the `Contents/` folder and `preview.png` are sent to Steam. Anything else beside `Contents/` stays on your machine.
- The uploader writes `workshop.txt` for you from the screens you fill in. Its keys are `version`, `id`, `title`, `description`, `tags` and `visibility`.
- `visibility` must be the exact word `public`, `friendsOnly`, `private` or `unlisted`. Anything else, or a missing line, uploads the item as public.
- The Mod ID is the `id=` line in `mod.info`, and a server's `Mods=` line uses it. The Workshop ID is the number Steam gives the item, and `WorkshopItems=` uses it.
:::

:::facts
- **Staging folder** `Zomboid/Workshop/`, one folder per item
- **Sent to Steam** `Contents/` and `preview.png`
- **Keys the game writes** `version`, `id`, `title`, `description`, `tags`, `visibility`
- **Version folder name** `42` or a version such as `42.13`
:::

## 1. The folder layout

**An item is a folder in `Zomboid/Workshop/` with a `Contents/mods/<YourMod>/` tree, and only `Contents/` is uploaded.**

The game takes the Workshop staging folder to be `Workshop` inside the game's cache folder, and it lists each folder in it as an item. :cite[(`zombie/core/znet/SteamWorkshop.java:98-100`, `zombie/core/znet/SteamWorkshop.java:102-118`)] The content sent to Steam is the item folder plus `Contents`, and the preview is the item folder plus `preview.png`. :cite[(`zombie/core/znet/SteamWorkshopItem.java:57-59`, `zombie/core/znet/SteamWorkshopItem.java:194-196`)]

So a `.git` folder, `.vscode`, a `README.md` or raw art beside `Contents/` is never sent, and the item folder can double as your git repository. Inside `Contents/` the uploader accepts only the folders `buildings`, `creative` and `mods`. The reasons and the error codes are on [the checks page](/pz/build-42/modding/foundations/workshop-upload-what-the-uploader-checks).

Your mod sits in the versioned layout, with `common/` and a version folder such as `42/` inside `Contents/mods/<YourMod>/`. Name the version folder `42` or a version such as `42.13`, never `B42` or `4.2`: the uploader does not look inside those. See [the versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders) for what goes in each folder.

## 2. The preview image

**`preview.png` sits at the item root, beside `Contents/`, and must be a square PNG that fits the size limits.**

The preview must be 256 or 512 pixels square and at most 1,024,000 bytes. :cite[(`zombie/core/znet/SteamWorkshopItem.java:494-517`)] The mod reader looks for a separate `poster` entry in `mod.info`; see [the mod.info fields](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system). The preview rules are covered on [the checks page](/pz/build-42/modding/foundations/workshop-upload-what-the-uploader-checks).

## 3. Uploading in the game

**The main menu's Workshop screen has a "Create and update items" button, and it walks you through each item's fields.**

The button text comes from the translation file. :cite[(`media/lua/shared/Translate/EN/UI.json:989`)] Picking an item runs the folder check, and the next screen asks for title, description, tags and visibility. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:118-128`, `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:346-351`)] If the item has no Workshop id, the game asks Steam to create one, and then writes it into `workshop.txt`. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:1058-1068`, `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:1155-1158`)]

Before the upload starts, the game shows an OK and Cancel box that names the title and the Workshop id. Cancel stops the upload. :cite[(`zombie/core/znet/SteamWorkshopItem.java:214-226`)] For a first upload from a bare folder, with the folder tree, the legal-agreement step, where to find the Workshop id and how to check a server loaded the mod, follow the walk on [the checks page](/pz/build-42/modding/foundations/workshop-upload-what-the-uploader-checks#1-your-first-upload-start-to-finish). The tags offered come from the game's `WorkshopTags.txt` file. :cite[(`zombie/core/znet/SteamWorkshopItem.java:145-148`)]

## 4. The workshop.txt keys

**The game writes `workshop.txt` itself, and it reads the same keys back.**

The writer produces `version=1`, `id=`, `title=`, one `description=` line per line of text, `tags=` joined with `;`, and `visibility=`. :cite[(`zombie/core/znet/SteamWorkshopItem.java:642-665`)] The reader skips empty lines and lines that start with `#` or `//`, and it understands `id=`, `description=`, `tags=`, `title=` and `visibility=`. :cite[(`zombie/core/znet/SteamWorkshopItem.java:604-619`)]

| Key | What the game does with it | Code |
|---|---|---|
| `version` | Written as `1`; the reader ignores the line | `zombie/core/znet/SteamWorkshopItem.java:642`, `zombie/core/znet/SteamWorkshopItem.java:618` |
| `id` | The Workshop id. With an id, the next upload updates that item. Without one, the game creates a new item | `zombie/core/znet/SteamWorkshopItem.java:605-607`, `zombie/core/znet/SteamWorkshop.java:127-133` |
| `title` | The page title | `zombie/core/znet/SteamWorkshopItem.java:616-617` |
| `description` | The page description. Each line of text is its own `description=` line, and the reader joins them with line breaks | `zombie/core/znet/SteamWorkshopItem.java:608-613`, `zombie/core/znet/SteamWorkshopItem.java:650` |
| `tags` | Tags split on `;` | `zombie/core/znet/SteamWorkshopItem.java:614-615` |
| `visibility` | One of the exact words `public`, `friendsOnly`, `private` or `unlisted`. Anything else, a number included, or no line at all, uploads as public | `zombie/core/znet/SteamWorkshopItem.java:128-136`, `zombie/core/znet/SteamWorkshopItem.java:618-619` |

The upload replaces the whole Steam description with your description plus the lines the game adds: `Workshop ID:`, one `Mod ID:` per mod and one `Map Folder:` per map. :cite[(`zombie/core/znet/SteamWorkshop.java:143`, `zombie/core/znet/SteamWorkshopItem.java:171-188`)] If you copy that description back from Steam into the editor, strip the added lines first, or the game appends them a second time. That second step follows from the code above and was not run.

## 5. Two ids, and the require line

**The Mod ID is the `id=` line in `mod.info`, the Workshop ID is assigned by Steam, and a server needs both.**

The mod reader takes the Mod ID from the `id=` line of `mod.info`. :cite[(`zombie/gameStates/ChooseGameInfo.java:243-247`)] A server reads Mod IDs from `Mods=` and Workshop IDs from `WorkshopItems=`. :cite[(`zombie/network/GameServer.java:667-675`, `zombie/network/GameServer.java:693-701`)] Write both in your item's description for your players.

A mod's `require=` entry is looked up among the installed mods, and not in `Mods=`. :cite[(`zombie/ZomboidFileSystem.java:826-852`)] An installed library missing from `Mods=` still loads ahead of the mod that needs it, and a library that is not installed stops the mod that requires it from loading. The full rule is on [the checks page](/pz/build-42/modding/foundations/workshop-upload-what-the-uploader-checks).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game or upload was run. Not verified: the other upload tools (SteamCMD, SteamChangePreview and the Steam Uploader project), which are outside the game code, dated 2026-11-16. Also not verified here: that a flat Build 41 mod uploaded alone makes a silent install failure for Build 42 subscribers, and that keeping a flat `media/` folder beside `common/` and `42/` serves both builds. The layout pages cover what the loader reads.
:::
