---
id: build-42-workshop-upload-what-the-uploader-checks
slug: workshop-upload-what-the-uploader-checks
title: 'Workshop upload and server deployment: what the game checks'
game: pz
version: build-42
section: modding
category: foundations
difficulty: intermediate
tags:
  - workshop
  - publishing
  - multiplayer
  - server
  - mod-info
excerpt: >-
  Every rule the Build 42.22 uploader checks, what Steam can refuse without a dialog, what is uploaded, how the game names your mod, and what a server and a joining client check.
last_updated: '2026-11-16'
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

Outcast, publishing a mod should be the easy part. It is not, because some rules stop the upload with an error screen and others are Steam refusing without one. This page is every check read from the 42.22 code, so your first upload is your last attempt.

**Who this page is for:** [modders about to upload](#2-the-checks-that-stop-an-upload) | [anyone running a server](#7-on-a-server-workshopitems-mods-and-require). For the folder layout and the `workshop.txt` keys, see [packaging and Workshop upload for B42](/pz/build-42/modding/foundations/packaging-and-workshop-upload-for-b42). For a script that measures all of this before you upload, see [check-workshop-item](/pz/build-42/modding/tooling/check-workshop-item).

:::callout[The 1-minute version]{kind=key}
- The uploader checks the item folder when you pick it, and again before you publish. A failed check stops the upload with an error screen named `UI_WorkshopError_<code>`.
- Name the version folder `42` or a version such as `42.13`. A folder called `B42` or `4.2` is not looked at, so you get `MissingModDotInfo` for a file that is right there.
- The preview must be a square PNG of 256 or 512 pixels and at most 1,024,000 bytes. The error text says "exactly 256x256", but 512 passes.
- `visibility=` takes `public`, `friendsOnly`, `private` or `unlisted`, spelled exactly. Anything else, a number included, or no line at all, sends the item as public.
- Only `Contents/` and `preview.png` are sent. Your `docs/`, tests and `workshop.txt` stay on your machine.
- A mod's `require=` is looked up among installed mods, not in `Mods=`. A client that lacks a server mod is disconnected with `connect-mod-required`.
:::

:::facts
- **Preview size** square, 256 or 512 px, at most 1,024,000 bytes
- **Version folder range** from 42.0 up to the running game
- **Blocked file types** `.exe .dll .bat .app .dylib .sh .so .zip`, except a name ending in `pyramid.zip`, in any case
- **Visibility words** `public`, `friendsOnly`, `private`, `unlisted`
- **Connect failure** `connect-mod-required`
:::

## 1. Your first upload, start to finish

**A first upload is: make the folder by hand, let the game write `workshop.txt`, upload, then check the server loaded it.**

Make the item folder yourself. The game lists each folder in `Zomboid/Workshop/` as an item. :cite[(`zombie/core/znet/SteamWorkshop.java:98-118`)] The `mod.info` goes in `common/` or in a version folder, and the uploader looks nowhere else, so a `mod.info` at the mod's root is not seen. :cite[(`zombie/core/znet/SteamWorkshopItem.java:407-450`)]

```
Zomboid/Workshop/<Item>/        (you make this folder)
  preview.png                   (square, 256 or 512 px)
  Contents/
    mods/
      <ModId>/
        common/mod.info         (or 42/mod.info, never <ModId>/mod.info)
```

:::flow[First upload]
- Make the folder and `preview.png`
- Main menu, Workshop, Create and update items
- Pick the item; the checks run
- Fill title, description, tags, visibility; the game writes `workshop.txt`
- A new item: accept the Workshop legal agreement
- Confirm the OK and Cancel box
- Note the `id=` number the game writes
:::

The button is named "Create and update items". :cite[(`media/lua/shared/Translate/EN/UI.json:989`)] Picking an item runs the checks. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:118-128`)] Do not write `workshop.txt` by hand: the game writes it when you leave the page that asks for title, description, tags and visibility. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:346-351`)]

A new item has no id, so the game asks Steam to create one. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:1058-1068`)] The screen shows the Workshop legal agreement text with a link, and after the item is created it logs whether you still need to accept it. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:754-756`, `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:823-825`, `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:1155-1163`)] Before it sends anything, the game shows an OK and Cancel box. :cite[(`zombie/core/znet/SteamWorkshopItem.java:214-226`)]

After the item is created, the game writes the new id into `workshop.txt` as the `id=` line, and that number is the Workshop id for a server's `WorkshopItems=` line. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:1155-1158`, `zombie/core/znet/SteamWorkshopItem.java:644`)] The same number is at the end of the item's Steam page address; that is a Steam fact, not game code.

To see whether a server loaded your mod, look for the line `required mod "<id>" not found` in its log. The loader writes it for any listed or required mod it cannot find, and a mod it cannot find is not loaded. :cite[(`zombie/ZomboidFileSystem.java:826-842`, `zombie/ZomboidFileSystem.java:868-875`)] The exact line the loader writes for a mod that does load is not verified here.

## 2. The checks that stop an upload

**Before anything is sent, the game validates the item folder, and each failure shows an error named `UI_WorkshopError_<code>`.**

The check runs when you pick an item and again when you press Publish. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:122`, `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:843`)] The error screen shows the translated text for the code. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:1232`)] The checks run in the order of the picture below. :cite[(`zombie/core/znet/SteamWorkshopItem.java:521-571`)]

:::flow[Order of the checks]
- `Contents/` exists
- `preview.png`: found, size, dimensions, readable
- Each folder in `Contents/`
- Each mod folder, its `mod.info` and its maps
- File types anywhere under `Contents/`
:::

| Rule | Error if broken | Code |
|---|---|---|
| `Contents/` exists next to `workshop.txt` | `MissingContents` | `zombie/core/znet/SteamWorkshopItem.java:526-530` |
| `preview.png` exists and is readable | `PreviewNotFound` | `zombie/core/znet/SteamWorkshopItem.java:494-517` |
| The preview is at most 1,024,000 bytes | `PreviewFileSize` | `zombie/core/znet/SteamWorkshopItem.java:496-497` |
| The preview is square, 256 or 512 pixels | `PreviewDimensions` | `zombie/core/znet/SteamWorkshopItem.java:505-506` |
| The preview decodes as a PNG | `PreviewFormat` | `zombie/core/znet/SteamWorkshopItem.java:512-513` |
| Only folders directly inside `Contents/` | `FileNotAllowedInContents` | `zombie/core/znet/SteamWorkshopItem.java:541-542` |
| Those folders are only `buildings`, `creative` and `mods` | `FolderNotAllowedInContents` | `zombie/core/znet/SteamWorkshopItem.java:556-557` |
| `Contents/` has at least one folder | `EmptyContentsFolder` | `zombie/core/znet/SteamWorkshopItem.java:569` |
| Only folders inside `Contents/mods/`, and at least one | `FileNotAllowedInMods`, `EmptyModsFolder` | `zombie/core/znet/SteamWorkshopItem.java:457-484` |
| A `mod.info` is found, with a non-empty `id=` | `MissingModDotInfo`, `InvalidModDotInfo` | `zombie/core/znet/SteamWorkshopItem.java:284-312`, `zombie/core/znet/SteamWorkshopItem.java:450` |
| Every folder under a mod's `media/maps/` has a `map.info` | `MissingMapDotInfo` | `zombie/core/znet/SteamWorkshopItem.java:320-340` |
| No blocked file type anywhere under `Contents/` | `FileTypeNotAllowed` | `zombie/core/znet/SteamWorkshopItem.java:249-271` |
| A folder cannot be read | `IOError` | `zombie/core/znet/SteamWorkshopItem.java:280`, `zombie/core/znet/SteamWorkshopItem.java:302`, `zombie/core/znet/SteamWorkshopItem.java:336`, `zombie/core/znet/SteamWorkshopItem.java:453`, `zombie/core/znet/SteamWorkshopItem.java:572` |

The game's own text for `PreviewDimensions` says "exactly 256x256". :cite[(`media/lua/shared/Translate/EN/UI.json:1004`)] The code accepts a width of 256 or 512. :cite[(`zombie/core/znet/SteamWorkshopItem.java:505`)]

The type check compares the end of each file name with the blocked list, and the one exception is a name ending in `pyramid.zip`, compared without regard to case. :cite[(`zombie/core/znet/SteamWorkshopItem.java:255-271`)] The match on the extensions is case-sensitive. :cite[(`zombie/core/znet/SteamWorkshopItem.java:259-266`)]

## 3. The version folder name is checked

**The uploader reads each folder beside `common/` as a game version, and only looks inside the ones from 42.0 up to the running game.**

The `common` folder is always read. :cite[(`zombie/core/znet/SteamWorkshopItem.java:407-425`)] Any other folder is read only when its name converts to a version between the minimum and the running game. :cite[(`zombie/core/znet/SteamWorkshopItem.java:426-447`)] The minimum is 42.0. :cite[(`zombie/gameStates/ChooseGameInfo.java:45`)]

The name `42` converts to 42000, and `42.13` to 42013. A name that does not start with a number, such as `B42`, converts to 0, and `4.2` converts to 4002, so neither reaches 42000. :cite[(`zombie/ZomboidFileSystem.java:576-586`)] When your `mod.info` sits only in such a folder, the uploader sees no `mod.info`, and the result is `MissingModDotInfo`. :cite[(`zombie/core/znet/SteamWorkshopItem.java:450`)]

A `mod.info` in `common` also counts, so the item passes when either place has one. :cite[(`zombie/core/znet/SteamWorkshopItem.java:407-425`)]

## 4. What Steam can refuse without an error screen

**The submit step sends the title, description and visibility before the content, and stops at the first refusal.**

The game asks Steam for each part in this order: start the update, title, description, visibility, tags, content, then the preview and the change note. :cite[(`zombie/core/znet/SteamWorkshop.java:136-161`)] If any step before the content returns false, the upload ends there. :cite[(`zombie/core/znet/SteamWorkshop.java:139-153`)] The upload screen then logs "error requesting Steam to update the item". :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:1088-1091`)]

Two things give that same log line. Before it asks Steam, the game shows a "Steam Workshop upload requested" box with OK and Cancel, and Cancel makes the call return false. :cite[(`zombie/core/znet/SteamWorkshopItem.java:214-226`)]

- **Visibility** is exactly `public`, `friendsOnly`, `private` or `unlisted`. Anything else sends 0, which is public. :cite[(`zombie/core/znet/SteamWorkshopItem.java:128-136`)] The file reader stores the text after `visibility=` as it is. :cite[(`zombie/core/znet/SteamWorkshopItem.java:618-619`)]
- **Tags:** a refusal of the tags call is ignored, so the upload continues. :cite[(`zombie/core/znet/SteamWorkshop.java:154-156`)]
- **Description:** the game adds a `Workshop ID:` line, one `Mod ID:` line per mod and one `Map Folder:` line per map folder to your text. :cite[(`zombie/core/znet/SteamWorkshopItem.java:171-188`)]
- An item titled exactly "Mod Template" is always sent with visibility 2, private. :cite[(`zombie/core/znet/SteamWorkshop.java:147-149`)]
- **Update needs an id:** submitting an item that has no valid Workshop id throws "workshop ID is required". :cite[(`zombie/core/znet/SteamWorkshop.java:137`, `zombie/core/znet/SteamWorkshop.java:164-166`)]

Steam's own limits are 128 bytes for the title and 8000 bytes for the description, counting the lines the game adds. These two numbers are not in the game code; they come from our own refused uploads on 42.20, and are not verified on 42.22.

## 5. Only Contents is uploaded

**The content folder sent to Steam is `<item>/Contents`, and the preview is sent as a separate file.**

The game builds the content folder as the item folder plus `Contents`, and the preview as the item folder plus `preview.png`. :cite[(`zombie/core/znet/SteamWorkshopItem.java:57-59`, `zombie/core/znet/SteamWorkshopItem.java:194-196`)] Your `docs/`, `scripts/`, tests, `README.md` and `workshop.txt` are outside both, so they stay on your machine, and build scripts at the item root never meet the file type check.

After the game creates a new Workshop item, it stores the assigned id and writes `workshop.txt` again. :cite[(`media/lua/client/OptionScreens/WorkshopSubmitScreen.lua:1155-1158`)] Keep that file in version control: its `id=` line is how the next upload updates the item instead of creating a second one. :cite[(`zombie/core/znet/SteamWorkshopItem.java:644`)]

## 6. Your mod's name is the id line

**The game registers a mod under the value of its `id=` line, and not under its folder name.**

The `mod.info` reader takes the text after `id=` and trims spaces from it. :cite[(`zombie/gameStates/ChooseGameInfo.java:243-247`)] It does not remove a comma, so `id=MyMod,` registers a mod called `MyMod,`, and a `require=` that names `MyMod` then does not find it. The uploader reads the same line for its `Mod ID:` list. :cite[(`zombie/core/znet/SteamWorkshopItem.java:293-296`)]

A staged item is loaded, not just waiting. In Steam mode, each `Contents/mods` folder under `Zomboid/Workshop/<item>` is added to the mod search path. :cite[(`zombie/ZomboidFileSystem.java:457-466`, `zombie/ZomboidFileSystem.java:536-543`)] If you are also subscribed to the published copy, the same mod id exists twice on your machine, and the folder scanned earlier wins. :cite[(`zombie/gameStates/ChooseGameInfo.java:171-186`)] Clear your staging folder before you test in multiplayer; our [unstage-all](/pz/build-42/modding/tooling/unstage-all) tool does it.

## 7. On a server: WorkshopItems, Mods and require

**`WorkshopItems=` lists the Workshop ids the server downloads, `Mods=` lists the mod ids that are active, and `require=` is looked up among installed mods.**

The server splits `WorkshopItems=` on `;` and keeps the valid Steam ids. :cite[(`zombie/network/GameServer.java:693-701`)] It passes them to the installer. :cite[(`zombie/network/GameServer.java:723`)] It splits `Mods=` on `;` after removing every backslash. :cite[(`zombie/network/GameServer.java:667-675`)]

Each `require=` entry is looked up among the installed mods, and it is placed ahead of the mod that needs it. :cite[(`zombie/ZomboidFileSystem.java:826-852`)] If a library was downloaded but is missing from `Mods=`, it still loads. If it is not installed, the requiring mod is not loaded and the log says `required mod "<id>" not found`. :cite[(`zombie/ZomboidFileSystem.java:837-842`)] On a dedicated server the missing id is also removed from the server's mod list. :cite[(`zombie/ZomboidFileSystem.java:837-839`)]

## 8. A joining client needs every server mod

**While connecting, the client loads the server's mod list, and if any mod is missing it is disconnected with `connect-mod-required`.**

The client reads the server's mod ids, Workshop ids and names, and runs the same loader over them. :cite[(`zombie/gameStates/ConnectToServerState.java:381-399`)] For a mod it cannot find, it raises the connect-failed message naming the mod and its Workshop id, then disconnects. :cite[(`zombie/gameStates/ConnectToServerState.java:400-405`)] A mod the server has that is not on the Workshop therefore locks out every player who does not have it by hand, because the same lookup finds installed mods only.

:::callout[How we know]{kind=proof}
The rules above are read from the 42.22 decompiled Java and the vanilla Lua; no game, upload or server was run. Not verified on 42.22: Steam's limits of 128 bytes for a title and 8000 for a description (from our own refused uploads on 42.20); that Workshop mods are downloaded for a player before the connect check; that a dedicated server pulls a new version only when it restarts, and the habit of printing a version line to prove which build ran; the roughly four `NoSuchFileException` lines per mod for missing `AnimSets` and `actiongroups` folders; and the thousands of `ImportedSkeleton.collectBoneFrames` errors during asset loading (counts we made on 42.20 logs). A server test on 42.20 loaded eight mods that required one library with the library only in `WorkshopItems=`.
:::
