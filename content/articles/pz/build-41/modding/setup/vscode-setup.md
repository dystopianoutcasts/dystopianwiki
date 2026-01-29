---
id: setup-vscode-setup
slug: vscode-setup
title: "Installing VS Code"
game: pz
version: build-41
section: modding
category: setup
subcategory: null
difficulty: beginner
tags:
  - beginner
  - setup
  - vscode
  - editor
  - tools
  - getting-started
excerpt: "Set up Visual Studio Code for Project Zomboid modding with essential extensions, keyboard shortcuts, and configuration tips."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Why VS Code?"
    link: "#why-vs-code"
  - text: "Installation Steps"
    link: "#installation-steps"
  - text: "Essential Extensions"
    link: "#essential-extensions"
  - text: "Opening Your First Mod Folder"
    link: "#opening-your-first-mod-folder"
  - text: "Understanding the Interface"
    link: "#understanding-the-interface"
  - text: "Useful Keyboard Shortcuts"
    link: "#useful-keyboard-shortcuts"
  - text: "Configuring for PZ Modding"
    link: "#configuring-for-pz-modding"
  - text: "Workspace Settings"
    link: "#workspace-settings"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Mod Folder Structure"
    path: /build-41/modding/setup/mod-folder-structure
  - title: "The mod.info File"
    path: /build-41/modding/setup/mod-info-file
last_updated: 2026-01-09
---

# Installing VS Code

## What Is VS Code and Why Do You Need It?

You know when you try to edit a Lua file in Notepad and everything is just black text on white? No colors. No way to tell if you made a typo. No indication that you're missing a closing bracket until the game crashes. You spend 20 minutes hunting for a single missing comma because everything looks the same.

**A proper code editor changes everything.** Visual Studio Code (VS Code) highlights different parts of your code in different colors - functions are one color, strings are another, comments are grayed out. It underlines errors before you even save the file. It auto-completes function names so you don't have to remember exact spellings. It shows you the entire folder structure of your mod at once, making navigation instant.

When I started modding, I used Notepad. I thought "it's just text, any editor works." I spent hours debugging syntax errors that VS Code would have highlighted immediately. I would search through files by opening them one at a time because Notepad can't search across multiple files. I had no idea where I was in my project because Notepad only shows one file at a time. Moving to VS Code reduced my debugging time by 70%. Features I thought were "nice to have" turned out to be essential.

**This guide will walk you through installing VS Code, setting it up perfectly for Project Zomboid modding, installing essential extensions, and configuring it to make Lua development as smooth as possible.** By the end, you'll have a professional development environment that makes coding faster, easier, and way less frustrating.

## Overview

Visual Studio Code (VS Code) is a free, lightweight code editor that's perfect for PZ modding. It handles Lua scripts, text files, and JSON with syntax highlighting, making errors easier to spot.

## Why VS Code?

| Feature | Benefit for Modding |
|---------|--------------------|
| **Free & Cross-Platform** | Works on Windows, Mac, Linux |
| **Lua Support** | Syntax highlighting for .lua files |
| **Folder View** | See your entire mod structure at once |
| **Search** | Find text across all files instantly |
| **Extensions** | Add Lua linting, PZ-specific tools |
| **Lightweight** | Runs fast, even on older machines |

## Installation Steps

### Step 1: Download VS Code

1. Go to [code.visualstudio.com](https://code.visualstudio.com)
2. Click the download button for your operating system
3. Run the installer

### Step 2: Install During Setup

During installation, check these options:
- **Add "Open with Code" to context menu** - Right-click folders to open them
- **Register Code as an editor for supported file types** - Double-click to open files
- **Add to PATH** - Use `code` command in terminal

### Step 3: First Launch

When VS Code opens:
1. Choose your color theme (dark themes are easier on the eyes)
2. Skip the "Get Started" tutorial for now
3. Close the Welcome tab

## Essential Extensions

Click the Extensions icon (square icon on the left sidebar) and install:

### 1. Lua (by sumneko)

The most important extension for PZ modding:
- Lua syntax highlighting
- Error detection
- Auto-completion
- Hover documentation

Search: `sumneko.lua`

### 2. Even Better TOML

For reading mod.info files (TOML format):
- Syntax highlighting for .info files

Search: `tamasfe.even-better-toml`

### 3. EditorConfig

Maintains consistent formatting:
- Consistent indentation
- Line ending handling

Search: `EditorConfig.EditorConfig`

## Opening Your First Mod Folder

### Method 1: File Menu
1. File > Open Folder
2. Navigate to your mod folder
3. Click "Select Folder"

### Method 2: Right-Click (if you enabled context menu)
1. Find your mod folder in File Explorer
2. Right-click the folder
3. Select "Open with Code"

### Method 3: Command Line
```bash
cd path/to/your/mod
code .
```

## Understanding the Interface

```
┌─────────────────────────────────────────────────────┐
│  File  Edit  View  ...                    [icons]   │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  EXPLORER│     Editor Area                          │
│          │     (your code here)                     │
│  > media │                                          │
│    > lua │                                          │
│    > ... │                                          │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  PROBLEMS  OUTPUT  TERMINAL                         │
└─────────────────────────────────────────────────────┘
```

**Key Areas:**
- **Explorer** (left): Your mod's file tree
- **Editor** (center): Where you write code
- **Problems** (bottom): Shows errors and warnings
- **Terminal** (bottom): Run commands

## Useful Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Open file | Ctrl+P | Cmd+P |
| Search in files | Ctrl+Shift+F | Cmd+Shift+F |
| Go to line | Ctrl+G | Cmd+G |
| Toggle sidebar | Ctrl+B | Cmd+B |
| Open terminal | Ctrl+` | Cmd+` |
| Save file | Ctrl+S | Cmd+S |
| Undo | Ctrl+Z | Cmd+Z |

## Configuring for PZ Modding

### Associate .txt Files with Lua

PZ script files use `.txt` extension but contain Lua-like syntax:

1. Open a `.txt` script file
2. Click "Plain Text" in the bottom-right corner
3. Select "Configure File Association for '.txt'"
4. Choose "Lua"

Now all .txt files get Lua highlighting.

### Set Default Indentation

1. File > Preferences > Settings
2. Search "tab size"
3. Set to `4` (PZ convention)
4. Enable "Insert Spaces"

## Workspace Settings

Create a `.vscode/settings.json` in your mod folder:

```json
{
  "files.associations": {
    "*.txt": "lua"               // Treat .txt files as Lua (for PZ script files)
  },
  "editor.tabSize": 4,           // Use 4 spaces per tab (PZ convention)
  "editor.insertSpaces": true,   // Use spaces instead of tabs
  "files.eol": "\n"              // Unix-style line endings (recommended)
}
```

**How to create this:**
1. In your mod folder, create a folder named `.vscode`
2. Inside `.vscode`, create a file named `settings.json`
3. Paste the above content
4. Save the file

**What this does:** These settings apply only to this mod project. When you open the mod folder in VS Code, these settings override your global settings. This ensures consistent formatting across all your mod files.

## Common Mistakes

### 1. Opening Individual Files Instead of the Folder

❌ **Wrong:**
```
File → Open File → Select main.lua
(Only one file visible, can't see project structure)
```

✅ **Right:**
```
File → Open Folder → Select your mod folder
(Entire mod visible in Explorer panel on left)
```

**Why:** Opening individual files means you can't see your project structure, can't quickly navigate between files, and lose features like multi-file search. Always open the entire mod folder, not individual files.

**How to tell:** Look at the left sidebar. If you don't see a file tree with your `media/` folder and all subfolders, you opened a file instead of a folder.

---

### 2. Not Installing the Lua Extension

❌ **Wrong:**
```lua
function myFunction()
    -- All text is plain white, no syntax highlighting
    -- Errors not detected until game runs
end
```

✅ **Right:**
```lua
function myFunction()
    -- 'function' is highlighted in purple
    -- 'myFunction' is highlighted in yellow
    -- Syntax errors are underlined in red immediately
end
```

**Why:** Without the Lua extension, VS Code treats `.lua` files as plain text. No syntax highlighting, no error detection, no auto-completion. The extension is what makes VS Code useful for Lua development.

**How to install:** Click Extensions icon (squares icon in left sidebar) → Search "lua" → Install "Lua" by sumneko → Reload VS Code.

---

### 3. Not Associating .txt Files with Lua

❌ **Wrong:**
```
Open items.txt → Plain text, no highlighting
(PZ script files use .txt extension but are Lua-like)
```

✅ **Right:**
```
Open items.txt → Lua syntax highlighting
(Treated as Lua code even though it's .txt)
```

**Why:** Project Zomboid script files (items, recipes, vehicles) use `.txt` extensions but contain Lua-like syntax. Without associating `.txt` with Lua, you lose syntax highlighting in your most important files.

**How to fix:**
1. Open any `.txt` file from your mod
2. Look at bottom-right corner of VS Code (shows "Plain Text")
3. Click "Plain Text"
4. Type "Lua" in the search box
5. Select "Configure File Association for '.txt'"
6. Choose "Lua"

---

### 4. Ignoring the Problems Panel

❌ **Wrong:**
```
Write code, save, run game, game crashes
"Why doesn't my code work?"
(Didn't check the Problems panel)
```

✅ **Right:**
```
Write code, see red squiggle under error
Open Problems panel (Ctrl+Shift+M)
"Oh, I have an unclosed bracket on line 45"
Fix it before even running the game
```

**Why:** The Problems panel (bottom of VS Code) shows syntax errors, missing variables, and other issues detected by the Lua extension. Checking this before running your mod saves time - fix errors in 5 seconds instead of debugging crashes for 20 minutes.

**How to use:** Press `Ctrl+Shift+M` to open Problems panel, or click "Problems" tab at the bottom. Red icons = errors, yellow = warnings.

---

### 5. Using Tabs Instead of Spaces

❌ **Wrong:**
```lua
function test()
→   if true then          # Tab characters (→) - causes issues
→   →   print("test")      # Different editors show different widths
→   end
end
```

✅ **Right:**
```lua
function test()
    if true then          # Spaces - consistent everywhere
        print("test")      # Looks the same in all editors
    end
end
```

**Why:** Tab characters display differently in different editors and can cause issues with Lua's whitespace-sensitive syntax. Spaces are consistent everywhere. PZ convention is 4 spaces per indent level.

**How to configure:**
1. File → Preferences → Settings
2. Search "insert spaces"
3. Enable "Editor: Insert Spaces"
4. Search "tab size"
5. Set to `4`

---

## Try It Yourself

### Exercise 1: Install VS Code and Extensions

**Goal:** Get a fully functional VS Code setup for PZ modding.

**Steps:**
1. Download VS Code from code.visualstudio.com
2. Install with "Add to PATH" and "Open with Code" options enabled
3. Launch VS Code
4. Install extensions:
   - Lua (by sumneko)
   - Even Better TOML (optional, for mod.info)

<details>
<summary><strong>Solution</strong></summary>

**Installation checklist:**

1. **Download:**
   - Visit https://code.visualstudio.com
   - Download for your OS (Windows/Mac/Linux)
   - Run installer

2. **Installation options (check these):**
   - ✓ Add "Open with Code" action to Windows Explorer context menu
   - ✓ Register Code as an editor for supported file types
   - ✓ Add to PATH (enables `code` command in terminal)

3. **First launch:**
   - Choose dark theme (easier on eyes for long coding sessions)
   - Close Welcome tab

4. **Install Lua extension:**
   - Click Extensions icon (four squares, left sidebar)
   - Search "lua"
   - Find "Lua" by sumneko
   - Click Install
   - Wait for installation to complete

5. **Verify installation:**
   - Create a new file (Ctrl+N)
   - Save as `test.lua`
   - Type: `function test() end`
   - If "function" is colored purple/blue, Lua extension is working!

</details>

---

### Exercise 2: Open a Mod Folder and Navigate

**Goal:** Practice opening folders and using navigation shortcuts.

**Steps:**
1. Navigate to `%UserProfile%\Zomboid\mods`
2. Create a test mod folder: `VSCodeTest`
3. Create inside it: `media/lua/client/test.lua`
4. Open the `VSCodeTest` folder in VS Code
5. Use Ctrl+P to quick-open `test.lua`
6. Use Ctrl+B to toggle sidebar

<details>
<summary><strong>Solution</strong></summary>

**Creating the test mod:**
```powershell
cd "$env:USERPROFILE\Zomboid\mods"
mkdir VSCodeTest\media\lua\client -Force
```

**Opening in VS Code:**
- Method 1: Right-click `VSCodeTest` folder → "Open with Code"
- Method 2: In VS Code, File → Open Folder → Select `VSCodeTest`
- Method 3: Terminal: `cd VSCodeTest` then `code .`

**Testing navigation:**
1. **Quick Open (Ctrl+P):**
   - Press Ctrl+P
   - Type "test"
   - See `test.lua` in the list
   - Press Enter to open it

2. **Toggle Sidebar (Ctrl+B):**
   - Press Ctrl+B → Sidebar hides (more screen space)
   - Press Ctrl+B again → Sidebar shows

3. **Search in Files (Ctrl+Shift+F):**
   - Type some code in test.lua: `function myTest() end`
   - Press Ctrl+Shift+F
   - Type "myTest"
   - See the search result pointing to your file

**What you've learned:** These shortcuts make navigating large mod projects 10x faster than clicking through folders.

</details>

---

### Exercise 3: Configure .txt Files for Lua Highlighting

**Goal:** Make PZ script files (.txt) display with Lua syntax highlighting.

**Steps:**
1. In your test mod, create `media/scripts/items.txt`
2. Add this content:
   ```
   module Base {
       item TestItem {
           DisplayName = Test,
       }
   }
   ```
3. Open the file in VS Code
4. Associate .txt with Lua language
5. Verify syntax highlighting appears

<details>
<summary><strong>Solution</strong></summary>

**Create the script file:**
```powershell
mkdir "$env:USERPROFILE\Zomboid\mods\VSCodeTest\media\scripts" -Force
# Then create items.txt in that folder with the example content
```

**Configure .txt association:**
1. Open `items.txt` in VS Code
2. Look at bottom-right corner - it says "Plain Text"
3. Click "Plain Text"
4. Search box appears - type "Lua"
5. Two options appear:
   - "Change Language Mode" (temporary, this file only)
   - "Configure File Association for '.txt'" (permanent, all .txt files)
6. Select "Configure File Association for '.txt'"
7. Choose "Lua"

**Verify it worked:**
- `module` should be highlighted (purple/blue)
- `Base` should be highlighted (different color)
- `item` should be highlighted
- Strings like `"Test"` should be highlighted in orange/green

**Alternative method (workspace settings):**
Create `.vscode/settings.json` in your mod folder:
```json
{
  "files.associations": {
    "*.txt": "lua"
  }
}
```

This associates .txt with Lua for this project only.

</details>

---

## Best Practices

1. **Always open folders, never individual files** - Opening the entire mod folder gives you the file tree, multi-file search, and proper project context. Use File → Open Folder, not File → Open File.

2. **Learn the essential keyboard shortcuts** - Ctrl+P (quick open), Ctrl+Shift+F (search in files), Ctrl+B (toggle sidebar), Ctrl+` (toggle terminal). These alone will save you hours of clicking through menus.

3. **Keep the Problems panel visible** - Press Ctrl+Shift+M to open it if hidden. Check it after every significant code change. Catching errors early (before running the game) saves massive debugging time.

4. **Use workspace settings for mod-specific config** - Create `.vscode/settings.json` in each mod folder with .txt → Lua association, tab size, and formatting rules. Ensures consistency when switching between projects.

5. **Install extensions as needed, not all at once** - Start with just the Lua extension. Add others (TOML, EditorConfig, etc.) only when you actually need them. Too many extensions slow down VS Code and clutter the interface.

6. **Enable auto-save** - File → Preferences → Settings → Search "auto save" → Set to "afterDelay". Prevents losing work if you forget to save. The file saves automatically 1 second after you stop typing.

7. **Use integrated terminal for quick tasks** - Press Ctrl+` to open terminal. You can run git commands, Python scripts, or navigate files without leaving VS Code. Faster than switching to a separate terminal window.

---

## Key Takeaways

1. **VS Code is free and cross-platform** - Works on Windows, Mac, and Linux. Download from code.visualstudio.com.
2. **Install the Lua extension by sumneko** - Essential for syntax highlighting, error detection, and auto-completion. Without it, you're using a plain text editor.
3. **Always open folders, not individual files** - File → Open Folder shows your entire mod structure. Required for features like multi-file search and proper project navigation.
4. **Associate .txt files with Lua** - PZ script files use .txt extension. Click "Plain Text" in bottom-right → "Configure File Association for '.txt'" → Choose "Lua".
5. **Learn 4 essential shortcuts** - Ctrl+P (quick open), Ctrl+Shift+F (search files), Ctrl+B (toggle sidebar), Ctrl+` (toggle terminal). These alone make you 10x faster.
6. **Check the Problems panel regularly** - Ctrl+Shift+M opens it. Shows syntax errors before you run the game. Red = errors, yellow = warnings. Fix them immediately.
7. **Use spaces, not tabs (4 spaces per indent)** - Settings → "Insert Spaces" → Enable. Settings → "Tab Size" → 4. Consistent with PZ conventions.
8. **Create .vscode/settings.json for each mod** - Per-project settings ensure consistent formatting and .txt → Lua association without affecting your global VS Code config.
