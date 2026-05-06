---
title: Sprint 2 Completion Report
sprint: Sprint 2
phase: Phase 1
date: 2026-04-30
status: COMPLETE
total_story_points_planned: 78
branch: main (merged from sprint-2/*, feat/master-data-configuration, DFS-*)
---

# Sprint 2 Completion Report
## Master Data, User Management & Vehicle Tracking

**Date**: April 30, 2026  
**Branch**: `main` (multiple feature branches merged via PRs #8, #10, #11, #13, #14, #15, #16, #17, #18)  
**Status**: ✅ **COMPLETE** (all planned stories delivered; Sprint 1 carry-overs resolved)

---

## 📊 Summary

| Metric | Planned | Delivered |
|--------|---------|-----------|
| Total Stories | 12 | 12 done + Sprint 1 carry-overs resolved |
| Story Points | 78 SP | ~78 SP delivered |
| Epics | 3 | All 3 complete |
| Commits | — | ~120 commits on feature branches |
| Key Modules | — | `apps/master_data`, `apps/users`, `apps/vehicles`, GPS scaffolding |

---

## ✅ Delivered Epics & Stories

### 1. Master Data Management ✅

**Story Points**: 39 SP | **Jira**: DFS-017 → DFS-023

| Story | Task | SP | Status |
|-------|------|----|--------|
| POI Setup & Management | MDM-04 | 8 | ✅ Done |
| Product Master Data Management (CRUD) | MDM-01 | 13 | ✅ Done |
| Route, Supplier & Dealer Master Data | MDM-02 | 5 | ✅ Done |
| Vendor Master Data (Admin CRUD & Bulk Upload) | MDM-03 | 5 | ✅ Done |
| Vehicle Registration & Master Data | MDM-05 | 5 | ✅ Done |
| Helper Master Data Management | MDM-07 | 3 | ✅ Done |

**Key deliverables:**
- Product model overhauled with classifications, sub-categories (dependent dropdown in admin), UOM handling, weight-per-unit (`DFS-158`, `DFS-159`, `DFS-160`)
- `ProductCategory` and `ProductSubCategory` models with CRUD; bulk import/export with job tracking and validation (`DFS-162`, `a53c969`, `a587abf`)
- Supplier and Dealer models updated with comprehensive fields, serializers, admin forms, hard-delete protection, activation/deactivation actions, and full test coverage (`DFS-178`, `DFS-179`, `DFS-180`, `DFS-182`)
- Vehicle model with soft-delete, brand management, bulk import (`DFS-165`, `DFS-166`, `DFS-167`, `DFS-162`)
- Helper model with admin CRUD, unique constraints, soft delete
- Bulk import/export framework: CSV upload, preview, batch processing, per-job status view, sample CSV download, field metadata display — available across Products, Vehicles, Helpers, Suppliers, Dealers, Users
- `volume` field renamed to `amount` across master data for clarity (`ed60601`)

---

### 2. Tenant User Management ✅

**Story Points**: 28 SP | **Jira**: DFS-024 → DFS-028

| Story | Task | SP | Status |
|-------|------|----|--------|
| User Invitation & Activation | TUM-01 | 5 | ✅ Done |
| OTP Verification System | TUM-02 | 5 | ✅ Done |
| Account Deactivation & Reactivation | TUM-03 | 5 | ✅ Done |
| Password & Account Reset | TUM-04 | 5 | ✅ Done |
| User Activity & Audit Logs | TUM-05 | 8 | ✅ Done |

**Key deliverables:**
- Role-based hierarchy implemented: 10 system roles, permissions seeded (`DFS-21`, `feat(DFS-21)`)
- User invitation flow: platform admin and tenant admin invitation with role assignment; email field locked on activation page (`DFS-22`, `DFS-234`)
- Bulk user invitation via CSV (`DFS-015-12`) — Sprint 1 carry-over resolved
- OTP verification system: every-time OTP fix, screen redesign (`DFS-25`, `fix(DFS-25)`)
- Account deactivation & reactivation for tenant users (`DFS-24`, `DFS-26`)
- Password reset and admin-assisted password change flows (forgot password, forced reset) (`DFS-25`, `fix(DFS-25)`)
- User Activity & Audit Logs: login/logout, permission events with missing `id` columns fixed (`DFS-26`, `1fa0a36`)
- Session timeout extended to 24 hours sliding window (`fix(DFS-25): fix session issue` — `6006b20`) — Sprint 1 FB-003 resolved
- Driver user profiles migrated to `apps/users` (`DFS-230`)

---

### 3. Vehicle Tracking & Geofencing ✅ (sprint-scoped portion)

**Story Points**: 8 SP | **Jira**: DFS-031

| Story | Task | SP | Status |
|-------|------|----|--------|
| Geofencing Engine — Arrival & Departure Detection | VTG-01 | 8 | ✅ Done |

**Key deliverables:**
- Geofencing runtime engine: boundary evaluation, arrival/departure detection, dwell time tracking
- POI geofence radius (`geofence_radius_meters`) consumed from MDM-04
- Vehicle GPS identity wired to MDM-05 tracker IDs

---

## 🔄 Sprint 1 Carry-Overs Resolved This Sprint

| Item | Sprint 1 Story | Resolution | Commit |
|------|---------------|------------|--------|
| Resend welcome email to tenant | PAP-05 | Tenant reinvite admin action with activation mail | `a5bc679` |
| Tenant reactivation after suspension | PAP-05 | `fix(DFS-147)` | `e75af8f` |
| Resend invitation endpoint (regenerate token) | CP-04 | `sprint-1/resolve-feedback` PR #13 | `bfacfc2` |
| Bulk CSV user invitation | CP-04 | `DFS-015-12` PR #14 | `9d21fd9` |
| Email field read-only on activation page | CP-04 | Resolved in `sprint-2/resolve-feedback` | `8623d1f` |
| Session timeout 30 min → 24h sliding window | INFRA-04 | Redis session cache TTL updated | `6006b20` |
| 2FA (OTP) for admin/tenant login improvements | CP-03 | `fix(DFS-136): Implement 2FA authentication` | `84490cf` |

---

## 📱 UX & Admin Improvements (DFS-251)

A dedicated UX improvement effort ran across Sprint 2 covering responsiveness, dark mode polish, and admin pagination:

| Area | Change | Commits |
|------|--------|---------|
| Mobile responsiveness | Sidebar backdrop, layout improvements for small screens | `ebce35d` |
| Shared pagination mixin | Reusable Django admin pagination across all changelists | `4ea765e` |
| Dark theme styling | Search toolbar, input fields, button colours | `0a71013`, `7380975` |
| Mobile form controls | Labels, checkboxes, submit actions, help/error messages aligned | `848606d`, `0a602cc`, `c455be7`, `566ad4f` |
| Mobile changelist actions | Improved layout and button usability | `9e3160b` |
| User list | Merged status columns, `Tenant Admin` role restriction enforcement | `4602983`, `ba3ec3d` |
| Admin index | Customised app list ordering for tenant admins | `b5265ed` |

---

## 🐛 Bugs Fixed This Sprint

| Issue | Fix | Commit |
|-------|-----|--------|
| Role hierarchy permissions — menu access | Fixed role-based permission mapping | `166375b`, `41e4439` |
| OTP every-time validation issue | Corrected OTP state management | `a25a6f1` |
| User invitation role/department mismatch | Enhanced role validation in invitation service | `5e8e043`, `099f42e` |
| Admin-assisted password change — session issue | Fixed session flow, 24h TTL | `82d8e84`, `6006b20` |
| Duplicate capacity_unit migration | Removed conflicting migration | `70f75cd` |
| `UserRole.create` unexpected kwargs | Removed stale `assigned_by`/`is_primary` args | `83b031f` |
| Vehicle model capacity fields regression | Refactored model, removed capacity fields from Vehicle | `6078604` |
| `ProgrammingError` on instance check with UUID PKs | Improved instance check in form init | `06bd191` |
| Route and Zone models breaking admin | Removed from admin, serializers, views, migrations | `f4e2285` |
| Too many redirects on suspend tenant | Fixed redirect chain | `2a8035e` |
| Generic password field design issue | Refactored admin assisted password UI | `148bf71`, `2cfbb55` |
| Missing `id` columns in audit log and access tables | Added missing columns | `1fa0a36` |

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Bulk import framework (generic mixin) | Reusable across all master data entities; CSV-based for ops team familiarity |
| Soft delete for Vehicles / Helpers | Preserve historical records in trip and QC references; hard delete only for Suppliers/Dealers with no FK refs |
| Driver model moved to `apps/users` | Driver is a user profile type, not a vehicle asset; avoids circular imports |
| `RequiredFieldMarkAdminMixin` | Consistent visual cue for required fields across all admin forms |
| Role seeding (10 system roles, 135 permissions) | Done programmatically via migration-safe seed command; allows tenant-specific overrides |

---

## 📈 Sprint Metrics

| Metric | Value |
|--------|-------|
| Commits delivered | ~120 |
| Pull Requests merged | 11 (PRs #8–#18) |
| New migrations | 15+ |
| New admin classes | 12+ |
| Bulk import configs | 5 (Products, Vehicles, Helpers, Suppliers/Dealers, Users) |
| Story points delivered | ~78 SP |
| Sprint 1 carry-overs closed | 7 items |

---

## 📋 Demo Feedback

No formal demo feedback session recorded for Sprint 2. Sprint 1 feedback items were systematically resolved and closed during this sprint (see carry-overs table above).

---

**Sprint Lead**: —  
**Last Updated**: 2026-05-06  
**Previous**: [Sprint 1 →](../sprint-1/completion-report.md)  
**Next**: [Sprint 3 →](../sprint-3/completion-report.md)
