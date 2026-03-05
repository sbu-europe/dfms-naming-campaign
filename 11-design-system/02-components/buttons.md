---
title: Buttons
category: design-system
section: components
status: approved
created: 2026-02-23
---

# Buttons

> All button usage across web and mobile must follow these specifications.

---

## Variants

| Variant | Use Case | Background | Text | Border |
|---------|----------|-----------|------|--------|
| `primary` | Main action on page (1 per view) | `color-primary` | white | none |
| `secondary` | Secondary actions | white | `color-primary` | `color-primary` 1.5px |
| `danger` | Destructive: delete, reject, blacklist | `color-danger` | white | none |
| `danger-outline` | Soft destructive: confirm before proceeding | white | `color-danger` | `color-danger` 1.5px |
| `ghost` | Tertiary, inline actions | transparent | `color-grey-700` | none |
| `link` | Navigation-style actions | transparent | `color-primary` | none (underline on hover) |
| `success` | Confirm, approve, complete | `color-success` | white | none |

---

## Sizes

| Size | Height | Padding H | Font | Icon Size | Usage |
|------|--------|-----------|------|-----------|-------|
| `sm` | 32px | 12px | 14px / medium | 14px | Compact tables, inline row actions |
| `md` (default) | 40px | 16px | 14px / semibold | 16px | Standard forms, card actions |
| `lg` | 48px | 24px | 16px / semibold | 18px | Primary CTA, page-level actions |
| `icon-sm` | 32px | 8px | — | 16px | Icon-only compact actions |
| `icon-md` | 40px | 10px | — | 18px | Icon-only standard actions |

---

## States

| State | Visual Change |
|-------|--------------|
| Default | Base styling |
| Hover | Background darkens by 8% (primary: `color-primary-dark`) |
| Focus | 3px offset focus ring, `color-primary-light` at 50% opacity |
| Active/Pressed | Background darkens by 15%, slight scale(0.98) |
| Disabled | Opacity 40%, cursor: not-allowed, no hover effects |
| Loading | Spinner replaces label/icon, button disabled, width preserved |

---

## Rules

- **Maximum one `primary` button per page section** (form, modal, card)
- Buttons with destructive actions (`danger`, `danger-outline`) must always be confirmed via a modal or popover, never triggered directly
- Icon-only buttons must have a `title` attribute and `aria-label` for accessibility
- Loading state must prevent double-submission — disable immediately on click
- Button labels: **Verb + Noun** format — "Create Order", "Approve Request", "Download Report" (not "Submit", "OK")

---

## HTML Examples (Bootstrap 5 + CSS Variables)

```html
<!-- Primary -->
<button type="button" class="btn btn-primary btn-md">
  Create Transport Order
</button>

<!-- Secondary -->
<button type="button" class="btn btn-outline-primary btn-md">
  Export CSV
</button>

<!-- Danger -->
<button type="button" class="btn btn-danger btn-md">
  Reject Requisition
</button>

<!-- Ghost -->
<button type="button" class="btn btn-ghost btn-md">
  Cancel
</button>

<!-- Loading state -->
<button type="button" class="btn btn-primary btn-md" disabled>
  <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
  Creating...
</button>

<!-- Icon + Label -->
<button type="button" class="btn btn-primary btn-md d-inline-flex align-items-center gap-2">
  <svg ...></svg>
  Assign Vehicle
</button>

<!-- Icon only -->
<button type="button" class="btn btn-ghost btn-icon-md" aria-label="Edit vendor" title="Edit vendor">
  <svg ...></svg>
</button>
```

---

## Flutter

```dart
// Primary
ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: AppColors.primary,
    foregroundColor: Colors.white,
    minimumSize: const Size.fromHeight(48),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    textStyle: AppTextStyles.label,
  ),
  child: const Text('Create Order'),
)

// Secondary
OutlinedButton(
  onPressed: () {},
  style: OutlinedButton.styleFrom(
    foregroundColor: AppColors.primary,
    side: const BorderSide(color: AppColors.primary, width: 1.5),
    minimumSize: const Size.fromHeight(48),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),
  child: const Text('View Details'),
)

// Danger
ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: AppColors.danger,
    foregroundColor: Colors.white,
    minimumSize: const Size.fromHeight(48),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),
  child: const Text('Reject'),
)
```
