---
id: build-42-outcast-punch-engine
slug: outcast-punch-engine
title: Outcast Punch -- engine notes
game: pz
version: build-42
section: outcast-mods
category: outcast-punch
difficulty: advanced
tags:
  - outcast-punch
  - engine
  - combat
  - animation
excerpt: 'Every engine fact this mod depends on, with the citation that proves it.'
last_updated: '2026-10-04'
---
# Outcast Punch -- engine notes

> Source: OutcastPunch/docs/ENGINE.md (compiled 2026-08-25, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Every engine fact this mod depends on, with the citation that proves it.

Verified against **B42 revision `a2947723ca`** (Steam buildid 24449119). Line
numbers are from the decompiled source in `PZ_Engine_Records`, re-pointed to
**42.21.0** (revision `4a0e9546ec`) when this page was re-checked on that build. If a game update
breaks something, start here: the boot contract in `OCP_Contract.lua` checks the
symbols, this file explains what they were for.

---

## 1. Why bare hands deal no damage

<a id="damage-suppression"></a>

Vanilla forces an unarmed attack down the shove branch, then suppresses damage on
it. Three gates, in order:

**1. Bare hands are forced down the shove branch** (`CombatManager.java:1362`).
If the attack weapon is `owner.bareHands`, `vars.doShove = true`. The only escape
is `AttackType.CHARGE`, which `WeaponType.UNARMED` can never produce
(`WeaponType.java:19` gives it `AttackType.NONE` as its sole possible attack) —
and which is re-rolled at `CombatManager.java:3173`, seven lines before it is
read at `:3180`.

**2. A shoving player has damage suppressed** (`IsoGameCharacter.java:6086`):

```java
if (wielder instanceof IsoPlayer player && player.isDoShove() && !wielder.isAimAtFloor()) {
   bIgnoreDamage = true;
   modDelta *= 1.5F;
}
```

**3. Health is only reduced when that flag is false**
(`IsoGameCharacter.java:6218`, in `hitConsequences`):

```java
if (!bIgnoreDamage) {
   damage = CombatManager.getInstance().applyGlobalDamageReductionMultipliers(weapon, damage);
   CombatManager.getInstance().applyDamage(this, damage);
}
```

The `!wielder.isAimAtFloor()` in step 2 is exactly why stomping a downed zombie
kills it but punching a standing one never will.

`Base.BareHands` does declare `MinDamage = 0.2, MaxDamage = 0.4`
(`media/scripts/generated/items/weapon.txt:14257`). Those numbers are unreachable
on the player attack path.

> I originally read `CombatManager.java:1161` and concluded bare hands *did* deal
> damage. They do not — the gate is one level deeper, inside `Hit()`.

### The window we use

`Hit()` still fires `OnWeaponHitCharacter` at `IsoGameCharacter.java:6091`. That
is **after** `bIgnoreDamage` is set and **before** both `processHitDamage`
(`:6112`) and `hitConsequences` (`:6113`). So the event hands us a real target,
already resolved, at a point where vanilla has decided not to hurt it.

We call `target:applyDamage()` (`IsoGameCharacter.java:16152`) there and let the
rest of the pipeline run untouched.

### Why we never handle the kill

`isDead()` is health-based (`IsoGameCharacter.java:4920`). A zombie we take to
zero is *already dead* by the time `hitConsequences` runs, so the engine performs
the death, the kill credit and the death animation on its own. We never call
anything death-related.

### Event ordering summary

```
Hit()
  :6086   bIgnoreDamage = true          (damage is now suppressed)
  :6091   OnWeaponHitCharacter fires    <-- WE ARE HERE
  :6112   processHitDamage              (skipped for us)
  :6113   hitConsequences               (reads isCriticalHit, ZombieHitReaction)
  :6218   applyDamage                   (skipped for us)
```

Everything we want to influence downstream — knockdown, hit reaction — is read
*after* our event, which is why setting those flags from Lua works at all.

---

## 2. Damage is applied directly, bypassing the multiplier chain

<a id="damage-chain"></a>

**This is deliberate. Investigated and closed 2026-07-31. Do not re-open without
reading this section.**

`hitConsequences` calls `applyGlobalDamageReductionMultipliers()` before
`applyDamage()` (`IsoGameCharacter.java:6219`), and we skip it. That looks like a
bug. It is not worth fixing:

1. **It is not a sandbox setting.** `CombatConfig` is constructed purely from
   `CombatConfigKey.getDefaultValue()` with no file, sandbox or persistence layer
   (`CombatConfig.java:19-23`). `GLOBAL_MELEE_DAMAGE_REDUCTION_MULTIPLIER` is an
   internal balance constant of `0.15`, changeable only through a runtime debug
   panel. Routing through it buys no player-facing tunability.

2. **Unarmed can never earn weapon skill.** `getWeaponLevel()` guards on
   `weaponType != WeaponType.UNARMED` (`IsoGameCharacter.java:11136`), and the
   lookup reads `WeaponCategory` off the primary hand item. A bare-handed
   character is locked at weapon level 0 permanently, and **no custom perk can
   feed it.**

For our case the chain therefore reduces to a fixed **x0.135**:

```
split               x2
non-player target   x1.5
weapon level 0      x0.3     (0.3 + level * 0.1)
global melee        x0.15
                    -------
                    x0.135
```

Applying it would be arithmetically identical to what we do now with a declared
number 7.4 times larger, at the cost of either reaching `CombatManager` from Lua
(no vanilla precedent) or re-entering `Hit()` from inside its own event.

**What still works:** zombie health *is* a sandbox setting, and we reduce health
directly, so difficulty tuning affects us normally.

**Corollary:** point 2 is why the Fist skill applies its own multipliers instead
of expecting `getWeaponLevel` to notice it. See DESIGN.md (not yet published).

---

## 3. Animation node selection

<a id="node-selection"></a>

### The two shove states

The engine keeps two and consults exactly one per swing:

| state | when | this mod |
|-------|------|----------|
| `shove` | a plain attack press | **untouched vanilla** |
| `shoveAim` | an attack press while aiming | **ours** |

Aiming is the modifier that turns a shove into a punch. Overriding `shove` would
replace the push, which this mod deliberately does not do. `validate-anims.ps1`
enforces both halves, because both fail silently in game.

### How a node wins

`AnimNode.compareSelectionConditions` (`AnimNode.java:365`) ranks by
`m_ConditionPriority` first, then by condition count. Vanilla's `ShoveAim`
declares neither, so it sits at 0/0. We declare priority 1 and win on the first
comparison.

Our two nodes never compete with each other: their `OCPPunchLead` conditions are
mutually exclusive, so exactly one can pass.

### `m_SpeedScale` holds a float **or** a variable name

`AnimNode.getSpeedScale` (`AnimNode.java:288`):

```java
return this.speedScaleF != Float.POSITIVE_INFINITY
     ? this.speedScaleF
     : varSource.getVariableFloat(this.speedScale, 1.0F);
```

`speedScaleF` is `POSITIVE_INFINITY` when the field did not parse as a float, so
a non-numeric value is treated as a variable name and resolved per playback.

**The failure mode is silent.** A typo does not error — the node just plays at
`1.0` forever, which reads as a tuning problem rather than a broken reference.
`validate-anims.ps1` checks it like any other variable.

To pin the speed while tuning clips, put a literal back: a number parses and
short-circuits the lookup entirely.

### `x_extends` is deliberately unused

It resolves relative to the **declaring file's own folder**
(`PZXmlUtil.java:70`), which for a mod is our directory, not vanilla's. A failed
parse is then silently skipped (`AnimState.java:87`). Both nodes are
self-contained instead.

### Clips are keyed by the name *inside* the asset

`ImportedSkeleton.java:343-352`:

```java
String animName = srcAnim.getName();
...
this.clips.put(animName, clip);
```

`srcAnim` is an Assimp `AiAnimation`, so the name comes from:

| format | source of the name |
|--------|--------------------|
| `.x` | `AnimationSet <name> {` |
| `.glb` / `.gltf` | `animations[].name` (the Action name in Blender) |
| `.fbx` | AnimStack name |

The filename only decides whether the file is scanned at all, never the lookup.
Two clips exporting as `AnimationSet _tmp` would collide on one key and both fail
silently — which is why `validate-anims.ps1` exists.

### Don't condition on the engine's `Weapon` variable

It is callback-backed (`IsoPlayer.java:750`):

```java
this.setVariable("Weapon", this::getWeaponType, this::setWeaponType, ...)
```

`getWeaponType()` returns the `weaponT` field (`IsoPlayer.java:3828`), so its
value depends on whatever last wrote that field, and **Lua reads it back as
nil**. Conditioning on a variable you can neither read nor predict produces a
node that silently never matches. We publish `OCPUnarmedPunch` instead.

`WeaponType.UNARMED`'s type string is `""` (`WeaponType.java:19`), which is what
made "condition on `Weapon` being empty" look reasonable in the first place. It
is not reachable from Lua, so the idea is dead regardless.

### The three events we hook

<a id="events"></a>

| event | fires from | meaning |
|-------|-----------|---------|
| `OnWeaponSwing` | `SwipeStatePlayer.java:206` | the swing state was entered |
| `OnWeaponSwingHitPoint` | `CombatManager.java:677` | the clip reached `AttackCollisionCheck`; the engine is about to build the hit list |
| `OnWeaponHitCharacter` | `IsoGameCharacter.java:6091` | a character was actually struck |

This is the SWING -> COLLIDE -> HIT probe chain in `OCP_Diagnostics.lua`, and
each gap means something specific:

- **SWING, no COLLIDE** — the clip that played had no `AttackCollisionCheck`
  event, or the swing was cancelled before reaching it.
- **COLLIDE, no HIT** — the collision found nothing. Swung at air, or the target
  was out of range or arc.

`OnWeaponSwing` fires **before the animation node is chosen**, which is why a
variable set there lands in time for the same swing.

`SwipeStatePlayer.java:452` clears `ZombieHitReaction` at swing end, so it cannot
leak into the next attack.

---

## 4. Knockback and knockdown

<a id="crowd-control"></a>

Our punch rides the shove path, so by default it inherits both of the shove's
crowd-control effects. Neither belongs to a punch.

### Knockdown — the critical hit flag

A shove rolls a critical hit at 35% base plus 2% per Strength level
(`IsoPlayer.java:3838`, the `isDoShove` branch of `calculateCritChance`) — about
45% at default Strength 5. On a zombie, a critical shove means a knockdown:

```java
// IsoZombie.java:4244, inside hitConsequences
this.setKnockedDown(wielder.isCriticalHit() || this.isOnFloor() || this.isAlwaysKnockedDown());
```

The roll happens at swing time (`CombatManager.java:3306`) and is read at
`IsoGameCharacter.java:6113`, both around our event at `:6091`, so
`setCriticalHit(false)` from Lua lands in between.

Nothing else is lost by clearing it: the critical *damage* multiplier lives in
`processHitDamage` (`:6209`), which our direct `applyDamage` already bypasses.

A zombie already on the floor stays down regardless — that clause is
`isOnFloor()`, not ours.

### Knockback — the hit reaction

Displacement comes from `calcHitDir` (`IsoGameCharacter.java:14905`) as
`hitForce * 0.1 * weapon.PushBackMod`, and stagger duration from
`StaggerBackState.java:70` as `35 * hitForce * staggerTimeMod`. Both are set
inside `Hit()` **after** `OnWeaponHitCharacter` fires, so Lua cannot pre-empt
them.

The engine's own lever is the `ZombieHitReaction` variable, read off the
**wielder** in `CombatManager.processHit` (`:2926`) to choose the target's
reaction. `HitReaction` (`zombie/combat/HitReaction.java`) offers `HeadLeft`,
`HeadRight`, `HeadTop` and `Uppercut` — the punch-shaped ones.

Our nodes set it at 10% of the clip, comfortably before the 25% impact. Both
Brutal Handwork and Fists of Survival do the same thing at the same point.

> **UNVERIFIED.** This may only change the *reaction* and not fully remove
> *displacement*, since stagger duration still derives from `hitForce`, which we
> do not control. If a punch still visibly shoves, the next lever is suppressing
> `StaggerBackState`.

Clearing the variable falls back to the vanilla shove stagger, which is how the
Fist skill's pushback is granted.

### Displacement: normal, small, and not tunable by us

<a id="displacement"></a>

**Every melee hit displaces the target.** Confirmed in play 2026-08-01 — a punch
at Fist 0 does move a zombie back, and that is correct behaviour, not a leak.

`processHitDamage` (`IsoGameCharacter.java:6155-6187`) treats the shove path
differently, and both differences reduce our force:

```java
float damage = damageSplit * modDelta;
float dmgTest = damage;
if (bIgnoreDamage) dmgTest = damage / 2.7F;                       // we ARE bIgnoreDamage
float f = dmgTest * wielder.getShovingMod();
if (f > 1.0F) f = 1.0F;
this.setHitForce(f);
...
if (wielder instanceof IsoPlayer && !bIgnoreDamage) hitForce *= 2.0F;   // we are excluded
```

| | damage feeding force | multipliers | approx `hitForce` |
|---|---|---|---|
| our punch | ~0.3 (BareHands) | x1.5 shove, /2.7 | **~0.17** |
| baseball bat | ~0.95 | x2.0 player | **~1.9** |

Roughly an order of magnitude apart, at the same `PushBackMod`. A punch is
already the lightest melee impact available.

**There is no lever on our side.** `getPushBackMod` (`:6142`, `:14910`) reads the
weapon the *engine* is swinging, and `CombatManager.java:1365` substitutes
`owner.bareHands` for the whole swing. The `PushBackMod = 0.3` on our `Fist`
script item is **dead config** — nothing reads it. The only real knob is vanilla
`BareHands`' own `0.5`, and changing that would move the plain shove too.

Decision: leave it. Zeroing displacement would make punches feel weightless
against every other hit in the game.

---

## 5. Custom perks

<a id="perks"></a>

Declared in `media/perks.txt`, parsed by `CustomPerks.java`.

### Lookup order and registration

`CustomPerks.init` (`:39-43`) checks `<mod>/<version>/media/perks.txt` **first**,
then falls back to `<mod>/common/media/perks.txt`. Ours lives under `42/`.

`initLua` (`:72`) does `perks.rawset(perk.getId(), perk)`, which is what puts the
block id on the `Perks` table — so `perk Fist` becomes `Perks.Fist`.

`PerkFactory.AddPerk` also puts it in `PerkFactory.PerkList`, which the skills
panel iterates (`ISCharacterInfo.lua:268`). **A custom perk therefore works with
every vanilla tool automatically** — the skills UI, `LevelPerk()`, the `/addxp`
server command. There is no reason for a mod to wrap any of them.

### File format

Recognised keys are exactly `parent`, `translation`, `passive`, `xp1`..`xp10`
(`CustomPerks.parsePerk`, `:137-171`). Anything else is ignored **silently** —
Fists of Survival ships a `name` key that does nothing.

`VERSION` must be `1` or the whole file throws (`:119-129`).

`parent` resolves through `PerkFactory.Perks.FromString`, falling back to `None`.
`Combat` is the melee category (`PerkFactory.java:370`).

### NEVER use a `//` comment in perks.txt

`readFile` (`:91-94`) joins lines with `stringBuilder.append(str)` and **no
newline separator**, so the file is one long line by the time
`ScriptParser.stripComments` sees it. A `//` comment would swallow everything
after it — including the perk block — and the only symptom would be a perk that
silently does not exist.

Block comments terminate explicitly and are safe.

### Initialisation timing

`CustomPerks.instance.initLua()` runs at `GameWindow.java:205` during startup,
before scripts load, and again at `IngameState.java:1051` on entering a game.
Both are well before `OnGameStart`, so checking `Perks.Fist` in the boot contract
is safe.

---

## 6. Translations — B42 changed the format entirely

<a id="translations"></a>

**B41 used Lua-table `.txt` files. B42 uses flat JSON.** Shipping the B41 format
produces no error and no warning — the key simply never resolves and the raw key
string is displayed to the player.

| | B41 | **B42** |
|---|-----|---------|
| path | `media/lua/shared/Translate/EN/` | same |
| file name | `IG_UI_EN.txt` | **`IG_UI.json`** — no language suffix |
| format | `IGUI_EN = { KEY = "value", }` | **flat JSON object** |
| comments | `/* */` allowed | **none — JSON has no comments** |

`Translator.tryFillMapFromFile` (`Translator.java:365`):

```java
File file = new File("%s/media/lua/shared/Translate/%s/%s.json".formatted(rootDir, language, fileName));
...
new JSONObject(content, new JSONParserConfiguration().withStrictMode(Core.IS_DEV))
```

The language is now **only** in the directory name. `fileName` comes from the
`BY_NAME` registry (`Translator.java:142-173`): `IG_UI`, `Tooltip`, `UI`,
`ItemName`, `Recipes`, `ContextMenu`, `Sandbox`, `Attributes`, and ~22 others.

`tryFillMapFromMods` (`:384`) scans **both** `getCommonDir()` and
`getVersionDir()` for every enabled mod, common first, so a version-dir file
overrides a common one.

Malformed JSON throws `RuntimeException("JSON Error in: %s")` — loud. A
*missing* file is silent. Strict mode (no trailing commas, no comments) is on
whenever `Core.IS_DEV`.

### The description key uses the DISPLAY name, not the id

This is the trap. Two different keys, built from two different strings:

```java
// PerkFactory.java:84
perk.name = Translator.getText("IGUI_perks_" + translation);
```
```lua
-- ISSkillProgressBar.lua:78
getText("IGUI_perks_" .. self.perk:getName() .. "_Description")
```

`getName()` returns the **already-translated** name, so the description key is
built from the display string — spaces included. Vanilla really does ship:

```json
"IGUI_perks_Blunt": "Long Blunt",
"IGUI_perks_Long Blunt_Description": "...",
```

For a perk with `translation = Fist` displaying as `Fists`:

```json
"IGUI_perks_Fist":  "Fists",
"IGUI_perks_Fists_Description": "..."
```

**Note the mismatch is correct.** The name key uses the `translation` value from
`perks.txt`; the description key uses the resolved display name.

### How the failure reads in game

If `IGUI_perks_<translation>` is missing, `getText` returns the key itself, and
that unresolved string then feeds the description key. The skills panel shows:

```
IGUI_perks_Fist                                    <- name key not found
IGUI_perks_IGUI_perks_Fist_Description             <- and it fed itself in
```

The doubled prefix is the diagnostic: it means the **name** key is missing, not
the description one.

### Every translation value is a format string, so a literal `%` must be `%%`

`getText` is exposed to Lua **only** as `getText(String, Object...)`. There is no
one-argument binding, so `Translator` runs `text.formatted(args)` on every lookup
— including the ones Lua called with no arguments at all.

At load time `formatFixer` rewrites each value through

```java
FORMAT_TOKEN = Pattern.compile("%%|%([1-9])")
```

`%%` is preserved as an escaped percent, and `%1`..`%9` become `%1$s`..`%9$s`.
**Every other `%` is left untouched** and reaches `java.util.Formatter` as a live
conversion specifier. What it throws depends on the character that follows:

| in the string | Formatter sees | exception |
|---|---|---|
| `+9% damage` | `% d` | `MissingFormatArgumentException` |
| `3% chance` | `% c` | `FormatFlagsConversionMismatchException` |
| `19%, knockdown` | `%` + `,` and ` ` flags + `k` | `UnknownFormatConversionException: Conversion = 'k'` |

Parsing happens for the whole string before any argument is substituted, so an
unknown conversion anywhere wins over a missing argument anywhere — which is why
the `%, k` strings reported a different error from their neighbours despite all
of them starting with `% d`.

`reportMissingArgumentsFromPastAbuse` catches all of it, logs a warning, and then
repairs the text with its own `replaceAll` pass. **So the string still renders
correctly and nothing visibly breaks** — the only symptom is the log.

That is what made this expensive. `ISSkillProgressBar:updateTooltip` rebuilds the
tooltip on every mouse-move, so hovering the Fists tree emitted a warning per
frame per level and buried the console. All ten `_Description<N>` values were
malformed; only the loudest three were visible in the flood.

Write `%%` for a literal percent. `scripts/validate-data.ps1` enforces this using
`FORMAT_TOKEN`'s own alternation, so the check cannot drift from the engine.

### `AddPerk` multiplies every XP threshold by 1.5

`PerkFactory.java:87-96`:

```java
perk.xp1 = (int)(xp1 * 1.5F);   // ... through xp10
```

So `xp1 = 50` in `perks.txt` becomes **75** in game. This applies to vanilla
perks too — the engine's own `PerkFactory.java:105-127` declares the same
50/100/200/... and every vanilla skill is really 75/150/300/...

Declared total 21,850 -> **actual 32,775 XP to level 10.**

---

## 7. Miscellaneous

<a id="misc"></a>

### `instanceItem`, not `InventoryItemFactory`

`InventoryItemFactory` is **not exposed to Lua in B42**. The registered entry
point is `instanceItem()` (`LuaManager.java:5615`, `@LuaMethod global = true`).
This cost a boot failure to discover; the one vanilla reference to
`InventoryItemFactory` is commented out.

### `addXp` — DOES NOTHING ON A MULTIPLAYER CLIENT

<a id="addxp"></a>

`addXp(IsoPlayer, Perk, float)` at `LuaManager.java:11859`. It takes `IsoPlayer`
specifically, not `IsoGameCharacter`. **Do not call it from client-side Lua:**

```java
public void addXp(IsoPlayer player, PerkFactory.Perk perk, float amount) {
   if (player.isExistInTheWorld()) {
      if (GameServer.server) {
         GameServer.addXp(player, perk, amount);
      } else if (!GameClient.client) {
         player.getXp().AddXP(perk, amount);
      }
   }
}
```

On a **dedicated-server client** `GameServer.server` is false and
`GameClient.client` is true, so **neither branch runs and the call silently does
nothing**. No error, no log line, no XP.

A hosted game hides this completely: the host process *is* the server, so it
takes the first branch. That is exactly what happened here — hosted MP showed
`+0.88 xp` per punch, and the dedicated server awarded none, with identical code.

**Use `character:getXp():AddXP(perk, amount)` instead.** We used to say this is
what vanilla's own client-side Lua does, citing `CFarmingSystem.lua` and an
`ISFishingAction.lua`; neither does, in 42.20 or 42.21. The vanilla Lua callers
of `getXp():AddXP` are the admin player-stats window (`ISPlayerStatsUI.lua`) and
scrapping a moveable (`ISMoveableSpriteProps.lua`).

> **Proof:** Code. `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua` (`self.char:getXp():AddXP(...)`) and `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (`_character:getXp():AddXP(scrapDef.perk, ...)`), the only live calls in vanilla Lua. Build 42.21.0 (revision 4a0e9546ec).

`AddXP(perk, amount)` guards on `isLocalPlayer`
(`IsoGameCharacter.java:17415`) and forwards to
`AddXP(type, amount, callLua=true, doXPBoost=true, remote=false)`, so the trait
and profession multipliers still apply — the same ones `addXp` would have used.

Keep `addXp` for genuinely server-side callers, where the first branch is the
right one. `addXpNoMultiplier` (`:11842`) has the identical structure and the
identical hole.

**The advice above is only half the story — see the next section.** Switching to
`getXp():AddXP` makes the call run on a client, but what it writes does not
survive. Do not read this section on its own.

### XP is server-authoritative, one way, and the client's map is wiped

<a id="mp-xp"></a>

`getXp():AddXP` from client Lua is not an MP fix. XP moves **server -> client
only**, and the client's copy is replaced wholesale rather than merged:

| step | where | what |
|---|---|---|
| `NetworkPlayerManager.update():43` | server | calls `syncXp()` per player on the stats timer |
| `NetworkPlayerAI.syncXp():710` | server | wrapped in `if (GameServer.server)` — sends down only |
| `PlayerXpPacket.parse` | client | calls `getXp().load()` |
| `IsoGameCharacter.XP.load():17662` | client | **`this.xpMap.clear()`**, then repopulate |

There is no client -> server XP sync in normal play. `PlayerXpPacket` requires the
admin capability `CanModifyPlayerStatsInThePlayerStatsUI`, and `ConnectedPacket`
carries XP only at connect time. `PlayerDB` persists the **server's** copy, so a
client-side award is never saved either.

**Vanilla melee XP is server-side and does not look it.** The handler is in
`server/XpSystem/XpUpdate.lua:379` on `OnWeaponHitXp`, and that event is raised
from two places with complementary guards:

```java
CombatManager.java:1169   !GameClient.client && !GameServer.server   // single player
WeaponHit.java:132        GameServer.server                          // a client's hit, on the server
```

So do not hook `OnWeaponHitXp` as a shortcut: on a **hosted** game
`GameServer.server` is true, so `CombatManager` skips it, and `WeaponHit` fires
only for *remote* clients — the host's own hits would raise it nowhere.

**The route that works in all three modes** is `sendClientCommand` into a
`server/` handler, because it has a single-player loopback
(`LuaManager.java:8938` -> `SinglePlayerClient` -> `SinglePlayerServer.java:204`
raises `OnClientCommand`) and its 4-arg overload raises the event in-process when
`GameServer.server`.

Which Lua folders execute where, since the whole design rests on it:

| folder | dedicated server | MP client | single player |
|---|---|---|---|
| `shared/` | yes (`GameServer:1477`) | yes | yes |
| `client/` | **checksum only** (`GameServer:1478`, `onlyChecksum=true`) | yes | yes |
| `server/` | yes (`GameServer:1479`) | loaded, never triggered | yes (`GameLoadingState:155`) |

Inside a `server/` handler the global `addXp()` is the correct call, and
`getXp():AddXP` is not — the latter's 2-arg overload is gated on `isLocalPlayer`
(`:17415`), and a remote player on a dedicated server is not local. `addXp` also
calls `updateXpChecker()`, which keeps `AntiCheatXPUpdate` from counting the award
against the player.

One more trap on the same path: perk identity crosses the wire as an **id string**
(`savePerk`/`loadPerk`, `:17647`), and `FromString` is
`PerkById.getOrDefault(id, MAX)` -> null -> the entry is **silently dropped**. A
custom perk therefore also needs the mod in the server's own `Mods=` list, because
`CustomPerks.init()` (`GameServer.java:1427`) builds the registry from
`ServerMods`.

**This affects every mod that grants XP, not just this one.**

### Stats and body damage are server-authoritative too

<a id="mp-body"></a>

The XP rule above is not special to XP. Endurance, muscle strain and every wound
travel the same way, on their own timers:

| what | packet | carries |
|---|---|---|
| `syncStats()` (`NetworkPlayerAI:699`) | `PlayerStats` | `getStats().save()` -- **every** `CharacterStat`, endurance included -- plus nutrition and `BodyDamage.saveMainFields` |
| `syncDamage()` (`NetworkPlayerAI:686`) | `PlayerInjuries` + `PlayerDamage` | `getBodyDamage().save()` -- the whole body: every fracture, wound and stiffness value |

Both are wrapped in `if (GameServer.server)`, and both send with
`INetworkPacket.send(IsoPlayer, ...)`, which resolves the connection **from that
player** (`:149`) -- so they go to the owning client, which then calls `load()`
and replaces its copy. `NetworkPlayerManager.update():25-49` drives both.

Note `saveMainFields` is NOT the whole body -- it is colds, infection timers and
pain reduction. Per-part injuries ride on `PlayerDamage`, not `PlayerStats`.

So the split for a combat mod is:

| effect | apply on | why |
|---|---|---|
| damage to a zombie | the client | zombies are client-authoritative (`NetworkZombieComponent.authOwner`), which is why our `applyDamage` carries -- see [MULTIPLAYER.md](/pz/build-42/outcast-mods/outcast-punch/outcast-punch-multiplayer#zombie-authority) |
| anything on the PLAYER | the server | it is replaced wholesale on the next sync |

Vanilla agrees, and says so structurally: `CombatManager:721` calls
`addCombatMuscleStrain` and `processWeaponEndurance` only in the `else` of
`if (GameClient.client)`.

### Endurance is priced by weapon WEIGHT, so a fist costs nothing

<a id="endurance"></a>

`CombatManager.applyMeleeEnduranceLoss` (`:3867`):

```java
enduranceLoss = weight * ENDURANCE_LOSS_BASE_SCALE      // 0.28
              * weapon.getFatigueMod(attacker) * attacker.getFatigueMod()
              * weapon.getEnduranceMod()
              * ENDURANCE_LOSS_WEIGHT_MODIFIER          // 0.3
              * ENDURANCE_LOSS_FINAL_MULTIPLIER;        // 0.04
```

A vanilla Hammer (`Weight = 1.5`) therefore costs `1.5 * 0.28 * 0.3 * 0.04` =
**0.00504** of a 0..1 endurance pool when rested. That figure is the anchor for
`OCP.ENDURANCE_TICK`.

Our fist item has `Weight = 0`, so the whole product is **zero** — punching cost
no endurance at all until we priced it ourselves.

### Muscle strain for a shove is already strength-scaled

<a id="strain"></a>

`IsoGameCharacter.addCombatMuscleStrain` (`:16307`) branches on stance before it
looks at the weapon, and our punch is a shove:

```java
} else if (this.isShoving()) {
   float val = 0.15F;
   val *= (15 - getPerkLevel(Perks.Strength)) / 10.0F;
   this.addBothArmMuscleStrain(val);
}
```

`addArmMuscleStrain` then multiplies by 2.5 and by the sandbox
`muscleStrainFactor`, and **does nothing when that factor is 0** (`:16421`). So a
server with strain disabled keeps it disabled, including ours.

That branch is level-blind, which is why the mod adds a second, Fist-scaled term
rather than replacing it: both axes then matter.

### Self-inflicted wounds: the calls that CANNOT infect

<a id="self-injury"></a>

**This is the one to get right.** Two of `BodyPart`'s wound setters roll zombie
infection:

| call | line | infection roll |
|---|---|---|
| `setScratched(true, false)` | `:839` | `generateZombieInfection(7)` -- **7%** |
| `setCut(cut, false)` | `:795` | `generateZombieInfection(25)` -- 25% |
| `setCut(cut)` | `:766` | none; the 1-arg form passes `forceNoInfection = true` |
| `SetScratchedWeapon(true)` | `:845` | **none**, and it bleeds |
| `generateDeepWound()` | `:872` | **none**, and it bleeds |
| `setFractureTime(n)` | `:1163` | none; the break alone |

Hurting your own hand on a corpse must never be able to kill the player, so the
mod uses only the bottom three. The one- and two-argument forms of `setCut` are
one character apart and differ on exactly this, which is why the weapon-specific
calls are preferred even where `setCut(cut)` would be safe.

`tests/test_balance.lua` asserts `setScratched` and `setCut` are **never called**,
by name — an absence assertion, because an edit could add an infecting call
without removing the safe one.

Vanilla's own fracture is `Rand.Next(30, 50)` (`BodyDamage.java:3017`), which is
what `HAND_FRACTURE_TIME_MIN/MAX` copy.

### Zombie health is built from the sandbox, and there is no getMaxHealth

<a id="zombie-health"></a>

`IsoZombie` sets health in its constructor from `ZombieLore.Toughness`
(`:4442-4457`), and exposes only `getHealth()` — the **current** value:

| toughness | health |
|---|---|
| 1 | `3.5 + Rand.Next(0, 0.3)` |
| 2 (default) | `1.8 + Rand.Next(0, 0.3)` |
| 3 | `0.5 + Rand.Next(0, 0.3)` |
| 4 | `Rand.Next(0.5, 3.5) + Rand.Next(0, 0.3)` — **per zombie** |

So a mod that wants to deal a *percentage* of a zombie has to read the tier
itself. `OCP.ZOMBIE_HEALTH_BY_TOUGHNESS` mirrors the table; tier 4 has no single
answer, so the damage model uses its midpoint and the anti-cheat clamp uses the
top of its range.

### The sandbox XP multiplier, and an unguarded null for custom perks

<a id="xp-multiplier"></a>

**Good news first: our perk is scaled by the global XP setting exactly like every
vanilla perk.** Same line, no special casing (`IsoGameCharacter.java:17539`):

```java
if (SandboxOptions.instance.multipliersConfig.xpMultiplierGlobalToggle.getValue()) {
   amount *= (float)SandboxOptions.instance.multipliersConfig.xpMultiplierGlobal.getValue();
} else {
   amount *= Float.parseFloat(
      SandboxOptions.instance.getOptionByName("MultiplierConfig." + perk.getType())
         .asConfigOption().getValueAsString());
}
```

`xpMultiplierGlobalToggle` defaults to **true** (`SandboxOptions.java:1846`), so
the default configuration takes the first branch and a server's XP rate applies to
Fists like anything else. Nothing to do.

**The else branch is the problem.** `getOptionByName` is a plain map lookup
(`:575`, `return this.optionByName.get(name)`) and the `MultiplierConfig.*`
options are hardcoded one per vanilla perk (`:1847-1859`). `perk.getType()`
stringifies to the perk id (`PerkFactory.Perk.toString`, `:328`), so for us the
key is `MultiplierConfig.Fist` — which the engine never creates. There is **no
null check**, so with per-skill multipliers selected, awarding XP to *any* custom
perk dereferences null and throws, on every hit.

That it is an oversight rather than a contract is confirmable: the engine's own
anti-cheat does the identical lookup and *does* null check it
(`AntiCheatXPUpdate.java:59-63`, `return option != null ? ... : maxXpMultiplier`).

**The fix is data, not code.** `media/sandbox-options.txt` declares the missing
option. Custom sandbox options register under their id verbatim —
`CustomSandboxOptions.parseOption` takes `block.id`, `newCustomOption` (`:1123`)
passes it to the `DoubleSandboxOption` constructor, and that calls
`owner.addOption(this)` -> `optionByName.put(name, option)` (`:563`). So the key
the engine builds and the key we register are the same string, and both branches
now work.

Bounds and default copy vanilla's entries exactly, so Fists tunes like Axe and is
identical when untouched. `parseName` splits the id on the dot, so it lands in the
same `MultiplierConfig` table with no page hint from us.

`OutcastPunch.dump()` reports which branch is live and whether the option
registered, so this does not have to be taken on trust.

**This affects every custom-perk mod in B42, not just this one.**

### The stomp: `isAimAtFloor()` is one swing stale during `OnWeaponSwing`

<a id="stomp"></a>

Vanilla's stomp is `shove/StompDefault.xml`, playing `Bob_AttackFloorStamp`,
selected on **`AimFloorAnim == true`**. Note that is an animation *variable*, not
the `isAimAtFloor()` accessor. During a swing those two disagree, because of the
ordering in `SwipeStatePlayer.enter`:

```java
:204   boolean aimAtFloorAnim = player.getAttackVars().aimAtFloor;   // live value, into a local
:206   LuaEventManager.triggerEvent("OnWeaponSwing", player, weapon); // <-- our handler runs HERE
...
:217   player.setAimAtFloor(player.getAttackVars().aimAtFloor);       // isAimAtFloor() written 11 lines later
...
:241   player.setVariable("AimFloorAnim", aimAtFloorAnim);            // the variable the node reads
```

**So `character:isAimAtFloor()` inside an `OnWeaponSwing` handler returns the
PREVIOUS swing's value.** We used it to exclude the stomp, and it produced a
one-swing lag in both directions:

- first attack aiming at a downed zombie -> stale `false` -> we flagged a punch,
  and our node replaced the stomp
- the attack after a stomp -> stale `true` -> the punch was suppressed and you
  got a plain shove

The fix is to condition where the value is correct. Node conditions are evaluated
after `:241`, so both punch nodes now carry `AimFloorAnim = false` — the exact
inverse of what `StompDefault` requires, which makes the two mutually exclusive by
construction instead of by our Lua agreeing with the engine. `OCP_Damage.lua`
carries the matching rejection, because `OnWeaponHitCharacter` fires long after
`enter()` and would otherwise stack punch damage on top of the stomp's.

`AimFloorAnim` is networked (`network/fields/hit/Player.java:131` reads it out of
`playerFlags` bit 0), so the condition holds on a dedicated server and for remote
players, which `isAimAtFloor()` on a client would not have.

The general rule, which the damage handler already followed and the swing handler
did not: **condition on the same variable the animation node conditions on.** An
accessor that looks equivalent may be written at a different point in the frame.

### Telling the push key apart from the attack button

<a id="push-vs-punch"></a>

`Melee` is bound to **`Keyboard.KEY_SPACE`** (`media/lua/shared/keyBinding.lua:80`)
and is the push key. `Attack` is the separate binding, mouse by default.

Bare-handed, **both** end up as a shove, so `isDoShove()` cannot tell them apart —
`CombatManager.java:1362` forces it:

```java
} else if ((vars.getWeapon(owner) == owner.bareHands || vars.doShove) && !isAttackType(CHARGE)) {
   vars.doShove = true;
```

The distinction survives one level up, in `IsoPlayer.UpdateInputState` (`:3988`):

```java
inputState.isAttacking = this.isCharging && this.isAttackButtonDown();
if (this.isMeleeButtonDown() && this.isAuthorizedHandToHandAction()) {
   inputState.melee = true;
   inputState.isAttacking = false;      // the push key WINS and clears the attack
}
```

They are mutually exclusive and the push key takes priority. That result is
latched onto the player as `meleePressed` (`:2498`, `:4488`) and **registered as
an animation variable** at `:747`:

```java
this.setVariable("meleePressed", () -> this.meleePressed,
    owner -> "The character detected an input to perform a melee attack.");
```

So `getVariableBoolean("meleePressed")` is `true` exactly when the swing came from
the push key. That is what `OCP.shouldPunch` reads.

**Unlike `AimFloorAnim`, this one is usually current during `OnWeaponSwing` — but
not always, and the gap is real.**

Usually current, because of the update order. For a non-animal player
`IsoPlayer.updateInternal1` runs the input pass first and the state machine
second:

```java
:2076   boolean updateBaseAndSend = this.updateInternal2();   // input, incl. :2364 and :4488
:2082   super.update();                                       // state machine -> SwipeStatePlayer.enter
```

So a press at `:4488` is visible to the swing it initiates, later in the very same
tick.

Not always, because pressing attack does not enter the swing state synchronously.
`DoAttack` -> `pressedAttack` (`CombatManager:3147`) only *latches*:

```java
isoPlayer.setInitiateAttack(true);
isoPlayer.setAttackStarted(true);
```

and `SwipeStatePlayer.enter` clears it at `:169`. If the transition is deferred —
melee delay, an animation still finishing — the next tick's input pass runs first
and `meleePressed` goes false the moment the key is released. A queued **push**
then reads as an attack press and would be served as a punch.

`OCP_Anim.lua` therefore checks the live value **or** a short decaying latch it
keeps itself (`OCPPushLatch`, refreshed from `OnPlayerUpdate`). Either being true
means push. Erring toward push is the safe direction: the worst case is a player
gets the vanilla behaviour they already expect.

**And unlike `AimFloorAnim`, it must NOT be used as a node condition or re-checked
at hit time.** It is live input state: a player who taps space and releases has
`meleePressed == false` again a frame later. Checking it in
`OnWeaponHitCharacter` would let punch damage land on a push whenever the key was
released mid-animation — the exact opposite of the intent. The swing-time read is
latched into `OCPUnarmedPunch`, and everything downstream keys off *that*.

That difference is the whole reason the two fixes look different:

| variable | written | read at `OnWeaponSwing` | safe as a node condition |
|----------|---------|-------------------------|--------------------------|
| `AimFloorAnim` | once per swing, `SwipeStatePlayer:241` | no — the accessor lags by a whole swing; use the variable | yes |
| `meleePressed` | every input frame, `IsoPlayer:4488` | yes, but pair it with a latch for deferred swings | no — may flip mid-clip |

**The general shape:** a variable written *once per swing* is safe to condition on
anywhere downstream. A variable reflecting *live input* is only safe at the moment
the swing is initiated, and needs latching if anything can delay the swing. Check
which kind you have before choosing where to read it — both of this mod's input
bugs were that question answered wrongly, in opposite directions.

### `getHittingMod` — the Strength curve

`IsoGameCharacter.java:4559`. This is what vanilla multiplies melee damage by at
`CombatManager.java:968`:

```java
damage *= weapon.getDamageMod(owner) * owner.getHittingMod();
```

Linear at +0.05 per Strength level:

| Strength | 0 | 5 | 10 |
|----------|---|---|----|
| multiplier | 0.75 | 1.00 | 1.25 |

Default Strength is 5, so our tuned damage values are unchanged for a default
character and swing +/-25% at the extremes.

### Checking whether a clip loaded

`ModelManager.instance` is a public static (`ModelManager.java:111`) and
`getAnimationClip` is a direct map lookup (`ModelManager.java:1613`), so
`ModelManager.instance:getAnimationClip(name)` answers "did this clip load"
straight from Lua. A nil means the node can be selected all day and still play
nothing. `OutcastPunch.dump()` reports it per clip.

### `isAiming`

`IsoPlayer.java:3819`. This is the whole punch-vs-shove gate — see
DESIGN.md (not yet published).

### Damage rolls

`Rand.Next(minimumWeaponDamage, maximumWeaponDamage)` at `CombatManager.java:966`
— uniform over `[min, max]`. Roll the **delta**, not the full max:
`min + rand(0, max)` yields `[min, min+max)` and silently inflates every hit by
the whole minimum. Brutal Handwork computes the delta and then does not use it,
which is where that bug lives in the wild.

### `SetMeleeDelay` drains at 0.625 per tick

`IsoGameCharacter.java:8889`. So a delay of 8 is roughly 0.43 s of dead time
after the clip ends, and 4 is roughly 0.21 s.

### Body parts

`zombie/characters/BodyDamage/BodyPart.java` exposes `getHealth()` (`:511`),
`getPain()` (`:1001`), `getFractureTime()` (`:1159`), `isSplint()` (`:1175`),
`getSplintFactor()` (`:1151`), `isDeepWounded()` (`:1273`), `isBurnt()`
(`:1853`). `BodyPartType` has `Hand_L` (`:20`) and `Hand_R` (`:36`), and is
exposed to Lua at `LuaManager.java:1792`. Reached as
`character:getBodyDamage():getBodyPart(BodyPartType.Hand_L)`.

Health is **0 to 100**, clamped at `:520` and `:524`, and set to 100 at `:597`.

**Bleeding is not health damage.** Observed in play: a bleeding hand sat at
health 100 while a scratched one was at 94. Injuries that reduce health
(scratches, lacerations, bites, burns) are distinct from states that merely
flag a condition (bleeding, deep wound, fracture). Check the state you actually
mean.

Vanilla's own "can this hand be used" predicate, from
`ISInventoryPaneContextMenu.lua:4131` where it gates two-handed weapons:

```lua
not bp:isDeepWounded() and (bp:getFractureTime() == 0 or bp:getSplintFactor() > 0)
```

Note it uses `getSplintFactor() > 0`, not `isSplint()`.

### Every injury state, and what it does to us

<a id="injuries"></a>

Surveyed 2026-08-01 against `BodyPart.java` and `BodyDamage.java`, cross-checked
against the in-game debug menu's Part change list and
[PZwiki Health](https://pzwiki.net/wiki/Health) /
[Injured](https://pzwiki.net/wiki/Injured).

**The key structural point:** injuries split into two kinds. Some **reduce
health**, and our damage penalty already catches every one of those through
`getHealth()`, whatever caused it. Others are **flags** that carry no health
loss, and those only matter if we check them explicitly.

| injury | accessor | reduces health | we block | how it reaches us |
|--------|----------|----------------|----------|-------------------|
| Scratch | `scratched()`, `getScratchTime()` | **yes** (`BodyDamage:1489`) | no | damage penalty |
| Laceration | `isCut()`, `getCutTime()` | **yes** (`:1530`) | no | damage penalty |
| Bite | `bitten()`, `getBiteTime()` | **yes** (`:1571`) | no | damage penalty |
| Burn | `isBurnt()`, `getBurnTime()` | source-dependent | no | damage penalty if health fell |
| Deep wound | `isDeepWounded()` | via its cause | **yes** | blocked |
| Glass shards | `haveGlass()` | via the deep wound | **yes, implicitly** | see below |
| Fracture | `getFractureTime()`, `getSplintFactor()` | no | **yes unless splinted** | blocked, then x0.70 |
| **Bullet** | `haveBullet()` | **no** — `damageFromFirearm` (`BodyPart.java:997`) only sets the flag | **no** | **nothing. A gap.** |
| Bleeding | `bleeding()`, `getBleedingTime()` | **no** | no | nothing, deliberately |
| Wound infection | `isInfectedWound()`, `getWoundInfectionLevel()` | no | no | nothing |
| Knox infection | `IsInfected()` | no | no | nothing |
| Muscle strain | — | no | no | nothing; the game labels it "HAS NO EFFECT ON THE PLAYER" |
| Stiffness | `getStiffness()` | no | no | nothing; it comes from exercise (`Fitness.java:117`) |

**Glass is covered for free.** `generateDeepShardWound()` (`BodyPart.java:893`)
sets `haveGlass(true)` **and** `setDeepWounded(true)` in the same call, so a hand
with glass in it is always deep-wounded and already blocked. No separate check
needed.

**A lodged bullet is not blocked, and that matches vanilla.** `damageFromFirearm`
(`BodyPart.java:997`) sets only the flag — no deep wound, no health loss from
that call — so a hand with a bullet in it punches at full strength.

That was initially read as a gap worth closing. It is not. **Vanilla lets you
equip any weapon, including two-handed, with a bullet in your hand**: the gate at
`ISInventoryPaneContextMenu.lua:4131` tests `isDeepWounded`, `getFractureTime`
and `getSplintFactor`, and nothing else. Matching vanilla was the whole basis for
the deep-wound rule, so it decides this one too.

What a bullet does instead:

| effect | where |
|--------|-------|
| **+50 pain**, the largest single contributor (glass is +10) | `BodyPart.java:1039` |
| zeroes the arm speed modifier — `calculateInjurySpeed` returns `1.0F` at once | `IsoGameCharacter.java:9741` |
| ...but `calculateCombatSpeed` clamps the result to a 0.8 floor | `:9661` |
| a limp, if the bullet is in a foot | `getFootInjuryType`, `:12437` |
| counts toward the "is injured" aggregate | `BodyPart.java:536` |

### Combat speed never reaches a shove

<a id="combat-speed"></a>

`CombatSpeed` is published as an animation variable (`IsoPlayer.java:709`) and
`calculateCombatSpeed` (`:9628`) folds in endurance, heavy load, Fitness, weapon
level, thermoregulation and `getArmsInjurySpeedModifier`.

**None of it touches a shove.** All 14 vanilla AnimSet nodes that read
`CombatSpeed` in `m_SpeedScale` are armed melee — 1handed, 2handed, knife, spear,
chainsaw, heavy. Vanilla's `ShoveAim` and `ShoveDefault` use a literal `0.80`.

So arm injuries have never slowed a shove, and substituting our own
`OCPPunchSpeed` for that literal cost us nothing. Worth knowing before anyone
"fixes" the punch to respect combat speed: that would make it behave unlike the
shove it rides on.

Quirk: `getArmsInjurySpeedModifier` (`:9669`) reads only `Hand_R`, `ForeArm_R`
and `UpperArm_R`. A left-arm injury has no combat-speed effect in vanilla at all.

**Bleeding is deliberately ignored.** Confirmed in play: a bleeding hand sat at
health 100 and correctly took no penalty. Bleeding is a state to treat, not a
measure of how damaged the hand is.

### Sandbox options that move these numbers

- `lore.toughness` — zombie health, four tiers. See
  [above](#zombie-health-is-a-sandbox-setting-not-a-constant).
- `injurySeverity` — scales `deepWoundTime` by 0.5x / 1.0x / 1.5x
  (`BodyPart.java:901-907`).
- Traits `FAST_HEALER` / `SLOW_HEALER` scale wound durations at the same site.

Any balance claim about injuries has to name the settings it assumes, for the
same reason the zombie-health one did.

### Zombie health is a sandbox setting, not a constant

`IsoZombie.java:4442-4455`, keyed on `SandboxOptions.instance.lore.toughness`:

| value | tier | health |
|-------|------|--------|
| 1 | Tough | `3.5 + Rand(0, 0.3)` |
| 2 | **Normal** | `1.8 + Rand(0, 0.3)` |
| 3 | Fragile | `0.5 + Rand(0, 0.3)` |
| 4 | Random | `Rand(0.5, 3.5) + Rand(0, 0.3)` |

**Balance targets must name a tier.** Ours assumes Normal (~1.95 average). A
health value outside every fixed tier's band — 2.490, 3.543 — means the sandbox
is on **Random**, where hits-to-kill legitimately varies from 1 to 6 at the same
skill level.

This also means our damage responds to difficulty settings correctly despite
bypassing the multiplier chain, because we reduce health directly. See
[the damage chain note](#damage-chain).

### Vanilla XP shape

`XpUpdate.lua:59` — `exp = damage * 0.9`, capped at 3. About 1.7 XP a hit for a
baseball bat.

### Hot-reloading AnimSets

There is a watcher (`AdvancedAnimator.java:73`), but its predicate compares paths
against `mod.animSetsFile.*.canonicalFile` (`:92`, `:100`), and **Java resolves a
directory junction to its real target**. With our dev deploy the watcher is
looking at the junction's target paths (our repo, on another drive) while watching the
Zomboid mods folder, so it may never
match.

What it eventually calls is reachable directly
(`AdvancedAnimator.checkModifiedFiles`, `:151`):

```java
LoadDefaults();
LuaManager.GlobalObject.refreshAnimSets(true);
```

`refreshAnimSets` resets `AnimationSet`, reloads every `AnimNodeAsset`, re-reads
the player states and pushes the change into live characters
(`LuaManager.java:6079-6103`). `OutcastPunch.reloadAnims()` calls it.

> **UNVERIFIED.** No vanilla Lua calls `refreshAnimSets`, so its exposure is not
> proven. If it reports unavailable, restart.

### Mod layout and asset discovery

`ZomboidFileSystem.java:498` accepts **either** `common/mod.info` or
`<version>/mod.info`. `AnimSets` and `anims_X` are scanned from **both** roots
(`ChooseGameInfo.java:514-515`).

Animations live under `common/` because they are build-agnostic art; everything
else is B42-only and stays under `42/`.

`ModelManager.loadModAnimations()` (`ModelManager.java:1665-1698`) walks every
mod and, for each `animationDirectory` declared by an `animationsMesh` script,
scans that same subfolder inside the mod. Vanilla's `Base.Human` already declares
`animationDirectory = Bob`, so **dropping a clip at `common/media/anims_X/Bob/`
is enough — no script needed.**

Clip file names are resolved by path, lowercased and extension-stripped
(`ZomboidFileSystem.java:936-950`). That governs which files are *scanned*; the
lookup key is still the name declared inside the asset (see above).

*Updated 2026-10-04 for Build 42.21: line numbers re-pointed; the vanilla callers of getXp():AddXP are named correctly (the two files cited before do not call it).*
