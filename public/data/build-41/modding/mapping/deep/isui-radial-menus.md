# ISUI Radial Menus

## Overview

Radial menus in Project Zomboid provide a circular "pie menu" interface for quick selection. They're primarily used with gamepad but also work with mouse. The Java-backed `RadialMenu` class handles rendering while Lua manages the slice data and commands.

**Components Covered:**
- **ISRadialMenu** - Base radial menu component
- **ISEmoteRadialMenu** - Emote/gesture selection wheel
- **ISFirearmRadialMenu** - Weapon reload operations
- **ISLightSourceRadialMenu** - Light source controls
- **ISRadialProgressBar** - Circular progress indicator

---

## Inheritance Hierarchy

```
ISBaseObject
└── ISUIElement
    ├── ISPanelJoypad
    │   └── ISRadialMenu
    └── ISRadialProgressBar

ISBaseObject
├── ISEmoteRadialMenu (wrapper, uses global RadialMenu)
├── ISFirearmRadialMenu (wrapper, uses global RadialMenu)
└── ISLightSourceRadialMenu (wrapper, uses global RadialMenu)
```

---

## ISRadialMenu

The base radial menu component providing pie-slice selection. Uses a Java `RadialMenu` object for rendering.

**Source:** `media/lua/client/ISUI/ISRadialMenu.lua` (134 lines)

### Constructor

```lua
ISRadialMenu:new(x, y, innerRadius, outerRadius, playerNum)
```

| Parameter | Description |
|-----------|-------------|
| `x, y` | Position (typically centered) |
| `innerRadius` | Inner ring radius (center dead zone) |
| `outerRadius` | Outer ring radius (determines size) |
| `playerNum` | Player index (0-3 for split-screen) |

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `innerRadius` | (required) | Inner circle radius |
| `outerRadius` | (required) | Outer circle radius |
| `playerNum` | (required) | Player index |
| `slices` | `{}` | Array of slice objects |
| `hideWhenButtonReleased` | `nil` | Joypad button that closes menu |
| `forceCursorVisible` | `playerNum == 0` | Force cursor visibility |

### Slice Structure

Each slice in the `slices` array:

```lua
{
    text = "Action Name",       -- Display text
    texture = Texture,          -- Icon texture
    command = {                 -- Command array
        func,                   -- Function to call
        arg1, arg2, arg3,       -- Up to 6 arguments
        arg4, arg5, arg6
    }
}
```

### Slice Management Methods

| Method | Description |
|--------|-------------|
| `addSlice(text, texture, command, arg1-arg6)` | Add a slice with callback |
| `setSliceText(index, text)` | Update slice display text |
| `setSliceTexture(index, texture)` | Update slice icon |
| `getSliceCommand(index)` | Get command array for slice |
| `clear()` | Remove all slices |

### Display Methods

| Method | Description |
|--------|-------------|
| `center()` | Center on player's screen |
| `undisplay()` | Remove from UI, clear joypad focus |
| `setHideWhenButtonReleased(button)` | Auto-close on button release |

### Mouse/Joypad Handlers

| Method | Description |
|--------|-------------|
| `onMouseDown(x, y)` | Select slice at mouse position |
| `onMouseDownOutside(x, y)` | Close menu |
| `onGainJoypadFocus(joypadData)` | Setup joypad control |
| `onJoypadDown(button, joypadData)` | Handle B/X to close |
| `onJoypadButtonReleased(button, joypadData)` | Handle auto-close on release |

### Java Integration

The menu uses a Java `RadialMenu` object for rendering:

```lua
function ISRadialMenu:instantiate()
    self.javaObject = RadialMenu.new(self.x, self.y, self.innerRadius, self.outerRadius)
    self.javaObject:setTable(self)
    -- ... anchor settings
    for k,v in ipairs(self.slices) do
        self.javaObject:addSlice(v.text, v.texture)
    end
end
```

Java methods available:
- `getSliceIndexFromMouse(x, y)` - Get slice under mouse (0-based)
- `getSliceIndexFromJoypad(joypadId)` - Get slice from stick direction (0-based)
- `addSlice(text, texture)` - Add slice to Java object
- `setSliceText(index, text)` - Update slice text (0-based index)
- `setSliceTexture(index, texture)` - Update slice texture (0-based)
- `clear()` - Clear all slices
- `setJoypad(joypadId)` - Set active joypad

### Usage Example

```lua
-- Create custom radial menu
local menu = ISRadialMenu:new(0, 0, 40, 120, playerNum)
menu:initialise()
menu:instantiate()
menu:center()

-- Add slices
menu:addSlice("Option 1", getTexture("media/ui/icon1.png"), function(arg1, arg2)
    print("Option 1 selected: " .. tostring(arg1))
end, "hello", "world")

menu:addSlice("Option 2", getTexture("media/ui/icon2.png"), myCallback, self)

-- Show menu
menu:addToUIManager()

-- For joypad
if JoypadState.players[playerNum+1] then
    menu:setHideWhenButtonReleased(Joypad.LBumper)
    setJoypadFocus(playerNum, menu)
end
```

---

## Global Radial Menu Access

Project Zomboid provides a per-player global radial menu:

```lua
-- Get player's radial menu instance
local menu = getPlayerRadialMenu(playerNum)

-- Use it directly
menu:clear()
menu:addSlice("Action", texture, callback, args...)
menu:addToUIManager()
```

---

## ISEmoteRadialMenu

A wrapper class for the emote/gesture selection wheel. Displays character emotes in categorized submenus.

**Source:** `media/lua/client/ISUI/ISEmoteRadialMenu.lua` (281 lines)

### Architecture

This class doesn't inherit from ISRadialMenu. Instead, it uses `getPlayerRadialMenu()` to fill and display the global radial menu.

### Constructor

```lua
ISEmoteRadialMenu:new(character)
```

### Static Data

The class initializes static tables in `ISEmoteRadialMenu:init()`:

```lua
-- Menu structure with categories and submenus
ISEmoteRadialMenu.defaultMenu = {
    ["friendly"] = {
        name = "Friendly",
        subMenu = {
            ["wavehi"] = "Wave Hi",
            ["thumbsup"] = "Thumbs Up",
            ...
        }
    },
    ["hostile"] = { ... },
    ["group"] = { ... },
    ["signal"] = { ... },
    ["shout"] = { name = "Shout" }  -- No submenu = direct action
}

-- Animation variants (random selection)
ISEmoteRadialMenu.variants = {
    ["wavehi"] = {"wavehi", "wavehi02", "wavebye"},
    ...
}

-- Icon textures
ISEmoteRadialMenu.icons = {
    ["friendly"] = getTexture("media/ui/emotes/thumbsup.png"),
    ...
}
```

### Key Methods

| Method | Description |
|--------|-------------|
| `fillMenu(submenu)` | Populate menu (nil = root, string = category) |
| `display()` | Show and setup joypad focus |
| `center()` | Center on player screen |
| `emote(emote)` | Play the selected emote animation |

### Menu Navigation

```lua
function ISEmoteRadialMenu:fillMenu(submenu)
    local menu = getPlayerRadialMenu(self.playerNum)
    menu:clear()

    if not submenu then
        -- Root menu: show categories
        for i,v in pairs(ISEmoteRadialMenu.menu) do
            if v.subMenu then
                menu:addSlice(v.name, icon, self.fillMenu, self, i)  -- Opens submenu
            else
                menu:addSlice(v.name, icon, self.emote, self, i)    -- Direct action
            end
        end
    else
        -- Submenu: show emotes + back button
        for i,v in pairs(ISEmoteRadialMenu.menu[submenu].subMenu) do
            menu:addSlice(v, icon, self.emote, self, i)
        end
        menu:addSlice("Back", backIcon, self.fillMenu, self)  -- nil = return to root
    end

    self:display()
end
```

### Keyboard/Joypad Integration

The class registers keyboard event handlers at game start:

```lua
Events.OnKeyStartPressed.Add(ISEmoteRadialMenu.onKeyPressed)
Events.OnKeyKeepPressed.Add(ISEmoteRadialMenu.onKeyRepeat)
Events.OnKeyPressed.Add(ISEmoteRadialMenu.onKeyReleased)
```

Key handling pattern:
- **Quick press** (< 450ms): Shout/callout
- **Hold** (>= 450ms): Show radial menu
- **Toggle mode**: Press to open, press again to close

---

## ISFirearmRadialMenu

Radial menu for firearm reload and management operations.

**Source:** `media/lua/client/ISUI/ISFirearmRadialMenu.lua` (491 lines)

### Architecture

Uses a command pattern with derived command classes:

```lua
local BaseCommand = ISBaseObject:derive("BaseCommand")
local CInsertMagazine = BaseCommand:derive("CInsertMagazine")
local CEjectMagazine = BaseCommand:derive("CEjectMagazine")
local CLoadBulletsInMagazine = BaseCommand:derive("CLoadBulletsInMagazine")
local CLoadRounds = BaseCommand:derive("CLoadRounds")
local CUnloadRounds = BaseCommand:derive("CUnloadRounds")
local CRack = BaseCommand:derive("CRack")
```

### Command Classes

Each command class implements:

```lua
function Command:fillMenu(menu, weapon)
    -- Check if command is applicable
    -- Add slice if available
end

function Command:invoke()
    -- Execute the action
end
```

| Command | Description |
|---------|-------------|
| `CInsertMagazine` | Insert magazine into weapon |
| `CEjectMagazine` | Remove magazine from weapon |
| `CLoadBulletsInMagazine` | Load loose bullets into magazine |
| `CLoadRounds` | Load rounds directly into weapon |
| `CUnloadRounds` | Unload rounds from weapon |
| `CRack` | Rack slide / chamber round / unjam |

### Constructor

```lua
ISFirearmRadialMenu:new(character)
```

### Key Methods

| Method | Description |
|--------|-------------|
| `getWeapon()` | Get equipped ranged weapon |
| `fillMenu()` | Populate with applicable weapon operations |
| `display()` | Show menu, setup joypad |
| `center()` | Center on player screen |

### Menu Population

```lua
function ISFirearmRadialMenu:fillMenu()
    local menu = getPlayerRadialMenu(self.playerNum)
    menu:clear()
    local weapon = self:getWeapon()
    if not weapon then return end

    local commands = {}
    if weapon:getMagazineType() then
        -- Magazine-based weapon
        if weapon:isContainsClip() then
            table.insert(commands, CEjectMagazine:new(self))
        else
            table.insert(commands, CInsertMagazine:new(self))
        end
        table.insert(commands, CLoadBulletsInMagazine:new(self))
    else
        -- Internal magazine weapon
        table.insert(commands, CLoadRounds:new(self))
        table.insert(commands, CUnloadRounds:new(self))
    end
    table.insert(commands, CRack:new(self))

    for _,command in ipairs(commands) do
        local count = #menu.slices
        command:fillMenu(menu, weapon)
        if count == #menu.slices then
            menu:addSlice(nil, nil, nil)  -- Empty slot for consistent layout
        end
    end
end
```

### Input Handling

Supports both keyboard (player 0) and joypad (RBumper):

- **Quick press** (< 500ms): Automatic reload
- **Hold** (>= 500ms): Show radial menu
- **Option**: `getCore():getOptionReloadRadialInstant()` - Instant menu (no delay)

---

## ISLightSourceRadialMenu

Radial menu for light source management (flashlights, candles, etc.).

**Source:** `media/lua/client/ISUI/ISLightSourceRadialMenu.lua` (343 lines)

### Constructor

```lua
ISLightSourceRadialMenu:new(character)
```

### Key Methods

| Method | Description |
|--------|-------------|
| `fillMenu()` | Find light sources and populate menu |
| `fillMenuForItem(menu, item)` | Add operations for specific item |
| `display()` | Show menu |
| `onEquipLight(item, primary)` | Equip/unequip light |
| `onToggle(item)` | Turn on/off |
| `onInsertBattery(item)` | Insert battery via recipe |
| `onRemoveBattery(item)` | Remove battery via recipe |
| `onLightCandle(item)` | Light candle |
| `onExtinguishCandle(item)` | Extinguish candle |

### Menu Operations

For each light source item, the menu can show:
- **Equip Primary/Secondary** - For inventory items
- **Unequip** - For equipped items
- **Turn On/Off** - For activatable lights
- **Insert/Remove Battery** - Via crafting recipes
- **Light/Extinguish** - For candles

### Input Handling

Bound to "Equip/Turn On/Off Light Source" key:

- **Quick press** (< 500ms): Toggle light
- **Hold** (>= 500ms): Show radial menu

---

## ISRadialProgressBar

A circular progress indicator using a texture mask.

**Source:** `media/lua/client/ISUI/ISRadialProgressBar.lua` (61 lines)

### Constructor

```lua
ISRadialProgressBar:new(x, y, width, height, texturePath)
```

### Java Integration

Uses Java `RadialProgressBar` class:

```lua
function ISRadialProgressBar:instantiate()
    self.javaObject = RadialProgressBar.new(self, self.texture)
    -- ... position and anchor setup
end
```

### Methods

| Method | Description |
|--------|-------------|
| `setValue(value)` | Set progress (0.0 - 1.0) |
| `getValue()` | Get current progress |
| `setTexture(texture)` | Change progress texture |
| `getTexture()` | Get current texture |

### Usage Example

```lua
local progressBar = ISRadialProgressBar:new(100, 100, 64, 64, "media/ui/radial_progress.png")
progressBar:initialise()
progressBar:instantiate()
progressBar:addToUIManager()

-- Update progress
progressBar:setValue(0.5)  -- 50% complete
```

---

## Creating Custom Radial Menus

### Pattern 1: Direct ISRadialMenu

For simple cases, create an ISRadialMenu directly:

```lua
function MyMod:showQuickMenu(playerNum)
    local menu = ISRadialMenu:new(0, 0, 40, 100, playerNum)
    menu:initialise()
    menu:instantiate()
    menu:center()

    menu:addSlice("Attack", getTexture("media/ui/attack.png"), self.onAttack, self)
    menu:addSlice("Defend", getTexture("media/ui/defend.png"), self.onDefend, self)
    menu:addSlice("Flee", getTexture("media/ui/flee.png"), self.onFlee, self)

    menu:addToUIManager()

    if JoypadState.players[playerNum+1] then
        menu:setHideWhenButtonReleased(Joypad.YButton)
        setJoypadFocus(playerNum, menu)
    end
end
```

### Pattern 2: Wrapper Class (Like Emote/Firearm)

For complex menus with dynamic content:

```lua
MyCustomRadialMenu = ISBaseObject:derive("MyCustomRadialMenu")

function MyCustomRadialMenu:new(character)
    local o = ISBaseObject.new(self)
    o.character = character
    o.playerNum = character:getPlayerNum()
    return o
end

function MyCustomRadialMenu:center()
    local menu = getPlayerRadialMenu(self.playerNum)
    local x = getPlayerScreenLeft(self.playerNum) + getPlayerScreenWidth(self.playerNum) / 2
    local y = getPlayerScreenTop(self.playerNum) + getPlayerScreenHeight(self.playerNum) / 2
    menu:setX(x - menu:getWidth() / 2)
    menu:setY(y - menu:getHeight() / 2)
end

function MyCustomRadialMenu:fillMenu()
    local menu = getPlayerRadialMenu(self.playerNum)
    menu:clear()

    -- Add slices based on game state
    if self.character:getVehicle() then
        menu:addSlice("Exit Vehicle", nil, self.exitVehicle, self)
    else
        menu:addSlice("Find Vehicle", nil, self.findVehicle, self)
    end

    self:center()
    menu:addToUIManager()

    if JoypadState.players[self.playerNum+1] then
        menu:setHideWhenButtonReleased(Joypad.DPadLeft)
        setJoypadFocus(self.playerNum, menu)
    end
end

function MyCustomRadialMenu:exitVehicle()
    -- Implementation
end

function MyCustomRadialMenu:findVehicle()
    -- Implementation
end
```

### Pattern 3: Submenus

For hierarchical navigation:

```lua
function MyRadialMenu:fillMenu(submenu)
    local menu = getPlayerRadialMenu(self.playerNum)
    menu:clear()

    if not submenu then
        -- Root menu
        menu:addSlice("Category A", nil, self.fillMenu, self, "categoryA")
        menu:addSlice("Category B", nil, self.fillMenu, self, "categoryB")
        menu:addSlice("Direct Action", nil, self.doAction, self)
    elseif submenu == "categoryA" then
        menu:addSlice("Action A1", nil, self.doA1, self)
        menu:addSlice("Action A2", nil, self.doA2, self)
        menu:addSlice("Back", nil, self.fillMenu, self)  -- nil = root
    elseif submenu == "categoryB" then
        menu:addSlice("Action B1", nil, self.doB1, self)
        menu:addSlice("Back", nil, self.fillMenu, self)
    end

    self:center()
    menu:addToUIManager()
end
```

---

## Keyboard Binding Pattern

Standard pattern for hold-to-show radial menus:

```lua
local STATE = {}

function MyRadialMenu.checkKey(key)
    if key ~= getCore():getKey("MyBinding") then return false end
    if isGamePaused() then return false end
    local playerObj = getSpecificPlayer(0)
    if not playerObj or playerObj:isDead() then return false end
    return true
end

function MyRadialMenu.onKeyPressed(key)
    if not MyRadialMenu.checkKey(key) then return end
    local radialMenu = getPlayerRadialMenu(0)
    if getCore():getOptionRadialMenuKeyToggle() and radialMenu:isReallyVisible() then
        STATE.radialWasVisible = true
        radialMenu:removeFromUIManager()
        return
    end
    STATE.keyPressedMS = getTimestampMs()
    STATE.radialWasVisible = false
end

function MyRadialMenu.onKeyRepeat(key)
    if not MyRadialMenu.checkKey(key) then return end
    if STATE.radialWasVisible then return end
    if not STATE.keyPressedMS then return end

    local delay = 500
    if getTimestampMs() - STATE.keyPressedMS >= delay then
        local radialMenu = getPlayerRadialMenu(0)
        if not radialMenu:isReallyVisible() then
            local rm = MyRadialMenu:new(getSpecificPlayer(0))
            rm:fillMenu()
        end
    end
end

function MyRadialMenu.onKeyReleased(key)
    if not MyRadialMenu.checkKey(key) then return end
    local radialMenu = getPlayerRadialMenu(0)
    if radialMenu:isReallyVisible() or STATE.radialWasVisible then
        if not getCore():getOptionRadialMenuKeyToggle() then
            radialMenu:removeFromUIManager()
        end
        return
    end
    -- Quick press action
    if STATE.keyPressedMS and getTimestampMs() - STATE.keyPressedMS < 500 then
        -- Do quick action
    end
    STATE.keyPressedMS = nil
end

local function OnGameStart()
    Events.OnKeyStartPressed.Add(MyRadialMenu.onKeyPressed)
    Events.OnKeyKeepPressed.Add(MyRadialMenu.onKeyRepeat)
    Events.OnKeyPressed.Add(MyRadialMenu.onKeyReleased)
end

Events.OnGameStart.Add(OnGameStart)
```

---

## Joypad Navigation

| Input | Action |
|-------|--------|
| Left Stick | Select slice |
| A Button | Confirm (if configured) |
| B Button | Cancel/close |
| X Button | Cancel/close |
| Trigger release | Confirm (if `setHideWhenButtonReleased`) |

---

## Common Gotchas

1. **Slice Index**: Lua uses 1-based, Java uses 0-based - methods handle conversion

2. **Empty Slices**: Add `menu:addSlice(nil, nil, nil)` for consistent slice positions

3. **Per-Player Menu**: Use `getPlayerRadialMenu(playerNum)` for split-screen support

4. **Toggle Mode**: Check `getCore():getOptionRadialMenuKeyToggle()` for user preference

5. **Joypad Focus**: Always call `setJoypadFocus` when showing for controller users

6. **Menu Centering**: Call `center()` before `addToUIManager()` for proper positioning

7. **Visibility Check**: Use `isReallyVisible()` not `isVisible()` to check actual state
