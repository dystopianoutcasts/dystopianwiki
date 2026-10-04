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
  Your Lua files run in alphabetical order, not dependency order. Splitting a
  file can turn its constants into nil globals. An invisible byte at the start
  of a file makes the game skip it without saying which. And XML comments may
  not contain a double hyphen. Checked against the 42.21 game.
last_updated: '2026-10-04'
related_articles:
  - lua-load-order-and-the-three-lua-folders
  - kahlua-what-project-zomboid-lua-does-not-have
  - script-comments-what-slashes-do
  - validate-data
---
# Mod file traps: load order, split files, BOM and XML comments

Outcast, these four are not about what your code does. They are about how the game reads your files, and every one of them fails without a useful error. Each cost us at least one full debugging session.

## Your Lua files run in alphabetical order

Inside each Lua folder (`shared`, `client`, `server`) the game runs vanilla's files first, then each mod's files, mod by mod. Within one mod, the files are sorted by their path inside the folder, ignoring case, and run in that order. A mod that `require=`s another is placed after it in the mod list, so the required mod's files run first.

That order is the filesystem's, never your code's dependency order. So:

```lua
-- OCP_Contract.lua, at file scope
Events.OnGameStart.Add(OCP.Log.guard(myHandler))
```

crashed our Outcast Punch for every player with `attempted index: guard of non-table: null`, because `OCP_Contract.lua` sorts before `OCP_Log.lua`, so `OCP.Log` did not exist yet. It had been added the day before, to report errors.

**The rule:** never call into another of your modules at file scope. Register a plain function and look the other module up when the event fires; by then every file has loaded. And if the other module is genuinely missing, carry on without it rather than throw.

One more consequence: a mod file with exactly the same path as a vanilla file is not run a second time in the mod's turn. The vanilla one is used.

> **Proof:** Code. `zombie.Lua.LuaManager#LoadDirBase(String, boolean)` (vanilla files and each mod's files sorted with `String.CASE_INSENSITIVE_ORDER` over lower-cased relative paths, vanilla first, mods in `ZomboidFileSystem#getModIDs` order, duplicate paths skipped); `zombie.ZomboidFileSystem#loadModAndRequired` (requirements placed first). The 42.21 change to `LoadDirBase` only changed declared types; the order is the same as in 42.20. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Game test. The `OCP_Contract.lua` crash, deterministic on every machine until the call moved inside the event. Build 42.20.

Why our tests missed it: our off-game test harness loaded a module the moment a test asked for it, which is dependency order, the one order the game never uses. If you test outside the game, add one test that loads every shipped file alphabetically per folder, `shared` first, and asserts nothing throws. Lua cannot list a folder, so also check that your harness's file list matches what is on disk: a file missing from the list is never tested.

## Splitting a file turns its constants into nil

When you split one big Lua file into several, each new file must declare every file-local constant it uses (`local PAD = 10`). Miss one and Lua does not complain: the name quietly becomes a global, the global is `nil`, and nothing happens until that exact line runs.

Ours sat dormant for two weeks, on a line that only ran for cars without diagram art. Then a new feature made that line run on almost every click, and the update that shipped the feature turned a hidden bug into a constant crash. The new feature's test proved the row was drawn; nothing ever clicked it.

What helps:
- After any split, run a check that every file declares the constants it uses. When you write that check, strip strings before comments, or a string containing `--` produces false hits.
- A test that a panel draws is not a test that it works. Click it, at real coordinates, with a real vehicle.

The same goes for vanilla's UI files: font height constants such as `FONT_HGT_SMALL` are declared as locals in each vanilla file, not as globals, so your file has to declare its own.

> **Proof:** Game test. A tester's debugger caught `x >= PAD` reading a nil global in a split panel file of Outcast Motors UI. Build 42.20.

> **Proof:** Code. 281 vanilla Lua files under `media/lua` declare `local FONT_HGT_SMALL`; none assigns it as a global. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## An invisible byte at the start of a file (the BOM)

Some editors and tools put three invisible bytes, `EF BB BF`, at the start of a UTF-8 file: a byte order mark, or BOM. Windows PowerShell 5.1 does it with `Set-Content -Encoding utf8` and `Out-File`. Project Zomboid does not skip it, and what happens depends on the file.

**A `.lua` file with a BOM is not loaded at all, and the error is easy to miss.** The game reads the file as UTF-8, so the BOM arrives as one invisible character. The Lua lexer does not know it, and when it tries to report "unexpected symbol" its own error message code crashes looking up the name of that character:

```
ArrayIndexOutOfBoundsException: Index 65022 out of bounds for length 31
```

The game does try to name the file: it logs `Error found in LUA file: <path>` through Java's own logger just before the exception. But when this hit us, the console we read showed the bare exception and stack with no path, no line and no mod name, so we had to find the file by elimination. Search the log for that line first; if it is not there, check the bytes of your files. Either way, everything that file defines is missing later.

A normal Lua's `luac -p` will not catch this: Lua 5.2 and later skip a leading BOM on purpose, so it passes the file the game rejects. Check the bytes instead, for example in Git Bash: `head -c3 file.lua | od -An -tx1` and look for `ef bb bf`.

> **Proof:** Code. `zombie.Lua.LuaManager#RunLuaInternal` reads through `IndieFileLoader.getStreamReader` (UTF-8, no BOM handling anywhere in `LuaManager` or the compiler); `#RunLuaInternal` catches the compile error and logs `Error found in LUA file` with `java.util.logging`; `org.luaj.kahluafork.compiler.LexState#llex` returns U+FEFF as a token and `#token2str` indexes its 31-entry token table with it. We ran `LexState.compile` from the game's jar on a file starting with a BOM and got the exception above; the same file without the BOM compiled. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

**A script `.txt` file with a BOM loses its first `module` block, silently.** The game only accepts a top-level block whose text starts with the word `module`, and the BOM sits in front of it. Most script files have one module block, so for them the whole file is gone. The mod still shows as installed. A `/* */` comment before `module` is fine, because comments are removed first; the BOM is not a comment.

> **Proof:** Code. `zombie.scripting.ScriptManager#LoadFile` (same UTF-8 reader, no BOM handling) and `#CreateFromToken` (`token.trim()`, then `token.indexOf("module") == 0`; `trim` does not remove U+FEFF). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

**The fix:** save as UTF-8 without BOM. In PowerShell 5.1, write files with `[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))`. And add a byte check for `EF BB BF` to whatever you run before you ship.

## XML comments may not contain a double hyphen

The game reads its XML files (AnimSets, action groups, clothing, the file GUID table) with Java's standard XML parser. Standard XML forbids `--` inside a comment, and the parser enforces it:

```xml
<!-- fine - one hyphen -->
<!-- broken -- two hyphens -->
```

The second throws `The string "--" is not permitted within comments.` and the file does not load. It is easy to write when you comment out a block that itself contains a comment, or decorate a note with `-----`. Vanilla ships 6,153 XML files and none of its comments contain `--`.

> **Proof:** Code. `zombie.util.PZXmlUtil` (a `DocumentBuilderFactory` parser, used by `AnimNode` for AnimSets and by the clothing loader), `ActionGroup` (its own `DocumentBuilderFactory`), `ZomboidFileSystem` (JAXB for the file GUID table); we parsed both comments above with the game's own Java runtime and jar, and only the second failed. Counted `<!--` comments in the vanilla XML under `media`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).
