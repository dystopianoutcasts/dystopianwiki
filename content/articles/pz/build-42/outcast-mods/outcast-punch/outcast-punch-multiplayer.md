---
id: build-42-outcast-punch-multiplayer
slug: outcast-punch-multiplayer
title: Outcast Punch -- multiplayer
game: pz
version: build-42
section: outcast-mods
category: outcast-punch
difficulty: intermediate
tags:
  - outcast-punch
  - multiplayer
  - combat
excerpt: 'What is proven, what is not, and what to do if the untested part fails.'
last_updated: '2026-09-29'
---
# Outcast Punch -- multiplayer

> Source: OutcastPunch/docs/MULTIPLAYER.md (compiled 2026-08-25, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

What is proven, what is not, and what to do if the untested part fails.

---

## Status

**Hosted multiplayer works, verified 2026-08-02.** In a hosted game, punching
landed damage, awarded XP and killed a zombie:

```
Mode: multiplayer.
[BOOT] engine contract OK -- 39 symbols verified.
[HIT] PUNCH LANDED : 0.351 ... health 0.981 -> 0.630, +0.88 xp
[HIT] PUNCH LANDED : 0.367 ... health 0.630 -> 0.263, +0.92 xp
[HIT] PUNCH LANDED : 0.336 ... health 0.263 -> 0.000, +0.84 xp (KILL)
```

The stomp exclusion held too: `aimAtFloor=true` produced
`not our case -- vanilla shove expected`.

**Dedicated server tested 2026-08-03. The punch works.** The damage risk this
document was written about **did not materialise** — zombie authority carried our
`applyDamage` exactly as "Why it might work anyway" predicted, so the
`lua/client/` -> `lua/shared/` move described under "The fix, if it fails" is
**not needed** and has not been made.

Two other things broke instead, and neither was on this document's risk list:

| symptom | cause | fix |
|---------|-------|-----|
| no XP from punches | `addXp` is a silent no-op on an MP client — `LuaManager.java:11893` runs `GameServer.addXp` only when `GameServer.server`, and `getXp().AddXP` only when **not** `GameClient.client`. A dedicated-server client is neither. | ~~`OCP_Skill.awardXp` now calls `character:getXp():AddXP` directly~~ **This fix was also wrong** — see [No XP, take two](#mp-xp) below. [ENGINE.md#addxp](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine#addxp) |
| stomping replaced by a punch | `isAimAtFloor()` is one swing stale inside `OnWeaponSwing` — `SwipeStatePlayer.enter` fires the event at `:206` and writes the accessor at `:217`. | `AimFloorAnim = false` condition on both punch nodes, plus a matching rejection in `OCP_Damage.lua`. [ENGINE.md#stomp](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine#stomp) |

**Both were invisible in a hosted game**, for the same underlying reason the
damage risk was: the host process is also the server, so `GameServer.server` is
true and the code takes a different branch. The stomp bug was *present* in the
hosted test and was misread as a pass — the "stomp exclusion held" line below was
recorded on a repeat stomp, where the stale flag happened to carry the right value
from the previous stomp. **A hosted game is not a test of anything that branches on
`GameServer.server` or `GameClient.client`.**

The earlier note under "Things to check before the server goes live" said of XP
only "verify it lands once, not twice". The real failure mode was that it did not
land at all, and the reason was visible in the binding the whole time.

---

## No XP, take two

<a id="mp-xp"></a>

**Reported 2026-08-10: still no XP on the live server.** The 2026-08-03 fix
replaced `addXp` with `character:getXp():AddXP`, which does run on a client. It
just does not survive.

XP in B42 multiplayer moves in **one direction only**:

- `NetworkPlayerManager.update():43` calls `syncXp()` for every connected player
  on the server's stats timer.
- `NetworkPlayerAI.syncXp():704` is wrapped in `if (GameServer.server)`. It only
  ever sends **server -> client**. There is no client -> server XP sync in normal
  play: `PlayerXpPacket` needs the admin capability
  `CanModifyPlayerStatsInThePlayerStatsUI`, and `ConnectedPacket` carries XP only
  at connect time.
- The receiving client runs `getXp().load()`, and `IsoGameCharacter.XP.load()`
  at `:17560` calls **`this.xpMap.clear()`** before repopulating from the server's
  bytes. A client-side award is not merged or rejected — it is erased.
- `PlayerDB` persists the **server's** copy (`player.save(bb)`), so the award
  never reaches the save either.

So both engine calls fail from a client, in opposite directions: `addXp` does
nothing at all, and `getXp():AddXP` writes something that is wiped within a tick.
Finding one of them broken made the other look like the fix.

### Vanilla is server-side, and does not look it

Farming and Fishing call `getXp():AddXP` from `client/` Lua, which is what made
the second fix look justified. Melee is not built that way:

- `CombatManager.java:1134` raises `OnWeaponHitXp` only when
  `!GameClient.client && !GameServer.server` — **single player only**.
- `WeaponHit.java:106` raises the same event `if (GameServer.server)`, when the
  attacking client's hit packet lands.
- The handler is `server/XpSystem/XpUpdate.lua:385`, and it calls the global
  `addXp()` — which is correct there, because it is running as the server.

Hooking `OnWeaponHitXp` ourselves is **not** a safe shortcut: on a hosted game
`GameServer.server` is true, so `CombatManager` skips it and `WeaponHit` only
fires for *remote* clients. The host's own punches would raise it nowhere.

### What the mod does now

One path for every mode, because `sendClientCommand` has a single-player
loopback (`LuaManager.java:8980` -> `SinglePlayerClient` ->
`SinglePlayerServer.java:204` raises `OnClientCommand`) and its 4-arg overload
raises the event in-process when `GameServer.server`:

```
client/OCP_Damage.lua   punch lands, rolls damage
  -> shared/OCP_Skill.awardXp        sends { damage } only
    -> sendClientCommand
      -> server/OCP_ServerXp.lua     clamps, recomputes xp, calls addXp()
```

`addXp()` is correct **in that file and only that file**: on a dedicated server
it routes to `GameServer.addXp` (authoritative, and it calls `updateXpChecker()`
so `AntiCheatXPUpdate` does not flag the award); in single player both
`GameServer.server` and `GameClient.client` are false, so it takes the local
branch.

`getXp():AddXP` must **not** be used server-side — its 2-arg overload is gated on
`isLocalPlayer` (`:17313`), and a remote player on a dedicated server is not
local, so it would silently do nothing.

The client sends **damage, never an xp number**. The server clamps it to
`Skill.maxLegitDamage()` — derived from the weapon script and the level curve, so
it cannot drift — and recomputes the award itself. `XP_CAP` bounds the result
regardless, and the engine's anti-cheat bounds the rate.

### Two failure modes this leaves visible

The punch log now says `xp requested`, not a landed figure, because the award is
asynchronous in every mode and the aptitude multiplier is applied on the far
side. The authority logs what it actually granted.

`OutcastPunch.dumpServerXp()` on the server console reports granted / clamped /
refused counts and whether the perk registered. If the perk is missing there, the
mod is not in the **server's** `Mods=` list — and note the perk id crosses the
wire as a string (`savePerk`/`loadPerk`, `:17545`), where `FromString` returns
`MAX` -> null and the entry is **silently dropped**. XP would not persist no
matter how it was awarded.

---

## Why the dedicated case is different

<a id="risk"></a>

Four facts, each verified against the engine:

**1. `applyDamage` does not network.** `IsoGameCharacter.java:16065` is a bare
field mutation:

```java
public void applyDamage(float damageAmount) {
   this.health -= damageAmount;
   if (this.health < 0.0F) this.health = 0.0F;
}
```

Nothing is sent. Whatever we do with it is local to the machine that ran it.

**2. PZ networks combat by sending the damage number.** `WeaponHit.process`
(`zombie/network/fields/hit/WeaponHit.java`) ends with:

```java
target.Hit(weapon, wielder, this.damage, ignore, this.range, true);
```

The attacking client computes damage and transmits it; the receiver replays
`Hit()` with that value.

**3. A shove transmits `ignore = true`.** That is `bIgnoreDamage`, set for a
shoving player at `IsoGameCharacter.java:6079`. So the packet describing our
punch explicitly tells the far side **not** to apply damage — which is correct
for a vanilla shove, and is exactly the flag our whole mod is built around
working past locally.

**4. `OCP_Damage.lua` lives in `lua/client/`.** A dedicated server never loads
it, so nothing on the server side is compensating.

**Therefore the risk is:** on a dedicated server the zombie dies on the
attacker's screen and stays alive for everyone else.

---

## Why it might work anyway

<a id="zombie-authority"></a>

PZ does not hold zombies server-authoritatively. Each zombie carries a
`NetworkZombieComponent` with an **`authOwner`** — a `UdpConnection`, i.e. a
*client*:

```java
private UdpConnection authOwner;
public boolean isRemote() { return this.authOwner == null; }
```

Zombies are simulated by whichever client owns them, and the server relays. If
our client owns the zombie it is punching, our local health may be the copy that
propagates, and the mod would work on a dedicated server too.

This is also why zombie desync and combat cheating are long-standing complaints
about PZ multiplayer, independent of any mod —
[[1]](https://steamcommunity.com/app/108600/discussions/6/691996029262886646/)
[[2]](https://steamcommunity.com/app/108600/discussions/0/846243771540635092/).
B42 multiplayer is still a test build.

---

## What the literature says

This is the classic anti-pattern. Gabriel Gambetta's
[Client-Server Game Architecture](https://www.gabrielgambetta.com/client-server-game-architecture.html)
states the rule plainly: **clients send inputs, not state.** The server owns the
world; a client that declares "this entity now has this health" is a client that
can be lied to or lie.

[Valve's Source networking docs](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking)
and Gambetta's
[prediction and reconciliation](https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html)
article describe the accepted shape: the client predicts locally for
responsiveness, the server validates and corrects, and the client reconciles to
whatever the server says.

**PZ inverts this for zombies.** That is the engine's design, not ours, and we
inherit it. The practical consequence for a mod: doing what vanilla does is the
safest available option, because it desyncs no worse than the base game. Doing
something vanilla does not do is where a mod introduces *new* divergence.

Our punch currently applies damage in a way vanilla never does on this path.
That is the part to prove.

---

## The test that settles it

A dedicated server, two players, both looking at the same zombie:

1. Player A punches it to death.
2. Player B watches.

| outcome | meaning |
|---------|---------|
| B sees it take damage and die | zombie authority carried our damage; nothing to fix |
| B sees it die only when A's client says so, then it stands back up | classic desync; needs the fix below |
| B sees it never take damage | our damage is local-only; needs the fix below |

Check both players' logs. `OutcastPunch.dump()` on each reports contract status
and the last hit result.

---

## The fix, if it fails

<a id="fix"></a>

**Preferred: let the server apply the damage.**

`WeaponHit.process` calls `target.Hit(...)` on the receiving side, and `Hit()`
fires `OnWeaponHitCharacter` wherever Lua is listening — including a dedicated
server. So the same handler, loaded server-side, would see the same event.

That means moving `OCP_Damage.lua` from `lua/client/` to `lua/shared/`, guarded
so exactly one side applies damage:

```lua
-- Dedicated server: the server is authoritative, let it apply.
-- Single player and hosted: no server process, apply locally.
if isClient() and not isServer() then return end
```

`isClient()` and `isServer()` are the standard globals — vanilla uses them 614
and 281 times respectively.

**Alternative: an explicit client command.** `sendClientCommand` on hit, with an
`OnClientCommand` handler server-side applying the damage
([Lua docs](https://demiurgequantified.github.io/ProjectZomboidLuaDocs/md_Events.html)).
More code and an extra round trip, but it makes the authority boundary explicit
and is the shape the netcode literature actually recommends.

**Either way the damage roll must move to `shared/`,** which it already is
(`OCP_Fist.lua`, `OCP_Skill.lua`, `OCP_Hands.lua`). That was deliberate from the
start — the modules were split so client and server could not drift apart on a
damage formula.

---

## The same rule caught three more effects

<a id="mp-body"></a>

Reported 2026-08-11, with balance feedback from the server: damage should scale
with Fist level, and a punch should cost endurance, muscle strain and the
occasional broken hand.

Three of those four live on the **player**, so they land in the same trap XP did.
`syncStats()` sends every `CharacterStat` -- endurance included -- and
`syncDamage()` sends the whole `BodyDamage`, both gated on `GameServer.server`,
both addressed to the owning client, which replaces its copy on arrival
([ENGINE.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine#mp-body)). Applying any of them client-side would be
erased within a tick, exactly like a client-side XP award.

So the split is now explicit, and it is the useful one to remember:

| effect | applied on | why |
|---|---|---|
| damage to the zombie | client | zombies are client-authoritative, verified on this server 2026-08-03 |
| XP | server | `OCP_ServerXp.lua` |
| endurance, strain, hand injury | server | `OCP_ServerBody.lua` |

Vanilla says the same thing structurally: `CombatManager:686` calls
`addCombatMuscleStrain` and `processWeaponEndurance` only in the `else` of
`if (GameClient.client)`.

One punch is still **one** round trip. The client sends `{ damage, lead }` on the
existing `awardXp` command and the server applies everything; `lead` rides along
because the server cannot read the animation variable that chose the hand, and is
validated rather than trusted -- the worst a forged value does is hurt the other
hand.

### The infection hazard, which is not an MP issue but is the worst one here

`BodyPart.setScratched(true, false)` rolls `generateZombieInfection(7)` -- a
**7%** chance of the fatal infection. Punching a corpse must never be able to
kill the puncher days later, so the mod uses only the wound calls that carry no
infection roll, and the test suite asserts the infecting ones are never reached
([ENGINE.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-engine#self-injury)).

---

## Things to check before the server goes live

- **XP.** ~~`addXp` routes through `GameServer.addXp` when running as a server, so
  it is already MP-aware.~~ That was true of the call and useless in practice,
  because nothing was calling it as a server. XP is now awarded only in
  `server/OCP_ServerXp.lua` — see [No XP, take two](#mp-xp). Verify it lands once
  and **survives a relog**, which is the check that would have caught both earlier
  fixes.
- **Knockdown and pushback.** Both are set on the *attacker* and read during
  `hitConsequences`. Confirm they replicate rather than only playing locally.
- **The perk.** `CustomPerks.init` runs on `GameServer` too
  (`GameServer.java:1407`), so `media/perks.txt` must be present in the server's
  copy of the mod, not just the client's.
- **Sandbox settings.** Zombie toughness and `injurySeverity` are server-side and
  will differ from your test world.
