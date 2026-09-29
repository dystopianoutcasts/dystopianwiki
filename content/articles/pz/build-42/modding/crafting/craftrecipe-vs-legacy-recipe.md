---
id: build-42-craftrecipe-vs-legacy-recipe
slug: craftrecipe-vs-legacy-recipe
title: craftRecipe vs legacy recipe
game: pz
version: build-42
section: modding
category: crafting
difficulty: intermediate
tags:
  - craftrecipe
  - crafting
  - itemmapper
  - recipe-tags
excerpt: '[BREAKING] B41''s recipe block and B42''s craftRecipe are different systems.'
last_updated: '2026-09-29'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - craftrecipe-outputs-and-itemmappers
  - addendum-canonical-craftrecipe-schema
---
# `craftRecipe` vs legacy `recipe`

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[BREAKING]** B41's `recipe` block and B42's `craftRecipe` are different systems.

Legacy B41 `recipe` (still parseable, but not the modern menu):
```
recipe Open Box of Nails
{
    NailsBox,                 // ingredients are bare lines; consumed unless "keep"
    Result:Nails=20,          // Result:Item=Count  (uses '=' and ':')
    Sound:PutItemInBag,
    Time:5.0,                 // property:value with ':'
}
```

B42 `craftRecipe` (the modern system):
```
craftRecipe OpenBoxOfNails
{
    time = 50,
    category = Carpentry,
    inputs  { item 1 [Base.NailsBox], }
    outputs { item 20 Base.Nails, }
}
```

Key differences:

| Aspect | B41 `recipe` | B42 `craftRecipe` |
|---|---|---|
| Property separator | `property:value` and `Result:X=N` | `property = value,` |
| Ingredients | bare item lines; `keep` keyword | `item <count> [..]/tags[..]` with `mode:`/`flags:` |
| OR-ingredients | limited (`Item1/Item2`) | `[A;B]` and `tags[A;B]` first-class |
| Output | `Result:Item=Count` | `outputs { item N Base.X }`, supports `mapper:` |
| Time unit | abstract | **seconds** (`time`) |
| Workstation binding | none / hard-coded | recipe `tags` matched to entity `CraftBench.Recipes` |
| Fluids | separate item variants | `-fluid`/`+fluid` |
| Learning | `Recipes=` on item, `SkillRequired` | `TeachedRecipes`/`ResearchableRecipes`/`AutoLearnAll`/`AutoLearnAny`/`needTobeLearn` |
| Dynamic output | no | `itemMapper` |

Migration guidance: for a B42 mod, author everything as `craftRecipe`. Do not port B41 `recipe` blocks verbatim — they will not appear correctly in the new crafting UI. `[CONFIRMED direction; per-property mapping partly UNCERTAIN]`
