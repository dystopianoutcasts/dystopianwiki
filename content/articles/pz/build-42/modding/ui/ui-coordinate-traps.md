---
id: build-42-ui-coordinate-traps
slug: ui-coordinate-traps
title: 'UI coordinate traps: drawLine2 and scrolling lists'
game: pz
version: build-42
section: modding
category: ui
difficulty: intermediate
tags:
  - ui
  - drawing
  - coordinates
  - scrolling
excerpt: >-
  Two places where Build 42's UI code silently switches coordinate systems on
  you: ISUIElement:drawLine2 draws in screen coordinates while its neighbours
  draw in the element's own, and ISScrollingListBox finds rows in content
  coordinates. Read from the 42.21 code.
last_updated: '2026-10-04'
related_articles:
  - ui-engine-reference
  - custom-ui
  - ui3dscene-a-car-in-a-mod-window
---
# UI coordinate traps: drawLine2 and scrolling lists

Outcast, when you build a panel, almost every draw call takes coordinates relative to your element's top-left corner. Almost. These are the two exceptions that cost us a broken outline and a tooltip naming the wrong row. For the wider UI picture see the [UI engine reference](/pz/build-42/modding/ui/ui-engine-reference).

## drawLine2 draws in screen coordinates

`ISUIElement:drawLine2(x, y, x2, y2, a, r, g, b)` looks like a sibling of `drawLine`, but it is not drawn the same way. It hands its points straight to the eight-point `DrawTexture`, which passes them to the renderer without adding the element's position:

```lua
function ISUIElement:drawLine2( x, y, x2, y2, a, r, g, b)
    self.javaObject:DrawTexture(nil, x, y, x2, y2, x2+1, y2, x, y+1, r, g, b, a);
end
```

`drawLine`, `drawRect` and `drawText` all add the element's absolute position (and its scroll). So if you pass element-local points to `drawLine2`, the line lands up and to the left by exactly your element's position on screen. Ours drew a pad's fill under the car and its outline a window away.

**Use `drawLine` for element-local lines.** If you do want `drawLine2`, add `self:getAbsoluteX()` and `self:getAbsoluteY()` to every point yourself.

> **Proof:** Code. `media/lua/client/ISUI/ISUIElement.lua`, `ISUIElement:drawLine2` and `ISUIElement:drawLine`; `zombie.ui.UIElement#DrawTexture` (eight-point overload: no `getAbsoluteX`/`getAbsoluteY`), `#DrawLine` (adds them and the scroll), `#DrawTextureScaledCol` and `#DrawText` (add them). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Scrolling lists find rows in content coordinates

`ISScrollingListBox:rowAt(x, y)` walks the rows from the top of the content, y = 0, adding up row heights. It expects **content** coordinates: positions inside the whole list as if it were not scrolled.

Vanilla always calls it with the list's own `getMouseX()` / `getMouseY()`, and `ISUIElement:getMouseY()` already takes the scroll into account. That is why vanilla's hover and clicks are right. The handlers the game calls on the list itself (`onMouseDown`, `onRightMouseUp` assigned on the list) also receive content coordinates.

The trap is computing a hover from **another** element's mouse position, for example a parent panel doing `parentMouseY - list.y`. That is a position on the visible area, not in the content. Once the list scrolls, it names the wrong row. Rows are drawn at `y + list:getYScroll()`, and `getYScroll()` is zero or negative, so the fix is:

```lua
local contentY = (parentMouseY - list:getY()) - list:getYScroll()
local row = list:rowAt(0, contentY)
```

> **Proof:** Code. `media/lua/client/ISUI/ISScrollingListBox.lua`, `ISScrollingListBox:rowAt` (walks from `y0 = 0`), its callers in `onMouseMove`, the tooltip code and `onMouseDown`, and the draw position test `y + self:getYScroll()`; `media/lua/client/ISUI/ISUIElement.lua`, `ISUIElement:getMouseY` (subtracts the scroll) and `ISUIElement:setYScroll` (clamps to zero or below). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Two smaller ones we keep relearning

- **`ISScrollingListBox.doDrawItem(y, item, alt)` must return the next row's y.** Return nothing and every row stacks on the first, with no error.
- **`ISCollapsableWindow` has a resize strip along its bottom edge**, and its height follows the font size option. A button placed in that strip is clickable at some font sizes and not at others. Keep your content above `resizeWidgetHeight()`.

> **Proof:** Code. `media/lua/client/ISUI/ISScrollingListBox.lua` (`prerender` sets `y` from the value `doDrawItem` returns); `media/lua/client/ISUI/ISCollapsableWindow.lua` (`resizeWidgetHeight`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).
