---
title: Design Tokens Reference
category: design-system
section: foundation
status: approved
created: 2026-02-23
---

# Design Tokens Reference

> Single reference for all named design tokens. Tokens are the bridge between this design system and implementation. All colors, spacing, typography, and effects are referenced by token name, not raw values.

---

## What Is a Design Token?

A design token is a named constant representing a design decision:

```
Token name:   color-primary
Token value:  #1A4F8A
```

This means every application layer (CSS, Flutter, Django template) uses the *same name* to refer to the same value. Changing the value in one place updates all applications.

---

## Color Tokens

See `01-foundation/colors.md` for full palette.

| Token | Value | Category |
|-------|-------|----------|
| `color-primary` | `#1A4F8A` | Brand |
| `color-primary-dark` | `#123566` | Brand |
| `color-primary-light` | `#2E6DB4` | Brand |
| `color-primary-muted` | `#EAF1FB` | Brand |
| `color-accent` | `#F5A623` | Brand |
| `color-success` | `#1E8A4C` | Semantic |
| `color-success-light` | `#E8F7EE` | Semantic |
| `color-warning` | `#D97706` | Semantic |
| `color-warning-light` | `#FEF3C7` | Semantic |
| `color-danger` | `#C0392B` | Semantic |
| `color-danger-light` | `#FDECEA` | Semantic |
| `color-grey-900` | `#111827` | Neutral |
| `color-grey-700` | `#374151` | Neutral |
| `color-grey-500` | `#6B7280` | Neutral |
| `color-grey-300` | `#D1D5DB` | Neutral |
| `color-grey-100` | `#F3F4F6` | Neutral |
| `color-grey-50` | `#F9FAFB` | Neutral |
| `color-white` | `#FFFFFF` | Neutral |
| `color-bg-page` | `#F3F4F6` | Background |
| `color-bg-surface` | `#FFFFFF` | Background |
| `color-bg-surface-alt` | `#F9FAFB` | Background |

---

## Typography Tokens

See `01-foundation/typography.md` for full system.

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

See `01-foundation/spacing.md` for layout rules.

| Token | Value (px) |
|-------|-----------|
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

| Token | Value |
|-------|-------|
| `radius-sm` | `4px` |
| `radius-md` | `8px` |
| `radius-lg` | `12px` |
| `radius-xl` | `16px` |
| `radius-full` | `9999px` |

---

## Shadow Tokens

| Token | Value |
|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)` |
| `shadow-md` | `0 2px 8px rgba(0,0,0,0.10)` |
| `shadow-lg` | `0 4px 16px rgba(0,0,0,0.12)` |
| `shadow-xl` | `0 8px 32px rgba(0,0,0,0.16)` |

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

| Token | Value | Usage |
|-------|-------|-------|
| `transition-fast` | `100ms ease` | Hover color changes |
| `transition-base` | `150ms ease` | Button press, modal close |
| `transition-slow` | `250ms ease` | Sidebar collapse, tab switch |
| `transition-enter` | `200ms ease-out` | Elements entering the DOM |
| `transition-leave` | `150ms ease-in` | Elements leaving the DOM |

```css
:root {
  --transition-fast:  100ms ease;
  --transition-base:  150ms ease;
  --transition-slow:  250ms ease;
  --transition-enter: 200ms ease-out;
  --transition-leave: 150ms ease-in;
}
```

---

## Token Implementation Files

| Platform | File | Location |
|----------|------|----------|
| CSS (web) | `_tokens.css` or `_variables.scss` | `static/css/` |
| Flutter | `app_colors.dart`, `app_text_styles.dart`, `app_spacing.dart` | `lib/core/theme/` |
| Bootstrap override | `_variables.scss` | `static/scss/` |

---

## Naming Convention

Tokens follow a **category-property-variant** naming pattern:

```
color   - primary - dark
text    - xl
space   - 6
radius  - md
shadow  - lg
z       - modal
font    - semibold
```

In CSS: kebab-case prefixed with `--` → `--color-primary-dark`  
In Dart: camelCase constant → `AppColors.primaryDark`  
In SCSS variable: `$primary-dark` or `$color-primary-dark`
