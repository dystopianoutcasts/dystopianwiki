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
  adjustSpecificFluidAmount cannot create a fluid, addFluid does nothing within
  1 mL of full, tiny amounts are deleted, getAmount rounds up to full, and a
  transfer can destroy fluid. One of these destroyed the oil in every game of
  our car mod for six weeks. Here is each trap, read from the 42.21 code.
last_updated: '2026-10-04'
---
# FluidContainer calls that do not do what their names say

Outcast, if your mod moves liquid around in Build 42, read this before you write the first line. The `FluidContainer` API looks simple: add, remove, set, transfer. Five of its calls behave differently from what their names promise, and none of them tells you. We know because one of them quietly destroyed the engine oil in every game that ran our car mod, Outcast Motors, for six weeks. Every test we had passed the whole time.

This page lists each trap, what the code really does, and the safe way round it. If you are new to fluids, start with [the fluid system](/pz/build-42/modding/fluids/the-fluid-system) and come back.

## 1. `adjustSpecificFluidAmount` cannot create a fluid

The name sounds like "set this fluid to this amount". It is really "change the amount of a fluid that is already in the container". If the fluid is not there, nothing happens. If the container is empty, nothing happens at all.

```java
public void adjustSpecificFluidAmount(Fluid fluid, float newAmount) {
   if (!this.isEmpty()) {
      newAmount = PZMath.clamp(newAmount, 0.0F, this.getCapacity());
      for (int i = this.fluids.size() - 1; i >= 0; i--) {
         FluidInstance tempFluid = this.fluids.get(i);
         if (tempFluid.getFluid() == fluid) {
            tempFluid.setAmount(newAmount);
            this.removeFluidInstanceIfEmpty(tempFluid);
         }
      }
      this.cacheInvalidated = true;
   }
}
```

This is the one that bit us. Outcast Motors aged fresh oil into used oil by lowering the fresh oil with `adjustSpecificFluidAmount` and raising the used oil the same way. The used oil was never in the pan, so the second call did nothing. The fresh oil went down, nothing came up, and oil simply vanished as the engine ran.

**The safe way:** use `addFluid` to put a fluid in that might not be there yet, and `adjustSpecificFluidAmount` only for a fluid you know is present. The base game uses exactly this pair when heat turns tainted water into clean water: `adjustSpecificFluidAmount` lowers the tainted water that is there, `addFluid` adds the clean water that may not be.

> **Proof:** Code. `zombie.entity.components.fluids.FluidContainer#adjustSpecificFluidAmount`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## 2. Amounts under about 0.1 mL are deleted

After `adjustSpecificFluidAmount`, `adjustAmount`, `removeFluid`, and on the source side of a transfer, the container deletes any fluid whose amount is within 0.0001 litres of zero. `addFluid` never deletes.

So if you grow a fluid by tiny absolute writes, the first write makes it, the next write sets it to a value that rounds to nothing, and it is gone. When you convert one fluid into another, convert a real amount the first time (we use 2 mL), then write absolute amounts from there.

> **Proof:** Code. `FluidContainer#removeFluidInstanceIfEmpty` (tolerance `1.0E-4F`), called from `#adjustSpecificFluidAmount`, `#adjustAmount`, `#removeFluid` and `#Transfer`; `#addFluid` does not call it. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## 3. `getAmount` rounds up to full within 1 mL

When the room left in a container is under 0.001 litres, `getAmount()` returns the capacity, not the real total. `isFull()` and anything built on `getAmount()` inherit that rounding.

That makes `addFluid` refuse silently near the top: it checks `isFull()` first, so an add into a container with less than 1 mL of room does nothing. `addFluid` also does nothing when `canAddFluid` refuses: the input is locked, the container already holds eight fluids, a blend list forbids the mix, or a whitelist or blacklist on the container says no.

**The safe way:** measure a single fluid with `getSpecificFluidAmount(fluid)`, which reads the real number, and never rely on an add landing in a nearly full container.

> **Proof:** Code. `FluidContainer#recalculateCaches` (`if (this.getCapacity() - this.amountCache < 0.001F) this.amountCache = this.getCapacity();`), `#isFull`, `#addFluid`, `#canAddFluid`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## 4. A transfer can destroy the fluid it was moving

`FluidContainer.Transfer(source, target, amount)` moves a mixture share by share. For each fluid it calls the target's `addFluid`, then takes the same amount off the source whether or not the add landed. If the first share fills the target to within 1 mL, the target now counts as full (section 3), the remaining shares are refused, and the source loses them anyway.

**The safe way:** never transfer a mixture into the last millilitre of a container. Leave a couple of millilitres of room, or transfer slightly less than the free capacity.

> **Proof:** Code. `FluidContainer#Transfer(FluidContainer, FluidContainer, float, boolean)`: `target.addFluid(fluid, fluidTransfer)` followed by `fluid.setAmount(fluid.getAmount() - fluidTransfer)` with no check of the add. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## 5. A new container arrives already filled

Any item whose script gives its `FluidContainer` a `Fluids` block is filled the moment the item is created: crafted, spawned or added by a mod. `InitialPercentMin` and `InitialPercentMax` are fractions of the capacity (0 to 1), and the engine picks a random amount between them. If you list starting fluids and give no percentage at all, the container starts full.

We met this as a crafted oil pan that arrived holding 2.75 to 4.75 litres of fresh oil. If a crafted container should start empty, empty it in the recipe's `OnCreate`, or give the item no starting fluids.

> **Proof:** Code. `FluidContainer#readFromScript` and `#addInitialFluid`; `zombie.scripting.entity.components.fluids.FluidContainerScript#getInitialAmount` (returns the capacity when no percentage was set) and its load code, which clamps the percentages to 0-1 and multiplies by the capacity. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## 6. A full container is heavier: one weight unit per litre

We once wrote in our own code that a fluid container "weighs the same full, half and bone dry". It does not. An item's weight is its script weight plus its contents, and for a fluid container the contents are the amount in litres. A full 5 L bottle weighs its script `Weight` plus 5.

> **Proof:** Code. `zombie.inventory.InventoryItem#getContentsWeight` returns `getFluidContainer().getAmount()`, and `#getUnequippedWeight` adds it to the actual weight. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## 7. Your test double must fail the way the engine fails

All of the above survived six weeks because our test suite used a fake `FluidContainer`. Our fake created the fluid on `adjustSpecificFluidAmount`, because that is what the name suggested. The real engine does not. Every test passed, and the bug shipped.

If you test fluid code outside the game, make each fake method copy the engine method it stands for, including its refusals, and write the engine method's name next to it so the next person can check. A fake that is kinder than the engine certifies the bug.

> **Proof:** Code. Our fake's `adjustSpecificFluidAmount` added a missing fluid; `FluidContainer#adjustSpecificFluidAmount` does not (section 1). The fix was to make the first write an `addFluid`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Defining a fluid: names, Poison and Properties](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties)
- [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer)
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)
