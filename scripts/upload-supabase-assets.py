#!/usr/bin/env python3
import mimetypes
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent.parent
ASSET_ROOT = ROOT / "attached_assets"
BASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
BUCKET = "mahsoub-assets"
ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".mp4", ".webm"}

if not BASE_URL.startswith("https://") or not SERVICE_KEY:
    raise SystemExit("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in Replit Secrets.")

assets = sorted(
    path for path in ASSET_ROOT.rglob("*")
    if path.is_file() and path.suffix.lower() in ALLOWED_SUFFIXES
)
if not assets:
    raise SystemExit("No image or video assets were found under attached_assets.")

for asset in assets:
    relative_path = asset.relative_to(ROOT).as_posix()
    content_type = mimetypes.guess_type(asset.name)[0] or "application/octet-stream"
    destination = f"{BASE_URL}/storage/v1/object/{BUCKET}/{quote(relative_path, safe='/')}"
    request = Request(
        destination,
        data=asset.read_bytes(),
        method="POST",
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": content_type,
            "Cache-Control": "public, max-age=31536000, immutable",
            "x-upsert": "true",
        },
    )
    try:
        with urlopen(request, timeout=90) as response:
            if response.status not in (200, 201):
                raise SystemExit(f"Upload failed for {relative_path}: HTTP {response.status}")
    except HTTPError as error:
        raise SystemExit(f"Upload failed for {relative_path}: HTTP {error.code}") from None
    except URLError as error:
        raise SystemExit(f"Upload failed for {relative_path}: {error.reason}") from None
    print(f"Uploaded {relative_path} ({asset.stat().st_size} bytes)")

print(f"Uploaded {len(assets)} image/video assets to Supabase Storage bucket '{BUCKET}'.")
