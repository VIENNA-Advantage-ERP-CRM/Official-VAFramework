# Foundations

Purpose:
- Canonical visual tokens and shared aesthetic rules for Onfinity UI

Canonical for:
- Colors
- Typography
- Spacing
- Radius, borders, and shadows
- Responsive units

Last updated:
- 2026-07-22

## Product Personality

Onfinity UI should feel:
- clear
- modular
- lightweight
- operational
- consistent

Avoid:
- purple default SaaS styling
- dark-mode-first layouts unless explicitly requested
- random card mosaics that do not align to the 9-column grid
- decorative gradients inside ordinary content areas
- different grid systems per module
- overlapping or scattered widgets

## Color Palette

### Brand And Navigation
- Primary blue: `#0083DA`
- Action blue: `#1F83FF`
- Deep navy: `#002640`
- Home icon block: `#2084C4`
- Link blue: `#106AB0`
- Light active blue surface: `#EAF8FF`
- Active gradient end: `#CAEDFF`
- Pale blue border: `#BFE4FF`

### Backgrounds And Surfaces
- App background start: `#C7E8FF`
- App background end: `#FFFFC4`
- Widget surface gradient start: `rgba(255,255,255,1.00)` (canonical; was `0.80` before the 2026-06-19 calibration — pulled to fully opaque white at the top so widget heads carry more weight against the app gradient)
- Widget surface gradient end: `rgba(255,255,255,0.60)` (canonical; the start/end pair was previously `0.82/0.58`, then briefly `0.60/0.40`, then `0.80/0.60`. Settled at `1.00/0.60` — top of each widget reads as solid white while the bottom still lets the workspace gradient bleed through.)
- Solid panel surface: `#FFFFFF`
- Secondary panel surface: `#FBFDFF`
- Faint blue panel surface: `#EEF6FF`
- Muted row divider (body grid rows): `#E2EAF1`
- Light border (footer band, secondary content): `#D9E2EB`
- Strong divider (grid header bottom): `#C5D2DD`

### Text
- Primary text: prefer `#102C3F` or `#111827`
- Secondary text: `#41576A` (was `#5F7283` — darkened so grid data reads with stronger weight against the glass surface)
- Muted text: `#5F7283` (was `#748494` — darkened to maintain hierarchy after the secondary tone moved)
- Disabled or placeholder text: `#9F9F9F`
- Breadcrumb inactive text: `rgba(0,0,0,0.4)`

### Semantic Colors
- Success: `#019D89`, `#0B6B45`, `#20A464`
- Danger or blocked: `#ED1C24`, `#D14545`, `#A33F3F`
- Warning: `#D78B10`, `#9A6500`
- Proposal accent: `#8B7CFF`, `#5F4AA6`
- Info pill background: `#DFF1FF`, `#EEF8FF`

### Standard Gradients
- App background: `linear-gradient(129deg, rgb(199,232,255), rgb(255,255,196))`
- Standard glass widget: `linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,0.6))` — one canonical gradient (the earlier `0.7/0.49`, `0.82/0.58`, and `0.8/0.6` pairs are deprecated). Widgets keep this glass surface.
- Right / header / bottom panel: **solid white `#FFFFFF`**. Panels are working surfaces for detail forms, grids, entity rows, and summary stacks — a white surface makes them read cleanly without a translucent layer competing with the content. This replaces the earlier "Module panel: same as Standard glass widget" rule; right and header panels no longer share the glass gradient with widgets. Border + shadow do the visual separation from the app background. See `windows-and-panels.md > Right Panel > Shared Rules` and `> Bottom Panel Layout > Shared Rules`.
- Selected list row: `linear-gradient(109deg, #EAF8FF 0%, #CAEDFF 100%)`
- Module action bar: `linear-gradient(180deg, rgba(230,243,252,0.65), rgba(245,250,253,0.72))`

## Figma Foundation Variables

Use Figma token names when creating semantic CSS variables or component APIs.

### Color Variables
- `color/text/default`: `#141414`
- `color/text/inverse`: `#FFFFFF`
- `color/surface/page`: `#FFFFFF`
- `Color/Primary`: `#0083DA`
- `color/primary/hover`: `#0069AE`
- `color/primary/pressed`: `#004F83`
- `color/secondary/enabled`: `#E5F3FB`
- `color/secondary/hover`: `#CCE6F8`
- `color/disabled`: `#616161`
- `Color/On surface`: `#080808`
- `Color/On surface disabled`: `#474747`

### Typography Variables
- `Text/Styles/Body`: `Roboto`
- `text/height/sm`: `14`
- `text/height/md`: `16`
- `scale/maximal/4`: `400`
- `Onfinity DS/Paragraph/P2`: Roboto Regular, `0.875em` (≈ `14px`), weight `400`, letter spacing `0.25px`
- `Onfinity DS/Paragraph/P1`: Roboto Regular, `1em` (≈ `16px`), weight `400`, letter spacing `0.5px`

### Spacing And Shape Variables
- `space/2xs`: `2`
- `space/md`: `8`
- `space/xl`: `12`
- `space/2xl`: `16`
- `border/stroke/normal`: `2`
- `border/radius/full`: `999`
- `scale/11`: `20`
- `scale/14`: `28`

## Typography

### Product Font
- Primary app font: `Roboto`
- Use Roboto as the only UI font unless the whole typography system is intentionally revised.

### Core Type Rules
Font sizes are quoted in `em` against the nearest font-size anchor (`1em = 16px` at the document baseline, scaled by the panel/widget anchor when one is set).

- Module title bar label: `1em`, regular
- Breadcrumb: `1.125em`, bold
- Table or list header: `0.8125em`, regular, muted
- Row title: `0.875em` to `1em`, bold
- Row metadata: `0.75em` to `0.875em`, regular, muted
- Chip text: `0.6875em` (Chip) or `0.8125em` (Pill) — canonical spec in `Chips And Pills` below. Do not pick a value between these two.

Use bold for:
- record names
- totals
- active values
- key statuses

Use regular for:
- labels
- descriptions
- metadata
- explanatory copy

## Responsive Unit Rules

The spec uses `em` for typography across the board — at the document level it inherits the root `16px` baseline; inside widgets and panel bodies it inherits whatever anchor that container sets. Everything that isn't text uses `px`.

- **All typography → `em` against the nearest font-size anchor.** At the chrome level (top bar, breadcrumb, nav, module title bar, dialogs, detail forms) there is no anchor override, so `1em = 16px` and behaviour matches the user's browser baseline. Inside a widget or right-panel body the local anchor takes over.
- **Dashboard widget typography and spacing → `em` against the widget root anchor.** Each widget root sets `font-size: clamp(16px, 1.2cqi, 20px)`. Everything inside the widget (text, padding, margins, gaps, icon sizes) is `em` so it scales proportionally with the dashboard container width. Full scale and rules in [dashboard-widgets.md](./dashboard-widgets.md) → `Widget Internal Sizing`.
- **Right-panel and bottom-panel body typography and scalable spacing → `em` against the canonical panel-body anchor** (`clamp(18px, 1vw, 20px)`). One formula for every panel type; a right panel next to a bottom panel on the same window renders at the same physical size. See [windows-and-panels.md](./windows-and-panels.md) → `Panel Foundation > Rule 3`.
- **Shell spacing, widths, heights, padding, gaps, icon sizes outside widgets → `px`.** Matches the implementation (Tailwind arbitrary values, dev-handoff CSS, Figma tokens) and avoids translation friction.
- **Borders, dividers, strokes, shadow offsets → `px` everywhere.** They should not scale with font-size or with the dashboard container.
- **Pill radius sentinel → `999px`.** Special value meaning "full pill".
- **Icons inside text content → `em` is acceptable** when the icon should track the surrounding text size (e.g., a leading icon in a button label, or any icon inside a widget). Default to `px` for chrome icons (close `✕`, kebab, nav rail).

The unit system is intentional: containers (widgets, right panels) that need to scale fluidly with their inline size set their own anchor; chrome lives at the document level where `1em` resolves to the root baseline. Switching from `rem` to `em` everywhere means a single rule — "text uses em" — applies whether the element sits in chrome, in a widget, or in a panel body. The anchor just changes.

When an implementation needs root-font-scaling for non-typography values (rare), it may translate the `px` spec value to `em` at `1em = 16px`. The spec value is authoritative; the unit is not.

## Spacing, Radius, Borders, Shadows

### Spacing
- Base dashboard grid gap: `12px`
- Module content padding: `12px` (dashboard grid wrapper — tightened from the earlier `18px` to give widget cells more grid budget; see `implementation-rules.md > Dashboard Implementation Pattern`)
- Detail view / window content padding: `18px–24px` (panels and forms still use the original `18px+` range)
- Large detail panel padding: `22px` to `24px`
- Card or widget inner padding: `16px` to `18px`
- Compact row padding: `10px` to `14px`
- Icon/text gap: `8px` to `12px`
- Section vertical gap: `12px` to `18px`

### Radius
- Small controls: `8px`
- Standard widgets: `12px` to `14px`
- Large panels: `16px` to `18px`
- Pills and buttons: `999px`
- Quick-action icon well: `14px`

### Borders
- Widget border: `2px solid #FFFFFF`
- List row divider: `1px solid #EBEBEB` or `#E2EAF1`
- Module title bar bottom border: `1px solid #1F83FF`
- Standard content border: `1px solid #D9E2EB`

### Shadows
- Widget shadow: `0 10px 24px rgba(15,61,97,0.06)`
- Active list row shadow: `inset 4px 0 0 #0083DA, 0 12px 24px rgba(31,131,255,0.10)`
- Quick action icon shadow: `0 10px 24px rgba(31,131,255,0.22)`
- Search pill shadow: `0 6px 14px rgba(16,47,74,0.06)`

Use shadows sparingly.

## Chips And Pills

Chips carry short, glance-legible labels — status, category, type, priority. Pills carry interactive labels — entry-point actions, quick filters. Both share the pill radius (`999px`) but differ in size, weight, and treatment. **These two tiers are the entire chip system — do not introduce a third size or a bespoke chip pattern per widget.**

The size difference is load-bearing: on any row with both a Chip and a Pill, the reader relies on it to tell "look at this label" from "click this to act". Do not scale a Chip up or a Pill down to fit a tight layout — if it doesn't fit, drop the chip, don't resize it.

### Chip (glance label)

Used for: record status, priority, category, type flag, count badges, inline tags in list rows and section headers.

- **Radius:** `999px`
- **Padding:** `0.3125em` vertical, `0.625em` horizontal (≈ `5px / 10px` at the `16px` baseline). This matches the `Hero Card > Status pill` value in `windows-and-panels.md`; the whole chip system uses one padding. The earlier `0.1875em / 0.5em` value read as too tight in practice against `line-height: 1` and is deprecated.
- **Font:** `Roboto Bold` for semantic/status chips; `Roboto Medium` (500) for neutral category / type-tag chips
- **Size:** `0.6875em` (≈ `11px` at the `16px` baseline)
- **Text:** single-line, `whitespace-nowrap`. Two words max is a good rule of thumb; three tolerable; a sentence is wrong — use a compact list row instead.
- **Case:** sentence case. Do not `uppercase` chip labels unless the label is genuinely an acronym (`SKU`, `PO`) or a status badge inside a Stage Pipeline detail strip (which spec explicitly calls out as uppercase).
- **Icon:** optional leading icon `0.75em` square, same color as the text. Prefer text-only chips — icons add noise at chip size.

Semantic tones (same palette as Hero Status Card):
- **Info / blue** — bg `#EAF8FF`, text `#0083DA`
- **Success / green** — bg `#E7F7EF`, text `#0B6B45`
- **Warning / amber** — bg `#FFF6E2`, text `#9A6500`
- **Risk / red** — bg `#FCEFEF`, text `#A33F3F`
- **Proposal / purple** — bg `#EFEEFF`, text `#5F4AA6`
- **Neutral / gray** (default for category / type-tag chips) — bg `#F1F4F8`, text `#41576A`

When a chip sits inside an already-tinted card (e.g., a Hero Card with Info gradient), swap its background to plain white `#FFFFFF` and keep the semantic tone on the text only — the two-layer tint reads muddy otherwise.

### Pill (interactive action)

Used for: entry-point buttons in `Action Pill Row`, quick filters, action-variant Section Header links when rendered as buttons.

- **Radius:** `999px`
- **Padding:** `0.5em` vertical, `0.875em` horizontal (≈ `8px / 14px` at the `16px` baseline)
- **Font:** `Roboto Regular`
- **Size:** `0.8125em` (≈ `13px` at the `16px` baseline)
- **Border:** `1px solid #0083DA`
- **Background:** `#FFFFFF`
- **Color:** `#0083DA`
- **Hover:** bg `#EEF8FF`, color unchanged
- **Disabled:** border + text drop to `#9AB0C0`, background stays white, cursor `not-allowed`
- **Icon:** optional leading icon `1em` square, same color as the label

Do not fill the pill (`background: #0083DA`, white text) — a filled pill reads as a primary submit button and conflicts with the form action bar. Filled treatments are reserved for the form action bar's primary button.

### What Not To Do

- Do not introduce a third "medium" tier between Chip and Pill. Two sizes are the entire system.
- Do not use Pill padding + Chip typography, or vice versa. The size + typography move together.
- Do not use a Pill for status display or a Chip for an action target. If you find yourself doing either, you're probably reaching for a Compact List row or an Action Pill instead.
- Do not tint a Pill's background — the outline treatment is what makes it read as interactive against the flat panel surface.
- Do not stack pills tightly (`gap` less than `0.5em`) — chips can pack tighter (`gap` down to `0.25em`) because their smaller size gives them more breathing room by default.
- Do not carry a reference file's third-tier "compact" chip forward. Common offenders: `.docbadge`, `.tchip`, `.status-tag`, `.skillchip` at `0.625em` / `padding 2px 5px` / weight `600`. Normalize them to Chip (`0.6875em`, `0.3125em 0.625em`, weight `700` or `500`) before shipping. Run the audit in [review-checklist.md > Panel HTML Token Audit](./review-checklist.md#8-panel-html-token-audit) before writing panel HTML, not after — reviewer catches it in one round; the audit catches it in zero.

## Panel Button

Rectangular action buttons that live inside a panel body — the "Save", "Submit for approval", "Reset" style controls that are neither Pills (entry-point actions with `999px` radius) nor section-action links. Every `<button>` inside `.panel-body` MUST carry an explicit sizing class — `.panel-btn`, `.action-pill`, `.section-action`, or another named pattern. A naked `<button>` is a spec violation: the Panel Foundation Rule 4 form-control reset (`font-size: inherit`) is a *context reset* for em-based children (chips, icons) rendered inside the button, not a display size for the button label itself. Left unstyled, the button label resolves to the panel anchor (`18–20px`) and reads visibly larger than surrounding row primaries.

### Panel Button (rectangular action)

Used for: neutral secondary actions inside a panel body, save/submit controls in an inline action row, dialog-style confirm/cancel pairs.

- **Radius:** `6px` (rectangular — distinct from Pill's `999px`, which is reserved for entry-point actions)
- **Padding:** `0.5em 0.875em` (matches Pill for vertical / horizontal rhythm)
- **Font:** `Roboto Medium` (500)
- **Size:** `0.8125em` (same interactive-label tier as Pill and section-action — the entire panel action layer sits at `0.8125em`)
- **Border:** `1px solid #D9E2EB`
- **Background:** `#FFFFFF`
- **Color:** `#41576A`
- **Hover:** bg `#F1F4F8`, border `#B8C5D2`
- **Disabled:** border + text drop to `#9AB0C0`, background stays white, cursor `not-allowed`
- **Icon:** optional leading icon `1em` square, same color as the label

**Primary variant.** Same size, weight, padding, and radius; swap the chrome: `border: 1px solid #0083DA`, `background: #0083DA`, `color: #FFFFFF`, hover `background: #0069AE`. Use for a single primary confirmation per panel — never stack two primaries. Filled primary is reserved for `panel-btn` and the form action bar; Pills stay outlined (see [Chips And Pills > What Not To Do](#what-not-to-do)).

### What Not To Do

- Do not use a Pill (`999px` radius) for a rectangular action — pills mean "entry-point"; the shape difference is load-bearing.
- Do not omit the class and let the button inherit the panel anchor. Symptom: button label reads noticeably larger than row primaries in the same panel.
- Do not introduce a third size between Panel Button and Pill. They share the `0.8125em` interactive-label tier by design; a "compact" button variant at `0.75em` or a "large" one at `0.9375em` is not spec.
- Do not "fix" oversized panel buttons by changing Rule 4's reset to `0.8em`. That silently shrinks every chip inside every button (a chip at `0.6875em` becomes `0.55em` of the anchor), re-introducing the exact bug Rule 4 exists to prevent.

## Icons

- Preferred app icon library: `lucide-react`
- Existing Figma-imported SVG icon components are acceptable when already present.
- Nav icons: `24px`
- Title or action bar icons: `18px` to `20px`
- Section header icons: `22px`
- Row or action icons: `14px` to `16px`
- Primary action icon color: `#1F83FF` or `#0083DA`
- Neutral icon color: `#586575`
- Disabled icon color: `#7A8A98`

## Accessibility And Readability

- Keep text contrast strong on translucent surfaces.
- Interactive elements must be real `button` elements when they trigger actions or navigation.
- Avoid nested buttons.
- Keep touch targets around `32px` minimum for icon actions and `48px` for primary nav icons.
- Use clear labels, not only icons, for important actions when space allows.
- Avoid dense paragraphs inside widgets.

## Do And Do Not

Do:
- keep the interface structured and operational
- use blue as the primary action color
- use soft tinted panels only to support meaning
- scale content with consistent typography and spacing rules

Do not:
- introduce a new visual language for a single module
- use purple default SaaS styling
- make decorative gradients the primary content treatment
- mix arbitrary typography scales across otherwise similar components
