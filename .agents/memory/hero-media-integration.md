---
name: Hero media integration
description: Non-obvious image-to-video framing behavior and MAHSOUB integration constraints.
---

Inspect actual generated video frames, not only their dimensions. Image-to-video generation from square artwork can preserve that square composition inside a landscape file with baked-in black sidebars.

**Why:** A generated 16:9 MAHSOUB clip had square artwork and black sidebars despite reporting the requested landscape dimensions.

**How to apply:** Before integrating replacement hero media, verify framing, motion, and the loop boundary visually. The user permits a matched-background technique when true alpha transparency is unavailable; avoid shipping visible sidebars or a boxed media frame.
