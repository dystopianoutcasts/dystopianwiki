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
  Build 42.22 gives every player a heat model with 17 body nodes and a core temperature. How clothing and work feed it, why Hyperthermia stops at level 2, and which work reaches the server's copy.
last_updated: '2026-11-21'
related_articles:
  - body-damage-wounds-and-infection
  - cabin-climate-windchill
  - lua-classes-characters-1
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

Outcast, if you make clothing, a heater, a cold-weather challenge or anything that touches how warm a survivor is, this is the system you are talking to. It is one Java class, `Thermoregulator`, that every player carries inside their body damage. It is more of a physics model than the moodles make it look, and in 42.22 one moodle cannot reach its worst levels.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [clothing and heater modders](#4-clothing-what-makes-a-garment-warm) | [multiplayer modders](#6-which-side-runs-the-model)

:::callout[The 1-minute version]{kind=key}
- You get cold in rain and wind and warm when you work. Cold hands and arms make timed actions longer, and a cold wet torso and neck make a cold more likely.
- A garment keeps you warm on a body part only if it covers that part, and coverage comes from its `BloodLocation`. Without one it counts only as a hat or mask, on the head.
- The metabolic target only goes up within a tick: the highest request wins. Ask again every tick.
- By the code, Hyperthermia stops at level 2 ("Overheated"), because the temperature stat is capped at 40 and level 3 needs more than 40. Not tested in a game.
- In multiplayer the model runs only on the server. Lua timed actions do not run their `update()` there, but the Java build action does, so building does heat the server's copy.
:::

:::facts
- **Nodes** 17, one per body part, the upper torso is the core :cite[(`Thermoregulator.java:207-286`)]
- **Core range** held between 20 and 42 degrees C, the stat between 20 and 40 :cite[(`Thermoregulator.java:862`, `CharacterStat.java:36`)]
- **Default work rate** 1.5 MET, from Sleeping 0.8 to MAX 10.3 :cite[(`Metabolics.java:14-37`)]
- **Multiplayer model sync** inside the whole-body packet every 2 seconds :cite[(`NetworkPlayerManager.java:16`, `BodyDamage.java:303-307`)]
- **Cold damage ceiling** at 7,200 game seconds of exposure, 7.5 real minutes at the 90-minute day :cite[(`Thermoregulator.java:646`)]
:::

## 1. What it does for the player

**You get cold in the rain and the wind, warm when you run or chop wood, and too hot in a winter coat in July.** Cold arms and hands make actions slower :cite[(`Thermoregulator.java:492-515`)]. A cold, wet torso and neck make you more likely to catch a cold :cite[(`Thermoregulator.java:453-490`)].

Being too hot makes you thirstier and more tired. Being too cold burns calories faster and tires you, then slows you down, and in freezing air at the worst level it does damage :cite[(`Thermoregulator.java:966-989`, `Thermoregulator.java:633-666`)].

## 2. Where it lives

**One `Thermoregulator` per player, with a `ThermalNode` for each body part.** `BodyDamage` creates it for an `IsoPlayer` only, so zombies and animals have none :cite[(`BodyDamage.java:156-158`)].

| Piece | Where | What it is | Code |
|---|---|---|---|
| The model | `zombie.characters.BodyDamage.Thermoregulator` | One per player, created by `BodyDamage` | `BodyDamage.java:156-158` |
| The nodes | `Thermoregulator.ThermalNode` | One per body part, 17 in all; the upper torso is the core | `Thermoregulator.java:207-286` |
| Work rates | `zombie.characters.BodyDamage.Metabolics` (enum) | Activities in MET, from `Sleeping` 0.8 to `MAX` 10.3 (24 values) | `Metabolics.java:14-37` |
| Air temperature | `zombie.iso.weather.ClimateManager#getAirTemperatureForCharacter` | The air around the player, indoors, in a vehicle, with or without wind chill | `ClimateManager.java:698-706` |
| Clothing values | `zombie.iso.weather.Temperature#getTrueInsulationValue`, `#getTrueWindresistanceValue` | Turn an item's script values into model units | `Temperature.java:93-100` |
| The moodles | `zombie.characters.Moodles.Moodle` | Hypothermia and Hyperthermia levels from the core temperature stat | `Moodle.java:467-520` |

Indoors the air is exactly 22 C in any room while the power grid is on, whatever the weather. See [Temperature outdoors](/pz/build-42/engine/weather-and-climate/temperature-outdoors) :cite[(`ClimateManager.java:715-738`)].

## 3. One tick of the model

**`BodyDamage#Update` calls `Thermoregulator#update` every tick, after a bleeding check and before the other body updates, and no other Java calls it.** :cite[(`BodyDamage.java:2120-2142`, `Thermoregulator.java:668-681`)] The method is also exposed to Lua in the API index, so a mod can call it. The update runs, in order:

1. **Air:** reads the air temperature for the player twice, once plain and once with wind chill :cite[(`Thermoregulator.java:669-670`)].
2. **Set point:** the core temperature the body aims for, 37 degrees plus up to 2 more for sickness (a fever) :cite[(`Thermoregulator.java:683-689`)].
3. **Core rate of change:** a counter that feeds the moodle chevrons, not the temperature itself :cite[(`Thermoregulator.java:542-551`)].
4. **Metabolic rate:** how much heat the body is making (section 5) :cite[(`Thermoregulator.java:691-767`)].
5. **Clothing:** when what the player wears changes, it re-sorts every garment onto the nodes it covers :cite[(`Thermoregulator.java:991-1039`)].
6. **Node heat and core:** each node's insulation, wind resistance and wetness against the air, then the core moves by the total heat, faster the further it is from the set point, held between 20 and 42 degrees, and is written to the `TEMPERATURE` stat :cite[(`Thermoregulator.java:769-869`)].
7. **Skin:** moves each node's skin temperature toward a target set by the core, the air and that node's insulation :cite[(`Thermoregulator.java:890-964`)].
8. **Costs:** sets three multipliers. Running hot raises thirst and fatigue; running cold raises fatigue and calorie burn. The calorie multiplier (the "energy" multiplier, read by `Nutrition`) applies only while the player is asleep or standing idle, not while moving :cite[(`Thermoregulator.java:966-989`, `Nutrition.java:93-111`, `IsoGameCharacter.java:14075-14090`)].
9. **Damage:** cold damage at the worst Hypothermia level in freezing air, and heat damage at the worst Hyperthermia level, which cannot happen (section 7) :cite[(`Thermoregulator.java:633-666`)].

Cold damage lowers the body's health ceiling: `BodyDamage` holds overall health below 100 minus the cold damage stage times 100, and kills at a stage of 1 :cite[(`BodyDamage.java:2519-2531`)]. The damage value rises only when the counter of game seconds passes 1, grows faster the colder the air and the lower the core, and is capped by the time spent in the cold divided by 7,200 game seconds. At the 90-minute day that cap is 7.5 real minutes :cite[(`Thermoregulator.java:635-646`)].

## 4. Clothing: what makes a garment warm

**A garment warms a node only if it covers that body part and has no hole over it.** For each node, `ThermalNode#calculateInsulation` adds up the garments on that node :cite[(`Thermoregulator.java:1108-1138`)]:

- A garment counts on a node only if it covers that body part. Coverage comes from the item's **`BloodLocation`** script value :cite[(`Item.java:2909`)]. A garment with no covered part counts only if it is worn as a hat or a mask, and then only on the head :cite[(`Thermoregulator.java:1003-1035`)].
- A garment with a **hole** over that part adds nothing there :cite[(`Thermoregulator.java:1121`)].
- **Wetness** cuts its insulation by up to 75 percent and its wind resistance by up to 45 percent :cite[(`Thermoregulator.java:1127-1128`)].
- **Condition** scales both between half (ruined) and full (new) :cite[(`Thermoregulator.java:1126-1128`)].
- Every layer adds a flat 0.05 to both, on top of its own values :cite[(`Thermoregulator.java:1135-1136`)].

The item's own warmth comes from its `Insulation` and `WindResistance` script values, converted by `Temperature#getTrueInsulationValue` and `#getTrueWindresistanceValue` :cite[(`Thermoregulator.java:1123-1124`, `Temperature.java:93-100`)]. Only garments with a value above 0 for insulation or wind resistance are placed on nodes at all :cite[(`Thermoregulator.java:1014`)].

The same nodes drive two side effects players notice. Cold skin on the hands, forearms and upper arms makes timed actions longer, applied in `ISBaseTimedAction:adjustMaxTime`, but only for an action whose base time is more than 1 :cite[(`Thermoregulator.java:492-515`, `ISBaseTimedAction.lua:100-120`)]. And the chance of catching a cold weighs the upper torso 16 times, the neck 8 times and the head 4 times as much as other parts, more when skin or clothes there are wet, and it is multiplied by the Hypothermia level when that is above 1 :cite[(`Thermoregulator.java:453-490`)].

## 5. The metabolic rate: the highest request wins

**Each tick the target starts at `Default` (1.5 MET) and only ever goes up.** `setMetabolicTarget` ignores a request lower than the current one, and caps it at `MAX` :cite[(`Thermoregulator.java:533-540`)].

The model itself raises it for attacking, by weapon type, from `LightWork` for a knife or firearm up to `Running15kmh` for a heavy weapon or chainsaw. It also raises it for walking, sneaking, running and sprinting, and for fitness exercise :cite[(`Thermoregulator.java:694-741`)]. Low endurance is one more raise-only request (tired muscles make more heat), and only the weight carried multiplies the final target, by up to 35 percent at full load :cite[(`Thermoregulator.java:746-750`)]. The real heat output then scales with how fed and rested the player is :cite[(`Thermoregulator.java:765`, `Thermoregulator.java:1041-1045`)].

**Timed actions raise it too.** Of the 125 calls to `setMetabolicTarget` in vanilla Lua, 122 sit in a function named `update` of a timed action: building asks for `HeavyWork`, climbing a fence for `JumpFence`, moving items for `LightWork` :cite[(`ISBuildAction.lua:106`, `ISClimbOverFence.lua:19`)]. The other three are in `ISTakeFuel:updateUse`, `ISPickupFishAction:PickupFishUpdate` and `ISWashVehicle:updateWashing` :cite[(`ISTakeFuel.lua:33`, `ISPickupFishAction.lua:49`, `ISWashVehicle.lua:115`)]. Because the target resets at the end of every model update, an action has to ask again every tick, which `update()` does :cite[(`Thermoregulator.java:766`)].

## 6. Which side runs the model

**In single player the model runs in your game every tick. In multiplayer it runs only on the server.** `BodyDamage#Update` returns at once on a client for a living player, and no other Java calls the model :cite[(`BodyDamage.java:2106-2118`, `BodyDamage.java:2142`)]. The server's result (core, set point, metabolic rate and every node's temperatures and insulation) is inside the `PlayerDamage` packet it sends each player every two seconds :cite[(`NetworkPlayerManager.java:16`, `NetworkPlayerAI.java:741-752`, `BodyDamage.java:303-307`)]. See [body damage, wounds and infection](/pz/build-42/modding/engine/body-damage-wounds-and-infection).

That matters before you build on work heat. A Lua timed action's `update()` runs in the player's own game, and the server side of the action runs only its start, stop and `complete()` and a few callbacks :cite[(`LuaTimedActionNew.java:99`, `NetTimedAction.java:60-195`)]. So when your action calls `self.character:setMetabolicTarget(Metabolics.HeavyWork)` in `update()`, it raises the target on the client's copy of the model, which never runs. We found no packet that carries a metabolic target.

**Building is the exception.** The Java `BuildAction` that the server runs for a build sets `HeavyWork` in its own `update()` whenever it is not on a client, and the server's action loop calls that `update()` :cite[(`BuildAction.java:108-112`, `ActionManager.java:76-111`, `ISBuildAction.lua:152`)]. So by the code, on a dedicated server building does warm the server's copy, while digging and other Lua actions warm a player only as much as the server's own checks (moving, sprinting, attacking, exercising, endurance, weight) allow.

## 7. The two moodles, and the level that cannot happen

**The moodles read the `TEMPERATURE` stat, which is the core temperature after the clamp.** :cite[(`Moodle.java:467-520`)]

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

**The `TEMPERATURE` stat is registered with a range of 20 to 40, and every write is clamped to it.** :cite[(`CharacterStat.java:36`, `Stats.java:84-90`)] The core itself may reach 42 for a moment, but the next tick pulls it halfway back to the stored stat, and the moodle only ever sees the stat :cite[(`Thermoregulator.java:862-868`)]. So in 42.22, by the code, **Hyperthermia never goes past level 2**. Level 3 needs more than 40, and the stat stops at 40.

Everything that reads level 3 or 4 of Hyperthermia never fires: the heat damage branch, the doubled endurance drain behind `getHyperthermiaMod`, and the harsher movement and combat penalties :cite[(`Thermoregulator.java:647-655`, `IsoGameCharacter.java:4585-4592`, `IsoPlayer.java:3258`, `Thermoregulator.java:331-379`)]. Hypothermia is not affected, because its worst level needs below 25, inside the range.

Levels 2 to 4 of either moodle slow walking and attack speed: movement is multiplied by 0.66, 0.33 and 0 at levels 2, 3 and 4, and combat speed by 0.66, 0.33 and 0.1 :cite[(`Thermoregulator.java:331-379`, `IsoGameCharacter.java:9820`, `IsoGameCharacter.java:9998`)]. Cold damage needs Hypothermia level 4 with the wind-chilled air below 0 degrees and a core that is not rising :cite[(`Thermoregulator.java:636-637`)].

```java
public static final CharacterStat TEMPERATURE = register("Temperature", 20.0F, 40.0F, 37.0F);
```

The English names are "Unpleasantly Hot", "Overheated", "Sunstruck" and "Hyperthermia" for levels 1 to 4 of Hyperthermia :cite[(`Moodles.json:76-79`)].

## 8. What Lua can reach

**Lua reaches the model through `player:getBodyDamage():getThermoregulator()`.**

- It gives [Thermoregulator](/pz/build-42/modding/reference/lua-classes-characters-1#thermoregulator): `getCoreTemperature`, `getSetPoint`, `getMetabolicRate`, `getMetabolicRateReal`, `getTemperatureAir`, `getTemperatureAirAndWind`, `getFluidsMultiplier`, `getEnergyMultiplier`, `getFatigueMultiplier`, `getMovementModifier`, `getCombatModifier`, `getTimedActionTimeModifier`, `getThermalDamage`, `getNodeForType(BodyPartType)`, and `setMetabolicTarget`.
- A node ([ThermalNode](/pz/build-42/modding/reference/lua-classes-characters-1#thermoregulatorthermalnode)) gives its `getCelcius`, `getSkinCelcius`, `getInsulation`, `getWindresist`, `getClothingWetness` and `getBodyWetness`.
- `character:setMetabolicTarget(Metabolics.HeavyWork)` works from any timed action; the [Metabolics](/pz/build-42/modding/reference/lua-classes-characters-1#metabolics) enum is exposed :cite[(`IsoGameCharacter.java:14063-14073`)].
- The static `Thermoregulator.setSimulationMultiplier(float)` speeds or slows the whole model for everyone in that game :cite[(`Thermoregulator.java:92-94`)].
- Clothing scripts: `Insulation`, `WindResistance` and `BloodLocation` on the item.
- The vanilla debug panel `PlayerClimateDebug` shows most of these live, which is the quickest way to watch your mod's effect.

## 9. What a mod can and cannot change, and the traps

**The model owns its numbers, so ask it for heat and give clothing a body location.**

- **Clothing needs `BloodLocation` to keep anyone warm.** Without it, `Insulation` counts only on a hat or mask, on the head. A modded coat with `Insulation = 1.0` and no `BloodLocation` warms nothing on the body :cite[(`Thermoregulator.java:1003-1035`)].
- **A lower metabolic target is ignored.** You cannot cool a player down by asking for `SeatedResting` (1.0 MET) while something else asks for more; the highest request in the tick wins :cite[(`Metabolics.java:15`, `Thermoregulator.java:533-540`)].
- **Ask every tick.** The target resets at the end of each model update, so a one-off `setMetabolicTarget` lasts a single tick :cite[(`IsoGameCharacter.java:14069-14073`, `Thermoregulator.java:766`)].
- **Do not count on work heat from a Lua timed action in multiplayer** until the server test below says otherwise. Building is the one vanilla action the server heats itself.
- **Writing the core temperature does not stick.** The model owns the core; setting the `TEMPERATURE` stat moves it at most halfway for one tick, and anything above 40 is clamped away :cite[(`Thermoregulator.java:862-868`)].
- **Hyperthermia 3 and 4 do not exist in 42.22.** Do not design a mod around them, and do not report their absence as your bug.

:::callout[How we know]{kind=proof}
All of this is read from the 42.22 code; none of it has been seen in a game or in a server log.

The test that settles Hyperthermia: in single player, summer midday, wear the heaviest coat, hat and gloves you can find and sprint until the Hyperthermia moodle stops rising, with the debug climate panel open on core temperature. By the code the moodle stops at level 2 ("Overheated") and never shows "Sunstruck" or "Hyperthermia", and the stat stops at 40. Not tested.

The test for work heat: on a dedicated server in cold weather, a server-side Lua function logs `player:getBodyDamage():getThermoregulator():getMetabolicRate()` once a minute while the player stands still, then while building a wall, then while digging. By the code the number rises for the build and not for the dig. Not tested.

The real-time figure for the cold damage cap is our arithmetic from game seconds and the 90-minute day.
:::

## 10. Where to go next

- [Body damage, wounds and infection](/pz/build-42/modding/engine/body-damage-wounds-and-infection): the rest of `BodyDamage#Update` and how it reaches clients.
- [Cabin climate and wind chill](/pz/build-42/vehicles/mod-studies/cabin-climate-windchill): how a vehicle changes the air the model reads.
