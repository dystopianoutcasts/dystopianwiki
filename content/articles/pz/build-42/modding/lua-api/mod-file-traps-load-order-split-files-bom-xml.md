---
id: build-42-mod-file-traps-load-order-split-files-bom-xml
slug: mod-file-traps-load-order-split-files-bom-xml
title: 'Mod file traps: load order, split files, BOM and XML comments'
game: pz
version: build-42
section: modding
category: lua-api
difficulty: beginner
tags:
  - lua
  - load-order
  - encoding
  - xml
  - silent-failure
excerpt: >-
  Five file traps in 42.22: Lua runs in sorted order, a mod file can replace vanilla's, a split file turns constants into nil, a BOM breaks a Lua or script file, and -- breaks an XML comment.
last_updated: '2026-11-16'
related_articles:
  - lua-load-order-and-the-three-lua-folders
  - kahlua-what-project-zomboid-lua-does-not-have
  - script-file-anatomy
  - testing-loop-and-common-load-errors
  - script-comments-what-slashes-do
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders whose mod loads but does nothing, or fails with an error that does not name the file. The load rules are on [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders), and the script-file rules are on [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy).

Outcast, these five traps are not about what your code does. They are about how the game reads your files, and each one fails without a useful error.

:::callout[The 1-minute version]{kind=key}
- Lua files run in sorted-path order, not in the order your code depends on. Do not call into another of your files at file scope; resolve it when an event fires.
- A mod file at the same path as a vanilla file replaces it, and runs once at vanilla's turn.
- When you split a Lua file, every new file must declare the `local` constants it uses. A missing one becomes a nil global, and nothing happens until that line runs.
- Save every Lua and script file as UTF-8 without a byte order mark (BOM). A BOM stops a `.lua` file from loading, and it makes the game skip the first `module` block of a script `.txt` file with no message.
- An XML comment should not contain `--`; the standard XML rule rejects it, and we did not re-run that at 42.22.
:::

:::facts
- **BOM bytes** `EF BB BF` at the start of a file
- **Lua token table** 31 entries, and a BOM reads as character 65279
- **Vanilla XML files** 6,233, of which 6 hold comments (18 in all)
- **Comments with `--` in vanilla XML** 0
:::

## 1. Your Lua files run in sorted order

**Inside each Lua folder the game runs vanilla's files first, then each mod's files, and a file's place in that line is its lower-case path, not what it needs.**

For each folder the game sorts vanilla's file list with a case-insensitive compare. It then collects the files of each mod in mod-list order, sorts each mod's list the same way, and appends it. :cite[(`zombie/Lua/LuaManager.java:1159-1202`)] A mod that names another in `require=` is placed after it, so the required mod's files run first. :cite[(`zombie/ZomboidFileSystem.java:826-852`)] The full rule, with the table for each mode, is on the [load order page](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

That order comes from the file system, never from your code's dependencies. So a call into a sibling file at file scope works only when the sibling's path sorts earlier.

```lua
-- MyMod_Contract.lua, at file scope
Events.OnGameStart.Add(MyMod.Log.guard(myHandler))
```

If `MyMod_Log.lua` sorts after `MyMod_Contract.lua`, then `MyMod.Log` is `nil` when that line runs, and the call fails with "attempted index: guard of non-table: null". :cite[(`se/krka/kahlua/vm/KahluaThread.java:1114-1141`)]

The rule: never call into another module at file scope. Register a plain function, and look the other module up when the event fires, because by then every file has run. If the other module may be missing, carry on without it rather than throw. For a file you must run first, `require` it. :cite[(`zombie/Lua/LuaManager.java:5711-5727`)]

## 2. A mod file at a vanilla path replaces vanilla's

**A mod file with the same relative path as a vanilla file runs once, at vanilla's turn in the order, and the copy that runs is the mod's.**

Each relative path is run once, because the loader keeps a set of paths it has already run. :cite[(`zombie/Lua/LuaManager.java:1204-1217`)] The path is turned into a file through a map that holds the last mod's copy for the path, and the loader logs `mod "<id>" overrides <path>` when it replaces an entry. :cite[(`zombie/ZomboidFileSystem.java:382-385`, `zombie/ZomboidFileSystem.java:656-695`)] When two mods ship the same path, the one loaded later wins.

So an override runs early, among vanilla's files, before every other mod file. The 42.21 version of this page said the vanilla file is the one used; at 42.22 the code shows the opposite. The [load order page](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders) states the same rule.

## 3. Splitting a file turns its constants into nil

**When you split one big Lua file into several, each new file must declare every file-local constant it uses, or the name becomes a global that is `nil`.**

A name that is not a local is read from the global table, and a global nobody set reads as `nil` with no error. :cite[(`se/krka/kahlua/vm/KahluaThread.java:273-283`, `se/krka/kahlua/vm/KahluaThread.java:1114-1141`)] So `local PAD = 10` left behind in the old file makes `x >= PAD` in the new file compare with `nil`, and it fails only when that exact line runs. A line that runs rarely hides the bug for weeks.

What helps:
- After any split, run a check that every file declares the constants it uses. When you write that check, strip strings before comments, or a string that contains `--` gives false hits.
- A test that a panel draws is not a test that it works. Click it, at real coordinates, with real data.

The same goes for vanilla's UI constants. Font heights such as `FONT_HGT_SMALL` are declared as a `local` in each vanilla file that uses them, so your file has to declare its own. 283 vanilla Lua files declare `local FONT_HGT_SMALL`, and the only other assignment of the name is a field, `ISDebugUtils.FONT_HGT_SMALL`. :cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugUtils.lua:4`)]

## 4. An invisible byte at the start of a file: the BOM

**A byte order mark makes the game skip a script file's first module block silently, and it stops a Lua file from loading with an error that hides the file name.**

Some editors and tools put the three bytes `EF BB BF` at the start of a UTF-8 file. Windows PowerShell 5.1 does it with `Set-Content -Encoding utf8` and `Out-File`; that is a fact about the outside tool, from the 42.21 page, and it was not re-tested here. Project Zomboid does not skip the mark, and what happens depends on the file.

### A Lua file

**The Lua lexer meets the mark as an unknown character, and the code that words the error crashes on it.**

The loader reads a `.lua` file through a UTF-8 reader that does not remove the mark, so the lexer sees one character, number 65279. :cite[(`zombie/Lua/LuaManager.java:1364-1376`, `zombie/core/IndieFileLoader.java:22-31`, `org/luaj/kahluafork/compiler/LexState.java:177-184`)] The lexer returns any character it does not know as its own token. :cite[(`org/luaj/kahluafork/compiler/LexState.java:565-572`)] The parser then reports "unexpected symbol" and looks the token up in a table of 31 names, at position 65279 minus 257, which is 65022. :cite[(`org/luaj/kahluafork/compiler/LexState.java:203-209`, `org/luaj/kahluafork/compiler/LexState.java:1612-1644`)]

```
ArrayIndexOutOfBoundsException: Index 65022 out of bounds for length 31
```

The loader catches the failure, writes `Error found in LUA file: <path>` through Java's own logger, logs the exception, and returns nothing. :cite[(`zombie/Lua/LuaManager.java:1377-1382`)] Everything that file defines is then missing. When this hit us on 42.21, the console showed the bare exception and no path; whether the path line reaches `console.txt` on 42.22 was not checked. Search the log for that line first, and if it is not there, check the bytes of your files.

A normal Lua's `luac -p` may not catch this, since later Lua versions skip a leading mark (not verified here). Check the bytes instead, for example in Git Bash: `head -c3 file.lua | od -An -tx1`, and look for `ef bb bf`.

### A script `.txt` file

**A script file with a mark loses its first `module` block with no message.**

The script loader reads the file through the same UTF-8 reader and joins the lines, then removes `/* */` comments. :cite[(`zombie/scripting/ScriptManager.java:1305-1306`, `zombie/scripting/ScriptManager.java:1335`)] It accepts a top-level block only when its text starts with the word `module`, and the mark sits in front of it. :cite[(`zombie/scripting/ScriptManager.java:1358-1360`)] Java's `trim` does not remove that character, and the game's own helper that would remove it has no caller. :cite[(`zombie/util/StringUtils.java:275-277`)]

A script file with a single module block loses the whole file, and the mod still shows as installed. A `/* */` comment before `module` is fine, because comments are removed first. The mark is not a comment. The other silent failure in script files, the `//` line, is on [Script comments: what slashes do](/pz/build-42/modding/gotchas/script-comments-what-slashes-do).

**The fix:** save as UTF-8 without a mark, and add a byte check for `EF BB BF` to whatever you run before you ship. In Windows PowerShell 5.1, `[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))` writes without it; that is the outside tool again, and was not re-tested.

## 5. XML comments may not contain a double hyphen

**The game reads its XML with Java's standard parser, which by the XML rule should reject `--` inside a comment; that was tested on 42.21 and not re-run on 42.22.**

Standard XML forbids `--` inside a comment, and the game does not change the parser's settings. :cite[(`zombie/util/PZXmlUtil.java:47-56`, `zombie/util/PZXmlUtil.java:240-258`)] That reader loads animation nodes, outfits and clothing decals, and the action groups use their own parser of the same kind. :cite[(`zombie/core/skinnedmodel/advancedanimation/AnimNode.java:218`, `zombie/core/skinnedmodel/population/OutfitManager.java:306`, `zombie/core/skinnedmodel/population/ClothingDecals.java:140`, `zombie/characters/action/ActionGroup.java:60-62`)]

```xml
<!-- fine - one hyphen -->
<!-- broken -- two hyphens -->
```

The second form is not valid XML. The game wraps a parse failure in a message that names the file, "Exception thrown while parsing XML file", and also prints "Exception parsing filename". :cite[(`zombie/util/PZXmlUtil.java:62-66`, `zombie/util/PZXmlUtil.java:255-258`)] It is easy to write when you comment out a block that already holds a comment, or decorate a note with `-----`.

The vanilla files agree, and they are a weak proof. At 42.22 vanilla has 6,233 XML files under `media`; only 6 of them hold comments, 18 comments in all, and none contains `--`. Which of the game's other XML readers use the same parser was not checked.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java, the Kahlua classes from a local decompile of the same jar, and the vanilla files; no game was run. The XML counts and the `FONT_HGT_SMALL` count were recounted over vanilla's `media` folder.

Corrected from the 42.21 page: a mod file at a vanilla path runs in vanilla's slot as the mod's copy (it said the vanilla copy is used); the vanilla XML count is 6,233 (was 6,153) and the comment count is stated, since "none has `--`" was a weak proof on its own; 283 files declare `local FONT_HGT_SMALL` (was 281). Dropped: the story of a mod that crashed on a file-scope call to a later-sorting file, as on the load-order page, and the story of a split panel found by a tester's debugger; both were from 42.20 play and could not be re-checked. The advice they supported stands on the code above.

Not verified: that the JDK parser throws on `--` at 42.22 (we ran the game's own Java runtime on both comments in 42.21 and only the second failed; not re-run), what a BOM does in a translation, `mod.info` or XML file, and the PowerShell behavior.
:::
