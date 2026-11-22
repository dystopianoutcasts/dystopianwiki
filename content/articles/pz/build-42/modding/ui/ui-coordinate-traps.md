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
  Two places where Build 42.22's UI code switches coordinate systems on you: ISUIElement:drawLine2 draws in screen coordinates, and ISScrollingListBox finds rows in content coordinates.
last_updated: '2026-11-21'
related_articles:
  - ui-engine-reference
  - custom-ui
  - ui3dscene-a-car-in-a-mod-window
  - replacing-a-vanilla-window
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [modders whose line is in the wrong place](#1-drawline2-draws-in-screen-coordinates) | [modders whose list hover names the wrong row](#2-scrolling-lists-find-rows-in-content-coordinates)

Outcast, when you build a panel, almost every draw call takes coordinates relative to your element's top-left corner. Almost. These are the exceptions that cost us a broken outline and a tooltip naming the wrong row.

All of it is client UI code. For the wider picture see the [UI engine reference](/pz/build-42/modding/ui/ui-engine-reference).

:::callout[The 1-minute version]{kind=key}
- `drawLine2(x, y, x2, y2, a, r, g, b)` passes its points straight to the renderer, so element-local points land off by your element's position.
- `drawLine(texture, x, y, x2, y2, thickness, a, r, g, b)` adds the element's position and scroll; its argument list is not the same as `drawLine2`'s.
- `ISScrollingListBox:rowAt(x, y)` expects content coordinates, the position in the whole list as if it were not scrolled.
- A parent panel that works out a row from its own mouse position must subtract the list's position and then its scroll.
- A `doDrawItem` override must return the next row's y, and `ISCollapsableWindow` keeps a strip along its bottom edge.
:::

:::facts
- **`drawLine2` offset error** exactly your element's absolute x and y on screen, plus its scroll
- **`getYScroll()` range** zero or negative (the setter clamps it at zero)
- **Resize strip height** half the Small-font button height plus 2
:::

## 1. drawLine2 draws in screen coordinates

**`ISUIElement:drawLine2` hands its points to the eight-point `DrawTexture`, which does not add the element's position, so it is not a sibling of `drawLine` in practice.**

```lua
function ISUIElement:drawLine2(x, y, x2, y2, a, r, g, b)
    if self.javaObject ~= nil then
        self.javaObject:DrawTexture(nil, x, y, x2, y2, x2+1, y2, x, y+1, r, g, b, a);
    end
end
```

That is the whole Lua function. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1229-1233`)] The Java `DrawTexture` overload with eight coordinates passes them straight to the sprite renderer. :cite[(`zombie/ui/UIElement.java:311-343`)] By contrast, `DrawLine`, `DrawText` and `DrawTextureScaledCol` all add the element's absolute position and its scroll, and `drawRect` and `drawText` reach them. :cite[(`zombie/ui/UIElement.java:185-191`, `zombie/ui/UIElement.java:476-489`, `zombie/ui/UIElement.java:516-536`, `media/lua/client/ISUI/ISUIElement.lua:1191-1197`, `media/lua/client/ISUI/ISUIElement.lua:1293-1300`)]

So if you pass element-local points to `drawLine2`, the line lands up and to the left by exactly your element's position on screen. Ours drew a pad's fill under the car and its outline a window away.

**Use `drawLine` for element-local lines.** Its arguments start with a texture and a thickness: `drawLine(texture, x, y, x2, y2, thickness, a, r, g, b)`. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1235-1240`)] If you hold screen coordinates and want a line, `drawLineAbsolute` takes the same arguments and subtracts the element's position and scroll first. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1242-1252`)] If you want `drawLine2` itself, add `self:getAbsoluteX()` and `self:getAbsoluteY()` to every point yourself.

## 2. Scrolling lists find rows in content coordinates

**`ISScrollingListBox:rowAt(x, y)` walks the rows from the top of the content, so it expects a position inside the whole list as if it were not scrolled.**

It starts at y = 0 and adds up row heights until it passes the given y. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:66-76`)]

Vanilla calls it with the list's own `getMouseX()` and `getMouseY()`, and `ISUIElement:getMouseY()` already takes the scroll into account, which is why vanilla's hover and clicks are right. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:116-118`, `media/lua/client/ISUI/ISScrollingListBox.lua:577-579`, `media/lua/client/ISUI/ISUIElement.lua:346-351`)] The `onMouseDown` the game calls on the list also gets content coordinates, because the engine hands a Lua `onMouseDown` the mouse y minus the element's scroll. :cite[(`zombie/ui/UIElement.java:1119-1127`)]

The trap is computing a hover from another element's mouse position, for example a parent panel doing `parentMouseY - list.y`. That is a position on the visible area, not in the content. Once the list scrolls, it names the wrong row. The draw loop tests rows at `y + list:getYScroll()`, and `getYScroll()` is zero or negative, because `setYScroll` clamps anything above zero. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:309`, `media/lua/client/ISUI/ISUIElement.lua:1685-1698`)] So the fix, for a list that sits directly in that parent, is:

```lua
local contentY = (parentMouseY - list:getY()) - list:getYScroll()
local row = list:rowAt(0, contentY)
```

## 3. Two smaller ones we keep relearning

**A `doDrawItem` that returns nothing breaks the row loop, and the resize strip along a window's bottom edge can sit over a button.**

- **`ISScrollingListBox.doDrawItem(y, item, alt)` must return the next row's y.** The draw loop takes `v.height = y2 - y` from the return value, so a function that returns nothing makes that subtraction fail on `nil`. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:527-534`)] An earlier version of this page said the rows silently stacked on top of row one; at 42.22 the code points to an error instead, read and not run.
- **`ISCollapsableWindow` has a resize strip along its bottom edge,** and its height follows the Small font height read when the file loads. :cite[(`media/lua/client/ISUI/ISCollapsableWindow.lua:11-12`, `media/lua/client/ISUI/ISCollapsableWindow.lua:302-304`)] Which element gets a mouse press is decided by child order: the last-added child is offered it first. :cite[(`zombie/ui/UIElement.java:1075-1082`)] Keep your content above `resizeWidgetHeight()` anyway. The longer account is in [UI overview](/pz/build-42/modding/ui/ui-overview).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and vanilla Lua, with no game run for this page. The broken outline and the wrong-row tooltip come from our own mods on 42.20 and were not repeated. Not verified: whether `drawLine` with a `nil` texture draws a plain colored line (vanilla's only caller of `drawLine` is `drawLineAbsolute`, which passes the texture through); the unchained `doDrawItem` error; the button in the resize strip: an earlier game test on 42.20 found it clickable at some font sizes and not at others, and that was not repeated.
:::
