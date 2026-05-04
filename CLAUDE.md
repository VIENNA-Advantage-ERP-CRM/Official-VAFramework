ViennaAdvantage Solution — Financial Widgets
Project Overview

This is the ViennaAdvantage (VA) Framework codebase. We are building new Financial Widgets that integrate into the existing VIS module.

Frontend: React widgets rendered as pages
Backend: ASP.NET MVC controllers (C#)
Project Structure & Conventions
Frontend — React Widgets

All new financial widgets are React components added as pages here:

VIS/Areas/VIS/Scripts/react/pages/

When creating a new widget:

Place the React page component inside the pages/ folder above
Follow the existing page structure and naming conventions used in that folder
Match the design system documented in @docs/frontend/design2.md
Backend — Controllers

All backend logic for the widgets lives in MVC controllers here:

VIS/Areas/VIS/Controllers/

When adding backend support for a widget:

Create a new controller (or extend an existing one) in the Controllers/ folder above
Follow the existing controller patterns in that directory
Expose endpoints that the React widget will consume
Design System

Follow the design guidelines, components, tokens, and patterns defined in:

@docs/frontend/design2.md

All new widgets must visually and structurally match this design spec.

Workflow for Adding a New Financial Widget
Understand the requirements — identify what data and functionality the widget needs
Design the widget — follow design2.md for layout, components, and styling
Build the backend — add a controller in VIS/Areas/VIS/Controllers/ exposing the needed endpoints
Build the frontend — add the React page in VIS/Areas/VIS/Scripts/react/pages/
Wire them together — connect the React page to the controller endpoints
Important Notes
This is the existing VAFramework codebase — respect existing patterns and don't introduce new frameworks/libraries without checking first
File paths in this project are Windows paths (C:\Users\...) but use relative paths from project root when possible
Keep new code consistent with the surrounding code style in each folder