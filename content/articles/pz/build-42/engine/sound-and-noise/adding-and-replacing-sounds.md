---
id: build-42-adding-and-replacing-sounds
slug: adding-and-replacing-sounds
title: 'Adding and replacing sounds'
game: pz
version: build-42
section: engine
category: sound-and-noise
difficulty: intermediate
tags:
  - engine
  - sound
  - modding
  - lua
  - multiplayer
excerpt: >-
  A complete sound mod from an empty folder: a sound file, a sound script, Lua that plays it on a player and at a tile, a noise that draws zombies, and how to replace a vanilla sound.
last_updated: '2026-11-15'
related_articles:
  - how-the-game-plays-audio
  - world-sounds-and-what-hears-them
  - sound-and-noise-reference
  - music-and-ambience
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#step-1-make-the-mod-folder)

:::callout[The 1-minute version]{kind=key}
- A sound mod is three things: a sound file under `media/sound/`, a sound script under `media/scripts/` that names it, and Lua that plays the name.
- Playing a sound and making noise are two separate calls. `playSound` plays a clip that people hear. `addSound` adds a world sound that zombies and animals react to. A mod that wants both makes both calls.
- A sound played on a character from a client is sent to the nearby players, and each of them plays it from their own copy of the mod. So every player needs the mod, not only the server.
- To replace a vanilla sound, write a `sound` block with the same name. The later block replaces the earlier one, and the game's own files load first.
:::

:::facts
- **Folder** `<Zomboid user folder>/mods/<ModFolder>/42/`
- **Sound file** `media/sound/<name>.ogg`
- **Script** `media/scripts/<anything>.txt`
- **Lua** `media/lua/client/<anything>.lua`
:::

This page replaces the short `sound-mod` cookbook page, which says there is no clip-level event field (there is one), lists vehicle hooks that the sound loader does not read, and spells the category "Animal" where the game says "Animals". :cite[(`zombie/scripting/objects/GameSoundScript.java:36-56`, `zombie/scripting/objects/GameSoundScript.java:78-79`, `zombie/scripting/objects/SoundCategory.java:11`)] Read [How the game plays audio](/pz/build-42/engine/sound-and-noise/how-the-game-plays-audio) first if the words "clip" and "emitter" are new.

## Step 1: make the mod folder

A local mod is a folder in the `mods` folder of the Zomboid user directory, which on Windows is `C:\Users\<name>\Zomboid\mods`, with a `mod.info` file and a folder named for the game version. :cite[(`zombie/ZomboidFileSystem.java:205-215`, `zombie/ZomboidFileSystem.java:548-549`)] For a mod you will upload, the Workshop layout puts the same folder under `Contents/mods/`; see [the B42 mod project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure).

Make `mods/MySoundMod/42/`, and put these in it. Not run in a game.

```
mods/MySoundMod/
  42/
    mod.info
    media/
      sound/
        MySoundMod_Chime.ogg
      scripts/
        MySoundMod_sounds.txt
      lua/
        client/
          MySoundMod_Test.lua
```

The game lists a folder in `mods` as a mod when it holds a `mod.info` in `common` or in the best-fitting version folder. :cite[(`zombie/ZomboidFileSystem.java:470-499`)] The local `mods` folder is a sub-folder of the cache directory. :cite[(`zombie/ZomboidFileSystem.java:548-549`)] The `mod.info` file needs at least `name=` and `id=`. :cite[(`zombie/gameStates/ChooseGameInfo.java:205-245`)]

```
name=My Sound Mod
id=MySoundMod
```

Do not put a trailing comma on the last line of `mod.info`. Not run in a game.

## Step 2: add the sound file

Put a short `.ogg` file at `media/sound/MySoundMod_Chime.ogg`. Record it yourself, or export it from an audio editor, so you hold the rights to it.

The game's own install keeps its loose sounds as `.ogg` and `.wav` files in the same `media/sound/` folder, so those two formats are known to load.

A loose file is found by its path from the `media` folder, compared in lowercase, and the file is loaded the first time a clip asks for it. :cite[(`zombie/ZomboidFileSystem.java:382-385`, `fmod/fmod/FMODManager.java:250-267`)] A path that matches no file makes the clip silent with no error. Other formats were not checked, and whether the file must be mono for positioned sound is not verified. Not run in a game.

## Step 3: write the sound script

The script gives the sound a name and points a clip at the file.

```
module Base
{
    sound MySoundModChime
    {
        category = Player,
        clip
        {
            file = media/sound/MySoundMod_Chime.ogg,
            distanceMin = 5,
            distanceMax = 40,
            volume = 0.8,
        }
    }
}
```

The loader reads every key of this script. `file` is the path from the game folder, `distanceMin` and `distanceMax` set how near the sound is at full volume and how far it carries, and `volume` multiplies the clip's loudness. :cite[(`zombie/scripting/objects/GameSoundScript.java:26-85`)] The full list of keys, defaults and traps is in [How the game plays audio](/pz/build-42/engine/sound-and-noise/how-the-game-plays-audio). Every line must have an `=`, because a line without one stops the whole script from loading.

Use `module Base` as vanilla does. A different module name was not tried. A sound's name does not carry its module: the sound is stored under the bare name. :cite[(`zombie/GameSounds.java:158-170`, `zombie/scripting/objects/GameSoundScript.java:26-30`)] Not run in a game.

## Step 4: play it from Lua

A client Lua file plays the sound on the player when a key is pressed, and at a tile a few steps away.

```lua
local function onKey(key)
    if key ~= Keyboard.KEY_DELETE then return end
    local player = getPlayer()
    if not player then return end

    -- 1. On the player. Heard by nearby players on a server.
    player:playSound("MySoundModChime")

    -- 2. At a tile 5 steps east. Also sent to nearby players on a server.
    local sq = getCell():getGridSquare(player:getX() + 5, player:getY(), player:getZ())
    if sq then sq:playSound("MySoundModChime") end
end

Events.OnKeyStartPressed.Add(onKey)
```

`player:playSound` goes through the character's emitter. When the game is a multiplayer client, that sends a `PlaySound` packet with the name, and the sound also plays on your own machine. :cite[(`zombie/characters/IsoGameCharacter.java:11886-11888`, `zombie/characters/CharacterSoundEmitter.java:160-170`, `fmod/fmod/FMODSoundEmitter.java:396-409`)] The tile version takes a free emitter at the tile and plays on it, and on a client it sends `PlayWorldSound` for that tile. :cite[(`zombie/iso/IsoGridSquare.java:9703-9706`, `fmod/fmod/FMODSoundEmitter.java:396-409`)] In single player, nothing is sent and the clip plays locally.

Vanilla uses the same call: the plow action plays a furrow sound this way. :cite[(`media/lua/shared/Farming/TimedActions/ISPlowAction.lua:36-44`)]

To play a sound only for yourself, with no network packet, use `getSoundManager():playUISound(name)` or `player:playSoundLocal(name)`. :cite[(`zombie/SoundManager.java:202-238`, `zombie/characters/IsoGameCharacter.java:11890-11893`)]

The key is Delete, a constant that vanilla Lua also uses. `OnKeyStartPressed` fires when the key goes down, while `OnKeyPressed` fires on release. :cite[(`zombie/input/GameKeyboard.java:55-90`)] If another mod uses the key, pick another `Keyboard.KEY_` constant. Not run in a game.

## Step 5: enable the mod

Turn the mod on in the Mods screen, then start or load a game, and press the key.

The Mods screen is the MODS item on the main menu. :cite[(`media/lua/shared/Translate/EN/UI.json:8`)]

Enable `My Sound Mod` in the game's Mods screen before you load a save. You should hear the chime from the player and then from the tile. 

On a server, every player needs the mod, because each client plays the clip from its own sound scripts, and the server also loads them to size the forwarding area. :cite[(`zombie/network/packets/sound/PlaySoundPacket.java:84-108`, `zombie/scripting/ScriptManager.java:1600-1716`)] On a dedicated server, add the mod to the server's mod list. Not run in a game.

If you hear nothing, look in the game's log, `C:\Users\<name>\Zomboid\console.txt`, for a Sound-type line: "no GameSound called" means the name was not found, and "No such FMOD event" means a clip named an event that does not exist. :cite[(`zombie/GameSounds.java:83-86`, `zombie/GameSounds.java:101-112`)] These lines appear only when the Sound debug type is enabled, which you do by starting the game with the launch option `-debuglog=Sound`. :cite[(`zombie/gameStates/MainScreenState.java:181-185`, `zombie/gameStates/MainScreenState.java:251-254`)] After you edit the script, the Lua global `reloadSoundFiles()` reloads sound scripts, and can be called from the debug Lua console. :cite[(`zombie/Lua/LuaManager.java:11030-11035`)]

## Step 6: make zombies hear it

A world sound is a separate call, and it needs a radius and a volume above zero.

Add this to the same key handler. Not run in a game.

```lua
    -- 3. A noise zombies react to: radius 30 tiles, volume 30.
    addSound(player, player:getX(), player:getY(), player:getZ(), 30, 30)
```

The global `addSound` takes a source, a tile position, a radius and a volume, and passes them to the world sound manager. A radius of 0 or less adds nothing. :cite[(`zombie/Lua/LuaManager.java:11763-11769`, `zombie/WorldSoundManager.java:156-158`)] This is the same call vanilla makes next to the furrow sound: radius 10, volume 1. :cite[(`media/lua/shared/Farming/TimedActions/ISPlowAction.lua:44`)] How far it carries and how zombies score it is in [World sounds and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them).

To test it, stand about 25 tiles from a zombie in a game where you may spawn zombies and press the key. Whether the zombie turns toward you also depends on the Hearing sandbox option, so a Poor setting needs a closer test. Not run in a game.

Single player and multiplayer differ here. In single player, the world sound is added where you stand. On a multiplayer client, the global `addSound` is sent to the server, which adds it and passes it along, and the server does not check the position or size. :cite[(`zombie/WorldSoundManager.java:76-139`, `zombie/network/packets/sound/WorldSoundPacket.java:154-204`)] A server owner should treat the world-sound packet as something any connected client can send, and should only run mods they trust.

## Step 7: play it from the server

Server Lua can play a sound for nearby players without a client asking.

```lua
-- in media/lua/server/MySoundMod_Server.lua
function MySoundMod_chimeAt(square)
    playServerSound("MySoundModChime", square)
end
```

`playServerSound` sends a `PlayWorldSound` packet for the tile to players whose map area covers it, using a radius of 5 that the code doubles. :cite[(`zombie/Lua/LuaManager.java:3914-3920`, `zombie/network/GameServer.java:2165-2185`)] `sendPlaySound(name, loop, object)` sends a `PlaySound` packet for a moving object, and does nothing unless the game is a server. :cite[(`zombie/Lua/LuaManager.java:11770-11782`)] Vanilla server Lua uses both. :cite[(`media/lua/server/Traps/STrapGlobalObject.lua:120`, `media/lua/shared/Moveables/ISMoveableSpriteProps.lua:3466`)] Not run in a game.

## Replacing a vanilla sound

To replace a sound, write a `sound` block with the same name as the one you want to replace.

Vanilla names its sounds in scripts and the code looks them up by name, so a replacement needs no code. For example the furrow sound is a block named `DigFurrowWithHands` that plays an FMOD event. :cite[(`media/scripts/generated/sounds/player/sounds_player_farming.txt:804-811`)] A mod script with this name:

```
module Base
{
    sound DigFurrowWithHands
    {
        category = Player,
        clip
        {
            file = media/sound/MySoundMod_Dig.ogg,
        }
    }
}
```

replaces the vanilla block. Put your own short `.ogg` at `media/sound/MySoundMod_Dig.ogg` in the same mod, next to the chime file, and keep the script in the same `media/scripts` folder.

Game files load first and mod files after them. A later block of the same name resets the sound and loads over it. :cite[(`zombie/scripting/ScriptManager.java:1600-1716`, `zombie/scripting/ScriptBucket.java:100-135`, `zombie/scripting/ScriptBucket.java:176-200`)] Mod script files from all mods are sorted together by path, so when two mods replace the same sound, the file whose path sorts last wins, and the mod order does not decide it. :cite[(`zombie/scripting/ScriptManager.java:1658-1676`)] Not run in a game.

A few cautions, all read from the code. A replaced sound loses whatever FMOD parameters the vanilla event used, because a file clip has none. Items refer to sounds by name in fields such as `SwingSound` and `EquipSound`, so pointing an item's field at your own sound name changes only that item.

A vanilla loose file can be replaced by shipping a file at the same path, because the later file wins in the file table. :cite[(`zombie/ZomboidFileSystem.java:656-700`)]

:::callout[How we know]{kind=proof}
- Every step is read from the code and none was run in a game. The Lua uses calls that vanilla uses (`playSound`, `getEmitter():playSound`, `addSound`, `playServerSound`, `sendPlaySound`), but the full mod was not loaded.
- Not verified: the file formats other than `.ogg` and `.wav`, whether mono files are needed for positioned sound, a non-`Base` module name for a sound, what happens when a client and a server hold different script checksums, and which key is free on your setup.
- The name `MySoundMod` is an example and is not in any game file.
:::
