---
id: build-42-radio-and-television
slug: radio-and-television
title: 'Radio and television: how broadcasts reach you'
game: pz
version: build-42
section: modding
category: engine
difficulty: intermediate
tags:
  - engine
  - radio
  - television
  - lua-api
  - multiplayer
excerpt: >-
  Every radio station, TV show, emergency broadcast and walkie-talkie line goes
  through ZomboidRadio. Where channels come from, when a broadcast starts
  airing, how lines reach a device and a player, how the skill and mood codes
  are applied, and the traps in the device loop that a radio mod will hit.
last_updated: '2026-10-04'
related_articles:
  - radio-channel
  - lua-classes-sound-and-radio
  - what-runs-on-the-server-in-build-42-multiplayer
---
# Radio and television: how broadcasts reach you

Outcast, the radio is the voice of the world ending. Life and Living teaches you to cook, the emergency broadcast tells you the weather, and on a server a walkie-talkie is how your group finds each other. All of it is one system, `zombie.radio`, plus a few Lua files that hang off it. Here is how it works in Build 42.21, so a radio mod does what you meant.

## What it does for the player

Radios and televisions pick up channels. Each channel airs scripted broadcasts on a schedule that follows the days since the outbreak; some lines teach a skill, lift your mood or bore you, and a few teach a recipe. Emergency and weather broadcasts are written at runtime. Two-way radios let players talk over distance, with static the farther you are and the worse the weather. Lines you have already heard do nothing a second time.

## Where it lives

`zombie.radio` is about 6,200 lines in 27 files.

| Piece | Class | Job |
|---|---|---|
| The hub | `ZomboidRadio` | Singleton: days since start, the device registry, distributing lines to devices and players, weather static, saving |
| Channels | `scripting.RadioScriptManager`, `RadioChannel` | Channels keyed by frequency; each runs scripts and airs one broadcast at a time |
| Content | `RadioScript`, `RadioBroadCast`, `RadioLine` | A script holds broadcasts; a broadcast holds lines; a line has text, colour, air time and effect codes |
| Files | `RadioData`, `RadioTranslationData` | Loads `media/radio/*.xml` (vanilla, then each mod) and the matching `.txt` translations |
| Runtime channels | `scripting.DynamicRadioChannel` | Channels created from Lua, such as the emergency broadcast |
| Devices | `devices.DeviceData`, `WaveSignalDevice` | Per-device state: power, channel, volume, two-way, ranges, media, headphones |
| Device holders | `IsoWaveSignal` (placed radios and TVs), `inventory.types.Radio` (held radios), vehicle radios | Display the lines they receive |
| Tapes and discs | `media.RecordedMedia`, `MediaData` | CD and VHS content |

Vanilla Lua: `media/lua/server/radio/ISDynamicRadio.lua` and `ISWeatherChannel.lua` (the runtime channels), `media/lua/shared/RadioCom/ISRadioInteractions.lua` (what a heard line does to a player), and the radio window under `media/lua/client/RadioCom/`.

The path of one scripted line:

`GameTime` (every ten game minutes) -> `ZomboidRadio#UpdateScripts` -> `RadioScriptManager#UpdateScripts` -> `RadioChannel#UpdateScripts`; every update, `ZomboidRadio#update` -> `RadioScriptManager#update` -> `RadioChannel#update` -> `ZomboidRadio#SendTransmission` -> `ZomboidRadio#DistributeTransmission` -> each device's `AddDeviceText` -> the Lua event `OnDeviceText` -> `ISRadioInteractions` applies the codes.

> **Proof:** Code. `zombie.GameTime` (calls `ZomboidRadio.getInstance().UpdateScripts(hour, mins)` with the ten-minute events); `zombie.radio.ZomboidRadio#UpdateScripts`, `#update`, `#SendTransmission`, `#DistributeTransmission`; `zombie.radio.scripting.RadioScriptManager#UpdateScripts`, `#update`; `zombie.radio.scripting.RadioChannel#UpdateScripts`, `#update`; `zombie.radio.RadioData#fetchRadioData`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs and on which side

- **Channels and scripts run in single player and on the server only.** `ZomboidRadio#Init` builds the channel list there and fires `OnLoadRadioScripts`; a multiplayer client skips all of it and asks the server for the channel names instead. The schedule, the days-since-start counter and `RADIO_SAVE.txt` (in the save's `radio/data` folder) belong to the server.
- **On a new game** the counter starts at `(Months since the Apocalypse - 1) x 30.5` days, and the scripts are fast-forwarded to that day.
- **Every ten game minutes** each channel forgets who was listening. Then every device that is on, with a player in range, reports that its channel has a listener (a client sends this to the server). A scripted channel only starts a new broadcast when it has a listener and nothing is airing. Nobody listening, no broadcast.
- **Airing.** While a broadcast airs, the channel sends one line at a time, each held on air for a time based on its length unless the line sets its own. Scripted lines go out with signal strength -1, which means every device on that frequency, at any distance.
- **Weather static.** On the server or in single player, a radio line (not TV) is scrambled by the climate's current weather interference before it is sent, and a scrambled line loses its colour and its effect codes.
- **Reaching players in multiplayer.** The server delivers the line to the devices it holds and sends it to every client. A client hands radio lines to the radios the voice system tracks for each of its players, and TV lines to the televisions it has loaded.

> **Proof:** Code. `ZomboidRadio#Init` (client branch: `GameClient.sendRadioServerDataRequest()`, `scriptManager = null`; otherwise channel loading, `triggerEvent("OnLoadRadioScripts", this.scriptManager, savedWorldVersion == -1)`, `timeSinceApo` start, `simulateScriptsUntil`), `#Save`, `#UpdateScripts` (`TriggerPlayerListening` on client and single player), `#PlayerListensChannel` (client sends `sendPlayerListensChannel`), `#SendTransmission` (`applyWeatherInterference` when `!isTV`; `GameServer.sendIsoWaveSignal`), `#DistributeTransmission` (on a client, radio lines go through `DistributeToPlayerOnClient` and `VoiceManagerData`, then return; TV lines reach the device loop); `zombie.network.packets.WaveSignalPacket#processClient`; `RadioChannel#UpdateScripts` (`playerIsListening = false`), `#SetPlayerIsListening`, `#update` (air time from text length, `SendTransmission(..., -1, this.isTv)`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What a heard line does

A line can carry effect codes, a comma-separated list such as `BOR-2,COO+1`. When a device that has the volume up shows such a line, the game fires `OnDeviceText`, and the shared file `ISRadioInteractions.lua` applies the codes to each player within 5 squares of the device on the same floor, and inside or outside like the device. A held radio reports no position (`-1, -1, -1`), so its line applies to every player the handler walks, with no range check; in single player that is you and any split-screen players. In detail:

- Stat codes change a stat: `ANG`, `BOR`, `END`, `FAT`, `FIT`, `HUN`, `MOR`, `STS`, `PAN`, `SAN`, `SIC`, `PAI`, `DRU`, `THI`, `UHP`. `+` adds, `-` subtracts, `=` sets.
- Skill codes give experience, 50 per point handed to `addXp`: `SPR`, `LFT`, `NIM`, `SNE`, `BAA`, `BUA`, `CRP`, `COO`, `FRM`, `DOC`, `ELC`, `MTL`, `FKN`, `CRV`, `AIM`, `REL`, `FIS`, `TRA`, `FOR`, `TAI`, `MEC` and more. No experience once the skill is at the sandbox **Maximum Media XP Level** (default 3).
- `RCP=<recipe>` teaches a recipe.
- A line is used once per player: its id is stored as a known media line, and a known line does nothing again. Each code then has a short cooldown per player. Sleeping players hear nothing.

On a server, the handler walks the online players; elsewhere it walks the local ones.

> **Proof:** Code. `media/lua/shared/RadioCom/ISRadioInteractions.lua` (`playerInRange`: same floor and within 5 squares; `checkPlayer`: `isOutside` match, `isAsleep`, `isKnownMediaLine`/`addKnownMediaLine`, the `Interactions` table, `cooldowns` set to 30, `RCP`; `doSkill`: `50*_amount` and `SandboxVars.LevelForMediaXPCutoff`; `OnDeviceText`: `getOnlinePlayers()` when `isServer()`); `zombie.SandboxOptions` (`LevelForMediaXPCutoff` default 3); `zombie.iso.objects.IsoWaveSignal#AddDeviceText`, `zombie.inventory.types.Radio#AddDeviceText` (fire `OnDeviceText` when volume is above 0 and codes are present; the held radio passes `-1, -1, -1`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. In multiplayer the handler can run twice for one line: on the server for online players, and on the client, whose devices also fire `OnDeviceText`. Which copy of a stat change sticks, and whether experience from the client copy is ever granted, needs a server test: tune a radio to Life and Living on a dedicated server, listen to one cooking line, and compare the Cooking experience in the server's log of the player with what the client shows. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- `getZomboidRadio()` returns `ZomboidRadio`: `getScriptManager()` (server and single player only; nil on a client), `getDaysSinceStart()`, `getChannelName(freq)`, `getFullChannelList()`, `getRandomFrequency(min, max)`, `addChannelName`, `scrambleString`, `getRecordedMedia()`, `setDisableBroadcasting`.
- `RadioScriptManager`: `AddChannel(channel, overwrite)`, `RemoveChannel(freq)`, `getRadioChannel(uuid)`, `getChannels()`.
- `DynamicRadioChannel.new(name, freq, category, uuid)`, `RadioBroadCast.new(id, -1, -1)`, `RadioLine.new(text, r, g, b)` (and versions with effect codes), `channel:setAiringBroadcast(bc)`: this is how the weather channel builds a forecast every game hour.
- Events: [OnLoadRadioScripts](/pz/build-42/modding/reference/lua-events#onloadradioscripts) `(scriptManager, isNewGame)`, fired in single player and on the server on every load; [OnDeviceText](/pz/build-42/modding/reference/lua-events#ondevicetext) `(guid, codes, x, y, z, text, device)`, with `-1, -1, -1` for a held radio; [OnRadioInteraction](/pz/build-42/modding/reference/lua-events#onradiointeraction).
- Item scripts make a device out of an item of type `Radio` with `TwoWay`, `TransmitRange`, `MicRange`, `BaseVolumeRange`, `IsPortable`, `IsTelevision`, `MinChannel`, `MaxChannel`, `UsesBattery`, `IsHighTier`, `AcceptMediaType` and `NoTransmit`.

See [ZomboidRadio](/pz/build-42/modding/reference/lua-classes-sound-and-radio#zomboidradio), [RadioScriptManager](/pz/build-42/modding/reference/lua-classes-sound-and-radio#radioscriptmanager), [RadioChannel](/pz/build-42/modding/reference/lua-classes-sound-and-radio#radiochannel), [DynamicRadioChannel](/pz/build-42/modding/reference/lua-classes-sound-and-radio#dynamicradiochannel), [RadioBroadCast](/pz/build-42/modding/reference/lua-classes-sound-and-radio#radiobroadcast), [RadioLine](/pz/build-42/modding/reference/lua-classes-sound-and-radio#radioline), [DeviceData](/pz/build-42/modding/reference/lua-classes-sound-and-radio#devicedata), [IsoWaveSignal](/pz/build-42/modding/reference/lua-classes-world-3#isowavesignal) and [Radio](/pz/build-42/modding/reference/lua-classes-items#radio).

> **Proof:** Code. `zombie.Lua.LuaManager` (`getZomboidRadio`, radio classes exposed); `ZomboidRadio#Init` (event only off the client branch); `media/lua/server/radio/ISWeatherChannel.lua` (`RadioBroadCast.new("GEN-"..., -1, -1)`, `RadioLine.new`, `_channel:setAiringBroadcast(bc)` from `OnEveryHour`); `zombie.scripting.objects.Item#DoParam` (the radio keys) and the `ItemType.RADIO` branch that copies them into `DeviceData`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Adding a channel

There are two ways, and they behave differently.

**A scripted channel (XML).** Put an XML file in your mod's `media/radio/` folder (the common folder or the version folder), with translations as `.txt` files beside it. The loader reads vanilla's files first, then each mod's. When two channels share a frequency, a mod channel replaces a vanilla one, but between two mods the one read first keeps the frequency and the other is dropped (with a message only in the radio debug log).

**A runtime channel (Lua).** Vanilla's `ISDynamicRadio.lua` registers the channels in the global `DynamicRadio.channels` on every load, not only on a new game: the new-game branch in that file is commented out. A frequency given as `{min, max}` is rolled once and remembered in the game's mod data (`dynamicRadio`), matched by `uuid`. Each hour, every entry in `DynamicRadio.scripts` whose `channelUUID` matches gets `OnEveryHour(channel, gameTime, radio)`, which is where you build and air a broadcast. Add your channel and your script to those tables from a server Lua file that starts with `require "radio/ISDynamicRadio"`, because that file creates `DynamicRadio` from scratch when it runs. Registration uses `AddChannel(channel, false)`, so a frequency that is already taken is refused.

> **Proof:** Code. `zombie.radio.RadioData#fetchRadioData` (vanilla `media/radio` then each mod's common and version folders; `isVanilla`), `ZomboidRadio#Init` (a found channel blocks the new one unless the found one is vanilla and the new one is not); `RadioScriptManager#AddChannel`; `media/lua/server/radio/ISDynamicRadio.lua` (`DynamicRadio = {}` at file scope; `if _isNewGame` block inside `--[[ ... --]]`, `modData.dynamicRadio`, `getRandomFrequency`, `_scriptManager:AddChannel(dynamicChannel,false)`, `OnEveryHour` loop over `DynamicRadio.scripts`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What a mod can and cannot change

**Can:** add scripted channels and replace vanilla ones, add runtime channels, write broadcasts every hour from Lua, add radio and TV items, react to every line with `OnDeviceText`, mute all broadcasts with `setDisableBroadcasting(true)`.

**Cannot, without replacing a vanilla file:** add a new effect code. The `Interactions` table in `ISRadioInteractions.lua` is a local, so nothing outside that file can add to it. A mod that wants a custom effect can listen to `OnDeviceText` and parse its own codes from the line.

Traps in the device loop, read from the code and checked against the bytecode:

- **One device playing a tape or disc can block a broadcast for the devices after it.** While handing a line to placed devices, the loop meets a device that is on and of the right kind (radio for radio lines, TV for TV lines) but is playing media or has `NoTransmit` set, and it leaves the whole method, not just that device. Every device later in the registry misses that line, whatever channel it is on. This loop handles radio and TV lines in single player, the devices the server holds, and TV lines on a client.
- **A device in line with a transmitter does not hear it.** For a transmission with a range (a player on a two-way radio), a placed device on the same row or the same column of squares as the source is skipped. Scripted broadcasts have no range and are not affected. A held radio has its own rule: it receives a ranged transmission only from more than 3 squares away.

```java
if (device.getDeviceData().isPlayingMedia() || device.getDeviceData().isNoTransmit()) {
   return;
}

if (channel == device.getDeviceData().getChannel()) {
   boolean pass = false;
   if (signalStrength == -1) {
      pass = true;
   } else if (sourceX != PZMath.fastfloor(device.getX()) && sourceY != PZMath.fastfloor(device.getY())) {
      pass = true;
   }
```

Other things to know:

- **`getScriptManager()` is nil on a multiplayer client.** Channel code belongs on the server or in single player; `OnLoadRadioScripts` never fires on a client.
- **Playing devices make noise.** A device that is on with the volume up adds a repeating world sound that zombies hear, unless it is a held device with headphones.

> **Proof:** Code. `ZomboidRadio#DistributeTransmission` (above; the bytecode has a `return` instruction inside the device loop at that test, where the other skips in the loop jump to the loop increment), `#DistributeToPlayerInternal` (`dist > 3 && dist < signalStrength`); `ISRadioInteractions.lua` (`local Interactions = {}`); `ZomboidRadio#Init` (client: `scriptManager = null`); `zombie.radio.devices.DeviceData` (`WorldSoundManager.instance.addSoundRepeating` and `addSound` when turned on, volume above 0, and not an inventory device with headphones). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. The two device-loop traps are read from the code; we have not watched them. The test that settles the first: in a new single-player game, place a radio, turn it on and play a CD in it; then place two more radios tuned to the same scripted channel, and see whether those two stop receiving lines while the CD plays and start again when it stops. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Custom or dynamic radio channel](/pz/build-42/modding/cookbook/radio-channel), the cookbook skeleton for a runtime channel.
- [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).
- [The world map](/pz/build-42/modding/engine/the-world-map), another system where client and server keep separate copies.
