# Literature System Documentation

**Location:** `media/scripts/items_literature.txt`
**Purpose:** Books, skill books, magazines, recipe magazines, and other readable items

---

## Literature Types

### Overview

| Type | Purpose | Key Properties |
|------|---------|----------------|
| Skill Books | XP multiplier for skills | SkillTrained, LvlSkillTrained, NumLevelsTrained |
| Recipe Magazines | Teach crafting recipes | TeachedRecipes, ReplaceOnUse |
| Entertainment | Reduce stress/boredom | BoredomChange, StressChange, UnhappyChange |
| Writable | Player can write in | CanBeWrite, PageToWrite |

---

## Skill Books

Skill books provide an XP multiplier while reading and for a period after.

### Skill Book Structure

```
item BookCarpentry1
{
    DisplayCategory = SkillBook,
    NumberOfPages = 220,
    Weight = 0.8,
    Type = Literature,
    DisplayName = Carpentry Vol. 1,
    Icon = Book1,
    SkillTrained = Carpentry,      -- Skill to boost
    LvlSkillTrained = 1,           -- Starting level
    NumLevelsTrained = 2,          -- Levels covered
    StaticModel = Book,
    WorldStaticModel = BookRed_Ground,
}
```

### Skill Book Properties

| Property | Type | Description |
|----------|------|-------------|
| SkillTrained | string | Skill perk name |
| LvlSkillTrained | int | Starting skill level (1, 3, 5, 7, or 9) |
| NumLevelsTrained | int | Number of levels covered (usually 2) |
| NumberOfPages | int | Pages to read (affects reading time) |

### Available Skill Books

Each skill has 5 volumes covering levels 0-10:

| Skill | Vol. 1 | Vol. 2 | Vol. 3 | Vol. 4 | Vol. 5 |
|-------|--------|--------|--------|--------|--------|
| Carpentry | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| Cooking | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| Electricity | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| Farming | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| FirstAid | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| Fishing | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| Foraging | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| Mechanics | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| MetalWelding | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| Tailoring | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| Trapping | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |

### Page Counts by Volume

| Volume | Pages |
|--------|-------|
| Vol. 1 | 220 |
| Vol. 2 | 260 |
| Vol. 3 | 300 |
| Vol. 4 | 340 |
| Vol. 5 | 380 |

### Book Icons by Skill

| Skill | Icon |
|-------|------|
| Carpentry | Book1 |
| Cooking | Book9 |
| Electricity | Book6 |
| Farming | Book8 |
| FirstAid | Book2 |
| Fishing | Book5 |
| Foraging | Book3 |
| Mechanics | Book10 |
| MetalWelding | Book7 |
| Tailoring | BookTailoring |
| Trapping | Book4 |

---

## Recipe Magazines

Magazines teach specific crafting recipes when read.

### Recipe Magazine Structure

```
item CookingMag1
{
    DisplayCategory = SkillBook,
    Weight = 0.1,
    Type = Literature,
    DisplayName = Good Cooking Magazine Vol. 1,
    Icon = MagazineFood,
    TeachedRecipes = Make Cake Batter;Make Pie Dough;Make Chocolate Chip Cookie Dough,
    ReplaceOnUse = CookingMag1,
    StaticModel = Magazine,
    WorldStaticModel = MagazineCook1Ground,
}
```

### Recipe Magazine Properties

| Property | Type | Description |
|----------|------|-------------|
| TeachedRecipes | string | Semicolon-separated recipe names |
| ReplaceOnUse | string | Item type after reading (usually same item) |

### Cooking Magazines

| Magazine | Recipes Taught |
|----------|----------------|
| CookingMag1 | Cake Batter, Pie Dough, Cookie Doughs (7 recipes) |
| CookingMag2 | Bread Dough, Biscuits, Pizza |

### Electronics Magazines

| Magazine | Recipes Taught |
|----------|----------------|
| ElectronicsMag1 | Remote Controller V1/V2/V3 |
| ElectronicsMag2 | Make Timer, Add Timer |
| ElectronicsMag3 | Motion Sensor V1/V2/V3 |
| ElectronicsMag4 | Generator |
| ElectronicsMag5 | Remote Trigger, Crafted Trigger |

### Metalwork Magazines

| Magazine | Recipes Taught |
|----------|----------------|
| MetalworkMag1 | Metal Bar, Make Metal Wall Frame |
| MetalworkMag2 | Metal Containers, Bins, Lockers, Shelves |
| MetalworkMag3 | Metal Fence, Fence Posts |
| MetalworkMag4 | Metal Sheet, Small Metal Sheet |

### Smithing Magazines

| Magazine | Recipes Taught |
|----------|----------------|
| SmithingMag1 | Fork, Spoon, Cooking Pot, Roasting Pan, Saucepan, etc. |
| SmithingMag2 | Letter Opener, Nails, Paperclips, Scissors, Door Knob, etc. |
| SmithingMag3 | Tongs, Hammer, Sheet Metal, Medical Tools, Knives, etc. |
| SmithingMag4 | Bullet Molds, Bullets, Crowbar, Axe, Sledgehammer |

### Engineer Magazine

| Magazine | Recipes Taught |
|----------|----------------|
| EngineerMagazine1 | Make Noise Maker |

### Herbalist Magazine

| Magazine | Recipes Taught |
|----------|----------------|
| HerbalistMag | Medical herb recipes |

---

## Entertainment Literature

Items that reduce boredom, stress, and unhappiness.

### Entertainment Properties

| Property | Type | Description |
|----------|------|-------------|
| BoredomChange | int | Boredom reduction (negative = reduce) |
| StressChange | int | Stress reduction (negative = reduce) |
| UnhappyChange | int | Unhappiness reduction (negative = reduce) |

### Entertainment Items

| Item | Boredom | Stress | Unhappy | Weight |
|------|---------|--------|---------|--------|
| Book | -50 | -40 | -40 | 0.5 |
| Magazine | -20 | -15 | 0 | 0.2 |
| TVMagazine | -20 | -15 | 0 | 0.2 |
| ComicBook | -30 | -20 | -20 | 0.1 |
| Newspaper | -15 | -15 | 0 | 0.1 |
| HottieZ | -40 | -50 | 0 | 0.2 |
| Crossword Magazine | -20 | -15 | 0 | 0.2 |
| Wordsearch Magazine | -20 | -15 | 0 | 0.2 |

---

## Writable Items

Items players can write in.

### Writable Properties

| Property | Type | Description |
|----------|------|-------------|
| CanBeWrite | bool | Can player write in it |
| PageToWrite | int | Number of writable pages |

### Writable Items

| Item | Pages | Weight |
|------|-------|--------|
| Journal | 20 | 0.1 |
| SheetPaper2 | 1 | 0.1 |
| Notebook | 40 | 0.2 |
| Doodle | 1 | 0.1 |

---

## World Models

### Book Models

| Model | Color/Type |
|-------|------------|
| BookRed_Ground | Carpentry |
| BookGreen_Ground | Farming |
| BookBlue_Ground | FirstAid |
| BookPurple_Ground | Fishing |
| BookYellowBrown_Ground | Trapping |
| BookGrey_Ground | MetalWelding |
| BookRedPink_Ground | Electricity |
| BookDarkCyan_Ground | Cooking |
| BookBrown_Ground | Mechanics |
| BookForage_Ground | Foraging |
| BookTailoring_Ground | Tailoring |

### Magazine Models

| Model | Type |
|-------|------|
| MagazineGround | Generic |
| MagazineCook1Ground | Cooking 1 |
| MagazineCook2Ground | Cooking 2 |
| MagazineElec1Ground | Electronics 1 |
| MagazineMetal1Ground | Metalwork 1 |
| MagazineOpenGround | Open magazine |
| TVMagazineGround | TV Guide |

---

## Display Categories

| Category | Description |
|----------|-------------|
| Literature | General reading material |
| SkillBook | Skill books and recipe magazines |

---

## Adding Custom Literature

### Custom Skill Book

```
module MyMod
{
    item BookCustomSkill1
    {
        DisplayCategory = SkillBook,
        NumberOfPages = 220,
        Weight = 0.8,
        Type = Literature,
        DisplayName = Custom Skill Vol. 1,
        Icon = Book1,
        SkillTrained = MyCustomSkill,
        LvlSkillTrained = 1,
        NumLevelsTrained = 2,
        StaticModel = Book,
        WorldStaticModel = BookRed_Ground,
    }
}
```

### Custom Recipe Magazine

```
module MyMod
{
    item CustomCraftMag
    {
        DisplayCategory = SkillBook,
        Weight = 0.1,
        Type = Literature,
        DisplayName = Custom Crafting Magazine,
        Icon = Magazine,
        TeachedRecipes = My Recipe 1;My Recipe 2;My Recipe 3,
        ReplaceOnUse = CustomCraftMag,
        StaticModel = Magazine,
        WorldStaticModel = MagazineGround,
    }
}
```

### Custom Entertainment Book

```
module MyMod
{
    item CustomNovel
    {
        DisplayCategory = Literature,
        Weight = 0.5,
        Type = Literature,
        DisplayName = Custom Novel,
        Icon = Book,
        BoredomChange = -60,
        StressChange = -50,
        UnhappyChange = -30,
        StaticModel = Book,
        WorldStaticModel = BookClosedGround,
    }
}
```

---

## Lua Access

### Check if Item is Literature

```lua
local item = player:getInventory():FindAndReturn("Base.BookCarpentry1")
if item and item:getType() == "Literature" then
    -- Is literature
end
```

### Get Skill Book Info

```lua
local scriptItem = ScriptManager.instance:getItem("Base.BookCarpentry1")
local skillTrained = scriptItem:getSkillTrained()
local lvlSkillTrained = scriptItem:getLvlSkillTrained()
local numLevelsTrained = scriptItem:getNumLevelsTrained()
```

### Check Taught Recipes

```lua
local scriptItem = ScriptManager.instance:getItem("Base.CookingMag1")
local recipes = scriptItem:getTeachedRecipes()
-- Returns semicolon-separated string
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Skill books | Complete |
| Recipe magazines | Complete |
| Entertainment items | Complete |
| Writable items | Complete |
| World models | Complete |
| Custom item guide | Complete |

---

## Key Patterns

### Skill Book Volumes
- 5 volumes per skill
- Each covers 2 levels
- Vol. 1: Levels 1-2
- Vol. 5: Levels 9-10

### Recipe Magazine Syntax
- Recipes separated by semicolons
- Recipe names must match exactly
- ReplaceOnUse keeps item after reading

### Entertainment Values
- Negative values reduce the stat
- Books provide largest reduction
- Magazines are lighter but less effective

---

## Next Steps

1. Document reading mechanics (time, interrupts)
2. Document XP multiplier formula
3. Create loot distribution analysis
4. Document TV show skill bonuses
