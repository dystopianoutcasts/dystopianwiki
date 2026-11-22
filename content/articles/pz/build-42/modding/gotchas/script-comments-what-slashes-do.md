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
  A script file has one kind of comment, /* */. A // is ordinary text that sticks to whatever follows it. What that breaks in Build 42.22, place by place, and which of it shows up in your log.
last_updated: '2026-11-21'
related_articles:
  - script-file-anatomy
  - testing-loop-and-common-load-errors
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** anyone who writes or generates scripts for items, vehicles, models, recipes or fluids. The same rule is in short form on [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy#3-lines-commas-and-comments) and [Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors).

Outcast, if you write scripts, this one is worth five minutes. We lost real time to it twice, and we even wrote it down wrong the first time: once as "one `//` breaks the whole file", once as "a `//` eats the next property". Both happened. Neither is the whole rule, so we read the game's script parser end to end.

:::callout[The 1-minute version]{kind=key}
- The only comment the game removes from a script file is `/* ... */`. A `//` is ordinary text.
- A `//` joins the text after it, up to the next comma or brace. Before a key, it makes the key unreadable and the key is lost. Before an object, the object is skipped. Above `module`, the module is skipped.
- In a one-module file, a `//` above `module` loses every object in the file, with nothing logged.
- Whether you see a message depends on the log channel. On a client the script and recipe channels start off, and `-debug` alone does not turn them on, so most of these failures print nothing.
- Vanilla scripts contain no `//` at all. Use `/* ... */` everywhere, and never type `*/` inside a note.
:::

:::facts
- **Script files in vanilla** 1,004 `.txt` files under `media/scripts/`
- **Files that contain `//`** 0
- **Files that contain `/* */`** 28, all in the `xui` folder
- **Comments in those files** 71: 53 on one line, 18 over several lines
:::

## 1. The rule

**A script file has one kind of comment, `/* ... */`, and the game cuts those out before it reads anything else.**

The loader reads the file, joins its lines with newlines and strips the block comments before it splits the text into objects. :cite[(`zombie/scripting/ScriptManager.java:1301-1338`, `zombie/scripting/ScriptParser.java:59-90`)] The parser has no check for `//` anywhere. :cite[(`zombie/scripting/ScriptParser.java:18-124`)]

A `//` is therefore ordinary text. The parser glues it to whatever comes after it, up to the next comma, `{` or `}`, and what breaks depends on what it gets glued to.

## 2. How the game reads a script file

**The file is cut down in a fixed order: comments out first, then blocks by braces, then lines by commas.**

You do not need this to stay safe, but it is why every row of the table in part 3 happens.

:::flow[From file to object]
- Strip `/* */` comments
- Keep each top-level block that starts with `module`
- Cut the module into blocks and read the first word as the type
- Cut each block at its commas into `key = value` lines
:::

The engine cuts the top level by counting braces, and keeps a block only if its text starts with `module`. :cite[(`zombie/scripting/ScriptParser.java:96-124`, `zombie/scripting/ScriptManager.java:1349-1362`)] It cuts the module body the same way, and takes the word before the `{` as the object type, such as an item, a vehicle, a model, a recipe or a fluid. :cite[(`zombie/scripting/objects/ScriptModule.java:969-994`)] A type that matches no script type is skipped. :cite[(`zombie/scripting/ScriptBucket.java:98-103`, `zombie/scripting/objects/ScriptModule.java:1018-1026`)]

Each object's loader then reads its body with `ScriptParser.parse`. That walks the text one character at a time: a comma ends a value, a `{` starts a child block whose type is the leading word of the text since the last comma, and a `}` ends the block. :cite[(`zombie/scripting/ScriptParser.java:18-49`)] Text after the last comma in a block is dropped. :cite[(`zombie/scripting/ScriptParser.java:40-46`)]

A `//` line between two properties becomes the front of the next value. The loader reads the key as everything before the `=` sign, which is now your note plus a line break plus the real key, and that key matches nothing. :cite[(`zombie/scripting/ScriptParser.java:316-324`, `zombie/scripting/objects/Item.java:1431-1435`)]

## 3. What a `//` breaks, by where you put it

**The same `//` loses a key, an object or a whole module, depending on what follows it, and each script type reacts a little differently.**

The "Do you see anything?" column says what reaches the log. A message on the Script or Recipe channel prints on a dedicated server, which sets a default level for every channel at start. A client sets only six channels on (General, Lua, Mod, Network, Multiplayer, ClientCommand), and `-debug` alone does not add more: it only reads a debug log config file if one exists.

To see Script or Recipe messages on a client, start it with `-debuglog=Script,Recipe` or use a debug log config. The Item and fluid unknown-key messages use two other channels, as the rows say. :cite[(`zombie/debug/DebugLog.java:83-98`, `zombie/network/GameServer.java:499`, `zombie/debug/DebugLog.java:478-483`, `zombie/gameStates/MainScreenState.java:251-254`, `zombie/gameStates/MainScreenState.java:284-286`, `zombie/debug/DebugLog.java:280-291`, `zombie/debug/DebugLog.java:487-496`, `zombie/debug/DebugLogStream.java:98-99`)]

| Where the `//` is | What happens | Do you see anything? | Code |
|---|---|---|---|
| Above `module Base {` (top of the file) | The block no longer starts with `module`, so that **module** is skipped. In a file with one module, nothing in the file exists. A `//` above a later module loses that module only. | No. Nothing is logged. | :cite[(`zombie/scripting/ScriptManager.java:1358-1362`)] |
| Between two objects in a module (above `model MyCar {`, `item MyThing {`, `imports {` ...) | That **one object** is skipped. Its type is read as the comment's first word. Put one above every object and the file looks as dead as the case above. | A warning, `unknown script object`, on the Script channel: on a server, or on a client with the Script channel on (`-debuglog=Script`). | :cite[(`zombie/scripting/objects/ScriptModule.java:978-994`, `zombie/scripting/objects/ScriptModule.java:1018-1026`)] |
| On its own line between two properties | It merges with the **next** property. That key no longer matches and the property is lost (an item stores the odd key as mod data instead, and the real property is not set). The one above the comment is fine. | Vehicle, model: no. Item: a warning `adding unknown item param` on the DetailedInfo channel, which stays off unless the game is started with `-debug` (server) or `-debuglog=DetailedInfo` (client). Craft recipe: an `Unknown key` error on the Recipe channel (server, or `-debuglog=Recipe`), and in a game started with `-debug` the load throws and the whole recipe is dropped. Fluid: an `Unknown key` error on the General channel, which a normal client prints, and with `-debug` the whole fluid is dropped. | :cite[(`zombie/scripting/objects/VehicleScript.java:148-150`, `zombie/scripting/objects/ModelScript.java:75-77`, `zombie/scripting/objects/Item.java:2998-3019`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:505-510`, `zombie/scripting/objects/FluidDefinitionScript.java:251-255`)] |
| After a property, on the same line (`mass = 900, // kg`) | Same as the row above: the **next** property is lost. This is the one that fools everyone, because the line you annotated works. | Same as the row above. | :cite[(`zombie/scripting/ScriptParser.java:40-46`)] |
| Above a child block (`part Hood {`, `attachment ... {`, `inputs {`) | That child block's type is read as `//`, so the block is ignored. | Vehicle, model, item: no. Craft recipe: an `Unknown block` error on the Recipe channel, and with `-debug` the recipe is dropped. Fluid: an `Unknown block` error on the General channel. | :cite[(`zombie/scripting/ScriptParser.java:21-33`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:531-536`, `zombie/scripting/objects/FluidDefinitionScript.java:274-277`)] |
| Above a line in a craft recipe's `inputs` or `outputs` | The line now starts with `//`, which is not `item`, `fluid` or `energy`. The **whole recipe** is dropped. | Yes, an exception: `unknown type in craftrecipe`. | :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:587`, `zombie/scripting/entity/components/crafting/OutputScript.java:294`)] |
| The comment itself contains a comma (`// fast, but loud`) | The text before the comma becomes a value with no `=`. Item and vehicle loaders crash on it and the **whole item or vehicle** is dropped. Model, craft recipe and fluid skip that value, but the text after the comma still joins the next key, which is lost. | Item and vehicle: an exception in the log. Others: no. | :cite[(`zombie/scripting/objects/Item.java:1431-1441`, `zombie/scripting/objects/VehicleScript.java:148-150`, `zombie/scripting/ScriptParser.java:316-324`)] |
| After a property **with no comma before it** (`engineForce = 3000 // note`, next line `mass = 900,`) | The comment and the whole next line become part of the value. A number now fails to parse and the **whole object** is dropped; a text value just becomes garbage. | Number: an exception. Text: no. | :cite[(`zombie/scripting/objects/VehicleScript.java:148-166`, `zombie/scripting/ScriptBucket.java:198-207`)] |
| Last thing before a closing `}`, with no comma after it | Harmless. `readBlock` throws away text after the last comma in a block. | No. | :cite[(`zombie/scripting/ScriptParser.java:18-49`)] |
| Contains `{` or `}` | The brace counting shifts. What you lose depends on where. | Varies. Just never do it. | :cite[(`zombie/scripting/ScriptParser.java:96-124`)] |

Any exception thrown while an object loads removes that object, because every script type has the remove-on-load-error flag. :cite[(`zombie/scripting/ScriptType.java:110-136`, `zombie/scripting/ScriptBucket.java:198-207`)] That is the General-channel line `removing script due to load error`, which a normal client does print. :cite[(`zombie/scripting/ScriptBucket.java:201-203`, `zombie/debug/DebugLog.java:297-299`, `zombie/debug/DebugLog.java:478-483`)]

### Both of our earlier stories were true

The two things we wrote down before were both real, and the table explains both.

- **"One `//` killed the whole file."** A generated car script of ours had its notes above the declarations. A note above `module` loses the module, which was the whole file; notes above each `model` block lose each model. Either way, not one model declaration existed, so no mesh was ever loaded and the game never even said `No such mesh`. We do not know which of the two it was, and the result is the same. What was wrong was the rule we drew from it: it is not true that any `//` anywhere kills the file.
- **"A `//` ate the next property."** In another car script, `// (EST)` above `shadowExtents` and `// (REAL) DIN curb weight` above `engineForce` turned those keys into nonsense. The vehicle still loaded, without the two properties, so it ran on the default engine force and nothing complained. That is rows three and four.

## 4. What vanilla does

**Vanilla ships no `//` in any script file, and 28 files use `/* */` instead, all in the `xui` folder.**

We searched every script file the game ships: 1,004 `.txt` files under `media/scripts`. Not one contains `//`. The 28 that contain `/*` are all under `xui`, and hold 71 comments: 53 on a single line and 18 that run over several. The developers use them both for notes and to switch properties off, commas included, which is safe because block comments are gone before any comma is read. :cite[(`media/scripts/xui/defaultskin/xs_ISButton.txt:64`, `media/scripts/xui/xui_config.txt:5`)]

```
/*backgroundColor     = SandyBrown,*/
```

## 5. The safe way to leave a note in a script

**Use `/* ... */` everywhere, keep `*/` out of your notes, and search for `//` before you test.**

- **Use `/* ... */`, always.** It works anywhere: above `module`, between objects, between properties, on the same line as a property, and around a property you want to switch off.
- Do not nest them, and never type `*/` inside a note. We read the stripping loop and ran it by hand on a few strings, not in the game. It works from the last `*/` backward. A `*/` to the right of the last real comment seems to leave every comment in the file unstripped, and a `/*` with no `*/` is never removed. :cite[(`zombie/scripting/ScriptParser.java:59-90`)]
- If you generate scripts from a tool, make the tool write `/* */`. Generated notes are how we got hit twice.
- Before you test in game, search your scripts for `//`. In Git Bash: `grep -rn "//" media/scripts`. Any hit is a bug waiting to happen, even if the game seems fine today.
- `perks.txt` is a different file with a different reader, not covered by this page. Keep `//` out of it too.

:::callout[How we know]{kind=proof}
Everything about the parser, the loaders and the log channels was read from the 42.22 engine source, and the vanilla file counts were recounted from `media/scripts`. None of the `//` results was run in a game. This page agrees with the short form on [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy) and on [Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors).

The earlier question, whether a normal game prints `unknown script object`, is answered from the code: the Script channel starts off on a client, and `-debug` alone does not turn it on, so a client does not print it unless started with `-debuglog=Script` or a debug log config. A server prints it.

That too is read, not run. A test would be a mod with one script file that has a `// note` line above one `model` block, started once without `-debuglog`, then a search of `console.txt` for `unknown script object`. This matches [Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors).

Our two car-script incidents were seen on earlier builds and were not rerun at 42.22. The first was three single-player sessions with no car model drawn (engine revision a2947723ca, Steam build 24449119); the second was found by reading the script afterward.
:::
