---
title: Spacing, Grid & Layout
category: design-system
section: foundation
status: approved
created: 2026-02-23
---

# Spacing, Grid & Layout

> **Source of Truth**: All spacing values, layout grids, and page structure rules are defined here.

---

## Spacing Scale

Base unit: **4px**. All spacing is a multiple of 4.

| Token | Value | Pixels | Common Use |
|-------|-------|--------|------------|
| `space-0` | 0 | 0px | Reset |
| `space-1` | 0.25rem | 4px | Micro gaps, icon padding |
| `space-2` | 0.5rem | 8px | Tight inline spacing, badge padding |
| `space-3` | 0.75rem | 12px | Small component padding |
| `space-4` | 1rem | 16px | Default component padding, form gaps |
| `space-5` | 1.25rem | 20px | Card padding (compact) |
| `space-6` | 1.5rem | 24px | Card padding (standard) |
| `space-8` | 2rem | 32px | Section gaps, form section dividers |
| `space-10` | 2.5rem | 40px | Page section spacing |
| `space-12` | 3rem | 48px | Large section separators |
| `space-16` | 4rem | 64px | Page-level vertical rhythm |
| `space-20` | 5rem | 80px | Hero sections, major separators |

---

## CSS Custom Properties

```css
:root {
  --space-1:  0.25rem;  /* 4px  */
  --space-2:  0.5rem;   /* 8px  */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Input fields, small badges |
| `radius-md` | 8px | Cards, buttons, dropdowns |
| `radius-lg` | 12px | Modals, large panels |
| `radius-xl` | 16px | Sheets, feature cards |
| `radius-full` | 9999px | Pills, avatar circles, toggle switches |

```css
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;
}
```

---

## Shadows / Elevation

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)` | Subtle card border alternative |
| `shadow-md` | `0 2px 8px rgba(0,0,0,0.10)` | Cards, dropdowns |
| `shadow-lg` | `0 4px 16px rgba(0,0,0,0.12)` | Modals, sidesheets |
| `shadow-xl` | `0 8px 32px rgba(0,0,0,0.16)` | Overlay panels |

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.16);
}
```

---

## Page Layout Grid

### Web (Desktop — 1280px+ canvas)

```
+--[Sidebar 240px]--+--[Main Content Area]-----------------------------+
|                   |  [Topbar 56px]                                   |
|  Navigation       +--------------------------------------------------+
|  (fixed)          |  [Page Header: breadcrumb + title + actions]     |
|                   |  padding: 24px 32px                              |
|                   +--------------------------------------------------+
|                   |  [Content Area]                                  |
|                   |  padding: 0 32px 32px                            |
|                   |  max-width: 1200px                               |
+-------------------+--------------------------------------------------+
```

| Element | Width / Height | Notes |
|---------|---------------|-------|
| Sidebar | 240px (fixed) | Collapsed to 64px (icon-only) on toggle |
| Topbar | 100% width, 56px height | Fixed, z-index above content |
| Content padding (sides) | 32px | Desktop, scales down on smaller viewports |
| Content padding (top) | 24px | Below page header |
| Max content width | 1200px | Centered; wider for full-screen tables |

### Breakpoints

| Name | Min Width | Target Device |
|------|-----------|---------------|
| `xs` | 0px | Mobile portrait |
| `sm` | 576px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 992px | Small desktop |
| `xl` | 1280px | Standard desktop (primary target) |
| `2xl` | 1536px | Large desktop / dual monitor |

### Column Grid

- **12-column grid** on desktop
- **4-column grid** on tablet/mobile
- Gutter: `--space-6` (24px) on desktop, `--space-4` (16px) on mobile

---

## Component Spacing Rules

### Cards
```
Padding (default):  24px all sides  (--space-6)
Padding (compact):  16px all sides  (--space-4)
Padding (spacious): 32px all sides  (--space-8)
Gap between cards:  24px            (--space-6)
```

### Forms
```
Field vertical gap:     16px  (--space-4)
Section gap:            32px  (--space-8)
Label to input gap:      6px  (--space-1 + 2px)
Input height (default): 40px
Input height (sm):      32px
Input height (lg):      48px
```

### Tables
```
Cell padding (default): 12px 16px  (vertical/horizontal)
Cell padding (compact):  8px 12px
Row height (default):   48px
Row height (compact):   36px
Header height:          44px
```

### Modals
```
Padding:         32px  (--space-8)
Header height:   60px
Footer height:   72px
Max width (sm):  480px
Max width (md):  640px
Max width (lg):  800px
Max width (xl):  1024px
```

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Default flow |
| `z-dropdown` | 100 | Dropdowns, select menus |
| `z-sticky` | 200 | Sticky table headers, sticky sidebar |
| `z-fixed` | 300 | Fixed topbar, fixed sidebar |
| `z-overlay` | 400 | Modal backdrop |
| `z-modal` | 500 | Modal panels |
| `z-toast` | 600 | Toast notifications |
| `z-tooltip` | 700 | Tooltips |

```css
:root {
  --z-base:     0;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-fixed:    300;
  --z-overlay:  400;
  --z-modal:    500;
  --z-toast:    600;
  --z-tooltip:  700;
}
```

---

## Rules

1. All spacing values must come from the scale — no arbitrary pixel values.
2. Minimum touch target size on mobile: **44x44px** (WCAG 2.5.5).
3. Never reduce content padding below `--space-4` (16px) on mobile.
4. Data-dense tables may use compact spacing; all other views use default.
