---
id: build-42-outcast-lib-api
slug: outcast-lib-api
title: Outcast Lib -- API reference
game: pz
version: build-42
section: outcast-mods
category: outcast-lib
difficulty: advanced
tags:
  - outcast-lib
  - api
  - ol-init
  - containers
excerpt: >-
  Shipping OutcastLib.VERSION = 2. v2 was spent on the 2026-08-05 removals
  below; OL_VehicleParts and its completion signal are additive and did not bump
  it.
last_updated: '2026-09-29'
related_articles:
  - implementation-status
  - ol-init
  - ol-containers
  - ol-reach
  - ol-squares
  - ol-compat
  - ol-options
  - ol-vehicleparts
  - ol-debug
  - log-file-location
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# Outcast Lib -- API reference

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Shipping `OutcastLib.VERSION = 2`.** v2 was spent on the 2026-08-05 removals
below; `OL_VehicleParts` and its completion signal are additive and did not bump it.

Build against this document. Where a signature is marked **[spike]** the
behaviour must be confirmed against the running game before the module is
considered done -- do not guess and do not silently pick one.

1. [Implementation status](/pz/build-42/outcast-mods/outcast-lib/implementation-status)
2. [OL_Init](/pz/build-42/outcast-mods/outcast-lib/ol-init)
3. [OL_Containers](/pz/build-42/outcast-mods/outcast-lib/ol-containers)
4. [OL_Reach](/pz/build-42/outcast-mods/outcast-lib/ol-reach)
5. [OL_Squares](/pz/build-42/outcast-mods/outcast-lib/ol-squares)
6. [OL_Compat](/pz/build-42/outcast-mods/outcast-lib/ol-compat)
7. [OL_Options](/pz/build-42/outcast-mods/outcast-lib/ol-options)
8. [OL_VehicleParts](/pz/build-42/outcast-mods/outcast-lib/ol-vehicleparts)
9. [OL_Debug](/pz/build-42/outcast-mods/outcast-lib/ol-debug)
10. [Where the log file goes](/pz/build-42/outcast-mods/outcast-lib/log-file-location)
11. [Where a log line has to go to be readable](/pz/build-42/outcast-mods/outcast-lib/log-line-visibility)
12. [Engine facts that bite the whole family](/pz/build-42/outcast-mods/outcast-lib/engine-facts-that-bite-the-whole-family)
13. [Open spikes, collected](/pz/build-42/outcast-mods/outcast-lib/open-spikes-collected)
