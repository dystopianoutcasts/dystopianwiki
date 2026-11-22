---
id: build-42-texture-optimization-study
slug: texture-optimization-study
title: 'Every Texture Optimized -- what it actually does, measured'
game: pz
version: build-42
section: modding
category: gotchas
difficulty: intermediate
tags:
  - textures
  - mod-study
  - optimization
excerpt: >-
  A texture pack shrinks PNG files without shrinking pictures. What it measurably does, what the 42.22 PNG loader accepts, why quantizing masks is a risk we did not rule out, and what we took from it.
last_updated: '2026-11-21'
related_articles:
  - script-comments-what-slashes-do
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21. The file measurements on the Workshop mod "Every Texture Optimized" are dated 2026-08-10 (a 42.20 install, imported 2026-09-29) and were not rechecked.

**Who this page is for:** modders who ship textures or want smaller ones. The engine facts are in [part 2](#2-what-the-game-does-with-a-png) and [part 3](#3-what-happens-to-masks), and the measurements of the other mod are in [part 1](#1-the-headline-and-it-is-not-what-the-name-suggests).

:::callout[The 1-minute version]{kind=key}
- The Workshop mod "Every Texture Optimized" keeps every texture's width and height. We measured that it re-encodes truecolor PNGs as indexed (palette) PNGs, packed to as few bits as the palette allows. That took the set from 566.4 MB to 142.0 MB (Balanced) or 125.8 MB (Max Performance).
- The engine's PNG decoder reads indexed PNGs of 1, 2, 4 and 8 bits, and both texture load paths turn the picture into 4-byte-per-pixel RGBA before upload. A smaller PNG file therefore saves disk and read size; we did not find a memory saving.
- Be careful about quantizing (cutting the colors of) a mask. A vehicle mask is loaded without the compress flag the skin, damage, rust, lights and shadow textures get when compression is enabled, and the shaders that read masks are not in the capture. Whether quantizing breaks a mask is not verified and was not tested.
- If you must shrink a texture, cut colors instead of pixels, and leave masks alone. A lossless re-pack of a mask keeps its exact colors.
- Test one class of texture at a time, with a before-and-after look at small size.
:::

:::facts
- **Textures the mod overrides** 6,140, all at vanilla width and height (measured 2026-08-10, not rechecked)
- **Size of the set** 566.4 MB vanilla, 142.0 MB (25%) Balanced, 125.8 MB (22%) Max Performance (measured, not rechecked)
- **Indexed bit depths the 42.22 loader reads** 1, 2, 4 and 8 :cite[(`zombie/core/textures/PNGDecoder.java:832-845`)]
- **Decoded size** 4 bytes per pixel, width and height rounded up to a power of two; the upload may be mipmapped or GPU-compressed :cite[(`zombie/core/textures/ImageData.java:147-148`, `zombie/core/textures/TextureID.java:437-438`, `zombie/core/textures/TextureID.java:463-482`)]
:::

## 1. The headline, and it is not what the name suggests

**The mod does not shrink any picture; it re-encodes the same pixels with a palette.**

Every one of the 6,140 textures keeps vanilla's exact width and height, so 100% of the pixels are kept, in both variants. We measured this by reading the PNG chunks (the header, the palette, the transparency chunk and, where needed, the decompressed pixel data) of every overridden texture and its vanilla counterpart. The mod's own page was not used.

Truecolor RGB and RGBA files become indexed PNGs, and the index is packed into as few bits as the palette allows.

| | vanilla | Balanced | Max Performance |
|---|---|---|---|
| RGB 8-bit | 2,945 files | 190 | 190 |
| RGBA 8-bit | 1,460 | 190 | 190 |
| indexed 8-bit | 1,472 | 1,342 | 712 |
| indexed 4-bit | 21 | **3,272** | **3,679** |
| indexed 2-bit | 7 | 691 | 805 |
| indexed 1-bit | 4 | 435 | 544 |
| **total bytes** | **566.4 MB** | **142.0 MB (25%)** | **125.8 MB (22%)** |

The median palette is 9 colors in Balanced and 8 in Max Performance, and the 90th-percentile palette is 27 and 18.

The only difference between the two variants is palette size. 4,505 of the 6,140 files differ, and in every sample we looked at the difference is the palette count alone: one file went from 15 colors to 12, another from 33 to 26, another from 16 to 13. Same dimensions, same color type.

## 2. What the game does with a PNG

**A texture takes one of two load paths, and both end as 32-bit RGBA, so the PNG encoding changes the file and not the decoded picture.**

Textures loaded through the asset manager are read by the engine's own PNG decoder. :cite[(`zombie/core/textures/TextureIDAssetManager.java:37`, `zombie/asset/FileTask_LoadImageData.java:53`, `zombie/core/textures/ImageData.java:144-176`)]

A texture opened by file path (`ImageData(String)`) goes through the stb image library instead, and that path is used by some texture constructors. :cite[(`zombie/core/textures/ImageData.java:70`, `zombie/core/textures/Texture.java:656`, `zombie/core/textures/TextureID.java:192`, `zombie/core/textures/TextureID.java:206`)]

The rejections below hold for the PNG decoder path only; stb applies its own rules, which we did not check. The PNG decoder accepts indexed color at 1, 2, 4 and 8 bits, and gray, RGB, gray-with-alpha and RGBA only at 8 bits. A 16-bit file, an interlaced file or any other color type throws an error. :cite[(`zombie/core/textures/PNGDecoder.java:805-868`)] A palette must hold 1 to 256 entries, and an indexed file with no palette is refused. :cite[(`zombie/core/textures/PNGDecoder.java:75-77`, `zombie/core/textures/PNGDecoder.java:871-879`)]

For an indexed file the decoder reads the transparency chunk as one alpha value per palette entry, and an entry with no value is fully opaque. :cite[(`zombie/core/textures/PNGDecoder.java:881-899`, `zombie/core/textures/PNGDecoder.java:581-605`)] A re-pack that drops that chunk would therefore turn transparent entries opaque.

Both paths write RGBA into a buffer whose width and height are rounded up to a power of two. :cite[(`zombie/core/textures/ImageData.java:75-79`, `zombie/core/textures/ImageData.java:147-148`, `zombie/core/textures/ImageData.java:175`)] For an upload without mipmaps the engine counts four bytes per pixel of that rounded size. :cite[(`zombie/core/textures/TextureID.java:481`)] A mipmapped upload sends each mip level instead. :cite[(`zombie/core/textures/TextureID.java:463-476`)]

With the compression option enabled (the default) and a card that supports it, a texture loaded with the compress flag is also stored by the graphics card in a compressed format. :cite[(`zombie/core/textures/TextureID.java:44`, `zombie/core/textures/TextureID.java:425-438`)] The RGBA buffer is the same whatever bit depth the PNG file had, so a 1-bit file and an 8-bit file of the same picture decode to the same buffer.

So the mod's saving is real for disk space, download size and the time to read the file, as measured in part 1. We did not find a saving in the decoded size, and we did not measure load time or graphics memory.

## 3. What happens to masks

**A mask may be read by a shader for its colors, so a lossy re-encode is a risk we did not rule out, and a lossless re-pack keeps every color.**

Quantizing a mask moves its colors. If a shader tells regions apart by color, that could leave a region matching nothing. This is a caution and is not verified: we did not test it in game, and the 42.22 capture does not contain the shader files, so how a shader reads a mask is not checked here.

What the engine code does show is how a vehicle mask is loaded. A skin's mask is loaded with only the size-limit flag, while the skin, damage, rust, lights and shadow textures also get the compress flag when compression is enabled. :cite[(`zombie/vehicles/BaseVehicle.java:608-614`, `zombie/vehicles/BaseVehicle.java:625-634`)] The mask is passed to the vehicle shader as its own input. :cite[(`zombie/core/skinnedmodel/shader/Shader.java:157`, `zombie/core/skinnedmodel/shader/Shader.java:191-192`)]

The item masks named in item scripts (`IconColorMask` and `IconFluidMask`) work differently, and we corrected the old version of this page here. The engine loads each as an inventory icon texture. :cite[(`zombie/scripting/objects/Item.java:1905-1911`, `zombie/inventory/InventoryItem.java:4354-4365`)] In an item icon, the base icon is drawn in white and the mask picture is then drawn over it, tinted with the item's color, or with the fluid's color for the fluid mask. :cite[(`zombie/ui/UIElement.java:561-566`, `zombie/ui/UIElement.java:573-579`, `zombie/ui/UIElement.java:583-585`)] We searched for Java code that compares the pixel colors of these icon masks and found none, so quantizing one would change the tint a little, not make a region stop matching.

The masks used on 3D item models are a different path. The model renderer hands its tint, blood and fluid masks to the texture combiner, and the combiner passes each to a shader as a `MASK` input. :cite[(`zombie/core/skinnedmodel/model/ItemModelRenderer.java:789-804`, `zombie/core/textures/TextureCombiner.java:240-241`)] Hole, blood and tint masks for clothing and characters take the same route. :cite[(`zombie/core/textures/SmartTexture.java:65-115`)] Those shaders are not in the capture, so how they read the mask colors is not verified.

How the mod treats masks, measured on the mod's files:

- **23 of 25 functional masks are color-identical to vanilla.** That includes every `vehicle_*_mask.png` we checked, with the same dimensions and the exact same color set.
- The two that changed are `NBC_Mask.png`, a clothing item (the gas mask of the NBC suit), not an engine mask. It went from 649 colors to 12, and is correctly treated as art.

Where a mask was re-encoded, it was re-encoded losslessly:

```
vehicle_mask.png     512x512  indexed 8-bit  ->  indexed 1-bit   (1 color used)
mask.png             indexed 8-bit pal8      ->  indexed 4-bit pal8
```

One color needs one bit, not eight. Eight colors need four bits, not eight. Same pixels, same palette, smaller file. The decoder turns a palette into exact RGBA values, so a file with the same palette and the same indexes gives the same picture however many bits hold the index. :cite[(`zombie/core/textures/PNGDecoder.java:581-605`, `zombie/core/textures/PNGDecoder.java:657-700`)]

**The caution this gives us:** do not quantize a mask (not verified to break, not tested), and note that a lossless re-pack of one keeps every color, because masks are low-color images and vanilla stores many of them at 8-bit indexed.

## 4. Why cut colors and not pixels

**This is our judgment about the camera, not something we tested: the outline and the light-to-dark contrast of a small sprite carry the read.**

The instinct with a performance texture pack is to halve the resolution. This mod does the opposite. The game draws world items and vehicle parts from a fixed isometric camera at a small size, so the silhouette and the value contrast carry the read, and those are what resolution protects and color depth does not. A 128x128 sprite cut to 9 colors keeps every edge it started with, and the same sprite at 64x64 has lost half its edges for good.

Given what part 2 shows, color cuts save disk and download size only. If memory is the goal, the pixel count is the lever, and we have not tested what that costs.

## 5. What we can apply

**Our own textures are small enough that nothing here is urgent, but three rules transfer.**

We measured our own textures the same way: 19 files of 128x128 RGB 8-bit, 170 KB in all, with between 42 and 521 distinct colors and a median of 212. The mod's median palette is 9.

1. **If we ever need our textures smaller, quantize and do not downscale,** on art that is not a mask.
2. **Re-pack rather than resize.** Most of our 19 sit well under 256 colors, so indexed 8-bit is free, and a few (42, 52 and 54 colors) would fit a 4-bit palette or nearly so.
3. **Treat any mask we author as off-limits to quantizing until someone tests it.** Put it in the texture brief now as a caution. We have not verified what quantizing would do to a mask, or whether the game would log it.

## 6. What not to copy

**It is a technique and not an asset source, and converting a whole set at once hides mistakes.**

- **Study the method, ship nothing of theirs.** The mod's PNGs are re-encodes of the game's own textures.
- **Do not assume indexed PNG is safe everywhere.** The loader above reads it for textures loaded through the engine's PNG decoder, but other code reads some images through a different library, for example the native image helper. :cite[(`zombie/core/utils/NativeImage.java:54`)] We have not checked every path (user interface atlases, shaders that sample with filtering, anything read back at run time). Convert one class, look at it, then convert the rest.
- **Convert per class, not all at once.** The mod ships 6,140 files at once. We should not, and should look at each class at small size before and after.

## 7. Our tool, `pngrepack.py`

**It is our own small script that re-encodes a PNG of 256 colors or fewer as an indexed PNG at the smallest legal bit depth, without changing any color.**

It quantizes nothing and resizes nothing, and it only runs when told to write: a dry run is the default. Every candidate is decoded, re-encoded, decoded again and compared byte for byte in RGBA. A file that does not round-trip, or would shrink by less than 1%, is left alone.

It refuses any file whose name contains `mask`, and it can also read mask names from the game's scripts: the values of the `IconColorMask`, `IconFluidMask`, `textureMask`, `primaryAnimMask` and `secondaryAnimMask` keys. On vanilla that adds nothing beyond the name guard, because the last two name animation states, not files. This is our own tool and our own measurement, and neither was rechecked for 42.22.

Our own measurement showed that this lossless re-pack recovers almost nothing at whole-game scale: 0.11 MB of 565 MB over 6,140 vanilla textures, with 4,195 files over 256 colors that it cannot touch. The set re-packs best on flat-shaded icons and interface art. So the mod's 75% saving is lossy, and comes from cutting colors, not from a free re-pack.

:::callout[How we know]{kind=proof}
The loader, the memory and compression facts, the vehicle-mask load path and the item-mask drawing were read from the 42.22 engine source, and we opened each line cited. A vanilla file list for 42.22 shows 6,152 PNG files under `media/textures`, so the vanilla counts in part 1 were not recounted at 42.22.

Measured 2026-08-10 on the Workshop mod's published files and a 42.20 install, and not rechecked: every file count, size, palette and mask result in parts 1, 3 and 5, and everything about our tool in part 7. Not tested: whether quantizing a vehicle mask breaks painting, how the vehicle shader reads the mask (the shader files are not in the 42.22 capture), load time, and the isometric-camera reasoning in part 4. Dropped from the old page: the claim that 128 is the top of vanilla's world-item size range, for which we found no line.
:::
