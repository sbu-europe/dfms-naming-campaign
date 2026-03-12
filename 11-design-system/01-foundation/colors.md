---
title: Color Palette
category: design-system
section: foundation
status: approved
created: 2026-02-23
updated: 2026-03-12
---

# Color Palette

> **Source of Truth**: All applications (web, mobile, vendor portal) must use these exact color values. No ad-hoc colors outside this palette.
>
> **Brand palette source**: Brainstation-23 official brand colors (Pantone 2766 C + Pantone 2726 C family).
>
> **Theming**: Both **light** and **dark** themes are supported. Theme-aware CSS custom properties are driven by `[data-theme]` on `<html>`. Components never use raw hex — always reference a CSS variable or token so both themes apply automatically.

---

## Design Philosophy

DFMS UI follows three core principles:

1. **Modern** — Clean geometry, generous whitespace, no decorative elements. Every visual element has a functional purpose.
2. **Minimalistic** — Reduce cognitive load for operators working in high-pressure environments. Only show what matters; surface data clearly.
3. **Professional** — Consistent, predictable, trustworthy. Dark navy authority balanced with indigo energy. Data is always legible at a glance, in any lighting condition or theme.

---

## Brand Colors

The DFMS brand palette is derived from the Brainstation-23 identity system. Two primary Pantone colors and three supporting tints form the entire brand expression.

| Name | Token | Hex | Pantone | RGB | Usage |
|------|-------|-----|---------|-----|-------|
| Primary Dark | `color-primary-dark` | `#122056` | 2766 C | 18 / 32 / 86 | Top nav, dark sidebar, authority surfaces |
| Primary | `color-primary` | `#5B65DC` | 2726 C | 91 / 101 / 220 | Buttons, links, active nav, interactive elements |
| Primary Light | `color-primary-light` | `#EEEFFD` | — | 238 / 239 / 253 | Ghost button bg, chip/badge bg, info backgrounds |
| Surface Alt | `color-bg-surface-alt` | `#FAFAFD` | — | 250 / 250 / 253 | Off-white panels, table row stripe, sidebar bg |
| White | `color-white` | `#FFFFFF` | — | 255 / 255 / 255 | Card backgrounds, modals, primary surfaces |

### Interaction State Derivatives

| Token | Hex | Derivation |
|-------|-----|------------|
| `color-primary-hover` | `#4A53C4` | Primary darkened ~10% |
| `color-primary-pressed` | `#3A42A8` | Primary darkened ~20% |
| `color-primary-dark-hover` | `#1A2E70` | Primary Dark lightened ~10% |
| `color-primary-focus` | `rgba(91,101,220,0.4)` | Primary at 40% opacity — focus rings |

---

## Semantic Colors

Chosen for maximum clarity and WCAG compliance; independent from the brand palette.

| Name | Token | Hex | Usage |
|------|-------|-----|-------|
| Success | `color-success` | `#1E8A4C` | Confirmed, approved, completed |
| Success Light | `color-success-light` | `#E8F7EE` | Success alert/banner backgrounds |
| Warning | `color-warning` | `#D97706` | Pending, caution states |
| Warning Light | `color-warning-light` | `#FEF3C7` | Warning alert backgrounds |
| Danger | `color-danger` | `#C0392B` | Errors, rejections, blacklist |
| Danger Light | `color-danger-light` | `#FDECEA` | Error alert backgrounds |
| Info | `color-info` | `#5B65DC` | Informational banners (aliases Primary) |
| Info Light | `color-info-light` | `#EEEFFD` | Info backgrounds (aliases Primary Light) |

---

## Neutral / Grey Scale

Used for text, borders, and structural UI elements. Does not change with brand updates.

| Token | Hex | Usage |
|-------|-----|-------|
| `color-grey-900` | `#111827` | Primary text, headings |
| `color-grey-700` | `#374151` | Secondary text, descriptions |
| `color-grey-500` | `#6B7280` | Placeholder, disabled labels |
| `color-grey-400` | `#9CA3AF` | Disabled input borders |
| `color-grey-300` | `#D1D5DB` | Dividers, table lines |
| `color-grey-200` | `#E5E7EB` | Card borders, input borders |
| `color-grey-100` | `#F3F4F6` | Page background, table stripe |
| `color-grey-50` | `#F9FAFB` | Fallback surface alt |
| `color-white` | `#FFFFFF` | Card backgrounds, modals |

---

## Trip / Workflow Status Colors

Maps directly to DFMS trip lifecycle states. See `05-architecture/06-diagrams/states/trip-state-diagram.mmd`.

| Status | Token | Light Hex | Dark Hex |
|--------|-------|-----------|----------|
| Pending | `color-status-pending` | `#D97706` | `#F59E0B` |
| Assigned | `color-status-assigned` | `#5B65DC` | `#7580F0` |
| Gate In | `color-status-gate-in` | `#7C3AED` | `#A78BFA` |
| Loading | `color-status-loading` | `#EA580C` | `#FB923C` |
| Scale In | `color-status-scale-in` | `#0891B2` | `#22D3EE` |
| In Transit | `color-status-in-transit` | `#122056` | `#7580F0` |
| Gate Out | `color-status-gate-out` | `#7C3AED` | `#A78BFA` |
| Unloading | `color-status-unloading` | `#D97706` | `#F59E0B` |
| Scale Out | `color-status-scale-out` | `#0891B2` | `#22D3EE` |
| QC Pending | `color-status-qc-pending` | `#DC2626` | `#F87171` |
| Completed | `color-status-completed` | `#1E8A4C` | `#34D475` |
| On Hold | `color-status-on-hold` | `#C0392B` | `#F87171` |
| Cancelled | `color-status-cancelled` | `#6B7280` | `#4B5563` |

---

## Dark Theme Palette

Dark theme uses deep navy backgrounds (not pure black — warmer and on-brand). Brand colors are slightly brightened for legibility on dark surfaces.

### Backgrounds

| Token | Light | Dark | Notes |
|-------|-------|------|-------|
| `color-bg-page` | `#FAFAFD` | `#0D0F1A` | Very dark navy page canvas |
| `color-bg-surface` | `#FFFFFF` | `#161929` | Cards, modals |
| `color-bg-surface-elevated` | `#FFFFFF` | `#1E2235` | Dropdowns, popovers |
| `color-bg-surface-alt` | `#FAFAFD` | `#12162B` | Sidebar, secondary panels |
| `color-bg-primary-dark` | `#122056` | `#122056` | Top nav — identical in both themes |
| `color-bg-overlay` | `rgba(18,32,86,0.5)` | `rgba(0,0,0,0.65)` | Modal backdrops |
| `color-border` | `#E5E7EB` | `#252A40` | Card borders, dividers |
| `color-border-subtle` | `#F3F4F6` | `#1C2033` | Table row separators |

### Text

| Token | Light | Dark |
|-------|-------|------|
| `color-text-primary` | `#111827` | `#F0F1FA` |
| `color-text-secondary` | `#374151` | `#9BA3C4` |
| `color-text-muted` | `#6B7280` | `#5E6A8A` |
| `color-text-disabled` | `#9CA3AF` | `#3D4460` |
| `color-text-on-primary` | `#FFFFFF` | `#FFFFFF` |

### Brand / Interactive

| Token | Light | Dark |
|-------|-------|------|
| `color-primary` | `#5B65DC` | `#7580F0` |
| `color-primary-hover` | `#4A53C4` | `#8A94F5` |
| `color-primary-light` | `#EEEFFD` | `#1C2044` |
| `color-primary-dark` | `#122056` | `#122056` |
| `color-primary-focus` | `rgba(91,101,220,0.4)` | `rgba(117,128,240,0.45)` |

### Semantic (Dark)

Lightened to maintain contrast against dark surfaces.

| Token | Dark Value |
|-------|------------|
| `color-success` | `#34D475` |
| `color-success-light` | `#0D2A1A` |
| `color-warning` | `#F59E0B` |
| `color-warning-light` | `#2A1F05` |
| `color-danger` | `#F87171` |
| `color-danger-light` | `#2A0D0D` |
| `color-info` | `#7580F0` |
| `color-info-light` | `#1C2044` |

---

## Implementation

### CSS Custom Properties — Full Dual-Theme System

Theme switching is driven by `[data-theme]` on `<html>`. Default (no attribute) = light. JavaScript toggles and persists to `localStorage`.

```css
/* ═══════════════════════════════════════════════════════════
   LIGHT THEME (default)
   ═══════════════════════════════════════════════════════════ */
:root,
[data-theme="light"] {
  /* Brand */
  --color-primary-dark:    #122056;
  --color-primary:         #5B65DC;
  --color-primary-light:   #EEEFFD;
  --color-primary-hover:   #4A53C4;
  --color-primary-pressed: #3A42A8;
  --color-primary-focus:   rgba(91, 101, 220, 0.4);

  /* Semantic */
  --color-success:         #1E8A4C;
  --color-success-light:   #E8F7EE;
  --color-warning:         #D97706;
  --color-warning-light:   #FEF3C7;
  --color-danger:          #C0392B;
  --color-danger-light:    #FDECEA;
  --color-info:            #5B65DC;
  --color-info-light:      #EEEFFD;

  /* Text */
  --color-text-primary:        #111827;
  --color-text-secondary:      #374151;
  --color-text-muted:          #6B7280;
  --color-text-disabled:       #9CA3AF;
  --color-text-on-primary:     #FFFFFF;

  /* Backgrounds */
  --color-bg-page:             #FAFAFD;
  --color-bg-surface:          #FFFFFF;
  --color-bg-surface-elevated: #FFFFFF;
  --color-bg-surface-alt:      #FAFAFD;
  --color-bg-primary-dark:     #122056;
  --color-bg-overlay:          rgba(18, 32, 86, 0.5);

  /* Borders */
  --color-border:              #E5E7EB;
  --color-border-subtle:       #F3F4F6;

  /* Neutral */
  --color-grey-900:  #111827;
  --color-grey-700:  #374151;
  --color-grey-500:  #6B7280;
  --color-grey-400:  #9CA3AF;
  --color-grey-300:  #D1D5DB;
  --color-grey-200:  #E5E7EB;
  --color-grey-100:  #F3F4F6;
  --color-grey-50:   #F9FAFB;
  --color-white:     #FFFFFF;

  /* Trip / Workflow Status */
  --color-status-pending:    #D97706;
  --color-status-assigned:   #5B65DC;
  --color-status-gate-in:    #7C3AED;
  --color-status-loading:    #EA580C;
  --color-status-scale-in:   #0891B2;
  --color-status-in-transit: #122056;
  --color-status-gate-out:   #7C3AED;
  --color-status-unloading:  #D97706;
  --color-status-scale-out:  #0891B2;
  --color-status-qc-pending: #DC2626;
  --color-status-completed:  #1E8A4C;
  --color-status-on-hold:    #C0392B;
  --color-status-cancelled:  #6B7280;
}

/* ═══════════════════════════════════════════════════════════
   DARK THEME
   ═══════════════════════════════════════════════════════════ */
[data-theme="dark"] {
  /* Brand — slightly brighter on dark surfaces */
  --color-primary-dark:    #122056;
  --color-primary:         #7580F0;
  --color-primary-light:   #1C2044;
  --color-primary-hover:   #8A94F5;
  --color-primary-pressed: #9AA2F7;
  --color-primary-focus:   rgba(117, 128, 240, 0.45);

  /* Semantic */
  --color-success:         #34D475;
  --color-success-light:   #0D2A1A;
  --color-warning:         #F59E0B;
  --color-warning-light:   #2A1F05;
  --color-danger:          #F87171;
  --color-danger-light:    #2A0D0D;
  --color-info:            #7580F0;
  --color-info-light:      #1C2044;

  /* Text */
  --color-text-primary:        #F0F1FA;
  --color-text-secondary:      #9BA3C4;
  --color-text-muted:          #5E6A8A;
  --color-text-disabled:       #3D4460;
  --color-text-on-primary:     #FFFFFF;

  /* Backgrounds */
  --color-bg-page:             #0D0F1A;
  --color-bg-surface:          #161929;
  --color-bg-surface-elevated: #1E2235;
  --color-bg-surface-alt:      #12162B;
  --color-bg-primary-dark:     #122056;   /* top nav — unchanged */
  --color-bg-overlay:          rgba(0, 0, 0, 0.65);

  /* Borders */
  --color-border:              #252A40;
  --color-border-subtle:       #1C2033;

  /* Neutral (adapted for dark) */
  --color-grey-900:  #F0F1FA;
  --color-grey-700:  #9BA3C4;
  --color-grey-500:  #5E6A8A;
  --color-grey-400:  #3D4460;
  --color-grey-300:  #252A40;
  --color-grey-200:  #1C2033;
  --color-grey-100:  #161929;
  --color-grey-50:   #12162B;
  --color-white:     #FFFFFF;

  /* Trip / Workflow Status — lightened for dark surfaces */
  --color-status-pending:    #F59E0B;
  --color-status-assigned:   #7580F0;
  --color-status-gate-in:    #A78BFA;
  --color-status-loading:    #FB923C;
  --color-status-scale-in:   #22D3EE;
  --color-status-in-transit: #7580F0;
  --color-status-gate-out:   #A78BFA;
  --color-status-unloading:  #F59E0B;
  --color-status-scale-out:  #22D3EE;
  --color-status-qc-pending: #F87171;
  --color-status-completed:  #34D475;
  --color-status-on-hold:    #F87171;
  --color-status-cancelled:  #4B5563;
}
```

### Theme Toggle (JavaScript)

```javascript
// theme.js — include in base template before </body>
const THEME_KEY = 'dfms-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  // Update toggle button aria-label
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// On page load: respect stored preference, then OS preference
(function () {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    applyTheme(stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }
})();
```

### Bootstrap 5 SCSS Overrides (`_variables.scss`)

```scss
// Light theme (default Bootstrap build)
$primary:    #5B65DC;   // Pantone 2726 C
$secondary:  #122056;   // Pantone 2766 C
$success:    #1E8A4C;
$warning:    #D97706;
$danger:     #C0392B;
$info:       #5B65DC;
$light:      #FAFAFD;
$dark:       #122056;

$body-bg:                  #FAFAFD;
$body-color:               #111827;
$link-color:               #5B65DC;
$link-hover-color:         #4A53C4;
$focus-ring-color:         rgba(91, 101, 220, 0.4);
$border-color:             #E5E7EB;
$card-bg:                  #FFFFFF;
$card-border-color:        #E5E7EB;
$input-bg:                 #FFFFFF;
$input-border-color:       #D1D5DB;
$input-focus-border-color: #5B65DC;
$dropdown-bg:              #FFFFFF;
$dropdown-border-color:    #E5E7EB;
```

### Flutter — ThemeData (Light + Dark)

```dart
// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.light(
      primary:             Color(0xFF5B65DC),
      onPrimary:           Color(0xFFFFFFFF),
      primaryContainer:    Color(0xFFEEEFFD),
      secondary:           Color(0xFF122056),
      onSecondary:         Color(0xFFFFFFFF),
      surface:             Color(0xFFFFFFFF),
      onSurface:           Color(0xFF111827),
      surfaceContainerLow: Color(0xFFFAFAFD),
      error:               Color(0xFFC0392B),
      onError:             Color(0xFFFFFFFF),
    ),
    scaffoldBackgroundColor: const Color(0xFFFAFAFD),
    fontFamily: 'Inter',
    dividerColor: const Color(0xFFE5E7EB),
  );

  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(
      primary:             Color(0xFF7580F0),
      onPrimary:           Color(0xFFFFFFFF),
      primaryContainer:    Color(0xFF1C2044),
      secondary:           Color(0xFF122056),
      onSecondary:         Color(0xFFFFFFFF),
      surface:             Color(0xFF161929),
      onSurface:           Color(0xFFF0F1FA),
      surfaceContainerLow: Color(0xFF0D0F1A),
      error:               Color(0xFFF87171),
      onError:             Color(0xFF2A0D0D),
    ),
    scaffoldBackgroundColor: const Color(0xFF0D0F1A),
    fontFamily: 'Inter',
    dividerColor: const Color(0xFF252A40),
  );
}
```

### Flutter — `app_colors.dart`

```dart
import 'package:flutter/material.dart';

class AppColors {
  // Brand
  static const primaryDark    = Color(0xFF122056);  // Pantone 2766 C — both themes
  static const primary        = Color(0xFF5B65DC);  // Pantone 2726 C — light
  static const primaryDk      = Color(0xFF7580F0);  // Lightened variant — dark theme
  static const primaryLight   = Color(0xFFEEEFFD);  // Light theme tint
  static const primaryLightDk = Color(0xFF1C2044);  // Dark theme tint

  // Light backgrounds
  static const bgPage         = Color(0xFFFAFAFD);
  static const bgSurface      = Color(0xFFFFFFFF);

  // Dark backgrounds
  static const bgPageDark     = Color(0xFF0D0F1A);
  static const bgSurfaceDark  = Color(0xFF161929);
  static const bgSurfaceAltDk = Color(0xFF12162B);

  // Semantic — light
  static const success        = Color(0xFF1E8A4C);
  static const warning        = Color(0xFFD97706);
  static const danger         = Color(0xFFC0392B);

  // Semantic — dark
  static const successDk      = Color(0xFF34D475);
  static const warningDk      = Color(0xFFF59E0B);
  static const dangerDk       = Color(0xFFF87171);

  // Neutral
  static const grey900        = Color(0xFF111827);
  static const grey700        = Color(0xFF374151);
  static const grey500        = Color(0xFF6B7280);
  static const grey300        = Color(0xFFD1D5DB);
  static const grey100        = Color(0xFFF3F4F6);
  static const white          = Color(0xFFFFFFFF);
}
```

---

## Contrast & Accessibility

All text/background pairs must meet **WCAG 2.1 AA** (4.5:1 body text, 3:1 large text / UI components).

### Light Theme

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `white` on `primary-dark` (#122056) | — | 14.8:1 | AAA |
| `white` on `primary` (#5B65DC) | — | 4.7:1 | AA |
| `primary-dark` on `white` | — | 14.8:1 | AAA |
| `primary-dark` on `primary-light` (#EEEFFD) | — | 13.2:1 | AAA |
| `grey-900` on `bg-page` (#FAFAFD) | — | 15.9:1 | AAA |
| `grey-700` on `bg-page` | — | 5.5:1 | AA |
| `grey-500` on `white` | — | 4.6:1 | AA |
| `white` on `danger` | — | 5.1:1 | AA |
| `white` on `success` | — | 4.8:1 | AA |

### Dark Theme

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `text-primary` (#F0F1FA) on `bg-page` (#0D0F1A) | — | 16.2:1 | AAA |
| `text-primary` (#F0F1FA) on `bg-surface` (#161929) | — | 13.8:1 | AAA |
| `primary` (#7580F0) on `bg-surface` (#161929) | — | 5.1:1 | AA |
| `primary` (#7580F0) on `bg-page` (#0D0F1A) | — | 6.3:1 | AA |
| `success` (#34D475) on `bg-surface` | — | 7.2:1 | AAA |
| `danger` (#F87171) on `bg-surface` | — | 5.8:1 | AA |
| `text-secondary` (#9BA3C4) on `bg-surface` | — | 5.0:1 | AA |

> `primary` (#5B65DC) on `primary-light` (#EEEFFD) passes at large text (3:1) but not body text — use `primary-dark` for body text on light backgrounds instead.

---

## Rules

1. Never use raw hex values in component code — always reference a CSS variable or token.
2. Never create one-off colors — open a change request to extend the palette.
3. Status colors are exclusively for their designated trip/workflow states.
4. The top nav bar always uses `--color-bg-primary-dark` (`#122056`) — identical in both themes.
5. Interactive elements use `--color-primary` — resolves to `#5B65DC` in light, `#7580F0` in dark automatically.
6. Use semantic text tokens (`--color-text-primary`, `--color-text-secondary`, `--color-text-muted`) in all components — never hardcode `#111827`; dark theme overrides apply automatically.
7. The theme toggle must respect `prefers-color-scheme` on first visit when no stored preference exists.
8. All new components must be tested in **both themes** before approval.
