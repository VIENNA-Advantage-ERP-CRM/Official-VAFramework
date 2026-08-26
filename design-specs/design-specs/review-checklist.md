# Review Checklist

Purpose:
- Quick validation checklist for new screens, widgets, and window layouts before handoff

Canonical for:
- Spec conformance review
- Dashboard and window QA
- Catching layout drift early

Last updated:
- 2026-07-22

## 1. Screen Classification

- Is the screen clearly classified as:
  - `Only dashboard`
  - `Dashboard with window`
  - `Only window`
- If it is a dashboard screen, is the workspace transparent?
- If it is a window screen, is the primary workspace white or an approved window surface?
- Is the window action/search bar shown only for true window screens?

## 2. Dashboard Checks

- Does the dashboard use the shared 9-column grid?
- Is the row height locked to the square `1x1` block formula?
- Are `1x1` widgets truly square?
- Are widget sizes expressed as supported `NxM` spans instead of custom heights?
- Does the widget root avoid per-widget `min-height` or hardcoded height overrides?
- **No inner scrollbars anywhere on the dashboard.** Open the page on a WebKit browser (Chrome / Safari) and on Windows Chrome with "always show scrollbars" enabled — no widget body, list, table, queue, or agenda may show a scroll track. If content doesn't fit, paginate / state-switch / summarize. (See `No Inner Scrollbars` in `dashboard-widgets.md`.)
- **Row-based widgets render as CSS Grid with a single shared template across header and every body row.** Inspect the row markup: it must be `<div class="grid grid-cols-[…minmax(0,Nfr)…]">`, not flex, and the **exact** `grid-cols-[…]` string must appear on both the header row and every body row (hoist to a shared constant). No `max-content`, `auto`, or fixed `px` in the template — those measure each row's content independently and cause column drift between rows. (See `Grid Data Widget > Column Sizing And Truncation`.)
- **Every cell — including amount / currency / numeric columns — uses `truncate` and carries `title={cellValue}`.** Clipping is acceptable; loss of information is not. Hover any row in DevTools, including the amount column, and confirm the native tooltip appears with the raw cell value. Do not use `alt` for plain text — `alt` is for images and form controls.
- **Header separator is darker than body separators, and dividers are never omitted.** Inspect the row-based widget: header `border-bottom: 1px solid #C5D2DD`; body rows `border-bottom: 1px solid #E2EAF1` on every row except the last (`last:border-b-0`); footer band (if present) `border-top: 1px solid #D9E2EB`. The header divider is non-negotiable — even on the rail-variant header where there is a tinted band, the divider sits beneath the tint, not in place of it. (See `Grid Data Widget > Row And Header Separators`.)
- **Resize to `1280 × 800` and check every widget**: does designed content fit the cell without invisible clipping at the bottom? (See `Content Fit Budget` in `dashboard-widgets.md`.) Widget padding `14px`, primary-to-footer gap `10px`, footer top padding `8px`, stat-card numbers `≤ 24px`, footer caption `text-[12px]` + `truncate`.
- **For each row-based widget**, resize the viewport from `1280 × 800` up to `≥ 2K`: does the visible row count grow with cell height (adaptive), and does the footer pager appear automatically when the dataset exceeds the visible rows? Page state must clamp to the new total page count on resize. (See `Adaptive Row Count For Row-Based Widgets`.)

## 3. Widget Checks

### Widget Root Sizing
- Does the widget root set `style={{ fontSize: "clamp(16px, 1.2cqi, 20px)" }}` (or equivalent in `.NET` CSS)?
- Is every text size and spacing value inside the widget expressed in `em` against that root, not in `px`?
- Do borders, radii, and shadows on the widget surface stay in `px` (they should not scale with the root)?
- Resize the dashboard width from ~1280 to ~1920 — does the widget interior scale smoothly and fill the cell without leaving empty space at the bottom?

### Widget Header
- Does the widget header use the shared icon + title pattern?
- Is the title `Roboto Regular`, `clamp(16px, calc(var(--dash-inline-size, 100vw) * 0.011375), 17px)`, with correct icon alignment?
- If a subtitle exists, is title-to-subtitle spacing tight (`0.125em`)?
- Is the title clearly larger than any row cells inside the same widget? (See `List / Grid Hierarchy Rule`.)

### Lists / Tables Inside Widgets
- Are row cells / list item label/value at `sm` token (`0.75em`) — one step smaller than the title?
- Is secondary metadata one step smaller again at `xs` token (`0.6875em`)?
- Equal-size title and row text is a fail; weight + color contrast does not substitute for size hierarchy.

### Quick Action Widget (1x1 dashed `+` tile)
- Is the icon placed inside the normal flex flow at the top-right (not absolutely positioned)?
- Are the title (`0.75em` or `0.875em`, medium weight) and subtitle (`0.625em`–`0.6875em`, regular) pinned to the **bottom** of the cell using `justify-between` / `justify-end`?
- Is the subtitle capped at two lines via `line-clamp-2`?
- Is the decorative "Quick Action" eyebrow label absent? (It should be — the dashed border and `+` icon already signal the affordance.)

### Pagination
- If the widget has pagination, does it use:
  - optional helper text on the left
  - compact pager on the right
- Are pager buttons `24px` overall with a `14px` chevron icon?

## 4. Window Shell Checks

- Does the screen use the correct title-bar behavior for its variant?
- Is the global top bar `60px` tall (not `80px`)? Internal items (`38px` breadcrumb / `48px` icons group / `42px` avatar) must clear top and bottom symmetrically. (See `shell-and-navigation.md > Global Top Menu Bar`.)
- If a header panel exists, is it fixed below the action bar?
- If a bottom panel exists:
  - Background is solid white (`#FFFFFF`) — no tinted gradient. (See `windows-and-panels.md > Bottom Panel Layout > Shared Rules`.)
  - Mode is intentional: `split-scroll` or `stacked-scroll`.
  - **Chrome overrides applied** (see `windows-and-panels.md > Bottom Panel Layout > Chrome Overrides For Bottom Panels`): `box-shadow: none`, `border-radius: 0`, `border: none` + `border-top: 1px solid #DCE6EE` (single top-edge divider, not four sides). A bottom panel that ships with Panel Foundation Rule 1's shadow will render a floating gray band across the workspace above it — a common developer trap when Rule 1 is applied verbatim.
- If a right panel exists, does it start below the header panel when a header panel is present?

## 5. Detail View Checks

- Is the form using an intentional active column count:
  - `1`
  - `2`
  - `3`
  - `4`
- Are related fields placed close to each other?
- Are field groups used only where hierarchy is helpful?
- Are toggle/switch rows treated as standalone controls rather than underline-style text fields?
- If action cells are used, are they:
  - borderless by default
  - placed at the end of a section or row intentionally
  - aligned left, center, or right intentionally

## 6. Right Panel Checks

- Is the right panel using a proper header with title/dropdown and close action?
- Is the collapse strip the canonical toggle surface?
- Is the far-right action rail kept separate from right-panel navigation?
- Is the left workspace width derived from the full right-panel shell width?
- Does the bottom panel stop before the right-panel shell instead of flowing behind it?
- If panel widths differ by tab, does the left workspace reflow cleanly without dead space or overlap?

## 7. Do-Not-Infer Checks

- Did anyone assume that a left-nav destination automatically requires a window action bar?
- Did anyone guess right-panel width from current content instead of using an intentional shell width?
- Did anyone add ad hoc height/margin fixes instead of following the canonical grid or shell formulas?
- Did anyone turn a widget or field group into a default pattern when it should remain optional?

## 8. Panel HTML Token Audit

Run this audit **before writing** any panel HTML (right panel, bottom panel, header panel, detail pane) and **before declaring it done**. Reference-file HTMLs (prototypes, dev handoffs, Figma exports) drift from the spec silently — the audit surfaces the drift in one pass instead of over several rounds of downstream correction.

### 8.1 Two-tier chip / pill enforcement

Grep every rounded inline label in the file — `.chip`, `.badge`, `.pill`, `.docbadge`, `.tag`, `.tchip`, `.skillchip`, `.status-pill`, plus any bespoke class carrying `border-radius: 999px`. Each must resolve to exactly one of the two spec tiers (see [foundations.md > Chips And Pills](./foundations.md#chips-and-pills)):

- **Chip:** `padding: 0.3125em 0.625em`, `font-size: 0.6875em`, `font-weight: 700` (semantic status) or `500` (neutral / category), `border-radius: 999px`, sentence case, `white-space: nowrap`.
- **Pill:** `padding: 0.5em 0.875em`, `font-size: 0.8125em`, `font-weight: 400`, `border: 1px solid #0083DA` outline on `#FFFFFF`, no fill, `border-radius: 999px`.

Any between-tier value — chip padding with a smaller font, chip font with tighter padding, weight `600`, chip padding at `0.125em`/`0.1875em`/`0.25em` vertical — is a fail. Do not ship a third tier. No exceptions.

### 8.2 Panel Foundation contract (5 rules)

See [windows-and-panels.md > Panel Foundation](./windows-and-panels.md#panel-foundation-applies-to-every-panel-type). Every panel implementation must include all five:

- Wrapper: `container-type: inline-size`, `background: #FFFFFF`, standard border + radius + shadow.
- Chrome header (~56px, fixed, `flex: none`): stays at document baseline `16px` — NOT under the panel anchor.
- Body: `container-type: inline-size`, `--panel-anchor: clamp(18px, 1vw, 20px)`, `font-size: var(--panel-anchor)`, `overflow-y: auto`.
- Form-control reset scoped to `.panel-body` (not `*`): `button, input, select, textarea, optgroup { font-family/size/line-height/color: inherit }`.
- Borders / dividers / radii / shadow offsets stay in `px`. Padding, margin, gap, and internal height that should scale with the anchor stay in `em`.

Missing any of the five silently causes chips inside buttons and em-based tokens to render at inconsistent physical sizes. Reject in review.

**Bottom-panel exception.** Rule 1's `border: 1px solid #D9E2EB` (four-sided), `border-radius: 16px`, and `box-shadow: 0 10px 24px rgba(15, 61, 97, 0.06)` assume a panel that floats against the app background. A bottom panel sits flush against the workspace above it inside the module wrapper — the same chrome produces a double outline, a rounded top edge that exposes the workspace, and a floating shadow band. Bottom panels use the override block in [Bottom Panel Layout > Chrome Overrides For Bottom Panels](./windows-and-panels.md#chrome-overrides-for-bottom-panels): `border: none` + `border-top: 1px solid #DCE6EE`, `border-radius: 0`, `box-shadow: none`. Right / header / detail panes still use Rule 1 as written.

### 8.3 Body typography tokens

Cross-check every visible text node against [windows-and-panels.md > Right Panel Body > Typography Quick Reference](./windows-and-panels.md#typography-quick-reference). Common miss list (paired with the reference-file value that most often smuggles a wrong size in):

- **Panel header title (chrome):** `1em Bold` — not `1.125em` or `1.25em` from a "big header" reference.
- **Panel header meta:** `0.75em Regular` — not `0.8125em`.
- **Section Header title:** `1em Bold`. Summary `0.75em Regular`. Action link `0.8125em Regular`.
- **Hero Card:** title `1.125em Bold`; subtitle `0.75em`; emphasis value capped at `1.5em Bold`. `1.875em` big-number references round down.
- **Metric Grid:** label `0.6875em Regular`; value `0.8125em Bold` (not weight `600`).
- **Compact List:** primary `0.75em Bold`; meta `0.75em Regular` — **same size**, hierarchy via weight + color, not size shrink.
- **Entity Row:** primary `0.875em Bold`; meta `0.75em Regular`; trailing value `0.9375em Bold`; trailing sub `0.75em Regular`.
- **Stat Grid tile:** label `0.6875em`; value `0.9375em Bold` — not `1.1875em` or larger widget-KPI treatment.
- **Data Grid:** header `0.6875em Medium`; body row `0.75em`.
- **Status pill inside body content:** `0.6875em Bold`.
- **Action Pill / outline pill button:** `0.8125em Regular` — not weight `500` from a "medium button" reference.
- **Panel-body button:** every `<button>` inside `.panel-body` must carry a sizing class — `.panel-btn` (rectangular action, `0.8125em Medium`, `6px` radius), `.action-pill` (entry-point, `0.8125em Regular`, `999px` radius), or `.section-action` (`0.8125em Regular`). A naked `<button>` inherits the panel anchor (`18–20px`) via the Rule 4 form-control reset — that reset is a *context reset* for chip / icon children rendered inside the button, not a display size for the button label itself. See [foundations.md > Panel Button](./foundations.md#panel-button).

### 8.4 Token floor

Nothing renders below `0.6875em`. Reference values at `0.625em` (uppercase eyebrow labels, footer captions, `.ovh-k`, `.ov-oem-k`, dashboard captions from the widget spec) round **up** to `0.6875em` inside a panel body. This is the chip size — the panel's smallest legible token.

### 8.5 Weight palette

Only `400` (Regular), `500` (Medium), and `700` (Bold) are permitted. `600` (SemiBold) is not in the spec palette — convert to `700` for semantic bold or `500` for medium (neutral chip, secondary link). Any `600` in the audit is a fail.

### 8.6 Row inheritance traps

- When a row (`.drow`, `.compact-row`, `.entity-row`) sets `font-size: 0.75em`, any child with `font-size: 0.75em` compounds to `~0.56em` of the anchor (`~9-10px`) — too small to read. Use `font-size: 1em` (inherit) on child meta lines and let color + weight carry the hierarchy (Compact List pattern).
- `<p>` and `<h*>` inside panel rows keep the browser default `~1em` top+bottom margins. The Rule 4 form-control reset does NOT cover them. Every row's `<p class="primary/meta">` needs explicit `margin: 0` (primary) / `margin: 0.1875em 0 0` (meta). Symptom: rows visibly taller than a neighbouring list with identical CSS but `<span>` children.

### 8.7 Reference-file conflicts

- When copying DOM/composition from a reference HTML, override every token that came with it (see [implementation-rules.md > Reference HTML Workflow](./implementation-rules.md#reference-html-workflow)).
- Reference-file sizes are prototypes — they do NOT survive this audit. Do not preserve `text-[12px]`, `1.25em` H1s, `1.1875em` KPI values, third-tier `0.625em` docbadges, glass gradients on Detail Cards, or bordered outer list containers out of literal fidelity.
- Flag conflicts to the user before "fixing" — surface the conflict first per [implementation-rules.md > When the reference conflicts with a hard spec rule](./implementation-rules.md#when-the-reference-conflicts-with-a-hard-spec-rule), then either restructure to spec or record the exception.

## 9. Final Consistency Pass

- Does the screen feel like Onfinity rather than a one-off exception?
- Are spacing, typography, and icon treatments consistent with neighboring screens?
- If a new reusable rule was introduced, was the most focused spec file updated?
- If the file map changed, was [design.md](./design.md) updated too?
