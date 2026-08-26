# Onfinity Dashboard Design System

This file is the canonical entry point for Onfinity UI specs. Use it as the index, then open only the focused spec file needed for the task.

Purpose:
- Lightweight routing/index file for all Onfinity design specs

Canonical for:
- Spec discovery
- Task classification
- Focused spec routing

Last updated:
- 2026-07-09

## How To Use This Artifact

- Do not load every spec file by default.
- Pick the smallest relevant document for the task.
- Use `design.md` first only to classify the task and find the right spec file.
- If a task touches multiple systems, load only the matching docs.
- If a new reusable rule is introduced, update the focused spec file first, then update this index only if the file map changes.

## Classify The Task First

Use this quick classification before loading any deeper spec file:

- `Dashboard`
  - transparent workspace
  - 9-column widget grid
  - load [dashboard-widgets.md](./dashboard-widgets.md)
- `Only window`
  - white or approved working surface
  - title bar and optional window action/search bar
  - load [windows-and-panels.md](./windows-and-panels.md)
- `Dashboard with window`
  - dashboard mode plus window mode for the same module/screen
  - load [shell-and-navigation.md](./shell-and-navigation.md) and [windows-and-panels.md](./windows-and-panels.md)
- `Shell / navigation`
  - breadcrumb, left nav, global top bar, bottom bar, module chooser
  - load [shell-and-navigation.md](./shell-and-navigation.md)
- `Foundations`
  - colors, typography, spacing, responsive units
  - load [foundations.md](./foundations.md)
- `Implementation`
  - coding constraints, wrapper patterns, source file references
  - load [implementation-rules.md](./implementation-rules.md)

## Spec Map

### 1. Foundations
File: [foundations.md](./foundations.md)

Use for:
- product personality
- color palette
- Figma variables
- typography
- spacing, radius, borders, shadows
- icon rules
- responsive sizing guidance
- accessibility and general do/don't rules

### 2. Shell And Navigation
File: [shell-and-navigation.md](./shell-and-navigation.md)

Use for:
- app shell
- top bar
- breadcrumb
- left navigation
- bottom task bar
- module chooser behavior
- global avatar and global icons
- module title bar rules
- module dashboard behavior

### 3. Dashboard Widgets
File: [dashboard-widgets.md](./dashboard-widgets.md)

Use for:
- 9-column dashboard grid
- widget size system
- **widget internal sizing (em + cqi scale)** ← single source of truth for widget typography and spacing
- **list / grid hierarchy rule** (row cells must be smaller than the widget title)
- widget header rules
- shortcut widgets
- KPI widgets
- grid/list widgets
- stat value rules
- quick-action widget layout
- widget footer pager (24 px buttons, 14 px chevrons)
- dashboard search widget
- module dashboard layout patterns

### 4. Windows And Panels
File: [windows-and-panels.md](./windows-and-panels.md)

Use for:
- window screen states: grid, card, detail
- detail-view form layout
- 1/2/3/4-column form patterns
- centered 2-column form variant
- form field rules
- disabled field style
- field groups
- action cells inside form grids
- section hierarchy inside detail forms
- dashboard-with-window behavior
- window action bar
- header panel
- bottom panel
- right panel
- right panel expand/collapse strip
- right panel title/dropdown behavior
- window action panel on far right
- status/footer bar on windows

### 6. Implementation Rules
File: [implementation-rules.md](./implementation-rules.md)

Use for:
- stack and file ownership notes
- implementation constraints
- interaction rules
- reusable component guidance
- local source references

### 7. Review Checklist
File: [review-checklist.md](./review-checklist.md)

Use for:
- validating new dashboard screens
- validating new window/detail screens
- checking right-panel and bottom-panel behavior
- catching common implementation drift before handoff
- **Panel HTML Token Audit** — 6-step pre-write and pre-review walkthrough for any panel HTML (two-tier chip enforcement, Panel Foundation contract, body typography tokens, `0.6875em` token floor, weight palette `400/500/700`, row inheritance traps). Run before writing, not just before review — reference-file sizes drift silently and the audit catches the drift in one pass instead of over several rounds of downstream correction.

### 8. Changelog
File: [changelog.md](./changelog.md)

Use for:
- looking up when a spec rule was added, revised, or removed
- reading the reasoning behind a change without walking git blame
- auditing an existing screen against rules introduced after it shipped
- update convention: every spec edit adds a `## YYYY-MM-DD` entry with the files touched, the sections changed, and a `**Why:**` line naming the failure mode the change prevents

## Common Task Routing

- "Create or refine a dashboard widget": open [dashboard-widgets.md](./dashboard-widgets.md)
- "Create a module shell or fix breadcrumb/nav": open [shell-and-navigation.md](./shell-and-navigation.md)
- "Build a detail form": open [windows-and-panels.md](./windows-and-panels.md)
- "Add a header panel, bottom panel, or right panel": open [windows-and-panels.md](./windows-and-panels.md)
- "Tune colors, type, or responsive sizing": open [foundations.md](./foundations.md)
- "Need coding constraints or source references": open [implementation-rules.md](./implementation-rules.md)
- "Review whether a new screen actually matches the spec": open [review-checklist.md](./review-checklist.md)
- "About to write / just wrote a panel HTML (right / bottom / header / detail pane)": open [review-checklist.md](./review-checklist.md#8-panel-html-token-audit) and walk the Panel HTML Token Audit
- "When did rule X land? / Why does the spec require Y?": open [changelog.md](./changelog.md) — reverse-chron log of every spec change with the failure mode each was intended to prevent

## Source Of Truth Rule

- The focused spec files are the working source of truth.
- This index should stay short.
- Avoid copying full rules into this file unless they are needed for navigation across specs.

## Reference Sources

- Google Stitch DESIGN.md concept: <https://stitch.withgoogle.com/docs/design-md/overview>
- Figma design-system reference: Onfinity Design System, node `2425:4585`
- Local product implementation: `src/imports/WidgetOnWindowHome/WidgetOnWindowHome.tsx`
- Local tokens/styles: `src/styles/theme.css`, `src/styles/fonts.css`, `src/styles/tailwind.css`
