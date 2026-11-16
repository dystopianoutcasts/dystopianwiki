---
id: build-42-fluid-container-calls-that-lie
slug: fluid-container-calls-that-lie
title: 'FluidContainer calls that do not do what their names say'
game: pz
version: build-42
section: modding
category: fluids
difficulty: intermediate
tags:
  - fluids
  - fluidcontainer
  - lua
  - silent-failure
excerpt: >-
  FluidContainer traps in 42.22: adjustSpecificFluidAmount cannot create a fluid, addFluid fails silently, tiny amounts are deleted, getAmount rounds up to full, and a transfer can lose a trace.
last_updated: '2026-11-16'
related_articles:
  - the-fluid-system
  - fluids-for-modders-start-here
  - fluids-in-multiplayer
  - defining-a-fluid-names-poison-properties
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders who move liquid in Lua](#1-adjustspecificfluidamount-cannot-create-a-fluid) | [modders who test fluid code outside the game](#8-your-test-double-must-fail-the-way-the-engine-fails)

Outcast, if your mod moves liquid around in Build 42, read this before you write the first line. The `FluidContainer` API looks simple: add, remove, set, transfer. Several of its calls behave differently from what their names promise, and none of them tells you. We know because one of them quietly destroyed the engine oil in every game that ran our car mod, Outcast Motors, for six weeks, while every test we had passed.

This page lists each trap, what the 42.22 code really does, who is fooled, and the safe way round. If you are new to fluids, start with [the fluid system](/pz/build-42/modding/fluids/the-fluid-system) and come back.

:::callout[The 1-minute version]{kind=key}
- `adjustSpecificFluidAmount` only changes a fluid that is already in the container. On a missing fluid, or on an empty container, it does nothing.
- `addFluid` does nothing, with no error, for an unknown fluid name, for an amount of zero or less, within about 1 mL of full, or when `canAddFluid` refuses.
- A fluid whose amount falls within 0.0001 liter of zero is deleted by every call except `addFluid`.
- `getAmount()` returns the capacity when less than 1 mL of room is left, and `isFull()` and `getFilledRatio()` follow it.
- `FluidContainer.Transfer` takes each share off the source whether or not the target took it, so a share that does not fit is lost; the loss is under 1 mL.
- A new container whose script lists starting fluids arrives filled, and a full container is heavier by one weight unit per liter.
:::

:::facts
- **Deleted below** 0.0001 liter, which is 0.1 mL :cite[(`FluidContainer.java:1014`)]
- **`getAmount` rounds up within** 0.001 liter, which is 1 mL :cite[(`FluidContainer.java:612-614`)]
- **`isFull` tolerance** 0.0001 liter :cite[(`FluidContainer.java:533-535`)]
- **Fluids in one container** at most 8 :cite[(`FluidContainer.java:907`)]
- **Weight of contents** 1 weight unit per liter :cite[(`InventoryItem.java:3426-3436`)]
:::

## 1. `adjustSpecificFluidAmount` cannot create a fluid

**The call changes the amount of a fluid that is already in the container, and does nothing at all otherwise.**

The name sounds like "set this fluid to this amount". The method returns without doing anything when the container is empty. Otherwise it walks the fluids already inside and sets the one that matches; if the fluid is not among them, nothing happens :cite[(`FluidContainer.java:721-735`)]. The new amount is clamped to the capacity first.

This is the one that bit us.

Outcast Motors aged fresh oil into used oil by lowering the fresh oil with `adjustSpecificFluidAmount` and raising the used oil the same way. The used oil was never in the pan, so the second call did nothing. The fresh oil went down, nothing came up, and oil vanished as the engine ran. The mod is the one fooled: the call returns normally, and it has no return value to check.

**The safe way:** use `addFluid` to put in a fluid that might not be there yet, and `adjustSpecificFluidAmount` only for a fluid you know is present. The base game uses exactly this pair when heat turns tainted water into clean water: `adjustSpecificFluidAmount` lowers the tainted water that is there, and `addFluid` adds the clean water that may not be :cite[(`InventoryItem.java:1479-1484`)].

## 2. `addFluid` can do nothing, and says nothing

**`addFluid` quietly does nothing in four cases, and none of them raises an error.**

`addFluid(String, float)` looks the name up with `Fluid.Get`; a name that is not registered gives nil, and the add is dropped :cite[(`Fluid.java:106-111`, `FluidContainer.java:920-934`)]. After that the add happens only when the amount is above zero, the container is not full, and `canAddFluid` accepts the fluid :cite[(`FluidContainer.java:936-956`)]. `canAddFluid` refuses when the container already holds eight other fluids, its input is locked, the player cannot empty it, a blend list forbids the mix, or the container's own whitelist or blacklist says no :cite[(`FluidContainer.java:906-916`)].

The call also trims the add to the room that is left, so a big add into a nearly full container lands only in part :cite[(`FluidContainer.java:939-941`)].

**The safe way:** call `canAddFluid` first when it matters, and compare `getSpecificFluidAmount` before and after to learn what landed.

## 3. Amounts under 0.1 mL are deleted

**After most calls, the container deletes any fluid whose amount is within 0.0001 liter of zero, and `addFluid` is the one that does not.**

The cleanup runs after `adjustSpecificFluidAmount`, `adjustAmount`, `removeFluid`, and on the source side of a transfer :cite[(`FluidContainer.java:705-735`, `:961-1011`, `:1163-1185`, `:1013-1021`)]. `addFluid` never calls it :cite[(`FluidContainer.java:936-956`)].

So if you grow a fluid by tiny absolute writes, the first write makes it, the next write sets it to a value that rounds to nothing, and it is gone. When you convert one fluid into another, convert a real amount the first time (we use 2 mL), then write absolute amounts from there. The mod is the one fooled.

## 4. `getAmount` rounds up to full within 1 mL

**When the room left in a container is under 0.001 liter, `getAmount()` returns the capacity, not the real total.**

The cache that backs `getAmount()` is set to the capacity whenever less than 0.001 liter of room is left :cite[(`FluidContainer.java:612-614`)]. `isFull()` compares that number to the capacity, so it reports full :cite[(`FluidContainer.java:533-535`)], and `getFilledRatio()` returns exactly 1.0 :cite[(`FluidContainer.java:546-554`)]. The fluid bar and the container panel read `getAmount()`, so the players see a container that is full while up to 1 mL is missing :cite[(`media/lua/client/Fluids/ISFluidBar.lua:26`, `media/lua/client/Fluids/ISFluidContainerPanel.lua:73`)].

That also makes `addFluid` refuse near the top: it checks `isFull()` first, so an add into a container with less than 1 mL of room does nothing. The item's weight uses `getAmount()` too :cite[(`InventoryItem.java:3434-3435`)].

**The safe way:** measure a single fluid with `getSpecificFluidAmount(fluid)`, which reads the real number, and never rely on an add landing in a nearly full container.

## 5. A transfer can lose what did not fit

**`FluidContainer.Transfer` takes each share off the source whether or not the target took it, so a trace that does not fit is lost.**

The call caps the amount at the target's free room, then moves the mixture share by share. For each fluid it calls the target's `addFluid`, then lowers the source by the same share, with no check that the add landed :cite[(`FluidContainer.java:1163-1185`)]. `CanTransfer` has already confirmed that the target accepts every fluid in the source, and that the total stays within eight fluids :cite[(`FluidContainer.java:1124-1153`)].

If the earlier shares bring the target to within 1 mL of full, the target counts as full (section 4), the remaining shares are refused, and the source loses them anyway. The loss is therefore the shares after the point where the room drops under 1 mL, so under 1 mL in total. It matters for a mixture with a small share, and for a mod that counts every milliliter. In multiplayer the vanilla pour action runs this call on the server, so it is the server's containers that lose the trace :cite[(`media/lua/shared/Fluids/ISFluidTransferAction.lua:70-78`)].

**The safe way:** do not transfer a mixture into the last milliliter of a container. Transfer slightly less than the free room, by a couple of milliliters.

## 6. A new container arrives already filled

**Any item whose script gives its `FluidContainer` a `Fluids` block is filled the moment the item is created.**

That covers crafted, spawned and mod-added items. `InitialPercentMin` and `InitialPercentMax` are fractions of the capacity (0 to 1), and the engine picks a random amount between them :cite[(`FluidContainerScript.java:74-85`, `:326-337`)]. If you list starting fluids and give no percentage at all, the container starts full :cite[(`FluidContainerScript.java:331-337`)]. With several starting fluids, each gets its share of that amount, or one is chosen at random when `PickRandomFluid` is true :cite[(`FluidContainer.java:94-124`)].

We met this as a crafted oil pan that arrived holding fresh oil. If a crafted container should start empty, empty it in the recipe's `OnCreate`, or give the item no starting fluids. In multiplayer an emptied fluid must also be sent to the client; see [fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer).

## 7. A full container is heavier: one weight unit per liter

**An item's weight is its own weight plus its contents, and for a fluid container the contents weigh one unit per liter.**

We once wrote in our own code that a fluid container "weighs the same full, half and bone dry". It does not :cite[(`InventoryItem.java:3426-3436`, `:3453-3455`)]. A full 5 L bottle in a bag weighs its own weight plus 5. When it is equipped or worn, the total is multiplied by the equipped-or-worn factor :cite[(`InventoryItem.java:3449-3451`)].

## 8. Your test double must fail the way the engine fails

**A fake `FluidContainer` that is kinder than the engine certifies the bug.**

All of the above survived six weeks because our test suite used a fake `FluidContainer`. Our fake created the fluid on `adjustSpecificFluidAmount`, because that is what the name suggested. The real engine does not (section 1). Every test passed, and the bug shipped.

If you test fluid code outside the game, make each fake method copy the engine method it stands for, including its refusals, and write the engine method's name next to it so the next person can check.

## Where to go next

- [Defining a fluid: names, Poison and Properties](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties)
- [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer)
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)

:::callout[How we know]{kind=proof}
Every code reference was opened in the 42.22 capture. The method behavior comes from reading the method bodies; nothing was run in a game.

**Checked again for 42.22, and different from 42.21:**
- A transfer caps the amount at the target's free room before it moves anything, so the loss is only the shares that arrive after the room drops under 1 mL, under 1 mL in total. It is not the whole remainder of the mixture.
- `addFluid` also does nothing for an unknown fluid name, which is a trap of its own.
- The `isFull` check uses a 0.0001 liter tolerance, and the 1 mL rounding comes from `getAmount()`.

**Not verified:** the Outcast Motors story (six weeks, the oil pan) is from our own project history and not from the game code. The weight of a container on the ground or in a vehicle was not traced.
:::
