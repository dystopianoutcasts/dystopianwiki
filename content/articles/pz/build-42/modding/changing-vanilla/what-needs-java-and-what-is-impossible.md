---
id: build-42-what-needs-java-and-what-is-impossible
slug: what-needs-java-and-what-is-impossible
title: 'What needs Java, and what is impossible'
game: pz
version: build-42
section: modding
category: changing-vanilla
difficulty: advanced
tags:
  - java
  - classpath
  - native
  - limits
  - engine
excerpt: >-
  When a change needs a loose Java class and what that costs, which native libraries no mod can reach, and how to tell the two cases apart before you spend a week on the wrong one.
last_updated: '2026-11-14'
related_articles:
  - changing-vanilla-start-here
  - patching-vanilla-lua
  - overriding-scripts
  - editing-items-at-load
  - changing-loot
  - changing-recipes-and-crafting
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders whose change is not in Lua](#is-it-really-not-in-lua-or-a-script) | [modders weighing a Java patch](#rung-5-a-loose-java-class-l3) | [modders who suspect it is impossible](#rung-6-the-native-libraries-l4)

Outcast, you have a change in mind. You checked the sandbox settings, the scripts, the loot tables, the Lua. None of them reach it. Now you are at the top of the ladder in [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here), and there are two answers left: "possible, at a high cost", or "not possible".

This page explains both so you can tell which one you are looking at. It stays on the modding side: what the engine allows and what it does not.

:::callout[The 1-minute version]{kind=key}
- First make sure the behavior is not in Lua, a script, an exposed class or an event. Most of the game is data or Lua.
- A loose Java class (L3) works because the install folder comes before the jar on the classpath. It needs a matching compiler, breaks on game updates, hides bug fixes and must be installed by hand by every player.
- For a Workshop mod, go back to the lower rungs or ask for a hook.
- Six native libraries (pathfinding, zombie population, physics, lighting, network, audio) are impossible to change. You can change only what goes in.
- Between 42.21 and 42.22, `PZPopMan64.dll` and `RakNet64.dll` changed with no Java trace (behavior may have changed; not verified).
:::

:::facts
- **Native libraries in the capture** 17, six of which matter for gameplay
- **Compiler needed** Java 25 to read the 42.22 class files
- **Natives changed 42.21 to 42.22** 2 (`PZPopMan64.dll`, `RakNet64.dll`)
:::

:::chips
- PZPathFind64
- PZPopMan64
- PZBullet64
- Lighting64
- RakNet64
- fmodintegration64
:::

## Is it really not in Lua or a script?

Before anything else, make sure, because most of what the game does is data or Lua.

1. Search the vanilla `media\lua\` folder for the words you see on screen. If they are there, the behavior is Lua and you can [patch it](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua).
2. Check whether the Java class is exposed to Lua. The engine keeps an explicit list of classes Lua may use, and only methods on those classes can be called from a mod. `shouldExpose` answers from the set of exposed classes :cite[(`zombie/Lua/LuaManager.java:2751-2753`)], for example `Item` :cite[(`:2332`)], `CraftRecipe` :cite[(`:2302`)] and `ScriptManager`. :cite[(`:2408`)]
3. Look for an event around the moment you care about (`zombie/Lua/LuaEventManager.java` lists the names).

If a class is exposed and has a setter, you are on the Lua rung. If there is only an event, you can react but not change the decision. If neither, keep reading.

## Rung 5: a loose Java class (L3)

A class file you compiled yourself, placed in the install folder ahead of the jar, is loaded instead of the jar's own.

### How it works

The game starts from a launcher file, `ProjectZomboid64.json`. It names the main class and a Java "classpath": the list of places the Java runtime looks, in order, for each class it needs.

```
"mainClass": "zombie/gameStates/MainScreenState",
"classpath": [
    ".",
    "projectzomboid.jar"
],
```

That is the stock launcher. :cite[(`game_snapshot/ProjectZomboid64.json:2-5`)] The sealed copy is the install's `ProjectZomboid64.json.before-zombiebuddy` file, dated 2026-11-06 and byte-identical to the 42.21 seal; the install's live launcher file had been modified by another tool. If 42.22 changed the stock launcher file, the seal does not show it. :cite[(`game_snapshot/INTEGRITY.md:29-34`)]

The first entry, `.`, is the install folder itself. The second is the jar that holds every game class. A Java runtime takes a class from the first entry that has it. So if the install folder contains `zombie\inventory\ItemPickerJava.class`, the runtime loads that file and never looks inside the jar for that class.

The rule is how Java works in general; the capture shows the order, and the capture's integrity note records that the install's `zombie\` folder was empty, meaning nothing was overriding the jar when it was sealed. :cite[(`INTEGRITY.md:51`)]

That is all L3 is: a class file you compiled yourself, placed in the right folder under the install, ahead of the jar.

### What you need

Three things: the exact source, a new enough compiler, and only the classes you change.

- **The exact source for your game build.** The engine records hold a decompiled copy, with a warning in every file that it is decompiled output and not the original source, so subtle flow may differ. Do not paste it back as-is without checking.
- **A compiler new enough for the jar.** The class files in the 42.22 jar need Java 25 to even read ("the 42.22 class files need javap 25"). :cite[(`MANIFEST.yaml:35`)] A patch compiled by an older compiler against that jar fails.
- **Only the classes you change.** Ship one small class, not the whole package.

### What it costs

This is why L3 is the last resort.

| Cost | Why |
|---|---|
| **It breaks on a game update.** | Your class was built against one jar. A new jar can add, remove or rename the things your class touches, and your old class then shadows the new one. Between 42.21 and 42.22 the jar changed, plus two native libraries :cite[(`INTEGRITY.md:47`)]. |
| **It hides bug fixes.** | While your copy is in place, the jar's fixed version of that class never runs. |
| **Every player must install it by hand.** | The Workshop delivers mod folders. The engine's mod loader finds a mod's `media` files and `mod.info`; I searched the engine source for code that loads Java classes from a mod, and the only mention of a class loader is a Lua reflection safety check that refuses to touch one. So nothing carries your `.class` file to a player's install folder. |
| **Two classes that both patch the same Java class cannot coexist.** | Only one file can sit at that path. |
| **Servers and clients can disagree.** | A change to a rule that both sides compute applies only where the file is installed. |
| **Whole-jar replacement is worse.** | Replacing `projectzomboid.jar` itself freezes the whole game at one version. Do not. |

A mod folder contributes resource files by relative path :cite[(`ZomboidFileSystem.java:656-694`)], and the only `ClassLoader` reference is in a reflection safety check that throws "Nope". :cite[(`zombie/Lua/LuaManager.java:1684`)] Whether Steam's file verification removes loose classes from the install folder: not verified.

Also worth knowing: a class cannot be changed to alter a compile-time constant that other classes copied in. A `static final` number used in several classes is copied into each class when the game is built, so patching the class that declares it does nothing to the copies. That is standard Java; I did not find an example in the capture.

### When L3 is the right tool

L3 is right when the behavior is a Java rule with no Lua copy and no event, and you can accept the cost.

That fits a private project, a test, or a server whose players all install the same files. For a mod that goes to the Workshop for anyone, go back to the lower rungs, or ask for a hook.

> **Note:** This series does not give steps for changing rules a server enforces on its players. Keep Java patches to features you own.

## Rung 6: the native libraries (L4)

Some of the game is compiled native code that Java only calls, and no mod can change what happens inside.

The Java side loads compiled libraries (`.dll` files on Windows) and calls into them. Java can show you the calls and what goes in and comes out. It cannot show you what happens inside. No mod can change the inside.

The capture holds 17 native libraries. These six are the ones that matter for gameplay, each with its loader line and what its Java wrapper hands to it.

| Library | What it owns | Code |
|---|---|---|
| `PZPathFind64` | Finding a route for a character, zombie or animal around walls, doors and vehicles. The Java wrapper loads it and calls native methods such as `initWorld`, `updateChunk`, `updateSquare`, `addVehicle`, `update`. | :cite[(`zombie/pathfind/nativeCode/PathfindNative.java:63-65`, `:69-83`)] |
| `PZPopMan64` | The zombie population: where they are, spawning and despawning. The Java wrapper loads it and calls native methods `n_init`, `n_config`, `n_setSpawnOrigins`, `n_setOutfitNames`, `n_updateMain`. | :cite[(`zombie/popman/ZombiePopulationManager.java:202-204`, `:106-128`)] |
| `PZBullet64` | The physics world: collision for terrain and vehicles. The Java wrapper loads it and calls native methods `initWorld`, `activateChunkMap`, `addVehicle`, `removeVehicle`. | :cite[(`zombie/core/physics/Bullet.java:72-74`, `:105-111`, `:368-370`)] |
| `Lighting64` | The lighting simulation. The Java wrapper loads it and calls native methods `stateBeginUpdate`, `stateEndFrame`, `scrollLeft` and so on. | :cite[(`zombie/iso/LightingJNI.java:104-108`, `:1015-1035`)] |
| `RakNet64` | The network transport. It is loaded together with `ZNetJNI64` and `steam_api64`, and its wrapper calls `Init`, `Startup`, `Shutdown`. | :cite[(`zombie/core/znet/SteamUtils.java:57-79`, `zombie/core/raknet/RakNetPeerInterface.java:67-79`)] |
| `fmodintegration64` (with `fmod` and `fmodstudio`) | Audio: playing events and mixing. The Java side loads all three and calls native methods including `FMOD_Studio_Create` and `FMOD_Studio_GetEvent`. | :cite[(`fmod/javafmodJNI.java:25-36`, `:50-52`)] |

Seen from a mod:

- **What you can change is what goes in.** A sandbox option, a Lua-callable method, or a script value that the Java side passes to the library. You change the input, not the algorithm.
- **You cannot read what comes out in a detailed way** beyond what Java copies back.
- **A loose Java class cannot change a native.** A patch can change what the Java wrapper sends, or how it uses the answer; it cannot touch the compiled code.

For the pathfinder in particular, see [Pathfinding and the native library](/pz/build-42/modding/engine/pathfinding-and-the-native-library) for what Java decides and what the library hides.

### Also in the folder

The natives folder also holds `PZClipper64` (the Java class `zombie/vehicles/Clipper` has `native` methods :cite[(`Clipper.java:46-56`)]), `jassimp64` (model import :cite[(`zombie/core/skinnedmodel/model/jassimp/JAssImpImporter.java:374-378`)]), `bink64` and `bink2w64` (video :cite[(`zombie/core/textures/VideoTexture.java:222-228`)]), `steam_api64`, `ZNetJNI64` and `ZNetNoSteam64` (Steam and network glue :cite[(`SteamUtils.java:57-79`)]), `imgui-java64` and `jnidispatch` (not traced; where they are loaded: not verified).

### A surprise in 42.22

Between 42.21 and 42.22 two native libraries changed, and their behavior may have changed with no Java trace.

Native code changes do not show up in the decompiled Java. The capture's integrity note says that between 42.21 and 42.22, besides the jar, two natives changed: `PZPopMan64.dll` and `RakNet64.dll`. It states plainly that "behavior behind those two DLLs may have changed with no Java trace". If a zombie spawning or network behavior you relied on seems different in 42.22, the change may be invisible in the source you can read. :cite[(`game_snapshot/INTEGRITY.md:47-49`)]

## Other things that are hard or impossible

Three more cases are hard or impossible: numbers inside compiled code, anything a native decides, and unexposed classes.

- **Numbers inside compiled code.** The erosion system, for example, carries a fixed table of numbers inside one very large class (see [Erosion](/pz/build-42/modding/engine/erosion)). No script or Lua setting reaches it. You could patch the class (L3), at the costs above.
- **Anything decided by a native library.** Everything in the table above.
- **Anything that exists only in `projectzomboid.jar` and has no exposed class.** Reachable only through L3.

## How to decide, in one list

Work through these five questions in order and stop at the first yes.

1. Is there a sandbox option or a script key? **Use it.**
2. Is the behavior in a Lua file you can read? **Patch the Lua.**
3. Is there an event and a way to change the result from it? **Use the event.**
4. Is it in Java with no exposed setter, and not in a native? **L3**, with the costs above. Only if you accept them.
5. Does the trail end at a library in the table above? **Stop.** It is not possible. Change the inputs, or change what you are asking for.

## Where to go next

- [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here), for the ladder.
- [Patching vanilla Lua](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua), the rung that usually does the job.
- [Engine internals: calling exposed Java from Lua](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua) for what Lua can reach.

:::callout[How we know]{kind=proof}
Read from the 42.22 capture (Java source, jar manifest and integrity note); no patch was built or run. Not verified: whether Steam's file verification removes loose classes from the install folder, where `imgui-java64` and `jnidispatch` are loaded, whether 42.22 changed the stock launcher file, and what the two changed native libraries now do differently. The classpath rule is how Java works in general, and no example of a copied compile-time constant was found in the capture.
:::
