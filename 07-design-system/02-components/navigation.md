---
title: Navigation Components
category: design-system
section: components
status: approved
created: 2026-02-23
---

# Navigation Components

> Sidebar, topbar, breadcrumbs, and tabs used across the DFMS web application.

---

## Application Shell

```
+--[Topbar 56px, fixed, z-fixed]--------------------------------------------+
|  [Logo 32px]  [Tenant name]              [Search]  [Notif]  [User avatar]  |
+--[Sidebar 240px, fixed, z-fixed]--+-----------------------------------------+
|  [Nav group: Operations]          |  [Page Header]                           |
|    [Nav item: active]             |  [Breadcrumb]  [Page Title]  [Actions]   |
|    [Nav item]                     +------------------------------------------+
|    [Nav item]                     |  [Content Area]                          |
|  [Nav group: Master Data]         |  padding: 24px 32px                      |
|    [Nav item]                     |                                          |
|  [Nav group: Reports]             |                                          |
|    [Nav item]                     |                                          |
|                                   |                                          |
|  [Bottom: Settings, Help]         |                                          |
+-----------------------------------+------------------------------------------+
```

---

## Sidebar (Primary Navigation)

| Property | Value |
|----------|-------|
| Width (expanded) | 240px |
| Width (collapsed) | 64px (icons only) |
| Background | `color-bg-surface-alt` (`#F9FAFB`) |
| Border-right | 1px `color-grey-200` |
| Transition | 200ms ease (collapse/expand) |

### Nav Item

| State | Background | Text | Icon |
|-------|-----------|------|------|
| Default | transparent | `grey-700` | `grey-500` |
| Hover | `grey-100` | `grey-900` | `grey-700` |
| Active | `primary-muted` | `primary` | `primary` |
| Active (left border) | 3px solid `primary` | — | — |
| Disabled | transparent | `grey-400` | `grey-300` |

```
Height:         40px
Padding:        0 16px
Border radius:  radius-sm (4px)
Font:           14px / medium / grey-700
Icon size:      18px
Icon-label gap: 12px
Margin:         2px 8px (horizontal inset within sidebar)
```

### Nav Group Header

```
Font:      11px / semibold / grey-500 / UPPERCASE
Padding:   16px 16px 6px
Letter-spacing: 0.08em
```

### Collapsed State

- Show only icons (18px)
- Group labels hidden
- Active state: icon color `primary`, left border retained
- Tooltip on hover showing item label

---

## Topbar

| Property | Value |
|----------|-------|
| Height | 56px |
| Background | `color-white` |
| Border-bottom | 1px `color-grey-200` |
| Z-index | `z-fixed` (300) |
| Shadow | `shadow-sm` |

### Topbar Elements (left to right)

1. **Logo** — 32px height, links to dashboard
2. **Tenant name** — 14px / semibold / `grey-900` (hidden on mobile)
3. **Spacer** (flex-grow)
4. **Global search** — 280px input, `grey-100` background, search icon
5. **Notifications bell** — icon button, badge with unread count (`danger` background)
6. **User avatar** — 32px circle, initials if no photo, opens profile dropdown

---

## Breadcrumbs

```
Dashboard  /  Fleet Management  /  Vehicles  /  DHA-GA-11-1234
```

| Property | Value |
|----------|-------|
| Font | 13px / 400 |
| Color (parent links) | `grey-500` |
| Color (current page) | `grey-900` / medium |
| Separator | `/` `grey-300` |
| Hover (links) | `primary` |
| Max items | 4 (collapse middle items with `...` on overflow) |

Always show breadcrumb below the topbar, above the page title.

---

## Page Header

```
+--[Breadcrumb]-----------------------------------------------+
|  [Page Title (H2)]                  [Action buttons]         |
|  [Optional subtitle (body-sm, grey-500)]                     |
+-------------------------------------------------------------+
```

| Property | Value |
|----------|-------|
| Padding | 24px 32px |
| Border-bottom | 1px `grey-200` |
| Title font | H2 (30px / bold) |
| Subtitle font | 14px / 400 / `grey-500` |
| Actions | Right-aligned, primary + ghost buttons |

---

## Tabs

Used for sub-navigation within a page (e.g., vendor profile: Overview / Documents / Fleet / Payments).

### Line Tabs (default)

```
[Tab 1]  [Tab 2 (active)]  [Tab 3]  [Tab 4]
         ___________
         (underline)
```

| Property | Value |
|----------|-------|
| Tab height | 44px |
| Padding | 0 16px |
| Font | 14px / medium |
| Color (inactive) | `grey-500` |
| Color (active) | `primary` |
| Active indicator | 2px bottom border, `primary` |
| Border-bottom (container) | 1px `grey-200` |
| Hover | `grey-700` |

### Pill Tabs (compact views)

```
( Tab 1 )  ( Tab 2 )  ( Tab 3 active )
```

| Property | Value |
|----------|-------|
| Height | 32px |
| Padding | 0 14px |
| Font | 13px / medium |
| Active background | `primary-muted` |
| Active color | `primary` |
| Border radius | `radius-full` |

---

## Modals

```
+--[Modal Overlay: rgba(0,0,0,0.45)]---------------------------+
|  +--[Modal Panel]------------------------------------------+ |
|  |  [Header: Title + X close button]                       | |
|  |  [Body: form or content]                                 | |
|  |  [Footer: secondary action (left) + primary action (right)] | |
|  +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

| Property | Value |
|----------|-------|
| Overlay | `color-bg-overlay` |
| Panel background | `color-white` |
| Panel border-radius | `radius-lg` (12px) |
| Panel shadow | `shadow-xl` |
| Header padding | 20px 24px |
| Header border-bottom | 1px `grey-200` |
| Body padding | 24px |
| Footer padding | 16px 24px |
| Footer border-top | 1px `grey-200` |
| Footer background | `grey-50` |
| Animation | Fade + scale from 0.95 to 1, 150ms |
| Close on overlay click | Confirmation modals: No. Info modals: Yes |
| Close on Escape key | Yes |

**Width sizes**:
- `sm`: 480px — simple confirmations
- `md`: 640px — forms, detail views (default)
- `lg`: 800px — complex forms, data tables
- `xl`: 1024px — full-form wizards, document viewers
