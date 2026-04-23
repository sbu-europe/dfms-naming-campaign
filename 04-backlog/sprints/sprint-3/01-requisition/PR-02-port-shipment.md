---
jira_key: DFS-033
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: PR-02
title: Port Shipment (Import) Registration
epic: Requisition
status: Pending
story_points: 5
assignee: ~
---

# PR-02 — Port Shipment (Import) Registration

## User Story

**As a** Commercial Officer  
**I want to** register a **Port Shipment** in DFMS with full import / shipment documentation and line-level RM cargo  
**So that** Procurement can plan distribution across destination POIs and raise **Transport Requests**; after Transport Planning, **Transport Orders** are created for execution

## Business Context

A **Port Shipment** is **not** a product requisition. It is a **structured record of an inbound import shipment** (typically raw materials arriving at port). The Commercial Officer **transcribes** shipment facts from **external systems** (e.g. shipping lines, freight forwarders, LC banks, customs / clearance portals, spreadsheets, or paper packs) into DFMS so the organisation has a single operational source of truth.

**Downstream flow**:
```
Commercial Officer registers Port Shipment (LC + vessel + cargo lines + Arrival Notice)
        → Procurement sees submitted shipments
        → Procurement plans distribution: creates one Transport Request (TR) per destination POI (quantity allocation per RM line) — PC-02
        → Transport Planner submits planning inputs and creates Transport Orders (TOs) against each TR — TO-01 / TRQ-01
```

**Key distinctions from FG Product Requisition (PR-01)**:
- **Domain object**: Import **shipment registration**, not an internal “demand requisition”
- **Creator**: Commercial Officer only (data entry from external shipment sources)
- **Product scope**: Raw materials on the shipment manifest
- **Routing**: Submitted shipments are visible to **Procurement** (not Distribution)
- **Source / destination POIs**: Not captured on the shipment record — **source Port** and **per–destination POI** are set when Procurement creates TRs
- **No approval** on the shipment record itself — Procurement acts by creating TRs

**Implementation note (technical)**: The persisted entity may reuse the existing `ProductRequisition` model with `pr_type = PORT_CONSIGNMENT` and existing APIs under `/api/v1/product-requisitions` until a dedicated `port-shipments` resource is introduced. User-facing labels and this specification use **Port Shipment** terminology.

## Acceptance Criteria

### AC-1: Port Shipment Header Fields
- [ ] Commercial Officer can create a Port Shipment with:
  - **Record type**: Port Shipment / import (auto-selected; Commercial Officers only see this flow — FG requisition is hidden for this role)
  - **Entered by**: Auto-filled from logged-in user (read-only)
  - **Department**: Auto-filled from logged-in user (read-only)
  - **Preferred availability / delivery window** (required) — when cargo should be ready for inland movement after port operations
  - **Urgency**: Normal / High / Critical
  - **Remarks** (optional) — e.g. reference to external system ID, broker notes
- [ ] System auto-generates **Port Shipment reference**: `PS-PORT-YYYYMMDD-XXXX`
- [ ] **Source Port and destination POIs are not captured** on the shipment record — Port is chosen per TR by Procurement; destinations are defined per TR

### AC-2: LC & Shipment Documentation (Mandatory)
- [ ] The following fields are mandatory before the shipment record can be submitted (may be blank in Draft):
  - **Bill of Lading (BL) Number**
  - **LC Number**
  - **Vessel Name**
  - **Voyage Name**
  - **Container Number** (supports multiple entries)
  - **C&F Agent Name**
  - **Point of Loading (POL)**
  - **Estimated Time of Arrival (ETA)** (date + time)
- [ ] **Arrival Notice** document upload (mandatory on submit)

### AC-3: RM Cargo Line Items
- [ ] Multiple RM line items supported (manifest / cargo lines)
- [ ] Each line is entered via **Product Item Code**; on valid entry auto-populates from MDM-01:
  - **Product Name**
  - **Product Category** — Raw Material
  - **Product Sub-Category**
  - **Type of Packing**: Pallet / Drum / Roll (from MDM-01)
- [ ] Manual entry per line:
  - **UOM**: Bags / Tons / Cartons / Pieces
  - **Quantity** (in selected UOM)
  - **Weight per Unit** (in the selected UOM)
  - **Target POI** (optional, informational — “intended” destination; authoritative allocation is on TR)
- [ ] **Total weight** per line = Quantity × Weight per Unit; grand total across lines

### AC-4: Status Lifecycle
- [ ] `Draft` → `Submitted`
- [ ] Save as Draft; submit when mandatory fields complete
- [ ] After submit, record locked for Commercial Officer (except cancel per AC-6)
- [ ] On submit, record visible to Procurement (PC-01 queue)
- [ ] Status badges: Draft, Submitted, In Progress (at least one TR exists), Fulfilled, Cancelled

### AC-5: List View
- [ ] Commercial Officer sees own Port Shipments with status, date, search filters
- [ ] Columns include Shipment ref, BL, LC, Vessel, ETA, total weight, status

### AC-6: Cancellation
- [ ] Cancel allowed for Draft or Submitted **if no TR has been created yet**
- [ ] Cancellation reason required

### AC-7: Audit Trail
- [ ] Create, edit, submit, cancel audited
- [ ] Attachments stored securely and linked to shipment record

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PR-02-1 | Extend shipment / `ProductRequisition` model — port import fields (BL, LC, Vessel, Voyage, Container, C&F Agent, POL, ETA, attachment) | DFS-033-1 | Pending |
| PR-02-2 | Create API — type `PORT_CONSIGNMENT`, RM-only line gate, mandatory shipment validation on submit | DFS-033-2 | Pending |
| PR-02-3 | Auto-generate **Port Shipment reference**: `PS-PORT-YYYYMMDD-XXXX` (or map from existing generator if backend unchanged) | DFS-033-3 | Pending |
| PR-02-4 | Draft → Submit workflow with mandatory field gate on submit | DFS-033-4 | Pending |
| PR-02-5 | Product Item Code lookup — MDM-01 RM gate | DFS-033-5 | Pending |
| PR-02-6 | Total weight per line and grand total | DFS-033-6 | Pending |
| PR-02-7 | Arrival Notice upload — secure storage, linked record, downloadable | DFS-033-7 | Pending |
| PR-02-8 | Commercial Officer role gate — Port Shipment flow only; FG PR hidden | DFS-033-8 | Pending |
| PR-02-9 | List API (filters: status, date, search) | DFS-033-9 | Pending |
| PR-02-10 | Detail API | DFS-033-10 | Pending |
| PR-02-11 | Cancel API with reason | DFS-033-11 | Pending |
| PR-02-12 | UI — LC/shipment section + multi-line RM table + attachment | DFS-033-12 | Pending |
| PR-02-13 | List + detail UI (shared shell with PR-01 where practical; type badge **Port Shipment**) | DFS-033-13 | Pending |

## API Endpoints

> Technical paths may remain under `product-requisitions` until migrated.

```
POST   /api/v1/product-requisitions                              # Create (type=PORT_CONSIGNMENT)
GET    /api/v1/product-requisitions?type=PORT&status=&date_from=&date_to=&search=
GET    /api/v1/product-requisitions/{id}
PATCH  /api/v1/product-requisitions/{id}                         # Draft only
POST   /api/v1/product-requisitions/{id}/submit
POST   /api/v1/product-requisitions/{id}/cancel
POST   /api/v1/product-requisitions/{id}/documents               # Arrival Notice
GET    /api/v1/product-requisitions/{id}/documents
```

## Access & Permissions

> Menu and roles: [`../README.md`](../README.md)

| Action | Role |
|--------|------|
| View own Port Shipments | Commercial Officer |
| Create / edit Draft / submit Port Shipment | Commercial Officer |
| Cancel (before any TR) | Commercial Officer |

## Dependencies

- **Requires**: MDM-01 (Product Master — RM), RBAC — Commercial Officer role
- **Enables**: PC-01 (Procurement shipment queue), PC-02 (TR / distribution planning per destination POI)

## Definition of Done

- [ ] Port Shipment registration with mandatory LC + shipment fields and Arrival Notice
- [ ] RM lines with item code lookup and weight totals
- [ ] Draft / submit lifecycle; reference `PS-PORT-YYYYMMDD-XXXX` (or documented mapping)
- [ ] Role gate: Commercial Officer sees Port Shipment flow only
- [ ] Audit + document storage
- [ ] Unit tests > 80%
- [ ] UAT: Commercial Officer registers a shipment from sample external data; Procurement can open it in PC-01
