# ISUI Dialogs & Windows

## Overview

This document covers dialog and window components in Project Zomboid's ISUI framework. These components handle modal dialogs, input prompts, tab panels, and rich text display.

**Components Covered:**
- **ISModalDialog** - Simple Yes/No or OK dialog
- **ISModalRichText** - Modal with rich text content
- **ISTextBox** - Text input dialog with OK/Cancel
- **ISRichTextBox** - Text input with rich text prompt
- **ISTabPanel** - Multi-tab container with draggable tabs
- **ISRichTextPanel** - Scrollable rich text display

---

## Inheritance Hierarchy

```
ISBaseObject
└── ISUIElement
    └── ISPanel
        ├── ISPanelJoypad
        │   ├── ISModalDialog
        │   ├── ISModalRichText
        │   ├── ISTextBox
        │   └── ISRichTextBox
        ├── ISTabPanel
        └── ISRichTextPanel
```

---

## ISModalDialog

A simple modal dialog for Yes/No confirmations or OK acknowledgments. Inherits from `ISPanelJoypad`.

**Source:** `media/lua/client/ISUI/ISModalDialog.lua` (285 lines)

### Constructor

```lua
ISModalDialog:new(x, y, width, height, text, yesno, target, onclick, player, param1, param2)
```

| Parameter | Description |
|-----------|-------------|
| `x, y` | Position (use 0,0 to auto-center on mouse/player screen) |
| `width, height` | Dimensions (auto-sized to fit text) |
| `text` | Message to display (supports `\n` for newlines) |
| `yesno` | `true` for Yes/No buttons, `false` for OK only |
| `target` | Callback target object |
| `onclick` | Callback function |
| `player` | Player index (for split-screen positioning) |
| `param1, param2` | Extra parameters passed to callback |

### Auto-Sizing

The dialog automatically calculates size to fit content:

```lua
-- Static method for size calculation
local width, height = ISModalDialog.CalcSize(minWidth, minHeight, text)
```

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `text` | (required) | Display message |
| `yesno` | `false` | Yes/No mode vs OK mode |
| `yes` | `nil` | Yes button (created on init) |
| `no` | `nil` | No button (created on init) |
| `ok` | `nil` | OK button (created on init) |
| `target` | `nil` | Callback target |
| `onclick` | `nil` | Callback function |
| `param1, param2` | `nil` | Extra callback params |
| `player` | `nil` | Player index |
| `moveWithMouse` | `false` | Allow dragging dialog |
| `backgroundColor` | `{r=0, g=0, b=0, a=0.8}` | Background color |
| `borderColor` | `{r=0.4, g=0.4, b=0.4, a=1}` | Border color |

### Callback Signature

```lua
function onclick(target, button, param1, param2)
    -- button.internal = "YES", "NO", or "OK"
    -- button.player = player index
    if button.internal == "YES" then
        -- Handle yes
    elseif button.internal == "NO" then
        -- Handle no
    end
end
```

### Key Methods

| Method | Description |
|--------|-------------|
| `initialise()` | Create buttons based on yesno mode |
| `destroy()` | Remove dialog, restore game speed |
| `onClick(button)` | Internal button handler |
| `prerender()` | Draw background, border, centered text |

### Joypad Support

| Button | Action |
|--------|--------|
| A Button | Yes/OK |
| B Button | No (if yesno mode) |

### Usage Example

```lua
-- Yes/No confirmation
local modal = ISModalDialog:new(
    0, 0,  -- Auto-center
    250, 100,
    "Are you sure you want to delete this item?",
    true,  -- Yes/No mode
    self,
    self.onDeleteConfirm,
    playerIndex
)
modal:initialise()
modal:addToUIManager()

-- Set joypad focus if using controller
if playerObj:getJoypadBind() ~= -1 then
    modal.prevFocus = getJoypadFocus(playerIndex)
    setJoypadFocus(playerIndex, modal)
end

function MyPanel:onDeleteConfirm(button)
    if button.internal == "YES" then
        -- Perform delete
        self:deleteItem()
    end
    -- Dialog auto-destroys after callback
end
```

```lua
-- Simple OK acknowledgment
local modal = ISModalDialog:new(
    0, 0, 200, 80,
    "Operation completed successfully!",
    false,  -- OK only
    self,
    self.onAcknowledge
)
modal:initialise()
modal:addToUIManager()
```

---

## ISModalRichText

A modal dialog with scrollable rich text content. Supports formatted text with colors, fonts, and images.

**Source:** `media/lua/client/ISUI/ISModalRichText.lua` (256 lines)

### Constructor

```lua
ISModalRichText:new(x, y, width, height, text, yesno, target, onclick, player, param1, param2)
```

Same parameters as ISModalDialog, but `text` supports rich text formatting.

### Key Differences from ISModalDialog

- Uses `ISRichTextPanel` for text display instead of simple `drawTextCentre`
- Auto-resizes height to fit content (up to screen height - 40)
- Supports scrolling for long content
- `destroyOnClick` property controls whether dialog removes itself

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `chatText` | `nil` | ISRichTextPanel for content |
| `destroyOnClick` | `true` | Remove from UI on button click |
| `alwaysOnTop` | `false` | Keep dialog on top |

### Rich Text Formatting

The `text` parameter supports ISRichTextPanel formatting codes (see ISRichTextPanel section).

### Usage Example

```lua
local richModal = ISModalRichText:new(
    0, 0, 400, 300,
    "<H1> Important Notice <LINE> " ..
    "<TEXT> <RGB:1,0.8,0.8> This action cannot be undone! <LINE> " ..
    "<RGB:0.7,0.7,0.7> Please confirm you want to proceed.",
    true,
    self,
    self.onConfirm
)
richModal:initialise()
richModal:addToUIManager()
```

---

## ISTextBox

A dialog with a text entry field for user input. Includes OK/Cancel buttons and validation support.

**Source:** `media/lua/client/ISUI/ISTextBox.lua` (365 lines)

### Constructor

```lua
ISTextBox:new(x, y, width, height, text, defaultEntryText, target, onclick, player, param1, param2, param3, param4)
```

| Parameter | Description |
|-----------|-------------|
| `x, y` | Position (0,0 to auto-center) |
| `width, height` | Dimensions |
| `text` | Prompt text above entry field |
| `defaultEntryText` | Initial text in entry field |
| `target` | Callback target |
| `onclick` | Callback function |
| `player` | Player index |
| `param1-param4` | Extra callback parameters |

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `entry` | `nil` | ISTextEntryBox for input |
| `yes` | `nil` | OK button |
| `no` | `nil` | Cancel button |
| `numLines` | `1` | Number of visible lines |
| `maxLines` | `1` | Maximum lines allowed |
| `multipleLine` | `false` | Allow multi-line input |
| `maxChars` | `nil` | Maximum character limit |
| `noEmpty` | `false` | Disallow empty input |
| `validateFunc` | `nil` | Custom validation function |
| `validateTooltipText` | `nil` | Tooltip when validation fails |
| `showError` | `false` | Show error message |
| `errorMsg` | `nil` | Error message text |
| `colorBtn` | `nil` | Optional color picker button |

### Validation

```lua
-- Set validation function
textBox:setValidateFunction(target, validateFunc, arg1, arg2)
textBox:setValidateTooltipText("Name must be unique")

-- Validation function signature
function validateFunc(target, text, arg1, arg2)
    return text:len() >= 3  -- Return true if valid
end
```

### Multi-line Input

```lua
textBox:setMultipleLine(true)
textBox:setNumberOfLines(3)  -- Visible lines
textBox:setMaxLines(5)       -- Maximum allowed lines
```

### Color Picker

```lua
-- Enable color picker for text color selection
textBox:enableColorPicker()
-- Access selected color via textBox.currentColor
```

### Callback Signature

```lua
function onclick(target, button, param1, param2, param3, param4)
    if button.internal == "OK" then
        local enteredText = button.parent.entry:getText()
        -- Use the entered text
    end
    -- "CANCEL" means user cancelled
end
```

### Usage Example

```lua
-- Simple text input
local textBox = ISTextBox:new(
    0, 0, 300, 120,
    "Enter item name:",
    "New Item",
    self,
    self.onNameEntered
)
textBox.noEmpty = true
textBox.maxChars = 50
textBox:initialise()
textBox:addToUIManager()

function MyPanel:onNameEntered(button)
    if button.internal == "OK" then
        local name = button.parent.entry:getText()
        self:createItem(name)
    end
end
```

```lua
-- Multi-line note input
local noteBox = ISTextBox:new(0, 0, 400, 200, "Enter note:", "", self, self.onNoteEntered)
noteBox:setMultipleLine(true)
noteBox:setNumberOfLines(4)
noteBox:setMaxLines(10)
noteBox:initialise()
noteBox:addToUIManager()
```

---

## ISRichTextBox

A text input dialog with rich text prompt. Combines ISRichTextPanel for display with ISTextEntryBox for input.

**Source:** `media/lua/client/ISUI/ISRichTextBox.lua` (206 lines)

### Constructor

Same as ISTextBox, but `text` parameter supports rich text formatting.

### Key Features

- Rich text prompt area (ISRichTextPanel)
- Single-line text entry field
- OK/Cancel buttons
- Validation support

### Usage Example

```lua
local richBox = ISRichTextBox:new(
    0, 0, 400, 200,
    "<H2> Create New Character <LINE> " ..
    "<TEXT> <RGB:0.8,0.8,0.8> Enter a unique name for your character. " ..
    "Names must be 3-20 characters.",
    "DefaultName",
    self,
    self.onCharacterNameEntered
)
richBox:setValidateFunction(self, self.validateCharName)
richBox:initialise()
richBox:addToUIManager()
```

---

## ISTabPanel

A container with multiple tabbed views. Supports tab dragging, reordering, and tearing off into separate windows.

**Source:** `media/lua/client/ISUI/ISTabPanel.lua` (674 lines)

### Constructor

```lua
ISTabPanel:new(x, y, width, height)
```

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `viewList` | `{}` | Array of view objects |
| `activeView` | `nil` | Currently active view |
| `tabHeight` | (font + 6) | Height of tab bar |
| `tabPadX` | `20` | Horizontal padding for tab text |
| `maxLength` | `0` | Max tab width (auto-calculated) |
| `equalTabWidth` | `true` | Make all tabs same width |
| `centerTabs` | `false` | Center tabs in available space |
| `allowDraggingTabs` | `false` | Allow tab reordering |
| `allowTornOffTabs` | `false` | Allow tabs to become windows |
| `scrollX` | `0` | Horizontal scroll offset |
| `tabTransparency` | `1.0` | Tab background alpha |
| `textTransparency` | `1.0` | Tab text alpha |
| `blinkTabs` | `{}` | Tabs to blink for attention |
| `blinkTab` | `nil` | Single tab to blink |

### View Object Structure

```lua
{
    name = "Tab Name",          -- Display text and identifier
    view = ISUIElement,         -- The view component
    tabWidth = 100,             -- Calculated tab width
    fade = UITransition         -- Hover fade animation
}
```

### View Management Methods

| Method | Description |
|--------|-------------|
| `addView(name, view)` | Add a new tab with view component |
| `removeView(view)` | Remove a tab by view reference |
| `getView(viewName)` | Get view component by tab name |
| `activateView(viewName)` | Switch to named tab |
| `getActiveView()` | Get currently active view component |
| `getActiveViewIndex()` | Get index of active tab |

### Tab Configuration Methods

| Method | Description |
|--------|-------------|
| `setEqualTabWidth(equal)` | Toggle equal width tabs |
| `setCenterTabs(center)` | Toggle tab centering |
| `setTabsTransparency(alpha)` | Set tab background alpha |
| `setTextTransparency(alpha)` | Set tab text alpha |
| `ensureVisible(index)` | Scroll to make tab visible |

### Tab Scrolling

When tabs overflow the panel width, scroll arrows appear:

| Method | Description |
|--------|-------------|
| `getWidthOfAllTabs()` | Calculate total tab width |
| `getTabX(index, scrollX)` | Get X position of tab |
| `getTabIndexAtX(x, scrollX)` | Get tab index at position |
| `getScrollButtonAtX(x)` | Get "left"/"right" or nil |

### Tab Blinking

```lua
-- Blink single tab
tabPanel.blinkTab = "Inventory"

-- Blink multiple tabs
tabPanel.blinkTabs = {"Inventory", "Crafting"}

-- Stop blinking
tabPanel.blinkTab = nil
table.wipe(tabPanel.blinkTabs)
```

### Tab Torn Off Callback

```lua
tabPanel:setOnTabTornOff(target, method)

-- Callback signature
function method(target, tornView, newWindow)
    -- tornView = the view that was torn off
    -- newWindow = the new ISCollapsableWindow containing it
end
```

### Activation Callback

```lua
tabPanel.target = self
tabPanel.onActivateView = function(target, tabPanel)
    local activeView = tabPanel:getActiveView()
    -- React to tab change
end
```

### Usage Example

```lua
-- Create tab panel
local tabPanel = ISTabPanel:new(0, 0, 400, 300)
tabPanel:initialise()
tabPanel:instantiate()

-- Create views
local inventoryView = ISPanel:new(0, 0, 400, 300 - tabPanel.tabHeight)
inventoryView:initialise()

local craftingView = ISPanel:new(0, 0, 400, 300 - tabPanel.tabHeight)
craftingView:initialise()

local skillsView = ISPanel:new(0, 0, 400, 300 - tabPanel.tabHeight)
skillsView:initialise()

-- Add tabs
tabPanel:addView("Inventory", inventoryView)
tabPanel:addView("Crafting", craftingView)
tabPanel:addView("Skills", skillsView)

-- Configure
tabPanel:setEqualTabWidth(false)  -- Variable width tabs
tabPanel.allowDraggingTabs = true  -- Allow reordering

parentWindow:addChild(tabPanel)

-- Switch programmatically
tabPanel:activateView("Crafting")
```

### Tab Dragging/Tearing

```lua
-- Enable tab reordering via drag
tabPanel.allowDraggingTabs = true

-- Enable tearing tabs into separate windows
tabPanel.allowTornOffTabs = true

-- Handle torn-off tabs
tabPanel:setOnTabTornOff(self, function(target, view, newWindow)
    -- Track the new window
    table.insert(self.detachedWindows, newWindow)
end)
```

---

## ISRichTextPanel

A scrollable panel for displaying formatted rich text with colors, fonts, images, and layout control.

**Source:** `media/lua/client/ISUI/ISRichTextPanel.lua` (643 lines)

### Constructor

```lua
ISRichTextPanel:new(x, y, width, height)
```

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `text` | `""` | Raw text with formatting codes |
| `marginLeft` | `20` | Left margin |
| `marginTop` | `10` | Top margin |
| `marginRight` | `10` | Right margin |
| `marginBottom` | `10` | Bottom margin |
| `autosetheight` | `true` | Auto-resize height to content |
| `contentTransparency` | `1.0` | Content alpha |
| `clip` | `false` | Clip content to panel bounds |
| `maxLines` | `0` | Max lines (0 = unlimited) |
| `maxLineWidth` | `nil` | Override line width calculation |
| `defaultFont` | `UIFont.NewSmall` | Default font |

### Formatting Codes

Rich text uses `<CODE>` tags for formatting:

#### Text Styling

| Code | Description |
|------|-------------|
| `<H1>` | Large centered white header |
| `<H2>` | Medium left-aligned gray header |
| `<TEXT>` | Normal body text |
| `<SIZE:small>` | Small font |
| `<SIZE:medium>` | Medium font |
| `<SIZE:large>` | Large font |

#### Alignment

| Code | Description |
|------|-------------|
| `<LEFT>` | Left align text |
| `<CENTRE>` | Center align text |
| `<RIGHT>` | Right align text |

#### Colors

| Code | Description |
|------|-------------|
| `<RGB:r,g,b>` | Set text color (0-1 values) |
| `<PUSHRGB:r,g,b>` | Push color onto stack |
| `<POPRGB>` | Pop color from stack |
| `<RED>` | Red text |
| `<ORANGE>` | Orange text |
| `<GREEN>` | Green text |

#### Layout

| Code | Description |
|------|-------------|
| `<LINE>` | New line |
| `<BR>` | Double line break (paragraph) |
| `<INDENT:pixels>` | Set left indent |
| `<SETX:pixels>` | Set X position |
| `<SPACE>` | Add horizontal space |

#### Images

| Code | Description |
|------|-------------|
| `<IMAGE:path>` | Inline image |
| `<IMAGE:path,w,h>` | Inline image with size |
| `<IMAGECENTRE:path>` | Centered image |
| `<IMAGECENTRE:path,w,h>` | Centered image with size |
| `<JOYPAD:button>` | Joypad button icon |
| `<JOYPAD:button,w,h>` | Joypad button with size |

#### Keybinds

| Code | Description |
|------|-------------|
| `<KEY:bindingName>` | Display keybind (auto-updates) |

### Key Methods

| Method | Description |
|--------|-------------|
| `setText(text)` | Set text content |
| `paginate()` | Process text and layout |
| `setMargins(l, t, r, b)` | Set all margins |
| `setContentTransparency(a)` | Set content alpha |
| `onResize()` | Handle resize, re-paginate |

### Usage Example

```lua
-- Create rich text panel
local richText = ISRichTextPanel:new(10, 10, 380, 200)
richText:initialise()
richText:instantiate()
richText.autosetheight = false  -- Fixed height with scrolling
richText:addScrollBars()

-- Set formatted content
richText.text = [[
<H1> Welcome to Project Zomboid <LINE>
<BR>
<H2> Getting Started <LINE>
<TEXT>
<RGB:0.8,0.8,0.8> Press <KEY:Interact> to interact with objects in the world.
<LINE>
<IMAGE:media/ui/crafting.png,32,32> <SPACE> Use the crafting menu to create items.
<LINE>
<BR>
<PUSHRGB:1,0.5,0.5>
Warning: Zombies are dangerous!
<POPRGB>
<LINE>
<RGB:0.6,0.6,0.6> Good luck, survivor!
]]

richText:paginate()
parentPanel:addChild(richText)
```

### Scrolling

```lua
-- Enable scrolling for long content
richText.autosetheight = false
richText.clip = true
richText:addScrollBars()

-- Programmatic scroll
richText:setYScroll(-50)  -- Scroll down 50 pixels
```

### Keybind Display

```lua
-- Keybinds auto-update when user changes them
richText.text = "Press <KEY:Forward> to move forward, <KEY:Sprint> to run."
richText:paginate()

-- The panel automatically tracks keybind changes and re-paginates
```

---

## Common Dialog Patterns

### Confirmation Dialog

```lua
function MyMod:showConfirmation(message, onYes)
    local modal = ISModalDialog:new(
        0, 0, 250, 100,
        message,
        true,
        self,
        function(target, button)
            if button.internal == "YES" then
                onYes()
            end
        end
    )
    modal:initialise()
    modal:addToUIManager()
end

-- Usage
self:showConfirmation("Delete item?", function()
    item:remove()
end)
```

### Input Dialog with Validation

```lua
function MyMod:promptForName(defaultName, onConfirm)
    local textBox = ISTextBox:new(
        0, 0, 300, 120,
        "Enter name:",
        defaultName,
        self,
        function(target, button)
            if button.internal == "OK" then
                onConfirm(button.parent.entry:getText())
            end
        end
    )
    textBox.noEmpty = true
    textBox:setValidateFunction(self, function(target, text)
        return text:len() >= 3 and text:len() <= 20
    end)
    textBox:setValidateTooltipText("Name must be 3-20 characters")
    textBox:initialise()
    textBox:addToUIManager()
end
```

### Multi-Tab Interface

```lua
function MyMod:createTabbedUI()
    local window = ISCollapsableWindow:new(100, 100, 500, 400)
    window:setTitle("My Mod UI")
    window:initialise()

    local tabPanel = ISTabPanel:new(0, 16, 500, 400 - 16)
    tabPanel:initialise()

    -- Create tab content
    local tab1 = ISPanel:new(0, 0, 500, 400 - 16 - tabPanel.tabHeight)
    tab1:initialise()
    -- ... populate tab1

    local tab2 = ISPanel:new(0, 0, 500, 400 - 16 - tabPanel.tabHeight)
    tab2:initialise()
    -- ... populate tab2

    tabPanel:addView("Settings", tab1)
    tabPanel:addView("Statistics", tab2)

    window:addChild(tabPanel)
    window:addToUIManager()

    return window
end
```

---

## Joypad Navigation Summary

| Component | A Button | B Button | D-Pad |
|-----------|----------|----------|-------|
| ISModalDialog | Yes/OK | No | - |
| ISModalRichText | Yes/OK | No | - |
| ISTextBox | OK | Cancel/Exit entry | Up/Down: focus entry |
| ISRichTextBox | OK | Cancel | - |
| ISTabPanel | - | - | Scroll tabs |

---

## Integration with Window System

Dialogs typically appear on top of the main UI:

```lua
-- Create modal dialog
local modal = ISModalDialog:new(...)
modal:initialise()
modal:addToUIManager()
modal:bringToTop()

-- Block clicks to elements behind (ISModalRichText does this)
function modal:onMouseDown(x, y)
    return true  -- Consume click
end
```

---

## Common Gotchas

1. **Auto-Centering**: Pass `x=0, y=0` to auto-center on mouse/player screen

2. **Joypad Focus**: Save previous focus before showing dialog:
   ```lua
   modal.prevFocus = getJoypadFocus(player)
   setJoypadFocus(player, modal)
   ```

3. **Game Pause**: Dialogs may pause the game - `destroy()` restores speed

4. **Rich Text Escaping**: Use `&lt;` and `&gt;` for literal `<` and `>`

5. **Tab Panel Height**: Views should be `panelHeight - tabPanel.tabHeight`

6. **Paginate After Text Change**: Always call `paginate()` after changing rich text

7. **Memory**: Call `destroy()` or `removeFromUIManager()` when done with dialogs
