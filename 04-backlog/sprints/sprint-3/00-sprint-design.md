---
sprint: Sprint 3
title: Sprint Design — Menu Structure, Access Levels & Workflow
type: design
---

# Sprint 3 — Menu Structure, Access Levels & Workflow

> This document is the UX/access design reference for Sprint 3. All story tickets in this sprint should be read in conjunction with this file.

---

## Menu Structure & Role Access

### Requisition

| Sub-menu | Can View | Can Create | Can Edit (Draft) | Can Cancel |
|----------|----------|------------|------------------|------------|
| Finished Goods | Depot / Feed Mill Officer (own PRs) | Depot / Feed Mill Officer | Depot / Feed Mill Officer | Depot / Feed Mill Officer (before TR created) |
| Port Consignment | Commercial Officer (own PRs) | Commercial Officer | Commercial Officer | Commercial Officer (before TR created) |

**Key rules:**
- **Finished Goods sub-menu**: Destination POI pre-filled from user's assigned POI (editable); Source POI not captured — defined by Distribution at TR creation
- **Port Consignment sub-menu**: Source and Destination POIs not captured on PR — source is always a Port; Procurement defines destination allocation at TR creation
- Role gate: Depot/Feed Mill Officers can only create FG PRs; Commercial Officers can only create Port Consignment PRs — each role sees only their sub-menu
- Port Consignment PRs require mandatory LC + shipment fields (BL Number, LC Number, Vessel, Voyage, Container, C&F Agent, POL, ETA) and Arrival Notice attachment before submission

---

### Distribution

| Sub-menu | Can View | Can Create | Can Approve / Modify | Can Reject |
|----------|----------|------------|----------------------|------------|
| Product Requisitions | Distribution Officer, Distribution Manager | — | — | — |
| Transport Requests | Distribution Officer (own TRs), Distribution Manager (all) | Distribution Officer | Distribution Manager | Distribution Manager |

**Key rules:**
- Distribution Officer sees all submitted FG PRs in the Product Requisitions queue
- Distribution Officer creates TRs against a PR — source POI is selected per TR; destination is inherited from the PR (read-only)
- Multiple TRs can be created for one PR (different source POIs); total TR quantity must not exceed PR quantity — overflow is blocked
- Distribution Manager sees all TRs in `Pending Approval` status
- Distribution Manager can approve as-is, approve with modification (qty, date, priority, vehicle requirements), reject with reason, or request clarification
- Approved TRs transition to `Available for Transport Planning` and become visible in the Transport module

---

### Procurement

| Sub-menu | Can View | Can Create | Can Approve / Modify | Can Reject |
|----------|----------|------------|----------------------|------------|
| Product Requisitions | Procurement Officer | — | — | — |
| Transport Requests | Procurement Officer (own TRs) | Procurement Officer | — | — |

**Key rules:**
- Procurement Officer sees all submitted **Port Consignment PRs** (raised by Commercial Officers) in the Product Requisitions queue
- Procurement Officer reviews LC + shipment details, defines destination-wise quantity allocation, and creates TR(s) against the PR
- Each TR specifies: Source POI (Port), Destination POI (warehouse / feed mill / depot), and quantity for that destination
- Multiple TRs can be created for one PR (one per destination); total TR quantity must not exceed PR quantity — overflow is blocked
- **No manager approval step** — submitted TRs are immediately `Available for Transport Planning`
- There is no Procurement Manager role in this workflow

---

### Transport

#### Transport Requests

| Sub-menu | Can View | Can Submit Planning Details |
|----------|---------|-----------------------------|
| Finished Goods | Transport Planner | Transport Planner |
| Raw Materials | Transport Planner | Transport Planner |

**Key rules:**
- Transport Planner sees a unified queue of all TRs with status `Available for Transport Planning` or `Under Planning`
- FG and RM TRs are separated into sub-tabs (Finished Goods / Raw Materials) within the Transport Requests menu
- Before creating TOs, Transport Planner submits planning details against a TR:
  - Quantity of vehicles required
  - Vehicle type required
  - **For RM TRs only**: Raw C&F Clearance Note / Approval (Yes / No / Pending)
- Submitting planning details transitions TR to `Under Planning` and locks it to that planner

#### Transport Orders

| Action | Actor |
|--------|-------|
| Create TO(s) against a TR | Transport Planner |
| View all TOs | Transport Planner, Transport Distribution Officer (TDO) |
| Assign Vehicle | Transport Distribution Officer (TDO) |
| Assign Driver | Transport Distribution Officer (TDO) |
| Assign Helper(s) | Transport Distribution Officer (TDO) |
| Set ETA | Transport Distribution Officer (TDO) |
| View assigned TOs | Driver (own assignments only) |

**Key rules:**
- Transport Planner creates TOs from TRs that are `Under Planning` or `Available for Transport Planning`
- Each TO specifies a Transport Mode: Own Fleet or Vendor Fleet
- Multiple TOs can be created per TR; total TO quantity must not exceed TR quantity — overflow is blocked
- TDO assigns physical resources (vehicle, driver, helpers, ETA) to each created TO — this is a separate step from TO creation
- For Own Fleet TOs: vehicle and driver selected from available MDM fleet records
- For Vendor Fleet TOs: vendor selected from contractual vendor list; vehicle registration and driver name may be entered manually
- Driver logs into their account and sees only TOs assigned to them

---

## End-to-End Workflow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUISITION MODULE                                                                          │
│                                                                                              │
│  Depot/Feed Mill Officer                          Commercial Officer                         │
│  └── Requisition > Finished Goods                 └── Requisition > Port Consignment        │
│      Create FG PR                                     Create Port PR                        │
│      (dest: pre-filled/editable; no source)           (LC + shipment fields; no POIs)       │
└──────────────────────────────┬───────────────────────────────┬──────────────────────────────┘
                               │                               │
                   FG PR submitted                   Port Consignment PR submitted
                       │                      │
         ┌─────────────▼──────┐    ┌──────────▼────────────────────┐
         │  DISTRIBUTION      │    │  PROCUREMENT                   │
         │                    │    │                                │
         │  Distribution      │    │  Procurement Officer           │
         │  Officer           │    │  ├── Product Requisitions      │
         │  ├── Product Reqs  │    │  │   (view Port Consign. PRs)  │
         │  │   (view FG PRs) │    │  └── Transport Requests        │
         │  └── Transport Reqs│    │      Create TR(s) vs PR        │
         │      Create TR(s)  │    │      Source: Port POI          │
         │      Source: POIs  │    │      Dest: per-TR (allocation) │
         │      Dest: from PR │    │      [qty overflow → ✗]        │
         │      [qty overflow]│    │      ↓                         │
         │      ↓             │    │  No approval step              │
         │  Distribution Mgr  │    │  TR → Available for            │
         │  Approve / Modify  │    │  Transport Planning            │
         │  Reject / Clarify  │    └────────────────────────────────┘
         │      ↓             │
         │  TR → Available    │
         │  for Transport     │
         └─────────┬──────────┘
                   │
                   └──────────────────────────┐
                                              │
         ┌────────────────────────────────────▼────────────────────────────┐
         │  TRANSPORT MODULE                                                │
         │                                                                  │
         │  Transport Planner                                               │
         │  ├── Transport Requests > Finished Goods  (approved FG TRs)     │
         │  └── Transport Requests > Raw Materials   (submitted RM TRs)    │
         │      ↓                                                           │
         │      Submit planning details:                                    │
         │        • Qty of vehicles required                                │
         │        • Vehicle type required                                   │
         │        • [RM only] Raw C&F Clearance Note/Approval              │
         │      TR → Under Planning                                         │
         │      ↓                                                           │
         │  Transport Orders                                                │
         │      Create TO(s) against TR                                     │
         │        • Transport Mode: Own Fleet / Vendor Fleet                │
         │        • Quantity per TO  [overflow → ✗]                        │
         │      ↓                                                           │
         │  Transport Distribution Officer (TDO)                            │
         │      Assign to each TO:                                          │
         │        • Vehicle (from fleet / manual for vendor)                │
         │        • Driver (from pool / manual for vendor)                  │
         │        • Helper(s) (optional)                                    │
         │        • ETA                                                     │
         │      TO → Assigned → Ready for Dispatch                         │
         │      ↓                                                           │
         │  Driver Account                                                  │
         │      Driver sees assigned TO list                                │
         └─────────────────────────────────────────────────────────────────┘
                   ↓
         (Sprint 4: Dispatch → In-Transit → POD → Trip Closure)
```

---

## Quantity Overflow Rules (Summary)

| Level | Rule | Behaviour |
|-------|------|-----------|
| TR creation against PR | Sum of all TRs for a PR must not exceed PR total quantity | Creation blocked with error if overflow |
| TO creation against TR | Sum of all TOs for a TR must not exceed TR total quantity | Creation blocked with error if overflow |

---

## Role Summary

| Role | Module Access | Key Permissions |
|------|--------------|-----------------|
| Depot / Feed Mill Officer | Requisition → Finished Goods | Create FG PRs; view own PRs |
| Commercial Officer | Requisition → Port Consignment | Create Port Consignment PRs with LC + shipment details; view own PRs |
| Distribution Officer | Distribution | View FG PR queue; create FG TRs |
| Distribution Manager | Distribution | View all FG TRs pending approval; approve / modify / reject TRs |
| Procurement Officer | Procurement | View RM PR queue; create RM TRs (no approval needed) |
| Transport Planner | Transport | View TR queue (FG + RM); submit planning details; create TOs |
| Transport Distribution Officer (TDO) | Transport | Assign vehicle / driver / helpers / ETA to TOs |
| Driver | Driver Account | View own assigned TO list |
