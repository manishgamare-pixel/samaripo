# Design: "IPO Xtra" Tracking Features for Samar's IPO Market

Date: 2026-08-20

## Goal

Mimic the core logical features of an IPO tracking app on the existing Samar's IPO
Market static site: mainline/SME listing with filtering, live-style subscription
tracking (QIB/NII/RII tiers), a GMP + expected-listing calculator, an allotment
probability simulator, and a financial-health + sentiment evaluator. The existing
visual design stays unchanged; features are additive.

## Approach

Pure client-side JavaScript on top of the current `data/ipos.json` dataset. No
backend, no API keys. "Live" values are static mock data refreshed by the existing
daily workflow; every UI state is fully reactive to user input.

## Decisions (from user)

1. Mock/sample IPOs are added and clearly labeled **SAMPLE** (fictional but realistic
   names). Real IPOs stay as-is.
2. New tools live in a dedicated **Tools section** on the page (GMP calculator +
   allotment simulator). Live subscription tiers and the financial health + sentiment
   table live inside each IPO's **detail modal**.
3. The Mainline/SME dual-tab applies across the whole IPO area: dashboard cards,
   Full IPO Listing, and Best Picks. Search + status chips apply within the active tab.

## Architecture

- `data/ipos.json` — extended schema (below) + new SAMPLE IPOs (mainline + SME).
- `index.html` — dual-tab bar above the dashboard; new `#tools` section; modal grows
  subscription, financial, and sentiment blocks; script/css tags unchanged except
  `?v=` bump.
- `js/main.js` — active-tab state, tab-aware renderers, subscription total math, GMP
  calculator, allotment simulator, financial table + sentiment renderers; exposes
  helpers on `window.IPOSite` for reuse.
- `js/assistant.js` — awareness of `sme` segment and `closed` status; tools can be
  mentioned; existing intents unchanged.
- `css/styles.css` — tabs, subscription bars, tools cards, simulator result screen,
  financial table, sentiment badge, SAMPLE pill (existing design tokens).

### Data model additions (per IPO)

- `segment`: `"mainline"` | `"sme"`.
- `sample`: `true` for fictional IPOs (renders a SAMPLE pill).
- `sub`: `{ qib, nii, rii }` (subscription multiples as strings like `"1.24x"`) plus
  category weights `w: [0.50, 0.15, 0.35]` (QIB/NII/RII share of net issue).
- `fin`: `{ years: ["FY25","FY24","FY23"], revenue: [], pat: [], assets: [] }` (₹ Cr).
- `pe`: number (IPO P/E), `peerPe`: number (listed peer average P/E).
- `cutoff`: number (₹, cut-off price), `gmpEst`: number (₹, current estimated GMP).
- Status gains a `closed` value (subscription closed, listing pending) in `statusMeta`.

### Mock data

- 3–4 mainline SAMPLE IPOs (mix of `open` and `upcoming`).
- 3–4 SME SAMPLE IPOs (mix of `open`, `upcoming`, `closed`).
- Existing 9 real IPOs keep real facts, marked `segment: "mainline"`, `sample: false`.
- Buyable-only display rule (open + upcoming visible; listed/closed hidden unless
  searched or the corresponding status chip is active) applies inside both tabs.

## Components

### 1. Dual-tab navigation

- Tabs: **Mainline IPOs** | **SME IPOs** above the dashboard.
- `activeSegment` state; switching re-renders dashboard grid, Full IPO Listing, Best
  Picks, and the stats bar for that segment.
- Status chips (All/Open/Upcoming/Listed/Closed) + search operate on the active tab's
  dataset only.

### 2. Live subscription tracking (detail modal + card badge)

- For `open` IPOs show three tier rows (QIB / NII / RII): label, multiple, and a
  progress bar (width proportional to multiple).
- Total subscription multiple shown as a headline number, computed as the weighted
  average over the tiers:
  `Total = QIB × 50% + NII × 15% + Retail × 35%`.
  Formula text is displayed above the tiers.
- Tier values render as editable inputs; editing recomputes Total and bars live.
- Closed/upcoming/listed IPOs show "Subscription closed" / "Not yet open" states.

### 3. GMP & Expected Listing calculator (`#tools`)

- Formula on screen: `Expected Listing Price = Upper Price Band + GMP`.
- Controls: GMP slider (₹, range e.g. 0–1500, step 5) + number input, cut-off price
  input, and an IPO picker (pre-fills band/cut-off from data).
- Live outputs: Expected Listing Price and Estimated % Gain/Loss
  `((expected - cutoff) / cutoff) × 100`, text colored green for gain, red for loss.

### 4. Allotment probability & status simulator (`#tools`)

- On-screen math note: with retail oversubscription R, a single lot is allotted with
  probability `1/R` (e.g. `15x → 1/15 ≈ 6.6%`).
- IPO selector (defaults to the retail multiple of the selected IPO) + mock
  PAN/Application number input + "Check Allotment" button.
- Lottery: `Math.random() < 1 / retailMultiple` (with retailMultiple floored at 1).
  Result screen: "Congratulations! 1 Lot Allotted" (green) or "Not Allotted" (muted),
  along with the exact probability shown.

### 5. Financial health & sentiment evaluator (detail modal)

- 3-year table: Revenue, PAT, Assets (₹ Cr) from `fin`.
- Sentiment box: rule-based P/E comparison vs listed market peers:
  - `pe < peerPe × 0.9` → "Cheap" (green)
  - `pe > peerPe × 1.1` → "Overvalued" (red)
  - else → "Fair" (amber)
- If `pe`/`peerPe` missing, show "Not enough data".

## Reactivity & data flow

- Single `data` array loaded from `data/ipos.json`; `activeSegment` + `statusFilter`
  + `affordableOnly` + search query derive the displayed set via pure functions.
- `visibleIpos()` returns open + upcoming for the active segment by default; archived
  (listed/closed) IPOs appear only via search or the matching status chip.
- All calculators and the simulator are pure functions of their inputs and re-run on
  every input/slider change.

## Error handling

- Empty PAN/application input or no IPO selected in the simulator → inline message.
- Missing financial/PE data → "Not enough data" placeholder.
- No open IPOs in a tab → empty-state message already present; subscription panels
  render closed/upcoming states.

## Testing

- Extend the DOM-stub harness (`/tmp/opencode/mainjs-dom-test.js`) with checks for:
  tab switching, subscription total math, GMP calculator outputs + color class,
  simulator probability boundary, financial table + sentiment classification.
- Keep existing harnesses green: DOM 17/17, assistant visible 9/9, assistant 17/17.
- Verify with `node --check` and the running preview server.

## Out of scope

- Real-time exchange feeds (values are static mock data, refreshed by the daily
  workflow).
- Real allotment lookups (simulator is illustrative only).
- SME IPOs in the assistant's buyable recommendations (SME tab is display-only for
  now; assistant answers stay mainline-focused).
