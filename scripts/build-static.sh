#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist"

rm -rf "$OUT"
mkdir -p "$OUT/attached_assets/generated_images"
mkdir -p "$OUT/attached_assets/generated_videos"

cp "$ROOT/index.html" "$ROOT/styles.css" "$ROOT/app.js" "$OUT/"
cp "$ROOT/attached_assets/IMG_1707_1793637320300.jpeg" "$OUT/attached_assets/"
cp -R "$ROOT/attached_assets/generated_images/." "$OUT/attached_assets/generated_images/"
cp "$ROOT/attached_assets/generated_videos/mahsoub-hero-cinematic.mp4" "$OUT/attached_assets/generated_videos/"

node --check "$OUT/app.js"
