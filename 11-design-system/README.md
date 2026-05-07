---
title: DFMS Design System
category: design-system
status: approved
created: 2026-02-23
updated: 2026-03-12
---

# DFMS Design System

> **Source of Truth** for all UI decisions across DFMS applications: web portal, driver mobile app, QC mobile app, and vendor portal.
>
> All developers and designers must use this system. Do not introduce colors, fonts, spacing, or components not defined here. Raise a change request to extend the system.

---

## Applications Covered

| Application | Technology | Users |
|-------------|-----------|-------|
| Web Admin / Operations Portal | Django Templates + Bootstrap 5 + Alpine.js | Super Admin, Tenant Admin, Dept. Admin, Planners, Gate Officers, QC |
| Driver Mobile App | Flutter | Drivers, Helpers |
| QC Mobile App | Flutter | QC Supervisors, Lab Technicians |
| Vendor Portal (Web + Mobile) | Django Templates (web) / Flutter (mobile) | Vendor staff |

---

## System Contents

### Foundation

| Document | What It Defines |
|----------|----------------|
| [Design Tokens](./01-foundation/design-tokens.md) | All named constants: colors (light + dark), spacing, type, shadows, z-index, animation |
| [Colors](./01-foundation/colors.md) | Brand palette, semantic colors, dark theme, status colors, accessibility ratios |
| [Typography](./01-foundation/typography.md) | Typefaces, type scale, heading styles, font weights, implementation |
| [Spacing & Layout](./01-foundation/spacing.md) | Spacing scale, border radius, shadows, page grid, breakpoints, z-index |
| [Typography & Label Conventions](./01-foundation/typography-and-labels.md) | Label capitalisation rules — sentence-case default, acronym ALL CAPS (POI, TR, TO, PR, UOM), `verbose_name` source fixes, JS safety net (`dfms_labels.js`) |

### Components

| Document | What It Defines |
|----------|----------------|
| [Buttons](./02-components/buttons.md) | Variants, sizes, states, HTML + Flutter examples |
| [Forms](./02-components/forms.md) | Text inputs, selects, checkboxes, toggles, file upload, layout rules |
| [Data Display](./02-components/data-display.md) | Tables, cards, status badges, KPI panels, alerts, empty states, loading |
| [Navigation](./02-components/navigation.md) | Sidebar, topbar, breadcrumbs, tabs, modals |

### Patterns

| Document | What It Defines |
|----------|----------------|
| [Workflow & Status](./03-patterns/workflow-status.md) | Status timelines, approval flows, wizards, bulk actions, real-time data |

### Platform-Specific Guidelines

| Document | What It Defines |
|----------|----------------|
| [Web (Django + Bootstrap)](./04-platforms/web.md) | Bootstrap config, Alpine.js conventions, responsive behavior, accessibility |
| [Mobile (Flutter)](./04-platforms/mobile.md) | ThemeData setup, navigation, touch targets, offline support, push notifications |

---

## Quick Reference

### Design Philosophy

**Modern · Minimalistic · Professional** — Clean geometry, generous whitespace, no decoration. Built for data-dense operational UIs used in demanding field and logistics environments. Every element must earn its place.

### Brand Colors (Brainstation-23 Identity)

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `color-primary-dark` | `#122056` | `#122056` | Top nav, dark surfaces — Pantone 2766 C |
| `color-primary` | `#5B65DC` | `#7580F0` | Buttons, links, active states — Pantone 2726 C |
| `color-primary-light` | `#EEEFFD` | `#1C2044` | Ghost buttons, chips, info backgrounds |
| `color-success` | `#1E8A4C` | `#34D475` | Approved, completed |
| `color-warning` | `#D97706` | `#F59E0B` | Pending, caution |
| `color-danger` | `#C0392B` | `#F87171` | Errors, rejected |

### Theming

Both **light** and **dark** themes are first-class. Theme switching via `[data-theme="dark"]` attribute on `<html>`. Respects OS `prefers-color-scheme` on first visit. See [Colors](./01-foundation/colors.md) for full CSS and Flutter implementation.

### Fonts

- **UI Font**: Inter (400, 500, 600, 700)
- **Code / IDs**: JetBrains Mono (400, 500)

### Spacing Base

4px base unit — all spacing is a multiple of 4.

### Breakpoints

`xs` 0 / `sm` 576px / `md` 768px / `lg` 992px / `xl` 1280px / `2xl` 1536px

---

## Design Influences & Principles

DFMS does not adopt any single design system wholesale. Instead it draws specific, deliberate lessons from proven systems chosen for their relevance to enterprise operational software.

### Reference Systems

| System | Layer | What We Borrow |
|--------|-------|---------------|
| **IBM Carbon Design System** | Web portal (primary reference) | Information density principles, data table affordances, status indicator patterns, form layout rules, and the overall philosophy that professional tools should be calm, structured, and predictable — never decorative |
| **Material 3 (Google)** | Flutter mobile (structural reference) | `ColorScheme` + `ThemeData` token structure, touch target sizing (48×48px minimum), elevation/shadow semantics, and component parameters for buttons, inputs, and cards |
| **Radix UI / Shadcn** | Web (accessibility reference) | ARIA patterns, focus management, keyboard navigation contracts, and accessible component composition patterns |
| **Ant Design** | Behavioural reference only | Form validation UX, table column behaviour, step-wizard patterns, and feedback patterns for bulk operations |

### What We Deliberately Do NOT Adopt

| Avoided Pattern | Reason |
|-----------------|--------|
| M3 "expressive" tonal fills and large rounded shapes | Conflict with professional, authority-first brand identity and data-dense layouts |
| M3 `ColorScheme.fromSeed()` auto-generation | Produces tonal variants that override brand colors (#122056 / #5B65DC) — always use explicit `ColorScheme` |
| Ant Design's default blue-grey palette | Replaced entirely by the Brainstation-23 brand palette |
| HIG (Apple Human Interface Guidelines) | Not applicable — mobile is Flutter cross-platform, not native Swift/SwiftUI |
| Bottom sheets for primary navigation | DFMS operations contexts require persistent, visible navigation (sidebar on web, bottom nav bar on mobile) |

### Core Design Principles

These are binding design decisions, not suggestions:

**1. Density over decoration**
DFMS users are gate officers, QC supervisors, and fleet planners working in fast-paced environments. Every screen must surface the data they need immediately. Generous whitespace is used for clarity, not aesthetic preference.

**2. Status is everything**
Trip status, vehicle status, and QC status drive operational decisions. Status colours, badges, and indicators must be immediately scannable and unambiguous. Never use status colours for decorative purposes.

**3. Authority through restraint**
The dark navy (`#122056`) carries authority. It is used sparingly — top navigation and critical headers only. Overuse dilutes its effect.

**4. Predictability over novelty**
Interaction patterns must be consistent and learnable. Gate operators may use this system dozens of times a day under pressure. Surprising or clever UI patterns are a liability.

**5. Accessible by default**
WCAG 2.1 AA is the minimum. Every component is built accessible first — contrast ratios, keyboard navigation, ARIA labels, and touch targets are non-negotiable, not afterthoughts.

**6. Theme-agnostic tokens**
Every component references CSS custom properties or Flutter `ThemeData` tokens — never raw hex values. Both light and dark themes must work without any component changes.

---

## Governance

### Who owns this?

The design system is owned by the **Tech Lead** and maintained by the frontend team. Changes require a PR review.

### How to propose changes?

1. Open a change request in `08-change-requests/`
2. Describe the gap or new requirement
3. Propose the token/component addition with rationale
4. Get approval from Tech Lead
5. Update this design system and notify all teams

### Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-23 | Initial design system — foundation, components, patterns, platform guides |
| 1.1 | 2026-03-12 | Brand colors updated to Brainstation-23 palette (Pantone 2766 C + 2726 C); dark theme added; design philosophy documented |
| 1.2 | 2026-03-12 | Design influences documented: IBM Carbon (web), M3 structural (Flutter), Radix (accessibility), Ant Design (behaviour); binding design principles defined; M3 anti-patterns called out |
| 1.3 | 2026-05-07 | Label capitalisation convention documented — sentence-case default, acronym ALL CAPS rule, `verbose_name` source fixes across 13 fields, `dfms_labels.js` JS safety net |

---

## Related Documentation

- [Technology Stack](../05-architecture/00-overview/technology-stack-overview.md)
- [Frontend Architecture](../05-architecture/05-backend-architecture/code-organization.md)
- [Module Specifications](../03-module-specifications/)
- [Development Guides](../09-development-guides/)
