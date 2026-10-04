---
id: vanilla-evolved-recipes-reference
slug: vanilla-evolved-recipes-reference
title: "Vanilla Evolved Recipes Reference"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - recipes
  - evolved
  - vanilla
  - cooking
excerpt: "Complete reference for all 38 evolved recipes - dynamic crafting for soups, stews, sandwiches, and more."
related_articles:
  - vanilla-recipes-reference
  - vanilla-food-reference
last_updated: 2026-01-18
---

# Vanilla Evolved Recipes Reference

## Introduction

You're playing Project Zomboid and you right-click a pot of water. "Prepare Soup" appears in the menu. You add a tomato, a potato, some cabbage - anything you want. The soup just... accepts everything. How does that work? You want to create your own dynamic recipe like this for your mod, but the regular recipe system requires fixed ingredients.

If you're confused about how evolved recipes work, you're not alone. They're fundamentally different from normal recipes - instead of "1 bread + 1 cheese = sandwich", they're "bread + any ingredients from a pool = custom sandwich". The system seems mysterious when you first encounter it.

Here's the good news: evolved recipes follow a simple pattern once you see it. I'll show you exactly how they work, with the complete reference of all 38 vanilla evolved recipes to use as examples for your own mods.

## What Are You Actually Seeing In-Game?

When you use evolved recipes as a player:

1. **Start with a base** - Right-click a pot of water, bread slices, or empty bowl
2. **See "Prepare Soup" or similar** - The evolved recipe appears in the context menu
3. **Add ingredients one by one** - Tomato (+12 hunger), potato (+18 hunger), cabbage (+10 hunger)
4. **Get a custom result** - Your soup remembers all ingredients and their combined nutrition
5. **Optionally cook it** - If `Cookable:true`, you can cook the dish in an oven/campfire

This is different from normal recipes where you need exact ingredients in exact amounts.

## What are Evolved Recipes?

Evolved recipes are **dynamic crafting recipes** that allow players to combine multiple ingredients into a single dish. Unlike regular recipes with fixed ingredients, evolved recipes:

- Accept **any valid ingredient** from a large pool
- Allow **multiple ingredients** (up to MaxItems)
- Track nutritional values from all ingredients
- Support **cooking** (making raw dishes cookable)

## Evolved Recipe Syntax

```
evolvedrecipe Soup                      // The recipe name (internal identifier)
{
    BaseItem:WaterPot,                  // What item you right-click to start (pot of water)
    MaxItems:6,                         // Maximum ingredients you can add (6 total)
    ResultItem:PotOfSoupRecipe,         // What item you get after adding ingredients
    Cookable:true,                      // Can this dish be cooked? (true = yes, put in oven)
    Name:Prepare Soup,                  // Text shown in context menu ("Prepare Soup")
}
```

> **How It Works:** When you right-click a `WaterPot`, you see "Prepare Soup" in the menu. You can add up to 6 ingredients (anything with `EvolvedRecipe = Soup` in its definition). The result is a `PotOfSoupRecipe` that you can cook.

## Properties

| Property | Description | What It Means |
|----------|-------------|---------------|
| `BaseItem` | The container/base item to start with | Player right-clicks this item to see the recipe (e.g., `WaterPot`, `BreadSlices`, `Bowl`) |
| `MaxItems` | Maximum number of ingredients allowed | How many ingredients can be added (e.g., `6` for soup, `4` for sandwich) |
| `ResultItem` | The item produced | What you get after adding ingredients (e.g., `PotOfSoupRecipe`, `Sandwich`) |
| `Cookable` | Whether the result can be cooked | `true` = can put in oven/campfire, `false` = eat as-is |
| `Name` | Display name in crafting menu | Text shown to player (e.g., "Prepare Soup", "Make Sandwich") |
| `CanAddSpicesEmpty` | Allow spices even with no other ingredients | `true` = can add salt/pepper alone, typically false |
| `AddIngredientIfCooked` | Only add ingredients if base is cooked | `true` = base must be cooked first (like adding toppings to toast) |

## How Items Become Ingredients

Food items declare which evolved recipes they can be added to using the `EvolvedRecipe` property:

```
item Tomato                                                 // Your food item
{
    Type = Food,                                            // Must be a food item
    EvolvedRecipe = Soup:12;Stew:12;Salad:6;Sandwich:6,   // Can go in these recipes
    // Soup:12      = Adds 12 hunger when put in soup
    // Stew:12      = Adds 12 hunger when put in stew
    // Salad:6      = Adds 6 hunger when put in salad
    // Sandwich:6   = Adds 6 hunger when put in sandwich
}
```

The number after the colon is the **hunger value** contributed when added. Same ingredient can have different values in different recipes (tomato adds more to soup than to sandwich).

> **This is how the game knows what can go in soup:** It scans ALL food items, finds ones with `EvolvedRecipe = Soup:X`, and makes them valid ingredients. You don't configure this on the evolved recipe - you configure it on each food item!

## All Evolved Recipes

| Recipe | Base Item | Result | Max Items | Cookable |
|--------|-----------|--------|-----------|----------|
| Pour Tumbler of Beer | `GlassTumbler` | `Beer` | 1 | No |
| Pour Cup of Beer | `PlasticCup` | `Beer2` | 1 | No |
| Prepare Beverage in Tumbler | `GlassTumbler` | `Beverage` | 2 | No |
| Prepare Beverage in Cup | `PlasticCup` | `Beverage2` | 2 | No |
| Prepare Bread | `BreadDough` | `BreadDough` | 2 | Yes |
| Prepare Burger | `BreadSlices` | `BurgerRecipe` | 4 | No |
| Burrito | `Tortilla` | `BurritoRecipe` | 5 | No |
| Prepare Cake | `CakePrep` | `CakeRaw` | 4 | Yes |
| Prepare Ice Cream Cone | `ConeIcecream` | `ConeIcecreamToppings` | 3 | No |
| Make Fruit Salad | `Bowl` | `Base.FruitSalad` | 6 | No |
| Prepare Beverage | `WaterMug` | `HotDrink` | 3 | Yes |
| Prepare Beverage | `WaterMugRed` | `HotDrinkRed` | 3 | Yes |
| Prepare Beverage | `WaterMugSpiffo` | `HotDrinkSpiffo` | 3 | Yes |
| Prepare Beverage | `WaterTeacup` | `HotDrinkTea` | 3 | Yes |
| Prepare Beverage | `WaterMugWhite` | `HotDrinkWhite` | 3 | Yes |
| Muffin | `BakingTray_Muffin` | `BakingTray_Muffin_Recipe` | 1 | Yes |
| Oatmeal | `Oatmeal` | `Oatmeal` | 3 | No |
| Omelette | `OmeletteRecipe` | `OmeletteRecipe` | 3 | No |
| Pancakes | `Pancakes` | `PancakesRecipe` | 3 | No |
| Prepare Pasta | `WaterSaucepanPasta` | `PastaPan` | 4 | Yes |
| Prepare Pasta | `WaterPotPasta` | `PastaPot` | 4 | Yes |
| Prepare Pie | `PiePrep` | `PieWholeRaw` | 4 | Yes |
| Prepare Sweet Pie | `PiePrep` | `PieWholeRawSweet` | 4 | Yes |
| Prepare Pizza | `PizzaRecipe` | `PizzaRecipe` | 6 | Yes |
| Prepare Rice | `WaterSaucepanRice` | `RicePan` | 4 | Yes |
| Prepare Rice | `WaterPotRice` | `RicePot` | 4 | Yes |
| Place Ingredients in Roasting Pan | `RoastingPan` | `PanFriedVegetables2` | 6 | Yes |
| Make Salad | `Bowl` | `farming.Salad` | 6 | No |
| Make Sandwich | `BreadSlices` | `Sandwich` | 4 | No |
| Make Sandwich | `Baguette` | `BaguetteSandwich` | 4 | No |
| Prepare Soup | `WaterPot` | `PotOfSoupRecipe` | 6 | Yes |
| Prepare Stew | `WaterPot` | `PotOfStew` | 6 | Yes |
| Prepare Stir-fry | `Pan` | `PanFriedVegetables` | 6 | Yes |
| Prepare Stir-fry | `GridlePan` | `GriddlePanFriedVegetables` | 6 | Yes |
| Taco | `TacoShell` | `TacoRecipe` | 5 | No |
| Prepare Toast | `Toast` | `Toast` | 3 | No |
| Waffles | `Waffles` | `WafflesRecipe` | 3 | No |
| Pour Glass of Wine | `GlassWine` | `WineInGlass` | 1 | No |

---

## Common Mistakes

### Wrong: Trying to List Ingredients in the Evolved Recipe

```
evolvedrecipe MyCustomSoup
{
    BaseItem:WaterPot,
    MaxItems:6,
    ResultItem:MyCustomSoupRecipe,
    Ingredients:Tomato;Potato;Cabbage,      // WRONG! This property doesn't exist
}
```

**Why it's wrong:** Evolved recipes don't list ingredients! The ingredients are determined by what food items have `EvolvedRecipe = MyCustomSoup:X` in their definitions.

**Right:**

```
// File: evolvedrecipes.txt
evolvedrecipe MyCustomSoup
{
    BaseItem:WaterPot,
    MaxItems:6,
    ResultItem:MyCustomSoupRecipe,
    Cookable:true,
    Name:Prepare Custom Soup,
    // No ingredients list!
}

// File: items.txt
item Tomato
{
    Type = Food,
    EvolvedRecipe = MyCustomSoup:12,        // THIS is how tomato becomes a valid ingredient
}
```

---

### Wrong: Forgetting to Make the Result Item

```
evolvedrecipe MyPizza
{
    BaseItem:PizzaDough,
    MaxItems:6,
    ResultItem:MyPizzaRecipe,               // You defined this...
    Cookable:true,
}

// But forgot to create MyPizzaRecipe item!
```

**Why it's wrong:** The `ResultItem` must exist as an actual item definition. If `MyPizzaRecipe` doesn't exist, the recipe won't work.

**Right:**

```
// File: evolvedrecipes.txt
evolvedrecipe MyPizza
{
    BaseItem:PizzaDough,
    MaxItems:6,
    ResultItem:MyPizzaRecipe,
    Cookable:true,
    Name:Prepare My Pizza,
}

// File: items.txt
item MyPizzaRecipe                          // The result item MUST be defined!
{
    Type = Food,
    DisplayName = My Pizza (Uncooked),
    Cookable = Pizza,                       // Links to cooked version
}

item Pizza                                  // The cooked version
{
    Type = Food,
    DisplayName = My Pizza,
    IsCookable = true,
}
```

---

### Wrong: Using Wrong Syntax for EvolvedRecipe Property

```
item Carrot
{
    Type = Food,
    EvolvedRecipe = Soup,                   // WRONG! Missing hunger value
}
```

**Why it's wrong:** The `EvolvedRecipe` property requires the format `RecipeName:HungerValue`. Just writing `Soup` doesn't work.

**Right:**

```
item Carrot
{
    Type = Food,
    EvolvedRecipe = Soup:15;Stew:15;Salad:8,       // Correct format with hunger values
}
```

---

### Wrong: Setting MaxItems Too Low

```
evolvedrecipe TinySalad
{
    BaseItem:Bowl,
    MaxItems:2,                             // WRONG! Only 2 ingredients? That's barely a salad
    ResultItem:TinySaladRecipe,
}
```

**Why it's wrong:** Real salads have 5-6 ingredients. A `MaxItems:2` salad feels restrictive and doesn't match vanilla patterns.

**Right:**

```
evolvedrecipe ProperSalad
{
    BaseItem:Bowl,
    MaxItems:6,                             // Matches vanilla salad (allows variety)
    ResultItem:ProperSaladRecipe,
    Name:Make Proper Salad,
}
```

**Vanilla MaxItems patterns:**
- Beverages/Drinks: 1-3 items
- Sandwiches/Burgers/Tacos: 4-5 items
- Soups/Stews/Salads/Pizzas: 6 items

---

## Try It Yourself

Let's create a custom evolved recipe for a smoothie that players can make in a blender cup.

### Step 1: Create the Evolved Recipe

1. Create `media/scripts/evolvedrecipes.txt` in your mod folder
2. Add this code:

```
module MyMod
{
    evolvedrecipe Smoothie                      // Recipe name (internal)
    {
        BaseItem:BlenderCup,                    // Start with a blender cup
        MaxItems:4,                             // Can add up to 4 fruits
        ResultItem:SmoothieRecipe,              // Result is a smoothie recipe
        Cookable:false,                         // Don't cook smoothies!
        Name:Make Smoothie,                     // Shows "Make Smoothie" in menu
    }
}
```

### Step 2: Create the Result Item

3. Create `media/scripts/items.txt` in your mod folder
4. Add the result item:

```
module MyMod
{
    item SmoothieRecipe                         // The result item (must exist!)
    {
        Type = Food,                            // It's food
        DisplayName = Fresh Smoothie,           // Name players see
        Icon = Bowl,                            // Use bowl icon (replace with your icon)
        Weight = 0.5,                           // Weight in inventory

        HungerChange = -10,                     // Base hunger reduction (ingredients add more)
        ThirstChange = -20,                     // Smoothies are drinks!

        DaysFresh = 1,                          // Stays fresh 1 day
        DaysTotallyRotten = 3,                  // Rots after 3 days
    }
}
```

### Step 3: Make Fruits Valid Ingredients

5. Modify existing fruit items to work with your smoothie:

```
module Base
{
    item Banana                                 // Modifying vanilla banana
    {
        EvolvedRecipe = Smoothie:12,            // Add this line (12 hunger to smoothie)
    }

    item Strawberries                           // Modifying vanilla strawberries
    {
        EvolvedRecipe = Smoothie:10,            // Strawberries add 10 hunger
    }
}
```

### Step 4: Test In-Game

6. Load your mod
7. Spawn a Blender Cup (or create one if you haven't modded it in yet - you'll need to create that item too!)
8. Right-click the blender cup
9. You should see "Make Smoothie" in the context menu
10. Add fruits (banana, strawberries, etc.)
11. Check the result item's nutrition (should combine all ingredients)

### Step 5: Verify It Works

**What you should see:**
- Right-click blender cup → "Make Smooth ie" appears
- Can add up to 4 fruits
- Each fruit adds its hunger value
- Result is a "Fresh Smoothie" with combined nutrition
- Can't add non-fruit items (only items with `EvolvedRecipe = Smoothie:X`)

**If it doesn't work:**
- **No "Make Smoothie" option:** Check `BaseItem:BlenderCup` matches your blender cup's item name exactly
- **Can't add fruits:** Make sure fruits have `EvolvedRecipe = Smoothie:X` in their definitions
- **Game crashes:** Check `ResultItem:SmoothieRecipe` exists as an actual item definition

### Step 6: Add More Variety

12. Add more fruits to make the smoothie more interesting:

```
module Base
{
    item Apple
    {
        EvolvedRecipe = Smoothie:8,
    }

    item Orange
    {
        EvolvedRecipe = Smoothie:10,
    }

    item Watermelon
    {
        EvolvedRecipe = Smoothie:15,            // Watermelon adds the most hunger
    }
}
```

13. Test again - you should now be able to make smoothies with 5 different fruits in various combinations!

---

## Source

Definitions from `media/scripts/evolvedrecipes.txt`
