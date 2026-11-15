---
id: build-42-new-animal
slug: new-animal
title: New animal or breed
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a mod that adds a new rabbit breed with one Lua file, reusing the swamp rabbit's textures and sounds, and spawn one from the debug menu. A new species needs art and is not built here.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - modding-the-animaldefinitions-global-table
  - animal-genetics-breeds-and-weight
  - animal-pipeline
  - modding-ranch-zones
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoAnimal`: one Lua file that adds a breed, one translation file with the breed's name, and the usual `mod.info` and `poster.png`.
- Animals are not script blocks. The game reads the global Lua table `AnimalDefinitions` the first time it needs an animal definition, after all Lua files have run.
- A breed is an entry in the `breeds` table of each life stage of an animal. The rabbit has three stages (kitten, doe, buck), so the breed is added three times.
- The new breed reuses the vanilla swamp rabbit's textures, icons and sounds, so the mod needs no art. Its name in the table is the breed's name in the game.
- Once the breed exists, the game can pick it for a rabbit that it creates without naming a breed.
- A new species needs models, animation sets and sounds, and this recipe does not build one.
:::

:::facts
- **Mod id** `RecipeDemoAnimal`
- **Breed** `RecipeDemoRabbit`, shown as Demo
- **Added to** the rabbit's three stages: `rabkitten`, `rabdoe` and `rabbuck`
- **Files** 4 (`mod.info`, `poster.png`, one Lua file, `IG_UI.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A new kind of rabbit that you can spawn, see and tell apart in the menus.**

The cheapest honest animal mod is a new breed of an existing animal. A breed holds the textures, the inventory icons, the sounds and a few gene limits, so a breed that points at vanilla textures needs no art file at all. A new species also needs a body model, a skeleton model, an animation set and a set of sounds, which are art and engine data and not text you can write here.

In the game you right-click the ground in debug mode, add a **Female Rabbit (Doe)** of the breed **Demo**, and see a rabbit that looks like a swamp rabbit.

## The files

**The mod files, with the Lua file and the translation file in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `42/` folder and the same `poster.png`. The Lua file takes the place of the skeleton's `Boot.lua`.

```
Zomboid/mods/RecipeDemoAnimal/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      lua/
        shared/
          Definitions/
            animal/
              RecipeDemoAnimal_Breed.lua
          Translate/
            EN/
              IG_UI.json
```

The Lua file sits in `media/lua/shared/Definitions/animal/`, the folder of the vanilla animal files. For each Lua folder the game runs its own files first and then the files of each mod, so the vanilla tables exist when your file runs. :cite[(`zombie/Lua/LuaManager.java:1139-1202`)] The game builds its animal definitions from the table the first time it asks for them, which is after the Lua folders have loaded. :cite[(`zombie/characters/animals/AnimalDefinitions.java:154-160`, `zombie/characters/animals/AnimalDefinitions.java:176-190`)]

## Step by step

**Write the four files in this order.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Animal
id=RecipeDemoAnimal
description=Adds one rabbit breed, built from the vanilla swamp rabbit's textures and sounds.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/lua/shared/Definitions/animal/RecipeDemoAnimal_Breed.lua`

This is the breed. Its fields are copied from the vanilla swamp breed of the rabbit, and the code that adds it to the stages follows how the vanilla file builds them. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:45-63`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:122`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:170`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:224`)]

**File `42/media/lua/shared/Definitions/animal/RecipeDemoAnimal_Breed.lua`**

```lua
local breed = {}
breed.texture = "Rabbit_Swamp"
breed.textureMale = "Rabbit_Swamp"
breed.rottenTexture = "Rabbit_Rotting"
breed.textureBaby = "Rabbit_Kitten_Swamp"
breed.forcedGenes = { maxMilk = { minValue = 0.75, maxValue = 0.95 } }
breed.invIconMale = "Item_Rabbit"
breed.invIconFemale = "Item_Rabbit"
breed.invIconBaby = "Item_Rabbit"
breed.invIconMaleDead = "Item_RabbitDead"
breed.invIconFemaleDead = "Item_RabbitDead"
breed.invIconBabyDead = "Item_RabbitDead"
breed.invIconMaleSkel = "Item_Skeleton_Rabbit"
breed.invIconFemaleSkel = "Item_Skeleton_Rabbit"
breed.invIconBabySkel = "Item_Skeleton_Rabbit_Kit"

local stages = { "rabkitten", "rabdoe", "rabbuck" }
for _, stage in ipairs(stages) do
    local animal = AnimalDefinitions.animals[stage]
    local mine = copyTable(breed)
    mine.sounds = animal.breeds["swamp"].sounds
    animal.breeds["RecipeDemoRabbit"] = mine
end
```

Each entry of `AnimalDefinitions.animals` is one animal type, named by its key, and the game reads the `breeds` table of each. The name of a breed is the key it has in that table, and a `name` field inside the entry is not used. :cite[(`zombie/characters/animals/AnimalDefinitions.java:186-194`, `zombie/characters/animals/AnimalDefinitions.java:650-652`, `zombie/characters/animals/AnimalDefinitions.java:705-712`)] The vanilla rabbit gives its three stages three tables of breeds: the kitten and the buck get copies, and the doe shares the original, so the loop adds the breed to each stage and not once to the original. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:122`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:170`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:224`)] 

`copyTable` copies a table and the tables inside it. :cite[(`zombie/Lua/LuaManager.java:1596-1624`)]

| Field | What it does | Code |
|-------|--------------|------|
| `texture`, `textureMale`, `textureBaby`, `rottenTexture` | Names of body textures. The value of `texture` is split at commas, so it can list several. | `zombie/characters/animals/AnimalDefinitions.java:718-740`, `zombie/characters/animals/AnimalDefinitions.java:798-800` |
| `forcedGenes` | Limits for the genes of an animal of this breed. Each gene is a name with a `minValue` and a `maxValue`, and a new animal draws the gene's value between them. A gene name that the genome definitions do not have is skipped with a debug line. | `zombie/characters/animals/datas/AnimalBreed.java:54-77`, `zombie/characters/animals/AnimalGene.java:56-75` |
| `invIconMale`, `invIconFemale`, `invIconBaby` and their `Dead` and `Skel` forms | Names of inventory icons for the live, dead and skeleton animal of each kind. The values are the vanilla ones. | `zombie/characters/animals/AnimalDefinitions.java:742-776` |
| `sounds` | A table of sound ids and their settings. The demo shares the swamp rabbit's table, so the new rabbit makes the same sounds. A breed with no sounds table has no sound defined for any id. | `zombie/characters/animals/AnimalDefinitions.java:794-796`, `zombie/characters/animals/datas/AnimalBreed.java:79-108`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:260-299` |

The breed loader checks each key it knows and leaves the others alone, so a misspelled key is not reported. :cite[(`zombie/characters/animals/AnimalDefinitions.java:714-800`)] Copy the field names from this table.

### Step 3. `42/media/lua/shared/Translate/EN/IG_UI.json`

This file gives the breed a name. The key is `IGUI_Breed_` followed by the breed's key, as in the vanilla file. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:1927-1931`)] The animal context menu puts that name in front of the animal's type name, and the debug spawn menu shows the breed name alone. :cite[(`media/lua/client/ISUI/Animal/ISAnimalContextMenu.lua:1134-1136`, `media/lua/client/DebugUIs/DebugContextMenu.lua:276`)]

**File `42/media/lua/shared/Translate/EN/IG_UI.json`**

```
{
    "IGUI_Breed_RecipeDemoRabbit": "Demo"
}
```

## Turn it on and see it work

**Copy the folder, start the game in debug mode, and spawn a rabbit of the new breed.**

1. Put the `RecipeDemoAnimal` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoAnimal/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Animal**, choose **ACCEPT**, and start a new game.
3. Right-click the ground, and choose **Debug**, then **Animals**. :cite[(`media/lua/shared/Translate/EN/ContextMenu.json:840`, `media/lua/shared/Translate/EN/IG_UI.json:6521`, `media/lua/client/DebugUIs/DebugContextMenu.lua:226-227`)]
4. Choose the group **Rabbit**, then **Add Female Rabbit (Doe)**, then the breed **Demo**. The submenu lists every breed of the doe, which is where the new breed has to show up. :cite[(`media/lua/client/DebugUIs/DebugContextMenu.lua:266-277`, `media/lua/shared/Translate/EN/IG_UI.json:1914`)]
5. The game adds the animal at the square you clicked. :cite[(`media/lua/client/DebugUIs/DebugContextMenu.lua:1450-1469`)]

You should see a rabbit that looks like a swamp rabbit, and the breed **Demo** in the menu. The same menu has a **Male Rabbit (Buck)** and a **Baby Rabbit (Kitten)** entry that list the breed as well. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:1913-1915`)] These steps are checked against the code only; the rabbit has not been run in a game.

When the game makes an animal and no breed is named, it picks one at random from all the breeds of that type, so your breed can also appear on rabbits that the game itself creates. :cite[(`zombie/characters/animals/IsoAnimal.java:244-248`, `zombie/characters/animals/AnimalDefinitions.java:847-849`)] Remove the mod, or the breed, if you do not want that.

On a dedicated server, put `Mods=RecipeDemoAnimal` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. Players need the mod too. These server steps have not been run in a game.

## If it does not work

**A breed fails in a few predictable ways, and the Lua error in `console.txt` names most of them.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| A Lua error in `console.txt` that points at your file | A stage id is misspelled, or the vanilla animal files had not run. Use the three ids of the vanilla rabbit, and keep the file in a `shared` Lua folder of your mod. | `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:110, 157, 211`, `zombie/Lua/LuaManager.java:1139-1202` |
| The breed is missing from the debug menu | The Lua file did not run (wrong folder, mod not enabled), or the breed was added to only some of the three stages. | `zombie/characters/animals/AnimalDefinitions.java:176-190`, `media/lua/client/DebugUIs/DebugContextMenu.lua:266-277` |
| The menu shows `IGUI_Breed_RecipeDemoRabbit` | `IG_UI.json` is missing, in the wrong folder, or has a different key. The key uses the breed's key from the table, with its capitals. | `media/lua/client/DebugUIs/DebugContextMenu.lua:276` |
| The rabbit has no sounds | The breed has no `sounds` table, or the table is empty, so no sound id is defined for it. | `zombie/characters/animals/datas/AnimalBreed.java:79-108` |
| A field has no effect | The key is misspelled, and the loader ignores keys it does not know. | `zombie/characters/animals/AnimalDefinitions.java:714-800` |
| The breed shows up on rabbits you did not spawn | The game picks a random breed when none is named. | `zombie/characters/animals/IsoAnimal.java:244-248` |

Not verified: what the game does when a texture name matches no texture. Use texture names from a vanilla breed, as the demo does. Run the Kahlua checker before you start the game: it reports Lua calls that the game's Lua does not have. The command is `python -I check-kahlua.py <your mod folder>`, and the script is in the OutcastLib repository folder `scripts`.

## Going further

**Learn the rest of the animal table, or place animals in the world.**

- [The AnimalDefinitions global table](/pz/build-42/modding/farming-and-animals/modding-the-animaldefinitions-global-table) lists the table's sections and fields.
- [Animal genetics, breeds and weight](/pz/build-42/modding/farming-and-animals/animal-genetics-breeds-and-weight) covers genes and `forcedGenes`.
- [The animal pipeline](/pz/build-42/modding/farming-and-animals/animal-pipeline) lists what the engine needs from a new animal type.
- [Ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones) says where animals spawn on the map.

:::callout[How we know]{kind=proof}
The breed's fields are copied from the vanilla swamp rabbit, and the loader behavior comes from the 42.22 engine and Lua code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Kahlua checker. It has not been run in a game: how the breed looks, whether it makes the swamp rabbit's sounds, and what the menus show are what you check yourself.

What a whole new species needs was not rebuilt here, and the page says only that its entries name models and animation sets that must exist as assets. What the game does with a texture name that matches no texture was not checked.
:::
