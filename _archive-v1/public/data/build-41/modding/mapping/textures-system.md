# textures/ Folder Documentation

**Location:** `media/textures/`
**Purpose:** 3D model textures, character skins, item visuals, environment textures

---

## Folder Structure

```
textures/
├── [root files]           # Character textures, hats, accessories (~400 files)
├── BloodTextures/         # Blood overlay textures
├── Body/                  # Body skin textures
├── BodyDmg/               # Body damage overlays
├── Clothes/               # Clothing textures organized by type
├── CMVehicleReflection/   # Vehicle reflection maps
├── Foraging/              # Foraging item textures
├── highlights/            # Highlight/glow textures
├── HoleTextures/          # Hole/damage textures
├── patches/               # Clothing patch textures
├── shirtdecals/           # T-shirt decal textures
├── Vehicles/              # Vehicle textures
├── weapons/               # Weapon textures
├── weather/               # Weather effect textures
├── WorldItems/            # Inventory/world item icons
└── worldMap/              # World map textures
```

---

## Root Texture Files (~400 files)

### Character Body Textures

| Pattern | Purpose |
|---------|---------|
| `Bob_Body.png` | Male base body texture |
| `Bob_*_Body.png` | Male body variants (2-8) |
| `BobZ_Body*.png` | Male zombie body textures |
| `Male_Body.png` | Alternative male body |
| `Female_Body.png` | Female base body |
| `Zombie_Body*.png` | Zombie body variants (1-5) |

### Hair Textures

| Pattern | Purpose |
|---------|---------|
| `F_Hair_*.png` | Female hair colors (Blonde, Black, Brown, Red, Grey, White) |
| `F_HairCurly_*.png` | Female curly hair styles |
| `F_Hair_Braids.png` | Female braids |
| `Hair_*.png` | Male hair textures |
| `HairShort*.png` | Male short hair variants |

### Hat/Headwear Textures

| Category | Examples |
|----------|----------|
| Military | `ArmyHelmet.png`, `BeretArmy.png`, `BeretGreen.png` |
| Sports | `BaseballHelmet_*.png`, `FootballHelmet_*.png`, `IceHockeyHelmet.png` |
| Work | `HardHat*.png`, `ChefHat*.png`, `FiremanHat.png` |
| Fashion | `Fedora*.png`, `CowboyHat_*.png`, `SummerHat*.png` |
| Winter | `WinterHat*.png`, `WoolyHat_*.png`, `BeanyHatWhite.png` |
| Masks | `Balaclava_*.png`, `GasMask.png`, `HockeyMask.png`, `NBC_Mask.png` |

### Clothing Textures (Root)

| Category | Examples |
|----------|----------|
| Shirts | `Shirt_*.png`, `ClothingTShirt.png` |
| Pants | `Trousers_*.png`, `ClothingJeans.png` |
| Jackets | `Jacket_*.png`, `JacketFireman.png`, `JacketPolice.png` |
| Accessories | `Scarf_*.png`, `BandanaBlack.png`, `BandanaMask_*.png` |
| Jewelry | `Necklace_*.png`, `Ring_*.png`, `Earring*.png`, `Bracelet*.png` |

### Bag Textures

| Item | File |
|------|------|
| School Bag | `schoolbag*.png` |
| Hiking Bag | `HikingBag*.png`, `BigHikingBag*.png` |
| Duffel Bag | `DuffelBag*.png` |
| ALICE Pack | `ALICEpack_*.png` |
| Doctor Bag | `DoctorBag.png` |
| Golf Bag | (in Clothes/Bag/) |

### Effect Textures

| File | Purpose |
|------|---------|
| `FireFlame.png` | Fire effect sprite sheet |
| `FireSmokes.png` | Smoke particle effects |
| `FireSparksFlare.png` | Spark effects |
| `CorpseFlies.png` | Fly swarm effect |
| `RotOverlay.png` | Food rot overlay |
| `muzzle-flash-*.png` | Gun muzzle flash effects |

### Environment Textures

| File | Purpose |
|------|---------|
| `grass.png` | Grass texture (10MB) |
| `floor.png` | Floor texture |
| `wall.png` | Wall texture |
| `puddles_hm.png` | Puddle heightmap |
| `river_bottom.png` | River bottom texture |

---

## Clothes/ Subfolder

Organized by clothing type:

```
Clothes/
├── Apron/            # Apron textures
├── Bag/              # Bag/backpack textures
├── Bathrobe/         # Bathrobe textures
├── BolierSuit/       # Boiler suit textures
├── BulletVest/       # Bulletproof vest textures
├── Dress_Textures/   # Dress textures
├── Dungarees/        # Dungaree textures
├── Ghillie/          # Ghillie suit textures
├── Gloves/           # Glove textures
├── Hat/              # Hat textures
├── Hazmat/           # Hazmat suit textures
├── Hoodie/           # Hoodie textures
├── Jacket/           # Jacket textures
├── JacketLong/       # Long coat textures
├── JacketPadded/     # Padded jacket textures
├── JacketVarsity/    # Varsity jacket textures
├── Jewellery/        # Jewelry textures
├── Jumper/           # Sweater/jumper textures
├── LongCoat/         # Long coat textures
└── Poncho/           # Poncho textures
```

---

## weapons/ Subfolder

```
weapons/
├── 1handed/          # One-handed weapon textures
├── 2handed/          # Two-handed weapon textures
├── firearm/          # Firearm textures
└── parts/            # Weapon parts/attachments
```

---

## WorldItems/ Subfolder

Inventory icons and world item textures (~1000+ files).

### Naming Convention
```
ItemName.png              # Base item
ItemNameCooked.png        # Cooked variant
ItemNameRotten.png        # Rotten variant
ItemNameCookedRotten.png  # Cooked then rotten
```

### Categories

| Category | Examples |
|----------|----------|
| Food | `Apple.png`, `Bagel.png`, `BaconBaconBits.png` |
| Tools | `AdhesiveTape.png`, `AlarmClock_*.png` |
| Medical | `AlcoholWipes.png`, `Antibiotics.png` |
| Weapons | (in weapons/ subfolder) |
| Misc | `Acorn.png`, `Aluminum.png` |

---

## Texture Format Requirements

### File Format
- **Format:** PNG with alpha channel
- **Color depth:** 32-bit RGBA

### Size Guidelines

| Type | Typical Size |
|------|--------------|
| Inventory icons | 32x32, 64x64 |
| Body textures | 512x512, 1024x1024 |
| Clothing textures | 256x256, 512x512 |
| Environment | 1024x1024, 2048x2048 |

### Naming Conventions

```
ItemName.png           # Standard item
ItemName_Color.png     # Color variant
ItemName_Rotten.png    # State variant
Male_ItemName.png      # Gender-specific
F_ItemName.png         # Female-specific
```

---

## Color Variants Pattern

Many items have multiple color variants:

```
BaseItem_Black.png
BaseItem_Blue.png
BaseItem_Brown.png
BaseItem_Green.png
BaseItem_Grey.png
BaseItem_Red.png
BaseItem_White.png
```

### Common Color Suffixes
- `_Black`, `_Blue`, `_Brown`, `_Green`, `_Grey`, `_Red`, `_White`
- `_Camo`, `_CamoGreen`, `_CamoGrey`, `_CamoSand`
- `_Gold`, `_Silver`
- `_Light`, `_Dark`

---

## Special Texture Types

### Blood Textures (BloodTextures/)
- Overlay textures for blood splatters
- Applied to clothing and environment

### Body Damage (BodyDmg/)
- Wound overlays
- Injury indicators

### Shirt Decals (shirtdecals/)
- T-shirt print designs
- Applied over base shirt texture
- Referenced in clothingDecals.xml

### Highlights (highlights/)
- Glow/highlight effects
- Selection indicators

### Hole Textures (HoleTextures/)
- Bullet holes
- Damage marks

---

## Adding Custom Textures

### Step 1: Create Texture File

```
MyMod/media/textures/MyItem.png
```

Requirements:
- PNG format with transparency
- Power of 2 dimensions recommended
- Consistent style with vanilla

### Step 2: Reference in Item Script

```
item MyItem
{
    Icon = MyItem,              /* References MyItem.png in textures/ */
    WorldStaticModel = MyItem,  /* Or use 3D model */
}
```

### Step 3: For Clothing

```
item MyShirt
{
    ClothingItem = MyShirt,
    Icon = MyShirtIcon,
}
```

Place texture in appropriate Clothes/ subfolder.

---

## Texture Packs

Additional textures in `media/texturepacks/`:
- Compressed texture collections
- Alternative resolution packs
- DLC content

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Root textures | Complete |
| Clothes/ structure | Complete |
| weapons/ structure | Complete |
| WorldItems/ overview | Complete |
| Naming conventions | Complete |
| Format requirements | Complete |
| Color variants | Complete |
| Custom texture guide | Complete |

---

## Key Patterns

### Inventory Icon Lookup
- Script `Icon = IconName` → `textures/IconName.png` or `textures/WorldItems/IconName.png`

### Clothing Texture Lookup
- Script `ClothingItem = ItemName` → clothing.xml → texture path

### Body Texture Variants
- Numbered variants (Body1, Body2, etc.) for zombie variety
- Z suffix for zombie-specific textures

---

## Next Steps

1. Document texture pack format
2. Create sprite sheet documentation
3. Document UV mapping requirements
4. Create texture creation tutorial
