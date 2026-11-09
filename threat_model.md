# Threat Model

## Project Overview

MAHSOUB is a bilingual (English/Arabic) marketing and menu website for a drinks
brand. It is a **purely static site**: plain `index.html`, `styles.css`, and a
vanilla-JS `app.js`, built by `scripts/build-static.sh` into `dist/` and deployed
with `deploymentTarget = "static"` (`publicDir = "dist"`). There is no backend,
no database, no authentication, and no server-side code running in production.
All "ordering" is a local-only mockup: the cart lives in `localStorage` and
checkout only renders a confirmation in the page — no order is sent and no
payment is processed.

## Assets

- **Brand/marketing content** — menu catalog, imagery, copy. Public by design.
- **Visitor-local state** — cart, language, and theme stored in the visitor's own
  `localStorage`. Scoped to the single browser; not shared across users.
- **Public contact info** — a business contact email and an Instagram handle,
  intentionally published on the site. Not secrets.

There are no user credentials, sessions, server secrets, or multi-tenant data.

## Trust Boundaries

- **Browser to static host** — the only boundary. The host serves immutable
  static files. There is no application server to authenticate or authorize
  against, so classic access-control, injection, and SSRF classes do not apply
  in production.
- **Dev/CI vs production** — `scripts/*.js` (ordering/catalog/Instagram link
  checks) and `playwright` run only during development/CI and are **not** copied
  into `dist/`. Code and log output in these scripts is not production-reachable.

## Scan Anchors

- Production entry points: `dist/index.html`, `dist/app.js`, `dist/styles.css`
  (built from the repo-root `index.html`, `app.js`, `styles.css`).
- Dynamic rendering: `app.js` builds DOM via template strings assigned to
  `innerHTML`. All interpolated dynamic values are passed through `escapeHTML()`
  (defined at `app.js:26`); product data is a hardcoded in-file catalog.
- User input: contact form (`app.js:323-349`) — validated client-side and
  `encodeURIComponent`-encoded into a `mailto:` link only.
- Client storage: `localStorage` keys `mahsoub-cart`, `mahsoub-language`,
  `mahsoub-theme` — self-scoped per browser.
- Dev-only, ignore unless proven production-reachable: `scripts/`,
  `artifacts/mockup-sandbox/` (design mockup preview).

## Threat Categories

### Tampering / Information Disclosure

Because the app is static with no server trust boundary, there is no server-side
state an attacker can tamper with and no private data to disclose. All content is
public. `localStorage` tampering only affects the attacker's own browser.

### Elevation of Privilege

Not applicable: there are no roles, authentication, or privileged actions. The
checkout flow is a local mockup that performs no real transaction.

### Cross-Site Scripting (reviewed, no finding)

`app.js` renders via `innerHTML`, which is the main XSS surface for a static JS
site. Dynamic/interpolated values are escaped with `escapeHTML()`, and the only
free-text user input (contact form) is encoded before use in a `mailto:` URL.
Static translation strings (`data-en`/`data-ar`) are author-controlled. No
production XSS path was identified.

### Required Guarantees

- Any future dynamic value rendered into the DOM MUST continue to pass through
  `escapeHTML()` or use `textContent`.
- The project MUST remain backend-free (static deployment); introducing any
  server endpoint, auth, or data store would require re-threat-modeling.
- Build scripts and test harnesses MUST NOT be included in `dist/`.
