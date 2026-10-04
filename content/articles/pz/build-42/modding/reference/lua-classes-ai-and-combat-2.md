---
slug: lua-classes-ai-and-combat-2
title: 'Lua Classes: AI states and combat, part 2 of 2 (Build 42.21)'
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
excerpt: 'The exposed ai states and combat classes of Build 42.21 (part 2 of 2): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: AI states and combat, part 2 of 2

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The state machine that drives characters (each state a class) and the combat helpers.

This page holds 10 classes and 306 methods, part 2 of 2 of this area (from `ZombieFallDownState` to `CombatConfigKey`), from the packages `zombie.ai.states`, `zombie.combat`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### ZombieFallDownState

`zombie.ai.states.ZombieFallDownState`, class. Extends `State`.

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

Static functions, called as `ZombieFallDownState.name(...)`:

- `instance(): ZombieFallDownState`

### ZombieGetDownState

`zombie.ai.states.ZombieGetDownState`, class. Extends `State`.

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
- `isNearStartXY(IsoGameCharacter owner): boolean`
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
- `setParams(IsoGameCharacter owner): void`

Static functions, called as `ZombieGetDownState.name(...)`:

- `instance(): ZombieGetDownState`

Static fields (a copy of the value taken when the class is exposed): `PREV_STATE: State.Param<State>`, `START_X: State.Param<Float>`, `START_Y: State.Param<Float>`, `WAIT_TIME: State.Param<Float>`.

### ZombieGetUpState

`zombie.ai.states.ZombieGetUpState`, class. Extends `State`.

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
- `enter(IsoGameCharacter chrOwner): void`
- `execute(IsoGameCharacter owner): void` from `State`
- `exit(IsoGameCharacter chrOwner): void`
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

Static functions, called as `ZombieGetUpState.name(...)`:

- `instance(): ZombieGetUpState`

Static fields (a copy of the value taken when the class is exposed): `PREV_STATE: State.Param<State>`.

### ZombieIdleState

`zombie.ai.states.ZombieIdleState`, class. Extends `State`.

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

Static functions, called as `ZombieIdleState.name(...)`:

- `instance(): ZombieIdleState`

Static fields (a copy of the value taken when the class is exposed): `TICK_COUNT: State.Param<Long>`.

### ZombieOnGroundState

`zombie.ai.states.ZombieOnGroundState`, class. Extends `State`.

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

Static functions, called as `ZombieOnGroundState.name(...)`:

- `instance(): ZombieOnGroundState`
- `isCharacterStandingOnOther(IsoGameCharacter chrStanding, IsoGameCharacter chrProne): boolean`
- `startReanimateTimer(IsoZombie ownerZombie): void`

### ZombieReanimateState

`zombie.ai.states.ZombieReanimateState`, class. Extends `State`.

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

Static functions, called as `ZombieReanimateState.name(...)`:

- `instance(): ZombieReanimateState`

### ZombieSittingState

`zombie.ai.states.ZombieSittingState`, class. Extends `State`.

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

Static functions, called as `ZombieSittingState.name(...)`:

- `instance(): ZombieSittingState`

### CombatConfig

`zombie.combat.CombatConfig`, class.

Methods, called as `obj:name(...)`:

- `get(CombatConfigKey combatConfigKey): float`
- `getByCategory(CombatConfigCategory combatConfigCategory): Map<CombatConfigKey, Float>`
- `set(CombatConfigKey combatConfigKey, float value): void`

Constructors: `CombatConfig.new()`.

### CombatConfigCategory

`zombie.combat.CombatConfigCategory`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CombatConfigCategory.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CombatConfigCategory`
- `values(): CombatConfigCategory[]`

Enum values (read as `CombatConfigCategory.VALUE`): `BALLISTICS`, `FIREARM`, `GENERAL`, `MELEE`.

### CombatConfigKey

`zombie.combat.CombatConfigKey`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getCategory(): CombatConfigCategory`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getDefaultValue(): float`
- `getMaximum(): float`
- `getMinimum(): float`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CombatConfigKey.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CombatConfigKey`
- `values(): CombatConfigKey[]`

Enum values (read as `CombatConfigKey.VALUE`): `ADDITIONAL_CRITICAL_HIT_CHANCE_DEFAULT`, `ADDITIONAL_CRITICAL_HIT_CHANCE_FROM_BEHIND`, `ARM_PAIN_TO_HIT_MODIFIER`, `BALLISTICS_CONTROLLER_DISTANCE_THRESHOLD`, `BASE_WEAPON_DAMAGE_MULTIPLIER`, `DAMAGE_PENALTY_ONE_HANDED_TWO_HANDED_WEAPON_MULTIPLIER`, `DRIVEBY_DOT_MAXIMUM_ANGLE`, `DRIVEBY_DOT_OPTIMAL_ANGLE`, `DRIVEBY_DOT_TO_HIT_MAXIMUM_PENALTY`, `DRUNK_TO_HIT_BASE_PENALTY`, `DRUNK_TO_HIT_DISTANCE_MODIFIER`, `ENDURANCE_LOSS_BASE_SCALE`, `ENDURANCE_LOSS_CLOSE_KILL_MODIFIER`, `ENDURANCE_LOSS_FINAL_MULTIPLIER`, `ENDURANCE_LOSS_FLOOR_SHOVE_MULTIPLIER`, `ENDURANCE_LOSS_TWO_HANDED_PENALTY_DIVISOR`, `ENDURANCE_LOSS_TWO_HANDED_PENALTY_SCALE`, `ENDURANCE_LOSS_WEIGHT_MODIFIER`, `ENDURANCE_TO_HIT_BASE_PENALTY`, `FIREARM_RECOIL_MUSCLE_STRAIN_MODIFIER`, `FOG_INTENSITY_DISTANCE_MODIFIER`, `GLOBAL_MELEE_DAMAGE_REDUCTION_MULTIPLIER`, `HEAD_HIT_DAMAGE_SPLIT_MODIFIER`, `LEG_HIT_DAMAGE_SPLIT_MODIFIER`, `LOW_LIGHT_THRESHOLD`, `LOW_LIGHT_TO_HIT_MAXIMUM_PENALTY`, `MARKSMAN_TRAIT_TO_HIT_BONUS`, `MAXIMUM_START_TO_HIT_CHANCE`, `MAXIMUM_TO_HIT_CHANCE`, `MINIMUM_TO_HIT_CHANCE`, `MOVING_TO_HIT_PENALTY`, `NON_PLAYER_RECEIVED_DAMAGE_MULTIPLIER`, `OPTIMAL_RANGE_DROP_OFF_TO_HIT_PENALTY`, `OPTIMAL_RANGE_DROP_OFF_TO_HIT_PENALTY_INCREMENT`, `OPTIMAL_RANGE_TO_HIT_MAXIMUM_BONUS`, `PANIC_TO_HIT_BASE_PENALTY`, `PANIC_TO_HIT_DISTANCE_MODIFIER`, `PIERCING_BULLET_DAMAGE_REDUCTION`, `PLAYER_RECEIVED_DAMAGE_MULTIPLIER`, `POINT_BLANK_DISTANCE`, `POINT_BLANK_DROP_OFF_TO_HIT_PENALTY`, `POINT_BLANK_MAXIMUM_DISTANCE_MODIFIER`, `POINT_BLANK_TO_HIT_MAXIMUM_BONUS`, `POST_SHOT_AIMING_DELAY_AIMING_MODIFIER`, `POST_SHOT_AIMING_DELAY_RECOIL_MODIFIER`, `RAIN_INTENSITY_TO_HIT_DISTANCE_MODIFIER`, `RECOIL_DELAY`, `RUNNING_TO_HIT_PENALTY`, `SIGHTLESS_AIM_DELAY_TO_HIT_DISTANCE_MODIFIER`, `SIGHTLESS_TO_HIT_BASE_DISTANCE`, `SIGHTLESS_TO_HIT_PRONE_MODIFIER`, `SPRINTING_TO_HIT_PENALTY`, `STRESS_TO_HIT_BASE_PENALTY`, `STRESS_TO_HIT_DISTANCE_MODIFIER`, `TIRED_TO_HIT_BASE_PENALTY`, `WEAPON_LEVEL_DAMAGE_MULTIPLIER_INCREMENT`, `WIND_INTENSITY_TO_HIT_AIMING_MODIFIER`, `WIND_INTENSITY_TO_HIT_MAXIMUM_MARKSMAN_MODIFIER`, `WIND_INTENSITY_TO_HIT_MINIMUM_MARKSMAN_MODIFIER`, `WIND_INTENSITY_TO_HIT_PENALTY`.
