---
name: MAHSOUB Supabase scope
description: User-approved persistence scope for the MAHSOUB website.
---

Use Supabase for the MAHSOUB product catalog, site asset metadata/media, user accounts, and saved orders. User accounts and saved orders were explicitly selected by the user. Saved orders are records only; do not add payment processing or claim an order is paid or fulfilled.

**Why:** The user chose account and order storage when asked how to handle user data; the current website had no existing accounts or server-side orders.

**How to apply:** Keep catalog facts centralized in Supabase, use Supabase Auth for new accounts, and write orders through an authenticated server-validated database function with per-user read access.
