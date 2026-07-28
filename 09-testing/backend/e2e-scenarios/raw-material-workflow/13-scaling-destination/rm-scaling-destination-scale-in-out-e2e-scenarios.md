---
module: 06-yard-operations
specification: Raw Materials Workflow — Sections 13 & 16 — Scale In/Out (Destination) + QC Flagging — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: SC-01, QC-01
source_spec: ../../../../../05-modules/06-yard-operations/scaling-operations.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Sections 13 & 16 — Scaling (Destination) — E2E Scenario Plan

**Navigation:** Scaling → **Scale-In** / **Scale-Out** → Add (destination site)

## Section 13 — Scale In (Destination) & QC flagging

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Destination Scale-In after Gate-In | TO **At Destination**. **Scale-In → Add**, enter loaded-vehicle weight, submit. Weight recorded. | P0 | Planned |
| TC02 | QC-enabled product → Flagged for QC | Product on TO has QC flag in Product Master. After Scale-In, sub-state **Flagged for QC** (`flagged_for_qc`). | P0 | Planned |
| TC03 | Non-QC product → Waiting for Command Center | Product not QC-enabled. After Scale-In, sub-state **Waiting for Command Center** (bypasses QC). | P0 | Planned |
| TC04 | Scale-In blocked before destination Gate-In | No visit. Blocked. | P0 | Planned |
| TC05 | Queue Token on destination Scale-In | Token generated and linked to TO. | P0 | Planned |
| TC06 | Weight rejects zero/negative | Blocked. | P0 | Planned |
| TC07 | RBAC — Unloading Personnel denied Scale-In | Unloading role blocked. | P0 | Planned |
| TC08 | Audit Scale-In + QC flag transition | Log shows weight and sub-state change to QC flag when applicable. | P1 | Planned |

## Section 16 — Scale Out (Destination)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Scale-Out after Unloading Completed | Sub-state **Unloading Completed** (§16). **Scale-Out → Add**, empty-vehicle weight, submit. Sub-state **Scale Out (Destination)**. | P0 | Planned |
| TC10 | Scale-Out blocked with pending unload points | Multi-point unload incomplete. Blocked. | P0 | Planned |
| TC11 | Scale-Out blocked before unloading | **Assigned Unloading Point** only. Blocked. | P0 | Planned |
| TC12 | Unloaded qty from weight delta | Scale-In 18,000 kg, Scale-Out 8,000 kg → net 10,000 kg. | P0 | Planned |
| TC13 | Invalid scale-out weight rejected | Blocked. | P0 | Planned |
| TC14 | RBAC — CC Officer denied destination Scale-Out | Blocked. | P0 | Planned |
| TC15 | Audit destination Scale-Out | Weight + user logged. | P1 | Planned |

## Implementation Notes

- **Original ID map:** RM_119–RM_126 → TC01–TC08; RM_161–RM_167 → TC09–TC15.
