---
id: build-42-ol-vehicleparts
slug: ol-vehicleparts
title: OL_VehicleParts
game: pz
version: build-42
section: outcast-mods
category: outcast-lib
difficulty: advanced
tags:
  - outcast-lib
  - api
  - ol-init
  - containers
excerpt: >-
  A registry where a mod that owns vehicle parts meets a mod that draws them.
  Producers register; UI mods enumerate. The library holds it so that neither
  has to exist for the other to work.
last_updated: '2026-10-04'
related_articles:
  - implementation-status
  - ol-init
  - ol-containers
  - ol-reach
  - ol-squares
  - ol-compat
  - ol-options
  - ol-debug
  - log-file-location
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# OL_VehicleParts

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A registry where a mod that **owns** vehicle parts meets a mod that **draws**
them. Producers register; UI mods enumerate. The library holds it so that
neither has to exist for the other to work.

### Why it is here and not in the UI mod

The obvious design -- the UI mod exposes `OutcastMotorsUI.register(...)` --
breaks on **load order**. Mods load in the order of the mod list, not by name,
and neither mod requires the other, so nothing stops `OutcastMotors` from loading
before `OutcastMotorsUI`; when it does, the UI global does not exist yet when the
producer wants to register. Deferring to `OnGameStart` works until a producer has
something to say earlier, or is installed *without* the UI and must guard every
call site.

> **Proof:** Code. `zombie.Lua.LuaManager#LoadDirBase(String, boolean)` (vanilla files sorted by path, then each mod in `zombie.ZomboidFileSystem#getModIDs` order, its files sorted only within that mod) and `zombie.ZomboidFileSystem#loadMods(List)` with `#loadModAndRequired` (the mod list in its own order, each mod's `require=` mods added just ahead of it). Build 42.21.0 (revision 4a0e9546ec).

`require=OutcastLib` guarantees the library loads first
(`ZomboidFileSystem.loadModAndRequired:827-855`), so the registry is always
there. Two consequences that are the point of the design:

- a **producer works with no UI mod** installed -- registration never depends on
  being consumed;
- a **UI mod works with no producers** -- it shows vanilla's parts and the
  provider list is simply empty.

### The provider contract

`OutcastLib.VehicleParts.CONTRACT` is the list of methods, declared as data so
that adding a capability forces every provider to answer for it at registration
rather than nil-indexing the first time a UI calls the new one.

```lua
listGroups(vehicle)                              -> { { id, name, order, tier, icon }, ... }
listParts(vehicle, groupId)                      -> { { id, name, present, condition,
                                                        grade, quality, skill, icon, critical }, ... }
listActions(vehicle, partId, character)          -> { { id, label, enabled, reason }, ... }
performAction(vehicle, partId, actionId, chara)  -> boolean, string
```

**An empty list is a legitimate answer to all three.** A producer with no actions
yet returns `{}` from `listActions`; inventing greyed placeholder actions would
put a lie on screen.

The registry deliberately **does not validate what a provider returns**. Field
meanings (`condition` is 0..100, `grade` is a multiplier near 1.0) are the
producer's to report correctly and the UI's to read correctly; a validator here
would be a third place that has to agree.

### `VehicleParts.registerProvider(id, provider)`

`id` is the producing **mod's** id -- `"OutcastMotors"`, not `"engine parts"`.

A repeat registration **replaces and says so** rather than raising. Two mods
cannot share a mod id, so a collision can only mean the same mod registered
twice -- which is what a Lua reload during development looks like. Raising would
make the reload button useless for anyone working on a producer and would guard
against something that cannot happen.

### `VehicleParts.providers() -> array`

`{ { id = string, provider = table }, ... }` in **registration order**, and a
**fresh array each call** so a consumer that sorts or trims cannot reach back
into the registry. That allocation is affordable precisely because the contract
says a UI calls this on refresh, never per frame.

### `VehicleParts.get(id) -> table|nil`
### `VehicleParts.count() -> number`

`nil` from `get` is the normal answer, not an error: "is Outcast Motors providing
parts" is a reasonable question with a legitimate no.

### `VehicleParts.safeCall(id, method, ...) -> ok, first, second`

Calls a provider method defensively. On failure returns `false, nil` and the
caller should **skip that provider for this refresh, not disable it** -- the next
refresh may well succeed, and a latched-off provider is harder to explain than an
empty group.

Two returns are passed through so `performAction`'s `reason` survives.

Swallowing here is not silencing: Kahlua prints a full stack trace for anything
raised even under `pcall`, so the console still gets the whole story. What this
adds is one sentence naming **which provider and which method** -- the trace
alone does not make the producing mod obvious -- and it suppresses repeats so a
refresh loop cannot bury the console.

### `VehicleParts.actionFinished(providerId, vehicle, partId, actionId, ok, reason) -> number`
### `VehicleParts.onActionFinished(fn) -> unsubscribe`

`performAction` returns `true` for **STARTED**. This is the seam that says an
action **ENDED**. Returns how many listeners were notified, so a producer can
tell "nobody was listening" from "it fired".

**It fires on death as well as success.** `ok = false` with a reason covers a
refusal, a cancellation, and an action dropped mid-flight. Not politeness:
Outcast Motors' `e9d6b60` fixed a field collision that had been destroying every
install, uninstall and repair the mod ever queued -- ten in one session, silently
-- and a success-only signal would have stayed quiet through every one.

`ok` **must be a real boolean.** `nil` is indistinguishable from `false` at every
listener, so a producer that forgot the argument would silently report failure and
the panel would flash red on a completed repair. It raises.

An **unregistered `providerId` warns once and still dispatches.** A typo would
otherwise deliver to listeners that all filter it out, so nothing flashes and
nothing says why -- but it does not raise, because a provider whose registration
was replaced mid-session still has a real result to report.

#### Where a producer must call it, and it is not where it looks

Not at the end of its timed action. Outcast Motors' action runs client-side and
deliberately writes nothing; the authoritative write happens afterwards.
`OMO_PartAction.lua:28-30`:

> *An action that reported its own success would be reporting a request, not a
> result.*

Calling it when the action stops ticking reports exactly what `performAction`
already reported, one animation later.

#### It does not transmit, and the engine asymmetry that makes that workable

The library has no network surface and is not gaining one. A call reaches only
the Lua state it was made in. Verified in the decompile rather than assumed:

| | |
|---|---|
| `sendClientCommand` falls through to `SinglePlayerClient` in SP, so **client -> server works solo** | `LuaManager.java:8930` |
| every `sendServerCommand` overload is `if (GameServer.server)` with **no else**, so **server -> client is dead solo** | `:8966`, `:8976`, `:8986` |

Outcast Motors' resolution, which this is shaped to support: the server decides,
then **calls this directly** (effective in SP, where server and client Lua share
one state; harmless on a dedicated server, whose state has no panel) **and sends
it** (inert in SP, effective in MP). Exactly one route is effective per
configuration and they cannot double-fire, both being switched by
`GameServer.server`.

That holds for a co-op host too: `GameServer.server` is written in only two
places (`GameServer.java:419`, `GameWindow.java:579`) and the second reads the
`-Dserver=true` system property, so a server is always its own process and never
shares a VM with a panel.

#### Listeners

`onActionFinished` returns an **unsubscribe** function, safe to call twice. A
mechanics panel is created and destroyed with its window, so a list that only
grew would present as the flash firing four times.

Every listener hears every provider; filtering on `providerId` is the consumer's
business.

Dispatch runs over a **snapshot**, and re-checks each record before calling it. A
listener may unsubscribe -- itself or another -- from inside its own callback, and
a panel closing in response to a completion is how that happens. Both halves are
load-bearing: without the snapshot the dispatch crashes, and without the re-check
an already-unsubscribed listener is still called.

Listeners are isolated exactly as `safeCall` isolates a provider -- `pcall`,
complained about once per listener per session -- so a consumer that raises cannot
take down the producer's action.

### The gap the version handshake cannot cover

This module is **additive**: it removes nothing and changes no signature, so
`OL.VERSION` stays at **2**. But that leaves one case worth naming because it
will happen to somebody:

> A player runs a **v2 library that predates this file**, alongside a producer
> that expects it. `OutcastLib.require(2, ...)` **passes** -- the library really
> is v2 -- and then `OutcastLib.VehicleParts` is `nil`.

So **every producer must check for the table before registering** and say so in
one sentence rather than nil-indexing. `OutcastMotors/OMO_Provider.lua` is the
reference for that check.

### Feature-detection is the contract. Do not wait for a capability set.

Asked by OutcastMotorsUI, 2026-08-24, after the second additive change proved
invisible to `require(2, ...)`. Written down here so four consumers do not invent
four different guards.

**The rule, in one line:** check the exact symbol you are about to call, with
`type(x.method) == "function"`, at the moment you would call it.

```lua
local registry = OutcastLib and OutcastLib.VehicleParts
if registry and type(registry.onActionFinished) == "function" then
    self.unsubscribe = registry.onActionFinished(handler)
end
```

**Check the FEATURE, not the container.** `OutcastLib.VehicleParts ~= nil` tells
you the registry exists; it tells you nothing about whether the method you want
is on it. Those are different questions and this module is the proof: a library
built between `9934f22` and `c8c4137` has a perfectly good `VehicleParts` with
`safeCall`, `providers` and `get`, and no `onActionFinished` at all.

#### Why not a `CAPABILITIES` set

Because it is a **second copy of a claim about the code**, and it drifts in both
directions:

- add a method, forget the flag -> the flag says absent, and every consumer
  permanently skips a feature that is sitting right there
- rename or remove a method, leave the flag -> the flag says present, a consumer
  trusts the handshake, and calls nil. **A capability set that is wrong is worse
  than no capability set**, because it is the thing consumers were told to trust
  instead of looking

`type(x.method) == "function"` cannot drift. It is not a description of the truth,
it **is** the truth, read at the moment it matters.

This is the same defect class the correspondence convention was adopted against
in the first place: a claim that was true once. We are not going to add a
mechanism whose entire job is to hold one.

#### Why not a revision integer alongside `VERSION`

`OL.VERSION = 2, OL.REVISION = 7` has the same drift problem -- somebody must
remember to bump it -- and adds one of its own: a consumer then needs to know
*which revision introduced which method*, which is a lookup table in
documentation, which is a third copy. Feature detection needs no table.

#### `VERSION` is not broken, and is not being bumped

`require(2, ...)` answers **"is the shape I depend on still compatible"**, and it
answers it correctly. It was never meant to answer **"is this new enough to have
X"**. Those are different questions; the first is what a major version is for and
the second is what feature detection is for. Rule 5 stands: additive work does
not bump.

#### The runtime punishes an unguarded call far worse than a nil error

Raised by Outcast Motors, 2026-08-25, and it is the reason feature-detection is
mandatory here rather than merely tidy.

**Kahlua prints a full Java and Lua stack trace even for a CAUGHT error.** So the
cost of calling a method that is not there is not one failed call that a `pcall`
quietly absorbs -- it is a stack dump **per repair, per refusal, per oil change**,
burying the log that is supposed to tell the player what is wrong. The same fact
`OL_Debug`'s gate latches off after one failure for, and `safeCall` suppresses
repeats for.

That makes the guard load-bearing in a way no test can show. Outcast Motors
mutation-checked their own `type(actionFinished) ~= "function"` guard in
`Provider.reportFinished`: **deleting it changed nothing observable** -- the
`pcall` below swallows the nil call and both versions return 0 -- and they kept
it anyway, recording why in source and in the test so nobody deletes it later
with the suite's blessing.

Their conclusion generalises to every capability this registry gains, which is
why it is written here rather than left in their file: **a consumer checking for
a function before calling it is not paranoia in this runtime.**

#### Say it once, at load. Stay silent at the call site.

A guard that silently does nothing leaves a player with a feature missing and no
explanation, which is the shape rule 4 exists to prevent. A guard that complains
per call buries the console -- the same reason `safeCall` latches `complained`
after the first line.

So: **note once at load, where the consequence is player-visible and the player
can act on it** ("update OutcastLib"), and let the call-site guard be silent.
OutcastMotorsUI arrived at exactly this split independently -- `OMU_Hook.lua:376`
notes once at load, `OMU_PanelFlash.lua:213` returns silently -- and their file
headers give the reasoning in both places. That convergence is why it is the rule
here rather than a preference.

One consequence worth stating, because it is currently unmet on both sides: a
load-time note that tests the **container** does not cover a missing **feature**.
`OMU_Hook.lua:376` fires when `VehicleParts` is nil, which is right for
`safeCall`, `providers` and `get` -- those have existed since the registry did,
so a non-nil registry always has them. `onActionFinished` is the first method a
player can be missing while holding a working registry, and nothing announces it.

### Scope

A registry for vehicle part providers. **Not a plugin bus, not an event system**,
and not a place to hang the next cross-mod idea. It does not call providers on
its own schedule -- the UI decides when to refresh, and a registry that polled
would run producer code with nobody looking at the result.

It arrived with **two named consumers on the day it landed**, which is the bar
rule 3 sets and the bar Cluster B failed.

*Corrected 2026-10-04: mods do not load alphabetically. They load in mod-list order, each mod's `require=` mods first; only the files inside one mod are sorted by name.*
