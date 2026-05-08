---
title: Design Tokens Reference
category: design-system
section: foundation
status: approved
created: 2026-02-23
updated: 2026-03-12
---

# Design Tokens Reference

> Single reference for all named design tokens. Tokens are the bridge between this design system and implementation. All colors, spacing, typography, and effects are referenced by token name — never by raw values.

---

## What Is a Design Token?

A design token is a named constant representing a design decision:

```
Token:  color-primary
Light:  #5B65DC
Dark:   #7580F0
```

Every application layer (CSS, Flutter, Django template) uses the *same name*. The value resolves per-theme at runtime via CSS custom properties or Flutter's `ThemeData`.

---

## Theming Strategy

DFMS supports **light** and **dark** themes out of the box. Tokens are theme-aware:

| Layer | Mechanism |
|-------|-----------|
| Web (CSS) | `[data-theme="dark"]` attribute on `<html>` overrides `:root` custom properties |
| Bootstrap 5 | SCSS variables set light defaults; dark overrides via CSS custom properties |
| Flutter | `AppTheme.light` / `AppTheme.dark` — passed to `MaterialApp.theme` / `darkTheme` |

See `01-foundation/colors.md` for the complete dual-theme CSS implementation and Flutter `AppTheme`.

---

## Color Tokens

Full palette, hex values, and WCAG ratios are in `01-foundation/colors.md`.

### Brand

| Token | Light Value | Dark Value | Notes |
|-------|-------------|------------|-------|
| `color-primary-dark` | `#122056` | `#122056` | Pantone 2766 C — top nav, dark surfaces (same both themes) |
| `color-primary` | `#5B65DC` | `#7580F0` | Pantone 2726 C — buttons, links, active states |
| `color-primary-light` | `#EEEFFD` | `#1C2044` | Chips, info bg, ghost button bg |
| `color-primary-hover` | `#4A53C4` | `#8A94F5` | Hover state |
| `color-primary-pressed` | `#3A42A8` | `#9AA2F7` | Pressed / active state |
| `color-primary-focus` | `rgba(91,101,220,0.4)` | `rgba(117,128,240,0.45)` | Focus ring |

### Semantic

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `color-success` | `#1E8A4C` | `#34D475` |
| `color-success-light` | `#E8F7EE` | `#0D2A1A` |
| `color-warning` | `#D97706` | `#F59E0B` |
| `color-warning-light` | `#FEF3C7` | `#2A1F05` |
| `color-danger` | `#C0392B` | `#F87171` |
| `color-danger-light` | `#FDECEA` | `#2A0D0D` |
| `color-info` | `#5B65DC` | `#7580F0` |
| `color-info-light` | `#EEEFFD` | `#1C2044` |

### Text

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `color-text-primary` | `#111827` | `#F0F1FA` |
| `color-text-secondary` | `#374151` | `#9BA3C4` |
| `color-text-muted` | `#6B7280` | `#5E6A8A` |
| `color-text-disabled` | `#9CA3AF` | `#3D4460` |
| `color-text-on-primary` | `#FFFFFF` | `#FFFFFF` |

### Backgrounds

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `color-bg-page` | `#FAFAFD` | `#0D0F1A` |
| `color-bg-surface` | `#FFFFFF` | `#161929` |
| `color-bg-surface-elevated` | `#FFFFFF` | `#1E2235` |
| `color-bg-surface-alt` | `#FAFAFD` | `#12162B` |
| `color-bg-primary-dark` | `#122056` | `#122056` |
| `color-bg-overlay` | `rgba(18,32,86,0.5)` | `rgba(0,0,0,0.65)` |

### Borders

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `color-border` | `#E5E7EB` | `#252A40` |
| `color-border-subtle` | `#F3F4F6` | `#1C2033` |

### Neutral Scale

| Token | Value | Dark Equivalent |
|-------|-------|-----------------|
| `color-grey-900` | `#111827` | `#F0F1FA` |
| `color-grey-700` | `#374151` | `#9BA3C4` |
| `color-grey-500` | `#6B7280` | `#5E6A8A` |
| `color-grey-400` | `#9CA3AF` | `#3D4460` |
| `color-grey-300` | `#D1D5DB` | `#252A40` |
| `color-grey-200` | `#E5E7EB` | `#1C2033` |
| `color-grey-100` | `#F3F4F6` | `#161929` |
| `color-grey-50` | `#F9FAFB` | `#12162B` |
| `color-white` | `#FFFFFF` | `#FFFFFF` |

---

## Typography Tokens

See `01-foundation/typography.md` for full system and implementation.

| Token | Value |
|-------|-------|
| `font-sans` | `'Inter', -apple-system, sans-serif` |
| `font-mono` | `'JetBrains Mono', monospace` |
| `text-xs` | `0.75rem` (12px) |
| `text-sm` | `0.875rem` (14px) |
| `text-base` | `1rem` (16px) |
| `text-md` | `1.125rem` (18px) |
| `text-lg` | `1.25rem` (20px) |
| `text-xl` | `1.5rem` (24px) |
| `text-2xl` | `1.875rem` (30px) |
| `text-3xl` | `2.25rem` (36px) |
| `font-normal` | `400` |
| `font-medium` | `500` |
| `font-semibold` | `600` |
| `font-bold` | `700` |
| `leading-tight` | `1.2` |
| `leading-normal` | `1.5` |
| `leading-relaxed` | `1.6` |

---

## Spacing Tokens

4px base unit — all spacing is a multiple of 4. See `01-foundation/spacing.md`.

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |

---

## Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `4px` | Badges, inputs, small buttons |
| `radius-md` | `8px` | Cards, modals, standard buttons |
| `radius-lg` | `12px` | Panels, large cards |
| `radius-xl` | `16px` | Feature cards, hero sections |
| `radius-full` | `9999px` | Pills, avatar circles, tags |

---

## Shadow Tokens

Shadows are intentionally subtle for the minimalistic aesthetic. Dark theme uses the same values — they render naturally on dark surfaces.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)` | Inputs on focus, subtle cards |
| `shadow-md` | `0 2px 8px rgba(0,0,0,0.10)` | Default card elevation |
| `shadow-lg` | `0 4px 16px rgba(0,0,0,0.12)` | Dropdowns, popover panels |
| `shadow-xl` | `0 8px 32px rgba(0,0,0,0.16)` | Modals, command palette |

---

## Z-Index Tokens

| Token | Value |
|-------|-------|
| `z-base` | `0` |
| `z-dropdown` | `100` |
| `z-sticky` | `200` |
| `z-fixed` | `300` |
| `z-overlay` | `400` |
| `z-modal` | `500` |
| `z-toast` | `600` |
| `z-tooltip` | `700` |

---

## Animation / Transition Tokens

Keep motion subtle — this is an operational tool, not a marketing site.

| Token | Value | Usage |
|-------|-------|-------|
| `transition-fast` | `100ms ease` | Hover color changes |
| `transition-base` | `150ms ease` | Button press, state changes |
| `transition-slow` | `250ms ease` | Sidebar collapse, tab switch |
| `transition-enter` | `200ms ease-out` | Elements entering the DOM |
| `transition-leave` | `150ms ease-in` | Elements leaving the DOM |
| `transition-theme` | `200ms ease` | Theme toggle cross-fade |

```css
:root {
  --transition-fast:   100ms ease;
  --transition-base:   150ms ease;
  --transition-slow:   250ms ease;
  --transition-enter:  200ms ease-out;
  --transition-leave:  150ms ease-in;
  --transition-theme:  200ms ease;
}
```

> Add `transition: background-color var(--transition-theme), color var(--transition-theme), border-color var(--transition-theme)` to `body` for a smooth light/dark theme cross-fade.

---

## Token Implementation Files

| Platform | File | Location |
|----------|------|----------|
| CSS (web) | `_tokens.css` | `static/css/` |
| SCSS (Bootstrap override) | `_variables.scss` | `static/scss/` |
| Flutter colors | `app_colors.dart` | `lib/core/theme/` |
| Flutter theme | `app_theme.dart` | `lib/core/theme/` |
| Flutter text | `app_text_styles.dart` | `lib/core/theme/` |
| Flutter spacing | `app_spacing.dart` | `lib/core/theme/` |

---

## Naming Convention

Tokens follow a **category-property-variant** pattern:

```
color   - primary  - dark
text    - xl
space   - 6
radius  - md
shadow  - lg
z       - modal
font    - semibold
```

| Layer | Format | Example |
|-------|--------|---------|
| CSS custom property | `--category-property-variant` | `--color-primary-dark` |
| Dart constant | `ClassName.camelCase` | `AppColors.primaryDark` |
| SCSS variable | `$category-property-variant` | `$color-primary` |
