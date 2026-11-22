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
  How a Build 42.22 zombie picks a state from XML transitions, when it walks straight or asks the pathfinder, which client runs it in multiplayer, and what the "AI director" really is: the sleep system.
last_updated: '2026-11-21'
related_articles:
  - animal-pipeline
  - the-events-system
  - lua-classes-characters-2
  - lua-classes-ai-and-combat-1
  - lua-events
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

Outcast, before you write a mod that touches zombies, it helps to know that a zombie is not one big brain. It is a small Java state machine whose states are chosen by XML files, plus a handful of habits (wander, listen, group up) bolted onto its update. In multiplayer, a zombie near players is run by one player's game, not by the server. And the package called `sadisticAIDirector` turns out to be the thing that wakes you from a nightmare.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [modders](#3-how-a-zombie-picks-a-state) | [server owners](#8-which-side-runs-a-zombie)

:::callout[The 1-minute version]{kind=key}
- A zombie's Java code sets variables, and XML transition files turn those variables into states. Lua that calls `changeState` goes around that, and the XML puts its own choice back the next time it changes state.
- Walk straight or pathfind: a goal on the same floor within 30 tiles (Manhattan) with a clear straight line is walked straight, anything else goes to the pathfinder.
- In multiplayer the server gives each zombie an owner client that runs its movement and hearing. A change you make on a client that does not own it is overwritten.
- The "sadistic AI director" is one Java class, `SleepingEvent`, which handles nightmares and wake-ups while you sleep. The sandbox option Sleeping Event feeds only the zombie-intruder branch, and by the code that branch never runs in vanilla.
- The off-screen population (spawning, migration, hordes) runs through the native library `PZPopMan64`, which we cannot read. Java still culls loaded zombies on a server: outside, untargeted ones beyond the Zombies Count Before Delete option (default 300 per connection).
:::

:::facts
- **Zombie class** `IsoZombie`, 5,965 lines
- **Transition folders** 125 zombie states and 17 crawler states in `media/actiongroups`
- **Straight-walk limit** 30 tiles Manhattan, same floor, clear line :cite[(`IsoGameCharacter.java:6358`)]
- **Forgets you** after its memory runs out: 800 units on the default Memory setting, about 17 real seconds at normal speed :cite[(`IsoZombie.java:3403`)]
- **Owner switch** at most every 2 seconds per zombie, and a factor of 1.618 applies only when switching to the nearest player; a grappling or targeted player takes over with no factor :cite[(`NetworkZombieManager.java:68`, `NetworkZombieManager.java:98-107`, `NetworkZombieManager.java:122`)]
- **Zombies per simulation packet** up to 300 :cite[(`NetworkZombieSimulator.java:330`)]
:::

## 1. What it does for the player

**Zombies shamble about, wander a few steps at a time, drift together into loose groups, turn toward noise, chase what they see, lunge, bite, bang on doors and climb through windows.** They forget you after a while. When you sleep, the game may wake you with a nightmare, or because a zombie is right next to you :cite[(`ZombieIdleState.java:65-72`, `ZombieGroupManager.java:94-190`, `SleepingEvent.java:208-224`, `SleepingEvent.java:295-306`)].

## 2. Where it lives

**A zombie is an `IsoZombie` that owns a state machine, and its states are Java classes chosen by XML.**

| Piece | Where | What it does | Code |
|---|---|---|---|
| The zombie | `zombie.characters.IsoZombie` (5,965 lines) | Per-tick update, sight, hearing, targets, its own rolled stats | `IsoZombie.java:3222-3460` |
| The state machine | `zombie.ai.StateMachine`, `zombie.characters.component.StateMachineComponent` | Holds the current state and any substates, runs them each tick | `StateMachine.java:28-210`, `StateMachineComponent.java:70-86` |
| The states | `zombie.ai.states.*` (`ZombieIdleState`, `WalkTowardState`, `PathFindState`, `LungeState`, `AttackState`, `ThumpState`, `ClimbThroughWindowState` and more) | One Java class per behavior; the folder holds 69 files, shared with players and animals | `IsoZombie.java:661-760` |
| The transitions | `media/actiongroups/zombie/` (125 state folders) and `media/actiongroups/zombie-crawler/` (17) | XML: "go from this state to that one when these variables are true" | `actiongroups/zombie/idle/to_pathfind.xml` |
| Groups | `zombie.ai.ZombieGroupManager` | Rally groups of idle zombies | `ZombieGroupManager.java:66-190` |
| Multiplayer ownership | `zombie.popman.NetworkZombieManager` (server), `zombie.popman.NetworkZombieSimulator` (client) | Which client runs which zombie | `NetworkZombieManager.java:66-146`, `NetworkZombieSimulator.java:298-371` |
| The "AI director" | `zombie.ai.sadisticAIDirector.SleepingEvent` | Nightmares and wake-ups while a player sleeps | `SleepingEvent.java:50-546` |

The off-screen population (virtual zombies, migration, hordes) is a different system: `zombie.popman.ZombiePopulationManager`, which hands its work to the native library `PZPopMan64`, and we cannot read that library :cite[(`ZombiePopulationManager.java:106-120`, `ZombiePopulationManager.java:204`)]. Java configures and feeds it, and the Java side of this code is guarded by `!GameClient.client`, so it runs in single player and on a dedicated server and not on a multiplayer client :cite[(`ZombiePopulationManager.java:212`, `ZombiePopulationManager.java:303-309`, `ZombiePopulationManager.java:366`, `ZombiePopulationManager.java:497`, `ZombiePopulationManager.java:548-555`)]. What the library itself decides about where zombies spawn and migrate is not verified. This page is about zombies that are loaded and walking around near a player.

A zombie's owner client is stored in an entity component, `NetworkZombieComponent`, which is part of the character ECS rather than a field on the zombie :cite[(`IsoZombie.java:637-651`)]. See [the entity component system](/pz/build-42/modding/engine/the-entity-component-system).

## 3. How a zombie picks a state

**The Java code does not decide "now attack": it sets variables, and an XML transition file decides which state they lead to.** The variables are `bMoving`, `bPathfind`, `bLunge`, `bThump`, `alerted` and dozens more. Here is one, the idle-to-pathfind transition, whole:

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

:::flow[One tick of a zombie's state]
- `IsoZombie#update` runs `updateInternal`, which fires `OnZombieUpdate`
- The character update runs `StateMachine#update`, so every state `execute`s and sets variables
- `ActionContext#update` reads the variables against `to_*.xml`
- `actionStateChanged` finds the new state by name and calls `changeState`
- The old state exits, the new one enters, and `OnAIStateChange` fires
:::

1. `IsoZombie#update` runs `IsoZombie#updateInternal`, which fires the Lua event `OnZombieUpdate` and then calls the shared character update :cite[(`IsoZombie.java:3212-3220`, `IsoZombie.java:3319`)].
2. The shared update calls `StateMachine#update`, which runs `execute` on the current state and on every substate. The states set and clear variables :cite[(`StateMachine.java:180-193`)].
3. After the update, `ActionContext#update` reads the variables against the transition files in `media/actiongroups/zombie/<current state>/to_*.xml`.
4. When a transition fires, `StateMachineComponent#actionStateChanged` looks the new state's **name** up in a table that `IsoZombie#initializeStates` filled (`"pathfind"` to `PathFindState`, `"thump"` to `ThumpState`, and so on) and calls `StateMachine#changeState` :cite[(`StateMachineComponent.java:70-86`, `IsoZombie.java:661-760`)].
5. `StateMachine#changeRootState` runs `exit` on the old state and `enter` on the new one, then fires the Lua event `OnAIStateChange` with the character, the new state and the old one :cite[(`StateMachine.java:57-75`)].

Crawlers use a second action group, `zombie-crawler`, and a smaller name table. A zombie that becomes a crawler swaps groups and re-registers its states on its next update :cite[(`IsoZombie.java:3246-3257`)]. Animals work the same way, with their own action groups (see [how Build 42 loads and animates an animal](/pz/build-42/modding/farming-and-animals/animal-pipeline)).

## 4. Walking straight or asking the pathfinder

**A zombie walks straight when the goal is near and clear, and otherwise asks the pathfinder for a route.** When anything asks a zombie to go somewhere (`pathToLocation`, `pathToCharacter`, `pathToSound`), the shared helper `IsoGameCharacter#pathToAux` decides how :cite[(`IsoGameCharacter.java:6356-6421`)].

If the goal is on the same floor, no more than 30 tiles away counting across plus up (Manhattan distance), the straight line is clear of walls and furniture, and the zombie is not standing on a different staircase, it walks straight, which is the walk-toward state :cite[(`IsoGameCharacter.java:6358-6392`)]. Otherwise it sets `bPathfind` and the zombie goes into `PathFindState`, which asks the pathfinder for a route :cite[(`IsoGameCharacter.java:6394-6397`, `PathFindState.java:53-58`)]. That is why a zombie that can see you through a window walks at the window, and one behind a wall goes around. The pathfinder itself is its own article: [pathfinding and the native library](/pz/build-42/modding/engine/pathfinding-and-the-native-library).

## 5. What sets a zombie moving

**A zombie moves because it sees something, hears something, has nothing to do, or joins others.**

- **Something it sees.** Each player's line-of-sight pass calls `IsoPlayer#TestZombieSpotPlayer`, which calls `IsoZombie#spotted` for the zombies on squares that player could see :cite[(`IsoPlayer.java:1032`, `IsoPlayer.java:5796-5799`)]. With the default sandbox (`ZombieLore.SpottedLogic` on, the Java default and every preset that sets it) that is `spottedNew`, which weighs light on your square, floor difference and view distance :cite[(`IsoZombie.java:2858-2863`, `IsoZombie.java:2046-2110`, `SandboxOptions.java:2111`)]. A target is dropped once the zombie has gone longer than its memory without seeing anyone :cite[(`IsoZombie.java:3403-3405`)].
- **Something it hears.** Only once a zombie has gone a while without seeing anyone does it call `IsoZombie#RespondToSound`, which asks `WorldSoundManager` for the sound that attracts it most and heads for it :cite[(`IsoZombie.java:3441-3442`, `IsoZombie.java:1601-1770`)].
- **Nothing at all.** In `ZombieIdleState` a zombie waits a random pause, then picks a free square within four tiles and walks there. The pause is 1.5 times as long when it is not raining, so zombies wander more in the rain :cite[(`ZombieIdleState.java:65-72`, `ZombieIdleState.java:91-96`)]. The state's timer counts down in units of the thirty-frame step, 30 per real second at normal speed, which makes 400 to 1000 units 13 to 33 seconds in rain :cite[(`IsoGameCharacter.java:9252`)]. A second countdown exists in `IsoMovingObject`, and we did not confirm whether it also runs for zombies :cite[(`IsoMovingObject.java:1137`)].
- **Each other.** After a long time with no target and no sound, `ZombieGroupManager` puts idle zombies into rally groups. The leader drifts away from other groups; members stay near the leader :cite[(`ZombieGroupManager.java:94-190`, `IsoZombie.java:3450-3451`)]. A zombie is left out of groups when it is inside a building, in a Forest or DeepForest zone, has a target, is useless, dead, fake dead, sitting against a wall, or only a grapple prop. It is also left out when it is a reused zombie, and no zombie joins a group unless the game's group-sound flag is on, which the game sets to true when a world starts :cite[(`ZombieGroupManager.java:66-92`, `IngameState.java:1019`)].

The sandbox options `ZombieConfig.RallyGroupSize`, `RallyGroupSeparation` and `RallyGroupRadius` drive grouping, and a group size of 1 or less turns it off :cite[(`ZombieGroupManager.java:69-70`)]. The Java defaults are 20, 15 and 3. The presets differ: the group size is 20 in Apocalypse, Outbreak and Rising, 10 in Extinction and 200 in Six Months Later, and the radius is 4 in Rising and 10 in Six Months Later :cite[(`SandboxOptions.java:2053-2057`, `Apocalypse.lua:235-239`, `Extinction.lua:235`, `Rising.lua:239`, `SixMonthsLater.lua:134-137`)].

The update also carries a few small habits worth knowing. A zombie standing on a farm plant has a chance each tick to destroy it, a moving zombie on a lit campfire has a small chance to put it out, and a zombie on a square with a sheet rope has a 1 in 30 chance per update to damage it :cite[(`IsoZombie.java:3419-3432`, `IsoZombie.java:3401`, `IsoZombie.java:3604-3623`)]. A zombie with no target next to a car with its siren on bangs on the car, and a zombie next to an alarmed car that nobody has entered has a tiny chance to set the alarm off :cite[(`IsoZombie.java:3263-3274`)].

The numbers (how far, how long, what traits and sneaking change) are a gameplay question, answered on [how far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) and [how long a zombie remembers you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you).

## 6. Every zombie rolls its own stats

**`IsoZombie#DoZombieStats` reads the Zombie Lore sandbox options and rolls this zombie's cognition, strength, memory, sight, hearing and speed.** With Cognition set to the random choice, each zombie opens doors with the chance of the Door Opening Percentage option (Java default 33) :cite[(`IsoZombie.java:3839-3845`, `SandboxOptions.java:2105`)]. With a "Random" setting each zombie gets its own value, so two zombies side by side can differ :cite[(`IsoZombie.java:3834-3906`)].

The Java defaults are Speed 2, Strength 2, Cognition 3, Memory 2, Sight 2 and Hearing 2 :cite[(`SandboxOptions.java:2097-2110`)]. The presets set their own: Speed is 4 in Apocalypse, Extinction and Outbreak, 3 in Rising and 2 in Six Months Later, and Sight and Hearing are 5 in Apocalypse and Outbreak, so players get the preset's value, not the Java one :cite[(`Apocalypse.lua:195-207`, `Extinction.lua:195-207`, `Rising.lua:195-207`, `SixMonthsLater.lua:104-114`)].

None of it is saved with the zombie: on top of what every character saves, a zombie adds only how long since it last saw someone, a few state flags and its worn items :cite[(`IsoZombie.java:1258-1273`)]. `DoZombieStats` runs when a zombie is created, again when it is loaded from the save, when it turns into a crawler or back, and when it wakes from an inactive phase :cite[(`IsoZombie.java:592`, `IsoZombie.java:1211`, `IsoZombie.java:1231`, `IsoZombie.java:4408`, `IsoZombie.java:4866-4870`, `IsoZombie.java:5151`)].

So a sandbox change reaches existing zombies the next time they load. With a Random sight or hearing setting a zombie can come back from a reload seeing or hearing differently, because sight and hearing are assigned without a "not yet set" check :cite[(`IsoZombie.java:3898-3913`)]. Lua can call `DoZombieStats` too.

## 7. The "sadistic AI director" is the sleep system

**The package name promises a director that paces the apocalypse; it holds one Java class, `SleepingEvent`, which decides whether your sleep gets interrupted.** The package holds `SleepingEvent` and its data class :cite[(`SleepingEvent.java:50-546`)]. The sandbox menu has a heading "Sadistic AI Director", but the pacing it names is spread elsewhere: the Meta Event option (default Sometimes, Never turns it off) drives random ambient events and distant gunshots through the game clock, not this package :cite[(`Sandbox.json:612-619`, `SandboxOptions.java:151`, `GameTime.java:465-477`, `GameTime.java:484-490`)]. A Lua file, `SadisticMusicDirector.lua`, sits in the server scripts, but we found no caller of it in `media`, so treat it as unused :cite[(`SadisticMusicDirector.lua:3-5`)]. When you go to sleep, the sleep dialog or the bed context menu calls `getSleepingEvent():setPlayerFallAsleep(player, hours)` :cite[(`ISSleepDialog.lua:76`, `ISWorldObjectContextMenu.lua:1103`)]. It then:

- delays the moment you actually fall asleep, by up to two hours of game time depending on pain, stress, insomnia, night owl, the bed and sleeping pills :cite[(`SleepingEvent.java:159-206`)];
- rolls a **nightmare**: 5 in 100, plus 10 per level of the stress moodle, plus 5 more with the Desensitized trait (that is what the code says), for sleeps of three hours or more. A nightmare wakes you at a random hour between 3 and the sleep length minus 3 (`Rand.Next(3, sleepingTime - 2)`), with panic and stress :cite[(`SleepingEvent.java:208-224`, `SleepingEvent.java:308-315`)];
- while you sleep, wakes you at once if a zombie is very close :cite[(`SleepingEvent.java:295-306`)].

42.22 keeps per-player sleep data and tracks rain on a sleeping player, but the snow, temperature and wetness hooks are empty :cite[(`SleepingEvent.java:57-65`, `SleepingEvent.java:330-370`)].

There is also code to have zombies break in through the weakest window or an open door while you sleep, weighted by running fridges, a lit stove, a television or radio left on :cite[(`SleepingEvent.java:100-155`, `SleepingEvent.java:381-440`)]. **In vanilla 42.22 that code never runs**, and two of the switches around it do nothing:

- The intruder branch needs the static field `SleepingEvent.zombiesInvasion` to be true, and nothing in the game's code or scripts ever sets it. So the sandbox option **Sleeping Event** (Never, Sometimes, Often), which only feeds that branch, changes nothing. Its default is Never in Java and in every preset :cite[(`SleepingEvent.java:50`, `SleepingEvent.java:74`, `SandboxOptions.java:152`, `Apocalypse.lua:80`, `SixMonthsLater.lua:54`)].
- The nightmare roll does not read that sandbox option at all. Setting Sleeping Event to Never does not stop nightmares, whatever its tooltip says :cite[(`SleepingEvent.java:208-224`, `Sandbox.json:617-618`)].
- The fourth parameter of `setPlayerFallAsleep`, `forceNightmareEvent`, rolls a random number and throws it away :cite[(`SleepingEvent.java:69-71`)].

```java
if (SandboxOptions.instance.sleepingEvent.getValue() != 1 && zombiesInvasion || forceZombieEvent) {
```

The third parameter, `forceZombieEvent`, does work: it bypasses both the static field and the chance roll, as long as you are inside a building, no nightmare was rolled, and the zone you are standing in has no player-built construction :cite[(`SleepingEvent.java:72-86`, `SleepingEvent.java:148-150`)]. A mod can call `getSleepingEvent():setPlayerFallAsleep(player, hours, true, false)` to force an intrusion.

In multiplayer, sleep is started from client Lua, and the nightmare roll is skipped on clients (`checkNightmare` starts with `if (!GameClient.client)`), so by the code **nightmares do not happen in multiplayer** :cite[(`SleepingEvent.java:209`, `ISSleepDialog.lua:76`)]. A forced intrusion would spawn its zombies on the sleeping player's own client :cite[(`SleepingEvent.java:434-436`)]. We have not tested what the server makes of zombies a client creates that way, so treat `forceZombieEvent` as single player only.

## 8. Which side runs a zombie

**In single player everything above runs in your game. In multiplayer the server gives each zombie an owner, a client that runs it.** The owner runs the zombie's movement and most of its decisions (where it walks, what it hears) and sends its state to the server in `ZombieSimulation` packets, up to 300 zombies per packet :cite[(`NetworkZombieSimulator.java:298-344`)].

Every other client sees the zombie as remote. The transition files send remote zombies to the `*-network` states (`walktoward-network`, `lunge-network`, `attack-network`) through the `bClient` variable, which is true only on a client for a zombie it does not own :cite[(`IsoZombie.java:787`, `IsoZombie.java:633-635`)]. A client marks every zombie it creates as remote :cite[(`VirtualZombieManager.java:213-215`)].

The server picks a zombie's owner in `NetworkZombieManager#updateAuth`, at most once every two seconds per zombie (straight away if it has none) :cite[(`NetworkZombieManager.java:66-68`)]. It prefers the player who is grappling the zombie, then the player the zombie is targeting, then the nearest player in range :cite[(`NetworkZombieManager.java:90-129`)]. A closer player only takes over if they are closer by a factor of about 1.618, so ownership does not flicker between two players standing side by side :cite[(`NetworkZombieManager.java:122`)]. With no player in range the zombie has no owner, except for a reanimated player's body, which goes to the dead player's connection :cite[(`NetworkZombieManager.java:131-146`)]. The server option `SwitchZombiesOwnershipEachUpdate`, off by default, replaces all of this with handing each zombie to the next connection in turn :cite[(`NetworkZombieManager.java:69-88`, `ServerOptions.java:60-62`)].

Two consequences for your code:

- `IsoZombie#RespondToSound` does nothing on a dedicated server and for a remote zombie on a client. Hearing is decided on the owning client :cite[(`IsoZombie.java:1604-1605`)].
- `OnZombieUpdate` fires on every client for every zombie that client has heard about in the last five seconds, owned or not, and on the server for the zombies it updates, except a server zombie flagged `indoorZombie`, which skips the hook :cite[(`IsoZombie.java:3307-3319`)]. A change you make there on a client to a zombie you do not own is overwritten by the next update from its owner.

## 9. What Lua can reach

**Lua reaches a zombie through a handful of events, the `IsoZombie` methods, the state singletons and the sleep director.**

- **Events:** `OnZombieCreate` (a new loaded zombie), `OnZombieUpdate` (every update, see the sides above), `OnAIStateChange` (root state changes only; substates entering and leaving do not fire it), `OnZombieDead` :cite[(`VirtualZombieManager.java:209`, `IsoZombie.java:3319`, `StateMachine.java:74`, `IsoZombie.java:5394`)]. All are on [the events reference](/pz/build-42/modding/reference/lua-events#onzombieupdate).
- **The zombie:** [IsoZombie](/pz/build-42/modding/reference/lua-classes-characters-2#isozombie) exposes `setTarget`, `getTarget`, `pathToLocationF`, `pathToCharacter`, `spotted`, `setUseless`, `makeInactive`, `setCanWalk`, `setCrawler`, `toggleCrawling`, `setFakeDead`, `setWalkType`, `setTurnAlertedValues`, `RespondToSound`, `Wander`, `DoZombieStats`, `getOwner` and `getOwnerPlayer`, plus everything on IsoGameCharacter (`getCurrentState`, `isCurrentState`, `changeState`, `pathToLocation`, `getVariableBoolean`).
- **The states:** each state class is exposed with a static `instance()`, so you can test `zombie:getCurrentState() == ThumpState.instance()` ([AI states reference](/pz/build-42/modding/reference/lua-classes-ai-and-combat-1)). `StateMachine` itself is not in the exposed class list.
- **The director:** the global `getSleepingEvent()` returns the [SleepingEvent](/pz/build-42/modding/reference/lua-classes-ai-and-combat-1#sleepingevent) singleton :cite[(`LuaManager.java:3848-3852`)].
- **Sandbox options:** the `ZombieLore` group (speed, strength, toughness, cognition, memory, sight, hearing, spotted logic, thumping, fake dead, fence lunge and more) and the `ZombieConfig` rally options :cite[(`SandboxOptions.java:2053-2111`)].

## 10. What a mod can and cannot change, and the traps

**Steer a zombie with its target or a destination, not with `changeState`, and do it on the side that owns it.**

- **`changeState` goes around the transition files.** `IsoGameCharacter#changeState` swaps the Java state directly, and the action context, which chose the animation and owns the transitions, is not told :cite[(`IsoGameCharacter.java:6052-6054`)]. The next time the action context changes state, it puts its own choice back :cite[(`StateMachineComponent.java:70-86`)]. Vanilla uses `changeState` in a few places (a zombie hit into a stagger, `Wander`, traps), but for steering a zombie, set its target or give it a destination instead :cite[(`IsoZombie.java:1386`, `IsoZombie.java:3779-3781`, `IsoTrap.java:878`)].
- **Use the zombie's own path calls, not `getPathFindBehavior2()`.** Calling `zombie:getPathFindBehavior2():pathToLocation(...)` only records a goal; it does not set `bPathfind` or `bMoving`, so nothing moves :cite[(`PathFindBehavior2.java:248-253`)]. `zombie:pathToLocation(x, y, z)` goes through `pathToAux` and does :cite[(`IsoGameCharacter.java:6408-6411`)]. On a zombie, `pathToLocationF` and `pathToCharacter` are ignored while its repath delay is running and it is already walking or pathfinding :cite[(`IsoZombie.java:1165-1182`)].
- **Static fields are copies.** Lua sees a copy of `SleepingEvent.zombiesInvasion` taken when the class is exposed and cannot switch the intruders on through it. See [the Lua reference](/pz/build-42/modding/reference/lua-reference).
- **In multiplayer, steer zombies where they are owned.** A target or destination set on a client that does not own the zombie is overwritten by the next update from the client that owns it.
- **The population is mostly out of reach.** Spawning and migration run through `PZPopMan64`; Lua sees only the loaded zombies :cite[(`ZombiePopulationManager.java:204`)]. On a server, Java deletes outside, untargeted zombies above the Zombies Count Before Delete option (Java default 300, 0 turns it off) per connection, with a 1 in 10 roll per pass adjusted for frame rate, never a reanimated player or a zombie a player is near :cite[(`ZombieCountOptimiser.java:25-60`, `MovingObjectUpdateScheduler.java:42`, `MovingObjectUpdateScheduler.java:162`, `SandboxOptions.java:2058`)].

:::callout[How we know]{kind=proof}
All of this is read from the 42.22 code. We have not watched ownership switching on a dedicated server with two players. The test: two players in range of the same zombie, a server-side Lua `OnZombieUpdate` handler logging `zombie:getOwnerPlayer()` every second, and the server log showing who owns it as the players move apart. Not tested.

"Never does not stop nightmares" and "no nightmares in multiplayer" are read from `SleepingEvent#checkNightmare` only; we have not watched a nightmare with Sleeping Event set to Never, nor slept through a night on a dedicated server waiting for one. Not tested.

The 13 to 33 second wander pause assumes the thirty-frame countdown is the only one that runs; the second countdown in `IsoMovingObject` is not verified for zombies. The native library `PZPopMan64` cannot be read, so what it decides about spawning and migration is not verified; the Java culling of far zombies is read from the code.
:::

## 11. Where to go next

- [Pathfinding and the native library](/pz/build-42/modding/engine/pathfinding-and-the-native-library): what happens after `bPathfind` is set.
- [The Events system](/pz/build-42/modding/lua-api/the-events-system) and [the events reference](/pz/build-42/modding/reference/lua-events).
- [How Build 42 loads and animates an animal](/pz/build-42/modding/farming-and-animals/animal-pipeline): the same action group machinery, for animals.
- [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance): what the sleep delay and the bed do to your rest.
