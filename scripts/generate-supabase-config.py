#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "supabase-config.js"
url = os.environ.get("SUPABASE_URL", "").strip()
key = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "").strip()

if not url.startswith("https://") or not key:
    raise SystemExit("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required to generate the public client config.")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(
    "window.MAHSOUB_SUPABASE_CONFIG = Object.freeze("
    + json.dumps({"url": url, "key": key})
    + ");\n",
    encoding="utf-8",
)
print(f"Generated public Supabase client config at {OUTPUT.relative_to(ROOT) if OUTPUT.is_relative_to(ROOT) else OUTPUT}")
