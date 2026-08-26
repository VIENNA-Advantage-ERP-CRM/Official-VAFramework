# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

VIENNA Advantage — a dictionary-driven ERP/CRM framework. ASP.NET MVC 5 on .NET Framework 4.8 (classic `.csproj`, not SDK-style; `dotnet build` will not work). Windows/IIS only.

Almost nothing here is hard-coded UI: windows, tabs, fields, processes, and workflows are rows in Application Dictionary tables (`AD_Window`, `AD_Tab`, `AD_Field`, `AD_Process`, `AD_Workflow`, …). The C# layer reads that metadata into value objects, serializes them to JSON, and a jQuery-based JS framework (`VIS.*`) renders the actual screens in the browser. To change how a screen behaves you usually change dictionary data or the generic renderer — not a per-screen file.

## Build

Open `ViennaAdvantageWeb.sln` in Visual Studio 2022, or use MSBuild. NuGet package restore is required (`packages/` at repo root, `packages.config` per project).

```powershell
msbuild ViennaAdvantageWeb.sln /t:Restore /p:Configuration=Debug
msbuild ViennaAdvantageWeb.sln /p:Configuration=Debug
```

**Two things must be in place before a build succeeds:**

1. `ViennaAdvantageWeb/Dll/` is gitignored and **not in the repo**. It holds the prebuilt binaries every project references: `ModelLibrary.dll`, `BaseLibrary.dll`, `CoreLibrary.dll`, `ViennaBase.dll`, `VAS.dll`, `XModel.dll`, `VAI01.dll`, Crystal Reports, Oracle/Npgsql/MySql providers, etc. Obtain it out-of-band; a fresh clone will not compile without it.
2. `VIS/node_modules` (gitignored) — run `npm install` in `VIS/` once.

### Front-end build

The VIS project has a **pre-build event `npm run build`** (webpack) and a **post-build event that xcopies `VIS/Areas/*` into `ViennaAdvantageWeb/Areas/`**. So a normal solution build already rebuilds the JS/CSS bundles. To run webpack alone, from `VIS/`:

```powershell
npm run build      # webpack, mode from webpack.config.js (currently 'development')
npm run buildPro   # webpack --mode production
```

There is no test suite, linter, or CI configuration in this repository.

## Non-obvious rules

- **Never edit anything under `ViennaAdvantageWeb/Areas/`.** That whole tree is gitignored build output, overwritten by VIS's post-build xcopy. The source of truth for all VIS views, scripts, styles, and images is **`VIS/Areas/VIS/`**.
- **Bundle versions are manual.** `VIS/webpack.config.js` has a `versions` map (`VIS.all`, `VIS2_0`, `React`, `VIS`) that becomes part of the emitted filename (`VIS.all.min3.0.2.11.js`). `VIS/Areas/VIS/VISAreaRegistration.cs` includes them via a `{version}` placeholder. Change JS or CSS without bumping the matching version and browsers keep serving the cached old bundle.
- **New JS files must be imported into an entry point** or they simply won't ship: `Scripts/src/VISjs.js` (main framework), `Scripts/src/VIS_v2.js` (F20 UI), `Scripts/src/reactjs.js` (React). Import order in `VISjs.js` is load order and is significant — `initialize.js` stays near the end.
- **Every database interaction must work on Oracle, PostgreSQL, MS SQL and MySQL.** Dialect branches use `DatabaseType.IsOracle / IsPostgre / IsMSSql / IsMySql` or `DB.IsOracle()`. Sequences, `nextval`, date handling and casing all differ — follow the existing branch pattern rather than writing one dialect.
- `Web.config` in `ViennaAdvantageWeb` selects the target database purely by which `appSettings` key is uncommented (`oracleConnectionString` / `postgresqlConnectionString`). It currently contains live-looking credentials; don't add more, and don't commit connection changes casually.

## Project graph

```
VAModelAD   → (no project refs; depends on prebuilt Dll/)   core model, dictionary, process & print engines
VAWorkflow  → VAModelAD                                     document/workflow engine
VISLogic    → VAModelAD, VAWorkflow                         server-side models, helpers, query layer
VIS         → VAModelAD, VISLogic                           MVC Area "VIS": controllers, views, all client JS/CSS
ViennaAdvantageWeb → VAModelAD, VIS                         host web app (Global.asax, App_Start, bin)
```

`ViennaAdvantageWeb` is a thin shell: `RouteConfig`/`BundleConfig` delegate straight to `ViennaBase.dll`, and `Global.asax.cs` delegates lifecycle events to `VIS.Areas.VIS.Classes.VISGlobal`.

Namespaces do not track project or folder names. `VAdvantage.*` (Model, Classes, Controller, Print, Process, ProcessEngine, Utility) is the dominant one and is spread across `VAModelAD/` and the prebuilt DLLs; `ViennaAdvantage.Model` is used by generated `X_*` classes; `VIS.*` by the MVC layer. Grep for a type, don't infer its location.

## Core architecture

### Persistence: PO / X_ / M pattern

`PO` (the persistent-object base), `Ctx`, `Env`, `DB`, `Trx`, `VLogger`, `CCache` all live in the **prebuilt DLLs, not in this source tree** — you can use them but can't read or change them here.

For each dictionary table there are up to two classes:
- `X_<TableName>` — generated column accessors (`VAModelAD/ModelAD/X_*.cs`, namespace `ViennaAdvantage.Model` or `VAdvantage.Model`). Regenerated by the *Generate XModel* process (`GenerateXModelController` / `Scripts/app/forms/generatexmodel.js`); hand edits are lost.
- `M<Name>` — hand-written subclass holding business logic, `BeforeSave`/`AfterSave` overrides, static finders (`VAModelAD/ModelAD/M*.cs`).

`VAModelAD/Classes/ModelFactory.cs` maps a table name to its class **by naming convention**, so names matter:
- prefix stripped when the segment before `_` is ≤ 2 chars (`AD_Window` → `MWindow`), underscores removed
- special cases hard-listed in the `_special` array
- `I_*` import tables resolve to `VAdvantage.Process.X_I_*`
- module tables resolve through their module prefix into the module's own assembly (`<Module>.Model.M*`, `.Process.M*`, `.WF.M*`, …)

A class that doesn't ultimately derive from `PO` is silently rejected by the factory.

### Dictionary → UI pipeline

`VAModelAD/Controller/` holds the window model: `GridWindow` → `GridTab` → `GridTable` / `GridField`, each with a `*VO` value object. `JsonDataController.GetGridWindow` serializes these to the browser, where `Scripts/app/controller.js` rebuilds the same GridWindow/GridTab/GridField objects in JS. Two renderers consume them:

- `Scripts/app/windowframe.js` — the original (v1) window UI, marked "do-not alter".
- `Scripts/F20/*` — the current UI (`wframe`, `veditview`, `vgridview`, `vcardview`, `vlistview`, `vmapview`, `apanel`, `afilterpanel`, themes), bundled as `VIS2_0`.
- `Scripts/react/*` — a small, newer React surface reached from legacy code through `shared/VISReactControlsBridge`.

Client JS is namespaced IIFEs: `;(function ($, VIS) { VIS.Something = ... })(jQuery, VIS)`. There is no module system inside `app/` — everything hangs off the global `VIS` object.

### Data access from the browser

The JS layer sends **SQL text** to `JsonData/JDataSetWithCode`, `JsonData/ExecuteNonQuer`, `Form/JDataSet` (see `Scripts/app/classes.js`, `controller.js`) and gets DataSet/DataReader-shaped JSON back. Server-side gatekeeping is `VISLogic/Classes/QueryValidator.cs` (keyword blacklist, `IsValidIdentifier`, `SafeIntList`) plus the `[AjaxAuthorize]` / `[AjaxSessionFilter]` / `[AjaxValidateAntiForgeryToken]` filter trio on the controllers. Any new endpoint accepting client SQL or client-supplied identifiers must go through `QueryValidator` and carry all three filters.

### Processes and callouts

- **Processes**: `AD_Process.Classname` names a class deriving from `SvrProcess` (`VAModelAD/ProcessEngine/`). `ProcessCtl` resolves it reflectively across the product and module assemblies, then calls `Prepare()` / `DoIt()`. Parameters flow through `ProcessInfo` / `MPInstance`. `VAModelAD/ProcessAD/` contains the framework's own processes (schema sync, translation, column encryption, module packaging).
- **Callouts**: `AD_Column.Callout` names `Class.Method`; `CalloutEngine.Start` invokes it. Callouts run on both server (`VAModelAD/Model/CalloutEngine.cs`) and client (`Scripts/app/calloutengine.js`).
- **Workflow**: `VAWorkflow/WF/` — `MWorkflow`, `MWFProcess`, `MWFActivity`, `MWFNode`, driven by `DocWorkflowManager` and `DocumentAction` for document approval/state transitions; `StateEngine` in `VAModelAD/ProcessAD/`.

### Modularity

Functional modules (VA###, CMS01, FRPT, …) ship as separate assemblies dropped into `bin`, discovered at runtime — `VISGlobal.Application_Start` installs an `AssemblyResolve` hook that loads any requested assembly from `bin` regardless of version. Each module registers its own MVC Area, and registers its script/style bundles with `VAModelAD.ModuleBundles` using a prefix and an integer order (lower loads first; `"ViennaAdvantage"` is forced last). Only the framework itself lives in this repo.

### Reporting and printing

`VAModelAD/Print/` is a self-contained layout/print engine (`LayoutEngine`, `ReportEngine_N`, `MPrintFormat`, PDF via PdfSharp/iTextSharp). `VAModelAD/CrystalReport/` is the parallel Crystal Reports path. Both are driven by dictionary print formats, not by templates in source.





## Additional Context

Always refer to the design specifications in the `./Design Specs/` folder before making any UI changes.


