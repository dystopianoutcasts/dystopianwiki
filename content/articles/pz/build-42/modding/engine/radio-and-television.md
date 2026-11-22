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
  Every radio station, TV show, emergency broadcast and walkie-talkie line goes through ZomboidRadio. How channels load, when a broadcast airs, and how lines reach a player in 42.22.
last_updated: '2026-11-21'
related_articles:
  - radio-channel
  - lua-classes-sound-and-radio
  - what-runs-on-the-server-in-build-42-multiplayer
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [server owners](#4-when-it-runs-and-on-which-side) | [modders](#7-what-lua-can-reach)

:::callout[The 1-minute version]{kind=key}
- Outcast, radios and televisions pick up channels. A channel airs its scripted broadcasts on a schedule that follows the days since the outbreak, and only while a device tuned to it is on with a player in range.
- Some lines teach a skill, change a mood or stat, or teach a recipe. A line you already heard does nothing a second time.
- Channels and their schedule run in single player and on the server. A multiplayer client only receives lines.
- A walkie-talkie line reaches other players within the transmitter's range, with static from the weather. Servers can switch radio off for staff roles with the `DisableRadio...` server options.
- One placed device that is playing a tape or disc can stop the whole device loop, so later devices miss that line. Read from the code, not watched.
- A mod can add scripted (XML) channels and runtime (Lua) channels, but it cannot add a new effect code without replacing a vanilla file.
:::

:::facts
- **Schedule tick** every 10 game minutes; at the default 90-minute day that is 37.5 real seconds (our arithmetic)
- **Start day** `(Months since the Apocalypse - 1) x 30.5` days on a new game
- **Listening window** a channel forgets its listeners every ten game minutes and must hear from a device again
- **Effect range** 5 squares from a placed device, same floor, inside or outside to match
- **Effect codes** 15 stat codes in the file, of which only 2 (`BOR`, `UHP`) change anything at 42.22; 33 skill codes; `RCP` for a recipe
- **Package** 27 files and 6,170 lines in `zombie.radio`
:::

## 1. What it does for the player

Radios and televisions pick up channels, and each channel airs scripted broadcasts on a schedule that follows the days since the outbreak.

Some lines teach a skill, lift your mood or bore you, and a few teach a recipe.

Emergency and weather broadcasts are written at runtime. Two-way radios let players talk over distance, with static the farther you are and the worse the weather. Lines you have already heard do nothing a second time. Outcast, life and living teaches you to cook, the emergency broadcast tells you the weather, and on a server a walkie-talkie is how your group finds each other.

## 2. Where it lives

`zombie.radio` is 27 files and about 6,200 lines, plus a few Lua files that hang off it. :cite[(`zombie/radio/`)]

| Piece | Class | Job | Code |
|---|---|---|---|
| The hub | `ZomboidRadio` | Singleton: days since start, the device registry, distributing lines to devices and players, weather static, saving | `zombie/radio/ZomboidRadio.java:210-465` |
| Channels | `scripting.RadioScriptManager`, `RadioChannel` | Channels keyed by frequency; each runs scripts and airs one broadcast at a time | `zombie/radio/scripting/RadioScriptManager.java:103-133`, `zombie/radio/scripting/RadioChannel.java:219-263` |
| Content | `RadioScript`, `RadioBroadCast`, `RadioLine` | A script holds broadcasts; a broadcast holds lines; a line has text, color, air time and effect codes | `zombie/radio/scripting/RadioScript.java:129-201` |
| Files | `RadioData`, `RadioTranslationData` | Loads `media/radio/*.xml` (vanilla, then each mod) and the matching `.txt` translations | `zombie/radio/RadioData.java:95-234` |
| Runtime channels | `scripting.DynamicRadioChannel` | Channels created from Lua, such as the emergency broadcast | `zombie/radio/scripting/DynamicRadioChannel.java:14-26`, `media/lua/server/radio/ISDynamicRadio.lua:12-24` |
| Devices | `devices.DeviceData`, `WaveSignalDevice` | Per-device state: power, channel, volume, two-way, ranges, media, headphones | `zombie/radio/devices/DeviceData.java:855-870` |
| Device holders | `IsoWaveSignal` (placed radios and TVs), `inventory.types.Radio` (held radios), vehicle radios | Display the lines they receive | `zombie/iso/objects/IsoWaveSignal.java:202-215`, `zombie/inventory/types/Radio.java:80-104`, `zombie/vehicles/VehiclePart.java:816` |
| Tapes and discs | `media.RecordedMedia`, `MediaData` | CD and VHS content | `zombie/radio/ZomboidRadio.java:354-360` |

Vanilla Lua: `media/lua/server/radio/ISDynamicRadio.lua` and `ISWeatherChannel.lua` (the runtime channels), `media/lua/shared/RadioCom/ISRadioInteractions.lua` (what a heard line does to a player), and the radio window under `media/lua/client/RadioCom/`.

:::flow[The path of one scripted line]
- `GameTime` every ten game minutes calls `UpdateScripts`
- Each channel moves its script along
- Every update, `RadioChannel#update` airs the next line
- `SendTransmission` then `DistributeTransmission`
- The device shows the line and fires `OnDeviceText`
- `ISRadioInteractions` applies the codes
:::

The schedule step comes from the game clock's ten-minute event. :cite[(`zombie/GameTime.java:639`)] The airing step runs on every game update. :cite[(`zombie/gameStates/IngameState.java:1563`, `zombie/radio/scripting/RadioScriptManager.java:129-133`, `zombie/radio/scripting/RadioChannel.java:226-263`)] The send and distribute steps are in `ZomboidRadio`. :cite[(`zombie/radio/ZomboidRadio.java:699-760`, `zombie/radio/ZomboidRadio.java:881-904`)]

## 3. How a channel is described in a file

A scripted channel is an XML file in `media/radio`, and it nests channels, scripts, broadcasts and lines.

The reader wants a `RootInfo` with a `Version` and a `FileGUID`, then optional `Adverts` and a `Channels` block. :cite[(`zombie/radio/RadioData.java:331-409`)] Each `ChannelEntry` has an `ID`, a `name`, a category (`cat`), a frequency (`freq`) and a `startscript`, and the channel starts that script at day 0. :cite[(`zombie/radio/RadioData.java:423-447`)] The category must be one of `Undefined`, `Radio`, `Television`, `Military`, `Amateur`, `Bandit`, `Emergency` or `Other`, and a channel is a television channel when its category is `Television`. :cite[(`zombie/radio/ChannelCategory.java:11-19`, `zombie/radio/scripting/RadioChannel.java:54`)]

- A `ScriptEntry` has an `ID`, a `name`, and `loopmin` and `loopmax` (how many times the script repeats). :cite[(`zombie/radio/RadioData.java:450-475`)]
- A `BroadcastEntry` has an `ID`, a `timestamp` and an `endstamp` (minutes from the script's start), an `isSegment` flag and an `advertCat`. :cite[(`zombie/radio/RadioData.java:477-487`)] Broadcasts in one script must not overlap, or the later one is refused. :cite[(`zombie/radio/scripting/RadioScript.java:154-179`)]
- A broadcast that is not a segment and names an advert category can get an advert before or after it: the roll is 75 in 101 to get one at all, then about half each for before and after. :cite[(`zombie/radio/RadioData.java:488-497`)]
- A `LineEntry` has an `ID`, a color (`r`, `g`, `b`) and optional `codes`; its text comes from the translation key `RD_` plus the line ID, and a `${t:N}` tag in the text sets a custom air time. :cite[(`zombie/radio/RadioData.java:499-519`, `zombie/radio/RadioData.java:555-571`)]
- An `ExitOptions` block lists what runs next: a script name, a percent `chance` and a start `delay` in days, and the chances for one script may not add up past 100. :cite[(`zombie/radio/RadioData.java:542-552`, `zombie/radio/scripting/RadioScript.java:187-201`)]

When a script's broadcasts are used up, the channel repeats it until its loop count is reached and then rolls an exit option, starting the next script after the delay. :cite[(`zombie/radio/scripting/RadioChannel.java:203-224`, `zombie/radio/scripting/RadioScript.java:135-148`)]

Vanilla's `media/radio/*.xml` files are not part of our capture of the game files, so this page does not state how many vanilla channels or scripts exist. The `.txt` translation files are matched to an XML file by GUID, and only when content translations are enabled and the language is not the default. :cite[(`zombie/radio/RadioData.java:168-204`, `zombie/radio/RadioData.java:373-392`)]

## 4. When it runs and on which side

Channels and scripts run in single player and on the server only, and a multiplayer client skips them and asks the server for the channel names.

- **Setup.** `ZomboidRadio#Init` builds the channel list on the server and in single player, and fires `OnLoadRadioScripts`. A multiplayer client sends a data request and keeps no script manager. :cite[(`zombie/radio/ZomboidRadio.java:210-258`, `zombie/iso/IsoWorld.java:2026`)] The days-since-start counter and `RADIO_SAVE.txt` (in the save's `radio/data` folder) belong to the server and single player. :cite[(`zombie/radio/ZomboidRadio.java:316-352`, `zombie/radio/ZomboidRadio.java:364-399`)]
- **On a new game** the counter starts at `(Months since the Apocalypse - 1) x 30.5` days, and the scripts are fast-forwarded to that day. :cite[(`zombie/radio/ZomboidRadio.java:259-281`, `zombie/radio/scripting/RadioScriptManager.java:71-91`)] A loaded save with no `RADIO_SAVE.txt` starts from the same head start plus the nights survived. :cite[(`zombie/radio/ZomboidRadio.java:283-297`, `zombie/radio/ZomboidRadio.java:373-375`)] The 42.21 build also ran a game-mode step here that restarted some channel scripts for the Initial Infection and Six Months Later game modes; the 42.22 code has no such step. :cite[(`zombie/radio/ZomboidRadio.java:259-281`)]
- **Every ten game minutes** each channel forgets who was listening. Then every device that is switched on and has a player in range reports that its channel has a listener (a client sends this to the server). :cite[(`zombie/radio/ZomboidRadio.java:434-460`, `zombie/radio/scripting/RadioChannel.java:219-224`, `zombie/radio/ZomboidRadio.java:906-915`)] A scripted channel only starts a new broadcast when it has a listener and nothing is airing, so with nobody listening there is no broadcast. :cite[(`zombie/radio/scripting/RadioChannel.java:143-153`)]
- **Airing.** While a broadcast airs, the channel sends one line at a time. A line with its own air time holds that long. Otherwise the counter starts at the text length divided by 10 times 60, clamped between 90 and 300, then multiplied by the channel's multiplier. The counter drops by 1.25 times the game speed on each update of the single-player or server game, so the real time depends on the update rate. If we assume 60 updates a second at normal speed (our assumption, not read from the code), that is 1.2 to 4 seconds per line at a multiplier of 1. :cite[(`zombie/radio/scripting/RadioChannel.java:226-260`)] Scripted lines go out with signal strength -1, which means every device on that frequency, at any distance. :cite[(`zombie/radio/scripting/RadioChannel.java:243-244`, `zombie/radio/ZomboidRadio.java:726-727`)]
- **Weather static.** On the server or in single player, a radio line (not TV) is scrambled by the climate's current weather interference before it is sent, and a scrambled line loses its color and its effect codes. :cite[(`zombie/radio/ZomboidRadio.java:786-793`, `zombie/radio/ZomboidRadio.java:885-894`)]
- **Reaching players in multiplayer.** The server runs the device loop, and each placed device that passes gets `OnDeviceText` fired by the server itself when the device volume is above 0 and the line has codes. :cite[(`zombie/radio/ZomboidRadio.java:740-751`)] It then sends the line to every client. :cite[(`zombie/radio/ZomboidRadio.java:898-900`)] A client hands radio lines to the radios the voice system tracks for each of its players, and TV lines to the televisions it has loaded. :cite[(`zombie/radio/ZomboidRadio.java:611-635`, `zombie/radio/ZomboidRadio.java:707-713`, `zombie/network/packets/WaveSignalPacket.java:106-113`)]
- **Radio silence flag.** After 14 days since start, the server or single player sets a `postRadioSilence` flag and tells clients. We found no code or vanilla Lua that reads that flag beyond copying it to clients, so we do not say what it changes. :cite[(`zombie/radio/ZomboidRadio.java:491-496`, `zombie/network/GameClient.java:2308-2312`)]
- **Louisville scramble.** In single player, a player north of y = 3550 turns on a permanent flag, and vanilla channels on six frequencies (200, 201, 204, 93200, 98000 and 101200) then air scrambled lines while the flag is set. :cite[(`zombie/radio/ZomboidRadio.java:83`, `zombie/radio/ZomboidRadio.java:981-1000`, `zombie/radio/scripting/RadioChannel.java:239-241`)]

### Players talking on a radio

A line a player speaks is sent out over a two-way radio they hold or stand near, and servers can mute radio for staff roles.

In single player or on a client, each new spoken line is checked against the speaker's equipped portable two-way radios that are on and not muted, and against placed two-way devices whose microphone range covers the speaker; each frequency found is sent with its device's transmit range. :cite[(`zombie/radio/ZomboidRadio.java:506-575`, `zombie/radio/ZomboidRadio.java:581-601`)] A ranged line reaches a held radio only from more than 3 squares away and inside the range. :cite[(`zombie/radio/ZomboidRadio.java:671-683`)] Beyond 90 percent of the range, the line is increasingly scrambled. :cite[(`zombie/radio/ZomboidRadio.java:762-771`)]

This check runs on a multiplayer client, not on the server, and single player skips it. Its real effect per option, as the condition reads:

- `DisableRadioStaff` (default false) blocks the Admin, GM and Moderator roles when true.
- `DisableRadioAdmin` (default true) blocks the Admin role, `DisableRadioGM` (default true) blocks the GM role, and `DisableRadioModerator` (default false) blocks the Moderator role.
- `DisableRadioOverseer` (default false) has no effect: a role that is not Admin, GM or Moderator, which includes Overseer, passes the first clause before the per-role options are read.
- `DisableRadioInvisible` (default true) blocks any role while the player is invisible.

:cite[(`zombie/radio/ZomboidRadio.java:514-523`, `zombie/network/ServerOptions.java:159-164`)]

## 5. What a heard line does

A line can carry effect codes, a comma-separated list such as `BOR-2,COO+1`, and a device with the volume up fires `OnDeviceText` for it.

The shared file `ISRadioInteractions.lua` applies the codes to each player within 5 squares of the device on the same floor, and inside or outside like the device. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:173-187`, `media/lua/shared/RadioCom/ISRadioInteractions.lua:261-279`)] A held radio reports no position (`-1, -1, -1`), so its line applies to every player the handler walks, with no range check and no inside-or-outside check; in single player that is you and any split-screen players. :cite[(`zombie/inventory/types/Radio.java:80-104`, `media/lua/shared/RadioCom/ISRadioInteractions.lua:183-187`, `media/lua/shared/RadioCom/ISRadioInteractions.lua:271-277`)] In detail:

- The file lists 15 stat codes: `ANG`, `BOR`, `END`, `FAT`, `FIT`, `HUN`, `MOR`, `STS`, `PAN`, `SAN`, `SIC`, `PAI`, `DRU`, `THI`, `UHP`. Only `BOR` (boredom) and `UHP` (unhappiness) do anything at 42.22. Those two go through their own functions, which add the amount times 5, or set it with `=`. The other 13 go through a generic function that looks up a method named `get` plus the stat name on the player's stats object, and that class has no such methods (it has `get(CharacterStat)`, `set(CharacterStat, value)`, and a few unrelated getters such as `getNicotineStress`, `getNumVisibleZombies` and `getLastEndurance`), so they are skipped. This is a gap in vanilla, not a feature. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:23-60`, `media/lua/shared/RadioCom/ISRadioInteractions.lua:92-106`, `zombie/characters/Stats.java:80-84`, `zombie/characters/Stats.java:133-162`)]
- Skill codes give experience, 50 per point handed to `addXp`: `SPR`, `LFT`, `NIM`, `SNE`, `BAA`, `BUA`, `CRP`, `COO`, `FRM`, `DOC`, `ELC`, `MTL`, `FKN`, `CRV`, `AIM`, `REL`, `FIS`, `TRA`, `FOR`, `TAI`, `MEC`, `CMB`, `SPE`, `SBU`, `LBA`, `SBA`, `MAS`, `POT`, `BLA`, `GLA`, `HUS`, `BUT` and `TRK`. No experience once the skill is at the sandbox **Maximum Media XP Level**. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:4-21`, `media/lua/shared/RadioCom/ISRadioInteractions.lua:109-147`)] That option's Java default is 3. :cite[(`zombie/SandboxOptions.java:230`)]
- `RCP=<recipe>` teaches a recipe. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:232-249`)]
- A line is used once per player: its id is stored as a known media line, and a known line does nothing again. Each code then has a cooldown of 30 per player that counts down by the game speed on every `OnTick`, on whichever side runs the handler (the server for placed devices in multiplayer), which is about half a second at normal speed if `OnTick` runs 60 times a second (our assumption), and sleeping players hear nothing. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:189-198`, `media/lua/shared/RadioCom/ISRadioInteractions.lua:223-228`, `media/lua/shared/RadioCom/ISRadioInteractions.lua:281-306`)]

On a server, the handler walks the online players; elsewhere it walks the local ones. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:261-278`)]

## 6. Weather static and the emergency broadcast

The emergency channel is the one runtime channel vanilla registers, and it rebuilds a weather forecast every game hour.

`ISDynamicRadio.lua` registers one channel, "Automated Emergency Broadcast System", in the Emergency category with a fixed id `EMRG-711984`, and the frequency is rolled once between 88000 and 108000 and remembered in the game's mod data. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:15-24`, `media/lua/server/radio/ISDynamicRadio.lua:63-83`, `zombie/radio/ZomboidRadio.java:177-188`)] `ISWeatherChannel.lua` adds itself to the hourly script list, and each hour it builds a new broadcast and sets it airing on that channel, replacing whatever was airing. :cite[(`media/lua/server/radio/ISWeatherChannel.lua:82-96`, `media/lua/server/radio/ISDynamicRadio.lua:138-153`)]

The hourly check in that script reads `hour < 120`, and `hour` is the hour of the day, so it is true every hour on every day as far as we read. :cite[(`media/lua/server/radio/ISWeatherChannel.lua:88-95`)] The broadcast is an intro line, fuzz, a power notice, a random line, fuzz, a forecast for today and tomorrow plus extremes, fuzz, a second random line, and on the helicopter day an extra fuzz roll and the helicopter line, then a last fuzz roll. :cite[(`media/lua/server/radio/ISWeatherChannel.lua:112-137`, `media/lua/server/radio/ISWeatherChannel.lua:120-134`, `media/lua/server/radio/ISWeatherChannel.lua:166-177`)]

## 7. What Lua can reach

Lua gets the radio hub, the script manager and the line classes, and it can build channels and broadcasts at runtime.

- `getZomboidRadio()` returns `ZomboidRadio`: `getScriptManager()` (server and single player only; nil on a client), `getDaysSinceStart()`, `getChannelName(freq)`, `getFullChannelList()`, `getRandomFrequency(min, max)`, `addChannelName`, `scrambleString`, `getRecordedMedia()`, `setDisableBroadcasting`. :cite[(`zombie/Lua/LuaManager.java:2942-2945`, `zombie/radio/ZomboidRadio.java:121-192`, `zombie/radio/ZomboidRadio.java:799-867`, `zombie/radio/ZomboidRadio.java:961-967`)]
- `RadioScriptManager`: `AddChannel(channel, overwrite)`, `RemoveChannel(freq)`, `getRadioChannel(uuid)`, `getChannels()`. :cite[(`zombie/radio/scripting/RadioScriptManager.java:47-69`, `zombie/radio/scripting/RadioScriptManager.java:103-119`)]
- `DynamicRadioChannel.new(name, freq, category, uuid)`, `RadioBroadCast.new(id, -1, -1)`, `RadioLine.new(text, r, g, b)` (and versions with effect codes), `channel:setAiringBroadcast(bc)`: this is how the weather channel builds a forecast every game hour. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:111`, `media/lua/server/radio/ISWeatherChannel.lua:100-101`, `zombie/radio/scripting/RadioChannel.java:278-280`)]
- Events: [OnLoadRadioScripts](/pz/build-42/modding/reference/lua-events#onloadradioscripts) `(scriptManager, isNewGame)`, fired in single player and on the server on every load; [OnDeviceText](/pz/build-42/modding/reference/lua-events#ondevicetext) `(guid, codes, x, y, z, text, device)`, with `-1, -1, -1` for a held radio. :cite[(`zombie/radio/ZomboidRadio.java:258`, `zombie/inventory/types/Radio.java:87`)] [OnRadioInteraction](/pz/build-42/modding/reference/lua-events#onradiointeraction) is registered, but the event index shows no Java or Lua code that fires it. :cite[(`zombie/Lua/LuaEventManager.java:764`)]
- Item scripts make a device out of an item of type `Radio` with `TwoWay`, `TransmitRange`, `MicRange`, `BaseVolumeRange`, `IsPortable`, `IsTelevision`, `MinChannel`, `MaxChannel`, `UsesBattery`, `IsHighTier`, `AcceptMediaType` and `NoTransmit`. :cite[(`zombie/scripting/objects/Item.java:2692-2710`, `zombie/scripting/objects/Item.java:2918-2920`, `zombie/scripting/objects/Item.java:1793-1805`)]

See [ZomboidRadio](/pz/build-42/modding/reference/lua-classes-sound-and-radio#zomboidradio), [RadioScriptManager](/pz/build-42/modding/reference/lua-classes-sound-and-radio#radioscriptmanager), [RadioChannel](/pz/build-42/modding/reference/lua-classes-sound-and-radio#radiochannel), [DynamicRadioChannel](/pz/build-42/modding/reference/lua-classes-sound-and-radio#dynamicradiochannel), [RadioBroadCast](/pz/build-42/modding/reference/lua-classes-sound-and-radio#radiobroadcast), [RadioLine](/pz/build-42/modding/reference/lua-classes-sound-and-radio#radioline), [DeviceData](/pz/build-42/modding/reference/lua-classes-sound-and-radio#devicedata), [IsoWaveSignal](/pz/build-42/modding/reference/lua-classes-world-3#isowavesignal) and [Radio](/pz/build-42/modding/reference/lua-classes-items#radio).

## 8. Adding a channel

There are two ways to add a channel, and they behave differently.

**A scripted channel (XML).** Put an XML file in your mod's `media/radio` folder (the common folder or the version folder), with translations as `.txt` files beside it. The loader reads vanilla's files first, then each mod's, and if the common and version folders both hold a file at the same relative path, the common one is the one read. :cite[(`zombie/radio/RadioData.java:102-143`)] When two channels share a frequency, a mod channel replaces a vanilla one, but between two mods the one read first keeps the frequency and the other is dropped, with a message only in the radio debug log. :cite[(`zombie/radio/ZomboidRadio.java:240-256`)]

**A runtime channel (Lua).** Vanilla's `ISDynamicRadio.lua` registers the channels in the global `DynamicRadio.channels` on every load, not only on a new game: the new-game branch in that file is commented out. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:34-61`, `media/lua/server/radio/ISDynamicRadio.lua:63-83`)] A frequency given as `{min, max}` is rolled once and remembered in the game's mod data (`dynamicRadio`), matched by `uuid`. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:63-83`)] Each hour, every entry in `DynamicRadio.scripts` whose `channelUUID` matches gets `OnEveryHour(channel, gameTime, radio)`, which is where you build and air a broadcast. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:138-157`)] Add your channel and your script to those tables from a server Lua file that starts with `require "radio/ISDynamicRadio"`, because that file creates `DynamicRadio` from scratch when it runs. Registration uses `AddChannel(channel, false)`, so a frequency that is already taken is refused. :cite[(`media/lua/server/radio/ISDynamicRadio.lua:12`, `media/lua/server/radio/ISDynamicRadio.lua:117`, `zombie/radio/scripting/RadioScriptManager.java:103-106`)]

## 9. What a mod can and cannot change

A mod can add and replace channels and react to every line, but a new effect code means replacing a vanilla file.

**Can:** add scripted channels and replace vanilla ones, add runtime channels, write broadcasts every hour from Lua, add radio and TV items, react to every line with `OnDeviceText`, mute all broadcasts with `setDisableBroadcasting(true)`. :cite[(`zombie/radio/ZomboidRadio.java:965-967`, `zombie/radio/scripting/RadioChannel.java:237`)]

**Cannot, without replacing a vanilla file:** add a new effect code. The `Interactions` table in `ISRadioInteractions.lua` is a local, so nothing outside that file can add to it. A mod that wants a custom effect can listen to `OnDeviceText` and parse its own codes from the line. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:90`)]

Traps in the device loop, read from the 42.22 code (the decompiled text of the loop matches the 42.21 capture, and the 42.21 round also checked it against the bytecode):

- **One device playing a tape or disc can block a broadcast for the devices after it.** While handing a line to placed devices, the loop meets a device that is on and of the right kind (radio for radio lines, TV for TV lines) but is playing media or has `NoTransmit` set, and it leaves the whole method, not just that device. Every device later in the registry misses that line, whatever channel it is tuned to. This loop handles radio and TV lines in single player, the devices the server holds, and TV lines on a client. :cite[(`zombie/radio/ZomboidRadio.java:716-723`)]
- **A device in line with a transmitter does not hear it.** For a transmission with a range (a player on a two-way radio), a placed device on the same row or the same column of squares as the source is skipped. Scripted broadcasts have no range and are not affected. A held radio has its own rule: it receives a ranged transmission only from more than 3 squares away. :cite[(`zombie/radio/ZomboidRadio.java:724-731`, `zombie/radio/ZomboidRadio.java:679-683`)]

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

- **`getScriptManager()` is nil on a multiplayer client.** Channel code belongs on the server or in single player; `OnLoadRadioScripts` never fires on a client. :cite[(`zombie/radio/ZomboidRadio.java:121-123`, `zombie/radio/ZomboidRadio.java:223-230`, `zombie/radio/ZomboidRadio.java:258`)]
- **Playing devices make noise.** A device that is on with the volume up adds a repeating world sound that zombies hear, unless it is a held device with headphones. :cite[(`zombie/radio/devices/DeviceData.java:855-870`, `zombie/radio/devices/DeviceData.java:922-932`)]

:::callout[How we know]{kind=proof}
Everything above was read from the 42.22 decompiled code (capture B42_3d39148846) and the vanilla Lua in the same capture. Not tested in a running game: the device-loop traps (the test is a new single-player game where you place a radio and play a CD in it, then place two more radios on the same scripted channel and see whether they stop receiving lines while the CD plays); and in multiplayer, which copy of a stat change sticks when the handler can run for the same line on the server and on a client (the test is to tune a radio to a skill channel on a dedicated server, listen to one cooking line, and compare the Cooking experience in the server's log with what the client shows). The vanilla `media/radio` XML files are not in our capture, so the channel and script counts are not stated.
:::

## 10. Where to go next

- [Custom or dynamic radio channel](/pz/build-42/modding/cookbook/radio-channel), the cookbook skeleton for a runtime channel.
- [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).
- [The world map](/pz/build-42/modding/engine/the-world-map), another system where client and server keep separate copies.
