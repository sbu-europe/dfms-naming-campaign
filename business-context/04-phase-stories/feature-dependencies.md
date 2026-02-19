---
title: Feature Dependencies & Execution Sequence
category: features
phase: all-phases
status: approved
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../03-module-specifications/
tags: [dependencies, critical-path, execution-sequence]
---

# Feature Dependencies & Execution Sequence

> **Purpose**: Define the dependency graph between features to ensure correct implementation order and minimize blockers

---

## Overview

This document maps the **prerequisites and downstream impacts** of all 91 user stories across 3 phases. Understanding dependencies is critical for:

- ✅ Sprint planning (can't start a feature before its dependencies)
- ✅ Risk mitigation (identify bottlenecks early)
- ✅ Parallel development (maximize team efficiency)
- ✅ Testing sequencing (integration tests need dependent features)

---

## Critical Path (Must Complete in Order)

### Layer 1: Foundation (No Dependencies)

**Phase 1, Sprint 1-2 (Weeks 1-4)**

```
US-001: Vehicle Master Data
US-002: Driver Master Data
US-003: Helper Master Data
US-004: Vendor Master Data
US-005: POI Master Data
US-006: Product Master Data
US-007: User & Role Management
US-008: Tenant Configuration
```

**Why Critical**: ALL other features depend on master data existing

**Parallel Work**: All 8 stories can be developed in parallel

---

### Layer 2: Product Requisition (Depends on Master Data)

**Phase 1, Sprint 2-3 (Weeks 3-6)**

```
US-009: Create FG Transfer Requisition
  └─ Depends: US-005 (POI), US-006 (Product), US-007 (Users)

US-010: Create Port Consignment TR
  └─ Depends: US-005 (POI), US-006 (Product), US-007 (Users)

US-011: Distribution Approval Workflow
  └─ Depends: US-009 (FG TR must exist)

US-012: Procurement Approval Workflow
  └─ Depends: US-010 (Port TR must exist)

US-013: Stock Validation
  └─ Depends: US-009, US-010 (TR must exist)

US-014: Capacity Checking
  └─ Depends: US-009, US-010 (TR must exist)
```

**Parallel Work**: 
- US-009 and US-010 can be parallel
- US-011 and US-012 can be parallel (after US-009/010)

---

### Layer 3: Transport Planning (Depends on Approved TRs)

**Phase 1, Sprint 3-4 (Weeks 5-8)**

```
US-015: TR Assessment by Transport Planner
  └─ Depends: US-011, US-012 (Approved TRs)

US-016: Fleet Availability Validation
  └─ Depends: US-001 (Vehicle data)

US-017: TO Creation (Multiple per TR)
  └─ Depends: US-015 (TR assessment), US-016 (Fleet availability)

US-018: TO Execution - Own Fleet
  └─ Depends: US-017 (TO must be created), US-001, US-002 (Vehicle, Driver)

US-019: TO Execution - Vendor Fleet (Direct)
  └─ Depends: US-017 (TO), US-004 (Vendor), US-029 (Verified vendors)

US-020: TO Execution - Vendor Fleet (Bidding)
  └─ Depends: US-017 (TO), US-027, US-028, US-029 (Vendor onboarding)
```

**Critical Path**: US-015 → US-017 → US-018/019/020

**Parallel Work**: US-018, US-019, US-020 can be developed in parallel (different teams)

---

### Layer 4: Vendor Ecosystem (Parallel to Transport Planning)

**Phase 1, Sprint 3-5 (Weeks 5-10)**

```
US-027: Vendor Registration Portal
  └─ Depends: US-007 (User roles)

US-028: Vendor Document Upload
  └─ Depends: US-027 (Vendor must be registered)

US-029: Vendor Verification Workflow
  └─ Depends: US-027, US-028 (Registration + Docs)

US-030: Vendor Bidding Portal (same as US-020)
  └─ Depends: US-029 (Verified vendors), US-017 (TO)

US-031: Bid Evaluation & Winner Selection
  └─ Depends: US-030 (Bids submitted)

US-032: Vendor TO Dashboard
  └─ Depends: US-019, US-020 (TO assigned to vendor)

US-033: Vendor Invoice Submission
  └─ Depends: US-021 (Trip completed)

US-034: Vendor Payment Tracking
  └─ Depends: US-033 (Invoice submitted)
```

**Note**: Vendor features (US-027 to US-029) can be developed in parallel with Transport Planning (US-015 to US-017)

---

### Layer 5: Trip Execution & Lifecycle

**Phase 1, Sprint 5-6 (Weeks 9-12)**

```
US-021: Trip Lifecycle Management (12 States)
  └─ Depends: US-018, US-019, US-020 (TO assigned to driver)

US-022: Partial Delivery Handling
  └─ Depends: US-021 (Trip lifecycle states)

US-023: Incident Management
  └─ Depends: US-021 (Trip lifecycle states)

US-024: Trip Closure with POD
  └─ Depends: US-021 (Trip completion state)

US-025: Real-time Map-based Dashboard
  └─ Depends: US-021 (GPS tracking during trip)

US-026: Trip History & Audit Trail
  └─ Depends: US-021, US-024 (Completed trips)
```

**Critical Path**: US-021 is a **major blocker** for many downstream features

---

### Layer 6: Operations (Parallel to Trip Execution)

**Phase 1, Sprint 4-7 (Weeks 7-14)**

```
US-035: Gate-In Entry
  └─ Depends: US-017 (TO exists), US-021 (Trip states)

US-036: On-Demand TO Creation
  └─ Depends: US-005, US-006 (POI, Product)

US-037: Gate-Out Entry
  └─ Depends: US-035 (Gate-in first)

US-038: Scale-In Weight Recording
  └─ Depends: US-035 (Gate-in)

US-039: Queue Token Generation
  └─ Depends: US-038 (Scale-in)

US-040: Scale-Out with Net Weight
  └─ Depends: US-039 (Queue token), US-038 (Scale-in weight)

US-041: Command Center Queue Monitoring
  └─ Depends: US-038, US-039 (Queue data)

US-042: Loading Assignment & Execution
  └─ Depends: US-040 (Scaled weight), US-021 (Trip state)

US-043: Unloading Assignment & Execution
  └─ Depends: US-042 (Loading complete), US-021 (Trip state)

US-044: Real-time Operations Dashboard
  └─ Depends: US-035-043 (All operations data)
```

**Parallel Work**: Gate operations (US-035-037) can be developed in parallel with Scaling operations (US-038-040)

---

### Layer 7: Quality Control (Depends on Unloading)

**Phase 1, Sprint 7-9 (Weeks 13-18)**

```
US-045: Pre-QC Context Display
  └─ Depends: US-043 (Unloading complete)

US-046: Sample Creation
  └─ Depends: US-045 (QC context)

US-047: QR Code Generation
  └─ Depends: US-046 (Sample created)

US-048: Physical Inspection with Photo/Video
  └─ Depends: US-046 (Sample created)

US-049: Configurable QC Checklists
  └─ Depends: US-006 (Product categories)

US-050: Sampling from Multiple Sides
  └─ Depends: US-046 (Sample workflow)

US-051: Lab Test Request Creation
  └─ Depends: US-046 (Sample created)

US-052: Lab Testing with QR Scan
  └─ Depends: US-047, US-051 (QR codes, test requests)

US-053: Lab Report Upload
  └─ Depends: US-052 (Lab testing)

US-054: Lab Status Monitoring
  └─ Depends: US-052 (Lab testing in progress)

US-055: QC Pass/Fail Decision
  └─ Depends: US-052, US-053 (Test results)

US-056: QC Escalation Workflow
  └─ Depends: US-055 (QC decision)
```

**Sequential Path**: US-045 → US-046 → US-047/048/051 → US-052 → US-055

---

### Layer 8: Fleet & Costing (Depends on Trip Completion)

**Phase 1, Sprint 6-7 (Weeks 11-14)**

```
US-057: Fleet Health Dashboard
  └─ Depends: US-001 (Vehicle data), US-021 (Trip data)

US-058: Vehicle Status Matrix
  └─ Depends: US-001 (Vehicle data), US-021 (Trip states)

US-059: Trip Cost Calculation
  └─ Depends: US-024 (Trip closed)

US-060: Vendor Trip Cost Tracking
  └─ Depends: US-024 (Trip closed), US-033 (Vendor invoice)
```

---

### Layer 9: Mobile Applications (Depends on Backend APIs)

**Phase 1, Sprint 9-10 (Weeks 17-20)**

```
US-052: Driver Mobile Interface
  └─ Depends: US-021 (Trip lifecycle APIs), US-023 (Incident APIs), US-025 (POD APIs)
  └─ Note: Numbered in QC range but functionally a mobile interface

US-061: QC Supervisor Mobile Interface
  └─ Depends: US-044-056 (QC workflow APIs)
  └─ Note: US-062 is duplicate of US-061, not created separately

US-063: Vendor Mobile Application (Flutter - Bidding & TO View)
  └─ Depends: US-024 (Bidding APIs), US-031 (Vendor Portal APIs)
```

**Note**: Mobile-responsive web interfaces are **consumers** of backend APIs, so backend must be stable first

**Important**: US-062 was a duplicate entry for QC Supervisor Mobile and was not created separately. US-061 covers this functionality completely.

---

## Phase 2 Dependencies (Optimization Layer)

**Phase 2, Sprint 14-19 (Weeks 27-39)**

All Phase 2 features depend on **Phase 1 completion + 3 months operational data**

### Transport Optimization
```
US-064: TO Dispatch Planning
  └─ Depends: US-017, US-021 (TO and Trip data)

US-065: TR Conjoinment
  └─ Depends: US-017 (TO creation logic)

US-066: Route Optimization
  └─ Depends: US-021 (Historical trip data)
```

### Fleet Management Advanced
```
US-067: Vehicle Utilization Analytics
  └─ Depends: US-001, US-021 (Vehicle, Trip data)

US-068: Vehicle Downtime Management
  └─ Depends: US-001, US-021 (Vehicle, Trip data)

US-069: Maintenance Scheduling
  └─ Depends: US-001 (Vehicle data)
```

### Fuel Management
```
US-070: Fuel Consumption Tracking
  └─ Depends: US-001, US-021 (Vehicle, Trip data)

US-071: Fuel Entry System
  └─ Depends: US-052 (Driver mobile interface)

US-072: Fuel Performance Monitoring
  └─ Depends: US-070, US-071 (Fuel data)
```

### Vendor Management Advanced
```
US-073: Vendor Billing & Claims
  └─ Depends: US-033, US-034 (Invoice tracking)

US-074: Vendor Trip Cost Reconciliation
  └─ Depends: US-060 (Vendor trip costs)
```

### Analytics & Reporting
```
US-075: Custom Report Builder
  └─ Depends: ALL Phase 1 data

US-076: KPI Dashboard Configuration
  └─ Depends: ALL Phase 1 data
```

### Mobile Enhancements
```
US-077: Vendor Invoice Management Mobile
  └─ Depends: US-063, US-073 (Vendor mobile, Billing APIs)
```

---

## Phase 3 Dependencies (Enterprise Layer)

**Phase 3, Sprint 20-24 (Weeks 40-49)**

All Phase 3 features depend on **Phase 1 & 2 completion + 6 months operational data**

### Reporting & Analytics Advanced
```
US-078: Transport & Trip Analysis Reports
  └─ Depends: Phase 1 (US-021, US-024), Phase 2 (US-066)

US-079: Vendor Performance Reports
  └─ Depends: Phase 1 (US-027-034), Phase 2 (US-073-074)

US-080: Fleet Utilization Reports
  └─ Depends: Phase 1 (US-001, US-057-058), Phase 2 (US-067-068)

US-081: Costing & Finance Reports
  └─ Depends: Phase 1 (US-059-060), Phase 2 (US-074)

US-082: System Usage & Audit Reports
  └─ Depends: Phase 1 (US-007, audit logs)

US-083: Custom Dashboard Builder
  └─ Depends: Phase 2 (US-076), ALL data
```

### Notifications & Alerts
```
US-084: Basic System Alerts
  └─ Depends: Phase 1 (US-021 trip states)

US-085: Stakeholder Notifications
  └─ Depends: Phase 1 (US-007 user roles)

US-086: TO Update Alerts
  └─ Depends: Phase 1 (US-017, US-021)

US-087: Configurable Alert Rules
  └─ Depends: US-084, US-085, US-086 (Base alerts)
```

### Vendor Intelligence
```
US-088: Vendor Rating System
  └─ Depends: Phase 1 (US-027-034), Phase 2 (US-073-074), 6+ months data

US-089: Bid Position & Probability
  └─ Depends: Phase 1 (US-030-031), 100+ bids historical data
```

### Fleet & Fuel Complete
```
US-090: Manual Workshop Entry
  └─ Depends: Phase 2 (US-069 Maintenance scheduling)

US-091: Fuel Performance with Trends
  └─ Depends: Phase 2 (US-070-072), 6+ months fuel data
```

---

## Dependency Visualization

### Phase 1 Critical Path (Simplified)

```
Master Data (US-001 to US-008)
  ↓
Product Requisition (US-009 to US-014)
  ↓
Transport Planning (US-015 to US-017)
  ↓
TO Execution (US-018, US-019, US-020) + Vendor Onboarding (US-027 to US-029)
  ↓
Trip Lifecycle (US-021) ← **MAJOR BLOCKER**
  ↓
┌─────────────────┬───────────────────┬──────────────────┐
│                 │                   │                  │
Operations      Quality Control    Costing          Mobile Apps
(US-035-044)    (US-045-056)       (US-059-060)     (US-052,061,063)
```

### Cross-Phase Dependencies

```
Phase 1 (MVP)
  ↓ (Data Collection: 3 months)
Phase 2 (Optimization)
  ↓ (Data Collection: 3 months)
Phase 3 (Enterprise)
```

---

## Blocker Risks & Mitigation

| Blocker Feature | Impact | Mitigation Strategy |
|-----------------|--------|---------------------|
| **US-021: Trip Lifecycle** | Blocks Operations, QC, Costing, Mobile | Highest priority, dedicated team, thorough testing |
| **US-017: TO Creation** | Blocks all TO execution, vendor bidding | Complete early (Sprint 3), buffer time |
| **US-007: User & Role Management** | Blocks all role-based features | Complete in Sprint 2, security review |
| **US-029: Vendor Verification** | Blocks vendor bidding, vendor fleet execution | Parallel to transport planning |
| **US-043: Unloading** | Blocks all QC workflows | Operations team must complete before QC team starts |

---

## Parallel Development Opportunities

### Sprint 1-2 (Master Data)
- 8 master data stories can all be parallel (different entities)
- Recommendation: 4 developers, 2 stories each

### Sprint 3-4 (Requisition + Vendor Onboarding)
- **Team A**: Product Requisition (US-009 to US-014)
- **Team B**: Vendor Onboarding (US-027 to US-029)
- No dependency between teams

### Sprint 5-6 (Trip Execution + Operations)
- **Team A**: Trip Lifecycle (US-021) - **critical path**
- **Team B**: Gate Operations (US-035 to US-037)
- **Team C**: Scaling Operations (US-038 to US-040)

### Sprint 7-9 (QC + Fleet + Costing)
- **Team A**: QC Workflow (US-045 to US-056)
- **Team B**: Fleet & Costing (US-057 to US-060)
- **Team C**: Mobile Interfaces (US-052, US-061, US-063)

---

## Testing Sequence

### Unit Testing
- Per feature as developed (no dependencies)

### Integration Testing
- **Layer by layer**: Complete Master Data integration → Requisition integration → Transport integration
- **Cannot test** downstream features without upstream data

### End-to-End Testing
- **Scenario 1**: FG Transfer (US-009 → US-011 → US-015 → US-017 → US-018 → US-021 → US-024)
- **Scenario 2**: Vendor Fleet (US-009 → US-017 → US-020 → US-030 → US-031 → US-021)
- **Scenario 3**: QC Workflow (US-043 → US-046 → US-052 → US-055)

---

## Deployment Sequence

### Phase 1 Staged Rollout
1. **Week 1-6**: Master Data + Requisition (internal users only)
2. **Week 7-12**: Transport Planning + Execution (pilot: 10 vehicles, 5 vendors)
3. **Week 13-18**: Operations + QC (expand to full depot)
4. **Week 19-26**: Mobile Apps + Full Rollout (all users)

### Phase 2 & 3 Incremental Rollout
- Deploy features per sprint as completed
- Gradual feature flag rollout (10% → 50% → 100% users)

---

## Related Documents

- [Phase 1 Summary](./phase-1/phase-1-summary.md) - MVP feature list
- [Phase 2 Summary](./phase-2/phase-2-summary.md) - Optimization feature list
- [Phase 3 Summary](./phase-3/phase-3-summary.md) - Enterprise feature list
- [Feature Overview](./feature-overview.md) - Cross-phase landscape

---

**Last Updated**: 2026-02-11  
**Status**: Approved  
**Version**: 1.0  
**Review Cycle**: Monthly (adjust for sprint learnings)

