# Vehicle Distributions Documentation

**Location:** `media/lua/server/Vehicles/VehicleDistributions.lua`
**Purpose:** Define loot spawns in vehicle containers (gloveboxes, trunks, seats)

---

## Overview

Vehicle distributions use the same structure as container distributions but are applied to vehicle parts. Each vehicle type can have custom loot appropriate to its role (police cars have weapons, farmer trucks have seeds, etc.).

---

## Distribution Structure

```lua
VehicleDistributions.DistributionName = {
    rolls = 4,           -- Number of loot attempts
    items = {
        "ItemType", weight,   -- Item and spawn weight
    },
    junk = {             -- Secondary rolls (rare items)
        rolls = 1,
        items = { }
    }
}
```

### Vehicle Type Definition

```lua
VehicleDistributions.VehicleType = {
    TruckBed = VehicleDistributions.TrunkDistribution;
    TruckBedOpen = VehicleDistributions.TrunkDistribution;
    GloveBox = VehicleDistributions.GloveBoxDistribution;
    SeatRearLeft = VehicleDistributions.Seat;
    SeatRearRight = VehicleDistributions.Seat;
}
```

---

## Container Types

| Container | Location | Description |
|-----------|----------|-------------|
| `GloveBox` | Front passenger | Small storage, maps, personal items |
| `TruckBed` | Rear/trunk | Main cargo area |
| `TruckBedOpen` | Open truck bed | Pickup-style cargo |
| `TrailerTrunk` | Trailers | Trailer storage |
| `SeatRearLeft` | Back left seat | Passenger area |
| `SeatRearRight` | Back right seat | Passenger area |
| `DriverSeat` | Driver position | Driver area (rarely used) |

---

## Base Distributions

### GloveBox
Standard glove compartment items found in most vehicles.

**Common Items:**
- Personal: Tissue, Comb, Mirror, Cologne, Perfume
- Office: Pen, Pencil, Notebook, Paperclip
- Medical: Bandage, Bandaid, AlcoholWipes
- Other: Battery, Matches, Lighter, Cigarettes, Magazine

**Junk (Rare):**
- Maps: All regional maps (Louisville, Muldraugh, etc.)
- Weapons: Pistol (0.8), Revolver_Short (0.8)
- Electronics: Radio.WalkieTalkie2, Radio.CDplayer
- Misc: HuntingKnife, Wallet variants, Camera

### TrunkStandard
Standard trunk for regular vehicles.

**Common Items:**
- Containers: EmptyPetrolCan, Tote, Garbagebag, Plasticbag
- Other: DuctTape, Tarp, Twine, Tissue

**Junk (Rare):**
- Tools: LugWrench, Screwdriver, Wrench, Jack, TirePump
- Parts: CarBattery1, NormalTire1
- Medical: FirstAidKit
- Weapon: BaseballBat
- Special: CorpseMale (0.01), CorpseFemale (0.01)

### TrunkHeavy
For heavier/larger vehicles.

Same as TrunkStandard but with:
- CarBattery2 instead of CarBattery1
- NormalTire2 instead of NormalTire1

### TrunkSports
For sports cars.

Same as TrunkStandard but with:
- CarBattery3 instead of CarBattery1
- NormalTire3 instead of NormalTire1

### Seat / DriverSeat
Minimal loot, mainly corpse chance.

**Junk:**
- CorpseMale (0.01)
- CorpseFemale (0.01)

---

## Vehicle Type Categories

### Standard Vehicle Types

| Type | Description | Tire/Battery Level |
|------|-------------|-------------------|
| `NormalStandard` | Regular cars | Level 1 |
| `NormalHeavy` | Trucks, SUVs | Level 2 |
| `NormalSports` | Sports cars | Level 3 |

### Profession-Based Types

Each profession type has custom GloveBox and TruckBed distributions with themed items.

---

## Profession Vehicle Distributions

### Survivalist
Prepared for apocalypse with traps, weapons, and supplies.

**GloveBox Extras:**
- Traps: Aerosolbomb, FlameTrap, NoiseTrap, PipeBomb, SmokeBomb
- Food: BeefJerky, Chocolate, Crisps variants
- Water: WaterBottleFull
- Weapons: Pistol (8), Pistol2 (6), Pistol3 (4), Revolver variants

**TruckBed Extras:**
- Bags: Bag_BigHikingBag, Bag_Military, Bag_FoodCanned, Bag_MedicalBag
- Camping: camping.CampfireKit, camping.CampingTentKit
- Weapons: Machete, BaseballBat, Bag_ShotgunBag variants

### Fisherman
Fishing equipment focused.

**GloveBox Extras:**
- FishingLine (20+10)
- FishingTackle (20+10)
- FishingTackle2 (20+10)

**TruckBed Extras:**
- FishingRod (20+10)
- FishingNet (20+10)
- FishingLine, FishingTackle

### Golf
Golf equipment focused.

**GloveBox Extras:**
- GolfBall (20)
- Gloves_LeatherGloves (20)

**TruckBed Extras:**
- Bag_GolfBag (20 regular, 100 in junk)
- Golfclub (20 in junk)

### Groceries
Food transport vehicle.

**TruckBed Extras:**
- GroceryBag1 (100+50)
- GroceryBag2-5 (8 each)

### Clothing
Clothing delivery vehicle.

**TruckBed Contents:**
Full range of clothing items including:
- Dresses, Skirts
- Jackets, Hoodies, Jumpers
- Shirts, T-shirts
- Trousers, Shorts
- Shoes, Socks
- Hats, Gloves, Scarves
- SewingKit (10)

### Carpenter
Construction/carpentry focused.

**GloveBox Extras:**
- NailsBox (10), ScrewsBox (8)
- DuctTape (8+8), Woodglue (8)
- Tools: Hammer, Screwdriver
- Safety: Glasses_SafetyGoggles, Hat_DustMask, Gloves_LeatherGloves

**TruckBed Extras:**
- Books: BookCarpentry1-5
- Materials: Plank, Log, WoodScrap
- Tools: Saw, Hammer, Screwdriver, HandAxe, Axe

### Electrician
Electrical work focused.

**GloveBox Extras:**
- Radio.ElectricWire (20+10)
- ElectronicsScrap (20+10)
- Screwdriver (8)

**TruckBed Extras:**
- Books: BookElectrician1-5, MagazineElectronics1-2
- Materials: Radio.ElectricWire, ElectronicsScrap
- Equipment: Radio.HamRadio2, Generator

### Farmer
Agricultural focused.

**GloveBox Extras:**
- Seeds: Various seed types
- Gloves_LeatherGloves (20)

**TruckBed Extras:**
- Seeds: BroccoliSeeds, CabbageSeeds, CarrotSeeds, etc.
- Tools: Trowel, HandFork, Hoe
- Supplies: NPKFertilizer, CompostBag

### MetalWelder
Metalworking focused.

**GloveBox Extras:**
- WeldingRods (20+10)
- ScrapMetal (10)

**TruckBed Extras:**
- Books: BookMetalWelding1-5
- Materials: ScrapMetal, SheetMetal, MetalPipe, SmallSheetMetal
- Tools: BlowTorch, Welder, WeldingMask, Hammer

### Doctor
Medical supplies focused.

**GloveBox Extras:**
- Medical: Bandage, AlcoholWipes, Disinfectant, FirstAidKit
- Pills: Various pill types

**TruckBed Extras:**
- Medical: SutureNeedle, SutureNeedleHolder, Tweezers, Scalpel
- Supplies: Disinfectant, AlcoholBandage, Splint

### Radio
Electronics/communication focused.

**GloveBox Extras:**
- Radio.ElectricWire (20+10)
- ElectronicsScrap (20+10)

**TruckBed Extras:**
- Books: MagazineElectronics1-2
- Equipment: Radio.HamRadio2, Radio.WalkieTalkie variants
- Supplies: Radio.ElectricWire, ElectronicsScrap

### Painter
Paint supplies focused.

**GloveBox Extras:**
- PaintbrushSmall (10)
- Paintbrush (8)

**TruckBed Extras:**
- Paint: PaintBlack, PaintBlue, PaintBrown, etc.
- Tools: Paintbrush, PaintbrushSmall, PaintRoller
- Safety: Hat_DustMask, Glasses_SafetyGoggles

### ConstructionWorker
Heavy construction focused.

**GloveBox Extras:**
- NailsBox (10), ScrewsBox (8)
- DuctTape (8+8)

**TruckBed Extras:**
- Materials: Plank, GravelBag, ConcretePowder, SandBag
- Tools: Sledgehammer, Pickaxe, Crowbar, Hammer

---

## Service Vehicle Distributions

### Taxi
Taxi-specific items.

**GloveBox Extras:**
- CreditCard (10)
- Money variants
- Maps (higher weight)

### Police
Law enforcement vehicle.

**GloveBox Extras:**
- Weapons: Pistol (10), Pistol2 (8), Revolver_Short (6)
- Radio.WalkieTalkie5 (4)
- Handcuffs

**TruckBed Extras:**
- Weapons: Shotgun (4), Pistol variants
- Ammo: ShotgunShellsBox, Bullets9mmBox
- Equipment: Nightstick, Handcuffs, Flashlight

### Ranger
Park ranger vehicle.

**GloveBox Extras:**
- Maps (high weight)
- Compass
- HuntingKnife (4)

**TruckBed Extras:**
- Weapons: HuntingRifle (4), Shotgun (2)
- Ammo: ShotgunShellsBox, 308Box
- Tools: Axe, Saw, Rope
- Camping gear

### Fire
Fire department vehicle.

**GloveBox Extras:**
- Flashlight (20)
- Radio.WalkieTalkie4 (4)

**TruckBed Extras:**
- Equipment: Extinguisher, Axe, Crowbar
- Clothing: FirefighterJacket, FirefighterPants, FirefighterHelmet
- Medical: FirstAidKit, Bandage

### Ambulance
Medical emergency vehicle.

**GloveBox Extras:**
- Medical supplies (high weights)
- Pills variants

**TruckBed Extras:**
- Medical: Scalpel, Tweezers, SutureNeedle, Splint
- Supplies: Disinfectant, AlcoholWipes, Bandage
- Medication: Various pills, Antibiotics

---

## Commercial Vehicle Distributions

### McCoy
Hardware store delivery.

**TruckBed Extras:**
- Tools: Hammer, Saw, Screwdriver, Wrench
- Materials: NailsBox, ScrewsBox, DuctTape
- Books: BookCarpentry variants

### Hunter
Hunting supply vehicle.

**GloveBox Extras:**
- HuntingKnife (10)
- Ammo types

**TruckBed Extras:**
- Weapons: HuntingRifle, Shotgun, various ammo
- Camping: Tent kit, Campfire kit
- Clothing: Hunting jacket, boots

### Fossoil
Gas station/fuel delivery.

**TruckBed Extras:**
- EmptyPetrolCan (high weight)
- PetrolCan (20)
- Tools: Wrench, Screwdriver

### Postal
Mail delivery vehicle.

**GloveBox Extras:**
- Office supplies
- Maps

**TruckBed Extras:**
- Packages: Contains random household items
- Books, Magazines
- Various small items

### Spiffo
Spiffo's restaurant vehicle.

**TruckBed Extras:**
- Food items from Spiffo's menu
- Paper bags, cups
- Spiffo merchandise

### MassGenFac
Factory/industrial vehicle.

**TruckBed Extras:**
- Industrial materials
- Tools
- Safety equipment

### Transit
Public transit vehicle.

**GloveBox Extras:**
- Maps (high weight)
- Schedule/papers

**TruckBed Extras:**
- Lost and found items
- Umbrellas, bags

### Distillery
Alcohol production vehicle.

**TruckBed Extras:**
- EmptyBottle variants
- Whiskey bottles (full and empty)
- Wine bottles

### Heralds
Newspaper delivery.

**TruckBed Extras:**
- Newspaper (very high weight)
- Magazine variants
- Rubber bands

---

## Modding Vehicle Distributions

### Adding Custom Distribution

```lua
VehicleDistributions.MyModGloveBox = {
    rolls = 4,
    items = {
        "MyModItem", 10,
        "VanillaItem", 8,
    },
    junk = {
        rolls = 1,
        items = {
            "RareItem", 0.5,
        }
    }
}

VehicleDistributions.MyModTruckBed = {
    rolls = 4,
    items = {
        "MyModItem2", 10,
    },
    junk = {
        rolls = 1,
        items = { }
    }
}

VehicleDistributions.MyModVehicle = {
    TruckBed = VehicleDistributions.MyModTruckBed;
    TruckBedOpen = VehicleDistributions.MyModTruckBed;
    GloveBox = VehicleDistributions.MyModGloveBox;
    SeatRearLeft = VehicleDistributions.Seat;
    SeatRearRight = VehicleDistributions.Seat;
}
```

### Modifying Existing Distributions

```lua
-- Add items to existing distribution
table.insert(VehicleDistributions.GloveBox.items, "MyModItem")
table.insert(VehicleDistributions.GloveBox.items, 10)

-- Add to junk
table.insert(VehicleDistributions.TrunkStandard.junk.items, "MyRareItem")
table.insert(VehicleDistributions.TrunkStandard.junk.items, 0.5)
```

### Linking to Vehicle Scripts

In vehicle script files, reference distributions:

```
vehicle MyModVehicle {
    // ...
    part TruckBed {
        container {
            capacity = 100,
        }
    }
    // Distribution is linked via vehicle ID/type
}
```

---

## Special Properties

### specificId

Used to link distribution to specific vehicle variants:

```lua
VehicleDistributions.Fisherman = {
    specificId = "Fisherman";  -- Matches vehicle variant ID
    TruckBed = VehicleDistributions.FishermanTruckBed;
    // ...
}
```

---

## Complete Distribution List

### Base Distributions
- `GloveBox` - Standard glove box
- `TrunkStandard` - Standard trunk (tier 1)
- `TrunkHeavy` - Heavy vehicle trunk (tier 2)
- `TrunkSports` - Sports car trunk (tier 3)
- `DriverSeat` - Driver position
- `Seat` - Passenger seats

### Vehicle Type Categories
- `NormalStandard` - Regular vehicles
- `NormalHeavy` - Heavy vehicles
- `NormalSports` - Sports vehicles

### Profession Vehicles (35 distributions)
| Vehicle | GloveBox | TruckBed |
|---------|----------|----------|
| Survivalist | SurvivalistGlovebox | SurvivalistTruckBed |
| Fisherman | FishermanGloveBox | FishermanTruckBed |
| Groceries | GloveBox | GroceriesTruckBed |
| Golf | GolfGloveBox | GolfTruckBed |
| Clothing | GloveBox | ClothingTruckBed |
| Carpenter | CarpenterGloveBox | CarpenterTruckBed |
| Electrician | ElectricianGloveBox | ElectricianTruckBed |
| Farmer | FarmerGloveBox | FarmerTruckBed |
| MetalWelder | MetalWelderGloveBox | MetalWelderTruckBed |
| Doctor | DoctorGloveBox | DoctorTruckBed |
| Radio | RadioGloveBox | RadioTruckBed |
| Painter | PainterGloveBox | PainterTruckBed |
| ConstructionWorker | ConstructionWorkerGloveBox | ConstructionWorkerTruckBed |
| Taxi | TaxiGloveBox | TaxiTruckBed |
| Police | PoliceGloveBox | PoliceTruckBed |
| Ranger | RangerGloveBox | RangerTruckBed |
| Fire | FireGloveBox | FireTruckBed |
| McCoy | McCoyGloveBox | McCoyTruckBed |
| Hunter | HunterGloveBox | HunterTruckBed |
| Fossoil | FossoilGloveBox | FossoilTruckBed |
| Postal | PostalGloveBox | PostalTruckBed |
| Spiffo | SpiffoGloveBox | SpiffoTruckBed |
| MassGenFac | MassGenFacGloveBox | MassGenFacTruckBed |
| Transit | TransitGloveBox | TransitTruckBed |
| Distillery | DistilleryGloveBox | DistilleryTruckBed |
| Heralds | HeraldsGloveBox | HeraldsTruckBed |
| Ambulance | AmbulanceGloveBox | AmbulanceTruckBed |

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Base distributions | Complete |
| Container types | Complete |
| Profession vehicles | Complete |
| Service vehicles | Complete |
| Commercial vehicles | Complete |
| Modding examples | Complete |

---

## Related Systems

- **Distributions.lua** - Container loot distributions
- **ProceduralDistributions.lua** - Named loot lists
- **Vehicle Scripts** - Vehicle definitions
- **VehicleZoneDistribution.lua** - Zone-based vehicle spawns

