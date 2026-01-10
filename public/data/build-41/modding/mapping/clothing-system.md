# clothing/ Folder Documentation

**Location:** `media/clothing/`
**Purpose:** Character outfit definitions, clothing items, and decals

---

## Folder Structure

```
clothing/
├── clothing.xml           # Main outfit and clothing item definitions (440KB)
├── clothingDecals.xml     # T-shirt decal groups
├── clothingDecals/        # Decal texture files
└── clothingItems/         # Clothing texture files
```

---

## clothing.xml Structure

The main XML file defines outfits and clothing items.

### Outfits

Outfits are predefined sets of clothing for NPCs and character presets.

```xml
<outfitManager>
    <m_FemaleOutfits>
        <m_Name>OutfitName</m_Name>
        <m_Guid>unique-guid-here</m_Guid>
        <m_Top>false</m_Top>
        <m_Pants>false</m_Pants>
        <m_AllowPantsHue>false</m_AllowPantsHue>
        <m_AllowTopTint>false</m_AllowTopTint>
        <m_AllowTShirtDecal>false</m_AllowTShirtDecal>
        <m_items>
            <itemGUID>clothing-item-guid</itemGUID>
        </m_items>
        <m_items>
            <probability>0.8</probability>
            <itemGUID>optional-item-guid</itemGUID>
            <subItems>
                <itemGUID>variant-guid-1</itemGUID>
            </subItems>
            <subItems>
                <itemGUID>variant-guid-2</itemGUID>
            </subItems>
        </m_items>
    </m_FemaleOutfits>

    <m_MaleOutfits>
        <!-- Same structure as female -->
    </m_MaleOutfits>
</outfitManager>
```

### Outfit Properties

| Property | Type | Description |
|----------|------|-------------|
| m_Name | string | Outfit identifier name |
| m_Guid | GUID | Unique identifier |
| m_Top | bool | Whether outfit includes a top |
| m_Pants | bool | Whether outfit includes pants |
| m_AllowPantsHue | bool | Allow pants color variation |
| m_AllowTopTint | bool | Allow top color tinting |
| m_AllowTShirtDecal | bool | Allow t-shirt decals |

### Item Entry Properties

| Property | Type | Description |
|----------|------|-------------|
| itemGUID | GUID | Reference to clothing item |
| probability | float | Chance to spawn (0-1, default 1.0) |
| subItems | list | Alternative variants (one chosen randomly) |

---

## Known Outfits (100+)

### Professional Outfits
- AmbulanceDriver
- Chef, Cook_Generic, Cook_IceCream, Cook_Spiffos
- Doctor, Nurse, Pharmacist
- Fireman, FiremanFullSuit
- Police, PoliceState
- Postal, Ranger
- Teacher, FitnessInstructor
- Waiter_Classy, Waiter_Diner, Waiter_Market

### Work Uniforms
- Fossoil, Gas2Go, ThunderGas
- GigaMart_Employee
- HazardSuit

### Military/Tactical
- ArmyCamoDesert, ArmyCamoGreen
- ArmyServiceUniform
- PrivateMilitia
- Survivalist, Survivalist02, Survivalist03

### Casual/Generic
- Generic01 through Generic05
- Generic_Skirt
- Camper, Tourist
- Farmer, Redneck
- Student, Varsity

### Sports
- BaseballFan_KY, BaseballFan_Rangers, BaseballFan_Z
- BaseballPlayer_KY, BaseballPlayer_Rangers, BaseballPlayer_Z
- Bowling, BoxingBlue, BoxingRed
- Cyclist, Golfer, Jockey04, Jockey05
- Ski, SportsFan, StreetSports, Swimmer

### Special
- Bandit, Biker, Punk, Rocker
- Classy, DressLong, DressNormal, DressShort
- HospitalPatient
- Hobbo (homeless)
- Party
- Santa, SantaGreen
- Spiffo (mascot)
- TinFoilHat

### Story Characters
- Kate, Joan
- Jackie_Jaye, Kirsty_Kormick
- TutorialMom

---

## clothingDecals.xml

Defines t-shirt decal groups for character customization.

```xml
<clothingDecals>
    <group>
        <name>GroupName</name>
        <decal>DecalTextureName1</decal>
        <decal>DecalTextureName2</decal>
    </group>
    <group>
        <name>CompositeGroup</name>
        <group>OtherGroupName</group>  <!-- Include another group -->
    </group>
</clothingDecals>
```

### Decal Groups

| Group | Contents |
|-------|----------|
| TShirtIndieStone | TShirtRJ, TShirtPie |
| TShirtSpiffo | TShirtSpiffo1-6 |
| TShirtSport | Sport team decals (Alpha, KY, Rangers, Z, BasketBall, Omega) |
| TShirtCulture | ILoveKY, Rock, USAflag, Wolf, Shamrock, Cardinal |
| TShirtAll | Combines IndieStone, Sport, Culture |
| TShirtFossoil | Fossoil business logos |
| TShirtMcCoys | McCoys restaurant |
| TShirtValleyStation | Valley Station logo |
| TShirtPileOCrepe | Pile O' Crepe restaurant |
| TShirtPizzaWhirled | Pizza Whirled restaurant |
| TShirtGas2Go | Gas 2 Go station |
| TShirtThunderGas | Thunder Gas station |
| TShirtBusinessSpiffo | Spiffo's restaurant |
| TShirtRock | Rock-themed decals |

---

## Clothing Items (scripts/clothing/)

Clothing items are defined in script files that link to clothing.xml entries.

### Body Locations

Body locations determine where clothing is equipped:

**Head:**
- Head, Hat, MaskFull, MaskEyes, Ears

**Torso:**
- Shirt (long sleeve)
- ShortSleeveShirt
- TankTop
- Sweater
- Jacket
- TorsoExtra, TorsoExtraVest

**Legs:**
- Pants
- Shorts
- Skirt

**Feet:**
- Shoes
- Socks

**Hands:**
- Gloves, HandsLeft, HandsRight

**Accessories:**
- Belt, BeltExtra
- Scarf
- Necklace, Necklace_Long
- Earring, NoseRing, Nose
- Tail
- Back (backpacks)

---

## Clothing Script Properties

From `scripts/clothing/*.txt`:

```
item ClothingItemID
{
    DisplayCategory = Clothing,
    Type = Clothing,
    DisplayName = Display Name,
    ClothingItem = ClothingXMLName,      /* Links to clothing.xml */
    BodyLocation = Shirt,                 /* Equip slot */
    Icon = IconTextureName,
    BloodLocation = ShirtLongSleeves,    /* Blood overlay area */

    /* Protection Stats */
    BiteDefense = 0-100,                 /* Zombie bite protection % */
    ScratchDefense = 0-100,              /* Scratch protection % */

    /* Temperature Stats */
    Insulation = 0.0-1.0,                /* Cold protection */
    WindResistance = 0.0-1.0,            /* Wind protection */

    /* Material */
    FabricType = Cotton/Denim/Leather/Wool,

    /* Visual Variants */
    IconsForTexture = Icon1;Icon2;Icon3, /* Multiple color variants */

    /* 3D Model */
    WorldStaticModel = ModelName_Ground,
}
```

### Protection Values by Material

| Material | BiteDefense | ScratchDefense |
|----------|-------------|----------------|
| Cotton | 0-2 | 0-5 |
| Denim | 5-10 | 10-20 |
| Leather | 15-25 | 20-40 |
| Kevlar | 50+ | 50+ |

### Insulation Values

| Rating | Insulation | Example |
|--------|------------|---------|
| Very Low | 0.05-0.15 | Tank top, shorts |
| Low | 0.15-0.30 | T-shirt, light pants |
| Medium | 0.30-0.50 | Long sleeve, jeans |
| High | 0.50-0.70 | Sweater, thick pants |
| Very High | 0.70-1.0 | Winter coat, snow pants |

---

## BloodLocation Values

Determines where blood splatter appears on clothing:

| Location | Used For |
|----------|----------|
| Shirt | Long-sleeve shirts |
| ShirtLongSleeves | Same as Shirt |
| ShortSleeveShirt | T-shirts, polos |
| TShirt | Tank tops |
| Jacket | Jackets, coats |
| Pants | Full-length pants |
| Shorts | Short pants |
| Skirt | Skirts, dresses |
| Bag | Backpacks, bags |
| Head | Hats, helmets |
| Hands | Gloves |
| Shoes | Footwear |

---

## Adding Custom Clothing

### Step 1: Create Clothing Item Script

```
module MyMod
{
    item Hat_MyCustomHat
    {
        DisplayCategory = Clothing,
        Type = Clothing,
        DisplayName = My Custom Hat,
        ClothingItem = Hat_MyCustomHat,
        BodyLocation = Hat,
        Icon = MyHatIcon,
        BloodLocation = Head,
        BiteDefense = 5,
        ScratchDefense = 10,
        Insulation = 0.2,
        WindResistance = 0.3,
        WorldStaticModel = Hat_Ground,
    }
}
```

### Step 2: Add to clothing.xml (optional for outfits)

```xml
<m_MaleOutfits>
    <m_Name>MyCustomOutfit</m_Name>
    <m_Guid>generate-unique-guid</m_Guid>
    <m_items>
        <itemGUID>your-item-guid</itemGUID>
    </m_items>
</m_MaleOutfits>
```

### Step 3: Create Textures

Place textures in:
- `media/textures/` for icons
- `media/clothing/clothingItems/` for 3D textures

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Outfit structure | Complete |
| Known outfits list | Complete |
| Decal groups | Complete |
| Body locations | Complete |
| Protection values | Complete |
| Blood locations | Complete |
| Custom clothing guide | Complete |
| Individual item catalog | Not started |

---

## Key Patterns

### GUID Generation
- Use any GUID generator
- Must be unique across all clothing.xml entries
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Texture Variants
```
IconsForTexture = Variant1;Variant2;Variant3,
```
Each variant creates a separate spawnable item with same stats.

### Probability Spawning
```xml
<m_items>
    <probability>0.3</probability>  <!-- 30% chance -->
    <itemGUID>...</itemGUID>
</m_items>
```

### Sub-Item Variants
```xml
<m_items>
    <itemGUID>base-item</itemGUID>
    <subItems>
        <itemGUID>color-variant-1</itemGUID>
    </subItems>
    <subItems>
        <itemGUID>color-variant-2</itemGUID>
    </subItems>
</m_items>
```
One variant is chosen randomly when outfit spawns.

---

## Next Steps

1. Document all body location slots in detail
2. Create clothing item type catalog
3. Document 3D model requirements
4. Create outfit creation tutorial
