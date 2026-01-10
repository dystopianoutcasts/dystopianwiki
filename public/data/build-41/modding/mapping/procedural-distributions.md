# Procedural Distributions Reference

**Location:** `media/lua/server/Items/ProceduralDistributions.lua`
**Purpose:** Named loot lists referenced by room distributions

---

## Overview

Procedural distributions are reusable loot tables with specific item lists. Room distributions in `Distributions.lua` reference these by name, allowing the same loot list to be used across multiple room types and containers.

**Total Distributions:** ~450+ named lists

---

## Distribution Structure

```lua
ProceduralDistributions.list.DistributionName = {
    rolls = 4,           -- Number of loot attempts
    items = {
        "ItemType", weight,   -- Item and spawn weight
        "ItemType2", weight,
    },
    junk = {             -- Optional secondary rolls
        rolls = 1,
        items = { }
    }
}
```

---

## Distribution Categories

### Military/Army (18 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `ArmyHangarOutfit` | Flight suits and gear | Boilersuit_Flying, Hat_SPHhelmet |
| `ArmyHangarTools` | Hangar maintenance | BlowTorch, Crowbar, WeldingRods |
| `ArmyStorageAmmunition` | Military ammo | 308Box, 556Box, Bullets45Box |
| `ArmyStorageElectronics` | Military electronics | HamRadio2, WalkieTalkie4/5 |
| `ArmyStorageGuns` | Military weapons | AssaultRifle, AssaultRifle2, HuntingRifle |
| `ArmyStorageMedical` | Military medical | FirstAidKit, Antibiotics |
| `ArmyStorageOutfit` | Military clothing | Bag_ALICEpack_Army, Ghillie_Top/Trousers |
| `ArmySurplusBackpacks` | Surplus bags | Bag_Military, Bag_ALICEpack |
| `ArmySurplusFootwear` | Military boots | Shoes_ArmyBoots, ArmyBootsDesert |
| `ArmySurplusHeadwear` | Military hats | Hat_BonnieHat, Hat_GasMask |
| `ArmySurplusMisc` | Surplus misc | Tarp, Rope, HandTorch |
| `ArmySurplusOutfit` | Surplus clothing | Jacket_ArmyCamoDesert, Vest_BulletArmy |
| `ArmySurplusTools` | Surplus tools | HandAxe, HuntingKnife, Machete |

### Antiques & Art (5 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `Antiques` | Antique store items | Baseball, Jewelry, Instruments |
| `ArtStoreOther` | Art supplies misc | Scissors, Glue, Scotchtape |
| `ArtStorePaper` | Paper products | Notebook, SheetPaper2 |
| `ArtStorePen` | Writing implements | Pencil, BluePen, Crayons |
| `ArtSupplies` | General art supplies | Various art items |

### Bakery (8 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `Bakery` | General bakery | Mixed baked goods |
| `BakeryBread` | Bread products | Bread, BreadSlices |
| `BakeryCake` | Cakes | Cake, CakeBatter |
| `BakeryDoughnuts` | Donuts | Doughnut |
| `BakeryKitchenBaking` | Baking supplies | Flour, Sugar, Yeast |
| `BakeryKitchenFreezer` | Frozen goods | Frozen dough, ice cream |
| `BakeryKitchenFridge` | Refrigerated | Butter, Eggs, Milk |
| `BakeryMisc` | Misc bakery | Napkins, Bags |
| `BakeryPie` | Pies | Pie, PieDough |

### Bar/Restaurant (12 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `BarCounterGlasses` | Bar glasses | Various glasses |
| `BarCounterLiquor` | Bar liquor | Whiskey, Wine, Beer |
| `BarCounterMisc` | Bar misc | Napkins, Opener |
| `BarCounterWeapon` | Hidden weapons | BaseballBat, PoolCue |
| `BarCrateDarts` | Dart supplies | Darts |
| `BarCratePool` | Pool supplies | PoolBall, PoolCue |
| `BarShelfLiquor` | Liquor shelf | Various alcohol |

### Bathroom (4 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `BathroomCabinet` | Medicine cabinet | Pills, Bandage, Disinfectant |
| `BathroomCounter` | Counter items | Soap, Razor, Toothbrush |
| `BathroomCounterEmpty` | Empty variant | Few items |
| `BathroomShelf` | Shelf items | Towel, ToiletPaper |

### Bedroom (3 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `BedroomDresser` | Dresser clothes | Various clothing |
| `BedroomSideTable` | Nightstand | Book, Glasses, Watch |

### Bin/Dumpster (3 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `BinBar` | Bar trash | EmptySoda, Newspaper |
| `BinDumpster` | Dumpster loot | Random junk |
| `BinGeneric` | Generic trash | Mixed junk |

### Bookstore (4 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `BookstoreBags` | Bookstore bags | Bag_Schoolbag |
| `BookstoreBooks` | Books | Various books |
| `BookstoreMisc` | Misc items | Bookmark, Gift |
| `BookstoreStationery` | Stationery | Pen, Pencil, Notebook |

### Burger/Fast Food (7 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `BurgerKitchenButcher` | Burger meat | BeefPatty, BeefJerky |
| `BurgerKitchenFreezer` | Frozen items | FrozenBurger |
| `BurgerKitchenFridge` | Refrigerated | Cheese, Lettuce, Tomato |
| `BurgerKitchenSauce` | Condiments | Ketchup, Mustard, Mayo |

### Butcher (8 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `ButcherChicken` | Poultry | ChickenBreast, ChickenWhole |
| `ButcherChops` | Meat cuts | PorkChop, LambChop |
| `ButcherFish` | Fish | FishFilet, FishWhole |
| `ButcherFreezer` | Frozen meat | Various frozen meats |
| `ButcherGround` | Ground meat | MincedMeat, GroundBeef |
| `ButcherSmoked` | Smoked meats | Bacon, Ham |
| `ButcherSnacks` | Meat snacks | BeefJerky |
| `ButcherTools` | Butcher tools | MeatCleaver, KitchenKnife |

### Camping (6 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `CampingLockers` | Camping lockers | Various camping gear |
| `CampingStoreBackpacks` | Backpacks | Bag_BigHikingBag |
| `CampingStoreBooks` | Camping guides | BookCamping |
| `CampingStoreClothes` | Outdoor clothing | Jacket_Hunting |
| `CampingStoreGear` | Camping equipment | Tent, SleepingBag, Compass |
| `CampingStoreLegwear` | Outdoor pants | Trousers_Hunting |

### Car Parts (18 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `CarBrakesModern1/2/3` | Modern brakes | Various brake types |
| `CarBrakesNormal1/2/3` | Normal brakes | Various brake types |
| `CarSuspensionModern1/2/3` | Modern suspension | Various suspension |
| `CarSuspensionNormal1/2/3` | Normal suspension | Various suspension |
| `CarTiresModern1/2/3` | Modern tires | Various tires |
| `CarTiresNormal1/2/3` | Normal tires | Various tires |
| `CarWindows1/2/3` | Car windows | Various windows |
| `CarSupplyTools` | Auto tools | Wrench, JackStand |

### Classroom/School (5 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `ClassroomDesk` | Student desks | Pen, Pencil, Notebook |
| `ClassroomMisc` | Classroom misc | Globe, Map |
| `ClassroomShelves` | School shelves | Books, Supplies |
| `SchoolLockers` | Student lockers | Backpack, Books, Clothes |

### Clothing Store (30+ distributions)

| Name | Description |
|------|-------------|
| `ClothingStoresBoots` | Boot selection |
| `ClothingStoresDress` | Dresses |
| `ClothingStoresEyewear` | Sunglasses, glasses |
| `ClothingStoresGloves` | Gloves |
| `ClothingStoresGlovesLeather` | Leather gloves |
| `ClothingStoresHeadwear` | Hats, caps |
| `ClothingStoresJackets` | Jackets |
| `ClothingStoresJacketsFormal` | Formal jackets |
| `ClothingStoresJacketsLeather` | Leather jackets |
| `ClothingStoresJeans` | Jeans |
| `ClothingStoresJumpers` | Sweaters |
| `ClothingStoresOvershirts` | Overshirts |
| `ClothingStoresPants` | Pants |
| `ClothingStoresPantsFormal` | Formal pants |
| `ClothingStoresPantsLeather` | Leather pants |
| `ClothingStoresShirts` | Shirts |
| `ClothingStoresShirtsFormal` | Formal shirts |
| `ClothingStoresShoes` | Shoes |
| `ClothingStoresShoesLeather` | Leather shoes |
| `ClothingStoresSocks` | Socks |
| `ClothingStoresSport` | Sports clothing |
| `ClothingStoresSummer` | Summer clothes |
| `ClothingStoresUnderwearWoman` | Women's underwear |
| `ClothingStoresUnderwearMan` | Men's underwear |
| `ClothingStoresWoman` | Women's clothing |

### Crate Distributions (100+ distributions)

Crate distributions contain specific item types for warehouse/storage:

#### Food Crates
| Name | Contents |
|------|----------|
| `CrateBakingSoda` | Baking soda boxes |
| `CrateButter` | Butter |
| `CrateCandyPackage` | Packaged candy |
| `CrateCannedFood` | Canned goods |
| `CrateCereal` | Cereal boxes |
| `CrateChips` | Chip bags |
| `CrateChocolate` | Chocolate |
| `CrateCoffee` | Coffee |
| `CrateCrackers` | Crackers |
| `CrateFlour` | Flour bags |
| `CratePasta` | Pasta |
| `CrateRice` | Rice |
| `CrateSodaBottles` | Soda bottles |
| `CrateSodaCans` | Soda cans |
| `CrateSugar` | Sugar |
| `CrateTea` | Tea |

#### Tool/Supply Crates
| Name | Contents |
|------|----------|
| `CrateCarpentry` | Carpentry supplies |
| `CrateMechanics` | Mechanic tools |
| `CrateMetalwork` | Metalworking supplies |
| `CrateTools` | General tools |
| `CrateFarming` | Farming supplies |
| `CrateFishing` | Fishing gear |
| `CrateElectronics` | Electronic components |
| `CrateTailoring` | Tailoring supplies |

#### Furniture Crates
| Name | Contents |
|------|----------|
| `CrateBlueComfyChair` | Blue comfy chairs |
| `CrateBrownComfyChair` | Brown comfy chairs |
| `CratePlasticChairs` | Plastic chairs |
| `CrateWoodenChairs` | Wooden chairs |
| `CrateOfficeChairs` | Office chairs |
| `CrateFoldingChairs` | Folding chairs |
| `CrateSmallTables` | Small tables |
| `CrateLongTables` | Long tables |

### Drug/Medical (10 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `DrugLabGuns` | Drug lab weapons | Pistol, Shotgun |
| `DrugLabOutfit` | Drug lab clothing | Apron, Gloves |
| `DrugLabSupplies` | Lab supplies | Chemistry items |
| `DrugShackDrugs` | Drug stash drugs | Various drugs |
| `DrugShackMisc` | Drug stash misc | Money, Bag |
| `DrugShackTools` | Drug stash tools | Scale, Lighter |
| `DrugShackWeapons` | Drug stash weapons | Pistol, Knife |
| `MedicalClinicDrugs` | Clinic drugs | Pills, Antibiotics |
| `MedicalStorageDrugs` | Medical storage drugs | Various medications |
| `MedicalStorageOutfit` | Medical clothing | Scrubs, Gloves |
| `MedicalStorageTools` | Medical tools | Scalpel, Tweezers |

### Electronics (7 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `ElectronicStoreAppliances` | Appliances | Toaster, Microwave |
| `ElectronicStoreComputers` | Computers | Computer parts |
| `ElectronicStoreHAMRadio` | HAM radios | HamRadio |
| `ElectronicStoreLights` | Lighting | Lightbulb, Flashlight |
| `ElectronicStoreMagazines` | Tech magazines | ElectronicsMag |
| `ElectronicStoreMisc` | Misc electronics | Batteries, Wire |
| `ElectronicStoreMusic` | Music equipment | CD, Tape |

### Factory (4 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `FactoryLockers` | Worker lockers | Work clothes, Tools |
| `CabinetFactoryTools` | Factory tools | Industrial tools |
| `LoggingFactoryTools` | Logging tools | Axe, Saw |

### Fire Department (4 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `FireDeptLockers` | Firefighter lockers | FirefighterJacket |
| `FireStorageOutfit` | Fire equipment | FirefighterPants, Helmet |
| `FireStorageTools` | Fire tools | Extinguisher, Axe |
| `ForestFireTools` | Forest fire tools | Axe, Shovel |

### Fishing (2 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `FishingStoreBait` | Bait shop | Worm, FishingTackle |
| `FishingStoreGear` | Fishing gear | FishingRod, FishingNet |

### Freezer/Fridge (15+ distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `FreezerGeneric` | Generic freezer | Frozen foods |
| `FreezerRich` | Rich home freezer | Quality frozen items |
| `FreezerTrailerPark` | Trailer freezer | Basic frozen items |
| `FreezerIceCream` | Ice cream freezer | IceCream |
| `FridgeBeer` | Beer fridge | Beer bottles/cans |
| `FridgeBottles` | Bottle fridge | Various bottles |
| `FridgeBreakRoom` | Break room fridge | Lunch items |
| `FridgeGeneric` | Generic fridge | Mixed food |
| `FridgeOffice` | Office fridge | Lunch items |
| `FridgeRich` | Rich home fridge | Quality food |
| `FridgeSnacks` | Snack fridge | Snacks |
| `FridgeSoda` | Soda fridge | Soda |
| `FridgeTrailerPark` | Trailer fridge | Basic food |
| `FridgeWater` | Water fridge | Water bottles |

### Garage (5 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `GarageCarpentry` | Garage carpentry | Wood, Nails, Hammer |
| `GarageFirearms` | Garage guns | Hidden firearms |
| `GarageMechanics` | Garage mechanics | Tools, Parts |
| `GarageMetalwork` | Garage metalwork | Metal, Welding |
| `GarageTools` | Garage tools | General tools |

### Gas Station (2 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `GasStorageMechanics` | Gas station tools | Wrench, OilCan |
| `GasStorageCombo` | Gas station combo | Mixed items |

### Gigamart/Grocery (15 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `GigamartBakingMisc` | Baking supplies | Flour, Sugar |
| `GigamartBedding` | Bedding section | Pillow, Sheet |
| `GigamartBottles` | Bottled drinks | Various bottles |
| `GigamartCandy` | Candy section | Various candy |
| `GigamartCannedFood` | Canned section | Canned goods |
| `GigamartCrisps` | Chip section | Chips |
| `GigamartDryGoods` | Dry goods | Pasta, Rice |
| `GigamartFarming` | Garden section | Seeds, Tools |
| `GigamartHouseElectronics` | Electronics | Batteries, Lights |
| `GigamartHousewares` | Housewares | Kitchen items |
| `GigamartPots` | Pot section | Pots, Pans |
| `GigamartSauce` | Sauce section | Condiments |
| `GigamartSchool` | School supplies | Notebooks, Pens |
| `GigamartTools` | Tool section | Basic tools |
| `GigamartToys` | Toy section | Toys |

### Gun Store (5 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `GunStoreAmmunition` | Ammo display | Various ammo boxes |
| `GunStoreCounter` | Gun counter | Holsters, Accessories |
| `GunStoreDisplayCase` | Gun display | Pistols, Revolvers |
| `GunStoreMagazineRack` | Gun magazines | Gun magazines |
| `GunStoreShelf` | Gun shelf | Cleaning kits, Scopes |

### Gym (6 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `GymLaundry` | Gym laundry | Towels |
| `GymLockers` | Gym lockers | Clothes, Bag |
| `GymSweatbands` | Sweatbands | Sweatband |
| `GymTowels` | Gym towels | Towel |
| `GymWeights` | Weights | Dumbbell |
| `FitnessTrainer` | Trainer items | Whistle, Clipboard |

### Hospital (3 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `HospitalLockers` | Hospital lockers | Scrubs, Medical |
| `LaundryHospital` | Hospital laundry | Gowns, Sheets |

### Hunting (3 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `Hunter` | Hunter gear | HuntingRifle, Knife |
| `HuntingLockers` | Hunting lockers | Camo, Rifle |

### Janitor (4 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `JanitorChemicals` | Cleaning chemicals | Bleach, Ammonia |
| `JanitorCleaning` | Cleaning supplies | Mop, Bucket |
| `JanitorMisc` | Misc janitor | Keys, Flashlight |
| `JanitorTools` | Janitor tools | Plunger, Wrench |

### Jewelry (8 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `JewelryGems` | Gem jewelry | Diamond, Ruby |
| `JewelryGold` | Gold jewelry | Gold_* items |
| `JewelryNavelRings` | Body jewelry | Navel rings |
| `JewelryOthers` | Other jewelry | Mixed jewelry |
| `JewelrySilver` | Silver jewelry | Silver_* items |
| `JewelryWeddingRings` | Wedding rings | WeddingRing |
| `JewelryWrist` | Wrist jewelry | Watch, Bracelet |
| `JewelryStorageAll` | Storage jewelry | Mixed jewelry |

### Kitchen (10 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `KitchenBaking` | Baking supplies | Flour, Sugar, Eggs |
| `KitchenBook` | Cookbooks | CookingBook |
| `KitchenBottles` | Kitchen bottles | Oil, Vinegar |
| `KitchenBreakfast` | Breakfast items | Cereal, Milk |
| `KitchenCannedFood` | Canned food | Various cans |
| `KitchenDishes` | Dishes | Plate, Bowl, Cup |
| `KitchenDryFood` | Dry food | Pasta, Rice |
| `KitchenPots` | Pots and pans | Pot, Pan |
| `KitchenRandom` | Random kitchen | Mixed items |

### Library (2 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `LibraryBooks` | Library books | Various books |
| `LibraryCounter` | Library counter | Cards, Stamps |

### Living Room (4 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `LivingRoomShelf` | Living room shelf | Books, VHS, Remote |
| `LivingRoomShelfNoTapes` | Shelf no tapes | Books, Decor |
| `LivingRoomSideTable` | Side table | Remote, Magazine |
| `LivingRoomSideTableNoRemote` | No remote variant | Magazine, Glasses |

### Locker (3 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `Locker` | Generic locker | Mixed items |
| `LockerArmyBedroom` | Army bedroom locker | Military gear |
| `LockerClassy` | Classy locker | Nice clothes |

### Mechanic (10 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `MechanicShelfBooks` | Mechanic books | MechanicBook |
| `MechanicShelfBrakes` | Brake parts | BrakePads |
| `MechanicShelfElectric` | Electric parts | Battery, Wire |
| `MechanicShelfMisc` | Misc mechanic | Various parts |
| `MechanicShelfMufflers` | Mufflers | Muffler |
| `MechanicShelfOutfit` | Mechanic clothes | Overalls |
| `MechanicShelfSuspension` | Suspension | Suspension parts |
| `MechanicShelfTools` | Mechanic tools | Wrench, Socket |
| `MechanicShelfWheels` | Wheels | Tire, Rim |
| `MechanicSpecial` | Special parts | Rare parts |

### Office (5 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `OfficeCounter` | Office counter | Papers, Stapler |
| `OfficeDesk` | Office desk | Pen, Paper, Phone |
| `OfficeDeskHome` | Home office | Computer, Books |
| `OfficeDrawers` | Office drawers | Supplies |
| `OfficeShelfSupplies` | Office supplies | Paper, Folders |

### Pawn Shop (5 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `PawnShopCases` | Display cases | Jewelry, Electronics |
| `PawnShopGuns` | Pawn guns | Various guns |
| `PawnShopGunsSpecial` | Rare pawn guns | Rare firearms |
| `PawnShopKnives` | Pawn knives | Various knives |

### Police (6 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `PoliceDesk` | Police desk | Files, Badge |
| `PoliceEvidence` | Evidence room | Mixed evidence |
| `PoliceLockers` | Police lockers | Uniform, Vest |
| `PoliceStorageAmmunition` | Police ammo | 9mm, Shotgun shells |
| `PoliceStorageGuns` | Police guns | Pistol, Shotgun |
| `PoliceStorageOutfit` | Police uniform | PoliceJacket |

### Post Office (5 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `PostOfficeBooks` | Post books | Packages, Books |
| `PostOfficeBoxes` | Packages | Random items |
| `PostOfficeMagazines` | Magazines | Various magazines |
| `PostOfficeNewspapers` | Newspapers | Newspaper |
| `PostOfficeSupplies` | Post supplies | Tape, Boxes |

### Prison (2 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `PrisonCellRandom` | Cell items | Basic items |
| `PrisonGuardLockers` | Guard lockers | Uniform, Keys |

### Produce Storage (18 distributions)

| Name | Contents |
|------|----------|
| `ProduceStorageApples` | Apples |
| `ProduceStorageBellPeppers` | Bell peppers |
| `ProduceStorageBroccoli` | Broccoli |
| `ProduceStorageCabbages` | Cabbages |
| `ProduceStorageCarrots` | Carrots |
| `ProduceStorageCherries` | Cherries |
| `ProduceStorageCorn` | Corn |
| `ProduceStorageEggplant` | Eggplant |
| `ProduceStorageLeeks` | Leeks |
| `ProduceStorageLettuce` | Lettuce |
| `ProduceStorageOnions` | Onions |
| `ProduceStoragePeaches` | Peaches |
| `ProduceStoragePear` | Pears |
| `ProduceStoragePotatoes` | Potatoes |
| `ProduceStorageRadishes` | Radishes |
| `ProduceStorageStrawberries` | Strawberries |
| `ProduceStorageTomatoes` | Tomatoes |
| `ProduceStorageWatermelons` | Watermelons |

### Restaurant Kitchen (Various cuisines)

| Prefix | Cuisine | Distributions |
|--------|---------|---------------|
| `BurgerKitchen` | Burger | Butcher, Freezer, Fridge, Sauce |
| `ChineseKitchen` | Chinese | Baking, Butcher, Cutlery, Freezer, Fridge, Sauce |
| `CrepeKitchen` | Crepe | Baking, Fridge, Sauce |
| `DinerKitchen` | Diner | Freezer, Fridge |
| `FishChipsKitchen` | Fish & Chips | Butcher, Freezer, Fridge, Sauce |
| `ItalianKitchen` | Italian | Baking, Butcher, Freezer, Fridge |
| `JaysKitchen` | Jay's | Bags, Baking, Butcher, Freezer, Fridge, Sauce |
| `MexicanKitchen` | Mexican | Baking, Butcher, Freezer, Fridge, Sauce |
| `PizzaKitchen` | Pizza | Baking, Butcher, Cheese, Fridge, Sauce |
| `RestaurantKitchen` | General | Freezer, Fridge |
| `SeafoodKitchen` | Seafood | Butcher, Freezer, Fridge, Sauce |
| `SpiffosKitchen` | Spiffo's | Bags, Counter, Freezer, Fridge |
| `SushiKitchen` | Sushi | Baking, Cutlery, Freezer, Fridge, Sauce |
| `WesternKitchen` | Western | Baking, Butcher, Freezer, Fridge, Sauce |

### Salon (3 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `SalonCounter` | Salon counter | Scissors, Comb |
| `SalonShelfHaircare` | Haircare | Shampoo, Conditioner |
| `SalonShelfTowels` | Salon towels | Towel |

### Serving Trays (35 distributions)

Food service trays for restaurants:

| Name | Food Type |
|------|-----------|
| `ServingTrayBiscuits` | Biscuits |
| `ServingTrayBurgers` | Burgers |
| `ServingTrayBurritos` | Burritos |
| `ServingTrayChicken` | Fried chicken |
| `ServingTrayChickenNuggets` | Chicken nuggets |
| `ServingTrayCornbread` | Cornbread |
| `ServingTrayFish` | Fish |
| `ServingTrayFries` | French fries |
| `ServingTrayGravy` | Gravy |
| `ServingTrayHotdogs` | Hot dogs |
| `ServingTrayMaki` | Maki rolls |
| `ServingTrayMeatDumplings` | Meat dumplings |
| `ServingTrayMeatSteamBuns` | Steam buns |
| `ServingTrayNoodleSoup` | Noodle soup |
| `ServingTrayOmelettes` | Omelettes |
| `ServingTrayOnigiri` | Onigiri |
| `ServingTrayOnionRings` | Onion rings |
| `ServingTrayOysters` | Oysters |
| `ServingTrayPancakes` | Pancakes |
| `ServingTrayPerogies` | Perogies |
| `ServingTrayPie` | Pie slices |
| `ServingTrayPizza` | Pizza slices |
| `ServingTrayPotatoPancakes` | Potato pancakes |
| `ServingTrayRefriedBeans` | Refried beans |
| `ServingTrayScrambledEggs` | Scrambled eggs |
| `ServingTrayShrimp` | Shrimp |
| `ServingTrayShrimpDumplings` | Shrimp dumplings |
| `ServingTraySpringRolls` | Spring rolls |
| `ServingTraySushiEgg` | Egg sushi |
| `ServingTraySushiFish` | Fish sushi |
| `ServingTrayTaco` | Tacos |
| `ServingTrayTofuFried` | Fried tofu |
| `ServingTrayWaffles` | Waffles |

### Sewing/Tailor (2 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `SewingStoreTools` | Sewing tools | Needle, Thread |
| `SewingStoreFabric` | Fabric | Fabric sheets |

### Shelf Generic (1 distribution)

| Name | Description | Key Items |
|------|-------------|-----------|
| `ShelfGeneric` | Generic shelf | Mixed household items |

### Sports Store (8 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `SportStoreSneakers` | Sneakers | Various sneakers |
| `SportStorageBats` | Baseball bats | BaseballBat |
| `SportStorageBalls` | Sports balls | Various balls |
| `SportStorageHelmets` | Sports helmets | Helmets |
| `SportStoragePaddles` | Paddles | Paddle |
| `SportStorageRacquets` | Racquets | TennisRacket |
| `SportStorageSticks` | Sports sticks | HockeyStick |

### Store Counters/Kitchen (15 distributions)

| Name | Description |
|------|-------------|
| `StoreCounterBags` | Store bags |
| `StoreCounterBagsFancy` | Fancy store bags |
| `StoreCounterCleaning` | Counter cleaning |
| `StoreCounterTobacco` | Tobacco counter |
| `StoreDisplayWatches` | Watch display |
| `StoreKitchenBaking` | Commercial baking |
| `StoreKitchenButcher` | Commercial butcher |
| `StoreKitchenCafe` | Cafe kitchen |
| `StoreKitchenCutlery` | Commercial cutlery |
| `StoreKitchenBags` | Kitchen bags |
| `StoreKitchenCups` | Cups/glasses |
| `StoreKitchenDishes` | Commercial dishes |
| `StoreKitchenGlasses` | Drinking glasses |
| `StoreKitchenPotatoes` | Potato prep |
| `StoreKitchenPots` | Commercial pots |
| `StoreKitchenSauce` | Sauce prep |
| `StoreKitchenTrays` | Serving trays |

### Store Shelves (10 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `StoreShelfBeer` | Beer shelf | Various beers |
| `StoreShelfCombo` | Combo shelf | Mixed items |
| `StoreShelfDrinks` | Drink shelf | Beverages |
| `StoreShelfElectronics` | Electronics shelf | Batteries, Lights |
| `StoreShelfMechanics` | Mechanics shelf | Tools, Parts |
| `StoreShelfMedical` | Medical shelf | First aid |
| `StoreShelfSnacks` | Snack shelf | Chips, Candy |
| `StoreShelfSpices` | Spice shelf | Seasonings |
| `StoreShelfWhiskey` | Whiskey shelf | Whiskey bottles |
| `StoreShelfWine` | Wine shelf | Wine bottles |

### Survival/Outdoor (4 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `Hiker` | Hiker gear | Compass, Map, Rope |
| `SurvivalGear` | Survival equipment | Knife, Fire starter |
| `Trapper` | Trapper gear | Trap, Rope |
| `VacationStuff` | Vacation items | Sunscreen, Hat |

### Tool Store (10 distributions)

| Name | Description | Key Items |
|------|-------------|-----------|
| `ToolStoreAccessories` | Tool accessories | Bits, Blades |
| `ToolStoreBooks` | Tool guides | How-to books |
| `ToolStoreCarpentry` | Carpentry tools | Hammer, Saw |
| `ToolStoreFarming` | Farm tools | Shovel, Rake |
| `ToolStoreFootwear` | Work boots | Work boots |
| `ToolStoreMetalwork` | Metal tools | Welder, Grinder |
| `ToolStoreMisc` | Misc tools | Mixed tools |
| `ToolStoreOutfit` | Work clothes | Overalls, Gloves |
| `ToolStoreTools` | General tools | Full range |

### Wardrobe (6 distributions)

| Name | Description |
|------|-------------|
| `WardrobeChild` | Children's clothes |
| `WardrobeMan` | Men's clothes |
| `WardrobeManClassy` | Men's formal |
| `WardrobeRedneck` | Rural clothes |
| `WardrobeWoman` | Women's clothes |
| `WardrobeWomanClassy` | Women's formal |

### Zippy/Convenience (1 distribution)

| Name | Description | Key Items |
|------|-------------|-----------|
| `ZippeeClothing` | Convenience clothes | Basic clothes |

---

## Modding Procedural Distributions

### Adding New Distribution

```lua
ProceduralDistributions.list.MyModDistribution = {
    rolls = 4,
    items = {
        "MyModItem1", 10,
        "MyModItem2", 8,
        "VanillaItem", 5,
    },
    junk = {
        rolls = 1,
        items = {
            "Newspaper", 4,
        }
    }
}
```

### Modifying Existing Distribution

```lua
-- Add items to existing distribution
table.insert(ProceduralDistributions.list.GunStoreDisplayCase.items, "MyModGun")
table.insert(ProceduralDistributions.list.GunStoreDisplayCase.items, 5)
```

### Using in Room Distribution

```lua
SuburbsDistributions.myroom.counter = {
    procedural = true,
    procList = {
        {name = "MyModDistribution", min = 0, max = 99},
    }
}
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Distribution listing | Complete |
| Category organization | Complete |
| Key items per category | Partial |
| Modding examples | Complete |

---

## Related Files

- `Distributions.lua` - Room-based distributions that reference these
- `SuburbsDistributions.lua` - Merging utilities
- `VehicleDistributions.lua` - Vehicle-specific distributions

