# PZ Media Mapping Documentation

This folder contains raw research documentation of Project Zomboid's `media/` folder structure. These markdown files serve as:

1. **Research notes** - Raw findings from analyzing vanilla files
2. **AI context** - Reference data for assisting modders
3. **Article drafts** - Can be converted to wiki articles later

## Completed Documentation

```
mapping/
├── README.md                     # This file
├── lua-shared.md                 # lua/shared/ analysis (66 files)
├── lua-client.md                 # lua/client/ analysis (692+ files)
├── lua-server.md                 # lua/server/ analysis (130 files)
├── scripts-overview.md           # scripts/ folder analysis (30+ files)
├── clothing-system.md            # clothing/ analysis (outfits, items)
├── radio-system.md               # radio/ analysis (channels, broadcasts)
├── maps-system.md                # maps/ analysis (zones, spawns)
├── textures-system.md            # textures/ analysis (400+ files)
├── models-system.md              # models/ analysis (3D models, vehicles)
├── sound-system.md               # sound/ analysis (FMOD, sound scripts)
├── tiles-system.md               # tile definitions (.tiles files)
├── animation-system.md           # animation system (AnimSets, actiongroups)
├── foraging-system.md            # foraging zones, items, professions
├── literature-system.md          # books, magazines, skill books
├── loot-distribution.md          # container loot tables, room distributions
├── procedural-distributions.md   # ProceduralDistributions.lua (450+ lists)
├── vehicle-distributions.md      # vehicle loot tables (27+ vehicle types)
├── zombie-spawning.md            # zombie outfits by zone (50+ zones)
├── professions-traits.md         # professions (24), traits (70+), XP boosts
├── sandbox-options.md            # sandbox settings, presets, zombie config
└── seasonal-content.md           # foraging seasons, holiday items
```

## Status

| File | Status | Coverage |
|------|--------|----------|
| lua-shared.md | Complete | ISBaseObject, defines, luautils, Reloading, Foraging |
| lua-client.md | Complete | ISUI hierarchy, TimedActions, Context menus |
| lua-server.md | Complete | Recipe callbacks, NPCs, Vehicles, Farming |
| scripts-overview.md | Complete | Items, recipes, sounds, animations, clothing scripts |
| clothing-system.md | Complete | clothing.xml, outfits, body locations, decals |
| radio-system.md | Complete | Channels, broadcasts, timeline, advertisements |
| maps-system.md | Complete | Zones, spawn points, worldmap, cell coordinates |
| textures-system.md | Complete | Texture folders, naming conventions, sprite sheets |
| models-system.md | Complete | 3D model format, vehicle models, character models |
| sound-system.md | Complete | FMOD banks, sound scripts, event paths |
| tiles-system.md | Complete | Tile properties, IsoTypes, container types |
| animation-system.md | Complete | AnimSets, action groups, state machines, bones |
| foraging-system.md | Complete | Zones, categories, items, profession bonuses |
| literature-system.md | Complete | Skill books, recipe magazines, entertainment |
| loot-distribution.md | Complete | Room distributions, container types, merging |
| procedural-distributions.md | Complete | 450+ named loot lists, categories |
| vehicle-distributions.md | Complete | 27+ vehicle types, profession-themed loot |
| zombie-spawning.md | Complete | 50+ zone types, outfit rules, hair system |
| professions-traits.md | Complete | 24 professions, 70+ traits, mutual exclusions |
| sandbox-options.md | Complete | 7 presets, 100+ options, zombie config |
| seasonal-content.md | Complete | Foraging seasons, holiday items, weather |

## Pending Documentation

*All core systems documented!*

## Key Findings

### Lua Architecture
- `ISBaseObject:derive()` inheritance pattern
- Client/Server/Shared folder separation
- TimedAction lifecycle (7 phases)
- Recipe callback system

### Script System
- Module-based script files
- Item/Recipe/Vehicle/Fixing definitions
- Sound event mappings
- Multi-stage building system

### World System
- Cell-based map structure (300x300 tiles)
- Zone types for zombie spawning
- Profession-based spawn points
- XML-based world features

### Asset Systems
- Custom text-based 3D model format (76-byte vertex stride)
- Texture naming conventions with color variants
- Vehicle models with burnt variants
- Skeletal animation support for characters

### Audio System
- FMOD sound bank integration
- Hierarchical event paths
- Sound script definitions
- Category-based audio organization

### Animation System
- State machine-based action groups
- Bone structure (35 bones)
- Animation variables for blending
- 1,100+ player animations, 167 zombie animations

### Tile System
- Binary tile definition files
- IsoType classes for behavior
- Container and collision properties
- Material and scrap definitions

### Foraging System
- Zone-based item distribution
- Profession/trait bonuses
- Seasonal availability
- Vision and weather penalties

### Literature System
- Skill books with XP multipliers (5 volumes per skill)
- Recipe magazines teach crafting
- Entertainment reduces boredom/stress

### Loot Distribution System
- Two-tier distribution: Room + Procedural
- 100+ room types with container definitions
- 450+ procedural distribution lists
- Weight-based spawn chances
- Time-based loot via min/max days
- Distribution merging for mods

### Vehicle Distribution System
- Profession-themed vehicle loot (27+ types)
- Container types: GloveBox, TruckBed, Seats
- Tiered parts (Standard/Heavy/Sports)
- Service vehicles (Police, Fire, Ambulance)
- Commercial vehicles (Postal, Spiffo, McCoy)

### Zombie Spawning System
- Zone-based outfit distribution (50+ zones)
- Location-appropriate zombies (doctors in hospitals, etc.)
- Mandatory vs chance-based outfits
- Room-specific restrictions (inmates in cells)
- Hair/beard style rules by outfit

### Profession & Trait System
- 24 vanilla professions with point costs (-8 to +8)
- 70+ traits with positive/negative point values
- XP boost system (+1 to +3 skill levels)
- Free traits granted by professions
- Mutual exclusion system for trait conflicts
- ProfessionFactory/TraitFactory Java APIs

### Sandbox Options System
- 7 built-in presets (Survival, Apocalypse, Builder, Beginner, etc.)
- 100+ configurable options across 12 categories
- Zombie lore settings (speed, strength, transmission, etc.)
- Advanced population controls (multipliers, respawn, rallying)
- Loot rarity multipliers by category
- Vehicle spawn and condition settings

### Seasonal Content
- Foraging availability by month (bonusMonths/malusMonths)
- Weather temperature cycles by season
- Holiday items (Santa outfits) - cosmetic only
- No scripted real-world date events

## How to Use

These files document:
- File locations and purposes
- Function signatures and parameters
- Inheritance hierarchies
- Common patterns and examples
- Cross-references between systems

When ready, content can be converted to JSON article format for the wiki.

## Converting to Articles

1. Extract specific topics into focused JSON articles
2. Add to appropriate category (lua-api, reference, etc.)
3. Update index.json files
4. Remove redundant content from mapping files
