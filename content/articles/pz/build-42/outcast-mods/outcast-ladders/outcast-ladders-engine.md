---
id: build-42-outcast-ladders-engine
slug: outcast-ladders-engine
title: Outcast Ladders -- engine notes
game: pz
version: build-42
section: outcast-mods
category: outcast-ladders
difficulty: advanced
tags:
  - outcast-ladders
  - engine
  - sheet-rope
excerpt: 'Every engine fact this mod depends on, with the citation that proves it.'
last_updated: '2026-10-04'
---
# Outcast Ladders -- engine notes

> Source: OutcastLadders/docs/ENGINE.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Every engine fact this mod depends on, with the citation that proves it.

Verified against **B42 revision `a2947723ca`** (Steam buildid 24449119), against
our decompile of that build. Re-checked on **42.21.0** (revision `4a0e9546ec`):
line numbers now point into 42.21, and the two places where the engine's code
was reorganised are marked in the text.

---

## 1. The climb flag is read from the SQUARE

<a id="flag-source"></a>

Not the sprite, not the object. Both consumers read square properties:

```java
// ClimbSheetRopeState.java:235
isoGameCharacter.getCurrentSquare().getProperties().has(IsoFlagType.climbSheetN)

// IsoPlayer.java:5046
assumedDir == IsoDirections.N && this.current.has(IsoFlagType.climbSheetN)
```

**But properties flow downhill: square <- objects <- sprites.** A square inherits
the flags of the sprites sitting on it, and it does so *when the square is
built*.

### The consequence that shapes the whole design

Tagging a sprite only affects squares built **after** the tag. That is why the
prior-art mod tags at `OnLoadedTileDefinitions` — before any world geometry
exists — and why its own comments admit that a newly *placed* ladder is not
climbable until

> the player moves to another chunk and comes back / quit and load the saved game

So there are two distinct problems, and they need different tools:

| case | tool |
|------|------|
| ladders already in the world | tag the sprite before world load |
| a ladder placed during play | act on that square directly |

**Lazy sprite tagging on discovery does not work retroactively.** This was the
blocking question; it is answered, and the answer rules out the simplest design.

---

## 2. All four directions are fully supported

<a id="directions"></a>

`IsoFlagType` defines `climbSheetW`(44), `climbSheetN`(45), `climbSheetTopN`(46),
`climbSheetTopW`(47), and — added later — `climbSheetE`(58), `climbSheetS`(59),
`climbSheetTopE`(60), `climbSheetTopS`(61).

**All four are live in every consumer:**

| consumer | lines |
|----------|-------|
| `ClimbSheetRopeState` | `:235` N, `:242` S, `:249` W, `:256` E |
| `IsoPlayer` | `:5046` N, `:5049` S, `:5052` W, `:5055` E |
| `IsoZombie` | `:3624-3627` all four |
| `IsoWindow` | `:821` all four `climbSheetTop` variants |

The vanilla tile definitions likewise use `ladderW`, `ladderN`, `ladderE` **and**
`ladderS`.

**Every existing ladder mod sets only W and N.** East- and south-facing ladders
are unhandled by all of them.

**But there is a partial engine reason, found later.** The *climb* flags exist in
all four directions and we set all four. The *dismount* needs a hoppable wall,
and wall-side flags exist only as N and W — so an E/S ladder's top object belongs
on the neighbouring square. See [wall sides](#wall-sides). E/S ladders therefore
climb here but do not yet dismount.

---

## 3. `climbSheetTop` marks the dismount square

<a id="top"></a>

Both halves are checked together — you can climb where either the sheet flag or
the top flag is present:

```java
// ClimbSheetRopeState.java:235-236
if (square.getProperties().has(IsoFlagType.climbSheetN)
   || square.getProperties().has(IsoFlagType.climbSheetTopN)) {
```

`IsoGridSquare.removeSheetRopeFromBottom` (`:3914`) shows the engine's own model:
a sheet rope is a column of `climbSheetX` squares topped by one `climbSheetTopX`,
and removal walks the column clearing both. Vanilla carries the flags on real
sprites — `crafted_01_3` and `crafted_01_4` are named explicitly at `:3954` and
`:3935`. Since 42.21 that method is private and takes no arguments (it was
public, `removeSheetRopeFromBottom(IsoPlayer, boolean)`, in 42.20), so Lua can no
longer call it; the model it shows is unchanged.

> **Proof:** Code. `zombie.iso.IsoGridSquare#removeSheetRopeFromBottom()` (private) and `#damageSpriteSheetRopeFromBottom()`. Build 42.21.0 (revision 4a0e9546ec).

### The top object is REQUIRED. Proven in play.

<a id="top-object"></a>

An earlier version of this document argued the prior art's invented sprite was
"probably avoidable" by re-applying the flag on `Events.LoadGridsquare`. **That
was wrong**, and the first playtest demonstrated it: the character climbed
forever and could not get off.

Three facts, in order:

**1. A flag written onto a square is erased.** `IsoGridSquare.RecalcProperties`
(`:7232`) begins:

```java
this.properties.Clear();
...
for (int n = 0; n < numObjects; n++) {
   PropertyContainer spriteProps = obj.getProperties();
```

It wipes the container and rebuilds it **purely from the objects present**, and
it runs on far more occasions than square load — so re-applying on load loses
the race.

**2. Objects have no properties of their own.** `IsoObject.getProperties()` is

```java
return this.sprite == null ? null : this.sprite.getProperties();
```

There is no per-instance container to write to. Flagging an object flags that
*sprite*, everywhere it appears.

**3. Without `climbSheetTop`, the climb has no exit.** `calculateClimb`
(`ClimbSheetRopeState.java:291-299`):

```java
for (int z = floor(getZ()); z <= maxLevel; z++) {
   if (IsoWindow.isTopOfSheetRopeHere(sq)) {
      climbData.targetGridSquare = sq;
      climbData.targetClimbHeight = z;
      break;
   }
}
```

If nothing in the column carries a `climbSheetTop*`, the loop never breaks, no
target is set, and `execute()` never reaches `finishClimbing`. **That is "climb
forever and get stuck at the top", exactly.**

The ladder square itself is fine either way, because its flag rides the ladder's
own sprite and the rebuild re-derives it. Only the top needs an object.

So the prior art's design was right, and its comment said so plainly:

> square takes properties from objects, objects from sprites. To prevent falling
> during climbing we make the custom sprites more persistent

### What the top object has to carry

`calculateClimbOutcome` (`:142`) needs something to climb *over* at the top. It
tries a window, a thumpable, a window frame, and finally `getWallHoppableTo`,
which wants an object whose `HoppableN` or `HoppableW` flag matches the edge
between the two squares. In 42.20 that last step was `getWallHoppable(north)`;
42.21 removed that method and routes the same question through
`getEdgeElementTo` and `getWallHoppable(GridSquareEdgeFacingDirection)`, which
asks `isHoppable(facingDirection)`. Same answer, new names.

> **Proof:** Code. `zombie.ai.states.ClimbSheetRopeState#calculateClimbOutcome`; `zombie.iso.IsoGridSquare#getWallHoppableTo(IsoGridSquare, GetSquare)`, `#getEdgeElementTo`, `#getEdgeElement`, `#getWallHoppable(GridSquareEdgeFacingDirection)`; `zombie.iso.IsoObject#isHoppable(GridSquareEdgeFacingDirection)`, `#getHoppableDirection`. Build 42.21.0 (revision 4a0e9546ec).

Hence the flag set: `climbSheetTop*` so the climb finds a target, plus
`Hoppable*`, `collide*`, `transparent*`, `cut*`, `canPath*` and `Wall*Trans` so
the dismount finds a see-through wall to hop over.

### N and W only, because the engine has nothing else

<a id="wall-sides"></a>

Every wall-side flag exists **only** in N and W forms:

| flag | exists as |
|------|-----------|
| `Hoppable` | `HoppableN`, `HoppableW` |
| `collide` | `collideN`, `collideW` |
| `transparent` | `transparentN`, `transparentW` |
| `cut` | `cutN`, `cutW` |
| `canPath` | `canPathN`, `canPathW` |
| wall transparency | `WallNTrans`, `WallWTrans` |

A square stores walls on its north and west edges; an east wall *is* the west
wall of the square to the east. `getWallHoppableTo` reflects this — for
`next.x > this.x` it asks **`next`** for its W-hoppable, not `this` (in 42.21
it then also asks `this` for its east edge, which resolves to the same west
edge of `next`).

`climbSheetE` and `climbSheetS` are real and we set them, so E/S ladders climb.
Their top object would have to sit on the neighbouring square carrying the
opposite side's flags, which is not implemented. See
DESIGN.md (not yet published).

---

## 4. Tile properties: readable for free, writable only if registered

<a id="properties"></a>

`PropertyContainer` interns every property name through `TilePropertyAliasMap`:

```java
// PropertyContainer.java:168
public String get(String name) {
   int p = TilePropertyAliasMap.instance.getIDFromPropertyName(name);
   return !this.containsKey((short)p) ? null : ...;
}
```

That map is generated from **every property name found in every loaded
tileset**:

```java
// IsoWorld.java:1427  — harvest
if (PropertyValueMap.containsKey(prop)) { ... }
// IsoWorld.java:1363  — intern
TilePropertyAliasMap.instance.Generate(PropertyValueMap);
```

**So `ladderN` / `ladderS` / `ladderE` / `ladderW` are queryable from Lua with no
registration**, and so is any property a *mod's* tileset defines. This is what
makes discovery possible and hardcoded sprite lists unnecessary.

> **Writing is different.** `set(String, String)` first tries
> `IsoFlagType.FromString`, and otherwise looks the name up in the alias map —
> if it returns `-1` the call **silently does nothing** (`:123`). Reading an
> unknown property is safe; inventing a new one is not.

Vanilla precedent for touching sprite properties from Lua:

```lua
-- MOFarming.lua:91
isoObject:getSprite():getProperties():set("IsMoveAble", "true")
```

### What a vanilla ladder tile looks like

```
// carpentry_02_84
tile {
    xy = 4,10
    CustomName = Ladders
    Facing = E
    Material = Wood
    MoveType = WallObject
    ladderW =
}
```

Note `CustomName = Ladders` and `Facing` are also present and may be useful
cross-checks.

---

## 5. Multiplayer

<a id="multiplayer"></a>

**Vanilla registers tile properties on both sides.** From
`media/lua/shared/Util/CustomTileProps.lua`:

```lua
Events.OnGameStart.Add(OnGameStart)
Events.OnServerStarted.Add(OnGameStart)
```

**No existing ladder mod hooks `OnServerStarted`.** The original is
`lua/client/` only, and both later forks moved the same code to `lua/shared/` —
which reads like they hit a dedicated-server problem and fixed it by relocating.

We follow vanilla: `shared/`, registered on both events. Decided up front rather
than discovered on a live server.

`IsoZombie` reads the same climb flags (`:3624-3627`), so zombies will use
whatever we make climbable. That is a gameplay consequence, not a bug — but it
is a design decision to take deliberately.

*Updated 2026-10-04 for Build 42.21: line numbers re-pointed; getWallHoppable(boolean) is gone and removeSheetRopeFromBottom is now private, so the text names the 42.21 methods. The climb and dismount behaviour is unchanged.*
