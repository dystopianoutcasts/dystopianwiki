---
id: build-42-street-names
slug: street-names
title: Street names
game: pz
version: build-42
section: mapping
category: fundamentals
difficulty: intermediate
tags:
  - cell-size
  - worldmap
  - biomemap
  - lot-export
excerpt: 'B42.20 ships streets.xml per map. Confirmed in the vanilla install:'
last_updated: '2026-09-29'
related_articles:
  - the-cell-size-question
  - coordinates-use-b41-numbers
  - authoring-the-world-from-pngs
  - bmp-to-tmx
  - script-files-that-drive-generation
  - thumbnails
  - trimming-the-world-rectangle
  - biomemap
  - zombie-heatmap
  - in-game-map-worldmap-generation
  - preview-modes-power-snow-jumbo
  - vegetation-on-upper-levels
  - automapper
  - lot-generation-and-export
---
# Street names (new, build 20260801) `[VERIFIED]`

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B42.20 ships `streets.xml` per map. Confirmed in the vanilla install:

```xml
<streets version="1">
    <street name="Oak St" width="8">
        <points>
            <point x="10961.0" y="6635.0"/>
            ...
```

WorldEd replaced the obsolete Road dock with a **World Street Name Editor**:

- Load and edit streets as named, variable-width polylines over the World view.
  Create, select, drag, insert, remove, reverse, split, undo, redo.
- Coordinates follow the project cell geometry and world origin. Invalid names,
  widths, coordinates, duplicate consecutive points and incomplete polylines are
  rejected before output.
- Visible and editable in both World and Cell views; cell views only instantiate
  lines crossing that cell.
- Navigation / Edit Geometry / Creation are explicit modes. Point dragging and
  insertion only happen after **Edit Geometry** is enabled, so normal cell
  double-click-to-open still works.
- Writes are atomic. The normal Save action (including `Ctrl+S`) generates or
  updates `streets.xml` whenever the project has street data, unsaved street
  edits, or an existing street file.
- `streets.xml` appears in WorldEd's Maps browser alongside project images and
  TMX/PZW files.
