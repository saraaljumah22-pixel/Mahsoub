#!/usr/bin/env bash
set -euo pipefail

test -f index.html
test -f app.js
test -f styles.css
test -f attached_assets/IMG_1707_1793637320300.jpeg
node --check app.js
node scripts/check-instagram-links.js
