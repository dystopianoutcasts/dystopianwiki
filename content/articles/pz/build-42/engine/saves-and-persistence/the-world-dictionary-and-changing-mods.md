---
id: build-42-the-world-dictionary-and-changing-mods
slug: the-world-dictionary-and-changing-mods
title: 'The world dictionary and changing mods'
game: pz
version: build-42
section: engine
category: saves-and-persistence
difficulty: advanced
tags:
  - engine
  - saves
  - world-dictionary
  - mods
  - multiplayer
  - modding
excerpt: >-
  What the world dictionary records in a Build 42.22 save, why saved items carry a short number, what happens to saved items when a mod is removed or renamed, the backup and log files, and the errors it raises.
last_updated: '2026-11-15'
related_articles:
  - inside-a-save-folder
  - how-the-world-is-saved
  - players-and-vehicles-databases
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [server owners](#what-happens-when-a-mod-is-removed-or-renamed) | [modders](#what-the-dictionary-records) | the messages are in [the errors it raises](#the-errors-it-raises)

:::callout[The 1-minute version]{kind=key}
- The world dictionary is a file in the save, `WorldDictionary.bin`. It gives every item and entity type in the save a short number, so saved items hold that number and not their full name.
- Each time a save loads, the game checks the dictionary against the item and entity types the loaded mods define, and it writes the file back.
- By the code read here, a type that the mods no longer define keeps its number and is marked removed. A saved item with such a number is not created, and its bytes are skipped.
- The same code means a removed mod's items disappear from any chunk the game loads and saves again. Back up the save before you remove a mod. Not run in a game.
- Before each check the game copies `WorldDictionary.bin` to a `.bak` file, and it keeps a folder of copies if the check fails.
- A save that is not new and has no `WorldDictionary.bin` does not load.
:::

:::facts
- **Largest item or entity number** 32766 :cite[(`zombie/world/DictionaryData.java:264-266`)]
- **Largest object-name number** 126 :cite[(`zombie/world/DictionaryData.java:355-358`)]
- **File buffer** 5242880 bytes for `WorldDictionary.bin` :cite[(`zombie/world/DictionaryData.java:527-531`)]
- **Strings kept in the Generic register** shorter than 64 characters :cite[(`zombie/world/StringDictionary.java:29`)]
:::

## What the dictionary records

The dictionary keeps five kinds of record, and each is a map between a name and a number.

::::cards
:::card[Items]{accent=orange}
Every item type, as a full type name, a number, the mod it came from, and flags for obsolete, removed and loaded this session. Mods that redefine the same item are listed as overrides.
:::
:::card[Entities]{accent=blue}
The same record for entity scripts that are not items.
:::
:::card[Object names]{accent=purple}
Names of erosion objects, each with a number from 0 to 126.
:::
:::card[Sprite names]{accent=cream}
A name-to-number map that the loader fills from the file. See the note below on sprite ids.
:::
::::

Items and entities are registered while scripts load. An item is recorded with its name, module, full type, mod id, the obsolete flag and its script, and an item defined again by another mod pushes the earlier mod id into a list of overrides :cite[(`zombie/world/WorldDictionary.java:92-131`)]. Entities are recorded the same way :cite[(`zombie/world/WorldDictionary.java:133-171`)]. An item or entity from the base game has the mod id `pz-vanilla` :cite[(`zombie/world/WorldDictionary.java:92-131`)].

Object names come from the erosion regions' categories :cite[(`zombie/world/WorldDictionary.java:173-190`)]. Strings and scripts have their own registers: one string register called `Generic`, and three script registers called `SpriteConfigs`, `SpriteOverlayConfigs` and `ContextMenuConfigs` :cite[(`zombie/world/StringDictionary.java:29`, `zombie/world/ScriptsDictionary.java:12-40`)].

The dictionary is not exposed to Lua. The API listing shows none of the 63 `WorldDictionary` members as callable from Lua :cite[(`api/api.jsonl`)]. Lua sees its effects only through item methods, such as the mod id an item reports.

## Why saved items carry a number

A saved item stores the dictionary number, and the dictionary turns it back into a type name on load.

An inventory item writes its registry id as a two-byte number first :cite[(`zombie/inventory/InventoryItem.java:1675`)]. On load, the item factory looks that number up in the dictionary and creates the item from the full type it finds :cite[(`zombie/inventory/InventoryItemFactory.java:186-195`)]. The player record stores the books already read the same way, as item numbers :cite[(`zombie/characters/IsoPlayer.java:1500-1503`)].

Objects in the world store an object-name number and a sprite id when the dictionary has one, and a plain string when it does not :cite[(`zombie/iso/IsoObject.java:1478-1512`, `zombie/iso/IsoObject.java:1255-1272`)]. The only code that puts entries into the sprite maps is the loader of `WorldDictionary.bin` :cite[(`zombie/world/DictionaryData.java:442-521`)]. When a sprite name is not in the maps, the lookup falls back to the sprite's own id from the sprite manager :cite[(`zombie/world/DictionaryData.java:145-176`)]. Not verified: how those sprite ids are assigned.

## How the dictionary is checked at each start

The check runs once per load, in a fixed order, and it fails the load if anything throws.

`WorldDictionary.init` runs after game time and global mod data are loaded :cite[(`zombie/iso/IsoWorld.java:2018-2048`)]. A client takes its data from the server instead of from a file.

:::flow[WorldDictionary.init]
- Copy WorldDictionary.bin to a .bak file
- Load WorldDictionary.bin
- Match item and entity types against the mods
- Match object names, strings and scripts
- Write the readable text, then WorldDictionary.bin
- Delete the .bak file
:::

That is `backupCurrentDataSet`, `load`, `parseInfoLoadList` for items and then entities, `parseCurrentInfoSet`, `parseObjectNameLoadList`, the string and script registers, `saveAsText`, `save` and `deleteBackupCurrentDataSet` :cite[(`zombie/world/WorldDictionary.java:243-298`)].

For each type the mods define, the game looks it up by full type :cite[(`zombie/world/DictionaryData.java:252-301`)]. A type that is not in the dictionary gets the next number, unless the script marks it obsolete.

A type that is already there is marked loaded, and if it had been marked removed and is not obsolete, it is reinstated. If its mod id differs from the stored one, the stored mod id is updated and a change is logged. If the script marks it obsolete, it is marked removed.

After that, every stored type that no mod defined this session is marked removed, and a type whose script cannot be found is also marked removed :cite[(`zombie/world/DictionaryData.java:304-352`)]. A removed type stays in the dictionary. Nothing in the code read here deletes a type from it, and numbers are not reused, because new numbers come from a counter that only goes up. Not verified: a search of the whole game for a call that removes an entry.

## What happens when a mod is removed or renamed

Removing a mod, or renaming a type, turns the old type into a removed entry, and saved items of that type are dropped when they load.

Take these cases one at a time. All are read from code and none was run in a game. Back up the whole save folder first.

- **A mod is removed.** Its item types are marked removed at the next load :cite[(`zombie/world/DictionaryData.java:304-352`)].
- **A saved item has a removed type.** A removed type is not valid, so the item factory logs "cannot create item:" with the type's record and returns nothing :cite[(`zombie/world/DictionaryInfo.java:101-103`, `zombie/inventory/InventoryItemFactory.java:210-211`)]. The message "unknown item ... Make sure all mods used in save are installed." is for a number with no entry or no script :cite[(`zombie/inventory/InventoryItemFactory.java:196-208`)]. The item loader then skips that item's bytes and returns nothing, using the length stored with each item :cite[(`zombie/inventory/InventoryItem.java:1894-1950`)].
- **The save is then saved again.** The skipped item is not in memory, so it is not written. In a chunk that the game loads and saves again, the item is gone for good. This follows from the load and save code and was not run in a game.
- **The mod comes back.** The dictionary still has the type, marked removed, and it is reinstated and keeps its old number :cite[(`zombie/world/DictionaryData.java:281-284`)]. A chunk that was never loaded and saved while the mod was gone still holds the item bytes, so those items load again.
- **A type is renamed.** The full type is the lookup key, so a new name is a new type with a new number and the old type is marked removed. This follows from the lookup by full type and has no separate code path.
- **A type moves to another mod and keeps its name.** The stored mod id is updated and the change is logged, and the number stays the same :cite[(`zombie/world/DictionaryData.java:286-291`)].
- **The mod list changes on a server.** Players are not touched by the dictionary, but a character that fails to load on a server is deleted, so back up `players.db` too :cite[(`zombie/savefile/ServerPlayerDB.java:255-277`)].

The save also has `mods.txt`, a list of the mods it was last saved with, which the Load Game screen reads :cite[(`zombie/gameStates/GameLoadingState.java:463-468`, `zombie/Lua/LuaManager.java:8089-8094`)].

## The files

Several files and one folder belong to the dictionary, and the game makes the last two itself.

| File | What it is | Code |
|---|---|---|
| `WorldDictionary.bin` | The dictionary itself. It is written to `WorldDictionary.tmp` first and then copied over. | `zombie/world/DictionaryData.java:527-560` |
| `WorldDictionaryReadable.lua` | A text copy with sections for items, entities, objects, sprites, strings and scripts, rewritten at every check. | `zombie/world/WorldDictionary.java:296`, `zombie/world/DictionaryData.java:609-670` |
| `WorldDictionaryLog.lua` | A log of what changed. Entries are added to the end of the file, and only when the session registered, reinstated, removed or changed something. | `zombie/world/logger/WorldDictionaryLogger.java:51-75` |
| `WorldDictionary_<time>.bak` | A copy of `WorldDictionary.bin` made before the check and deleted after it succeeds. | `zombie/world/DictionaryData.java:370-392` |
| `WD_ERROR_<time>/` | When the check fails, copies of the backup, the log, the readable file and the binary file. | `zombie/world/DictionaryData.java:394-440` |

The log's entry types are item registered, reinstated, removed, made obsolete and mod id changed, plus object, string and script registrations and script version changes :cite[(`zombie/world/logger/Log.java:140-294`)]. A session that changes nothing does not add to the log, because the "info" entry that every session writes is set to be ignored when the game decides whether there is anything to save :cite[(`zombie/world/logger/Log.java:105-114`, `zombie/world/logger/WorldDictionaryLogger.java:51-64`)].

If the check fails, `.bak` is not deleted, and the `WD_ERROR_<time>` folder holds copies for you to keep :cite[(`zombie/world/WorldDictionary.java:299-312`, `zombie/world/DictionaryData.java:370-440`)]. A leftover `.bak` file is the dictionary as it was before the failed check.

## Servers and clients

The server owns the dictionary, and a client uses the copy the server sends when it connects.

The server sends its dictionary bytes in the connection details, from a copy it cached when it last saved the file :cite[(`zombie/network/ConnectionDetails.java:170`, `zombie/world/WorldDictionary.java:220-240`, `zombie/world/DictionaryData.java:527-537`)]. The client reads the bytes in `ConnectToServerState` and builds its dictionary from them. If none arrived, it stops with an error :cite[(`zombie/gameStates/ConnectToServerState.java:171`, `zombie/world/WorldDictionary.java:263-277`)].

A client's dictionary class never reads or writes a file, and the log is skipped on a client :cite[(`zombie/world/DictionaryDataClient.java:89-97`, `zombie/world/logger/WorldDictionaryLogger.java:31-48`)].

## The errors it raises

The dictionary raises `WorldDictionaryException` with these messages, and any of them makes the whole world fail to load.

| Message | When | Code |
|---|---|---|
| "WorldDictionary data not received from server." | A client starts the check with no data from the server | `zombie/world/WorldDictionary.java:268` |
| "WorldDictionary data received from server is corrupt." | The end marker after the server's data is wrong | `zombie/world/WorldDictionary.java:275` |
| "WorldDictionary data file is missing from world folder." | The file is missing and the save is not new | `zombie/world/DictionaryData.java:448` |
| "Error loading WorldDictionary." | Reading the file throws | `zombie/world/DictionaryData.java:461-462` |
| "Max item ID value reached for WorldDictionary!" | A new item or entity would take a number above 32766 (the check throws at 32767) | `zombie/world/DictionaryData.java:264-266` |
| "Error saving WorldDictionary." | Writing the file throws, for example when the data does not fit the buffer | `zombie/world/DictionaryData.java:527-551` |
| "Cannot register string at this time." and "Cannot register this string!" | A string is registered outside script loading, or is not accepted by its register | `zombie/world/StringDictionary.java:188-192` |
| "Cannot register script at this time." and "Cannot register this script!" | The same for a script | `zombie/world/ScriptsDictionary.java:88`, `zombie/world/ScriptsDictionary.java:264` |
| "WorldDictionary: Cannot load world due to WorldDictionary error." | Any of the above, after the error copies are made | `zombie/world/WorldDictionary.java:299-320` |

"Max value for object names reached." is written to the log in every game and is thrown only when the game runs in debug mode :cite[(`zombie/world/DictionaryData.java:355-359`)]. A debug-mode game also throws if an item loads after the dictionary is set up, and logs a warning otherwise :cite[(`zombie/world/WorldDictionary.java:95-100`, `zombie/world/WorldDictionary.java:137-142`)].

:::callout[How we know]{kind=proof}
- The order, the numbers and the messages are read from the cited code. None of the removal cases was run in a game, so the effect on a real save is from reading the load and save paths only.
- Not verified: that no code removes an entry from the dictionary, how sprite ids are assigned, and what the game does with a removed type other than the item loader (for example a vehicle or a tile that names a removed item).
- Not verified: how the Load Game screen uses `mods.txt` beyond reading it, and what `OnPostWorldDictionaryInit` does in a recipe's script; only its name and the call to it from `IsoWorld.init` were read :cite[(`zombie/iso/IsoWorld.java:2047`)].
:::
