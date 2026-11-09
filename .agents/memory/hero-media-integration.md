---
name: Hero media integration
description: Non-obvious image-to-video framing behavior and MAHSOUB integration constraints.
---

Inspect actual generated video frames, not only their dimensions. Image-to-video generation from square artwork can preserve that square composition inside a landscape file with baked-in black sidebars.

The homepage hero must use genuine visible drink-preparation motion. A still image with a Ken Burns or zoom effect is not an acceptable substitute; if no suitable clip is available, ask the user for footage instead of presenting a still as video.

**Why:** A generated 16:9 MAHSOUB clip had square artwork and black sidebars despite reporting the requested landscape dimensions.

**How to apply:** Before integrating replacement hero media, verify framing, motion, and the loop boundary visually. The user permits a matched-background technique when true alpha transparency is unavailable; avoid shipping visible sidebars or a boxed media frame.

**Why:** The user explicitly corrected a still-based loop and reiterated that the homepage hero must show actual moving beverage footage.

**How to apply:** Verify that the video frames visibly change during pouring or mixing on desktop and mobile before calling the hero complete.

The user has approved the current MAHSOUB hero video and requires the media itself to remain untouched. Any requested effects must be separate overlays, not edits to the video file.

**Why:** The user explicitly said the approved video must not be changed, replaced, regenerated, or modified.

**How to apply:** Treat the approved clip as immutable in future hero work; implement only explicitly requested effects outside the video asset.

The user rejected a separate animated numeric overlay on the scale; preserve the video’s original static reading and keep only the approved grams-ruler animation.

**Why:** The overlay looked artificial and misaligned; the user prefers the clean, natural video even without an increasing number.

**How to apply:** Do not add a digital-weight overlay unless the user explicitly reopens this direction.
