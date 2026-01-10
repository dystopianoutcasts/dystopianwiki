# scripts/ Folder Documentation

**Location:** `media/scripts/`
**File Count:** 30+ script files, 3 subfolders
**Purpose:** Game data definitions: items, recipes, vehicles, sounds, clothing, building

---

## File Overview

| File | Size | Purpose |
|------|------|---------|
| items.txt | 29KB | General items (tools, materials, keys) |
| items_food.txt | 228KB | Food items, consumables |
| items_weapons.txt | 189KB | Weapons (melee and ranged) |
| items_literature.txt | 39KB | Books, magazines, newspapers |
| items_radio.txt | 13KB | Radio/TV equipment |
| newitems.txt | 125KB | Additional items |
| newBags.txt | 12KB | Container/bag items |
| recipes.txt | 99KB | Crafting recipes |
| recipes_radio.txt | 4KB | Radio-related recipes |
| evolvedrecipes.txt | 7KB | Cooking evolved recipes |
| uniquerecipes.txt | 1KB | Unique/special recipes |
| farming.txt | 25KB | Farming definitions |
| fixing.txt | 13KB | Item repair definitions |
| camping.txt | 3KB | Camping items and recipes |
| mannequins.txt | 3KB | Mannequin definitions |
| moveables.txt | 1KB | Base moveable item |
| newMoveables.txt | 28KB | Moveable furniture items |
| multistagebuild.txt | 12KB | Multi-stage construction |
| models_items.txt | 214KB | 3D model mappings |
| animations.txt | 1KB | Runtime animation definitions |
| animations_meshes.txt | 1KB | Animation mesh mappings |
| sounds_item.txt | 6KB | Item sounds |
| sounds_meta.txt | 1KB | Meta sounds |
| sounds_music.txt | 14KB | Music tracks |
| sounds_object.txt | 21KB | Object sounds |
| sounds_player.txt | 9KB | Player sounds |
| sounds_ui.txt | 1KB | UI sounds |
| sounds_world.txt | 4KB | World/ambient sounds |
| sounds_zombie.txt | 3KB | Zombie sounds |

---

## Subfolders

### clothing/ (12 files)
Clothing item definitions organized by type.

| File | Purpose |
|------|---------|
| clothing_bags.txt | Bags and backpacks |
| clothing_body.txt | Body wear |
| clothing_hats.txt | Headwear |
| clothing_jacket.txt | Jackets and coats |
| clothing_jewellery.txt | Jewelry and accessories |
| clothing_others.txt | Miscellaneous clothing |
| clothing_pants.txt | Pants and legwear |
| clothing_shirts.txt | Shirts and tops |
| clothing_shoes.txt | Footwear |
| clothing_suits.txt | Full suits |
| clothing_underwear.txt | Undergarments |
| clothing_zeddmg.txt | Zombie damage textures |

### vehicles/ (documented separately)
Vehicle definitions including parts, physics, seats.

### weapons/ (25 files)
Weapon sound definitions.

| File | Purpose |
|------|---------|
| sounds_boxofrounds.txt | Ammo box sounds |
| sounds_deserteagle.txt | Desert Eagle sounds |
| sounds_doublebarrelshotgun.txt | Shotgun sounds |
| sounds_m14.txt | M14 rifle sounds |
| sounds_m16.txt | M16 rifle sounds |
| sounds_m1811.txt | M1911 pistol sounds |
| sounds_m36.txt | M36 revolver sounds |
| sounds_m625.txt | M625 revolver sounds |
| sounds_m9.txt | M9 pistol sounds |
| sounds_magnum.txt | Magnum sounds |
| sounds_msr700.txt | MSR700 rifle sounds |
| sounds_msr788.txt | MSR788 rifle sounds |
| sounds_pistol.txt | Generic pistol sounds |
| sounds_sniperrifle.txt | Sniper rifle sounds |
| sounds_melee_bladelong.txt | Long blade sounds |
| sounds_melee_bladeshort.txt | Short blade sounds |
| sounds_melee_bluntlong.txt | Long blunt sounds |
| sounds_melee_bluntshort.txt | Short blunt sounds |
| sounds_spears.txt | Spear weapon sounds |
| sounds_throwable.txt | Throwable weapon sounds |

---

## Script Syntax Reference

### Module Declaration
All scripts start with a module declaration:

```
module Base
{
    imports
    {
        Base
    }

    /* definitions go here */
}
```

### Item Definition
```
item ItemID
{
    DisplayCategory = Category,
    Type = Normal/Weapon/Food/Clothing/Container/Literature/Moveable,
    DisplayName = Display Name,
    Icon = IconName,
    Weight = 1.0,

    /* Type-specific properties */
}
```

---

## Clothing Item Properties

```
item Shirt_Example
{
    DisplayCategory = Clothing,
    Type = Clothing,
    DisplayName = Example Shirt,
    ClothingItem = Shirt_Example,        /* Links to clothing.xml */
    BodyLocation = Shirt,                /* Equip slot */
    Icon = ShirtIcon,
    BloodLocation = ShirtLongSleeves,    /* Where blood appears */

    /* Protection */
    BiteDefense = 7,                     /* Zombie bite protection */
    ScratchDefense = 15,                 /* Scratch protection */

    /* Temperature */
    Insulation = 0.45,                   /* Cold protection 0-1 */
    WindResistance = 0.55,               /* Wind protection 0-1 */

    /* Material */
    FabricType = Cotton/Denim/Leather,

    /* 3D Model */
    WorldStaticModel = Shirt_Ground,
}
```

### BodyLocation Values
- **Head:** Head, Hat, MaskFull, MaskEyes
- **Torso:** Shirt, ShortSleeveShirt, TankTop, Sweater, Jacket
- **Legs:** Pants, Shorts, Skirt
- **Feet:** Shoes, Socks
- **Hands:** Gloves
- **Accessories:** Belt, Scarf, Necklace, Earring, NoseRing

---

## Bag/Container Properties

```
item Bag_Example
{
    DisplayCategory = Bag,
    Type = Container,
    DisplayName = Example Bag,

    /* Container Properties */
    Capacity = 20,                       /* Max weight capacity */
    WeightReduction = 70,                /* % weight reduction of contents */

    Weight = 1.2,                        /* Bag's own weight */
    CanBeEquipped = Back,                /* Where worn: Back, Belt, etc */

    /* Sounds */
    OpenSound = OpenBag,
    CloseSound = CloseBag,
    PutInSound = PutItemInBag,

    /* Visuals */
    ClothingItem = Bag_Example,
    BloodLocation = Bag,
    IconsForTexture = Bag_Blue;Bag_Red,  /* Multiple texture variants */

    /* Movement */
    RunSpeedModifier = 0.95,             /* Speed penalty when worn */

    /* Hand holding */
    ReplaceInSecondHand = Bag_Example_LHand holdingbagleft,
    ReplaceInPrimaryHand = Bag_Example_RHand holdingbagright,

    WorldStaticModel = Bag_Ground,
}
```

---

## Sound Definition

```
sound SoundName
{
    category = Item/Player/Object/World/Zombie,
    clip
    {
        event = Path/To/Sound/Event,
    }
}
```

### Sound Categories
- **Item:** Bag sounds, tool sounds, cooking sounds
- **Player:** Map sounds, farming actions, movement
- **Object:** Door sounds, window sounds, furniture
- **World:** Ambient, weather, environment
- **Zombie:** Zombie vocalizations, attacks

### Common Sound Events

```lua
-- Item Sounds
OpenBag, CloseBag, PutItemInBag
Sawing, Hammering, Screwdriver, BlowTorch
SliceBread, SliceMeat, AddItemInRecipe

-- Player Sounds
MapOpen, MapClose, MapAddNote
UseMatch, UseLighter
BoilingFood, FryingFood
DigFurrowWithShovel, SowSeeds, HarvestCrops

-- Crafting Sounds
Dismantle, FixWithTape, FixingItemFailed
BreakMetalItem, BreakWoodItem, BreakGlassItem
```

---

## Mannequin Definition

```
mannequin MannequinID
{
    female = true/false,
    model = FemaleBody/MaleBody,
    texture = TextureName,
    animSet = mannequin,
    animState = female/male/scarecrow/skeleton,
    pose = pose01/pose02/pose03,
    outfit = OutfitName,                 /* or empty */
}
```

---

## Animation Definition

```
animation RuntimeAnimName
{
    CopyFrame
    {
        frame = 1,
        source = SourceAnimName,
        sourceFrame = 1,
    }
    CopyFrames
    {
        frame = 1,
        source = SourceAnimName,
        sourceFrame1 = 1,
        sourceFrame2 = 21,
    }
}
```

---

## Animation Mesh Definition

```
animationsMesh MeshName
{
    meshFile = Skinned/MeshPath,
    animationDirectory = DirectoryName,
    animationDirectory = AnotherDirectory,  /* Multiple allowed */
}
```

---

## Multi-Stage Build Definition

For wall/construction upgrades:

```
multistagebuild BuildID
{
    PreviousStage:StageName;AltStageName,    /* Required prior stages */
    Name:NewStageName,                        /* Result stage name */
    TimeNeeded:250,                           /* Build time in ticks */
    BonusHealth:400,                          /* HP added to structure */
    BonusSkill:TRUE/FALSE,                    /* Skill bonus applies? */
    SkillRequired:Woodwork=2,                 /* Required skill level */
    ItemsRequired:Base.Plank=2;Base.Nails=4, /* Materials consumed */
    ItemsToKeep:Base.Hammer,                  /* Tools needed but kept */
    Sprite:sprite_name,                       /* Result sprite */
    NorthSprite:sprite_name_north,            /* North-facing sprite */
    CanBePlastered:true,                      /* Can apply plaster */
    WallType:wall/doorframe/windowsframe,    /* Wall type */
    CraftingSound:Hammering,                  /* Sound during build */
    CompletionSound:BuildComplete,            /* Sound on finish */
    ID:Display Name,                          /* Shown to player */
    XP:Woodwork=10,                           /* XP awarded */
    KnownRecipe:Recipe Name,                  /* Required known recipe */
    ThumpSound:ZombieThumpMetal,              /* Zombie attack sound */
    CanBarricade:true,                        /* Can add barricades */
}
```

### Build Stages

**Wooden Walls:**
- WoodenWallFrame → WoodenWallLvl1 → WoodenWallLvl2 → WoodenWallLvl3

**Metal Walls:**
- MetalWallFrame → MetalWallLvl1 → MetalWallLvl2

**Door Frames:**
- WoodenDoorFrameLvl1 → WoodenDoorFrameLvl2 → WoodenDoorFrameLvl3

**Windows:**
- WoodenWindowLvl1 → WoodenWindowLvl2 → WoodenWindowLvl3
- MetalWindowLvl1 → MetalWindowLvl2

---

## Moveable Item Definition

```
item Mov_FurnitureName
{
    DisplayCategory = Furniture,
    Type = Moveable,
    Icon = default,
    Weight = 0.5,
    DisplayName = Display Name,
    WorldObjectSprite = sprite_sheet_00_00,  /* World sprite reference */
}
```

### Common Moveable Categories
- **Seating:** Chairs, stools, benches
- **Storage:** Lockers, shelves, cabinets
- **Bathroom:** Sinks, toilets, bathtubs
- **Kitchen:** Ovens, refrigerators, counters
- **Decorative:** Plants, paintings, lamps

---

## Camping Items & Recipes

### Camping Items
```
item CampfireKit
{
    DisplayCategory = Camping,
    Type = Normal,
    DisplayName = Campfire Materials,
    Icon = TZ_CampfireKitWood,
    Weight = 2.0,
    WorldStaticModel = CampfireMaterials,
}

item CampingTentKit
{
    DisplayCategory = Camping,
    Type = Normal,
    DisplayName = Tent Kit,
    Icon = TZ_TentKit,
    Weight = 3.0,
    WorldStaticModel = CampingTentKit_Ground,
}
```

### Camping Recipes
```
recipe Make Campfire Kit
{
    Plank = 3,
    RippedSheets/RippedSheetsDirty/Sheet/Book/Magazine/Newspaper/Twigs,

    Result:CampfireKit,
    Time:50.0,
    Category:Survivalist,
}

recipe Make Tent Kit
{
    Tarp,
    TentPeg = 4,
    WoodenStick = 2,

    Result:CampingTentKit,
    Time:120.0,
    Category:Survivalist,
}
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Item syntax | Complete |
| Clothing properties | Complete |
| Bag properties | Complete |
| Sound definitions | Complete |
| Mannequin definitions | Complete |
| Animation definitions | Complete |
| Multi-stage build | Complete |
| Moveable items | Complete |
| Camping system | Complete |
| vehicles/ folder | Documented separately |
| fixing.txt | Documented separately |
| farming.txt | Documented separately |

---

## Key Patterns

### Module Imports
```
module MyMod
{
    imports
    {
        Base        /* Import base game items */
    }
}
```

### Item ID References
- Always use `Module.ItemID` format: `Base.Plank`, `Base.Nails`
- In same module, can use just `ItemID`

### Multiple Variants
```
IconsForTexture = Variant1;Variant2;Variant3,
```

### Sound References
- Define sound in sounds_*.txt
- Reference by name in items: `OpenSound = SoundName`

---

## Next Steps

1. Document individual weapon types in detail
2. Create clothing body location reference
3. Document sound event paths
4. Create moveable sprite reference
