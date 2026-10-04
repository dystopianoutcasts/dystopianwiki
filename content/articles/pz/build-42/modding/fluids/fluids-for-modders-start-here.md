---
id: build-42-fluids-for-modders-start-here
slug: fluids-for-modders-start-here
title: 'Fluids for modders: start here'
game: pz
version: build-42
section: modding
category: fluids
difficulty: beginner
tags:
  - fluids
  - fluidcontainer
  - overview
excerpt: >-
  The five things to know before you mod Build 42 fluids, where each trap is
  explained, and which of our older fluid pages said something wrong. The
  front door to the fluids section.
last_updated: '2026-10-04'
---
# Fluids for modders: start here

Welcome, Outcast. Build 42 replaced the old "empty bottle, half bottle, full bottle" items with a real fluid system: a container holds litres of one or more fluids, they mix, they pour, they poison. It is one of the best things in the build to mod, and it has more silent traps than almost anything else we have touched. We hit most of them building fluids for a car mod. This page is the map.

## Five things to know first

1. **A fluid lives on an item, never on a vehicle part or a script object of its own.** Items can carry a `FluidContainer` component; vehicle scripts have no component support, and the method that adds a component is not reachable from a mod. If your car needs oil, the oil sits in an item: the part's fitted item, or an item in the part's container.
2. **A container holds up to eight fluids and mixes them for free.** Pouring moves every fluid in proportion. You do not write mixing code.
3. **Nothing goes stale on its own.** The only fluid simulation the game runs over time is rain filling rain catchers, plus heat (which purifies tainted water). Clean oil turning dirty, milk going off in a jug: if you want it, you write it.
4. **Several calls lie by name.** Read [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie) before your first line of fluid code.
5. **The vanilla pour actions work in multiplayer.** What decides whether a change reaches other players is where the container sits. See [fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer).

> **Proof:** Code. `zombie.entity.GameEntity#addComponent` is package-private (`final boolean addComponent(Component)`); `zombie.scripting.objects.VehicleScript` reads no components; `zombie.entity.components.fluids.FluidContainer#canAddFluid` (eight fluids) and `#Transfer` (proportional); the fluid update system only processes containers with `isQualifiesForMetaStorage()`, which is `getRainCatcher() > 0.0F`, and skips clients. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The fluids section, in reading order

| Page | Read it when |
|---|---|
| [The fluid system](/pz/build-42/modding/fluids/the-fluid-system) | You want the script syntax for a fluid and a container |
| [Defining a fluid: names, Poison and Properties](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties) | You are writing a `fluid` block |
| [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie) | You are writing Lua that adds, removes or converts fluid |
| [Drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling) | Your fluid can be drunk, or your mod boils, cleans or poisons |
| [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer) | Your mod changes fluid anywhere other than a single-player test |
| [What a mod fluid can plug into](/pz/build-42/modding/fluids/what-a-mod-fluid-can-plug-into) | You hope your fluid will burn, fuel or poison food like a vanilla one |
| [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer) | Anything in your mod needs a hot pot |
| [New fluid (cookbook)](/pz/build-42/modding/cookbook/new-fluid) | You want a working example to copy |
| [Outcast Motors fluid research](/pz/build-42/modding/fluids/fluid-system-research) | You want the long research behind a car mod's fluids |

## What our older pages got wrong

We publish our mistakes on purpose; they are the most useful thing we have. Three claims in the older fluid pages were the opposite of what the game does. They have since been corrected in place, and the pages above say the right thing:

- "Do not reuse the vanilla transfer action, it does not work in multiplayer." It does; its `complete()` runs on the server.
- "Poison `minAmount` and `diluteRatio` control the dose." They are never read, and a Poison block needs a Properties block to do anything.
- "A fluid named like a vanilla one in your module is a separate fluid." It replaces the vanilla one.

If you find one we missed, tell us. That is how this page got written.
