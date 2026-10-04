---
id: build-42-how-vehicle-paint-and-culling-work
slug: how-vehicle-paint-and-culling-work
title: 'How vehicle paint and back-face culling really work'
game: pz
version: build-42
section: vehicles
category: animation
difficulty: advanced
tags:
  - vehicles
  - shaders
  - textures
  - rendering
excerpt: >-
  A car's random paint lives in the skin's alpha channel, the norandom shader
  has no paint at all, a part model on a vehicle shader borrows its whole car's
  textures, and vehicles in the world are always back-face culled: cullFace
  in the model script is ignored there. Read from the 42.21 shaders and code.
last_updated: '2026-10-04'
---
# How vehicle paint and back-face culling really work

Outcast, if you make car skins, add panels to cars, or wonder why a model looks right in one place and wrong in another, this is how the game actually draws a car. We pieced it together while animating panels on over a hundred vanilla cars, and we got one part of it wrong in our own mod first. That mistake is on this page too.

## Random paint lives in the alpha channel

Most vanilla cars spawn in a random colour. The colour is not a separate texture. The body shader takes the skin's own pixel colour, swaps its hue for the car's paint hue, nudges its saturation and brightness by the paint's, and then mixes that over the original by **one minus the pixel's alpha**:

```glsl
vec3 fragHSV = rgb2hsv(col.rgb).xyz;
fragHSV.x = TexturePainColor.x;
fragHSV.y = clamp(fragHSV.y + TexturePainColor.y - 0.5, 0.0, 0.9999);
fragHSV.z = clamp(fragHSV.z + TexturePainColor.z - 0.5, 0.0, 0.9999);
col = mix(col, hsv2rgb(fragHSV), 1.0-tex.a);
```

So in a paintable skin:

- **alpha 0** means "fully painted": this pixel takes the car's colour;
- **alpha 1** means "keep the texture": chrome, rubber, glass, lights;
- the RGB under a painted area is a neutral base that the paint is built from, which is why vanilla skins look dark grey-green in an image editor.

The skin's alpha is **not** transparency. The shader writes its output alpha from the paint uniform, not from the texture, so a low-alpha pixel is never a hole in the car.

> **Proof:** Code. `media/shaders/vehicle_multiuv.frag`, the paint block (above) and `gl_FragColor = vec4(col, TexturePainColor.a)`. Build 42.21, Steam build 25485521.

## The "norandom" shader has no paint at all

Fixed-livery cars (police, ambulances, branded vans) use `vehicle_norandom_multiuv`. It is the same shader with the paint block removed: it never reads the paint hue. If you build a fixed livery on it but your skin has paintable (alpha 0) areas, those areas show their raw base colour, the dark green-grey, typically as a ring around windows. Either use the random-paint shader, or give a fixed livery full alpha everywhere it should keep its colour.

The vertex shaders of the two families are the same apart from the header, so switching between them changes only the colouring.

> **Proof:** Code. Compared `media/shaders/vehicle_multiuv.frag` with `vehicle_norandom_multiuv.frag` (no hue replacement, `paintColor` taken from the texture itself) and `vehicle_multiuv_static.vert` with `vehicle_norandom_multiuv_static.vert` (differences in blank lines and one commented position only). Build 42.21, Steam build 25485521.

## A part model on a vehicle shader borrows its car's textures

When a vehicle part model (a hood, a door panel, a gate) is drawn with a vehicle shader, the game hands it its **parent car's** texture set: the body skin, the mask, rust, lights, damage overlays and the paint colour. That is why a panel on a vehicle shader is painted the same colour as the car and rusts with it, and also why it ignores a texture of its own. A part model on any other shader gets only its own texture.

A shader counts as a "vehicle shader" when it has the rust texture uniform.

> **Proof:** Code. `zombie.core.skinnedmodel.model.Model#DrawVehicle`: when `effect.isVehicleShader()`, a `VehicleSubModelInstance` uses `inst.parent`'s `VehicleModelInstance` for `Texture0`, `TextureRust`, `TextureMask`, `TextureLights`, the damage textures and `setTexturePainColor(vmi.painColor, ...)`; otherwise only `setTexture(instTex, "Texture", 0)`. `zombie.core.skinnedmodel.shader.Shader#isVehicleShader` (`this.textureRust != -1`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Vehicles in the world are always back-face culled

Every vehicle model drawn in the world, body and part models alike, is drawn with back-face culling on. A single-sided pane is invisible from behind: look through a car's window from the other side and you see the ground, not the inside of the far pane.

**The model script's `cullFace` does not change this for vehicles in the world.** `cullFace = none` is honoured when the same model is drawn as an item, a world object, an animated character, or in a `UI3DScene` preview, but the in-world vehicle draw path sets culling itself and never reads it. The only script setting it reads is `invertX`, which flips which side is culled.

We got this wrong first. We read the culling code in the character draw path, saw it honour `cullFace`, and shipped `cullFace = none` on our panels to make them double-sided. In the world it does nothing. If a vehicle part must be seen from both sides, model both sides.

> **Proof:** Code. `zombie.core.skinnedmodel.model.Model#DrawVehicle` (`GL11.glEnable(2884); GL11.glCullFace(inst.modelScript != null && inst.modelScript.invertX ? 1029 : 1028);`, no other cull change), reached from `ModelInstanceRenderData#RenderVehicle`; `Model#DrawChar`, `IsoObjectModelDrawer`, `ItemModelRenderer` and `zombie.vehicles.UI3DScene` read `modelScript.cullFace`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Vehicle systems: masks and damage](/pz/build-42/vehicles/mod-studies/vehicle-systems-masks-and-damage)
- [What the engine requires to actually animate](/pz/build-42/vehicles/animation/what-the-engine-requires-to-actually-animate)
