# Windows And Panels

Purpose:
- Canonical rules for all window-family screens, including forms, card view, header/bottom/right panels, and right-side action rails

Canonical for:
- Window states
- Detail-view form layouts
- Panel shell relationships
- Right-panel behavior

Last updated:
- 2026-07-22

## Panel Foundation (Applies To Every Panel Type)

Every panel — right, bottom, header, or detail pane inside a panel — implements the **same** contract. Different panels vary the anchor value (per-surface tuning) but the pattern is identical: one place sets the font-size context, and every child inside that container resolves against it. Without this contract, chips, entity rows, timeline entries, and any other em-based token render at different physical sizes across surfaces even when their CSS is identical, because the browser default `font-size` on nested `<button>`, `<input>`, `<textarea>`, etc. is not `16px` — it's whatever the user-agent chose (Chrome uses `~13.33px`). Every em-based value inside a button silently shrinks.

**Every panel implementation MUST include these five rules on the panel wrapper + body. No exceptions.**

### 1. Panel wrapper — container query root

```css
.panel {
  container-type: inline-size;   /* required — anchors resolve cqi against panel width */
  background: #FFFFFF;            /* per panel-white rule */
  border: 1px solid #D9E2EB;      /* standard content border */
  border-radius: 16px;            /* large-panel radius */
  box-shadow: 0 10px 24px rgba(15, 61, 97, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

> **Bottom-panel exception.** The `border`, `border-radius`, and `box-shadow` above assume a panel that floats against the app background (right / header / detail pane). Bottom panels sit **flush against the workspace above them inside the module wrapper**, so the same chrome creates a double outline and a floating shadow where none should exist. Bottom panels override this block — see [Bottom Panel Layout > Chrome Overrides](#chrome-overrides-for-bottom-panels). Right panels, header panels, and detail panes use Rule 1 as written.

### 2. Panel header — chrome, unaffected by the anchor

```css
.panel-header {
  height: 56px;
  flex: none;
  padding: 0 16px;
  border-bottom: 1px solid #D9E2EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* header stays at document baseline 16px — its em resolves against 1em = 16px */
}
```

### 3. Panel body — sets the em anchor

```css
.panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.125em 0.875em;
  display: flex;
  flex-direction: column;
  gap: 0.875em;

  /* THE canonical anchor — SAME three-line block for every panel type */
  container-type: inline-size;                    /* enables cqi inside primitives */
  --panel-anchor: clamp(18px, 1vw, 20px);         /* single source of truth */
  font-size: var(--panel-anchor);
}
```

**One canonical anchor formula applies to every panel type — right, bottom, header, detail pane, and any future dialog / drawer / side sheet.** Every panel body writes the identical three lines shown above; there is no per-panel-type tuning. Because the anchor uses `vw` (viewport width) rather than `cqi` (container inline-size), it resolves to the identical computed value on every panel that lives inside the same window — right and bottom panels on the same screen read at the same physical size *by construction*, not by hand-tuning per-panel coefficients.

- Rendered range: `18–20px`.
  - `≤1800px` viewport → `18px` (floor) — covers every mainstream laptop
  - `1800–2000px` viewport → linear ramp `18→20px`
  - `≥2000px` viewport → `20px` (ceiling)
  - Historical: the anchor was `clamp(16px, 1vw, 18px)` until 2026-07-13. Users reported panel body content sitting around 11–14px on laptop screens felt too small for hours-long operational reading. The bump lifts the floor from `16px` to `18px` and the ceiling from `18px` to `20px`; every em-based token inherits the ~12.5% uplift, so `0.6875em` chips go from `~11px` to `~12.4px`, `0.75em` grid body cells from `~12px` to `~13.5px`, `0.875em` row primaries from `~14px` to `~15.75px`, and `1em` section headers from `16px` to `18px`. See `changelog.md > 2026-07-13`.
- `container-type: inline-size` remains on every panel body, but only so **primitives inside** the panel (widgets, tiles) can use `cqi` for their own internal responsiveness. The anchor itself does not depend on container-type ancestry — a panel is portable and self-contained.
- The intermediate `--panel-anchor` variable is optional but recommended: it lets primitives inside the panel reference the anchor value (e.g., for row-height math) without hard-coding the clamp again.
- **Root / workspace setup is out of scope for panel developers.** A panel drops into any host as long as the three lines above are present on its scrollable body. No ancestor must set a container-type or CSS variable for the anchor to work.
- Deprecated: any per-panel-type coefficient (previously `clamp(16px, 3cqi, 18px)` for right, `clamp(16px, 1.5cqi, 18px)` for bottom). These are structurally fragile — two independent teams cannot keep two tuned coefficients in sync — and are replaced by the single formula above.

### 4. Panel body reset — force nested form controls to inherit

**This is the rule most implementations forget, and it is the direct cause of chips-look-inconsistent bugs.** Without this reset, any chip or em-based content sitting inside a `<button>`, `<input>`, `<select>`, `<textarea>`, or `<optgroup>` inherits the user-agent's default font-size (~`13.33px` in Chrome), not the panel body's anchor. Two chips with byte-identical CSS then render at ~`19px` outside a button and ~`16px` inside one.

```css
.panel-body button,
.panel-body input,
.panel-body select,
.panel-body textarea,
.panel-body optgroup {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}
```

Scope the selector to `.panel-body` (or an equivalent panel-body class) — not to `*` — so the reset doesn't leak into chrome elements outside panel bodies (topbar buttons, action-bar buttons, etc. that may want their own sizing).

**The reset sets the child context, not the button's display size.** `font-size: inherit` on `<button>` ensures chips, icons, and other em-based children inside the button resolve against the panel anchor — but the button label itself would render at the anchor value (`18–20px`) if the button carries no other `font-size`. Every `<button>` inside `.panel-body` must carry an explicit sizing class — `.panel-btn`, `.action-pill`, `.section-action`, or another named pattern (see [foundations.md > Panel Button](./foundations.md#panel-button)). Do not repair oversized buttons by changing the reset to a numeric em value (e.g., `0.8em`): that scales every chip inside every button down proportionally and re-introduces the chip-inside-button size drift the reset exists to prevent.

### 5. What stays in `px`, what is `em`

- **`px`** — borders, dividers, radii, dot markers, shadow offsets. Physical edges. Never scale with text.
- **`em`** — every text size, padding, margin, gap, and internal element height that should scale with the anchor. This is what makes the shared token set (`0.75em` grid body cell, `0.6875em` chip, `0.875em` row title, `1em` section title) render at readable sizes across every panel type without duplication.

### Enforcement

- Any panel implementation missing `container-type: inline-size` on the panel body: broken for primitives that use `cqi` internally.
- Any panel implementation missing the anchor `font-size` on `.panel-body`: broken (every em inside resolves against the parent's font-size, which varies by ancestor container).
- Any panel implementation setting the anchor to a value other than `clamp(18px, 1vw, 20px)` (or the equivalent `var(--panel-anchor)`): broken — the whole point of the single formula is that right and bottom panels compute the same size on the same window. A one-off coefficient defeats it.
- Any panel implementation missing the form-control reset: broken (see the chip-inside-button bug above).
- Any `<button>` inside `.panel-body` without an explicit sizing class: broken — the label renders at the anchor value (`18–20px`) instead of the interactive-label tier (`0.8125em`). Use `.panel-btn`, `.action-pill`, `.section-action`, or another named pattern (see [foundations.md > Panel Button](./foundations.md#panel-button)).
- The five rules above are non-optional. Reviewers should reject panel implementations that omit any of them.

Every panel-type section below (`Bottom Panel Layout`, `Right Panel`, `Window Header Panel`) reuses this foundation as-is. Panel-type sections specify only their content primitives, widths, and layout — they never restate or override the anchor.



This is the canonical spec for all window-related UI behavior, including:
- grid, card, and detail states
- detail-view form layout
- form fields
- field groups
- action cells inside forms
- window action bars
- header panels
- bottom panels
- right panels
- right-side action rails

## Window Screen States

Window workflows may support up to three content states:
- `grid view`
- `card view`
- `detail view`

These are content states inside a window workflow and do not replace the higher-level screen variants.

## Window / Detail Screen Layout

- Typical layout: left record area plus right workspace, or a full white working surface depending on module
- Window/detail workspace background should use a white or approved translucent surface
- Prefer simple rows, tabs, detail sections, and structured lists instead of nested dashboard cards

## Detail View Screen

Detail view is a window screen state used for record review or editing.

### Form Grid Rules
- Detail forms may use `1`, `2`, `3`, or `4` active columns.
- `4` columns is the default full form layout.
- `3` columns is useful when a right panel is added.
- `2` columns may be used for denser centered forms.
- `1` column may be used for narrow forms or stacked mobile-like detail views.

### Centered 2-Column Variant
- Use an outer 4-column wrapper.
- Keep only the middle 2 columns active.
- Left and right outer columns remain empty as visual gutters.

### Layout Rules
- Form sits on the white or approved working surface.
- Fields may span `1`, `2`, `3`, or all active columns.
- Field placement should group related inputs closely.
- Use section hierarchy only when needed.

Examples:
- `4-column` default finance or customer detail form
- `3-column` form when a right panel is added
- centered `2-column` payment-entry style form
- `1-column` stacked detail form for a narrow or guided workflow

## Form Field

Use this as the default Onfinity form field pattern.

### Structure
- White surface
- Bottom-border-only treatment by default
- Default bottom border color: `#D7D7D7`
- Flat operational feel, not card-like
- Typical field padding: `12px` horizontal and `8px` vertical

### Content
- Label above value/input text
- Label:
  - `Roboto Regular`
  - `0.75em`
- Value text:
  - `Roboto Regular`
  - `1em`
- Label-to-value gap: about `6px` to `8px`
- Keep the value closer to the underline than a loose marketing-style field

### Left Icon Variant
- Optional left icon block
- Square, fixed `34px x 34px`
- Subtle border
- Vertically aligned to the middle of the field content

### Right Utility Icons
- Examples: dropdown arrow, calendar trigger, more menu
- Use primary blue for interactive right-side icons
- Hover-only utility icons may be hidden until hover or focus

### Hover And Focus
- On hover, bottom border changes from grey to primary blue
- Focus follows the same underline emphasis direction unless a stronger focus state is intentionally designed

### Disabled State
- Keep disabled fields flat and understated
- No filled background
- Softer bottom border only
- Muted label, value, and icon
- Hide hover-only utility actions
- Keep the same layout rhythm as enabled fields

## Field Groups

A detail view may be built:
- without field groups, using direct form rows
- with field groups, using collapsible grouped sections when hierarchy is needed

### Field Group Header
- Full-width row inside the active form grid
- Title only, no subtitle by default
- Title color black
- Title size `1em`
- Title weight strong or bold
- No bottom border
- Include vertical padding so sections feel clearly separated
- Right-side chevron or toggle affordance controls expand/collapse

### Behavior
- Group header may expand or collapse the fields beneath it
- Use only where hierarchy helps comprehension
- Do not wrap the very first top block in a field group if the screen reads better with plain fields

## Form Action Cells

Use action cells inside the detail-view grid when buttons need to live inside the form layout rather than in the header panel.

### Rules
- Action cell may span `1` to `4` active columns
- Action cell may also span the full active row
- Inner button alignment can be:
  - left
  - center
  - right
  - space-between when explicitly needed
- No bottom border by default on action cells
- Good for contextual form actions, not global screen actions

### Placement
- Prefer action cells at the end of a logical section or on the last row of a field group
- Use full-row action cells when the action set should read as a stronger section-level action area

## Toggle And Switch Fields

- Toggle or switch controls inside detail forms should not use the underline field border
- Treat them as standalone controls
- Icons may be optional per switch row

## Section Hierarchy Guidance

When explicit grouping is needed, use field groups instead of ad hoc oversized colored headings.

Use field groups for:
- large forms with multiple conceptual sections
- collapsible sections
- repeated section patterns across record types

Use plain top form blocks for:
- the first visible detail block when hierarchy is already obvious
- short forms where grouping would add unnecessary visual weight

## Card View Pattern

Use this when the right detail pane is closed but users still need more context than a plain table.

- Card view belongs to the window family, not the dashboard family
- Use flatter operational cards
- Structure should come from internal alignment and spacing, not many nested borders

### List Card View
- vertical list of cards
- may coexist with an open right detail pane
- selected cards use left blue rail and selected treatment

### Expanded Card-Row View
- used when the right pane is closed
- should still feel card-based rather than becoming a spreadsheet
- may use values only, without inline labels, when that reads cleaner

## Left Record List Card

Used in Sales Proposal and Opportunities list views.

- Width about `380px` in list modes
- Full-row clickable surface
- Padding about `18px`
- Border bottom: `#EBEBEB`
- Selected state uses a left blue rail and a readable overlay treatment
- Avoid nested buttons inside the full clickable card

## Window Action Bar

This bar belongs to window screens only.

- Sits directly below the module title bar
- Background uses the approved pale blue gradient
- Horizontal padding: `14px` to `16px`
- Vertical padding: `7px` to `10px`
- Left cluster for compact screen actions
- Right cluster for search, filter, overflow, and related utilities
- Must not appear on dashboard/widget screens, even if those screens are opened from left navigation

## Window Header Panel

Use when a window screen needs a fixed header extension below the action bar.

- Lives below the window action bar
- Does not scroll with content
- Should feel sleek, light, and integrated with the shell
- Prefer action-first usage
- Avoid large stat blocks unless a design explicitly needs them
- Do not duplicate actions between the window action bar and the header panel

Do not infer:
- opening a screen from left navigation does not automatically mean it gets a header panel
- if a header panel exists, it must stay outside the scrolling content
- do not duplicate save/action buttons between the header panel and action bar

## Bottom Panel Layout

A bottom panel may be used with window screens for contextual content such as analysis, timeline, quick actions, notes, or summaries.

### Modes
- `split-scroll`
  - top workspace and bottom panel scroll independently
- `stacked-scroll`
  - the whole page scrolls as one stacked layout
  - use when the bottom panel should grow naturally and avoid inner scrolling by default

### Shared Rules
- Keep a clear gap between the top workspace and the bottom panel
- **Bottom panel background is solid white (`#FFFFFF`).** Do not use tinted gradients (e.g. `linear-gradient(180deg, #fbfdff, #f6fbff)`) or pale-blue washes — the bottom panel is a working surface for grids, line items, and summary stacks; a white background makes flat data grids read cleanly and removes the visual heaviness of an extra layer beneath the chrome. The top edge of the panel still gets a `1px solid #DCE6EE` divider so it reads as a section boundary against the workspace above.
- Bottom panel content should have balanced left and right padding
- When a right-side rail or right panel exists, reserve space inside the inner bottom-panel content instead of shrinking the whole band unevenly
- Bottom panel width must follow the same left workspace width as the detail form above it

### Chrome Overrides For Bottom Panels

Panel Foundation Rule 1 assumes a panel that floats against the app background (right / header / detail pane). Bottom panels are different — they sit flush against the workspace above them, inside the module's own bordered/shadowed wrapper. Apply Rule 1's `container-type`, `background`, `overflow`, and flex layout **as written**, but override its edge chrome:

```css
.bottom-panel {
  container-type: inline-size;   /* Rule 1, unchanged */
  background: #FFFFFF;            /* Rule 1, unchanged */
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* --- Overrides against Rule 1 --- */
  border: none;                                 /* was: 1px solid #D9E2EB (four sides) */
  border-top: 1px solid #DCE6EE;                /* single top-edge divider */
  border-radius: 0;                             /* was: 16px */
  box-shadow: none;                             /* was: 0 10px 24px rgba(15,61,97,0.06) */
}
```

Why each override:

- **`box-shadow: none`.** Rule 1's widget-style shadow makes a right / header / detail pane read as a floating card against the app background. On a bottom panel, that same shadow falls onto the workspace directly above it — producing a visible gray band inside the module. This is the exact symptom developers ship when they apply Rule 1 verbatim. There is no floating relationship to reinforce; the top-edge divider carries the entire section-boundary signal.
- **`border: none` + `border-top: 1px solid #DCE6EE`.** Rule 1's four-sided `1px solid #D9E2EB` clashes with the module wrapper's own border (double outline down the left/right/bottom) and uses a slightly cooler tone than the bottom panel's top divider (`#DCE6EE`). Reducing to a single top-edge divider both eliminates the double outline and uses the correct tone.
- **`border-radius: 0`.** Rule 1's `16px` radius produces a rounded top edge that exposes the workspace above at the top corners (a wedge of app background bleeds through the rounded corner). Bottom panels meet the workspace above with a flat edge; the module wrapper's own `border-radius: 16px` carries the outer rounded shape for the whole window.

Everything else in Rule 1 — `container-type: inline-size`, solid white background, `overflow: hidden`, `flex-direction: column`, the Rule 3 anchor block on `.panel-body`, and the Rule 4 form-control reset — applies unchanged. Only edge chrome differs.

Do not re-introduce shadow, radius, or four-sided border on a bottom panel to match a mockup that used the right-panel treatment by mistake. If the mockup shows a shadow around a bottom panel, the mockup is wrong — flag it and use this override block.

### Bottom Panel Header
- May include title on left and contextual meta on right
- Use simple, low-noise styling

### Body Anchor

Bottom panels use the **canonical panel anchor** defined once in `Panel Foundation > Rule 3`: `clamp(18px, 1vw, 20px)`, applied via the shared three-line block (`container-type: inline-size` + `--panel-anchor` + `font-size: var(--panel-anchor)`). No bottom-panel-specific coefficient — the whole point of the single-formula rule is that bottom and right panels compute the same size on the same window.

- **What stays in `px`**: borders, dividers, radii, dot markers, shadow offsets. Physical edges — do not scale with text.
- The bottom-panel header (title + meta row) is chrome, not body content — keep it at document-baseline `1em`, unaffected by this anchor.
- Rule of thumb: rendered anchor `18–20px` on any panel (bottom, right, header, detail pane); `16–20px` on dashboard widgets. Grid body cells at `0.75em` therefore land at `~13.5–15px` on panels and `~12–15px` on widgets — the shared token set (`0.75em` grid body cell, `0.6875em` grid header, `0.875em` row title, `1em` section title, three-tone divider hierarchy — see `dashboard-widgets.md > Grid Data Widget`) is what keeps sizes consistent across surfaces; the anchor is what maps those tokens to physical pixels.

### Bottom Panel With Action Rail
- The outer lower band stays full width inside the left workspace
- Rail clearance should be applied to inner content only
- Keep left and right content breathing room visually balanced

## Right Panel

Use for contextual support content such as vendor insights, history, approval notes, or related record detail. For the catalog of content primitives every right panel composes from (Section Intro, Hero Status Card, Metric Grid, Compact List, Timeline, Entity List, Action Pill Row, Step Flow, Stage Pipeline, etc.), see **`Right Panel Body`** below.

### Shared Rules
- Right panel starts below the header panel if a header panel exists
- Main window content and any bottom panel stay to the left of the right panel
- Right panel may be sticky while the left workspace scrolls
- Right panel may have its own independent body scroll when content is long
- Right panel sits to the left of the window action rail
- Always include a collapse strip on the panel's outer edge so the panel can be hidden (see `Right Panel Collapse Strip`)
- **Right panel background is solid white (`#FFFFFF`).** Do not use the glass gradient (`linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,0.6))`) or any tinted wash — right panels are working surfaces for detail content, entity rows, metric grids, and timeline stacks; a white surface lets that content read cleanly without a translucent layer competing beneath it. The outer chrome (border `1px solid #D9E2EB` + shadow) does the visual separation from the app background. Same rule as bottom panels.
- When a right panel is present, the window becomes a true two-column shell:
  - left column = form/workspace/bottom-panel area
  - right column = panel content + collapse strip + action rail

### Canonical Two-Column Shell Math

Use shell-level width formulas instead of per-block spacing hacks.

- `rightPanelShellWidth = activePanelWidth + collapseStripWidth + actionRailWidth`
- `leftWorkspaceWidth = calc(100% - rightPanelShellWidth)`
- `left/right content gutter = fixed design gap`, not content-driven spacing
- the form area and bottom panel must both use the same left workspace width

Default supporting widths:
- `collapseStripWidth = 20px`
- `actionRailWidth = 56px`
- content gap between left workspace and right panel content: `8px` to `12px`

Behavior:
- if the active panel gets wider, the left workspace becomes narrower automatically
- if the active panel gets narrower, the left workspace expands automatically
- the gutter between left content and panel stays visually consistent
- do not reserve different widths for the form and the bottom panel

### Right Panel Width
- Each panel may set its own width based on content
- Width may vary per panel (for example, a wide insights panel at `440px` and narrower history / notes panels at `340px`)
- Switching panels reflows the workspace; this is intentional
- Do not set a global single width when content needs differ
- Keep widths within a reasonable band so the main workspace stays usable

Do not infer:
- do not guess panel width from current content length
- do not use percentage widths when they create unstable dead space
- do not reserve only part of the shell width for the left workspace
- do not let the bottom panel slide behind the right panel or action rail

## Right Panel Header

Canonical header pattern for any right panel.

- Header bar height around `56px`
- Title on the left
- Close button on the right; close collapses the whole panel
- Bottom border to separate header from body

### Single Panel
- Use plain title text
- No dropdown affordance
- Title typography: `Roboto Bold`, `1em`

### Multiple Panels (Canonical Switcher)
- Title area becomes a dropdown selector
- Use this as the only sanctioned switcher when a window has more than one right panel
- Caret/chevron sits immediately after the title text
- Clicking the title opens a small overlay menu listing every panel option
- Active option indicated in the menu (highlighted row + dot)
- Selecting a panel from the menu updates the active panel and closes the menu
- Close button still collapses the whole panel
- Do not add a separate vertical icon nav rail outside the panel header to switch panels

## Right Panel Body

This section defines the canonical content rules for the right-panel body — the scrollable region beneath the panel header. The intent mirrors `dashboard-widgets.md`: a small, fixed catalog of named **content primitives** that every right panel composes, with consistent typography, spacing, and surface tokens. Window screens should not invent new card shapes inside the panel — pick from this catalog.

### Body Anchor

Right panels use the **canonical panel anchor** defined once in `Panel Foundation > Rule 3`: `clamp(18px, 1vw, 20px)`, applied via the shared three-line block (`container-type: inline-size` + `--panel-anchor` + `font-size: var(--panel-anchor)`). No right-panel-specific coefficient — a right panel next to a bottom panel on the same window renders at the same physical size *by construction*.

```tsx
<aside className="…panel surface…">
  <header>…panel header (chrome — em against the document baseline, unaffected)…</header>
  <div
    className="panel-body min-h-0 flex-1 overflow-auto"
    style={{
      containerType: "inline-size",
      fontSize: "clamp(18px, 1vw, 20px)",
    }}
  >
    {/* primitives — every internal size is em against this anchor */}
  </div>
</aside>
```

- The panel header is chrome, not body content — it keeps its own `1em` Bold title (against the document baseline) and `~56px` height and is **not** subject to this anchor.
- **What stays in `px`**: borders, dividers, radii, shadow offsets, dot sizes, fixed glyph sizes. Physical edges — do not scale with text.
- **What is `em`**: every text size, padding, margin, gap, and internal element height that should scale with the anchor.
- Do not nest a widget inside the right panel — `em` would compound against two anchors. If a recurring tile is needed, lift it to a primitive in this catalog.

### Body Container

- Padding: `1.125em 0.875em` (`px-[1.125em] py-[0.875em]`, ≈ `18px 14px` at the `16px` baseline)
- Layout: `flex flex-col` with vertical gap `0.875em` (`gap-[0.875em]`) — every top-level child is a section. No section dividers or rules between sections.
- Scroll: `min-h-0 flex-1 overflow-auto`. The panel body owns its own scroll independently of the left workspace.
- Never scroll horizontally. Every primitive must `truncate` long text inline.
- Background: inherit the panel surface (solid white `#FFFFFF` — see `Right Panel > Shared Rules`). Do not paint a second background on the body wrapper.

### Section Anatomy

A section is one cohesive unit of content. Two valid section shapes:

1. **Headered section** — `Section Header` row + a content primitive (typically `Compact List` or `Metric Grid`).
2. **Unheadered section** — a single primitive that is self-titled (e.g., `Hero Status Card`, `Timeline`, `Action Pill Row`).

The first section of every panel **may** open with a `Section Intro` line of muted helper copy. Use it sparingly — only when the panel context needs framing for the user.

### Content Primitives

Ten primitives. Pick from these; do not invent new shapes.

All values below are quoted against the panel-body anchor. Borders, radii, and shadow offsets stay in `px`.

#### 1. Section Intro

A single muted line of helper copy that frames the panel's purpose. Use at the top of a panel body, before the first section, when context isn't obvious from the panel title.

- Typography: `Roboto Regular`, `0.75em` (≈ `12px` at the baseline), color `#5F7283`, `line-height: 1.5`
- Max length: one short sentence (~80 chars). If you need more, you don't need a Section Intro — you need a different panel.
- No icon, no background, no border.
- One per panel body. Never repeat after a section break.

#### 2. Section Header

A title row that introduces a content block (Compact List, Metric Grid, Entity List, etc.).

- Layout: `flex items-center justify-between mt-[0.5em] mb-[0.5em] pb-[0.375em] border-b border-solid border-[#E2EAF1]`
- **Vertical breathing:** `margin-top: 0.5em` above the header + `margin-bottom: 0.5em` below (with `padding-bottom: 0.375em` inside for the underline). The `mt-[0.5em]` stacks on top of the panel body's section `gap-[0.875em]`, giving each headered section ~`1.375em` of total breathing above its title relative to the previous block. This replaces the earlier flat `gap-[0.875em]` spacing which read as too tight in practice — sections felt like they ran into each other without a clear visual gap between the previous block's tail and the next block's title. **Suppress `margin-top` on the first section header inside a tab or panel body** (`.tab-view > section:first-of-type > .section-header, .panel-body > .section-header:first-child { margin-top: 0 }`) so it doesn't stack unnecessary space against the panel-body padding.
- **Underline:** `1px solid #E2EAF1` at the bottom (was previously "no bottom border"; updated in the 2026-07-02 pass to give each block a clear top boundary). Tone matches the muted inter-row divider — the header underline visually rhymes with the row dividers below it rather than introducing a new line weight.
- Left: title — `Roboto Bold`, `1em` (≈ `16px`), color `#102C3F`. Section Header titles must read clearly larger than the row content below them (`Entity Row primary` and `Compact List primary` are both `0.875em`) so the visual hierarchy reads **Hero Card title > Section Header title > Row primary**. If the section title sits at the same size as row content, the section reads as just another row.
- Right (optional, two variants):
  - **Summary variant** — count or status: `Roboto Regular`, `0.75em` (≈ `12px`), color `#5F7283`. Use for "3 of 6 enabled", "showing 5", etc.
  - **Action variant** — single inline link with optional leading icon: `Roboto Regular`, `0.8125em` (≈ `13px`), color `#0083DA`, leading icon `1em` square in the same color (e.g., `+ Add line`, `+ Add competitor`, `Generate`). Hover deepens the color to `#005FA3`.
  - **Combined** — when both a summary count and an action are present, place the summary first, then a `0.5em` gap, then the action link. Same row.
- One action link per Section Header — the right side is **not** a place for multiple actions. If a section needs more than one action, lift them to an `Action Pill Row` above the section.

#### 3. Hero Status Card

A tinted gradient card used **at most once per panel**, always as the first section after the intro (if any), to surface the panel's headline fact (active plan, due payment, vendor health). When the panel has no headline fact, omit the Hero Card — do not promote arbitrary content into one.

- Wrapper: `rounded-[14px] px-[0.875em] py-[0.75em]`, `1px solid` semantic border (see palette below), gradient background. Radius stays in `px`.
- Semantic tone palette:
  - **Info / blue** — gradient `linear-gradient(180deg, #EEF8FF 0%, #F7FBFF 100%)`, border `#CFE0ED`
  - **Success / green** — gradient `linear-gradient(180deg, #EFF9F3 0%, #F7FBF8 100%)`, border `#CFEAD9`
  - **Warning / amber** — gradient `linear-gradient(180deg, #FFF8E8 0%, #FBFAF3 100%)`, border `#EBD7A6`
  - **Risk / red** — gradient `linear-gradient(180deg, #FCEFEF 0%, #FBF7F7 100%)`, border `#EDC8C8`
- Top row: title (left) + status pill (right).
  - Title: `Roboto Bold`, `1.125em` (≈ `18px`), color `#102C3F`. Must read clearly larger than the Section Header title so the Hero Card remains the panel's most prominent element.
  - Subtitle (optional, under title): `Roboto Regular`, `0.75em` (≈ `12px`), color `#41576A`
  - Status pill: `rounded-[999px]`, white bg, padding `0.3125em 0.625em`, `Roboto Bold` `0.6875em` (≈ `11px`), text uses the card's semantic color (e.g., `#0083DA` on Info, `#0B6B45` on Success)
- Optional emphasis row (under the top row): a single large value paired with a small qualifier — `Roboto Bold`, `1.5em` (≈ `24px`), color matches the semantic tone (e.g., `#0B6B45` on Success).
- Optional internal `Metric Grid` (2-col) using the same typography spec as the standalone Metric Grid below.
- Do not stack multiple Hero Cards.

#### 4. 2-Col Metric Grid

Compact label/value pairs. Use for vital stats that don't merit a card per item.

- Layout: `grid grid-cols-2 gap-x-[0.875em] gap-y-[0.375em]`
- Each cell:
  - Label (top): `Roboto Regular`, `0.6875em` (≈ `11px`), color `#5F7283`
  - Value (below): `Roboto Bold`, `0.8125em` (≈ `13px`), color `#102C3F`
- Use 2, 4, or 6 cells — never an odd count (asymmetric rows look broken).
- Can be standalone in a section or nested inside a Hero Card.
- Do not use 3+ columns. If you need more density, use a Compact List instead.

**Metric Grid variants** (Detail Card wrap vs Stat Grid):
- **Metric Grid — flat** (default). Cells sit directly on the panel surface, no wrapper. Use when the metrics are tightly related headline numbers where the values speak for themselves.
- **Metric Grid — Detail Card wrap** (see 4a). Wrap the Metric Grid in a single bordered white card. Use when the metrics collectively describe **one entity** and should read as one grouped info block — cost allocation for a requisition, compliance snapshot for a vendor, allocation summary for a deal. Prefer this over Stat Grid whenever the metrics belong together conceptually. Optional per-cell meta line (`.metric-meta`) is allowed inside the Detail Card variant.
- **Stat Grid** (see 4b). Grid of **per-item bordered cards**. Reserved for genuinely independent scan-card-by-card KPIs (e.g., a stat strip of "Estimated Value / Required By / Line Items / Source Availability" where each stat is separately actionable and meaningful on its own). Do NOT use Stat Grid for grouped-related data — that's what the Detail Card variant is for.

If in doubt: pick Detail Card. Stat Grid is the exception, not the default.

#### 4a. Metric Grid — Detail Card wrap

A single bordered white card grouping multiple related label/value metrics. Use when the metrics collectively describe one entity — cost allocation, allocation summary, compliance snapshot, budget breakdown, vendor snapshot on a purchase order.

- Wrapper (Detail Card): `rounded-[12px] border 1px solid #D9E2EB bg-white px-[0.875em] py-[0.875em]`.
- Contents: standard 2-Col Metric Grid inside (`grid grid-cols-2 gap-x-[0.875em] gap-y-[0.625em]`). Row gap loosens from the flat variant's `0.375em` to `0.625em` when the grid includes meta lines, so the label/value/meta triplets have room to breathe.
- Each cell (extended for the Detail Card variant only):
  - Label: `Roboto Regular`, `0.6875em`, color `#5F7283` (same as flat variant)
  - Value: `Roboto Bold`, `0.8125em`, color `#102C3F` (same as flat variant — do not bump to Stat Grid's `0.9375em`; the card wrapper already provides the weight)
  - Meta (optional): `Roboto Regular`, `0.6875em`, color `#5F7283`, `mt-[0.125em]`, `truncate`. Use for a qualifier like `Breached · $80K left` or `6 lines · pre-tax`. Skip the meta line when it would just repeat the label.
- Semantic value tone (optional): `Warning` `#9A6500` / `Risk` `#A33F3F` — only when the value itself carries semantic weight (e.g., a breached budget line's identifier).
- Cell count same as flat Metric Grid — 2, 4, or 6 cells.

#### 4b. Stat Grid

A grid of **per-item bordered cards**, each a standalone stat. Reserved for **genuinely independent** KPI tiles where each stat is separately actionable and readable on its own. Examples: a "Requisitions Overview" strip showing `Estimated Value / Required By / Line Items / Source Availability` — each stat is a distinct measurement the user could take action on separately.

**Do NOT use Stat Grid for grouped-related data describing one entity** — that's what the Detail Card variant (4a) is for. If your metrics feel like "one thing broken into parts" (cost allocation, budget breakdown, compliance summary), pick 4a instead.

- Layout: `grid grid-cols-2 gap-[0.625em]` (or `grid-cols-3` for compact numeric snapshots at wider panel widths — never more than 3 columns).
- Each card:
  - Wrapper: `padding: 0.75em`, `border-radius: 12px`, `border: 1px solid #D9E2EB`, `bg: #FFFFFF`
  - Label (top): `Roboto Regular`, `0.6875em`, color `#5F7283`
  - Value (middle): `Roboto Bold`, `0.9375em`, color `#102C3F` (larger than the Detail Card variant — Stat Grid cards read as standalone KPI tiles and need the extra weight)
  - Meta (optional, under value): `Roboto Regular`, `0.6875em`, color `#5F7283`, `mt-[0.125em]`, `truncate`
- Semantic value tone (optional): `Warning` `#9A6500` / `Risk` `#A33F3F` — sparingly.
- Use 2, 4, or 6 cards in a 2-col grid; 3 or 6 cards in a 3-col grid.
- This is a **per-item card** primitive, so borders on individual cards are allowed (see the "list containers are flat, only per-item cards carry borders" rule).

#### 5. Compact List

A stack of compact rows inside a single white container. Use for: enabled modules, recent payments, history entries, approval notes.

- Container: **no outer border, no radius, no background** — Compact List rows sit directly on the panel surface. Row dividers do all the visual work (same treatment as Entity List, Step Flow, and Timeline containers). The earlier `rounded-[12px] border 1px solid #D9E2EB bg-white overflow-hidden` container is deprecated: on a solid-white panel surface, a bordered list container reads as card-on-card and conflicts with adjacent flat list primitives on the same panel. **Rule: outer list containers never carry borders. Only per-item cards do** — Hero Card (single card), Timeline entries (per-entry cards), Step Flow steps (per-step cards), Product Grid cells (per-item cards). Anything that renders as "a list of things" (Compact List, Entity List, Data Grid rows) is flat.
- Row: `flex items-center justify-between gap-[0.75em] px-[0.75em] py-[0.625em]`
- Row divider: `1px solid #E2EAF1` on every row except the last (`last:border-b-0`).
- Row content:
  - Left block (`min-w-0`):
    - Primary: `Roboto Bold`, `0.75em` (≈ `12px`), color `#102C3F`
    - Meta (optional, under primary): `Roboto Regular`, `0.75em` (≈ `12px`), color `#41576A`, `mt-[0.1875em]`
  - Right block (`shrink-0 flex items-center gap-[0.625em]`):
    - Status pill (optional): `rounded-[999px] px-[0.5em] py-[0.1875em]`, `Roboto Bold` `0.6875em` (≈ `11px`), semantic tone
    - Trailing value (optional): `Roboto Bold`, `0.8125em` (≈ `13px`), color `#102C3F`
- Row count: 3–8 typical. If a list exceeds 8 rows, paginate at the section level (no inner scrollers).
- Do not nest a Compact List inside a Hero Card.

#### 6. Timeline

A vertical sequence of events. Use for activity feeds, journey steps, audit history.

- Container: `flex flex-col gap-[0.75em]`
- Each entry: `flex items-start gap-[0.75em]`
  - Left rail (`shrink-0 flex flex-col items-center`):
    - Dot: `size-[10px] rounded-full bg-[#1F83FF]`, `mt-[0.375em]` (dot diameter stays in `px` — it's a physical marker)
    - Trail: `mt-[0.25em] h-[2.5em] w-px bg-[#D9E6F2]`, hidden on the last entry (`last:hidden`). Width stays at `1px`; height scales.
  - Card (`min-w-0 flex-1 rounded-[12px] border 1px solid #D9E2EB bg-white px-[0.75em] py-[0.625em]`):
    - Top row: title (left) + tag pill (right)
      - Title: `Roboto Bold`, `0.875em` (≈ `14px`), color `#102C3F`
      - Tag pill: `rounded-[999px] px-[0.5625em] py-[0.25em]`, `Roboto Bold` `0.6875em` (≈ `11px`), semantic tone
    - Meta line: `Roboto Regular`, `0.75em` (≈ `12px`), color `#5F7283`, `mt-[0.375em]`
- Entry count: 3–10 typical. Paginate or "show more" beyond that — no inner scrollers.
- Reserved for chronological data. If the data isn't time-ordered, use a Compact List.

#### 7. Entity List

A stack of icon-led rows where each row represents a separately-addressable related record — products on a deal, proposals on an opportunity, competitors on a pursuit, attachments on an invoice. Each row has a typed leading icon, a primary identity with optional inline status pills, optional meta, and a two-line trailing value column. The list may end with an optional summary row that totals the values.

Use Entity List (not Compact List) when:
- Rows represent records the user can drill into (each row is a thing, not a label/value pair)
- Each row carries a non-trivial trailing value (amount, count, date pair, dash for "not yet")
- The entity type wants a visual tag (icon + tinted tile)

Use Compact List instead when rows are flat label/value/status with no leading icon and no trailing sub-line.

##### Anatomy

- Pair this primitive with the **Section Header → Action variant** above (e.g., title `Products` + count `3 items` + action `+ Add line`).
- Container: no outer card border. Rows are visually separated by dividers — the whole section reads as part of the panel body, not a card.
- Row: `flex items-start gap-[0.75em] py-[0.625em]`
- Row divider: `1px solid #E2EAF1` on every row except the last (`last:border-b-0`). Lighter than the surrounding panel.
- Three columns left → right: **Type Icon Tile · Identity · Trailing Value**.

##### Type Icon Tile (leading)

- Square tile, `rounded-[8px]`, size `2.25em × 2.25em` (≈ `36px`), `shrink-0`.
- Tinted background + matching glyph color drawn from the same semantic palette as Hero Status Card. Tone is tied to **entity type**, not row status:
  - **Info / blue** — bg `#EAF8FF`, glyph `#0083DA` (products, modules, generic records)
  - **Proposal / purple** — bg `#EFEEFF`, glyph `#5F4AA6` (proposals, quotes, documents)
  - **Success / green** — bg `#E9F6EE`, glyph `#0B6B45` (paid items, won deals)
  - **Risk / red** — bg `#FCEFEF`, glyph `#D14545` (competitors, blockers, escalations)
  - **Warning / amber** — bg `#FFF6E2`, glyph `#9A6500` (overdue, attention items)
- Glyph size inside: `1.25em` (≈ `20px`), centered.
- The tile shape and size are constant across all rows in a section — never resize the tile per row.
- Pick one tone per Entity List section, not one tone per row. The tone signals the section's entity type. (Row-level emphasis goes on the inline status pill, not the tile.)

##### Identity column (center, `min-w-0 flex-1`)

- Title row (`flex items-center gap-[0.5em] flex-wrap`):
  - Primary: `Roboto Bold`, `0.875em` (≈ `14px`), color `#102C3F`, `truncate`
  - Inline status pill(s), optional: `rounded-[999px] px-[0.5em] py-[0.1875em]`, `Roboto Bold` `0.6875em` (≈ `11px`), semantic tone
    - Status pills sit **immediately after the primary**, not in the trailing column. Max two pills per row.
- Meta line (optional, under title): `Roboto Regular`, `0.75em` (≈ `12px`), color `#5F7283`, `mt-[0.1875em]`, `truncate`. Use for record code, qty × unit price, valid-to date, short descriptor.

##### Trailing Value column (right, `shrink-0 text-right`)

- Primary value: `Roboto Bold`, `0.9375em` (≈ `15px`), color `#102C3F`. Use for the headline metric — amount, count, date.
- When no value is known yet, render an em-dash `—` in the **same slot, same weight/size**, color `#5F7283`. Never collapse the slot.
- Secondary line (optional, under value): `Roboto Regular`, `0.75em` (≈ `12px`), color `#5F7283`. Use for a qualifier (`margin $ 168,000`, `sent 18 Apr 2026`, `est. deal`).
- The trailing column does **not** carry a status pill — that belongs inline with the title.

##### Section Summary Row (optional, at the bottom)

A single row at the end of an Entity List that totals the section. Use only when a meaningful aggregate exists (totaling currency, counting items, summing margin). Skip it on lists where totaling is not semantic (proposals, competitors).

- Sits below the last data row, separated by `1px solid #D9E2EB` (slightly darker than the inter-row `#E2EAF1` so the summary reads as a band).
- Row: `flex items-center justify-between py-[0.625em]` — no leading icon, no divider beneath.
- Left: `Roboto Bold`, `0.8125em` (≈ `13px`), color `#102C3F`. Use middle-dot separators for compound facts: `Total · 3 products · margin $ 202,020`.
- Right (grand total): `Roboto Bold`, `1em` (≈ `16px`), color `#0083DA` (action blue) — calls out the headline aggregate.
- One summary row per Entity List. Never multiple totals stacked.

##### Counts & limits

- Row count: 2–8 typical. Past 8, paginate at the section level or "show more" — never an inner scroller.
- A panel may contain multiple Entity List sections (e.g., Products + Proposals + Competitors), each with its own Section Header.
- Do not nest an Entity List inside a Hero Card.

#### 8. Action Pill Row

A wrapping row of outline-style entry-point buttons. Use for navigating to a related flow ("Log a call", "Send email") — never for primary save/submit actions.

- Container: `flex flex-wrap gap-[0.625em]`
- Pill: `rounded-[999px] border 1px solid #0083DA bg-white px-[0.875em] py-[0.5em]`, label `Roboto Regular` `0.8125em` (≈ `13px`), color `#0083DA`
- Hover: `bg-[#EEF8FF]`
- Pill count: 2–6. Beyond 6 the row wraps untidily — split into two action sections with headers.
- One Action Pill Row per panel. Multiple rows compete for primary attention.
- Do not mix pill sizes or fill styles within a row.
- Primary form actions (Save, Submit, Approve) belong on the form action bar, never in the right panel.

#### 9. Step Flow

A vertical sequence of status-tinted step cards joined by a left rail of dots and trail. Use for: approval routing, workflow stages, audit / lifecycle paths, process step chains. Reads top-to-bottom as the sequence of events — each card is a step in a fixed order, not an interchangeable list item.

Use Step Flow (not Timeline) when:
- Items are ordered by **position in a process**, not by time
- Status pivots step-to-step (done → active → pending), so per-card tone is the right signal
- Each step communicates "who" / "what state" (role + assignee), not "when" / "what happened"

Use Step Flow (not Compact List) when:
- Order is semantic (one step feeds the next)
- A left-rail visualization helps the user trace the route

##### Anatomy

- Pair with a `Section Header` (e.g., `Approval Routing`).
- Container: `flex flex-col`. No outer card border — the rail itself is the section's visual structure, so the cards stand against the panel surface, not against a wrapper card.
- Each step row: `flex items-stretch gap-[0.75em]`, with `pb-[0.5em]` on every step except the last. The padding forms the gap between cards while letting the rail trail extend through it.
  - **Left rail (`flex flex-col items-center shrink-0 w-[10px]`)**:
    - Dot: `size-[10px] rounded-full mt-[0.5em] shrink-0` — status-toned bg. The 10px diameter stays in `px` (physical marker, same rule as the Timeline dot).
    - Trail: `w-px flex-1 mt-[0.25em]`, color `#D9E6F2`. `flex-1` lets the trail grow to fill the rail column to the bottom of the row, bridging into the `pb-[0.5em]` so it visually points at the next step. Stroke stays at `1px`. Hidden on the last step (`last:hidden` or `!isLast` conditional render).
  - **Card (`min-w-0 flex-1 rounded-[10px] border 1px solid {tone-border} bg-{tone-bg} px-[0.75em] py-[0.5em]`)**:
    - Title (`Roboto Bold`, `0.8125em` ≈ `13px`, color `#102C3F`, `truncate`) — the step's role / stage.
    - Meta (optional, `Roboto Regular`, `0.6875em` ≈ `11px`, color `#5F7283`, `mt-[0.125em]`, `truncate`) — assignee, current state, short qualifier.

##### Status tones (per-step)

Both the dot and the card share the same tone — they read as one stepped marker. Pick a tone per **step status**, never custom colors. Tile color tracks the per-step status (unlike Entity List's Type Icon Tile, which tracks entity type):

- **Done / success** — card bg `#E7F7EF`, card border `#CFEAD9`, dot `#20A464`
- **Active / in-progress** — card bg `#EAF8FF`, card border `#BFE4FF`, dot `#0083DA`
- **Pending / not-started** — card bg `#FBFDFF`, card border `#D9E2EB`, dot `#9AB0C0`
- **Blocked / failed** — card bg `#FCEFEF`, card border `#EDC8C8`, dot `#D14545`

Active is intentionally the only blue card/dot. Never mark two steps as active simultaneously.

##### Counts & limits

- Step count: 2–7 typical. Past 7, promote to a Timeline if the data is chronological, or split the chain across two Section Headers.
- One Step Flow per panel.
- Do not nest a Step Flow inside a Hero Card or an Entity List.
- Do not stack two Step Flows in the same section. If two parallel chains exist (e.g., AP routing + AR routing), give each its own Section Header.

#### 10. Stage Pipeline

A horizontal sequence of milestone circles joined by a progress-tinted rail, with the stage name labeled below each circle. Use for: opportunity pipeline, sales journey, lifecycle stages — anywhere a single-line "where are we?" indicator carries more weight than per-stage detail.

Stage Pipeline is the **wide-context counterpart** of `Step Flow`. Use Stage Pipeline when the section width comfortably fits all stages on one line (expanded right panels, workspace cards, full-width detail views). Use Step Flow when stages would crowd horizontally and need to stack vertically.

Use Stage Pipeline (not Step Flow) when:
- Width is generous (workspace card, expanded right panel, full-width detail view)
- The pipeline should read as one continuous progress bar, not a stack of cards
- The user needs a glance-level read of "how far along we are" — exact stage name is enough; per-stage detail is overhead

Use Stage Pipeline (not Compact List, not Timeline) when:
- Items are ordered by **position in a process**, not by time
- Status pivots stage-to-stage (done → active → pending)
- The audience cares about progress, not the chronological log

##### Section Header

Always use the **Summary variant** so the user sees absolute position in the chain at a glance:
- Left: title — `Roboto Bold`, `1em`, color `#102C3F` (e.g., `Pipeline Stage`, `Stage Journey`).
- Right: `Stage {n} of {total}` — `Roboto Regular`, `0.75em`, color `#5F7283`. Substitute `Complete` when no active stage and all stages are done; `Blocked at stage {n}` when any stage is blocked.

##### Anatomy

- Container: `relative w-full`. **On any panel surface (right panel, bottom panel, header panel, detail pane) the rail itself is the section's structure — no outer bordered container.** The section header (with its bottom underline) marks the block's top edge; the labels below the circles mark the bottom edge; the rail + circles carry the content between. Wrapping the pipeline in a card on a panel surface reads as card-on-card and competes with adjacent primitives (Compact List, Timeline, Entity List) that are also flat on the panel. Only wrap in a bordered container (`rounded-[14px] border 1px solid #DFE8EF bg-white px-[1em] py-[0.875em]`) when the pipeline is embedded inside a **dashboard workspace card** or another heterogeneous card mosaic — i.e. when its neighbors are themselves bordered cards and it needs to visually match them.
- **Vertical padding on the block:** `0.75em` top and `0.5em` bottom (or absolute `16–20px` top / `10–12px` bottom in non-em contexts). Without a card wrapper the rail sits directly against the section-header underline above and the next block below — the padding gives the pipeline the breathing room the wrapper used to provide. Do not skip this on panel surfaces; a flat pipeline with no vertical padding reads cramped and undermines the "flat sections separated by header underlines" rhythm the panel body uses. The wrapper variant (workspace-card exception above) already provides the equivalent breathing via its own `py-[0.875em]`; do not stack both.
- **Stage column grid**: `grid grid-cols-{n}` where `n` = stage count. Each column centers a circle + label vertically.
- **Circle** (top of column): `relative z-10 flex size-[2em] items-center justify-center rounded-full`. Circle diameter scales with the body anchor; the `2em` outer size + `2px` border keeps a strong physical marker at any anchor.
  - **Done** — bg `#0083DA` solid, content `Check` icon `size-[1em]` `text-white` `strokeWidth={2.5}`
  - **Active** — bg `#FFFFFF`, `border-2 border-solid border-[#0083DA]`, content inner dot `size-[0.5em] rounded-full bg-[#0083DA]` (radio-style)
  - **Pending** — bg `#FFFFFF`, `border-2 border-solid border-[#D9E2EB]`, no inner content
  - **Blocked** — bg `#D14545` solid, content `X` icon `size-[1em]` `text-white` `strokeWidth={2.5}`
- **Trailing segment** (right of circle, hidden on the last column): an absolutely-positioned `2px` horizontal bar that runs from this circle's center to the next circle's center.
  - Class: `absolute left-[50%] right-[-50%] top-[1em] h-[2px] -translate-y-[1px]`. `top-[1em]` aligns to the circle's vertical center (half of `size-[2em]`); `-translate-y-[1px]` centers the 2px stroke on that line.
  - Color: `bg-[#0083DA]` when the **left** circle is `done`, otherwise `bg-[#E2EAF1]`. This creates the visual progress bar — solid blue trails to the active circle, muted gray beyond it.
  - The circle's `z-10` covers the segment behind it, so the rail visually reads as a continuous line broken by circles.
- **Label** (under circle): `mt-[0.5em] w-full truncate text-center text-[0.8125em]`. Adds a `title=` tooltip fallback so long stage names stay accessible after truncation.
  - **Done** — `Roboto SemiBold`, `#0083DA`
  - **Active** — `Roboto Bold`, `#0083DA`
  - **Pending** — `Roboto Regular`, `#9AB0C0`
  - **Blocked** — `Roboto Bold`, `#D14545`

##### Status semantics

The blue family signals both progress and current position. The rail's progress tint plus the active circle's radio marker carry the "where are we" signal; per-stage tinted cards are deliberately omitted because they crowd the visual at small widths and duplicate the rail's message.

Active is intentionally the only blue radio. Never mark two stages active simultaneously. Done circles use solid blue + check; pending circles stay white + gray-bordered so the active circle visually anchors the eye.

##### Optional detail strip

When each stage carries its own short description (a free-text "what happened at this stage" caption), append a **detail strip** below the rail, inside the same bordered container:

- Separator above: `mt-[1em] border-t 1px solid #E2EAF1 pt-[0.875em]`. The divider clearly distinguishes the rail row above from the detail content below.
- Row 1: stage name (`Roboto Bold`, `0.9375em` ≈ `15px`, color `#102C3F`) + a state badge pill on the right of the name.
  - Badge: `rounded-[999px] px-[0.5em] py-[0.1875em]`, `Roboto Bold`, `0.6875em` (≈ `11px`), uppercase + `tracking-[0.04em]`. Tone follows the displayed stage's state — same color family as the circle, but the badge surface is softer (subtle tinted bg, deeper text) so it sits comfortably inside white space:
    - Done — bg `#E7F7EF`, text `#0B6B45`
    - Active — bg `#EAF8FF`, text `#005FA3`
    - Pending — bg `#F1F4F8`, text `#5F7283`
    - Blocked — bg `#FCEFEF`, text `#A33F3F`
- Row 2 (description): `Roboto Regular`, `0.8125em` (≈ `13px`), color `#41576A`, `leading-[1.5]`, `mt-[0.375em]`.

When the detail strip is present, circles become **interactive**:

- Wrap each circle + label column in a `<button type="button">` that updates a `selectedStageIdx` state on click.
- Default displayed stage: the active stage; fall back to the last done stage when complete, or the first stage otherwise.
- Hover: subtle 35%-opacity blue selection ring (`shadow-[0_0_0_3px_white,0_0_0_5px_rgba(0,131,218,0.35)]`) — confirms the circle is clickable.
- Selected: solid blue selection ring (`shadow-[0_0_0_3px_white,0_0_0_5px_#0083DA]`) — only shown when the selected stage is **not** the active one, to avoid doubling up rings around the already-emphasized active circle.
- `aria-pressed={isSelected}` on every button so screen readers can announce the displayed stage.

Without a detail strip the circles stay decorative (non-interactive) — pure progress indicator.

##### Counts & limits

- Stage count: 3–7 typical. Below 3, the pipeline does not earn its rail — use a 2-Col Metric Grid instead. Past 7, labels start to truncate aggressively even on wide panels — break the chain into phases (two Stage Pipelines under separate Section Headers) or promote to a Timeline if the data is time-ordered.
- One Stage Pipeline per panel.
- Do not nest a Stage Pipeline inside a Hero Card or an Entity List.
- Do not stack a Stage Pipeline above a Step Flow in the same section. A panel may carry both when they describe genuinely different chains (e.g., the sales journey is a Stage Pipeline at the top; the approval routing within a stage is a Step Flow further down).
- If a separate "per-stage details" list already exists in the panel (e.g., a flat label/value grid below), fold it into the Stage Pipeline's optional detail strip rather than rendering both — never show stage detail twice.

#### 11. Data Grid

Dense tabular list where each row is a record with several columns of data. Use Data Grid on a panel when rows need more than an identity + one trailing value (that's Entity List) but do not warrant a full workspace table.

- Container: flat — no outer border, no radius, no background. Rows sit directly on the panel surface. See the "outer list containers never carry borders" rule under Compact List for the shared rationale.
- Header row: `1px solid #C5D2DD` bottom border. Header cells `Roboto Medium` `0.6875em` (≈ `11px`), color `#41576A`, `text-transform: capitalize`. Same treatment as `dashboard-widgets.md > Grid Data Widget > Header Row` — do not re-derive it here.
- Body row: `py-[0.625em]` vertical padding, `1px solid #E2EAF1` bottom border, `last:border-b-0`.
- Columns: single shared `grid-template-columns` string across header and every body row, `minmax(0, Nfr)` only. Every cell uses `truncate` + `title={cellValue}`. Right-align numeric / currency / duration columns. Same enforcement as `dashboard-widgets.md > Grid Data Widget > Column Sizing And Truncation`.

##### Leading Icon Column

Every panel-level Data Grid MUST reserve the first column for a leading affordance that tells the eye what type of record each row represents. This rule applies to Data Grids inside right and bottom panels only — the dashboard `Grid Data Widget` does **not** carry this column (its primary identity cell already anchors the row).

- Column width: `1.75em` (≈ `28px`), fixed. Do not share this column with any other cell content.
- Icon glyph: `1em` (≈ `16px`), centered vertically to the row height. No tinted tile background — a full tile over-weights the leading column at Data Grid row density. (Entity List's `2.25em` tinted tile suits its `0.75em` row padding; Data Grid rows are denser at `0.625em`.) If a row visually needs a tile, promote the section to an Entity List instead.
- Icon color follows the semantic-tone palette from `Entity List > Type Icon Tile`:
  - Info / blue `#0083DA` — default records, generic module records
  - Proposal / purple `#5F4AA6` — proposals, quotes, documents
  - Success / green `#0B6B45` — paid, won, completed
  - Risk / red `#D14545` — blocked, escalations, competitors
  - Warning / amber `#9A6500` — overdue, attention items
- Icon is **row-specific** — reflects each row's record type or status. Never repeat the same icon down the whole column because the widget/module has one canonical icon (that's the section header's job — the row's job is per-record scan-ability).
- Header cell above the icon column is empty. The leading column is an affordance, not a data column, so it does not carry a header label.

##### Checkbox Row Variant

When rows are selectable (bulk actions, multi-select workflows), the first column carries a checkbox **instead of** the icon:

- Checkbox slot: same fixed `1.75em` column width as the icon variant. Checkbox `1em × 1em` (≈ `16px`), centered vertically to the row height.
- Header cell above the checkbox column carries the "select-all" checkbox.
- Icon and checkbox are **mutually exclusive** in the same cell — never render both in one row's first column.
- Rows in the same grid should use the same affordance uniformly (all icons, or all checkboxes). Mixing is only acceptable when a specific row is genuinely non-selectable (e.g., a subtotal separator) — that row shows the icon (or is left blank), while data rows show the checkbox.
- If the semantic type still needs to be visible on checkbox-variant rows, encode it inline in the identity cell (e.g., a small type pill next to the record name), never by widening the first column to hold both.

##### Counts & limits

- Row count: 4–20 typical. Past the panel body's visible height, paginate at the section level with a compact `< 1 of N >` pager beneath the grid — never an inner scroller (see `dashboard-widgets.md > No Inner Scrollbars`).
- One Data Grid per Section Header. Multiple Data Grids on a panel each get their own Section Header.
- Do not nest a Data Grid inside a Hero Card, an Entity List, or another Data Grid.

### Composition Rules

How the eight primitives combine into a panel body.

- **Order within a panel**:
  1. `Section Intro` (optional, max one)
  2. `Hero Status Card` (optional, max one)
  3. `Action Pill Row` (optional, max one) — placed early so the user sees entry points before scrolling through history
  4. Any number of **Headered sections** (`Section Header` + `Compact List` / `Metric Grid` / `Timeline` / `Entity List` / `Step Flow` / `Stage Pipeline` / `Data Grid`)
- A panel should typically have 3–5 sections total. More than 5 means the content belongs in the main workspace, not the right panel.
- Never put a `Hero Status Card`, `Action Pill Row`, `Timeline`, or `Entity List` inside another primitive.
- A `Metric Grid` may be embedded inside a `Hero Status Card` (the one allowed nesting case).
- An `Entity List` always pairs with a `Section Header` — never standalone. If the section needs an add/generate action, use the Section Header's Action variant rather than placing a button below the list.
- Multiple `Entity List` sections may follow each other (e.g., Products → Proposals → Competitors), each with its own Section Header and own entity-type tone.
- Section gap is always the `0.875em` defined on the body container. Do not add extra `mt`/`mb` between sections.
- Each section is self-contained — no shared dividers, no continuation across sections.

### What Belongs In A Right Panel

Use the right panel for **contextual support content** that helps the user act on the record in the workspace.

Good:
- Headline status (current plan, vendor health, payment due)
- Related history (activity feed, invoice history, approval notes)
- Related records (line items, attached proposals, competitors, related contacts) — render as an `Entity List` with the appropriate type tone, not as a wide grid
- Quick entry points to related flows (`Log a call`, `Send email`)
- Compact reference snapshots (open opportunities, open tasks)

Not allowed:
- Editable form fields — they live in the form workspace
- Primary actions (Save, Submit, Approve, Pay) — they live on the form action bar
- Wide data grids — they belong in the main workspace or a bottom panel
- Anything the user must complete to advance the record

If a panel turns into a parking lot for content that doesn't fit elsewhere, restructure the parent screen — do not stretch the panel.

### Typography Quick Reference

All right-panel **body** content uses `Roboto` and is sized in `em` against the canonical panel-body anchor (`clamp(18px, 1vw, 20px)` — see `Panel Foundation > Rule 3`). The panel **header** is chrome — its `em` values resolve against the document baseline (`1em = 16px`), unaffected by the body anchor.

**Enforcement.** This table is canonical for every panel type (right, bottom, header, detail pane). Reference-file HTMLs (prototypes, dev handoffs, Figma exports) routinely ship values that drift from this table — `1.25em` panel-header titles, `1.1875em` KPI values, `0.625em` uppercase eyebrows, weight `600` on metric values. Do not copy those; override to the sizes below. Before writing panel HTML — and before declaring it done — run [review-checklist.md > Panel HTML Token Audit](./review-checklist.md#8-panel-html-token-audit) against every visible text node. The audit is a 6-step walkthrough (two-tier chip enforcement → Panel Foundation contract → this table → `0.6875em` token floor → weight palette `400/500/700` → row inheritance traps) and catches the drift in one pass.

| Role | Size | Weight | Color |
|---|---|---|---|
| Panel header title (chrome) | `1em` | Bold | `#102C3F` |
| Section Intro | `0.75em` | Regular | `#5F7283` |
| Section Header title | `1em` | Bold | `#102C3F` |
| Section Header summary | `0.75em` | Regular | `#5F7283` |
| Section Header action link | `0.8125em` | Regular | `#0083DA` |
| Hero Card title | `1.125em` | Bold | `#102C3F` |
| Hero Card subtitle | `0.75em` | Regular | `#41576A` |
| Hero Card emphasis value | `1.5em` | Bold | semantic |
| Metric Grid label | `0.6875em` | Regular | `#5F7283` |
| Metric Grid value | `0.8125em` | Bold | `#102C3F` |
| Compact List primary | `0.75em` | Bold | `#102C3F` |
| Compact List meta | `0.75em` | Regular | `#41576A` |
| Compact List trailing value | `0.8125em` | Bold | `#102C3F` |
| Timeline title | `0.875em` | Bold | `#102C3F` |
| Timeline meta | `0.75em` | Regular | `#5F7283` |
| Entity Row primary | `0.875em` | Bold | `#102C3F` |
| Entity Row meta | `0.75em` | Regular | `#5F7283` |
| Entity Row trailing value | `0.9375em` | Bold | `#102C3F` |
| Entity Row trailing sub-line | `0.75em` | Regular | `#5F7283` |
| Entity List summary label | `0.8125em` | Bold | `#102C3F` |
| Entity List summary total | `1em` | Bold | `#0083DA` |
| Status pill | `0.6875em` | Bold | semantic |
| Action Pill label | `0.8125em` | Regular | `#0083DA` |
| Step Flow card title | `0.8125em` | Bold | `#102C3F` |
| Step Flow card meta | `0.6875em` | Regular | `#5F7283` |
| Stage Pipeline header summary | `0.75em` | Regular | `#5F7283` |
| Stage Pipeline label (Done) | `0.8125em` | SemiBold | `#0083DA` |
| Stage Pipeline label (Active) | `0.8125em` | Bold | `#0083DA` |
| Stage Pipeline label (Pending) | `0.8125em` | Regular | `#9AB0C0` |
| Stage Pipeline label (Blocked) | `0.8125em` | Bold | `#D14545` |
| Stage Pipeline detail title | `0.9375em` | Bold | `#102C3F` |
| Stage Pipeline detail state badge | `0.6875em` | Bold | semantic |
| Stage Pipeline detail description | `0.8125em` | Regular | `#41576A` |

### Surface Quick Reference

Scalable spacing is in `em` against the body anchor. Borders, radii, and shadow offsets remain in `px`.

| Token | Value |
|---|---|
| Body padding | `1.125em 0.875em` |
| Section gap | `0.875em` |
| Default content card border | `1px solid #D9E2EB` |
| Default content card radius | `12px` |
| Hero Card radius | `14px` |
| Hero Card padding | `0.875em / 0.75em` |
| Compact List row padding | `0.75em / 0.625em` |
| Compact List row gap (left/right) | `0.75em` |
| Compact List row divider | `1px solid #E2EAF1` |
| Timeline entry gap | `0.75em` |
| Timeline card padding | `0.75em / 0.625em` |
| Timeline dot | `10px`, `#1F83FF` (fixed marker) |
| Timeline trail | `1px × 2.5em`, `#D9E6F2` (height scales, stroke fixed) |
| Pill radius | `999px` |
| Action Pill padding | `0.875em / 0.5em` |
| Action Pill border | `1px solid #0083DA` |
| Action Pill hover bg | `#EEF8FF` |
| Entity Row vertical padding | `0.625em` |
| Entity Row column gap | `0.75em` |
| Entity Row divider | `1px solid #E2EAF1` |
| Type Icon Tile size | `2.25em × 2.25em` |
| Type Icon Tile radius | `8px` |
| Type Icon glyph size | `1.25em` |
| Entity List summary divider | `1px solid #D9E2EB` (above summary row) |
| Entity List summary row padding | `0.625em` vertical |
| Step Flow row gap (between cards) | `pb-[0.5em]` per step (last excluded) |
| Step Flow rail width | `10px` |
| Step Flow rail-to-card gap | `0.75em` |
| Step Flow dot | `10px` rounded, status-toned (fixed marker) |
| Step Flow trail | `1px × flex-1`, `#D9E6F2` (stroke fixed, height fills row) |
| Step Flow card padding | `0.75em / 0.5em` |
| Step Flow card radius | `10px` |
| Step Flow card border | `1px solid {tone-border}` |
| Stage Pipeline container | `relative w-full` (no outer card) |
| Stage Pipeline column grid | `grid grid-cols-{n}` (no gap; segments span column-center to column-center) |
| Stage Pipeline circle | `size-[2em] rounded-full` |
| Stage Pipeline circle border (Active / Pending) | `2px solid` blue / `#D9E2EB` |
| Stage Pipeline circle icon (Done / Blocked) | `Check` / `X`, `size-[1em]`, white, `strokeWidth={2.5}` |
| Stage Pipeline circle inner dot (Active) | `size-[0.5em] rounded-full bg-[#0083DA]` |
| Stage Pipeline segment | `h-[2px]` bar, blue when left circle is Done else `#E2EAF1` |
| Stage Pipeline segment position | `absolute left-[50%] right-[-50%] top-[1em] -translate-y-[1px]` |
| Stage Pipeline label gap | `0.5em` (`mt` on label) |
| Stage Pipeline detail separator | `border-t 1px solid #E2EAF1`, `mt-[1em] pt-[0.875em]` |
| Stage Pipeline detail description gap | `0.375em` (`mt` on description) |
| Stage Pipeline selection ring (hover) | `shadow-[0_0_0_3px_white,0_0_0_5px_rgba(0,131,218,0.35)]` |
| Stage Pipeline selection ring (selected, non-active) | `shadow-[0_0_0_3px_white,0_0_0_5px_#0083DA]` |

## Right Panel Collapse Strip

Slim vertical strip on the outer side of the right panel. This is the canonical way to toggle right-panel visibility.

- Sits between the right panel and the window action rail
- Width about `20px`
- Whole strip is a single clickable target
- Chevron indicates expand/collapse direction (`>` to collapse, `<` to expand)
- Hover state must clearly communicate clickability (subtle blue tint and chevron color shift)
- Always visible whether the panel is open or closed
- Do not replace this strip with a heavy tab rail or icon nav column

Example:
- open state: right panel content + clickable strip + action rail
- closed state: clickable strip + action rail only

## Window Action Panel

Use as the far-right vertical action rail for window screens.

- Window-only feature
- Starts directly below the module title bar bottom border
- Continues alongside the action bar and content area
- Not part of the global bottom task bar
- Width about `56px`
- White background
- Left divider `1px solid #E6EDF3`
- Fixed while window content scrolls
- Contains contextual record actions, not navigation

Do not infer:
- do not use the action rail as a right-panel selector
- do not let the global bottom bar become part of the window action rail
- do not make the action rail consume left-workspace width unless it is part of the right-panel shell calculation

## Window Footer / Status Bar

Window screens should use a bottom status bar pattern similar to Sales Proposal when a record/result count footer is needed.

- Compact height is preferred
- Show total records, result range, and pagination controls when applicable
- This bar belongs to the window, not the global bottom task bar

## Screen-Specific Guidance

### Inbox
- `Only window` + bottom panel
- search/action bar fixed
- action rail on far right
- top list dominant, bottom panel contextual

### Opportunities
- `Dashboard with window`
- supports dashboard, card, and detail states
- selected card state uses left rail and readable overlay

### AP Invoice And Purchase Invoice
- detail view may reduce active form columns to make room for right panel
- right panel should stay sleek and contextual
- bottom panel should remain on the left workspace only
- bottom panel uses the **[Chrome Overrides For Bottom Panels](#chrome-overrides-for-bottom-panels)** — flat top-edge divider only, no shadow, no radius, no four-sided border. A developer applying Panel Foundation Rule 1 verbatim to the "Order Lines & Summary" band will render a floating shadow onto the header above it; that is the spec's fault (Rule 1 didn't call out the bottom-panel exception until 2026-07-09) and the fix is the override block, not a hand-tuned shadow tweak.
