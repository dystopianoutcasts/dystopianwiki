# ISUI Lists & Selection Components

## Overview

This document covers the list and selection components in Project Zomboid's ISUI framework. These components handle scrollable lists of items, dropdown combo boxes, and selection patterns.

**Components Covered:**
- **ISScrollingListBox** - Scrollable list with items, columns, and selection
- **ISComboBox** - Dropdown combo box (composite component)
- **ISComboBoxEditor** - Text entry part of combo box
- **ISComboBoxPopup** - Dropdown list part of combo box

---

## Inheritance Hierarchy

```
ISBaseObject
└── ISUIElement
    └── ISPanel
        └── ISPanelJoypad
            └── ISScrollingListBox
                └── ISComboBoxPopup
            └── ISComboBox
        └── ISTextEntryBox
            └── ISComboBoxEditor
```

---

## ISScrollingListBox

A scrollable list component with item management, smooth scrolling, columns, tooltips, and joypad support. Inherits from `ISPanelJoypad`.

**Source:** `media/lua/client/ISUI/ISScrollingListBox.lua` (628 lines)

### Constructor

```lua
ISScrollingListBox:new(x, y, width, height)
```

### Default Properties

| Property | Default | Description |
|----------|---------|-------------|
| `items` | `{}` | Array of item objects |
| `count` | `0` | Number of items |
| `selected` | `0` | Currently selected index |
| `mouseoverselected` | `-1` | Index of item under mouse |
| `itemheight` | `17` | Default height per row |
| `itemPadY` | `nil` | Optional vertical padding for items |
| `font` | `UIFont.Small` | Font for item text |
| `textColor` | `{a=1, r=0.4, g=0.4, b=0.4}` | Text color (disabled look?) |
| `textColorSelect` | `{r=1.0, g=1.0, b=0.0, a=1.0}` | Selected item text color (yellow) |
| `textColorHighlight` | `{r=1.0, g=1.0, b=1.0, a=1.0}` | Highlighted item text color (white) |
| `backgroundColor` | `{r=0, g=0, b=0, a=0.5}` | List background |
| `columns` | `{}` | Column definitions |
| `useReverseSort` | `false` | Reverse sort order |
| `smoothScrollEnabled` | `true` | Enable smooth scrolling animation |
| `smoothScrollTargetY` | `0` | Target scroll position |
| `drawBorder` | `true` | Draw border around list |
| `doDrawItem` | `true` | Enable default item drawing |
| `doRepaintStencil` | `true` | Repaint stencil for clipping |

### Item Structure

Each item in the `items` array has this structure:

```lua
{
    text = "Display text",      -- Text shown in list
    item = userdata,            -- Arbitrary user data
    tooltip = "Optional tip",   -- Tooltip text (optional)
    itemindex = 1,              -- Position in list (1-based)
    height = 17                 -- Row height for this item
}
```

### Item Management Methods

| Method | Description |
|--------|-------------|
| `addItem(name, item)` | Add item with display text and data, returns item object |
| `insertItem(index, name, item)` | Insert item at specific position |
| `removeItemByIndex(index)` | Remove item at index |
| `removeItem(name)` | Remove first item matching name |
| `clear()` | Remove all items, reset scroll/selection |
| `contains(name)` | Check if item with name exists |
| `containsItem(item)` | Check if specific item data exists |
| `getItems()` | Get the items array |
| `setItems(items)` | Replace items array entirely |

### Selection Methods

| Method | Description |
|--------|-------------|
| `getSelected()` | Get selected item index |
| `setSelected(index)` | Set selected index |
| `setSelectedByData(data)` | Select item matching `.item` data |
| `setSelectedByName(name)` | Select item matching `.text` |
| `getSelectedItems()` | Get table of all selected items (multi-select) |
| `getSelectedItemsCount()` | Count of selected items |
| `isItemSelected(item)` | Check if specific item is selected |
| `selectAll()` | Select all items |
| `selectNone()` | Deselect all items |

### Sorting Methods

| Method | Description |
|--------|-------------|
| `sort()` | Sort items by `.text` field |
| `setSortColumn(index)` | Set column index for sorting |
| `getSortColumn()` | Get current sort column |
| `setReverseSort(reverse)` | Toggle reverse sort order |
| `getReverseSort()` | Get current reverse sort state |
| `sortByColumn(a, b)` | Internal column sort comparator |

### Column System

The list supports columns for tabular data:

```lua
-- Column definition structure
{
    name = "Column Header",     -- Column header text
    width = 100,                -- Column width in pixels
    getter = function(item)     -- Function to get display value
        return item.item.someField
    end
}
```

| Method | Description |
|--------|-------------|
| `addColumn(name, width, getter)` | Add column definition |
| `getColumns()` | Get columns array |
| `setColumnWidth(index, width)` | Set specific column width |

### Scrolling Methods

| Method | Description |
|--------|-------------|
| `getTopIndex()` | Get index of first visible row |
| `getVisibleRows()` | Get number of visible rows |
| `ensureVisible(index)` | Scroll to make index visible |
| `setScrollHeight(height)` | Set total scrollable height |
| `smoothScrollTo(y)` | Animate scroll to position |
| `smoothScrollToSelection()` | Scroll to show selected item |

### Rendering Methods

| Method | Description |
|--------|-------------|
| `prerender()` | Draws background, border, handles smooth scrolling |
| `render()` | Draws items via `doDrawItem()` calls |
| `doDrawItem(y, item, alt)` | Override to customize item rendering |
| `drawItems(y, index, height)` | Internal method that calls doDrawItem |

### Default doDrawItem Implementation

```lua
function ISScrollingListBox:doDrawItem(y, item, alt)
    -- Draw alternating background
    if self.selected == item.itemindex then
        self:drawRect(0, y, self:getWidth(), item.height-1, 0.3, 0.7, 0.35, 0.15)
    end

    -- Determine text color based on state
    local textColor = self.textColor
    if self.selected == item.itemindex then
        textColor = self.textColorSelect
    elseif self.mouseoverselected == item.itemindex then
        textColor = self.textColorHighlight
    end

    -- Draw item text
    self:drawText(item.text, 10, y + 2, textColor.r, textColor.g, textColor.b, textColor.a, self.font)

    return y + item.height
end
```

### Mouse Event Handlers

| Handler | Description |
|---------|-------------|
| `onMouseDown(x, y)` | Start selection, handle multi-select with Ctrl/Shift |
| `onMouseUp(x, y)` | Complete click, call onclick if defined |
| `onMouseDoubleClick(x, y)` | Call ondoubleclick if defined |
| `onMouseMove(dx, dy)` | Update mouseoverselected, show tooltips |
| `onMouseMoveOutside(dx, dy)` | Clear hover state |
| `onMouseWheel(del)` | Scroll list, with smooth scroll support |

### Callback Properties

| Property | Signature | Description |
|----------|-----------|-------------|
| `onclick` | `onclick(self, item)` | Called on single click |
| `ondoubleclick` | `ondoubleclick(self, item)` | Called on double click |
| `onSelectionChange` | `onSelectionChange(self)` | Called when selection changes |
| `onmousedown` | `onmousedown(self, item, x, y)` | Called on mouse down |
| `onRightMouseDown` | `onRightMouseDown(item)` | Called on right-click |
| `onRightMouseUp` | `onRightMouseUp(item)` | Called on right-click release |

### Joypad Support

Inherits from ISPanelJoypad with list-specific overrides:

| Method | Description |
|--------|-------------|
| `onJoypadDirUp(joypadData)` | Move selection up |
| `onJoypadDirDown(joypadData)` | Move selection down |
| `onGainJoypadFocus(joypadData)` | Focus handling |
| `onLoseJoypadFocus(joypadData)` | Blur handling |

### Smooth Scrolling System

The list supports animated smooth scrolling:

```lua
-- Enable/disable smooth scrolling
listBox.smoothScrollEnabled = true

-- In prerender(), handles animation:
if self.smoothScrollTargetY ~= self:getYScroll() then
    local diff = self.smoothScrollTargetY - self:getYScroll()
    local step = diff * 0.3  -- Ease toward target
    if math.abs(diff) < 1 then
        self:setYScroll(self.smoothScrollTargetY)
    else
        self:setYScroll(self:getYScroll() + step)
    end
end
```

### Usage Example

```lua
-- Create a scrolling list
local list = ISScrollingListBox:new(10, 10, 300, 200)
list:initialise()
list:instantiate()
list.itemheight = 24
list.font = UIFont.Medium

-- Add items
list:addItem("First Item", { id = 1, value = "data1" })
list:addItem("Second Item", { id = 2, value = "data2" })
list:addItem("Third Item", { id = 3, value = "data3" })

-- Set callback
list.onclick = function(self, item)
    print("Selected: " .. item.text)
    print("Data: " .. tostring(item.item.value))
end

-- Custom item rendering
function list:doDrawItem(y, item, alt)
    -- Custom background
    local bgColor = alt and {r=0.1, g=0.1, b=0.1} or {r=0.15, g=0.15, b=0.15}
    self:drawRect(0, y, self:getWidth(), item.height-1, 0.8, bgColor.r, bgColor.g, bgColor.b)

    -- Item icon (if exists)
    if item.item.icon then
        self:drawTexture(item.item.icon, 4, y + 2, 1, 1, 1, 1)
    end

    -- Item text
    local textX = item.item.icon and 24 or 4
    self:drawText(item.text, textX, y + 4, 1, 1, 1, 1, self.font)

    return y + item.height
end

parentPanel:addChild(list)
```

### Multi-Select Support

```lua
-- Enable multi-select (Ctrl+click, Shift+click)
list.selected = {}  -- Change from number to table for multi-select

-- Check what's selected
local selectedItems = list:getSelectedItems()
for _, item in ipairs(selectedItems) do
    print("Selected: " .. item.text)
end
```

---

## ISComboBox

A composite dropdown component combining a text editor and popup list. Derives from `ISPanel`.

**Source:** `media/lua/client/ISUI/ISComboBox.lua` (589 lines total)

### Architecture

ISComboBox is a composite component consisting of:
1. **ISComboBoxEditor** - Text entry showing selected value
2. **ISComboBoxPopup** - Dropdown list for selection

```
ISComboBox (ISPanel)
├── ISComboBoxEditor (ISTextEntryBox) - the visible text field
└── ISComboBoxPopup (ISScrollingListBox) - dropdown list (added to UIManager when opened)
```

### Constructor

```lua
ISComboBox:new(x, y, width, height, target, onChangeFunc)
```

| Parameter | Description |
|-----------|-------------|
| `x, y` | Position |
| `width, height` | Dimensions |
| `target` | Target object for callback |
| `onChangeFunc` | Called when selection changes: `onChangeFunc(target, combo)` |

### Default Properties

| Property | Default | Description |
|----------|---------|-------------|
| `options` | `{}` | Array of option objects |
| `selected` | `1` | Currently selected option index |
| `expanded` | `false` | Whether dropdown is open |
| `editable` | `false` | Allow typing to filter/add options |
| `popupWidth` | `nil` | Override popup width (defaults to combo width) |
| `popupOffsetX` | `0` | Horizontal offset for popup |
| `emptyStr` | `nil` | Text to show when no selection |
| `image` | dropdown arrow | Button image for dropdown trigger |
| `font` | `UIFont.Small` | Font for text |
| `backgroundColor` | `{r=0, g=0, b=0, a=0.8}` | Background color |
| `borderColor` | `{r=1, g=1, b=1, a=0.4}` | Border color |

### Option Structure

Options can be simple strings or objects:

```lua
-- Simple string option
"Option Text"

-- Full option object
{
    text = "Display Text",
    data = anyUserData,         -- Arbitrary data
    tooltip = "Optional tooltip"
}
```

### Option Management Methods

| Method | Description |
|--------|-------------|
| `addOption(text, data)` | Add option with text and optional data |
| `addOptionWithData(text, data)` | Same as addOption (legacy name) |
| `removeOptionByIndex(index)` | Remove option at index |
| `removeOptionByName(name)` | Remove option matching text |
| `removeOptionByData(data)` | Remove option matching data |
| `clear()` | Remove all options |
| `getOptionCount()` | Get number of options |
| `getOptionText(index)` | Get text at index |
| `getOptionData(index)` | Get data at index |
| `contains(text)` | Check if option with text exists |
| `containsData(data)` | Check if option with data exists |

### Selection Methods

| Method | Description |
|--------|-------------|
| `getSelected()` | Get selected index |
| `select(index)` | Select by index, trigger callback |
| `selectData(data)` | Select option matching data |
| `selectText(text)` | Select option matching text |
| `getSelectedText()` | Get selected option's text |
| `getSelectedData()` | Get selected option's data |

### Popup Control Methods

| Method | Description |
|--------|-------------|
| `showPopup()` | Open the dropdown |
| `hidePopup()` | Close the dropdown |
| `togglePopup()` | Toggle dropdown open/closed |
| `isPopupVisible()` | Check if dropdown is open |

### Editable Mode

When `editable = true`:
- User can type in the text field
- Typing filters visible options
- Can add new values not in the list

```lua
combo.editable = true

-- Handle custom text entry
combo.onTextChange = function(combo)
    local text = combo:getInternalText()
    -- Filter logic or validation
end
```

### Callback Properties

| Property | Signature | Description |
|----------|-----------|-------------|
| `onChange` | `onChange(target, combo)` | Selection changed |
| `onTextChange` | `onTextChange(combo)` | Text changed (editable mode) |

### Internal Structure

```lua
function ISComboBox:createChildren()
    -- Create the text editor
    self.editor = ISComboBoxEditor:new(0, 0, self.width - self.height, self.height, self)
    self.editor:initialise()
    self:addChild(self.editor)

    -- Popup is created lazily when first opened
end

function ISComboBox:showPopup()
    if not self.popup then
        self.popup = ISComboBoxPopup:new(0, 0, 100, 100, self)
        self.popup:initialise()
    end

    -- Position popup below combo
    local x = self:getAbsoluteX() + (self.popupOffsetX or 0)
    local y = self:getAbsoluteY() + self:getHeight()
    self.popup:setX(x)
    self.popup:setY(y)
    self.popup:setWidth(self.popupWidth or self:getWidth())

    -- Populate options
    self.popup:clear()
    for i, option in ipairs(self.options) do
        local text = type(option) == "string" and option or option.text
        self.popup:addItem(text, option)
    end

    -- Add to UI manager on top
    self.popup:addToUIManager()
    self.popup:bringToTop()
    self.expanded = true
end
```

### Usage Example

```lua
-- Create combo box
local combo = ISComboBox:new(10, 50, 200, 24, self, self.onDifficultyChanged)
combo:initialise()
combo:instantiate()

-- Add options
combo:addOption("Easy")
combo:addOption("Normal")
combo:addOptionWithData("Hard", { multiplier = 2.0 })
combo:addOptionWithData("Nightmare", { multiplier = 4.0 })

-- Set initial selection
combo:select(2)  -- Select "Normal"

parentPanel:addChild(combo)

-- Callback handler
function MyPanel:onDifficultyChanged(combo)
    local text = combo:getSelectedText()
    local data = combo:getSelectedData()

    if data and data.multiplier then
        print("Multiplier: " .. data.multiplier)
    end
end
```

### Editable Combo Example

```lua
-- Create editable combo (user can type)
local combo = ISComboBox:new(10, 50, 200, 24, self, self.onValueChanged)
combo.editable = true
combo:initialise()
combo:instantiate()

-- Pre-populate suggestions
combo:addOption("Red")
combo:addOption("Green")
combo:addOption("Blue")

-- User can type custom values like "Purple"
```

---

## ISComboBoxEditor

The text entry portion of an ISComboBox. Inherits from `ISTextEntryBox`.

**Defined in:** Same file as ISComboBox

### Key Overrides

| Method | Description |
|--------|-------------|
| `onMouseDown(x, y)` | Opens parent combo's popup |
| `onTextChange()` | Notifies parent of text changes |
| `onFocus(focus)` | Handles focus changes |
| `onCommandEntered()` | Called when Enter pressed (for editable combos) |

### Properties

| Property | Description |
|----------|-------------|
| `combo` | Reference to parent ISComboBox |

---

## ISComboBoxPopup

The dropdown list portion of an ISComboBox. Inherits from `ISScrollingListBox`.

**Defined in:** Same file as ISComboBox

### Key Overrides

| Method | Description |
|--------|-------------|
| `onMouseDown(x, y)` | Selects item, notifies parent, hides popup |
| `onMouseDownOutside(x, y)` | Hides popup when clicking outside |
| `doDrawItem(y, item, alt)` | Custom item rendering with hover highlight |

### Properties

| Property | Description |
|----------|-------------|
| `combo` | Reference to parent ISComboBox |

### Positioning Logic

The popup automatically positions itself:
- Below the combo box by default
- Above if not enough space below screen edge
- Width matches combo or uses `popupWidth` override

---

## Comparison: When to Use What

| Component | Use Case |
|-----------|----------|
| **ISScrollingListBox** | Display/select from many items, custom rendering, multi-select |
| **ISComboBox** | Compact dropdown for selecting one option, space-constrained UIs |
| **ISComboBox (editable)** | Allow user to type custom value or filter existing options |

---

## Advanced Patterns

### Custom List Item with Multiple Columns

```lua
local list = ISScrollingListBox:new(10, 10, 400, 200)
list:initialise()
list:instantiate()

-- Add columns
list:addColumn("Name", 150)
list:addColumn("Level", 50)
list:addColumn("Status", 100)

-- Add items with structured data
list:addItem("Player One", { name = "Player One", level = 42, status = "Online" })
list:addItem("Player Two", { name = "Player Two", level = 38, status = "Offline" })

-- Custom rendering for columns
function list:doDrawItem(y, item, alt)
    local x = 0
    for i, col in ipairs(self.columns) do
        local value = ""
        if col.name == "Name" then
            value = item.item.name
        elseif col.name == "Level" then
            value = tostring(item.item.level)
        elseif col.name == "Status" then
            value = item.item.status
        end

        self:drawText(value, x + 4, y + 2, 1, 1, 1, 1, self.font)
        x = x + col.width
    end

    return y + item.height
end
```

### Filterable List

```lua
local list = ISScrollingListBox:new(10, 50, 300, 200)
local allItems = {}  -- Store all items

function populateList(filter)
    list:clear()
    for _, item in ipairs(allItems) do
        if filter == "" or string.find(string.lower(item.text), string.lower(filter)) then
            list:addItem(item.text, item.data)
        end
    end
end

-- Filter text entry
local filterBox = ISTextEntryBox:new("", 10, 10, 300, 24)
filterBox.onTextChange = function()
    populateList(filterBox:getInternalText())
end
```

### Combo with Icons

```lua
-- Using ISComboBox with visual options requires custom popup rendering
local combo = ISComboBox:new(10, 50, 200, 24, self, self.onWeaponSelected)
combo:initialise()
combo:instantiate()

-- Add options with icon references
combo:addOptionWithData("Pistol", { icon = getTexture("media/ui/pistol.png") })
combo:addOptionWithData("Rifle", { icon = getTexture("media/ui/rifle.png") })

-- Override popup item rendering
local originalDoDrawItem = combo.popup.doDrawItem
function combo.popup:doDrawItem(y, item, alt)
    local data = item.item.data or item.item
    if data and data.icon then
        self:drawTexture(data.icon, 4, y + 2, 1, 1, 1, 1)
        self:drawText(item.text, 28, y + 4, 1, 1, 1, 1, self.font)
        return y + item.height
    end
    return originalDoDrawItem(self, y, item, alt)
end
```

---

## Joypad Navigation

### ISScrollingListBox

| Button/Direction | Action |
|------------------|--------|
| D-Pad Up | Select previous item |
| D-Pad Down | Select next item |
| A Button | Confirm selection (if configured) |
| B Button | Return to parent |

### ISComboBox

| Button/Direction | Action |
|------------------|--------|
| A Button | Open/close popup |
| D-Pad Up/Down | Navigate popup when open |
| B Button | Close popup |

---

## Events Integration

These components integrate with the broader event system:

| Event | Component | Trigger |
|-------|-----------|---------|
| `OnGamepadDisconnect` | Both | Clear joypad focus state |
| Tooltip events | Both | Item tooltips shown on hover |

---

## Performance Considerations

1. **Large Lists**: For lists with 1000+ items, consider:
   - Virtual scrolling (only render visible items)
   - Disable smooth scrolling: `list.smoothScrollEnabled = false`
   - Use simpler `doDrawItem` rendering

2. **Combo Popup Caching**: The popup is created once and reused

3. **Stenciling**: Lists use stencil clipping - expensive with many overlapping elements

---

## Common Gotchas

1. **Item Index vs Array Index**: `item.itemindex` is 1-based position when added, not current array position after removals

2. **Selection After Clear**: After `clear()`, selection is reset - re-select after repopulating

3. **Popup Z-Order**: Combo popup uses `addToUIManager()` and `bringToTop()` - may still be behind modal dialogs

4. **Smooth Scroll State**: When programmatically setting scroll position, also set `smoothScrollTargetY` to match

5. **Option Data Types**: Options can be strings or tables - always check type before accessing `.text` or `.data`
