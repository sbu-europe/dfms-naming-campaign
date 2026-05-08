---
title: Web Platform Guidelines
category: design-system
section: platforms
status: approved
created: 2026-02-23
---

# Web Platform Guidelines

> Specific guidelines for the DFMS web application built with Django Templates + Bootstrap 5 + Alpine.js.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Template engine | Django Templates |
| CSS framework | Bootstrap 5.3 |
| Interactivity | Alpine.js 3.x |
| Icons | Bootstrap Icons 1.11 |
| Maps | Leaflet 1.9 + OpenStreetMap |
| Charts | Chart.js 4.x |
| Date handling | Day.js |
| Tables (complex) | DataTables (Bootstrap 5 integration) |

---

## Bootstrap 5 Configuration

All Bootstrap customization happens in `_variables.scss` — never override Bootstrap classes directly. Import order:

```scss
// 1. Override Bootstrap variables BEFORE import
@import "variables";      // _variables.scss (design system tokens)

// 2. Bootstrap
@import "bootstrap/scss/bootstrap";

// 3. Custom components on top
@import "components/buttons";
@import "components/forms";
@import "components/tables";
@import "components/badges";
@import "components/navigation";

// 4. Page-specific overrides
@import "pages/dashboard";
@import "pages/gate-management";
```

### Key Variable Overrides

```scss
// Maps to design system tokens
$primary:              #1A4F8A;
$secondary:            #374151;
$success:              #1E8A4C;
$warning:              #D97706;
$danger:               #C0392B;
$info:                 #2E6DB4;
$light:                #F3F4F6;
$dark:                 #111827;

$font-family-sans-serif: 'Inter', -apple-system, sans-serif;
$font-size-base:         1rem;
$border-radius:          4px;   // radius-sm
$border-radius-lg:       8px;   // radius-md
$border-radius-xl:       12px;  // radius-lg

$input-height:           40px;
$input-border-color:     #D1D5DB;
$input-focus-border-color: #1A4F8A;
$input-btn-padding-y:    0.5rem;
$input-btn-padding-x:    0.75rem;

$card-border-radius:     8px;
$card-border-color:      #E5E7EB;
$card-cap-bg:            #F9FAFB;

$modal-backdrop-bg:      #000;
$modal-backdrop-opacity: 0.45;
$modal-border-radius:    12px;

$table-striped-bg:       #F9FAFB;
$table-hover-bg:         #EAF1FB;
$table-border-color:     #E5E7EB;
$table-th-font-weight:   600;
```

---

## Alpine.js Conventions

- Use `x-data` on the nearest container, not on `<body>`
- Component state naming: camelCase (`isModalOpen`, `selectedRows`, `isLoading`)
- Use `$store` (via `Alpine.store`) for shared global state (current tenant, active filters)
- Dispatch custom events via `$dispatch` for cross-component communication
- Keep Alpine components small; extract to `/static/js/components/` for reuse

```html
<!-- Example: Modal toggle -->
<div x-data="{ open: false }">
  <button @click="open = true" class="btn btn-primary btn-md">
    Assign Vehicle
  </button>
  <div x-show="open" x-transition class="modal-backdrop" @click.self="open = false">
    <div class="modal-panel">
      <!-- content -->
      <button @click="open = false" class="btn btn-ghost">Cancel</button>
    </div>
  </div>
</div>
```

---

## Responsive Behavior

| Breakpoint | Sidebar | Content padding | Table mode |
|------------|---------|-----------------|------------|
| xl (1280px+) | 240px expanded | 32px | Full columns |
| lg (992px) | 64px icon-only | 24px | Reduced columns |
| md (768px) | Overlay (hamburger toggle) | 16px | Priority columns |
| sm/xs | Hidden, bottom nav | 12px | Card-list view |

### Mobile fallback for tables

On `md` and below, data tables collapse to a **card list view**:

```
+--[Card: TO-2026-0234]----------------+
|  Status: [In Transit badge]           |
|  Route: Depot A → Depot B             |
|  Driver: Md. Rahman                   |
|  Vehicle: DHAKA-GA-11-1234            |
|  Dispatched: 15 Feb, 06:30            |
|  [View Details]          [Track]      |
+---------------------------------------+
```

---

## Performance Guidelines

- CSS/JS served via Django's `collectstatic` + WhiteNoise or CDN
- Bootstrap loaded from local (not CDN) in production for offline resilience
- Alpine.js loaded deferred: `<script defer src="...alpine.min.js"></script>`
- Images: WebP format, max 200KB for UI assets
- Lazy-load heavy content (maps, charts) only when tab/section is visible
- DataTables: use server-side pagination for tables > 500 rows

---

## Icon Usage

Use **Bootstrap Icons** exclusively. No mixing icon libraries.

```html
<!-- Standard usage -->
<i class="bi bi-truck" aria-hidden="true"></i>

<!-- With accessible label -->
<button class="btn btn-ghost btn-icon-md" aria-label="View trip details">
  <i class="bi bi-eye" aria-hidden="true"></i>
</button>
```

Icon sizes matched to context:
- Inside buttons: 16px (`fs-6`)
- Standalone navigation: 18px
- KPI cards: 24px
- Empty state: 48px

---

## Print Styles

DFMS generates print-ready views for:
- Gate pass / challan printout
- Weight certificate
- QC report
- Trip manifest

Print stylesheet rules:
- Sidebar and topbar: `display: none`
- Remove shadows, background colors
- Black text on white background
- Page breaks before major sections
- Show full URLs for links
- Font: system-serif for readability

---

## Accessibility (WCAG 2.1 AA)

- All interactive elements keyboard-navigable
- Focus ring: 3px solid `primary-light`, 2px offset
- Form inputs: `aria-describedby` pointing to error/helper text
- Icons: `aria-hidden="true"` with visible label, or `aria-label` on icon-only buttons
- Color is never the sole indicator of meaning (always pair with text/icon)
- `lang="en"` on `<html>`, switch to `lang="bn"` when Bengali content rendered
- Skip navigation link at top: "Skip to main content"
