---
id: vanilla-sounds-reference
slug: vanilla-sounds-reference
title: Vanilla Sound Reference
excerpt: Complete reference for all **390 sound definitions** in Project Zomboid Build 41. PZ uses FMOD for audio. Sound definitions map game events to FMOD events. sound OpenBag { category = Item, clip {...
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - sounds
  - audio
  - vanilla
  - fmod
last_updated: 2026-01-18
---
# Vanilla Sound Reference

Complete reference for all **390 sound definitions** in Project Zomboid Build 41.

## Sound System Overview

PZ uses FMOD for audio. Sound definitions map game events to FMOD events.

## Sound Definition Syntax

```
sound OpenBag
{
    category = Item,
    clip
    {
        event = Character/Foley/Bag/Open,
    }
}
```

## Properties

| Property | Description |
|----------|-------------|
| `category` | Sound category (Item, Object, Player, Zombie, etc.) |
| `clip` | Contains the FMOD event path |
| `event` | Path to the FMOD event |
| `loop` | Whether the sound loops |
| `is3D` | Whether sound is positional |

## Sound Categories

| Category | Description | Count |
|----------|-------------|-------|
| **Music** | Background music | 101 |
| **Player** | Player actions (eating, drinking, movement) | 98 |
| **Object** | World objects (doors, windows, furniture) | 92 |
| **World** | Ambient world sounds | 31 |
| **Item** | Item interactions (bags, tools, crafting) | 26 |
| **Zombie** | Zombie sounds (groans, attacks) | 21 |
| **Meta** | Meta sounds | 12 |
| **UI** | User interface sounds | 9 |

## Quick Navigation

- [Music](#music) (101 sounds)
- [Player](#player) (98 sounds)
- [Object](#object) (92 sounds)
- [World](#world) (31 sounds)
- [Item](#item) (26 sounds)
- [Zombie](#zombie) (21 sounds)
- [Meta](#meta) (12 sounds)
- [UI](#ui) (9 sounds)

## Music

| Sound | FMOD Event | Source |
|-------|------------|--------|
| `AmbientMusic_BrassAmbient` | AmbientMusic/BrassAmbient | music |
| `AmbientMusic_CreepyAmbient` | AmbientMusic/CreepyAmbient | music |
| `AmbientMusic_IntenseAmbient` | AmbientMusic/IntenseAmbient | music |
| `AmbientMusic_PercussiveAmbient` | AmbientMusic/PercussiveAmbient | music |
| `AmbientMusic_RhythmicAmbient` | AmbientMusic/RhythmicAmbient | music |
| `AmbientMusic_VoiceAmbient` | AmbientMusic/VoiceAmbient | music |
| `AmbientMusic_ZombieAmbient` | AmbientMusic/ZombieAmbient | music |
| `MusicCombined` | Music/Main | music |
| `NewMusic_32` | NewMusic/32 | music |
| `NewMusic_33` | NewMusic/33 | music |
| `NewMusic_34` | NewMusic/34 | music |
| `NewMusic_35` | NewMusic/35 | music |
| `NewMusic_36` | NewMusic/36 | music |
| `NewMusic_Alone` | NewMusic/Alone | music |
| `NewMusic_Ambient` | NewMusic/Ambient | music |
| `NewMusic_AmbientGuitar` | NewMusic/Ambient Guitar | music |
| `NewMusic_AmbientLow` | NewMusic/Ambient Low | music |
| `NewMusic_AmbientPiano` | NewMusic/NoGoingBack | music |
| `NewMusic_AmbientRaider` | NewMusic/Ambient Raider | music |
| `NewMusic_Barricading` | NewMusic/Barricading | music |
| `NewMusic_CalmBeforeTheStorm` | NewMusic/CalmBeforeTheStorm | music |
| `NewMusic_Chase` | NewMusic/Chase | music |
| `NewMusic_Death` | NewMusic/Death | music |
| `NewMusic_DesperateEscape` | NewMusic/Desperate Escape | music |
| `NewMusic_EchoesFromBefore` | NewMusic/EchoesFromBefore | music |
| `NewMusic_Everythings_Gone` | NewMusic/Everythings_Gone | music |
| `NewMusic_FightOrFlight` | NewMusic/Fight or Flight | music |
| `NewMusic_FinallyCalm` | NewMusic/Finally_Calm | music |
| `NewMusic_GearUp` | NewMusic/Gear_Up | music |
| `NewMusic_GetReady` | NewMusic/GetReady | music |
| `NewMusic_GoItAlone` | NewMusic/GoItAlone | music |
| `NewMusic_HoldingOutHope` | NewMusic/HoldingOutHope | music |
| `NewMusic_Introduction` | NewMusic/Introduction | music |
| `NewMusic_KeepMoving` | NewMusic/KeepMoving | music |
| `NewMusic_LookingAround` | NewMusic/LookingAround | music |
| `NewMusic_MainTheme` | NewMusic/Main Theme | music |
| `NewMusic_MaybeNot` | NewMusic/Maybe Not | music |
| `NewMusic_MaybeWeCanWinThis` | NewMusic/Maybe We Can Win This | music |
| `NewMusic_MoreAreComing` | NewMusic/MoreAreComing | music |
| `NewMusic_Mourning` | NewMusic/Mourning | music |
| `NewMusic_NoTime` | NewMusic/NoTime | music |
| `NewMusic_OnlyOneWay` | NewMusic/OnlyOneWay | music |
| `NewMusic_Overrun` | NewMusic/Overrun | music |
| `NewMusic_PassingTime` | NewMusic/PassingTime | music |
| `NewMusic_PatchUp` | NewMusic/PatchUp | music |
| `NewMusic_PressOn` | NewMusic/PressOn | music |
| `NewMusic_Rest` | NewMusic/Rest | music |
| `NewMusic_Run` | NewMusic/Run | music |
| `NewMusic_SayingGoodbye` | NewMusic/Saying Goodbye | music |
| `NewMusic_SlowSad` | NewMusic/Slow Sad | music |
| `NewMusic_Sunrise` | NewMusic/Sunrise | music |
| `NewMusic_Sunset` | NewMusic/Sunset | music |
| `NewMusic_Surrounded` | NewMusic/Surrounded | music |
| `NewMusic_TakeStock` | NewMusic/TakeStock | music |
| `NewMusic_TheHorde` | NewMusic/The Horde | music |
| `NewMusic_TheInevitable` | NewMusic/The Inevitable | music |
| `NewMusic_ThePlan` | NewMusic/ThePlan | music |
| `NewMusic_TheZombieThreat` | NewMusic/The Zombie Threat | music |
| `NewMusic_TheyWereOnceHere` | NewMusic/They Were Once Here | music |
| `NewMusic_TheyreClose` | NewMusic/TheyreClose | music |
| `NewMusic_ThinkingOfThePast` | NewMusic/ThinkingOfThePast | music |
| `NewMusic_TouchAndGo` | NewMusic/TouchAndGo | music |
| `NewMusic_Travelling` | NewMusic/Travelling | music |
| `NewMusic_Tread_Carefully` | NewMusic/Tread_Carefully | music |
| `NewMusic_WWL_Solo` | NewMusic/WWL_Solo | music |
| `NewMusic_Waiting` | NewMusic/Waiting | music |
| `NewMusic_WhatWasLost` | NewMusic/What Was Lost | music |
| `NewMusic_WhatWasLostActive` | NewMusic/What Was Lost Active | music |
| `NewMusic_WhatWasLostActive2` | NewMusic/What Was Lost Active 2 | music |
| `NewMusic_WhereIsEveryone` | NewMusic/Where is Everyone | music |
| `NewMusic_WorkFast` | NewMusic/Work Fast | music |
| `NewMusic_Working` | NewMusic/Working | music |
| `OldMusic_PZ` | OldMusic/PZ | music |
| `OldMusic_alone` | OldMusic/alone | music |
| `OldMusic_ambient1` | OldMusic/ambient1 | music |
| `OldMusic_ambient2` | OldMusic/ambient2 | music |
| `OldMusic_barricading` | OldMusic/barricading | music |
| `OldMusic_chase` | OldMusic/chase | music |
| `OldMusic_desperate_escape` | OldMusic/desperate_escape | music |
| `OldMusic_fight_or_flight` | OldMusic/fight_or_flight | music |
| `OldMusic_guitar` | OldMusic/guitar | music |
| `OldMusic_long_ambient` | OldMusic/long_ambient | music |
| `OldMusic_low` | OldMusic/low | music |
| `OldMusic_maybe_not` | OldMusic/maybe_not | music |
| `OldMusic_maybe_we_can_win_this` | OldMusic/maybe_we_can_win_this | music |
| `OldMusic_piano` | OldMusic/piano | music |
| `OldMusic_preface` | OldMusic/preface | music |
| `OldMusic_raider` | OldMusic/raider | music |
| `OldMusic_run` | OldMusic/run | music |
| `OldMusic_saying_goodbye` | OldMusic/saying_goodbye | music |
| `OldMusic_the_horde` | OldMusic/the_horde | music |
| `OldMusic_the_inevitable` | OldMusic/the_inevitable | music |
| `OldMusic_the_zombie_threat` | OldMusic/the_zombie_threat | music |
| `OldMusic_theme2` | OldMusic/theme2 | music |
| `OldMusic_they_were_once_here` | OldMusic/they_were_once_here | music |
| `OldMusic_tunedeath` | OldMusic/tunedeath | music |
| `OldMusic_what_was_lost` | OldMusic/what_was_lost | music |
| `OldMusic_where_is_everyone` | OldMusic/where_is_everyone | music |
| `OldMusic_work_fast` | OldMusic/work_fast | music |
| `OldMusic_wwl_active` | OldMusic/wwl_active | music |
| *... and 1 more* | | |

## Player

| Sound | FMOD Event | Source |
|-------|------------|--------|
| `AttackShove` | Character/Combat/AttackShove | player |
| `AttackStomp` | Character/Combat/AttackStomp | player |
| `BareHandsHit` | Weapon/Melee/BareHands/Hit | player |
| `BoilingFood` | Character/Survival/Cooking/BoilingFood | item |
| `BuildFenceCairn` | ...r/Survival/Carpentry/BuildFence/Cairn | player |
| `BuildFenceGravelbag` | ...rvival/Carpentry/BuildFence/Gravelbag | player |
| `BuildFenceGravelbagFoley` | ...ival/Carpentry/BuildFence/GravelFoley | player |
| `BuildFenceSandbag` | ...Survival/Carpentry/BuildFence/Sandbag | player |
| `BuildFenceSandbagFoley` | ...val/Carpentry/BuildFence/SandbagFoley | player |
| `BuildMetalStructureLargePoleFence` | ...ry/BuildMetalStructure/LargePoleFence | player |
| `BuildMetalStructureLargeWiredFence` | ...y/BuildMetalStructure/LargeWiredFence | player |
| `BuildMetalStructureMedium` | .../Carpentry/BuildMetalStructure/Medium | player |
| `BuildMetalStructureSmall` | ...l/Carpentry/BuildMetalStructure/Small | player |
| `BuildMetalStructureSmallPoleFence` | ...ry/BuildMetalStructure/SmallPoleFence | player |
| `BuildMetalStructureSmallScrap` | ...pentry/BuildMetalStructure/SmallScrap | player |
| `BuildMetalStructureSmallWiredFence` | ...y/BuildMetalStructure/SmallWiredFence | player |
| `BuildMetalStructureWallFrame` | ...ry/BuildMetalStructure/LargePoleFence | player |
| `BuildWoodenStructureLarge` | .../Carpentry/BuildWoodenStructure/Large | player |
| `BuildWoodenStructureMedium` | ...Carpentry/BuildWoodenStructure/Medium | player |
| `BuildWoodenStructureSmall` | .../Carpentry/BuildWoodenStructure/Small | player |
| `BuildingGeneric` | Character/Survival/Carpentry/Building | player |
| `CleanBloodBleach` | Character/Foley/CleanBlood/Bleach | player |
| `CleanBloodScrub` | Character/Foley/CleanBlood/Scrub | player |
| `CleanBloodVehicle` | Character/Foley/CleanBlood/Vehicle | player |
| `ClimbOverFenceHighFail` | Character/Foley/Climb/FenceHigh/Fail | player |
| `ClimbOverFenceHighStart` | Character/Foley/Climb/FenceHigh/Start | player |
| `ClimbOverFenceHighStruggle` | Character/Foley/Climb/FenceHigh/Struggle | player |
| `ClimbOverFenceHighSuccess` | Character/Foley/Climb/FenceHigh/Success | player |
| `ClimbOverFenceLow` | Character/Foley/Climb/FenceLow | player |
| `ClimbThroughWindow` | Character/Foley/Climb/Window | player |
| `CloseBook` | Character/Survival/Literature/Book/Close | player |
| `CloseMagazine` | ...er/Survival/Literature/Magazine/Close | player |
| `CloseStoveDoor` | Object/Stove/Close | object |
| `DigFurrowWithHands` | ...ter/Survival/Farming/Furrow/Dig/Hands | item |
| `DigFurrowWithShovel` | ...er/Survival/Farming/Furrow/Dig/Shovel | item |
| `DigFurrowWithTrowel` | ...er/Survival/Farming/Furrow/Dig/Trowel | item |
| `DrinkingFromBottle` | Character/Survival/Drink/FromBottle | player |
| `DrinkingFromBottleGlass` | Character/Survival/Drink/FromBottleGlass | player |
| `DrinkingFromBottlePlastic` | ...cter/Survival/Drink/FromBottlePlastic | player |
| `DrinkingFromCan` | Character/Survival/Drink/FromCan | player |
| `DrinkingFromCarton` | Character/Survival/Drink/FromCarton | player |
| `DrinkingFromGeneric` | Character/Survival/Drink/FromGeneric | player |
| `DrinkingFromMug` | Character/Survival/Drink/FromMug | player |
| `DrinkingFromPool` | Character/Survival/Drink/FromPool | player |
| `DrinkingFromRiver` | Character/Survival/Drink/FromRiver | player |
| `DrinkingFromTap` | Character/Survival/Drink/FromTap | player |
| `DropSoilFromDirtBag` | ...urvival/Farming/Soil/Drop/FromDirtBag | item |
| `DropSoilFromGravelBag` | ...vival/Farming/Soil/Drop/FromGravelBag | item |
| `DropSoilFromSandBag` | ...urvival/Farming/Soil/Drop/FromSandBag | item |
| `DropSoilFromShovel` | ...Survival/Farming/Soil/Drop/FromShovel | item |
| `DropSoilFromTrowel` | ...Survival/Farming/Soil/Drop/FromTrowel | item |
| `Eating` | Character/Survival/Eat/Default | player |
| `EatingCrispy` | Character/Survival/Eat/Crispy | player |
| `EatingDeadAnimal` | Character/Survival/Eat/DeadAnimal | player |
| `EatingFruit` | Character/Survival/Eat/Fruit | player |
| `EatingMushy` | Character/Survival/Eat/Mushy | player |
| `EatingSoup` | Character/Survival/Eat/Soup | player |
| `EmptyPan` | Character/Survival/Farming/Crops/Harvest | item |
| `FallHeavy` | Character/Foley/Fall/Heavy | player |
| `FallLight` | Character/Foley/Fall/Light | player |
| `FemaleBeingEatenDeath` | Character/Death/FemaleEaten | player |
| `FryingFood` | Character/Survival/Cooking/FryingFood | item |
| `GainExperienceLevel` | Game/LevelUp | player |
| `HarvestCrops` | Character/Survival/Farming/Crops/Harvest | item |
| `HeartBeat` | Character/Foley/Heartbeat | player |
| `HumanFootstepsCombined` | Character/Foley/Footsteps | player |
| `LandHeavy` | Character/Foley/Land/Heavy | player |
| `LandLight` | Character/Foley/Land/Light | player |
| `LogAddToStack` | ...er/Survival/Carpentry/Logs/AddToStack | item |
| `LogRemoveFromStack` | ...rvival/Carpentry/Logs/RemoveFromStack | item |
| `MakePlaster` | Character/Survival/Carpentry/MakePlaster | player |
| `MaleBeingEatenDeath` | Character/Death/MaleEaten | player |
| `MapAddNote` | Character/Survival/Map/AddNote | item |
| `MapAddSymbol` | Character/Survival/Map/AddSymbol | item |
| `MapClose` | Character/Survival/Map/Close | item |
| `MapOpen` | Character/Survival/Map/Open | item |
| `MapRemoveMarking` | Character/Survival/Map/RemoveMarking | item |
| `OpenBook` | Character/Survival/Literature/Book/Open | player |
| `OpenCannedFood` | ...acter/Survival/Cooking/OpenCannedFood | player |
| `OpenMagazine` | ...ter/Survival/Literature/Magazine/Open | player |
| `OpenSeedPacket` | ...acter/Survival/Farming/Seed/OpenPaket | item |
| `OpenStoveDoor` | Object/Stove/Open | object |
| `PageFlipBook` | ...ter/Survival/Literature/Book/PageFlip | player |
| `PageFlipMagazine` | ...Survival/Literature/Magazine/PageFlip | player |
| `Painting` | Character/Survival/Carpentry/Painting | player |
| `Plastering` | Character/Survival/Carpentry/Plastering | player |
| `PlayerDied` | Game/GameOver | player |
| `RepairWithWrench` | ...r/Survival/Mechanics/RepairWithWrench | player |
| `Smoke` | Character/Foley/Smoke | player |
| `SowSeeds` | Character/Survival/Farming/Seed/Sow | item |
| `Swallowing` | Character/Foley/Swallow | player |
| `TripOverObstacle` | Character/Foley/Trip | player |
| `UseLighter` | Character/Survival/Use/Lighter | item |
| `UseMatch` | Character/Survival/Use/Match | item |
| `WashClothing` | Character/Survival/Hygiene/WashClothing | player |
| `WashYourself` | Character/Survival/Hygiene/WashYourself | player |
| `WaterCrops` | Character/Survival/Farming/Crops/Water | item |
| `ZombieRipClothing` | Character/Combat/RipCloth | player |

## Object

| Sound | FMOD Event | Source |
|-------|------------|--------|
| `BreakDoor` | Object/Door/Break | object |
| `BreakLockOnWindow` | Object/Window/BreakLock | object |
| `CarBatteryChargerRunning` | Object/CarBatteryCharger/Running | object |
| `CharcoalBarbecueRunning` | Object/CharcoalBarbecue/Running | object |
| `CloseWindow` | Object/Window/Close | object |
| `ClothingDryerFinished` | Object/ClothingDryer/Finished | object |
| `ClothingDryerRunning` | Object/ClothingDryer/Running | object |
| `ClothingWasherFinished` | Object/ClothingWasher/Finished | object |
| `ClothingWasherRunning` | Object/ClothingWasher/Running | object |
| `CurtainLongClose` | Object/Curtain/Close | object |
| `CurtainLongOpen` | Object/Curtain/Open | object |
| `CurtainShadeClose` | Object/Curtain/Close | object |
| `CurtainShadeOpen` | Object/Curtain/Open | object |
| `CurtainSheetAdd` | Object/Curtain/Add | object |
| `CurtainSheetClose` | Object/Curtain/Close | object |
| `CurtainSheetOpen` | Object/Curtain/Open | object |
| `CurtainSheetRemove` | Object/Curtain/Remove | object |
| `CurtainShortClose` | Object/Curtain/Close | object |
| `CurtainShortOpen` | Object/Curtain/Open | object |
| `DoorIsBlocked` | Object/Door/IsBlocked | object |
| `DoorIsLocked` | Object/Door/IsLocked | object |
| `GarageDoorBlocked` | Object/GarageDoor/IsBlocked | object |
| `GarageDoorBreak` | Object/GarageDoor/Break | object |
| `GarageDoorClose` | Object/GarageDoor/Close | object |
| `GarageDoorLock` | Object/GarageDoor/Lock | object |
| `GarageDoorLocked` | Object/GarageDoor/IsLocked | object |
| `GarageDoorOpen` | Object/GarageDoor/Open | object |
| `GarageDoorUnlock` | Object/GarageDoor/Unlock | object |
| `LockDoor` | Object/Door/Lock | object |
| `MetalDoorBlocked` | Object/MetalDoor/IsBlocked | object |
| `MetalDoorBreak` | Object/MetalDoor/Break | object |
| `MetalDoorClose` | Object/MetalDoor/Close | object |
| `MetalDoorLock` | Object/MetalDoor/Lock | object |
| `MetalDoorLocked` | Object/MetalDoor/IsLocked | object |
| `MetalDoorOpen` | Object/MetalDoor/Open | object |
| `MetalDoorUnlock` | Object/MetalDoor/Unlock | object |
| `MetalGateBlocked` | Object/MetalGate/IsBlocked | object |
| `MetalGateBreak` | Object/MetalGate/Break | object |
| `MetalGateClose` | Object/MetalGate/Close | object |
| `MetalGateLock` | Object/MetalGate/Lock | object |
| `MetalGateLocked` | Object/MetalGate/IsLocked | object |
| `MetalGateOpen` | Object/MetalGate/Open | object |
| `MetalGateUnlock` | Object/MetalGate/Unlock | object |
| `MicrowaveCookingMetal` | Object/Microwave/RunningMetal | object |
| `MicrowaveRunning` | Object/Microwave/Running | object |
| `MicrowaveTimerExpired` | Object/Microwave/Finished | object |
| `OpenWindow` | Object/Window/Open | object |
| `PrisonMetalDoorBlocked` | Object/PrisonMetalDoor/IsBlocked | object |
| `PrisonMetalDoorBreak` | Object/PrisonMetalDoor/Break | object |
| `PrisonMetalDoorClose` | Object/PrisonMetalDoor/Close | object |
| `PrisonMetalDoorLock` | Object/PrisonMetalDoor/Lock | object |
| `PrisonMetalDoorLocked` | Object/PrisonMetalDoor/IsLocked | object |
| `PrisonMetalDoorOpen` | Object/PrisonMetalDoor/Open | object |
| `PrisonMetalDoorUnlock` | Object/PrisonMetalDoor/Unlock | object |
| `PropaneBarbecueRunning` | Object/PropaneBarbecue/Running | object |
| `SlidingGlassDoorBlocked` | Object/SlidingGlassDoor/IsBlocked | object |
| `SlidingGlassDoorBreak` | Object/SlidingGlassDoor/Break | object |
| `SlidingGlassDoorClose` | Object/SlidingGlassDoor/Close | object |
| `SlidingGlassDoorLock` | Object/SlidingGlassDoor/Lock | object |
| `SlidingGlassDoorLocked` | Object/SlidingGlassDoor/IsLocked | object |
| `SlidingGlassDoorOpen` | Object/SlidingGlassDoor/Open | object |
| `SlidingGlassDoorUnlock` | Object/SlidingGlassDoor/Unlock | object |
| `SmashWindow` | Object/Window/Smash | object |
| `StoveRunning` | Object/Stove/Running | object |
| `StoveTimer` | Object/Stove/Timer | object |
| `StoveTimerExpired` | Object/Stove/Finished | object |
| `ToggleStove` | Object/Stove/Toggle | object |
| `UnlockDoor` | Object/Door/Unlock | object |
| `WindowIsLocked` | Object/Window/Locked | object |
| `WoodDoorBlocked` | Object/WoodDoor/IsBlocked | object |
| `WoodDoorBreak` | Object/WoodDoor/Break | object |
| `WoodDoorClose` | Object/WoodDoor/Close | object |
| `WoodDoorCreak` | Object/WoodDoor/Creak | object |
| `WoodDoorLock` | Object/WoodDoor/Lock | object |
| `WoodDoorLocked` | Object/WoodDoor/IsLocked | object |
| `WoodDoorOpen` | Object/WoodDoor/Open | object |
| `WoodDoorUnlock` | Object/WoodDoor/Unlock | object |
| `WoodGateBlocked` | Object/WoodGate/IsBlocked | object |
| `WoodGateBreak` | Object/WoodGate/Break | object |
| `WoodGateClose` | Object/WoodGate/Close | object |
| `WoodGateLock` | Object/WoodGate/Lock | object |
| `WoodGateLocked` | Object/WoodGate/IsLocked | object |
| `WoodGateOpen` | Object/WoodGate/Open | object |
| `WoodGateUnlock` | Object/WoodGate/Unlock | object |
| `WoodShackDoorBlocked` | Object/WoodShackDoor/IsBlocked | object |
| `WoodShackDoorBreak` | Object/WoodShackDoor/Break | object |
| `WoodShackDoorClose` | Object/WoodShackDoor/Close | object |
| `WoodShackDoorCreak` | Object/WoodShackDoor/Creak | object |
| `WoodShackDoorLock` | Object/WoodShackDoor/Lock | object |
| `WoodShackDoorLocked` | Object/WoodShackDoor/IsLocked | object |
| `WoodShackDoorOpen` | Object/WoodShackDoor/Open | object |
| `WoodShackDoorUnlock` | Object/WoodShackDoor/Unlock | object |

## World

| Sound | FMOD Event | Source |
|-------|------------|--------|
| `ArcadeMachineAmbiance` | World/Object/AraceMachine | world |
| `CatchFish` | Character/Survival/Fishing/CatchFish | world |
| `CatchTrashWithRod` | Character/Survival/Fishing/CatchTrash | world |
| `CheckFishingNet` | ...cter/Survival/Fishing/CheckFishingNet | world |
| `ClockAmbiance` | World/Object/Clock | world |
| `ControlStationAmbiance` | World/Object/ControlStation | world |
| `CorpseFlies` | Meta/Flies | world |
| `FactoryMachineAmbiance` | World/Object/FactoryMachine | world |
| `FountainBigAmbiance` | World/Object/FountainBig | world |
| `FountainSmallAmbiance` | World/Object/FountainSmall | world |
| `GasPumpAmbiance` | World/Object/GasPump | world |
| `HotdogMachineAmbiance` | World/Object/HotdogMachine | world |
| `HouseAlarm` | Meta/HouseAlarm | world |
| `JukeboxAmbiance` | World/Object/Jukebox | world |
| `LightBulbAmbiance` | World/Object/LightBulb | world |
| `LureHitWater` | Character/Survival/Fishing/LureHitWater | world |
| `NeonLightAmbiance` | World/Object/NeonLight | world |
| `NeonSignAmbiance` | World/Object/NeonSign | world |
| `PayPhoneAmbiance` | World/Object/PayPhone | world |
| `PlaceFishingNet` | ...cter/Survival/Fishing/CheckFishingNet | world |
| `RadiatorAmbiance` | World/Object/Radiator | world |
| `RemoveFishingNet` | ...cter/Survival/Fishing/CheckFishingNet | world |
| `RumbleThunder` | World/Weather/Thunder | world |
| `StreetLightAmbiance` | World/Object/StreetLight | world |
| `StrikeWithFishingSpear` | Character/Survival/Fishing/SpearStrike | world |
| `TentAmbiance` | World/Object/Tent | world |
| `Thunder` | World/Weather/Thunder | world |
| `TreeAmbiance` | World/Object/Tree | world |
| `VehicleAmbiance` | World/Object/Vehicle | world |
| `WorldAmbiance` | World/Ambiance | world |
| `WorldEventElectricityShutdown` | World/Event/ElectricityShutdown | world |

## Item

| Sound | FMOD Event | Source |
|-------|------------|--------|
| `AddItemInBeverage` | ...r/Survival/Crafting/AddItemInBeverage | item |
| `AddItemInRecipe` | ...cter/Survival/Cooking/AddItemInRecipe | item |
| `AlarmClockRingingLoop` | Character/Survival/AlarmClockRinging | item |
| `BloodSplatter` | Character/Combat/BloodSplatter | item |
| `BlowTorch` | Character/Survival/MetalWorking/Welding | item |
| `BreakFishingLine` | Character/Survival/Fishing/BreakLine | item |
| `BreakGlassItem` | ...ter/Survival/Carpentry/BreakGlassItem | item |
| `BreakMetalItem` | ...ter/Survival/Carpentry/BreakMetalItem | item |
| `BreakWoodItem` | ...cter/Survival/Carpentry/BreakWoodItem | item |
| `BulletHitBody` | Character/Combat/BulletHitBody | item |
| `CastFishingLine` | Character/Survival/Fishing/CastLine | item |
| `CloseBag` | Character/Foley/Bag/Close | item |
| `ClothesRipping` | Character/Survival/Tailoring/RipCloth | item |
| `Dismantle` | Character/Survival/Electrical/Dismantle | item |
| `FixWithTape` | Character/Survival/FixItemWithTape | item |
| `FixingItemFailed` | Character/Survival/FixItemWithTapeFail | item |
| `Hammering` | Character/Survival/Carpentry/Hammering | item |
| `LightbulbBurnedOut` | Object/Light/BulbBurnOut | item |
| `OpenBag` | Character/Foley/Bag/Open | item |
| `PutItemInBag` | Character/Foley/Bag/StoreItem | item |
| `Sawing` | Character/Survival/Carpentry/Sawing | item |
| `Screwdriver` | Character/Survival/Carpentry/Screwing | item |
| `Shoveling` | Character/Survival/Farming/Shovel | item |
| `SliceBread` | Character/Survival/Cooking/SliceBread | item |
| `SliceMeat` | Character/Survival/Cooking/SliceMeat | item |
| `WatchAlarmLoop` | Character/Survival/AlarmWatchRinging | item |

## Zombie

| Sound | FMOD Event | Source |
|-------|------------|--------|
| `BodyHitGround` | Character/Foley/BodyHitGround | zombie |
| `BurningFlesh` | Character/Combat/BurningFlesh | zombie |
| `FemaleZombieCombined` | Zombie/Voice/FemaleA | zombie |
| `HeadSmash` | Zombie/HeadSmash | zombie |
| `HeadStab` | Zombie/HeadStab | zombie |
| `MaleZombieCombined` | Zombie/Voice/MaleA | zombie |
| `TutorialZombie` | - | zombie |
| `ZombieBite` | Zombie/Bite | zombie |
| `ZombieCrawlLungeHit` | Zombie/Scratch | zombie |
| `ZombieCrawlLungeSwing` | Weapon/Melee/BluntShort/Hammer/Swing | zombie |
| `ZombieFootstepsCombined` | Zombie/Footsteps | zombie |
| `ZombieScratch` | Zombie/Scratch | zombie |
| `ZombieSurprisedPlayer` | Game/ZombieSurprisedPlayer | zombie |
| `ZombieThumpBarbedFence` | Zombie/Thump/BarbedFence | zombie |
| `ZombieThumpGarageDoor` | Zombie/Thump/GarageDoor | zombie |
| `ZombieThumpGeneric` | Zombie/Thump/Generic | zombie |
| `ZombieThumpMetal` | Zombie/Thump/Metal | zombie |
| `ZombieThumpVehicle` | Zombie/Thump/Vehicle | zombie |
| `ZombieThumpVehicleWindow` | Zombie/Thump/VehicleWindow | zombie |
| `ZombieThumpWindow` | Zombie/Thump/Window | zombie |
| `ZombieTrip` | Zombie/Trip | zombie |

## Meta

| Sound | FMOD Event | Source |
|-------|------------|--------|
| `ChatDrawCard` | Meta/DrawCard | meta |
| `ChatRollDice` | Meta/RollDice | meta |
| `Helicopter` | Meta/Helicopter | meta |
| `MetaAssaultRifle1` | Meta/AssaultRifle | meta |
| `MetaDogBark` | Meta/Dog | meta |
| `MetaOwl` | Meta/Owl | meta |
| `MetaPistol1` | Meta/Pistol | meta |
| `MetaPistol2` | Meta/Pistol | meta |
| `MetaPistol3` | Meta/Pistol | meta |
| `MetaScream` | Meta/Scream | meta |
| `MetaShotgun1` | Meta/Shotgun | meta |
| `MetaWolfHowl` | Meta/Wolf | meta |

## UI

| Sound | FMOD Event | Source |
|-------|------------|--------|
| `UIActivateButton` | UI/Click | ui |
| `UIActivateMainMenuItem` | UI/Click | ui |
| `UIActivatePlayButton` | UI/ClickPlay | ui |
| `UIActivateTab` | UI/Click | ui |
| `UIClickToStart` | UI/ClickToStart | ui |
| `UIHighlightMainMenuItem` | UI/Highlight | ui |
| `UISelectListItem` | UI/Click | ui |
| `UIToggleComboBox` | UI/Click | ui |
| `UIToggleTickBox` | UI/Click | ui |

---

## Using Sounds in Code

To play a sound in Lua:

```lua
-- Play a 2D sound
getSoundManager():PlaySound("OpenBag", false, 1.0)

-- Play a 3D sound at position
getSoundManager():PlayWorldSoundImpl("ZombieThumpGeneric", nil, x, y, z, 1.0, 60, 1.0, true)
```

## Source

Definitions from `media/scripts/sounds_*.txt`
