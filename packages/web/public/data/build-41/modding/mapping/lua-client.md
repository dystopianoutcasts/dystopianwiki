# lua/client/ Folder Documentation

**Location:** `media/lua/client/`
**File Count:** 692+ Lua files
**Purpose:** Client-side code: UI, player actions, context menus, visual systems

---

## Folder Structure

```
lua/client/
├── ServerCommands.lua       # Server command handlers
│
├── ISUI/                    # UI Components (166 files)
├── TimedActions/            # Timed Actions (139 files)
├── Context/                 # Context Menu System (8+ files)
├── BuildingObjects/         # Building/Construction
├── Vehicles/                # Vehicle UI and Logic
├── XpSystem/                # Skills and XP UI
├── OptionScreens/           # Game Options
├── DebugUIs/                # Debug Interfaces
│
├── Blacksmith/              # Blacksmithing UI
├── Camping/                 # Camping System
├── Chat/                    # Chat UI
├── erosion/                 # Erosion System
├── Farming/                 # Farming UI
├── Fishing/                 # Fishing UI
├── Foraging/                # Foraging UI
├── Hotbar/                  # Hotbar System
├── Items/                   # Item Interactions
├── JoyPad/                  # Controller Support
├── LastStand/               # Last Stand Mode
├── Map/                     # Map UI
├── MetalDrum/               # Metal Drum System
├── Moveables/               # Moveable Objects
├── Music/                   # Music System
├── NPCs/                    # NPC Interactions
├── RadioCom/                # Radio UI
├── RainBarrel/              # Rain Barrel UI
├── RecordedMedia/           # TV/Radio Player
├── Seasons/                 # Seasonal Effects
├── SurvivalGuide/           # Tutorial System
├── Tests/                   # Test Files
├── Traps/                   # Trap System
├── Tutorial/                # Tutorial System
└── Weather/                 # Weather UI
```

---

## ISUI/ - UI Components (166 files)

### Class Hierarchy

```
ISBaseObject (shared)
└── ISUIElement (base UI element)
    ├── ISPanel (container panel)
    │   ├── ISButton
    │   ├── ISCollapsableWindow
    │   ├── ISScrollingListBox
    │   ├── ISTabPanel
    │   ├── ISInventoryPage
    │   ├── ISHealthPanel
    │   ├── ISCraftingUI
    │   └── (many more...)
    ├── ISTextEntryBox
    ├── ISLabel
    ├── ISImage
    ├── ISProgressBar
    └── ISRichTextPanel
```

### Core UI Classes

#### ISUIElement.lua
Base class for all UI elements.

```lua
ISUIElement = ISBaseObject:derive("ISUIElement");
ISUIElement.IDMax = 1;

-- Core properties
self.x, self.y           -- Position
self.width, self.height  -- Size
self.anchorLeft, anchorRight, anchorTop, anchorBottom
self.children            -- Child elements
self.parent              -- Parent element
self.javaObject          -- Java UI bridge

-- Core methods
function ISUIElement:initialise()
function ISUIElement:setX(x)
function ISUIElement:setY(y)
function ISUIElement:setWidth(w)
function ISUIElement:setHeight(h)
function ISUIElement:addChild(child)
function ISUIElement:removeChild(child)
function ISUIElement:setVisible(visible)
function ISUIElement:getIsVisible()
function ISUIElement:bringToTop()
function ISUIElement:addToUIManager()
function ISUIElement:removeFromUIManager()

-- Events (override these)
function ISUIElement:prerender()
function ISUIElement:render()
function ISUIElement:update()
function ISUIElement:onMouseDown(x, y)
function ISUIElement:onMouseUp(x, y)
function ISUIElement:onMouseMove(dx, dy)
function ISUIElement:onKeyPress(key)
```

#### ISPanel.lua
Container panel with background.

```lua
ISPanel = ISUIElement:derive("ISPanel");

-- Properties
self.background          -- Draw background?
self.backgroundColor     -- {r, g, b, a}
self.borderColor         -- {r, g, b, a}
self.moveWithMouse       -- Draggable?

-- Methods
function ISPanel:noBackground()
function ISPanel:close()
```

#### ISButton.lua
Clickable button.

```lua
ISButton = ISPanel:derive("ISButton");

-- Properties
self.title               -- Button text
self.onclick             -- Click callback
self.target              -- Callback target
self.enable              -- Is enabled?
self.pressed             -- Is pressed?

-- Methods
function ISButton:forceClick()
function ISButton:setJoypadButton(texture)

-- Creating a button
local btn = ISButton:new(x, y, width, height, "Click Me", self, ISMyUI.onButtonClick);
btn:initialise();
btn:instantiate();
self:addChild(btn);

function ISMyUI.onButtonClick(self, button)
    print("Button clicked!");
end
```

#### ISCollapsableWindow.lua
Draggable, resizable window with title bar.

```lua
ISCollapsableWindow = ISPanel:derive("ISCollapsableWindow");

-- Properties
self.title               -- Window title
self.resizable           -- Can resize?
self.drawFrame           -- Draw frame?

-- Methods
function ISCollapsableWindow:setTitle(title)
function ISCollapsableWindow:close()
```

#### ISScrollingListBox.lua
Scrollable list of items.

```lua
ISScrollingListBox = ISPanel:derive("ISScrollingListBox");

-- Methods
function ISScrollingListBox:addItem(text, item)
function ISScrollingListBox:removeItem(itemIndex)
function ISScrollingListBox:clear()
function ISScrollingListBox:setOnMouseDoubleClick(target, func)

-- Properties
self.items               -- List items
self.selected            -- Selected index
```

#### ISTextEntryBox.lua
Text input field.

```lua
ISTextEntryBox = ISUIElement:derive("ISTextEntryBox");

-- Methods
function ISTextEntryBox:getText()
function ISTextEntryBox:setText(text)
function ISTextEntryBox:clear()
function ISTextEntryBox:focus()
```

### UI Sub-folders

#### ISUI/AdminPanel/
Admin/server management UI.

#### ISUI/BodyParts/
Body part display components.

#### ISUI/Fireplace/
Fireplace interaction UI.

#### ISUI/Maps/
Map-related UI components.

#### ISUI/PlayerData/
Player data display.

### Creating Custom UI

```lua
require "ISUI/ISPanel"

MyCustomUI = ISPanel:derive("MyCustomUI");

function MyCustomUI:new(x, y, width, height)
    local o = ISPanel:new(x, y, width, height);
    setmetatable(o, self);
    self.__index = self;
    o.backgroundColor = {r=0, g=0, b=0, a=0.8};
    o.borderColor = {r=0.4, g=0.4, b=0.4, a=1};
    return o;
end

function MyCustomUI:initialise()
    ISPanel.initialise(self);
end

function MyCustomUI:createChildren()
    ISPanel.createChildren(self);

    -- Add a button
    local btn = ISButton:new(10, 10, 100, 25, "Click", self, MyCustomUI.onButtonClick);
    btn:initialise();
    btn:instantiate();
    self:addChild(btn);
end

function MyCustomUI:prerender()
    ISPanel.prerender(self);
end

function MyCustomUI:render()
    ISPanel.render(self);
    self:drawText("Hello!", 10, 50, 1, 1, 1, 1, UIFont.Medium);
end

function MyCustomUI.onButtonClick(self, button)
    print("Clicked!");
end

-- Show the UI
local ui = MyCustomUI:new(100, 100, 300, 200);
ui:initialise();
ui:addToUIManager();
```

---

## TimedActions/ (139 files)

All timed player actions.

### Action Categories

| Category | Examples |
|----------|----------|
| Medical | ISApplyBandage, ISTakePills, ISDisinfect |
| Combat | ISAttackAction, ISReloadWeaponAction |
| Crafting | ISCraftAction, ISDismantleAction |
| Building | ISBuildAction, ISDestroyAction |
| Vehicle | ISEnterVehicle, ISExitVehicle, ISRepairVehicle |
| Inventory | ISEquipWeaponAction, ISTransferItem |
| Food | ISEatFoodAction, ISCookFood |
| Social | ISTalkAction, ISTradeAction |

### Common Timed Actions

```lua
-- Eat food
ISEatFoodAction:new(player, item, percentage)

-- Craft item
ISCraftAction:new(player, item, time, recipe)

-- Build
ISBuildAction:new(player, spriteName, x, y, z, north)

-- Read book
ISReadABook:new(player, item, time)

-- Enter vehicle
ISEnterVehicle:new(player, vehicle, seat)
```

---

## Context/ - Context Menu System

### Files

| File | Purpose |
|------|---------|
| ISContextManager.lua | Context menu manager |
| ISMenuContext.lua | Base context menu |
| ISMenuContextBuild.lua | Building menu |
| ISMenuContextInventory.lua | Inventory menu |
| ISMenuContextWorld.lua | World interaction menu |
| ISMenuElement.lua | Menu element base |

### Context/ Sub-folders

- `Inventory/` - Inventory context actions
- `World/` - World object context actions

### Adding Context Menu Options

```lua
-- Add to inventory context menu
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    for i, v in ipairs(items) do
        local item = v;
        if not instanceof(v, "InventoryItem") then
            item = v.items[1];
        end

        if item:getType() == "MyItemType" then
            context:addOption("My Custom Action", items, MyMod.doAction, playerNum);
        end
    end
end);

function MyMod.doAction(items, playerNum)
    local player = getSpecificPlayer(playerNum);
    -- Do action
end

-- Add to world context menu
Events.OnFillWorldObjectContextMenu.Add(function(playerNum, context, worldObjects, test)
    for i, obj in ipairs(worldObjects) do
        if instanceof(obj, "IsoThumpable") then
            context:addOption("Interact", obj, MyMod.onInteract, playerNum);
        end
    end
end);
```

---

## Other Major Folders

### BuildingObjects/
Building placement and construction system.

```lua
-- ISBuildingObject.lua - Base building class
ISBuildingObject = ISBaseObject:derive("ISBuildingObject");
```

### Vehicles/
Vehicle interaction UI and logic.

### XpSystem/
Skills panel, health panel, XP system UI.

### Farming/
Farming UI and interactions.

### Foraging/
Foraging UI and search system.

### Fishing/
Fishing minigame UI.

### Hotbar/
Hotbar slot management.

### RadioCom/
Radio/TV interaction UI.

### OptionScreens/
Game options, keybindings, mods menu.

### DebugUIs/
Debug panels and tools.

---

## Key Patterns

### UI Event Flow
```
1. onMouseDown(x, y)    - Mouse button pressed
2. onMouseMove(dx, dy)  - Mouse moved
3. onMouseUp(x, y)      - Mouse button released
4. onClick()            - Click completed
```

### Drawing Functions
```lua
-- In render() or prerender():
self:drawRect(x, y, w, h, a, r, g, b)           -- Filled rectangle
self:drawRectBorder(x, y, w, h, a, r, g, b)     -- Border only
self:drawText(text, x, y, r, g, b, a, font)    -- Text
self:drawTexture(tex, x, y, a, r, g, b)        -- Texture
self:drawTextureScaled(tex, x, y, w, h, a)     -- Scaled texture
```

### Common Fonts
```lua
UIFont.Small
UIFont.Medium
UIFont.Large
UIFont.Title
UIFont.Code
UIFont.NewSmall
UIFont.NewMedium
UIFont.NewLarge
```

---

## Documentation Status

| Component | Files | Status |
|-----------|-------|--------|
| ISUI/ | 166 | Partial - hierarchy documented |
| TimedActions/ | 139 | Partial - base documented |
| Context/ | 8+ | Partial |
| BuildingObjects/ | ~30 | Not started |
| Vehicles/ | ~20 | Not started |
| XpSystem/ | ~15 | Not started |
| Other folders | ~300 | Not started |

---

## Next Steps

1. Document key ISUIElement methods completely
2. Document common timed actions
3. Document context menu system
4. Create UI component reference article
