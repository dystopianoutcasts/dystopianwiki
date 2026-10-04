---
slug: lua-classes-sound-and-radio
title: 'Lua Classes: Sound and radio (Build 42.21)'
game: pz
version: build-42
section: modding
category: reference
difficulty: advanced
tags:
  - lua-api
  - reference
  - generated
  - classes
excerpt: 'The exposed sound and radio classes of Build 42.21: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Sound and radio

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Sounds, the sounds zombies hear, music, and the radio and television broadcasts.

This page holds 47 classes and 859 methods, from the packages `fmod.fmod`, `zombie`, `zombie.audio`, `zombie.radio`, `zombie.radio.StorySounds`, `zombie.radio.devices`, `zombie.radio.media`, `zombie.radio.scripting`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### EmitterType

`fmod.fmod.EmitterType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `EmitterType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): EmitterType`
- `values(): EmitterType[]`

Enum values (read as `EmitterType.VALUE`): `Extra`, `Footstep`, `Voice`.

### FMODAudio

`fmod.fmod.FMODAudio`, class.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `isPlaying(): boolean`
- `pause(): void`
- `setName(String name): void`
- `setVolume(float volume): void`
- `start(): void`
- `stop(): void`

Constructors: `FMODAudio.new(BaseSoundEmitter emitter)`.

### FMODDebugEventPlayer

`fmod.fmod.FMODDebugEventPlayer`, class.

Methods, called as `obj:name(...)`:

- `clearParameterValue(int index): void`
- `getGlobalParameterValue(String eventPath, int index): float`
- `getParameterCount(String eventPath): int`
- `getParameterName(String eventPath, int index): String`
- `getParameterValue(int index): float`
- `initParameterValues(String eventPath): void`
- `isGlobalParameter(String eventPath, int index): boolean`
- `isPlaying(): boolean`
- `play(String eventPath): void`
- `setDurationMillis(long ms): void`
- `setFollowPlayer(boolean bFollowPlayer): void`
- `setLoop(boolean bLoop): void`
- `setParameterValue(int index, float value): void`
- `setTimelinePosition(int ms): void`
- `setVolume(float volume): void`
- `stop(): void`
- `stop(boolean bTriggerCue): void`
- `update(): void`

Constructors: `FMODDebugEventPlayer.new()`.

### FMODSoundBank

`fmod.fmod.FMODSoundBank`, class. Extends `BaseSoundBank`.

Methods, called as `obj:name(...)`:

- `addFootstep(String alias, String grass, String wood, String concrete, String upstairs): void`
- `addVoice(String alias, String sound, float priority): void`
- `getFootstep(String alias): FMODFootstep`
- `getVoice(String alias): FMODVoice`

Constructors: `FMODSoundBank.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: BaseSoundBank`.

### FMODSoundEmitter

`fmod.fmod.FMODSoundEmitter`, class. Extends [BaseSoundEmitter](#basesoundemitter).

Methods, called as `obj:name(...)`:

- `addParameter(FMODParameter parameter): void`
- `clearParameters(): void`
- `hasSoundsToStart(): boolean`
- `hasSustainPoints(long soundRef): boolean`
- `isEmpty(): boolean`
- `isPlaying(String alias): boolean`
- `isPlaying(long soundRef): boolean`
- `isUsingParameter(long handle, String parameterName): boolean`
- `playAmbientLoopedImpl(String file): long`
- `playAmbientSound(String name): long`
- `playClip(GameSoundClip clip, IsoObject parent): long`
- `playSound(String file): long`
- `playSound(String file, boolean doWorldSound): long`
- `playSound(String file, int x, int y, int z): long`
- `playSound(String file, IsoGameCharacter character): long`
- `playSound(String file, IsoGridSquare square): long`
- `playSound(String file, IsoObject parent): long`
- `playSoundImpl(String file, boolean doWorldSound, IsoObject parent): long`
- `playSoundImpl(String file, IsoGridSquare square): long`
- `playSoundImpl(String file, IsoObject parent): long`
- `playSoundLooped(String file): long`
- `playSoundLoopedImpl(String file): long`
- `randomStart(): void`
- `restart(long handle): boolean`
- `set3D(long soundRef, boolean is3D): void`
- `setParameterValue(long soundRef, FMOD_STUDIO_PARAMETER_DESCRIPTION parameterDescription, float value): void`
- `setParameterValueByName(long soundRef, String parameterName, float value): void`
- `setPitch(long soundRef, float pitch): void`
- `setPlayRemoteEvents(boolean remote): void`
- `setPos(float x, float y, float z): void`
- `setTimelinePosition(long soundRef, String positionName): void`
- `setVolume(long soundRef, float volume): void`
- `setVolumeAll(float volume): void`
- `stopAll(): void`
- `stopOrTriggerSound(long handle): void`
- `stopOrTriggerSoundByName(String name): void`
- `stopOrTriggerSoundLocal(long soundRef): void`
- `stopSound(long soundRef): int`
- `stopSoundByName(String name): int`
- `stopSoundDelayRelease(long soundRef): int`
- `stopSoundLocal(long soundRef): void`
- `tick(): void`
- `triggerCue(long soundRef): void`

Static functions, called as `FMODSoundEmitter.name(...)`:

- `update(): void`

Constructors: `FMODSoundEmitter.new()`.

### AmbientStreamManager

`zombie.AmbientStreamManager`, class. Extends [BaseAmbientStreamManager](#baseambientstreammanager).

Methods, called as `obj:name(...)`:

- `addAmbient(String name, int x, int y, int radius, float volume): void`
- `addAmbientEmitter(float x, float y, int z, String name): void`
- `addBlend(String name, float vol, boolean bIndoors, boolean bRain, boolean bNight, boolean bDay): void`
- `addDaytimeAmbientEmitter(float x, float y, int z, String name): void`
- `addRandomAmbient(): void`
- `addRandomAmbient(boolean force): void`
- `checkHaveElectricity(): void`
- `doAlarm(RoomDef room): void`
- `doGunEvent(): void`
- `doOneShotAmbients(): void`
- `handleThunderEvent(int x, int y): void`
- `init(): void`
- `isParameterInsideTrue(): boolean`
- `load(ByteBuffer bb, int worldVersion): void`
- `save(ByteBuffer bb): void`
- `stop(): void`
- `update(): void`

Static functions, called as `AmbientStreamManager.name(...)`:

- `getInstance(): BaseAmbientStreamManager`
- `getNearestBuilding(float px, float py): BuildingDef`

Constructors: `AmbientStreamManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: BaseAmbientStreamManager`, `maxAmbientCount: int`, `maxRange: float`, `oneInAmbienceChance: int`.

### BaseSoundEmitter

`zombie.audio.BaseSoundEmitter`, abstract class.

Methods, called as `obj:name(...)`:

- `hasSoundsToStart(): boolean`
- `hasSustainPoints(long): boolean`
- `isEmpty(): boolean`
- `isPlaying(String var1): boolean`
- `isPlaying(long): boolean`
- `isUsingParameter(long var1, String var3): boolean`
- `playAmbientLoopedImpl(String var1): long`
- `playAmbientSound(String): long`
- `playClip(GameSoundClip var1, IsoObject var2): long`
- `playSound(String): long`
- `playSound(String var1, boolean var2): long`
- `playSound(String, int, int, int): long`
- `playSound(String var1, IsoGameCharacter var2): long`
- `playSound(String var1, IsoGridSquare var2): long`
- `playSound(String var1, IsoObject var2): long`
- `playSoundImpl(String, boolean, IsoObject): long`
- `playSoundImpl(String, IsoGridSquare): long`
- `playSoundImpl(String, IsoObject): long`
- `playSoundLooped(String var1): long`
- `playSoundLoopedImpl(String): long`
- `randomStart(): void`
- `restart(long): boolean`
- `set3D(long, boolean): void`
- `setParameterValue(long var1, FMOD_STUDIO_PARAMETER_DESCRIPTION var3, float var4): void`
- `setParameterValueByName(long, String, float): void`
- `setPitch(long var1, float var3): void`
- `setPlayRemoteEvents(boolean var1): void`
- `setPos(float, float, float): void`
- `setTimelinePosition(long, String): void`
- `setVolume(long, float): void`
- `setVolumeAll(float): void`
- `stopAll(): void`
- `stopOrTriggerSound(long): void`
- `stopOrTriggerSoundByName(String var1): void`
- `stopOrTriggerSoundLocal(long): void`
- `stopSound(long var1): int`
- `stopSoundByName(String var1): int`
- `stopSoundDelayRelease(long): int`
- `stopSoundLocal(long var1): void`
- `tick(): void`
- `triggerCue(long var1): void`

Constructors: `BaseSoundEmitter.new()`.

### DummySoundBank

`zombie.audio.DummySoundBank`, class. Extends `BaseSoundBank`.

Methods, called as `obj:name(...)`:

- `addFootstep(String alias, String grass, String wood, String concrete, String upstairs): void`
- `addVoice(String alias, String sound, float priority): void`
- `getFootstep(String alias): FMODFootstep`
- `getVoice(String alias): FMODVoice`

Constructors: `DummySoundBank.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: BaseSoundBank`.

### DummySoundEmitter

`zombie.audio.DummySoundEmitter`, class. Extends [BaseSoundEmitter](#basesoundemitter).

Methods, called as `obj:name(...)`:

- `hasSoundsToStart(): boolean`
- `hasSustainPoints(long handle): boolean`
- `isEmpty(): boolean`
- `isPlaying(String alias): boolean`
- `isPlaying(long channel): boolean`
- `isUsingParameter(long handle, String parameterName): boolean`
- `playAmbientLoopedImpl(String file): long`
- `playAmbientSound(String name): long`
- `playClip(GameSoundClip clip, IsoObject parent): long`
- `playSound(String file): long`
- `playSound(String file, boolean doWorldSound): long`
- `playSound(String file, int x, int y, int z): long`
- `playSound(String file, IsoGameCharacter character): long`
- `playSound(String file, IsoGridSquare square): long`
- `playSound(String file, IsoObject parent): long`
- `playSoundImpl(String file, boolean doWorldSound, IsoObject parent): long`
- `playSoundImpl(String file, IsoGridSquare square): long`
- `playSoundImpl(String file, IsoObject parent): long`
- `playSoundLooped(String file): long`
- `playSoundLoopedImpl(String file): long`
- `randomStart(): void`
- `restart(long handle): boolean`
- `set3D(long handle, boolean is3D): void`
- `setParameterValue(long handle, FMOD_STUDIO_PARAMETER_DESCRIPTION parameterDescription, float value): void`
- `setParameterValueByName(long handle, String parameterName, float value): void`
- `setPitch(long handle, float volume): void`
- `setPlayRemoteEvents(boolean remote): void`
- `setPos(float x, float y, float z): void`
- `setTimelinePosition(long handle, String positionName): void`
- `setVolume(long handle, float volume): void`
- `setVolumeAll(float volume): void`
- `stopAll(): void`
- `stopOrTriggerSound(long handle): void`
- `stopOrTriggerSoundByName(String name): void`
- `stopOrTriggerSoundLocal(long handle): void`
- `stopSound(long channel): int`
- `stopSoundByName(String name): int`
- `stopSoundDelayRelease(long channel): int`
- `stopSoundLocal(long handle): void`
- `tick(): void`
- `triggerCue(long handle): void`

Constructors: `DummySoundEmitter.new()`.

### GameSound

`zombie.audio.GameSound`, class.

Methods, called as `obj:name(...)`:

- `getCategory(): String`
- `getMasterName(): String`
- `getMaxDistanceOfClips(): float`
- `getName(): String`
- `getRandomClip(): GameSoundClip`
- `getUserVolume(): float`
- `isLooped(): boolean`
- `numClipsUsingParameter(boolean remote, String parameterName): int`
- `reset(): void`
- `setUserVolume(float gain): void`

Constructors: `GameSound.new()`.

### GameSoundClip

`zombie.audio.GameSoundClip`, class.

Methods, called as `obj:name(...)`:

- `checkReloaded(): GameSoundClip`
- `getEffectiveVolume(): float`
- `getEffectiveVolumeInMenu(): float`
- `getEvent(): String`
- `getEventDescription(boolean remote): FMOD_STUDIO_EVENT_DESCRIPTION`
- `getFile(): String`
- `getMaxDistance(): float`
- `getMinDistance(): float`
- `getPitch(): float`
- `getVolume(): float`
- `hasMaxDistance(): boolean`
- `hasMinDistance(): boolean`
- `hasParameter(boolean remote, FMOD_STUDIO_PARAMETER_DESCRIPTION parameterDescription): boolean`
- `hasSustainPoints(boolean remote): boolean`
- `isStopImmediate(): boolean`

Constructors: `GameSoundClip.new(GameSound gameSound)`.

Static fields (a copy of the value taken when the class is exposed): `INIT_FLAG_DISTANCE_MAX: short`, `INIT_FLAG_DISTANCE_MIN: short`, `INIT_FLAG_STOP_IMMEDIATE: short`.

### MusicIntensityConfig

`zombie.audio.MusicIntensityConfig`, class.

Methods, called as `obj:name(...)`:

- `checkHealthPanelVisible(IsoGameCharacter character): void`
- `initEvents(KahluaTableImpl eventsTable): void`
- `restoreToFullHealth(IsoGameCharacter character): void`
- `triggerEvent(String id, MusicIntensityEvents mie): MusicIntensityEvent`

Static functions, called as `MusicIntensityConfig.name(...)`:

- `getInstance(): MusicIntensityConfig`

Constructors: `MusicIntensityConfig.new()`.

### MusicIntensityEvent

`zombie.audio.MusicIntensityEvent`, class.

Methods, called as `obj:name(...)`:

- `getDuration(): long`
- `getElapsedTime(): long`
- `getId(): String`
- `getIntensity(): float`
- `setElapsedTime(long milliseconds): void`

Constructors: `MusicIntensityEvent.new(String label, float intensity, long durationMs)`.

### MusicIntensityEvents

`zombie.audio.MusicIntensityEvents`, class.

Methods, called as `obj:name(...)`:

- `addEvent(String id, float intensity, long durationMS, boolean bMultiple): MusicIntensityEvent`
- `clear(): void`
- `findEventById(String id): MusicIntensityEvent`
- `getEventByIndex(int index): MusicIntensityEvent`
- `getEventCount(): int`
- `getIntensity(): float`
- `update(): void`

Constructors: `MusicIntensityEvents.new()`.

### MusicThreatConfig

`zombie.audio.MusicThreatConfig`, class.

Methods, called as `obj:name(...)`:

- `getStatusCount(): int`
- `getStatusIdByIndex(int index): String`
- `getStatusIntensity(String id): float`
- `getStatusIntensityByIndex(int index): float`
- `getStatusIntensityOverride(String id): float`
- `initStatuses(KahluaTableImpl statusesTable): void`
- `isStatusIntensityOverridden(String id): boolean`
- `setStatusIntensityOverride(String id, float intensity): void`

Static functions, called as `MusicThreatConfig.name(...)`:

- `getInstance(): MusicThreatConfig`

Constructors: `MusicThreatConfig.new()`.

### MusicThreatStatus

`zombie.audio.MusicThreatStatus`, class.

Methods, called as `obj:name(...)`:

- `getId(): String`
- `getIntensity(): float`
- `setIntensity(float value): void`

Constructors: `MusicThreatStatus.new(String label, float intensity)`.

### MusicThreatStatuses

`zombie.audio.MusicThreatStatuses`, class.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `findStatusById(String id): MusicThreatStatus`
- `getIntensity(): float`
- `getStatusByIndex(int index): MusicThreatStatus`
- `getStatusCount(): int`
- `setStatus(String id, float intensity): MusicThreatStatus`
- `update(): void`

Constructors: `MusicThreatStatuses.new(IsoPlayer player)`.

### BaseAmbientStreamManager

`zombie.BaseAmbientStreamManager`, abstract class.

Methods, called as `obj:name(...)`:

- `addAmbient(String, int, int, int, float): void`
- `addAmbientEmitter(float var1, float var2, int var3, String var4): void`
- `addBlend(String, float, boolean, boolean, boolean, boolean): void`
- `addDaytimeAmbientEmitter(float, float, int, String): void`
- `checkHaveElectricity(): void`
- `doAlarm(RoomDef): void`
- `doGunEvent(): void`
- `doOneShotAmbients(): void`
- `handleThunderEvent(int, int): void`
- `init(): void`
- `isParameterInsideTrue(): boolean`
- `load(ByteBuffer, int): void`
- `save(ByteBuffer var1): void`
- `stop(): void`
- `update(): void`

Constructors: `BaseAmbientStreamManager.new()`.

### DummySoundManager

`zombie.DummySoundManager`, class. Extends `BaseSoundManager`.

Methods, called as `obj:name(...)`:

- `BlendThenStart(Audio musicTrack, float f, String prefMusic): Audio`
- `BlendVolume(Audio audio, float targetVolume): void`
- `BlendVolume(Audio audio, float targetVolume, float blendSpeedAlpha): void`
- `CacheSound(String file): void`
- `CheckDoMusic(): void`
- `DoMusic(String name, boolean bLoop): void`
- `FadeOutMusic(String name, int milli): void`
- `IsMusicPlaying(): boolean`
- `PlayAsMusic(String name, Audio musicTrack, boolean loop, float volume): void`
- `PlayAsMusic(String name, Audio musicTrack, float volume, boolean bloop): void`
- `PlayJukeboxSound(String name, boolean loop, float maxGain): Audio`
- `PlayMusic(String n, String name, boolean loop, float maxGain): Audio`
- `PlaySound(String name, boolean loop, float maxGain): Audio`
- `PlaySound(String name, boolean loop, float pitchVar, float maxGain): Audio`
- `PlaySoundEvenSilent(String name, boolean loop, float maxGain): Audio`
- `PlaySoundWav(String name, boolean loop, float maxGain): Audio`
- `PlaySoundWav(String name, boolean loop, float maxGain, float pitchVar): Audio`
- `PlaySoundWav(String name, int variations, boolean loop, float maxGain): Audio`
- `PlayWorldSound(String name, boolean loop, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSound(String name, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSound(String name, IsoGridSquare source, float pitchVar, float radius, float maxGain, int choices, boolean ignoreOutside): Audio`
- `PlayWorldSoundImpl(String name, boolean loop, int sx, int sy, int sz, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSoundWav(String name, boolean loop, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSoundWav(String name, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSoundWav(String name, IsoGridSquare source, float pitchVar, float radius, float maxGain, int choices, boolean ignoreOutside): void`
- `PlayWorldSoundWavImpl(String name, boolean loop, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PrepareMusic(String name): Audio`
- `Purge(): void`
- `Start(Audio musicTrack, float f, String prefMusic): Audio`
- `StopMusic(): void`
- `StopSound(Audio soundEffect): void`
- `Update(): void`
- `debugScriptSounds(): void`
- `dumpEventInstancesToTextFile(): void`
- `getAmbientPieces(): ArrayList<Audio>`
- `getAmbientVolume(): float`
- `getCurrentMusicLibrary(): String`
- `getCurrentMusicName(): String`
- `getMusicPosition(): float`
- `getMusicVolume(): float`
- `getSoundVolume(): float`
- `getVehicleEngineVolume(): float`
- `isListenerInRange(float x, float y, float range): boolean`
- `isPlayingMusic(): boolean`
- `isPlayingUISound(String name): boolean`
- `isPlayingUISound(long eventInstance): boolean`
- `isRemastered(): boolean`
- `pauseSoundAndMusic(): void`
- `pauseSoundAndMusic(boolean bOptionallyKeepMusicPlaying): void`
- `playAmbient(String name): void`
- `playDamageSound(IsoGridSquare isoGridSquare, MaterialType materialType): void`
- `playDestructionSound(IsoGridSquare isoGridSquare, MaterialType materialType): void`
- `playImpactSound(IsoGridSquare isoGridSquare, AmmoType ammoType): void`
- `playImpactSound(IsoGridSquare isoGridSquare, AmmoType ammoType, MaterialType materialType): void`
- `playMusic(String name): void`
- `playMusicNonTriggered(String name, float gain): void`
- `playNightAmbient(String choice): void`
- `playUISound(String name): long`
- `registerEmitter(BaseSoundEmitter emitter): void`
- `resumeSoundAndMusic(): void`
- `setAmbientVolume(float volume): void`
- `setMusicState(String stateName): void`
- `setMusicVolume(float volume): void`
- `setMusicWakeState(IsoPlayer player, String stateName): void`
- `setSoundVolume(float volume): void`
- `setVehicleEngineVolume(float volume): void`
- `stop(): void`
- `stopMusic(String name): void`
- `stopUISound(long eventInstance): void`
- `unregisterEmitter(BaseSoundEmitter emitter): void`
- `update1(): void`
- `update2(): void`
- `update3(): void`
- `update3D(): void`
- `update4(): void`

Constructors: `DummySoundManager.new()`.

### GameSounds

`zombie.GameSounds`, class.

Static functions, called as `GameSounds.name(...)`:

- `OnReloadSound(GameSoundScript scriptSound): void`
- `Reset(): void`
- `ScriptsLoaded(): void`
- `addSound(GameSound sound): void`
- `fix3DListenerPosition(boolean inMenu): void`
- `getCategories(): ArrayList<String>`
- `getOrCreateSound(String name): GameSound`
- `getSound(String name): GameSound`
- `getSoundsInCategory(String category): ArrayList<GameSound>`
- `isKnownSound(String name): boolean`
- `isPreviewPlaying(): boolean`
- `loadINI(): void`
- `previewSound(String name): void`
- `saveINI(): void`
- `stopPreview(): void`

Constructors: `GameSounds.new()`.

Static fields (a copy of the value taken when the class is exposed): `VCA_VOLUME: boolean`, `VERSION: int`, `soundIsPaused: boolean`.

### ChannelCategory

`zombie.radio.ChannelCategory`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ChannelCategory.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ChannelCategory`
- `values(): ChannelCategory[]`

Enum values (read as `ChannelCategory.VALUE`): `Amateur`, `Bandit`, `Emergency`, `Military`, `Other`, `Radio`, `Television`, `Undefined`.

### DeviceData

`zombie.radio.devices.DeviceData`, class.

Methods, called as `obj:name(...)`:

- `StartPlayMedia(): void`
- `StopPlayMedia(): void`
- `TriggerPlayerListening(boolean listening): void`
- `addBattery(DrainableComboItem bat): void`
- `addEmergencyChannel(): void`
- `addHeadphones(InventoryItem headphones, ItemContainer container): void`
- `addHeadphonesToInventory(ItemContainer inventory): void`
- `addMediaItem(InventoryItem media): void`
- `canBePoweredHere(): boolean`
- `canPlayerRemoteInteract(IsoGameCharacter character): boolean`
- `cleanSoundsAndEmitter(): void`
- `cloneDevicePresets(DevicePresets p): void`
- `doReceiveMPSignal(float distance): void`
- `doReceiveSignal(int distance): void`
- `generatePresets(): void`
- `getBaseVolumeRange(): float`
- `getBattery(ItemContainer inventory): void`
- `getChannel(): int`
- `getClone(): DeviceData`
- `getDeviceName(): String`
- `getDevicePresets(): DevicePresets`
- `getDeviceSoundVolumeRange(): int`
- `getDeviceVolume(): float`
- `getDeviceVolumeRange(): int`
- `getEmitter(): BaseSoundEmitter`
- `getFMODParameters(): FMODParameterList`
- `getHasBattery(): boolean`
- `getHeadphoneType(): int`
- `getIsBatteryPowered(): boolean`
- `getIsHighTier(): boolean`
- `getIsPortable(): boolean`
- `getIsTelevision(): boolean`
- `getIsTurnedOn(): boolean`
- `getIsTwoWay(): boolean`
- `getIsoObject(): IsoObject`
- `getLastRecordedDistance(): int`
- `getMaxChannelRange(): int`
- `getMediaData(): MediaData`
- `getMediaIndex(): short`
- `getMediaType(): byte`
- `getMicIsMuted(): boolean`
- `getMicRange(): int`
- `getMinChannelRange(): int`
- `getParent(): WaveSignalDevice`
- `getPower(): float`
- `getTransmitRange(): int`
- `getUseDelta(): float`
- `hasMedia(): boolean`
- `isEmergencyBroadcast(): boolean`
- `isInventoryDevice(): boolean`
- `isIsoDevice(): boolean`
- `isNoTransmit(): boolean`
- `isPlayingMedia(): boolean`
- `isReceivingSignal(): boolean`
- `isTelevision(): boolean`
- `isVehicleDevice(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean net): void`
- `playSound(String soundname, float volume, boolean transmit): void`
- `playSoundLocal(String soundname, boolean useDeviceVolume): void`
- `playSoundSend(String soundname, boolean useDeviceVolume): void`
- `receiveDeviceDataStatePacket(ByteBufferReader bb, UdpConnection ignoreConnection): void`
- `removeMediaItem(ItemContainer inventory): void`
- `save(ByteBuffer output, boolean net): void`
- `setBaseVolumeRange(float f): void`
- `setChannel(int c): void`
- `setChannel(int chan, boolean setislistening): void`
- `setChannelRaw(int chan): void`
- `setDeviceName(String name): void`
- `setDevicePresets(DevicePresets p): void`
- `setDeviceVolume(float f): void`
- `setDeviceVolumeRaw(float f): void`
- `setHasBattery(boolean b): void`
- `setHeadphoneType(int i): void`
- `setInitialPower(): void`
- `setIsBatteryPowered(boolean b): void`
- `setIsHighTier(boolean b): void`
- `setIsPortable(boolean b): void`
- `setIsTelevision(boolean b): void`
- `setIsTurnedOn(boolean b): void`
- `setIsTwoWay(boolean b): void`
- `setMaxChannelRange(int i): void`
- `setMediaIndex(short mediaIndex): void`
- `setMediaType(byte mediaType): void`
- `setMicIsMuted(boolean b): void`
- `setMicRange(int i): void`
- `setMinChannelRange(int i): void`
- `setNoTransmit(boolean noTransmit): void`
- `setParent(WaveSignalDevice p): void`
- `setPower(float p): void`
- `setRandomChannel(): void`
- `setTransmitRange(int range): void`
- `setTurnedOnRaw(boolean b): void`
- `setUseDelta(float f): void`
- `startEvent(long eventInstance, GameSoundClip clip, boolean remote, BitSet parameterSet): void`
- `stopEvent(long eventInstance, GameSoundClip clip, boolean remote, BitSet parameterSet): void`
- `stopOrTriggerSoundByName(String soundName): void`
- `transmitBatteryChange(): void`
- `transmitBatteryChangeServer(): void`
- `transmitPresets(): void`
- `update(boolean isIso, boolean playerInRange): void`
- `updateEvent(long eventInstance, GameSoundClip clip): void`
- `updateMediaPlaying(): void`
- `updateSimple(): void`

Constructors: `DeviceData.new()`, `DeviceData.new(WaveSignalDevice parent)`.

### DevicePresets

`zombie.radio.devices.DevicePresets`, class.

Methods, called as `obj:name(...)`:

- `addPreset(String name, int frequency): void`
- `clearPresets(): void`
- `getMaxPresets(): int`
- `getPresetFreq(int id): int`
- `getPresetName(int id): String`
- `getPresets(): ArrayList<PresetEntry>`
- `getPresetsLua(): KahluaTable`
- `load(ByteBuffer input, int worldVersion, boolean net): void`
- `removePreset(int id): void`
- `save(ByteBuffer output, boolean net): void`
- `setMaxPresets(int m): void`
- `setPreset(int id, String name, int frequency): void`
- `setPresetFreq(int id, int frequency): void`
- `setPresetName(int id, String name): void`
- `setPresets(ArrayList<PresetEntry> p): void`

Constructors: `DevicePresets.new()`, `DevicePresets.new(DevicePresets other)`.

### PresetEntry

`zombie.radio.devices.PresetEntry`, class.

Methods, called as `obj:name(...)`:

- `getFrequency(): int`
- `getName(): String`
- `setFrequency(int f): void`
- `setName(String n): void`

Constructors: `PresetEntry.new()`, `PresetEntry.new(String n, int f)`, `PresetEntry.new(PresetEntry other)`.

### WaveSignalDevice

`zombie.radio.devices.WaveSignalDevice`, interface.

Methods, called as `obj:name(...)`:

- `AddDeviceText(String var1, float var2, float var3, float var4, String var5, String var6, int var7): void`
- `AddDeviceText(IsoPlayer player, String line, float r, float g, float b, String guid, String codes, int distance): void`
- `HasPlayerInRange(): boolean`
- `getDelta(): float`
- `getDeviceData(): DeviceData`
- `getSquare(): IsoGridSquare`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `setDelta(float): void`
- `setDeviceData(DeviceData): void`

### MediaData

`zombie.radio.media.MediaData`, class.

Methods, called as `obj:name(...)`:

- `addLine(String text, float r, float g, float b, String codes): void`
- `getAuthorEN(): String`
- `getCategory(): String`
- `getExtraEN(): String`
- `getId(): String`
- `getIndex(): short`
- `getIndexForLua(): double`
- `getLine(int index): MediaData.MediaLineData`
- `getLineCount(): int`
- `getMediaType(): byte`
- `getSpawning(): int`
- `getSubtitleEN(): String`
- `getTitleEN(): String`
- `getTranslatedAuthor(): String`
- `getTranslatedExtra(): String`
- `getTranslatedItemDisplayName(): String`
- `getTranslatedSubTitle(): String`
- `getTranslatedTitle(): String`
- `hasAuthor(): boolean`
- `hasExtra(): boolean`
- `hasSubTitle(): boolean`
- `hasTitle(): boolean`
- `setAuthor(String author): void`
- `setExtra(String extra): void`
- `setSubtitle(String subtitle): void`
- `setTitle(String title): void`

Constructors: `MediaData.new(String id, String itemDisplayName, int spawning)`.

### MediaData.MediaLineData

`zombie.radio.media.MediaData.MediaLineData`, class.

Methods, called as `obj:name(...)`:

- `getB(): float`
- `getCodes(): String`
- `getColor(): Color`
- `getG(): float`
- `getR(): float`
- `getTextGuid(): String`
- `getTranslatedText(): String`

Constructors: `MediaData.MediaLineData.new(String text, float r, float g, float b, String codes)`.

### RecordedMedia

`zombie.radio.media.RecordedMedia`, class.

Methods, called as `obj:name(...)`:

- `getAllMediaForCategory(String category): ArrayList<MediaData>`
- `getAllMediaForType(byte type): ArrayList<MediaData>`
- `getCategories(): ArrayList<String>`
- `getIndexForMediaData(MediaData data): short`
- `getMediaData(String id): MediaData`
- `getMediaDataFromIndex(short index): MediaData`
- `getRandomFromCategory(String cat): MediaData`
- `handleLegacyListenedLines(IsoPlayer player): void`
- `hasListenedToAll(IsoPlayer player, MediaData mediaData): boolean`
- `hasListenedToLine(IsoPlayer player, String guid): boolean`
- `init(): void`
- `load(): void`
- `register(String category, String id, String itemDisplayName, int spawning): MediaData`
- `save(): void`
- `sendRequestData(ByteBuffer bb): void`

Static functions, called as `RecordedMedia.name(...)`:

- `getMediaTypeForCategory(String category): byte`
- `receiveRequestData(ByteBufferReader bb): void`
- `toAscii(String string): String`

Constructors: `RecordedMedia.new()`.

Static fields (a copy of the value taken when the class is exposed): `SAVE_FILE: String`, `VERSION: int`, `VERSION1: int`, `VERSION2: int`, `disableLineLearning: boolean`.

### RadioAPI

`zombie.radio.RadioAPI`, class.

Methods, called as `obj:name(...)`:

- `getChannels(String category): KahluaTable`

Static functions, called as `RadioAPI.name(...)`:

- `getInstance(): RadioAPI`
- `hasInstance(): boolean`
- `timeStampToDays(int stamp): int`
- `timeStampToHours(int stamp): int`
- `timeStampToMinutes(int stamp): int`
- `timeToTimeStamp(int days, int hours, int minutes): int`

### RadioData

`zombie.radio.RadioData`, class.

Methods, called as `obj:name(...)`:

- `getRadioChannels(): ArrayList<RadioChannel>`
- `isVanilla(): boolean`

Static functions, called as `RadioData.name(...)`:

- `fetchAllRadioData(): ArrayList<RadioData>`
- `getTranslatorNames(Language language): ArrayList<String>`

Constructors: `RadioData.new(String xmlFile)`.

### DynamicRadioChannel

`zombie.radio.scripting.DynamicRadioChannel`, class. Extends [RadioChannel](#radiochannel). Also has the methods of [RadioChannel](#radiochannel) (29), listed on their own entries.

Methods, called as `obj:name(...)`:

- `LoadAiringBroadcast(String guid, int line): void`

Constructors: `DynamicRadioChannel.new(String n, int freq, ChannelCategory c)`, `DynamicRadioChannel.new(String n, int freq, ChannelCategory c, String guid)`.

### RadioBroadCast

`zombie.radio.scripting.RadioBroadCast`, class.

Methods, called as `obj:name(...)`:

- `AddRadioLine(RadioLine radioLine): void`
- `PeekNextLineText(): String`
- `getCurrentLine(): RadioLine`
- `getCurrentLineNumber(): int`
- `getEndStamp(): int`
- `getID(): String`
- `getLines(): ArrayList<RadioLine>`
- `getNextLine(): RadioLine`
- `getNextLine(boolean doChildren): RadioLine`
- `getStartStamp(): int`
- `resetLineCounter(): void`
- `resetLineCounter(boolean doChildren): void`
- `setCurrentLineNumber(int n): void`
- `setPostSegment(RadioBroadCast broadCast): void`
- `setPreSegment(RadioBroadCast broadCast): void`

Constructors: `RadioBroadCast.new(String id, int startstamp, int endstamp)`.

### RadioChannel

`zombie.radio.scripting.RadioChannel`, class.

Methods, called as `obj:name(...)`:

- `AddRadioScript(RadioScript script): void`
- `GetCategory(): ChannelCategory`
- `GetFrequency(): int`
- `GetName(): String`
- `GetPlayerIsListening(): boolean`
- `IsTv(): boolean`
- `LoadAiringBroadcast(String guid, int line): void`
- `SetPlayerIsListening(boolean isListening): void`
- `UpdateScripts(int timestamp, int day): void`
- `getAirCounterMultiplier(): float`
- `getAiringBroadcast(): RadioBroadCast`
- `getCurrentScript(): RadioScript`
- `getCurrentScriptLoop(): int`
- `getCurrentScriptMaxLoops(): int`
- `getGUID(): String`
- `getLastAiredLine(): String`
- `getLastBroadcastID(): String`
- `getRadioData(): RadioData`
- `getRadioScript(String script): RadioScript`
- `isTimeSynced(): boolean`
- `isVanilla(): boolean`
- `setActiveScript(String scriptName, int day): void`
- `setActiveScript(String scriptName, int day, int loop, int maxloops): void`
- `setActiveScriptNull(): void`
- `setAirCounterMultiplier(float airCounterMultiplier): void`
- `setAiringBroadcast(RadioBroadCast bc): void`
- `setLouisvilleObfuscate(boolean b): void`
- `setRadioData(RadioData radioData): void`
- `setTimeSynced(boolean isTimeSynced): void`
- `update(): void`

Constructors: `RadioChannel.new(String n, int freq, ChannelCategory c)`, `RadioChannel.new(String n, int freq, ChannelCategory c, String guid)`.

### RadioLine

`zombie.radio.scripting.RadioLine`, class.

Methods, called as `obj:name(...)`:

- `getAirTime(): float`
- `getB(): float`
- `getEffectsString(): String`
- `getG(): float`
- `getR(): float`
- `getText(): String`
- `isCustomAirTime(): boolean`
- `setAirTime(float airTime): void`
- `setText(String text): void`

Constructors: `RadioLine.new(String txt, float red, float green, float blue)`, `RadioLine.new(String txt, float red, float green, float blue, String fx)`.

### RadioScript

`zombie.radio.scripting.RadioScript`, class.

Methods, called as `obj:name(...)`:

- `AddBroadcast(RadioBroadCast broadcast): void`
- `AddBroadcast(RadioBroadCast broadcast, boolean ignoreTimestamps): void`
- `AddExitOption(String scriptname, int chance, int startdelay): void`
- `GetGUID(): String`
- `GetName(): String`
- `Reset(): void`
- `UpdateScript(int timeStamp): boolean`
- `clearExitOptions(): void`
- `getBroadcastList(): ArrayList<RadioBroadCast>`
- `getBroadcastWithID(String guid): RadioBroadCast`
- `getCurrentBroadcast(): RadioBroadCast`
- `getExitOptions(): ArrayList<RadioScript.ExitOption>`
- `getLoopMax(): int`
- `getLoopMin(): int`
- `getNextScript(): RadioScript.ExitOption`
- `getStartDay(): int`
- `getStartDayStamp(): int`
- `getValidAirBroadcast(): RadioBroadCast`
- `getValidAirBroadcastDebug(): RadioBroadCast`
- `setStartDayStamp(int day): void`

Constructors: `RadioScript.new(String n, int loopmin, int loopmax)`, `RadioScript.new(String n, int loopmin, int loopmax, String guid)`.

### RadioScript.ExitOption

`zombie.radio.scripting.RadioScript.ExitOption`, class.

Methods, called as `obj:name(...)`:

- `getChance(): int`
- `getScriptname(): String`
- `getStartDelay(): int`

Constructors: `RadioScript.ExitOption.new(String name, int rollchance, int startdelay)`.

### RadioScriptManager

`zombie.radio.scripting.RadioScriptManager`, class.

Methods, called as `obj:name(...)`:

- `AddChannel(RadioChannel channel, boolean overwrite): void`
- `Load(List<String> channelLines): void`
- `PlayerListensChannel(int chanfrequency, boolean mode, boolean sourceIsTV): void`
- `RemoveChannel(int frequency): void`
- `Save(Writer w): void`
- `UpdateScripts(int day, int hour, int mins): void`
- `getChannels(): Map<Integer, RadioChannel>`
- `getChannelsList(): ArrayList<RadioChannel>`
- `getCurrentTimeStamp(): int`
- `getRadioChannel(String uuid): RadioChannel`
- `init(int savedWorldVersion): void`
- `reset(): void`
- `simulateChannelUntil(int frequency, int days, boolean force): void`
- `simulateScriptsUntil(int days, boolean force): void`
- `update(): void`

Static functions, called as `RadioScriptManager.name(...)`:

- `getInstance(): RadioScriptManager`
- `hasInstance(): boolean`

### DataPoint

`zombie.radio.StorySounds.DataPoint`, class.

Methods, called as `obj:name(...)`:

- `getIntensity(): float`
- `getTime(): float`
- `setIntensity(float intensity): void`
- `setTime(float time): void`

Constructors: `DataPoint.new(float time, float intensity)`.

### EventSound

`zombie.radio.StorySounds.EventSound`, class.

Methods, called as `obj:name(...)`:

- `getColor(): Color`
- `getDataPoints(): ArrayList<DataPoint>`
- `getName(): String`
- `getStorySounds(): ArrayList<StorySound>`
- `setColor(Color color): void`
- `setDataPoints(ArrayList<DataPoint> dataPoints): void`
- `setName(String name): void`
- `setStorySounds(ArrayList<StorySound> storySounds): void`

Constructors: `EventSound.new()`, `EventSound.new(String name)`.

### SLSoundManager

`zombie.radio.StorySounds.SLSoundManager`, class.

Methods, called as `obj:name(...)`:

- `getDebug(): boolean`
- `getLuaDebug(): boolean`
- `getRandomBorderPosition(): Vector2`
- `getRandomBorderRange(): float`
- `getStorySounds(): ArrayList<StorySound>`
- `init(): void`
- `loadSounds(): void`
- `print(String line): void`
- `render(): void`
- `renderDebug(): void`
- `thunderTest(): void`
- `update(int storylineDay, int hour, int min): void`
- `updateKeys(): void`

Static functions, called as `SLSoundManager.name(...)`:

- `getInstance(): SLSoundManager`

Static fields (a copy of the value taken when the class is exposed): `debug: boolean`, `emitter: StoryEmitter`, `enabled: boolean`, `luaDebug: boolean`.

### StorySound

`zombie.radio.StorySounds.StorySound`, class.

Methods, called as `obj:name(...)`:

- `getBaseVolume(): float`
- `getClone(): StorySound`
- `getName(): String`
- `playSound(): long`
- `playSound(float volumeOverride): long`
- `playSound(float x, float y, float z, float minRange, float maxRange): long`
- `playSound(float volumeMod, float x, float y, float z, float minRange, float maxRange): long`
- `setBaseVolume(float baseVolume): void`
- `setName(String name): void`

Constructors: `StorySound.new(String name, float baseVol)`.

### StorySoundEvent

`zombie.radio.StorySounds.StorySoundEvent`, class.

Methods, called as `obj:name(...)`:

- `getEventSounds(): ArrayList<EventSound>`
- `getName(): String`
- `setEventSounds(ArrayList<EventSound> eventSounds): void`
- `setName(String name): void`

Constructors: `StorySoundEvent.new()`, `StorySoundEvent.new(String name)`.

### ZomboidRadio

`zombie.radio.ZomboidRadio`, class.

Methods, called as `obj:name(...)`:

- `DistributeTransmission(int sourceX, int sourceY, int channel, String msg, String guid, String codes, float r, float g, float b, int signalStrength, boolean isTV): void`
- `GetChannelList(String category): Map<Integer, String>`
- `Init(int savedWorldVersion): void`
- `Load(): boolean`
- `PlayerListensChannel(int channel, boolean listenmode, boolean isTV): void`
- `RegisterDevice(WaveSignalDevice device): void`
- `Reset(): void`
- `Save(): void`
- `SendTransmission(int sourceX, int sourceY, int channel, String msg, String guid, String codes, float r, float g, float b, int signalStrength, boolean isTV): void`
- `SendTransmission(int sourceX, int sourceY, ChatMessage msg, int signalStrength): void`
- `SendTransmission(long source, int sourceX, int sourceY, int channel, String msg, String guid, String codes, float r, float g, float b, int signalStrength, boolean isTV): void`
- `UnRegisterDevice(WaveSignalDevice device): void`
- `UpdateScripts(int hour, int mins): void`
- `WriteRadioServerDataPacket(ByteBufferWriter bb): void`
- `addChannelName(String name, int frequency, String category): void`
- `addChannelName(String name, int frequency, String category, boolean overwrite): void`
- `clone(): Object`
- `computerize(String str): String`
- `getBroadcastDevices(): ArrayList<WaveSignalDevice>`
- `getChannelName(int frequency): String`
- `getDaysSinceStart(): int`
- `getDevices(): ArrayList<WaveSignalDevice>`
- `getDisableBroadcasting(): boolean`
- `getDisableMediaLineLearning(): boolean`
- `getFullChannelList(): Map<String, Map<Integer, String>>`
- `getGameMode(): GameMode`
- `getRandomBzztFzzt(): String`
- `getRandomFrequency(): int`
- `getRandomFrequency(int rangemin, int rangemax): int`
- `getRecordedMedia(): RecordedMedia`
- `getScriptManager(): RadioScriptManager`
- `removeChannelName(int frequency): void`
- `render(): void`
- `scrambleString(String msg, int intensity, boolean ignoreBBcode, String customScramble): String`
- `setDisableBroadcasting(boolean b): void`
- `setDisableMediaLineLearning(boolean b): void`
- `setHasRecievedServerData(boolean state): void`
- `update(): void`

Static functions, called as `ZomboidRadio.name(...)`:

- `ObfuscateChannelCheck(RadioChannel channel): void`
- `getInstance(): ZomboidRadio`
- `hasInstance(): boolean`
- `isStaticSound(String str): boolean`

Static fields (a copy of the value taken when the class is exposed): `DEBUG_MODE: boolean`, `DEBUG_SOUND: boolean`, `DEBUG_XML: boolean`, `SAVE_FILE: String`, `disableBroadcasting: boolean`, `louisvilleObfuscation: boolean`, `postRadioSilence: boolean`.

### SoundManager

`zombie.SoundManager`, class. Extends `BaseSoundManager`.

Methods, called as `obj:name(...)`:

- `BlendThenStart(Audio musicTrack, float f, String prefMusic): Audio`
- `BlendVolume(Audio audio, float targetVolume): void`
- `BlendVolume(Audio audio, float targetVolume, float blendSpeedAlpha): void`
- `CacheSound(String file): void`
- `CheckDoMusic(): void`
- `DoMusic(String name, boolean bLoop): void`
- `FadeOutMusic(String name, int milli): void`
- `IsMusicPlaying(): boolean`
- `PlayAsMusic(String name, Audio musicTrack, boolean loop, float volume): void`
- `PlayAsMusic(String name, Audio musicTrack, float volume, boolean bloop): void`
- `PlayJukeboxSound(String name, boolean loop, float maxGain): Audio`
- `PlayMusic(String n, String name, boolean loop, float maxGain): Audio`
- `PlaySound(String name, boolean loop, float maxGain): Audio`
- `PlaySound(String name, boolean loop, float maxGain, float pitchVar): Audio`
- `PlaySoundEvenSilent(String name, boolean loop, float maxGain): Audio`
- `PlaySoundWav(String name, boolean loop, float maxGain): Audio`
- `PlaySoundWav(String name, boolean loop, float maxGain, float pitchVar): Audio`
- `PlaySoundWav(String name, int variations, boolean loop, float maxGain): Audio`
- `PlayWorldSound(String name, boolean loop, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSound(String name, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSound(String name, IsoGridSquare source, float pitchVar, float radius, float maxGain, int choices, boolean ignoreOutside): Audio`
- `PlayWorldSoundImpl(String name, boolean loop, int sx, int sy, int sz, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSoundWav(String name, boolean loop, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSoundWav(String name, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PlayWorldSoundWav(String name, IsoGridSquare source, float pitchVar, float radius, float maxGain, int choices, boolean ignoreOutside): void`
- `PlayWorldSoundWavImpl(String name, boolean loop, IsoGridSquare source, float pitchVar, float radius, float maxGain, boolean ignoreOutside): Audio`
- `PrepareMusic(String name): Audio`
- `Purge(): void`
- `Start(Audio musicTrack, float f, String prefMusic): Audio`
- `StopMusic(): void`
- `StopSound(Audio soundEffect): void`
- `Update(): void`
- `debugScriptSounds(): void`
- `dumpEventInstancesToTextFile(): void`
- `getAmbientPieces(): ArrayList<Audio>`
- `getAmbientVolume(): float`
- `getCurrentMusicLibrary(): String`
- `getCurrentMusicName(): String`
- `getFMODParameters(): FMODParameterList`
- `getMusicPosition(): float`
- `getMusicVolume(): float`
- `getSoundVolume(): float`
- `getUIEmitter(): FMODSoundEmitter`
- `getVehicleEngineVolume(): float`
- `isListenerInRange(float x, float y, float range): boolean`
- `isPlayingMusic(): boolean`
- `isPlayingUISound(String name): boolean`
- `isPlayingUISound(long eventInstance): boolean`
- `isRemastered(): boolean`
- `isUiSoundMuted(): boolean`
- `pauseSoundAndMusic(): void`
- `pauseSoundAndMusic(boolean bOptionallyKeepMusicPlaying): void`
- `playAmbient(String name): void`
- `playDamageSound(IsoGridSquare isoGridSquare, MaterialType materialType): void`
- `playDestructionSound(IsoGridSquare isoGridSquare, MaterialType materialType): void`
- `playImpactSound(IsoGridSquare isoGridSquare, AmmoType ammoType): void`
- `playImpactSound(IsoGridSquare isoGridSquare, AmmoType ammoType, MaterialType materialType): void`
- `playMusic(String name): void`
- `playMusicNonTriggered(String name, float gain): void`
- `playNightAmbient(String choice): void`
- `playUISound(String name): long`
- `registerEmitter(BaseSoundEmitter emitter): void`
- `resumeSoundAndMusic(): void`
- `setAmbientVolume(float volume): void`
- `setMusicState(String stateName): void`
- `setMusicVolume(float volume): void`
- `setMusicWakeState(IsoPlayer player, String stateName): void`
- `setSoundVolume(float volume): void`
- `setUiSoundMuted(boolean uiSoundMuted): void`
- `setVehicleEngineVolume(float volume): void`
- `startEvent(long eventInstance, GameSoundClip clip, boolean remote, BitSet parameterSet): void`
- `stop(): void`
- `stopEvent(long eventInstance, GameSoundClip clip, boolean remote, BitSet parameterSet): void`
- `stopMusic(String name): void`
- `stopUISound(long eventInstance): void`
- `unregisterEmitter(BaseSoundEmitter emitter): void`
- `update1(): void`
- `update2(): void`
- `update3(): void`
- `update3D(): void`
- `update4(): void`
- `updateEvent(long eventInstance, GameSoundClip clip): void`

Constructors: `SoundManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: BaseSoundManager`.

### SoundManager.AmbientSoundEffect

`zombie.SoundManager.AmbientSoundEffect`, class.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `isPlaying(): boolean`
- `pause(): void`
- `setName(String choice): void`
- `setVolume(float volume): void`
- `start(): void`
- `stop(): void`
- `update(): void`

Constructors: `SoundManager.AmbientSoundEffect.new(String name)`.

### WorldSoundManager

`zombie.WorldSoundManager`, class.

Methods, called as `obj:name(...)`:

- `KillCell(): void`
- `addSound(Object source, int x, int y, int z, int radius, int volume): WorldSoundManager.WorldSound`
- `addSound(Object source, int x, int y, int z, int radius, int volume, boolean stressHumans): WorldSoundManager.WorldSound`
- `addSound(Object source, int x, int y, int z, int radius, int volume, boolean stressHumans, float zombieIgnoreDist, float stressMod): WorldSoundManager.WorldSound`
- `addSound(Object source, int x, int y, int z, int radius, int volume, boolean stressHumans, float zombieIgnoreDist, float stressMod, boolean sourceIsZombie, boolean doSend, boolean remote): WorldSoundManager.WorldSound`
- `addSound(Object source, int x, int y, int z, int radius, int volume, boolean stressHumans, float zombieIgnoreDist, float stressMod, boolean sourceIsZombie, boolean doSend, boolean remote, boolean repeating, boolean stressAnimals): WorldSoundManager.WorldSound`
- `addSound(Object source, int x, int y, int z, int radius, int volume, float zombieIgnoreDist, float stressMod, boolean sourceIsZombie, boolean doSend, boolean remote, boolean repeating, short flags): WorldSoundManager.WorldSound`
- `addSoundRepeating(Object source, int x, int y, int z, int radius, int volume, boolean stressHumans): WorldSoundManager.WorldSound`
- `addSoundRepeating(Object source, int x, int y, int z, int radius, int volume, boolean stressHumans, boolean stressAnimals): WorldSoundManager.WorldSound`
- `addSoundRepeating(Object source, int x, int y, int z, int radius, int volume, boolean stressHumans, float zombieIgnoreDist, float stressMod): WorldSoundManager.WorldSound`
- `addSoundRepeating(Object source, int x, int y, int z, int radius, int volume, short flags): WorldSoundManager.WorldSound`
- `getBiggestSoundZomb(int x, int y, int z, boolean ignoreBySameType, IsoZombie zom): WorldSoundManager.ResultBiggestSound`
- `getHearingMultiplier(int hearing): float`
- `getHearingMultiplier(IsoZombie zombie): float`
- `getNew(): WorldSoundManager.WorldSound`
- `getSoundAnimal(IsoAnimal animal): WorldSoundManager.WorldSound`
- `getSoundAttract(WorldSoundManager.WorldSound sound, IsoZombie zom): float`
- `getSoundAttractAnimal(WorldSoundManager.WorldSound sound, IsoAnimal animal): float`
- `getSoundZomb(IsoZombie zom): WorldSoundManager.WorldSound`
- `getStressFromSounds(int x, int y, int z): float`
- `init(IsoCell cell): void`
- `initFrame(): void`
- `release(WorldSoundManager.WorldSound worldSound): WorldSoundManager.WorldSound`
- `render(): void`
- `update(): void`

Constructors: `WorldSoundManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: WorldSoundManager`.

### WorldSoundManager.WorldSound

`zombie.WorldSoundManager.WorldSound`, class.

Methods, called as `obj:name(...)`:

- `init(boolean sourceIsZombie, int x, int y, int z, int radius, int volume, boolean stressHumans, float zombieIgnoreDist, float stressMod): WorldSoundManager.WorldSound`
- `init(Object source, int x, int y, int z, int radius, int volume): WorldSoundManager.WorldSound`
- `init(Object source, int x, int y, int z, int radius, int volume, boolean stresshumans): WorldSoundManager.WorldSound`
- `init(Object source, int x, int y, int z, int radius, int volume, boolean stresshumans, float zombieIgnoreDist, float stressMod): WorldSoundManager.WorldSound`
- `init(Object source, int x, int y, int z, int radius, int volume, float zombieIgnoreDist, float stressMod, short flags): WorldSoundManager.WorldSound`
- `init(WorldSoundManager.WorldSound other): WorldSoundManager.WorldSound`
- `sourceIsVehicle(): boolean`

Constructors: `WorldSoundManager.WorldSound.new()`.
