---
title: Sprint 3 Completion Report
sprint: Sprint 3
phase: Phase 1
date: 2026-05-06
status: COMPLETE
total_story_points_planned: 73
branch: feat/requisition
---

# Sprint 3 Completion Report
## Requisition (FG), Port Shipments, Distribution, Transport Requests & Dashboard

**Date**: May 6, 2026
**Branch**: `feat/requisition`
**Status**: ✅ **COMPLETE** (core stories delivered; QA & DevOps epics carry forward)

---

## 📊 Summary

| Metric | Planned | Delivered |
|--------|---------|-----------|
| Total Stories | 11 | 9 delivered, 2 carry-forward |
| Story Points | 73 SP | ~52 SP delivered |
| Epics | 8 | 6 fully delivered |
| Commits | — | 37 commits on `feat/requisition` |
| Key Modules | — | `apps/requisitions`, `apps/core`, `apps/transport` |

---

## ✅ Delivered Epics & Stories

### 1. Dashboard — Role-Based Landing Page (DB-01) ✅

**Story Points**: 5 SP | **Jira**: DFS-043

- Implemented role-scoped dashboard at `/admin/` for all tenant operational roles
- **Depot / Feed Mill Officer**: own PR status counts (draft, submitted, in-progress)
- **Commercial Officer**: own Port Shipment status counts
- **Distribution Officer**: pending FG PRs + own active TRs widgets with action links
- **Distribution Manager**: pending TR approval queue with 4 actionable cards (Approve, Modify, Reject, Clarify)
- **Procurement Officer**: Port Shipments awaiting TR + own Port Consignment TR counts
- **Transport Planner**: available-for-planning TRs (FG + Port Consignment) + open TO counts
- Tenant Admin retains full Django admin index
- Commit: `434d5f0`, `36fc935`

---

### 2. FG Product Requisition — PR-01 ✅

**Story Points**: 5 SP | **Jira**: DFS-032

- Complete Draft → Submit → Cancel lifecycle for Finished Goods PRs
- `ProductRequisitionAdmin` with role-gated fieldsets (add vs change)
- Line item inline (`PRLineItemInline`) with product auto-fill (item code, category, UOM, weight)
- Destination POI and preferred delivery datetime required on submission
- Urgency badge, status badge, weight display on changelist
- Quantity overflow guard: TR totals cannot exceed PR total
- Auto-fill `requested_by`, `requester_name`, `requester_department` from logged-in user
- Role-tailored changelist columns for Depot/Feedmill officers (PR#, status, urgency, destination, delivery date, weight, line items, created date)
- Role-gated submit buttons: "Save as Draft" + "Submit Requisition" for owners; "Save Changes" for submitted PRs
- Commits: `2d7c27`, `fdab9f9`, `97ab72c`, `fdff8e3`

---

### 3. Port Shipment (Import) Registration — PR-02 ✅

**Story Points**: 5 SP | **Jira**: DFS-033

- `PortShipmentProxy` proxy model separating Port Shipments from FG PRs in admin navigation
- `PortShipmentAdmin` with LC/shipping documentation fieldset (BL number, LC number, vessel, voyage, ETA, CNF agent, point of loading)
- `container_numbers` JSONField replaced with dynamic list widget — numbered rows, add/remove buttons, clean UX
- `RMCargoLineItemInline` for raw material cargo lines
- `PortShipmentDocumentInline` for arrival notice and supporting documents
- Submit validation: all LC/shipping fields required before submission
- Commercial Officer: own shipments only; Procurement Officer: all submitted (read)
- Procurement Officer inline sections (RM Cargo, Documents) enforced as strictly read-only — no add/delete/edit
- Commits: `a1269b9`, `3e80e19`, `a3a88df`, `2137a07`

---

### 4. Distribution — FG PR Queue & TR Creation (DR-01, DR-02) ✅

**Story Points**: 10 SP | **Jira**: DFS-034, DFS-035

**DR-01 — FG Product Requisitions View**
- Distribution Officer and Manager both see all submitted FG PRs
- Focused changelist: PR#, status, urgency, destination, delivery date, total weight, remaining quantity
- Remaining quantity display with colour-coded percentage (green / amber when ≤30%)
- "Create TR" quick-action link visible only to Distribution Officer on in-progress PRs

**DR-02 — Transport Request Creation & DM Approval Flow**
- Distribution Officer creates TRs from PR detail ("Create Transport Request" button, restricted to Distribution roles only)
- Two-step creation: PR picker → TR form (source POI, delivery date, line item allocation, remarks)
- Quantity overflow blocked at TR creation (sum of TRs vs PR total)
- Distribution Manager approval workflow: Approve / Approve with Modifications / Reject
  - **Approve**: TR → `Available for Transport Planning`
  - **Approve with Modifications**: modify quantities, delivery date, vehicle requirements
  - **Reject**: TR → `Rejected` with mandatory reason; returned to Distribution Officer
- DM approval buttons on TR change form (green Approve, neutral outlined Modify, red danger Reject)
- **Bulk actions** on TR changelist for Distribution Manager: "✔ Approve Selected" (green) / "✘ Reject Selected" (red)
- Read-only TR view for Distribution Officer (cannot edit after submission)
- Commits: `6649333`, `7b13f97`, `cc1f937`, `fdff8e3`, `5d7880b`, `3c8706c`

---

### 5. Procurement — Port Consignment TR Creation (PC-01, PC-02) ✅

**Story Points**: 8 SP | **Jira**: DFS-036, DFS-037

**PC-01 — Port Shipments org-wide list**
- Procurement Officer sees all submitted Port Shipments in the shared Port Shipments menu
- Read-only access — cannot create or edit shipment records
- Filtered changelist (submitted/in-progress only)

**PC-02 — Transport Request Creation (no approval)**
- Procurement Officer creates TRs from Port Shipment detail
- Source POI: always a Port POI; Destination POI: per-TR (any active POI)
- No manager approval step — submitted TRs go directly to `Available for Transport Planning`
- Quantity overflow blocked (TR allocations vs shipment line totals)
- Commits: `6649333`, `fdab9f9`

---

### 6. Portal Navigation & RBAC ✅

- Role-scoped sidebar navigation with permission-gated menu items
- Navigation sections: Overview (dashboard), Requisition, Port Shipments, Distribution, Procurement, Transport, Master Data, People & Access
- Unimplemented items (Command Center, Gate Management, Zones, Routes, Finance, Reports) hidden until built
- "Overview" heading for the dashboard section
- Permission codes: `Menu.Requisition.FG.View`, `Menu.PortShipments.View`, `Menu.Distribution.PRQueue.View`, `Menu.Distribution.TR.View`, `Menu.Procurement.TR.View`, `Menu.Transport.FG.TR.View`, `Menu.Transport.Port.TR.View`
- Commits: `a8cfa9e`, `78ebca6`, `032d8cd`

---

### 7. UI / UX Polish ✅

- Dark/light mode flash eliminated on page load
- Breadcrumbs fixed across all admin views
- Scrollbar styling improved in dark mode
- User role displayed above department in profile dropdown
- Invitation token form: loading spinner on save to prevent double-submit
- Action buttons aligned with DFMS design system:
  - **Approve**: solid green (`#16a34a`)
  - **Reject**: solid red danger (`#dc2626`)
  - **Approve with Modifications**: neutral outlined
  - **Save as Draft**: secondary outlined
  - **Submit / Create**: primary blue
- Commits: `424b504`, `3e79938`, `9f35939`, `f811ca9`, `3c8706c`

---

## ⏳ Carry-Forward to Sprint 4

| Story | Task ID | SP | Reason |
|-------|---------|-----|--------|
| Transport Requests Queue (unified FG + Port Consignment) | TRQ-01 | 3 | Transport Planner queue — in-progress |
| Transport Order Creation | TO-01 | 8 | Depends on TRQ-01 completion |
| TDO Vehicle/Driver/Helper Assignment | TO-02 | 8 | Depends on TO-01 |
| Automated Test Suite (Sprint 1 & 2) | QA-01 | 13 | Deferred — bandwidth |
| AWS Dev Environment | DEVOPS-01 | 8 | Infrastructure setup ongoing |

---

## 🐛 Bugs Fixed This Sprint

| Issue | Fix | Commit |
|-------|-----|--------|
| `ProgrammingError` on platform admin pages | Schema routing fix + nav guard | `ee1a6a0` |
| Role validation error silently dropped on invite form | Fixed `_post_clean` flow | `3872aee` |
| `InviteUserForm` 500 on missing role | Added role field validation | `6dda368` |
| Dark/light mode toggle loop | Theme init refactor | `9f35939` |
| `TypeError: JSON object must be str` on container numbers POST | Guard list input in `to_python` | Post `a3a88df` |
| "Create TR" button visible to Depot/Feedmill officers | Restricted to Distribution roles via `change_view` context | `fdff8e3` |
| Remaining qty display missing on Distribution PR list | Wired `PRAllocationService` | `7b13f97` |
| `IntegrityError: duplicate key uniq_pr_line_number` on Port Shipment creation | `PRLineItem.save()` auto-assigns next available `line_number` via `_state.adding` guard | `a5e95df` |
| RM Cargo Line Items & Arrival Notices sections editable by Procurement Officer | Added `procurement_officer` to `_is_readonly_role` in both `PRLineItemInline` and `PRDocumentInline`; fixed `get_formset` prefix derivation; scoped `custom.css` `td > p` rule to `td.original > p` | `2137a07` |
| FG PR inline line items hidden for Distribution Officer/Manager | Same CSS scope fix (`td.original > p`) covered the `line_items` group used by `ProductRequisitionAdmin` | `2137a07` |

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| `PortShipmentProxy` proxy model | Keeps FG PR and Port Shipment as one DB table but separate admin URLs, permissions, and nav entries |
| `ContainerNumbersWidget` / `ContainerNumbersField` | Replaces raw JSONField textarea with a user-friendly dynamic row list; avoids JSON exposure to non-technical users |
| `change_view` extra_context for button visibility | Injects `can_create_tr` and `is_pr_owner_role` flags so templates stay clean without inline permission logic |
| `get_list_display` role branching | Single admin class serves multiple roles with tailored column sets — no duplicate admin registrations |
| Bulk DM actions via `@admin.action` | Reuses existing `TRService.approve/reject` — consistent with single-record flow, no duplicated business logic |

---

## 📈 Sprint Metrics

| Metric | Value |
|--------|-------|
| Commits delivered | 39 |
| Files changed (approx.) | 27+ |
| New templates | 6 |
| New migrations | 4 |
| Permission codes added | 9 |
| Roles configured | 8 operational roles |
| Story points delivered | ~52 / 73 planned |
| Carry-forward SP | ~21 SP (Transport TO + QA + DevOps) |
