---
id: build-42-ui-engine-reference
slug: ui-engine-reference
title: UI engine reference and gotchas
game: pz
version: build-42
section: modding
category: ui
difficulty: intermediate
tags:
  - isui
  - anchors
  - iscollapsablewindow
  - engine-reference
excerpt: >-
  Machine-checked against the installed game, not recalled. Every line number
  below was read out of the installed game's media/lua/client/ on 2026-08-09.
last_updated: '2026-10-04'
---
# UI engine reference and gotchas

> Source: 01-ui-engine-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Machine-checked against the installed game, not recalled.** Every line number
below was read out of the installed game's
`media/lua/client/` on 2026-08-09.

Written while building Outcast Motors UI. Several entries cost a real in-game
run to find, and two of them had already cost Outcast Motors one.

---

## 1 · The trap that will get you: anchors must go through the setters

**Assigning the field does nothing. The Java object enforces anchoring, not Lua.**

```lua
-- BROKEN. Updates the Lua table; the window never hears about it.
btn.anchorTop, btn.anchorBottom = false, true

-- CORRECT.
btn:setAnchorTop(false)
btn:setAnchorBottom(true)
```

`instantiate()` copies the Lua fields into the java object **once**
(`ISUIElement.lua:999-1002`):

```lua
self.javaObject:setAnchorLeft(self.anchorLeft);
self.javaObject:setAnchorRight(self.anchorRight);
self.javaObject:setAnchorTop(self.anchorTop);
self.javaObject:setAnchorBottom(self.anchorBottom);
```

and never looks again. A raw assignment after `instantiate()` leaves Java holding
`ISUIElement`'s constructor defaults -- `anchorTop = true, anchorBottom = false`
(`ISUIElement.lua:1985-1986`).

`setAnchorBottom()` writes the field **and** forwards to the java object when one
exists (`ISUIElement.lua:129-134`), so it is correct on either side of
`instantiate()`. Always use it.

**Symptom:** the element sits correctly at the window's starting size, then stays
welded in place while the window is resized. Reported as *"the buttons are frozen
in height"*. A sibling that used the setters -- typically a scrolling list --
stretches correctly and grows straight over the ones that did not, which makes it
look like a z-order or overlap bug rather than an anchoring one.

**Both Outcast Motors and Outcast Motors UI shipped with this**, from the same
copied lines. Grep any new panel for `.anchor` followed by `=`.

## 2 · `ISCollapsableWindow` puts a full-width strip across the bottom edge

`createChildren()` adds **two** resize widgets, and the second is the one nobody
pictures (`ISCollapsableWindow.lua:34, 42`):

```lua
local resizeWidget = ISResizeWidget:new(self.width-rh, self.height-rh, rh, rh, self);   -- corner grip
resizeWidget = ISResizeWidget:new(0, self.height-rh, self.width-rh, rh, self, true);    -- FULL WIDTH
```

Anything placed inside that strip is covered and unclickable.

**It is not a constant.** `resizeWidgetHeight()` returns `(BUTTON_HGT/2)+2`
(`:302-304`) and `BUTTON_HGT` derives from the font, so **it grows with the
player's UI-scale option**. That is why this bug presents as "the buttons work on
my machine" -- it is scale-dependent.

Reserve for it, measured, exactly as vanilla does (`ISVehicleMechanics.lua:141`):

```lua
local rh = self.resizable and self:resizeWidgetHeight() or 0
local bottomOfContent = self.height - buttonHeight - PAD - rh
```

`titleBarHeight()` is likewise derived: `math.max(16, self.titleFontHgt + 1)`
(`:298-300`).

## 3 · `FONT_HGT_SMALL` is not a global

It appears in dozens of vanilla UI files and **every one of them declares its own
file-local copy** (`ISVehicleMechanics.lua:13` among them):

```lua
local FONT_HGT_SMALL = getTextManager():getFontHeight(UIFont.Small)
```

Using it unqualified reads `nil` and fails on the first arithmetic, at panel
construction. Measure it; never hardcode a row or button height, because the
player's UI scale changes it and a fixed height clips its own label.

## 4 · `doDrawItem` -- two things that bite

Assigned onto the listbox (`ISScrollingListBox.lua:304`, called at `:527`):

```lua
self.listbox.doDrawItem = MyPanel.drawRow
```

**`self` is the LISTBOX, not your panel.** Reach the panel through
`self.parent`, and set `listbox.parent` yourself if you need it.

**It must return the next y.** `local y2 = self:doDrawItem(y, v, alt)` -- forget
the return and every row stacks on top of the first, silently.

```lua
function MyPanel:drawRow(y, item, alt)
    local row = item.item        -- addItem(text, data) -> data is item.item
    local h   = self.itemheight
    ...
    return y + h
end
```

## 4b · `setWantKeyEvents(true)` without a handler is pure cost

The flag routes keyboard input to your element. With no `onKeyRelease` /
`onKeyPress` implemented, you claim the input and do nothing with it -- and
players notice a window that eats hotbar and movement keys long before they
notice anything else.

**But do not just drop the flag on a window that replaces a vanilla one.**
Vanilla's mechanics window sets it (`ISVehicleMechanics.lua:1533`) *because it
handles keys* (`:1542`):

```lua
function ISVehicleMechanics:onKeyRelease(key)
    if key == Keyboard.KEY_ESCAPE then
        if isPlayerDoingActionThatCanBeCancelled(self.chr) then
            stopDoingActionThatCanBeCancelled(self.chr)   -- cancel BEFORE closing
        else
            self:close()
        end
    end
    if getCore():isKey(KeybindId.VEHICLE_MECHANICS, key) then
        self:close()
    end
end
```

Build 42.21 names keybinds through the new `KeybindId` table, as above. The
string form vanilla used before, `getCore():isKey("VehicleMechanics", key)`, still
works: `Core` keeps both overloads, and the `KeybindId` one just looks up the same
name.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:onKeyRelease`; `zombie.core.Core#isKey(String, Integer)` and `#isKey(KeybindId, Integer)`; `zombie.input.KeybindId` (`VEHICLE_MECHANICS` is registered as `"VehicleMechanics"`). Build 42.21.0 (revision 4a0e9546ec).

Two behaviours players already have: **Escape closes** -- cancelling an
in-progress action first, because Escape mid-repair means "stop", not "hide the
window and keep going" -- and **the action's own keybind closes it**, like every
other toggled window.

**The rule:** claim key events only if you handle them, and if you are replacing
a vanilla window, handle at least what it handled. Of the 23 vanilla files that
set this flag, most are debug UIs and editors -- panels that genuinely read the
keyboard.

### Two key traps around it

- **A focused text box eats every key release.** While a text entry box has
  focus, the engine skips `UIManager.onKeyRelease` and `Events.OnKeyPressed` for
  every key, so your window's `onKeyRelease` (Escape included) never runs. Give
  the box an `onOtherKey` that unfocuses it on Escape, and unfocus it when your
  window closes.
- **Escape needs `isKeyConsumed`.** After your `onKeyRelease`, the engine asks
  `isKeyConsumed(key)`. Without one the key counts as not consumed and is passed
  on: in our replacement mechanics window, Escape closed the window and then
  opened the pause menu too. Vanilla's mechanics window has one
  (`ISVehicleMechanics.lua:1537`); copy it.

Both, with the rest of what we learned replacing a vanilla window, are in
[Replacing or extending a vanilla window](/pz/build-42/modding/ui/replacing-a-vanilla-window).

> **Proof:** Code. `zombie.input.GameKeyboard#update` (while `Core.currentTextEntryBox` is doing text entry, `UIManager.onKeyRelease` and the `OnKeyPressed` event are skipped); `zombie.ui.UIElement#onConsumeKeyRelease` (calls `onKeyRelease`, then returns `isKeyConsumed(key)`, false when the Lua table has none); `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:isKeyConsumed`. Build 42.21.0 (revision 4a0e9546ec).

> **Proof:** Game test. Escape opened the pause menu behind our replacement mechanics window until it gained `isKeyConsumed`. Build 42.20, engine revision a2947723ca.

## 4c · Two calls that switch coordinate systems

Almost every draw call takes coordinates relative to your element. Two do not:

- **`drawLine2` draws in screen coordinates.** It hands its points straight to
  the eight-point `DrawTexture`, which does not add the element's position, while
  `drawLine`, `drawRect` and `drawText` do. Element-local points put the line off
  by exactly your window's position. Use `drawLine`, or add `getAbsoluteX()` and
  `getAbsoluteY()` to every point yourself.
- **`ISScrollingListBox:rowAt(x, y)` takes content coordinates**: positions in
  the whole list as if it were not scrolled. The list's own `getMouseY()` already
  allows for the scroll, which is why vanilla's hover works. A parent panel that
  works out a row from its own mouse position must subtract the list's `getY()`
  and then its `getYScroll()`, or it names the wrong row once the list scrolls.

The code and the fixes are in
[UI coordinate traps](/pz/build-42/modding/ui/ui-coordinate-traps).

> **Proof:** Code. `media/lua/client/ISUI/ISUIElement.lua`, `ISUIElement:drawLine2` (`self.javaObject:DrawTexture(nil, x, y, x2, y2, ...)`) and `ISUIElement:drawLine` (`DrawLine`, which adds the absolute position); `media/lua/client/ISUI/ISScrollingListBox.lua`, `ISScrollingListBox:rowAt` (walks the rows from `y0 = 0`). Build 42.21.0 (revision 4a0e9546ec).

## 5 · `getText` returns the key when there is no translation

So a missing entry renders as `IGUI_VehiclePartCatbodywork` on screen rather than
blank or nil. Guard where a raw id would be less ugly than the key. B42
translations are **JSON**, not `.txt` -- see the family's B42 gotchas note.

## 6 · Kahlua prints a full stack trace even under `pcall`

So swallowing an error still floods the console, and anything called from
`render()` or `prerender()` -- which run ~60 times a second -- must not raise
repeatedly. The pattern the family settled on: catch, then complain **once** per
subject and serve a fallback quietly afterwards.

## 7 · Vehicle mechanics specifics

### One choke point for opening the window

Both routes -- the hood (`Vehicles.lua:829`) and the radial
(`ISVehicleMenu.lua:188, :297`) -- end at:

```lua
ISTimedActionQueue.add(ISOpenMechanicsUIAction:new(character, vehicle, part))
```

So **`ISOpenMechanicsUIAction:perform()` is a single interception point** covering
every route. `ISVehicleMenu.lua` alone builds that action in three places, so
patching entry points individually is three chances to miss one.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua`, three `ISOpenMechanicsUIAction:new` calls (lines 970, 1004, 1234); the same three in 42.20. Build 42.21.0 (revision 4a0e9546ec).

**Chain, do not replace.** Project Summer Car assigns straight over
`ISVehicleMechanics:doPartContextMenu`, and two mods doing that silently fight.

**Call `ISBaseTimedAction.perform(self)` when you intercept**, or the action never
leaves the queue and everything behind it stalls -- which presents as the game
freezing, not as a UI bug.

**Mark the function so a Lua reload cannot double-wrap it:**

```lua
if ISOpenMechanicsUIAction.perform ~= nil and ISOpenMechanicsUIAction.__myHooked ~= true then
    local previous = ISOpenMechanicsUIAction.perform
    ISOpenMechanicsUIAction.__myHooked = true
    function ISOpenMechanicsUIAction:perform() ... return previous(self) end
end
```

### Enumerating parts

`ISVehicleMechanics.lua:49-51`:

```lua
for i=1,self.vehicle:getPartCount() do
    local part = self.vehicle:getPartByIndex(i-1)      -- ZERO-based
    local category = part:getCategory() or "Other"
    if category ~= "nodisplay" then ...
```

- **`getPartByIndex` is 0-based** while the loop is 1-based.
- **`nodisplay` is skipped** -- and that is **39 declarations** across the vanilla
  vehicle scripts, more part types than the window actually shows. Hiding is an
  established move here, not a shortcut.
- Names: `getText("IGUI_VehiclePart" .. part:getId())`, categories:
  `getText("IGUI_VehiclePartCat" .. category)`.

### Fitted or missing

`ISVehicleMechanics.lua:112` -- a part is EMPTY when it declares an item type and
has nothing in it:

```lua
if part:getItemType() and not part:getItemType():isEmpty() and not part:getInventoryItem() then
```

A part with **no item type is structural** -- a door frame, a window aperture --
and is always present. Get this backwards and half a working car reads as
MISSING.

### The left/right split cannot grow

`ISVehicleMechanics.lua:80`, the entire rule:

```lua
local list = self.listbox
if i == "door" or i == "bodywork" or i == "lights" then list = self.bodyworklist end
```

A hardcoded three-name whitelist. Column widths are then computed from the
longest part NAME (`MeasureStringX`, `:86`), so the layout is text-driven rather
than content-driven, and category iteration is `pairs()` over a hash -- which is
to say unordered.

### Vanilla gates actions, never information

Every `getPerkLevel(Perks.Mechanics)` check gates whether an *option appears*
(`:325, :333, :344, :355, :651, :671, :694, :714`). **Lines 1172-1331 draw
condition, mass, engine power, temperature, quality, wheel friction and braking
force with no condition attached at all.**

Action gating is extensive and worth reusing rather than rebuilding: `Base.Jack`
for tyres and suspension, `base:wrench` across 16 install tables,
`base:screwdriver` across 18, `requireInstalled` ordering, `mechanicRequireKey`,
and `mechanicArea` for where the character must stand.

### A parked car never updates its parts

Vanilla's `Update.Engine` ends with:

```lua
if temperature <= 0 and not isEngineRunning() and not getDriver() then
    vehicle:setNeedPartsUpdate(false)
```

So a cold, parked, driverless car receives no part updates -- which is most of
the cars in the world. Anything that populates or ages parts on that hook never
runs. **Call `vehicle:setNeedPartsUpdate(true)` when you open a panel**; it
reaches the server-authoritative side in both single-player and multiplayer,
where reaching directly into a populate routine from client code would silently
do nothing on a client.

Observed: 0 of 19 parts on three consecutive opens of a never-driven car, before
the wake existed.

### The diagram already exists

`media/ui/vehicles/mechanic overlay/` ships **314 textures**, keyed by body type
and part, drawn as a base image plus per-part overlays each **tinted by that
part's condition** (`ISVehicleMechanics.lua:918, :936`). Prefix comes from
`ISCarMechanicsOverlay.CarList[overlayName].imgPrefix`.

**Two caveats.** They are keyed by vanilla body type, so a modded vehicle almost
certainly has none and a non-spatial fallback is mandatory. And the tint *is*
condition -- so any mod that gates condition information cannot use these
textures unmodified for a character who has not earned it.

## 8 · Logging: gated lines can be lost

`OutcastLib.Debug` buffers and writes on `note()`, every `FLUSH_EVERY` (25) lines,
`EveryOneMinute`, or `OnPostSave`. `LuaFileWriter` has no `flush()` -- only
`close()` puts bytes on disk -- and **PZ exposes no reliable quit or crash event**.

Consequence: **a session that ends without a save loses the tail of the gated
log.** The first Outcast Motors UI run produced a log with the boot line present
and the hook-installation line absent, purely because one was ungated and the
other was not.

**Put once-per-session milestones on the ungated channel.** "Loaded" and "loaded
and hooked" are different facts, and the gap between them is the most useful
thing a log can say about a UI mod.

## 9 · Checklist for a new panel

- [ ] `local FONT_HGT_SMALL = getTextManager():getFontHeight(UIFont.Small)`
- [ ] reserve `resizeWidgetHeight()` at the bottom, measured not assumed
- [ ] button height from the font, never a fixed 25
- [ ] anchors via `setAnchorX()`, **never** field assignment
- [ ] `doDrawItem` returns the next y, and treats `self` as the listbox
- [ ] refresh on a timer, never in `render()`
- [ ] hook chained, not replaced, with a re-entry guard and an idempotence marker
- [ ] `isKeyConsumed` on any window that closes on Escape; text boxes unfocused on close
- [ ] `drawLine` for element-local lines (`drawLine2` is screen coordinates); `rowAt` fed content coordinates
- [ ] tested at two UI scales -- most of these bugs are scale-dependent

*Updated 2026-10-04 for Build 42.21: the quoted `onKeyRelease` now reads `KeybindId.VEHICLE_MECHANICS`, as vanilla does; the string form still works. The hood route moved to `Vehicles.lua:829`; every other line number here is unchanged in 42.21. `ISVehicleMenu.lua` builds the open-mechanics action in three places, not four (three in 42.20 as well).*

*Updated 2026-10-04: added the text-box focus and `isKeyConsumed` key traps and the `drawLine2` and `rowAt` coordinate traps, with links to the articles that cover them in full.*
