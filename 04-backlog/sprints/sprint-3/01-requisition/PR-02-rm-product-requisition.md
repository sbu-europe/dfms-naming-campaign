---
jira_key: DFS-033
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: ~
title: Port Consignment (LC-Based) Product Requisition
epic: Requisition
status: Pending
story_points: 5
assignee: ~
---

# PR-02 — Port Consignment (LC-Based) Product Requisition

## User Story

**As a** Commercial Officer  
**I want to** raise a Port Consignment Transfer Requisition with LC and shipment details  
**So that** inbound raw materials can be planned, allocated, and transported after customs clearance

## Business Context

Port Consignment PRs are raised by the Commercial Team for raw material imports arriving at port (e.g., Chittagong / Mongla). Unlike FG PRs, this type captures full LC and shipment metadata — Bill of Lading, Vessel, C&F Agent, ETA, and customs status. The PR routes directly to Procurement, which reviews shipment details, defines destination-wise quantity allocation, and creates Transport Requests.

**Port Consignment PR flow**:
```
Commercial Officer creates Port PR (with LC + shipment details) → Procurement receives PR → Procurement Officer defines destination allocation + creates TR(s) → Transport Planning
```

**Key distinctions from FG PR (PR-01)**:
- Creator: **Commercial Officer** (not Depot/Feed Mill Officer)
- Product type: Raw Materials only
- Requires mandatory LC and shipment documentation fields
- Routes to **Procurement** department (not Distribution)
- Source POI is always a Port — not defined by the requester; set by Procurement at TR creation
- Destination POI(s) are defined by Procurement during TR creation (destination-wise allocation)
- No approval step on the PR itself — submitted directly for Procurement to act on

## Acceptance Criteria

### AC-1: Port PR Header Fields
- [ ] Commercial Officer can create a Port Consignment PR with the following header fields:
  - **Requisition Type**: Port Consignment Transfer (auto-selected; restricted by user role — Commercial Officers can only create Port Consignment PRs)
  - **Requester Name**: Auto-filled from logged-in user (read-only)
  - **Requester Department**: Auto-filled from logged-in user (read-only)
  - **Preferred Delivery Date & Time** (required)
  - **Urgency**: Normal / High / Critical
  - **Remarks** (optional)
- [ ] System auto-generates PR number: `PR-PORT-YYYYMMDD-XXXX`
- [ ] **Source POI and Destination POI are not captured on the PR** — source is always a Port (set at TR level); destination allocation is defined by Procurement when creating TRs

### AC-2: LC & Shipment Documentation (Mandatory)
- [ ] The following shipment fields are mandatory before PR can be submitted:
  - **Bill of Lading (BL) Number**
  - **LC Number**
  - **Vessel Name**
  - **Voyage Name**
  - **Container Number** (supports multiple entries)
  - **C&F Agent Name**
  - **Point of Loading (POL)**
  - **Estimated Time of Arrival (ETA)** (date + time)
- [ ] **Arrival Notice** document upload (file attachment — mandatory)

### AC-3: RM Product Line Items
- [ ] PR supports multiple RM product line items
- [ ] Each line item is entered via **Product Item Code** which on valid entry auto-populates:
  - **Product Name** (from MDM-01)
  - **Product Category** — auto-filled as "Raw Material"
  - **Product Sub-Category** (from MDM-01)
  - **Type of Packing**: Pallet / Drum / Roll (from MDM-01)
- [ ] Each line item requires manual entry of:
  - **Unit of Measure (UOM)**: Bags / Tons / Cartons / Pieces
  - **Product Quantity** (number of units in selected UOM)
  - **Weight per Unit** (in the selected UOM)
  - **POI** (target warehouse / feed mill / depot / silo — informational at this stage)
- [ ] System auto-calculates **Total Weight** per line item: Quantity × Weight per Unit
- [ ] Grand total weight computed across all line items

### AC-4: PR Status Lifecycle
- [ ] Initial status: `Draft` → `Submitted`
- [ ] PR can be saved as Draft and submitted later
- [ ] Submitted PR locked from editing by requester (until cancelled)
- [ ] On submission, PR becomes visible to the Procurement department

### AC-5: PR List View
- [ ] Commercial Officer can see their own PRs with status filter, date filter, search
- [ ] Status badges: Draft, Submitted, In Progress, Fulfilled, Cancelled
- [ ] "In Progress" means at least one TR has been created against this PR

### AC-6: PR Cancellation
- [ ] Officer can cancel Draft or Submitted PRs (before any TR is created)
- [ ] Cancellation reason required

### AC-7: Audit Trail
- [ ] All PR create, submit, edit, cancel actions audit logged
- [ ] Uploaded documents stored securely and linked to PR record

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PR-02-1 | Extend ProductRequisition model — Port type fields (BL, LC, Vessel, Voyage, Container, C&F Agent, POL, ETA, attachment) | DFS-033-1 | Pending |
| PR-02-2 | Port PR creation API — type = PORT_CONSIGNMENT, RM-only product gate, mandatory shipment fields validation | DFS-033-2 | Pending |
| PR-02-3 | PR number auto-generation: `PR-PORT-YYYYMMDD-XXXX` | DFS-033-3 | Pending |
| PR-02-4 | Draft save → Submit workflow with mandatory field gate on submit | DFS-033-4 | Pending |
| PR-02-5 | Product Item Code lookup — auto-populates Name, Category, Sub-Category, Packing Type from MDM-01 (RM gate) | DFS-033-5 | Pending |
| PR-02-6 | Total weight calculation per line item (Qty × Weight per Unit) and grand total | DFS-033-6 | Pending |
| PR-02-7 | Arrival Notice file upload — secure storage, linked to PR record, downloadable | DFS-033-7 | Pending |
| PR-02-8 | Commercial Officer role gate — Port Consignment type only; FG PR type hidden for this role | DFS-033-8 | Pending |
| PR-02-9 | PR list view API (GET with filters: status, date, search) | DFS-033-9 | Pending |
| PR-02-10 | PR detail view API | DFS-033-10 | Pending |
| PR-02-11 | PR cancellation API with reason | DFS-033-11 | Pending |
| PR-02-12 | Port PR creation UI — LC + shipment section + multi-line RM product table (item code, auto-fill, UOM, qty, weight) + attachment upload | DFS-033-12 | Pending |
| PR-02-13 | PR list + detail UI (shared list component with PR-01, differentiated by type badge; detail shows shipment section) | DFS-033-13 | Pending |

## API Endpoints

```
POST   /api/v1/product-requisitions                              # Create PR (type=PORT_CONSIGNMENT)
GET    /api/v1/product-requisitions?type=PORT&status=&date_from=&date_to=&search=
GET    /api/v1/product-requisitions/{pr_id}
PATCH  /api/v1/product-requisitions/{pr_id}                      # Edit Draft
POST   /api/v1/product-requisitions/{pr_id}/submit
POST   /api/v1/product-requisitions/{pr_id}/cancel
POST   /api/v1/product-requisitions/{pr_id}/documents            # Upload Arrival Notice
GET    /api/v1/product-requisitions/{pr_id}/documents
```

## Access & Permissions

> Full menu structure and role-access matrix: [`00-sprint-design.md`](../00-sprint-design.md)

| Action | Role |
|--------|------|
| View Port PR list (own) | Commercial Officer |
| Create Port Consignment PR | Commercial Officer |
| Edit Draft PR | Commercial Officer |
| Cancel PR (before TR created) | Commercial Officer |

- Role gate: Commercial Officers can only create Port Consignment PRs — FG PR type is hidden/disabled for this role
- Source and Destination POI are **not set on the PR** — Procurement defines them at TR creation
- LC and shipment fields (BL, LC Number, Vessel, etc.) are mandatory before submission

## Dependencies

- **Requires**: MDM-01 (Product Master with RM category), US-004 (RBAC — Commercial Officer role)
- **Enables**: PC-01 (Procurement views Port PR queue and creates TRs with destination allocation)

## Definition of Done

- [ ] Port Consignment PR creation with mandatory LC + shipment fields
- [ ] Arrival Notice file upload linked to PR
- [ ] Product Item Code lookup auto-fills Name, Category, Sub-Category, Packing Type
- [ ] UOM selection + Quantity + Weight per Unit + auto-calculated Total Weight per line item
- [ ] Draft save + submit workflow with mandatory field gate on submit
- [ ] PR number auto-generation
- [ ] Role gate enforced — only Port Consignment PR type available to Commercial Officers
- [ ] Status lifecycle enforced
- [ ] Audit logging + document storage
- [ ] Unit tests > 80%
- [ ] UAT: Commercial Officer can create and submit a Port PR with LC details and Arrival Notice attachment
