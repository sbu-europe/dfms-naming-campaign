---
title: Typography
category: design-system
section: foundation
status: approved
created: 2026-02-23
---

# Typography

> **Source of Truth**: All applications must use this type system. Font loading, scale, and weights are defined here.

---

## Typefaces

| Role | Font Family | Fallback | Usage |
|------|-------------|----------|-------|
| **Primary (UI)** | Inter | -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif | All UI text: headings, body, labels, buttons |
| **Monospace** | JetBrains Mono | "Courier New", monospace | Code snippets, IDs, serial numbers, technical data |

### Why Inter?
- Optimized for screen readability at small sizes
- Excellent tabular numerals for data-dense dashboards
- Wide language support (Bengali included — relevant for DFMS operations)
- Available via Google Fonts (free, no licensing cost)

### Loading (Web)
```html
<!-- In <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Loading (Flutter)
```yaml
# pubspec.yaml
fonts:
  - family: Inter
    fonts:
      - asset: assets/fonts/Inter-Regular.ttf
        weight: 400
      - asset: assets/fonts/Inter-Medium.ttf
        weight: 500
      - asset: assets/fonts/Inter-SemiBold.ttf
        weight: 600
      - asset: assets/fonts/Inter-Bold.ttf
        weight: 700
```

---

## Type Scale

Base size: **16px** (1rem). Scale ratio: **1.25 (Major Third)**.

| Token | Size | Rem | Weight | Line Height | Usage |
|-------|------|-----|--------|-------------|-------|
| `text-xs` | 12px | 0.75rem | 400/500 | 1.5 | Captions, timestamps, helper text |
| `text-sm` | 14px | 0.875rem | 400/500 | 1.5 | Secondary body, table cells, form labels |
| `text-base` | 16px | 1rem | 400 | 1.6 | Primary body text, form inputs |
| `text-md` | 18px | 1.125rem | 500 | 1.5 | Lead text, card summaries |
| `text-lg` | 20px | 1.25rem | 600 | 1.4 | Section headings (H4) |
| `text-xl` | 24px | 1.5rem | 600 | 1.3 | Page subsection headings (H3) |
| `text-2xl` | 30px | 1.875rem | 700 | 1.25 | Page headings (H2) |
| `text-3xl` | 36px | 2.25rem | 700 | 1.2 | Dashboard KPI numbers, H1 |
| `text-4xl` | 48px | 3rem | 700 | 1.1 | Hero/marketing only |

---

## Heading Styles

```
H1  — text-3xl (36px), Bold 700, Grey-900, line-height 1.2
H2  — text-2xl (30px), Bold 700, Grey-900, line-height 1.25
H3  — text-xl (24px), SemiBold 600, Grey-900, line-height 1.3
H4  — text-lg (20px), SemiBold 600, Grey-700, line-height 1.4
H5  — text-md (18px), Medium 500, Grey-700, line-height 1.5
H6  — text-base (16px), Medium 500, Grey-500, uppercase, letter-spacing 0.05em
```

---

## Body & UI Text Styles

| Style Name | Size | Weight | Color | Usage |
|------------|------|--------|-------|-------|
| `body-lg` | 18px | 400 | grey-700 | Long-form content, descriptions |
| `body` | 16px | 400 | grey-700 | Default body text |
| `body-sm` | 14px | 400 | grey-700 | Secondary content, table data |
| `label` | 14px | 500 | grey-900 | Form field labels |
| `label-sm` | 12px | 500 | grey-700 | Compact labels, filters |
| `caption` | 12px | 400 | grey-500 | Timestamps, metadata, helper text |
| `overline` | 11px | 600 | grey-500 | Section dividers, category tags (UPPERCASE) |
| `code` | 14px | 400 | grey-900 | JetBrains Mono — IDs, serials, technical values |
| `numeric` | Varies | 600 | grey-900 | Tabular numerals — quantities, weights, counts |

---

## Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `font-normal` | 400 | Body text, descriptions |
| `font-medium` | 500 | Labels, navigation items, secondary headings |
| `font-semibold` | 600 | Buttons, card titles, section headings |
| `font-bold` | 700 | Page headings, KPI values, critical data |

---

## Implementation

### CSS Custom Properties
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-md:   1.125rem;  /* 18px */
  --text-lg:   1.25rem;   /* 20px */
  --text-xl:   1.5rem;    /* 24px */
  --text-2xl:  1.875rem;  /* 30px */
  --text-3xl:  2.25rem;   /* 36px */
  --text-4xl:  3rem;      /* 48px */

  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  --leading-tight:  1.2;
  --leading-snug:   1.35;
  --leading-normal: 1.5;
  --leading-relaxed:1.6;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--color-grey-700);
}
```

### Bootstrap 5 SCSS Overrides
```scss
$font-family-sans-serif: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-family-monospace:  'JetBrains Mono', 'Courier New', monospace;
$font-size-base:          1rem;       // 16px
$font-size-sm:            0.875rem;   // 14px
$font-size-lg:            1.125rem;   // 18px
$font-weight-normal:      400;
$font-weight-bold:        700;
$headings-font-weight:    700;
$headings-color:          #111827;    // grey-900
$line-height-base:        1.6;
$h1-font-size:            2.25rem;
$h2-font-size:            1.875rem;
$h3-font-size:            1.5rem;
$h4-font-size:            1.25rem;
$h5-font-size:            1.125rem;
$h6-font-size:            1rem;
```

### Flutter (`text_styles.dart`)
```dart
class AppTextStyles {
  static const _fontFamily = 'Inter';

  static const h1 = TextStyle(
    fontFamily: _fontFamily, fontSize: 36, fontWeight: FontWeight.w700,
    height: 1.2, color: AppColors.grey900,
  );
  static const h2 = TextStyle(
    fontFamily: _fontFamily, fontSize: 30, fontWeight: FontWeight.w700,
    height: 1.25, color: AppColors.grey900,
  );
  static const h3 = TextStyle(
    fontFamily: _fontFamily, fontSize: 24, fontWeight: FontWeight.w600,
    height: 1.3, color: AppColors.grey900,
  );
  static const body = TextStyle(
    fontFamily: _fontFamily, fontSize: 16, fontWeight: FontWeight.w400,
    height: 1.6, color: AppColors.grey700,
  );
  static const bodySm = TextStyle(
    fontFamily: _fontFamily, fontSize: 14, fontWeight: FontWeight.w400,
    height: 1.5, color: AppColors.grey700,
  );
  static const label = TextStyle(
    fontFamily: _fontFamily, fontSize: 14, fontWeight: FontWeight.w500,
    height: 1.5, color: AppColors.grey900,
  );
  static const caption = TextStyle(
    fontFamily: _fontFamily, fontSize: 12, fontWeight: FontWeight.w400,
    height: 1.5, color: AppColors.grey500,
  );
  static const code = TextStyle(
    fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: FontWeight.w400,
    height: 1.5, color: AppColors.grey900,
  );
  static const numeric = TextStyle(
    fontFamily: _fontFamily, fontSize: 24, fontWeight: FontWeight.w600,
    fontFeatures: [FontFeature.tabularFigures()], color: AppColors.grey900,
  );
}
```

---

## Rules

1. **Stick to the type scale** — don't use arbitrary pixel sizes outside the scale.
2. **Minimum readable size is 12px** (`text-xs`) — never go smaller.
3. **Do not use font-weight 300 (Light)** — too thin for data-dense operational UIs.
4. **Numeric data** (quantities, weights, trip counts) must use tabular numerals (`font-variant-numeric: tabular-nums`) to prevent column jitter.
5. **Use monospace (`code` style)** for: vehicle numbers, TO/TR IDs, challan numbers, serial numbers.
6. **Line length** for body text blocks: 60-75 characters (45-50rem) — avoid full-width text columns.
