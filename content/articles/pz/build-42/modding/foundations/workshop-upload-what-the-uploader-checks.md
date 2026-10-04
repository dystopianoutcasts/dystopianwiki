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
  Every rule the in-game uploader enforces, the Steam limits that make an
  upload send nothing without an error, what is actually uploaded, how the
  game names your mod, and what a server and a joining client check. Read from
  the 42.21 code, with the mistakes that taught us each one.
last_updated: '2026-10-04'
---
# Workshop upload and server deployment: what the game checks

Outcast, publishing a mod should be the easy part. It is not, because half the rules are enforced with an error dialog and the other half are enforced by Steam refusing quietly. We have had two mods sit on week-old builds while we believed we had uploaded them. This page is every check we know of, read from the code, so your first upload is your last attempt.

For the folder layout itself, see [packaging and Workshop upload for B42](/pz/build-42/modding/foundations/packaging-and-workshop-upload-for-b42). For a script that measures all of this before you upload, see [check-workshop-item](/pz/build-42/modding/tooling/check-workshop-item).

## The uploader's own checks (you get an error dialog)

Before anything is sent, the game validates the item folder. Each failure stops the upload with a `UI_WorkshopError_*` message.

| Rule | Error if broken |
|---|---|
| `Contents/` exists next to `workshop.txt` | `MissingContents` |
| `preview.png` exists | `PreviewNotFound` |
| The preview is square, 256 or 512 pixels | `PreviewDimensions` (its text wrongly says "exactly 256x256") |
| The preview is at most 1,024,000 bytes | `PreviewFileSize` |
| Only folders directly inside `Contents/` | `FileNotAllowedInContents` |
| Those folders are only `buildings`, `creative` and `mods` | `FolderNotAllowedInContents` |
| `Contents/` has at least one folder | `EmptyContentsFolder` |
| Only folders inside `Contents/mods/`, and at least one | `FileNotAllowedInMods`, `EmptyModsFolder` |
| A `mod.info` is found and parses | `MissingModDotInfo`, `InvalidModDotInfo` |
| No `.exe .dll .bat .app .dylib .sh .so .zip` anywhere under `Contents/` | `FileTypeNotAllowed` |

One of these hides a trap: **the version folder name is checked.** The uploader reads each subfolder of your mod as a game version and only looks inside the ones between the mod's minimum version and the running game. Name the folder `42` and it is found. Name it `B42` or `4.2` and the `mod.info` inside is never seen, so you get a baffling `MissingModDotInfo` for a file that is right there.

> **Proof:** Code. `zombie.core.znet.SteamWorkshopItem#validateContents`, `#validatePreviewImage` (`Files.size(path) > 1024000L`, square, 256 or 512), `#validateModsFolder` (`ZomboidFileSystem.getGameVersionIntFromName` on each subfolder, kept only when `ver >= minRequiredVersion && ver <= gameVersion`), `#validateFileTypes`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Steam's limits (you get no error, and nothing is uploaded)

The submit step sends things to Steam in a fixed order and stops at the first refusal:

```java
} else if (!this.n_SetItemTitle(item.getTitle())) {
   return false;
} else if (!this.n_SetItemDescription(item.getSubmitDescription())) {
   return false;
} else {
   int visibility = item.getVisibilityInteger();
   ...
   if (!this.n_SetItemTags(item.getSubmitTags())) {
   }
   if (!this.n_SetItemContent(item.getContentFolder())) {
```

Title, description and visibility come **before** the content. If Steam refuses any of them, no files are sent, and the screen shows only "error requesting Steam to update the item".

- **Title:** at most 128 bytes.
- **Description:** at most 8000 bytes **as submitted**, and the game appends its own `Workshop ID:` and `Mod ID:` lines to yours, so leave room.
- **Visibility:** exactly `public`, `friendsOnly`, `private` or `unlisted`. Anything else, a number included, or no line at all, publishes the item **public**.
- **Tags:** the refusal is ignored (see the empty braces above). The upload succeeds and the tags simply never change.
- A curiosity: an item titled exactly "Mod Template" is always uploaded with visibility 2, private.

> **Proof:** Code. `zombie.core.znet.SteamWorkshop#SubmitWorkshopItem` (the excerpt above); `SteamWorkshopItem#getSubmitDescription`, `#getVisibilityInteger`. The 128 and 8000 byte limits are Steam's, measured when our own uploads were refused. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Only `Contents/` is uploaded

The content folder sent to Steam is `<item>/Contents`, and the preview is sent separately. Your `docs/`, `scripts/`, tests, `README.md` and `workshop.txt` stay on your machine. That is also why build scripts at the item root never trip `FileTypeNotAllowed`.

After the first upload, the game writes the assigned Workshop id back into `workshop.txt` as `id=<number>`. Keep that file in version control: it is how the next upload updates the item instead of creating a second one.

> **Proof:** Code. `SteamWorkshopItem#getContentFolder` and `SteamWorkshop#SubmitWorkshopItem` (`n_SetItemContent(item.getContentFolder())`, then `n_SetItemPreview`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Your mod's name is the `id=` line, not the folder

The game registers a mod under the value of the `id=` line in `mod.info`, not under its folder name. The line is taken literally after `id=`, trimmed of spaces only, so `id=MyMod,` registers a mod called `MyMod,` with the comma, and every `require=` that names `MyMod` then fails to find it.

> **Proof:** Code. `zombie.gameStates.ChooseGameInfo`, the `mod.info` reader (`inputLine.startsWith("id=")`, `inputLine.replace("id=", "").trim()`, `mod.setId(idStr)`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A staged item is loaded, not just waiting

Anything in your `Zomboid/Workshop/<item>/Contents/mods` folder is on the game's mod search path. It is **loaded**, exactly like an installed mod. If you are also subscribed to the published version, the same mod id now exists twice on your machine, and that can stop your client joining a server. Clear your staging folder before you test in multiplayer; our [unstage-all](/pz/build-42/modding/tooling/unstage-all) tool does it.

> **Proof:** Code. `zombie.ZomboidFileSystem#getStagedItemModsFolders` adds each stage folder's `Contents/mods` to the mod folders. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## On a server: `WorkshopItems=`, `Mods=` and `require=`

The two server lines do different jobs:

| Line | Holds | Does |
|---|---|---|
| `WorkshopItems=` | Workshop ids | Makes the server download the mod |
| `Mods=` | Mod ids | Makes it active |

**`require=` is resolved against what is installed, not against `Mods=`.** If a mod requires a library that was downloaded but left out of `Mods=`, the library still loads, pulled in ahead of the mod that needs it. If the library was never downloaded, every mod that requires it is marked unavailable and the log says `required mod "<id>" not found`. The order of `Mods=` does not matter for required mods: `require=` sorts them.

> **Proof:** Code. `zombie.ZomboidFileSystem#loadModsAux` resolves each `require=` entry with `ChooseGameInfo.getAvailableModDetails` and adds it to the order before the mod that needs it. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Server test. Eight mods requiring one library loaded with the library listed in `WorkshopItems=` and its load confirmed in the server's log. Build 42.20, engine revision a2947723ca.

## A joining client needs every server mod, or it is turned away

While connecting, the client receives the server's mod list and tries to load the same set. If any one is missing on the client, the connection is dropped with `connect-mod-required` and an "On connect failed" message naming the mod and its Workshop id. Workshop mods are downloaded for the player before this, so the usual cause is a mod the server has that is not on the Workshop: a side-loaded or private copy locks out every player who does not have it by hand.

> **Proof:** Code. `zombie.gameStates.ConnectToServerState#CheckMods` (`loadModsAux` over the server's mods; on a missing one, `OnConnectFailed` with `UI_OnConnectFailed_ModRequired` and `forceDisconnect("connect-mod-required")`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Checking that an upload really landed

After an upload, do not trust the version number in your own game straight away:

- The subscribed copy can still be the old one for minutes.
- A dedicated server only pulls a new version when it restarts.
- Steam's own record of what you have can be stale. Look at a specific file you changed, inside the downloaded copy, and check it is the new one.
- Give every build a line it prints when it loads (a version string), so a log tells you which build actually ran.

We learned the last one the hard way: a dedicated server kept running a build hours after the fix was published, and only a changed log line proved it.

> **Proof:** Server test. A server kept the previous build until restarted, proved by a log line that changed between builds. Build 42.20, engine revision a2947723ca.

## Log lines that look scary and are not

- About four `NoSuchFileException` lines per mod for missing `AnimSets` and `actiongroups` folders: the game walks those folders for every loaded mod, whether it has them or not.
- Thousands of `ImportedSkeleton.collectBoneFrames` errors while assets load: they come from vanilla's character skeleton (`Bip01_*` bones) and from item mods with props, not from your vehicle.

> **Proof:** Server test. Counted in dedicated-server and client logs across mod lists; the counts moved with the number of mods, not with any one mod. Build 42.20, engine revision a2947723ca.

## Where to go next

- [Packaging and Workshop upload for B42](/pz/build-42/modding/foundations/packaging-and-workshop-upload-for-b42)
- [check-workshop-item](/pz/build-42/modding/tooling/check-workshop-item)
- [unstage-all](/pz/build-42/modding/tooling/unstage-all)
