---
title: Workflow & Status Patterns
category: design-system
section: patterns
status: approved
created: 2026-02-23
---

# Workflow & Status Patterns

> DFMS-specific UX patterns for status display, approval flows, and multi-step operations.

---

## Status Display

### Status Badge (summary)

See `02-components/data-display.md` for badge specifications.

Status badges must **always** be accompanied by an explanatory label in accessible contexts — never use color alone.

### Status Timeline

Used on trip detail pages, TO history, QC audit trail.

```
[●] Draft            14 Feb 2026, 09:12
[●] Approved         14 Feb 2026, 11:45  — by Procurement Head
[●] In Transit       15 Feb 2026, 06:30  — Driver: Md. Rahman
[●] At Gate          15 Feb 2026, 14:20  — Gate: Depot A
[○] Weighing         (pending)
[○] Unloading        (pending)
[○] Completed        (pending)
```

| Element | Style |
|---------|-------|
| Completed dot | 10px circle, `color-success` |
| Active dot | 10px circle, `color-primary`, pulsing ring |
| Pending dot | 10px circle outline, `color-grey-300` |
| Connector line | 1px `grey-200`, dashed for pending segments |
| Timestamp | 12px / `grey-500` |
| Actor | 12px / `grey-700` / italic |

---

## Approval Workflow Display

Used for TR/TO approval chains.

```
+--[Initiator: Procurement Officer]---+
|  Requested transfer of 500 bags     |
|  14 Feb 2026, 09:12                 |
+------+------------------------------+
       |
  [APPROVED]
       |
+--[Approver L1: Procurement Head]---+
|  Approved with condition            |
|  "Verify stock at source depot"     |
|  14 Feb 2026, 11:45                 |
+------+-----------------------------+
       |
  [PENDING]
       |
+--[Approver L2: Distribution Manager]--+
|  Awaiting review...                    |
+---------------------------------------+
```

### Action Panel (for approvers)

```
+-------------------------------------+
|  [Approve]  [Reject]  [Request Info] |
|  Comment (optional):                 |
|  [____________________________]      |
+-------------------------------------+
```

- "Approve" button: `success` variant
- "Reject" button: `danger-outline` variant
- "Request Info" button: `ghost` variant
- Comment is mandatory on rejection
- Confirmation modal required before final approve/reject submission

---

## Multi-Step Forms (Wizards)

Used for: Tenant onboarding, Trip creation, Vendor registration.

### Step Indicator

```
( 1. Basic Info )  ——  ( 2. Documents )  ——  ( 3. Fleet Details )  ——  ( 4. Review )
     [Active]                [Pending]              [Pending]              [Pending]
```

| State | Indicator | Label |
|-------|-----------|-------|
| Completed | Filled circle + checkmark, `success` | Label color `grey-700` |
| Active | Filled circle, `primary`, step number | Label color `primary` |
| Pending | Outline circle, `grey-300`, step number | Label color `grey-400` |
| Error | Filled circle + !, `danger` | Label color `danger` |

### Navigation Rules

- "Next" button: `primary`, right side
- "Back" button: `ghost`, left side
- "Save & Exit" button: `ghost`, far left
- "Submit" button (final step): `primary`, labeled with action ("Submit Registration")
- Users can click back to completed steps freely
- Cannot skip to future steps

---

## Data Entry Confirmation Pattern

For high-impact operations (submit TR, assign vehicle, approve payment):

1. User fills form and clicks primary action
2. Modal appears: **"Confirm [Action]"**
   - Summary of what will be submitted (read-only)
   - Clear warning if irreversible
   - `Confirm` (primary) and `Cancel` (ghost) buttons
3. On confirm: button shows loading state, form disabled
4. On success: modal closes, success toast, page/table refreshes
5. On error: error shown inline in modal, user can retry

---

## Bulk Action Pattern

For tables with multi-select (e.g., approve multiple TOs, bulk assign helpers):

```
[Toolbar transforms when rows selected]
  [X] 12 items selected          [Bulk Approve]  [Bulk Assign]  [Cancel]
```

1. Checkbox in header selects/deselects all on current page
2. Action bar replaces normal toolbar when 1+ rows selected
3. Bulk actions open a single confirmation modal
4. Progress indicator for long-running bulk operations
5. Results summary shown: "12 approved, 0 failed"

---

## Empty / Zero State Hierarchy

For each key section, use this hierarchy:

| Condition | Message Type | CTA |
|-----------|-------------|-----|
| No data, first use | Onboarding empty state with illustration | "Get started" or "Add first X" |
| No data after filter | Filter empty state | "Clear filters" |
| Error loading | Error state with retry | "Try again" |
| No permission | Permission state | "Contact your admin" |

---

## Real-time Data Patterns

For live data (Command Center map, active trips, gate queue):

- Auto-refresh interval: 30 seconds (configurable)
- Refresh indicator: subtle "Last updated X seconds ago" text
- New data arrives: rows fade-in (not jarring reflow)
- Changed data: flash highlight (`primary-muted` background, 800ms)
- Connection lost: persistent warning banner at top of page
- On reconnect: auto-refresh + dismiss banner
