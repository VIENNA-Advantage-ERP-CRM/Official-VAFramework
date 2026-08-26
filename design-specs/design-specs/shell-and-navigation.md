# Shell And Navigation

Purpose:
- Canonical shell, navigation, and high-level screen-family rules

Canonical for:
- Global app frame
- Top bar and breadcrumb
- Left navigation
- Bottom task bar
- Module title-bar behavior

Last updated:
- 2026-06-16

## App Shell

- Root app fills the viewport: `height: 100dvh`.
- Body and root scrolling is disabled.
- Scroll only the active content or workspace area.
- Background is a soft diagonal gradient:
  - start: `rgb(199, 232, 255)`
  - end: `rgb(255, 255, 196)`
  - direction: about `129deg`
- The dashboard canvas spans the full viewport width — do not center it or cap the app's outer width.

## Global Top Menu Bar

Use this on home and module screens.

- Height: `42px`
- Horizontal padding: `12px`
- Left cluster: menu button + breadcrumb
- Right cluster: global icons group + avatar
- Background stays transparent over the workspace gradient

The bar was reduced in two passes: `80px → 60px → 42px`. The final value compresses chrome to roughly half its original footprint and gives the dashboard canvas an additional grid row of headroom. Internal items (`24–28 px` breadcrumb text, `32px` icons group) fit with `~5–7 px` of vertical clearance.

### Menu Button
- Rounded rectangle with glass surface
- Visual box `32px` square (icon `20px` + `6px` padding on each side)
- Radius: `8px`
- Border: `2px solid #FFFFFF`
- Icon color: `#0083DA`
- Module-chooser popover anchors at `top: 44px` (the menu button's bottom edge + a `2px` cap)

### Breadcrumb
- Always visible
- Home-only state: `Home`
- Module state: `Home > <Module Name>`
- Active item black
- Inactive item black at about 40 percent opacity
- Text size: `1.125em`
- Separator chevron: `14px`

### Global Icons Group
- Glass rounded rectangle surface
- Height: `32px` (caps the right-cluster height; bar clearance above and below = `5px`)
- Border `2px solid #FFFFFF`
- Internal divider color `#E1E1E1`
- Icons remain global utility actions, not page-local actions

### Top Bar Avatar
- Fixed visual size: `32px x 32px` (matches the icons group height for consistency)
- Wrapping user-info container uses `gap: 12px` and `padding: 4px` so the avatar + icons group + bar collectively read as a single right cluster.
- Circular
- Soft white edge or framed feel
- Slight shadow allowed
- Must stay vertically centered with the top bar content

## Window / Module Title Bar

Sits at the top of every window screen (record list, detail view, queue). Distinct from the global top bar — appears **below** the global top bar inside the module workspace.

- Height: `42px` (was `56px`; tightened in 2026-06-17 calibration so the working area gets ~14 px back on every window screen)
- Border bottom: `1px solid #1F83FF` (the blue underline that signals "this is a window title")
- Horizontal padding: `20px`
- Left cluster: module / record title + navigation crumbs
- Right cluster: contextual icons / search / overflow

Sub-bars on window screens (window action bar, header panel, right-panel header) keep their own heights — only the **title bar** (the one carrying the blue underline) is `42px`.

## Left Navigation

- Appears only inside module context, not on home.
- Collapsed area begins about `12px` from the left.
- Icon button size: `32px` (matches the global top bar's menu button; was previously `48px`).
- Icon size: `20px` glyph inside (was `24px`).
- Inner padding: `6px` on all sides (so icon + padding = the `32px` button).
- Gap between icons: `12px`.
- Active icon uses a white-to-translucent surface and soft blue shadow.
- Default module dashboard should not select any left-nav item.
- Selecting a module item highlights exactly one item.
- Canvas left offset: `56px` (= `32` button + `12 + 12` margins). Was `72px` when the button was `48px`.

## Bottom Task Bar

- Height: `38px`
- Background: `#002640`
- Must touch the viewport bottom edge with no gap
- Home icon block uses `#2084C4` with white icon
- Bottom helper area uses muted copy such as `Question? Ask Aura`
- The bottom bar is global and should stay edge to edge from left to right

## Screen Families

### Screen Types
- Dashboard screens use the 9-column widget grid.
- Window/detail screens use a working surface model.
- Do not force dashboard grid rules onto window/detail screens.

Do not infer:
- opening something from left navigation does not automatically make it a window screen
- a left-nav destination may still be a dashboard/widgets screen
- the window action/search bar belongs to window screens only
- module dashboard root remains widget-only unless an explicit exception is designed

### Screen Variants

- `Only dashboard`
  - uses the 9-column widget grid only
  - transparent workspace
- `Dashboard with window`
  - supports both dashboard and window modes
  - dashboard mode stays transparent
  - window mode uses a white or approved working surface
- `Only window`
  - uses a white or approved operational surface
  - used for lists, forms, inboxes, and record review screens

### Variant Background Rules
- `Only dashboard`: transparent workspace only
- `Dashboard with window`: dashboard transparent, window white
- `Only window`: white primary workspace
- Module title bar keeps the same semi-transparent shell treatment across dashboard and window modes

## Module Dashboard Rule

- Module dashboard view should show widgets only.
- Do not add a module title bar, subtitle, heading block, or period pill above the widget grid unless a design explicitly calls for it.
- This rule applies to the module dashboard itself, not automatically to every left-nav destination.

## Module Title Bar

Use on:
- `Only window` screens
- window state of `Dashboard with window`
- titled left-nav dashboard screens when explicitly designed that way

Do not use on:
- module dashboard root widget screens by default

Base spec:
- Height: `56px`
- Horizontal padding: `20px`
- Background: translucent white
- Bottom border: `1px solid #1F83FF`
- Left title: `1em`, Roboto Regular, black
- Right side usually contains only close icon unless dashboard/window toggle is required

### Close Icon
- Touch target: `32px x 32px`
- Icon size: `20px`
- Color: `#141414`

## Dashboard / Window Selector Title Bar

Use only on screens that truly support both dashboard and window modes.

- Title on left
- Selector immediately to the right of the title
- Selector width about `96px`
- Dashboard and window icon buttons inside
- Active icon uses soft blue surface
- Small blue bottom triangle aligns under the active icon
- Right side contains close icon only

## Interaction Rules

- Close icon in module title bars returns to the parent module dashboard or the intended parent context.
- Breadcrumb `Home` always returns to home dashboard.
- Breadcrumb module name returns to that module dashboard.
- Module dashboard should clear left-nav selection by default.
- Keep hover states subtle.

## Module Chooser Rule

- The top-left menu button may act as a module chooser.
- Breadcrumb should remain generic enough to support multiple modules such as CRM and Finance.
- Once a module has been opened, breadcrumb should preserve the current module context.
