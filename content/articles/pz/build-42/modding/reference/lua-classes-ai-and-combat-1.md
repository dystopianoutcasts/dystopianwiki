---
slug: lua-classes-ai-and-combat-1
title: 'Lua Classes: AI states and combat, part 1 of 2 (Build 42.21)'
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
excerpt: 'The exposed ai states and combat classes of Build 42.21 (part 1 of 2): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: AI states and combat, part 1 of 2

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The state machine that drives characters (each state a class) and the combat helpers.

This page holds 42 classes and 1,603 methods, part 1 of 2 of this area (from `MapKnowledge` to `WalkTowardState`), from the packages `zombie.ai`, `zombie.ai.sadisticAIDirector`, `zombie.ai.states`, `zombie.ai.states.player`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### MapKnowledge

`zombie.ai.MapKnowledge`, class.

Methods, called as `obj:name(...)`:

- `forget(): void`
- `getKnownBlockedEdges(): ArrayList<KnownBlockedEdges>`
- `getKnownBlockedEdges(int x, int y, int z): KnownBlockedEdges`
- `getOrCreateKnownBlockedEdges(int x, int y, int z): KnownBlockedEdges`
- `setKnownBlockedDoor(IsoDoor object, boolean blocked): void`
- `setKnownBlockedDoor(IsoThumpable object, boolean blocked): void`
- `setKnownBlockedEdgeN(int x, int y, int z, boolean blocked): void`
- `setKnownBlockedEdgeW(int x, int y, int z, boolean blocked): void`
- `setKnownBlockedWindow(IsoWindow object, boolean blocked): void`
- `setKnownBlockedWindowFrame(IsoWindowFrame object, boolean blocked): void`

Constructors: `MapKnowledge.new()`.

### SleepingEvent

`zombie.ai.sadisticAIDirector.SleepingEvent`, class.

Methods, called as `obj:name(...)`:

- `setPlayerFallAsleep(IsoPlayer chr, int sleepingTime): void`
- `setPlayerFallAsleep(IsoPlayer chr, int sleepingTime, boolean forceZombieEvent, boolean forceNightmareEvent): void`
- `update(IsoPlayer chr): void`
- `wakeUp(IsoGameCharacter chr): void`
- `wakeUp(IsoGameCharacter chr, boolean remote): void`

Constructors: `SleepingEvent.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: SleepingEvent`, `zombiesInvasion: boolean`.

### AttackState

`zombie.ai.states.AttackState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `AttackState.name(...)`:

- `instance(): AttackState`

Static fields (a copy of the value taken when the class is exposed): `SKIP_TEST_DEFENCE: State.Param<Boolean>`.

### BurntToDeath

`zombie.ai.states.BurntToDeath`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `BurntToDeath.name(...)`:

- `instance(): BurntToDeath`

### ClimbDownSheetRopeState

`zombie.ai.states.ClimbDownSheetRopeState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter isoGameCharacter): void`
- `execute(IsoGameCharacter isoGameCharacter): void`
- `exit(IsoGameCharacter isoGameCharacter): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter isoGameCharacter, State.Stage stage): void`

Static functions, called as `ClimbDownSheetRopeState.name(...)`:

- `instance(): ClimbDownSheetRopeState`

Static fields (a copy of the value taken when the class is exposed): `CLIMB: State.Param<Boolean>`, `SPEED: State.Param<Float>`.

### ClimbOverFenceState

`zombie.ai.states.ClimbOverFenceState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`
- `setParams(IsoGameCharacter owner, IsoDirections dir): void`

Static functions, called as `ClimbOverFenceState.name(...)`:

- `instance(): ClimbOverFenceState`

Static fields (a copy of the value taken when the class is exposed): `COLLIDABLE: State.Param<Boolean>`, `COUNTER: State.Param<Boolean>`, `DIR: State.Param<IsoDirections>`, `END_X: State.Param<Integer>`, `END_Y: State.Param<Integer>`, `OUTCOME: State.Param<String>`, `PREV_STATE: State.Param<State>`, `RUN: State.Param<Boolean>`, `SCRATCH: State.Param<Boolean>`, `SHEET_ROPE: State.Param<Boolean>`, `SOLID_FLOOR: State.Param<Boolean>`, `SPRINT: State.Param<Boolean>`, `START_X: State.Param<Integer>`, `START_Y: State.Param<Integer>`, `Z: State.Param<Integer>`, `ZOMBIE_ON_FLOOR: State.Param<Boolean>`.

### ClimbOverWallState

`zombie.ai.states.ClimbOverWallState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`
- `setParams(IsoGameCharacter owner, IsoDirections dir): void`

Static functions, called as `ClimbOverWallState.name(...)`:

- `instance(): ClimbOverWallState`

Static fields (a copy of the value taken when the class is exposed): `DIR: State.Param<IsoDirections>`, `END_X: State.Param<Integer>`, `END_Y: State.Param<Integer>`, `START_X: State.Param<Integer>`, `START_Y: State.Param<Integer>`, `STRAIN: State.Param<Float>`, `STRUGGLE: State.Param<Boolean>`, `SUCCESS: State.Param<Boolean>`, `Z: State.Param<Integer>`.

### ClimbSheetRopeState

`zombie.ai.states.ClimbSheetRopeState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `debug(IsoGameCharacter isoGameCharacter): void`
- `enter(IsoGameCharacter isoGameCharacter): void`
- `execute(IsoGameCharacter isoGameCharacter): void`
- `exit(IsoGameCharacter isoGameCharacter): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter isoGameCharacter, State.Stage stage): void`

Static functions, called as `ClimbSheetRopeState.name(...)`:

- `applyIdealDirection(IsoGameCharacter isoGameCharacter): void`
- `createClimbData(IsoGameCharacter isoGameCharacter): void`
- `instance(): ClimbSheetRopeState`
- `setIdealDirection(IsoGameCharacter isoGameCharacter): void`

Static fields (a copy of the value taken when the class is exposed): `CLIMB: State.Param<Boolean>`, `ClimbSlowdown: float`, `ClimbSpeed: float`, `FallChanceBase: float`, `FallChanceMultiplier: float`, `SPEED: State.Param<Float>`.

### ClimbThroughWindowState

`zombie.ai.states.ClimbThroughWindowState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `getPositioningParams(IsoGameCharacter owner): ClimbThroughWindowPositioningParams`
- `getWindow(IsoGameCharacter owner): IsoObject`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isPastInnerEdgeOfSquare(IsoGameCharacter owner, int x, int y, IsoDirections moveDir): boolean`
- `isPastOuterEdgeOfSquare(IsoGameCharacter owner, int x, int y, IsoDirections moveDir): boolean`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `isWindowClosing(IsoGameCharacter owner): boolean`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`
- `setParams(IsoGameCharacter owner, IsoObject obj): void`

Static functions, called as `ClimbThroughWindowState.name(...)`:

- `getClimbThroughWindowPositioningParams(IsoGameCharacter climbingCharacter, IsoObject windowObject, ClimbThroughWindowPositioningParams climbParams): void`
- `getFreeSquareAfterObstacles(IsoGridSquare square, IsoDirections dir): IsoGridSquare`
- `instance(): ClimbThroughWindowState`
- `isFreeSquare(IsoGridSquare square): boolean`
- `isObstacleSquare(IsoGridSquare square): boolean`
- `slideCharacterToWindowOpening(IsoGameCharacter character, ClimbThroughWindowPositioningParams positioningParams): void`
- `slideX(IsoGameCharacter owner, float x): void`
- `slideY(IsoGameCharacter owner, float y): void`

Static fields (a copy of the value taken when the class is exposed): `OUTCOME: State.Param<String>`, `PARAMS: State.Param<ClimbThroughWindowPositioningParams>`, `PREV_STATE: State.Param<State>`, `SCRATCHED: State.Param<Boolean>`, `ZOMBIE_ON_FLOOR: State.Param<Boolean>`.

### CloseWindowState

`zombie.ai.states.CloseWindowState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `getWindow(IsoGameCharacter owner): IsoWindow`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `CloseWindowState.name(...)`:

- `instance(): CloseWindowState`

Static fields (a copy of the value taken when the class is exposed): `ISO_WINDOW: State.Param<IsoWindow>`.

### CrawlingZombieTurnState

`zombie.ai.states.CrawlingZombieTurnState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `CrawlingZombieTurnState.name(...)`:

- `calculateDir(IsoGameCharacter owner, IsoDirections targetDir): boolean`
- `instance(): CrawlingZombieTurnState`

### FakeDeadAttackState

`zombie.ai.states.FakeDeadAttackState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `FakeDeadAttackState.name(...)`:

- `instance(): FakeDeadAttackState`

### FakeDeadZombieState

`zombie.ai.states.FakeDeadZombieState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `FakeDeadZombieState.name(...)`:

- `instance(): FakeDeadZombieState`

### FishingState

`zombie.ai.states.FishingState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `FishingState.name(...)`:

- `instance(): FishingState`

Static fields (a copy of the value taken when the class is exposed): `AIM: State.Param<Boolean>`, `FISHING_FINISHED: State.Param<Boolean>`, `FISHING_STAGE: State.Param<String>`, `FISHING_X: State.Param<String>`, `FISHING_Y: State.Param<String>`.

### FitnessState

`zombie.ai.states.FitnessState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `FitnessState.name(...)`:

- `instance(): FitnessState`

Static fields (a copy of the value taken when the class is exposed): `EXERCISE_ENDED: State.Param<Boolean>`, `EXERCISE_HAND: State.Param<String>`, `EXERCISE_TYPE: State.Param<String>`, `FITNESS_FINISHED: State.Param<Boolean>`, `FITNESS_SPEED: State.Param<Float>`, `FITNESS_STRUGGLE: State.Param<Boolean>`.

### IdleState

`zombie.ai.states.IdleState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `IdleState.name(...)`:

- `instance(): IdleState`

### LungeState

`zombie.ai.states.LungeState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter chr): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `LungeState.name(...)`:

- `instance(): LungeState`

Static fields (a copy of the value taken when the class is exposed): `TICK_COUNT: State.Param<Long>`.

### OpenWindowState

`zombie.ai.states.OpenWindowState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`
- `setParams(IsoGameCharacter owner, IsoWindow window): void`

Static functions, called as `OpenWindowState.name(...)`:

- `instance(): OpenWindowState`

Static fields (a copy of the value taken when the class is exposed): `WINDOW: State.Param<IsoWindow>`.

### PathFindState

`zombie.ai.states.PathFindState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `PathFindState.name(...)`:

- `instance(): PathFindState`

Static fields (a copy of the value taken when the class is exposed): `TICK_COUNT: State.Param<Long>`.

### PlayerMilkAnimalState

`zombie.ai.states.player.PlayerMilkAnimalState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerMilkAnimalState.name(...)`:

- `instance(): PlayerMilkAnimalState`

Static fields (a copy of the value taken when the class is exposed): `ANIMAL: State.Param<String>`, `ANIMAL_SIZE: State.Param<Float>`, `MILK_ANIM: State.Param<String>`, `MILK_ANIMAL: State.Param<Boolean>`.

### PlayerMovementState

`zombie.ai.states.player.PlayerMovementState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerMovementState.name(...)`:

- `instance(): PlayerMovementState`

Static fields (a copy of the value taken when the class is exposed): `RUN: State.Param<Boolean>`, `SPRINT: State.Param<Boolean>`.

### PlayerPetAnimalState

`zombie.ai.states.player.PlayerPetAnimalState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerPetAnimalState.name(...)`:

- `instance(): PlayerPetAnimalState`

Static fields (a copy of the value taken when the class is exposed): `ANIMAL: State.Param<String>`, `ANIMAL_SIZE: State.Param<Float>`, `PET_ANIMAL: State.Param<Boolean>`.

### PlayerShearAnimalState

`zombie.ai.states.player.PlayerShearAnimalState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerShearAnimalState.name(...)`:

- `instance(): PlayerShearAnimalState`

Static fields (a copy of the value taken when the class is exposed): `ANIMAL: State.Param<String>`, `ANIMAL_SIZE: State.Param<Float>`, `SHEAR_ANIMAL: State.Param<Boolean>`.

### PlayerActionsState

`zombie.ai.states.PlayerActionsState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerActionsState.name(...)`:

- `instance(): PlayerActionsState`

Static fields (a copy of the value taken when the class is exposed): `OVERRIDE: State.Param<Boolean>`, `PRIMARY: State.Param<String>`, `RELOAD_SPEED: State.Param<Float>`, `SECONDARY: State.Param<String>`, `SITONGROUND: State.Param<Boolean>`, `STAGE: State.Param<State.Stage>`, `VARIABLES: State.Param<Variables>`.

### PlayerAimState

`zombie.ai.states.PlayerAimState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerAimState.name(...)`:

- `instance(): PlayerAimState`

Static fields (a copy of the value taken when the class is exposed): `AIM: State.Param<Boolean>`, `AIM_FLOOR: State.Param<Boolean>`, `AIM_FLOOR_DISTANCE: State.Param<Float>`.

### PlayerEmoteState

`zombie.ai.states.PlayerEmoteState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerEmoteState.name(...)`:

- `instance(): PlayerEmoteState`

Static fields (a copy of the value taken when the class is exposed): `EMOTE: State.Param<String>`, `LOOPING_SOUND: State.Param<String>`, `PLAYING: State.Param<Boolean>`.

### PlayerExtState

`zombie.ai.states.PlayerExtState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerExtState.name(...)`:

- `instance(): PlayerExtState`

Static fields (a copy of the value taken when the class is exposed): `EXT: State.Param<String>`, `EXT_PLAYING: State.Param<Boolean>`.

### PlayerFallDownState

`zombie.ai.states.PlayerFallDownState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerFallDownState.name(...)`:

- `instance(): PlayerFallDownState`

Static fields (a copy of the value taken when the class is exposed): `DEAD: State.Param<Boolean>`, `KNOCKED_DOWN: State.Param<Boolean>`, `ON_FLOOR: State.Param<Boolean>`.

### PlayerFallingState

`zombie.ai.states.PlayerFallingState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerFallingState.name(...)`:

- `instance(): PlayerFallingState`

Static fields (a copy of the value taken when the class is exposed): `CLIMBING: State.Param<Boolean>`, `LANDING_IMPACT: State.Param<Float>`.

### PlayerGetUpState

`zombie.ai.states.PlayerGetUpState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerGetUpState.name(...)`:

- `instance(): PlayerGetUpState`

Static fields (a copy of the value taken when the class is exposed): `FORCE: State.Param<Boolean>`, `ISO_DIRECTION: State.Param<IsoDirections>`, `MOVING: State.Param<Boolean>`.

### PlayerHitReactionPVPState

`zombie.ai.states.PlayerHitReactionPVPState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `PlayerHitReactionPVPState.name(...)`:

- `instance(): PlayerHitReactionPVPState`

### PlayerHitReactionState

`zombie.ai.states.PlayerHitReactionState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `PlayerHitReactionState.name(...)`:

- `instance(): PlayerHitReactionState`

### PlayerKnockedDown

`zombie.ai.states.PlayerKnockedDown`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `PlayerKnockedDown.name(...)`:

- `instance(): PlayerKnockedDown`

### PlayerOnGroundState

`zombie.ai.states.PlayerOnGroundState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `PlayerOnGroundState.name(...)`:

- `instance(): PlayerOnGroundState`

### PlayerSitOnFurnitureState

`zombie.ai.states.PlayerSitOnFurnitureState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `abortSitting(IsoGameCharacter owner): void`
- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerSitOnFurnitureState.name(...)`:

- `instance(): PlayerSitOnFurnitureState`

Static fields (a copy of the value taken when the class is exposed): `BEFORE_SIT_DIR: State.Param<String>`, `DIR: State.Param<IsoDirections>`, `SIT_OBJECT: State.Param<IsoObject>`.

### PlayerSitOnGroundState

`zombie.ai.states.PlayerSitOnGroundState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerSitOnGroundState.name(...)`:

- `instance(): PlayerSitOnGroundState`

Static fields (a copy of the value taken when the class is exposed): `CHANGE_ANIM: State.Param<Long>`, `CHECK_FIRE: State.Param<Long>`, `FIRE: State.Param<Boolean>`, `SITGROUNDANIM: State.Param<String>`.

### PlayerStrafeState

`zombie.ai.states.PlayerStrafeState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `PlayerStrafeState.name(...)`:

- `instance(): PlayerStrafeState`

Static fields (a copy of the value taken when the class is exposed): `AIM: State.Param<Boolean>`, `STRAFE_SPEED: State.Param<Float>`.

### SmashWindowState

`zombie.ai.states.SmashWindowState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `SmashWindowState.name(...)`:

- `instance(): SmashWindowState`

Static fields (a copy of the value taken when the class is exposed): `CLIMB_THROUGH_WINDOW: State.Param<Boolean>`, `ISO_WINDOW: State.Param<IsoWindow>`, `SCRATCHED: State.Param<Boolean>`, `VEHICLE: State.Param<BaseVehicle>`, `VEHICLE_PART: State.Param<VehiclePart>`, `VEHICLE_WINDOW: State.Param<VehicleWindow>`.

### StaggerBackState

`zombie.ai.states.StaggerBackState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMaxStaggerTime(IsoGameCharacter owner): float`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `StaggerBackState.name(...)`:

- `instance(): StaggerBackState`

### SwipeStatePlayer

`zombie.ai.states.SwipeStatePlayer`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `State`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void`

Static functions, called as `SwipeStatePlayer.name(...)`:

- `dbgOnGlobalAnimEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `instance(): SwipeStatePlayer`
- `isStompingDisabled(IsoGameCharacter owner, boolean doShove): boolean`

Static fields (a copy of the value taken when the class is exposed): `ATTACKED: State.Param<Boolean>`, `DO_CONTINUE_GRAPPLE: State.Param<Boolean>`, `DO_GRAPPLE: State.Param<Boolean>`, `GRAPPLING_TARGET: State.Param<IGrappleable>`, `GRAPPLING_TYPE: State.Param<String>`, `IS_GRAPPLE_WINDOW: State.Param<Boolean>`, `IS_THROWING: State.Param<Boolean>`, `LOWER_CONDITION: State.Param<Boolean>`, `MaxStompDistance: float`.

### ThumpState

`zombie.ai.states.ThumpState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `ThumpState.name(...)`:

- `getFastForwardDamageMultiplier(): int`
- `instance(): ThumpState`

### WalkTowardState

`zombie.ai.states.WalkTowardState`, class. Extends `State`.

Methods, called as `obj:name(...)`:

- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void`
- `awayCheckDistance(IsoGameCharacter owner): float` from `State`
- `calculateTargetLocation(IsoZombie zomb, Vector2 location): boolean`
- `canBeHitByVehicle(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `canRagdoll(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `canSlowDownVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `causesDamageToVehicleWhenHit(IsoGameCharacter owner, BaseVehicle impactingVehicle): boolean` from `IStateFlagsSource`
- `enter(IsoGameCharacter owner): void`
- `execute(IsoGameCharacter owner): void`
- `exit(IsoGameCharacter owner): void`
- `getAnimEventBroadcaster(): AnimEventBroadcaster` from `State`
- `getDeltaModifiers(IsoGameCharacter owner, MoveDeltaModifiers modifiers): void` from `State`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel` from `State`
- `getName(): String` from `State`
- `getParams(IsoGameCharacter owner): Map<State.Param<?>, Object>` from `State`
- `isAttacking(IsoGameCharacter owner): boolean` from `IStateFlagsSource`
- `isDoingActionThatCanBeCancelled(): boolean` from `IStateFlagsSource`
- `isIgnoreCollide(IsoGameCharacter owner, int fromX, int fromY, int fromZ, int toX, int toY, int toZ): boolean` from `State`
- `isMoving(IsoGameCharacter owner): boolean`
- `isProcessedOnEnter(): boolean` from `State`
- `isProcessedOnExit(): boolean` from `State`
- `isSyncInIdle(): boolean` from `State`
- `isSyncOnEnter(): boolean` from `State`
- `isSyncOnExit(): boolean` from `State`
- `isSyncOnSquare(): boolean` from `State`
- `loadFrom(Map<Object, Object> delegate, IsoGameCharacter character): void` from `State`
- `processOnEnter(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `processOnExit(IsoGameCharacter owner, Map<Object, Object> delegate): void` from `State`
- `setParams(IsoGameCharacter owner, State.Stage stage): void` from `State`

Static functions, called as `WalkTowardState.name(...)`:

- `instance(): WalkTowardState`

Static fields (a copy of the value taken when the class is exposed): `IGNORE_OFFSET: State.Param<Boolean>`, `IGNORE_TIME: State.Param<Long>`, `TICK_COUNT: State.Param<Long>`.
