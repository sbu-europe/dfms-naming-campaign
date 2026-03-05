---
title: DFMS Design System
category: design-system
status: approved
created: 2026-02-23
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
| [Design Tokens](./01-foundation/design-tokens.md) | All named constants: colors, spacing, type, shadows, z-index, animation |
| [Colors](./01-foundation/colors.md) | Brand palette, semantic colors, status colors, accessibility ratios |
| [Typography](./01-foundation/typography.md) | Typefaces, type scale, heading styles, font weights, implementation |
| [Spacing & Layout](./01-foundation/spacing.md) | Spacing scale, border radius, shadows, page grid, breakpoints, z-index |

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

### Brand Colors

| | Hex | Use |
|-|-----|-----|
| Primary | `#1A4F8A` | Actions, links, active states |
| Accent | `#F5A623` | Highlights, badges |
| Success | `#1E8A4C` | Approved, completed |
| Warning | `#D97706` | Pending, caution |
| Danger | `#C0392B` | Errors, rejected |

### Fonts

- **UI Font**: Inter (400, 500, 600, 700)
- **Code / IDs**: JetBrains Mono (400, 500)

### Spacing Base

4px base unit — all spacing is a multiple of 4.

### Breakpoints

`xs` 0 / `sm` 576px / `md` 768px / `lg` 992px / `xl` 1280px / `2xl` 1536px

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

---

## Related Documentation

- [Technology Stack](../05-architecture/00-overview/technology-stack-overview.md)
- [Frontend Architecture](../05-architecture/05-backend-architecture/code-organization.md)
- [Module Specifications](../03-module-specifications/)
- [Development Guides](../09-development-guides/)
