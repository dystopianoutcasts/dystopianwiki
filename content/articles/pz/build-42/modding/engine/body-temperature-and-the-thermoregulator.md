---
id: build-42-body-temperature-and-the-thermoregulator
slug: body-temperature-and-the-thermoregulator
title: 'Body temperature: the thermoregulator, clothing and the two moodles'
game: pz
version: build-42
section: modding
category: engine
difficulty: advanced
tags:
  - engine
  - temperature
  - clothing
  - multiplayer
  - lua-api
excerpt: >-
  Every player carries a heat model with seventeen body nodes, a metabolic rate
  and a core temperature. How clothing, wetness and work feed it, what the
  Hypothermia and Hyperthermia moodles read, why Hyperthermia cannot pass level
  2 in 42.21, and why the work your timed action does may never reach the
  server's copy of the model.
last_updated: '2026-10-04'
related_articles:
  - body-damage-wounds-and-infection
  - cabin-climate-windchill
  - lua-classes-characters-1
---
# Body temperature: the thermoregulator, clothing and the two moodles

Outcast, if you make clothing, a heater, a cold-weather challenge or anything that touches how warm a survivor is, this is the system you are talking to. It is one Java class, `Thermoregulator`, that every player carries inside their body damage. It is more of a physics model than the moodles make it look, and in 42.21 it has two surprises: one moodle cannot reach its worst levels, and in multiplayer the work your character does may not warm the copy of the model that counts.

## What it does for the player

You get cold in the rain and the wind, warm when you run or chop wood, too hot in a winter coat in July. Cold arms and hands make actions slower. A cold, wet torso and neck make you more likely to catch a cold. Being too hot makes you thirsty and tired; being too cold burns calories faster and makes you tired, then slows you down and, in freezing air at the worst level, does damage.

## Where it lives

| Piece | Where | What it is |
|---|---|---|
| The model | `zombie.characters.BodyDamage.Thermoregulator` | One per player, created by `BodyDamage` (zombies and animals have none) |
| The nodes | `Thermoregulator.ThermalNode` | One per body part, 17 in all; the upper torso is the core |
| Work rates | `zombie.characters.BodyDamage.Metabolics` (enum) | Activities in MET, from `Sleeping` 0.8 to `MAX` 10.3 |
| Air temperature | `zombie.iso.weather.ClimateManager#getAirTemperatureForCharacter` | The air around the player, indoors, in a vehicle, with or without wind chill |
| Clothing values | `zombie.iso.weather.Temperature#getTrueInsulationValue`, `#getTrueWindresistanceValue` | Turn an item's script values into model units |
| The moodles | `zombie.characters.Moodles.Moodle` | Hypothermia and Hyperthermia levels from the core temperature stat |

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage` constructor (`new Thermoregulator(this)` only for an `IsoPlayer`); `zombie.characters.BodyDamage.Thermoregulator#initNodes` (one node per body part, `Torso_Upper` is the core); `zombie.characters.BodyDamage.Metabolics`; `zombie.iso.weather.ClimateManager#getAirTemperatureForCharacter`; `zombie.iso.weather.Temperature`; `zombie.characters.Moodles.Moodle#Update`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## One tick of the model

`BodyDamage#Update` calls `Thermoregulator#update` first thing, every tick. It runs, in order:

1. **Air:** reads the air temperature for the player twice, once plain and once with wind chill.
2. **Set point:** the core temperature the body aims for, 37 degrees plus up to 2 more for sickness (a fever).
3. **Metabolic rate:** how much heat the body is making (below).
4. **Clothing:** when what the player wears changes, it re-sorts every garment onto the nodes it covers.
5. **Node heat:** each node's insulation, wind resistance and wetness against the air.
6. **Core:** moves the core temperature by the total heat, faster the further it is from the set point, held between 20 and 42 degrees, and writes it to the `TEMPERATURE` stat.
7. **Skin:** moves each node's skin temperature towards a target set by the core, the air and that node's insulation.
8. **Costs:** sets three multipliers. Running hot raises thirst and fatigue; running cold raises calorie burn (the "energy" multiplier, read by `Nutrition`) and fatigue.
9. **Damage:** cold damage at the worst Hypothermia level in freezing air (and heat damage at the worst Hyperthermia level, which cannot happen; see below).

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage#Update` (`thermoregulator.update()` before the other updates); `zombie.characters.BodyDamage.Thermoregulator#update` (the order above), `#updateSetPoint` (`37.0F + sickness * 2.0F`), `#updateHeatDeltas` (`PZMath.clamp(this.core.celcius, 20.0F, 42.0F)`, then `stats.set(CharacterStat.TEMPERATURE, ...)`), `#updateNodes`, `#updateBodyMultipliers` (`fluidsMultiplier` when hot, `energyMultiplier` when cold, `fatigueMultiplier` both ways), `#updateThermalDamage`; the multipliers are read by `zombie.characters.IsoGameCharacter#getThirstMultiplier` and `#getFatiqueMultiplier` and by `zombie.characters.BodyDamage.Nutrition` (`coldMulti`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The metabolic rate: the highest request wins

Each tick the model starts the target at `Default` (1.5 MET) and then takes requests. `setMetabolicTarget` only ever raises the target: a lower request than the current one is ignored. The model itself raises it for attacking (by weapon type, from `LightWork` for a knife up to `Running15kmh` for a heavy weapon or chainsaw), for walking, sneaking, running and sprinting, and for fitness exercise. On top of that come low endurance (tired muscles make more heat) and the weight carried (up to 35 percent more at full load). The real heat output then scales with how fed and rested the player is.

**Timed actions raise it too.** 121 of the 124 calls to `setMetabolicTarget` in vanilla Lua sit in a timed action's `update()`: building asks for `HeavyWork`, climbing a fence for `JumpFence`, moving items for `LightWork`. Because the target resets at the end of every model update, an action has to ask again every tick, which `update()` does.

> **Proof:** Code. `zombie.characters.BodyDamage.Thermoregulator#setMetabolicTarget(float)` (`!(target < this.metabolicTarget)`, capped at `Metabolics.MAX`), `#updateMetabolicRate` (weapon types, movement, `getFitness().getCurrentExe()`, endurance term, `1.0F + weight * weight * 0.35F`, `metabolicTarget = -1.0F` at the end); `zombie.characters.IsoGameCharacter#setMetabolicTarget` (forwards to the thermoregulator); a scan of `media/lua` for `setMetabolicTarget`: 124 calls, 121 inside a function named `update` (the others in `ISTakeFuel:updateUse`, `ISPickupFishAction:PickupFishUpdate`, `ISWashVehicle:updateWashing`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Clothing: what makes a garment warm

For each node, `ThermalNode#calculateInsulation` adds up the garments on that node:

- A garment counts on a node only if it covers that body part. Coverage comes from the item's **`BloodLocation`** script value. A garment with no `BloodLocation` counts only if it is worn as a hat or a mask, and then only on the head.
- A garment with a **hole** over that part adds nothing there.
- **Wetness** cuts its insulation by up to 75 percent and its wind resistance by up to 45 percent.
- **Condition** scales both between half (ruined) and full (new).
- Every layer adds a flat 0.05 to both, on top of its own values.

The item's own warmth comes from its `Insulation` and `WindResistance` script values, converted by `Temperature#getTrueInsulationValue` and `#getTrueWindresistanceValue`.

The same nodes drive two side effects players notice. Cold skin on the hands, forearms and upper arms makes every timed action longer (`getTimedActionTimeModifier`, applied in `ISBaseTimedAction:adjustMaxTime`). And the chance of catching a cold weighs the upper torso 16 times, the neck 8 times and the head 4 times as much as other parts, more when skin or clothes there are wet.

> **Proof:** Code. `zombie.characters.BodyDamage.Thermoregulator#updateClothing` (garments with insulation or wind resistance, placed by `getBloodClothingType` and `BloodClothingType.getCoveredParts`, else `HAT` or `MASK` to the head), `ThermalNode#calculateInsulation` (holes, `1.0F - itemWetness * 0.75F`, `1.0F - itemWetness * 0.45F`, `0.5F + 0.5F * itemCondition`, `layers * 0.05F`), `#getTimedActionTimeModifier`, `#getCatchAColdDelta` (neck 8, upper torso 16, head 4); `zombie.scripting.objects.Item#DoParam` (`BloodLocation`); `media/lua/shared/TimedActions/ISBaseTimedAction.lua` (`maxTime * self.character:getTimedActionTimeModifier()`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The two moodles, and the level that cannot happen

The moodles read the `TEMPERATURE` stat, which is the core temperature after step 6:

| Core temperature | Hypothermia | Hyperthermia |
|---|---|---|
| above 41 | | level 4 |
| above 40 | | level 3 |
| above 39 | | level 2 |
| above 37.5 | | level 1 |
| below 36.5 | level 1 (not while drunk enough) | |
| below 35 | level 2 (not while drunk enough) | |
| below 30 | level 3 | |
| below 25 | level 4 | |

**The `TEMPERATURE` stat is registered with a range of 20 to 40, and every write is clamped to it.** The core itself may reach 42 for a moment, but the next tick pulls it halfway back to the clamped stat, and the moodle only ever sees the stat. So in 42.21, by the code, **Hyperthermia never goes past level 2**. Everything that reads level 3 or 4 never fires: the heat damage, the doubled endurance drain behind `getHyperthermiaMod`, and the harsher movement and attack-speed penalties. Hypothermia is not affected: its worst level needs below 25, inside the range.

Levels 2 to 4 of either moodle slow walking, running and attack speed (`getMovementModifier`, `getCombatModifier`); cold damage needs Hypothermia level 4 with the wind-chilled air below 0 degrees and grows over time.

```java
public static final CharacterStat TEMPERATURE = register("Temperature", 20.0F, 40.0F, 37.0F);
```

> **Proof:** Code. `zombie.characters.CharacterStat` (the line quoted: minimum 20, maximum 40, default 37); `zombie.characters.Stats#set` (`stat.clamp(value)`; the only writer of the stat map); `zombie.characters.BodyDamage.Thermoregulator#updateHeatDeltas` (core clamped to 42, then `lerp(core, currentTemperature, 0.5F)` toward the stored stat); `zombie.characters.Moodles.Moodle#Update` (the thresholds in the table, read from `getStats().get(CharacterStat.TEMPERATURE)`); `zombie.characters.BodyDamage.Thermoregulator#updateThermalDamage` (`HYPERTHERMIA) == 4`), `#getMovementModifier`, `#getCombatModifier` (applied to walk and run speed and to combat speed in `zombie.characters.IsoGameCharacter`); `zombie.characters.IsoGameCharacter#getHyperthermiaMod` (2 only at level 4; multiplies the endurance loss in `zombie.characters.IsoPlayer`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

We have not seen this in a game. The test that settles it: in single player, summer midday, wear the heaviest coat, hat and gloves you can find and sprint until the Hyperthermia moodle stops rising, with the debug climate panel open on core temperature; by the code the moodle stops at level 2 ("Overheated" in English) and never shows "Sunstruck" or "Hyperthermia", and the stat stops at 40.

> **Proof:** Unknown. "Hyperthermia never passes level 2" is read from the stat range and the moodle thresholds; no game test yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs, and on which side

**Single player:** every tick, in your game.

**Multiplayer:** the model runs only on the server. It is called from `BodyDamage#Update`, which returns at once on a client for a living player, and nothing else calls it. The server's result (core, set point, metabolic rate and every node's temperatures and insulation) is inside the `PlayerDamage` packet it sends each player every two seconds (see [body damage, wounds and infection](/pz/build-42/modding/engine/body-damage-wounds-and-infection)).

That has a consequence worth knowing before you build on work heat. A timed action's `update()` runs in the player's own game; the server runs only the action's start, stop and `complete()`. So when a building action calls `self.character:setMetabolicTarget(Metabolics.HeavyWork)` in `update()`, it raises the target on the **client's** copy of the model, which never runs, and nothing sends that target to the server. By the code, on a dedicated server, building, digging and the rest warm a player only as much as the server's own checks (moving, sprinting, attacking, exercising, endurance, weight) allow.

> **Proof:** Code. `zombie.characters.BodyDamage.BodyDamage#Update` (client guard, then `thermoregulator.update()`; the only caller of `Thermoregulator#update`); `zombie.core.NetTimedAction` (the server side of a Lua timed action calls `new`, `isUsingTimeout`, `getDuration`, `adjustMaxTime`, `serverStart`, `serverStop`, `complete` and `animEvent`, never `update`); `zombie.characters.CharacterTimedActions.LuaTimedActionNew#update` (calls the Lua `update` in the player's game); no packet in `zombie.network` carries a metabolic target; `zombie.characters.BodyDamage.Thermoregulator#save` (sent inside `PlayerDamagePacket`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

The test that would settle it: on a dedicated server in cold weather, a server-side Lua function logging `player:getBodyDamage():getThermoregulator():getMetabolicRate()` once a minute while the player stands still, then while building a wall; if the number does not rise during the build, work heat does not reach the server.

> **Proof:** Unknown. Work heat not reaching the server's model is read from the code paths above; no server log yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- `player:getBodyDamage():getThermoregulator()` gives [Thermoregulator](/pz/build-42/modding/reference/lua-classes-characters-1#thermoregulator): `getCoreTemperature`, `getSetPoint`, `getMetabolicRate`, `getMetabolicRateReal`, `getTemperatureAir`, `getTemperatureAirAndWind`, `getFluidsMultiplier`, `getEnergyMultiplier`, `getFatigueMultiplier`, `getMovementModifier`, `getCombatModifier`, `getTimedActionTimeModifier`, `getThermalDamage`, `getNodeForType(BodyPartType)`, and `setMetabolicTarget`.
- A node ([ThermalNode](/pz/build-42/modding/reference/lua-classes-characters-1#thermoregulatorthermalnode)) gives its `getCelcius`, `getSkinCelcius`, `getInsulation`, `getWindresist`, `getClothingWetness` and `getBodyWetness`.
- `character:setMetabolicTarget(Metabolics.HeavyWork)` from any timed action; the [Metabolics](/pz/build-42/modding/reference/lua-classes-characters-1#metabolics) enum is exposed.
- The static `Thermoregulator.setSimulationMultiplier(float)` speeds or slows the whole model for everyone in that game.
- Clothing scripts: `Insulation`, `WindResistance` and `BloodLocation` on the item.
- The vanilla debug panel `PlayerClimateDebug` shows most of these live, which is the quickest way to watch your mod's effect.

## What a mod can and cannot change, and the traps

- **Clothing needs `BloodLocation` to keep anyone warm.** Without it, `Insulation` counts only on a hat or mask, on the head. A modded coat with `Insulation = 1.0` and no `BloodLocation` warms nothing.
- **A lower metabolic target is ignored.** You cannot cool a player down by asking for `SeatedResting` while something else asks for more; the highest request in the tick wins.
- **Ask every tick.** The target resets at the end of each model update, so a one-off `setMetabolicTarget` lasts a single tick.
- **Do not count on work heat in multiplayer** until the server test above says otherwise.
- **Writing the core temperature does not stick.** The model owns the core; setting the `TEMPERATURE` stat moves it at most halfway for one tick, and anything above 40 is clamped away.
- **Hyperthermia 3 and 4 do not exist in 42.21.** Do not design a mod around them, and do not report their absence as your bug.

> **Proof:** Code. `zombie.characters.BodyDamage.Thermoregulator#updateClothing` and `ThermalNode#calculateInsulation` (coverage from `BloodLocation`, else hat or mask), `#setMetabolicTarget` (raise only), `#updateMetabolicRate` (`metabolicTarget = -1.0F` at the end), `#updateHeatDeltas` (core pulled halfway to the stored stat, stat clamped to 40), `#setSimulationMultiplier` (static field shared by every thermoregulator); `media/lua/client/DebugUIs/DebugMenu/Climate/PlayerClimateDebug.lua`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Body damage, wounds and infection](/pz/build-42/modding/engine/body-damage-wounds-and-infection): the rest of `BodyDamage#Update` and how it reaches clients.
- [Cabin climate and wind chill](/pz/build-42/vehicles/mod-studies/cabin-climate-windchill): how a vehicle changes the air the model reads.
