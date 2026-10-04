---
id: build-42-script-comments-what-slashes-do
slug: script-comments-what-slashes-do
title: 'Script comments: what // really does'
game: pz
version: build-42
section: modding
category: gotchas
difficulty: beginner
tags:
  - scripts
  - comments
  - silent-failure
  - parser
excerpt: >-
  A script file has exactly one kind of comment, /* */. A // is ordinary text,
  and it sticks to whatever follows it up to the next comma or brace. Here is
  what that breaks in each place you might put one, read from the game's
  script parser.
last_updated: '2026-10-04'
---
# Script comments: what `//` really does

Outcast, if you write scripts for items, vehicles, models or recipes, this one is worth five minutes. We lost real time to it twice, and we even wrote it down wrong the first time: once as "one `//` breaks the whole file", once as "a `//` eats the next property". Both happened. Neither is the whole rule. So we went back to the game's script parser and read it end to end. Here is what it actually does.

## The rule

**A script file has one kind of comment: `/* ... */`.** The game cuts those out of the whole file before it reads anything else.

**`//` is not a comment.** It is ordinary text. The parser glues it onto whatever comes after it, up to the next comma, `{` or `}`. What breaks depends on what it gets glued to, and most of the time nothing tells you.

> **Proof:** Code. `zombie.scripting.ScriptParser#stripComments` removes `/*`...`*/` spans and contains no other comment handling. Build 42, engine revision a2947723ca (Steam build 24449119).

## How the game reads a script file

You do not need this to stay safe, but it is why every row of the table below happens. The chain, in order:

1. `ScriptManager#LoadFile` reads the file line by line, joins the lines back together with newlines, and calls `ScriptParser#stripComments`. Only `/* */` is removed here.
2. `ScriptManager#ParseScript` calls `ScriptParser#parseTokens`, which cuts the file into top-level chunks by counting braces. `ScriptManager#CreateFromToken` keeps a chunk only if its text starts with the word `module`.
3. `ScriptModule#Load` runs `ScriptModule#ParseScriptPP`, which cuts the module body into chunks the same way. `ScriptModule#CreateFromTokenPP` takes the first word before the `{` as the object type (`item`, `vehicle`, `model`, `craftRecipe`, `fluid` ...) and hands the chunk to `ScriptBucket#CreateFromTokenPP` for the bucket with that tag.
4. Once every file is read, `ScriptBucket#LoadScripts` calls each object's `Load`, for example `VehicleScript#Load`, `Item#Load`, `ModelScript#Load`, `CraftRecipe#Load`, `FluidDefinitionScript#Load`. Each starts with `ScriptParser#parse`, which calls `ScriptParser#readBlock`.
5. `ScriptParser#readBlock` is where `//` does its damage. It walks the text one character at a time. A comma ends a value. A `{` starts a child block whose type is the first word of whatever text came since the last comma. Nothing else is special:

```java
if (s.charAt(i) == ',') {
   ScriptParser.Value value = new ScriptParser.Value();
   value.string = s.substring(start, i);
   block.values.add(value);
   block.elements.add(value);
   start = i + 1;
}
```

So a `//` line sitting between two properties becomes the front of the next value. The loader then reads the key as everything before the first `=`, which is now `// your note` plus a newline plus the real key. That key matches nothing.

> **Proof:** Code. `zombie.scripting.ScriptManager#LoadFile`, `#ParseScript`, `#CreateFromToken`; `zombie.scripting.objects.ScriptModule#Load`, `#ParseScriptPP`, `#CreateFromTokenPP`; `zombie.scripting.ScriptBucket#CreateFromTokenPP`, `#LoadScripts`; `zombie.scripting.ScriptParser#parse`, `#readBlock`, `ScriptParser.Value#getKey`. Build 42, engine revision a2947723ca (Steam build 24449119).

## What a `//` breaks, by where you put it

| Where the `//` is | What happens | Do you see anything? |
|---|---|---|
| Above `module Base {` (top of the file) | The chunk no longer starts with `module`, so the **whole file** is skipped. Nothing in it exists. | No. Nothing is logged. |
| Between two objects in a module (above `model MyCar {`, `item MyThing {`, ...) | That **one object** is skipped. Its type is read as `//`. Put one above every object and the file looks just as dead as the case above. | Maybe a warning, `unknown script object`. Whether a normal (non-debug) game prints it is still unknown, see below. |
| On its own line between two properties | It merges with the **next** property. That property's key no longer matches and the property is lost. The one above the comment is fine. | Item, vehicle, model: no. Craft recipe and fluid: an `Unknown key` error is logged, and in debug mode the whole object is dropped. |
| After a property, on the same line (`mass = 900, // kg`) | Same as the row above: the **next** property is lost. This is the one that fools everyone, because the line you annotated works. | Same as the row above. |
| Above a child block (`part Hood {`, `attachment ... {`, `inputs {`) | That child block's type is read as `//`, so the block is ignored. | Vehicle and model: no. Craft recipe: `Unknown block` error. |
| Above a line in a craft recipe's `inputs` or `outputs` | The line now starts with `//`, which is not `item`, `fluid` or `energy`. The **whole recipe** is dropped. | Yes, an exception: `unknown type in craftrecipe`. |
| The comment itself contains a comma (`// fast, but loud`) | The text before the comma becomes a value with no `=`. Item and vehicle loaders crash on it and the **whole item or vehicle** is dropped. Model and fluid ignore it. | Item and vehicle: an exception in the log. Others: no. |
| After a property **with no comma before it** (`engineForce = 3000 // note`, next line `mass = 900,`) | The comment and the whole next line become part of the value. A number now fails to parse and the **whole object** is dropped; a text value just becomes garbage. | Number: an exception. Text: no. |
| Last thing before a closing `}`, with no comma after it | Harmless. `readBlock` throws away text after the last comma in a block. | No. |
| Contains `{` or `}` | The brace counting shifts. What you lose depends on where. | Varies. Just never do it. |

> **Proof:** Code. Object skipped: `zombie.scripting.objects.ScriptModule#GetTokenType` and `#CreateFromTokenPP`. Lost property: `zombie.scripting.objects.VehicleScript#Load` and `ModelScript#Load` ignore unmatched keys; `zombie.scripting.objects.Item#DoParam` stores an unmatched key as unknown item data with only a trace message; `zombie.scripting.entity.components.crafting.CraftRecipe#Load` and `zombie.scripting.objects.FluidDefinitionScript#Load` log `Unknown key` and throw in debug mode. Recipe dropped: `CraftRecipe#LoadIO` and `InputScript#Load`. No-`=` crash: `Item#Load` and `VehicleScript#Load` read `split("=")[1]`. Object removed after any load error: `ScriptBucket#LoadScripts` with the `RemoveLoadError` flag, which `ScriptType` gives every script type. Build 42, engine revision a2947723ca (Steam build 24449119).

### Both of our earlier stories were true

The two things we wrote down before were both real, and the table explains both.

- **"One `//` killed the whole file."** A generated car script of ours had its notes above the declarations. A note above `module` loses the whole file; notes above each `model` block lose each model. Either way, not one model declaration existed, so no mesh was ever loaded and the game never even said `No such mesh`. We do not know which of the two it was, and the code says the result is the same. What was wrong was the rule we drew from it: it is not true that any `//` anywhere kills the file.
- **"A `//` ate the next property."** In another car script, `// (EST)` above `shadowExtents` and `// (REAL) DIN kerb weight` above `engineForce` turned those keys into nonsense. The vehicle still loaded, without the two properties, so it ran on the default engine force and nothing complained. That is rows three and four.

> **Proof:** Game test, for the first incident: three single-player sessions with no car model drawn. The second was found by reading the script after the fact; what it did to the car is the code path above, not a separate measurement. Build 42, engine revision a2947723ca (Steam build 24449119).

## What vanilla does

We searched every script file the game ships: 1,004 `.txt` files under `media/scripts`. **Not one contains `//`.** 28 of them use `/* */`, all in the `xui` folder. The developers use it both for notes and to switch properties off, commas included, which is safe because block comments are gone before the commas are ever looked at. For example, `xui/defaultskin/xs_ISButton.txt` line 64:

```
/*backgroundColor     = SandyBrown,*/
```

and `xui/xui_config.txt` line 5 (`/* normal String, no auto translation */`).

> **Proof:** Code. Searched the installed game's `media/scripts` for `//` (0 files) and `/*` (28 files, all under `xui`). Build 42, Steam build 25485521.

## The safe way to leave a note in a script

- **Use `/* ... */`, always.** It works anywhere: above `module`, between objects, between properties, on the same line as a property, and around a property you want to switch off.
- Do not nest them, and never type `*/` inside a note.
- If you generate scripts from a tool, make the tool write `/* */`. Generated notes are how we got hit twice.
- Before you test in game, search your scripts for `//`. In Git Bash: `grep -rn "//" media/scripts`. Any hit is a bug waiting to happen, even if the game seems fine today.
- `perks.txt` is a different file with a different reader, not covered by this page. Keep `//` out of it too.

## What we still do not know

- **Whether a normal game prints the `unknown script object` warning.** It is written through the `Script` debug log channel, and whether that channel is on outside debug mode depends on the game's log settings, which we have not traced. The smallest test: a mod with one script file that has a `// note` line directly above one `model` block, started once without `-debug`, then a search of `console.txt` for `unknown script object`.
- **Whether the newest game build changed any of this.** The code above was read from a July capture of the engine. The vanilla search was made on the build installed now. We will recheck the parser when the engine records are refreshed.

> **Proof:** Unknown. Read `zombie.debug.DebugLog#getDefaultLogSeverity` and `DebugType` (each channel starts `Off`), but not the log configuration loading. Build 42, engine revision a2947723ca (Steam build 24449119).
