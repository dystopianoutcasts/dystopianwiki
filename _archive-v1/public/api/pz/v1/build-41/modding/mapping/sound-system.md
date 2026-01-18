# sound/ Folder Documentation

**Location:** `media/sound/`
**Purpose:** Audio files and FMOD sound banks for game audio

---

## Folder Structure

```
sound/
├── banks/                      # FMOD sound banks
│   └── Desktop/               # Desktop platform banks
│       ├── radio.bank         # Radio audio (~9MB)
│       ├── ZomboidMusic.bank  # Music tracks (~320MB)
│       ├── ZomboidSound.bank  # Sound effects (~344MB)
│       ├── ZomboidSound.strings.bank  # String table (~60KB)
│       └── ZomboidSoundMP.bank # Multiplayer sounds (~14MB)
├── *.ogg                       # Legacy OGG audio files
└── *.wav                       # Legacy WAV audio files
```

---

## FMOD Integration

Project Zomboid uses FMOD for audio management.

### Bank Files

| Bank | Size | Contents |
|------|------|----------|
| ZomboidMusic.bank | ~320 MB | Background music, ambient tracks |
| ZomboidSound.bank | ~344 MB | All sound effects |
| ZomboidSoundMP.bank | ~14 MB | Multiplayer-specific sounds |
| radio.bank | ~9 MB | Radio broadcast audio |
| ZomboidSound.strings.bank | ~60 KB | String lookups for events |

### Event Path Format

FMOD events use hierarchical paths:
```
Category/Subcategory/SoundName
```

Examples:
- `Character/Foley/Bag/Open`
- `Weapon/Firearm/Pistol/Shoot`
- `World/Ambiance`
- `Meta/Helicopter`
- `Game/LevelUp`

---

## Sound Categories

Sounds are organized by category in scripts.

### Player Sounds (`sounds_player.txt`)

| Sound Name | Event Path | Description |
|------------|------------|-------------|
| GainExperienceLevel | Game/LevelUp | Level up notification |
| PlayerDied | Game/GameOver | Death sound |
| DrinkingFromBottle | Character/Survival/Drink/FromBottle | Drinking sounds |
| DrinkingFromCan | Character/Survival/Drink/FromCan | Can drinking |
| DrinkingFromMug | Character/Survival/Drink/FromMug | Mug drinking |
| DrinkingFromCarton | Character/Survival/Drink/FromCarton | Carton drinking |

### Item Sounds (`sounds_item.txt`)

| Sound Name | Event Path | Description |
|------------|------------|-------------|
| OpenBag | Character/Foley/Bag/Open | Bag opening |
| CloseBag | Character/Foley/Bag/Close | Bag closing |
| PutItemInBag | Character/Foley/Bag/StoreItem | Item storage |
| LightbulbBurnedOut | Object/Light/BulbBurnOut | Light failure |
| CastFishingLine | Character/Survival/Fishing/CastLine | Fishing cast |
| Sawing | Character/Survival/Carpentry/Sawing | Carpentry |
| Shoveling | Character/Survival/Farming/Shovel | Digging |

### World Sounds (`sounds_world.txt`)

| Sound Name | Event Path | Loop | Description |
|------------|------------|------|-------------|
| WorldAmbiance | World/Ambiance | Yes | Environment ambient |
| TentAmbiance | World/Object/Tent | Yes | Tent ambient |
| TreeAmbiance | World/Object/Tree | Yes | Forest ambient |
| VehicleAmbiance | World/Object/Vehicle | Yes | Vehicle idle |
| CatchFish | Character/Survival/Fishing/CatchFish | No | Fish caught |
| LureHitWater | Character/Survival/Fishing/LureHitWater | No | Lure splash |

### Meta Sounds (`sounds_meta.txt`)

Meta sounds are distant/environmental events:

| Sound Name | Event Path | Description |
|------------|------------|-------------|
| Helicopter | Meta/Helicopter | Helicopter event |
| MetaAssaultRifle1 | Meta/AssaultRifle | Distant gunfire |
| MetaPistol1-3 | Meta/Pistol | Distant pistol shots |
| MetaShotgun1 | Meta/Shotgun | Distant shotgun |
| MetaDogBark | Meta/Dog | Dog barking |
| MetaScream | Meta/Scream | Distant scream |
| MetaOwl | Meta/Owl | Owl call |
| MetaWolfHowl | Meta/Wolf | Wolf howl |

### UI Sounds (`sounds_ui.txt`)

Interface audio feedback.

### Object Sounds (`sounds_object.txt`)

World object interactions (doors, windows, alarms).

### Zombie Sounds (`sounds_zombie.txt`)

Zombie vocalizations and impacts.

---

## Weapon Sound Scripts

Located in `scripts/weapons/`:

### Sound Script Structure

```
module Base
{
    sound PistolShoot
    {
        category = Item,
        maxInstancesPerEmitter = 2,
        clip
        {
            event = Weapon/Firearm/Pistol/Shoot,
        }
    }
}
```

### Sound Properties

| Property | Type | Description |
|----------|------|-------------|
| category | string | Sound category (Item, Player, World, Meta) |
| master | string | Master bus (Ambient, etc.) |
| loop | bool | Whether sound loops |
| maxInstancesPerEmitter | int | Max concurrent plays per source |
| clip | block | Contains the FMOD event reference |
| event | string | FMOD event path |

### Weapon Sound Files

| File | Weapon Type |
|------|-------------|
| sounds_pistol.txt | Generic pistol |
| sounds_m9.txt | M9 pistol |
| sounds_m36.txt | M36 revolver |
| sounds_m625.txt | M625 revolver |
| sounds_magnum.txt | Magnum revolver |
| sounds_deserteagle.txt | Desert Eagle |
| sounds_m1811.txt | M1911 pistol |
| sounds_m16.txt | M16 assault rifle |
| sounds_m14.txt | M14 rifle |
| sounds_msr700.txt | MSR700 rifle |
| sounds_msr788.txt | MSR788 rifle |
| sounds_sniperrifle.txt | Sniper rifle |
| sounds_doublebarrelshotgun.txt | Double barrel |
| sounds_js2000shotgun.txt | JS-2000 shotgun |
| sounds_sawnoffdoublebarrelshotgun.txt | Sawed-off double barrel |
| sounds_sawnoffjs2000shotgun.txt | Sawed-off JS-2000 |
| sounds_melee_bladelong.txt | Long blade weapons |
| sounds_melee_bladeshort.txt | Short blade weapons |
| sounds_melee_bluntlong.txt | Long blunt weapons |
| sounds_melee_bluntshort.txt | Short blunt weapons |
| sounds_spears.txt | Spear weapons |
| sounds_throwable.txt | Throwable weapons |
| sounds_magazine.txt | Magazine operations |
| sounds_boxofrounds.txt | Ammo box sounds |
| sounds_boxofshells.txt | Shell box sounds |

### Weapon Sound Events

Per weapon typically includes:
- `[Weapon]Shoot` - Firing sound
- `[Weapon]InsertAmmo` - Loading ammo
- `[Weapon]EjectAmmo` - Unloading
- `[Weapon]Rack` - Racking/cycling
- `[Weapon]Jam` - Weapon jam
- `[Weapon]InsertAmmoStart/Stop` - Loading sequence
- `[Weapon]EjectAmmoStart/Stop` - Unloading sequence

---

## Legacy Audio Files

The sound folder contains ~620 legacy audio files in OGG and WAV formats.

### File Categories

| Prefix | Count | Description |
|--------|-------|-------------|
| ambient* | ~20 | Ambient sounds |
| zombie* | ~10 | Zombie sounds |
| vehicle_* | ~20 | Vehicle sounds |
| footstep* | ~10 | Footstep sounds |
| assault/pistol/rifle* | ~50 | Distant gunfire |
| stormy* | ~30 | Weather variants |
| thunder* | ~5 | Thunder effects |

### Common Legacy Files

| File | Purpose |
|------|---------|
| 9mmShot.ogg | 9mm gunshot |
| alarmclock.ogg | Alarm clock |
| ambientOutsideDayBirds.ogg | Daytime bird ambient |
| ambientOutsideRainWindThunder.ogg | Storm ambient |
| burgalarm.ogg | Burglar alarm |
| chopper.ogg | Helicopter |
| chopdoor.ogg | Door chopping |
| zombieambient.ogg | Zombie groaning |
| zombiebite.ogg | Bite attack |
| vehicle_start.ogg | Vehicle starting |

---

## Vehicle Sounds (`vehicles/sounds_vehicle.txt`)

Vehicle-specific audio events.

---

## Adding Custom Sounds

### Method 1: Sound Script

Create a sound script in your mod:

```
module MyMod
{
    sound MyCustomSound
    {
        category = Item,
        clip
        {
            file = media/sound/mycustomsound.ogg,
            volume = 1.0,
        }
    }
}
```

### Method 2: Replace FMOD Events

For advanced mods, can modify FMOD banks using FMOD tools.

### Lua Sound Playback

```lua
-- Play sound at position
getSoundManager():PlayWorldSound("MyCustomSound", x, y, z)

-- Play UI sound
getSoundManager():PlaySound("UISound")

-- Play on character
character:playSound("PlayerSound")
```

---

## Event Path Hierarchy

### Character Events
```
Character/
├── Foley/
│   ├── Bag/ (Open, Close, StoreItem)
│   ├── Body/ (movement sounds)
│   └── Cloth/ (fabric sounds)
├── Survival/
│   ├── Carpentry/ (Sawing, Hammering)
│   ├── Drink/ (FromBottle, FromCan, etc.)
│   ├── Farming/ (Shovel, Water)
│   └── Fishing/ (CastLine, CatchFish)
└── Voice/ (speech, reactions)
```

### Weapon Events
```
Weapon/
├── Firearm/
│   ├── Pistol/ (Shoot, Rack, Jam)
│   ├── Rifle/ (Shoot, Rack, Jam)
│   └── Shotgun/ (Shoot, Pump, Jam)
└── Melee/
    ├── Blade/ (Swing, Impact)
    └── Blunt/ (Swing, Impact)
```

### World Events
```
World/
├── Ambiance (main ambient)
├── Object/
│   ├── Tent
│   ├── Tree
│   └── Vehicle
├── Weather/
│   ├── Rain
│   ├── Thunder
│   └── Wind
└── Door/ (Open, Close, Break)
```

### Meta Events
```
Meta/
├── Helicopter
├── AssaultRifle
├── Pistol
├── Shotgun
├── Dog
├── Scream
├── Owl
└── Wolf
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| FMOD banks | Complete |
| Sound scripts | Complete |
| Event hierarchy | Complete |
| Weapon sounds | Complete |
| Legacy files | Complete |
| Custom sound guide | Basic |

---

## Key Patterns

### Category Organization
- `Item` - Object/item sounds
- `Player` - Player action sounds
- `World` - Environmental sounds
- `Meta` - Distant/event sounds

### Event Naming
- Hierarchical paths separated by `/`
- Action names are descriptive (Shoot, Open, Close)
- Variants use numbers (MetaPistol1, MetaPistol2)

### Loop Sounds
- Ambient sounds typically loop
- Use `loop = true` in script
- Set `master = Ambient` for ambient bus

---

## Next Steps

1. Document complete FMOD event list
2. Create sound replacement tutorial
3. Document audio mixing/volume
4. FMOD Studio integration guide
