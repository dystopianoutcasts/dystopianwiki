# check-craft-recipes.py

## What it is for

Validates Build 42 `craftRecipe` blocks against the grammar the engine
actually enforces, measured from the shipped game rather than remembered. It
exists because on 2026-09-09 a mod shipped 72 generated `craftRecipe` blocks
with an outputs-only bare item form (`item 1 Base.ScrapMetal,`) inside an
`inputs` block, and the game crashed on startup before the main menu, with
every recipe removed and no other check catching it.

The rule set is measured against every `craftRecipe` in the shipped game (B42
revision `a2947723ca`, 969 blocks): inputs and outputs use mutually exclusive
forms (`item`/`tags[...]`/bracketed lists for inputs; bare `Module.Item` or
`mapper:NAME` for outputs), and mixing them the wrong way round is the
single most common mistake, which is why the two directions are checked as
separate faults with separate messages.

## How to invoke it

```
check-craft-recipes.py <path> [<path>...]              # files or directories
check-craft-recipes.py --self-test
check-craft-recipes.py <path> --game <ProjectZomboid dir>
```

`--game` points the checker at an installed game copy to cross-check tags and
item references against the live scripts.

## Inputs and outputs

- Input: one or more `.txt` script files or directories containing
  `craftRecipe` blocks.
- Output: `file:line` plus the specific grammar rule violated (bare form in
  an inputs block, tags in an outputs block, an unresolvable tag or item id,
  and so on).
- `--self-test` runs the bundled fixture set that exercises each rule.

## Exit codes

Non-zero on any recipe that would fail to load or behave wrong; `0` when
every scanned recipe matches the measured grammar.
