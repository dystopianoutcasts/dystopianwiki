---
id: build-42-zombies-states-and-the-ai-director
slug: zombies-states-and-the-ai-director
title: 'Zombies: the state machine, who runs them, and the "AI director"'
game: pz
version: build-42
section: modding
category: engine
difficulty: intermediate
tags:
  - engine
  - zombies
  - ai
  - multiplayer
  - sandbox
excerpt: >-
  A zombie is a Java state machine driven by XML transition files, the same
  kind animals use. How a zombie picks what to do, when it walks straight and
  when it asks the pathfinder, which client runs it in multiplayer, and what
  the "sadistic AI director" really is: the sleep interruption system, two of
  whose switches do nothing in 42.21.
last_updated: '2026-10-04'
related_articles:
  - animal-pipeline
  - the-events-system
  - lua-classes-characters-2
  - lua-classes-ai-and-combat-1
  - lua-events
---
# Zombies: the state machine, who runs them, and the "AI director"

Outcast, before you write a mod that touches zombies, it helps to know that a zombie is not one big brain. It is a small Java state machine whose states are chosen by XML files, plus a handful of habits (wander, listen, group up) bolted onto its update. In multiplayer, a zombie near players is run by one player's game, not by the server. And the package called `sadisticAIDirector` turns out to be the thing that wakes you from a nightmare. This page walks through all of it, read from the Build 42.21 code.

## What it does for the player

Zombies shamble about, wander a few steps at a time, drift together into loose groups, turn towards noise, chase what they see, lunge, bite, bang on doors and climb through windows. They forget you after a while. When you sleep, the game may wake you with a nightmare or because a zombie is right next to you.

## Where it lives

| Piece | Where | What it does |
|---|---|---|
| The zombie | `zombie.characters.IsoZombie` (about 6,000 lines) | Per-tick update, sight, hearing, targets, its own rolled stats |
| The state machine | `zombie.ai.StateMachine`, `zombie.characters.component.StateMachineComponent` | Holds the current state and any substates, runs them each tick |
| The states | `zombie.ai.states.*` (`ZombieIdleState`, `WalkTowardState`, `PathFindState`, `LungeState`, `AttackState`, `ThumpState`, `ClimbThroughWindowState` and more) | One Java class per behaviour |
| The transitions | `media/actiongroups/zombie/` (126 state folders) and `media/actiongroups/zombie-crawler/` | XML: "go from this state to that one when these variables are true" |
| Groups | `zombie.ai.ZombieGroupManager` | Rally groups of idle zombies |
| Multiplayer ownership | `zombie.popman.NetworkZombieManager` (server), `zombie.popman.NetworkZombieSimulator` (client) | Which client runs which zombie |
| The "AI director" | `zombie.ai.sadisticAIDirector.SleepingEvent` | Nightmares and wake-ups while a player sleeps |

The off-screen population (virtual zombies, migration, hordes) is a different system: `zombie.popman.ZombiePopulationManager`, whose work is done in the native library `PZPopMan64`, which we cannot read. This page is about zombies that are loaded and walking around near a player.

> **Proof:** Code. `zombie.characters.IsoZombie`, `zombie.ai.StateMachine`, `zombie.characters.component.StateMachineComponent`, `zombie.ai.ZombieGroupManager`, `zombie.popman.NetworkZombieManager`, `zombie.popman.NetworkZombieSimulator`, `zombie.ai.sadisticAIDirector.SleepingEvent` (the whole package is this class and its data class); `zombie.popman.ZombiePopulationManager` declares its work as `native` methods and loads `PZPopMan64`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How a zombie picks a state

This is the part that surprises people. The Java code does not decide "now attack". It sets **variables** (`bMoving`, `bPathfind`, `bLunge`, `bThump`, `alerted` and dozens more), and an XML transition file decides which state those variables lead to. Here is one, the idle-to-pathfind transition, whole:

```xml
<transition>
	<transitionTo>pathfind</transitionTo>
	<conditions>
		<isTrue>bPathfind</isTrue>
		<isFalse>issitting</isFalse>
		<isFalse>bGetUpFromCrawl</isFalse>
		<isFalse>bClient</isFalse>
	</conditions>
</transition>
```

The chain each tick:

1. `IsoZombie#update` runs `IsoZombie#updateInternal`, which fires the Lua event `OnZombieUpdate` and then calls the shared character update.
2. `IsoGameCharacter#update` calls `StateMachine#update`, which runs `execute` on the current state and on every substate. The states set and clear variables.
3. After the update, `IsoGameCharacter#postUpdateAnimating` calls `ActionContext#update`, which reads the variables against the transition files in `media/actiongroups/zombie/<current state>/to_*.xml`.
4. When a transition fires, `StateMachineComponent#actionStateChanged` looks the new state's **name** up in a table that `IsoZombie#initializeStates` filled (`"pathfind"` to `PathFindState`, `"thump"` to `ThumpState`, and so on) and calls `StateMachine#changeState`.
5. `StateMachine#changeRootState` runs `exit` on the old state and `enter` on the new one, then fires the Lua event `OnAIStateChange` with the character, the new state and the old one.

Crawlers use a second action group, `zombie-crawler`, and a smaller name table; a zombie that becomes a crawler swaps groups and re-registers its states on its next update. Animals work the same way, with their own action groups (see [how Build 42 loads and animates an animal](/pz/build-42/modding/farming-and-animals/animal-pipeline)).

> **Proof:** Code. `media/actiongroups/zombie/idle/to_pathfind.xml` (quoted whole); `zombie.characters.IsoZombie#updateInternal` (fires `OnZombieUpdate`, swaps to the `zombie-crawler` group and calls `initializeStates`), `#initializeStates`; `zombie.characters.IsoGameCharacter#updateInternal` (`getStateMachine().update()`), `#postUpdateAnimating` (`getActionContext().update()`); `zombie.characters.component.StateMachineComponent#actionStateChanged`; `zombie.ai.StateMachine#changeRootState` (`OnAIStateChange` with owner, new state, previous state). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Walking straight or asking the pathfinder

When anything asks a zombie to go somewhere (`pathToLocation`, `pathToCharacter`, `pathToSound`), the shared helper `IsoGameCharacter#pathToAux` decides how. If the goal is on the same floor, no more than 30 tiles away counting across plus up (Manhattan distance), the straight line is clear of walls and furniture, and the zombie is not standing on a different staircase, it sets `bMoving` and walks straight (`WalkTowardState`). Otherwise it sets `bPathfind` and the zombie goes into `PathFindState`, which asks the pathfinder for a route. That is why a zombie that can see you through a window walks at the window, and one behind a wall goes around. The pathfinder itself is its own article: [pathfinding and the native library](/pz/build-42/modding/engine/pathfinding-and-the-native-library).

> **Proof:** Code. `zombie.characters.IsoGameCharacter#pathToAux` (`IsoUtils.DistanceManhatten(...) <= 30.0F`, same floor, `PolygonalMap2.instance.lineClearCollide`, the staircase check, then `bPathfind` false plus `setMoving(true)`, or `bPathfind` true); `#pathToLocation`, `#pathToCharacter`, `#pathToSound`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What sets a zombie moving

- **Something it sees.** Each player's line-of-sight pass calls `IsoPlayer#TestZombieSpotPlayer`, which calls `IsoZombie#spotted` for the zombies on squares that player could see. With the default sandbox (`ZombieLore.SpottedLogic` on) that is `spottedNew`, which weighs light on your square, floor difference and view distance. A target is dropped once the zombie has gone longer than its memory without seeing anyone (`timeSinceSeenFlesh` greater than its `memory`).
- **Something it hears.** Only once a zombie has gone a while without seeing anyone does it call `IsoZombie#RespondToSound`, which asks `WorldSoundManager` for the sound that attracts it most and heads for it.
- **Nothing at all.** In `ZombieIdleState` a zombie waits a random pause, then picks a free square up to four tiles away and walks there. The pause is half as long again when it is not raining, so zombies wander more in the rain.
- **Each other.** After a long time with no target and no sound, `ZombieGroupManager` puts idle zombies outside buildings and outside forest zones into rally groups. The leader drifts away from other groups; members stay near the leader. The sandbox options `ZombieConfig.RallyGroupSize`, `RallyGroupSeparation` and `RallyGroupRadius` drive it, and a group size of 1 or less turns it off.

The update also carries a few small habits worth knowing: a zombie standing on a farm plant has a chance each tick to destroy it, a moving zombie on a lit campfire has a small chance to put it out, a zombie with no target next to a car with its siren on bangs on the car, and a zombie next to an alarmed car that nobody has entered has a tiny chance to set the alarm off.

The numbers (how far, how long, what traits and sneaking change) are a gameplay question, answered on [how far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) and [how long a zombie remembers you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you).

> **Proof:** Code. `zombie.characters.IsoPlayer#TestZombieSpotPlayer`; `zombie.characters.IsoZombie#spotted` (`lore.spottedLogic` picks `spottedNew` or `spottedOld`), `#updateInternal` (target cleared when `timeSinceSeenFlesh > memory`; `RespondToSound` only when `timeSinceSeenFlesh > 240` and `timeSinceRespondToSound > 5`; `ZombieGroupManager.instance.update` only when both exceed 2000; farm plant, campfire, siren and alarm checks), `#RespondToSound` (`WorldSoundManager#getSoundZomb`, `#getBiggestSoundZomb`); `zombie.ai.states.ZombieIdleState#execute` and `#pickRandomWanderInterval` (`Rand.Next(400, 1000)`, times 1.5 when `!RainManager.isRaining()`; target within `Rand.Next(8) - 4`); `zombie.ai.ZombieGroupManager#shouldBeInGroup` and `#update`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Every zombie rolls its own stats

`IsoZombie#DoZombieStats` reads the Zombie Lore sandbox options and rolls this zombie's cognition (can it open doors), strength, memory, sight and hearing, then its speed. With a "Random" setting each zombie gets its own value, so two zombies side by side can differ.

None of it is saved with the zombie: on top of what every character saves, a zombie adds only how long since it last saw someone, a few state flags and its worn items. `DoZombieStats` runs when a zombie is created, again when it is loaded from the save, when it turns into a crawler or back, and when it wakes from an inactive phase. So a sandbox change reaches existing zombies the next time they load, and with a Random sight or hearing setting a zombie can come back from a reload seeing or hearing differently. Lua can call `DoZombieStats` too.

> **Proof:** Code. `zombie.characters.IsoZombie#DoZombieStats` (`lore.cognition` with `doorOpeningPercentage`, `lore.strength`, `lore.memory`, `lore.sight`, `lore.hearing`, then `doZombieSpeed` and `initCanCrawlUnderVehicle`; sight and hearing are assigned without a "not yet set" check); `#save` (after `super.save`, writes `timeSinceSeenFlesh`, `ZombieStateFlags` and worn items only; the rolled fields are `IsoZombie`'s own); callers `IsoZombie` constructor, `#load`, `#toggleCrawling`, `#makeInactive`, `#resetForReuse`; `DoZombieStats` is in the exposed method list on [the IsoZombie reference entry](/pz/build-42/modding/reference/lua-classes-characters-2#isozombie). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs, and on which side

**Single player:** everything above runs in your game, every tick, for every loaded zombie.

**Multiplayer:** the server keeps the list of zombies and gives each one an **owner**, a client. That client runs the zombie's movement and most of its decisions (where it walks, what it hears) and sends its state to the server in `ZombieSimulation` packets, up to 300 zombies per packet. Every other client sees the zombie as remote: the transition files send remote zombies to the `*-network` states (`walktoward-network`, `lunge-network`, `attack-network`) through the `bClient` variable, which is true only on a client for a zombie it does not own.

The server picks a zombie's owner in `NetworkZombieManager#updateAuth`, at most once every two seconds per zombie (straight away if it has none). It prefers the player who is grappling the zombie, then the player the zombie is targeting, then the nearest player in range. A closer player only takes over if they are closer by a factor of about 1.618, so ownership does not flicker between two players standing side by side. With no player in range, the zombie has no owner. (The server option `SwitchZombiesOwnershipEachUpdate`, off by default, replaces all of this with handing each zombie to the next connection in turn.)

Two consequences for your code:

- `IsoZombie#RespondToSound` returns at once on a dedicated server. Hearing is decided on the owning client.
- `OnZombieUpdate` fires on the server for the zombies it updates, and on **every** client for every zombie that client has heard about in the last five seconds, owned or not. A change you make there on a client to a zombie you do not own is overwritten by the next update from its owner.

> **Proof:** Code. `zombie.popman.NetworkZombieManager#updateAuth` (`System.currentTimeMillis() - zombie.lastChangeOwner >= 2000L || zombie.getOwner() == null`; grappler, then target, then nearest with `distance > d * 1.618034F`) and `#moveZombie`; `zombie.popman.NetworkZombieSimulator#send` (`ZombieSimulationReliable`, `>= 300`), `#becomeLocal`, `#becomeRemote`; `zombie.characters.IsoZombie#registerVariableCallbacks` (`bClient` is `GameClient.client && this.isRemoteZombie()`), `#RespondToSound` (`if (!GameServer.server)`), `#updateInternal` (`!GameClient.client || !this.isRemoteZombie() || this.remote && this.lastRemoteUpdate <= 5000` before `OnZombieUpdate`); `zombie.VirtualZombieManager#createRealZombieAlways` sets `remote = true` on every zombie a client creates. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

We have read this from the code and not yet watched it on a dedicated server with two players. The test that would settle these ownership rules: two players in range of the same zombie, a server-side Lua `OnZombieUpdate` handler logging `zombie:getOwnerPlayer()` every second, and the server log showing who owns it as the players move apart.

> **Proof:** Unknown. Ownership switching is read from `NetworkZombieManager#updateAuth` only; no dedicated-server log yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The "sadistic AI director" is the sleep system

The package name promises a director that paces the apocalypse. In 42.21 it holds one class, `SleepingEvent`, and what it does is decide whether your sleep gets interrupted. When you go to sleep (the sleep dialog or the bed context menu calls `getSleepingEvent():setPlayerFallAsleep(player, hours)`), it:

- delays the moment you actually fall asleep, by up to two hours of game time depending on pain, stress, insomnia, the bed and sleeping pills;
- rolls a **nightmare**: 5 in 100, plus 10 per level of the stress moodle, plus 5 more with the Desensitized trait (that is what the code says), for sleeps of three hours or more. A nightmare wakes you at a random hour, with panic and stress;
- while you sleep, wakes you at once if a zombie is very close.

There is also code to have zombies break in through the weakest window or an open door while you sleep, weighted by running fridges, a lit stove, a television or radio left on. **In vanilla 42.21 that code never runs**, and two of the switches around it do nothing:

- The intruder branch needs the static field `SleepingEvent.zombiesInvasion` to be true, and nothing in the game ever sets it. So the sandbox option **Sleeping Event** (Never, Sometimes, Often), which only feeds that branch, changes nothing.
- The nightmare roll does not read that sandbox option at all. Setting Sleeping Event to Never does not stop nightmares, whatever its tooltip says.
- The fourth parameter of `setPlayerFallAsleep`, `forceNightmareEvent`, rolls a random number and throws it away.

```java
if (SandboxOptions.instance.sleepingEvent.getValue() != 1 && zombiesInvasion || forceZombieEvent) {
```

The third parameter, `forceZombieEvent`, does work: it bypasses both the static field and the chance roll, as long as you are inside a building, no nightmare was rolled, and the zone you are standing in has no player-built construction. A mod can call `getSleepingEvent():setPlayerFallAsleep(player, hours, true, false)` to force an intrusion. In multiplayer, though, sleep is started from client Lua, and the nightmare roll is skipped on clients (`checkNightmare` starts with `if (!GameClient.client)`), so by the code **nightmares do not happen in multiplayer**, and a forced intrusion would spawn its zombies on the sleeping player's own client. We have not tested what the server makes of zombies a client creates that way, so treat `forceZombieEvent` as single player only.

> **Proof:** Code. `zombie.ai.sadisticAIDirector.SleepingEvent#setPlayerFallAsleep` (the line quoted; `forceNightmareEvent` only reaches `Rand.Next(3, sleepingTime - 2)` with the result unused), `#doDelayToSleep` (`maxDelay` 2.0 hours), `#checkNightmare` (`if (!GameClient.client)`; `baseChance` 5, `+= 5` for `DESENSITIZED`, `+= stress level * 10`), `#update` (`getNumVeryCloseZombies() > 0` wakes), `#spawnZombieIntruders`; `zombiesInvasion` is read in `setPlayerFallAsleep` and written nowhere (searched the whole 42.21 source; the class's bytecode has only a `getstatic` for it); `zombie.SandboxOptions` `sleepingEvent` is read only inside that branch; callers are `media/lua/client/ISUI/ISSleepDialog.lua` and `media/lua/client/ISUI/ISWorldObjectContextMenu.lua`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

We have not watched a nightmare happen with Sleeping Event set to Never, nor slept through a night on a dedicated server waiting for one. Either test would turn these two lines from code reading into observation.

> **Proof:** Unknown. "Never does not stop nightmares" and "no nightmares in multiplayer" are read from `SleepingEvent#checkNightmare` only; no game test or server log yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- **Events:** `OnZombieCreate` (a new loaded zombie), `OnZombieUpdate` (every update, see the sides above), `OnAIStateChange` (root state changes only; substates entering and leaving do not fire it), `OnZombieDead`. All are on [the events reference](/pz/build-42/modding/reference/lua-events#onzombieupdate).
- **The zombie:** [IsoZombie](/pz/build-42/modding/reference/lua-classes-characters-2#isozombie) exposes `setTarget`, `getTarget`, `pathToLocationF`, `pathToCharacter`, `spotted`, `setUseless`, `makeInactive`, `setCanWalk`, `setCrawler`, `toggleCrawling`, `setFakeDead`, `setWalkType`, `setTurnAlertedValues`, `RespondToSound`, `Wander`, `DoZombieStats`, `getOwner` and `getOwnerPlayer`, plus everything on IsoGameCharacter (`getCurrentState`, `isCurrentState`, `changeState`, `pathToLocation`, `getVariableBoolean`).
- **The states:** each state class is exposed with a static `instance()`, so you can test `zombie:getCurrentState() == ThumpState.instance()` ([AI states reference](/pz/build-42/modding/reference/lua-classes-ai-and-combat-1)). `StateMachine` itself is not in the exposed class list.
- **The director:** the global `getSleepingEvent()` returns the [SleepingEvent](/pz/build-42/modding/reference/lua-classes-ai-and-combat-1#sleepingevent) singleton.
- **Sandbox options:** the `ZombieLore` group (speed, strength, toughness, cognition, memory, sight, hearing, spotted logic, thumping, fake dead, fence lunge and more) and the `ZombieConfig` rally options.

## What a mod can and cannot change, and the traps

- **`changeState` goes around the transition files.** `IsoGameCharacter#changeState` swaps the Java state directly; the action context, which chose the animation and owns the transitions, is not told. The next time the action context changes state, it puts its own choice back. Vanilla uses `changeState` in a few places (a zombie hit into a stagger, `Wander`, traps), but for steering a zombie, set its target or give it a destination instead.
- **Use the zombie's own path calls, not `getPathFindBehavior2()`.** Calling `zombie:getPathFindBehavior2():pathToLocation(...)` only records a goal; it does not set `bPathfind` or `bMoving`, so nothing moves. `zombie:pathToLocation(x, y, z)` goes through `pathToAux` and does. On a zombie, `pathToLocationF` and `pathToCharacter` are ignored while its repath delay is running and it is already walking or pathfinding.
- **Static fields are copies.** Lua sees a copy of `SleepingEvent.zombiesInvasion` taken when the class is exposed and cannot switch the intruders on through it.
- **In multiplayer, steer zombies where they are owned.** A target or destination set on a client that does not own the zombie is overwritten by the next update from the client that owns it (see above).
- **The population is out of reach.** Where zombies come from, migrate to and how many there are is decided in `PZPopMan64`; Lua sees only the loaded zombies.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#changeState` (`getStateMachine().changeState(state, null, false)`, no action context call), `zombie.characters.component.StateMachineComponent#actionStateChanged` (runs on every action context change and calls `changeState` with its own lookup); vanilla callers `IsoZombie#Hit` (`StaggerBackState`), `IsoZombie#Wander`, `zombie.iso.objects.IsoTrap`; `zombie.pathfind.PathFindBehavior2#pathToLocation` (sets the goal only) against `zombie.characters.IsoGameCharacter#pathToLocation` (calls `pathToAux`); `zombie.characters.IsoZombie#pathToLocationF` and `#pathToCharacter` (`allowRepathDelay > 0.0F` and already in `PathFindState`, `WalkTowardState` or `WalkTowardNetworkState`). Static fields are copied once, per the method on [the reference index](/pz/build-42/modding/reference/lua-reference). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Pathfinding and the native library](/pz/build-42/modding/engine/pathfinding-and-the-native-library): what happens after `bPathfind` is set.
- [The Events system](/pz/build-42/modding/lua-api/the-events-system) and [the events reference](/pz/build-42/modding/reference/lua-events).
- [How Build 42 loads and animates an animal](/pz/build-42/modding/farming-and-animals/animal-pipeline): the same action group machinery, for animals.
- [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance): what the sleep delay and the bed do to your rest.
