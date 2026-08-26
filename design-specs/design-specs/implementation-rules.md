# Implementation Rules

Purpose:
- Engineering-side constraints and source references for implementing the design system safely

Canonical for:
- Code wrapper patterns
- Layout implementation constraints
- Source ownership notes

Last updated:
- 2026-07-13

## Stack And Main File

- Stack: React, TypeScript, Vite, Tailwind CSS utilities
- Main UI implementation currently lives in `src/imports/WidgetOnWindowHome/WidgetOnWindowHome.tsx`
- Global styles live in `src/styles`

## Coding Rules

- Use Tailwind utilities and existing arbitrary values consistently.
- Prefer local component patterns already in the file before introducing new abstractions.
- Keep CSS values explicit when matching Figma or an approved existing widget.
- Do not introduce unrelated framework changes.
- Do not replace the app-wide visual language when adding a single widget or screen.
- Do not “fix” layout mismatches by adding one-off hardcoded heights or margins if a shell/grid formula already exists in the spec.

## Reference HTML Workflow

When a user attaches or links reference HTML (a snippet, a full-page mockup, a Figma-exported markup, or hand-written markup) as the seed for a feature, follow this split:

- **Layout is authoritative in the reference.** The design spec is authoritative for tokens.
- Take the *what* and *where* from the reference. Take the *how it looks* from the spec.

### What "layout" covers (copy from the reference, do not restructure)

- DOM structure: number and order of sections, nesting hierarchy, sibling relationships.
- Composition: grid vs stack, column count, row count, which sections sit side-by-side vs stacked.
- Visible affordances present in the reference: leading icon column, summary/total row, pager, filter chip row, tabs, header count/meta line, empty-state slot.
- Full-view composition when the reference shows one: if the reference includes a window shell + a card + a right panel + a bottom panel, honor all four surfaces and their relationships (which panels are open by default, what the panel switcher exposes, what the header actions are, panel widths). Do not silently drop or rearrange them.

### What "styling" covers (override the reference, apply spec tokens)

- Font sizes → shared em token set (`0.6875em` chip/header, `0.75em` grid cell, `0.875em` row title, `1em` section title, `1.125em` hero title). Never keep a hardcoded `text-[12px]` / `text-[14px]` from the reference on a panel body.
- Colors → foundation palette hex values. Snap any near-match (e.g., `#0080D0` → `#0083DA`, `#5F7284` → `#5F7283`).
- Spacing / padding / gaps → em spacing scale on panel bodies and widgets, `px` on chrome.
- Panel body anchor → canonical `clamp(18px, 1vw, 20px)` per `windows-and-panels.md > Panel Foundation > Rule 3`.
- Section Header treatment → `mt-[0.5em] mb-[0.5em] pb-[0.375em] border-b border-solid border-[#E2EAF1]` per `feedback_section_header_underline_and_breathing.md`.
- Radii, borders, shadows, dividers → `px`, spec palette.
- Icon set → the project's canonical icons; do not import a new library because the reference used one.

### When the reference conflicts with a hard spec rule

- Flag the conflict to the user before proceeding. Do not silently "fix" the reference by rewriting the layout, and do not silently violate the spec.
- Common conflicts to name explicitly:
  - Reference has an inner scroller inside a widget → spec forbids inner scrollbars in widgets. Flag.
  - Reference wraps a list container in an outer border → spec says outer list containers never carry borders. Flag.
  - Reference uses a bottom-panel gradient → spec says bottom panels are solid `#FFFFFF`. Flag.
- Once flagged, let the user decide: keep the reference layout as an intentional exception, or restructure to the spec.

### When the reference is partial

- If only one primitive is shown (e.g., just a Data Grid), the reference binds only that primitive. Surrounding sections use spec defaults.
- If only a panel body is shown, do not infer the panel header, switcher, or width — either apply spec defaults or ask the user.
- Do not extrapolate a full window from a card-level reference. Ask instead.

### Verification

Before considering a reference-driven feature "done":

- Structural check: side-by-side the rendered UI with the reference. Same section count, same order, same nesting, same affordances present?
- Token check: no hardcoded `text-[Npx]`, `mt-[Npx]`, `gap-[Npx]` values inside a panel body or widget body (chrome exceptions apply — see `windows-and-panels.md > Panel Foundation > Rule 2`).
- Foundation check: canonical panel anchor set, form-control reset applied, container-type present, panel background solid white.
- **Audit check:** run `review-checklist.md > Panel HTML Token Audit` end-to-end. Reference-file sizes drift silently — the audit surfaces `0.625em` labels, `1.25em` H1s, `1.1875em` KPI values, weight-`600` metric values, third-tier chips, and row-inheritance traps in one pass. Do the audit before writing, not after; the sunk-cost of correcting a shipped panel is higher than the 2-minute upfront walkthrough.

## Dashboard Implementation Pattern

Use this exact wrapper shape for any module dashboard so widget sizing stays locked to the shared spec (see `dashboard-widgets.md`):

```tsx
<div className="flex h-full flex-col overflow-hidden">
  <div
    className="flex-1 overflow-auto px-[12px] pt-[12px] pb-[12px]"
    style={{ containerType: "inline-size" }}
  >
    <div
      className="grid grid-cols-9 gap-[12px]"
      style={{ gridAutoRows: "calc((100cqw - 96px) / 9)" }}
    >
      {/* widget cells */}
    </div>
  </div>
</div>
```

Padding is uniform at **`12px`** on every edge — and that value is **deliberately the same as the inter-widget grid gap (`gap-[12px]` on `grid-cols-9`)**. Tying the wrapper padding to the grid gap means the rhythm reads as one continuous lattice: the gap between the top bar and the first widget row matches the gap between any two widget rows, the left wrapper edge to the first widget column matches the gap between columns, and so on. If the grid gap ever changes, the wrapper padding moves with it.

History: padding was `18px` symmetric → `12px` symmetric → `0 top / 12 bottom` → `4 top / 12 bottom` → **`12px` uniform (locked to the grid gap)**. The earlier asymmetric attempts came from trying to "fix" the top gap visually before realizing the right answer was to match it to the inter-widget gap (the dashboard now reads as a continuous grid down from the top bar). The grid formula `(100cqw − 96px) / 9` is unaffected at every step because `cqw` resolves against the container's inline size, not its padding.

- `container-type: inline-size` is required on the scroll wrapper so `cqw` units inside resolve to its content-box width.
- `grid-auto-rows: calc((100cqw - 96px) / 9)` locks every row to one column width, making 1x1 widgets square and every other size a clean multiple.
- Do not add per-cell `min-height`/`height` overrides. The grid track owns the height.
- Each widget cell that may have variable content should be `flex min-h-0 flex-col overflow-hidden`.
- When content would overflow, prefer pagination/state-switching controls over inner widget scrollbars.
- Use `DashboardWidgetHeader` for the title region; do not invent ad-hoc header markup.
- Use the shared new-record / quick-action widget pattern for dashed `1x1` record-creation tiles; do not hand-place the `+` icon differently per module.
- For KPI/summary widgets, keep the default glass surface and encode semantic emphasis with border/text only; do not introduce one-off success/error background fills.
- New dashboards copy the structure used by `Frame2` (CRM) and `CalendarView` in `WidgetOnWindowHome.tsx`.

### Widget Root Internal Sizing

Every widget root sets the canonical `cqi`-based clamp so the widget's internal `em` units resolve correctly:

```tsx
<div
  className="...widget-surface-classes..."
  style={{ fontSize: "clamp(16px, 1.2cqi, 20px)" }}
>
  {/* widget content; all internal text/padding/gap in em */}
</div>
```

- The `container-type: inline-size` declaration already sits on the dashboard grid wrapper (above), which is the ancestor `cqi` resolves against. No extra container setup is needed per widget.
- See `dashboard-widgets.md` → `Widget Internal Sizing` for the type and spacing scales every widget should pull from.
- Borders, radii, and shadows on the widget surface stay in `px` — they are physical edges and should not scale with the root.
- Inline `style={{ fontSize: ... }}` is preferred over a Tailwind utility for the widget root anchor so the value is visible in code review and trivial to translate to the .NET / production CSS (e.g. as a single `.widget { font-size: clamp(...); }` declaration).

Do not infer:
- do not size widget roots from content
- do not add `min-h-*` to stabilize pageable widgets
- do not mix multiple dashboard row-sizing formulas within the same module
- do not introduce visible inner scrollbars for grid/list/queue widgets when paging or state-switching is the real UX need
- do not nest a widget inside another widget that sets its own `font-size`; `em` would compound. Each widget anchors its own base.
- do not put widget-internal sizes in `px` once a widget has been migrated to the em scale — that defeats the single-lever benefit and breaks the hierarchy rule

## Window Implementation Guidance

- When a right panel exists, derive the left workspace width from the full right-shell width.
- Use one shell contract for:
  - form/workspace width
  - bottom-panel width
  - right-panel width
- If the active right panel changes width, the left workspace must reflow from the same shell calculation.
- Keep scroll ownership explicit:
  - fixed shell layers stay fixed
  - only the intended content region scrolls

## Interaction Rules

- Whole left-list cards are clickable for selection.
- Edit icons inside list cards are visual affordances unless a separate edit interaction is intentionally implemented.
- Keep hover states subtle unless the element must strongly advertise clickability, such as an expand/collapse strip.

## Source References

- Main implementation: `src/imports/WidgetOnWindowHome/WidgetOnWindowHome.tsx`
- Local theme or token styles:
  - `src/styles/theme.css`
  - `src/styles/fonts.css`
  - `src/styles/tailwind.css`

## Documentation Maintenance Rule

- Add new reusable UI rules to the most focused spec file possible.
- Keep `design.md` as the index only.
- If a new rule spans multiple systems, document the primary rule in the most relevant focused file and add a short cross-reference in another file only if needed.
