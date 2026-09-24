# Onfinity Framework

**The low-code framework under Onfinity ERP and CRM (formerly VIENNA Advantage), in C#/.NET.** The Application Dictionary describes the system as data: tables, windows, tabs, fields, references, validation rules, callouts, processes, print formats, menus and roles are metadata rows, read by an engine that renders the HTML5 client, runs the rules and posts the documents. A new window, field, workflow or report is a definition, not a build, and it survives every upgrade of the core.

Onfinity was named VIENNA Advantage until 2024; the code, the product and the company are the same.

| | |
|---|---|
| The ERP and CRM built on this framework | https://github.com/VIENNA-Advantage-ERP-CRM/Official-VAStandard-ERP-CRM |
| Base and core libraries (build these first) | https://github.com/VIENNA-Advantage-ERP-CRM/Official-VABaseFiles |
| For partners and ISVs: building a vertical on the platform | https://onfinity.io/isv-program.php |
| Ready-to-run packages | https://sourceforge.net/projects/erp-crm-advant/files/ |
| Development guide | https://viennaadvantage.atlassian.net/wiki/spaces/VA/pages/9207809/Development+Guide |

## What is in this repository

| Project | Contents |
|---|---|
| `VAModelAD` | The Application Dictionary model and engine: the `AD_` tables as classes, the model and process engines, lookups, translations, installation and packaging of modules, reports and printing (including Crystal Reports), mail and push notifications, the AI helper. |
| `VAWorkflow` | Document workflows: states, approval limits per document type and amount, alerts and notifications. |
| `VIS` | The HTML5 client: windows, tabs, fields, grids, dashboards, the report and process dialogs. |
| `VISLogic` | The server side of the client: the services the client calls. |
| `ViennaAdvantageWeb` | The web project that hosts the framework in IIS. |

## What the framework gives a module

- Windows, tabs and fields from metadata, with defaults, read-only and display logic, validation rules and callouts.
- Document types with a document-action lifecycle (draft, complete, void, reverse, re-activate) and accounting postings written by the document's own class.
- Workflows with approval limits; the approval recorded on the document with name and date.
- The change log on every record: field, old value, new value, user, time.
- Roles with access per window, process, form and organisation; several organisations with their own books under one client.
- Translation tables for labels, messages, lists and documents.
- Processes and reports registered with their parameters; print formats laid out in the system; dashboards.
- A REST API to read and write records in any window.
- Packaging: a module's dictionary entries, code and files packed together and delivered through the Onfinity Market.

## Building

Build [Official-VABaseFiles](https://github.com/VIENNA-Advantage-ERP-CRM/Official-VABaseFiles) first, then this solution (`ViennaAdvantageWeb.sln`, Visual Studio 2019 or later, .NET Framework), then the ERP. The full sequence, the database and the `DLL` and `Areas` folders the web project expects are described in the ERP repository's [BUILD.md](https://github.com/VIENNA-Advantage-ERP-CRM/Official-VAStandard-ERP-CRM/blob/master/BUILD.md).

## Licence

Eclipse Public Licence. What you build on the framework is yours; the licence does not oblige you to publish it. See https://onfinity.io/open-source-erp.php.
