---
name: Mockup sandbox startup
description: Startup and port quirks for this project's isolated mockup preview.
---

The mockup sandbox can be created without its package-local dependencies installed, causing its first server start to fail with `vite: not found`. Local production builds also require the artifact's `PORT` and `BASE_PATH` environment values. A restart collision may leave an earlier server process holding the preview port.

**Why:** This workspace's generated mockup artifact did not start cleanly until its dependencies were installed locally and stale listeners were cleared.

**How to apply:** After creating or updating the sandbox, check the package directory's dependencies before starting it. If a restart reports `EADDRINUSE`, verify the listener and HTTP response before retrying; include the artifact port and base path when running a one-off build.
