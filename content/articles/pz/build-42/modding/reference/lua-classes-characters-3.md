---
slug: lua-classes-characters-3
title: 'Lua Classes: Characters, players, zombies and animals, part 3 of 3 (Build 42.21)'
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
excerpt: 'The exposed characters, players, zombies and animals classes of Build 42.21 (part 3 of 3): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Characters, players, zombies and animals, part 3 of 3

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Everything that walks: players, zombies, animals, their bodies, stats, skills, moodles and traits. If your mod touches a character, the class you want is probably here.

This page holds 24 classes and 392 methods, part 3 of 3 of this area (from `Moodles` to `WornItems`), from the packages `zombie.characters`, `zombie.characters.Moodles`, `zombie.characters.WornItems`, `zombie.characters.professions`, `zombie.characters.skills`, `zombie.characters.traits`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### Moodles

`zombie.characters.Moodles.Moodles`, class.

Methods, called as `obj:name(...)`:

- `UI_RefreshNeeded(): boolean`
- `Update(): void`
- `getGoodBadNeutral(MoodleType moodleType): int`
- `getMoodleDescriptionString(MoodleType moodleType): String`
- `getMoodleDisplayString(MoodleType moodleType): String`
- `getMoodleLevel(MoodleType moodleType): int`
- `isMaxMoodleLevel(MoodleType moodleType): boolean`
- `setMoodlesStateChanged(boolean refresh): void`

Constructors: `Moodles.new(IsoGameCharacter parent)`.

Static fields (a copy of the value taken when the class is exposed): `BadMoodleType: int`, `GoodMoodleType: int`, `NeutralMoodleType: int`.

### MoveDeltaModifiers

`zombie.characters.MoveDeltaModifiers`, class.

Methods, called as `obj:name(...)`:

- `getMoveDelta(): float`
- `getTurnDelta(): float`
- `getTwistDelta(): float`
- `setMaxMoveDelta(float delta): void`
- `setMaxTurnDelta(float delta): void`
- `setMaxTwistDelta(float delta): void`
- `setMoveDelta(float delta): void`
- `setTurnDelta(float delta): void`
- `setTwistDelta(float delta): void`

Constructors: `MoveDeltaModifiers.new()`.

### NetworkUser

`zombie.characters.NetworkUser`, class.

Methods, called as `obj:name(...)`:

- `getAuthType(): NetworkUser.AuthType`
- `getAuthTypeName(): String`
- `getConnectionType(): UdpConnection.ConnectionType`
- `getDisplayName(): String`
- `getFirstBannedIPForUser(String username): String`
- `getIpBanned(): String`
- `getKicks(): int`
- `getLastConnection(): String`
- `getPing(): short`
- `getRole(): Role`
- `getSteamIdBanned(): String`
- `getSteamid(): String`
- `getSuspicionPoints(): int`
- `getUsername(): String`
- `getWarningPoints(): int`
- `getWorld(): String`
- `isConnectedDirectly(): boolean`
- `isInWhitelist(): boolean`
- `isOnline(): boolean`
- `isSteamIdBanned(String steamId): String`
- `parse(ByteBufferReader input): void`
- `send(ByteBufferWriter output): void`
- `setConnectionType(UdpConnection.ConnectionType connectionType): void`
- `setInWhitelist(boolean inWhitelist): void`
- `setKicks(int kicks): void`
- `setPing(short ping): void`
- `setSuspicionPoints(int suspicionPoints): void`
- `setWarningPoints(int warningPoints): void`

Constructors: `NetworkUser.new()`, `NetworkUser.new(String world, String username, String lastConnection, Role role, int authType, String steamid, String displayName, boolean online)`.

### PlayerCraftHistory

`zombie.characters.PlayerCraftHistory`, class.

Methods, called as `obj:name(...)`:

- `addCraftHistoryCraftedEvent(String craftType): void`
- `cleanupHistory(): void`
- `getCraftHistoryFor(String craftType): PlayerCraftHistory.CraftHistoryEntry`
- `load(ByteBuffer input): void`
- `save(ByteBuffer output): void`

Constructors: `PlayerCraftHistory.new(IsoPlayer player)`.

### Position3D

`zombie.characters.Position3D`, class.

Methods, called as `obj:name(...)`:

- `set(float x, float y, float z): Position3D`
- `x(): float`
- `y(): float`
- `z(): float`

Constructors: `Position3D.new()`, `Position3D.new(float x, float y, float z)`.

### CharacterProfessionDefinition

`zombie.characters.professions.CharacterProfessionDefinition`, class.

Methods, called as `obj:name(...)`:

- `addGrantedRecipe(String recipe): void`
- `addGrantedTrait(CharacterTrait characterTrait): void`
- `addXPBoost(PerkFactory.Perk perk, int level): void`
- `getCost(): int`
- `getDescription(): String`
- `getGrantedRecipes(): ArrayList<String>`
- `getGrantedTraits(): ArrayList<CharacterTrait>`
- `getLabel(): String`
- `getLeftLabel(): String`
- `getRightLabel(): String`
- `getTexture(): Texture`
- `getType(): CharacterProfession`
- `getUIName(): String`
- `getXpBoosts(): HashMap<PerkFactory.Perk, Integer>`
- `hasGrantedRecipes(): boolean`
- `isGrantedRecipe(String recipe): boolean`
- `setDescription(String description): void`

Static functions, called as `CharacterProfessionDefinition.name(...)`:

- `addCharacterProfessionDefinition(CharacterProfession characterProfessionType, String name, int cost, String description, String iconPathName): CharacterProfessionDefinition`
- `getCharacterProfessionDefinition(CharacterProfession characterProfession): CharacterProfessionDefinition`
- `getProfessions(): ArrayList<CharacterProfessionDefinition>`
- `reset(): void`

Constructors: `CharacterProfessionDefinition.new(CharacterProfession characterProfessionType, String name, int cost, String description, String iconPathName)`.

Static fields (a copy of the value taken when the class is exposed): `characterProfessionDefinitions: Map<CharacterProfession, CharacterProfessionDefinition>`.

### Role

`zombie.characters.Role`, class.

Methods, called as `obj:name(...)`:

- `addCapability(Capability capability): boolean`
- `cleanCapability(): void`
- `getCapabilities(): HashSet<Capability>`
- `getColor(): Color`
- `getDefaults(): ArrayList<String>`
- `getDescription(): String`
- `getId(): int`
- `getName(): String`
- `getPosition(): int`
- `hasAdminPower(): boolean`
- `hasAdminTool(): boolean`
- `hasCapability(Capability capability): boolean`
- `isReadOnly(): boolean`
- `parse(ByteBufferReader input): void`
- `removeCapability(Capability capability): boolean`
- `send(ByteBufferWriter output): void`
- `setColor(Color v): void`
- `setDescription(String v): void`
- `setId(int id): void`
- `setName(String name): void`
- `setPosition(int position): void`
- `setReadOnly(): void`

Static functions, called as `Role.name(...)`:

- `hasCapability(IsoMovingObject target, Capability capability): boolean`
- `isUsingDebugMode(): boolean`

Constructors: `Role.new(String name)`.

### Safety

`zombie.characters.Safety`, class.

Methods, called as `obj:name(...)`:

- `copyFrom(Safety other): void`
- `getCharacter(): Object`
- `getCooldown(): float`
- `getDescription(): String`
- `getToggle(): float`
- `isEnabled(): boolean`
- `isLast(): boolean`
- `isToggleAllowed(): boolean`
- `load(ByteBufferReader input, int worldVersion): void`
- `save(ByteBufferWriter output): void`
- `setCooldown(float cooldown): void`
- `setEnabled(boolean enabled): void`
- `setLast(boolean last): void`
- `setToggle(float toggle): void`
- `toggleSafety(): void`

Constructors: `Safety.new()`, `Safety.new(IsoGameCharacter character)`.

### PerkFactory

`zombie.characters.skills.PerkFactory`, class.

Static functions, called as `PerkFactory.name(...)`:

- `AddPerk(PerkFactory.Perk perk, String translation, int xp1, int xp2, int xp3, int xp4, int xp5, int xp6, int xp7, int xp8, int xp9, int xp10): PerkFactory.Perk`
- `AddPerk(PerkFactory.Perk perk, String translation, int xp1, int xp2, int xp3, int xp4, int xp5, int xp6, int xp7, int xp8, int xp9, int xp10, boolean passiv): PerkFactory.Perk`
- `AddPerk(PerkFactory.Perk perk, String translation, PerkFactory.Perk parent, int xp1, int xp2, int xp3, int xp4, int xp5, int xp6, int xp7, int xp8, int xp9, int xp10): PerkFactory.Perk`
- `AddPerk(PerkFactory.Perk perk, String translation, PerkFactory.Perk parent, int xp1, int xp2, int xp3, int xp4, int xp5, int xp6, int xp7, int xp8, int xp9, int xp10, boolean passiv): PerkFactory.Perk`
- `Reset(): void`
- `getPerk(PerkFactory.Perk perk): PerkFactory.Perk`
- `getPerkFromName(String name): PerkFactory.Perk`
- `getPerkName(PerkFactory.Perk type): String`
- `init(): void`
- `initTranslations(): void`

Constructors: `PerkFactory.new()`.

Static fields (a copy of the value taken when the class is exposed): `PerkList: ArrayList<PerkFactory.Perk>`.

### PerkFactory.Perk

`zombie.characters.skills.PerkFactory.Perk`, class.

Methods, called as `obj:name(...)`:

- `getId(): String`
- `getName(): String`
- `getParent(): PerkFactory.Perk`
- `getTotalXpForLevel(int level): float`
- `getType(): PerkFactory.Perk`
- `getXp1(): int`
- `getXp10(): int`
- `getXp2(): int`
- `getXp3(): int`
- `getXp4(): int`
- `getXp5(): int`
- `getXp6(): int`
- `getXp7(): int`
- `getXp8(): int`
- `getXp9(): int`
- `getXpForLevel(int level): float`
- `index(): int`
- `isCustom(): boolean`
- `isPassiv(): boolean`
- `setCustom(): void`
- `toString(): String`

Constructors: `PerkFactory.Perk.new(String id)`, `PerkFactory.Perk.new(String id, PerkFactory.Perk parent)`.

### PerkFactory.Perks

`zombie.characters.skills.PerkFactory.Perks`, class.

Static functions, called as `PerkFactory.Perks.name(...)`:

- `FromString(String id): PerkFactory.Perk`
- `fromIndex(int value): PerkFactory.Perk`
- `getMaxIndex(): int`

Constructors: `PerkFactory.Perks.new()`.

Static fields (a copy of the value taken when the class is exposed): `Agility: PerkFactory.Perk`, `Aiming: PerkFactory.Perk`, `Axe: PerkFactory.Perk`, `Blacksmith: PerkFactory.Perk`, `Blunt: PerkFactory.Perk`, `Butchering: PerkFactory.Perk`, `Carving: PerkFactory.Perk`, `Combat: PerkFactory.Perk`, `Cooking: PerkFactory.Perk`, `Crafting: PerkFactory.Perk`, `Doctor: PerkFactory.Perk`, `Electricity: PerkFactory.Perk`, `Farming: PerkFactory.Perk`, `FarmingCategory: PerkFactory.Perk`, `Firearm: PerkFactory.Perk`, `Fishing: PerkFactory.Perk`, `Fitness: PerkFactory.Perk`, `FlintKnapping: PerkFactory.Perk`, `Glassmaking: PerkFactory.Perk`, `Husbandry: PerkFactory.Perk`, `Lightfoot: PerkFactory.Perk`, `LongBlade: PerkFactory.Perk`, `MAX: PerkFactory.Perk`, `Maintenance: PerkFactory.Perk`, `Masonry: PerkFactory.Perk`, `Mechanics: PerkFactory.Perk`, `Melee: PerkFactory.Perk`, `Melting: PerkFactory.Perk`, `MetalWelding: PerkFactory.Perk`, `Nimble: PerkFactory.Perk`, `None: PerkFactory.Perk`, `Passiv: PerkFactory.Perk`, `PhysicalCategory: PerkFactory.Perk`, `PlantScavenging: PerkFactory.Perk`, `Pottery: PerkFactory.Perk`, `Reloading: PerkFactory.Perk`, `SmallBlade: PerkFactory.Perk`, `SmallBlunt: PerkFactory.Perk`, `Sneak: PerkFactory.Perk`, `Spear: PerkFactory.Perk`, `Sprinting: PerkFactory.Perk`, `Strength: PerkFactory.Perk`, `Survivalist: PerkFactory.Perk`, `Tailoring: PerkFactory.Perk`, `Tracking: PerkFactory.Perk`, `Trapping: PerkFactory.Perk`, `Woodwork: PerkFactory.Perk`.

### Stats

`zombie.characters.Stats`, class.

Methods, called as `obj:name(...)`:

- `add(CharacterStat stat, float amount): boolean`
- `addTrippingRotAngle(float value): void`
- `get(CharacterStat stat): float`
- `getEnduranceDangerWarning(): float`
- `getEnduranceWarning(): float`
- `getLastEndurance(): float`
- `getNicotineStress(): float`
- `getNumChasingZombies(): int`
- `getNumVeryCloseZombies(): int`
- `getNumVisibleZombies(): int`
- `getTrippingRotAngle(): float`
- `getVisibleZombies(): int`
- `isAboveMinimum(CharacterStat stat): boolean`
- `isAtMaximum(CharacterStat stat): boolean`
- `isAtMinimum(CharacterStat stat): boolean`
- `isEnduranceRecharging(): boolean`
- `isTripping(): boolean`
- `load(DataInputStream input): void`
- `load(ByteBuffer input, int worldVersion): void`
- `parse(ByteBuffer b, byte field): void`
- `remove(CharacterStat stat, float amount): boolean`
- `reset(CharacterStat stat): boolean`
- `resetStats(): void`
- `save(DataOutputStream output): void`
- `save(ByteBuffer output): void`
- `set(CharacterStat stat, float value): boolean`
- `setLastEndurance(float endurance): void`
- `setLastNumberChasingZombies(int chasingZombies): void`
- `setNumVisibleZombies(int numVisibleZombies): void`
- `setTripping(boolean tripping): void`
- `setTrippingRotAngle(float trippingRotAngle): void`
- `toString(): String`
- `write(ByteBuffer b, byte field): void`

Constructors: `Stats.new()`.

### SurvivorDesc

`zombie.characters.SurvivorDesc`, class.

Methods, called as `obj:name(...)`:

- `addObservation(String obv): void`
- `dressInNamedOutfit(String outfitName): void`
- `getAggressiveness(): float`
- `getBravery(): float`
- `getCalculatedToughness(): int`
- `getCharacterGender(): CharacterGender`
- `getCharacterProfession(): CharacterProfession`
- `getCommonHairColor(): ArrayList<ImmutableColor>`
- `getCompassion(): float`
- `getDescription(String newStr): String`
- `getExtras(): ArrayList<String>`
- `getFavourindoors(): float`
- `getForename(): String`
- `getFriendliness(): float`
- `getFullname(): String`
- `getGroup(): SurvivorGroup`
- `getHumanVisual(): HumanVisual`
- `getID(): int`
- `getInstance(): IsoGameCharacter`
- `getInventoryScript(): String`
- `getItemVisuals(ItemVisuals itemVisuals): void`
- `getLoner(): float`
- `getLoyalty(): float`
- `getMetCount(SurvivorDesc descriptor): int`
- `getMetCount(): HashMap<Integer, Integer>`
- `getMeta(): KahluaTable`
- `getObservations(): ArrayList<ObservationFactory.Observation>`
- `getSurname(): String`
- `getTemper(): float`
- `getTorso(): String`
- `getType(): SurvivorFactory.SurvivorType`
- `getVoicePitch(): float`
- `getVoicePrefix(): String`
- `getVoiceType(): int`
- `getWornItem(ItemBodyLocation itemBodyLocation): InventoryItem`
- `getWornItems(): WornItems`
- `getXPBoostMap(): HashMap<PerkFactory.Perk, Integer>`
- `hasObservation(String o): boolean`
- `isAggressive(): boolean`
- `isCharacterProfession(CharacterProfession characterProfession): boolean`
- `isDead(): boolean`
- `isFemale(): boolean`
- `isFriendly(): boolean`
- `isLeader(): boolean`
- `isSkeleton(): boolean`
- `isZombie(): boolean`
- `load(ByteBuffer input, int worldVersion, IsoGameCharacter chr): void`
- `meet(SurvivorDesc desc): void`
- `save(ByteBuffer output): void`
- `setAggressiveness(float aggressiveness): void`
- `setBravery(float bravery): void`
- `setCharacterGender(CharacterGender characterGender): void`
- `setCharacterProfession(CharacterProfession characterProfession): void`
- `setCompassion(float compassion): void`
- `setDead(boolean dead): void`
- `setFavourindoors(float favourindoors): void`
- `setFemale(boolean bFemale): void`
- `setForename(String forename): void`
- `setFriendliness(float friendliness): void`
- `setID(int id): void`
- `setInstance(IsoGameCharacter instance): void`
- `setInventoryScript(String inventoryScript): void`
- `setLoner(float loner): void`
- `setLoyalty(float loyalty): void`
- `setProfessionSkills(CharacterProfessionDefinition characterProfessionDefinition): void`
- `setSurname(String surname): void`
- `setTemper(float temper): void`
- `setTorso(String torso): void`
- `setType(SurvivorFactory.SurvivorType type): void`
- `setVoicePitch(float voicePitch): void`
- `setVoicePrefix(String voicePrefix): void`
- `setVoiceType(int voiceType): void`
- `setWornItem(ItemBodyLocation itemBodyLocation, InventoryItem item): void`

Static functions, called as `SurvivorDesc.name(...)`:

- `addHairColor(ColorInfo color): void`
- `addTrouserColor(ColorInfo color): void`
- `getIDCount(): int`
- `getRandomSkinColor(): Color`
- `setIDCount(int aIDCount): void`

Constructors: `SurvivorDesc.new()`, `SurvivorDesc.new(boolean bNew)`, `SurvivorDesc.new(SurvivorDesc other)`.

Static fields (a copy of the value taken when the class is exposed): `HairCommonColors: ArrayList<ImmutableColor>`, `TrouserCommonColors: ArrayList<Color>`.

### SurvivorFactory

`zombie.characters.SurvivorFactory`, class.

Static functions, called as `SurvivorFactory.name(...)`:

- `CreateFamily(int nCount): SurvivorDesc[]`
- `CreateSurvivor(): SurvivorDesc`
- `CreateSurvivor(SurvivorFactory.SurvivorType survivorType): SurvivorDesc`
- `CreateSurvivor(SurvivorFactory.SurvivorType survivorType, boolean bFemale): SurvivorDesc`
- `CreateSurvivorGroup(int nCount): SurvivorDesc[]`
- `InstansiateInCell(SurvivorDesc desc, IsoCell cell, int x, int y, int z): IsoSurvivor`
- `Reset(): void`
- `addFemaleForename(String forename): void`
- `addMaleForename(String forename): void`
- `addSurname(String surName): void`
- `getRandomForename(boolean bFemale): String`
- `getRandomSurname(): String`
- `randomName(SurvivorDesc desc): void`
- `setTorso(SurvivorDesc survivor): void`

Constructors: `SurvivorFactory.new()`.

Static fields (a copy of the value taken when the class is exposed): `FemaleForenames: ArrayList<String>`, `MaleForenames: ArrayList<String>`, `Surnames: ArrayList<String>`.

### SurvivorFactory.SurvivorType

`zombie.characters.SurvivorFactory.SurvivorType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `SurvivorFactory.SurvivorType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): SurvivorFactory.SurvivorType`
- `values(): SurvivorFactory.SurvivorType[]`

Enum values (read as `SurvivorFactory.SurvivorType.VALUE`): `Aggressive`, `Friendly`, `Neutral`.

### CharacterTraitDefinition

`zombie.characters.traits.CharacterTraitDefinition`, class.

Methods, called as `obj:name(...)`:

- `addGrantedRecipe(String recipe): void`
- `addGrantedTrait(CharacterTrait characterTrait): void`
- `addMutuallyExclusive(CharacterTrait characterTrait): void`
- `addXPBoost(PerkFactory.Perk perk, int level): void`
- `getCost(): int`
- `getDescription(): String`
- `getGrantedRecipes(): ArrayList<String>`
- `getGrantedTraits(): ArrayList<CharacterTrait>`
- `getLabel(): String`
- `getLeftLabel(): String`
- `getMutuallyExclusiveTraits(): ArrayList<CharacterTrait>`
- `getRightLabel(): String`
- `getTexture(): Texture`
- `getType(): CharacterTrait`
- `getUIName(): String`
- `getXpBoosts(): HashMap<PerkFactory.Perk, Integer>`
- `hasGrantedRecipes(): boolean`
- `hasMutuallyExclusiveTraits(): boolean`
- `isDisabledInMultiplayer(): boolean`
- `isFree(): boolean`
- `isGrantedRecipe(String recipe): boolean`
- `isMutuallyExclusive(CharacterTraitDefinition characterTraitDefinition): boolean`
- `setDescription(String description): void`
- `setDisabledInMultiplayer(boolean disabledInMultiplayer): void`
- `setTexture(Texture texture): void`

Static functions, called as `CharacterTraitDefinition.name(...)`:

- `addCharacterTraitDefinition(CharacterTrait characterTraitType, String name, int cost, String description, boolean profession): CharacterTraitDefinition`
- `addCharacterTraitDefinition(CharacterTrait characterTraitType, String name, int cost, String description, boolean profession, boolean disabledInMultiplayer): CharacterTraitDefinition`
- `getCharacterTraitDefinition(CharacterTrait characterTrait): CharacterTraitDefinition`
- `getTraits(): ArrayList<CharacterTraitDefinition>`
- `reset(): void`
- `setMutualExclusive(CharacterTrait a, CharacterTrait b): void`

Constructors: `CharacterTraitDefinition.new(CharacterTrait characterTraitType, String name, int cost, String description, boolean isProfessionTrait, boolean disabledInMultiplayer)`.

Static fields (a copy of the value taken when the class is exposed): `characterTraitDefinitions: Map<CharacterTrait, CharacterTraitDefinition>`.

### CharacterTraits

`zombie.characters.traits.CharacterTraits`, class.

Methods, called as `obj:name(...)`:

- `add(CharacterTrait characterTrait): void`
- `get(CharacterTrait characterTrait): boolean`
- `getKnownTraits(): List<CharacterTrait>`
- `getTraitDamageDealtReductionModifier(): float`
- `getTraitEnduranceLossModifier(): float`
- `getTraitWeatherPenaltyModifier(): float`
- `getTraits(): Map<CharacterTrait, Boolean>`
- `load(ByteBuffer input): void`
- `read(ByteBufferReader input): void`
- `remove(CharacterTrait characterTrait): void`
- `save(ByteBuffer output): void`
- `set(CharacterTrait characterTrait, boolean value): boolean`
- `write(ByteBufferWriter output): void`

Constructors: `CharacterTraits.new()`.

Static fields (a copy of the value taken when the class is exposed): `AllThumbsClimbingPenalty: float`, `AllThumbsStrengthPenalty: int`, `AwkwardGlovesClimbingPenaltyDivisor: float`, `BASE_DETECTION_RANGE: float`, `BurglarClimbingBonus: float`, `BurglarStrengthBonus: int`, `ClumsyClimbingPenaltyDivisor: float`, `DEAF_DETECTION_RANGE: float`, `DextrousClimbingBonus: float`, `DextrousStrengthBonus: int`, `DrunkClimbingPenaltyMultiplier: float`, `EnduranceClimbingPenaltyMultiplier: float`, `FATIGUE_SCALE: float`, `FATIGUE_THRESHOLD: float`, `GymnastClimbingBonus: float`, `GymnastStrengthBonus: int`, `HARD_OF_HEARING_RANGE_PENALTY: float`, `HealthReductionMultiplierModerate: float`, `HealthReductionMultiplierSevere: float`, `HeavyLoadClimbingPenaltyMultiplier: float`, `KEEN_HEARING_RANGE_BONUS: float`, `ObeseClimbingPenalty: float`, `ObeseStrengthPenalty: int`, `OverweightClimbingPenalty: float`, `OverweightStrengthPenalty: int`, `PainClimbingPenaltyMultiplier: float`, `PerkClimbingBonusMultiplier: float`, `RegularGlovesClimbingBonus: float`.

### ObservationFactory

`zombie.characters.traits.ObservationFactory`, class.

Static functions, called as `ObservationFactory.name(...)`:

- `addObservation(String type, String name, String desc): void`
- `getObservation(String name): ObservationFactory.Observation`
- `init(): void`
- `setMutualExclusive(String a, String b): void`

Constructors: `ObservationFactory.new()`.

Static fields (a copy of the value taken when the class is exposed): `observationMap: HashMap<String, ObservationFactory.Observation>`.

### ObservationFactory.Observation

`zombie.characters.traits.ObservationFactory.Observation`, class.

Methods, called as `obj:name(...)`:

- `getDescription(): String`
- `getLabel(): String`
- `getLeftLabel(): String`
- `getName(): String`
- `getRightLabel(): String`
- `getTraitID(): String`
- `setDescription(String description): void`
- `setName(String name): void`
- `setTraitID(String traitId): void`

Constructors: `ObservationFactory.Observation.new(String tr, String name, String desc)`.

### BodyLocation

`zombie.characters.WornItems.BodyLocation`, class.

Methods, called as `obj:name(...)`:

- `getId(): ItemBodyLocation`
- `isAltModel(ItemBodyLocation itemBodyLocation): boolean`
- `isExclusive(ItemBodyLocation itemBodyLocation): boolean`
- `isHideModel(ItemBodyLocation itemBodyLocation): boolean`
- `isId(ItemBodyLocation itemBodyLocation): boolean`
- `isMultiItem(): boolean`
- `setAltModel(ItemBodyLocation itemBodyLocation): BodyLocation`
- `setExclusive(ItemBodyLocation itemBodyLocation): BodyLocation`
- `setHideModel(ItemBodyLocation itemBodyLocation): BodyLocation`
- `setMultiItem(boolean bMultiItem): BodyLocation`

Constructors: `BodyLocation.new(BodyLocationGroup group, ItemBodyLocation id)`.

### BodyLocationGroup

`zombie.characters.WornItems.BodyLocationGroup`, class.

Methods, called as `obj:name(...)`:

- `getAllLocations(): List<BodyLocation>`
- `getId(): String`
- `getLocation(ItemBodyLocation itemBodyLocation): BodyLocation`
- `getLocationByIndex(int index): BodyLocation`
- `getOrCreateLocation(ItemBodyLocation itemBodyLocation): BodyLocation`
- `indexOf(ItemBodyLocation locationId): int`
- `isAltModel(ItemBodyLocation firstId, ItemBodyLocation secondId): boolean`
- `isExclusive(ItemBodyLocation firstId, ItemBodyLocation secondId): boolean`
- `isHideModel(ItemBodyLocation firstId, ItemBodyLocation secondId): boolean`
- `isMultiItem(ItemBodyLocation locationId): boolean`
- `moveLocationToIndex(ItemBodyLocation itemBodyLocation, int index): void`
- `setAltModel(ItemBodyLocation firstId, ItemBodyLocation secondId): void`
- `setExclusive(ItemBodyLocation firstId, ItemBodyLocation secondId): void`
- `setHideModel(ItemBodyLocation firstId, ItemBodyLocation secondId): void`
- `setMultiItem(ItemBodyLocation locationId, boolean bMultiItem): void`
- `size(): int`

Constructors: `BodyLocationGroup.new(String id)`.

### BodyLocations

`zombie.characters.WornItems.BodyLocations`, class.

Static functions, called as `BodyLocations.name(...)`:

- `getAllGroups(): List<BodyLocationGroup>`
- `getGroup(String id): BodyLocationGroup`
- `reset(): void`

Constructors: `BodyLocations.new()`.

### WornItem

`zombie.characters.WornItems.WornItem`, class.

Methods, called as `obj:name(...)`:

- `getItem(): InventoryItem`
- `getLocation(): ItemBodyLocation`

Constructors: `WornItem.new(ItemBodyLocation itemBodyLocation, InventoryItem item)`.

### WornItems

`zombie.characters.WornItems.WornItems`, class.

Methods, called as `obj:name(...)`:

- `addItemsToItemContainer(ItemContainer container): void`
- `clear(): void`
- `contains(InventoryItem item): boolean`
- `copyFrom(WornItems other): void`
- `forEach(Consumer<WornItem> c): void`
- `get(int index): WornItem`
- `getBodyLocationGroup(): BodyLocationGroup`
- `getItem(ItemBodyLocation location): InventoryItem`
- `getItemById(int id): InventoryItem`
- `getItemByIndex(int index): InventoryItem`
- `getItemVisuals(ItemVisuals itemVisuals): void`
- `getItems(): List<WornItem>`
- `getLocation(InventoryItem item): ItemBodyLocation`
- `isEmpty(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `remove(InventoryItem item): void`
- `save(ByteBuffer output): void`
- `setFromItemVisuals(ItemVisuals itemVisuals): void`
- `setItem(ItemBodyLocation location, InventoryItem item): void`
- `size(): int`

Constructors: `WornItems.new(BodyLocationGroup group)`, `WornItems.new(WornItems other)`.
