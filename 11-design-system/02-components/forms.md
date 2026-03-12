---
title: Form Components
category: design-system
section: components
status: approved
created: 2026-02-23
---

# Form Components

> Standard form component specifications for all input types used across DFMS.

---

## Text Input

| Property | Value |
|----------|-------|
| Height | 40px (default), 32px (sm), 48px (lg) |
| Border | 1.5px solid `color-grey-300` |
| Border radius | `radius-sm` (4px) |
| Background | `color-white` |
| Font | 14px / 400 / `color-grey-900` |
| Placeholder | 14px / 400 / `color-grey-400` |
| Padding | 0 12px |

### States

| State | Border | Background | Notes |
|-------|--------|------------|-------|
| Default | `grey-300` | white | |
| Focus | `primary` (2px) | white | + 3px focus ring `primary-muted` |
| Filled | `grey-300` | white | |
| Error | `danger` (1.5px) | `danger-light` | |
| Disabled | `grey-200` | `grey-50` | cursor: not-allowed; opacity 60% |
| Read-only | `grey-200` | `grey-50` | cursor: default |

### Label & Helper Text

- Label: 14px / `font-medium` / `color-grey-900` — always above the field
- Required marker: red asterisk `*` after label text
- Helper text: 12px / `color-grey-500` — below the field
- Error text: 12px / `color-danger` — replaces helper text on error; with icon

```html
<div class="form-group">
  <label class="form-label" for="vendor-name">
    Vendor Name <span class="text-danger">*</span>
  </label>
  <input type="text" id="vendor-name" class="form-control" placeholder="Enter registered business name">
  <div class="form-text">As per trade license / registration document</div>
</div>

<!-- Error state -->
<div class="form-group">
  <label class="form-label" for="vehicle-no">Vehicle Number <span class="text-danger">*</span></label>
  <input type="text" id="vehicle-no" class="form-control is-invalid" value="ABCD">
  <div class="invalid-feedback">Enter a valid vehicle registration number (e.g. DHAKA-A-11-1234)</div>
</div>
```

---

## Select / Dropdown

- Same dimensions and states as text input
- Custom chevron icon (`color-grey-500`), never browser default
- Searchable select (for lists > 8 items): use a combobox pattern with type-to-filter
- Multi-select: use tag/chip display inside the input for selected values

```html
<div class="form-group">
  <label class="form-label" for="vehicle-type">Vehicle Type <span class="text-danger">*</span></label>
  <select id="vehicle-type" class="form-select">
    <option value="" disabled selected>Select vehicle type</option>
    <option value="truck">Truck</option>
    <option value="covered_van">Covered Van</option>
    <option value="tanker">Tanker</option>
  </select>
</div>
```

---

## Textarea

- Min-height: 96px (3 rows)
- Resize: vertical only
- All other properties same as text input
- Character count displayed at bottom-right when `maxlength` is set

---

## Checkbox & Radio

| Property | Value |
|----------|-------|
| Size | 18x18px |
| Border | 2px solid `color-grey-400` |
| Border radius | 4px (checkbox), 50% (radio) |
| Checked background | `color-primary` |
| Checked border | `color-primary` |
| Checkmark | White SVG icon |
| Focus ring | 3px `color-primary-muted` |
| Label gap | 10px |
| Label font | 14px / 400 / `color-grey-700` |

---

## Toggle / Switch

| Property | Value |
|----------|-------|
| Track width | 44px |
| Track height | 24px |
| Track (off) | `color-grey-300` |
| Track (on) | `color-primary` |
| Thumb | 18px circle, `color-white`, 3px shadow |
| Transition | 150ms ease |

Use toggles for **binary settings** (enable/disable), not for form selections.

---

## Date Picker

- Use browser-native `<input type="date">` with custom styling
- Display format: `DD/MM/YYYY` (consistent with operations locale)
- Date range picker: two linked date inputs with "From" / "To" labels
- For trip scheduling: show calendar inline, not in a popover

---

## File Upload

```
+---------------------------------------------+
|  [Upload icon]  Drag & drop or click to browse |
|  Supported: PDF, JPG, PNG (max 10MB)          |
+---------------------------------------------+
```

- Accepted types listed below the dropzone
- Progress bar during upload
- Uploaded file shown as a dismissible chip with filename + size
- Error displayed inline below the dropzone

---

## Form Section Headers

Form section headers group related fields (e.g. "Organisation", "Contact Details", "Address"). They are **structural dividers** — not actions, not CTAs.

### Visual Hierarchy Rule

> The primary action button ("Save", "Create", "Submit") must always be the **most visually prominent interactive element** on the page. Form section headers must never compete with it.

Using `color-primary-dark` (`#122056`) as a solid background fill on section headers inverts the hierarchy — a dark full-width band draws more attention than a button. This is prohibited.

### Correct Treatment

| Property | Value |
|----------|-------|
| Background | `color-bg-surface-alt` (`#FAFAFD` light / `#12162B` dark) |
| Border bottom | 1px solid `color-border` |
| Border left | 3px solid `color-primary` |
| Text | 12px / `font-semibold` / `color-text-primary` / `letter-spacing: 0.06em` / `UPPERCASE` |
| Padding | 10px 16px |
| Border radius | `radius-sm` (4px) |
| Margin bottom | `space-6` (24px) |

```html
<!-- Correct: lightweight section header -->
<div class="form-section-header">
  ORGANISATION
</div>

<style>
.form-section-header {
  background: var(--color-bg-surface-alt);
  border-bottom: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 10px 16px;
  border-radius: 4px;
  margin-bottom: 24px;
}
</style>
```

### Prohibited Patterns

```html
<!-- ❌ WRONG: dark fill competes with the Save button -->
<div style="background: #122056; color: white; padding: 10px 16px; font-weight: bold;">
  ORGANISATION
</div>

<!-- ❌ WRONG: primary colour fill on section header -->
<div style="background: var(--color-primary); color: white; padding: 10px 16px;">
  ORGANISATION
</div>
```

### Visual Comparison

```
✅ CORRECT hierarchy:
  [ORGANISATION]              ← quiet: off-white bg, left accent stripe
  Name ___________
  Phone ___________
                   [Cancel]  [Save]   ← loud: solid primary fill button

❌ WRONG hierarchy:
  ██████ ORGANISATION ██████  ← loud: dark navy fill, full-width band
  Name ___________
  Phone ___________
                   [Cancel]  [Save]   ← quiet: same weight as the header
```

---

## Form Layout Rules

1. **Single-column forms** for simple operations (login, OTP, basic profile)
2. **Two-column forms** for master data entry (vehicle, driver, vendor registration)
3. **Wizard/step forms** for complex multi-section inputs (tenant onboarding, trip creation)
4. **Group related fields** under `form-section-header` (see above — never a dark fill)
5. **Field order** follows the natural information hierarchy (required fields first)
6. **Submit button** is always at the bottom-right of a form, `primary` variant, and must be the highest-contrast interactive element on screen
7. **Cancel button** is always to the left of Submit, `ghost` variant
8. **Inline validation** fires on field blur; form-level validation on submit
9. Form sections must be separated by `--space-8` (32px)
10. Label alignment: always **top-aligned** (never inline/right-aligned)
