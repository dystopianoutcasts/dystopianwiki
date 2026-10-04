---
id: build-42-trait-mods-in-build-42
slug: trait-mods-in-build-42
title: 'Dynamic trait mods in Build 42: a survey before you build one'
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - traits
  - mod-study
  - dynamic-traits
excerpt: >-
  Want traits you earn and lose by playing? Several mods already do it. A
  survey of the dynamic-trait and trait-content mods we found, how the best
  of them are built, and the design ideas worth learning from before you
  write your own.
last_updated: '2026-10-04'
---
# Dynamic trait mods in Build 42: a survey before you build one

Outcast, "traits you earn by playing" is one of the first ideas every trait modder has. We had it too: become Desensitized by killing enough zombies, become a Smoker by smoking. Before writing a line, we looked at what the community had already built. A lot, it turns out, and some of it is excellent. This page is that survey, so you can start from the state of the art instead of from zero.

How we looked: we searched about a thousand Workshop items we had downloaded, once by code (`TraitFactory`, which catches older trait mods) and once by name and description (which catches the Build 42 ones, since Build 42 has no `TraitFactory`). Versions are as we found them on 2026-08-05; the mods have likely moved on since.

> **Proof:** Reported. Read from the mods' own files in the Steam Workshop download cache: `mod.info` (versions, requirements), file layout and Lua. Not run in game by us. Build 42.20, engine revision a2947723ca.

For the vanilla trait API these mods sit on, see [trait API](/pz/build-42/modding/skills-and-traits/trait-api) and [trait reference](/pz/build-42/modding/skills-and-traits/trait-reference).

## The reference implementation: Evolving Traits World

[Evolving Traits World](https://steamcommunity.com/sharedfiles/filedetails/?id=2914075159) (ETW), by MusicManiac, makes most vanilla traits dynamic: about sixty of them can be earned or lost as you play. It is large (49 Lua files when we read it), long-lived, sandbox-tunable and written with multiplayer in mind. If your idea is "make vanilla traits dynamic", ETW already does it, and anyone running your mod alongside it would have two mods fighting over the same traits.

What makes it worth studying is its structure. It sorts traits into **trigger channels**, one server-side module per channel:

| Channel | Example traits |
|---|---|
| Kills | Desensitized, Brave, Cowardly, Hemophobic, Pacifist, Eagle Eyed |
| Health and body | Iron Gut, Weak Stomach, Resilient, Prone to Illness, Thick and Thin Skinned, Asthmatic |
| Skills | about 29, from Keen Hearing and Graceful to Handy and Fast Learner |
| Time and routine | Needs Less or More Sleep, Smoker |
| Location | Outdoorsman, Agoraphobic, Claustrophobic |
| Weather, actions, foraging | Night Vision, Axeman, the reader traits, Herbalist, Organized and Dextrous |

Three of its ideas are worth taking even if you build something different:

- **Smoking is an addiction model, not a timer.** An addiction value rises with each smoke and decays over time, more slowly under stress and panic, with gain and loss thresholds you can tune in the sandbox.
- **Delayed traits.** A trait you qualify for is queued and announced before it lands, instead of appearing out of nowhere.
- **It exports functions for other mods.** ETW publishes a shared file of functions (for example its smoking maths) and registers its traits with a separate framework so the character screen can mark which traits are dynamic. Feeding your own actions into ETW is far cheaper than competing with it.

## Smaller dynamic-trait systems

| Mod | What it is | Worth reading for |
|---|---|---|
| [Adaptive Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3622328997) | About thirty traits in eight Lua files, with a clean split into registry, manager, store, notifier, client and server | The smallest complete architecture |
| More Traits - Dynamic (a part of [More Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=1299328280)) | Makes More Traits' own traits dynamic; by the author of ETW | Shipping the traits and the dynamism as separate, optional mods |
| [Lifestyle](https://steamcommunity.com/sharedfiles/filedetails/?id=2997342681) and [Lifestyle: Hobbies](https://steamcommunity.com/sharedfiles/filedetails/?id=3622178177) | A small hourly engine: one flat table of trait, skill and level, checked every in-game hour | The ledger idea below |
| [Somewhat Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3498347699) | Toggles Speed Demon and Sunday Driver from how you drive | A single behaviour-driven pair |

The best single idea in the survey comes from Lifestyle. It records in the player's mod data **which traits its own system granted**, and its sandbox option for losing traits has three modes: never lose, lose any, or **lose only what this system gave you**. The third mode means a dynamic system never takes away a trait the player chose at character creation, and it is the right default for any mod like this.

## What nobody had built yet (when we looked)

- **Addictions other than smoking.** Alcohol and painkillers had no addiction model, and no mod had a withdrawal or craving indicator.
- **Systematic decay.** ETW decays a handful of channels (smoking, outdoorsman, fear of locations, injuries), but the large skill-driven family has none, because skills themselves never decay. A general "use it or lose it" layer, with a grace period, a decay curve and a warning before loss, was unserved.

If you build in this space, those are the gaps, and integrating with ETW rather than replacing it is the friendly way to fill them.

## Trait content packs and single-trait mods

Not dynamic systems, but good idea sources:

- **Content packs:** [More Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=1299328280) (the big one, with optional groups), [Simple Overhaul: Traits and Occupations](https://steamcommunity.com/sharedfiles/filedetails/?id=2840805724) (a rebalance of the vanilla set), [Even More Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3650143655), [Trait Menagerie](https://steamcommunity.com/sharedfiles/filedetails/?id=3529845220), [Challenge Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3634630898) (traits that start you injured), [Combat Traits](https://steamcommunity.com/sharedfiles/filedetails/?id=3427091746) and [Mindset](https://steamcommunity.com/sharedfiles/filedetails/?id=3554341903).
- **One trait, in depth:** [Psychopath Trait](https://steamcommunity.com/sharedfiles/filedetails/?id=3736555309) (31 Lua files for a single trait, the depth ceiling), [Asthma](https://steamcommunity.com/sharedfiles/filedetails/?id=3470657747) (attacks from stress, panic and temperature, with an inhaler for relief), [Break Into Tears](https://steamcommunity.com/sharedfiles/filedetails/?id=2871038554) and [Paniqeur Trait](https://steamcommunity.com/sharedfiles/filedetails/?id=3393305357).
- **Skill mods that hang traits off a new perk**, such as [Driving Skill](https://steamcommunity.com/sharedfiles/filedetails/?id=2721945297): the pattern to copy when a dynamic trait needs a hidden progress track behind it.

One Build 42 warning that applies to all of them: older trait mods add traits with `getTraits():add(...)` and `TraitFactory`, which Build 42 removed. A mod written that way is a design reference, not code you can port. See [trait modding correction](/pz/build-42/modding/skills-and-traits/trait-modding-correction).

> **Proof:** Code. No `TraitFactory` class and no `getTraits()` method on `zombie.characters.IsoGameCharacter` in the decompiled game. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Trait API](/pz/build-42/modding/skills-and-traits/trait-api)
- [Adding a trait](/pz/build-42/modding/skills-and-traits/modding-add-a-trait)
