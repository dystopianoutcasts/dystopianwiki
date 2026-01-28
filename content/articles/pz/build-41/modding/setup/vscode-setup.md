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
    "*.txt": "lua"
  },
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "files.eol": "\n"
}
```

This ensures consistent settings for your mod project.

## Key Takeaways

1. **VS Code is free** and works on all operating systems
2. **Install the Lua extension** - it's essential for PZ modding
3. **Open folders, not files** - see your whole mod structure
4. **Learn Ctrl+P and Ctrl+Shift+F** - navigate and search fast
5. **Associate .txt with Lua** for syntax highlighting in script files
