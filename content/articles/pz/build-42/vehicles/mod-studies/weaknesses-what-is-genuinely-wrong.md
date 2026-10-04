---
id: build-42-weaknesses-what-is-genuinely-wrong
slug: weaknesses-what-is-genuinely-wrong
title: · Weaknesses -- what is genuinely wrong
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: advanced
tags:
  - vehicles
  - outcast-motors
  - assessment
  - roadmap
excerpt: >-
  We test single-player and ship multiplayer. Three MP-only questions surfaced
  this week from reading other people's code, not from our own testing. The
  first, whether ISInstallVehiclePart:complete runs in multiplayer, came out
  the other way: it runs on the server...
last_updated: '2026-10-04'
related_articles:
  - the-inventory
  - what-each-source-is-authoritative-for
  - strengths-what-we-genuinely-do-better
  - what-we-missed-the-architectural-one
  - what-we-could-add-the-gap-revised
  - the-plan
  - the-one-line-version
---
# · Weaknesses -- what is genuinely wrong

> Source: 24-synthesis-and-assessment.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**We test single-player and ship multiplayer.** Three MP-only questions surfaced
this week from *reading other people's code*, not from our own testing:
whether `ISInstallVehiclePart:complete` runs in multiplayer; `getMechanicsItem`
does not work there; PSC needed a bespoke packet because fluid state will not
ride part modData sync. The first turned out to be the opposite of what that code
told us: in Build 42 multiplayer, `complete()` runs **on the server**, which
rebuilds the action from the client's request, so vanilla's part change and XP do
land on a dedicated server. The epic schedules "Multiplayer Sync" as a v0.2
feature, but **MP assumptions are being baked into v0.1 code right now**, and
every one of them is currently untested and probably wrong. This is a sequencing
error, not a missing feature.

> **Proof:** Code. `zombie.core.NetTimedAction#parse` and `#perform`; `zombie.characters.CharacterTimedActions.LuaTimedActionNew#complete`. Build 42.20 (revision a2947723ca).

**Our probe kit produces the stimulus and observes it.** Numpad 8 damages the
Engine part and then checks whether Engine-part damage was absorbed. It cannot
fail. The real crash test -- twenty-six minutes, 87,000 frames -- produced total
silence, and it took reading the decompile to learn why. Of four in-game
milestones, one was signed off against a stimulus the game never actually
produces. **The question to carry forward is not "did the test pass" but "did the
test apply the same stimulus the game does".**

**We have no uninstall path.** Removing Outcast Motors leaves nineteen phantom
items in every engine bay and a mirrored condition with no mirror behind it.
ExpandedVehicleStorage ships `restoreVehicle`; we do not. This is a user-facing
defect on a mod intended for a server.

~~**No data version.**~~ **Wrong -- withdrawn 2026-08-10.** `OMO_Data` has
carried `Data.SCHEMA`, a `migrate()` switch with a live `[0] -> 1` arm, and
`Data.wipe` since the first commit. Checked before acting on it. The genuine
half of this item is that **there is no `restoreVehicle`**, which stands.

**Silence is ambiguous.** The mirror logs when it acts and says nothing when it
does not, so "did not fire" and "did not run" are indistinguishable. That is
lesson 11 inverted and it cost us the crash test.

**The product is not yet fun.** Nineteen parts exist, spawn, persist, and mirror
a number. A player cannot install one, remove one, repair one, or observe any
consequence of any of it. Everything that makes PSC worth 113k subscribers is in
the unbuilt half.

---

*Corrected 2026-10-04: ISInstallVehiclePart:complete does run in multiplayer, on the server; it is not a client-only hook.*
