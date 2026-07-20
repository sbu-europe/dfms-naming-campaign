---
module: 06-yard-operations
specification: Finished Goods Workflow — Sections 14 & 17 — Scale In/Out (Destination POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: SC-01
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Sections 14 & 17 — Scaling (Destination POI) — E2E Scenario Plan

## Section 14 — Scale In (Destination)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Destination Scale-In after Gate-In | TO **At Destination** with visit. Scale-In loaded vehicle weight; queue token created; **Waiting for Command Center** (dest). | P0 | Planned |
| TC02 | Blocked before destination Gate-In | No visit — Scale-In blocked. | P0 | Planned |
| TC03 | Queue Token on destination Scale-In | Token visible in Queue Tokens changelist. | P0 | Planned |
| TC04 | Zero/negative weight rejected | Validation error. | P0 | Planned |
| TC05 | RBAC — Unloading Personnel denied | Scale-In add denied. | P0 | Planned |
| TC06 | Audit destination Scale-In | Record with weight + user. | P1 | Planned |

## Section 17 — Scale Out (Destination)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Scale-Out after Unloading Completed | All unload points done. Scale-Out empty vehicle weight. Sub-state **Scale Out (Destination)**; main status **Completed** before Gate-Out. | P0 | Planned |
| TC08 | Blocked with pending unload points | Multi-point: partial unload — Scale-Out blocked. | P0 | Planned |
| TC09 | Blocked before unloading started | Assignment only — blocked. | P0 | Planned |
| TC10 | Unloaded qty from weight delta | Scale-In 18,000 kg loaded, Scale-Out 8,000 kg empty → 10,000 kg net. | P0 | Planned |
| TC11 | Invalid weight rejected | Validation error. | P0 | Planned |
| TC12 | RBAC — CC Officer denied destination Scale-Out | Access denied. | P0 | Planned |
| TC13 | Audit destination Scale-Out | Record persisted. | P1 | Planned |

**Original ID map:** FG_SCALEIN_D_001–006 → TC01–TC06; FG_SCALEOUT_D_001–007 → TC07–TC13.
