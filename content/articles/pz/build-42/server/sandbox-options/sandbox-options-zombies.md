---
slug: sandbox-options-zombies
title: 'Sandbox options: zombies'
game: pz
version: build-42
section: server
category: sandbox-options
difficulty: beginner
tags:
  - server
  - sandbox-options
  - sandbox
  - generated
excerpt: 'How many zombies, how they spread and respawn, and the Zombie Lore: speed, strength, infection, senses and behaviour. Every option with its default, the presets that change it, and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-loot
---
# Sandbox options: zombies

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

How many zombies, how they spread and respawn, and the Zombie Lore: speed, strength, infection, senses and behaviour.

## Zombie

### Zombies

- **On the settings screen:** "Zombie Count".
- **In the file:** `Zombies = 4`, read by Lua as `SandboxVars.Zombies`. Takes a choice from 1 to 6.
- **Choices:** 1 "Insane", 2 "Very High", 3 "High", 4 "Normal", 5 "Low", 6 "None".
- **Default:** `4` ("Normal"). Other presets: Extinction `3` ("High"), Rising `5` ("Low"), Six Months Later `1` ("Insane").
- **The game's description:** "Changing this also sets the "Population Multiplier" in Advanced Zombie Options."
- **Read in:** `zombie.core.stash.StashSystem#doSpecificBuildingProperties` (lines 393, 395, 397, 399); `zombie.inventory.ItemPickerJava#getBaseChanceMultiplier` (line 2078); `zombie.iso.IsoMetaChunk#getZombieIntensity` (lines 70, 72, 74, 76, 78, 95, 97, 99, 101); `zombie.iso.IsoWorld#getZombiesDisabled` (line 3272); `zombie.Lua.LuaManager$GlobalObject#addZombiesInBuilding` (lines 10740, 10742, 10744, 10746); `zombie.MapCollisionData#init` (line 118); `zombie.randomizedWorld.randomizedBuilding.RandomizedBuildingBase#addZombies` (lines 374, 376, 378, 380); `zombie.SandboxOptions#updateFromLua` (line 312); `zombie.VirtualZombieManager#getZombieCountForRoom` (lines 788, 790, 792, 794, 820, 822, 824, 826, 861, 863, 865, 867).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (24 files, 32 places); `media/lua/client/LastStand/` (4 files, 4 places).

### Distribution

- **On the settings screen:** "Zombie Distribution".
- **In the file:** `Distribution = 1`, read by Lua as `SandboxVars.Distribution`. Takes a choice from 1 to 2.
- **Choices:** 1 "Urban Focused", 2 "Uniform".
- **Default:** `1` ("Urban Focused"). Every preset keeps the default.
- **The game's description:** "How zombies are distributed across the map."
- **Read in:** `zombie.iso.IsoMetaChunk#getZombieIntensity` (line 65); `zombie.MapCollisionData#init` (line 117).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### ZombieVoronoiNoise

- **On the settings screen:** "Voronoi Noise".
- **In the file:** `ZombieVoronoiNoise = true`, read by Lua as `SandboxVars.ZombieVoronoiNoise`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "Controls whether some randomization is applied to zombie distribution."
- **Read in:** `zombie.iso.worldgen.zombie.ZombieVoronoi#evaluateCellCutoff` (line 100).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieRespawn

- **On the settings screen:** "Zombie Respawn".
- **In the file:** `ZombieRespawn = 4`, read by Lua as `SandboxVars.ZombieRespawn`. Takes a choice from 1 to 4.
- **Choices:** 1 "High", 2 "Normal", 3 "Low", 4 "None".
- **Default:** `4` ("None") (the Apocalypse preset's value; the Java declaration says `2` ("Normal")). Other presets: Extinction `2` ("Normal"), Rising `3` ("Low").
- **The game's description:** "How frequently new zombies are added to the world."
- **No read found.** We found no read of the value. The name appears as text in: `media/lua/client/ISUI/AdminPanel/ISServerSandboxOptionsUI.lua` in `ISServerSandboxOptionsUI:onComboBoxSelected` (line 683); `media/lua/client/OptionScreens/SandboxOptions.lua` in `SandboxOptionsScreen:onComboBoxSelected` (line 762); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `Page3:onComboBoxSelected` (line 2740).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).
- **What the code does with it:** No game code reads it. Choosing a value on the server settings screen fills in three advanced values: `ZombieConfig.RespawnHours` 16, 72, 216 or 0, `ZombieConfig.RespawnUnseenHours` 6, 16, 48 or 0, and `ZombieConfig.RespawnMultiplier` 0.5, 0.1, 0.05 or 0 (for High, Normal, Low and None). Those three are what the game reads.

### ZombieMigrate

- **On the settings screen:** "Zombie Migration".
- **In the file:** `ZombieMigrate = true`, read by Lua as `SandboxVars.ZombieMigrate`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "Zombie allowed to migrate to empty cells."
- **No read found.** We found no read of the value. The name appears as text in: `media/lua/client/ISUI/AdminPanel/ISServerSandboxOptionsUI.lua` in `ISServerSandboxOptionsUI:onTickBoxSelected` (line 668); `media/lua/client/OptionScreens/SandboxOptions.lua` in `SandboxOptionsScreen:onTickBoxSelected` (line 747); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `Page3:onTickBoxSelected` (line 2752).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).
- **What the code does with it:** No game code reads it. Ticking it on the server settings screen sets `ZombieConfig.RedistributeHours` to 12.0, unticking it sets 0.0; the game reads that value.

### ZombieLore.Speed

- **On the settings screen:** "Speed", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Speed = 4 }`, read by Lua as `SandboxVars.ZombieLore.Speed`. Takes a choice from 1 to 4.
- **Choices:** 1 "Sprinters", 2 "Fast Shamblers", 3 "Shamblers", 4 "Random".
- **Default:** `4` ("Random") (the Apocalypse preset's value; the Java declaration says `2` ("Fast Shamblers")). Other presets: Rising `3` ("Shamblers"), Six Months Later `2` ("Fast Shamblers").
- **The game's description:** "How fast zombies move."
- **Read in:** `zombie.characters.IsoZombie#getZombieWalkTowardSpeed` (line 3652); `zombie.characters.IsoZombie#getZombieLungeSpeed` (line 3663); `zombie.characters.IsoZombie#DoZombieSpeeds` (lines 3945, 3951); `zombie.characters.IsoZombie#doZombieSpeedInternal` (lines 5550, 5554, 5555); `zombie.characters.IsoZombie#determineZombieSpeed` (line 5648); `zombie.gameStates.GameLoadingState#renderProgressIndicator` (line 921); `zombie.pathfind.PathFindBehavior2#update` (line 935); `zombie.pathfind.PathFindBehavior2#moveToPoint` (line 1036); `zombie.pathfind.PathFindBehavior2#moveToDir` (line 1066).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.SprinterPercentage

- **On the settings screen:** "Random Sprinter Amount", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { SprinterPercentage = 0 }`, read by Lua as `SandboxVars.ZombieLore.SprinterPercentage`. Takes a whole number from 0 to 100.
- **Default:** `0` (the Apocalypse preset's value; the Java declaration says `33`). Other presets: Extinction `6`.
- **The game's description:** "If Random Speed is enabled, this controls what percentage of zombies are Sprinters. Check the "Advanced" box below to use a custom percentage."
- **Read in:** `zombie.characters.IsoZombie#determineZombieSpeed` (line 5652).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.Strength

- **On the settings screen:** "Strength", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Strength = 2 }`, read by Lua as `SandboxVars.ZombieLore.Strength`. Takes a choice from 1 to 4.
- **Choices:** 1 "Superhuman", 2 "Normal", 3 "Weak", 4 "Random".
- **Default:** `2` ("Normal"). Other presets: Extinction `1` ("Superhuman"), Rising `3` ("Weak"), Six Months Later `3` ("Weak").
- **The game's description:** "The damage zombies inflict per attack."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#AddRandomDamageFromZombie` (lines 1277, 1281); `zombie.characters.IsoGameCharacter#testDefense` (lines 13509, 13513); `zombie.characters.IsoZombie#DoZombieStats` (lines 3863, 3867, 3871, 3875); `zombie.iso.objects.IsoDoor#Thump` (line 1209).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places); `media/lua/client/Tutorial/` (1 file, 1 place).

### ZombieLore.Toughness

- **On the settings screen:** "Toughness", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Toughness = 4 }`, read by Lua as `SandboxVars.ZombieLore.Toughness`. Takes a choice from 1 to 4.
- **Choices:** 1 "Tough", 2 "Normal", 3 "Fragile", 4 "Random".
- **Default:** `4` ("Random") (the Apocalypse preset's value; the Java declaration says `2` ("Normal")). Other presets: Extinction `1` ("Tough"), Rising `3` ("Fragile"), Six Months Later `2` ("Normal").
- **The game's description:** "The difficulty of killing a zombie."
- **Read in:** `zombie.characters.IsoPlayer#calculateCritChance` (lines 3928, 3932); `zombie.characters.IsoZombie#resetForReuse` (lines 4442, 4446, 4450, 4454); `zombie.iso.objects.IsoDeadBody#reanimate` (lines 2014, 2018, 2022); `zombie.VirtualZombieManager#createZombieOutsideWorld` (lines 348, 352, 356, 360).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.Transmission

- **On the settings screen:** "Transmission", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Transmission = 1 }`, read by Lua as `SandboxVars.ZombieLore.Transmission`. Takes a choice from 1 to 4.
- **Choices:** 1 "Blood and Saliva", 2 "Saliva Only", 3 "Everyone's Infected", 4 "None".
- **Default:** `1` ("Blood and Saliva"). Every preset keeps the default.
- **The game's description:** "How the Knox Virus spreads."
- **Read in:** `zombie.characters.BodyDamage.BodyPart#SetBitten` (lines 707, 722); `zombie.characters.BodyDamage.BodyPart#generateZombieInfection` (line 805); `zombie.characters.IsoGameCharacter#shouldBecomeZombieAfterDeath` (line 11377).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.Mortality

- **On the settings screen:** "Infection Mortality", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Mortality = 5 }`, read by Lua as `SandboxVars.ZombieLore.Mortality`. Takes a choice from 1 to 7.
- **Choices:** 1 "Instant", 2 "0-30 Seconds", 3 "0-1 Minutes", 4 "0-12 Hours", 5 "2-3 Days", 6 "1-2 Weeks", 7 "Never".
- **Default:** `5` ("2-3 Days"). Every preset keeps the default.
- **The game's description:** "How quickly the infection takes effect."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#pickMortalityDuration` (line 2092); `zombie.characters.BodyDamage.BodyDamage#Update` (lines 2169, 2366); `zombie.characters.BodyDamage.BodyPart#SetBitten` (lines 712, 738); `zombie.characters.BodyDamage.BodyPart#generateZombieInfection` (line 810).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.Reanimate

- **On the settings screen:** "Reanimate Time", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Reanimate = 3 }`, read by Lua as `SandboxVars.ZombieLore.Reanimate`. Takes a choice from 1 to 6.
- **Choices:** 1 "Instant", 2 "0-30 Seconds", 3 "0-1 Minutes", 4 "0-12 Hours", 5 "2-3 Days", 6 "1-2 Weeks".
- **Default:** `3` ("0-1 Minutes"). Every preset keeps the default.
- **The game's description:** "How quickly infected corpses rise as zombies."
- **Read in:** `zombie.iso.objects.IsoDeadBody#getReanimateDelay` (line 1864).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.Cognition

- **On the settings screen:** "Cognition", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Cognition = 3 }`, read by Lua as `SandboxVars.ZombieLore.Cognition`. Takes a choice from 1 to 4.
- **Choices:** 1 "Navigate and Use Doors", 2 "Navigate", 3 "Basic Navigation", 4 "Random".
- **Default:** `3` ("Basic Navigation"). Other presets: Extinction `4` ("Random"), Six Months Later `2` ("Navigate").
- **The game's description:** "Zombie intelligence."
- **Read in:** `zombie.characters.IsoZombie#DoZombieStats` (lines 3851, 3855).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.DoorOpeningPercentage

- **On the settings screen:** "Random Door Opening Amount", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { DoorOpeningPercentage = 0 }`, read by Lua as `SandboxVars.ZombieLore.DoorOpeningPercentage`. Takes a whole number from 0 to 100.
- **Default:** `0` (the Apocalypse preset's value; the Java declaration says `33`). Other presets: Extinction `10`.
- **Read in:** `zombie.characters.IsoZombie#DoZombieStats` (line 3856).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.CrawlUnderVehicle

- **On the settings screen:** "Crawl Under Vehicle", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { CrawlUnderVehicle = 5 }`, read by Lua as `SandboxVars.ZombieLore.CrawlUnderVehicle`. Takes a choice from 1 to 7.
- **Choices:** 1 "Crawlers Only", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often", 7 "Always".
- **Default:** `5` ("Often"). Other presets: Extinction `6` ("Very Often").
- **The game's description:** "How often zombies can crawl under parked vehicles."
- **Read in:** `zombie.characters.IsoZombie#initCanCrawlUnderVehicle` (line 4825).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.Memory

- **On the settings screen:** "Memory", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Memory = 2 }`, read by Lua as `SandboxVars.ZombieLore.Memory`. Takes a choice from 1 to 6.
- **Choices:** 1 "Long", 2 "Normal", 3 "Short", 4 "None", 5 "Random", 6 "Random between Normal and None".
- **Default:** `2` ("Normal"). Other presets: Extinction `1` ("Long"), Rising `3` ("Short").
- **The game's description:** "How long zombies remember a player after seeing or hearing them."
- **Read in:** `zombie.characters.IsoZombie#DoZombieStats` (line 3879); `zombie.characters.IsoZombie#getSandboxMemoryDuration` (line 5208).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.Sight

- **On the settings screen:** "Sight", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Sight = 5 }`, read by Lua as `SandboxVars.ZombieLore.Sight`. Takes a choice from 1 to 5.
- **Choices:** 1 "Eagle", 2 "Normal", 3 "Poor", 4 "Random", 5 "Random between Normal and Poor".
- **Default:** `5` ("Random between Normal and Poor") (the Apocalypse preset's value; the Java declaration says `2` ("Normal")). Other presets: Extinction `2` ("Normal"), Rising `2` ("Normal"), Six Months Later `2` ("Normal").
- **The game's description:** "Zombie vision radius."
- **Read in:** `zombie.characters.IsoZombie#DoZombieStats` (lines 3903, 3905, 3908); `zombie.characters.IsoZombie#getVisionRadiusAdjusted` (lines 5465, 5469).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.Hearing

- **On the settings screen:** "Hearing", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Hearing = 5 }`, read by Lua as `SandboxVars.ZombieLore.Hearing`. Takes a choice from 1 to 5.
- **Choices:** 1 "Pinpoint", 2 "Normal", 3 "Poor", 4 "Random", 5 "Random between Normal and Poor".
- **Default:** `5` ("Random between Normal and Poor") (the Apocalypse preset's value; the Java declaration says `2` ("Normal")). Other presets: Extinction `2` ("Normal"), Rising `3` ("Poor"), Six Months Later `2` ("Normal").
- **The game's description:** "Zombie hearing radius."
- **Read in:** `zombie.characters.IsoZombie#RespondToSound` (lines 1744, 1748); `zombie.characters.IsoZombie#DoZombieStats` (lines 3911, 3913, 3916); `zombie.popman.ZombiePopulationManager#addWorldSound` (line 501); `zombie.WorldSoundManager#addSound` (line 168); `zombie.WorldSoundManager#render` (line 471).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.SpottedLogic

- **On the settings screen:** "New Stealth System", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { SpottedLogic = true }`, read by Lua as `SandboxVars.ZombieLore.SpottedLogic`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "Activates the new advanced stealth mechanics, which allows you to hide from zombies behind cars, takes traits and weather into account, and much more."
- **Read in:** `zombie.characters.IsoZombie#spotted` (line 2857).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.ThumpNoChasing

- **On the settings screen:** "Environmental Attacks", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ThumpNoChasing = false }`, read by Lua as `SandboxVars.ZombieLore.ThumpNoChasing`. Takes true or false.
- **Default:** `false`. Other presets: Extinction `true`, Six Months Later `true`.
- **The game's description:** "If zombies that have not seen/heard player can attack doors and constructions while roaming."
- **Read in:** `zombie.characters.IsoZombie#collideWith` (line 1322); `zombie.characters.IsoZombie#tryThump` (line 3767).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places); `media/lua/client/Tutorial/` (1 file, 1 place).

### ZombieLore.ThumpOnConstruction

- **On the settings screen:** "Damage Construction", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ThumpOnConstruction = true }`, read by Lua as `SandboxVars.ZombieLore.ThumpOnConstruction`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If zombies can destroy player constructions and defenses."
- **Read in:** `zombie.characters.IsoZombie#collideWith` (line 1326); `zombie.iso.objects.IsoCompost#Thump` (line 268); `zombie.iso.objects.IsoThumpable#Thump` (line 1001).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.ActiveOnly

- **On the settings screen:** "Day/Night Zombie Speed Effect", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ActiveOnly = 1 }`, read by Lua as `SandboxVars.ZombieLore.ActiveOnly`. Takes a choice from 1 to 3.
- **Choices:** 1 "Both", 2 "Night", 3 "Day".
- **Default:** `1` ("Both"). Every preset keeps the default.
- **The game's description:** "Whether zombies are more "active" during the day or night. "Active" zombies will use the speed set in the "Speed" setting. "Inactive" zombies will be slower, and tend not to give chase."
- **Read in:** `zombie.GameTime#isZombieActivityPhase` (lines 1336, 1337, 1338).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.TriggerHouseAlarm

- **On the settings screen:** "Zombie House Alarm Triggering", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { TriggerHouseAlarm = true }`, read by Lua as `SandboxVars.ZombieLore.TriggerHouseAlarm`. Takes true or false.
- **Default:** `true` (the Apocalypse preset's value; the Java declaration says `false`). Other presets: Rising `false`, Six Months Later `false`.
- **The game's description:** "If zombies trigger house alarms when breaking through windows or doors."
- **Read in:** `zombie.iso.objects.IsoWindow#ToggleWindow` (line 759); `zombie.iso.objects.IsoWindow#damage` (lines 1126, 1142).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.ZombiesDragDown

- **On the settings screen:** "Drag Down", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ZombiesDragDown = true }`, read by Lua as `SandboxVars.ZombieLore.ZombiesDragDown`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If multiple attacking zombies can drag you down and kill you. Dependent on zombie strength."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#AddRandomDamageFromZombie` (line 1297).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.ZombiesCrawlersDragDown

- **On the settings screen:** "Crawlers Drag Down", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ZombiesCrawlersDragDown = false }`, read by Lua as `SandboxVars.ZombieLore.ZombiesCrawlersDragDown`. Takes true or false.
- **Default:** `false`. Other presets: Extinction `true`.
- **The game's description:** "If crawler zombies beside a player contribute to the chance of being dragged down and killed by a group of zombies."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#AddRandomDamageFromZombie` (line 1293).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.ZombiesFenceLunge

- **On the settings screen:** "Zombie Lunge", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ZombiesFenceLunge = true }`, read by Lua as `SandboxVars.ZombieLore.ZombiesFenceLunge`. Takes true or false.
- **Default:** `true`. Other presets: Rising `false`.
- **The game's description:** "If zombies have a chance to lunge at you after climbing over a fence or through a window if you're too close."
- **Read in:** `zombie.characters.IsoZombie#shouldDoFenceLunge` (line 5224).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.DisableFakeDead

- **On the settings screen:** "Fake Dead Zombie Reanimation", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { DisableFakeDead = 1 }`, read by Lua as `SandboxVars.ZombieLore.DisableFakeDead`. Takes a choice from 1 to 3.
- **Choices:** 1 "World Zombies", 2 "World and Combat Zombies", 3 "Never".
- **Default:** `1` ("World Zombies"). Other presets: Extinction `2` ("World and Combat Zombies"), Rising `3` ("Never").
- **The game's description:** "Whether some dead-looking zombies will reanimate and attack the player."
- **Read in:** `zombie.characters.IsoZombie#isFakeDead` (line 3961); `zombie.iso.objects.IsoDeadBody#isFakeDead` (line 554); `zombie.iso.objects.IsoDeadBody#setFakeDead` (line 566); `zombie.iso.objects.IsoDeadBody#updateRotting` (line 1710); `zombie.iso.objects.IsoDeadBody#updateFakeDead` (line 1793).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places); `media/lua/client/Tutorial/` (1 file, 1 place).

### ZombieLore.ZombiesArmorFactor

- **On the settings screen:** "Zombie Armor Factor", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ZombiesArmorFactor = 2.0 }`, read by Lua as `SandboxVars.ZombieLore.ZombiesArmorFactor`. Takes a number from 0.0 to 100.0.
- **Default:** `2.0`. Other presets: Rising `1.0`.
- **The game's description:** "Serves as a multiplier when determining the effectiveness of armor worn by zombies."
- **Read in:** `zombie.CombatManager#calculateTotalDefense` (line 3899).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.ZombiesMaxDefense

- **On the settings screen:** "Maximum Zombie Armor Defense", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ZombiesMaxDefense = 85 }`, read by Lua as `SandboxVars.ZombieLore.ZombiesMaxDefense`. Takes a whole number from 0 to 100.
- **Default:** `85`. Other presets: Extinction `90`, Rising `60`.
- **The game's description:** "The maximum defense percentage that any worn protective garments can provide to a zombie."
- **Read in:** `zombie.CombatManager#calculateTotalDefense` (line 3900).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.ChanceOfAttachedWeapon

- **On the settings screen:** "Chance Of Attached Weapon", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ChanceOfAttachedWeapon = 6 }`, read by Lua as `SandboxVars.ZombieLore.ChanceOfAttachedWeapon`. Takes a whole number from 0 to 100.
- **Default:** `6`. Every preset keeps the default.
- **The game's description:** "Percentage chance of having a random attached weapon."
- **Read in:** `zombie.characters.AttachedItems.AttachedWeaponDefinitions#init` (line 219).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.ZombiesFallDamage

- **On the settings screen:** "Zombie Fall Damage Multiplier", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { ZombiesFallDamage = 1.0 }`, read by Lua as `SandboxVars.ZombieLore.ZombiesFallDamage`. Takes a number from 0.0 to 100.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "How much damage zombies take when falling from height."
- **Read in:** `zombie.characters.IsoZombie#handleLandingImpact` (line 3134).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.PlayerSpawnZombieRemoval

- **On the settings screen:** "Player Spawn Area", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { PlayerSpawnZombieRemoval = 1 }`, read by Lua as `SandboxVars.ZombieLore.PlayerSpawnZombieRemoval`. Takes a choice from 1 to 4.
- **Choices:** 1 "Inside the building and around it", 2 "Inside the building", 3 "Inside the room", 4 "Zombies can spawn anywhere".
- **Default:** `1` ("Inside the building and around it"). Other presets: Extinction `2` ("Inside the building").
- **The game's description:** "Zombies will not spawn where players spawn."
- **Read in:** `zombie.iso.IsoWorld#init` (lines 2277, 2279); `zombie.popman.PlayerSpawns$PlayerSpawn#allowZombie` (line 73).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.PopulationMultiplier

- **On the settings screen:** "Population Multiplier", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { PopulationMultiplier = 0.65 }`, read by Lua as `SandboxVars.ZombieConfig.PopulationMultiplier`. Takes a number from 0.0 to 4.0.
- **Default:** `0.65`. Other presets: Extinction `1.2`, Rising `0.15`, Six Months Later `1.6`.
- **Read in:** `zombie.inventory.ItemPickerJava#getBaseChanceMultiplier` (line 2078); `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 333).
- **Set (not read) in:** `media/lua/client/LastStand/` (4 files, 4 places).

### ZombieConfig.PopulationStartMultiplier

- **On the settings screen:** "Population Start Multiplier", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { PopulationStartMultiplier = 1.0 }`, read by Lua as `SandboxVars.ZombieConfig.PopulationStartMultiplier`. Takes a number from 0.0 to 4.0.
- **Default:** `1.0`. Other presets: Extinction `1.5`, Six Months Later `2.0`.
- **Read in:** `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 334).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.PopulationPeakMultiplier

- **On the settings screen:** "Population Peak Multiplier", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { PopulationPeakMultiplier = 1.5 }`, read by Lua as `SandboxVars.ZombieConfig.PopulationPeakMultiplier`. Takes a number from 0.0 to 4.0.
- **Default:** `1.5`. Other presets: Extinction `2.0`, Rising `1.0`, Six Months Later `1.0`.
- **Read in:** `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 335).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.PopulationPeakDay

- **On the settings screen:** "Population Peak Day", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { PopulationPeakDay = 28 }`, read by Lua as `SandboxVars.ZombieConfig.PopulationPeakDay`. Takes a whole number from 1 to 365.
- **Default:** `28`. Other presets: Outbreak `20`, Six Months Later `5`.
- **Read in:** `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 336).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RespawnHours

- **On the settings screen:** "Respawn Hours", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RespawnHours = 0.0 }`, read by Lua as `SandboxVars.ZombieConfig.RespawnHours`. Takes a number from 0.0 to 8760.0.
- **Default:** `0.0` (the Apocalypse preset's value; the Java declaration says `72.0`). Other presets: Extinction `72.0`, Rising `72.0`, Six Months Later `72.0`.
- **Read in:** `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 337).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RespawnUnseenHours

- **On the settings screen:** "Respawn Unseen Hours", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RespawnUnseenHours = 0.0 }`, read by Lua as `SandboxVars.ZombieConfig.RespawnUnseenHours`. Takes a number from 0.0 to 8760.0.
- **Default:** `0.0` (the Apocalypse preset's value; the Java declaration says `16.0`). Other presets: Extinction `16.0`, Rising `16.0`, Six Months Later `16.0`.
- **Read in:** `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 338).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RespawnMultiplier

- **On the settings screen:** "Respawn Multiplier", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RespawnMultiplier = 0.0 }`, read by Lua as `SandboxVars.ZombieConfig.RespawnMultiplier`. Takes a number from 0.0 to 1.0.
- **Default:** `0.0` (the Apocalypse preset's value; the Java declaration says `0.1`). Other presets: Extinction `0.1`, Rising `0.1`, Six Months Later `0.5`.
- **Read in:** `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 339).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RedistributeHours

- **On the settings screen:** "Redistribute Hours", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RedistributeHours = 12.0 }`, read by Lua as `SandboxVars.ZombieConfig.RedistributeHours`. Takes a number from 0.0 to 8760.0.
- **Default:** `12.0`. Other presets: Rising `18.0`.
- **Read in:** `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 340).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.FollowSoundDistance

- **On the settings screen:** "Follow Sound Distance", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { FollowSoundDistance = 100 }`, read by Lua as `SandboxVars.ZombieConfig.FollowSoundDistance`. Takes a whole number from 10 to 1000.
- **Default:** `100`. Other presets: Extinction `200`, Six Months Later `300`.
- **Read in:** `zombie.popman.ZombiePopulationManager#onConfigReloaded` (line 341).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RallyGroupSize

- **On the settings screen:** "Rally Group Size", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RallyGroupSize = 20 }`, read by Lua as `SandboxVars.ZombieConfig.RallyGroupSize`. Takes a whole number from 0 to 1000.
- **Default:** `20`. Other presets: Extinction `10`, Six Months Later `200`.
- **Read in:** `zombie.ai.ZombieGroupManager#preupdate` (line 49); `zombie.ai.ZombieGroupManager#shouldBeInGroup` (line 69); `zombie.ai.ZombieGroupManager#findNearestGroup` (line 195).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RallyGroupSizeVariance

- **On the settings screen:** "Rally Group Size Variance", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RallyGroupSizeVariance = 50 }`, read by Lua as `SandboxVars.ZombieConfig.RallyGroupSizeVariance`. Takes a whole number from 0 to 100.
- **Default:** `50`. Every preset keeps the default.
- **Read in:** `zombie.characters.ZombieGroup#<field initializer>` (line 20).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RallyTravelDistance

- **On the settings screen:** "Rally Travel Distance", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RallyTravelDistance = 20 }`, read by Lua as `SandboxVars.ZombieConfig.RallyTravelDistance`. Takes a whole number from 5 to 50.
- **Default:** `20`. Other presets: Rising `30`, Six Months Later `30`.
- **Read in:** `zombie.ai.ZombieGroupManager#findNearestGroup` (line 191); `zombie.characters.ZombieGroup#update` (line 69).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RallyGroupSeparation

- **On the settings screen:** "Rally Group Separation", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RallyGroupSeparation = 15 }`, read by Lua as `SandboxVars.ZombieConfig.RallyGroupSeparation`. Takes a whole number from 5 to 25.
- **Default:** `15`. Every preset keeps the default.
- **Read in:** `zombie.ai.ZombieGroupManager#update` (line 119).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.RallyGroupRadius

- **On the settings screen:** "Rally Group Radius", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { RallyGroupRadius = 3 }`, read by Lua as `SandboxVars.ZombieConfig.RallyGroupRadius`. Takes a whole number from 1 to 10.
- **Default:** `3`. Other presets: Rising `4`, Six Months Later `10`.
- **Read in:** `zombie.ai.ZombieGroupManager#update` (line 168).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieConfig.ZombiesCountBeforeDelete

- **On the settings screen:** "Zombie count before deletion", in the "Advanced zombie settings" group.
- **In the file:** `ZombieConfig = { ZombiesCountBeforeDelete = 300 }`, read by Lua as `SandboxVars.ZombieConfig.ZombiesCountBeforeDelete`. Takes a whole number from 0 to 5000.
- **Default:** `300`. Every preset keeps the default.
- **The game's description:** "How many zombies can occupy a certain area."
- **Read in:** `zombie.popman.ZombieCountOptimiser#prepareZombiesForDeletion` (line 27).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
