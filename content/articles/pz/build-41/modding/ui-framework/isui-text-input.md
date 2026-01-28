---
id: ui-framework-isui-text-input
slug: isui-text-input
title: "Text Input Fields with ISTextEntryBox"
game: pz
version: build-41
section: modding
category: ui-framework
subcategory: null
difficulty: beginner
tags:
  - beginner
  - lua
  - ui
  - isui
  - istextentrybox
  - input
  - forms
excerpt: "Learn how to create text input fields that let players type in your mod's UI. Covers basic inputs, validation, passwords, and number-only fields."
table_of_contents:
  - text: "What Is ISTextEntryBox?"
    link: "#what-is-istextentrybox"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Your First Text Input"
    link: "#your-first-text-input"
  - text: "Where Does This Code Go?"
    link: "#where-does-this-code-go"
  - text: "Reading What the Player Typed"
    link: "#reading-what-the-player-typed"
  - text: "Responding to Text Changes"
    link: "#responding-to-text-changes"
  - text: "Input Constraints"
    link: "#input-constraints"
  - text: "Validation and Feedback"
    link: "#validation-and-feedback"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Complete Example"
    link: "#complete-example"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "What's Next?"
    link: "#whats-next"
next_steps:
  - title: "Dropdown Menus"
    path: /pz/build-41/modding/ui-framework/isui-combo-box
  - title: "Checkboxes"
    path: /pz/build-41/modding/ui-framework/isui-tickbox
  - title: "Creating Buttons"
    path: /pz/build-41/modding/ui-framework/isui-buttons
last_updated: 2026-01-28
---

# Text Input Fields with ISTextEntryBox

## What Is ISTextEntryBox?

You know the text boxes where you type your character's name? Or the search box in the inventory? Or the admin password field when connecting to servers? Those are all **ISTextEntryBox** components.

When your mod needs players to type something - a name, a number, a search term, or any text input - ISTextEntryBox is how you create it.

**You would use ISTextEntryBox when:**
- Your mod has a settings panel where players enter their name or a value
- You're building a search feature
- You need players to input numbers (item counts, coordinates, etc.)
- You want a password or admin code field

---

## Prerequisites

Before this article, you should understand:
- [What is ISUI?](/pz/build-41/modding/ui-framework/isui-overview) - The basics of PZ's UI system
- [Creating Panels](/pz/build-41/modding/ui-framework/isui-panels) - Text inputs need a panel to live in
- [Creating Buttons](/pz/build-41/modding/ui-framework/isui-buttons) - You'll often pair inputs with buttons

---

## Your First Text Input

Here's the simplest text input:

```lua
local textInput = ISTextEntryBox:new(
    "",           -- starting text (empty)
    10,           -- x position
    10,           -- y position  
    200,          -- width
    25            -- height
)
textInput:initialise()
textInput:instantiate()    -- Text inputs need this extra step!
self:addChild(textInput)
```

**Important difference from buttons:** Text inputs need both `initialise()` AND `instantiate()`. This is because they use Java code internally for text editing.

**Let's break this down:**

| Part | What It Does |
|------|-------------|
| `ISTextEntryBox:new(...)` | Creates a new text input |
| `""` | Starting text (empty string = blank field) |
| `10, 10` | Position: 10 pixels from left, 10 from top |
| `200, 25` | Size: 200 pixels wide, 25 tall |
| `initialise()` | Sets up the Lua side |
| `instantiate()` | Sets up the Java text editing side |
| `addChild()` | Adds it to your panel |

**What you'll see:** A text box where players can click and type.

---

## Where Does This Code Go?

Just like buttons, text inputs go inside a panel's `createChildren` function:

```
YourMod/
├── mod.info
└── media/
    └── lua/
        └── client/
            └── MyModPanel.lua
```

Inside your panel file:

```lua
require "ISUI/ISPanel"
require "ISUI/ISTextEntryBox"

MyModPanel = ISPanel:derive("MyModPanel")

function MyModPanel:createChildren()
    ISPanel.createChildren(self)
    
    -- Create the text input
    self.nameInput = ISTextEntryBox:new("", 10, 10, 200, 25)
    self.nameInput:initialise()
    self.nameInput:instantiate()
    self:addChild(self.nameInput)
end
```

---

## Reading What the Player Typed

The most common thing you'll do is read the text when a button is clicked:

```lua
function MyModPanel:createChildren()
    ISPanel.createChildren(self)
    
    -- Text input
    self.nameInput = ISTextEntryBox:new("", 10, 10, 200, 25)
    self.nameInput:initialise()
    self.nameInput:instantiate()
    self:addChild(self.nameInput)
    
    -- Submit button
    self.submitButton = ISButton:new(10, 45, 80, 25, "Submit", self, MyModPanel.onSubmit)
    self.submitButton:initialise()
    self:addChild(self.submitButton)
end

function MyModPanel:onSubmit(button)
    -- Get what the player typed
    local playerName = self.nameInput:getText()
    
    print("Player entered: " .. playerName)
    
    -- Now do something with it!
end
```

**Key method:** `getText()` returns whatever text is currently in the box.

---

## Responding to Text Changes

Sometimes you want to react as the player types, not wait for a button click.

### Method 1: Override onTextChange

```lua
function MyModPanel:createChildren()
    ISPanel.createChildren(self)
    
    self.searchInput = ISTextEntryBox:new("", 10, 10, 200, 25)
    self.searchInput:initialise()
    self.searchInput:instantiate()
    
    -- Store reference to panel for the callback
    self.searchInput.panel = self
    
    -- Override the onTextChange function
    self.searchInput.onTextChange = function()
        self:onSearchChanged()
    end
    
    self:addChild(self.searchInput)
end

function MyModPanel:onSearchChanged()
    local searchText = self.searchInput:getText()
    print("Searching for: " .. searchText)
    -- Update search results here
end
```

### Method 2: Check on Enter Key

Run code when player presses Enter:

```lua
self.searchInput.onCommandEntered = function()
    local text = self.searchInput:getText()
    print("Player pressed Enter with: " .. text)
end
```

---

## Input Constraints

You can limit what players can type:

### Numbers Only

```lua
self.amountInput = ISTextEntryBox:new("0", 10, 10, 80, 25)
self.amountInput:initialise()
self.amountInput:instantiate()
self.amountInput:setOnlyNumbers(true)  -- Only digits allowed
self:addChild(self.amountInput)
```

Players can only type 0-9. Letters are ignored.

### Maximum Length

```lua
self.nameInput:setMaxTextLength(20)  -- Max 20 characters
```

### Force Uppercase

```lua
self.codeInput:setForceUpperCase(true)  -- Always CAPS
```

### Password Field (Hidden Characters)

```lua
self.passwordInput = ISTextEntryBox:new("", 10, 10, 200, 25)
self.passwordInput:initialise()
self.passwordInput:instantiate()
self.passwordInput:setMasked(true)  -- Shows ••••• instead of text
self:addChild(self.passwordInput)
```

---

## Validation and Feedback

Show players when their input is valid or invalid:

### Red Border for Invalid Input

```lua
function MyModPanel:validateInput()
    local text = self.nameInput:getText()
    
    if #text < 3 then
        -- Too short - show red border
        self.nameInput:setValid(false)
        return false
    else
        -- Valid - normal border
        self.nameInput:setValid(true)
        return true
    end
end
```

### Disable Button Until Valid

```lua
function MyModPanel:createChildren()
    ISPanel.createChildren(self)
    
    -- Name input
    self.nameInput = ISTextEntryBox:new("", 10, 10, 200, 25)
    self.nameInput:initialise()
    self.nameInput:instantiate()
    self.nameInput.onTextChange = function()
        self:validateAndUpdateButton()
    end
    self:addChild(self.nameInput)
    
    -- Submit button (starts disabled)
    self.submitButton = ISButton:new(10, 45, 80, 25, "Submit", self, MyModPanel.onSubmit)
    self.submitButton:initialise()
    self.submitButton:setEnable(false)  -- Disabled until valid
    self:addChild(self.submitButton)
end

function MyModPanel:validateAndUpdateButton()
    local text = self.nameInput:getText()
    local isValid = #text >= 3  -- At least 3 characters
    
    self.nameInput:setValid(isValid)
    self.submitButton:setEnable(isValid)
end
```

---

## Common Mistakes

### Mistake: Forgetting instantiate()

```lua
-- WRONG: Missing instantiate - text input won't work
local input = ISTextEntryBox:new("", 10, 10, 200, 25)
input:initialise()
-- Missing: input:instantiate()
self:addChild(input)
```

```lua
-- RIGHT: Both initialise AND instantiate
local input = ISTextEntryBox:new("", 10, 10, 200, 25)
input:initialise()
input:instantiate()  -- Required for text inputs!
self:addChild(input)
```

**Why?** Text inputs use Java internally for the actual text editing. `instantiate()` creates that Java object.

### Mistake: Parameter Order

Notice the first parameter is the initial text, not the position:

```lua
-- ISTextEntryBox: (text, x, y, width, height)
ISTextEntryBox:new("", 10, 10, 200, 25)

-- ISButton: (x, y, width, height, text, ...)
ISButton:new(10, 10, 100, 25, "Click")
```

They're different! Text comes first for text inputs.

### Mistake: getText() Returns Empty String

```lua
-- WRONG: Checking against nil
if self.nameInput:getText() == nil then
    print("No input")
end
```

```lua
-- RIGHT: Check against empty string
if self.nameInput:getText() == "" then
    print("No input")
end

-- OR check length
if #self.nameInput:getText() == 0 then
    print("No input")
end
```

`getText()` always returns a string, never nil. Empty input = empty string "".

### Mistake: Numbers from Number Input

```lua
-- WRONG: getText() returns STRING, not number
local amount = self.amountInput:getText()
local total = amount + 10  -- ERROR: can't add string + number
```

```lua
-- RIGHT: Convert to number
local amountText = self.amountInput:getText()
local amount = tonumber(amountText) or 0  -- Default to 0 if conversion fails
local total = amount + 10  -- Works!
```

---

## Complete Example

A name entry panel with validation:

```lua
require "ISUI/ISPanel"
require "ISUI/ISButton"
require "ISUI/ISTextEntryBox"
require "ISUI/ISLabel"

NameEntryPanel = ISPanel:derive("NameEntryPanel")

function NameEntryPanel:new(x, y)
    local width = 300
    local height = 120
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.backgroundColor = {r=0.1, g=0.1, b=0.1, a=0.9}
    return o
end

function NameEntryPanel:createChildren()
    ISPanel.createChildren(self)
    
    -- Label
    self.label = ISLabel:new(
        10, 10,
        25,                    -- height
        "Enter your name:",    -- text
        1, 1, 1, 1,            -- color (white)
        UIFont.Small,
        true                   -- left align
    )
    self.label:initialise()
    self:addChild(self.label)
    
    -- Name input
    self.nameInput = ISTextEntryBox:new("", 10, 40, 280, 25)
    self.nameInput:initialise()
    self.nameInput:instantiate()
    self.nameInput:setMaxTextLength(30)
    self.nameInput.onTextChange = function()
        self:validate()
    end
    self:addChild(self.nameInput)
    
    -- Hint text
    self.hint = ISLabel:new(
        10, 68,
        20,
        "(At least 3 characters)",
        0.6, 0.6, 0.6, 1,      -- gray color
        UIFont.Small,
        true
    )
    self.hint:initialise()
    self:addChild(self.hint)
    
    -- Confirm button
    self.confirmButton = ISButton:new(
        self.width - 90, self.height - 35,
        80, 25,
        "Confirm",
        self,
        NameEntryPanel.onConfirm
    )
    self.confirmButton:initialise()
    self.confirmButton:setEnable(false)  -- Start disabled
    self:addChild(self.confirmButton)
end

function NameEntryPanel:validate()
    local name = self.nameInput:getText()
    local isValid = #name >= 3
    
    self.nameInput:setValid(isValid)
    self.confirmButton:setEnable(isValid)
    
    -- Update hint text
    if isValid then
        self.hint:setName("Looking good!")
        self.hint:setColor(0.5, 1, 0.5, 1)  -- Green
    else
        self.hint:setName("(At least 3 characters)")
        self.hint:setColor(0.6, 0.6, 0.6, 1)  -- Gray
    end
end

function NameEntryPanel:onConfirm(button)
    local name = self.nameInput:getText()
    print("Name confirmed: " .. name)
    
    -- Do something with the name!
    -- Save to mod settings, use in game, etc.
    
    self:close()
end

function NameEntryPanel:close()
    self:setVisible(false)
    self:removeFromUIManager()
end

-- Function to show the panel
function ShowNameEntryPanel()
    local panel = NameEntryPanel:new(100, 100)
    panel:initialise()
    panel:addToUIManager()
    panel:setVisible(true)
    return panel
end
```

**To test:** In the game console, type `ShowNameEntryPanel()` and press Enter.

---

## Key Takeaways

1. **ISTextEntryBox creates text input fields** - Like the name entry or search boxes in vanilla PZ
2. **Always call both initialise() AND instantiate()** - Unlike buttons, text inputs need both
3. **Parameter order is different** - Text comes first: `new(text, x, y, width, height)`
4. **getText() returns a string** - Even for number inputs, convert with `tonumber()`
5. **Use setValid(false) for feedback** - Shows a red border for invalid input

---

## What's Next?

- [Dropdown Menus](/pz/build-41/modding/ui-framework/isui-combo-box) - Let players choose from options
- [Checkboxes](/pz/build-41/modding/ui-framework/isui-tickbox) - Yes/no toggles
- [Labels and Text](/pz/build-41/modding/ui-framework/isui-labels) - Display static text
