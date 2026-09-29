---
id: build-42-what-each-source-is-authoritative-for
slug: what-each-source-is-authoritative-for
title: · What each source is authoritative for
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: advanced
tags:
  - vehicles
  - outcast-motors
  - assessment
  - roadmap
excerpt: >-
  Worth stating explicitly, because we have been treating them as
  interchangeable and they are not.
last_updated: '2026-09-29'
related_articles:
  - the-inventory
  - strengths-what-we-genuinely-do-better
  - weaknesses-what-is-genuinely-wrong
  - what-we-missed-the-architectural-one
  - what-we-could-add-the-gap-revised
  - the-plan
  - the-one-line-version
---
# · What each source is authoritative for

> Source: 24-synthesis-and-assessment.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Worth stating explicitly, because we have been treating them as interchangeable
and they are not.

- **The decompile is authoritative for behaviour.** It is the only source that
  cannot be out of date or wrong about what the game does. Everything load-
  bearing should trace to it.
- **Project Summer Car is authoritative for design.** Nine thousand lines and
  113k subscribers of evidence about which mechanics *feel* like something. It is
  not authoritative for API correctness -- it is B41-shaped code carried forward,
  and its throttle is hardcoded to 0.2 because reflection closed under it.
- **The community mods are authoritative for integration.** They are the only
  source that has run on dedicated servers with real players. Every multiplayer
  truth we now hold came from them, and none of it is documented anywhere else.

We have been strong on the first, respectful of the second, and **entirely blind
to the third until this week**. That is the single biggest correctable gap.
