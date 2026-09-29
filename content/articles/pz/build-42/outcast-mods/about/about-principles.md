---
id: build-42-about-principles
slug: about-principles
title: Outcast mod family -- principles
game: pz
version: build-42
section: outcast-mods
category: about
difficulty: beginner
tags:
  - outcast-mods
  - principles
  - family
excerpt: >-
  Read this before making a design trade-off, and paste it into any brief that
  goes to a developer or an artist.
last_updated: '2026-09-29'
---
# Outcast mod family -- principles

> Source: PRINCIPLES.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Read this before making a design trade-off, and paste it into any brief that
goes to a developer or an artist.**

## The rule

**Every Outcast mod is built for the Outcast community.**

The only question that decides a design choice is:

> Does this make the mod work as well as it can, in game and in multiplayer?

## Not considerations

These must not appear in reasoning, code comments, design docs, commit messages
or briefs:

- Workshop popularity, install counts, subscriber numbers
- Whether a dependency will "put people off"
- Download size, or how many other mods a player already runs
- Whether a mod is installable standalone, as an argument for a weaker design
- Comparisons to how many people use a rival mod

There is no popularity contest. We are not competing for installs.

## What follows from it

**A `require=` that makes the mod work better is simply correct.** Do not hedge
it, do not soft-resolve a dependency to avoid declaring it, do not weigh
adoption. `_shared/README.md` already settled this once: the mods are unlisted
and private to one server, so *we* are the players, there are no public
subscribers whose installs a new `require=` could break, and `require=` usefully
drives load order and fails visibly when unmet.

**Own correctness rather than depend on something approximately right.** If a
third-party mod does 90% of what we need and carries a bug in the rest,
building it ourselves is the better answer, not the heavier one. We cannot fix
someone else's mod, and shipping their bug is still shipping a bug.

**Multiplayer correctness ranks with singleplayer, not below it.** "Untested in
MP" is an open defect. "Works in singleplayer, snaps for other players" is a
broken feature, not a partial one.

**Quality over coverage.** Twenty families that look right beat twenty-three
where three are wrong. A family excluded on purpose, with the reason recorded,
is a finished decision -- not a gap.

## For artists

The same applies to the art. We are not shipping to a deadline or a download
count. If a panel does not sit right, say so and we will rebuild it; if a
vehicle genuinely has no hood, we drop the family rather than invent one. A
correct "this cannot be done well" is worth more than a delivery that ships and
looks wrong.

Flag assumptions rather than proceeding quietly on them, and tell us when a
brief asks for something that cannot work -- that has already saved this project
twice.
