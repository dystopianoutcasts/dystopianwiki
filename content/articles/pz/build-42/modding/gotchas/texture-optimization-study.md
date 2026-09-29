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
  Study of Workshop 3119788162 (ETO_B / ETO_P, author maceleet, modversion
  1.2.1, versionMin 42.20.0) against a B42 install, 2026-08-10.
last_updated: '2026-09-29'
---
# Every Texture Optimized -- what it actually does, measured

> Source: ETO_texture_optimization_study.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Study of Workshop `3119788162` (`ETO_B` / `ETO_P`, author *maceleet*,
modversion 1.2.1, versionMin 42.20.0) against a B42 install, 2026-08-10.

Everything below was measured by reading PNG chunks directly -- IHDR, PLTE,
tRNS, and where needed the decompressed IDAT -- for all 6,140 overridden
textures and their vanilla counterparts. No assumptions from the mod page.

---

## 1. The headline, and it is not what the name suggests

**It does not downscale anything.** Every one of the 6,140 textures keeps
vanilla's exact width and height. 100% of the pixels are retained, in both
variants.

The optimisation is entirely in the **encoding**:

| | vanilla | ETO_B (Balanced) | ETO_P (Max Performance) |
|---|---|---|---|
| RGB 8-bit | 2,945 files | 190 | 190 |
| RGBA 8-bit | 1,460 | 190 | 190 |
| indexed 8-bit | 1,472 | 1,342 | 712 |
| indexed 4-bit | 21 | **3,272** | **3,679** |
| indexed 2-bit | 7 | 691 | 805 |
| indexed 1-bit | 4 | 435 | 544 |
| **total bytes** | **566.4 MB** | **142.0 MB (25%)** | **125.8 MB (22%)** |

So: truecolour RGB/RGBA is converted to **indexed (palette) PNG**, and the
index is packed into as few bits as the palette allows.

Palette sizes: ETO_B median **9** colours, p90 27. ETO_P median **8**, p90 18.

**The only difference between the two variants is palette size.** 4,505 of 6,140
files differ, and in every sample the difference is the palette count alone --
`legend2.png` 15 -> 12, `juicebox.png` 33 -> 26, `bulletround.png` 16 -> 13.
Same dimensions, same colour type. The entire quality/performance dial is
"how many colours", nothing else.

## 2. Why this is the right trade for Project Zomboid specifically

The instinct with a performance texture pack is to halve the resolution. ETO
does the opposite, and for this game that is the better call.

PZ renders world items and vehicle parts from a fixed isometric camera at a few
dozen pixels. At that size **the silhouette and the value contrast carry the
read** -- which is exactly what resolution protects and colour depth does not.
A 128x128 sprite quantised to 9 colours still has every edge it started with. The
same sprite at 64x64 has lost half its edges permanently.

Put bluntly: downscaling destroys the thing that survives at 40 px, and
quantising destroys the thing that does not.

## 3. What happens to masks -- the part worth stealing

PZ has textures the engine samples **by colour**: vehicle skin masks, and the
`IconColorMask` / `IconFluidMask` images named in item scripts. Quantising one of
those is not a quality loss, it is a correctness bug -- a region whose colour
shifts by one step matches nothing and stops being paintable.

**ETO gets this right.** Decoding the actual pixels and comparing colour sets:

- **23 of 25 functional masks are colour-identical to vanilla.** Every
  `vehicle_*_mask.png` -- carnormal, luxurycar, sportscar, suv, taxi, offroad,
  pickuptruck, stepvan, van, vanambulance, vanradio, vanseats, racecar,
  smallcar, smallcar02, carmodern, carmodern2, carmodernlights,
  carstationwagon, adverttrailer, utilitytrailer -- same dimensions, same exact
  colour set.
- The two that changed are `NBC_Mask.png`, which is a **clothing item** (the NBC
  suit's gas mask), not an engine mask. 649 colours -> 12. Correctly treated as art.

And where a mask *was* re-encoded, it was re-encoded **losslessly**:

```
vehicle_mask.png     512x512  indexed 8-bit  ->  indexed 1-bit   (1 colour used)
mask.png             indexed 8-bit pal8      ->  indexed 4-bit pal8
```

One colour needs one bit, not eight. Eight colours need four bits, not eight.
Same pixels, same palette, a fraction of the size, zero risk.

**The rule this gives us:** never quantise a functional mask -- but always
re-pack one. Masks are by construction low-colour images, so vanilla storing
them at 8-bit indexed is wasting most of every byte.

## 4. What we can apply

Our own textures, measured the same way
(`PZ_3D_Assets/textures/OutcastMotors/`, 19 files, 128x128 RGB 8-bit, 170 KB):

```
distinct colours: min 42   median 212   max 521 (Sparkplug)
```

Against ETO's median of 9. Nothing here is large enough for the bytes to matter
on their own, but three things transfer:

1. **If we ever need our textures smaller, quantise -- do not downscale.** 128
   is already the top of vanilla's world-item range and the thing keeping our
   parts readable at 30-60 px.
2. **Re-pack rather than resize.** Most of our 19 sit well under 256 colours, so
   indexed 8-bit is free; several (FanBelt 42, BrakeBooster 52, Flywheel 54)
   would fit a 4-bit palette losslessly or near enough.
3. **Any mask we ever author is off-limits to quantisation.** Worth writing into
   the texture brief now rather than discovering it later, because the failure
   is silent -- a region simply stops being paintable and nothing logs.

## 5. What NOT to copy

- **This is a technique, not an asset source.** ETO's PNGs are re-encodes of
  TIS's textures. Same line as always: study the method, ship nothing of theirs.
- **Do not assume indexed PNG is universally safe.** It evidently works for the
  classes ETO converts, but we have not verified the engine's loader against
  every path (UI atlases, shaders sampling with filtering, anything read back at
  runtime). Convert a class, look at it, then convert the rest.
- **Whole-set conversion hides regressions.** ETO ships 6,140 files at once; we
  should not. Per-class, with a before/after look at 64 px.

## 6. The tool -- `pngrepack.py`

The study's one free technique, packaged. Re-encodes any PNG of 256 colours or
fewer as an indexed PNG at the smallest legal bit depth. Nothing is quantised,
nothing is resized, no colour value ever changes.

```
python pngrepack.py <folder>                     dry run, report only
python pngrepack.py <folder> --write             rewrite in place
python pngrepack.py <folder> --scripts <dir>     harvest mask names from scripts
python pngrepack.py <folder> --csv out.csv       per-file report
```

Dry run is the default; `--write` is required to touch anything. Pure Python +
numpy, no Blender and no Pillow.

**Lossless is verified, not asserted.** Every candidate is decoded, re-encoded,
then decoded *again* and compared byte-for-byte in RGBA space. A file that does
not round-trip exactly is rejected and left alone. A file that would not shrink
by at least `--min-gain` (default 1%) is also left alone, so already-optimal
files are never churned.

**Mask guards**, both on by default:

1. any basename containing `mask`
2. `--scripts <media/scripts>`: every value of every `*mask*` key found in the
   game's scripts -- which turns out to be `IconColorMask`, `IconFluidMask`,
   `textureMask`, `primaryAnimMask`, `secondaryAnimMask`

Guard 2 is data-driven rather than a guessed key list, because guessing which
key names a functional mask is exactly how you miss one. Measured honestly: on
vanilla it currently catches nothing guard 1 does not -- all 18 harvested names
lacking "mask" belong to `primaryAnimMask`/`secondaryAnimMask`, which name
animation states, not files. Its value is on *mod* folders, where nobody
guarantees a mask is called one.

`--allow-masks` exists and is genuinely safe for this tool, since a verified
lossless re-pack cannot move a colour. It is off by default because the failure
mode, if the verification were ever wrong, is silent.

### What it is verified against

`_src/test_pngrepack.py` checks every claim against **Pillow**, an independent
decoder that the tool does not depend on. Self-consistency would prove nothing:
a decoder bug mirrored by an encoder bug passes an internal round-trip and still
corrupts the pixels.

- **A** -- decode agreement on 48 real vanilla files spanning every colour type
  and bit depth present in `media` (grey8, RGB8, RGBA8, greyA8, indexed
  1/2/4/8): 48/48 identical to Pillow
- **B** -- Pillow re-reads our output with identical pixels: 44/44
- **C** -- synthetic edges: 1 colour, 2, 4, 16, exactly 256, mixed alpha,
  1xN and Nx1 strips (sub-byte row padding), 257 colours and noise both refused
- **D** -- the guards refuse what they should and `--allow-masks` opts out
- end-to-end `--write` on a disposable copy: 40/40 pixel-identical afterwards,
  17 shrunk, 0 grew

That suite caught a real bug that the tool's own internal check could not:
`uint8_array << 16` evaluates to **0** under numpy's NEP 50 promotion rules, so
casting only the first term of the colour key silently merged every colour
differing solely in green or blue. Self-consistent, and wrong.

### What it is worth running on -- measured, not assumed

| folder | files | re-packed | saving |
|---|---|---|---|
| `PZ_3D_Assets/textures/OutcastMotors` | 40 | 17 | 8% (0.02 MB) |
| vanilla `media/textures/Vehicles` | 399 | 16 | ~0% (24 masks refused) |
| vanilla `media/textures` (all of it) | 6,140 | 628 | **0.02%** (0.11 MB of 565 MB) |

**This is the honest headline: lossless re-packing recovers essentially nothing
at whole-game scale.** Over the full 6,140-file corpus -- the same set ETO
ships -- it saves 0.11 MB out of 565 MB. The reasons are in the dry run:

```
skip: >256 colours   4195     cannot be touched without quantising
keep (<1% gain)      1195     already optimally encoded
skip: mask-name       121     refused on principle
skip: 16-bit            1     refused rather than approximated
repack                628
```

So ETO's 75% reduction is *lossy*, essentially in full. It comes from cutting
colour counts to a median of 9, not from the free re-pack. Anyone reaching for
this tool expecting ETO-scale numbers will be disappointed, and should be.

What the 628 hits do show is **which profile pays**, and it is not vehicles:

| folder | files | saved |
|---|---|---|
| `worldMap` | 46 | 54% |
| `weapons` | 14 | 31% |
| `weather` | 3 | 29% |
| `Clothes` | 321 | 27% |
| `Body` | 14 | 22% |
| `WorldItems` | 80 | 21% |

Individual hits are large -- `Floss.png` -87%, `WaterDish.png` -85%,
`circle_only_highlight.png` indexed8 -> indexed1 at -72%, `M16_Rifle.png` -32%.
They are simply all small files. Flat-shaded item icons and UI art are the
profile that pays, which is exactly our own: `OMO_Placeholder.png` drops 76% and
the six Outcast Motors item icons 36-46%.

**Practical read for us:** run it on our icon and world-item output where it is
free and occasionally large, and do not bother pointing it at vehicle skins.

## 7. Method

`_dev/B42_Textures/_src/` has the three scripts:

- `eto.py` -- dimension and colour-type comparison by category, all 6,140 files
- `eto2.py` -- encoding histogram, palette sizes, total bytes, variant diff
- `eto3.py` -- a minimal PNG decoder (unfilter + palette expansion) used to
  compare the **actual colour sets** of vanilla and ETO masks, which is the only
  way to tell a lossless re-pack from a quantisation
- `test_pngrepack.py` -- the verification suite for section 6's tool; needs
  Pillow, which the tool itself does not

All pure Python, no Blender dependency beyond it being a convenient interpreter.
