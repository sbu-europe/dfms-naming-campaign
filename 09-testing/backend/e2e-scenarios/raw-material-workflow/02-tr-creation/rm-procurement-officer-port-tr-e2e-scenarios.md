---
module: 04-requisitions
specification: Raw Materials Workflow — Section 2 — Port Consignment TR Creation (Procurement Officer) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: TR-02, PR-02
source_spec: ../../../../../05-modules/04-requisitions/product-requisition-management-v2.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 12/14 Pass · 1 Fail · 1 Planned
artifacts: tests/e2e/playwright-mcp/rm-02-tr-create-artifacts/
---

# Raw Materials Workflow — Section 2 — Procurement Officer — Port TR Creation — E2E Scenario Plan (Django Admin SSR)


**Last MCP run:** 2026-08-17 · **12/14 Pass · 1 Fail · 1 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-02-tr-create-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-02-tr-create-artifacts/RESULTS.md)  
**Navigation:** **Procurement → Port Shipments** → **Create TR** **or** **Procurement → Transport requests → Add** → select Port Shipment

Scope: **Procurement Officer** creating Port Consignment Transport Requests from submitted Port Shipments. DM approval is **not** in the RM path — TR becomes **Available for Transport Planning** on save. Transport Order creation is §3.

Target runner: **Playwright MCP** against seeded Nourish tenant.

## TR creation entry

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Procurement Officer selects submitted Port Shipment to create TR | With Port Shipment **Submitted** (§1), as **Procurement Officer** (`procurement.officer1.nourish@yopmail.com`), open **Procurement → Port Shipments**, click **Create TR** on the row (or open shipment detail → **Create Transport Request**). Assert URL `/admin/requisitions/transportrequisition/create-from-shipment/<shipment_uuid>/` with shipment header (vessel, B/L, LC, ETA, total weight) read-only and **Allocate Cargo Quantities** table pre-populated. | P0 | Pass |

## POI selection & capacity panels

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC02 | Procurement Officer selects Source POI (Port) | On Port TR create form, open **Source POI (Port)** (`#id_source_poi`). Assert dropdown lists active **port-type** POIs (seed: `PORT-01` / `ctg-port-01`). Select port POI; assert **Source POI — Stock & Capacity** panel appears (`#dfms-source-poi-stock-panel`). | P0 | Pass |
| TC03 | Procurement Officer selects Destination POI | Open **Destination POI** (`#id_destination_poi`); select active mill/depot POI (e.g. `CTG-001`). Assert selection persists and **Destination POI — Stock & Capacity** panel updates (`#dfms-destination-poi-stock-panel`). *Rewrite RM_024: legacy expected no capacity panel — current admin shows destination panel when POI selected; assert panel visible.* | P0 | Pass |

## Validation (negatives)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Delivery Date in the past is rejected | Set **Delivery Date** (`#id_delivery_date`) to yesterday, allocate positive cargo qty, click **Create Transport Request**. Expected: validation error; TR not created. *Known gap:* past dates may be accepted — treat unexpected `TR-PORT-…` create as FAIL.* | P0 | Fail |
| TC05 | Allocated cargo quantity saved correctly | Against shipment with 100 MT (or kg) remaining on a line, allocate full quantity to Destination POI, save. Assert allocated qty on TR line items matches entry. | P0 | Pass |
| TC06 | Multi-destination breakdown via separate TRs | Shipment 100 MT total: create TR-1 allocating 60 MT to Destination-A; create TR-2 allocating 40 MT to Destination-B from same shipment (second **Create TR** while remaining > 0). Assert two TRs with correct allocations; shipment fully allocated when sum equals total. *Rewrite RM_018: single TR form has one Destination POI — multi-destination = multiple TRs, not one form with two destinations.* | P0 | Planned |
| TC07 | Allocated quantity cannot exceed remaining shipment quantity | Line with Remaining = 20 MT: attempt allocate 50 MT. Expected: `Allocation of … exceeds remaining quantity …`; TR not created. | P0 | Pass |
| TC08 | Cargo quantity rejects zero and negative values | Attempt allocate `0`, then `-10` on a line. Expected: validation blocks TR create. | P1 | Pass |
| TC12 | Mandatory field validation on TR creation | Leave **Source POI** or **Destination POI** blank; click **Create Transport Request**. Expected: `.errorlist` / HTML5 required; no TR created. | P0 | Pass |

## Inherited read-only fields & submit

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Shipment header fields read-only on TR create | On create-from-shipment form, assert B/L, LC, Vessel, ETA in header are display-only (not editable inputs). Cargo product lines are read-only with editable **Allocate** column only. | P0 | Pass |
| TC10 | Save TR sets status Available for Transport Planning | Fill Source POI (port), Destination POI, future Delivery Date, positive allocation, remarks `MCP TR <RUN_ID>`. Click **Create Transport Request**. Assert `tr_number` (`TR-PORT-…`) and status **Available for Transport Planning** (`available_for_transport_planning`) — **not** Pending Approval. *Rewrite RM_022: Port TR skips DM approval per `TRService.create_port_tr`.* | P0 | Pass |

## RBAC & audit

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | RBAC — Procurement Officer cannot create Port Shipment | As **Procurement Officer**, assert top-level **Port Shipments** (CO create menu) absent; **Add Port Shipment** URL denied. Procurement sees read-only Port Shipment queue under **Procurement** group only. | P0 | Pass |
| TC13 | Audit log captures TR creation event | After TC10, as **Tenant Admin**, open TR **History** or search `PRActivityLog`/admin log for `tr_number`. Assert **Added** entry with Procurement Officer user and timestamp. | P1 | Pass |
| TC14 | Procurement Officer TR queue shows own Port TRs | Open **Procurement → Transport requests** (`?tr_type=PORT_CONSIGNMENT`). Assert newly created TR listed with correct shipment reference and status. | P1 | Pass |

## Implementation Notes

### Key URLs

| Action | Path |
|--------|------|
| PO Port Shipment queue | `/admin/requisitions/portshipmentproxy/` |
| Create from shipment | `/admin/requisitions/transportrequisition/create-from-shipment/<uuid>/` |
| Select shipment (alt) | `/admin/requisitions/transportrequisition/select-shipment/` |
| PO TR queue | `/admin/requisitions/transportrequisition/?tr_type=PORT_CONSIGNMENT` |
| Submit button | **Create Transport Request** |

### Prerequisites

- Submitted Port Shipment with remaining cargo qty (§1 fixture).
- Active port POI (`poi_type=port`) and destination mill POI.

### Original ID map

| Legacy | TC | Verdict |
|--------|-----|---------|
| RM_013 | TC01 | Keep |
| RM_014 | TC02 | Keep |
| RM_015 | TC03 | Keep |
| RM_016 | TC04 | Keep |
| RM_017 | TC05 | Keep |
| RM_018 | TC06 | Rewrite (multi-TR not multi-dest on one form) |
| RM_019 | TC07 | Keep |
| RM_020 | TC08 | Keep |
| RM_021 | TC09 | Keep |
| RM_022 | TC10 | Rewrite (Available for Planning, not Pending Approval) |
| RM_023 | TC12 | Keep |
| RM_024 | TC03 | Rewrite (panel now shown) |
| RM_025 | TC11 | Keep |
| RM_026 | TC13 | Rewrite (admin History) |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **12/14 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-02-tr-create-artifacts/RESULTS.md`. Known gap: §2 TC04 past delivery date accepted on Port TR. |
