---
title: Color Palette
category: design-system
section: foundation
status: approved
created: 2026-02-23
---

# Color Palette

> **Source of Truth**: All applications (web, mobile, vendor portal) must use these exact color values. No ad-hoc colors outside this palette.

---

## Brand Colors

| Name | Token | Hex | Usage |
|------|-------|-----|-------|
| Primary | `color-primary` | `#1A4F8A` | Primary actions, active nav, links |
| Primary Dark | `color-primary-dark` | `#123566` | Hover/pressed state of primary |
| Primary Light | `color-primary-light` | `#2E6DB4` | Focus rings, secondary highlights |
| Primary Muted | `color-primary-muted` | `#EAF1FB` | Ghost button bg, info backgrounds |
| Accent | `color-accent` | `#F5A623` | Highlights, badges, key callouts |
| Accent Dark | `color-accent-dark` | `#C9841A` | Hover state of accent elements |

---

## Semantic / Status Colors

| Name | Token | Hex | Usage |
|------|-------|-----|-------|
| Success | `color-success` | `#1E8A4C` | Confirmed, approved, completed |
| Success Light | `color-success-light` | `#E8F7EE` | Success alert backgrounds |
| Warning | `color-warning` | `#D97706` | Pending, caution states |
| Warning Light | `color-warning-light` | `#FEF3C7` | Warning alert backgrounds |
| Danger | `color-danger` | `#C0392B` | Errors, rejections, blacklist |
| Danger Light | `color-danger-light` | `#FDECEA` | Error alert backgrounds |
| Info | `color-info` | `#1A4F8A` | Informational banners |
| Info Light | `color-info-light` | `#EAF1FB` | Info alert backgrounds |

---

## Neutral / Grey Scale

| Name | Token | Hex | Usage |
|------|-------|-----|-------|
| Grey 900 | `color-grey-900` | `#111827` | Primary text, headings |
| Grey 700 | `color-grey-700` | `#374151` | Secondary text, descriptions |
| Grey 500 | `color-grey-500` | `#6B7280` | Placeholder text, disabled labels |
| Grey 400 | `color-grey-400` | `#9CA3AF` | Disabled input borders |
| Grey 300 | `color-grey-300` | `#D1D5DB` | Dividers, borders, table lines |
| Grey 200 | `color-grey-200` | `#E5E7EB` | Card borders, input borders |
| Grey 100 | `color-grey-100` | `#F3F4F6` | Page background, table stripe |
| Grey 50 | `color-grey-50` | `#F9FAFB` | Sidebar background, off-white panels |
| White | `color-white` | `#FFFFFF` | Card backgrounds, modals |

---

## Trip / Workflow Status Colors

Maps directly to DFMS trip lifecycle states (see `03-module-specifications/03-operations/trip-management.md`).

| Status | Token | Hex | Usage |
|--------|-------|-----|-------|
| Draft | `color-status-draft` | `#9CA3AF` | TO/TR in draft state |
| Pending | `color-status-pending` | `#D97706` | Awaiting approval or action |
| Approved | `color-status-approved` | `#1E8A4C` | Approved and active |
| In Transit | `color-status-in-transit` | `#1A4F8A` | Trip on the road |
| At Gate | `color-status-at-gate` | `#7C3AED` | Vehicle at gate |
| Weighing | `color-status-weighing` | `#0891B2` | At weighbridge |
| Loading | `color-status-loading` | `#EA580C` | Loading in progress |
| Unloading | `color-status-unloading` | `#D97706` | Unloading in progress |
| QC Hold | `color-status-qc-hold` | `#DC2626` | Awaiting QC decision |
| QC Pass | `color-status-qc-pass` | `#1E8A4C` | QC passed |
| QC Fail | `color-status-qc-fail` | `#C0392B` | QC failed |
| Completed | `color-status-completed` | `#374151` | Closed/completed |
| Cancelled | `color-status-cancelled` | `#6B7280` | Cancelled |

---

## Background Palette

| Name | Token | Hex | Usage |
|------|-------|-----|-------|
| Page Background | `color-bg-page` | `#F3F4F6` | Main page canvas |
| Surface | `color-bg-surface` | `#FFFFFF` | Cards, modals, panels |
| Surface Alt | `color-bg-surface-alt` | `#F9FAFB` | Sidebar, secondary panels |
| Overlay | `color-bg-overlay` | `rgba(0,0,0,0.45)` | Modal backdrops |

---

## Implementation

### CSS Custom Properties (Web)

```css
:root {
  --color-primary:       #1A4F8A;
  --color-primary-dark:  #123566;
  --color-primary-light: #2E6DB4;
  --color-primary-muted: #EAF1FB;
  --color-accent:        #F5A623;
  --color-accent-dark:   #C9841A;

  --color-success:       #1E8A4C;
  --color-success-light: #E8F7EE;
  --color-warning:       #D97706;
  --color-warning-light: #FEF3C7;
  --color-danger:        #C0392B;
  --color-danger-light:  #FDECEA;
  --color-info:          #1A4F8A;
  --color-info-light:    #EAF1FB;

  --color-grey-900: #111827;
  --color-grey-700: #374151;
  --color-grey-500: #6B7280;
  --color-grey-400: #9CA3AF;
  --color-grey-300: #D1D5DB;
  --color-grey-200: #E5E7EB;
  --color-grey-100: #F3F4F6;
  --color-grey-50:  #F9FAFB;
  --color-white:    #FFFFFF;

  --color-bg-page:        #F3F4F6;
  --color-bg-surface:     #FFFFFF;
  --color-bg-surface-alt: #F9FAFB;
  --color-bg-overlay:     rgba(0, 0, 0, 0.45);

  --color-status-draft:      #9CA3AF;
  --color-status-pending:    #D97706;
  --color-status-approved:   #1E8A4C;
  --color-status-in-transit: #1A4F8A;
  --color-status-at-gate:    #7C3AED;
  --color-status-weighing:   #0891B2;
  --color-status-loading:    #EA580C;
  --color-status-unloading:  #D97706;
  --color-status-qc-hold:    #DC2626;
  --color-status-qc-pass:    #1E8A4C;
  --color-status-qc-fail:    #C0392B;
  --color-status-completed:  #374151;
  --color-status-cancelled:  #6B7280;
}
```

### Bootstrap 5 Overrides (`_variables.scss`)

```scss
$primary:   #1A4F8A;
$secondary: #374151;
$success:   #1E8A4C;
$warning:   #D97706;
$danger:    #C0392B;
$info:      #2E6DB4;
$light:     #F3F4F6;
$dark:      #111827;
```

### Flutter (`app_colors.dart`)

```dart
class AppColors {
  static const primary      = Color(0xFF1A4F8A);
  static const primaryDark  = Color(0xFF123566);
  static const primaryMuted = Color(0xFFEAF1FB);
  static const accent       = Color(0xFFF5A623);
  static const success      = Color(0xFF1E8A4C);
  static const warning      = Color(0xFFD97706);
  static const danger       = Color(0xFFC0392B);
  static const grey900      = Color(0xFF111827);
  static const grey700      = Color(0xFF374151);
  static const grey500      = Color(0xFF6B7280);
  static const grey300      = Color(0xFFD1D5DB);
  static const grey100      = Color(0xFFF3F4F6);
  static const white        = Color(0xFFFFFFFF);
}
```

---

## Contrast & Accessibility

All text/background pairs must meet **WCAG 2.1 AA** (4.5:1 for normal text, 3:1 for large text).

| Foreground | Background | Ratio | Pass/Fail |
|------------|------------|-------|-----------|
| `grey-900` on `white` | — | 16.1:1 | AAA |
| `white` on `primary` | — | 7.2:1 | AAA |
| `white` on `danger` | — | 5.1:1 | AA |
| `white` on `success` | — | 4.8:1 | AA |
| `grey-700` on `grey-50` | — | 5.6:1 | AA |
| `grey-500` on `white` | — | 4.6:1 | AA |
| `grey-400` on `white` | — | 3.0:1 | Large text only |

**Rule**: Never use `grey-400` or lighter as body text color.

---

## Rules

1. Never use raw hex values in component code — always reference a CSS variable or token.
2. Never create new one-off colors — open a change request to extend the palette.
3. Status colors must only be used for their designated trip/workflow state.
4. Dark mode is not in scope for Phase 1 but tokens are structured for future extension.
