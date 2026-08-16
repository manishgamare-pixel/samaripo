# Design: "Samar" — Scripted Chat Assistant for Samar's IPO Market

Date: 2026-08-16

## Goal

Add a scripted (no-API-key) chat assistant to the Samar's IPO Market static site so
visitors can ask questions about tracked IPOs, get recommendations, learn terminology
and safety guidance, and trigger report actions (WhatsApp / email / report links).

## Approach

Pure client-side JavaScript. No backend, no third-party services, no data duplication.
All answers are generated from the already-fetched `data/ipos.json` dataset plus
built-in knowledge strings.

## Architecture

- `js/assistant.js` — new module, loaded after `main.js`. Owns the widget, the intent
  engine, and rendering.
- `css/styles.css` — chat widget styles (existing design tokens: green accent, card
  backgrounds, muted text, radius, shadow).
- `index.html` — a single container element for the widget plus the script tag.
- `js/main.js` — expose `window.IPOSite` with shared helpers (`data`, `fmtInr`,
  `buildReportText`, `statusMeta`) so the assistant reuses existing logic instead of
  duplicating it.

### Components

1. **Chat widget UI**
   - Floating action button (bottom-right) toggling a chat panel.
   - Message list (user right / assistant left), simulated typing indicator, input + send.
   - Quick-reply chips for the most common questions.
   - Styled with existing site tokens (green, card, muted, radius, shadow).

2. **Intent engine** — pure function `answer(query)`:
   - Normalize: lowercase, strip punctuation, tokenize.
   - Keyword-based, priority-ordered intent detection:
     - Terminology: `asba`, `upi`, `rhp`, `qib`, `gmp`, `lot`, `allot`, `listing`, `band`.
     - Status: `open`, `upcoming`, `listed`, `now`, `today`.
     - Recommendations: `best`, `cheapest`, `affordable`, `15000`, `low`, `top`, `pick`.
     - Peak/live: `live`, `price`, `52`, `high`, `peak`, `near`.
     - IPO lookup: match any tracked IPO name token → full snapshot (band, lot, min,
       dates, QIB, retail, GMP, verdict, live price, report link).
     - Report action: `report`/`rhp`/`qib` with an IPO name → report page link.
     - Safety/how-to: `safety`, `scam`, `apply`, `how`, `protect`, `secure`.
     - Share action: `whatsapp`, `email`, `send`, `share` → composes the daily report
       text via `buildReportText()` and renders `wa.me` and `mailto:` action links.
   - Fallback: no intent matched → lists what it can help with + quick-reply chips.

3. **Data flow** — reads the same `data` array fetched by `main.js` via
   `window.IPOSite`. Reuses `fmtInr()`, `statusMeta`, report URLs.

### Error handling

- No match → helpful fallback listing capabilities.
- Empty input → ignored.
- Suggestions/chips are clickable to re-query.
- Typing indicator simulated with a short `setTimeout`.

## Testing / verification

- `node --check js/assistant.js js/main.js`.
- Node harness exercising `answer()` against the real dataset for ~12 representative
  queries (lookup, status, cheapest, best rated, GMP, live/peak, safety, WhatsApp/email,
  report link, fallback, empty).
- Manual check of served pages over the local preview server.

## Out of scope

- No LLM, no network calls, no payment logic.
- No changes to the daily report email content or GitHub Actions.
