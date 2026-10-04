---
slug: lua-classes-network
title: 'Lua Classes: Multiplayer, network and chat (Build 42.21)'
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
excerpt: 'The exposed multiplayer, network and chat classes of Build 42.21: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Multiplayer, network and chat

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The multiplayer side: server options, packets the Lua side can see, factions, safehouses as the network knows them, and chat.

This page holds 31 classes and 456 methods, from the packages `zombie.chat`, `zombie.network`, `zombie.network.fields`, `zombie.network.packets`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### ChatBase

`zombie.chat.ChatBase`, abstract class.

Methods, called as `obj:name(...)`:

- `addMember(short playerID): void`
- `close(): void`
- `createMessage(String text): ChatMessage`
- `createServerMessage(String text): ServerChatMessage`
- `getColor(): Color`
- `getID(): int`
- `getJustAddedMembers(): ArrayList<Short>`
- `getJustRemovedMembers(): ArrayList<Short>`
- `getMessagePrefix(ChatMessage msg): String`
- `getMessageTextWithPrefix(ChatMessage msg): String`
- `getMode(): ChatMode`
- `getRange(): float`
- `getTabID(): short`
- `getTitleID(): String`
- `getType(): ChatType`
- `getZombieAttractionRange(): float`
- `isEnabled(): boolean`
- `isSendingToRadio(): boolean`
- `leaveMember(Short playerID): void`
- `packMessage(ByteBufferWriter b, ChatMessage msg): void`
- `removeMember(Short playerID): void`
- `sendMessageToChatMembers(ChatMessage msg): void`
- `sendMessageToChatMembers(ServerChatMessage msg): void`
- `sendMessageToPlayer(short playerID, ChatMessage msg): void`
- `sendMessageToPlayer(UdpConnection connection, ChatMessage msg): void`
- `sendPlayerJoinChatPacket(UdpConnection playerConnection): void`
- `sendPlayerLeaveChatPacket(short playerID): void`
- `sendPlayerLeaveChatPacket(UdpConnection connection): void`
- `sendToServer(ChatMessage msg, DeviceData deviceData): void`
- `setFontSize(String fontSize): void`
- `setSettings(ChatSettings settings): void`
- `setShowTimestamp(boolean showTimestamp): void`
- `setShowTitle(boolean showTitle): void`
- `showMessage(String text, String author): void`
- `showMessage(ChatMessage msg): void`
- `syncMembersByUsernames(ArrayList<String> players): void`
- `unpackMessage(ByteBufferReader bb): ChatMessage`

Constructors: `ChatBase.new(int id, ChatType type, ChatTab tab)`, `ChatBase.new(ByteBufferReader bb, ChatType type, ChatTab tab, IsoPlayer owner)`.

### ChatMessage

`zombie.chat.ChatMessage`, class.

Methods, called as `obj:name(...)`:

- `clone(): ChatMessage`
- `getAuthor(): String`
- `getChat(): ChatBase`
- `getChatID(): int`
- `getCustomTag(): String`
- `getDatetime(): LocalDateTime`
- `getDatetimeStr(): String`
- `getRadioChannel(): int`
- `getText(): String`
- `getTextColor(): Color`
- `getTextWithPrefix(): String`
- `getTextWithReplacedParentheses(): String`
- `isCustomColor(): boolean`
- `isFromDiscord(): boolean`
- `isLocal(): boolean`
- `isOverHeadSpeech(): boolean`
- `isScramble(): boolean`
- `isServerAlert(): boolean`
- `isServerAuthor(): boolean`
- `isShouldAttractZombies(): boolean`
- `isShowAuthor(): boolean`
- `isShowInChat(): boolean`
- `makeFromDiscord(): void`
- `pack(ByteBufferWriter b): void`
- `setAuthor(String author): void`
- `setCustomTag(String customTag): void`
- `setDatetime(LocalDateTime datetime): void`
- `setLocal(boolean local): void`
- `setOverHeadSpeech(boolean overHeadSpeech): void`
- `setRadioChannel(int radioChannel): void`
- `setScrambledText(String text): void`
- `setServerAlert(boolean serverAlert): void`
- `setServerAuthor(boolean serverAuthor): void`
- `setShouldAttractZombies(boolean shouldAttractZombies): void`
- `setShowInChat(boolean showInChat): void`
- `setText(String text): void`
- `setTextColor(Color textColor): void`
- `toString(): String`

Constructors: `ChatMessage.new(ChatBase chat, String text)`, `ChatMessage.new(ChatBase chat, LocalDateTime datetime, String text)`.

### ServerChatMessage

`zombie.chat.ServerChatMessage`, class. Extends [ChatMessage](#chatmessage). Also has the methods of [ChatMessage](#chatmessage) (37), listed on their own entries.

Methods, called as `obj:name(...)`:

- `setAuthor(String author): void`

Constructors: `ServerChatMessage.new(ChatBase chat, String text)`.

### Account

`zombie.network.Account`, class.

Methods, called as `obj:name(...)`:

- `encryptPwd(String pwd): void`
- `getAuthType(): int`
- `getID(): int`
- `getIcon(): Texture`
- `getLastLogon(): String`
- `getPlayerFirstAndLastName(): String`
- `getPwd(): String`
- `getTimePlayed(): int`
- `getUseSteamRelay(): boolean`
- `getUserName(): String`
- `isSavePwd(): boolean`
- `setAuthType(int authType): void`
- `setID(int id): void`
- `setIcon(Texture icon): void`
- `setLastLogon(LocalDateTime lastLogon): void`
- `setLastLogonNow(): void`
- `setPlayerFirstAndLastName(String name): void`
- `setPwd(String pwd): void`
- `setSavePwd(boolean savePwd): void`
- `setTimePlayed(int timePlayed): void`
- `setUseSteamRelay(boolean useSteamRelay): void`
- `setUserName(String userName): void`

Constructors: `Account.new()`.

### DBBannedIP

`zombie.network.DBBannedIP`, class.

Methods, called as `obj:name(...)`:

- `getIp(): String`
- `getReason(): String`
- `getUsername(): String`
- `setIp(String ip): void`
- `setReason(String reason): void`
- `setUsername(String username): void`

Constructors: `DBBannedIP.new(String username, String ip, String reason)`.

### DBBannedSteamID

`zombie.network.DBBannedSteamID`, class.

Methods, called as `obj:name(...)`:

- `getReason(): String`
- `getSteamID(): String`
- `setReason(String reason): void`
- `setSteamID(String steamid): void`

Constructors: `DBBannedSteamID.new(String steamid, String reason)`.

### DBResult

`zombie.network.DBResult`, class.

Methods, called as `obj:name(...)`:

- `getColumns(): ArrayList<String>`
- `getTableName(): String`
- `getType(): String`
- `getValues(): HashMap<String, String>`
- `setColumns(ArrayList<String> columns): void`
- `setTableName(String tableName): void`
- `setType(String type): void`

Constructors: `DBResult.new()`.

### DBTicket

`zombie.network.DBTicket`, class.

Methods, called as `obj:name(...)`:

- `getAnswer(): DBTicket`
- `getAuthor(): String`
- `getMessage(): String`
- `getTicketID(): int`
- `isAnswer(): boolean`
- `isViewed(): boolean`
- `setAnswer(DBTicket answer): void`
- `setAuthor(String author): void`
- `setIsAnswer(boolean isAnswer): void`
- `setMessage(String message): void`
- `setTicketID(int ticketId): void`
- `setViewed(boolean viewed): void`

Constructors: `DBTicket.new(String author, String message, int ticketId)`, `DBTicket.new(String author, String message, int ticketId, boolean viewed)`.

### ContainerID

`zombie.network.fields.ContainerID`, class.

Methods, called as `obj:name(...)`:

- `copy(ContainerID other): void`
- `equals(Object o): boolean`
- `findObject(): void`
- `getClassDescription(StringBuilder s, Class<?> cls, HashSet<Object> excludedObjects): void` from `IDescriptor`
- `getContainer(): ItemContainer`
- `getContainerType(): ContainerID.ContainerType`
- `getDescription(): String` from `IDescriptor`
- `getDescription(HashSet<Object> excludedObjects): String` from `IDescriptor`
- `getObject(): IsoObject`
- `getPacketSizeBytes(): int` from `INetworkPacketField`
- `getPart(): VehiclePart`
- `getVehicle(): BaseVehicle`
- `hashCode(): int`
- `isConsistent(IConnection connection): boolean` from `INetworkPacketField`
- `isContainerTheSame(int itemId, ItemContainer source): boolean`
- `parse(ByteBufferReader b, IConnection connection): void`
- `set(ItemContainer container): void`
- `set(ItemContainer container, IsoObject o): void`
- `setFloor(ItemContainer container, IsoGridSquare sq): void`
- `setInventoryContainer(ItemContainer container, IsoPlayer player): void`
- `setObject(ItemContainer container, IsoObject o, IsoGridSquare sq): void`
- `setObjectInVehicle(ItemContainer container, IsoObject o, IsoGridSquare sq, ItemContainer part): void`
- `toString(): String`
- `write(ByteBuffer bb): void`
- `write(ByteBufferWriter b): void`

Constructors: `ContainerID.new()`.

### ContainerID.ContainerType

`zombie.network.fields.ContainerID.ContainerType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ContainerID.ContainerType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ContainerID.ContainerType`
- `values(): ContainerID.ContainerType[]`

Enum values (read as `ContainerID.ContainerType.VALUE`): `DeadBody`, `Floor`, `InventoryContainer`, `IsoObject`, `ObjectContainer`, `ObjectInVehicle`, `PlayerInventory`, `Undefined`, `Vehicle`, `WorldObject`.

### NetworkAIParams

`zombie.network.NetworkAIParams`, class.

Static functions, called as `NetworkAIParams.name(...)`:

- `Init(): void`
- `isShowConnectionInfo(): boolean`
- `isShowServerInfo(): boolean`
- `setShowConnectionInfo(boolean enabled): void`
- `setShowServerInfo(boolean enabled): void`

Constructors: `NetworkAIParams.new()`.

Static fields (a copy of the value taken when the class is exposed): `ANIMAL_CLOSE_TO_REAL_DISTANCE: float`, `ANIMAL_PREDICT_INTERVAL: int`, `ANIMAL_PREDICT_UPDATE_LIMIT: float`, `CHARACTER_EXTRAPOLATION_UPDATE_INTERVAL_MS: int`, `CHARACTER_PREDICTION_INTERVAL_MS: int`, `CHARACTER_UPDATE_RATE_MS: int`, `MAX_CONNECTIONS: int`, `MAX_RECONNECT_DISTANCE_SQ: float`, `MAX_TOWING_CAR_DISTANCE_SQ: float`, `MAX_TOWING_TRAILER_DISTANCE_SQ: float`, `NUM_CONNECTION_INDICES: int`, `TOWING_DISTANCE: float`, `VEHICLE_BUFFER_DELAY_MS: int`, `VEHICLE_BUFFER_HISTORY_MS: int`, `VEHICLE_DELAY_HIGH_PING_MULTIPLIXER: float`, `VEHICLE_DELAY_NORMALISE_PER_SEC: float`, `VEHICLE_DELAY_SLOWING_DOWN_DELAY_MULTIPLIXER: float`, `VEHICLE_DELAY_TUNE_MULTIPLIXER: float`, `VEHICLE_DELAY_TUNE_PER_SEC: float`, `VEHICLE_HIGH_PING_COUNT: int`, `VEHICLE_MOVING_MP_PHYSIC_UPDATE_RATE: int`, `VEHICLE_MP_PHYSIC_UPDATE_RATE: int`, `VEHICLE_SPEED_CAP: int`, `ZOMBIE_ANTICIPATORY_UPDATE_MULTIPLIER: float`, `ZOMBIE_MAX_UPDATE_INTERVAL_MS: int`, `ZOMBIE_MIN_UPDATE_INTERVAL_MS: int`, `ZOMBIE_OWNERSHIP_INTERVAL: int`, `ZOMBIE_REMOVE_INTERVAL_MS: int`, `ZOMBIE_TELEPORT_DISTANCE_SQ: int`, `ZOMBIE_TELEPORT_PLAYER: int`, `ZOMBIE_UPDATE_INFO_BUNCH_RATE_MS: int`.

### BodyPartSyncPacket

`zombie.network.packets.BodyPartSyncPacket`, class.

Methods, called as `obj:name(...)`:

- `getClassDescription(StringBuilder s, Class<?> cls, HashSet<Object> excludedObjects): void` from `IDescriptor`
- `getDescription(): String` from `IDescriptor`
- `getDescription(HashSet<Object> excludedObjects): String` from `IDescriptor`
- `getPacketSizeBytes(): int` from `INetworkPacketField`
- `isConsistent(IConnection connection): boolean` from `INetworkPacketField`
- `isPostponed(): boolean` from `INetworkPacket`
- `logInconsistentPacket(IConnection connection, PacketTypes.PacketType packetType): void` from `INetworkPacket`
- `parse(ByteBufferReader b, IConnection connection): void`
- `parseClient(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `parseClientLoading(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `parseServer(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `postpone(): void` from `INetworkPacket`
- `processClient(UdpConnection connection): void` from `INetworkPacket`
- `processClientLoading(UdpConnection connection): void` from `INetworkPacket`
- `processServer(PacketTypes.PacketType packetType, UdpConnection connection): void` from `INetworkPacket`
- `sendToClient(PacketTypes.PacketType packetType, String username): void` from `INetworkPacket`
- `sendToClient(PacketTypes.PacketType packetType, IConnection connection): void` from `INetworkPacket`
- `sendToClients(PacketTypes.PacketType packetType, UdpConnection excluded): void` from `INetworkPacket`
- `sendToRelativeClients(PacketTypes.PacketType packetType, UdpConnection excluded, float x, float y): void` from `INetworkPacket`
- `sendToServer(PacketTypes.PacketType packetType): void` from `INetworkPacket`
- `setData(Object... values): void`
- `shouldInstantiate(): boolean` from `INetworkPacket`
- `sync(PacketTypes.PacketType packetType, UdpConnection connection): void` from `INetworkPacket`
- `write(ByteBufferWriter b): void`

Constructors: `BodyPartSyncPacket.new()`.

Static fields (a copy of the value taken when the class is exposed): `BD_BodyDamage: long`, `BD_Health: long`, `BD_IsBleedingStemmed: long`, `BD_IsCauterized: long`, `BD_IsFakeInfected: long`, `BD_IsInfected: long`, `BD_additionalPain: long`, `BD_alcoholLevel: long`, `BD_alcoholicBandage: long`, `BD_bandageLife: long`, `BD_bandageType: long`, `BD_bandaged: long`, `BD_biteTime: long`, `BD_bitten: long`, `BD_bleeding: long`, `BD_bleedingTime: long`, `BD_burnTime: long`, `BD_comfreyFactor: long`, `BD_cut: long`, `BD_cutTime: long`, `BD_deepWoundTime: long`, `BD_deepWounded: long`, `BD_fractureTime: long`, `BD_garlicFactor: long`, `BD_getBandageXp: long`, `BD_getSplintXp: long`, `BD_getStitchXp: long`, `BD_haveBullet: long`, `BD_haveGlass: long`, `BD_infectedWound: long`, `BD_lastTimeBurnWash: long`, `BD_needBurnWash: long`, `BD_plantainFactor: long`, `BD_scratchTime: long`, `BD_scratched: long`, `BD_splint: long`, `BD_splintFactor: long`, `BD_splintItem: long`, `BD_stiffness: long`, `BD_stitchTime: long`, `BD_stitched: long`, `BD_woundInfectionLevel: long`.

### NetTimedActionPacket

`zombie.network.packets.NetTimedActionPacket`, class. Extends [NetTimedAction](/pz/build-42/modding/reference/lua-classes-game-and-core-1#nettimedaction). Also has the methods of [NetTimedAction](/pz/build-42/modding/reference/lua-classes-game-and-core-1#nettimedaction) (7), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getClassDescription(StringBuilder s, Class<?> cls, HashSet<Object> excludedObjects): void` from `IDescriptor`
- `getDescription(): String` from `IDescriptor`
- `getDescription(HashSet<Object> excludedObjects): String` from `IDescriptor`
- `getPacketSizeBytes(): int` from `INetworkPacketField`
- `isPostponed(): boolean` from `INetworkPacket`
- `logInconsistentPacket(IConnection connection, PacketTypes.PacketType packetType): void` from `INetworkPacket`
- `parseClient(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `parseClientLoading(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `parseServer(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `postpone(): void` from `INetworkPacket`
- `processClient(UdpConnection connection): void`
- `processClientLoading(UdpConnection connection): void` from `INetworkPacket`
- `processServer(PacketTypes.PacketType packetType, UdpConnection connection): void`
- `sendToClient(PacketTypes.PacketType packetType, String username): void` from `INetworkPacket`
- `sendToClient(PacketTypes.PacketType packetType, IConnection connection): void` from `INetworkPacket`
- `sendToClients(PacketTypes.PacketType packetType, UdpConnection excluded): void` from `INetworkPacket`
- `sendToRelativeClients(PacketTypes.PacketType packetType, UdpConnection excluded, float x, float y): void` from `INetworkPacket`
- `sendToServer(PacketTypes.PacketType packetType): void` from `INetworkPacket`
- `setData(Object... values): void`
- `shouldInstantiate(): boolean` from `INetworkPacket`
- `sync(PacketTypes.PacketType packetType, UdpConnection connection): void` from `INetworkPacket`

Static functions, called as `NetTimedActionPacket.name(...)`:

- `createNewAndSend(String actionName, IsoPlayer owner, Object... values): void`

Constructors: `NetTimedActionPacket.new()`.

### SyncPlayerStatsPacket

`zombie.network.packets.SyncPlayerStatsPacket`, class.

Methods, called as `obj:name(...)`:

- `getClassDescription(StringBuilder s, Class<?> cls, HashSet<Object> excludedObjects): void` from `IDescriptor`
- `getDescription(): String` from `IDescriptor`
- `getDescription(HashSet<Object> excludedObjects): String` from `IDescriptor`
- `getPacketSizeBytes(): int` from `INetworkPacketField`
- `isConsistent(IConnection connection): boolean` from `INetworkPacketField`
- `isPostponed(): boolean` from `INetworkPacket`
- `logInconsistentPacket(IConnection connection, PacketTypes.PacketType packetType): void` from `INetworkPacket`
- `parse(ByteBufferReader b, IConnection connection): void`
- `parseClient(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `parseClientLoading(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `parseServer(ByteBufferReader b, UdpConnection connection): void` from `INetworkPacket`
- `postpone(): void` from `INetworkPacket`
- `processClient(UdpConnection connection): void` from `INetworkPacket`
- `processClientLoading(UdpConnection connection): void` from `INetworkPacket`
- `processServer(PacketTypes.PacketType packetType, UdpConnection connection): void` from `INetworkPacket`
- `sendToClient(PacketTypes.PacketType packetType, String username): void` from `INetworkPacket`
- `sendToClient(PacketTypes.PacketType packetType, IConnection connection): void` from `INetworkPacket`
- `sendToClients(PacketTypes.PacketType packetType, UdpConnection excluded): void` from `INetworkPacket`
- `sendToRelativeClients(PacketTypes.PacketType packetType, UdpConnection excluded, float x, float y): void` from `INetworkPacket`
- `sendToServer(PacketTypes.PacketType packetType): void` from `INetworkPacket`
- `setData(Object... values): void`
- `shouldInstantiate(): boolean` from `INetworkPacket`
- `sync(PacketTypes.PacketType packetType, UdpConnection connection): void` from `INetworkPacket`
- `write(ByteBufferWriter b): void`

Static functions, called as `SyncPlayerStatsPacket.name(...)`:

- `getBitMaskForStat(CharacterStat stat): int`

Constructors: `SyncPlayerStatsPacket.new()`.

### PVPLogTool

`zombie.network.PVPLogTool`, class.

Static functions, called as `PVPLogTool.name(...)`:

- `clearEvents(): void`
- `getEvents(): ArrayList<PVPLogTool.PVPEvent>`
- `logCombat(String wielder, String wielderPosition, String target, String targetPosition, float x, float y, float z, String weapon, float damage): void`
- `logKill(IsoPlayer wielder, IsoPlayer target): void`
- `logSafety(IsoPlayer player, String event): void`

### PVPLogTool.PVPEvent

`zombie.network.PVPLogTool.PVPEvent`, class.

Methods, called as `obj:name(...)`:

- `getText(): String`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `isSet(): boolean`
- `reset(String wielder, String target, float x, float y, float z): void`
- `reset(String timestamp, String wielder, String target, float x, float y, float z): void`

Constructors: `PVPLogTool.PVPEvent.new(String wielder, String target, float x, float y, float z)`.

### Server

`zombie.network.Server`, class.

Methods, called as `obj:name(...)`:

- `addAccount(String username, String password, boolean savePwd, boolean userSteamRelay, int authType): void`
- `addAccount(Account account): void`
- `getAccounts(): ArrayList<Account>`
- `getAuthType(): int`
- `getDescription(): String`
- `getDisplayAddress(): String`
- `getDisplayIp(): String`
- `getDisplayPort(): String`
- `getID(): int`
- `getIp(): String`
- `getIp2(): String`
- `getLastDataUpdate(): LocalDateTime`
- `getLastOnline(): LocalDateTime`
- `getLastUpdate(): int`
- `getLastWipe(): long`
- `getLastWipeDate(): String`
- `getLocalIP(): String`
- `getMapName(): String`
- `getMaxPlayers(): String`
- `getMods(): String`
- `getName(): String`
- `getNeedSave(): boolean`
- `getPing(): String`
- `getPlayers(): String`
- `getPort(): int`
- `getPwd(): String`
- `getServerCustomizationLastUpdate(): int`
- `getServerIcon(): Texture`
- `getServerLoadingScreen(): Texture`
- `getServerLoginScreen(): Texture`
- `getServerPassword(): String`
- `getSteamId(): String`
- `getTimeFromServerCustomizationLastUpdate(): int`
- `getUseSteamRelay(): boolean`
- `getUserName(): String`
- `getVersion(): String`
- `isFeatured(): boolean`
- `isHosted(): boolean`
- `isOpen(): boolean`
- `isPasswordProtected(): boolean`
- `isPublic(): boolean`
- `isResponded(): boolean`
- `isSavePwd(): boolean`
- `removeAccount(Account account): void`
- `setAuthType(int authType): void`
- `setDescription(String description): void`
- `setFeatured(boolean featured): void`
- `setHosted(boolean hosted): void`
- `setID(int id): void`
- `setIp(String ip): void`
- `setLastDataUpdate(LocalDateTime lastDataUpdate): void`
- `setLastDataUpdateNow(): void`
- `setLastOnline(LocalDateTime lastOnline): void`
- `setLastOnlineNow(): void`
- `setLastUpdate(int lastUpdate): void`
- `setLastWipe(long lastWipe): void`
- `setLocalIP(String ip): void`
- `setMapName(String mapName): void`
- `setMaxPlayers(String maxPlayers): void`
- `setMods(String mods): void`
- `setName(String name): void`
- `setNeedSave(boolean needSave): void`
- `setOpen(boolean open): void`
- `setPasswordProtected(boolean pp): void`
- `setPing(String ping): void`
- `setPlayers(String players): void`
- `setPort(int port): void`
- `setPublic(boolean bPublic): void`
- `setPwd(String pwd): void`
- `setPwd(String pwd, boolean hashed): void`
- `setResponded(boolean responded): void`
- `setSavePwd(boolean savePwd): void`
- `setServerCustomizationLastUpdate(int serverCustomizationLastUpdate): void`
- `setServerIcon(Texture serverIcon): void`
- `setServerLoadingScreen(Texture serverLoadingScreen): void`
- `setServerLoginScreen(Texture serverLoginScreen): void`
- `setServerPassword(String pwd): void`
- `setSteamId(String steamId): void`
- `setUseSteamRelay(boolean useSteamRelay): void`
- `setUserName(String userName): void`
- `setVersion(String version): void`
- `updateServerCustomizationLastUpdate(): void`

Constructors: `Server.new()`.

### ServerOptions

`zombie.network.ServerOptions`, class.

Methods, called as `obj:name(...)`:

- `addOption(ServerOptions.ServerOption option): void`
- `changeOption(String key, String value): String`
- `getBoolean(String key): Boolean`
- `getDouble(String key): Double`
- `getFloat(String key): Float`
- `getInteger(String key): Integer`
- `getMaxPlayers(): int`
- `getNumOptions(): int`
- `getOption(String key): String`
- `getOptionByIndex(int index): ServerOptions.ServerOption`
- `getOptionByName(String name): ServerOptions.ServerOption`
- `getOptions(): ArrayList<ServerOptions.ServerOption>`
- `getPublicOptions(): ArrayList<String>`
- `init(): void`
- `loadServerTextFile(String serverName): boolean`
- `putOption(String key, String value): void`
- `putSaveOption(String key, String value): void`
- `resetRegionFile(): void`
- `saveServerTextFile(String serverName): boolean`

Static functions, called as `ServerOptions.name(...)`:

- `getClientCommandList(boolean doLine): ArrayList<String>`
- `getInstance(): ServerOptions`
- `getRandomCard(): String`
- `initClientCommandsHelp(): void`

Constructors: `ServerOptions.new()`.

Static fields (a copy of the value taken when the class is exposed): `MAX_PORT: int`, `cardList: ArrayList<String>`, `clientOptionsList: HashMap<String, String>`, `instance: ServerOptions`.

### ServerOptions.BooleanServerOption

`zombie.network.ServerOptions.BooleanServerOption`, class. Extends [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption). Also has the methods of [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption) (12), [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): ConfigOption`
- `getTooltip(): String`

Constructors: `ServerOptions.BooleanServerOption.new(ServerOptions owner, String name, boolean defaultValue)`.

### ServerOptions.DoubleServerOption

`zombie.network.ServerOptions.DoubleServerOption`, class. Extends [DoubleConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#doubleconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), [DoubleConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#doubleconfigoption) (15), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): ConfigOption`
- `getTooltip(): String`

Constructors: `ServerOptions.DoubleServerOption.new(ServerOptions owner, String name, double min, double max, double defaultValue)`.

### ServerOptions.EnumServerOption

`zombie.network.ServerOptions.EnumServerOption`, class. Extends [EnumConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#enumconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), [EnumConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#enumconfigoption) (2), [IntegerConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#integerconfigoption) (13), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): ConfigOption`
- `getTooltip(): String`
- `getValueTranslationByIndex(int index): String`

Constructors: `ServerOptions.EnumServerOption.new(ServerOptions owner, String name, int numValues, int defaultValue)`.

### ServerOptions.IntegerServerOption

`zombie.network.ServerOptions.IntegerServerOption`, class. Extends [IntegerConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#integerconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), [IntegerConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#integerconfigoption) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): ConfigOption`
- `getTooltip(): String`

Constructors: `ServerOptions.IntegerServerOption.new(ServerOptions owner, String name, int min, int max, int defaultValue)`.

### ServerOptions.StringServerOption

`zombie.network.ServerOptions.StringServerOption`, class. Extends [StringConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#stringconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (3), [StringConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#stringconfigoption) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): ConfigOption`
- `getTooltip(): String`

Constructors: `ServerOptions.StringServerOption.new(ServerOptions owner, String name, String defaultValue, int maxLength)`.

### ServerOptions.TextServerOption

`zombie.network.ServerOptions.TextServerOption`, class. Extends [StringConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#stringconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (3), [StringConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#stringconfigoption) (13), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): ConfigOption`
- `getTooltip(): String`
- `getType(): String`

Constructors: `ServerOptions.TextServerOption.new(ServerOptions owner, String name, String defaultValue, int maxLength)`.

### ServerSettings

`zombie.network.ServerSettings`, class.

Methods, called as `obj:name(...)`:

- `addSpawnRegion(String name, String file): void`
- `clearSpawnRegions(): void`
- `deleteFiles(): boolean`
- `duplicateFiles(String newName): boolean`
- `getErrorMsg(): String`
- `getName(): String`
- `getNumSpawnRegions(): int`
- `getSandboxOptions(): SandboxOptions`
- `getServerOptions(): ServerOptions`
- `getSpawnRegionFile(int index): String`
- `getSpawnRegionName(int index): String`
- `isValid(): boolean`
- `loadFiles(): boolean`
- `loadSpawnPointsFile(String file): KahluaTable`
- `removeSpawnRegion(int index): void`
- `rename(String newName): boolean`
- `resetToDefault(): void`
- `saveFiles(): boolean`
- `saveSpawnPointsFile(String file, KahluaTable professionsTable): boolean`

Constructors: `ServerSettings.new(String name)`.

### ServerSettingsManager

`zombie.network.ServerSettingsManager`, class.

Methods, called as `obj:name(...)`:

- `getNameInSettingsFolder(String name): String`
- `getSettingsByIndex(int index): ServerSettings`
- `getSettingsCount(): int`
- `getSettingsFolder(): String`
- `getSuffixes(): ArrayList<String>`
- `isValidName(String name): boolean`
- `isValidNewName(String newName): boolean`
- `readAllSettings(): void`
- `settingsFolderNameValidLength(String filename): boolean`
- `settingsFolderPathValidLength(String filename): boolean`
- `settingsFolderValidLengthChecks(String filename): boolean`

Constructors: `ServerSettingsManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: ServerSettingsManager`.

### Userlog

`zombie.network.Userlog`, class.

Methods, called as `obj:name(...)`:

- `getAmount(): int`
- `getIssuedBy(): String`
- `getLastUpdate(): String`
- `getText(): String`
- `getType(): String`
- `getUsername(): String`
- `setAmount(int amount): void`
- `write(ByteBufferWriter output): void`

Constructors: `Userlog.new(String username, String type, String text, String issuedBy, int amount, String lastUpdate)`, `Userlog.new(ByteBufferReader input)`.

### Userlog.UserlogType

`zombie.network.Userlog.UserlogType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `index(): int`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `Userlog.UserlogType.name(...)`:

- `FromString(String str): Userlog.UserlogType`
- `fromIndex(int value): Userlog.UserlogType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): Userlog.UserlogType`
- `values(): Userlog.UserlogType[]`

Enum values (read as `Userlog.UserlogType.VALUE`): `AdminLog`, `Banned`, `DupeItem`, `Kicked`, `LuaChecksum`, `SuspiciousActivity`, `UnauthorizedPacket`, `WarningPoint`.

### WarManager

`zombie.network.WarManager`, class.

Static functions, called as `WarManager.name(...)`:

- `clear(): void`
- `getStartDelay(): long`
- `getWar(int onlineID, String attacker): WarManager.War`
- `getWarDuration(): long`
- `getWarNearest(IsoPlayer player): WarManager.War`
- `getWarRelevent(IsoPlayer player): ArrayList<WarManager.War>`
- `isWarClaimed(int onlineID): boolean`
- `isWarClaimed(String username): boolean`
- `isWarStarted(int onlineID, String username): boolean`
- `removeWar(int onlineID, String attacker): void`
- `sendWarToPlayer(IsoPlayer player): void`
- `update(): void`
- `updateWar(int onlineId, String attacker, WarManager.State state, long timestamp): void`

### WarManager.State

`zombie.network.WarManager.State`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `WarManager.State.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(int ordinal): WarManager.State`
- `valueOf(String): WarManager.State`
- `values(): WarManager.State[]`

Enum values (read as `WarManager.State.VALUE`): `Accepted`, `Blocked`, `Canceled`, `Claimed`, `Ended`, `Refused`, `Started`.

### WarManager.War

`zombie.network.WarManager.War`, class.

Methods, called as `obj:name(...)`:

- `getAttacker(): String`
- `getDefender(): String`
- `getOnlineID(): int`
- `getState(): WarManager.State`
- `getTime(): String`
- `getTimestamp(): long`
- `isValidState(WarManager.State state): boolean`
- `setState(WarManager.State state): void`
- `setTimestamp(long timestamp): void`

Constructors: `WarManager.War.new(int onlineId, String attacker, WarManager.State state, long timestamp)`.
