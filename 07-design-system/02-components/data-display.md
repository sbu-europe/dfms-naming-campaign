---
title: Data Display Components
category: design-system
section: components
status: approved
created: 2026-02-23
---

# Data Display Components

> Tables, cards, badges, status indicators, and KPI panels used throughout DFMS.

---

## Tables

DFMS is a data-heavy operational system. Tables are the primary UI pattern.

### Anatomy

```
+--[Toolbar: Title | Search | Filters | Actions]----------+
+--[Column Headers (sortable)]----------------------------+
+--[Row]--------------------------------------------------+
|  [Checkbox] [Column 1] [Column 2] ... [Row Actions]     |
+--[Row (striped)]----------------------------------------+
|  ...                                                     |
+--[Pagination Footer]------------------------------------+
```

### Specifications

| Property | Default | Compact |
|----------|---------|---------|
| Header height | 44px | 36px |
| Row height | 48px | 36px |
| Cell padding | 12px 16px | 8px 12px |
| Header font | 12px / semibold / grey-700 / uppercase | same |
| Cell font | 14px / 400 / grey-900 | same |
| Header background | `grey-50` | same |
| Row stripe (even) | `grey-50` | same |
| Row hover | `primary-muted` (subtle) | same |
| Row selected | `primary-muted` with left border `primary` | same |
| Border | 1px `grey-200` | same |

### Column Types

| Type | Alignment | Format |
|------|-----------|--------|
| Text | Left | Plain, truncate with tooltip at 200px |
| Number / Quantity | Right | Tabular numerals, thousands separator |
| Currency | Right | `BDT 1,24,000` format (Bangladesh locale) |
| Date | Center | `DD MMM YYYY` (e.g. `23 Feb 2026`) |
| Date-Time | Left | `23 Feb 2026, 14:32` |
| Status | Center | Status badge (see below) |
| Actions | Right | Icon buttons only; max 3 visible |
| Boolean | Center | Icon: check (success) or dash (neutral) |

### Toolbar

- **Left**: Table title (if standalone) or count (`142 Transport Orders`)
- **Right** (left to right): Search → Filters → Column toggle → Export → Primary action

### Sorting

- Sortable columns: arrow icons appear on hover; active column shows solid arrow
- Default sort shown on initial load (usually date descending)

### Pagination

- Default page size: 25 rows
- Page size selector: 10, 25, 50, 100
- Controls: `<< First  < Prev  Page X of Y  Next >  Last >>`
- Show total record count: `Showing 26-50 of 142 results`

### Empty State

```
[Illustration or icon]
No transport orders found
[Subtext: Try adjusting your filters or create a new order]
[Optional CTA button]
```

---

## Cards

| Type | Use Case |
|------|----------|
| `card-default` | Standard content grouping |
| `card-stat` | KPI / metric summary |
| `card-action` | Clickable entity card |
| `card-alert` | Inline alert or notice |

### Card Anatomy

```
+--[Card Header: Title + optional badge + actions]--+
+--[Card Body]--------------------------------------+
|  Content                                          |
+--[Card Footer: secondary actions or metadata]-----+
```

Padding: `--space-6` (24px) default, `--space-4` (16px) compact.

---

## Status Badges

DFMS uses a single reusable `.dfms-badge` base class combined with semantic modifier classes. **Always use the CSS class approach — never hardcode inline colours.** This ensures automatic light/dark mode adaptation via CSS variables.

### Anatomy

| Property | Value |
|----------|-------|
| Height | 20px |
| Padding | 3px 10px |
| Border radius | `--dfms-radius-pill` (9999px) |
| Font size | 11px |
| Font weight | 600 (semibold) |
| Letter spacing | 0.04em |
| Text transform | uppercase |
| Icon | Bootstrap Icon at 10px, left of label |

### Usage — Django Admin (Python)

```python
from django.utils.html import format_html

PR_STATUS_BADGE = {
    "draft":           ("dfms-badge--draft",           "bi-pencil",            "Draft"),
    "submitted":       ("dfms-badge--submitted",       "bi-send",              "Submitted"),
    "in_progress":     ("dfms-badge--in-progress",     "bi-arrow-repeat",      "In Progress"),
    "fully_allocated": ("dfms-badge--fully-allocated", "bi-check2-all",        "Fully Allocated"),
    "fulfilled":       ("dfms-badge--fulfilled",       "bi-check-circle-fill", "Fulfilled"),
    "cancelled":       ("dfms-badge--cancelled",       "bi-x-octagon-fill",    "Cancelled"),
}

def status_badge(self, obj):
    modifier, icon, label = PR_STATUS_BADGE.get(
        obj.status, ("dfms-badge--neutral", "bi-circle", obj.get_status_display()))
    return format_html(
        '<span class="dfms-badge {}">'
        '<i class="bi {} " style="font-size:10px;"></i>{}'
        '</span>',
        modifier, icon, label,
    )
status_badge.short_description = "Status"
```

### Usage — HTML template

```html
<span class="dfms-badge dfms-badge--submitted">
  <i class="bi bi-send" style="font-size:10px;"></i>Submitted
</span>
```

---

### Modifier Catalogue

#### User Account Status

| State | CSS Modifier | Icon | Colour |
|-------|-------------|------|--------|
| Active | `dfms-badge--active` | `bi-check-circle-fill` | Green |
| Invited | `dfms-badge--trial` | `bi-clock-fill` | Blue (info) |
| Suspended | `dfms-badge--suspended` | `bi-x-octagon-fill` | Amber |
| Invitation Expired | `dfms-badge--neutral` | `bi-slash-circle` | Grey |

#### PR (Product Requisition) Status

| State | CSS Modifier | Icon | Colour |
|-------|-------------|------|--------|
| Draft | `dfms-badge--draft` | `bi-pencil` | Grey |
| Submitted | `dfms-badge--submitted` | `bi-send` | Blue (info) |
| In Progress | `dfms-badge--in-progress` | `bi-arrow-repeat` | Amber |
| Fully Allocated | `dfms-badge--fully-allocated` | `bi-check2-all` | Purple |
| Fulfilled | `dfms-badge--fulfilled` | `bi-check-circle-fill` | Green |
| Cancelled | `dfms-badge--cancelled` | `bi-x-octagon-fill` | Red |

#### TR (Transport Requisition) Status

| State | CSS Modifier | Icon | Colour |
|-------|-------------|------|--------|
| Submitted | `dfms-badge--submitted` | `bi-send` | Blue (info) |
| Pending Approval | `dfms-badge--pending-approval` | `bi-clock-fill` | Amber |
| Approved | `dfms-badge--approved` | `bi-check-circle-fill` | Green |
| Rejected | `dfms-badge--rejected` | `bi-x-octagon-fill` | Red |
| Available for Planning | `dfms-badge--available-planning` | `bi-box-arrow-right` | Purple |
| Under Planning | `dfms-badge--under-planning` | `bi-kanban` | Light blue |
| Partially Allocated | `dfms-badge--partially-allocated` | `bi-pie-chart` | Amber |
| Fully Allocated | `dfms-badge--fully-allocated` | `bi-check2-all` | Purple |
| Fulfilled | `dfms-badge--fulfilled` | `bi-check-circle-fill` | Green |
| Cancelled | `dfms-badge--cancelled` | `bi-x-octagon-fill` | Red |

#### Urgency

| Level | CSS Modifier | Icon | Colour |
|-------|-------------|------|--------|
| Normal | `dfms-badge--urgency-normal` | `bi-dash-circle` | Grey |
| High | `dfms-badge--urgency-high` | `bi-exclamation-circle` | Amber |
| Critical | `dfms-badge--urgency-critical` | `bi-exclamation-triangle-fill` | Red |

#### Fallback

| State | CSS Modifier | Icon |
|-------|-------------|------|
| Unknown / unrecognised | `dfms-badge--neutral` | `bi-circle` |

---

### Rules

- **Never hardcode hex colours** in `format_html` or templates — always use a modifier class.
- **Never create a one-off badge class** — add to the catalogue above and `custom.css` simultaneously.
- All modifier classes use CSS variables (`--dfms-success`, `--dfms-warning-bg`, etc.) for automatic light/dark mode support.
- Badge classes live in `static/admin/css/custom.css` under the section `PR / TR Workflow Status Badges`.
- Icon size inside a badge is always `font-size: 10px` inline style (Bootstrap Icons don't reliably inherit 11px at this size).

---

### Legacy (Trip states — pre-Sprint-3)

These older classes remain for the Trip workflow but **should not be used for new features**. Use `dfms-badge--*` modifiers instead.

```css
.status-in-transit  { background: var(--color-primary-muted); color: var(--color-primary); }
.status-pending     { background: var(--color-warning-light); color: var(--color-warning); }
.status-approved    { background: var(--color-success-light); color: var(--color-success); }
.status-qc-hold     { background: var(--color-danger-light);  color: var(--color-danger);  }
.status-completed   { background: var(--color-grey-100);      color: var(--color-grey-700);}
.status-cancelled   { background: var(--color-grey-100);      color: var(--color-grey-500);}
```

---

## KPI / Stat Cards

Used on dashboards (Command Center, vendor performance, trip analytics).

```
+---------------------------------------+
|  [Icon bg: primary-muted]  [Trend]    |
|  [Value: 36px bold]                   |
|  [Label: 12px grey-500]               |
|  [Subtext / comparison: 12px]         |
+---------------------------------------+
```

| Property | Value |
|----------|-------|
| Value font | 36px / bold / `grey-900` |
| Label font | 12px / medium / `grey-500` / uppercase |
| Trend positive | `color-success` with up arrow |
| Trend negative | `color-danger` with down arrow |
| Trend neutral | `color-grey-500` with dash |
| Icon container | 48x48px, `radius-md`, `primary-muted` background |

---

## Alerts & Notifications

### Inline Alert

```
[Icon] [Title (optional)] Message text                          [Dismiss x]
```

| Type | Background | Border-left | Icon |
|------|------------|-------------|------|
| info | `info-light` | `color-info` | info-circle |
| success | `success-light` | `color-success` | check-circle |
| warning | `warning-light` | `color-warning` | exclamation-triangle |
| danger | `danger-light` | `color-danger` | x-circle |

Border-left width: 4px. Padding: 12px 16px. Border radius: `radius-sm`.

### Toast Notifications

- Position: bottom-right, 16px from edges
- Width: 320px
- Auto-dismiss: 5s (success, info), manual dismiss only (danger)
- Stack: newest on top, max 3 visible
- Animation: slide-in from right, fade-out

---

## Empty States

Every list view and table must define its empty state:

```
[Centered illustration or icon — 64x64px, grey-300]
[Primary message — text-md, grey-700, semibold]
[Secondary message — text-sm, grey-500]
[Optional CTA button — primary or secondary variant]
```

Examples:
- No trips: "No active trips" / "All caught up! No trips require attention."
- No vendors: "No vendors registered" / "Add your first vendor to get started."
- No results from filter: "No results found" / "Try adjusting or clearing your filters."

---

## Loading States

| Context | Pattern |
|---------|---------|
| Page initial load | Full-page skeleton loader (shimmer cards) |
| Table data | Row skeleton (3-5 grey placeholder rows) |
| Button action | Inline spinner replaces button text |
| Card content | Card skeleton (grey blocks matching content layout) |
| Data refresh | Subtle top-page progress bar (1px, primary color) |

Skeleton shimmer animation: `background: linear-gradient(90deg, grey-100 25%, grey-200 50%, grey-100 75%)`, 1.5s loop.

---

## Tooltips

- Trigger: hover or focus on element with `title` or `aria-describedby`
- Delay: 400ms show, 100ms hide
- Max width: 240px
- Background: `grey-900`, text: white, 12px
- Arrow pointing to trigger element
- Never put interactive content inside a tooltip
