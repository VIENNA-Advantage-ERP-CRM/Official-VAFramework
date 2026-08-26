# Dashboard Widgets

Purpose:
- Canonical rules for all module dashboard widgets and the shared 9-column grid

Canonical for:
- Dashboard grid math
- Widget size ratios
- Widget header, stat, and footer patterns
- Dashboard search and widget pagination

Last updated:
- 2026-06-16

## Recent Tightening (2K Calibration)

Captured here so reviewers and engineers handing over work see what's new at a glance. Each change is also reflected in its canonical section below.

1. **Widget root font-size** tightened from `clamp(16px, 1.4cqi, 24px)` → **`clamp(16px, 1.2cqi, 20px)`**. Widget content stops growing at 20 px on wide dashboards (was 24 px). Every em-based internal value rescales: KPI value `1.75em` → `20–35 px` (was `28–42`), row `sm` `0.75em` → `12–15 px` (was `12–18`), padding `0.875em` → `14–17.5 px` (was `14–21`). Floor unchanged at 16 px so small laptops are unaffected. See **`Widget Root Anchor`**.
2. **Title clamp** lowered to **`clamp(16px, …·0.011375, 17px)`** (was `…, 18px`). Title sits just under the chrome breadcrumb (18 px) on wide dashboards — widget content is the focus. See **`Widget Header`**.
3. **Subtitle clamp** lowered to **`clamp(12px, …·0.009625, 13px)`** (was `…, 14px`). See **`Widget Header`**.
4. **Grid widget header — canonical rail variant**. Every row-based widget header now renders as: **transparent bg**, `0.6875em` (≈11 px-eq), `Roboto Medium`, `capitalize`, color `#41576A`, `py-[0.5em]`, divider `1px solid #C5D2DD`. Background MUST be transparent — never tint the header row. Was previously `uppercase` + `letter-spacing: 0.04em` at `0.625em`; case dropped to capitalize and size bumped one notch (capitalize letters carry less optical weight than uppercase at the same px). See **`Grid Data Widget > Header Row`**.
5. **Header separator > body separator (tone hierarchy)**. Header `1px solid #C5D2DD`; body `1px solid #E2EAF1`; footer (when pager exists) `1px solid #D9E2EB`. Separators are never optional except `last:border-b-0` on the final body row. See **`Grid Data Widget > Row And Header Separators`**.
6. **Column sizing & truncation**. Row-based widgets render as CSS Grid with a **single shared `grid-template-columns` constant** across header + every body row. All columns use `minmax(0, Nfr)` only — no `max-content` / `auto` / fixed px (except for predictable numeric columns like Price/Tax/Amount which may use fixed `Npx` widths). Every cell (including amount/numeric) uses `truncate` and carries `title={cellValue}`. See **`Grid Data Widget > Column Sizing And Truncation`**.
7. **Chrome bar heights** reduced in two passes: global top bar `80 → 60 → 42 px`; window/module title bar (the one with the blue `#1F83FF` underline) `56 → 42 px`. Top-bar menu button + avatar + icons group all now sit at `32 × 32 px` so they fit cleanly in the 42 px bar. Left nav icon button matches at `32 × 32 px` (was `48`). See **`shell-and-navigation.md > Global Top Menu Bar`** + **`Window / Module Title Bar`** + **`Left Navigation`**.
8. **Bottom panel background** is solid white (`#FFFFFF`). No tinted gradients. See **`windows-and-panels.md > Bottom Panel Layout > Shared Rules`**.
9. **KPI value harmonized to em scale + SemiBold weight**. Was `clamp(32px, …·0.025, 64px)` Roboto Regular (CRM) / `1.75em` Roboto Medium (Finance) — two patterns, ~83 % delta on 2K. Then unified at `1.75em Roboto Medium` (500). Now **`1.75em Roboto SemiBold` (`600`) `line-height: 1.05`** everywhere (2026-06-19 stat-weight unification), putting the KPI on the same width-anchored lever as the rest of the widget. Resolved sizes: `28 px` at the 1280 floor → **`35 px` at 2K** (was up to `64 px`). SemiBold lets the headline number carry presence on the glass surface without going full Bold (`700`), which would compete with row Bold primaries. Larger-Multi-Stat widgets (Inbox / Calendar / My Tasks) dropped from Bold → SemiBold in the same pass so the whole stat family reads as one weight. See **`KPI And Summary Widget`** and **`Widget Stat Values`**.
10. **Grid data text colors darkened one tier**. Secondary `#5F7283 → #41576A`; Muted `#748494 → #5F7283`. Primary `#102C3F` unchanged. Improves the contrast of row data against the more-translucent widget surface. See **`foundations.md > Text`**.
11. **Widget surface gradient — top pulled to fully opaque**. Was `linear-gradient(180deg, rgba(255,255,255,0.82) → rgba(255,255,255,0.58))`, then `0.8/0.6`. Now **`linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,0.6))`** (2026-06-19 calibration). Top of every widget reads as solid white so widget heads and KPI values sit on a high-contrast surface; the bottom still lets the workspace gradient bleed through. The earlier `0.7/0.49`, `0.82/0.58`, and `0.8/0.6` pairs are deprecated. See **`foundations.md > Standard Gradients`**.
12. **Footer pager type smaller**. Helper text `0.8125em → 0.75em` (13 → 12 px at the 16px baseline); page text `0.85em → 0.8125em` (14 → 13 px). Pager reads as supporting chrome instead of competing with row data on 2K. See **`Widget Footer Pager`**.
13. **Dashboard grid wrapper padding** uniform at `12 px` (was `18`, then `12 symmetric`, then `0/12` asymmetric, then `4/12`). Locked to the grid `gap-[12px]` so the dashboard reads as one continuous lattice from the top bar down. See **`implementation-rules.md > Dashboard Implementation Pattern`**.

When a new screen is added, the review checklist (**`review-checklist.md`**) walks each of these.

## Shared Dashboard Grid

Use one dashboard grid system across modules.

- Columns: `repeat(9, minmax(0, 1fr))`
- Gaps: `12px`
- Background remains transparent so the app gradient stays visible
- Do not create a different grid system per module dashboard
- Row tracks must be locked to the square 1x1 block height (see `Square Block Sizing`)
- Do not size rows from widget content; that lets one widget reflow its neighbors when content changes

### Square Block Sizing

The 1x1 "block" is the unit every widget size is derived from. Block size must equal one grid column's width so a 1x1 widget renders as a true square.

- Compute block size from the grid's own width, not from content
- Use CSS container query units so the value resolves correctly in row-track context (a percentage in `grid-auto-rows` collapses)
- Set `container-type: inline-size` on the scrollable dashboard wrapper
- Set `grid-auto-rows: calc((100cqw - <gap-total>) / 9)` on the grid; with `12px` gaps that is `calc((100cqw - 96px) / 9)`
- Do not add `min-height` or fixed `height` to individual widget cells - the grid track owns the height

Canonical formula:
- `block = calc((100cqw - 96px) / 9)`
- `widget width = (columnSpan * block) + ((columnSpan - 1) * 12px)`
- `widget height = (rowSpan * block) + ((rowSpan - 1) * 12px)`

Implementation note:
- the grid owns widget outer height
- widget content must adapt inside that box
- do not let content determine the box size

## Shared Widget Size System

Widget sizes are expressed as `column span x row span`. Every size is a multiple of the 1x1 block plus the gaps between rows/columns it spans.

Supported sizes:
- `1x1`
- `2x1`
- `2x2`
- `3x1`
- `3x2`
- `3x3`
- `4x2`
- `5x2`
- `6x2`
- `6x3`

Computed cell dimensions (block = column width = row height):
- `1x1`: `block` wide x `block` tall (true square)
- `2x1`: `2*block + 1 gap` wide x `block` tall
- `3x2`: `3*block + 2 gaps` wide x `2*block + 1 gap` tall
- `6x2`: `6*block + 5 gaps` wide x `2*block + 1 gap` tall
- larger sizes follow the same pattern

Rules:
- `1x1` widgets must be square
- All widgets must follow this size ratio system; do not invent custom widths or heights
- Do not add per-widget `min-height` or `height` overrides; the grid track is the single source of truth for height
- If a widget's content is taller than its grid cell, page through it (or switch state) — **never** scroll the inner content. Inner scrollbars are forbidden (see `No Inner Scrollbars`).

Examples:
- `1x1` quick action or shortcut tile
- `3x2` queue, funnel, or agenda widget
- `6x2` schedule or large list widget
- `6x3` larger analytics or relationship widget

### No Inner Scrollbars

Widgets must present a **clean scroller-free surface**. The widget wrapper, list container, table body, queue body, agenda — none of them may scroll. If content exceeds the visible area, the answer is always one of: paginate, switch state, or summarize. It is never "let the user scroll inside the cell."

Why: dashboard widgets share a glass-card aesthetic where every cell is a finished, self-contained tile. Inner scrollbars (gray track + thumb in WebKit, persistent bar in some Windows settings) break the tile aesthetic, advertise overflow as a feature, and make the dashboard feel like an admin form. Pagination is also more reliable: the user always sees the same number of rows for a given screen, and "Showing 1–6 of 36" makes the dataset size explicit.

The rule covers every Tailwind/CSS class that produces a scrolling box:
- `overflow-auto` ❌
- `overflow-scroll` ❌
- `overflow-y-auto` / `overflow-y-scroll` ❌
- `overflow-x-auto` for horizontal data tables ❌ (the data table should fit the column count; if it doesn't, drop columns or promote the widget)
- `overscroll-*` ❌ (irrelevant once the wrapper can't scroll, but still don't add)

Use these instead:
- `overflow-hidden` on the widget wrapper — clips the in-progress measurement frame, keeps the cell's visual edges crisp.
- `min-h-0 flex-1 overflow-hidden` on any list/body region that should adapt its row count to the cell — works with `useAdaptiveRowCount` (see `Adaptive Row Count For Row-Based Widgets`).
- Footer pager when the dataset exceeds visible rows (see `Widget Footer Pager`).
- State switcher (`< Previous | Today | Upcoming >`) for time/agenda widgets.

Anything inside the widget — pagination, filter swaps, expand/collapse, async data load — must not change the widget's outer height either. Header, body, and footer must stay stable; page/state changes swap content without resizing the widget. Verify by paging through any pageable content: neighboring widgets must remain pixel-identical.

Do not infer:
- do not guess widget height from how much content is inside
- do not add one-off `min-h-*` rules to "stabilize" a widget
- do not let pageable content resize the widget between pages
- do not let one widget's content reflow adjacent widgets
- do not "just hide the scrollbar with `scrollbar-width: none`" — that papers over the real problem (content still overflows) and the keyboard / wheel still scrolls. Fix the row count, not the scrollbar.

Preferred patterns when content exceeds capacity:
- record/grid widget: compact footer pager such as `< 1 of 3 >`
- time/day widget: labeled state switcher such as `< Previous | Today | Upcoming >`
- queue widget: page through records with helper text such as `Showing 1–6 of 18`
- analytics widget: summarize more data instead of introducing a scroll region

Exception (one — and only one): a true documentation/long-form *content panel* that lives outside the dashboard grid (e.g., a help drawer, a docs slide-over) may scroll. Dashboard widgets may not.

### Adaptive Row Count For Row-Based Widgets

Row-based widgets (inbox, calendar, queue, customer list, task queue) must **derive their visible row count from the cell's available height at runtime** — not hardcode a row count that's correct on one screen and clips on another. The same widget on a 1280 px laptop should show fewer rows than the same widget on a 2K dashboard. Pagination is the contract for "more rows exist."

Contract:
- Measure the widget's list container `clientHeight` with a `ResizeObserver` and recompute `rowsPerPage = floor(availableHeight / rowHeight)` on every resize.
- Clamp to a `minRows` floor (default `3`) so the widget never shows zero rows even if the cell collapses unexpectedly.
- The list container must be a flex child with `min-h-0 flex-1 overflow-hidden` so it shrinks to the available space and clips the in-progress measurement frame rather than pushing the footer pager off-cell.
- Always render a footer pager when `dataset.length > rowsPerPage`. Use the canonical pager (24 px buttons, 14 px chevron, `Showing a–b of N` helper). Hide the pager when one page covers everything.
- Page state is owned by the widget; when `rowsPerPage` changes (e.g., the user resizes), clamp the current page so it never exceeds the new total page count.

Recommended row-height estimates (default Tailwind leading `1.5`):
- 1-line row (`text-[14px]` + `py-[10px]` + `1px` border): ~`42 px` (`21 + 20 + 1`)
- 2-line SMALL row (`text-[14px]` + `mt-[3px]` + `text-[12–13px]` + `py-[10px]` + `1px` border): ~`65 px` (`21 + 3 + 18–19.5 + 20 + 1`)
- 2-line LARGE row (`text-[15px]` + `mt-[3px]` + `text-[13px]` + `py-[10px]` + `1px` border): ~`66 px` (`22.5 + 3 + 19.5 + 20 + 1`)
- 2-line row + leading time column: the right column's content dominates; sum of right column ≥ left column, so use the right-column height as the row height.

**Use the same `rowHeight` for widgets with the same row structure.** Two widgets that render the same row markup (e.g., Inbox vs. My Tasks — both 2-line rows) must pass the same value to the hook, otherwise structurally-identical widgets will report different `rowsPerPage` for the same available height. Hoist the value to a single constant per row template.

Engineering reference:
- React: `src/lib/useAdaptiveRowCount.ts` exposes a `useAdaptiveRowCount({ containerRef, rowHeight, minRows })` hook that implements the contract above.
- Plain JS: replicate with a single `ResizeObserver` per widget that writes the count to local state.

Do not:
- hardcode a single page size and silently rely on `overflow-auto` to scroll the rest (that violates `No Inner Scrollbars` *and* `Content Fit Budget`).
- size rows from content (variable-height rows break the math; if you need a chip row + a text row, count the whole composite as one row height).
- omit the pager when the dataset has more items than fit — the user must see that more records exist.

### Content Fit Budget (laptop floor)

`overflow: hidden` keeps the widget *outer* size stable, but it also silently clips content that overshoots the cell. The grid row block is derived from dashboard width, so the **same widget is much shorter on a 1280 px laptop than on a 2K dashboard**. Design content to fit the laptop floor — not the wide-dashboard case — or content will clip on the small screen.

Resolved cell heights at a 1280 px viewport (≈1208 px dashboard container after the 72 px left nav):

- 1 block ≈ `(1208 − 96) / 9` ≈ `124 px`
- Widget cell height = `rowSpan * block + (rowSpan − 1) * 12`
- `2x1` cell ≈ `124 px` · content area after `14px` padding ≈ `96 px`
- `Nx2` cell ≈ `259 px` · content area ≈ `231 px`
- `Nx3` cell ≈ `395 px` · content area ≈ `367 px`

Rules:
- Default widget padding `14 px` (not `18 px` — the older value over-budgets small laptops by ~8 px).
- Default inter-section gaps: `12 px` between widget header and primary content; `10 px` between primary content and a footer pager / footer caption; `8 px` for the footer's own top padding.
- Inside a stat-card grid (funnel stage, KPI tile, status tile), use `10 px` outer padding and `6 px` internal gaps. Stat headline numbers inside such tiles cap at `24 px` (not arbitrary `32 px+`).
- A `Nx2` widget MUST NOT stack: header KPI bar + multi-row content + footer caption AND remain unclipped at 1208 px. Pick at most two of the three; promote to `Nx3` if all three are required.
- Sum the **fixed** content height (padding + header + each section + footer) and ensure it ≤ the `1208 px`-dashboard cell height before shipping. If a section uses `flex-1`, also confirm its content's own min-height fits the budget (add `min-h-0` so it can shrink, not just stretch).
- The trailing footer caption/insight pair must use `text-[12px]` (not `text-[13px]`) and `truncate` on the left half so a long caption does not push the right-side `Focus:` label off-cell.

Verification:
- Resize the browser to `1280 × 800` (DevTools "iPad Pro" landscape works too) before sign-off.
- Every widget's content must fit without inner scroll **and** without invisible clipping.
- This check is independent of the `No Inner Scrollbars` rule: that rule forbids the widget from scrolling its overflow away; this rule prevents the design from overshooting in the first place.

## Shared Dashboard Layout Rules

Preferred top-row pattern when a quick action exists:
- `1 + 2 + 2 + 2 + 2 = 9`

Preferred main patterns:
- `6 + 3`
- `4 + 5`
- `3 + 3 + 3`

Use only supported widget sizes to fill the dashboard.

Example top row:
- `1 + 2 + 2 + 2 + 2 = 9`

Example second row:
- `6x2` large operational widget on the left
- `3x2` supporting operational widget on the right

## Glass Widget

Default dashboard widget chrome:
- translucent white gradient surface
- border: `2px solid #FFFFFF`
- radius: `12px` to `14px`
- padding: `16px` to `18px`
- subtle blue-gray shadow

## Widget Edge Spacing

- Default inner padding: `0.85em` on all sides (resolves to about `14px` on small dashboards, `21px` on the widest dashboards via the widget root scale described in `Widget Internal Sizing`).
- Padding is expressed in `em` so it scales with the widget root font-size; the outer dashboard grid still uses `px`.
- Do not let text, lists, or nested panels touch the widget edge.

## Widget Internal Sizing

Widgets express **internal** typography and spacing in `em` against a single `font-size` declared on the widget root. This gives one lever per widget — change the root `font-size` and every text and spacing value inside the widget rescales proportionally. The dashboard grid still owns each widget's outer width/height (see `Square Block Sizing`); this section is only about how the **inside** of a widget scales.

### Widget Root Anchor

Every widget root sets:

```css
font-size: clamp(16px, 1.2cqi, 20px);
```

- `cqi` resolves against the nearest ancestor with `container-type: inline-size`. The dashboard grid wrapper already sets this (it's required for the `100cqw` row-track formula in `Square Block Sizing`), so `cqi` here means "1 % of the dashboard container's inline width".
- This is intentional: widget content scales at the **same rate** as the grid row heights. On a wide dashboard the cells get taller and the type grows proportionally — no empty space at the bottom of cards. On a narrow dashboard the cells shrink and so does the type — no overflow.
- The `clamp` bounds prevent the base from collapsing on very narrow surfaces (sidebar + right panel both open) or ballooning on 4K displays.

Resolved widget root font-size by dashboard container width:

| Dashboard container width | Resolved widget root font-size |
| ------------------------- | ------------------------------- |
| ≤ 1334 px                 | 16 px (clamp min)               |
| 1440 px                   | ~17.3 px                        |
| 1600 px                   | ~19.2 px                        |
| ≥ 1667 px                 | 20 px (clamp max)               |

The clamp was tightened from the earlier `clamp(16px, 1.4cqi, 24px)` (which capped at 24 px on 2K dashboards) to **`clamp(16px, 1.2cqi, 20px)`** so 2K screens don't make widget content read oversized. Key downstream effects:

- KPI value (`1.75em`): 24 px → **20 px floor** at narrow widths; **35 px ceiling** at wide widths (was 42 px)
- Meta (`0.6875em` / `xs`): 11 px → **~13.75 px ceiling** (was 16.5 px)
- Row text (`sm` / `0.75em`): **15 px ceiling** (was 18 px)
- Widget padding (`0.875em`): **17.5 px ceiling** (was 21 px)

If a future module needs viewport-driven scaling instead (ignoring sidebar/right-panel state), swap `1.2cqi` for `1.05vw` and keep the same `16–20 px` bounds.

### Widget Type Scale

All text inside a widget uses one of these tokens. The `px` column shows the resolved size at the `1em = 16px` base; on wider dashboards the same token resolves larger via the root clamp.

| Token   | em        | px at base | Use                                                            |
| ------- | --------- | ---------- | -------------------------------------------------------------- |
| xs      | `0.6875em`| 11         | Chip text, smallest secondary metadata, 1x1 widget subtitle    |
| sm      | `0.75em`  | 12         | Row cells, list item label/value, list metadata, table headers |
| body    | `0.8125em`| 13         | KPI label and KPI meta                                         |
| md      | `0.85em` | 14         | 1x1 widget title only (main widget title uses its own `cqi` clamp — see `Widget Header`) |
| base    | `1em`     | 16         | Reserved; rarely used inside widgets                           |
| lg      | `1.125em` | 18         | Reserved; section heads inside very large widgets              |
| xl      | `1.375em` | 22         | KPI value                                                      |
| display | `2.125em` | 34         | Reserved for hero/large-format widget values only              |

### Widget Spacing Scale

Padding, margin, and gap use `em` so they scale with the root. All spacing inside the widget should come from this scale:

| Token | em        | px at base |
| ----- | --------- | ---------- |
| 2     | `0.125em` | 2          |
| 4     | `0.25em`  | 4          |
| 8     | `0.5em`   | 8          |
| 10    | `0.625em` | 10         |
| 12    | `0.75em`  | 12         |
| 14    | `0.85em` | 14         |
| 16    | `1em`     | 16         |
| 18    | `1.125em` | 18         |

### Not Scaled With em

These stay in fixed `px` because they are physical edges that should not scale with text:

- border widths
- border radii
- shadow offsets
- the outer grid track formula (`gridAutoRows: calc((100cqw - 96px) / 9)` — that's `cqw`/`px`, not `em`)

### List / Grid Hierarchy Rule

In any widget that renders a list of rows or a table, the row/cell text **must be smaller than the widget title**. Equal-size title and rows reads flat and breaks scan-ability.

Canonical pairing:

- Widget title: `clamp(16px, calc(var(--dash-inline-size, 100vw) * 0.011375), 17px)`, Roboto Regular — see `Widget Header`.
- Row cell, list item label, list item value: `sm` (`0.75em` / 12 px-eq) — must resolve below the title at all dashboard widths.
- Secondary metadata under a row (subtitle, helper text): `xs` (`0.6875em` / 11 px-eq).

Weight and color still differentiate primary cells (bold, dark text) from secondary cells (regular, muted) — they share the smaller `sm` size for hierarchy.

## Widget Header

Use one shared title/header pattern for dashboard widgets. The header is **self-sufficient** — no `container-type`, no parent wrapper rules, no `cqi` containing block required. The title and subtitle read a single global CSS custom property `--dash-inline-size` (in pixels) and clamp around it. See **Measurement Setup** below for how that variable gets populated.

```css
.widget-title {
  font-family: 'Roboto', sans-serif;
  font-weight: 400; /* Regular */
  color: #102C3F;
  line-height: 1.2;
  font-size: clamp(16px, calc(var(--dash-inline-size, 100vw) * 0.011375), 17px);
}

.widget-subtitle {
  font-family: 'Roboto', sans-serif;
  font-weight: 400; /* Regular */
  color: #717182;
  line-height: 1.3;
  margin-top: 2px; /* fixed — pairs the two lines at every width */
  font-size: clamp(12px, calc(var(--dash-inline-size, 100vw) * 0.009625), 13px);
}
```

Layout rules around the title:

- Left icon optional; when used, it sits to the left of the title.
- Icon-to-title gap: `0.625em`.
- Icon and title text align vertically in the middle.
- Title may wrap in narrow widgets.
- The title's upper bound (`17px`) keeps the title just under the chrome breadcrumb (`1.125em` ≈ `18px`) on wide dashboards — the widget content (KPI values, list rows) is the focus, not the title; the floor (`16px`) protects the narrow-dashboard case.

**Icon well and glyph scale with the title.** When the title clamp resolves larger on wider dashboards, the icon must follow — otherwise the icon shrinks visually next to a growing title and the header reads unbalanced. Drive the icon sizes off the same `--dash-inline-size` lever as the title:

```css
.widget-icon-well {
  /* ≈ 2× the title clamp at every dashboard width */
  width:  clamp(32px, calc(var(--dash-inline-size, 100vw) * 0.022750), 40px);
  height: clamp(32px, calc(var(--dash-inline-size, 100vw) * 0.022750), 40px);
  border-radius: 12px;
}

.widget-icon-glyph {
  /* ≈ 1.1× the title clamp — slightly larger than title text so the icon reads first */
  width:  clamp(18px, calc(var(--dash-inline-size, 100vw) * 0.012500), 22px);
  height: clamp(18px, calc(var(--dash-inline-size, 100vw) * 0.012500), 22px);
}
```

- Coefficient `0.022750` on the well = `2 × 0.011375` (title coefficient). At every dashboard width the well stays exactly `2×` the title height.
- Coefficient `0.012500` on the glyph ≈ `1.1 × 0.011375`. The glyph reads ~10% larger than the title text at every width.
- Render the well as a soft glass tile (`bg: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(232,244,255,0.96))`, faint blue inset shadow). Border-radius stays in fixed `px` (`12px`) so it doesn't scale with the clamp.
- If the caller passes a sized icon component, override its `width`/`height` from the wrapper so the glyph clamp wins (in Tailwind: `[&>svg]:!size-[<clamp>]`).

### Measurement Setup

`--dash-inline-size` is a CSS custom property whose value should equal the **current pixel width of the dashboard's visible content area** (i.e., the inner width that widgets share — not the viewport, since side panels can change this independently). It is set on `:root` (or `document.documentElement`) and read by every widget.

**The host page must mark the dashboard container element.** Use one of:

```html
<div class="vis-widget-container">…widgets here…</div>
<!-- or, framework-agnostic alternative: -->
<div data-dashboard-container>…widgets here…</div>
```

The widget bootstrap looks for the closest ancestor matching `.vis-widget-container` or `[data-dashboard-container]`. If the host already uses one of those, the widget is fully self-wiring — no additional setup needed.

How `--dash-inline-size` gets populated (pick whichever fits the host):

1. **`ResizeObserver` on the marked container** (recommended for SPAs). On every resize, write `clientWidth` of `.vis-widget-container` to `--dash-inline-size` on `:root`. A single observer per document is sufficient — every widget reads the same var.
2. **Static set on layout shifts** (e.g., a layout listener that already fires on sidebar toggle). Same write, just triggered by your layout system instead of the browser.
3. **Skip it.** If the variable is unset, the `clamp()` falls back to `100vw` via the `var(…, 100vw)` default. Acceptable when the dashboard area always equals the viewport.

The variable is the contract; the population mechanism is the host's choice. Two non-negotiables:

- Write a **pixel value** (`'1240px'`) — `calc()` needs a length, not a unitless number.
- Update on **resize** (window resize, sidebar toggle, panel open/close) — anything that changes the dashboard's visible width.

If the host needs a different class name, expose a configuration hook on the bootstrap module (e.g., `setDashboardSelector('.my-custom-grid')`) before the first widget mounts.

This contract is what makes the header rule portable across frameworks: the widget code only ever sees a CSS variable. The widget does not need to know about `container-type`, `cqi`, grid spans, or its parent's layout.

## 1x1 Shortcut Widget

Use for square shortcut tiles such as Partner Kit, Release Notes, LMS, or Source Code.

- Content centered vertically and horizontally
- One prominent icon above the text
- Icon and label visually close together
- Icon well size: about `2em`
- Title:
  - `Roboto Medium`
  - `md` token (`0.85em`)
  - dark text
- Optional subtitle:
  - `Roboto Regular`
  - `xs` token (`0.6875em`)
  - muted gray, capped at 2 lines via `line-clamp-2`

## Quick Action Widget

Use as the first widget in module top rows (the dashed `+` tile that creates a new record).

- Grid span: `1` (always `1x1`)
- Border: `2px dashed #9ED1FF`
- Surface: pale blue-to-white gradient
- Radius: `14px`
- Padding: `0.85em` on all sides
- Layout shape: flex column with `justify-between` so the icon sits at the **top** and the title + subtitle sit at the **bottom**.
- Icon well sits inside the flex flow (not absolute) at the top, right-aligned (`flex justify-end`). Putting the icon in the flex flow lets the text below use the full widget width without needing a `pr` reserve.
  - Well size: `1.75em`
  - Background: solid `#1F83FF`
  - Radius: `10px`
  - Glyph (`+`): `1em`, white, stroke `2.2`
- Title:
  - `Roboto Regular`
  - `sm` token (`0.75em`) for narrow `1x1` cells; bumps to `md` (`0.85em`) only if a specific module needs higher prominence
  - dark text `#102C3F`
  - tight `line-height: 1.2`
- Subtitle:
  - `Roboto Regular`
  - `xs`/below tokens (`0.625em` for the narrowest cells, `0.6875em` otherwise)
  - muted gray `#5F7283`
  - `line-clamp-2` so it never overflows the bottom of the cell
- Do **not** include a decorative eyebrow label like "Quick Action" above the title. The dashed border and blue `+` icon already signal "create new"; the eyebrow adds a third text line that breaks the layout on narrow dashboards.
- Height still comes from the grid span, not from a custom min-height.

## KPI And Summary Widget

Use for top-row stat cards like `Cash Position`, `Receivables Due`, `Active Customers`, etc.

- Usually `col-span-2` when a quick action exists
- Label (above the value): the stat label IS the widget title and uses the shared `Widget Header` title style — `Roboto Regular`, `clamp(16px, calc(var(--dash-inline-size, 100vw) * 0.011375), 17px)`, dark `#102C3F`, `line-height: 1.3`. No subtitle on stat widgets — the meta line beneath the value plays the explainer role instead.
- Value: `1.75em`, `Roboto SemiBold` (weight `600`), tight `line-height: 1.05` (the tight line-height keeps the card compact when meta wraps to two lines). Weight progression: `Roboto Regular` (`400`) → `Roboto Medium` (`500`) → **`Roboto SemiBold` (`600`)** in the 2026-06-19 calibration. SemiBold lets the KPI value carry more presence on the dashboard glass without going full Bold (`700`), which would clash with the row-Bold primaries elsewhere on the dashboard. The em scale ensures the number still scales with every other internal element off the widget-root lever (`clamp(16px, 1.2cqi, 20px)`).
- Meta (below the value): `xs` token (`0.6875em`), muted, `line-height: 1.3` — one step smaller than the label above the value. This protects the hierarchy: the line above the number anchors the metric and the line below explains it, so the explanation reads as secondary.
- Vertical stack gaps inside the card: `0.25em` between label/value and value/meta
- Keep the default widget surface background
- Use color emphasis through:
  - border color
  - value text color
  - small detail or helper text when needed
- Do not use full tinted or semantic gradient backgrounds just to indicate success, warning, loss, or status
- Semantic meaning should come from text, border, and icon treatment while the widget surface stays visually consistent

## Header Stat Pill

Use this single pill pattern whenever a widget header carries a supporting metric beside the title (e.g., `9.7% win rate` / `24 d avg cycle` next to "Opportunity Funnel"; `4 blocked` / `83% on time` next to "Task Queue"; `18 qualified` / `92 min avg follow-up` next to "Prospect Grid").

One canonical shape across every dashboard: a tone-tinted **full pill**, single line, value + lowercase descriptor in one string. Do not introduce white-card label-above-value mini cards for header metadata — they read as inline KPI tiles and compete with the widget body.

- Shape: `rounded-[999px]` (full pill)
- Surface: tone-tinted background (no border). Tone-to-bg pairings:
  - danger / blocked / overdue: bg `#FFE4E4`, text `#A33F3F`
  - success / on-time / win-rate / qualified-positive: bg `#DDF4E8`, text `#0B6B45`
  - info / neutral-metric / qualified-info: bg `#EEF6FF`, text `#0F69AC`
- Padding: `12px` horizontal, `6px` vertical
- Text: `Roboto Bold`, `12px`, color matches the tone above
- Single-line content: `<value> <lowercase descriptor>` in one string. "4 blocked", "83% on time", "9.7% win rate", "92 min avg follow-up". No internal label/value split, no uppercase, no comma separator.
- Pill-to-pill gap inside the header: `8px`
- Pill row sits on the same row as `DashboardWidgetHeader` via `flex items-center justify-between`.
- Choose tone by metric meaning, not by metric type. A "Win Rate" pill is success-tinted because higher is better; an "Avg Cycle" pill is info-tinted because shorter is better but neutral framing reads cleaner; a "Blocked" pill is danger-tinted because it represents work stuck.

When this pill row would push the row beyond the cell at the laptop floor (see `Content Fit Budget`), drop pills before shrinking the header or content rows — pills are the most expendable header element.

## Widget Stat Values

### KPI / Summary Cards (`2x1` and `3x1`)
The canonical KPI stat is **em-based on the widget root** so it scales with the same lever as widget padding, row text, and meta. One knob tunes the whole widget at every dashboard width.

- Default: `1.75em`, `Roboto SemiBold` (`600`), `line-height: 1.05`
- Hero/full-width KPI: bump to `2em` (or `display` token `2.125em`) when the value needs to read at a glance across a wide canvas; keep the SemiBold weight.

Resolved sizes against the widget root clamp `clamp(16px, 1.2cqi, 20px)`:

| Dashboard container width | Widget root | KPI value (`1.75em`) |
| ------------------------- | ----------- | --------------------- |
| ≤ 1334 px (clamp floor)   | 16 px       | **28 px**             |
| 1440 px                   | ~17.3 px    | ~30 px                |
| 1600 px                   | ~19.2 px    | ~33 px                |
| ≥ 1667 px (clamp ceiling) | 20 px       | **35 px**             |

This is a deliberate revision of an earlier rule that specified an explicit `clamp(32px, …·0.025, 64px)`. That clamp pre-dated the 2K Calibration (`Recent Tightening` block above) and was left at a 64 px ceiling while everything else was reduced — KPI values printed up to 83 % larger than other widget content on 2K dashboards. Switching to `1.75em` puts the KPI back on the same scale lever as the rest of the widget.

### Larger Multi-Stat Widgets
Use one consistent repeated-stat style across widgets like Inbox, Calendar, and My Tasks.
- `Roboto SemiBold` (`600`) — was `Roboto Bold` (`700`) before the 2026-06-19 stat-weight unification. Every stat value across the dashboard is now SemiBold so the family reads as one rather than two competing weights.
- `xl` (`1.375em`) for stat blocks; `lg` (`1.125em`) if the widget needs four or more side-by-side numbers
- Repeated rows inside one widget should keep the same number size and weight

## Grid Data Widget

Use this pattern for widgets such as Customer Grid, Follow-up Queue, and AP Invoice Queue.

The hierarchy rule (see `List / Grid Hierarchy Rule`) is non-negotiable here: row cells must be one step smaller than the widget title.

### Header Row

Canonical (rail) treatment — apply to every grid widget header:
- **Background: transparent.** Never tint the header row. The header reads against the same glass surface as the body rows; differentiation comes from typography + divider, not from a bg band. A tinted band breaks the glass aesthetic and reads inconsistently across widgets — some glass surfaces have a stronger gradient than others, so the same hex value (e.g. `#F5FAFD`) prints with different contrast on different widgets and the dashboard feels uneven.
- Size: `0.6875em` (≈11px-eq) — smaller than the row data (`sm` = `0.75em` / 12px-eq) so the header reads as supporting metadata. Was previously `0.625em` / 10px-eq when the header was uppercase; bumped one step after the case dropped to capitalize because lowercase letters carry less optical weight than their uppercase equivalents at the same px value.
- Weight: `Roboto Medium` (500)
- Case: `text-transform: capitalize` (Title Case). Was previously `uppercase + letter-spacing 0.04em` — removed in 2026-06-18 calibration because the all-caps treatment read as "admin form field labels" against the rest of the dashboard. Capitalize keeps the header friendly while size + color + weight + divider all do the differentiation work.
- Tracking: default (no `letter-spacing` override).
- Color: `#41576A` (was `#5F7283` — bumped one step darker in the same calibration so the header reads with more presence against the glass surface).
- Vertical padding: `0.5em`
- The data layer must NOT pre-format header strings — the component applies `capitalize` as a CSS transform so the same backend label flows through other displays unchanged. This rule applies to every grid-style widget header in the system (dashboard widgets *and* line-item grids inside detail forms).

Legacy default treatment (still supported via a `headerVariant="default"` opt-out for grids that pre-date the rail style — do not use for new widgets):
- `Roboto Regular`
- `sm` token (`0.75em`)
- muted gray `#5F7283`
- `text-transform: capitalize`

### Body Rows
- Row padding: `0.625em` vertical, `0.5em` horizontal
- Column gap: `0.75em`

### Row And Header Separators

Separators are **load-bearing**, not decorative. They carry the scan-down rhythm that lets the eye treat a list of rows as a list. Two non-negotiable rules.

**1. The header separator must be DARKER than the body row separator.**

The bottom edge of the header is a section boundary ("below this is data") and reads as a stronger signal than the divider between two equivalent data rows. Without contrast the header dissolves into the row pattern.

| Separator | Tone | Weight | Where |
|---|---|---|---|
| Header bottom divider | `#C5D2DD` | `1px solid` (rail variant **may** use `2px solid` when the body is large/dense) | Below the header row only |
| Body row divider | `#E2EAF1` | `1px solid` | Between every two body rows |
| Footer top divider (if a pager / caption row exists) | `#D9E2EB` | `1px solid` | Above the footer band |

These three tones (`#C5D2DD > #D9E2EB > #E2EAF1`) form a stable hierarchy: header boundary > footer boundary > intra-row dividers. Treat the three as a fixed system; do not introduce a fourth tone.

**2. Separators are never optional.**

- Every body row carries `border-b: 1px solid #E2EAF1`. The **last** row removes its border (`last:border-b-0`) — this is the only exception.
- The header row always carries `border-b: 1px solid #C5D2DD`. There is no "header without a divider" treatment, even in flat-design windows. The header band tint (rail variant) does not replace the divider — it sits **above** it.
- When a footer pager / caption exists, the top border (`border-t: 1px solid #D9E2EB`) is also always present.
- Do not "tighten the look by removing dividers." Removing dividers does not save vertical space (`1px` is negligible) and it destroys the row-counting rhythm. If the panel is too dense, reduce row padding (see `Content Fit Budget`) — never the dividers.
- Borders + dividers stay in fixed `px` (see `Not Scaled With em`). They are physical edges and must not scale with the widget root font-size.

### Cell Types
- Primary row title cell:
  - `Roboto Bold`
  - `sm` token (`0.75em`)
  - dark text `#102C3F`
- Standard body cell:
  - `Roboto Regular`
  - `sm` token (`0.75em`)
  - muted `#5F7283`
- Emphasized value cell:
  - `Roboto Bold`
  - `sm` token (`0.75em`)
  - primary blue `#0083DA` or dark text
- Secondary metadata cell:
  - `Roboto Regular`
  - `sm` token (`0.75em`)
  - muted

All cell types share the same `sm` size. Differentiation comes from weight and color, not size.

### Column Sizing And Truncation

Row-based widgets (Customer Grid, Task Queue, Prospect Grid, AP Invoice Queue, anything similar) must render as **CSS Grid with a single shared column template across the header and every body row**. Flex layouts and per-row intrinsic sizing (`max-content`, `auto`) silently produce different column widths in different rows — when columns don't line up, the eye can't scan vertically and the widget reads as broken.

**Rule 1 — Single shared grid template.**

Use **`minmax(0, Nfr)`** for every column. Fractional units divide the row width proportionally, and the `0` minimum lets cells shrink below content width so the row can't blow out of the cell. Never mix `max-content`, `auto`, or fixed `px` values into the template — intrinsic units measure the widest content of each individual row, so two rows with different data get different column widths and the columns drift.

- The header row and every body row **must use the same `grid-template-columns` string**. Hoist the template into a single shared constant or className when the same widget is rendered in more than one place; never write the template twice.
- Choose proportions by column importance, not by content (`2fr` for the primary identity column, `1fr` for standard metadata, `0.7–0.9fr` for short numeric columns). The total isn't meaningful — what matters is the ratio.
- Column gap on the parent grid (`gap-[12px]`) and cell horizontal padding (`px-[10px]`) come from the grid container, not from each cell. Don't add per-cell horizontal padding that competes with the gap.

**Rule 2 — Every cell truncates and exposes its full value via `title={cellValue}`.**

Every cell — including numeric, currency, amount, and duration cells — gets `truncate` (Tailwind's `overflow-hidden text-ellipsis whitespace-nowrap`) **and** `title={cellValue}` on the same element. Clipping is acceptable; loss of information is not. The `title` attribute exposes the raw value as a native hover tooltip (browsers also announce it to screen readers as an accessible name fallback).

This is a deliberate revision of an earlier rule that forbade clipping numeric columns. The earlier approach (`max-content` + `whitespace-nowrap` on amount columns) broke the shared-template requirement above — it forced amount columns to per-row intrinsic widths, which produced the very column drift this rule is trying to eliminate. Truncate + tooltip is the correct tradeoff: visual alignment wins, the full value is still available on hover.

- Apply `title={cellValue}` to **every cell**, even cells that visually appear to fit at design time. Real data will exceed mocked data once the widget ships; the safety net must be in place before then.
- The tooltip carries the **raw** cell value, not a description ("Customer name") or formatted prose. The user already knows the column label from the header.
- For composite cells (primary + secondary line), set `title` on each line independently. Don't combine into a single string on the parent.
- Right-align numeric / currency / duration columns (`text-right`) so values line up across rows even when widths are equal — left-aligned numbers in equal-width columns still read as a jagged column edge.
- Do not use `alt` for plain text. `alt` is for images and form controls. Use `title` for tooltips on text.

Reference implementation (Active Customers, Frame2 in `WidgetOnWindowHome.tsx`):

```tsx
const customerGridCols =
  "grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.7fr)]";

// Header row — same template, same gap, same horizontal padding
<div className={`grid ${customerGridCols} gap-[12px] border-b border-solid border-[#e8eef3] px-[10px] pb-[8px]`}>
  {headers.map((h) => (
    <p
      key={h.label}
      className={`truncate text-[13px] capitalize text-[#748494] ${h.align === "right" ? "text-right" : ""}`}
      title={h.label}
    >
      {h.label}
    </p>
  ))}
</div>

// Body row — identical template
{rows.map((row) => (
  <div key={row.name} className={`grid ${customerGridCols} items-center gap-[12px] border-b border-solid border-[#edf2f6] px-[10px] py-[10px] last:border-b-0`}>
    <p className="truncate text-[14px] font-bold text-[#102c3f]" title={row.name}>{row.name}</p>
    <p className="truncate text-[13px] text-[#5f7283]" title={row.contact}>{row.contact}</p>
    <p className="truncate text-[13px] text-[#102c3f]" title={row.stage}>{row.stage}</p>
    <p className="truncate text-right text-[13px] font-bold text-[#1f83ff]" title={row.value}>{row.value}</p>
    <p className="truncate text-right text-[13px] text-[#5f7283]" title={row.response}>{row.response}</p>
  </div>
))}
```

Anti-patterns to call out in review:
- Flex (`flex flex-row`) on row layout. Use grid.
- Mixed grid templates between header and body. They must be identical.
- `max-content` / `auto` / fixed `px` on any column in the template. Use `minmax(0, Nfr)` only.
- `whitespace-nowrap` without `truncate` (causes overflow into the next column).
- Missing `title` on any truncated cell — including amount cells, including cells that "obviously fit" in the design data.

## Data Table / Worklist Widgets

- Use simple row layout, not nested cards
- Header row muted, `sm` (`0.75em`)
- Body row cells `sm` (`0.75em`); first column may be bold, others regular and muted
- Title cell bold, `sm` (`0.75em`)
- Metadata (secondary line under a cell): `xs` (`0.6875em`), muted
- Use CSS grid columns for clean alignment
- The widget title above the table uses the shared header (see `Widget Header`) — `clamp(16px, calc(var(--dash-inline-size, 100vw) * 0.011375), 17px)`, Roboto Regular, dark `#102C3F`

## List Widget (`FinanceListCard` pattern)

Use this pattern for widgets that render a vertical list of label/value/meta items, such as `Position by Source` or `Open Payables Mix`.

- Widget title: see `Widget Header` — `clamp(16px, calc(var(--dash-inline-size, 100vw) * 0.011375), 17px)`, Roboto Regular, dark `#102C3F`
- Widget subtitle: see `Widget Header` — `clamp(12px, calc(var(--dash-inline-size, 100vw) * 0.009625), 13px)`, Roboto Regular, muted `#717182`
- List row container: bordered bottom divider per row except the last
- List row padding: `0.625em` vertical
- Item label (left): `Roboto Bold`, `sm` (`0.75em`), dark
- Item meta (left, under label): `Roboto Regular`, `xs` (`0.6875em`), muted, `line-height: 1.3`
- Item value (right): `Roboto Bold`, `sm` (`0.75em`), blue or dark depending on emphasis
- Item label and value share the same `sm` size; the secondary meta sits one step below at `xs`

## Dynamic Rows Widget

Use this for DIY/configurable widgets where the widget structure is fixed but the published row data is user-defined.

- Single-line title only
- No icon
- No subtitle
- Repeated rows only
- Right-side badge/value only
- No mini-card treatment inside the widget
- Use the same simple row/divider language as grid/list widgets

### Row Model
- Every row is single-line only
- Left side: one text value
- Right side: one badge or compact value
- No secondary metadata line
- No row titles/header row inside the body
- If text is too long, truncate it

### Typography
- Row text:
  - `Roboto Medium`
  - `sm` token (`0.75em`)
  - dark text `#102C3F`
- Badge/value:
  - `Roboto Bold`
  - `sm` token (`0.75em`)

### Visual Rules
- Rows use one shared repeated style across the whole widget
- Bottom dividers separate rows
- Keep the default widget surface background
- Number badges should use one shared visual style across all rows in the same widget
- Do not assign a different badge style per row unless the widget is explicitly designed as a status-coded exception
- Row padding and gap should use responsive relative units (`em` against the widget root anchor) rather than fixed pixels so density scales with screen resolution and widget size

### Overflow Behavior
- Do not introduce a visible inner scrollbar when the row count exceeds the available height
- Page the rows instead
- Use vertical up/down arrow buttons on the right edge of the widget
- Keep the button style aligned with the compact widget pagination controls
- Show page text between the two controls, for example:
  - `1 of 3`

## Widget Footer Pager

Use one consistent pager pattern for pageable widgets.

- Footer layout: two zones
  - left: optional helper or result text
  - right: compact pager control
- Footer should align to the full widget width.
- Footer content should sit on one horizontal row.

### Left Helper Text
- Use only when the widget benefits from context such as:
  - result range
  - total count
  - sort state
  - queue state
- Example patterns:
  - `Showing 1–6 of 36`
  - `Showing 1–6 of 36 · Sorted by oldest pending`
  - `6 pending reviews`
- Typography:
  - `Roboto Regular`
  - `0.75em` (≈ `12px` at the 16px baseline; previously `0.8125em` / `13px`. Lowered so the helper text reads as supporting metadata and never overpowers the row data above it on wide screens.)
  - muted gray such as `#748494`
- Keep the copy short and operational.

### Right Pager Control
- Layout: left arrow, page text, right arrow
- Keep all three parts visually grouped as one compact control.
- Page text sits between the arrows, not below them.
- Example text:
  - `1 of 6`
  - `< 1 of 3 >`
- Preferred typography for page text:
  - `Roboto Medium`
  - `0.8125em` (≈ `13px` at the 16px baseline; previously `0.85em` / `14px`. The page text now sits one notch above the helper instead of two, keeping the pager visually balanced as chrome rather than primary content.)
  - dark text such as `#102C3F`

### Pager Buttons
- Shape: rounded square or soft capsule, not circular by default
- Overall button size: `24px` square (small, sits inline with the helper text without dominating). On unusually large pager surfaces (e.g. a full-window status bar pager), `32px` is also acceptable — but widget pagers must use `24px`.
- Background:
  - default: soft white or pale tinted surface
  - hover: slightly stronger blue-tinted surface
- Border: optional light border such as `#D9E2EB`
- Chevron icon: `14px` (sized to fit comfortably inside the `24px` button with ~5 px of padding)
- Icon color:
  - default: primary blue `#0083DA`
  - disabled: muted `#B8C6D2`
- Keep the left and right arrows visually symmetric.

### Alignment Rules
- Left helper text stays left-aligned.
- Pager control stays right-aligned.
- If no helper text is needed, keep the pager on the right rather than centering it.

### Labeled State Switcher Variant

Use this when the widget is paging conceptual states rather than numbered record pages.

- Example:
  - `< Previous | Today | Upcoming >`
  - `< Yesterday | Today | Tomorrow >`
- Keep labels short and operational
- Active state should be obvious through stronger text color and/or weight
- Use the same footer region as the standard pager, not a separate floating control
- Prefer this pattern for agenda, schedule, and timeline widgets

Do not infer:
- do not reuse the larger window status-bar pagination pattern inside widgets
- do not center widget pagination by default
- do not use circular-only arrow buttons as the only option; prefer the compact rounded-square/capsule treatment
- Footer should not compete with primary widget content.

### Behavior Rules
- Use this footer pattern for widgets with list, queue, or record pagination.
- Avoid oversized navigation buttons.
- Do not mix this widget pager style with the heavier window status-bar pager.
- Keep the same footer rhythm across widgets even if the helper text changes.

## Full-Width Dashboard Search Widget

Use as a `1x9` full-width dashboard utility widget when a module needs a single primary search surface at the top of the dashboard.

- Span full dashboard width
- Keep full one-row dashboard height
- Outer wrapper uses only vertical padding (`18px` top and bottom); no horizontal padding, so the inner search block measures from the true widget edges.
- Inner search-field block width: **`80%`** of the widget. Centered horizontally.
- Inner block uses widget-style glass chrome (border, gradient, radius `14px`, shadow).
- Inner block padding: `18px` horizontal, `16px` vertical.
- Inner block follows the em-based widget scale; set `font-size: clamp(16px, 1.2cqi, 20px)` on the block so internal `em` values resolve consistently. The search icon scales at `1.125em` and the input text at `0.85em`.
- Search area should sit vertically centered in the widget
- The outer widget stays transparent
- Search field should be a real editable input
- Placeholder text should be module-specific
- Do not add title or subtitle unless a design explicitly needs them

## Module-Specific Dashboard Patterns

### Calendar
- top row uses `New Meeting` quick action plus four KPI widgets
- main schedule uses `6` columns
- Today agenda uses the `3`-column support panel

### Tasks
- top row uses `New Task` quick action plus four KPI widgets
- main queue uses row or table layout
- focus board and workload spread use simple rows, not mini cards

### Prospects
- top row uses `New Prospect` quick action plus four KPI widgets
- prospect grid shows company, contact, source, score, stage, value, and response time

### Opportunities Dashboard
- use widget header rules
- keep pipeline and active opportunity widgets aligned to the shared grid and list-data rules
